import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import {
  TRACKER_FALLBACK_MS,
  TRACKER_GATE,
  TRACKER_START_EVENTS,
  gatedScriptLoader,
  trackerGateScript,
} from "../lib/analytics/tracker-gate.mjs";

/** A minimal browser for the inline payload: events, timers, an optional idle callback. */
function browser({ idle = false, readyState = "loading" } = {}) {
  const listeners = new Map();
  const timers = [];
  const appended = [];
  const window = {
    addEventListener: (type, fn) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
    },
    removeEventListener: (type, fn) => listeners.get(type)?.delete(fn),
    setTimeout: (fn, ms) => timers.push({ fn, ms }),
  };
  if (idle) window.requestIdleCallback = (fn, opts) => timers.push({ fn, ms: 0, idle: opts });
  const document = {
    readyState,
    createElement: () => ({}),
    head: { appendChild: (el) => appended.push(el) },
  };
  const context = vm.createContext({ window, document });
  const page = {
    window, appended, timers,
    run: (code) => vm.runInContext(code, context),
    fire: (type) => [...(listeners.get(type) ?? [])].forEach((fn) => fn({ type })),
    listening: (type) => listeners.get(type)?.size ?? 0,
    /** run every timer whose delay is ≤ ms, in order */
    tick: (ms = 0) => {
      for (;;) {
        const i = timers.findIndex((t) => t.ms <= ms);
        if (i < 0) break;
        timers.splice(i, 1)[0].fn();
      }
    },
  };
  page.run(trackerGateScript());
  return page;
}

test("nothing starts before an interaction or the fallback", () => {
  const page = browser();
  const ran = [];
  page.window[TRACKER_GATE](() => ran.push("gtm"));
  page.tick(0);
  assert.deepEqual(ran, []);
  for (const type of TRACKER_START_EVENTS) assert.equal(page.listening(type), 1, type);
});

test("the first interaction starts every queued tag once, in order, outside the event", () => {
  for (const type of TRACKER_START_EVENTS) {
    const page = browser();
    const ran = [];
    page.window[TRACKER_GATE](() => ran.push("gtm"));
    page.window[TRACKER_GATE](() => ran.push("meta"));
    page.fire(type);
    assert.deepEqual(ran, [], `${type}: nothing runs inside the interaction itself`);
    page.tick(0);
    assert.deepEqual(ran, ["gtm", "meta"], type);
    page.fire(type);
    page.fire("pointerdown");
    page.tick(0);
    assert.deepEqual(ran, ["gtm", "meta"], `${type}: once`);
    for (const t of TRACKER_START_EVENTS) assert.equal(page.listening(t), 0, `${type}: ${t} listener removed`);
  }
});

test("without any interaction the tags start 10 s after load", () => {
  const page = browser();
  const ran = [];
  page.window[TRACKER_GATE](() => ran.push("gtm"));
  page.tick(TRACKER_FALLBACK_MS);
  assert.deepEqual(ran, [], "no timer before the load event");
  page.fire("load");
  assert.equal(page.timers[0].ms, TRACKER_FALLBACK_MS);
  page.tick(TRACKER_FALLBACK_MS - 1);
  assert.deepEqual(ran, []);
  page.tick(TRACKER_FALLBACK_MS);
  assert.deepEqual(ran, ["gtm"]);
});

test("a payload that runs after load still arms the fallback", () => {
  const page = browser({ readyState: "complete" });
  const ran = [];
  page.window[TRACKER_GATE](() => ran.push("gtm"));
  page.tick(TRACKER_FALLBACK_MS);
  assert.deepEqual(ran, ["gtm"]);
});

test("the queue runs in an idle slot where the browser has one", () => {
  const page = browser({ idle: true });
  const ran = [];
  page.window[TRACKER_GATE](() => ran.push("gtm"));
  page.fire("scroll");
  assert.equal(page.timers.length, 1);
  assert.equal(page.timers[0].idle.timeout, 1000); // the options object comes from the page's realm
  page.tick(0);
  assert.deepEqual(ran, ["gtm"]);
});

test("after the start, a tag added later runs at once; a throwing tag does not stop the others", () => {
  const page = browser();
  const ran = [];
  page.window[TRACKER_GATE](() => { throw new Error("vendor"); });
  page.window[TRACKER_GATE](() => ran.push("meta"));
  page.fire("keydown");
  page.tick(0);
  assert.deepEqual(ran, ["meta"]);
  page.window[TRACKER_GATE](() => ran.push("linkedin"));
  assert.deepEqual(ran, ["meta", "linkedin"]);
});

test("a second copy of the payload keeps the first gate and its queue", () => {
  const page = browser();
  const gate = page.window[TRACKER_GATE];
  const ran = [];
  gate(() => ran.push("gtm"));
  page.run(trackerGateScript());
  assert.equal(page.window[TRACKER_GATE], gate);
  page.fire("touchstart");
  page.tick(0);
  assert.deepEqual(ran, ["gtm"]);
});

test("gatedScriptLoader appends one async script with the exact src once the gate opens", () => {
  const page = browser();
  page.run(gatedScriptLoader("https://t.pancake.ai/package/latest/x/?a=1&b='2'"));
  assert.equal(page.appended.length, 0);
  page.fire("wheel");
  page.tick(0);
  assert.equal(page.appended.length, 1);
  assert.equal(page.appended[0].async, true);
  assert.equal(page.appended[0].src, "https://t.pancake.ai/package/latest/x/?a=1&b='2'");
});
