import { cookies } from "next/headers";
import crypto from "node:crypto";

import { staffEmailDomains } from "@/lib/site-config.mjs";

/**
 * Admin identity — the ONE place that decides who may delete ideas.
 *
 * Google sign-in model: an admin signs in with Google on the hidden
 * /open-roadmap/admin page; we verify their email is verified AND on an
 * allow-listed company domain (default getpancake.ai and pancake.ai), then set a signed,
 * HttpOnly cookie that proves "a verified company user authenticated, until
 * exp". Every privileged route checks that cookie server-side. The cookie is
 * signed with ROADMAP_AUTH_SECRET (the HMAC key), so a client can't forge it,
 * and the browser can't read it (HttpOnly).
 *
 * Fail-closed: missing config, no/invalid/expired cookie, or an email that no
 * longer matches an allowed domain ⇒ not admin. To swap the auth model later,
 * change ONLY this module — routes + page call through isAdmin().
 */

const AUTH_SECRET = process.env.ROADMAP_AUTH_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

/**
 * Allow-listed email domains: the comma-separated ROADMAP_ALLOWED_EMAIL_DOMAINS, else both company
 * domains (getpancake.ai and pancake.ai: staff addresses move to pancake.ai, the old ones stay).
 */
export const ADMIN_EMAIL_DOMAINS = staffEmailDomains(process.env.ROADMAP_ALLOWED_EMAIL_DOMAINS);

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const ADMIN_COOKIE_NAME = "roadmap_admin";

type AdminSession = { email: string };

/**
 * True when Google sign-in is fully configured (gates the login UI/routes):
 * client id + secret for the OAuth handshake, and a secret to sign sessions.
 */
export function isAdminAuthConfigured(): boolean {
  return Boolean(AUTH_SECRET && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}

/** True when `email` is a string on an allow-listed company domain. */
export function isAllowedAdminEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) return false;
  return ADMIN_EMAIL_DOMAINS.includes(email.slice(at + 1).toLowerCase());
}

/**
 * Mint the signed admin cookie value: base64url({exp,email}).base64url(HMAC),
 * keyed by ROADMAP_AUTH_SECRET. Returns the value + maxAge for the Set-Cookie.
 */
export function mintAdminCookie(email: string): { value: string; maxAge: number } {
  if (!AUTH_SECRET) return { value: "", maxAge: 0 };
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payloadB64 = Buffer.from(JSON.stringify({ exp, email }), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", AUTH_SECRET).update(payloadB64).digest("base64url");
  return { value: `${payloadB64}.${sig}`, maxAge: SESSION_TTL_SECONDS };
}

/** Validate the cookie (signature + expiry + allowed domain) → session or null. */
function readAdminCookie(value: string | undefined): AdminSession | null {
  if (!value || !AUTH_SECRET) return null;
  const dot = value.indexOf(".");
  if (dot <= 0 || dot === value.length - 1) return null;
  const payloadB64 = value.slice(0, dot);
  const sigB64 = value.slice(dot + 1);

  const expected = crypto.createHmac("sha256", AUTH_SECRET).update(payloadB64).digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(sigB64, "base64url");
  } catch {
    return null;
  }
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const { exp, email } = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as {
      exp?: unknown;
      email?: unknown;
    };
    if (typeof exp !== "number" || Math.floor(Date.now() / 1000) > exp) return null;
    // Re-check the domain on every request: revoking a domain (or fixing a typo)
    // then takes effect immediately, even for already-issued cookies.
    if (!isAllowedAdminEmail(email)) return null;
    return { email };
  } catch {
    return null;
  }
}

/** The current admin session (verified email), or null. */
export function getAdminSession(): AdminSession | null {
  return readAdminCookie(cookies().get(ADMIN_COOKIE_NAME)?.value);
}

/** True only when the current request carries a valid admin cookie. */
export async function isAdmin(): Promise<boolean> {
  return getAdminSession() !== null;
}
