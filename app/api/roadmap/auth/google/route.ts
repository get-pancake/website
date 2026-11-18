import { NextResponse } from "next/server";

import { isAdminAuthConfigured } from "@/lib/auth/admin";
import {
  GOOGLE_STATE_COOKIE,
  STATE_TTL_SECONDS,
  buildAuthUrl,
  getRedirectUri,
  newState,
} from "@/lib/auth/google";

export const runtime = "nodejs";

const secure = process.env.NODE_ENV === "production";

/**
 * Start Google admin sign-in. Mints a CSRF `state`, stashes it in a short-lived
 * HttpOnly cookie, and redirects to Google's consent screen. The callback
 * verifies the state and the returned email's domain before granting admin.
 */
export async function GET(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.redirect(new URL("/open-roadmap/admin?error=unconfigured", request.url));
  }

  const state = newState();
  const authUrl = buildAuthUrl({ redirectUri: getRedirectUri(request), state });

  const res = NextResponse.redirect(authUrl);
  res.cookies.set("admin_return", new URL(request.url).searchParams.get("returnTo") === "demo-review" ? "demo-review" : "roadmap", { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: STATE_TTL_SECONDS });
  res.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    secure,
    sameSite: "lax", // survives the top-level GET redirect back from Google
    path: "/",
    maxAge: STATE_TTL_SECONDS,
  });
  return res;
}
