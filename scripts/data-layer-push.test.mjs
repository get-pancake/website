import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { PANCAKE_ACQUISITION_EVENT, pushAcquisitionEvent, pushToDataLayer } from "../lib/analytics/data-layer.ts";

/** The browser globals the data-layer helpers read, with `dataLayer` as given. */
function browser(dataLayer) {
  const window = new EventTarget();
  Object.assign(window, {
    location: { pathname: "/pricing", search: "?gclid=abc&email=someone%40example.com", origin: "https://pancake.ai" },
    crypto: { randomUUID: () => "0f0e0d0c-0b0a-4908-8706-050403020100" },
  });
  if (dataLayer !== undefined) window.dataLayer = dataLayer;
  globalThis.window = window;
  globalThis.document = { title: "Pricing", cookie: "" };
  return window;
}

/** Google Tag Manager's own push, failing inside Google's code (the app's error of 2026-11-17). */
function failingTagManagerLayer() {
  const layer = [];
  layer.push = () => {
    throw new TypeError("c.isActive is not a function");
  };
  return layer;
}

test("an event reaches the data layer, which is created when missing", () => {
  const window = browser(undefined);
  assert.equal(pushToDataLayer({ event: "page_view" }), true);
  assert.deepEqual(window.dataLayer, [{ event: "page_view" }]);
  assert.equal(pushToDataLayer({ event: "app_cta_clicked" }), true);
  assert.equal(window.dataLayer.length, 2);
});

test("an error inside Google's tag never reaches the page: the event is dropped", () => {
  browser(failingTagManagerLayer());
  assert.doesNotThrow(() => pushToDataLayer({ event: "page_view" }));
  assert.equal(pushToDataLayer({ event: "page_view" }), false);
});

test("a CTA click still returns its id and reaches our own listeners when Google's tag fails", () => {
  const window = browser(failingTagManagerLayer());
  const heard = [];
  window.addEventListener(PANCAKE_ACQUISITION_EVENT, (event) => heard.push(event.detail));

  const eventId = pushAcquisitionEvent("app_cta_clicked", { cta_id: "app_hero" });

  assert.equal(eventId, "app_cta_clicked.0f0e0d0c-0b0a-4908-8706-050403020100");
  assert.equal(heard.length, 1);
  assert.equal(heard[0].event, "app_cta_clicked");
  assert.equal(heard[0].cta_id, "app_hero");
  // Only allow-listed campaign keys reach the location, as before.
  assert.equal(heard[0].page_location, "https://pancake.ai/pricing?gclid=abc");
});

test("no file pushes to the data layer except through pushToDataLayer", () => {
  const root = path.join(import.meta.dirname, "..");
  // The partner pages' script (/pancake-tags.js) runs its push inside its own try.
  const allowed = new Set(["lib/analytics/data-layer.ts", "lib/analytics/partner-tags.mjs"]);
  const offenders = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && !entry.name.startsWith(".")) walk(rel);
      } else if (/\.(tsx?|mjs|js)$/.test(entry.name) && !allowed.has(rel)) {
        const source = fs.readFileSync(path.join(root, rel), "utf8");
        if (/dataLayer\??\.push\(/.test(source)) offenders.push(rel);
      }
    }
  };
  for (const dir of ["app", "components", "lib"]) walk(dir);
  assert.deepEqual(offenders, []);
});
