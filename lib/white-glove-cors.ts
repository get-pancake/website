import { hasApprovedOrigin } from "@/lib/request-origin";
import { WG_PAGE_URL } from "@/lib/white-glove-demo";

/**
 * Cross-origin access to the /white-glove form routes (app/api/white-glove/*).
 *
 * The White Glove campaign's landing page lives on brain.pancake.ai, a
 * separate Vercel app (pancake-brain, apps/brain on its own branch), so that
 * paid traffic lands on a page with no way out but the form (campaign ask,
 * 2026-11-06). That page posts to these routes from another origin. Only the
 * Brain page's own origins are let in: its canonical hosts, its Vercel
 * previews, and localhost outside production. Every other cross-origin
 * request is still refused by the routes' same-origin check.
 *
 * The page sends its JSON as text/plain, a CORS "simple" request: no
 * preflight, so the keepalive booking report works in every browser. The
 * OPTIONS answer is there for any client that does preflight.
 */

const BRAIN_ORIGINS: ReadonlySet<string> = new Set(["https://brain.pancake.ai", "https://brain.getpancake.ai"]);
/** pancake-brain's Vercel deployments: pancake-brain-<hash or git-branch>-getpancake.vercel.app */
const BRAIN_PREVIEW_RE = /^https:\/\/pancake-brain-[a-z0-9-]{1,80}-getpancake\.vercel\.app$/;
const LOCAL_RE = /^http:\/\/(localhost|127\.0\.0\.1):\d{2,5}$/;

/** The page the Brain app serves the form on, for the CRM notes. */
export const WG_BRAIN_PAGE_URL = "https://brain.pancake.ai/white-glove";

/** The request's Origin when it is the Brain page's, else null. */
export function wgBrainOrigin(request: Request): string | null {
  const origin = request.headers.get("origin")?.trim();
  if (!origin) return null;
  if (BRAIN_ORIGINS.has(origin) || BRAIN_PREVIEW_RE.test(origin)) return origin;
  if (process.env.NODE_ENV !== "production" && LOCAL_RE.test(origin)) return origin;
  return null;
}

/**
 * Who is calling: the site itself (same origin, checked first, so a local
 * pancake.ai never reads as the Brain page), the Brain page, or nobody allowed.
 */
export function wgCaller(request: Request): { allowed: boolean; brainOrigin: string | null } {
  if (hasApprovedOrigin(request)) return { allowed: true, brainOrigin: null };
  const brainOrigin = wgBrainOrigin(request);
  return { allowed: brainOrigin !== null, brainOrigin };
}

/** Headers that let the Brain page read the answer; none for anyone else. */
export function wgCorsHeaders(brainOrigin: string | null): Record<string, string> {
  return brainOrigin ? { "Access-Control-Allow-Origin": brainOrigin, Vary: "Origin" } : {};
}

/** The preflight answer: allowed for the Brain page only. */
export function wgPreflight(request: Request): Response {
  const origin = wgBrainOrigin(request);
  if (!origin) return new Response(null, { status: 403 });
  return new Response(null, {
    status: 204,
    headers: {
      ...wgCorsHeaders(origin),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Max-Age": "600",
    },
  });
}

/** Where the visitor filled the form: the Brain page or pancake.ai/white-glove. */
export function wgPageUrlFor(brainOrigin: string | null): string {
  return brainOrigin ? WG_BRAIN_PAGE_URL : WG_PAGE_URL;
}
