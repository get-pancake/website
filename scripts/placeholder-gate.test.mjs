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
 *   production  no element is marked data-placeholder, no section is an empty shell (the bento
 *               renders nothing at all until its entries are final), every step row has its art
 *               (LpSteps throws otherwise), the deep dive has one tab and one panel per item;
 *   preview     the same sections still render, and the placeholders that exist are marked.
 *
 * It renders with react-dom/server through jiti + sucrase (both already installed: jiti is what
 * homepage-lint.mjs uses, sucrase comes with tailwindcss), outside Next: "use client" modules
 * render as plain components, and next/font/google is stubbed. It is not part of `prebuild`.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
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
  const { resolveBento } = v3("lp-bento-data.ts");
  const { DIVE_ITEMS } = v3("lp-dive-data.ts");
  const { STEPS } = v3("lp-steps-content.ts");
  const stage = (file, name) => html(v3(file)[name], { placeholders: SHOW_PLACEHOLDERS });

  return {
    showPlaceholders: SHOW_PLACEHOLDERS,
    // what app/page.tsx hands LpAgentLab
    agentCardBody: SHOW_PLACEHOLDERS && AGENT_CARD_BODY_PLACEHOLDER ? AGENT_CARD_BODY_PLACEHOLDER : AGENT_CARD_BODY,
    bentoResolved: resolveBento(SHOW_PLACEHOLDERS) !== null,
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
      // the bento: nothing at all until resolveBento() has a card for every slot it lays out
      if (out.bentoResolved) assert.ok(count(s.LpBento, "<li ") > 0, "the bento section has no card");
      else assert.equal(s.LpBento, "", "the bento must render nothing while its entries are placeholders");
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
    if (!production.bentoResolved) assert.ok(count(preview.sections.LpBento, "data-placeholder") > 0);
  });
}

// the child only prints (no process.exit: a piped stdout must drain first); the parent runs the tests
if (process.argv[2] === "--render") process.stdout.write(JSON.stringify(renderAll()));
else runTests();
