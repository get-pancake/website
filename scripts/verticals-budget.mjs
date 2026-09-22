#!/usr/bin/env node
// scripts/verticals-budget.mjs — pixel budgets for every /for config, measured with the
// REAL fonts (spec §7.2). Run before every PR that touches lib/verticals/data/*:
//
//   node scripts/verticals-budget.mjs                 all configs
//   node scripts/verticals-budget.mjs recruiting-agencies seo-agencies
//   node scripts/verticals-budget.mjs --json          machine-readable report
//
// How: loads the configs through jiti (TypeScript + the "@/" alias, no build), then
// measures every string in a headless Chromium page whose @font-faces are the repo's own
// font files (app/fonts/*) inlined as data: URLs — no dev server, no network. Widths use
// inline-block spans; line counts use a fixed-width block at the section's line-height.
// Exit 1 when any budget is exceeded.
//
// Browser: Playwright's chromium-headless-shell (PW_CHROMIUM overrides the path) through
// playwright-core (PW_CORE overrides; defaults to the repo's node_modules, then the
// gstack copy). Nothing is installed.

import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const req = createRequire(join(root, "package.json"));
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const only = args.filter((a) => !a.startsWith("--"));

/* ── load configs (TS) ─────────────────────────────────────────────────────── */
const jiti = req("jiti")(join(root, "index.js"), { alias: { "@": root }, interopDefault: true, cache: false });
const { ALL_VERTICALS } = jiti("./lib/verticals/data/index.ts");
const { SIGNAL_LABEL } = jiti("./components/sections/verticals/vx-copy.ts");
const configs = only.length ? ALL_VERTICALS.filter((v) => only.includes(v.slug)) : ALL_VERTICALS;
if (only.length && configs.length !== only.length) {
  const missing = only.filter((s) => !configs.some((v) => v.slug === s));
  console.error(`[verticals-budget] unknown slug(s): ${missing.join(", ")}`);
  process.exit(2);
}

/* ── browser ───────────────────────────────────────────────────────────────── */
function loadPlaywright() {
  const tries = [process.env.PW_CORE, "playwright-core", join(homedir(), ".claude/skills/gstack/node_modules/playwright-core")].filter(Boolean);
  for (const t of tries) {
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

const font = (p, type) => `data:${type};base64,${readFileSync(join(root, p)).toString("base64")}`;
const FONTS = `
@font-face{font-family:C;src:url("${font("app/fonts/aeonik-condensed/AeonikCondensedProTRIAL-SemiBold.otf", "font/otf")}");font-weight:600}
@font-face{font-family:G;src:url("${font("app/fonts/geist/Geist-Variable-latin.woff2", "font/woff2")}");font-weight:100 900}`;

/* ── budgets (spec §7.2) ───────────────────────────────────────────────────── */
// kind "w": single-line width ≤ max px. kind "l": line count at `width` ≤ max.
const COND = (size, ls) => `font-family:C;font-weight:600;font-size:${size}px;letter-spacing:${ls}px`;
const GEIST = (size, weight = 400) => `font-family:G;font-weight:${weight};font-size:${size}px`;
const T = {
  h1: { kind: "w", css: COND(69.014, -2.0704), max: 643, what: "H1 line at 69.014px" },
  badge: { kind: "w", css: `${GEIST(12, 600)};letter-spacing:.453px;text-transform:uppercase`, pad: 22, max: 288, what: "hero badge (+ padding)" },
  lede: { kind: "l", css: GEIST(16), lh: 24, width: 368, max: 3, what: "hero lede at 368" },
  prompt328: { kind: "l", css: GEIST(15, 500), lh: 22, width: 328, max: 3, what: "prompt at 328" },
  prompt248: { kind: "l", css: GEIST(15, 500), lh: 22, width: 248, max: 4, what: "prompt at 248" },
  prompt270: { kind: "l", css: GEIST(15, 500), lh: 22, width: 270, max: 4, what: "prompt at 270" },
  h2d: { kind: "l", css: COND(57.336, -1.7201), lh: 63.07, width: 720, max: 2, what: "H2 at 720" },
  h2m: { kind: "l", css: COND(35.559, -1.07), lh: 41, width: 326, max: 3, what: "H2 at 326 (phone)" },
  sigTitle: { kind: "l", css: COND(27.648, -0.83), lh: 32, width: 224, max: 2, what: "signal card title at 224" },
  sigBody: { kind: "l", css: GEIST(15), lh: 22, width: 224, max: 4, what: "signal card body at 224" },
  cta: { kind: "w", css: COND(48, -1.44), max: 464, what: "CTA title at 48px" },
  person: { kind: "w", css: GEIST(12), max: 180, what: "role · company at 12px" },
  leadSignal: { kind: "w", css: GEIST(12), max: 136, what: "lead signal at 12px" },
  why: { kind: "l", css: GEIST(13), lh: 19, width: 216, max: 5, what: "why at 216" },
  bubble: { kind: "l", css: GEIST(13), lh: 19, width: 204, max: 4, what: "chat bubble at 204" },
  prow: { kind: "l", css: GEIST(12), lh: 17, width: 168, max: 3, what: "proposal row at 168" },
  message: { kind: "l", css: GEIST(13), lh: 20, width: 330, max: 6, what: "message at 330" },
  hubLine: { kind: "l", css: GEIST(15), lh: 22, width: 480, max: 1, what: "hubLine at 480" },
};
// The Watching chips: the spec's budget was 2 rows at 200px; the Signals grid now aligns
// panels with a subgrid (signals.css), so 3 rows still render equal — 3 = warn, 4+ = fail.
const CHIP_ROWS = { warn: 2, max: 3 };
const PROW_TOTAL = 9;

const rowText = (r) => {
  const items = r.kind === "keyword" ? r.items.map((i) => `“${i}”`) : r.items;
  return items.join(" · ") + (r.kind === "stack" ? ", named in job posts" : "");
};

/** Flatten every measurable string into jobs. */
const jobs = [];
const add = (slug, field, t, text) => jobs.push({ slug, field, t, text });
for (const v of configs) {
  const s = v.slug;
  v.hero.h1.forEach((l, i) => add(s, `hero.h1[${i}]`, "h1", l));
  add(s, "name.badge", "badge", v.name.badge);
  add(s, "hero.lede", "lede", v.hero.lede);
  for (const [f, h] of [["demo.h2", v.demo.h2], ["signals.h2", v.signals.h2]]) {
    add(s, f, "h2d", h);
    add(s, f, "h2m", h);
  }
  add(s, "cta.title", "cta", v.cta.title);
  add(s, "hubLine", "hubLine", v.hubLine);
  v.demo.prompts.forEach((p, i) => {
    const at = `prompts[${i}]`;
    add(s, `${at}.text`, "prompt328", p.text);
    add(s, `${at}.text`, "prompt248", p.text);
    add(s, `${at}.text`, "prompt270", p.text);
    add(s, `${at}.text (bubble)`, "bubble", p.text);
    add(s, `${at}.featured.why`, "why", p.featured.why);
    add(s, `${at}.message`, "message", p.message);
    p.proposal.forEach((r, j) => add(s, `${at}.proposal[${j}]`, "prow", rowText(r)));
    p.leads.forEach((l, j) => {
      add(s, `${at}.leads[${j}] role · company`, "person", `${l.role} · ${l.company}`);
      add(s, `${at}.leads[${j}].signal`, "leadSignal", l.signal);
    });
  });
  v.signals.cards.forEach((c, i) => {
    add(s, `signals.cards[${i}].title`, "sigTitle", c.title);
    add(s, `signals.cards[${i}].body`, "sigBody", c.body);
  });
}
const chipJobs = configs.flatMap((v) =>
  v.signals.cards.map((c, i) => ({
    slug: v.slug,
    field: `signals.cards[${i}].watching (${SIGNAL_LABEL[c.kind]})`,
    chips: c.watching.map((w) => (c.kind === "keyword" ? `“${w}”` : w)),
    more: c.more ?? 0,
  })),
);

/* ── measure ───────────────────────────────────────────────────────────────── */
const browser = await pw.chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
const page = await browser.newPage();
await page.setContent(`<style>${FONTS} body{margin:0} .n{white-space:nowrap;display:inline-block} .b{display:block;overflow-wrap:normal}</style><body></body>`);
await page.evaluate(async () => {
  await Promise.all(["600 40px C", "400 16px G", "500 16px G", "600 16px G"].map((f) => document.fonts.load(f)));
});
const measured = await page.evaluate(
  ({ jobs, T, chipJobs }) => {
    const width = (text, css) => {
      const s = document.createElement("span");
      s.className = "n";
      s.style.cssText = css;
      s.textContent = text;
      document.body.appendChild(s);
      const w = s.getBoundingClientRect().width;
      s.remove();
      return w;
    };
    const lines = (text, css, w, lh) => {
      const d = document.createElement("div");
      d.className = "b";
      d.style.cssText = `${css};width:${w}px;line-height:${lh}px`;
      d.textContent = text;
      document.body.appendChild(d);
      const h = d.getBoundingClientRect().height;
      d.remove();
      return Math.round(h / lh);
    };
    const out = jobs.map((j) => {
      const t = T[j.t];
      const value = t.kind === "w" ? width(j.text, t.css) + (t.pad ?? 0) : lines(j.text, t.css, t.width, t.lh);
      return { ...j, value: Math.round(value * 10) / 10 };
    });
    const chips = chipJobs.map((c) => {
      const ul = document.createElement("div");
      ul.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;width:200px";
      for (const text of c.chips) {
        const li = document.createElement("span");
        li.style.cssText = "font-family:G;font-size:12px;line-height:24px;height:24px;padding:0 8px;white-space:nowrap;max-width:100%;overflow:hidden;box-sizing:border-box";
        li.textContent = text;
        ul.appendChild(li);
      }
      if (c.more) {
        const m = document.createElement("span");
        m.style.cssText = "font-family:G;font-size:12px;font-weight:600;line-height:24px";
        m.textContent = `+${c.more} more`;
        ul.appendChild(m);
      }
      document.body.appendChild(ul);
      const rows = new Set([...ul.children].map((e) => Math.round(e.getBoundingClientRect().top))).size;
      ul.remove();
      return { ...c, rows };
    });
    return { out, chips };
  },
  { jobs, T, chipJobs },
);
await browser.close();

/* ── report ────────────────────────────────────────────────────────────────── */
const fails = [];
const warns = [];
for (const m of measured.out) {
  const t = T[m.t];
  if (m.value > t.max) fails.push({ slug: m.slug, field: m.field, what: t.what, value: m.value, max: t.max, unit: t.kind === "w" ? "px" : " lines", text: m.text });
}
// all proposal rows of one prompt together ≤ 9 lines
const rowsBy = new Map();
for (const m of measured.out.filter((x) => x.t === "prow")) {
  const key = `${m.slug}|${m.field.replace(/\.proposal\[\d+\]$/, "")}`;
  rowsBy.set(key, (rowsBy.get(key) ?? 0) + m.value);
}
for (const [key, total] of rowsBy) {
  const [slug, field] = key.split("|");
  if (total > PROW_TOTAL) fails.push({ slug, field: `${field}.proposal (all rows)`, what: "proposal rows total", value: total, max: PROW_TOTAL, unit: " lines", text: "" });
}
for (const c of measured.chips) {
  const row = { slug: c.slug, field: c.field, what: "Watching chips at 200px", value: c.rows, max: CHIP_ROWS.max, unit: " rows", text: c.chips.join(" | ") };
  if (c.rows > CHIP_ROWS.max) fails.push(row);
  else if (c.rows > CHIP_ROWS.warn) warns.push({ ...row, max: CHIP_ROWS.warn });
}

if (asJson) {
  console.log(JSON.stringify({ configs: configs.length, measured: measured.out.length + measured.chips.length, fails, warns, ...(args.includes("--all") ? { values: measured.out.map(({ slug, field, t, value }) => ({ slug, field, budget: t, value, max: T[t].max })), chips: measured.chips.map(({ slug, field, rows }) => ({ slug, field, rows })) } : {}) }, null, 2));
} else {
  for (const w of warns) console.warn(`warn ${w.slug}  ${w.field}: ${w.what} ${w.value}${w.unit} (> ${w.max}) — ${w.text}`);
  for (const f of fails) console.error(`FAIL ${f.slug}  ${f.field}: ${f.what} ${f.value}${f.unit} (max ${f.max})${f.text ? ` — "${f.text}"` : ""}`);
  console.log(
    `[verticals-budget] ${configs.length} config(s), ${measured.out.length + measured.chips.length} measurements: ${fails.length} failure(s), ${warns.length} warning(s)`,
  );
}
process.exit(fails.length ? 1 : 0);
