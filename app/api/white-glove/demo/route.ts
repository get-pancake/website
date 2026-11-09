import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { writeAttioWhiteGloveRequest } from "@/lib/attio-white-glove";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { signWgBooking } from "@/lib/white-glove-booking-token";
import { wgCaller, wgCorsHeaders, wgPageUrlFor, wgPreflight } from "@/lib/white-glove-cors";
import {
  WG_BODY_MAX,
  WG_BUDGET_DEMO_TEXT,
  WG_HONEYPOT,
  isTeamEmail,
  parseWgRequest,
  wgEmailDomain,
  wgReviewReason,
  wgRoute,
  type WgAnswers,
  type WgField,
  type WgResponse,
} from "@/lib/white-glove-demo";

/**
 * POST /api/white-glove/demo — the "Book a demo" card on pancake.ai/white-glove
 * (WgBookDemo.tsx) and on brain.pancake.ai/white-glove (the campaign page,
 * cross-origin: lib/white-glove-cors.ts). Routes one request
 * (lib/white-glove-demo.ts wgRoute):
 *   - self_serve: answered at once, nothing stored (= /demo's self-serve path):
 *     a company of 1–2, or a budget that does not stretch to White Glove;
 *   - review: saved to François's private queue (demo_requests, the table
 *     /demo/review reads), then the person and company go to Attio. A success
 *     means the queue has it, even when Attio is down;
 *   - book: the person and company go to Attio, then the answer carries the
 *     signed booking pass the page sends back once Calendly reports a booking
 *     (POST /api/white-glove/booked opens the Attio deal).
 * Team addresses (pancake.ai) get the same answers and write nothing.
 * Guards as /api/demo-request: origin, size, honeypot, rate limits. The CRM
 * notes and the queue row say which page the visitor used.
 */

export const runtime = "nodejs";
export const maxDuration = 30;

const FIELD_ERRORS: Record<WgField, string> = {
  email: "Enter your work email.",
  size: "Pick your company size.",
  country: "Pick your country.",
  gtmTeam: "Tell us if you have a GTM team.",
  budget: "Tell us if the budget works for you.",
  submissionId: "Please reload the page and try again.",
};
const PERSONAL_EMAIL_ERROR = "Use your work email. Personal addresses can't book a demo.";
const SAVE_ERROR = "We could not save your request. Please try again.";

/** The brain.pancake.ai page asks the same routes from another origin. */
export function OPTIONS(request: Request) {
  return wgPreflight(request);
}

/**
 * The queue row: /demo's answer shape (the queue, the research job and the
 * invitation read it), with what this form does not ask marked as such, and
 * its own answers added (the queue lists every key).
 */
function reviewAnswers(a: WgAnswers, pageUrl: string) {
  const notAsked = "Not asked (White Glove page)";
  return {
    name: "",
    email: a.email,
    website: `https://${wgEmailDomain(a.email)}`,
    role: notAsked,
    size: a.size,
    goal: "Book a White Glove demo",
    service: "White Glove",
    budget: WG_BUDGET_DEMO_TEXT[a.budget],
    salesTeam: a.gtmTeam === "yes" ? "GTM team in place" : "No GTM team yet",
    sequencer: notAsked,
    volume: notAsked,
    country: a.country,
    source: pageUrl,
    reviewReason: wgReviewReason(a),
  };
}

export async function POST(request: Request) {
  const { allowed, brainOrigin: brain } = wgCaller(request);
  if (!allowed) {
    return NextResponse.json({ ok: false, error: "Request not allowed." } satisfies WgResponse, { status: 403 });
  }
  const cors = wgCorsHeaders(brain);
  const pageUrl = wgPageUrlFor(brain);
  const reply = (body: WgResponse, status = 200, headers?: Record<string, string>) =>
    NextResponse.json(body, { status, headers: { ...cors, ...headers } });

  if (Number(request.headers.get("content-length")) > WG_BODY_MAX) {
    return reply({ ok: false, error: "Request too large." }, 413);
  }
  const text = await request.text();
  if (text.length > WG_BODY_MAX) return reply({ ok: false, error: "Request too large." }, 413);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return reply({ ok: false, error: "Invalid request." }, 400);
  }
  // A bot that filled the hidden field is told "we'll be in touch"; nothing is stored.
  if (body && typeof body === "object" && (body as Record<string, unknown>)[WG_HONEYPOT]) {
    return reply({ ok: true, route: "review" });
  }
  const limit = rateLimit(`white-glove-demo:${getClientIp(request)}`, 5, 600_000);
  if (!limit.ok) {
    return reply({ ok: false, error: "Too many attempts. Please try again in a few minutes." }, 429, {
      "Retry-After": String(limit.retryAfter),
    });
  }
  const parsed = parseWgRequest(body);
  if (!parsed.ok) {
    return reply(
      {
        ok: false,
        error: parsed.reason === "personal_email" ? PERSONAL_EMAIL_ERROR : FIELD_ERRORS[parsed.field],
        field: parsed.field,
        ...(parsed.reason ? { reason: parsed.reason } : {}),
      },
      400,
    );
  }
  const a = parsed.value;
  const route = wgRoute(a);
  // No meeting, no CRM write and no queue row for a solo or duo company.
  if (route === "self_serve") return reply({ ok: true, route });

  const capacity = rateLimit("white-glove-demo:global", 300, 600_000);
  if (!capacity.ok) return reply({ ok: false, error: "Please try again shortly." }, 503);
  const token = process.env.ATTIO_API_KEY;
  const test = isTeamEmail(a.email);
  const submittedAt = new Date().toISOString();

  if (route === "review") {
    if (test) return reply({ ok: true, route });
    const db = createSupabaseAdminClient();
    if (!db) return reply({ ok: false, error: SAVE_ERROR }, 503);
    const answers = reviewAnswers(a, pageUrl);
    const hash = createHash("sha256").update(JSON.stringify(answers)).digest("hex");
    const { error } = await db
      .from("demo_requests")
      .insert({ id: parsed.submissionId, answers, request_hash: hash });
    if (error) {
      // The same submission again (a retry after a timeout): already queued.
      if (error.code === "23505") {
        const { data } = await db.from("demo_requests").select("request_hash").eq("id", parsed.submissionId).single();
        if (data?.request_hash === hash) return reply({ ok: true, route });
      }
      return reply({ ok: false, error: SAVE_ERROR }, 503);
    }
    if (token) {
      const result = await writeAttioWhiteGloveRequest(token, a, "review", submittedAt, pageUrl);
      if (result !== "skipped") await db.from("demo_requests").update({ crm_state: result }).eq("id", parsed.submissionId);
    }
    return reply({ ok: true, route });
  }

  if (token && !test) await writeAttioWhiteGloveRequest(token, a, "book", submittedAt, pageUrl);
  return reply({ ok: true, route, booking: token ? signWgBooking(token, a) : null });
}
