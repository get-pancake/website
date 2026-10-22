#!/usr/bin/env node
/**
 * Homepage lint (site audit 2.7, 2026-10-07) — the /for copy rules over the homepage's own
 * copy and the Claude guide. The /for pages fail the build on a banned claim
 * (lib/verticals/validate.ts); the homepage sections were checked by nothing, which is how
 * "ready to buy" shipped there. Runs before every build (package.json "prebuild").
 *
 *   node scripts/homepage-lint.mjs              # the files below
 *   node scripts/homepage-lint.mjs a.tsx b.ts   # any other files
 *   node scripts/homepage-lint.mjs --dump       # print every string it reads
 *
 * What it reads: every string the files can render, taken from the TypeScript syntax tree
 * (string and template literals, JSX text, copy-bearing JSX attributes such as alt and
 * aria-label). Comments, imports, types, comparisons (`x === "agents"`), class names, ids and
 * other code-like strings (no space, with - _ . / # : and the like) are skipped, so a code
 * identifier never trips a rule.
 *
 * Rules (any hit fails):
 *   - CAMPAIGN, PLATFORM and SEQUENCE from validate.ts: "Play" / "sequence", never "campaign";
 *     the network is never named; no visit / like / invite / "nice to connect" steps.
 *   - BANNED from validate.ts, minus five /for-only rules that this copy legitimately crosses,
 *     each replaced by a narrower one (OFF_FOR below): "agents" (the homepage and the guide speak
 *     to AI agents by design), "email" and "phone" (the morning email digest and Claude on your
 *     phone are real; email outreach and phone lookups are not), "rates" (each Play shows its
 *     reply rate; a rate CLAIM is still banned), "guarantee / instant" (a setup time is fine;
 *     guarantees, "instant" and leads "in minutes" are not). "GitHub Copilot" names a client.
 *   - ORIGAMI_TAGLINE from validate.ts (never echo "not a stale database").
 *   - EXTRA: the old domain, and "AI GTM team" as what Pancake is.
 *   - BENTO KPI: every KPI card of lp-bento-data.ts, as "value label", must be on BENTO_KPI_ALLOW,
 *     a sourced allow-list of customer-stated figures (default run only).
 * A sentence that opens on a negation ("It doesn't …", "No …") may name a boundary (email,
 * phone, CRM, website visitors), as in a "What doesn't Pancake do?" answer.
 */
import { createRequire } from "node:module";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const req = createRequire(join(ROOT, "package.json"));
const ts = req("typescript");
const jiti = req("jiti")(join(ROOT, "index.js"), { alias: { "@": ROOT }, interopDefault: true, cache: false });
const { BANNED, CAMPAIGN, ORIGAMI_TAGLINE, PLATFORM, SEQUENCE } = jiti("./lib/verticals/validate.ts");

/** The homepage sections' copy (the demo tour is lib/verticals/home-demo.ts, which validate.ts
 *  already checks) and the Claude guide's copy. */
const FILES = [
  "components/sections/landing-v3/LpSteps.tsx",
  "components/sections/landing-v3/lp-step-data.ts",
  "components/sections/landing-v3/LpBanner.tsx",
  "components/sections/landing-v3/LpInfra.tsx",
  // the infra-first page (2026-10-21)
  "components/sections/landing-v3/LpSetupLine.tsx",
  "components/sections/landing-v3/LpBuild.tsx",
  "components/sections/landing-v3/LpBuildAnim.tsx",
  "components/sections/landing-v3/LpCta.tsx",
  "components/sections/landing-v3/LpPricing.tsx",
  "components/sections/guide-claude/guide-copy.ts",
  // the footer's Features column (2026-10-17): the connect pages and the signal pages' copy
  "components/sections/guide-claude/connect-copy.ts",
  "components/sections/plays/plays-signals.ts",
  // site chrome (2026-10-07): the nav menus and the /compare hub. Not yet
  // LpFooter.tsx or compare-data.ts: both fail today until D23 (the platform label) and the
  // Viktor lede are decided.
  "components/sections/landing-v3/LpNav.tsx",
  "components/sections/compare/compare-copy.ts",
  // V2 Figma replication (2026-10-09): every new homepage copy file (the list must never point
  // at a missing file: readFileSync would throw). The feature cards' LpFeatures.tsx left with
  // the cards (2026-10-11).
  // demo window (demo-scroll)
  "components/sections/landing-v3/LpDemo.tsx",
  "components/sections/landing-v3/lp-demo-data.ts",
  // customers band + steps (logos-steps)
  "components/sections/landing-v3/LpMarquee.tsx",
  "components/sections/landing-v3/lp-steps-content.ts",
  "components/sections/landing-v3/LpStepMocks.tsx", // the step mocks' markup: stops a string written straight into it
  // deep-dive carousel shell (blue-band) and its four stories
  "components/sections/landing-v3/LpDive.tsx",
  "components/sections/landing-v3/lp-dive-data.ts",
  "components/sections/landing-v3/LpStorySources.tsx",
  "components/sections/landing-v3/lp-story-sources-data.ts",
  "components/sections/landing-v3/LpStoryMessage.tsx",
  "components/sections/landing-v3/lp-story-message-data.ts",
  "components/sections/landing-v3/LpStoryLearns.tsx",
  "components/sections/landing-v3/lp-story-learns-data.ts",
  "components/sections/landing-v3/LpStoryClaude.tsx",
  "components/sections/landing-v3/lp-story-claude-data.ts",
  // testimonials / KPI bento (bento); its placeholder module stays out on purpose
  "components/sections/landing-v3/LpBento.tsx",
  "components/sections/landing-v3/lp-bento-data.ts",
  // agents view (agents-view)
  "components/sections/landing-v3/LpAudienceHeadline.tsx",
  "components/sections/landing-v3/LpAgentStart.tsx",
  "components/sections/landing-v3/LpAgentPrompt.tsx",
  "components/sections/landing-v3/lp-agents-wall-data.ts",
  "components/sections/landing-v3/LpAgentLab.tsx", // section aria-label, transcript list label
  "components/sections/landing-v3/LpAgentCaptcha.tsx", // the puzzle's strings (moved out of LpAgentLab)
];

/* ── rules ─────────────────────────────────────────────────────────────────── */

/** BANNED labels that do not apply off the /for pages, each with its narrower replacement. */
const OFF_FOR = {
  "agents wording": null,
  email: [/\bcold e-?mails?\b|\be-?mail (outreach|sequences?|campaigns?|cadences?)\b|\b(send|sends|sending|write|writes) (an? |cold )?e-?mails?\b|\boutreach (by|over|via) e-?mail\b/i, "email outreach"],
  phone: [/\bphone (numbers?|lookups?)\b|\bmobile numbers?\b|\bdial(er|ing)\b|\bcold call(s|ing)?\b|\b(make|makes|making) calls\b/i, "phone lookup / calls"],
  rates: [/\d+(\.\d+)? ?(%|x|×)[^.]{0,30}\b(response|reply|open) rates?\b|\b(response|reply|open) rates?\b[^.]{0,30}\d+(\.\d+)? ?(%|x|×)|\b(higher|better|boosts?|boosted|doubles?|triples?|increases?|lifts?) (your )?(response|reply|open) rates?\b|(^|\s)\+\d+(\.\d+)? ?%/i, "rate claim"],
  "guarantee / instant": [/\bguarantee(d|s)?\b|\binstant(ly)?\b|\b(leads?|results?|customers?|meetings?|replies)\b[^.]{0,40}\bin (a few |2 |two )?minutes\b/i, "guarantee / instant"],
};
/** Text a rule may not read (names of other products). */
const ALLOW = [
  [/\bco-?pilots?\b/i, /\bGitHub Copilot\b/g],
  // (the f4 "+56% reply rate" alt allowance went with the feature cards, 2026-10-11: the V2
  // "Pancake learns" story shows approved shares, no rate figure)
  // the sources story's hub label, the founder's own figure (2026-10-13: "Mets 30+ data provider
  // sur pancake.ai"); any other "N+" still fails
  [BANNED.find(([, label]) => label === "job-count threshold")[0], /\b30\+ data providers\b/g],
  // the Codex plugin's install id in /codex's commands (2026-10-17): "pancake@pancake" is a
  // marketplace qualifier, not an "@Pancake" mention in Slack
  [BANNED.find(([, label]) => label === "Slack chat")[0], /\bpancake@pancake\b/g],
];
/** Rules a negated sentence may cross (the product's boundaries, said as boundaries). */
const NEGATABLE = new Set(["email outreach", "phone lookup / calls", "CRM sync/export", "website visitors", "local/consumer leads"]);
const NEGATION = /^(No\b|Not\b|Never\b|There[’']?s no\b|There is no\b|Pancake doesn[’']?t\b|It doesn[’']?t\b|Pancake never\b|No emails\b)/;

const RULES = [
  [CAMPAIGN, "campaign: say Play or sequence"],
  [PLATFORM, "names the platform"],
  [SEQUENCE, "platform step"],
  ...BANNED.flatMap(([re, label]) => (label in OFF_FOR ? (OFF_FOR[label] ? [OFF_FOR[label]] : []) : [[re, label]])),
  [ORIGAMI_TAGLINE, "echoes Origami’s “not a stale database” tagline"],
  [/getpancake\.ai/i, "old domain (pancake.ai only)"],
  [/\bAI GTM (team|co-?pilot)s?\b|\bGTM team (that|you hire|of agents)\b/i, "GTM team as what Pancake is"],
];

/* ── strings from the syntax tree ──────────────────────────────────────────── */

/** JSX attributes and object keys whose values are code, never copy. */
const CODE_KEYS = new Set([
  "className", "class", "id", "key", "href", "src", "srcSet", "type", "role", "rel", "target", "sizes", "htmlFor",
  "viewBox", "d", "fill", "stroke", "strokeWidth", "strokeLinecap", "strokeLinejoin", "xmlns", "loading", "decoding",
  "fetchPriority", "width", "height", "as", "variant", "tone", "kind", "ico", "icon", "logo", "ctaId", "blockId",
  "slug", "path", "url", "ease", "selector", "cue", "preserveAspectRatio", "transform", "mask", "clipPath",
]);
/** data-* attributes that CSS shows as text (content: attr(...)); the other data-* are code. */
const COPY_DATA = new Set(["data-label", "data-step", "data-long", "data-short", "data-fold", "data-text", "data-title"]);
const codeLike = (s) => !/\s/.test(s) && /[-_./#:@[\]=()%+<>{}]/.test(s);

function nameOf(node) {
  if (!node) return "";
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isPrivateIdentifier?.(node)) return node.text;
  if (ts.isJsxNamespacedName?.(node)) return `${node.namespace.text}:${node.name.text}`;
  return node.getText?.() ?? "";
}

function skipByContext(node) {
  const p = node.parent;
  if (!p) return false;
  if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isExternalModuleReference(p)) return true;
  if (ts.isLiteralTypeNode(p)) return true;
  if (ts.isPropertyAssignment(p) && p.name === node) return true; // a quoted key
  if (ts.isPropertyAssignment(p) && CODE_KEYS.has(nameOf(p.name))) return true;
  if (ts.isElementAccessExpression(p)) return true;
  if (ts.isBinaryExpression(p) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(p.operatorToken.kind)) return true;
  if (ts.isCaseClause(p)) return true;
  if (ts.isJsxAttribute(p) || (ts.isJsxExpression(p) && p.parent && ts.isJsxAttribute(p.parent))) {
    const attr = ts.isJsxAttribute(p) ? p : p.parent;
    const name = nameOf(attr.name);
    if (CODE_KEYS.has(name)) return true;
    if (name.startsWith("data-") && !COPY_DATA.has(name)) return true;
    if (name.startsWith("aria-") && name !== "aria-label" && name !== "aria-description" && name !== "aria-roledescription") return true;
  }
  return false;
}

function stringsOf(file) {
  const text = readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const out = [];
  const push = (node, s) => {
    const str = s.replace(/\s+/g, " ").trim();
    if (!str || codeLike(str)) return;
    out.push({ line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1, text: str });
  };
  const walk = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (!skipByContext(node)) push(node, node.text);
    } else if (ts.isTemplateExpression(node)) {
      if (!skipByContext(node)) push(node, node.head.text + node.templateSpans.map((s) => `{x}${s.literal.text}`).join(""));
      node.templateSpans.forEach((s) => walk(s.expression));
      return;
    } else if (ts.isJsxText(node)) {
      push(node, node.text);
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return out;
}

/* ── run ───────────────────────────────────────────────────────────────────── */

const args = process.argv.slice(2);
const dump = args.includes("--dump");
const named = args.filter((a) => !a.startsWith("--"));
const files = named.length ? named.map((f) => resolve(f)) : FILES.map((f) => join(ROOT, f));
const hits = [];
let count = 0;
for (const file of files) {
  for (const { line, text } of stringsOf(file)) {
    count++;
    if (dump) console.log(`${relative(ROOT, file)}:${line}  ${text}`);
    for (const [re, label] of RULES) {
      let probe = text;
      for (const [rule, allow] of ALLOW) if (String(rule) === String(re)) probe = probe.replace(allow, "");
      if (!re.test(probe)) continue;
      if (NEGATABLE.has(label)) {
        const bad = probe.split(/(?<=[.!?])\s+/).some((s) => re.test(s) && !NEGATION.test(s.trim()));
        if (!bad) continue;
      }
      hits.push(`${relative(ROOT, file)}:${line}  ${label} ("${probe.match(re)?.[0]}"): "${text.slice(0, 160)}"`);
    }
  }
}
/* Founder 2026-10-09: a fixed frequency ("every night", "nightly") is never said of Pancake.
 * BANNED carries the rule for the files above; these other files that describe Pancake (the
 * compare pages, the homepage's structured data, the Plays and /for FAQs, the pricing copy and
 * the agent-facing text files) are read line by line, comments included, since agents read
 * them as facts. */
const FREQUENCY = /\bevery ?night\b|\beach night\b|\bnightly\b|\b(?:leads?|pipeline|buyers?|contacts?)\b[^.!?\n]{0,70}\b(?:every|each) (?:morning|day)\b|\b(?:every|each) (?:morning|day)\b[^.!?\n]{0,70}\b(?:leads?|Pancake|buyers?)\b|\bleads? (?:land|arrive)s? daily\b|\bdaily leads\b|\bmorning(?:’|')?s? leads\b|\bleads? (?:land|arrive)s? by \d|\bwake up to\b[^.!?\n]{0,30}\bleads?\b/i;
const FREQUENCY_FILES = named.length ? [] : [
  ...readdirSync(join(ROOT, "app")).filter((d) => d.endsWith("-vs-pancake")).map((d) => `app/${d}/page.tsx`),
  "app/page.tsx", "lib/copy.ts", "components/sections/plays/plays-copy.ts",
  "components/sections/verticals/vx-copy.ts", "public/llms.txt", "public/pricing.md",
];
for (const f of FREQUENCY_FILES) {
  readFileSync(join(ROOT, f), "utf8").split("\n").forEach((text, i) => {
    if (FREQUENCY.test(text)) hits.push(`${f}:${i + 1}  fixed frequency ("${text.match(FREQUENCY)[0]}"): "${text.trim().slice(0, 160)}"`);
  });
}
/* Bento KPI cards (V2 4911:762, decisions §9): customer-stated figures. A figure such as "10%+" is
 * code-like to the string reader above and its label sits in another string, so no rule ever sees
 * the pair. They are checked here instead: every KPI card of lp-bento-data.ts, as "value label",
 * must be on this list, each with its source. Anything else fails until a human adds it here.
 * These are the customers' own results, attributed by their logo, never a claim about what Pancake
 * delivers: the "rate claim" and "job-count threshold" (\d+\+) rules still apply everywhere else.
 * Sources: artifacts/landing-v2-figma/specs/updates/_bento-real-testimonials.md (founder 2026-10-11),
 * which also holds the message's wording and link: this repository is public, so neither is here. */
const BENTO_KPI_ALLOW = new Map([
  // Praxis: Diana Khramina's own figure. Stated in a message to Tristan on 2026-09-18 and on
  // camera in her testimonial (Praxis individual cut): "my reply rate is above 10% on most of
  // campaigns I'm running".
  ["10%+ reply rate", "Praxis, Diana Khramina"],
  // Praxis: same message, and the next sentence of the same film: "So it helped me to book at
  // least 10 meetings per week".
  ["10+ meetings booked a week", "Praxis, Diana Khramina"],
  // Kinro: Pierre-Alexandre Kamienny on camera, "Pancake helped me book 15 meetings last week"
  // (merged compilation 61.68–63.72 s). One week, as he says it.
  ["15 meetings booked in a week", "Kinro, Pierre-Alexandre Kamienny"],
  // Vector Legal: its Head of GTM's written statement, relayed by the founder on 2026-10-13
  // (pipeline in 7 days from outreach on high-intent signals). Without its dollar amount since
  // 2026-10-17 (founder: no money in this testimonial). No other record in this repository.
  ["7 days to real pipeline", "Vector Legal, relayed by the founder"],
]);
if (!named.length) {
  const { bentoKpiClaims } = jiti("./components/sections/landing-v3/lp-bento-data.ts");
  for (const claim of bentoKpiClaims()) {
    count++;
    if (dump) console.log(`components/sections/landing-v3/lp-bento-data.ts  (KPI pair)  ${claim}`);
    if (!BENTO_KPI_ALLOW.has(claim)) {
      hits.push(`components/sections/landing-v3/lp-bento-data.ts  bento KPI not on the allow-list ("${claim}"): add it to BENTO_KPI_ALLOW with its source`);
    }
  }
}
for (const h of hits) console.log(`ERROR  ${h}`);
console.log(`homepage-lint: ${files.length} file(s), ${count} string(s), ${hits.length} error(s)`);
process.exit(hits.length ? 1 : 0);
