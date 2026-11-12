/**
 * The vision homepage's copy (2026-11-09). Every sentence the vision sections render lives here,
 * and every table they draw lives in lp-vision-tables.ts, so scripts/homepage-lint.mjs reads both
 * (FILES). Rendered by LpVision.tsx.
 *
 * The story, in the founder's words: revenue is now an engineering job run by non-engineers; the
 * best revenue teams build their own data warehouse; someone has to do the engineering, and
 * Pancake does. Pancake is the "unified context and data layer for the best revenue teams". The page says "revenue" where it first said "GTM" (founder, the same day): the
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

/* The hero is the designer's (LpHero): its H1, "Infrastructure powering your revenue factory", is
   in LpAudienceHeadline.tsx, and its lede is SITE_DESCRIPTION (lib/copy.ts: it is also the page's
   description). */

/**
 * The window under the hero: Pancake's companies table on the left, Claude on the right, a curtain
 * to slide between the two (founder 2026-11-11: "un espece de petit rideau qu'on peut deglisser a
 * droite a gauche qui montre Claude d'un cote et l'infra de l'autre", to show Claude runs on
 * Pancake; then, the same day: "Je mettrai Pancake a gauche et Claude a droite. J'animerai Claude
 * et la database pour montrer que c'est dynamique").
 * One take moves both: a signal lands in the table and the Brain writes its Play; Claude is asked
 * which accounts to work, reads the tables, names three; asked to, it runs the first Play and the
 * row goes live. Claude's window is drawn as the page's Claude scene draws it (the greeting, the
 * composer and its Pancake connector, the bubble, a white card per tool call, the serif answer).
 */
export const VISION_CURTAIN = {
  label:
    "Claude, connected to Pancake, answers which accounts to work now, then runs the first Play. Beside it, Pancake’s companies table takes each new signal, writes the next best Play and shows it go live. Asked again, Claude runs the next best Play, and the next.",
  handle: "Slide between Claude and Pancake",
  pancake: "Pancake",
  claude: "Claude",
  /* Claude's own chrome, the Claude scene's words (lp-demo-data.ts) */
  greeting: "Let’s flip some pancakes",
  placeholder: "How can I help you today?",
  connector: "Pancake",
  model: "Opus 5.5",
  reply: "Reply to Claude…",
  /* the first exchange */
  ask: "Which accounts should I work now?",
  /** the read: one card, what it is doing, then how many rows came back (the count ticks up; it is
   *  the companies table's own count, DB_HERO_TABS) */
  tool: {
    title: "Read companies, people and signals",
    /** where the card is narrow (tablets, phones) */
    short: "Read 3 tables",
    doing: "Reading…",
    count: 4812,
    done: "companies",
  },
  say: "Three accounts crossed a signal.",
  picks: [
    { who: "Fintech", size: "200 people", why: "Lost deal, now hiring SDRs." },
    { who: "Dev tools", size: "40 people", why: "Asked pricing, just funded." },
    { who: "Logistics", size: "1,200 people", why: "Your event, new VP Sales." },
  ],
  /** it was "Want me to run the first Play?" until the founder found it hard to get (2026-11-11):
   *  the line now says what will be done, and to whom */
  next: "Want me to reach back out to Fintech?",
  /* the second exchange: Claude acts, and the table shows it */
  go: "Yes, run it.",
  /** `name` is the Play of the first account (the table's next_best_play, DB_HERO row a) */
  run: { title: "Run Play", name: "Reach back out", doing: "Starting…", done: "Live" },
  done: "Done. The Play is live.",
  /* After the take, for as long as the card is on screen (founder 2026-11-11: "Je prolongerai les
     animations en mode endless loop: What's the next best Play to run?"): the same question, and
     each time the next account. One answer a row of the hero's table (DB_HERO's keys), in the
     order Claude goes through them. The sentence opens on the Play's own name, read from the
     row's cell; `to` ends it, `why` is the reason. */
  loop: {
    ask: "What’s the next best Play to run?",
    go: "Run it.",
    turns: [
      { row: "b", to: "to Dev tools.", why: "They asked pricing, then raised a Series B." },
      { row: "c", to: "with Logistics.", why: "They came to your event and hired a VP Sales." },
      { row: "p1", to: "to Legal tech.", why: "They raised new funding." },
      { row: "p2", to: "to Proptech.", why: "They have a new CRO." },
      { row: "p3", to: "for Retail.", why: "They use a rival tool." },
      { row: "a", to: "to Fintech.", why: "You lost the deal. Now they are hiring SDRs." },
    ],
  },
  /* Claude's own view of the three accounts, beside the conversation once the curtain is slid left */
  artifact: "Accounts to work now",
  artifactFrom: "From Pancake",
} as const;

/** what Pancake is, in the founder's line: the statement that opens the dark band. It was the
 *  why-now pair "Revenue is now an engineering job run by non-engineers. / Pancake does the
 *  engineering." until the founder replaced it (2026-11-09, later the same night). One string per line. */
export const VISION_STATEMENT: readonly string[] = ["Unified context and data layer for the best revenue teams."];

export type VisionTone = "yellow" | "purple" | "pink";
export type VisionRowId = "sources" | "external" | "crossing" | "play";

/** what Pancake does, as four numbered rows, from the sources up to the Play: a verb first, then
 *  two or three lines. Row 02 was "Builds your tables" (the schema) until the founder asked for
 *  "add / fetch external data sources" in its place (2026-11-09): your own sources in 01, the
 *  outside ones in 02, the two crossed in 03. */
export const VISION_ROWS: readonly { id: VisionRowId; num: string; label: string; tone: VisionTone; title: string; body: string }[] = [
  {
    id: "sources",
    num: "01",
    label: "Sources",
    tone: "yellow",
    title: "Takes in every source",
    body: "Your CRM, your calls, your events and your database come in through connectors Pancake builds.",
  },
  {
    id: "external",
    num: "02",
    label: "External data",
    tone: "purple",
    title: "Adds external data sources",
    body: "Job posts, funding rounds, headcount, tech stack. Pancake fetches them from 30+ data providers and keeps them up to date.",
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

/** the heading of the three steps that follow the rows: today's product, at work */
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
