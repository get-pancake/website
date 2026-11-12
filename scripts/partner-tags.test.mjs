import assert from "node:assert/strict";
import test from "node:test";

import { partnerTagsScript } from "../lib/analytics/partner-tags.mjs";
import { ANALYTICS_INGEST_ORIGIN, PRODUCTION_SITE_HOSTS } from "../lib/site-config.mjs";

const TOUCH_ID = "0196d3a2-7c41-7b2e-9f10-2a3b4c5d6e7f";
const AID = "4f9c2a1e-3b7d-4e8a-9c0b-1d2e3f405162";
const EMPTY_FIELDS = { page_view_kind: null, cta_id: null, attribution_id: null, tab_id: null };
// The container's X tag fires only on this event_id shape (GTM-P3Z79WKD, checked 2026-11-03).
const X_EVENT_ID = /^page_view\.[A-Za-z0-9.-]{1,160}$/;

const script = partnerTagsScript({
  hosts: PRODUCTION_SITE_HOSTS,
  ingestOrigin: ANALYTICS_INGEST_ORIGIN,
  gtmId: "GTM-TEST123",
  queryKeys: new Set(["utm_source", "gclid"]),
  emptyFields: EMPTY_FIELDS,
});

/** Runs the script in a minimal browser stand-in and returns what it did. */
function run({ url, cookie = "", title = "How to get web design clients" }) {
  const { hostname, origin, pathname, search } = new URL(url);
  const fetches = [];
  const inserted = [];
  const window = { location: { hostname, origin, pathname, search }, crypto: { randomUUID: () => "0f0e0d0c-0b0a-4908-8706-050403020100" } };
  const document = {
    cookie,
    title,
    createElement: (tag) => ({ tag }),
    getElementsByTagName: () => [{ parentNode: { insertBefore: (node) => inserted.push(node) } }],
  };
  const fetch = (target, init) => {
    fetches.push({ target, init });
    return Promise.resolve();
  };
  new Function("window", "document", "fetch", script)(window, document, fetch);
  return { fetches, inserted, dataLayer: window.dataLayer };
}

const attributionCookie = (state) => `other=1; pancake_attribution=${encodeURIComponent(JSON.stringify(state))}`;

test("off the production hosts (the partner's own domain, a preview) nothing loads or fires", () => {
  for (const url of ["https://pancake.shadowdocument.com/learn", "https://pancake-git-x-getpancake.vercel.app/learn"]) {
    const result = run({ url, cookie: attributionCookie({ aid: AID, t: [{ i: TOUCH_ID }] }) });
    assert.deepEqual(result, { fetches: [], inserted: [], dataLayer: undefined }, url);
  }
});

test("on pancake.ai it banks the newest touch, loads the container and sends one page_view", () => {
  const { fetches, inserted, dataLayer } = run({
    url: "https://pancake.ai/learn/best-ai-sdr?utm_source=chatgpt.com&email=someone%40example.com",
    cookie: attributionCookie({ aid: AID, t: [{ i: "0196d3a2-0000-7000-8000-000000000000" }, { i: TOUCH_ID }] }),
  });

  assert.equal(fetches.length, 1);
  assert.equal(fetches[0].target, `${ANALYTICS_INGEST_ORIGIN}/analytics/acquisition-touch`);
  assert.deepEqual(JSON.parse(fetches[0].init.body), { touchId: TOUCH_ID });
  assert.equal(fetches[0].init.credentials, "include");
  assert.equal(fetches[0].init.keepalive, true);

  assert.equal(inserted.length, 1);
  // The Google tag gateway path on our own domain (lib/analytics/google-tag-gateway.mjs)…
  assert.equal(inserted[0].src, "/pk7x?id=GTM-TEST123");
  assert.equal(inserted[0].async, true);
  // …and Google's own address only if that request fails.
  inserted[0].onerror();
  assert.equal(inserted.length, 2);
  assert.equal(inserted[1].src, "https://www.googletagmanager.com/gtm.js?id=GTM-TEST123");
  inserted.pop();

  assert.equal(dataLayer.length, 2);
  assert.equal(dataLayer[0].event, "gtm.js");
  const pageView = dataLayer[1];
  assert.match(pageView.event_id, X_EVENT_ID);
  assert.deepEqual({ ...pageView, event_id: undefined, event_timestamp_ms: undefined }, {
    ...EMPTY_FIELDS,
    event: "page_view",
    schema_version: 1,
    event_id: undefined,
    event_timestamp_ms: undefined,
    page_path: "/learn/best-ai-sdr",
    // Allow-listed campaign keys only: the email never reaches analytics.
    page_location: "https://pancake.ai/learn/best-ai-sdr?utm_source=chatgpt.com",
    page_title: "How to get web design clients",
    page_view_kind: "initial",
    source: "partner_page",
    attribution_id: AID,
  });
});

test("with no attribution cookie it banks nothing but still loads the container and counts the page", () => {
  const { fetches, inserted, dataLayer } = run({ url: "https://www.pancake.ai/learn" });
  assert.equal(fetches.length, 0);
  assert.equal(inserted.length, 1);
  assert.equal(dataLayer[1].event, "page_view");
  assert.equal(dataLayer[1].attribution_id, null);
  assert.equal(dataLayer[1].page_location, "https://www.pancake.ai/learn");
});

test("a malformed cookie or touch id is ignored without breaking the page view", () => {
  for (const cookie of ["pancake_attribution=%7Bnot-json", attributionCookie({ aid: "nope", t: [{ i: "not-a-uuid" }] })]) {
    const { fetches, dataLayer } = run({ url: "https://pancake.ai/learn", cookie });
    assert.equal(fetches.length, 0, cookie);
    assert.equal(dataLayer[1].event, "page_view", cookie);
    assert.equal(dataLayer[1].attribution_id, null, cookie);
  }
});

test("without crypto.randomUUID the event_id still has the shape the X tag accepts", () => {
  const { hostname, origin, pathname, search } = new URL("https://pancake.ai/learn");
  const window = { location: { hostname, origin, pathname, search } };
  const document = { cookie: "", title: "t", createElement: () => ({}), getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }] };
  new Function("window", "document", "fetch", script)(window, document, () => Promise.resolve());
  assert.match(window.dataLayer[1].event_id, X_EVENT_ID);
});
