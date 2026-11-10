/**
 * The vision homepage's copy (2026-11-09). Every string the vision sections render lives here, so
 * scripts/homepage-lint.mjs reads it (FILES). Rendered by LpVision.tsx.
 *
 * The story, in the founder's words: revenue is now an engineering job run by non-engineers; the
 * best revenue teams build their own data warehouse; someone has to do the engineering, and
 * Pancake does. The page says "revenue" where it first said "GTM" (founder, the same day): the
 * headline, the lede and every section line.
 * The page names the hard parts of that engineering (sources, deduplication, matching, history,
 * lineage, crossing), shows what Pancake builds (the tables of companies and people, a datapoint
 * each time a signal lands, the Brain's next best Play on top) and ends on Start free.
 *
 * Rules kept: "your agent" is the visitor's own (Claude, Codex); no person is named and no real
 * company carries an invented fact (the table's rows are a kind of company and its size); the
 * founder's figure "30+ data providers" is written exactly so; no vendor is named for comparison.
 */

/** the hero's lede lives in lib/copy.ts (SITE_DESCRIPTION: it is also the page's description) */
export const VISION_H1: readonly [string, string] = ["Infrastructure powering", "your revenue factory"];

/** the hero's window: the tables, and the agent reading them */
export const VISION_WINDOW = {
  tabs: ["Companies", "People", "Signals"],
  columns: ["Company", "Your data", "Outside signal", "Next best Play"],
  rows: [
    { initial: "F", company: "Fintech", size: "200 people", own: "Deal lost last year", outside: "Hiring SDRs", play: "Reach back out", hot: true },
    { initial: "D", company: "Dev tools", size: "40 people", own: "Asked about pricing on a call", outside: "New funding", play: "Send the pricing follow-up", hot: true },
    { initial: "L", company: "Logistics", size: "1,200 people", own: "Came to your event", outside: "New VP Sales", play: "Follow up on the event", hot: true },
    { initial: "H", company: "Health tech", size: "90 people", own: "Customer since last year", outside: "Headcount growing", play: "Offer the team plan", hot: false },
    { initial: "R", company: "Retail software", size: "300 people", own: "No contact yet", outside: "Uses a rival’s tool", play: "Start with the comparison", hot: false },
  ],
  chat: {
    agent: "Claude",
    ask: "Which accounts should I work now?",
    status: "Read 3 tables in one call",
    answer: "Three accounts crossed a signal.",
    picks: [
      { who: "Fintech, 200 people", why: "Lost deal, now hiring" },
      { who: "Dev tools, 40 people", why: "Asked for pricing, new funding" },
      { who: "Logistics, 1,200 people", why: "Came to your event, new VP Sales" },
    ],
  },
} as const;

/** why now, in two lines: the statement that opens the dark band */
export const VISION_STATEMENT: readonly [string, string] = [
  "Revenue is now an engineering job run by non-engineers.",
  "Pancake does the engineering.",
];

export type VisionTone = "yellow" | "purple" | "pink";
export type VisionRowId = "sources" | "tables" | "crossing" | "play";

/** what Pancake does, as four numbered rows: a verb first, then two lines */
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
    label: "Tables",
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
    label: "Next best Play",
    tone: "yellow",
    title: "Proposes the next best Play",
    body: "The Brain reads the tables. Your agent picks the Play, and your sequencer and your CRM plug in to run it.",
  },
];

/** the four pictures' own words */
export const VISION_PICS = {
  sources: {
    own: "Your data",
    rows: [
      { name: "CRM", note: "Accounts, deals, owners", logo: "/lp/vendor-logos/hubspot.svg" },
      { name: "Calls", note: "What buyers said" },
      { name: "Events", note: "Who came", logo: "/lp/vendor-logos/luma.svg" },
      { name: "Your database", note: "Read where it is" },
    ],
    outside: "30+ data providers",
    state: "Connected",
  },
  tables: {
    who: "Head of Sales",
    where: "Fintech, 200 people",
    record: "One record",
    points: [
      { when: "Last year", what: "Deal lost", from: "CRM" },
      { when: "Last month", what: "Came to your event", from: "Events" },
      { when: "This week", what: "Company hiring SDRs", from: "Outside signal" },
    ],
  },
  crossing: {
    company: "Fintech",
    size: "200 people",
    own: { label: "Your data", what: "Deal lost last year", from: "CRM" },
    outside: { label: "Outside signal", what: "Hiring SDRs", from: "Job posts" },
    result: "Both on the same row",
  },
  play: {
    kicker: "Next best Play",
    play: "Reach back out to the fintech you lost. It is hiring SDRs.",
    picks: "Your agent picks it",
    plugs: ["Your sequencer", "Your CRM"],
  },
} as const;

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

/** what Pancake is, as three cards */
export const VISION_WAREHOUSE = {
  title: "Pancake is the revenue data warehouse.",
  cards: [
    {
      id: "builds",
      tone: "yellow",
      title: "Builds the tables.",
      body: "Companies and people, from every source you connect. No pipeline for you to write.",
      chips: ["Companies", "People", "Signals"],
      note: "Built by Pancake",
    },
    {
      id: "fresh",
      tone: "purple",
      title: "Keeps them fresh.",
      body: "A signal lands and a datapoint is added the same day. Past buyers are checked again as they move.",
      chips: ["Company hiring SDRs"],
      note: "Added this week",
    },
    {
      id: "bill",
      tone: "pink",
      title: "Takes the bill.",
      body: "One bill, in place of a warehouse, two pipeline tools and the time to run them.",
      chips: ["A warehouse", "A tool in", "A tool out"],
      note: "One bill",
    },
  ],
} as const;

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
  ask: {
    question: "Which of my accounts have an inbound signal?",
    answer: "Three accounts. The fintech you lost is hiring SDRs.",
    box: "Ask about your market",
  },
  plug: {
    kicker: "Connected to Pancake",
    tools: ["Your sequencer", "Your CRM"],
    back: "Replies and meetings come back",
  },
} as const;

/** the close */
export const VISION_CLOSE = {
  title: "The data layer every revenue agent runs on.",
  body: "Start free. Your agent is one sign-in away.",
} as const;
