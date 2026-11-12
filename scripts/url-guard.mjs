#!/usr/bin/env node
/**
 * URL guard: no known public URL may start answering 404.
 *
 * Founder rule (2026-09-24): if a page is removed or its URL changes, it
 * ships with a 301 to the closest live page. Several of the blog's best
 * pages rank on their exact URL (e.g. /blog/viktor-alternatives), and a 404
 * throws that ranking away.
 *
 * Every path in scripts/known-urls.txt must still resolve to something this
 * repo serves (app page, blog post, /for vertical, route handler, metadata
 * file, file in public/) or be the `source` of a redirect in next.config.mjs
 * whose destination resolves too. Every redirect is checked the same way,
 * listed or not: one that points at a page that is gone is a 404 with an extra
 * hop. A path that next.config.mjs rewrites to another host (/record, /learn),
 * or that middleware.ts forwards to Google (the Google tag gateway path,
 * lib/analytics/google-tag-gateway.mjs), must have no page or public file in
 * this repo: the two would fight for the address, and one of them would
 * silently never be served. Runs before every build (package.json "prebuild").
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { GOOGLE_TAG_GATEWAY_PATH } from "../lib/analytics/google-tag-gateway.mjs";

const ROOT = process.cwd();
const known = fs
  .readFileSync(path.join(ROOT, "scripts/known-urls.txt"), "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"));

const { default: nextConfig } = await import(pathToFileURL(path.join(ROOT, "next.config.mjs")).href);
const redirects = new Map(
  (typeof nextConfig.redirects === "function" ? await nextConfig.redirects() : []).map((r) => [r.source, r.destination]),
);

const exists = (...p) => fs.existsSync(path.join(ROOT, ...p));
/** A file, not a folder: public/blog/ is a folder and /blog is a page. */
const isFile = (...p) => fs.statSync(path.join(ROOT, ...p), { throwIfNoEntry: false })?.isFile() ?? false;

/** Next's metadata files in app/: the address each one answers on. */
const METADATA_FILES = {
  "/sitemap.xml": "app/sitemap.ts",
  "/robots.txt": "app/robots.ts",
  "/icon.png": "app/icon.png",
};
const MAX_HOPS = 5;

/**
 * Whether a redirect's destination answers. Another host is taken on trust (the guard reads
 * this repo, it fetches nothing), and so is a destination built from the source's parameters
 * (`:slug`). An internal one goes back through resolves(), without its query or fragment.
 */
function lands(destination, hops) {
  if (!destination.startsWith("/") || destination.includes(":")) return true;
  return Boolean(resolves(destination.split(/[?#]/)[0] || "/", hops + 1));
}

/** What answers `url` in this repo, or a falsy value. */
function resolves(url, hops = 0) {
  if (redirects.has(url)) return hops < MAX_HOPS && lands(redirects.get(url), hops) && "redirect";
  if (url === "/") return exists("app/page.tsx") && "page";
  if (METADATA_FILES[url]) return exists(METADATA_FILES[url]) && "metadata file";
  // public/ before the blog pattern: /blog/rss.xml is a route handler, not a post
  if (isFile("public", url)) return "public file";
  if (exists("app", url, "route.ts")) return "route handler";
  const blog = url.match(/^\/blog\/([^/]+)$/);
  if (blog) return exists("content/blog", `${blog[1]}.mdx`) && "post";
  const vertical = url.match(/^\/for\/([^/]+)$/);
  if (vertical) return exists("lib/verticals/data", `${vertical[1]}.ts`) && "vertical";
  return (exists("app", url, "page.tsx") || exists("app", url, "page.ts")) && "page";
}

const deadRedirects = [...redirects].filter(([, destination]) => !lands(destination, 0));
for (const [source, destination] of deadRedirects) {
  console.log(`ERROR  ${source} redirects to ${destination}, which is not a live page — point it at the closest one in next.config.mjs`);
}
const missing = known.filter((u) => !redirects.has(u) && !resolves(u));
for (const u of missing) {
  console.log(`ERROR  ${u} no longer exists and has no redirect — add a 301 in next.config.mjs (statusCode: 301) to the closest live page`);
}
// Paths rewritten to another host, by their static prefix: "/learn/:path*" → "/learn".
const rewriteConfig = typeof nextConfig.rewrites === "function" ? await nextConfig.rewrites() : [];
const rewriteRules = Array.isArray(rewriteConfig)
  ? rewriteConfig
  : [...(rewriteConfig.beforeFiles ?? []), ...(rewriteConfig.afterFiles ?? []), ...(rewriteConfig.fallback ?? [])];
const proxiedPaths = [
  ...new Set([
    ...rewriteRules.filter((r) => /^https?:\/\//.test(r.destination)).map((r) => r.source.split("/:")[0] || "/"),
    // middleware.ts forwards it to Google's gateway endpoint.
    GOOGLE_TAG_GATEWAY_PATH,
  ]),
];
const shadowed = proxiedPaths.filter((p) => p !== "/" && (exists("app", p) || exists("public", p)));
for (const p of shadowed) {
  console.log(`ERROR  ${p} is proxied to another host (next.config.mjs rewrites or middleware.ts), but app${p} or public${p} exists too, and one of them would never be served — remove the page or file, or the proxy`);
}
const dead = missing.length + deadRedirects.length + shadowed.length;
console.log(
  `url-guard: ${known.length} known URL(s), ${redirects.size} redirect(s), ${missing.length} would 404, ${deadRedirects.length} redirect(s) to a missing page, ${proxiedPaths.length} proxied path(s), ${shadowed.length} shadowed`,
);
process.exit(dead ? 1 : 0);
