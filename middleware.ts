import { NextResponse, type NextRequest } from "next/server";

import { GOOGLE_TAG_MANAGER_ID } from "@/lib/analytics/vendor-config";
import { googleTagGatewayRequestHeaders, googleTagGatewayUpstream } from "@/lib/analytics/google-tag-gateway.mjs";

/**
 * Google tag gateway: pancake.ai/pk7x is the Tag Manager container's first-party address,
 * forwarded to Google's gateway endpoint with the visitor's location
 * (lib/analytics/google-tag-gateway.mjs). Runs on that path only.
 */
export function middleware(request: NextRequest) {
  const upstream = googleTagGatewayUpstream(GOOGLE_TAG_MANAGER_ID, request.nextUrl.pathname, request.nextUrl.search);
  if (upstream === null) return NextResponse.next();
  return NextResponse.rewrite(upstream, {
    request: { headers: googleTagGatewayRequestHeaders(GOOGLE_TAG_MANAGER_ID, request.headers) },
  });
}

// GOOGLE_TAG_GATEWAY_PATH, repeated: Next reads the matcher at build time and needs literals
// (scripts/google-tag-gateway.test.mjs checks they agree).
export const config = {
  matcher: ["/pk7x", "/pk7x/:path*"],
};
