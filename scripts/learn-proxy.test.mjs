import assert from "node:assert/strict";
import test from "node:test";

import { LEARN_PATH, LEARN_UPSTREAM, learnRewrites, learnSitemaps } from "../lib/learn-proxy.mjs";
import nextConfig from "../next.config.mjs";

const isLearn = (r) => r.source === LEARN_PATH || r.source.startsWith(`${LEARN_PATH}/`) || r.source.startsWith(`${LEARN_PATH}.`);

test("next.config.mjs runs exactly learnRewrites() before pages and files, and keeps /record after them", async () => {
  const { beforeFiles, afterFiles } = await nextConfig.rewrites();
  assert.deepEqual(beforeFiles, learnRewrites());
  assert.equal(afterFiles.filter(isLearn).length, 0);
  assert.deepEqual(
    afterFiles.map((r) => r.source),
    ["/record", "/record/:path*"],
  );
});

test("TPC's setup maps /learn, its markdown version and every page under it, path kept", () => {
  assert.deepEqual(learnRewrites("https://pancake.shadowdocument.com/learn"), [
    { source: "/learn", destination: "https://pancake.shadowdocument.com/learn" },
    { source: "/learn.md", destination: "https://pancake.shadowdocument.com/learn.md" },
    { source: "/learn/:path*", destination: "https://pancake.shadowdocument.com/learn/:path*" },
  ]);
});

test("an upstream that serves the pages at its root maps the section and its pages, no .md guess", () => {
  assert.deepEqual(learnRewrites("https://pages.example.com"), [
    { source: "/learn", destination: "https://pages.example.com" },
    { source: "/learn/:path*", destination: "https://pages.example.com/:path*" },
  ]);
});

test("a trailing slash is dropped, so no page is requested with a double slash", () => {
  assert.deepEqual(learnRewrites("https://pages.example.com/learn/"), learnRewrites("https://pages.example.com/learn"));
  assert.deepEqual(learnRewrites("https://pages.example.com/"), learnRewrites("https://pages.example.com"));
});

test("null takes the section down: no rewrite and no /learn sitemap", () => {
  assert.deepEqual(learnRewrites(null), []);
  assert.deepEqual(learnSitemaps("https://pancake.ai", null), []);
});

test("while the section is on, robots.txt also lists TPC's sitemap through the proxy", () => {
  assert.deepEqual(learnSitemaps("https://pancake.ai", "https://pancake.shadowdocument.com/learn"), [
    "https://pancake.ai/learn/sitemap.xml",
  ]);
  assert.equal(learnSitemaps("https://pancake.ai").length, LEARN_UPSTREAM === null ? 0 : 1);
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
  assert.deepEqual(learnRewrites("http://127.0.0.1:4599/learn").at(-1), {
    source: "/learn/:path*",
    destination: "http://127.0.0.1:4599/learn/:path*",
  });
});
