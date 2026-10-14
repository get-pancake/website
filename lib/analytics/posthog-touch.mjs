/**
 * What one page load means for the first-touch and latest-touch properties the
 * website keeps in PostHog (`pancake_initial_*` and `pancake_latest_*`).
 *
 * Most links on the site are plain anchors, so PostHogAttribution starts again
 * on most pages of a visit. A load is a NEW TOUCH only when its address carries
 * a campaign or click identifier, or when the visitor arrives from outside Pancake.
 * Any other load (the second page of a visit, a direct return) leaves the
 * stored latest touch alone, nulls nothing on the person and sends no
 * `marketing_landing_viewed`.
 *
 * The first touch is written once, whole: once a first landing URL is stored, a
 * later campaign cannot fill the keys the first visit left empty.
 *
 * Pure, so the tests can drive it. Plain .mjs, not .ts: the node:test suite
 * imports it as is, like lib/site-config.mjs.
 */

import { PANCAKE_DOMAINS } from "../site-config.mjs";

/** The campaign and click identifiers kept from a page address. */
export const ATTRIBUTION_KEYS = Object.freeze([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "fbclid",
  "gclid",
  "gbraid",
  "wbraid",
  "li_fat_id",
  "msclkid",
  "rdt_cid",
  "ttclid",
  "twclid",
]);

/** Every key of a stored touch: the identifiers, the landing address and the referrer. */
export const TOUCH_KEYS = Object.freeze([...ATTRIBUTION_KEYS, "landing_url", "referrer"]);

export const INITIAL_TOUCH_PREFIX = "pancake_initial_";
export const LATEST_TOUCH_PREFIX = "pancake_latest_";

/**
 * The allow-listed identifiers of a query string, each cut at 500 characters.
 *
 * @param {string} search
 * @returns {Record<string, string>}
 */
export function readAttribution(search) {
  const params = new URLSearchParams(search);
  /** @type {Record<string, string>} */
  const attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key);
    if (value) attribution[key] = value.slice(0, 500);
  }
  return attribution;
}

/**
 * `value` without its hash and without any query parameter that is not an
 * attribution key. Empty when `value` is not a URL.
 *
 * @param {string} value
 * @returns {string}
 */
export function cleanLandingUrl(value) {
  try {
    const sourceUrl = new URL(value);
    const cleanUrl = new URL(sourceUrl.toString());
    cleanUrl.search = "";
    cleanUrl.hash = "";

    for (const [key, parameterValue] of Array.from(sourceUrl.searchParams.entries())) {
      if (ATTRIBUTION_KEYS.includes(key)) {
        cleanUrl.searchParams.append(key, parameterValue.slice(0, 500));
      }
    }

    return cleanUrl.toString();
  } catch {
    return "";
  }
}

/**
 * The origin of an http(s) referrer, with a trailing slash. Empty for anything else.
 *
 * @param {string} value
 * @returns {string}
 */
export function cleanReferrer(value) {
  try {
    const referrer = new URL(value);
    if (referrer.protocol !== "https:" && referrer.protocol !== "http:") return "";
    return `${referrer.protocol}//${referrer.host}/`;
  } catch {
    return "";
  }
}

/**
 * True when the visitor arrives from somewhere that is not Pancake: `referrer`
 * has a host, and that host is neither the page's own nor on one of Pancake's
 * domains (apex, www. and every other subdomain, such as app. and brain.).
 * An empty or malformed referrer is not an arrival from elsewhere.
 *
 * @param {string} referrer `document.referrer`
 * @param {string} pageHostname the hostname of the page being loaded
 * @returns {boolean}
 */
export function isExternalReferrer(referrer, pageHostname) {
  let host = "";
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return false;
  }
  if (!host || host === pageHostname.toLowerCase()) return false;
  return !PANCAKE_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

/**
 * @typedef {object} PostHogTouch
 * @property {boolean} isNewTouch
 *   The address carries a campaign or click identifier, or the referrer is outside Pancake.
 * @property {Record<string, string> | null} initial
 *   The `pancake_initial_*` super properties to register once. Null when a first touch is already stored.
 * @property {Record<string, string> | null} latest
 *   The `pancake_latest_*` super properties that replace the stored ones. Null to leave them alone.
 * @property {{ set: Record<string, string | null>, setOnce: Record<string, string> }} person
 *   The person properties to set: the latest touch when it is replaced, the first touch once.
 * @property {Record<string, string> | null} landingEvent
 *   The properties of `marketing_landing_viewed`. Null when the event must not be sent.
 */

/**
 * What PostHogAttribution writes for one page load.
 *
 * @param {object} load
 * @param {string} load.url the page's address (`window.location.href`)
 * @param {string} load.referrer `document.referrer`
 * @param {Record<string, unknown>} load.stored the super properties PostHog already holds for this browser
 * @returns {PostHogTouch}
 */
export function resolvePostHogTouch({ url, referrer, stored }) {
  let page;
  try {
    page = new URL(url);
  } catch {
    return { isNewTouch: false, initial: null, latest: null, person: { set: {}, setOnce: {} }, landingEvent: null };
  }

  const attribution = readAttribution(page.search);
  const fromElsewhere = isExternalReferrer(referrer, page.hostname);
  const isNewTouch = Object.keys(attribution).length > 0 || fromElsewhere;

  /** @type {Record<string, string>} */
  const touch = { ...attribution, landing_url: cleanLandingUrl(url) };
  // One of the site's own pages is never where the visitor came from.
  const origin = fromElsewhere ? cleanReferrer(referrer) : "";
  if (origin) touch.referrer = origin;

  const storedInitial = readStoredTouch(stored, INITIAL_TOUCH_PREFIX);
  const hasInitial = Boolean(storedInitial[`${INITIAL_TOUCH_PREFIX}landing_url`]);
  const hasLatest = Boolean(readStoredTouch(stored, LATEST_TOUCH_PREFIX)[`${LATEST_TOUCH_PREFIX}landing_url`]);

  // A browser PostHog has never seen stores its first load as both touches, a direct visit included.
  const initial = hasInitial ? null : prefixKeys(INITIAL_TOUCH_PREFIX, touch);
  const latest = isNewTouch || !hasLatest ? prefixKeys(LATEST_TOUCH_PREFIX, touch) : null;

  return {
    isNewTouch,
    initial,
    latest,
    person: {
      // Nulls first: the person's latest touch is replaced whole, never merged with the previous one.
      set: latest ? { ...emptyTouch(LATEST_TOUCH_PREFIX), ...latest } : {},
      // The first touch as this browser stored it, never this touch's values under an older landing URL.
      setOnce: initial ?? storedInitial,
    },
    landingEvent: isNewTouch ? { $current_url: touch.landing_url, ...touch } : null,
  };
}

/**
 * @param {string} prefix
 * @param {Record<string, string>} values
 * @returns {Record<string, string>}
 */
function prefixKeys(prefix, values) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [`${prefix}${key}`, value]));
}

/**
 * @param {string} prefix
 * @returns {Record<string, null>}
 */
function emptyTouch(prefix) {
  return Object.fromEntries(TOUCH_KEYS.map((key) => [`${prefix}${key}`, null]));
}

/**
 * The touch stored under `prefix`: its non-empty string values, nothing else.
 *
 * @param {Record<string, unknown>} stored
 * @param {string} prefix
 * @returns {Record<string, string>}
 */
function readStoredTouch(stored, prefix) {
  /** @type {Record<string, string>} */
  const touch = {};
  for (const key of TOUCH_KEYS) {
    const value = stored[`${prefix}${key}`];
    if (typeof value === "string" && value) touch[`${prefix}${key}`] = value;
  }
  return touch;
}
