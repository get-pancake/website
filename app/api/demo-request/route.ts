import { NextRequest, NextResponse } from "next/server";

import { normalizeAirtableBaseId, normalizeAirtableToken } from "@/lib/airtable-config";
import { writeAttioDemoRequest } from "@/lib/attio-demo-request";
import {
  BODY_MAX,
  DEMO_REQUEST_SOURCE,
  HONEYPOT_FIELD,
  parseDemoRequest,
  type DemoRequest,
  type DemoRequestDelivery,
  type DemoRequestResponse,
} from "@/lib/demo-request";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isProductionSiteHost, SITE_ORIGIN } from "@/lib/site-config.mjs";

export const runtime = "nodejs";

/**
 * /demo qualification form delivery (founder brief, 2026-09-15).
 *
 * Guards, each with one job:
 *   1. origin allow-list = the CSRF check. A script can forge `Origin`, so
 *      it is not a bot guard.
 *   2. honeypot `nickname` + the per-IP rate limit = the spam guards (the
 *      waitlist's honeypot is named `website`, a real field here).
 *   3. server-side validation (lib/demo-request.ts, shared with the form).
 *   4. a per-instance circuit breaker (GLOBAL_LIMIT) behind validation, so
 *      one warm instance cannot post unbounded Slack messages / Airtable rows.
 * Leads go to Slack, Airtable and/or Attio (the CRM: person by email, company
 * by domain, answers as a note; lib/attio-demo-request.ts) and are never
 * dropped silently: when
 * nothing lands the route answers 503 and the page asks the visitor to
 * retry. A retry with the same submission id upserts the Airtable row
 * instead of duplicating it. No PII in logs (status codes and reason
 * strings only). No analytics: a demo_request_submitted event needs its own
 * scope (AGENTS.md).
 */

const DELIVERY_TIMEOUT_MS = 5000; // brief: 5s for Slack and Airtable
const IP_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 }; // = waitlist
// Per-instance circuit breaker, not a rate limit: the limiter is in-memory
// per serverless instance (lib/rate-limit.ts), so without it rotating IPs
// could post unbounded Slack messages and Airtable rows from one instance.
// The cap sits far above plausible legitimate traffic (600 valid leads in
// ten minutes) so a routine bot wave from a dozen IPs cannot lock real
// visitors out; it is consumed only by bodies that passed validation, and
// tripping it answers 503 "unavailable" (the neutral retry copy), never 429
// (which would tell a first-time visitor they tried too often). Review
// 2026-09-15; the waitlist route has no such bucket, so this is a founder
// call if it ever trips.
const GLOBAL_LIMIT = { max: 600, windowMs: 10 * 60 * 1000 };
const AIRTABLE_TABLE_ID_RE = /^tbl[a-zA-Z0-9]{14}$/;
const AIRTABLE_MERGE_FIELD = "Submission ID";
const FALLBACK_PAGE_URL = `${SITE_ORIGIN}/demo`;
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
const ATTRIBUTION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Lead = DemoRequest & {
  source: typeof DEMO_REQUEST_SOURCE;
  submittedAt: string;
  attributionId?: string;
  pageUrl: string;
};
type DeliveryResult = "sent" | "failed" | "skipped";
type AirtableCfg = { token: string; baseId: string; tableId: string };
type AirtableWriteResponse = { records?: Array<{ id?: unknown }> };
type AirtableErrorResponse = { error?: { type?: unknown } };

// Copied from app/api/waitlist/route.ts; extract to lib/request-origin.ts
// when a third caller appears.
function configuredHostname(value: string | undefined) {
  const candidate = value?.trim();
  if (!candidate) return undefined;

  try {
    return new URL(candidate.includes("://") ? candidate : `https://${candidate}`).hostname;
  } catch {
    return undefined;
  }
}

const VERCEL_HOSTS = new Set(
  [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
    .map(configuredHostname)
    .filter((hostname): hostname is string => Boolean(hostname)),
);

/**
 * "production" for the website's hosts on both domains (getpancake.ai and pancake.ai, apex and www;
 * lib/site-config.mjs) and this deployment's Vercel hosts, "local" for localhost outside production,
 * null otherwise.
 */
function approvedHost(hostname: string): "production" | "local" | null {
  const host = hostname.toLowerCase();
  if (isProductionSiteHost(host) || VERCEL_HOSTS.has(host)) return "production";
  if (process.env.NODE_ENV !== "production" && LOCAL_HOSTS.has(host)) return "local";
  return null;
}

function hasApprovedOrigin(request: Request) {
  const rawOrigin = request.headers.get("origin")?.trim();
  const rawHost = request.headers.get("host")?.trim().toLowerCase();
  if (!rawOrigin || !rawHost || rawHost.includes(",")) return false;

  try {
    const origin = new URL(rawOrigin);
    const kind = approvedHost(origin.hostname);

    return (
      kind !== null &&
      !origin.username &&
      !origin.password &&
      origin.host.toLowerCase() === rawHost &&
      (origin.protocol === "https:" || (kind === "local" && origin.protocol === "http:"))
    );
  } catch {
    return false;
  }
}

/** The `aid` of the pancake_attribution cookie, parsed like the waitlist route; never throws. */
function readAttributionId(request: NextRequest): string | undefined {
  const rawValue = request.cookies.get("pancake_attribution")?.value;
  if (!rawValue) return undefined;

  try {
    let parsed: { aid?: unknown };
    try {
      parsed = JSON.parse(rawValue) as { aid?: unknown };
    } catch {
      parsed = JSON.parse(decodeURIComponent(rawValue)) as { aid?: unknown };
    }
    return typeof parsed?.aid === "string" && ATTRIBUTION_ID_RE.test(parsed.aid) ? parsed.aid : undefined;
  } catch {
    return undefined;
  }
}

function json(body: DemoRequestResponse, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, { status, headers });
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * The Referer is client-controlled and would otherwise render as a clickable
 * link in the sales channel: accept only our own hosts, and only origin +
 * path (never the query string).
 */
function pageUrlFrom(request: NextRequest): string {
  const referer = request.headers.get("referer")?.trim();
  if (!referer) return FALLBACK_PAGE_URL;

  try {
    const url = new URL(referer);
    const kind = approvedHost(url.hostname);
    if (kind === null) return FALLBACK_PAGE_URL;
    if (url.protocol !== "https:" && !(kind === "local" && url.protocol === "http:")) return FALLBACK_PAGE_URL;
    return `${url.origin}${url.pathname}`;
  } catch {
    return FALLBACK_PAGE_URL;
  }
}

/** Slack mrkdwn's three reserved characters, for every interpolated value. */
function escapeMrkdwn(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Names must never format the message: drop the mrkdwn markers first. */
function plainName(value: string) {
  return escapeMrkdwn(value.replace(/[*_~`]/g, ""));
}

/** Keep `_` (common in addresses; a lone `_` never italicises), drop the rest. */
function plainEmail(value: string) {
  return escapeMrkdwn(value.replace(/[*~`]/g, ""));
}

function recordId(value: unknown) {
  if (typeof value !== "string" || !/^rec[a-zA-Z0-9]+$/.test(value)) return null;
  return value.slice(0, 40);
}

async function notifySlack(url: string, lead: Lead): Promise<DeliveryResult> {
  // cleanText in parseDemoRequest already removed newlines and bidi
  // controls, so a name cannot start a fake "*Email:*" line.
  const lines = [
    `*Name:* ${plainName(lead.firstName)} ${plainName(lead.lastName)}`,
    `*Email:* ${plainEmail(lead.email)}`,
    `*Website:* ${escapeMrkdwn(lead.website)}`,
    `*Team size:* ${escapeMrkdwn(lead.teamSize)}`,
    `*Has account:* ${lead.hasAccount === "yes" ? "Yes" : "No"}`,
    lead.goal ? `*Goal:* ${escapeMrkdwn(lead.goal)}` : null,
    `*Source:* ${lead.source}`,
    `*Submitted:* ${lead.submittedAt}`,
  ].filter(Boolean);
  const payload = {
    text: `New demo request: ${plainName(lead.firstName)} ${plainName(lead.lastName)}`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: "🥞 New demo request", emoji: true } },
      { type: "section", text: { type: "mrkdwn", text: lines.join("\n") } },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Page: ${escapeMrkdwn(lead.pageUrl)} · Attribution: ${lead.attributionId ?? "none"} · Submission: ${lead.submissionId ?? "none"}`,
          },
        ],
      },
    ],
  };

  let aborted = false;
  try {
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error("Slack demo notify failed", { status: response.status });
      return "failed";
    }
    return "sent";
  } catch (reason) {
    aborted = reason instanceof Error && reason.name === "AbortError";
    console.error("Slack demo notify failed", { reason: aborted ? "timeout" : "network" });
    return "failed";
  }
}

/**
 * One row per submission id: a browser submit (which always carries one)
 * upserts, so a retry after a timed-out-but-accepted write updates the same
 * row; "Start a new submission" resets the id on the client, so intentional
 * repeats still create rows. A direct API caller without an id creates.
 */
async function writeAirtable(cfg: AirtableCfg, lead: Lead): Promise<DeliveryResult> {
  const fields: Record<string, string> = {
    "First name": lead.firstName,
    "Last name": lead.lastName,
    Email: lead.email,
    Website: lead.website,
    "Team size": lead.teamSize,
    // Display words: single-selects are read by humans (typecast creates them).
    "Has account": lead.hasAccount === "yes" ? "Yes" : "No",
    Source: lead.source,
    "Submitted At": lead.submittedAt,
  };
  if (lead.goal) fields.Goal = lead.goal;
  if (lead.attributionId) fields["Attribution ID"] = lead.attributionId;
  if (lead.submissionId) fields[AIRTABLE_MERGE_FIELD] = lead.submissionId;

  const body = lead.submissionId
    ? { records: [{ fields }], performUpsert: { fieldsToMergeOn: [AIRTABLE_MERGE_FIELD] }, typecast: true }
    : { records: [{ fields }], typecast: true };

  let response: Response;
  try {
    response = await fetchWithTimeout(`https://api.airtable.com/v0/${cfg.baseId}/${cfg.tableId}`, {
      method: lead.submissionId ? "PATCH" : "POST",
      headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    console.error("Demo request Airtable write failed", { reason: "network_or_timeout" });
    return "failed";
  }

  if (!response.ok) {
    // `error.type` is a fixed enum (UNKNOWN_FIELD_NAME, INVALID_VALUE_FOR_COLUMN, …)
    // that tells ops which column is wrong; `error.message` echoes field
    // values and is never logged.
    const errorBody = (await response.json().catch(() => null)) as AirtableErrorResponse | null;
    const type = errorBody?.error?.type;
    console.error("Demo request Airtable write failed", {
      status: response.status,
      type: typeof type === "string" ? type : null,
    });
    return "failed";
  }

  const written = (await response.json().catch(() => null)) as AirtableWriteResponse | null;
  if (!recordId(written?.records?.[0]?.id)) {
    console.error("Demo request Airtable write returned no record id");
    return "failed";
  }
  return "sent";
}

export async function POST(request: NextRequest) {
  if (!hasApprovedOrigin(request)) return json({ ok: false, error: "forbidden" }, 403);

  if (Number(request.headers.get("content-length")) > BODY_MAX) return json({ ok: false, error: "invalid" }, 413);
  const text = await request.text();
  if (text.length > BODY_MAX) return json({ ok: false, error: "invalid" }, 413);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return json({ ok: false, error: "invalid" }, 400);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "invalid" }, 400);
  }

  // Honeypot: pretend success so bots do not learn they were caught (no log, no delivery).
  const honeypot = body[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") return json({ ok: true, delivered: [] }, 200);

  const perIp = rateLimit(`demo:create:${getClientIp(request)}`, IP_LIMIT.max, IP_LIMIT.windowMs);
  if (!perIp.ok) {
    return json({ ok: false, error: "rate_limited" }, 429, { "Retry-After": String(perIp.retryAfter) });
  }

  const parsed = parseDemoRequest(body);
  if (!parsed.ok) {
    return json({ ok: false, error: "invalid", field: parsed.field, ...(parsed.reason ? { reason: parsed.reason } : {}) }, 400);
  }

  // After validation so garbage bodies never consume it; see GLOBAL_LIMIT.
  const perInstance = rateLimit("demo:global", GLOBAL_LIMIT.max, GLOBAL_LIMIT.windowMs);
  if (!perInstance.ok) {
    console.error("Demo request per-instance circuit breaker tripped");
    return json({ ok: false, error: "unavailable" }, 503);
  }

  const lead: Lead = {
    ...parsed.value,
    source: DEMO_REQUEST_SOURCE,
    submittedAt: new Date().toISOString(),
    attributionId: readAttributionId(request),
    pageUrl: pageUrlFrom(request),
  };

  const production = process.env.NODE_ENV === "production";
  // The waitlist fallback is production-only: a local .env.local always has
  // the waitlist hook, and QA submissions must never post to #signups.
  const slackUrl =
    process.env.SLACK_DEMO_WEBHOOK_URL?.trim() ||
    (production ? process.env.SLACK_WAITLIST_WEBHOOK_URL?.trim() : undefined) ||
    undefined;

  let airtableCfg: AirtableCfg | undefined;
  const rawTableId = process.env.AIRTABLE_DEMO_REQUESTS_TABLE_ID?.trim();
  if (rawTableId) {
    const token = normalizeAirtableToken(process.env.AIRTABLE_TOKEN);
    const baseId = normalizeAirtableBaseId(process.env.AIRTABLE_BASE_ID);
    const tableId = AIRTABLE_TABLE_ID_RE.test(rawTableId) ? rawTableId : undefined;
    if (token && baseId && tableId) airtableCfg = { token, baseId, tableId };
    else console.error("Demo request Airtable config incomplete");
  }

  const attioToken = process.env.ATTIO_API_KEY?.trim() || undefined;

  if (!slackUrl && !airtableCfg && !attioToken) {
    if (!production) {
      console.info(
        "Demo request accepted without delivery: set SLACK_DEMO_WEBHOOK_URL, AIRTABLE_DEMO_REQUESTS_TABLE_ID or ATTIO_API_KEY",
      );
      return json({ ok: true, delivered: [] }, 200);
    }
    console.error("Demo request has no delivery configured");
    return json({ ok: false, error: "unavailable" }, 503);
  }

  const [slack, airtable, attio] = await Promise.all([
    slackUrl ? notifySlack(slackUrl, lead) : ("skipped" as const),
    airtableCfg ? writeAirtable(airtableCfg, lead) : ("skipped" as const),
    attioToken ? writeAttioDemoRequest(attioToken, lead) : ("skipped" as const),
  ]);

  const delivered: DemoRequestDelivery[] = [];
  if (slack === "sent") delivered.push("slack");
  if (airtable === "sent") delivered.push("airtable");
  if (attio === "sent") delivered.push("attio");
  if (delivered.length > 0) return json({ ok: true, delivered }, 200);

  console.error("Demo request delivery failed", { slack, airtable, attio });
  return json({ ok: false, error: "unavailable" }, 503);
}
