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
  [/\bspend cap\b|\bcan[’']?t overspend\b|\btoken costs?\b|\bunlimited leads\b/i, "pricing claim"],
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
/** Negation openers: a banned term is allowed in an FAQ answer sentence that starts like this.
 *  Curly or straight apostrophe (copy moves to ’, D11 — the allowance must follow it). */
const NEGATION = /^(No\b|Not\b|Never\b|There[’']?s no\b|There is no\b|Pancake doesn[’']?t\b|It doesn[’']?t\b|Pancake never\b|No emails\b)/;
/** Landing-voice rule 5 (warn only). */
const HEDGES = /\b(actually|really|just|very|truly|simply|seamless(ly)?|powerful|robust|comprehensive|high-quality)\b/i;
/** Origami closes every /for lede with "…, not a stale database." — never echo that tagline or a
 *  variant ("not a bought list", "not a bar directory", "not a stale provider list"; critic 2026-09-22). */
const ORIGAMI_TAGLINE = /\bnot an? (stale|bought|purchased|static)\b|\bnot an? [\w’'-]+( [\w’'-]+)? (list|lists|database|directory)\b/i;
/** Fixed copy must not name a vertical. */
const FIXED_LEAK = /\b(recruit\w*|placements?|placed|desks?|agenc(y|ies)|candidates?|staffing|talent|clients?|installers?|solar)\b/i;
/** Real brands that must never be a lead company or a workspace (marquee customers + stack tools). */
const REAL_BRANDS = [
  "Hyperspell", "AgentMail", "Fleet", "Requesty", "Alpic", "Praxis", "Kinro", "Covera", "Spacefill", "Kardinal",
  "Salesforce", "HubSpot", "Pipedrive", "Attio", "Close", "Outreach", "Salesloft", "Apollo", "Instantly", "Lemlist",
  "Clay", "ZoomInfo", "Lusha", "Cognism", "Marketo", "Mailchimp", "Klaviyo", "Intercom", "Zendesk", "Gong",
  "Segment", "Amplitude", "Mixpanel", "Webflow", "WordPress", "Notion", "Airtable", "Zapier", "Slack", "Asana",
  "Jira", "Stripe", "Snowflake", "Greenhouse", "Lever", "Workable", "Workday", "Shopify", "Google", "LinkedIn",
  // CT-07: real DTC brands once used as invented leads (renamed 2026-09-22)
  "Harbor & Hue", "Emberly Candles", "Pawlander",
];

/* ── copy-review rules (2026-09-22 QA round; all warn-only until the content rewrite lands) ── */

/** CT-01: "companies your size" is the stock outbound tell. */
const MSG_SIZE = /\b(your|that) size\b/i;
/** CT-01/CT-08: message 1 asks for a call or a demo (the sequence has two more messages; lead with value). */
const MSG_CALL_ASK = /\b(short|quick) call\b|\b(\d+|ten|fifteen|twenty|thirty) minutes\b|\bcompar(e|ing) notes\b|\bbook a\b|\bdemo\b|\bmeeting\b/i;
/** CT-01 (soft): an "we do X for Y" offer sentence. */
const MSG_OFFER = /\b(we|I) (run|do|help|build|place|plan|fix|automate)\b[^.?!]*\bfor\b/i;
/** CT-04: how many messages site-wide may share the same first 3 words after "Hi {first},". */
const OPENER_MAX = 6;
/** CT-08: a company-signal lead (hiring/stack) has no sighting — the message must not cite the job posts. */
const MSG_COMPANY_SIGNAL = /\bhiring\b|\bjob (post|ad)s?\b|\broles?\b|\bopen(ed|ing)?\b(?! to\b)/i;
/** D11/CT-16/CT-18: a straight apostrophe where a typographic ’ belongs (letter'letter, {x}'s, plural s' ). */
const STRAIGHT_APOS = new RegExp("[\\p{L}}]'\\p{L}|[sS]'(?=\\s)", "u");
/** CT-16/CT-12/D14: lead signal lines the product never writes. */
const SIGNAL_GRAMMAR: [RegExp, string][] = [
  [/^(Commented on|Replied to) [A-Z][\w’'-]+$/, "names a bare surname or company (say whose post: “Commented on a Pike post”)"],
  [/^Replied to\b/, "“Replied to …” (the product sees comments and likes: “Commented on …”)"],
  [/(’|')s post$/, "possessive “…’s post” (use “a {Name} post”)"],
  [/^Job post:|in a job post$|in job ads$/, "stack grammar (must read “{Tool} in job posts”)"],
];

type Issue = { slug: string; level: "error" | "warn"; msg: string };

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const sentences = (s: string) => s.split(/(?<=[.!?])\s+(?=[A-Z“"'$0-9])/).filter(Boolean).length;
const emDashes = (s: string) => (s.match(/—/g) ?? []).length;

/** Every per-vertical string that renders, with its field path (for lint messages). */
function renderedStrings(v: VerticalConfig): [string, string][] {
  const out: [string, string][] = [
    ["name.plural", v.name.plural], ["name.title", v.name.title], ["name.short", v.name.short], ["name.badge", v.name.badge],
    ["meta.seoTitle", v.meta.seoTitle], ["hubLine", v.hubLine], ["hero.title", v.hero.title],
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

/** Every FIXED string (vx-copy), with its export path. Functions contribute the text of their
 *  string and template literals (every branch), each `${…}` rendered as "{x}". */
function fixedStrings(): [string, string][] {
  const out: [string, string][] = [];
  const walk = (val: unknown, path: string): void => {
    if (typeof val === "string") out.push([path, val]);
    else if (typeof val === "function") {
      const lit = /`((?:\\.|[^`\\])*)`|"((?:\\.|[^"\\])*)"/g;
      const src = String(val);
      for (let m = lit.exec(src); m; m = lit.exec(src)) out.push([`${path}()`, (m[1] ?? m[2] ?? "").replace(/\$\{[^}]*\}/g, "{x}")]);
    } else if (Array.isArray(val)) val.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (val && typeof val === "object") for (const [k, x] of Object.entries(val)) walk(x, path ? `${path}.${k}` : k);
  };
  walk({ ...FIXED }, "");
  return out;
}

const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Whole-word, case-insensitive (items of ≤3 chars, like "Go" or "dbt", match case-sensitively). */
const hasTerm = (text: string, term: string) =>
  new RegExp(`(^|[^\\p{L}\\p{N}])${esc(term)}($|[^\\p{L}\\p{N}])`, term.length <= 3 ? "u" : "iu").test(text);
const normLine = (s: string) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();
const lastSentence = (s: string) => s.trim().split(/(?<=[.!?])\s+/).filter(Boolean).pop() ?? "";

export function validateVerticals(all: VerticalConfig[]): Issue[] {
  const issues: Issue[] = [];
  const err = (slug: string, msg: string) => issues.push({ slug, level: "error", msg });
  const warn = (slug: string, msg: string) => issues.push({ slug, level: "warn", msg });
  const max = (slug: string, path: string, s: string, n: number) => s.length > n && err(slug, `${path} is ${s.length} chars (max ${n}): "${s}"`);

  const slugs = new Set<string>();
  /** Cross-config copy repetition (CT-04, CT-09/CT-21): key → first user(s). */
  const closings = new Map<string, string>();
  const openers = new Map<string, string[]>();
  const ledeEnds = new Map<string, string>();
  const seen = { heroTitle: new Map<string, string>(), lede: new Map<string, string>(), title: new Map<string, string>(), person: new Map<string, string>(), company: new Map<string, string>(), workspace: new Map<string, string>() };
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
    const noName = (x: string) => x.replace(new RegExp(esc(v.name.title), "ig"), "").replace(new RegExp(esc(v.name.plural), "ig"), "");
    if (/\bAI\b/.test(noName(v.meta.seoTitle))) err(s, 'meta.seoTitle: no "AI" outside the vertical name');
    if (/\bAI\b/.test(noName(v.hero.title ?? ""))) warn(s, 'hero.title mentions "AI": fine only for the customer\'s product, never for Pancake');
    max(s, "hubLine", v.hubLine, 64);
    // ── hero (the functional H1, founder 2026-09-22) ──
    const title = typeof v.hero.title === "string" ? v.hero.title.trim() : "";
    if (!title) err(s, "hero.title is required");
    else {
      max(s, "hero.title", title, 56);
      if (!/^Find /.test(title)) err(s, `hero.title starts with "Find ": "${title}"`);
      if (!title.endsWith(".")) err(s, `hero.title ends with a period: "${title}"`);
      if (sentences(title) !== 1) err(s, `hero.title must be one sentence: "${title}"`);
      once(seen.heroTitle, title, s, "hero.title");
    }
    max(s, "hero.lede", v.hero.lede, 150);
    if (words(v.hero.lede) > 30) err(s, "hero.lede over 30 words");
    once(seen.lede, v.hero.lede, s, "lede"); once(seen.title, v.meta.seoTitle, s, "seoTitle");
    // CT-09/CT-21: the lede's closing sentence is the meta description's last word — no two pages share it.
    {
      const end = lastSentence(v.hero.lede);
      const prev = ledeEnds.get(normLine(end));
      if (prev) warn(s, `hero.lede last sentence already used by ${prev}: "${end}"`);
      else ledeEnds.set(normLine(end), s);
    }
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
        for (const [re, why] of SIGNAL_GRAMMAR) if (re.test(l.signal)) warn(s, `${at}.leads[${j}].signal ${why}: "${l.signal}"`);
        if (l.kind === "stack" && !/ in job posts$/.test(l.signal) && !/^Job post:|in a job post$|in job ads$/.test(l.signal)) {
          warn(s, `${at}.leads[${j}].signal stack grammar (must read “{Tool} in job posts”): "${l.signal}"`);
        }
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
      // ── message copy review (warn-only; see the promotion list in the QA report) ──
      const msg = p.message;
      const hit = (re: RegExp) => msg.match(re)?.[0];
      if (hit(MSG_SIZE)) warn(s, `${at}.message says "${hit(MSG_SIZE)}" (CT-01: name the fact, not the size)`);
      if (hit(MSG_CALL_ASK)) warn(s, `${at}.message asks for a call/demo ("${hit(MSG_CALL_ASK)}"): message 1 leads with value`);
      if (hit(MSG_OFFER)) warn(s, `${at}.message soft: offer sentence "${hit(MSG_OFFER)}…"`);
      const lead0 = p.leads[0];
      if (lead0.kind === "hiring" || lead0.kind === "stack") {
        const co = lead0.company;
        const coFirst = co.split(/\s+/)[0];
        const terms = [co, ...(co.includes(" ") && coFirst.length >= 5 ? [coFirst] : [])];
        const items = p.proposal.filter((r) => r.kind === "hiring" || r.kind === "stack").flatMap((r) => r.items);
        const found = [
          ...terms.filter((t) => hasTerm(msg, t)).map((t) => `company "${t}"`),
          ...items.filter((t) => hasTerm(msg, t)).map((t) => `proposal item "${t}"`),
          ...(hit(MSG_COMPANY_SIGNAL) ? [`"${hit(MSG_COMPANY_SIGNAL)}"`] : []),
        ];
        if (found.length) warn(s, `${at}.message cites a ${lead0.kind} sighting the product doesn't have (${found.join(", ")})`);
      }
      // CT-04: closing line unique site-wide; opener template (first 3 words after the greeting) counted.
      const close = lastSentence(msg);
      const prevClose = closings.get(normLine(close));
      if (prevClose) warn(s, `${at}.message closing line already used by ${prevClose}: "${close}"`);
      else closings.set(normLine(close), `${s}#${i}`);
      let body = msg.replace(/^Hi [^,]+,\s*/, "");
      for (const t of [lead0.company, lead0.company.split(/\s+/)[0]]) if (t.length >= 4) body = body.replace(new RegExp(esc(t), "g"), "{company}");
      body = body.replace(new RegExp(`\\b${esc(first)}\\b`, "g"), "{first}");
      const opener = normLine(body).split(" ").slice(0, 3).map((w) => w.replace(/[,.!?:;]+$/, "")).join(" ");
      openers.set(opener, [...(openers.get(opener) ?? []), `${s}#${i}`]);
    });
    // ── signals ──
    max(s, "signals.h2", v.signals.h2, 40); if (words(v.signals.h2) > 8) err(s, "signals.h2 over 8 words");
    if (new Set(v.signals.cards.map((c) => c.kind)).size !== 4) err(s, "signals.cards need 4 different kinds");
    const fansOf = v.signals.cards.filter((c) => /^Fans of\b/.test(c.title));
    if (fansOf.length > 1) warn(s, `${fansOf.length} signals card titles start "Fans of" (CT-13: one per page): ${fansOf.map((c) => `"${c.title}"`).join(", ")}`);
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
      if (ORIGAMI_TAGLINE.test(str)) err(s, `${path}: echoes Origami’s “not a stale database” tagline: "${str}"`);
      if (STRAIGHT_APOS.test(str)) warn(s, `${path}: straight apostrophe (use ’): "${str}"`);
    }
  }

  // ── message openers: one template may not carry the site (CT-04) ──
  for (const [opener, users] of Array.from(openers.entries()).sort((a, b) => b[1].length - a[1].length)) {
    if (users.length > OPENER_MAX) warn("site", `message opener "${opener} …" used ${users.length}× (max ${OPENER_MAX}): ${users.join(", ")}`);
  }

  // ── cross-config ──
  for (const v of all) for (const r of v.related) if (!slugs.has(r)) err(v.slug, `related slug "${r}" does not exist`);
  const linked = new Set(all.flatMap((v) => v.related));
  for (const v of all) if (all.length > 1 && !linked.has(v.slug)) warn(v.slug, "no other page links here (hub only)");

  // ── fixed copy must stay vertical-neutral ──
  // VX_HUB is exempt: it renders on /for only, where naming industries is the point.
  const fixedText = JSON.stringify(FIXED, (k, val) => (k === "VX_HUB" ? undefined : typeof val === "function" ? String(val) : val));
  const leak = fixedText.replace(/SIGNAL_\w+|"hiring"|"Hiring"/g, "").match(FIXED_LEAK);
  if (leak) err("vx-copy", `fixed copy names a vertical: "${leak[0]}"`);
  for (const [path, str] of fixedStrings()) if (STRAIGHT_APOS.test(str)) warn("vx-copy", `${path}: straight apostrophe (use ’): "${str}"`);

  return issues;
}

/** Called from lib/verticals/index.ts at module load. */
export function assertVerticals(all: VerticalConfig[]): void {
  const issues = validateVerticals(all);
  for (const i of issues.filter((x) => x.level === "warn")) console.warn(`[verticals] warn ${i.slug}: ${i.msg}`);
  const errors = issues.filter((x) => x.level === "error");
  if (errors.length) throw new Error(`[verticals] ${errors.length} error(s):\n` + errors.map((e) => `  ${e.slug}: ${e.msg}`).join("\n"));
}
