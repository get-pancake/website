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
 * (snippet lengths, claims about Pancake that break the copy rules). Two
 * claims are ERRORS: AI SEO as something Pancake does (retired 2026-09-30),
 * and "AI GTM team" as what Pancake is (retired 2026-10-07).
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

/**
 * AI SEO, retired 2026-09-30 (pancake-cmo #1037): articles, "AI search", being
 * ranked or cited in Google / ChatGPT / AI answers, publishing to a CMS. The
 * post pointing at itself ("this article", "our article", "the article below")
 * doesn't count, and neither does bare "SEO" (SEO agencies are a target industry).
 */
const AI_SEO = new RegExp(
  [
    String.raw`(?<!\b(?:this|that|our|related|previous|next|full|companion|earlier|linked|following) )\barticles?\b(?! (?:above|below))`,
    String.raw`\bAI (?:search|answers?|overviews?)\b|\bsearch visibility\b|\bAI SEO\b|\b(?:generative|answer) engine optimi[sz]ation\b`,
    String.raw`\b(?:search|SEO) (?:content|posts?|pages?)\b|\b(?:ChatGPT|AI|LLM) citations?\b`,
    String.raw`\b(?:rank(?:s|ed|ing)?|cited|shows? up|showing up|surfaces?)\b[^.;]{0,30}\b(?:Google|ChatGPT|Gemini|Perplexity)\b`,
    String.raw`\bpublish(?:es|ing)? (?:to|on) (?:your )?(?:CMS|site|blog|website)\b`,
  ].join("|"),
  "i",
);

/**
 * Claims about Pancake that the copy rules forbid (checked per sentence that names
 * Pancake). A third field "error" fails the build instead of warning; those rules
 * run on pancakeUnits() so a topical sentence can't trip them.
 */
const PANCAKE_CLAIMS = [
  [/\bAI[ -]?co-?founders?\b/i, "Pancake called an AI co-founder"],
  [/\bsuper-?agents?\b|\bAI workforce\b|\bco-?pilots?\b|\bvirtual assistants?\b/i, "banned identity term"],
  // Founder 2026-09-24: "on est plus un AI coworker, on est vraiment sur le AI GTM".
  [/\bAI (co-?worker|employee|teammate)s?\b|\bco-?workers?\b/i, "Pancake is not an AI coworker/employee (fine in a contrast)"],
  [/\bspend caps?\b|\bcan[’']?t overspend\b|\btokens?\b|\btoken (packs?|costs?|billing)\b/i, "spend cap / token billing"],
  [/\bsquads?\b|\biMessage\b|\bOpenClaw runtime\b/i, "V1 product feature"],
  [/\b(engineering|finance|legal|HR|DevOps|bookkeeping|invoicing)\b/i, "V1 function (check it's a negation)"],
  [/\blinked\s*in\b|\bsales\s*nav(igator)?\b|\binmails?\b/i, "platform name next to Pancake"],
  [/\bguarantee(d|s)?\b|\b(response|reply|open) rates?\b/i, "result promise"],
  [/\be-?mail (outreach|sequences?)\b|\bcold e-?mail\b|\bphone calls?\b|\bdialer\b/i, "channel Pancake doesn't run"],
  // An error, not a warning: the retirement must not regress. A competitor's
  // content is fine in its own sentence or after ", while" / ", whereas".
  [AI_SEO, "AI SEO retired 2026-09-30 (Pancake writes no articles, gets no one found in Google or AI answers)", "error"],
  // Retired with the October 2026 launch (founder 2026-10-06): Pancake is where
  // GTM runs ("your agent decides, Pancake runs it"), not an "AI GTM team".
  [/\bAI (?:GTM|go-to-market) teams?\b/i, "\"AI GTM team\" retired 2026-10-07 (say what Pancake does: it finds buyers and starts the conversation)", "error"],
  // Founder 2026-10-09: the customer picks each Play's schedule; copy never names a frequency.
  [/\bevery ?night\b|\beach night\b|\bnightly\b/i, "fixed frequency (the customer picks each Play's schedule)", "error"],
];
const NEGATION = /\b(not|isn[’']t|doesn[’']t|don[’']t|no longer|never|without|instead of|unlike|rather than|no)\b/i;
const NAMES_PANCAKE = /\bPancake\b/;

/**
 * What a post says about Pancake, at the grain an "error" rule needs: every clause
 * that names Pancake (body prose, FAQ answers, the description — split at sentence
 * ends, ";" and ", while/whereas", so "Jasper writes articles, while Pancake finds
 * buyers" leaves Pancake's half clean), plus the table cells that speak for it. A
 * comparison table names Pancake once, in its header, so every cell of that column
 * counts; a list-style table counts each cell of the row led by Pancake.
 *
 * A clause that opens on a pronoun ("It", "Its agents", "They"), or points back with
 * "its", right after a clause that speaks for Pancake, in the same paragraph, speaks
 * for Pancake too: "Pancake takes that one over. It … writes articles aimed at Google.
 * You approve its leads and articles" passed the lint before
 * (autonomous-company-benchmark-2026, 2026-09-30). Any other clause ends the chain.
 */
const POINTS_BACK = /^(?:it|its|they|their)\b|\bits\b/i;
function pancakeUnits(body, fm) {
  const units = [];
  const prose = [];
  let table = [];
  const flushTable = () => {
    const rows = table
      .filter((l) => !/^[\s|:-]+$/.test(l)) // the |---|---| separator
      .map((l) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.replace(/[*_`]/g, " ").trim()));
    table = [];
    if (!rows.length) return;
    const col = rows[0].findIndex((c) => NAMES_PANCAKE.test(c));
    for (const row of rows.slice(1)) {
      if (col >= 0) units.push(row[col] ?? "");
      else if (row.slice(0, 2).some((c) => NAMES_PANCAKE.test(c))) units.push(...row);
    }
  };
  for (const line of body.split("\n")) {
    if (line.trim().startsWith("|")) table.push(line.trim());
    else {
      flushTable();
      prose.push(line);
    }
  }
  flushTable();

  const clauses = [];
  const paragraphs = [prose.join("\n"), ...(fm.faq ?? []).map((q) => q.answer), fm.description ?? ""]
    .join("\n\n")
    .split(/\n(?=\s*(?:#|[-*+] |\d+\. ))|\n{2,}/);
  for (const para of paragraphs) {
    let speaksForPancake = false;
    for (const raw of para.split(/(?<=[.!?][*_]*)\s+|;|, (?:while|whereas) /i)) {
      const s = raw.replace(/[*_`>#]/g, " ").replace(/\s+/g, " ").trim();
      if (!s) continue;
      if (NAMES_PANCAKE.test(s) || (speaksForPancake && POINTS_BACK.test(s))) {
        clauses.push(s);
        speaksForPancake = true;
      } else speaksForPancake = false;
    }
  }
  return [...clauses, ...units.filter(Boolean)];
}

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
  if (new Set(fm.related ?? []).size !== (fm.related ?? []).length) err(rel, `related lists the same post twice`);
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
    if (!NAMES_PANCAKE.test(s)) continue;
    for (const [re, label, level] of PANCAKE_CLAIMS) {
      if (level !== "error" && re.test(s) && !NEGATION.test(s)) warn(rel, `${label}: "${s.slice(0, 90)}…"`);
    }
  }
  // …and the ones that fail the build, on the finer grain of pancakeUnits().
  for (const u of pancakeUnits(body, fm)) {
    for (const [re, label, level] of PANCAKE_CLAIMS) {
      if (level === "error" && re.test(u) && !NEGATION.test(u)) err(rel, `${label}: "${u.slice(0, 90)}…"`);
    }
  }
}

console.log(`\nblog-lint: ${files.length} post(s), ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
