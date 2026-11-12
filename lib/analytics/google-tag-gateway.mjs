/**
 * Google tag gateway for advertisers (2026-11-12, Tristan: "Do it" on Google Ads'
 * "Maximisez vos signaux de données avec Google tag gateway" email).
 *
 * The Tag Manager container (GTM-P3Z79WKD, and everything it loads: GA4, Google Ads,
 * X, Reddit) loads from pancake.ai/pk7x instead of www.googletagmanager.com, and the
 * Google requests it makes there stay on our domain too. middleware.ts forwards that
 * path to Google's gateway endpoint for the container, as Google's self-service setup
 * for "Other" CDNs asks: same path, Host = the endpoint, every cookie and query string
 * kept, and the visitor's country and region in X-Forwarded-Country / X-Forwarded-Region
 * (https://developers.google.com/tag-platform/tag-manager/gateway/setup-guide?setup=manual).
 * GA4 still sends its data to the server container at gtm.pancake.ai (the container's
 * server_container_url): Google's supported layout for a site that already has
 * server-side tagging is the script path on the site's own domain and the tagging
 * server on a subdomain (.../gateway/sgtm-and-cdn).
 *
 * Path rules (Google): unused on the site, not "/", at most 100 characters, and never
 * containing "/gtm" next to a server container. A random name is the least likely to
 * collide with a page or with a blocklist. Never add a page or a public file under it:
 * the middleware answers first (scripts/url-guard.mjs fails the build if one appears).
 *
 * Vercel redirects "/pk7x/" to "/pk7x" (308) before the middleware runs, but Google's
 * endpoint only serves the container on "/pk7x/" (404 without the slash, checked
 * 2026-11-12). So the page asks for "/pk7x?id=…" (no redirect) and the forward puts the
 * slash back.
 *
 * Checks: https://pancake.ai/pk7x/healthy reads "ok"; https://pancake.ai/pk7x?validate_geo=healthy
 * reads "ok" when the country reached Google. Rollback: point the loader back at
 * www.googletagmanager.com (tagManagerSourceJs) and delete middleware.ts.
 *
 * Plain .mjs: middleware.ts, app/layout.tsx, lib/analytics/partner-tags.mjs,
 * scripts/url-guard.mjs and the node:test suites import it as is.
 */

/** Where the container loads from on pancake.ai. middleware.ts's matcher repeats it (Next needs a literal). */
export const GOOGLE_TAG_GATEWAY_PATH = "/pk7x";

/** Google's own address for the container, used only when the gateway path fails to load. */
export const GOOGLE_TAG_MANAGER_FALLBACK_URL = "https://www.googletagmanager.com/gtm.js?id=";

const TAG_ID = /^(GTM|G|GT|AW|DC)-[A-Z0-9]+$/;
const COUNTRY = /^[A-Z]{2}$/;
const REGION = /^[A-Z0-9]{1,3}$/;
const COORDINATE = /^-?\d{1,3}(\.\d+)?$/;

/**
 * Google's gateway endpoint for one tag or container: "gtm-p3z79wkd.fps.goog".
 *
 * @param {string} tagId
 * @returns {string}
 */
export function googleTagGatewayHost(tagId) {
  if (!TAG_ID.test(tagId)) {
    throw new Error(`A Google tag or container id like GTM-ABC123 is required, got ${JSON.stringify(tagId)}`);
  }
  return `${tagId.toLowerCase()}.fps.goog`;
}

/**
 * The Google URL a request to the gateway path is forwarded to (path and query kept, the
 * bare path given back its trailing slash), or null for any other path.
 *
 * @param {string} tagId
 * @param {string} pathname
 * @param {string} search "" or "?…"
 * @returns {string | null}
 */
export function googleTagGatewayUpstream(tagId, pathname, search) {
  const base = `https://${googleTagGatewayHost(tagId)}`;
  if (pathname === GOOGLE_TAG_GATEWAY_PATH) return `${base}${GOOGLE_TAG_GATEWAY_PATH}/${search}`;
  if (pathname.startsWith(`${GOOGLE_TAG_GATEWAY_PATH}/`)) return `${base}${pathname}${search}`;
  return null;
}

/** "S%C3%A3o%20Paulo" → "Sao Paulo": ASCII only, as Google Cloud's own {client_city} sends it. */
function asciiCity(raw) {
  if (!raw) return "";
  let city = raw;
  try {
    city = decodeURIComponent(raw);
  } catch {
    // Keep the raw value; the filter below drops what is not plain text.
  }
  return city
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^A-Za-z0-9 .'-]/g, "")
    .trim()
    .slice(0, 80);
}

/**
 * The headers of the forwarded request: the visitor's own (cookies, user agent, language,
 * referrer: Google asks for every cookie) minus Vercel's internal ones, the Host Google's
 * endpoint answers on, the visitor's IP, and the visitor's location from Vercel's
 * x-vercel-ip-* headers in the names Google reads. A header Vercel did not send is left out.
 *
 * @param {string} tagId
 * @param {Headers} incoming
 * @returns {Headers}
 */
export function googleTagGatewayRequestHeaders(tagId, incoming) {
  const headers = new Headers();
  for (const [name, value] of incoming) {
    if (!name.startsWith("x-vercel-") && !name.startsWith("x-middleware-")) headers.set(name, value);
  }
  headers.set("host", googleTagGatewayHost(tagId));

  const ip = incoming.get("x-real-ip")?.trim() || incoming.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (ip) headers.set("x-forwarded-for", ip);

  const country = incoming.get("x-vercel-ip-country")?.trim().toUpperCase() ?? "";
  const region = incoming.get("x-vercel-ip-country-region")?.trim().toUpperCase() ?? "";
  if (COUNTRY.test(country)) {
    headers.set("x-forwarded-country", country);
    if (REGION.test(region)) headers.set("x-forwarded-region", region);
  }

  const latitude = incoming.get("x-vercel-ip-latitude")?.trim() ?? "";
  const longitude = incoming.get("x-vercel-ip-longitude")?.trim() ?? "";
  if (COORDINATE.test(latitude) && COORDINATE.test(longitude)) {
    const city = asciiCity(incoming.get("x-vercel-ip-city"));
    headers.set("x-forwarded-geolocation", `latlong=${latitude},${longitude}${city ? `;city=${city}` : ""}`);
  }
  return headers;
}

/**
 * The statements of the standard Tag Manager bootstrap that point its script element `j`
 * at the container: the gateway path first, and Google's own URL if that request fails
 * (a gateway outage then costs nothing but the first-party benefit). They run inside
 * `(function(w,d,s,l,i){…})`, after `f`, `j` and `dl` are set, like the line they replace.
 *
 * @returns {string}
 */
export function tagManagerSourceJs() {
  const gateway = JSON.stringify(`${GOOGLE_TAG_GATEWAY_PATH}?id=`);
  const fallback = JSON.stringify(GOOGLE_TAG_MANAGER_FALLBACK_URL);
  return `j.src=${gateway}+i+dl;j.onerror=function(){var k=d.createElement(s);k.async=true;k.src=${fallback}+i+dl;f.parentNode.insertBefore(k,f);};`;
}
