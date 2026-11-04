import assert from "node:assert/strict";
import test from "node:test";

import { LEARN_PATH, learnRewrites } from "../lib/learn-proxy.mjs";
import nextConfig from "../next.config.mjs";

test("while the upstream is null, /learn gets no rewrite and stays a 404", () => {
  assert.deepEqual(learnRewrites(null), []);
});

test("next.config.mjs serves /learn with exactly the rewrites learnRewrites() gives", async () => {
  const rewrites = await nextConfig.rewrites();
  const learn = rewrites.filter((r) => r.source === LEARN_PATH || r.source.startsWith(`${LEARN_PATH}/`));
  assert.deepEqual(learn, learnRewrites());
});

test("an upstream that serves the pages under /learn maps the section and every page in it", () => {
  assert.deepEqual(learnRewrites("https://pages.example.com/learn"), [
    { source: "/learn", destination: "https://pages.example.com/learn" },
    { source: "/learn/:path*", destination: "https://pages.example.com/learn/:path*" },
  ]);
});

test("an upstream that serves the pages at its root works too", () => {
  assert.deepEqual(learnRewrites("https://pages.example.com"), [
    { source: "/learn", destination: "https://pages.example.com" },
    { source: "/learn/:path*", destination: "https://pages.example.com/:path*" },
  ]);
});

test("a trailing slash is dropped, so no page is requested with a double slash", () => {
  assert.deepEqual(learnRewrites("https://pages.example.com/learn/"), learnRewrites("https://pages.example.com/learn"));
  assert.deepEqual(learnRewrites("https://pages.example.com/"), learnRewrites("https://pages.example.com"));
});

test("anything but a clean https URL fails the build", () => {
  for (const bad of [
    "",
    "pages.example.com/learn",
    "http://pages.example.com/learn",
    "ftp://pages.example.com/learn",
    "https://user:secret@pages.example.com/learn",
    "https://pages.example.com/learn?ref=pancake",
    "https://pages.example.com/learn#top",
  ]) {
    assert.throws(() => learnRewrites(bad), /LEARN_UPSTREAM must be an https URL/, bad);
  }
});

test("plain http is accepted on loopback only, for a local test", () => {
  assert.deepEqual(learnRewrites("http://127.0.0.1:4599/learn")[1], {
    source: "/learn/:path*",
    destination: "http://127.0.0.1:4599/learn/:path*",
  });
});
