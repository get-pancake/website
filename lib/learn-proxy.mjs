/**
 * /learn is the one section of pancake.ai this repo does not render. Our
 * AI-search content partner, The Prompting Company (TPC), writes answer pages
 * for the questions people ask ChatGPT, Perplexity, Gemini and Claude, and
 * serves them from its own server. A reverse proxy (Next rewrites, like
 * /record) shows them at pancake.ai/learn, so they live on our domain.
 * Requested by TPC on 2026-11-03; path and upstream agreed the same day.
 *
 * LEARN_UPSTREAM is the address pancake.ai/learn maps to, from TPC's setup
 * instructions. Setting it back to null takes the whole section down (the
 * rollback): no rewrite, /learn answers 404, robots.txt drops TPC's sitemap.
 *
 * Per TPC's setup, the rewrites run before pages and files (beforeFiles in
 * next.config.mjs), the visitor's User-Agent and Accept headers reach TPC
 * unchanged (it counts AI visits by User-Agent and answers
 * "Accept: text/markdown" with markdown), and nothing here caches the pages
 * (TPC answers Cache-Control: no-store).
 *
 * The pages are TPC's, not this repo's: blog-lint and homepage-lint never see
 * them, and a fix goes to TPC. Never add an app/learn page or a public/learn
 * file: the proxy answers first, so it would never be served (url-guard fails
 * the build if one exists).
 *
 * Plain .mjs, not .ts: next.config.mjs, app/robots.ts and the node:test suites
 * import it as is.
 */

/** Where the section lives on pancake.ai. */
export const LEARN_PATH = "/learn";

/** TPC's upstream for /learn, or null to take the section down. */
export const LEARN_UPSTREAM = "https://pancake.shadowdocument.com/learn";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * The rewrites that serve /learn and every page under it from `upstream`, or
 * none when it is null. `upstream` is a base URL and may carry a path, so
 * either layout works: TPC serving the pages under /learn or at its root.
 * Next forwards the query string on its own. When the pages sit under a path,
 * "/learn.md" maps too: TPC's /learn page advertises it (Link header) as its
 * markdown version, and it is not under /learn/.
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

  const path = url.pathname.replace(/\/+$/, "");
  const base = `${url.origin}${path}`;
  return [
    { source: LEARN_PATH, destination: base },
    ...(path ? [{ source: `${LEARN_PATH}.md`, destination: `${base}.md` }] : []),
    { source: `${LEARN_PATH}/:path*`, destination: `${base}/:path*` },
  ];
}

/**
 * The /learn sitemaps robots.txt lists, beside our own: TPC's, through the
 * proxy, while the section is on (TPC's setup asks for it); none while it is off.
 *
 * @param {string} siteOrigin e.g. "https://pancake.ai"
 * @param {string | null} [upstream]
 * @returns {string[]}
 */
export function learnSitemaps(siteOrigin, upstream = LEARN_UPSTREAM) {
  return upstream === null ? [] : [`${siteOrigin}${LEARN_PATH}/sitemap.xml`];
}
