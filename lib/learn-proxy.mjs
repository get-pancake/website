/**
 * /learn is the one section of pancake.ai this repo does not render. Our
 * AI-search content partner, The Prompting Company (TPC), writes answer pages
 * for the questions people ask ChatGPT, Perplexity, Gemini and Claude, and
 * serves them from its own server. A reverse proxy (a Next rewrite, like
 * /record) shows them at pancake.ai/learn, so they live on our domain.
 * Requested by TPC on 2026-11-03, path agreed the same day.
 *
 * LEARN_UPSTREAM is the address pancake.ai/learn maps to, taken from TPC's
 * setup instructions. While it is null the proxy is off: no rewrite, and /learn
 * answers 404. Setting it switches the section on; setting it back to null
 * takes the whole section down (the rollback).
 *
 * The pages are TPC's, not this repo's: blog-lint and homepage-lint never see
 * them, and a fix goes to TPC. Never add an app/learn page or a public/learn
 * file: Next serves files and pages before rewrites, so one would silently
 * replace TPC's page at that address (url-guard fails the build if one exists).
 *
 * Plain .mjs, not .ts: next.config.mjs and the node:test suites import it as is.
 */

/** Where the section lives on pancake.ai. */
export const LEARN_PATH = "/learn";

/** TPC's upstream for /learn, e.g. "https://<host>/learn", or null while the proxy is off. */
export const LEARN_UPSTREAM = null;

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * The rewrites that serve /learn and every page under it from `upstream`, or
 * none when it is null. `upstream` is a base URL and may carry a path, so
 * either layout works: TPC serving the pages under /learn or at its root.
 * Next forwards the query string on its own.
 *
 * Throws on anything but https (http only on loopback, for a local test) with
 * no credentials, query or fragment, so a typo fails the build instead of
 * shipping a broken section. A trailing slash is dropped: "…/learn/" would
 * otherwise send "…/learn//page".
 *
 * @param {string | null} [upstream]
 * @returns {{ source: string, destination: string }[]}
 */
export function learnRewrites(upstream = LEARN_UPSTREAM) {
  if (upstream === null) return [];

  let url = null;
  try {
    url = new URL(upstream);
  } catch {
    // Reported below with the expected shape.
  }
  const secure =
    url?.protocol === "https:" || (url?.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname));
  if (!url || !secure || url.username || url.password || url.search || url.hash) {
    throw new Error(
      `LEARN_UPSTREAM must be an https URL with no query or fragment, like "https://pages.example.com/learn", got ${JSON.stringify(upstream)}`,
    );
  }

  const base = `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
  return [
    { source: LEARN_PATH, destination: base },
    { source: `${LEARN_PATH}/:path*`, destination: `${base}/:path*` },
  ];
}
