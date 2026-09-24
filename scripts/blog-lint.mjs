#!/usr/bin/env node
/**
 * Blog lint — guards content/blog/*.mdx against the breakage the 2026-08-28
 * v2 migration shipped (#247): raw JSON-LD rendered as text, one sentence
 * pasted 17 times into a post, "Pancake v2" boilerplate, empty descriptions,
 * images that 404. Runs before every build (package.json "prebuild").
 *
 *   node scripts/blog-lint.mjs            # all posts
 *   node scripts/blog-lint.mjs a.mdx b.mdx
 *
 * ERRORS fail the build. WARNINGS are printed for the author to judge
 * (snippet lengths, claims about Pancake that break the copy rules).
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "content/blog");
const PUBLIC = path.join(ROOT, "public");
const SERP_TITLE_SUFFIX = " · Pancake"; // keep in sync with app/blog/[slug]/page.tsx
const SERP_TITLE_BUDGET = 60;

const files = process.argv.slice(2).length
  ? process.argv.slice(2).map((f) => path.resolve(f))
  : fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).map((f) => path.join(DIR, f));
const slugs = new Set(fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).map((f) => f.slice(0, -4)));

/** Claims about Pancake that the copy rules forbid (checked per sentence that names Pancake). */
const PANCAKE_CLAIMS = [
  [/\bAI[ -]?co-?founders?\b/i, "Pancake called an AI co-founder"],
  [/\bsuper-?agents?\b|\bAI workforce\b|\bco-?pilots?\b|\bvirtual assistants?\b/i, "banned identity term"],
  [/\bspend caps?\b|\bcan[’']?t overspend\b|\btokens?\b|\btoken (packs?|costs?|billing)\b/i, "spend cap / token billing"],
  [/\bsquads?\b|\biMessage\b|\bOpenClaw runtime\b/i, "V1 product feature"],
  [/\b(engineering|finance|legal|HR|DevOps|bookkeeping|invoicing)\b/i, "V1 function (check it's a negation)"],
  [/\blinked\s*in\b|\bsales\s*nav(igator)?\b|\binmails?\b/i, "platform name next to Pancake"],
  [/\bguarantee(d|s)?\b|\b(response|reply|open) rates?\b/i, "result promise"],
  [/\be-?mail (outreach|sequences?)\b|\bcold e-?mail\b|\bphone calls?\b|\bdialer\b/i, "channel Pancake doesn't run"],
];
const NEGATION = /\b(not|isn[’']t|doesn[’']t|don[’']t|no longer|never|without|instead of|unlike|rather than|no)\b/i;

let errors = 0;
let warnings = 0;
const err = (f, m) => { errors++; console.log(`ERROR  ${f}: ${m}`); };
const warn = (f, m) => { warnings++; console.log(`warn   ${f}: ${m}`); };

for (const file of files) {
  const rel = path.relative(ROOT, file);
  const slug = path.basename(file, ".mdx");
  let parsed;
  try {
    parsed = matter(fs.readFileSync(file, "utf8"));
  } catch (e) {
    err(rel, `frontmatter does not parse (${e.message.split("\n")[0]})`);
    continue;
  }
  const { data: fm, content: body } = parsed;

  // ── frontmatter ──
  for (const k of ["title", "description", "date"]) if (!fm[k]) err(rel, `missing \`${k}\``);
  if (fm.description) {
    const n = String(fm.description).length;
    if (n > 160 || n < 110) warn(rel, `description is ${n} chars (aim 140-155)`);
  }
  const serp = fm.seo_title || (`${fm.title}${SERP_TITLE_SUFFIX}`.length <= SERP_TITLE_BUDGET ? `${fm.title}${SERP_TITLE_SUFFIX}` : fm.title);
  if (serp && serp.length > SERP_TITLE_BUDGET) warn(rel, `SERP title is ${serp.length} chars — add a seo_title ≤ ${SERP_TITLE_BUDGET}`);
  if (fm.seo_title && fm.seo_title.length > SERP_TITLE_BUDGET) err(rel, `seo_title is ${fm.seo_title.length} chars (max ${SERP_TITLE_BUDGET})`);
  for (const r of fm.related ?? []) {
    if (r === slug) err(rel, `related lists the post itself`);
    else if (!slugs.has(r)) err(rel, `related slug "${r}" has no post`);
  }
  const fmText = JSON.stringify(fm);
  if (/Pancake v2|Updated for Pancake/i.test(fmText)) err(rel, `frontmatter still says "Pancake v2"`);

  // ── body ──
  if (/<script\b/i.test(body)) err(rel, `<script> in the body renders as visible text`);
  if (/Pancake v2\b/.test(body)) err(rel, `body still says "Pancake v2"`);
  if (/\$?30K MRR|\$80 CAC|Pancake runs on Pancake/i.test(body + fmText)) err(rel, `unverified self-metric ($30K MRR / $80 CAC / "runs on Pancake")`);

  for (const m of body.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)\)/g)) {
    if (!fs.existsSync(path.join(PUBLIC, decodeURI(m[1])))) err(rel, `image ${m[1]} is not in public/`);
  }

  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  for (const p of paragraphs) {
    if (/^[a-z]/.test(p) && !/^(iOS|iPhone|mettaCofounder|eBay|npm|http)/.test(p)) {
      warn(rel, `paragraph starts mid-word/lowercase: "${p.slice(0, 50)}…"`);
    }
  }

  // One sentence pasted over and over is the #247 failure — 3+ copies in a post fails.
  const sentences = (body + " " + (fm.faq ?? []).map((q) => q.answer).join(" "))
    .replace(/[*_`>#|]/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 40);
  const counts = new Map();
  for (const s of sentences) counts.set(s, (counts.get(s) ?? 0) + 1);
  for (const [s, n] of counts) if (n >= 3) err(rel, `sentence repeated ${n}×: "${s.slice(0, 70)}…"`);

  // Claims about Pancake (warnings: a human judges negations and context).
  for (const s of sentences) {
    if (!/\bPancake\b/.test(s)) continue;
    for (const [re, label] of PANCAKE_CLAIMS) {
      if (re.test(s) && !NEGATION.test(s)) warn(rel, `${label}: "${s.slice(0, 90)}…"`);
    }
  }
}

console.log(`\nblog-lint: ${files.length} post(s), ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
