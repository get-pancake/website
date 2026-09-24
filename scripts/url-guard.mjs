#!/usr/bin/env node
/**
 * URL guard: no known public URL may start answering 404.
 *
 * Founder rule (2026-09-24): if a page is removed or its URL changes, it
 * ships with a 301 to the closest live page. Several of the blog's best
 * pages rank on their exact URL (e.g. /blog/viktor-alternatives), and a 404
 * throws that ranking away.
 *
 * Every path in scripts/known-urls.txt must still resolve to a route in this
 * repo (app page, blog post, /for vertical) or be the `source` of a redirect
 * in next.config.mjs. Runs before every build (package.json "prebuild").
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const known = fs
  .readFileSync(path.join(ROOT, "scripts/known-urls.txt"), "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"));

const { default: nextConfig } = await import(pathToFileURL(path.join(ROOT, "next.config.mjs")).href);
const redirectSources = new Set(
  (typeof nextConfig.redirects === "function" ? await nextConfig.redirects() : []).map((r) => r.source),
);

const exists = (...p) => fs.existsSync(path.join(ROOT, ...p));

function resolves(url) {
  if (redirectSources.has(url)) return "redirect";
  if (url === "/") return exists("app/page.tsx") && "page";
  const blog = url.match(/^\/blog\/([^/]+)$/);
  if (blog) return exists("content/blog", `${blog[1]}.mdx`) && "post";
  const vertical = url.match(/^\/for\/([^/]+)$/);
  if (vertical) return exists("lib/verticals/data", `${vertical[1]}.ts`) && "vertical";
  return (exists("app", url, "page.tsx") || exists("app", url, "page.ts")) && "page";
}

const missing = known.filter((u) => !resolves(u));
for (const u of missing) {
  console.log(`ERROR  ${u} no longer exists and has no redirect — add a 301 in next.config.mjs (statusCode: 301) to the closest live page`);
}
console.log(`url-guard: ${known.length} known URL(s), ${missing.length} would 404`);
process.exit(missing.length ? 1 : 0);
