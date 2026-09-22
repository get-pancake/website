// lib/verticals/validate.ts — validateVerticals(): runs at module load of lib/verticals/index.ts,
// so `next build` (and `npx tsc`-driven scripts) fail on any violation. Pixel budgets live in
// scripts/verticals-budget.mjs (Playwright + real fonts); HTML-level gates (shingles, JSON-LD
// parity, DOM size) in scripts/verticals-audit.mjs. Warnings print; errors throw.

import type { SignalKind, VerticalConfig } from "@/lib/verticals/types";
import * as FIXED from "@/components/sections/verticals/vx-copy";

const KINDS: SignalKind[] = ["keyword", "competitor", "influencer", "own_brand", "hiring", "stack"];
const CATEGORIES = [
  "Sales, GTM & recruiting", "Marketing & creative agencies", "Tech & build agencies", "Consultants & advisors",
  "IT, cloud & security", "Startups & solo founders", "Vertical software", "Energy & industry",
];

/** Positive claims the product cannot back (critic §3.1, product-truth §4.2, founder bans). */
export const BANNED: [RegExp, string][] = [
  [/\bAI[ -]?SDRs?\b/i, "AI SDR"],
  [/\bco-?pilots?\b/i, "copilot"],
  [/\bvirtual assistants?\b/i, "virtual assistant"],
  [/\bAI (workforce|co-?founders?|employees?)\b/i, "banned identity term"],
  [/\bsuper-?agents?\b/i, "superagent"],
  [/\bagents?\b/i, "agents wording"],
  [/\b(e-?mails?|inbox(es)?|cold e-?mail)\b/i, "email"],
  [/\b(phone|mobile number|dial(er|ing)|cold call(s|ing)?)\b/i, "phone"],
  [/\b(funding|fundrais\w*|series [a-e] round|job[- ]changes?|changed jobs|press releases?)\b/i, "funding/job-change/news signal"],
  [/\b(website|site) visitors?\b|\bde-?anonymi[sz]\w*/i, "website visitors"],
  [/\bgoogle maps\b|\blocal (business )?lists?\b|\bhomeowners?\b/i, "local/consumer leads"],
  [/\bCRM (sync|integration)s?\b|\bsyncs? (to|with) (your )?(CRM|HubSpot|Salesforce)\b|\bCSV\b|\bexports?\b/i, "CRM sync/export"],
  [/\bdraft mode\b|\b(approve|review) (each|every) message\b|\bmessage approvals?\b/i, "draft mode"],
  [/\bguarantee(d|s)?\b|\bin (a few |2 |two )?minutes\b|\binstant(ly)?\b/i, "guarantee / instant"],
  [/\b(response|reply|open) rates?\b|\b\d+ ?% (response|reply|open)/i, "rates"],
  [/\bspend cap\b|\bcan'?t overspend\b|\btoken costs?\b|\bunlimited leads\b/i, "pricing claim"],
  [/\b50\+ (data )?providers\b/i, "50+ providers"],
  [/\bmulti-?lingual\b|\bmulti-?language\b|\bany language\b/i, "languages"],
  [/\bplays\b|\bmultiple campaigns\b|\bcustom sequences?\b/i, "unshipped campaign features"],
  [/@Pancake\b|\bask Pancake in Slack\b|\bSlack (chat|DMs?)\b/i, "Slack chat"],
  [/\bpublish(es|ing)? to WordPress\b|\bWordPress (site|plugin|publishing)\b/i, "WordPress publishing"],
  [/\bsolar leads\b/i, "solar leads"],
  [/\bhiring (their|its|a) first\b/i, "Hiring can't see first hires"],
  [/\b\d+\+|\bhiring (at least |more than |over )?\d+\b|\b(at least|more than|over) \d+ (open )?(roles|jobs|openings|positions|hires)\b/i, "job-count threshold"],
  [/\b(already shopping|ready to buy|in-market|looking to buy|actively (looking|searching))\b/i, "intent overclaim"],
  [/\bwithout your (approval|ok)\b|\bnothing (goes out|is sent|sends) without\b/i, "unscoped approval claim"],
  [/\b(industry|vertical)[- ]specific (AI|model)\b|\btrained on\b/i, "vertical AI claim"],
  [/\b(candidates?|people) (free up|on (our|the) bench)\b/i, "private-fact claim in outreach"],
];

/** Non-US geography (outreach language can't be changed; D23/C12). */
const NON_US = /\b(UK|U\.K\.|United Kingdom|England|London|Europe(an)?|EMEA|Germany|German|Berlin|Munich|France|French|Paris|Spain|Madrid|Canada|Canadian|Toronto|Ireland|Irish|Dublin|Australia|Sydney|India|Singapore|DACH|Nordics?|APAC|LATAM|Netherlands|Amsterdam)\b/;
/** Hard-coded dates go stale. */
const DATE = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]* \d{1,2}\b|\b20\d\d\b|\blast run\b/i;
/** Negation openers: a banned term is allowed in an FAQ answer sentence that starts like this. */
const NEGATION = /^(No\b|Not\b|Never\b|There'?s no\b|There is no\b|Pancake doesn'?t\b|It doesn'?t\b|Pancake never\b|No emails\b)/;
/** Landing-voice rule 5 (warn only). */
const HEDGES = /\b(actually|really|just|very|truly|simply|seamless(ly)?|powerful|robust|comprehensive|high-quality)\b/i;
/** Fixed copy must not name a vertical. */
const FIXED_LEAK = /\b(recruit\w*|placements?|placed|desks?|agenc(y|ies)|candidates?|staffing|talent|clients?|installers?|solar)\b/i;
/** Real brands that must never be a lead company or a workspace (marquee customers + stack tools). */
const REAL_BRANDS = [
  "Hyperspell", "AgentMail", "Fleet", "Requesty", "Alpic", "Praxis", "Kinro", "Covera", "Spacefill", "Kardinal",
  "Salesforce", "HubSpot", "Pipedrive", "Attio", "Close", "Outreach", "Salesloft", "Apollo", "Instantly", "Lemlist",
  "Clay", "ZoomInfo", "Lusha", "Cognism", "Marketo", "Mailchimp", "Klaviyo", "Intercom", "Zendesk", "Gong",
  "Segment", "Amplitude", "Mixpanel", "Webflow", "WordPress", "Notion", "Airtable", "Zapier", "Slack", "Asana",
  "Jira", "Stripe", "Snowflake", "Greenhouse", "Lever", "Workable", "Workday", "Shopify", "Google", "LinkedIn",
];

type Issue = { slug: string; level: "error" | "warn"; msg: string };

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const sentences = (s: string) => s.split(/(?<=[.!?])\s+(?=[A-Z“"'$0-9])/).filter(Boolean).length;
const emDashes = (s: string) => (s.match(/—/g) ?? []).length;

/** Every per-vertical string that renders, with its field path (for lint messages). */
function renderedStrings(v: VerticalConfig): [string, string][] {
  const out: [string, string][] = [
    ["name.plural", v.name.plural], ["name.title", v.name.title], ["name.short", v.name.short], ["name.badge", v.name.badge],
    ["meta.seoTitle", v.meta.seoTitle], ["hubLine", v.hubLine], ["hero.h1[0]", v.hero.h1[0]], ["hero.h1[1]", v.hero.h1[1]],
    ["hero.lede", v.hero.lede], ["workspace.name", v.workspace.name], ["workspace.sender", v.workspace.sender],
    ["demo.h2", v.demo.h2], ["signals.h2", v.signals.h2], ["cta.title", v.cta.title],
  ];
  v.demo.prompts.forEach((p, i) => {
    out.push([`prompts[${i}].text`, p.text], [`prompts[${i}].reply`, p.reply], [`prompts[${i}].why`, p.featured.why], [`prompts[${i}].message`, p.message]);
    p.proposal.forEach((r, j) => r.items.forEach((it, k) => out.push([`prompts[${i}].proposal[${j}].items[${k}]`, it])));
    p.leads.forEach((l, j) => out.push([`prompts[${i}].leads[${j}]`, `${l.name} ${l.role} ${l.company} ${l.signal}`]));
  });
  v.signals.cards.forEach((c, i) => {
    out.push([`signals.cards[${i}].title`, c.title], [`signals.cards[${i}].body`, c.body]);
    c.watching.forEach((w, j) => out.push([`signals.cards[${i}].watching[${j}]`, w]));
  });
  v.faq.forEach((f, i) => out.push([`faq[${i}].q`, f.q], [`faq[${i}].a`, f.a]));
  return out;
}

export function validateVerticals(all: VerticalConfig[]): Issue[] {
  const issues: Issue[] = [];
  const err = (slug: string, msg: string) => issues.push({ slug, level: "error", msg });
  const warn = (slug: string, msg: string) => issues.push({ slug, level: "warn", msg });
  const max = (slug: string, path: string, s: string, n: number) => s.length > n && err(slug, `${path} is ${s.length} chars (max ${n}): "${s}"`);

  const slugs = new Set<string>();
  const seen = { h1: new Map<string, string>(), lede: new Map<string, string>(), title: new Map<string, string>(), person: new Map<string, string>(), company: new Map<string, string>(), workspace: new Map<string, string>() };
  const once = (bucket: Map<string, string>, key: string, slug: string, what: string) => {
    const k = key.toLowerCase();
    const prev = bucket.get(k);
    if (prev && prev !== slug) err(slug, `${what} "${key}" already used by ${prev}`);
    else bucket.set(k, slug);
  };

  for (const v of all) {
    const s = v.slug;
    // ── identity ──
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)) err(s, "slug must be kebab-case");
    if (slugs.has(s)) err(s, "duplicate slug"); slugs.add(s);
    if (!CATEGORIES.includes(v.category)) err(s, `unknown category ${v.category}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.updated)) err(s, "updated must be YYYY-MM-DD");
    max(s, "name.plural", v.name.plural, 32); max(s, "name.title", v.name.title, 32); max(s, "name.short", v.name.short, 22); max(s, "name.badge", v.name.badge, 26);
    if (!v.name.badge.startsWith("For ")) err(s, 'name.badge starts with "For "');
    if (!v.meta.seoTitle.startsWith("Pancake for ")) err(s, 'meta.seoTitle starts with "Pancake for "');
    max(s, "meta.seoTitle", v.meta.seoTitle, 60);
    // "AI" only as part of the vertical's own name ("AI startups"), never as Pancake's category (founder 2026-09-22).
    const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const noName = (x: string) => x.replace(new RegExp(esc(v.name.title), "ig"), "").replace(new RegExp(esc(v.name.plural), "ig"), "");
    if (/\bAI\b/.test(noName(v.meta.seoTitle))) err(s, 'meta.seoTitle: no "AI" outside the vertical name');
    if (/\bAI\b/.test(v.hero.h1.join(" "))) warn(s, 'hero.h1 mentions "AI": fine only for the customer\'s product, never for Pancake');
    max(s, "hubLine", v.hubLine, 64);
    // ── hero ──
    v.hero.h1.forEach((l, i) => { max(s, `hero.h1[${i}]`, l, 22); if (/[.!?]$/.test(l)) err(s, `hero.h1[${i}] must not end with punctuation (homepage H1 has none)`); });
    if (!/^We bring you /.test(v.hero.h1[1])) warn(s, 'hero.h1[1] off-pattern ("We bring you …")');
    max(s, "hero.lede", v.hero.lede, 126);
    if (words(v.hero.lede) > 30) err(s, "hero.lede over 30 words");
    once(seen.h1, v.hero.h1[0], s, "H1 line 1"); once(seen.lede, v.hero.lede, s, "lede"); once(seen.title, v.meta.seoTitle, s, "seoTitle");
    once(seen.workspace, v.workspace.name, s, "workspace");
    max(s, "workspace.name", v.workspace.name, 20);
    // ── demo ──
    max(s, "demo.h2", v.demo.h2, 40); if (words(v.demo.h2) > 8) err(s, "demo.h2 over 8 words");
    const primary = v.demo.prompts.map((p) => p.kind);
    if (new Set(primary).size !== 3) err(s, "the 3 prompts need 3 different primary kinds");
    const lens = v.demo.prompts.map((p) => p.text.length);
    if (Math.max(...lens) - Math.min(...lens) > 12) warn(s, `prompt lengths ${lens.join("/")} differ by >12 chars (card heights)`);
    v.demo.prompts.forEach((p, i) => {
      const at = `prompts[${i}]`;
      max(s, `${at}.text`, p.text, 96); max(s, `${at}.reply`, p.reply, 88);
      if (!/^I'll |^I’ll /.test(p.reply)) warn(s, `${at}.reply should start "I'll"`);
      if (sentences(p.reply) !== 1) err(s, `${at}.reply must be one sentence`);
      if (p.proposal.length < 3 || p.proposal.length > 4) err(s, `${at}.proposal needs 3–4 rows`);
      if (p.proposal[0]?.kind !== p.kind) err(s, `${at}.proposal[0].kind must equal the prompt kind`);
      if (new Set(p.proposal.map((r) => r.kind)).size !== p.proposal.length) err(s, `${at}.proposal kinds must be unique`);
      p.proposal.forEach((r, j) => {
        if (!KINDS.includes(r.kind)) err(s, `${at}.proposal[${j}] bad kind`);
        if (r.items.length < 1 || r.items.length > 3) err(s, `${at}.proposal[${j}] needs 1–3 items`);
        r.items.forEach((it) => max(s, `${at}.proposal[${j}] item`, it, 28));
      });
      if (p.leads.length !== 5) err(s, `${at} needs exactly 5 leads`);
      const proposed = p.proposal.map((r) => r.kind);
      p.leads.forEach((l, j) => {
        if (!proposed.includes(l.kind)) err(s, `${at}.leads[${j}].kind ${l.kind} is not in the proposal`);
        max(s, `${at}.leads[${j}].signal`, l.signal, 24);
        if (!/^\S+ \S+/.test(l.name)) err(s, `${at}.leads[${j}].name needs first + last`);
        once(seen.person, l.name, s, "person"); once(seen.company, l.company, s, "company");
        if (REAL_BRANDS.some((b) => l.company.toLowerCase() === b.toLowerCase())) err(s, `real brand as company: ${l.company}`);
      });
      if (p.leads[0].kind !== p.kind) warn(s, `${at}.leads[0] (featured) usually carries the prompt kind`);
      max(s, `${at}.featured.why`, p.featured.why, 150);
      if (sentences(p.featured.why) > 2) err(s, `${at}.featured.why max 2 sentences`);
      if (!Number.isInteger(p.featured.confidence) || p.featured.confidence < 80 || p.featured.confidence > 96) err(s, `${at}.featured.confidence 80–96`);
      max(s, `${at}.message`, p.message, 280);
      const first = p.leads[0].name.split(" ")[0];
      if (!p.message.startsWith(`Hi ${first},`)) err(s, `${at}.message starts "Hi ${first},"`);
    });
    // ── signals ──
    max(s, "signals.h2", v.signals.h2, 40); if (words(v.signals.h2) > 8) err(s, "signals.h2 over 8 words");
    if (new Set(v.signals.cards.map((c) => c.kind)).size !== 4) err(s, "signals.cards need 4 different kinds");
    v.signals.cards.forEach((c, i) => {
      max(s, `signals.cards[${i}].title`, c.title, 32); max(s, `signals.cards[${i}].body`, c.body, 110);
      if (sentences(c.body) !== 1) err(s, `signals.cards[${i}].body must be one sentence`);
      if (c.kind === "stack" && !/job post/i.test(c.body)) err(s, 'stack card body must say "job post(s)"');
      if (c.kind === "stack" && /mention[^.]* and /i.test(c.body)) err(s, "Stack matches OR, never AND");
      if (c.watching.length < 1 || c.watching.length > 4) err(s, `signals.cards[${i}].watching 1–4 items`);
      c.watching.forEach((w) => max(s, `signals.cards[${i}].watching`, w, 22));
      if ((c.more ?? 0) < 0 || (c.more ?? 0) > 9) err(s, `signals.cards[${i}].more 0–9`);
    });
    // ── faq / related / cta ──
    if (v.faq.length < 3 || v.faq.length > 4) err(s, "faq needs 3–4 vertical items");
    v.faq.forEach((f, i) => { max(s, `faq[${i}].q`, f.q, 70); max(s, `faq[${i}].a`, f.a, 240); if (!f.q.endsWith("?")) err(s, `faq[${i}].q ends with "?"`); if (sentences(f.a) > 3) err(s, `faq[${i}].a max 3 sentences`); });
    if (v.related.length < 3 || v.related.length > 5) err(s, "related needs 3–5 slugs");
    if (v.related.includes(s)) err(s, "related includes itself");
    if (new Set(v.related).size !== v.related.length) err(s, "related has duplicates");
    max(s, "cta.title", v.cta.title, 28);

    // ── lints over every rendered string ──
    for (const [path, str] of renderedStrings(v)) {
      const isFaqAnswer = /^faq\[\d+\]\.a$/.test(path);
      for (const [re, label] of BANNED) {
        if (!re.test(str)) continue;
        if (isFaqAnswer) {
          const bad = str.split(/(?<=[.!?])\s+/).some((sent) => re.test(sent) && !NEGATION.test(sent.trim()));
          if (!bad) continue;
        }
        err(s, `${path}: banned (${label}): "${str}"`);
      }
      if (NON_US.test(str)) err(s, `${path}: non-US geography: "${str}"`);
      if (DATE.test(str)) err(s, `${path}: hard-coded date: "${str}"`);
      if (/\bpancake\b/.test(str)) err(s, `${path}: lowercase "pancake"`);
      if (emDashes(str) > 1) err(s, `${path}: more than one em dash`);
      if (HEDGES.test(str)) warn(s, `${path}: hedge word (landing-voice rule 5): "${str}"`);
    }
  }

  // ── cross-config ──
  for (const v of all) for (const r of v.related) if (!slugs.has(r)) err(v.slug, `related slug "${r}" does not exist`);
  const linked = new Set(all.flatMap((v) => v.related));
  for (const v of all) if (all.length > 1 && !linked.has(v.slug)) warn(v.slug, "no other page links here (hub only)");

  // ── fixed copy must stay vertical-neutral ──
  const fixedText = JSON.stringify(FIXED, (_k, val) => (typeof val === "function" ? String(val) : val));
  const leak = fixedText.replace(/SIGNAL_\w+|"hiring"|"Hiring"/g, "").match(FIXED_LEAK);
  if (leak) err("vx-copy", `fixed copy names a vertical: "${leak[0]}"`);

  return issues;
}

/** Called from lib/verticals/index.ts at module load. */
export function assertVerticals(all: VerticalConfig[]): void {
  const issues = validateVerticals(all);
  for (const i of issues.filter((x) => x.level === "warn")) console.warn(`[verticals] warn ${i.slug}: ${i.msg}`);
  const errors = issues.filter((x) => x.level === "error");
  if (errors.length) throw new Error(`[verticals] ${errors.length} error(s):\n` + errors.map((e) => `  ${e.slug}: ${e.msg}`).join("\n"));
}
