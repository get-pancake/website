#!/usr/bin/env node
// scripts/verticals-audit.mjs — gates on the RENDERED /for pages (spec §7.3).
//
//   node scripts/verticals-audit.mjs                       built HTML (.next/server/app/for/*.html,
//                                                          after `next build`) — the pre-PR gate
//   node scripts/verticals-audit.mjs --base http://localhost:3007
//                                                          same gates over HTTP (dev/preview server)
//   node scripts/verticals-audit.mjs --json                machine-readable report
//
// Gates (exit 1 on any failure):
//   1. Shingles   main content (hero + demo, all variants + signals + control + FAQ + related;
//                 nav, marquee, CTA, pricing, footer excluded): for every pair of pages the
//                 5-word-shingle containment |A∩B|/|A| ≤ 0.50, both ways.
//   2. JSON-LD    every block parses; exactly one WebPage; FAQPage = the page's own vertical
//                 Q/As (v.faq, in order), every one verbatim in a visible <details>, none of
//                 the 5 shared Q/As (VX_FAQ.shared stay visible-only: the same five answers on
//                 40 pages are not this page's FAQ, SEO-JSONLD-05); BreadcrumbList = Home →
//                 Industries → page, URLs resolve. Hub: ItemList = the approved pages.
//   3. Lints      BANNED (validate.ts) over the rendered <main> text minus LpNav and LpFooter
//                 (FAQ answers keep their negation allowance; LpPricing's lines are
//                 allow-listed only when VX_PRICING_MODE = "homepage"), lowercase "pancake".
//   4. DOM        ≤1,400 elements in <main> (the nav's Industries panel not counted: it is the
//                 founder's site-wide addition and grows with the registry), ≤650 in
//                 .vx-demo__card, exactly one <h1>, and
//                 H1 textContent = "{name.badge}: {h1[0]}. {h1[1]}" (VxHero: the badge rides
//                 inside the H1, sr-only ": " and "." make it read as one sentence).
//   5. CSS        no colour literals (#hex, rgb(, rgba(, hsl() in app/_styles/verticals/*.css —
//                 except custom-property declarations in demo.css (the app's own palette,
//                 scoped to the demo).
//   6. Routes     every registry slug prerendered (+ /for); unknown slug → 404
//                 (dynamicParams = false); sitemap lists exactly the approved slugs + /for.
//   7. Island     no config's lead name appears in a client JS chunk (the registry must never
//                 reach the browser bundle; the demo island receives only its own props).
//
// HTML is parsed in headless Chromium (JavaScript disabled, no CSS) — the same Playwright
// setup as verticals-budget.mjs; nothing is installed.

import { createRequire } from "node:module";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const req = createRequire(join(root, "package.json"));
const args = process.argv.slice(2);
const argVal = (k) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : undefined;
};
const BASE = argVal("--base")?.replace(/\/$/, "");
const asJson = args.includes("--json");
const SITE = "https://getpancake.ai";
const EXPECTED_PAGES = 40;

/* ── registry + copy (TS via jiti) ─────────────────────────────────────────── */
const jiti = req("jiti")(join(root, "index.js"), { alias: { "@": root }, interopDefault: true, cache: false });
const { ALL_VERTICALS } = jiti("./lib/verticals/data/index.ts");
const { BANNED } = jiti("./lib/verticals/validate.ts");
const COPY = jiti("./components/sections/verticals/vx-copy.ts");
const approved = ALL_VERTICALS.filter((v) => v.status === "approved");

const fails = [];
const warns = [];
const fail = (gate, where, msg) => fails.push({ gate, where, msg });
const warn = (gate, where, msg) => warns.push({ gate, where, msg });

/* ── HTML sources ──────────────────────────────────────────────────────────── */
const built = join(root, ".next/server/app");
async function getHtml(path) {
  if (BASE) {
    const r = await fetch(BASE + path, { redirect: "manual" });
    return { status: r.status, html: r.status === 200 ? await r.text() : "" };
  }
  const file = path === "/for" ? join(built, "for.html") : join(built, `${path.slice(1)}.html`);
  return existsSync(file) ? { status: 200, html: readFileSync(file, "utf8") } : { status: 404, html: "" };
}
if (!BASE && !existsSync(built)) {
  console.error("[verticals-audit] no .next/server/app — run `next build` first, or pass --base <url>");
  process.exit(2);
}

/* ── browser (parse only) ──────────────────────────────────────────────────── */
function loadPlaywright() {
  for (const t of [process.env.PW_CORE, "playwright-core", join(homedir(), ".claude/skills/gstack/node_modules/playwright-core")].filter(Boolean)) {
    try {
      return req(t);
    } catch {}
  }
  throw new Error("playwright-core not found (set PW_CORE=/path/to/playwright-core)");
}
const pw = loadPlaywright();
const exe =
  process.env.PW_CHROMIUM ||
  join(homedir(), "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const browser = await pw.chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
const ctx = await browser.newContext({ javaScriptEnabled: false });
const page = await ctx.newPage();
// no subresources: the HTML is only parsed
await page.route("**/*", (r) => (r.request().resourceType() === "document" ? r.continue() : r.abort()));

/** Extract everything the gates need from one page's HTML, in the browser. */
async function extract(html) {
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  return page.evaluate(() => {
    const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
    const main = document.querySelector("main");
    const textOf = (el) => {
      // textContent, with a space at every element boundary (so "line1</span><span>line2" splits)
      const parts = [];
      const walk = (n) => {
        if (n.nodeType === 3) parts.push(n.nodeValue);
        else if (n.nodeType === 1 && !["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT"].includes(n.tagName)) {
          parts.push(" ");
          n.childNodes.forEach(walk);
          parts.push(" ");
        }
      };
      walk(el);
      return norm(parts.join(""));
    };
    const scopeSel = [".vx-hero", "main > .vx-demo", "main > #how-it-works", ".vx-signals", ".vx-control", ".vx-faq-sec", ".vx-related"];
    const scoped = [...new Set(scopeSel.flatMap((s) => [...document.querySelectorAll(s)]))];
    const content = scoped.map(textOf).join(" ");
    // lint scope: <main> minus nav + footer, FAQ answers split out (negation allowance)
    const lintRoot = main ? main.cloneNode(true) : document.body.cloneNode(true);
    lintRoot.querySelectorAll("header.lp-nav, .lp-foot, script, style, .vx-qa__a").forEach((e) => e.remove());
    const pricingLines = [...(main?.querySelectorAll(".lp-price-item") ?? [])].map(textOf);
    const blocks = [];
    lintRoot.querySelectorAll("*").forEach((el) => {
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join(" ");
      if (norm(own)) blocks.push(textOf(el));
    });
    const faq = [...document.querySelectorAll("details.vx-qa")].map((d) => ({
      q: norm(d.querySelector(".vx-qa__q")?.textContent),
      a: norm(d.querySelector(".vx-qa__a")?.textContent),
    }));
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent);
    // raw textContent (what search engines and screen readers get), whitespace-collapsed
    const h1s = [...document.querySelectorAll("h1")].map((h) => norm(h.textContent));
    const card = document.querySelector(".vx-demo__card");
    return {
      content,
      blocks,
      faqAnswers: faq.map((f) => f.a),
      pricingLines,
      faq,
      ld,
      h1s,
      // the nav's Industries panel (founder 2026-09-22) postdates the spec's 1,400 budget and
      // grows with the registry: it is counted apart
      mainCount: main ? main.querySelectorAll("*").length - (main.querySelector(".lp-nav-ind__panel")?.querySelectorAll("*").length ?? 0) : 0,
      demoCount: card ? card.querySelectorAll("*").length : null,
    };
  });
}

/* ── gates per page ────────────────────────────────────────────────────────── */
// = validate.ts NEGATION (curly or straight apostrophe)
const NEGATION = /^(No\b|Not\b|Never\b|There[’']?s no\b|There is no\b|Pancake doesn[’']?t\b|It doesn[’']?t\b|Pancake never\b|No emails\b)/;
const sentences = (s) => s.split(/(?<=[.!?])\s+/);
const shingles = new Map();

function lintText(where, blocks, faqAnswers, pricingLines) {
  const allow = new Set(COPY.VX_PRICING_MODE === "homepage" ? pricingLines : []);
  for (const b of blocks) {
    if (allow.has(b)) continue;
    for (const [re, label] of BANNED) if (re.test(b)) fail("lints", where, `banned (${label}): "${b.slice(0, 140)}"`);
    if (/\bpancake\b/.test(b)) fail("lints", where, `lowercase "pancake": "${b.slice(0, 140)}"`);
  }
  for (const a of faqAnswers) {
    for (const [re, label] of BANNED) {
      if (sentences(a).some((s) => re.test(s) && !NEGATION.test(s.trim()))) fail("lints", where, `banned in FAQ answer (${label}): "${a.slice(0, 140)}"`);
    }
    if (/\bpancake\b/.test(a)) fail("lints", where, `lowercase "pancake" in FAQ answer`);
  }
}

function graphOf(ldBlocks, where) {
  const nodes = [];
  for (const raw of ldBlocks) {
    try {
      const j = JSON.parse(raw);
      const list = Array.isArray(j) ? j : j["@graph"] ? j["@graph"] : [j];
      nodes.push(...list);
    } catch (e) {
      fail("jsonld", where, `unparseable JSON-LD: ${String(e).slice(0, 100)}`);
    }
  }
  return nodes;
}
const normWs = (s) => (s ?? "").replace(/\s+/g, " ").trim();
const SHARED_FAQ_Q = new Set(COPY.VX_FAQ.shared.map((f) => normWs(f.q)));
const KNOWN_URLS = new Set([SITE, `${SITE}/for`, ...ALL_VERTICALS.map((v) => `${SITE}/for/${v.slug}`)]);

for (const v of ALL_VERTICALS) {
  const path = `/for/${v.slug}`;
  const { status, html } = await getHtml(path);
  if (status !== 200) {
    fail("routes", path, `not prerendered / not served (status ${status})`);
    continue;
  }
  const x = await extract(html);
  // 4. DOM
  if (x.mainCount > 1400) fail("dom", path, `${x.mainCount} elements in <main> (max 1,400)`);
  if (x.demoCount == null) warn("dom", path, "no .vx-demo__card on the page");
  else if (x.demoCount > 650) fail("dom", path, `${x.demoCount} elements in .vx-demo__card (max 650)`);
  if (x.h1s.length !== 1) fail("dom", path, `${x.h1s.length} <h1> (want exactly 1)`);
  else {
    const wantH1 = `${v.name.badge}: ${v.hero.h1[0]}. ${v.hero.h1[1]}`;
    if (x.h1s[0] !== wantH1) fail("dom", path, `H1 text "${x.h1s[0]}" ≠ "${wantH1}"`);
  }
  // 3. lints
  lintText(path, x.blocks, x.faqAnswers, x.pricingLines);
  // 2. JSON-LD
  const g = graphOf(x.ld, path);
  const pages = g.filter((n) => n["@type"] === "WebPage");
  if (pages.length !== 1) fail("jsonld", path, `${pages.length} WebPage nodes (want 1)`);
  const faqLd = g.find((n) => n["@type"] === "FAQPage");
  if (!faqLd) fail("jsonld", path, "no FAQPage");
  else {
    const ldQa = (faqLd.mainEntity ?? []).map((q) => ({ q: normWs(q.name), a: normWs(q.acceptedAnswer?.text) }));
    // (a) every JSON-LD Q/A is on the page, verbatim, as one <details>
    for (const qa of ldQa) {
      if (!x.faq.some((d) => d.q === qa.q && d.a === qa.a)) fail("jsonld", path, `FAQPage Q/A not verbatim in a visible <details>: "${qa.q}"`);
    }
    // (b) the JSON-LD is exactly the vertical Q/As, in config order
    const want = v.faq.map((f) => ({ q: normWs(f.q), a: normWs(f.a) }));
    const same = ldQa.length === want.length && ldQa.every((qa, i) => qa.q === want[i].q && qa.a === want[i].a);
    if (!same) fail("jsonld", path, `FAQPage (${ldQa.length} Q/As) ≠ the page's ${want.length} vertical Q/As (v.faq)`);
    // (c) the 5 shared Q/As are visible-only
    const leaked = ldQa.filter((qa) => SHARED_FAQ_Q.has(qa.q));
    if (leaked.length) fail("jsonld", path, `FAQPage carries ${leaked.length} shared Q/A(s) (VX_FAQ.shared stays out of the JSON-LD): ${leaked.map((qa) => `"${qa.q}"`).join(", ")}`);
    // (d) every vertical Q/A is visible
    for (const f of want) if (!x.faq.some((d) => d.q === f.q)) fail("jsonld", path, `vertical Q/A not rendered as a <details>: "${f.q}"`);
  }
  const bc = g.find((n) => n["@type"] === "BreadcrumbList");
  const want = [SITE, `${SITE}/for`, `${SITE}/for/${v.slug}`];
  const got = (bc?.itemListElement ?? []).map((i) => i.item);
  if (JSON.stringify(got) !== JSON.stringify(want)) fail("jsonld", path, `BreadcrumbList ${JSON.stringify(got)} ≠ ${JSON.stringify(want)}`);
  for (const u of got) if (!KNOWN_URLS.has(u)) fail("jsonld", path, `breadcrumb URL does not resolve to a route: ${u}`);
  // 1. shingles (collected; compared below)
  const words = x.content.toLowerCase().replace(/[^\p{L}\p{N}$%'’ ]+/gu, " ").split(/\s+/).filter(Boolean);
  const set = new Set();
  for (let i = 0; i + 5 <= words.length; i++) set.add(words.slice(i, i + 5).join(" "));
  shingles.set(v.slug, set);
}

// hub
{
  const { status, html } = await getHtml("/for");
  if (status !== 200) fail("routes", "/for", `hub not served (status ${status})`);
  else {
    const x = await extract(html);
    if (x.h1s.length !== 1) fail("dom", "/for", `${x.h1s.length} <h1> (want exactly 1)`);
    lintText("/for", x.blocks, x.faqAnswers, x.pricingLines);
    const g = graphOf(x.ld, "/for");
    if (g.filter((n) => n["@type"] === "WebPage").length !== 1) fail("jsonld", "/for", "want exactly one WebPage");
    const list = g.find((n) => n["@type"] === "ItemList");
    const urls = (list?.itemListElement ?? []).map((i) => i.url).sort();
    const wantUrls = approved.map((v) => `${SITE}/for/${v.slug}`).sort();
    if (JSON.stringify(urls) !== JSON.stringify(wantUrls)) fail("jsonld", "/for", `ItemList (${urls.length}) ≠ approved pages (${wantUrls.length})`);
    for (const v of approved) if (!html.includes(`href="/for/${v.slug}"`)) fail("routes", "/for", `hub does not link /for/${v.slug}`);
  }
}

/* 1. shingle containment, every pair, both ways */
const slugs = [...shingles.keys()];
let worst = { c: 0, a: "", b: "" };
for (let i = 0; i < slugs.length; i++) {
  for (let j = i + 1; j < slugs.length; j++) {
    const A = shingles.get(slugs[i]);
    const B = shingles.get(slugs[j]);
    let inter = 0;
    for (const s of A) if (B.has(s)) inter++;
    for (const [x, y, X] of [[slugs[i], slugs[j], A], [slugs[j], slugs[i], B]]) {
      const c = X.size ? inter / X.size : 0;
      if (c > worst.c) worst = { c, a: x, b: y };
      if (c > 0.5) fail("shingles", x, `${(c * 100).toFixed(1)}% of its 5-word shingles also on /for/${y} (max 50%)`);
    }
  }
}

/* 5. CSS literals */
const cssDir = join(root, "app/_styles/verticals");
if (existsSync(cssDir)) {
  for (const f of readdirSync(cssDir).filter((f) => f.endsWith(".css"))) {
    const lines = readFileSync(join(cssDir, f), "utf8").replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).split("\n");
    lines.forEach((l, i) => {
      if (!/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i.test(l)) return;
      if (f === "demo.css" && /^\s*--[\w-]+\s*:/.test(l)) return; // the demo's scoped app palette
      fail("css", `app/_styles/verticals/${f}:${i + 1}`, `colour literal: ${l.trim().slice(0, 100)}`);
    });
  }
}

/* 6. routes: count, 404, sitemap */
if (ALL_VERTICALS.length !== EXPECTED_PAGES) warn("routes", "registry", `${ALL_VERTICALS.length} configs (expected ${EXPECTED_PAGES})`);
{
  const probe = "/for/__vx-audit-unknown";
  if (BASE) {
    const r = await fetch(BASE + probe, { redirect: "manual" });
    if (r.status !== 404) fail("routes", probe, `unknown slug answered ${r.status} (want 404)`);
  } else {
    const pm = join(root, ".next/prerender-manifest.json");
    if (existsSync(pm)) {
      const m = JSON.parse(readFileSync(pm, "utf8"));
      const dyn = m.dynamicRoutes?.["/for/[vertical]"];
      if (!dyn) fail("routes", "/for/[vertical]", "not in prerender-manifest dynamicRoutes");
      else if (dyn.fallback !== false) fail("routes", "/for/[vertical]", `fallback ${JSON.stringify(dyn.fallback)} (dynamicParams must be false → 404)`);
      const pre = Object.keys(m.routes ?? {}).filter((r) => r.startsWith("/for/"));
      if (pre.length !== ALL_VERTICALS.length) fail("routes", "/for/*", `${pre.length} prerendered routes ≠ ${ALL_VERTICALS.length} configs`);
    } else warn("routes", "prerender-manifest", "missing — cannot check the 404 contract");
  }
  let sitemap = "";
  if (BASE) sitemap = await (await fetch(BASE + "/sitemap.xml")).text();
  else {
    const body = join(built, "sitemap.xml.body");
    if (existsSync(body)) sitemap = readFileSync(body, "utf8");
    else warn("routes", "sitemap", "no prerendered sitemap.xml.body — skipped");
  }
  if (sitemap) {
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u === `${SITE}/for` || u.startsWith(`${SITE}/for/`)).sort();
    const want = [`${SITE}/for`, ...approved.map((v) => `${SITE}/for/${v.slug}`)].sort();
    if (!approved.length) want.shift();
    if (JSON.stringify(locs) !== JSON.stringify(want)) {
      const extra = locs.filter((u) => !want.includes(u));
      const missing = want.filter((u) => !locs.includes(u));
      fail("routes", "sitemap", `/for entries differ — extra: ${extra.join(", ") || "none"}; missing: ${missing.join(", ") || "none"}`);
    }
  }
}

/* 7. registry never in a client chunk */
{
  const chunks = join(root, ".next/static/chunks");
  if (!BASE && existsSync(chunks)) {
    const names = [...new Set(ALL_VERTICALS.flatMap((v) => v.demo.prompts.flatMap((p) => p.leads.map((l) => l.name))))];
    const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : f.endsWith(".js") ? [join(d, f)] : []));
    for (const file of walk(chunks)) {
      const src = readFileSync(file, "utf8");
      const hit = names.find((n) => src.includes(n));
      if (hit) fail("island", file.replace(root + "/", ""), `client chunk contains config data ("${hit}")`);
    }
  } else if (!BASE) warn("island", ".next/static/chunks", "missing — skipped");
}

await browser.close();

/* ── report ────────────────────────────────────────────────────────────────── */
const summary = {
  mode: BASE ? `http ${BASE}` : "built .next",
  pages: ALL_VERTICALS.length,
  approved: approved.length,
  worstShingleContainment: worst.a ? `${(worst.c * 100).toFixed(1)}% (${worst.a} vs ${worst.b})` : "n/a",
  fails,
  warns,
};
if (asJson) console.log(JSON.stringify(summary, null, 2));
else {
  for (const w of warns) console.warn(`warn [${w.gate}] ${w.where}: ${w.msg}`);
  for (const f of fails) console.error(`FAIL [${f.gate}] ${f.where}: ${f.msg}`);
  console.log(
    `[verticals-audit] ${summary.mode}: ${summary.pages} page(s) + hub, worst shingle containment ${summary.worstShingleContainment} — ${fails.length} failure(s), ${warns.length} warning(s)`,
  );
}
process.exit(fails.length ? 1 : 0);
