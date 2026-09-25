import "server-only";

import crypto from "node:crypto";

import { ADMIN_EMAIL_DOMAINS } from "@/lib/auth/admin";

/**
 * Google OAuth 2.0 (authorization-code) helpers for admin sign-in.
 *
 * We run the server-side code flow: redirect to Google, exchange the returned
 * code for tokens at Google's token endpoint over TLS, then read the ID token's
 * claims. Because the ID token is fetched server-to-server directly from Google
 * (not relayed by the browser), per Google's guidance the JWT signature need
 * not be re-verified; we still assert issuer, audience, and expiry as defence
 * in depth. The caller (callback route) is responsible for the email-domain
 * check via lib/auth/admin.isAllowedAdminEmail.
 *
 * Kept separate from lib/auth/admin so the "who is admin?" decision stays in
 * one module; this file only handles the Google handshake.
 */

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const VALID_ISSUERS = new Set(["https://accounts.google.com", "accounts.google.com"]);

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

/** Short-lived cookie holding the CSRF `state` across the round-trip to Google. */
export const GOOGLE_STATE_COOKIE = "roadmap_oauth_state";
export const STATE_TTL_SECONDS = 10 * 60; // 10 minutes to complete sign-in

export function isGoogleConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

/**
 * The exact redirect URI registered in the Google console. MUST be identical on
 * both legs (auth request + token exchange) or Google rejects it. Derived from
 * the incoming request so local dev and prod work without extra config; set
 * ROADMAP_OAUTH_REDIRECT_URI to override (e.g. behind an unusual proxy).
 */
export function getRedirectUri(request: Request): string {
  const explicit = process.env.ROADMAP_OAUTH_REDIRECT_URI;
  if (explicit) return explicit;
  const url = new URL(request.url);
  // Forwarded headers can be comma-separated lists (e.g. "https,https" behind
  // chained proxies) — take the first hop and trim, or Google sees a malformed
  // redirect_uri and rejects it with redirect_uri_mismatch.
  const first = (value: string | null) => value?.split(",")[0]?.trim() || undefined;
  const proto = first(request.headers.get("x-forwarded-proto")) ?? url.protocol.replace(":", "");
  const host =
    first(request.headers.get("x-forwarded-host")) ??
    first(request.headers.get("host")) ??
    url.host;
  return `${proto}://${host}/api/roadmap/auth/google/callback`;
}

/** Random, opaque CSRF state token. */
export function newState(): string {
  return crypto.randomBytes(16).toString("hex");
}

/** Constant-time compare of the returned state against the cookie value. */
export function stateMatches(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

/** Build the Google consent-screen URL. `hd` pre-selects the company workspace. */
export function buildAuthUrl(opts: { redirectUri: string; state: string }): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID ?? "",
    redirect_uri: opts.redirectUri,
    response_type: "code",
    scope: "openid email",
    state: opts.state,
    access_type: "online",
    prompt: "select_account",
    include_granted_scopes: "true",
  });
  // `hd` is only a UI hint (pre-selects the workspace) — NOT enforcement. The
  // real domain check happens on the verified email in the callback route.
  // With several allowed domains, "*" asks for any Workspace account instead
  // of hiding the ones on the other domain.
  const hd = ADMIN_EMAIL_DOMAINS.length > 1 ? "*" : ADMIN_EMAIL_DOMAINS[0];
  if (hd) params.set("hd", hd);
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

export type GoogleIdClaims = {
  email?: string;
  email_verified?: boolean | string;
  hd?: string;
};

/**
 * Exchange an authorization code for tokens and return the validated ID-token
 * claims (issuer/audience/expiry/email_verified checked), or null on any
 * failure. Domain authorisation is the caller's responsibility.
 */
export async function exchangeCodeForClaims(opts: {
  code: string;
  redirectUri: string;
}): Promise<GoogleIdClaims | null> {
  if (!CLIENT_ID || !CLIENT_SECRET) return null;

  let res: Response;
  try {
    res = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: opts.code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: opts.redirectUri,
        grant_type: "authorization_code",
      }),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  const data = (await res.json().catch(() => null)) as { id_token?: string } | null;
  if (!data?.id_token) return null;
  return decodeAndValidate(data.id_token);
}

function decodeAndValidate(idToken: string): GoogleIdClaims | null {
  const parts = idToken.split(".");
  if (parts.length !== 3) return null;

  let claims: GoogleIdClaims & { iss?: string; aud?: string; exp?: number };
  try {
    claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (!claims.iss || !VALID_ISSUERS.has(claims.iss)) return null;
  if (claims.aud !== CLIENT_ID) return null;
  if (typeof claims.exp !== "number" || Math.floor(Date.now() / 1000) > claims.exp) return null;
  if (claims.email_verified !== true && claims.email_verified !== "true") return null;

  return { email: claims.email, email_verified: claims.email_verified, hd: claims.hd };
}
