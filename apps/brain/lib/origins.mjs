/**
 * The Brain page's public origins, in one place, so the move from
 * getpancake.ai to pancake.ai (PAN-1318) is an environment change on the
 * pancake-brain Vercel project instead of a code change.
 *
 * Each origin reads a NEXT_PUBLIC_* variable and falls back to today's
 * getpancake.ai host: with no variable set, the page is unchanged. Next inlines
 * NEXT_PUBLIC_* values at BUILD time, and only for a literal
 * `process.env.NEXT_PUBLIC_…` read, so a new value needs a redeploy. The same
 * names as the main website's lib/site-config.mjs.
 *
 * BRAIN and APP must stay on one registrable domain: sign-up sends
 * credentialed requests from the page to the app, and the session and
 * attribution cookies are shared only inside one site. A build whose two
 * origins disagree fails instead of shipping a sign-up that cannot work.
 *
 * Plain .mjs, not .ts: the node:test suites import it through lib/auth.ts.
 */

/** Today's origins: what each origin is when its variable is unset. */
export const DEFAULT_ORIGINS = Object.freeze({
  brain: "https://brain.getpancake.ai",
  app: "https://app.getpancake.ai",
  site: "https://getpancake.ai",
});

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * The origin in `value`, or `fallback` when the value is unset or blank.
 * Throws on anything but a bare https origin (http only on loopback, for dev)
 * whose hostname is plain letters, digits, dots and hyphens, so every origin
 * is safe to interpolate into the page's inline scripts.
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
 * The site a host belongs to: its last two labels (brain.pancake.ai → pancake.ai).
 * Enough for Pancake's .ai hosts and for localhost; not a public-suffix lookup.
 *
 * @param {string} origin
 * @returns {string}
 */
function siteOf(origin) {
  return new URL(origin).hostname.split(".").slice(-2).join(".");
}

/**
 * The Brain page's origins for an environment. Pure, so the tests can drive it.
 *
 * @param {Record<string, string | undefined>} env
 */
export function resolveBrainOrigins(env) {
  const brainOrigin = readOrigin(env.NEXT_PUBLIC_BRAIN_ORIGIN, "NEXT_PUBLIC_BRAIN_ORIGIN", DEFAULT_ORIGINS.brain);
  const appOrigin = readOrigin(env.NEXT_PUBLIC_APP_ORIGIN, "NEXT_PUBLIC_APP_ORIGIN", DEFAULT_ORIGINS.app);
  if (siteOf(brainOrigin) !== siteOf(appOrigin)) {
    throw new Error(
      `NEXT_PUBLIC_BRAIN_ORIGIN (${brainOrigin}) and NEXT_PUBLIC_APP_ORIGIN (${appOrigin}) must share one ` +
        "registrable domain: sign-up relies on cookies shared between the two. Move them together.",
    );
  }
  return Object.freeze({
    brainOrigin,
    brainHost: new URL(brainOrigin).hostname,
    appOrigin,
    siteOrigin: readOrigin(env.NEXT_PUBLIC_SITE_ORIGIN, "NEXT_PUBLIC_SITE_ORIGIN", DEFAULT_ORIGINS.site),
  });
}

const origins = resolveBrainOrigins({
  // Literal reads: Next inlines only these exact expressions into browser bundles.
  NEXT_PUBLIC_BRAIN_ORIGIN: process.env.NEXT_PUBLIC_BRAIN_ORIGIN,
  NEXT_PUBLIC_APP_ORIGIN: process.env.NEXT_PUBLIC_APP_ORIGIN,
  NEXT_PUBLIC_SITE_ORIGIN: process.env.NEXT_PUBLIC_SITE_ORIGIN,
});

/** The Brain page's canonical origin: metadata, the only origin where production sign-up and tags run. */
export const BRAIN_ORIGIN = origins.brainOrigin;
/** The Brain page's canonical hostname, e.g. "brain.getpancake.ai". */
export const BRAIN_HOST = origins.brainHost;
/** The product app: the auth API the page calls with credentials, and where sign-up lands. */
export const APP_ORIGIN = origins.appOrigin;
/** The main website: the footer's Privacy and Terms links. */
export const SITE_ORIGIN = origins.siteOrigin;
