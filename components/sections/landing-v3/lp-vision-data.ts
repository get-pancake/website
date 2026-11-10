/**
 * The vision homepage's copy (2026-11-09). Every sentence the vision sections render lives here,
 * and every table they draw lives in lp-vision-tables.ts, so scripts/homepage-lint.mjs reads both
 * (FILES). Rendered by LpVision.tsx.
 *
 * The story, in the founder's words: revenue is now an engineering job run by non-engineers; the
 * best revenue teams build their own data warehouse; someone has to do the engineering, and
 * Pancake does. The page says "revenue" where it first said "GTM" (founder, the same day): the
 * headline, the lede and every section line.
 * The page names the hard parts of that engineering (sources, deduplication, matching, history,
 * lineage, crossing) and shows the two layers Pancake builds: the data layer (the tables of
 * companies and people, a datapoint each time a signal lands) and, on top of it, the Brain, the
 * context layer that makes the next best Play possible (founder: "the brain is a context layer on
 * top of a datalayer (enabling next best play)"). It ends on Start free.
 *
 * Rules kept: "your agent" is the visitor's own (Claude, Codex); no person is named and no real
 * company carries an invented fact; the founder's figure "30+ data providers" is written exactly
 * so; no vendor is named for comparison.
 */

/** the hero's lede lives in lib/copy.ts (SITE_DESCRIPTION: it is also the page's description) */
export const VISION_H1: readonly [string, string] = ["Infrastructure powering", "your revenue factory"];

/** what the hero's picture is, for someone who cannot see it */
export const VISION_HERO_ALT =
  "Pancake’s companies table: one row per company, with your CRM deal, your last call or event, an outside signal and the next best Play. Beside it, Claude answers which accounts to work now.";

/** why now, in two lines: the statement that opens the dark band */
export const VISION_STATEMENT: readonly [string, string] = [
  "Revenue is now an engineering job run by non-engineers.",
  "Pancake does the engineering.",
];

export type VisionTone = "yellow" | "purple" | "pink";
export type VisionRowId = "sources" | "tables" | "crossing" | "play";

/** what Pancake does, as four numbered rows, from the sources up to the Play: a verb first, then
 *  two or three lines */
export const VISION_ROWS: readonly { id: VisionRowId; num: string; label: string; tone: VisionTone; title: string; body: string }[] = [
  {
    id: "sources",
    num: "01",
    label: "Sources",
    tone: "yellow",
    title: "Takes in every source",
    body: "Your CRM, your calls, your events and your database come in through connectors Pancake builds. 30+ data providers add the outside signals.",
  },
  {
    id: "tables",
    num: "02",
    label: "Data layer",
    tone: "purple",
    title: "Builds your tables",
    body: "One record per person, tied to their company. Each signal adds a datapoint the day it lands, and nothing is overwritten.",
  },
  {
    id: "crossing",
    num: "03",
    label: "Crossing",
    tone: "pink",
    title: "Crosses your signals",
    body: "A deal you lost last year. The company is now hiring for the role you sell to. Both land on the same row.",
  },
  {
    id: "play",
    num: "04",
    label: "Context layer",
    tone: "yellow",
    title: "Proposes the next best Play",
    body: "The Brain is the context layer on top of your data. It knows who you sell to and what worked. It turns a crossed signal into the next best Play.",
  },
];

/** the line between the rows and the next band */
export const VISION_MID = { title: "See Pancake at work." } as const;

export type VisionProblemId = "sources" | "dedup" | "matching" | "history" | "lineage" | "crossing";

/** the six hard problems: a list, and the one that is open beside it */
export const VISION_PROBLEMS_TITLE: readonly [string, string] = ["Your revenue data has", "6 hard problems."];
export const VISION_PROBLEMS_BODY =
  "The best revenue teams build their own data warehouse to solve them. It takes a warehouse, a tool to get data in, a tool to get data out, and someone to keep the tables right.";
export const VISION_PROBLEMS_LIST_LABEL = "The six hard problems";
export const VISION_PROBLEMS: readonly { id: VisionProblemId; tone: VisionTone; name: string; short: string; line: string; body: string }[] = [
  {
    id: "sources",
    tone: "yellow",
    name: "Sources",
    short: "Data in every tool",
    line: "Every source in one place.",
    body: "Your CRM, your calls, your events and your database, next to signals from 30+ data providers.",
  },
  {
    id: "dedup",
    tone: "purple",
    name: "Deduplication",
    short: "One person, many rows",
    line: "One person, one record.",
    body: "The same buyer is in your CRM, at your event and on a call. Pancake keeps one record.",
  },
  {
    id: "matching",
    tone: "pink",
    name: "Matching",
    short: "People without a company",
    line: "Every person tied to their company.",
    body: "You sell to a company through a person. Pancake keeps the link, and who sits above whom.",
  },
  {
    id: "history",
    tone: "yellow",
    name: "History",
    short: "No record of what changed",
    line: "Every signal, dated.",
    body: "A signal lands and adds a datapoint to the company or the person. Nothing is overwritten.",
  },
  {
    id: "lineage",
    tone: "purple",
    name: "Lineage",
    short: "Buyers who move on",
    line: "Your buyer changes jobs. Pancake follows.",
    body: "A past buyer starts a new role, and their record follows them to the new company.",
  },
  {
    id: "crossing",
    tone: "pink",
    name: "Crossing",
    short: "Signals that never meet",
    line: "Your own data, crossed with outside signals.",
    body: "A deal you lost last year. The company is now hiring for the role you sell to. Both land on the same row.",
  },
];

export type VisionWarehouseId = "builds" | "fresh" | "bill";

/** what Pancake is, as three cards */
export const VISION_WAREHOUSE: {
  title: string;
  cards: readonly { id: VisionWarehouseId; tone: VisionTone; title: string; body: string }[];
} = {
  title: "Pancake is the revenue data warehouse.",
  cards: [
    {
      id: "builds",
      tone: "yellow",
      title: "Builds the tables.",
      body: "Companies and people, from every source you connect. No pipeline for you to write.",
    },
    {
      id: "fresh",
      tone: "purple",
      title: "Keeps them fresh.",
      body: "A signal lands and a datapoint is added the same day. Past buyers are checked again as they move.",
    },
    {
      id: "bill",
      tone: "pink",
      title: "Takes the bill.",
      body: "One bill, in place of a warehouse, two pipeline tools and the time to run them.",
    },
  ],
};

/** how the tables get used, as two cards */
export const VISION_AGENT = {
  title: "Your agent works from it.",
  cards: [
    {
      id: "ask",
      title: "Ask it anything.",
      body: "Claude or Codex reads the tables in one call and answers with the accounts, the people and the Play.",
    },
    {
      id: "plug",
      title: "Plug in your tools.",
      body: "Your sequencer and your CRM connect to Pancake. What they send comes back as signals.",
    },
  ],
} as const;

/** the close */
export const VISION_CLOSE = {
  title: "The data layer every revenue agent runs on.",
  body: "Start free. Your agent is one sign-in away.",
} as const;
