import { isProductionSiteHost } from "@/lib/site-config.mjs";

/**
 * The origin allow-list of the site's write routes: the CSRF check. A browser
 * on another site cannot make a visitor's browser write here; a script can
 * forge `Origin`, so it is not a bot guard (the honeypots and rate limits are).
 * Extracted from app/api/demo-request/route.ts (2026-10-13) when the roadmap
 * write routes became its second caller.
 */

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

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

/**
 * "production" for the website's hosts on both domains (getpancake.ai and pancake.ai, apex and www;
 * lib/site-config.mjs) and this deployment's Vercel hosts, "local" for localhost outside production,
 * null otherwise.
 */
export function approvedHost(hostname: string): "production" | "local" | null {
  const host = hostname.toLowerCase();
  if (isProductionSiteHost(host) || VERCEL_HOSTS.has(host)) return "production";
  if (process.env.NODE_ENV !== "production" && LOCAL_HOSTS.has(host)) return "local";
  return null;
}

/** True when the request's `Origin` is an approved host and is the host it was sent to. */
export function hasApprovedOrigin(request: Request) {
  const rawOrigin = request.headers.get("origin")?.trim();
  const rawHost = request.headers.get("host")?.trim().toLowerCase();
  if (!rawOrigin || !rawHost || rawHost.includes(",")) return false;

  try {
    const origin = new URL(rawOrigin);
    const kind = approvedHost(origin.hostname);

    return (
      kind !== null &&
      !origin.username &&
      !origin.password &&
      origin.host.toLowerCase() === rawHost &&
      (origin.protocol === "https:" || (kind === "local" && origin.protocol === "http:"))
    );
  } catch {
    return false;
  }
}
