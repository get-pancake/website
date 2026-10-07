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
 * A sentence that opens on a negation ("It doesn't …", "No …") may name a boundary (email,
 * phone, CRM, website visitors), as in a "What doesn't Pancake do?" answer.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
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
  "components/sections/landing-v3/LpFeatures.tsx",
  "components/sections/landing-v3/LpBanner.tsx",
  "components/sections/landing-v3/LpCta.tsx",
  "components/sections/landing-v3/LpPricing.tsx",
  "components/sections/guide-claude/guide-copy.ts",
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
  // the f4 animation's alt describes its mock chart, "+56% reply rate vs last period", which
  // the founder kept (2026-10-08); the rate rule still reads every other line of copy
  [OFF_FOR.rates[0], /\ba reply rate 56% up versus last period\b/g],
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
for (const h of hits) console.log(`ERROR  ${h}`);
console.log(`homepage-lint: ${files.length} file(s), ${count} string(s), ${hits.length} error(s)`);
process.exit(hits.length ? 1 : 0);
