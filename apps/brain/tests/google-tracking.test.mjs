import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { googleTagManagerBootstrap } from "../lib/google-tracking.ts";
import { currentAnalyticsPageLocation } from "../../../lib/analytics/data-layer.ts";

function page(url, environment = "production") {
  const scripts = [];
  const window = {};
  const context = {
    window, location: new URL(url), URLSearchParams,
    document: { createElement: () => ({}), head: { appendChild: (script) => scripts.push(script) } },
  };
  const run = () => runInNewContext(googleTagManagerBootstrap(environment), context);
  run();
  return { scripts, window, run };
}

test("canonical Brain production starts one shared Google container without a conversion", () => {
  const browser = page("https://brain.getpancake.ai/?gclid=test-click&utm_source=google");
  browser.run();
  assert.equal(browser.scripts.length, 1);
  assert.equal(browser.scripts[0].src, "https://www.googletagmanager.com/gtm.js?id=GTM-P3Z79WKD");
  assert.equal(browser.scripts[0].async, true);
  assert.deepEqual(Array.from(browser.window.dataLayer, (event) => event.event), ["gtm.js"]);
});

test("preview, local, alternate origins and credential-bearing URLs never load GTM", () => {
  for (const [url, environment] of [
    ["https://brain.getpancake.ai/", "preview"],
    ["https://brain.getpancake.ai/", "development"],
    ["https://preview.vercel.app/", "production"],
    ["http://localhost:3017/", "production"],
    ["http://brain.getpancake.ai/", "production"],
    ["https://brain.getpancake.ai.evil.example/", "production"],
    ["https://brain.getpancake.ai/?token=secret", "production"],
    ["https://brain.getpancake.ai/?code=secret", "production"],
  ]) {
    assert.equal(page(url, environment).scripts.length, 0, url + " " + environment);
  }
});

test("shared page-view sanitizer keeps Google campaign identifiers and excludes auth/form data", () => {
  const original = globalThis.window;
  globalThis.window = { location: new URL("https://brain.getpancake.ai/?gclid=test-click&gbraid=test-braid&utm_source=google&utm_medium=cpc&utm_campaign=brain&email=private@example.com&token=secret&code=secret#private") };
  try {
    const result = new URL(currentAnalyticsPageLocation());
    assert.deepEqual(Array.from(result.searchParams), [
      ["gclid", "test-click"], ["gbraid", "test-braid"], ["utm_source", "google"],
      ["utm_medium", "cpc"], ["utm_campaign", "brain"],
    ]);
    assert.equal(result.hash, "");
  } finally {
    if (original === undefined) delete globalThis.window;
    else globalThis.window = original;
  }
});
