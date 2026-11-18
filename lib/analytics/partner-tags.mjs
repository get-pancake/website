/**
 * /pancake-tags.js: the site's own tags, for pages that pancake.ai serves from
 * a partner's server (today /learn, see lib/learn-proxy.mjs). The partner adds
 * two lines to the <head> of every page, and everything else stays in this repo:
 *
 *   <script src="/pancake-attribution.min.js"></script>
 *   <script src="/pancake-tags.js"></script>
 *
 * The script does what app/layout.tsx does on our own pages, in the same order:
 * it banks the attribution cookie's newest touch, loads Google Tag Manager, and
 * sends the vendor-neutral page_view of components/analytics/AnalyticsEvents.tsx.
 * The container needs that event: its GA4 config sends no page view of its own,
 * and the X tag only fires on an event_id shaped "page_view.<id>". Like the
 * site's tags, it does nothing off the production hosts, so the partner's own
 * domain and Vercel previews stay out of the data. The partner's pages are
 * marked source "partner_page", so reports can tell them from ours.
 *
 * Plain .mjs: app/pancake-tags.js/route.ts and the node:test suites import it.
 */

import { tagManagerSourceJs } from "./google-tag-gateway.mjs";

/**
 * The script's source, built from the same values app/layout.tsx uses.
 *
 * @param {{
 *   hosts: readonly string[],
 *   ingestOrigin: string,
 *   gtmId: string,
 *   queryKeys: Iterable<string>,
 *   emptyFields: Record<string, null>,
 * }} config
 * @returns {string}
 */
export function partnerTagsScript({ hosts, ingestOrigin, gtmId, queryKeys, emptyFields }) {
  const literal = (value) => JSON.stringify(value);
  return `/* Pancake tags for partner pages on pancake.ai (get-pancake/website: lib/analytics/partner-tags.mjs). */
(function () {
  var hosts = ${literal([...hosts])};
  if (hosts.indexOf(window.location.hostname.toLowerCase()) < 0) return;

  function readAttribution() {
    var name = "pancake_attribution=", parts = document.cookie.split(";");
    for (var x = 0; x < parts.length; x++) {
      var part = parts[x].trim();
      if (part.indexOf(name) === 0) {
        try { return JSON.parse(decodeURIComponent(part.slice(name.length))); } catch (_) { return null; }
      }
    }
    return null;
  }

  // 1. Bank the cookie's newest touch, as app/layout.tsx does.
  try {
    var state = readAttribution();
    var touch = state && Array.isArray(state.t) && state.t.length ? state.t[state.t.length - 1] : null;
    var touchId = touch && touch.i;
    if (typeof touchId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(touchId)) {
      fetch(${literal(`${ingestOrigin}/analytics/acquisition-touch`)}, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        referrerPolicy: "origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ touchId: touchId }),
        keepalive: true
      }).catch(function () {});
    }
  } catch (_) {}

  // 2. Google Tag Manager, through the Google tag gateway path (lib/analytics/google-tag-gateway.mjs).
  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != "dataLayer" ? "&l=" + l : "";
    j.async = true;
    ${tagManagerSourceJs()}
    f.parentNode.insertBefore(j, f);
  })(window, document, "script", "dataLayer", ${literal(gtmId)});

  // 3. The page_view the container listens for (components/analytics/AnalyticsEvents.tsx).
  try {
    var keys = ${literal([...queryKeys])};
    var path = (window.location.pathname || "/").slice(0, 300);
    var pageLocation = new URL(window.location.origin + path);
    new URLSearchParams(window.location.search).forEach(function (value, key) {
      if (keys.indexOf(key) >= 0) pageLocation.searchParams.append(key, value.slice(0, 500));
    });
    var cookie = readAttribution();
    var aid = cookie && typeof cookie.aid === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cookie.aid) ? cookie.aid : null;
    var id = window.crypto && typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : Date.now() + "." + Math.random().toString(36).slice(2);
    var event = ${literal(emptyFields)};
    event.event = "page_view";
    event.schema_version = 1;
    event.event_id = "page_view." + id;
    event.event_timestamp_ms = Date.now();
    event.page_path = path;
    event.page_location = pageLocation.toString().slice(0, 1000);
    event.page_title = document.title.slice(0, 300);
    event.page_view_kind = "initial";
    event.source = "partner_page";
    event.attribution_id = aid;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
  } catch (_) {}
})();
`;
}
