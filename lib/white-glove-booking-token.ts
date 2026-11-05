import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { parseWgRequest, type WgAnswers } from "@/lib/white-glove-demo";

/**
 * The booking pass between the two /white-glove routes. POST
 * /api/white-glove/demo signs the qualified answers when it answers `book`;
 * the page sends the pass back to POST /api/white-glove/booked when Calendly
 * reports the booking, and only a valid pass opens an Attio deal. So a deal
 * needs a form that passed the server's rules, and its answers cannot be
 * edited in the browser in between. It is not proof that a booking happened
 * (the page reports that, Calendly does not sign it); a replay within the day
 * finds the deal it opened and only adds a note.
 *
 * Signed with HMAC-SHA256 under the Attio token (domain-separated), the one
 * secret this flow already needs: no Attio token, no pass, no deal.
 */

/** Long enough to pick a time after a coffee; the page holds the pass in memory only. */
export const WG_BOOKING_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_TOKEN_LENGTH = 1024;
/** parseWgRequest wants a submission id; the pass carries none. */
const NO_SUBMISSION = "00000000-0000-4000-8000-000000000000";

function mac(secret: string, payload: string): Buffer {
  return createHmac("sha256", `pancake-white-glove-booking:${secret}`).update(payload).digest();
}

/** A pass for these answers, issued now. */
export function signWgBooking(secret: string, a: WgAnswers, issuedAt: number = Date.now()): string {
  const payload = Buffer.from(
    JSON.stringify({ e: a.email, s: a.size, c: a.country, g: a.gtmTeam, t: issuedAt }),
  ).toString("base64url");
  return `${payload}.${mac(secret, payload).toString("base64url")}`;
}

/** The answers in a valid, unexpired pass, or null. */
export function verifyWgBooking(secret: string, token: unknown, now: number = Date.now()): WgAnswers | null {
  if (typeof token !== "string" || token.length > MAX_TOKEN_LENGTH) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [payload, signature] = parts as [string, string];
  const given = Buffer.from(signature, "base64url");
  const expected = mac(secret, payload);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  let claims: { e?: unknown; s?: unknown; c?: unknown; g?: unknown; t?: unknown };
  try {
    claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof claims?.t !== "number" || !Number.isFinite(claims.t)) return null;
  // a minute of clock skew between instances, never a pass from the future
  if (claims.t > now + 60_000 || now - claims.t > WG_BOOKING_MAX_AGE_MS) return null;
  const parsed = parseWgRequest({
    email: claims.e,
    size: claims.s,
    country: claims.c,
    gtmTeam: claims.g,
    submissionId: NO_SUBMISSION,
  });
  return parsed.ok ? parsed.value : null;
}
