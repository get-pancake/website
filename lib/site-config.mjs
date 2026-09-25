/**
 * The public origins of the website and of the services it links to, in one
 * place, so the move from getpancake.ai to pancake.ai (PAN-1318) is a Vercel
 * environment change instead of a code change.
 *
 * Each origin reads a NEXT_PUBLIC_* variable and falls back to today's
 * getpancake.ai host: with no variable set, every URL the site renders stays
 * what it was. Next inlines NEXT_PUBLIC_* values at BUILD time, and only for a
 * literal `process.env.NEXT_PUBLIC_…` read (never a computed key), so a new
 * value needs a redeploy. A malformed value fails the build instead of
 * shipping a broken link.
 *
 * Move SITE, APP and ANALYTICS_INGEST together: the attribution cookie is
 * shared only inside one registrable domain, and the ingest reads it from a
 * credentialed request. The PostHog and LeadJourney hosts are custom domains
 * each provider must register first; the squads host belongs to that service.
 *
 * Plain .mjs, not .ts: next.config.mjs and the node:test suites import it as is.
 */

/** Today's origins: what each origin is when its variable is unset. */
export const DEFAULT_ORIGINS = Object.freeze({
  site: "https://getpancake.ai",
  app: "https://app.getpancake.ai",
  analyticsIngest: "https://beta-api.getpancake.ai",
  posthog: "https://e.getpancake.ai",
  leadJourney: "https://t.getpancake.ai",
  squads: "https://squads.getpancake.ai",
});

/**
 * Pancake's two registrable domains, the current one first. The website
 * answers on both (apex and www) through the move, and staff email addresses
 * exist on both, so every host or email-domain check accepts both.
 */
export const PANCAKE_DOMAINS = Object.freeze(["getpancake.ai", "pancake.ai"]);

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * The origin in `value`, or `fallback` when the value is unset or blank.
 * Throws on anything but a bare https origin (http only on loopback, for dev)
 * whose hostname is plain letters, digits, dots and hyphens, so every origin
 * is safe to interpolate into the layout's inline scripts.
 *
 * @param {string | undefined} value
 * @param {string} name the variable name, for the error message
 * @param {string} fallback
 * @returns {string}
 */
function readOrigin(value, name, fallback) {
  const raw = value?.trim();
  if (!raw) return fallback;

  let url = null;
  try {
    url = new URL(raw);
  } catch {
    // Reported below with the variable name.
  }
  const secure =
    url?.protocol === "https:" || (url?.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname));
  const plainHost = url !== null && (/^[a-z0-9.-]+$/.test(url.hostname) || LOOPBACK_HOSTS.has(url.hostname));
  if (!url || !secure || !plainHost || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error(`${name} must be a bare https origin like ${fallback}, got ${JSON.stringify(raw)}`);
  }
  return url.origin;
}

/**
 * The website's origins for an environment. Pure, so the tests can drive it.
 *
 * @param {Record<string, string | undefined>} env
 */
export function resolveSiteConfig(env) {
  const siteOrigin = readOrigin(env.NEXT_PUBLIC_SITE_ORIGIN, "NEXT_PUBLIC_SITE_ORIGIN", DEFAULT_ORIGINS.site);
  const siteHost = new URL(siteOrigin).hostname;
  const productionHosts = [siteHost, ...PANCAKE_DOMAINS.flatMap((domain) => [domain, `www.${domain}`])];

  return Object.freeze({
    siteOrigin,
    siteHost,
    appOrigin: readOrigin(env.NEXT_PUBLIC_APP_ORIGIN, "NEXT_PUBLIC_APP_ORIGIN", DEFAULT_ORIGINS.app),
    analyticsIngestOrigin: readOrigin(
      env.NEXT_PUBLIC_ANALYTICS_INGEST_ORIGIN,
      "NEXT_PUBLIC_ANALYTICS_INGEST_ORIGIN",
      DEFAULT_ORIGINS.analyticsIngest,
    ),
    posthogOrigin: readOrigin(env.NEXT_PUBLIC_POSTHOG_ORIGIN, "NEXT_PUBLIC_POSTHOG_ORIGIN", DEFAULT_ORIGINS.posthog),
    leadJourneyOrigin: readOrigin(
      env.NEXT_PUBLIC_LEADJOURNEY_ORIGIN,
      "NEXT_PUBLIC_LEADJOURNEY_ORIGIN",
      DEFAULT_ORIGINS.leadJourney,
    ),
    squadsOrigin: readOrigin(env.NEXT_PUBLIC_SQUADS_ORIGIN, "NEXT_PUBLIC_SQUADS_ORIGIN", DEFAULT_ORIGINS.squads),
    productionHosts: Object.freeze(Array.from(new Set(productionHosts))),
  });
}

const config = resolveSiteConfig({
  // Literal reads: Next inlines only these exact expressions into browser bundles.
  NEXT_PUBLIC_SITE_ORIGIN: process.env.NEXT_PUBLIC_SITE_ORIGIN,
  NEXT_PUBLIC_APP_ORIGIN: process.env.NEXT_PUBLIC_APP_ORIGIN,
  NEXT_PUBLIC_ANALYTICS_INGEST_ORIGIN: process.env.NEXT_PUBLIC_ANALYTICS_INGEST_ORIGIN,
  NEXT_PUBLIC_POSTHOG_ORIGIN: process.env.NEXT_PUBLIC_POSTHOG_ORIGIN,
  NEXT_PUBLIC_LEADJOURNEY_ORIGIN: process.env.NEXT_PUBLIC_LEADJOURNEY_ORIGIN,
  NEXT_PUBLIC_SQUADS_ORIGIN: process.env.NEXT_PUBLIC_SQUADS_ORIGIN,
});

/** The website's canonical origin: metadataBase, canonical and Open Graph URLs, JSON-LD, sitemap, robots. */
export const SITE_ORIGIN = config.siteOrigin;
/** The website's canonical hostname, e.g. "getpancake.ai". */
export const SITE_HOST = config.siteHost;
/** The product app: every signup and sign-in link and redirect. */
export const APP_ORIGIN = config.appOrigin;
/** Pancake's API host that banks the attribution cookie's newest touch (a credentialed request). */
export const ANALYTICS_INGEST_ORIGIN = config.analyticsIngestOrigin;
/** PostHog's first-party proxy, a custom domain registered with PostHog. */
export const POSTHOG_ORIGIN = config.posthogOrigin;
/** LeadJourney's tracking domain, a custom domain registered with LeadJourney. */
export const LEADJOURNEY_ORIGIN = config.leadJourneyOrigin;
/** The Squads product, linked from the post-booking page. */
export const SQUADS_ORIGIN = config.squadsOrigin;
/** Every hostname the production website answers on: the canonical host plus both domains, apex and www. */
export const PRODUCTION_SITE_HOSTS = config.productionHosts;

/**
 * True when `hostname` is one the production website answers on. Exact match
 * only: app.pancake.ai or pancake.ai.example.com are not the website.
 *
 * @param {string} hostname
 * @returns {boolean}
 */
export function isProductionSiteHost(hostname) {
  return PRODUCTION_SITE_HOSTS.includes(hostname.trim().toLowerCase());
}

/**
 * Company email domains: the comma-separated `override` when it is set, else
 * both Pancake domains. A set but empty override allows no domain (fail closed).
 *
 * @param {string | undefined} override
 * @returns {readonly string[]}
 */
export function staffEmailDomains(override) {
  if (override === undefined) return PANCAKE_DOMAINS;
  return Object.freeze(
    override
      .split(",")
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean),
  );
}
