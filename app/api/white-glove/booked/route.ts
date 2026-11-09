import { NextResponse } from "next/server";

import { WG_DEAL_OWNER, WG_DEAL_STAGE, createAttioWhiteGloveDeal } from "@/lib/attio-white-glove";
import { CALENDLY_EVENT_URI_RE, CALENDLY_INVITEE_URI_RE } from "@/lib/booking";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { verifyWgBooking } from "@/lib/white-glove-booking-token";
import { wgCaller, wgCorsHeaders, wgPageUrlFor, wgPreflight } from "@/lib/white-glove-cors";

/**
 * POST /api/white-glove/booked — a /white-glove card (pancake.ai, or
 * brain.pancake.ai cross-origin: lib/white-glove-cors.ts) saw Calendly's
 * calendly.event_scheduled. Body: { booking, event?, invitee? }: the pass
 * POST /api/white-glove/demo signed, and Calendly's event and invitee URIs.
 * A valid pass opens the Attio deal (lib/attio-white-glove.ts); the page
 * shows "You're booked" whatever this answers. Optional env:
 * ATTIO_WHITE_GLOVE_DEAL_STAGE (overrides WG_DEAL_STAGE, "Demo booked") and
 * ATTIO_WHITE_GLOVE_DEAL_OWNER (a workspace member's email; overrides
 * WG_DEAL_OWNER, François).
 */

export const runtime = "nodejs";
export const maxDuration = 30;

const BODY_MAX = 2048;

/** The brain.pancake.ai page asks the same route from another origin. */
export function OPTIONS(request: Request) {
  return wgPreflight(request);
}

export async function POST(request: Request) {
  const { allowed, brainOrigin: brain } = wgCaller(request);
  if (!allowed) return NextResponse.json({ ok: false }, { status: 403 });
  const headers = wgCorsHeaders(brain);
  const reply = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status, headers });

  const text = await request.text();
  if (text.length > BODY_MAX) return reply({ ok: false }, 413);
  let body: { booking?: unknown; event?: unknown; invitee?: unknown } | null;
  try {
    body = JSON.parse(text);
  } catch {
    return reply({ ok: false }, 400);
  }
  const limit = rateLimit(`white-glove-booked:${getClientIp(request)}`, 10, 600_000);
  if (!limit.ok) return reply({ ok: false }, 429);

  const secret = process.env.ATTIO_API_KEY;
  if (!secret) return reply({ ok: true, deal: "skipped" });
  const answers = verifyWgBooking(secret, body?.booking);
  if (!answers) return reply({ ok: false }, 400);
  const event = typeof body?.event === "string" && CALENDLY_EVENT_URI_RE.test(body.event) ? body.event : undefined;
  const invitee =
    typeof body?.invitee === "string" && CALENDLY_INVITEE_URI_RE.test(body.invitee) ? body.invitee : undefined;

  const deal = await createAttioWhiteGloveDeal(
    secret,
    answers,
    { bookedAt: new Date().toISOString(), eventUri: event, inviteeUri: invitee, pageUrl: wgPageUrlFor(brain) },
    {
      stage: process.env.ATTIO_WHITE_GLOVE_DEAL_STAGE?.trim() || WG_DEAL_STAGE,
      owner: process.env.ATTIO_WHITE_GLOVE_DEAL_OWNER?.trim() || WG_DEAL_OWNER,
    },
  );
  return reply({ ok: deal !== "failed", deal }, deal === "failed" ? 502 : 200);
}
