import { NextResponse } from "next/server";

import { WG_DEAL_OWNER, WG_DEAL_STAGE, createAttioWhiteGloveDeal } from "@/lib/attio-white-glove";
import { CALENDLY_EVENT_URI_RE, CALENDLY_INVITEE_URI_RE } from "@/lib/booking";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { hasApprovedOrigin } from "@/lib/request-origin";
import { verifyWgBooking } from "@/lib/white-glove-booking-token";

/**
 * POST /api/white-glove/booked — the /white-glove card saw Calendly's
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

export async function POST(request: Request) {
  if (!hasApprovedOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  const text = await request.text();
  if (text.length > BODY_MAX) return NextResponse.json({ ok: false }, { status: 413 });
  let body: { booking?: unknown; event?: unknown; invitee?: unknown } | null;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const limit = rateLimit(`white-glove-booked:${getClientIp(request)}`, 10, 600_000);
  if (!limit.ok) return NextResponse.json({ ok: false }, { status: 429 });

  const secret = process.env.ATTIO_API_KEY;
  if (!secret) return NextResponse.json({ ok: true, deal: "skipped" });
  const answers = verifyWgBooking(secret, body?.booking);
  if (!answers) return NextResponse.json({ ok: false }, { status: 400 });
  const event = typeof body?.event === "string" && CALENDLY_EVENT_URI_RE.test(body.event) ? body.event : undefined;
  const invitee =
    typeof body?.invitee === "string" && CALENDLY_INVITEE_URI_RE.test(body.invitee) ? body.invitee : undefined;

  const deal = await createAttioWhiteGloveDeal(
    secret,
    answers,
    { bookedAt: new Date().toISOString(), eventUri: event, inviteeUri: invitee },
    {
      stage: process.env.ATTIO_WHITE_GLOVE_DEAL_STAGE?.trim() || WG_DEAL_STAGE,
      owner: process.env.ATTIO_WHITE_GLOVE_DEAL_OWNER?.trim() || WG_DEAL_OWNER,
    },
  );
  return NextResponse.json({ ok: deal !== "failed", deal }, { status: deal === "failed" ? 502 : 200 });
}
