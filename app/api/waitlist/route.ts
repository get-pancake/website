import { NextRequest, NextResponse } from "next/server";

import { WAITLIST_CTA_IDS } from "@/lib/analytics/data-layer";
import { sendMetaWaitlistLead } from "@/lib/analytics/meta-capi";
import {
  cleanAirtableString,
  createWaitlistLeadEventId,
  inspectWaitlistDelivery,
  isSuccessfulDeliveryTimestamp,
  isWaitlistSubmissionId,
  WAITLIST_DELIVERY_VERSION,
  WAITLIST_DELIVERY_VERSION_FIELD,
  WAITLIST_EVENT_ID_FIELD,
  WAITLIST_META_CAPI_DELIVERED_AT_FIELD,
  WAITLIST_SLACK_DELIVERED_AT_FIELD,
  WAITLIST_SUBMISSION_ID_FIELD,
} from "@/lib/analytics/waitlist-delivery";
import { normalizeAirtableBaseId, normalizeAirtableToken } from "@/lib/airtable-config";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isProductionSiteHost } from "@/lib/site-config.mjs";

export const runtime = "nodejs";

const TABLE_ID = "tblaLf53RDQh6RXtT"; // "GTM Waitlist" in the Signups base
const HANDOFF_CHOICES = [
  "Outbound",
  "Content & social",
  "SEO & landing pages",
  "Ads",
  "Lead research",
  "CRM hygiene",
];
const SOURCE_CHOICES = new Set(["landing-v2", "gtm-report"]);
const AIRTABLE_TIMEOUT_MS = 5000;
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type AirtableRecord = { id?: unknown; fields?: Record<string, unknown> };
type AirtableListResponse = { records?: AirtableRecord[] };
type AirtableUpsertResponse = {
  records?: AirtableRecord[];
  createdRecords?: unknown[];
  updatedRecords?: unknown[];
};

type AttributionCookie = {
  aid?: unknown;
  t?: Array<{ ts?: unknown; k?: { fbclid?: unknown } }>;
};

const WAITLIST_CTA_ID_SET = new Set<string>(WAITLIST_CTA_IDS);

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

function hasApprovedOrigin(request: Request) {
  const rawOrigin = request.headers.get("origin")?.trim();
  const rawHost = request.headers.get("host")?.trim().toLowerCase();
  if (!rawOrigin || !rawHost || rawHost.includes(",")) return false;

  try {
    const origin = new URL(rawOrigin);
    const hostname = origin.hostname.toLowerCase();
    const local = process.env.NODE_ENV !== "production" && LOCAL_HOSTS.has(hostname);
    // Both domains, apex and www (lib/site-config.mjs), plus this deployment's Vercel hosts.
    const approved = isProductionSiteHost(hostname) || VERCEL_HOSTS.has(hostname) || local;

    return (
      approved &&
      !origin.username &&
      !origin.password &&
      origin.host.toLowerCase() === rawHost &&
      (origin.protocol === "https:" || (local && origin.protocol === "http:"))
    );
  } catch {
    return false;
  }
}

function approvedRequestHostname(request: Request) {
  try {
    return new URL(request.headers.get("origin") ?? "").hostname.toLowerCase();
  } catch {
    return "";
  }
}

async function airtableFetch(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AIRTABLE_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

function recordId(value: unknown) {
  if (typeof value !== "string" || !/^rec[a-zA-Z0-9]+$/.test(value)) return null;
  return value.slice(0, 40);
}

function readAttributionCookie(request: NextRequest) {
  const rawValue = request.cookies.get("pancake_attribution")?.value;
  if (!rawValue) return {};

  try {
    let parsed: AttributionCookie;
    try {
      parsed = JSON.parse(rawValue) as AttributionCookie;
    } catch {
      parsed = JSON.parse(decodeURIComponent(rawValue)) as AttributionCookie;
    }
    const attributionId =
      typeof parsed.aid === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(parsed.aid)
        ? parsed.aid
        : undefined;

    let fbc: string | undefined;
    if (Array.isArray(parsed.t)) {
      const fbTouch = [...parsed.t].reverse().find((touch) =>
        typeof touch?.k?.fbclid === "string" &&
        typeof touch.ts === "number" &&
        Number.isFinite(touch.ts),
      );
      if (fbTouch && typeof fbTouch.k?.fbclid === "string" && typeof fbTouch.ts === "number") {
        const clickId = fbTouch.k.fbclid.trim().slice(0, 500);
        if (clickId) fbc = `fb.1.${Math.trunc(fbTouch.ts * 1000)}.${clickId}`;
      }
    }

    return { attributionId, fbc };
  } catch {
    return {};
  }
}

async function findExistingLead(token: string, baseId: string, email: string) {
  const query = new URLSearchParams({
    maxRecords: "1",
    filterByFormula: `LOWER({Email}) = ${JSON.stringify(email)}`,
  });
  for (const field of [
    "Email",
    "Company URL",
    "What they do",
    "GTM to hand off",
    "Source",
    "Submitted At",
    WAITLIST_DELIVERY_VERSION_FIELD,
    WAITLIST_EVENT_ID_FIELD,
    WAITLIST_SUBMISSION_ID_FIELD,
    WAITLIST_SLACK_DELIVERED_AT_FIELD,
    WAITLIST_META_CAPI_DELIVERED_AT_FIELD,
  ]) {
    query.append("fields[]", field);
  }

  const response = await airtableFetch(
    `https://api.airtable.com/v0/${baseId}/${TABLE_ID}?${query.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    // Never log the formula or response body; both may contain the email.
    console.error("Waitlist lookup failed", { status: response.status });
    throw new Error("airtable_lookup_failed");
  }

  const body = (await response.json().catch(() => null)) as AirtableListResponse | null;
  const record = body?.records?.[0];
  return record && recordId(record.id) ? record : null;
}

/** Accept "acme.com" as well as a full URL; return null when it can't be one. */
function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.username || url.password || !url.hostname.includes(".")) return null;
    return `${url.protocol}//${url.host}/`;
  } catch {
    return null;
  }
}

/**
 * Fire a Slack notification for a new signup. Best-effort: gated on an env var,
 * time-boxed, and fully swallowed on failure so it can never break a signup that
 * already succeeded in Airtable.
 */
async function notifySlack(fields: Record<string, unknown>) {
  const url = process.env.SLACK_WAITLIST_WEBHOOK_URL;
  if (!url) return { status: "disabled" as const };

  const line = (label: string, value: unknown) =>
    value ? `*${label}:* ${String(value)}` : null;
  const handoff = Array.isArray(fields["GTM to hand off"])
    ? (fields["GTM to hand off"] as string[]).join(", ")
    : "";
  const text = [
    line("Email", fields["Email"]),
    line("Company", fields["Company URL"]),
    line("What they do", fields["What they do"]),
    line("Wants to hand off", handoff),
    line("Source", fields["Source"]),
  ]
    .filter(Boolean)
    .join("\n");

  const payload = {
    // App Incoming Webhooks post to the channel they were created for (create
    // it against #signups). `channel` is honoured by legacy/bot-token webhooks
    // and harmlessly ignored by app webhooks — it documents the intended target.
    channel: "#signups",
    text: `New GTM waitlist signup: ${fields["Email"]}`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: "🥞 New GTM waitlist signup", emoji: true } },
      { type: "section", text: { type: "mrkdwn", text } },
    ],
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("Slack waitlist notify failed", { status: response.status });
      return { status: "failed" as const };
    }
    return { status: "sent" as const };
  } catch {
    console.error("Slack waitlist notify failed", {
      reason: ctrl.signal.aborted ? "timeout" : "network",
    });
    return { status: "failed" as const };
  } finally {
    clearTimeout(timer);
  }
}

async function updateAirtableRecord(
  token: string,
  baseId: string,
  airtableRecordId: string,
  fields: Record<string, unknown>,
) {
  try {
    const response = await airtableFetch(
      `https://api.airtable.com/v0/${baseId}/${TABLE_ID}/${airtableRecordId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields, typecast: true }),
      },
    );
    if (!response.ok) {
      console.error("Waitlist delivery ledger update failed", { status: response.status });
      return false;
    }
    return true;
  } catch {
    console.error("Waitlist delivery ledger update failed", { reason: "network_or_timeout" });
    return false;
  }
}

function submittedAtSeconds(fields: Record<string, unknown>) {
  const value = cleanAirtableString(fields["Submitted At"], 100);
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? Math.floor(timestamp / 1000) : undefined;
}

type PendingDeliveryInput = {
  token: string;
  baseId: string;
  airtableRecordId: string;
  fields: Record<string, unknown>;
  eventId: string;
  request: NextRequest;
  ctaId?: string;
  handoffCount: number;
};

/**
 * Retry only ledger entries that do not have a success timestamp. Meta accepts
 * the stable event ID for deduplication. Slack Incoming Webhooks do not expose
 * an idempotency key, so that delivery is intentionally at-least-once if the
 * webhook succeeds but the Airtable timestamp write is lost.
 */
async function deliverPendingSideEffects(input: PendingDeliveryInput) {
  const slackPending = !isSuccessfulDeliveryTimestamp(
    input.fields[WAITLIST_SLACK_DELIVERED_AT_FIELD],
  );
  const source = cleanAirtableString(input.fields["Source"], 100);
  const metaPending =
    !isSuccessfulDeliveryTimestamp(input.fields[WAITLIST_META_CAPI_DELIVERED_AT_FIELD]) &&
    source === "landing-v2" &&
    Boolean(input.ctaId);

  const attribution = readAttributionCookie(input.request);
  const [slackDelivery, metaDelivery] = await Promise.all([
    slackPending
      ? notifySlack(input.fields)
      : Promise.resolve({ status: "already_sent" as const }),
    metaPending
      ? sendMetaWaitlistLead({
          eventId: input.eventId,
          email: cleanAirtableString(input.fields["Email"], 200) ?? "",
          requestHostname: approvedRequestHostname(input.request),
          eventSourceUrl: input.request.headers.get("referer") ?? undefined,
          eventTimeSeconds: submittedAtSeconds(input.fields),
          clientIp: getClientIp(input.request),
          clientUserAgent: input.request.headers.get("user-agent") ?? undefined,
          fbp: input.request.cookies.get("_fbp")?.value,
          fbc: input.request.cookies.get("_fbc")?.value ?? attribution.fbc,
          attributionId: attribution.attributionId,
          ctaId: input.ctaId,
          handoffCount: input.handoffCount,
        })
      : Promise.resolve({ status: "already_sent" as const }),
  ]);

  const deliveredAt = new Date().toISOString();
  const ledgerFields: Record<string, unknown> = {};
  if (slackDelivery.status === "sent") {
    ledgerFields[WAITLIST_SLACK_DELIVERED_AT_FIELD] = deliveredAt;
  }
  if (metaDelivery.status === "sent") {
    ledgerFields[WAITLIST_META_CAPI_DELIVERED_AT_FIELD] = deliveredAt;
  }
  if (Object.keys(ledgerFields).length > 0) {
    await updateAirtableRecord(
      input.token,
      input.baseId,
      input.airtableRecordId,
      ledgerFields,
    );
  }
}

/**
 * Landing-page waitlist signup. Open to anyone, guarded the same way as the
 * roadmap board:
 *   1. a honeypot field (`website`) — bots fill it, humans never see it
 *   2. a per-IP rate limit (5 / 10 min)
 *   3. server-side validation, and a choice allow-list for the multi-select
 * Writes land in Airtable with the token that already powers the roadmap.
 */
export async function POST(request: NextRequest) {
  if (!hasApprovedOrigin(request)) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 });
  }

  const token = normalizeAirtableToken(process.env.AIRTABLE_TOKEN);
  const baseId = normalizeAirtableBaseId(process.env.AIRTABLE_BASE_ID);
  if (!token || !baseId) {
    return NextResponse.json({ error: "Waitlist backend is not configured." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rawSource = typeof body.source === "string" ? body.source.trim() : "landing-v2";
  const source = SOURCE_CHOICES.has(rawSource) ? rawSource : "landing-v2";

  // Honeypot: pretend success so bots don't learn they were caught.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json(
      {
        ok: true,
        newly_created: false,
        recovered_conversion: false,
        conversion_event_id: null,
      },
      { status: 201 },
    );
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`waitlist:create:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "You're sending those a bit fast. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  let submissionId: string | undefined;
  let conversionEventId: string | undefined;
  if (source === "landing-v2") {
    const eventIdSecret = process.env.ANALYTICS_EVENT_ID_SECRET?.trim();
    if (!eventIdSecret || eventIdSecret.length < 32) {
      return NextResponse.json({ error: "Waitlist backend is not configured." }, { status: 503 });
    }
    const candidateSubmissionId =
      typeof body.submissionId === "string" ? body.submissionId.trim().toLowerCase() : "";
    if (!isWaitlistSubmissionId(candidateSubmissionId)) {
      return NextResponse.json({ error: "Invalid submission identifier." }, { status: 400 });
    }
    submissionId = candidateSubmissionId;
    conversionEventId = createWaitlistLeadEventId(email, eventIdSecret);
  }

  const companyUrl = typeof body.companyUrl === "string" ? normalizeUrl(body.companyUrl) : null;
  const about = typeof body.about === "string" ? body.about.trim().slice(0, 2000) : "";
  const handoff = Array.isArray(body.handoff)
    ? body.handoff.filter((v): v is string => typeof v === "string" && HANDOFF_CHOICES.includes(v))
    : [];
  const rawCtaId = typeof body.ctaId === "string" ? body.ctaId.trim() : "";
  const ctaId = WAITLIST_CTA_ID_SET.has(rawCtaId) ? rawCtaId : undefined;

  let existingRecord: AirtableRecord | null;
  try {
    existingRecord = await findExistingLead(token, baseId, email);
  } catch {
    return NextResponse.json(
      { error: "We couldn't verify that signup. Try again in a moment." },
      { status: 502 },
    );
  }

  const existingRecordId = recordId(existingRecord?.id);
  if (existingRecord && existingRecordId) {
    if (source !== "landing-v2" || !conversionEventId || !submissionId) {
      return NextResponse.json(
        {
          ok: true,
          newly_created: false,
          recovered_conversion: false,
          conversion_event_id: null,
        },
        { status: 200 },
      );
    }
    const existingFields = existingRecord.fields ?? {};
    const deliveryState = inspectWaitlistDelivery(
      existingFields,
      conversionEventId,
      submissionId,
    );
    const recoveredConversion = deliveryState.recoverable;

    // Old rows intentionally have no delivery version. They remain ordinary
    // duplicates and can never be backfilled as fresh advertising conversions.
    if (recoveredConversion) {
      const storedHandoffCount = Array.isArray(existingFields["GTM to hand off"])
        ? existingFields["GTM to hand off"].filter(
            (value): value is string =>
              typeof value === "string" && HANDOFF_CHOICES.includes(value),
          ).length
        : 0;
      await deliverPendingSideEffects({
        token,
        baseId,
        airtableRecordId: existingRecordId,
        fields: existingFields,
        eventId: conversionEventId,
        request,
        ctaId,
        handoffCount: storedHandoffCount,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        newly_created: false,
        recovered_conversion: recoveredConversion,
        conversion_event_id: recoveredConversion ? conversionEventId : null,
      },
      { status: 200 },
    );
  }

  const fields: Record<string, unknown> = {
    Email: email,
    Status: "New",
    Source: source || "landing-v2",
    "Submitted At": new Date().toISOString(),
  };
  if (conversionEventId && submissionId) {
    fields[WAITLIST_DELIVERY_VERSION_FIELD] = WAITLIST_DELIVERY_VERSION;
    fields[WAITLIST_EVENT_ID_FIELD] = conversionEventId;
    fields[WAITLIST_SUBMISSION_ID_FIELD] = submissionId;
  }
  if (companyUrl) fields["Company URL"] = companyUrl;
  if (about) fields["What they do"] = about;
  if (handoff.length) fields["GTM to hand off"] = handoff;

  let res: Response;
  try {
    res = await airtableFetch(`https://api.airtable.com/v0/${baseId}/${TABLE_ID}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        performUpsert: { fieldsToMergeOn: ["Email"] },
        records: [{ fields }],
        typecast: true,
      }),
    });
  } catch {
    console.error("Waitlist write failed before response", { reason: "network_or_timeout" });
    return NextResponse.json(
      { error: "We couldn't save that. Try again in a moment." },
      { status: 502 },
    );
  }

  if (!res.ok) {
    // Airtable error bodies can echo submitted field values; status is enough.
    console.error("Waitlist write failed", { status: res.status });
    return NextResponse.json({ error: "We couldn't save that. Try again in a moment." }, { status: 502 });
  }

  const responseBody = (await res.json().catch(() => null)) as AirtableUpsertResponse | null;
  const upsertedRecord = responseBody?.records?.[0];
  const createdRecordId = recordId(upsertedRecord?.id);
  if (!createdRecordId) {
    console.error("Waitlist upsert succeeded without an Airtable record ID.");
    return NextResponse.json(
      { error: "We couldn't confirm that signup. Try again in a moment." },
      { status: 502 },
    );
  }

  const newlyCreated =
    responseBody?.createdRecords?.some((value) => recordId(value) === createdRecordId) === true;
  if (!newlyCreated) {
    // A concurrent request won the atomic email upsert. Do not let this losing
    // response claim a browser conversion; a later retry first re-reads the
    // persisted submission owner and delivery ledger.
    return NextResponse.json(
      {
        ok: true,
        newly_created: false,
        recovered_conversion: false,
        conversion_event_id: null,
      },
      { status: 200 },
    );
  }

  if (source !== "landing-v2" || !conversionEventId) {
    await notifySlack(fields);
    return NextResponse.json(
      {
        ok: true,
        newly_created: true,
        recovered_conversion: false,
        conversion_event_id: null,
      },
      { status: 201 },
    );
  }

  // Both side effects are best-effort and time-boxed. Successful deliveries
  // receive timestamps, allowing the same submission chain to repair only a
  // missing side effect after an ambiguous Airtable/HTTP timeout.
  await deliverPendingSideEffects({
    token,
    baseId,
    airtableRecordId: createdRecordId,
    fields,
    eventId: conversionEventId,
    request,
    ctaId,
    handoffCount: handoff.length,
  });

  return NextResponse.json(
    {
      ok: true,
      newly_created: true,
      recovered_conversion: false,
      conversion_event_id: conversionEventId,
    },
    { status: 201 },
  );
}
