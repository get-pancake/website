import assert from "node:assert/strict";
import test from "node:test";
import { createHash, webcrypto } from "node:crypto";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const snippet = readFileSync(new URL("../public/pancake-attribution.min.js", import.meta.url), "utf8");
const cookieName = "pancake_attribution";

/** A cookie jar and isolated JavaScript context. No browser or network is used. */
function visitor(initialCookie = "") {
  let cookie = initialCookie;
  let lastWrite = "";
  let now = Date.parse("2026-09-11T12:00:00Z");
  const document = {
    referrer: "",
    get cookie() { return cookie; },
    set cookie(value) { lastWrite = value; cookie = value.split(";")[0]; },
  };
  return {
    visit(href, referrer = "", secondsLater = 0) {
      now += secondsLater * 1000;
      document.referrer = referrer;
      class VisitorDate extends Date { static now() { return now; } }
      vm.runInNewContext(snippet, {
        document, location: new URL(href), crypto: webcrypto, URL, Uint8Array, Date: VisitorDate,
        fetch: () => { throw new Error("Attribution must not send network requests"); },
        navigator: { sendBeacon: () => { throw new Error("Attribution must not send a beacon"); } },
      });
      return JSON.parse(decodeURIComponent(cookie.slice(`${cookieName}=`.length)));
    },
    get write() { return lastWrite; },
    get value() { return cookie.slice(`${cookieName}=`.length); },
  };
}

test("attribution is the unchanged, pinned canonical artifact", () => {
  assert.equal(createHash("sha256").update(snippet).digest("hex"), "eaf029646b38bdb3285d4e7d78826bc1af3a1d7aa2b8468eeda5e086c0bd5da6");
});

test("Brain retains every campaign dimension and provider click_id in its shared domain cookie", () => {
  const browser = visitor();
  const state = browser.visit("https://brain.getpancake.ai/?utm_source=linkedin&utm_medium=clg-obvious&utm_campaign=brain&utm_content=creator&utm_term=founder&click_id=provider-click");
  assert.equal(state.v, 2);
  assert.match(state.aid, /^[0-9a-f-]{36}$/);
  const touch = state.t[0];
  assert.deepEqual({ s: touch.s, m: touch.m, c: touch.c, n: touch.n, w: touch.w, k: touch.k }, {
    s: "linkedin", m: "clg-obvious", c: "brain", n: "creator", w: "founder", k: { click_id: "provider-click" },
  });
  const attributes = browser.write.split("; ").slice(1);
  for (const expected of ["Domain=.getpancake.ai", "Path=/", "Max-Age=7776000", "SameSite=Lax", "Secure"]) assert.ok(attributes.includes(expected), expected);
});

test("same tracked reload deduplicates within 30 minutes and anonymous identity remains stable", () => {
  const browser = visitor();
  const url = "https://brain.getpancake.ai/?utm_source=linkedin&click_id=provider-click";
  const referrer = "https://www.linkedin.com/feed/";
  const first = browser.visit(url, referrer);
  const reload = browser.visit(url, referrer, 20);
  assert.equal(reload.aid, first.aid);
  assert.equal(reload.t.length, 1);
  assert.equal(reload.t[0].i, first.t[0].i);
  const later = browser.visit(url, referrer, 31 * 60);
  assert.equal(later.aid, first.aid);
  assert.equal(later.t.length, 2);
  assert.notEqual(later.t[1].i, first.t[0].i);
});

test("provider touch survives signal-free navigation to the app without a self-referral", () => {
  const browser = visitor();
  const brain = browser.visit("https://brain.getpancake.ai/?utm_source=linkedin&click_id=provider-click", "https://www.linkedin.com/feed/");
  const app = browser.visit("https://app.getpancake.ai/onboarding", "https://brain.getpancake.ai/", 10);
  assert.equal(app.aid, brain.aid);
  assert.deepEqual(app.t, brain.t);
  assert.equal(app.t[0].k.click_id, "provider-click");
  assert.equal(app.t[0].r, "www.linkedin.com");
});

test("magic links retain the campaign and exclude auth tokens; cross-page dedup belongs to the backend", () => {
  const browser = visitor();
  const brain = browser.visit("https://brain.getpancake.ai/?utm_source=linkedin&click_id=provider-click");
  // The canonical script does not interpret _pancake_touch. PAN-887 collapses
  // cross-page campaign re-observations in the server's cookie projection.
  const app = browser.visit(`https://app.getpancake.ai/magic-link?token=private-token&utm_source=linkedin&click_id=provider-click&_pancake_touch=${brain.t[0].i}`, "", 10);
  assert.equal(app.aid, brain.aid);
  assert.equal(app.t.length, 2);
  assert.equal(app.t[1].s, "linkedin");
  assert.equal(app.t[1].k.click_id, "provider-click");
  assert.equal(JSON.stringify(app).includes("private-token"), false);
  assert.equal(JSON.stringify(app).includes("_pancake_touch"), false);
});

test("all supported click identifiers survive independently", () => {
  const browser = visitor();
  const keys = ["click_id", "fbclid", "gclid", "gbraid", "wbraid", "li_fat_id", "msclkid", "ttclid", "rdt_cid", "twclid"];
  const params = new URLSearchParams(keys.map((key, index) => [key, `c${index}`]));
  const state = browser.visit(`https://brain.getpancake.ai/?${params}`);
  assert.deepEqual(state.t[0].k, Object.fromEntries(params));
});

test("privacy allowlist discards form values, auth data, arbitrary params, and hashes", () => {
  const browser = visitor();
  const state = browser.visit("https://brain.getpancake.ai/?utm_source=linkedin&click_id=provider&email=private-email&name=private-name&token=private-token&returnTo=private-destination#private-fragment", "https://www.linkedin.com/feed/?secret=private-referrer#private-hash");
  assert.equal(JSON.stringify(state).includes("private-"), false);
  assert.equal(state.t[0].r, "www.linkedin.com");
  assert.equal(state.referrer, "https://www.linkedin.com");
  const keptUrl = new URL(state.t[0].u);
  assert.deepEqual([...keptUrl.searchParams.keys()], ["utm_source", "click_id"]);
  assert.equal(keptUrl.hash, "");
});

test("bounded history keeps the first and newest four distinct acquisition touches", () => {
  const browser = visitor();
  let state;
  for (let i = 0; i < 8; i += 1) state = browser.visit(`https://brain.getpancake.ai/?utm_source=s${i}&click_id=c${i}`, "", 60);
  assert.equal(state.t.length, 5);
  assert.deepEqual(state.t.map((touch) => touch.s), ["s0", "s4", "s5", "s6", "s7"]);
  assert.equal(state.t[4].k.click_id, "c7");
  assert.ok(browser.value.length <= 3000);
});

test("preview/local hosts never receive a production domain cookie", () => {
  const preview = visitor();
  preview.visit("https://brain-preview.vercel.app/?click_id=local-test");
  assert.equal(preview.write.includes("Domain="), false);
  assert.ok(preview.write.includes("Secure"));
  const local = visitor();
  local.visit("http://localhost:3017/?utm_source=local-test");
  assert.equal(local.write.includes("Domain="), false);
  assert.equal(local.write.includes("Secure"), false);
  assert.ok(local.write.includes("SameSite=Lax"));
});

test("a corrupt prior cookie does not prevent recording the current campaign", () => {
  const browser = visitor("pancake_attribution=%invalid");
  const state = browser.visit("https://brain.getpancake.ai/?click_id=provider-click");
  assert.equal(state.v, 2);
  assert.equal(state.t[0].k.click_id, "provider-click");
});
