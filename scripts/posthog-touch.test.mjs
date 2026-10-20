/**
 * PostHog first-touch and latest-touch attribution (bug check 2026-10-13, H1 and H2).
 *
 *   node --test scripts/posthog-touch.test.mjs
 *
 * Most links on the site are full page loads, so PostHogAttribution starts again on most
 * pages of a visit. lib/analytics/posthog-touch.mjs decides what one load is; the first
 * half of this file drives that pure module. The second half runs the REAL component
 * (components/analytics/PostHogAttribution.tsx, compiled in memory with sucrase, which is
 * already installed) against a stand-in for posthog-js that keeps its super properties
 * from one page load to the next, as the browser does. No browser, no network.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
import test from "node:test";
import { fileURLToPath } from "node:url";

import * as acquisitionBank from "../lib/analytics/acquisition-bank.mjs";
import * as posthogTouch from "../lib/analytics/posthog-touch.mjs";
import * as siteConfig from "../lib/site-config.mjs";

const { ATTRIBUTION_KEYS, isExternalReferrer, resolvePostHogTouch, TOUCH_KEYS } = posthogTouch;

const AD_URL = "https://pancake.ai/?utm_source=linkedin&utm_medium=paid&utm_campaign=q4&li_fat_id=L1";
const RETARGETING_URL = "https://pancake.ai/?utm_source=facebook&utm_campaign=retargeting&fbclid=FB1";

/** The super properties a browser holds after `touch` was applied the way the component applies it. */
function store(stored, touch) {
  const next = { ...stored };
  for (const [key, value] of Object.entries(touch.initial ?? {})) if (!(key in next)) next[key] = value;
  if (touch.latest) {
    for (const key of TOUCH_KEYS) delete next[`pancake_latest_${key}`];
    Object.assign(next, touch.latest);
  }
  return next;
}

/** One more page: nothing to store, nothing nulled on the person, no landing event. */
function assertQuiet(touch, message) {
  assert.equal(touch.isNewTouch, false, message);
  assert.equal(touch.initial, null, message);
  assert.equal(touch.latest, null, message);
  assert.deepEqual(touch.person.set, {}, message);
  assert.equal(touch.landingEvent, null, message);
}

/* ── the pure module ─────────────────────────────────────────────────────── */

test("the property names sent to PostHog are the ones dashboards already use", () => {
  assert.deepEqual(
    [...ATTRIBUTION_KEYS],
    [
      "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id",
      "fbclid", "gclid", "gbraid", "wbraid", "li_fat_id", "msclkid", "rdt_cid", "ttclid", "twclid",
    ],
  );
  assert.deepEqual([...TOUCH_KEYS], [...ATTRIBUTION_KEYS, "landing_url", "referrer"]);

  const touch = resolvePostHogTouch({ url: AD_URL, referrer: "https://www.linkedin.com/feed/", stored: {} });
  assert.deepEqual(Object.keys(touch.initial), [
    "pancake_initial_utm_source",
    "pancake_initial_utm_medium",
    "pancake_initial_utm_campaign",
    "pancake_initial_li_fat_id",
    "pancake_initial_landing_url",
    "pancake_initial_referrer",
  ]);
  assert.deepEqual(
    Object.keys(touch.latest),
    Object.keys(touch.initial).map((key) => key.replace("pancake_initial_", "pancake_latest_")),
  );
  assert.deepEqual(Object.keys(touch.person.set), TOUCH_KEYS.map((key) => `pancake_latest_${key}`));
});

test("a first direct visit stores its landing page as both touches and is not a landing", () => {
  const touch = resolvePostHogTouch({ url: "https://pancake.ai/", referrer: "", stored: {} });
  assert.deepEqual(touch, {
    isNewTouch: false,
    initial: { pancake_initial_landing_url: "https://pancake.ai/" },
    latest: { pancake_latest_landing_url: "https://pancake.ai/" },
    person: {
      set: { ...Object.fromEntries(TOUCH_KEYS.map((key) => [`pancake_latest_${key}`, null])), pancake_latest_landing_url: "https://pancake.ai/" },
      setOnce: { pancake_initial_landing_url: "https://pancake.ai/" },
    },
    landingEvent: null,
  });
});

test("a first visit from a campaign is a new touch, stored whole", () => {
  const touch = resolvePostHogTouch({ url: AD_URL, referrer: "https://www.linkedin.com/feed/?x=1", stored: {} });
  const values = {
    utm_source: "linkedin",
    utm_medium: "paid",
    utm_campaign: "q4",
    li_fat_id: "L1",
    landing_url: AD_URL,
    referrer: "https://www.linkedin.com/",
  };
  const prefixed = (prefix) => Object.fromEntries(Object.entries(values).map(([key, value]) => [`${prefix}${key}`, value]));

  assert.equal(touch.isNewTouch, true);
  assert.deepEqual(touch.initial, prefixed("pancake_initial_"));
  assert.deepEqual(touch.latest, prefixed("pancake_latest_"));
  assert.deepEqual(touch.person.setOnce, prefixed("pancake_initial_"));
  // The person's latest touch is replaced whole: every key it does not carry is nulled.
  assert.deepEqual(touch.person.set, {
    ...Object.fromEntries(TOUCH_KEYS.map((key) => [`pancake_latest_${key}`, null])),
    ...prefixed("pancake_latest_"),
  });
  assert.deepEqual(touch.landingEvent, { $current_url: AD_URL, ...values });
});

test("the second page of a visit keeps the campaign and is not a landing (H1)", () => {
  const stored = store({}, resolvePostHogTouch({ url: AD_URL, referrer: "https://www.linkedin.com/", stored: {} }));

  for (const [url, referrer] of [
    ["https://pancake.ai/pricing", AD_URL],
    ["https://pancake.ai/pricing", "https://pancake.ai/"],
    ["https://pancake.ai/blog/some-post?page=2#top", "https://pancake.ai/blog"],
    // A direct return: nothing says where the visitor came from, so the last known touch stands.
    ["https://pancake.ai/pricing", ""],
  ]) {
    assertQuiet(resolvePostHogTouch({ url, referrer, stored }), `${url} from ${referrer || "nowhere"}`);
  }
  assert.equal(stored.pancake_latest_utm_source, "linkedin");
  assert.equal(stored.pancake_latest_landing_url, AD_URL);
});

test("an ad after a direct first visit updates the latest touch, never the first (H2)", () => {
  let stored = store({}, resolvePostHogTouch({ url: "https://pancake.ai/", referrer: "", stored: {} }));
  stored = store(stored, resolvePostHogTouch({ url: "https://pancake.ai/pricing", referrer: "https://pancake.ai/", stored }));
  assert.deepEqual(stored, {
    pancake_initial_landing_url: "https://pancake.ai/",
    pancake_latest_landing_url: "https://pancake.ai/",
  });

  const touch = resolvePostHogTouch({ url: RETARGETING_URL, referrer: "https://l.facebook.com/", stored });
  assert.equal(touch.isNewTouch, true);
  assert.equal(touch.initial, null);
  assert.equal(touch.latest.pancake_latest_utm_source, "facebook");
  assert.equal(touch.latest.pancake_latest_fbclid, "FB1");
  // The person receives the first touch as the browser stored it: the direct visit, nothing from the ad.
  assert.deepEqual(touch.person.setOnce, { pancake_initial_landing_url: "https://pancake.ai/" });
  assert.equal(touch.landingEvent.utm_campaign, "retargeting");

  stored = store(stored, touch);
  assert.deepEqual(
    Object.keys(stored).filter((key) => key.startsWith("pancake_initial_")),
    ["pancake_initial_landing_url"],
  );
  assert.equal(stored.pancake_latest_referrer, "https://l.facebook.com/");
});

test("a later campaign replaces the latest touch whole", () => {
  let stored = store({}, resolvePostHogTouch({ url: AD_URL, referrer: "https://www.linkedin.com/", stored: {} }));
  const touch = resolvePostHogTouch({ url: "https://pancake.ai/pricing?gclid=G1", referrer: "", stored });
  stored = store(stored, touch);

  assert.equal(touch.initial, null);
  assert.deepEqual(touch.latest, {
    pancake_latest_gclid: "G1",
    pancake_latest_landing_url: "https://pancake.ai/pricing?gclid=G1",
  });
  assert.equal(touch.person.set.pancake_latest_utm_source, null);
  assert.equal(touch.person.set.pancake_latest_referrer, null);
  assert.equal(touch.person.setOnce.pancake_initial_utm_source, "linkedin");
  assert.equal("pancake_latest_utm_source" in stored, false);
  assert.equal(stored.pancake_initial_utm_source, "linkedin");
});

test("Pancake's own hosts are never an outside referrer", () => {
  for (const referrer of [
    "https://pancake.ai/",
    "https://www.pancake.ai/pricing",
    "https://app.pancake.ai/plays",
    "https://brain.pancake.ai/",
    "https://getpancake.ai/",
    "https://www.getpancake.ai/blog",
    "https://app.getpancake.ai/",
    "https://brain.getpancake.ai/",
    "https://APP.Pancake.AI/",
    "https://pancake.ai:8443/",
    "http://pancake.ai/",
    "https://pancake.ai./",
  ]) {
    assert.equal(isExternalReferrer(referrer, "pancake.ai"), false, referrer);
    // A first load from one of them is stored like a direct visit: no landing, no referrer.
    const touch = resolvePostHogTouch({ url: "https://pancake.ai/pricing", referrer, stored: {} });
    assert.equal(touch.isNewTouch, false, referrer);
    assert.equal(touch.landingEvent, null, referrer);
    assert.deepEqual(touch.initial, { pancake_initial_landing_url: "https://pancake.ai/pricing" }, referrer);
    assert.deepEqual(touch.latest, { pancake_latest_landing_url: "https://pancake.ai/pricing" }, referrer);
  }
  for (const referrer of [
    "https://www.google.com/",
    "https://notpancake.ai/",
    "https://pancake.ai.example.com/",
    "https://getpancake.ai.example.com/",
    "https://pancake.aide.com/",
  ]) {
    assert.equal(isExternalReferrer(referrer, "pancake.ai"), true, referrer);
  }
  // The page's own host is internal even when it is not on a Pancake domain.
  assert.equal(isExternalReferrer("https://staging.example.com/a", "staging.example.com"), false);
  assert.equal(isExternalReferrer("https://staging.example.com/a", "pancake.ai"), true);
});

test("a campaign link clicked on one of Pancake's own pages is a touch without a referrer", () => {
  const touch = resolvePostHogTouch({
    url: "https://pancake.ai/pricing?utm_source=newsletter",
    referrer: "https://app.pancake.ai/",
    stored: {},
  });
  assert.equal(touch.isNewTouch, true);
  for (const properties of [touch.initial, touch.latest, touch.person.setOnce, touch.landingEvent]) {
    assert.equal(Object.keys(properties).some((key) => key.endsWith("referrer")), false);
  }
  assert.equal(touch.person.set.pancake_latest_referrer, null);
});

test("a click id alone is a touch", () => {
  for (const key of ["fbclid", "gclid", "gbraid", "wbraid", "li_fat_id", "msclkid", "rdt_cid", "ttclid", "twclid"]) {
    const url = `https://pancake.ai/?${key}=abc`;
    const touch = resolvePostHogTouch({ url, referrer: "", stored: { pancake_initial_landing_url: "https://pancake.ai/" } });
    assert.equal(touch.isNewTouch, true, key);
    assert.deepEqual(touch.latest, { [`pancake_latest_${key}`]: "abc", pancake_latest_landing_url: url }, key);
    assert.deepEqual(touch.landingEvent, { $current_url: url, [key]: "abc", landing_url: url }, key);
  }
});

test("other query parameters are not a touch and never reach PostHog", () => {
  const stored = { pancake_initial_landing_url: "https://pancake.ai/", pancake_latest_landing_url: "https://pancake.ai/" };
  for (const url of [
    "https://pancake.ai/?audience=agents",
    "https://pancake.ai/?ref=producthunt&email=ada%40example.com",
    "https://pancake.ai/?UTM_SOURCE=upper",
    "https://pancake.ai/?utm_source=",
  ]) {
    assertQuiet(resolvePostHogTouch({ url, referrer: "", stored }), url);
  }
  const touch = resolvePostHogTouch({
    url: `https://pancake.ai/?email=ada%40example.com&utm_source=${"x".repeat(600)}#pricing`,
    referrer: "https://news.ycombinator.com/item?id=1",
    stored: {},
  });
  assert.equal(touch.latest.pancake_latest_utm_source, "x".repeat(500));
  assert.equal(touch.latest.pancake_latest_landing_url, `https://pancake.ai/?utm_source=${"x".repeat(500)}`);
  assert.equal(touch.latest.pancake_latest_referrer, "https://news.ycombinator.com/");
});

test("a malformed referrer is no referrer at all", () => {
  const stored = { pancake_initial_landing_url: "https://pancake.ai/", pancake_latest_landing_url: "https://pancake.ai/" };
  for (const referrer of ["not a url", "//pancake.ai", "pancake.ai/pricing", "https://", "mailto:ada@example.com", " "]) {
    assert.equal(isExternalReferrer(referrer, "pancake.ai"), false, referrer);
    assertQuiet(resolvePostHogTouch({ url: "https://pancake.ai/pricing", referrer, stored }), referrer);

    const campaign = resolvePostHogTouch({ url: AD_URL, referrer, stored });
    assert.equal(campaign.isNewTouch, true, referrer);
    assert.equal("referrer" in campaign.landingEvent, false, referrer);
    assert.equal("pancake_latest_referrer" in campaign.latest, false, referrer);
  }
});

test("an app referrer is an outside arrival, stored without a referrer as before", () => {
  const touch = resolvePostHogTouch({
    url: "https://pancake.ai/",
    referrer: "android-app://com.linkedin.android/",
    stored: { pancake_initial_landing_url: "https://pancake.ai/", pancake_latest_utm_source: "google", pancake_latest_landing_url: "https://pancake.ai/?utm_source=google" },
  });
  assert.equal(touch.isNewTouch, true);
  assert.deepEqual(touch.latest, { pancake_latest_landing_url: "https://pancake.ai/" });
  assert.deepEqual(touch.landingEvent, { $current_url: "https://pancake.ai/", landing_url: "https://pancake.ai/" });
});

test("an address that is not a URL writes nothing", () => {
  assertQuiet(resolvePostHogTouch({ url: "", referrer: "https://www.google.com/", stored: {} }));
});

test("stored values that are not text do not count as a stored touch", () => {
  const touch = resolvePostHogTouch({
    url: "https://pancake.ai/",
    referrer: "",
    stored: { pancake_initial_landing_url: null, pancake_latest_landing_url: "", pancake_initial_utm_source: 7 },
  });
  assert.deepEqual(touch.initial, { pancake_initial_landing_url: "https://pancake.ai/" });
  assert.deepEqual(touch.latest, { pancake_latest_landing_url: "https://pancake.ai/" });
});

/* ── the real component, one fresh module per page load ──────────────────── */

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const require = createRequire(new URL("../package.json", import.meta.url));
const componentSource = require("sucrase").transform(
  readFileSync(new URL("../components/analytics/PostHogAttribution.tsx", import.meta.url), "utf8"),
  { transforms: ["typescript", "jsx", "imports"], jsxRuntime: "automatic", production: true },
).code;

/** A browser as PostHog sees it: super properties and one person, kept across page loads. */
function makeBrowser() {
  const superProperties = {};
  const person = {};
  const calls = [];
  const events = [];
  const posthog = {
    init: () => calls.push("init"),
    get_property: (name) => superProperties[name],
    // Key by key, as posthog-js does: the reason the first touch must be written whole.
    register_once(properties) {
      calls.push(`register_once ${Object.keys(properties).join(",")}`);
      for (const [key, value] of Object.entries(properties)) if (!(key in superProperties)) superProperties[key] = value;
    },
    register(properties) {
      calls.push(`register ${Object.keys(properties).join(",")}`);
      Object.assign(superProperties, properties);
    },
    unregister(name) {
      if (!calls.at(-1)?.startsWith("unregister")) calls.push("unregister pancake_latest_*");
      delete superProperties[name];
    },
    setPersonProperties(set, setOnce) {
      calls.push("setPersonProperties");
      for (const [key, value] of Object.entries(setOnce ?? {})) if (!(key in person)) person[key] = value;
      Object.assign(person, set ?? {});
    },
    capture(name, properties) {
      calls.push(`capture ${name}`);
      events.push({ name, properties: { ...superProperties, ...properties } });
    },
  };

  async function load(href, referrer = "", bankOutcomes = []) {
    const url = new URL(href);
    const effects = [];
    const stubs = {
      react: { Suspense: "Suspense", useEffect: (effect) => effects.push(effect) },
      "react/jsx-runtime": { jsx: (type, props) => ({ type, props }) },
      "next/navigation": { usePathname: () => url.pathname, useSearchParams: () => url.searchParams },
      "posthog-js": { __esModule: true, default: posthog },
      "@/lib/analytics/data-layer": { isAcquisitionEventName: () => false, PANCAKE_ACQUISITION_EVENT: "pancake:acquisition-event" },
      "@/lib/analytics/posthog-touch.mjs": posthogTouch,
      "@/lib/analytics/acquisition-bank.mjs": acquisitionBank,
      "@/lib/site-config.mjs": siteConfig,
    };
    // A fresh module is a fresh document: `initialized` and the page-view guard start over.
    const page = new Module(`${ROOT}components/analytics/PostHogAttribution.tsx`);
    page.require = (id) => {
      assert.ok(id in stubs, `unexpected import ${id}`);
      return stubs[id];
    };
    const before = { window: globalThis.window, document: globalThis.document };
    const listeners = new Map();
    globalThis.window = {
      __pancakeAcquisitionBank: { outcomes: [...bankOutcomes] },
      location: { href, search: url.search, hostname: url.hostname },
      addEventListener(name, listener) { listeners.set(name, listener); },
      removeEventListener(name) { listeners.delete(name); },
    };
    globalThis.document = { referrer };
    const first = calls.length;
    try {
      page._compile(componentSource, page.id);
      const tree = page.exports.PostHogAttribution();
      tree.props.children.type();
      for (const effect of effects) effect();
      // Repeated notifications after the initial drain must not capture the same receipt twice.
      listeners.get("pancake:acquisition-bank")?.();
      // The library is imported on demand: let the queued calls drain.
      await new Promise((resolve) => setTimeout(resolve, 5));
    } finally {
      globalThis.window = before.window;
      globalThis.document = before.document;
    }
    return calls.slice(first);
  }

  const pick = (source, prefix) => Object.fromEntries(Object.entries(source).filter(([key]) => key.startsWith(prefix)));
  return { load, events, person, superProperties, pick };
}

test("the component: an ad click, then Pricing, keeps the campaign and sends one landing (H1)", async () => {
  const browser = makeBrowser();
  const latest = {
    pancake_latest_utm_source: "linkedin",
    pancake_latest_utm_medium: "paid",
    pancake_latest_utm_campaign: "q4",
    pancake_latest_li_fat_id: "L1",
    pancake_latest_landing_url: AD_URL,
    pancake_latest_referrer: "https://www.linkedin.com/",
  };

  assert.deepEqual(await browser.load(AD_URL, "https://www.linkedin.com/"), [
    "init",
    "register_once pancake_initial_utm_source,pancake_initial_utm_medium,pancake_initial_utm_campaign,pancake_initial_li_fat_id,pancake_initial_landing_url,pancake_initial_referrer",
    "unregister pancake_latest_*",
    "register pancake_latest_utm_source,pancake_latest_utm_medium,pancake_latest_utm_campaign,pancake_latest_li_fat_id,pancake_latest_landing_url,pancake_latest_referrer",
    "setPersonProperties",
    "capture $pageview",
    "capture marketing_landing_viewed",
  ]);
  assert.deepEqual(await browser.load("https://pancake.ai/pricing", AD_URL), ["init", "setPersonProperties", "capture $pageview"]);

  assert.deepEqual(browser.pick(browser.superProperties, "pancake_latest_"), latest);
  assert.deepEqual(browser.pick(browser.person, "pancake_latest_utm_"), {
    pancake_latest_utm_source: "linkedin",
    pancake_latest_utm_medium: "paid",
    pancake_latest_utm_campaign: "q4",
    pancake_latest_utm_content: null,
    pancake_latest_utm_term: null,
    pancake_latest_utm_id: null,
  });
  assert.equal(browser.person.pancake_latest_landing_url, AD_URL);
  assert.deepEqual(browser.events.map((event) => event.name), ["$pageview", "marketing_landing_viewed", "$pageview"]);

  // The Pricing page view is its own page, read with the campaign that brought the visitor.
  const pricing = browser.events.at(-1).properties;
  assert.equal(pricing.$current_url, "https://pancake.ai/pricing");
  assert.equal(pricing.pancake_latest_utm_source, "linkedin");
  assert.equal(pricing.pancake_initial_utm_campaign, "q4");
});

test("the component: a direct visit, Pricing, then a retargeting ad a week later (H2)", async () => {
  const browser = makeBrowser();

  assert.deepEqual(await browser.load("https://pancake.ai/"), [
    "init",
    "register_once pancake_initial_landing_url",
    "unregister pancake_latest_*",
    "register pancake_latest_landing_url",
    "setPersonProperties",
    "capture $pageview",
  ]);
  assert.deepEqual(await browser.load("https://pancake.ai/pricing", "https://pancake.ai/"), [
    "init",
    "setPersonProperties",
    "capture $pageview",
  ]);

  assert.deepEqual(await browser.load(RETARGETING_URL, "https://l.facebook.com/"), [
    "init",
    "unregister pancake_latest_*",
    "register pancake_latest_utm_source,pancake_latest_utm_campaign,pancake_latest_fbclid,pancake_latest_landing_url,pancake_latest_referrer",
    "setPersonProperties",
    "capture $pageview",
    "capture marketing_landing_viewed",
  ]);

  // First touch: the direct visit, whole. The ad is the latest touch only.
  assert.deepEqual(browser.pick(browser.superProperties, "pancake_initial_"), { pancake_initial_landing_url: "https://pancake.ai/" });
  assert.deepEqual(browser.pick(browser.person, "pancake_initial_"), { pancake_initial_landing_url: "https://pancake.ai/" });
  assert.equal(browser.person.pancake_latest_utm_source, "facebook");
  assert.equal(browser.person.pancake_latest_utm_campaign, "retargeting");
  assert.equal(browser.person.pancake_latest_fbclid, "FB1");
  assert.equal(browser.person.pancake_latest_referrer, "https://l.facebook.com/");
  assert.deepEqual(
    browser.events.map((event) => event.name),
    ["$pageview", "$pageview", "$pageview", "marketing_landing_viewed"],
  );
});


test("the component drains pre-hydration bank diagnostics once and drops arbitrary fields", async () => {
  const browser = makeBrowser();
  await browser.load("https://pancake.ai/", "", [
    { status: "inserted", reason: "saved", attempts: 2, token: "SECRET", touchId: "PRIVATE" },
    { status: "failed", reason: "arbitrary", attempts: 1 },
  ]);
  const diagnostics = browser.events.filter((event) => event.name === "acquisition_bank_completed");
  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].properties.status, "inserted");
  assert.equal(diagnostics[0].properties.attempts, 2);
  assert.equal("token" in diagnostics[0].properties, false);
  assert.equal("touchId" in diagnostics[0].properties, false);
  const preview = makeBrowser();
  await preview.load("https://preview.example/", "", [{ status: "inserted", reason: "saved", attempts: 1 }]);
  assert.equal(preview.events.length, 0);
});
