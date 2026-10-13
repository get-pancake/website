import { NextResponse } from "next/server";

/**
 * The waitlist is retired: every landing CTA opens the app since 2026-08-24 and
 * no page posts here any more. The handler used to write to Airtable, post the
 * submitted text to Slack and send a Meta Lead, so it stayed a live write path
 * with no caller (bug check 2026-10-13, H4). It now answers 410 Gone to every
 * method, reads nothing from the request and has no side effect.
 *
 * Its delivery helpers stay where they are (lib/analytics/waitlist-delivery.ts,
 * waitlist-response.ts, meta-capi.ts): scripts/waitlist-delivery.test.mjs still
 * covers them.
 */
// Answered per request: a prerendered GET would be served as a static file.
export const dynamic = "force-dynamic";

function gone() {
  return NextResponse.json({ error: "gone" }, { status: 410 });
}

export const GET = gone;
export const HEAD = gone;
export const POST = gone;
export const PUT = gone;
export const PATCH = gone;
export const DELETE = gone;
export const OPTIONS = gone;
