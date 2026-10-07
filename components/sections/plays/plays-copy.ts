// components/sections/plays/plays-copy.ts — every fixed string of /plays (the example-Plays gallery).
// The example requests themselves are not here: they are the 120 approved /for prompts
// (lib/verticals/data/*.ts demo.prompts), read through plays-data.ts and shown verbatim.
//
// Copy rules this file follows (audit plan 3.7, 2026-10-07): the outreach platform is never
// named and its steps are never listed (validate.ts PLATFORM / SEQUENCE); "Play" and
// "sequence", never "campaign"; "You approve every lead"; the price is "$99 a month per
// workspace"; nothing promises results; no email outreach, CRM sync, website visitors, phone
// lookup or calls; landing-voice budgets (headline ≤ 8 words, body ≤ 35 words).
// "More ways" (2026-10-07, founder: anything that exists in the app's code can be pitched, even
// if it is not switched on — D27): funding rounds, lookalikes, role match, web evidence and one
// post's reactions are in pancake-cmo's lead finders (Dealroom/Coresignal, Ocean.io, Coresignal
// personas, Linkup, post reactors) but no /for prompt uses them yet, so they get their own set.

import type { SignalKind } from "@/lib/verticals/types";

export const PLAYS_PATH = "/plays";

/* ─── head ──────────────────────────────────────────────────────────────────── */

const PLAYS_EXAMPLES = (n: number) => (n === 1 ? "example" : "examples");

export const PLAYS_HEAD = {
  eyebrow: "Example Plays",
  h1: "Tell Pancake who to reach.",
  lede: "It builds the Play. Start from an example, or write your own.",
  /** The caps label over the jump links (one per group, then "More ways"). */
  jumpLabel: "How the Play finds people",
  /** A group's count ("38 examples"); the jump links show the number and read the word. */
  count: (n: number) => `${n} ${PLAYS_EXAMPLES(n)}`,
  examples: (n: number) => PLAYS_EXAMPLES(n),
};

/* ─── groups: one per signal kind, in app order (vx-copy SIGNAL_GROUPS) ─────── */

export const PLAYS_GROUPS: Record<SignalKind, { title: string; line: string }> = {
  keyword: {
    title: "People posting about a topic.",
    line: "Name the topics your buyers post about. Pancake finds the people writing about them.",
  },
  competitor: {
    title: "People engaging with your rivals.",
    line: "Name your competitors. Pancake finds the people engaging with their posts.",
  },
  influencer: {
    title: "People engaging with experts.",
    line: "Name the voices your market listens to. Pancake finds the people engaging with their posts.",
  },
  own_brand: {
    title: "People engaging with your posts.",
    line: "Add your own profile or company page. Pancake turns the people engaging with your posts into leads.",
  },
  hiring: {
    title: "Companies hiring a role.",
    line: "Name a role. Pancake finds companies with open job posts for it, then the people you sell to there.",
  },
  stack: {
    title: "Companies using a tool.",
    line: "Name a tool. Pancake finds companies whose job posts ask for it, then the people you sell to there.",
  },
};

/** Examples shown per group before the "Show more" disclosure (3 rows of 2 on desktop). */
export const PLAYS_VISIBLE = 6;

export const PLAYS_MORE = {
  show: (n: number) => `Show ${n} more`,
  hide: "Show fewer",
};

/* ─── More ways (what the app's lead finders do that no /for prompt shows yet) ── */

export type PlaysWay = {
  /** Kit badge text (neutral tone: these are not the six signal kinds). ≤ 3 words. */
  label: string;
  /** Card title, ≤ 32 chars (the signal-card budget). */
  title: string;
  /** One sentence, ≤ 110 chars. */
  body: string;
  /** An example request in the /for prompt style: first person, US, ≤ 96 chars. Invented names. */
  example: string;
  /** Anchor id (ItemList JSON-LD points here). */
  id: string;
};

export const PLAYS_WAYS = {
  id: "more-ways",
  eyebrow: "Also in Plays",
  /** The jump link's badge in the head. */
  jump: "More ways",
  h2: "More ways Pancake finds people.",
  lede: "Ask for any of them in your own words. Pancake builds the Play.",
  exampleLabel: "Example",
  cards: [
    {
      id: "way-funding",
      label: "Funding",
      title: "Companies with fresh funding.",
      body: "Pancake finds companies with a recent funding round, then the people you sell to there.",
      example: "We set up finance teams. Find the CEOs of US software startups that recently raised a round.",
    },
    {
      id: "way-lookalikes",
      label: "Lookalikes",
      title: "Companies like one you name.",
      body: "Name your best customer. Pancake finds companies that look like it, then the people you sell to.",
      example: "Our best customer is Tarnwick Freight. Find US companies like it and their heads of operations.",
    },
    {
      id: "way-role",
      label: "Role match",
      title: "People by role and company.",
      body: "Pick a role, an industry, a company size and a location. Pancake finds the people who match.",
      example: "Find heads of operations at US logistics companies with 50 to 500 people.",
    },
    {
      id: "way-web",
      label: "Web evidence",
      title: "Facts from the web, with links.",
      body: "Ask about anything a company says online. Pancake checks the web and links the source for each one.",
      example: "Find US hotel groups that publish a sustainability report. Link each report.",
    },
    {
      id: "way-post",
      label: "One post",
      title: "People who reacted to one post.",
      body: "Paste a post’s link. Pancake turns the people who reacted into leads that fit your ICP.",
      example: "This post on SOC 2 audits took off. Find the US CTOs who reacted to it.",
    },
  ] satisfies PlaysWay[],
  foot: "Whatever the source, Pancake checks every lead against your ICP and tells you why it fits.",
};

/* ─── FAQ (visible <details> + the FAQPage JSON-LD, verbatim) ──────────────── */

export const PLAYS_FAQ = {
  eyebrow: "FAQ",
  h2: "Questions about Plays.",
  items: [
    {
      q: "What is a Play?",
      a: "A saved search for one audience. Tell Pancake who to reach in one sentence. It plans who to find, how to find them and how many, then searches again every night.",
    },
    {
      q: "Do I need to know what to run?",
      a: "No. Say who you want to reach, in your own words. Pancake asks what it needs, then builds the Play: who to find, how to find them and how many.",
    },
    {
      q: "How many leads does a Play find?",
      a: "Each search keeps up to 50 new leads. Every Play searches again each night.",
    },
    {
      q: "Do I approve leads before anyone is contacted?",
      a: "Yes. You approve every lead. Pancake contacts only the leads you approve, and every lead comes with why it fits.",
    },
    {
      q: "What happens after I approve a lead?",
      a: "Pancake writes a personal message from why the lead fits, then sends it under your name after a light warm-up. Read or edit any draft first. A reply stops the sequence.",
    },
    {
      q: "Can I start a Play from Claude or Codex?",
      a: "Yes. Connect Pancake to Claude, Claude Code or Codex with a browser sign-in, no API key. Ask for a Play in the chat, and Pancake builds it.",
    },
    {
      q: "What doesn’t Pancake do?",
      a: "It doesn’t send outreach by email, sync to your CRM, identify website visitors, find phone numbers or make calls.",
    },
  ],
};

/* ─── closing CTA card (LpCta props; the pricing card keeps the /for checklist) ─ */

/** "$99 a month per workspace" (never "flat": buyers read it as covering a second workspace,
 *  2026-10-06). The first search starts when the Play is created (pancake-cmo PAN-1574), so
 *  "runs right away" replaces "First leads arrive tomorrow morning" (audit plan §5). */
export const PLAYS_CTA = {
  title: "Write your first Play.",
  body: ["$99 a month per workspace.", "Your first search runs right away."] as [string, string],
};

/* ─── titles / meta ─────────────────────────────────────────────────────────── */

export const PLAYS_META = {
  title: "Example Plays · Pancake",
  ogTitle: "Example Plays · Pancake",
  /** n = example prompts, m = /for audiences they come from (both counted from the registry).
   *  "kinds of B2B business", not "industries": several audiences are roles (2026-10-07). */
  description: (n: number, m: number) =>
    `${n} example Plays for ${m} kinds of B2B business, sorted by how Pancake finds people. Pick one, or tell Pancake who to reach in your own words.`,
  /** Every page on /og-image.png describes the text in that image (audit plan 8.4). */
  ogImageAlt: "You run your company. We bring you customers.",
  /** The X account the footer and the Organization sameAs link to. */
  xHandle: "@getpancake_ai",
  crumbs: { home: "Home", page: "Example Plays" },
};
