import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { acquisitionBankScript, cleanBankOutcome } from "../lib/analytics/acquisition-bank.mjs";

const id = "019c993d-40bb-7000-8000-000000000011";
const script = acquisitionBankScript({ hosts: ["pancake.ai"], endpoint: "https://app.pancake.ai/analytics/acquisition-touch" });
const response = (body, status = 200, retryAfter = null) => ({ ok: status < 400, status, headers: { get: () => retryAfter }, json: async () => body });
function browser(fetch, url = "https://pancake.ai/?utm_source=meta") {
  const calls = [];
  const timers = new Map();
  let timerId = 0;
  const window = { location: new URL(url), dispatchEvent: () => {} };
  const context = vm.createContext({
    window,
    document: { cookie: `pancake_attribution=${encodeURIComponent(JSON.stringify({ t: [{ i: id }] }))}` },
    URLSearchParams, AbortController,
    CustomEvent: class { constructor(type) { this.type = type; } },
    fetch: async (...args) => { calls.push(args); return fetch(...args); },
    setTimeout: (fn, ms) => { const key = ++timerId; timers.set(key, { fn, ms }); return key; },
    clearTimeout: (key) => timers.delete(key),
  });
  const flush = async () => { for (let n = 0; n < 20; n++) await Promise.resolve(); };
  return {
    window, calls,
    run: async () => { vm.runInContext(script, context); await flush(); },
    advance: async () => {
      const item = [...timers].sort((a, b) => a[1].ms - b[1].ms)[0];
      if (item) { timers.delete(item[0]); item[1].fn(); await flush(); }
    },
    outcomes: () => JSON.parse(JSON.stringify(window.__pancakeAcquisitionBank?.outcomes ?? [])),
  };
}

test("the exact inline payload retries failed receipts/transport, keeps its id, and coalesces repeated execution", async () => {
  let count = 0;
  const page = browser(async () => {
    if (++count === 1) return response({ status: "failed" });
    if (count === 2) throw new Error("SECRET_URL");
    return response({ status: "duplicate" });
  });
  await page.run(); await page.run();
  await page.advance(); await page.advance(); await page.run();
  assert.equal(page.calls.length, 3);
  for (const [, options] of page.calls) {
    assert.equal(options.body, JSON.stringify({ touchId: id }));
    assert.equal(options.referrerPolicy, "origin");
    assert.equal(options.credentials, "include");
  }
  assert.deepEqual(page.outcomes(), [{ status: "duplicate", reason: "saved", attempts: 3 }]);
});

for (const [receipt, reason] of [
  [{ status: "disabled" }, "disabled"],
  [{ status: "failed", reason: "invalid_cookie" }, "invalid_cookie"],
  [{ status: "failed", reason: "touch_mismatch" }, "touch_mismatch"],
  [null, "invalid_response"],
  [{ status: "anything", error: "SECRET" }, "invalid_response"],
]) test(`terminal receipt ${reason} never schedules another request`, async () => {
  const page = browser(async () => response(receipt));
  await page.run(); await page.advance();
  assert.equal(page.calls.length, 1);
  assert.deepEqual(page.outcomes(), [{ status: reason === "disabled" ? "disabled" : "failed", reason, attempts: 1 }]);
});

test("temporary HTTP failures retry but permanent errors and Retry-After stop", async () => {
  for (const [status, retryAfter, attempts, reason] of [[503, null, 3, "unavailable"], [429, null, 3, "rate_limited"], [429, "30", 1, "rate_limited"], [400, null, 1, "rejected"]]) {
    const page = browser(async () => response(null, status, retryAfter));
    await page.run(); await page.advance(); await page.advance();
    assert.equal(page.calls.length, attempts);
    assert.deepEqual(page.outcomes(), [{ status: "failed", reason, attempts }]);
  }
});

test("network and stalled body time out with abort and a finite retry budget", async () => {
  for (const fetch of [async () => new Promise(() => {}), async () => ({ ...response(null), json: () => new Promise(() => {}) })]) {
    const page = browser(fetch);
    await page.run();
    for (let i = 0; i < 5; i++) await page.advance();
    assert.equal(page.calls.length, 3);
    assert.ok(page.calls.every(([, options]) => options.signal.aborted));
    assert.deepEqual(page.outcomes(), [{ status: "failed", reason: "timeout", attempts: 3 }]);
  }
});

test("auth credentials and non-production hosts never bank, including credentials added before a retry", async () => {
  for (const url of ["https://pancake.ai/?token=SECRET", "https://pancake.ai/?code=SECRET", "https://preview.example/"]) {
    const page = browser(async () => response({ status: "inserted" }), url);
    await page.run();
    assert.equal(page.calls.length, 0);
    assert.deepEqual(page.outcomes(), []);
  }
  const page = browser(async () => { throw new Error("network"); });
  await page.run(); page.window.location = new URL("https://pancake.ai/?token=SECRET");
  await page.advance();
  assert.equal(page.calls.length, 1);
  assert.deepEqual(page.outcomes(), []);
});

test("diagnostics have a closed content-free shape and queue for late hydration", async () => {
  const page = browser(async () => response({ status: "inserted", token: "SECRET" }));
  await page.run();
  assert.deepEqual(page.outcomes(), [{ status: "inserted", reason: "saved", attempts: 1 }]);
  assert.deepEqual(cleanBankOutcome({ ...page.outcomes()[0], url: "SECRET", touchId: id }), page.outcomes()[0]);
  assert.equal(cleanBankOutcome({ status: "failed", reason: "SECRET", attempts: 1 }), null);
  assert.equal(cleanBankOutcome({ status: "failed", reason: "timeout", attempts: 500 }), null);
});
