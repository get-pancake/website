import assert from "node:assert/strict";
import { createHash, webcrypto } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

/**
 * public/pancake-attribution.min.js is built in get-pancake/pancake-cmo
 * (packages/attribution-snippet) and copied here byte for byte, never edited.
 * These tests run the served file in an isolated context: no browser, no network.
 */
const snippet = readFileSync(new URL("../public/pancake-attribution.min.js", import.meta.url), "utf8");

function visit(href, referrer = "") {
  let cookie = "";
  let write = "";
  const document = {
    referrer,
    get cookie() {
      return cookie;
    },
    set cookie(value) {
      write = value;
      cookie = value.split(";")[0];
    },
  };
  vm.runInNewContext(snippet, {
    document,
    location: new URL(href),
    crypto: webcrypto,
    URL,
    Uint8Array,
    Date,
    fetch: () => {
      throw new Error("Attribution must not send network requests");
    },
    navigator: {
      sendBeacon: () => {
        throw new Error("Attribution must not send a beacon");
      },
    },
  });
  assert.ok(write.startsWith("pancake_attribution="), href);
  const state = JSON.parse(decodeURIComponent(cookie.slice("pancake_attribution=".length)));
  return { attributes: write.split("; ").slice(1), state };
}

test("the served snippet is pancake-cmo's PAN-1321 build", () => {
  assert.equal(
    createHash("sha256").update(snippet).digest("hex"),
    "daa595c8a5d59f3ba32801b466c0030fd836e91d2adf3b6cc39c0e56487f68ee",
  );
});

test("the attribution cookie is shared across the domain actually visited", () => {
  for (const [href, domain] of [
    ["https://getpancake.ai/?utm_source=linkedin", "Domain=.getpancake.ai"],
    ["https://www.getpancake.ai/pricing?utm_source=linkedin", "Domain=.getpancake.ai"],
    ["https://pancake.ai/?utm_source=linkedin", "Domain=.pancake.ai"],
    ["https://www.pancake.ai/pricing?utm_source=linkedin", "Domain=.pancake.ai"],
  ]) {
    const { attributes, state } = visit(href);
    assert.deepEqual(attributes.filter((attribute) => attribute.startsWith("Domain=")), [domain], href);
    for (const expected of ["Path=/", "SameSite=Lax", "Secure"]) assert.ok(attributes.includes(expected), `${href} ${expected}`);
    assert.equal(state.t[0].s, "linkedin", href);
  }
});

test("look-alike, preview and local hosts get a host-only cookie", () => {
  for (const href of [
    "https://notpancake.ai/?utm_source=x",
    "https://pancake.ai.example.com/?utm_source=x",
    "https://pancake-git-main-getpancake.vercel.app/?utm_source=x",
    "http://localhost:3001/?utm_source=x",
  ]) {
    const { attributes } = visit(href);
    assert.equal(attributes.some((attribute) => attribute.startsWith("Domain=")), false, href);
  }
});

test("a visit from the other Pancake domain is not an external referral", () => {
  assert.equal(visit("https://pancake.ai/", "https://getpancake.ai/blog/some-post").state.t[0].r, undefined);
  assert.equal(visit("https://getpancake.ai/", "https://www.pancake.ai/").state.t[0].r, undefined);
  assert.equal(visit("https://pancake.ai/", "https://www.google.com/").state.t[0].r, "www.google.com");
});
