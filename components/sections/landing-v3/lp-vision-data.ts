/**
 * The vision homepage's copy (2026-11-09). Every sentence the vision sections render lives here,
 * and every table they draw lives in lp-vision-tables.ts, so scripts/homepage-lint.mjs reads both
 * (FILES). Rendered by LpVision.tsx.
 *
 * The story, in the founder's words: revenue is now an engineering job run by non-engineers; the
 * best revenue teams build their own data warehouse; someone has to do the engineering, and
 * Pancake does. Pancake is the "unified context and data layer for the best revenue teams". The page says "revenue" where it first said "GTM" (founder, the same day): the
 * headline, the lede and every section line.
 * Since the landing page meeting of 2026-11-11 the page is: the window (Claude beside Pancake's
 * table), the statement and the 1-2-3 (connect your sources, connect the dots with market
 * signals, find who to contact and when), the bottle ("tons of data, a fraction used"), the
 * clouds ("What your agent can do with Pancake", four features), what customers got, the close,
 * the pricing. (The three cards "Pancake is the revenue data warehouse." came off the page the
 * same day, on the founder's word.)
 * The two layers stay the story: the data layer (the tables of companies and people, a datapoint
 * each time a signal lands) and, on top of it, the Brain, the context layer that makes the next
 * best Play possible (founder: "the brain is a context layer on top of a datalayer (enabling
 * next best play)").
 *
 * Rules kept: "your agent" is the visitor's own (Claude, Codex); no person is named and no real
 * company carries an invented fact; the founder's figure "30+ data providers" is written exactly
 * so. Vendors: a source or a kind of signal is shown with a tool's own mark.
 */

import { BASE_LEVEL, formatCredits } from "@/lib/pricing";

/* The hero is the designer's (LpHero): its H1, "Infrastructure powering your revenue factory", is
   in LpAudienceHeadline.tsx, and its lede is SITE_DESCRIPTION (lib/copy.ts: it is also the page's
   description). */

/**
 * The window under the hero: Claude on the left, Pancake's companies table on the right, a curtain
 * to slide between the two (founder 2026-11-11: "un espece de petit rideau qu'on peut deglisser a
 * droite a gauche qui montre Claude d'un cote et l'infra de l'autre", to show Claude runs on
 * Pancake; "J'animerai Claude et la database pour montrer que c'est dynamique"; and his last word
 * on the sides, "Claude sur la gauche finalement et Pancake sur la droite").
 * One take moves both: a signal lands in the table and the Brain writes its Play; Claude is asked
 * which accounts to work, reads the tables, names three; asked to, it runs the first Play and the
 * row goes live. Then the loop (`loop` below). Claude's window is drawn as the page's Claude scene
 * draws it (the greeting, the composer and its Pancake connector, the bubble, a white card per
 * tool call, the serif answer).
 */
export const VISION_CURTAIN = {
  label:
    "Claude, connected to Pancake, answers which accounts to work now, then runs the first Play. Beside it, Pancake’s companies table takes each new signal, writes the next best Play, narrows to the accounts that have one each time Claude reads it, and shows the Play go live. Asked again, Claude runs the next best Play, and the next.",
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
  /* The table's view bar (2026-11-11, the founder: "des prompts qui sont envoyés et que ça va
     filtrer la database"). At rest: the filter's button and the table's count. While Claude
     reads: the filter it set, as a chip of three parts (the column, the test, the value), and how
     many rows match. `rows` is the companies table's own count (DB_HERO_TABS). */
  filter: {
    idle: "Filter",
    column: "next_best_play",
    test: "is not",
    value: "NULL",
    all: "4,812 rows",
    some: "3 of 4,812 rows",
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

/* ── the 1-2-3 (2026-11-11, the landing page meeting): the four table rows and the three steps of
   today's product became ONE section on the designer's step cards. "1-2-3 steps to replace the
   current table layout": 1. connect your sources (their logos, not a table), 2. "connect the dots
   with market signals" (not "external data"; category labels, each with its best-known logo),
   3. next best action, "find who to contact and when". The founder, on the first take of 3 (Claude
   coming to you with an insight): "le 3/ doit vraiment tourner autour du brain qui recommande le
   next best play", then "for brain reuse the components we had initially from the designer". So 3
   is the designer's Brain (the graph of the step card "Watch it get better", in the pose it took
   beside its leads): an account reaches it, it pings and grows, and the next best Play comes up
   beside it, with who, when and why.
   The statement above them is the section's title. Drawn by LpVisionSteps.tsx; the three
   pictures: LpVisionStepMocks.tsx, lp-vision-step-timelines.ts. ── */

export type VisionStepVariant = "v1" | "v2" | "v3";

export const VISION_STEPS: readonly { num: "01" | "02" | "03"; variant: VisionStepVariant; title: string; body: string; alt: string }[] = [
  {
    num: "01",
    variant: "v1",
    // "\n" = the desktop line break (white-space: pre-line), as the steps before these
    title: "Connect your sources.\nPancake builds the tables.",
    body: "Your CRM, your events, your product and your website. Pancake builds each connector and turns what comes in into tables of companies and people.",
    // retells VSTEP_SOURCES and VSTEP_TABLES: keep in sync
    alt: "Animation: four sources connect one after the other: HubSpot for the CRM, Luma for events, PostHog for the product, Google Analytics for the website. Their lines join into Pancake, which fills two tables: companies, 4,812 rows, and people, 12,960 rows.",
  },
  {
    num: "02",
    variant: "v2",
    title: "Connect the dots\nwith market signals.",
    body: "Funding, hiring, tech stack, reviews, web traffic. Signals from 30+ data providers land on the accounts you already have, each one dated.",
    // retells VSTEP_SIGNALS and VSTEP_ACCOUNT: keep in sync
    alt: "Animation: six kinds of market signal, each beside a well-known source: funding, hiring, tech stack, team, reviews and web traffic. Four of them land as dots on one account, a fintech of 200 people with a lost deal: hiring SDRs, a new VP Sales, a Series B raised, visits up. A line connects the dots.",
  },
  {
    num: "03",
    variant: "v3",
    title: "Your Brain recommends\nthe next best Play.",
    body: "It knows who you sell to and what worked. When signals cross on an account, it tells your agent who to contact, when, and with which Play.",
    // retells VSTEP_BRAIN: keep in sync
    alt: "Animation: beside your Brain, a graph of coloured branches around a dark centre, an account comes up: a fintech with a lost deal, now hiring SDRs. A ping runs through the Brain and it grows new branches. Then the next best Play appears, Reach back out. Who: the Head of Sales. When: today at 10:00. Why: a lost deal, now hiring.",
  },
];

/** 01: your own sources, each a kind and the mark of a tool that holds it (the vendor's own mark,
 *  unmodified), and the two tables Pancake fills from them (the hero's own counts) */
export const VSTEP_SOURCES = [
  { id: "crm", label: "CRM", logo: "/lp/vendor-logos/hubspot.svg" },
  { id: "events", label: "Events", logo: "/lp/vendor-logos/luma.svg" },
  { id: "product", label: "Product", logo: "/lp/vendor-logos/posthog.svg" },
  { id: "website", label: "Website", logo: "/lp/vendor-logos/google-analytics.svg" },
] as const;
export const VSTEP_TABLES = [
  { name: "companies", rows: 4812 },
  { name: "people", rows: 12960 },
] as const;

/** 02: the kinds of market signal, the category first and its best-known source's mark beside it
 *  (founder 2026-11-11: "Categories with best known logo next to it"). `dot` = what that kind
 *  says of the account below, and where its dot lands on the stage (px); a kind without one
 *  stays quiet. The dots are joined in the order they land, and they climb: each one's words sit
 *  over it, clear of the line that leaves it. */
export type VisionSignalTone = "green" | "purple" | "blue" | "yellow" | "pink" | "orange";
export const VSTEP_SIGNALS: readonly { id: string; label: string; logo: string; tone: VisionSignalTone; dot?: { text: string; x: number; y: number; order: number } }[] = [
  { id: "funding", label: "Funding", logo: "/lp/signal-logos/crunchbase.svg", tone: "green", dot: { text: "raised a Series B", x: 280, y: 296, order: 3 } },
  { id: "hiring", label: "Hiring", logo: "/lp/signal-logos/indeed.svg", tone: "purple", dot: { text: "hiring SDRs", x: 84, y: 346, order: 1 } },
  { id: "tech", label: "Tech stack", logo: "/lp/story-sources/wappalyzer.svg", tone: "blue" },
  { id: "team", label: "Team", logo: "/lp/signal-logos/apollo.svg", tone: "yellow", dot: { text: "new VP Sales", x: 182, y: 322, order: 2 } },
  { id: "reviews", label: "Reviews", logo: "/lp/signal-logos/g2.svg", tone: "pink" },
  { id: "traffic", label: "Web traffic", logo: "/lp/signal-logos/similarweb.svg", tone: "orange", dot: { text: "visits up", x: 378, y: 266, order: 4 } },
];
/** the account the dots land on: what you already know of it comes from your own data */
export const VSTEP_ACCOUNT = { name: "Fintech", size: "200 people", own: "lost deal" } as const;

/** 03: the Brain, the context layer, as the designer drew it (lp-step-data.ts s1Graph): the
 *  account and what crossed on it come up beside it, it pings and grows, and the next best Play
 *  comes up under the account. The account and its Play are the hero's own first row
 *  (lp-vision-tables.ts DB_HERO row a). */
export const VSTEP_BRAIN = {
  brain: "Your Brain",
  account: { name: "Fintech", facts: "Lost deal · hiring SDRs" },
  play: {
    kicker: "Next best Play",
    name: "Reach back out",
    rows: [
      { k: "Who", v: "Head of Sales" },
      { k: "When", v: "Today, 10:00" },
      { k: "Why", v: "Lost deal, now hiring" },
    ],
  },
} as const;

/** the bottle (LpBanner, the designer's animation kept): the meeting's message, "you have tons
 *  of data but use a fraction", as the two lines on either side of the neck. Each line as its
 *  two halves (the break). */
export const VISION_BOTTLE = {
  left: ["You have", "tons of data."],
  right: ["You use", "a fraction."],
} as const;

/** The clouds: "What your agent can do with Pancake" (the meeting: keep the clouds section,
 *  reframe it, four features: the agent-first layer, the lead journey, entity resolution, data
 *  that is proactive and context that improves itself). The designer's deep dive (LpDive) with
 *  four of its stories; `story` is the story's id in the dive's registry (lp-dive-stages.ts). */
export const VISION_FEATURES: {
  title: string;
  items: readonly { story: "mcp" | "p-history" | "p-dedup" | "ping"; title: string; body: string }[];
} = {
  title: "What your agent can do with Pancake",
  items: [
    {
      story: "mcp",
      // the founder, 2026-11-11: "Run everything from Claude (not your agent)"
      title: "Run everything\nfrom Claude",
      body: "One install in Claude, Claude Code, ChatGPT or Codex. Your agent reads every table and runs every Play, with about 100 tools.",
    },
    {
      story: "p-history",
      title: "Follow every lead’s journey",
      body: "Each touch is dated and kept on the lead: the event, the signup, the question on pricing, the reply. Your agent reads them in the order they happened.",
    },
    {
      story: "p-dedup",
      title: "See one person as one record",
      body: "The same buyer is at your event, in your product and on a social profile, under three emails. Pancake keeps one record.",
    },
    // its picture is your agent texting you first (lp-story-ping-data.ts), the founder's ask in
    // place of the context story's schema
    {
      story: "ping",
      title: "Get the next move\nbefore you ask",
      body: "The Brain learns from every reply and every deal. Your agent comes to you with the next account to work and the Play to run.",
    },
  ],
};

/** the close */
export const VISION_CLOSE = {
  title: "The data layer every revenue agent runs on.",
  body: "Start free. Your agent is one sign-in away.",
} as const;

/** Pricing, back on the page (the meeting, 2026-11-11), as two plans. The starter is the site's
 *  own plan and card (LpPricing): its first line was "Built to land 2 to 3 customers a month.",
 *  "less transactional" now, the founder's pick. The full plan is described and has no price
 *  (his call): it is a conversation. */
export const VISION_PLANS = {
  starter: [
    // \u00a0 keeps the last two words together when a narrow phone wraps the line (LpPricing)
    "Your tables of companies and people, built for\u00a0you.",
    `${formatCredits(BASE_LEVEL.credits)} credits a month. Every lead checked against your\u00a0ICP.`,
    "Slow month? Unused credits roll\u00a0over.",
    "Try any idea. Building a Play is\u00a0free.",
    "A personal message for each lead, in your\u00a0voice.",
  ],
  full: {
    title: "Need your own data warehouse?",
    body: "The full plan: a flexible warehouse you can query yourself, custom signals, and room for your own stack.",
    cta: "Talk to sales",
  },
} as const;
