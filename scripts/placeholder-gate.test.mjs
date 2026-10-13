#!/usr/bin/env node
/**
 * Placeholder gate (V2 Figma replication, 2026-10-11) — what a PRODUCTION build may render.
 *
 *   node --test scripts/placeholder-gate.test.mjs
 *
 * The homepage's fillable content has one gate, lib/placeholders.ts: SHOW_PLACEHOLDERS is true in
 * dev and on Vercel previews, false in production. This test server-renders the homepage's gated
 * sections twice, in child processes whose environment is a production build's
 * (NODE_ENV=production, no VERCEL_ENV) and a preview build's (VERCEL_ENV=preview), and checks:
 *
 *   production  no element is marked data-placeholder, no section is an empty shell, every step
 *               row has its art (LpSteps throws otherwise), the deep dive has one tab and one
 *               panel per item. The bento renders its FINAL cards and nothing else, or nothing at
 *               all when no card is final or BENTO_LIVE is off (as it is since the final pass of
 *               2026-10-12). The set that goes live when the switch is turned on is rendered and
 *               checked either way: one card per slot holding a final entry, no stand-in image,
 *               no placeholder customer. Since the Kinro cut landed (2026-10-12) every slot holds
 *               a final card: the live set is then the designer's full artboard, and a preview
 *               shows exactly that set;
 *   preview     the same sections still render, and the placeholders that exist are marked.
 *   both        the bento's server markup can play nothing (its <video> elements are created by
 *               the client, in view and muted, or in the sound dialog after a click); every
 *               subset of the bento's seven slots lays out without a hole; every film has its
 *               muted preview clip (under 600 kB) and its captions track; every bento file the
 *               markup or the data names exists under public/, and public/lp/bento/ holds no
 *               file the bento does not name (an unreleased film must not sit there unused); a
 *               stand-in image exists only for a placeholder card that names it; the sources
 *               story rests on the zoom only when a data-source node renders.
 *
 * It renders with react-dom/server through jiti + sucrase (both already installed: jiti is what
 * homepage-lint.mjs uses, sucrase comes with tailwindcss), outside Next: "use client" modules
 * render as plain components, and next/font/google is stubbed. It is not part of `prebuild`.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const FILE = fileURLToPath(import.meta.url);
const ROOT = join(dirname(FILE), "..");

/* ── child: render in the given build environment, print one JSON line ─────── */

function renderAll() {
  const req = createRequire(join(ROOT, "package.json"));
  const sucrase = req("sucrase");
  // next/font/google only works through Next's compiler: hand the stages a NextFont-shaped stub
  const fontPath = req.resolve("next/font/google");
  const font = () => ({ className: "", variable: "", style: { fontFamily: "serif" } });
  req.cache[fontPath] = {
    id: fontPath,
    filename: fontPath,
    loaded: true,
    exports: new Proxy({}, { get: (_t, key) => (key === "__esModule" ? true : font) }),
  };
  const jiti = req("jiti")(join(ROOT, "index.js"), {
    alias: { "@": ROOT },
    interopDefault: true,
    cache: false,
    extensions: [".js", ".mjs", ".cjs", ".ts", ".mts", ".cts", ".json", ".tsx"],
    transform: (o) => ({
      code: sucrase.transform(o.source, {
        transforms: ["typescript", "jsx", "imports"],
        jsxRuntime: "automatic",
        production: true,
        filePath: o.filename,
      }).code,
    }),
  });
  const React = req("react");
  const { renderToStaticMarkup } = req("react-dom/server");
  const v3 = (name) => jiti(`./components/sections/landing-v3/${name}`);
  const html = (Component, props = {}) => renderToStaticMarkup(React.createElement(Component, props));

  const { SHOW_PLACEHOLDERS } = jiti("./lib/placeholders.ts");
  const { AGENT_CARD_BODY, AGENT_CARD_BODY_PLACEHOLDER } = v3("lp-agents-wall-data.ts");
  const { resolveBento, BENTO_SLOT_IDS, BENTO_LIVE } = v3("lp-bento-data.ts");
  const { DIVE_ITEMS } = v3("lp-dive-data.ts");
  const { STEPS } = v3("lp-steps-content.ts");
  const { STORY_SOURCES } = v3("lp-story-sources-data.ts");
  const stage = (file, name) => html(v3(file)[name], { placeholders: SHOW_PLACEHOLDERS });

  // the bento as data: which slots this build shows, and which cards are stand-ins
  const bentoAll = resolveBento(true);
  const bentoNow = resolveBento(SHOW_PLACEHOLDERS);
  const bentoCards = bentoAll ? bentoAll.cards : [];
  const names = (cards) => [...new Set(cards.flatMap(({ card }) => (card.kind === "quote" ? [card.person.name] : [])))];
  const finalNames = names(bentoCards.filter(({ card }) => card.status === "final"));

  // every subset of the seven slots (each filled with its card, as final) must lay out: the
  // two-column stack ends on whole rows, and each desktop row fills 12 columns or is one centred card
  const subsetProblems = [];
  const cardOf = Object.fromEntries(bentoCards.map((c) => [c.id, { ...c.card, status: "final" }]));
  const subsets = bentoCards.length === BENTO_SLOT_IDS.length ? 1 << BENTO_SLOT_IDS.length : 0;
  for (let mask = 1; mask < subsets; mask++) {
    const ids = BENTO_SLOT_IDS.filter((_, i) => mask & (1 << i));
    const out = resolveBento(true, Object.fromEntries(BENTO_SLOT_IDS.map((id) => [id, ids.includes(id) ? [cardOf[id]] : []])));
    const bad = (why) => subsetProblems.push(`${ids.join("+")}: ${why}`);
    if (!out) { bad("resolves to nothing"); continue; }
    if ([...out.cards.map((c) => c.id)].sort().join() !== [...ids].sort().join()) bad("a card went missing");
    if (out.full !== (ids.length === BENTO_SLOT_IDS.length)) bad("wrong layout kind");
    let col = 0;
    for (const c of [...out.cards].sort((a, b) => a.flow.order - b.flow.order)) {
      if (c.flow.span === 2) { if (col !== 0) bad("a wide card after a lone narrow one"); } else col = (col + 1) % 2;
    }
    if (col !== 0) bad("the stack ends on half a row");
    // tablets: a full set is the scaled grid (tabletU), a partial one stacks in px (tabletPx)
    if (!(out.size.flowU > 0 && (out.size.tabletPx > 0) !== (out.size.tabletU > 0) && out.size.gridU > 0)) bad("no height for the estimate");
    if (out.full) continue;
    let used = 0;
    let height = null;
    for (const c of out.cards) {
      if (!c.row) { bad(`${c.id} has no row`); break; }
      if (used === 0) {
        height = c.row.height;
        if (c.row.start) { if (c.row.start - 1 !== (12 - c.row.span) / 2) bad("a lone card is not centred"); continue; }
      }
      if (c.row.height !== height) bad("two heights in one row");
      used += c.row.span;
      if (used > 12) bad("a row overflows");
      if (used === 12) used = 0;
    }
    if (used !== 0) bad(`a row is left open (${used}/12)`);
  }

  return {
    showPlaceholders: SHOW_PLACEHOLDERS,
    // what app/page.tsx hands LpAgentLab
    agentCardBody: SHOW_PLACEHOLDERS && AGENT_CARD_BODY_PLACEHOLDER ? AGENT_CARD_BODY_PLACEHOLDER : AGENT_CARD_BODY,
    bentoResolved: bentoNow !== null,
    bentoLive: BENTO_LIVE,
    // the set production shows once BENTO_LIVE is on, whatever the switch says today
    bentoLiveHtml: html(v3("LpBento.tsx").LpBento, { placeholders: false, live: true }),
    // every film a card lists (final or stand-in): the public files the client will ask for
    bentoFilms: bentoCards.flatMap(({ id, card }) => (card.kind === "video" && card.film ? [{ id, ...card.film }] : [])),
    // slots holding a final card (what production shows while BENTO_LIVE is on), slots holding any card
    bentoFinalSlots: bentoCards.filter(({ card }) => card.status === "final").map((c) => c.id),
    bentoAllSlots: bentoCards.map((c) => c.id),
    bentoSlotCount: BENTO_SLOT_IDS.length,
    // stand-in images (kept out of public/, inlined on previews) that a card names
    bentoStandIns: bentoCards.flatMap(({ card }) => {
      const still = card.kind === "video" ? card.poster : card.kind === "quote" ? card.photo : null;
      return still && "placeholder" in still ? [{ name: still.placeholder, status: card.status }] : [];
    }),
    // people who appear on stand-in cards only: their name must never reach production
    bentoPlaceholderOnlyNames: names(bentoCards.filter(({ card }) => card.status === "placeholder")).filter((n) => !finalNames.includes(n)),
    bentoSubsets: { checked: Math.max(0, subsets - 1), problems: subsetProblems },
    sourcesNodes: { final: STORY_SOURCES.hub.nodes.filter((n) => n.status === "final").length, all: STORY_SOURCES.hub.nodes.length },
    diveItems: DIVE_ITEMS.map((item) => item.status),
    steps: STEPS.length,
    sections: {
      LpDemo: html(v3("LpDemo.tsx").LpDemo),
      LpMarquee: html(v3("LpMarquee.tsx").LpMarquee, { labelled: true }),
      LpSteps: html(v3("LpSteps.tsx").LpSteps),
      LpBanner: html(v3("LpBanner.tsx").LpBanner),
      LpDive: html(v3("LpDive.tsx").LpDive),
      LpCta: html(v3("LpCta.tsx").LpCta, { sky: true }),
      LpBento: html(v3("LpBento.tsx").LpBento),
      storySources: stage("LpStorySources.tsx", "LpStorySourcesStage"),
      storyMessage: stage("LpStoryMessage.tsx", "LpStoryMessageStage"),
      storyLearns: stage("LpStoryLearns.tsx", "LpStoryLearnsStage"),
      storyClaude: stage("LpStoryClaude.tsx", "LpStoryClaudeStage"),
    },
  };
}

/* ── parent: the assertions ─────────────────────────────────────────────── */

function render(vercelEnv) {
  const env = { ...process.env, NODE_ENV: "production" };
  delete env.VERCEL_ENV;
  delete env.NODE_TEST_CONTEXT; // the child prints JSON, not a TAP stream
  if (vercelEnv) env.VERCEL_ENV = vercelEnv;
  const run = spawnSync(process.execPath, [FILE, "--render"], { cwd: ROOT, env, encoding: "utf8", maxBuffer: 1 << 28 });
  assert.equal(run.status, 0, `the ${vercelEnv ?? "production"} render failed:\n${run.stderr}`);
  return JSON.parse(run.stdout);
}

const count = (html, needle) => html.split(needle).length - 1;
/** elements carrying exactly this class (not its --modifier or __child) */
const withClass = (html, name) => (html.match(new RegExp(`class="(?:[^"]* )?${name}(?: [^"]*)?"`, "g")) ?? []).length;
const marked = (out) => Object.values(out.sections).reduce((n, html) => n + count(html, "data-placeholder"), 0);
const slotsOf = (html) => [...html.matchAll(/data-slot="(\w+)"/g)].map((m) => m[1]).sort();

function runTests() {
  const production = render(undefined);
  const vercelProduction = render("production");
  const preview = render("preview");

  test("SHOW_PLACEHOLDERS follows the build environment", () => {
    assert.equal(production.showPlaceholders, false);
    assert.equal(vercelProduction.showPlaceholders, false);
    assert.equal(preview.showPlaceholders, true);
  });

  for (const [label, out] of [["a production build", production], ["Vercel production", vercelProduction]]) {
    test(`${label} renders no placeholder entry`, () => {
      for (const [name, html] of Object.entries(out.sections)) {
        assert.equal(count(html, "data-placeholder"), 0, `${name} renders a placeholder`);
      }
      assert.equal(out.agentCardBody.status, "final", "the agents card body must be final content");
    });

    test(`${label} renders no empty shell`, () => {
      const s = out.sections;
      // the bento: nothing while BENTO_LIVE is off or no card is final; else exactly the live set
      const live = out.bentoLiveHtml;
      if (out.bentoLive && out.bentoFinalSlots.length) {
        assert.ok(out.bentoResolved, "BENTO_LIVE is on and a card is final: production must render the bento");
        assert.equal(s.LpBento, live, "production must render the live set");
      } else {
        assert.ok(!out.bentoResolved, "BENTO_LIVE is off (or no card is final): production must not resolve the bento");
        assert.equal(s.LpBento, "", "the bento must render nothing while BENTO_LIVE is off or without a final card");
      }
      // the live set (what the switch turns on): its final cards and nothing else
      assert.deepEqual(slotsOf(live), [...out.bentoFinalSlots].sort(), "the live set holds exactly the slots with a final card");
      assert.equal(count(live, "<li "), out.bentoFinalSlots.length);
      assert.equal(count(live, "data-placeholder"), 0, "the live set renders a placeholder");
      // no stand-in media (they are inlined data URIs, preview only) and no stand-in customer
      assert.equal(count(live, "data:image"), 0, "a stand-in image reached the live set");
      assert.ok(!/interim/i.test(live), "an interim asset reached the live set");
      for (const name of out.bentoPlaceholderOnlyNames) assert.ok(!live.includes(name), `${name} is on placeholder cards only`);
      // every slot holds a final card: the live set is the designer's artboard, not a fallback row layout
      if (out.bentoFinalSlots.length === out.bentoSlotCount) assert.equal(count(live, 'data-layout="full"'), 1, "a full set of final cards must render the full grid");
      else assert.equal(count(live, 'data-layout="full"'), 0, "a partial set must not claim the full artboard");
      // the sources story: its hub renders final nodes only, and it rests on the zoom only with a node
      assert.equal(withClass(s.storySources, "lp-src-node"), out.sourcesNodes.final);
      assert.equal(count(s.storySources, 'data-end="sources"'), out.sourcesNodes.final > 0 ? 1 : 0);
      assert.equal(count(s.storySources, 'data-end="details"'), out.sourcesNodes.final > 0 ? 0 : 1);
      if (out.sourcesNodes.final === 0) assert.equal(withClass(s.storySources, "lp-src-hub"), 0, "an empty hub shell");
      // the steps: one art card per row (LpSteps throws on a row without final art)
      assert.equal(count(s.LpSteps, "data-lp-slot="), out.steps);
      assert.equal(withClass(s.LpSteps, "lp-steps__media"), out.steps);
      // the deep dive: one tab and one panel per final item, each panel holding its story
      const finals = out.diveItems.filter((status) => status === "final").length;
      assert.ok(finals > 0, "the deep dive has no final item");
      assert.equal(count(s.LpDive, 'role="tab"'), finals);
      assert.equal(count(s.LpDive, 'role="tabpanel"'), finals);
      assert.equal(count(s.LpDive, "data-lp-story="), finals);
      for (const name of ["LpDemo", "LpMarquee", "LpBanner", "LpCta", "storySources", "storyMessage", "storyLearns", "storyClaude"]) {
        assert.ok(s[name].length > 200, `${name} rendered next to nothing`);
      }
    });
  }

  test("a preview build shows the placeholders, marked", () => {
    for (const [name, html] of Object.entries(preview.sections)) {
      if (name === "LpBento") continue; // production may show fewer cards, or none
      assert.ok(html.length >= production.sections[name].length, `${name} lost content on preview`);
    }
    assert.ok(preview.bentoResolved, "the bento must lay out on a preview (final cards, placeholders in the gaps)");
    assert.ok(count(preview.sections.LpBento, "<li ") > 0);
    // a placeholder that renders is marked, so a reviewer (and this test) can tell it from final content
    assert.ok(marked(preview) >= marked(production));
    assert.deepEqual(slotsOf(preview.sections.LpBento), [...preview.bentoAllSlots].sort(), "a preview fills every slot that has a card");
    // one mark per stand-in card, none on a final one. With no final card at all, a preview is all stand-ins
    assert.equal(count(preview.sections.LpBento, "data-placeholder"), preview.bentoAllSlots.length - preview.bentoFinalSlots.length);
    // no stand-in card left (every card is final): a preview shows exactly the set
    // that goes live with BENTO_LIVE, so what is reviewed on a preview is what production will render
    if (preview.bentoFinalSlots.length === preview.bentoAllSlots.length) {
      assert.equal(preview.sections.LpBento, production.bentoLiveHtml, "with every card final, the preview and the live set must be the same markup");
    }
    // the sources story ends on the zoom, every node drawn
    assert.equal(withClass(preview.sections.storySources, "lp-src-node"), preview.sourcesNodes.all);
    assert.equal(count(preview.sections.storySources, 'data-end="sources"'), preview.sourcesNodes.all > 0 ? 1 : 0);
  });

  test("the bento's server markup can play nothing", () => {
    for (const [label, html] of [["production", production.sections.LpBento], ["the live set", production.bentoLiveHtml], ["preview", preview.sections.LpBento]]) {
      assert.equal(count(html, "<video"), 0, `${label}: a <video> in the server markup (the client creates it, in view, muted)`);
      assert.equal(count(html, "autoplay"), 0, `${label}: autoplay in the server markup`);
      assert.ok(!/<dialog[^>]* open/.test(html), `${label}: the sound dialog is open in the server markup`);
    }
  });

  test("every subset of the bento's slots lays out without a hole", () => {
    assert.ok(production.bentoSubsets.checked > 0, "no subset was checked (a slot has no card at all)");
    assert.deepEqual(production.bentoSubsets.problems, []);
  });

  test("every bento file exists under public/, and every film has a light preview and captions", () => {
    const onDisk = (url) => join(ROOT, "public", url.replace(/^\//, ""));
    // files the markup names (posters, portraits, logos: src, srcset, CSS url())
    const named = new Set();
    for (const html of [production.bentoLiveHtml, preview.sections.LpBento]) {
      for (const m of html.matchAll(/\/(?:lp\/bento|logos\/customers)\/[\w.@-]+\.(?:webp|png|svg|jpg|mp4|vtt)/g)) named.add(m[0]);
    }
    assert.ok(named.size > 0, "the bento names no public file at all");
    // files only the client asks for (the server markup holds no <video> and no <track>)
    for (const film of preview.bentoFilms) {
      assert.ok(film.preview?.mp4, `${film.id}: a film needs its muted preview clip (the tile never plays the film)`);
      assert.ok(film.captions?.src, `${film.id}: a film needs a captions track (WCAG 1.2.2)`);
      const crop = film.preview.portrait;
      for (const url of [film.mp4, film.mp4Small, film.preview.mp4, film.preview.mp4Large, crop?.mp4, crop?.mp4Hi, film.captions.src]) if (url) named.add(url);
      for (const url of [film.preview.mp4, film.preview.mp4Large, crop?.mp4]) {
        if (url && existsSync(onDisk(url))) assert.ok(statSync(onDisk(url)).size < 600_000, `${url}: a preview clip stays under 600 kB`);
      }
      // the portrait crop at the film's own resolution: only a large desktop tile on a 2x screen
      // fetches it (LpBentoVideo PORTRAIT_HI_TILE), never a phone
      // (1.6 MB since 2026-10-13: the founder asked for a sharper Praxis tile; 8 s of 806 × 1080)
      if (crop?.mp4Hi && existsSync(onDisk(crop.mp4Hi))) assert.ok(statSync(onDisk(crop.mp4Hi)).size < 1_600_000, `${crop.mp4Hi}: the high-resolution preview stays under 1.6 MB`);
      if (existsSync(onDisk(film.captions.src))) assert.match(readFileSync(onDisk(film.captions.src), "utf8"), /^WEBVTT/, `${film.captions.src} is not a WebVTT file`);
    }
    for (const url of named) assert.ok(existsSync(onDisk(url)), `${url} is named by the bento but missing from public/`);
    // nothing published without a use: every file in public/lp/bento/ is one the bento names
    // (a film that no card lists would still be downloadable from pancake.ai)
    for (const file of readdirSync(onDisk("/lp/bento")).filter((f) => !f.startsWith("."))) {
      assert.ok(named.has(`/lp/bento/${file}`), `public/lp/bento/${file} is not named by any bento card: remove it or list it`);
    }
    // no public file is a stand-in
    for (const url of named) assert.ok(!/interim|placeholder/i.test(url), `${url}: a stand-in must never be a public file`);
  });

  test("a stand-in image exists only for a placeholder card that names it", () => {
    // stand-ins live outside public/ (lp-bento-placeholder.ts inlines them on previews); only a
    // "placeholder" card may name one, and a file no card names is dead weight in the repository
    const dir = join(ROOT, "components", "sections", "landing-v3", "bento-placeholder");
    const files = existsSync(dir) ? readdirSync(dir).filter((f) => !f.startsWith(".")) : [];
    for (const { name, status } of preview.bentoStandIns) {
      assert.equal(status, "placeholder", `a final card shows the stand-in image "${name}"`);
      assert.ok(files.includes(`${name}.webp`), `the stand-in ${name}.webp is named by a card but missing from bento-placeholder/`);
    }
    const wanted = new Set(preview.bentoStandIns.map(({ name }) => `${name}.webp`));
    for (const file of files) assert.ok(wanted.has(file), `bento-placeholder/${file} is not named by any card: remove it`);
    assert.deepEqual(production.bentoStandIns, preview.bentoStandIns, "the data is the same in both builds");
  });
}

// the child only prints (no process.exit: a piped stdout must drain first); the parent runs the tests
if (process.argv[2] === "--render") process.stdout.write(JSON.stringify(renderAll()));
else runTests();
