#!/usr/bin/env node
// scripts/verticals-budget.mjs — pixel budgets for every /for config, measured with the
// REAL fonts (spec §7.2). Run before every PR that touches lib/verticals/data/*:
//
//   node scripts/verticals-budget.mjs                 all configs + the homepage demo
//   node scripts/verticals-budget.mjs recruiting-agencies seo-agencies
//   node scripts/verticals-budget.mjs homepage        the homepage demo only (lib/verticals/home-demo.ts)
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
const { HOME_DEMO } = jiti("./lib/verticals/home-demo.ts");
const { SIGNAL_LABEL } = jiti("./components/sections/verticals/vx-copy.ts");
// the homepage's demo (not a /for page): its demo strings get the same budgets, plus its H2
// (visible on the homepage, the /for demo H2 is hidden) at the section-head H2 budgets
const HOME = "homepage";
const withHome = !only.length || only.includes(HOME);
const configs = only.length ? ALL_VERTICALS.filter((v) => only.includes(v.slug)) : ALL_VERTICALS;
if (only.length && configs.length + (withHome ? 1 : 0) !== only.length) {
  const missing = only.filter((s) => s !== HOME && !configs.some((v) => v.slug === s));
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
// kind "row": the phone prompt row — the kit badge inline before the prompt (hero.css ≤767),
// line count at `width`. `warn: true` = over budget is a warning, not a failure.
// `clampTo`: CSS clamps the box to `max` lines (the rest ellipsized, the full text elsewhere);
// up to `clampTo` lines is reported as clamped (a count), beyond it fails.
const COND = (size, ls) => `font-family:C;font-weight:600;font-size:${size}px;letter-spacing:${ls}px`;
const GEIST = (size, weight = 400) => `font-family:G;font-weight:${weight};font-size:${size}px`;
const BADGE = `${GEIST(11.108, 600)};letter-spacing:.453px;text-transform:uppercase;line-height:16px;padding:3px 9px;border:1px solid transparent`;
const T = {
  // hero (2026-09-22 redesign): the functional H1 title, its "Pancake for {plural}" badge, the lede
  title: { kind: "l", css: COND(57.336, -1.7201), lh: 63.07, width: 880, max: 2, what: "hero title at 880 (desktop)" },
  titleT: { kind: "l", css: COND(47.784, -1.43), lh: 52.56, width: 672, max: 3, what: "hero title at 672 (768 tablet)" },
  titleM: { kind: "l", css: COND(35.559, -1.067), lh: 40, width: 326, max: 3, what: "hero title at 326 (390 phone)" },
  // the H1 label is the kit badge at the kit size (11.108, padding 9 + 1px border); ≤389 its
  // tracking tightens to 0.1px (hero.css) so the longest plural stays one line at 375
  label: { kind: "w", css: `${GEIST(11.108, 600)};letter-spacing:.453px;text-transform:uppercase`, pad: 20, max: 326, what: "H1 label badge on one line at 390 (326 column)" },
  labelS: { kind: "w", css: `${GEIST(11.108, 600)};letter-spacing:.1px;text-transform:uppercase`, pad: 20, max: 311, what: "H1 label badge on one line at 375 (311 column)" },
  lede: { kind: "l", css: GEIST(19.2), lh: 28.8, width: 640, max: 2, what: "hero lede at 640 (desktop)" },
  ledeM: { kind: "l", css: GEIST(16), lh: 24, width: 326, max: 5, what: "hero lede at 326 (phone)" },
  // the hero's example-prompt rows: one line on desktop (the 1025 column leaves 760 for the text),
  // 2 lines in the phone row (326 − 46 of padding and arrow = 280, badge inline): hero.css clamps
  // the row to 2 lines and ellipsizes the rest (the full prompt is typed in the demo); a prompt
  // needing more than 3 lines would lose too much of itself, so that fails
  promptRow: { kind: "w", css: GEIST(15), max: 760, what: "prompt row text on one line at 1025" },
  promptPhone: { kind: "row", css: GEIST(15), lh: 24, width: 280, max: 3, what: "phone prompt row (badge inline, 280 text box) at 390" },
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
/** The demo's strings (a config's, or the homepage demo's): prompt rows, chat, sheet, leads, message. */
function addDemo(s, d) {
  d.demo.prompts.forEach((p, i) => {
    const at = `prompts[${i}]`;
    add(s, `${at}.text`, "promptRow", p.text);
    jobs.push({ slug: s, field: `${at}.text (phone row)`, t: "promptPhone", text: p.text, badge: SIGNAL_LABEL[p.kind] });
    add(s, `${at}.text (bubble)`, "bubble", p.text);
    add(s, `${at}.featured.why`, "why", p.featured.why);
    add(s, `${at}.message`, "message", p.message);
    p.proposal.forEach((r, j) => add(s, `${at}.proposal[${j}]`, "prow", rowText(r)));
    p.leads.forEach((l, j) => {
      add(s, `${at}.leads[${j}] role · company`, "person", `${l.role} · ${l.company}`);
      add(s, `${at}.leads[${j}].signal`, "leadSignal", l.signal);
    });
  });
}
for (const v of configs) {
  const s = v.slug;
  add(s, "hero.title", "title", v.hero.title);
  add(s, "hero.title", "titleT", v.hero.title);
  add(s, "hero.title", "titleM", v.hero.title);
  add(s, "H1 label (Pancake for {plural})", "label", `Pancake for ${v.name.plural}`);
  add(s, "H1 label (Pancake for {plural})", "labelS", `Pancake for ${v.name.plural}`);
  add(s, "hero.lede", "lede", v.hero.lede);
  add(s, "hero.lede", "ledeM", v.hero.lede);
  // demo.h2 is visually hidden since 2026-09-22: no pixel budget
  for (const [f, h] of [["signals.h2", v.signals.h2]]) {
    add(s, f, "h2d", h);
    add(s, f, "h2m", h);
  }
  add(s, "cta.title", "cta", v.cta.title);
  add(s, "hubLine", "hubLine", v.hubLine);
  addDemo(s, v);
  v.signals.cards.forEach((c, i) => {
    add(s, `signals.cards[${i}].title`, "sigTitle", c.title);
    add(s, `signals.cards[${i}].body`, "sigBody", c.body);
  });
}
if (withHome) {
  addDemo(HOME, HOME_DEMO);
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
  ({ jobs, T, chipJobs, BADGE }) => {
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
    const lines = (text, css, w, lh, badge) => {
      const d = document.createElement("div");
      d.className = "b";
      d.style.cssText = `${css};width:${w}px;line-height:${lh}px`;
      if (badge) {
        const b = document.createElement("span");
        b.style.cssText = `${BADGE};display:inline-flex;margin-right:8px;vertical-align:top`;
        b.textContent = badge;
        d.appendChild(b);
        d.appendChild(document.createTextNode(text));
      } else d.textContent = text;
      document.body.appendChild(d);
      const h = d.getBoundingClientRect().height;
      d.remove();
      return Math.round(h / lh);
    };
    const out = jobs.map((j) => {
      const t = T[j.t];
      const value = t.kind === "w" ? width(j.text, t.css) + (t.pad ?? 0) : lines(j.text, t.css, t.width, t.lh, j.badge);
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
  { jobs, T, chipJobs, BADGE },
);
await browser.close();

/* ── report ────────────────────────────────────────────────────────────────── */
const fails = [];
const warns = [];
const clamped = new Map();
for (const m of measured.out) {
  const t = T[m.t];
  if (m.value <= t.max) continue;
  if (t.clampTo && m.value <= t.clampTo) {
    clamped.set(m.t, (clamped.get(m.t) ?? 0) + 1);
    continue;
  }
  (t.warn ? warns : fails).push({ slug: m.slug, field: m.field, what: t.what, value: m.value, max: t.clampTo ?? t.max, unit: t.kind === "w" ? "px" : " lines", text: m.text });
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
  console.log(JSON.stringify({ configs: configs.length, measured: measured.out.length + measured.chips.length, fails, warns, clamped: Object.fromEntries(clamped), ...(args.includes("--all") ? { values: measured.out.map(({ slug, field, t, value }) => ({ slug, field, budget: t, value, max: T[t].max })), chips: measured.chips.map(({ slug, field, rows }) => ({ slug, field, rows })) } : {}) }, null, 2));
} else {
  for (const w of warns) console.warn(`warn ${w.slug}  ${w.field}: ${w.what} ${w.value}${w.unit} (> ${w.max}) — ${w.text}`);
  for (const f of fails) console.error(`FAIL ${f.slug}  ${f.field}: ${f.what} ${f.value}${f.unit} (max ${f.max})${f.text ? ` — "${f.text}"` : ""}`);
  for (const [t, n] of clamped) console.log(`clamped ${n} × ${T[t].what}: ${T[t].max} lines shown, ellipsized (≤ ${T[t].clampTo} lines of text)`);
  console.log(
    `[verticals-budget] ${configs.length} config(s)${withHome ? " + the homepage demo" : ""}, ${measured.out.length + measured.chips.length} measurements: ${fails.length} failure(s), ${warns.length} warning(s)`,
  );
}
process.exit(fails.length ? 1 : 0);
