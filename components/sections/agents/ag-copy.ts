/**
 * /agents landing — every visible string, verbatim from the approved draft
 * (https://pancake-landing-draft.vercel.app/, captured 2026-09-11). One
 * module so a copy tweak is a one-line change and no section re-types it.
 * Keep the draft's wording, casing and punctuation; flag deviations in the
 * PR instead of editing here silently.
 */

export const AGENT_NAMES = ["Claude", "Codex", "OpenClaw", "Grok Bot", "Hermes"] as const;
export type AgentName = (typeof AGENT_NAMES)[number];

/** The install command the hero and CTA terminals show and copy. NOTE: main's
    human landing switched its agent-mode instruction to a tool-agnostic
    sentence on 2026-09-10 (PR #293); the draft keeps the curl line — kept
    verbatim here, flagged in the PR for the founder's call. */
export const INSTALL_COMMAND = {
  prompt: "$",
  cmd: "curl -fsSL",
  url: "https://getpancake.ai/install.md",
  full: "curl -fsSL https://getpancake.ai/install.md",
} as const;

export const META = {
  title: "Pancake",
  ogTitle: "Give your AI agent GTM superpowers",
  description:
    "Pancake gives your AI agent access to 50+ datasources, sending infrastructure, and a GTM brain that can orchestrate any GTM play.",
} as const;

/* Hero (founder 2026-09-11, on the preview): laid out like the homepage
   hero — H1 left, this block right — no mascot; `after` reads at the same
   size as `give`. */
export const HERO = {
  titleBefore: "Give ",
  titleAccent: "your AI agent",
  titleAfter: "GTM superpowers.",
  give: "Give this to your agent",
  after: "and watch it become a GTM super hero",
} as const;

export const SIDEKICK = {
  /* founder 2026-09-11 on the preview: "Super sidekick — strange naming".
     "Super simple" = the section's point (ask in plain words); alternatives
     offered in the PR: "Super easy", "Super natural". */
  kicker: "Super simple",
  titleBefore: "Find new customers. From ",
  /** the rotating word (1.2s per word, 6s cycle) — includes the period */
  words: ["Claude.", "Codex.", "OpenClaw.", "Hermes.", "Grok Bot."] as const,
  /** header rotation order matches `words` minus the period */
  headerNames: ["Claude", "Codex", "OpenClaw", "Hermes", "Grok Bot"] as const,
  lede: "Ask your agent in plain words. It uses Pancake like any other tool and tells you what it did.",
  newChat: "· new chat",
  /** the chat script, in order. `type` lines type out (steps = chars,
      draft duration ≈ 16ms/char), `tool` chips rise in, `user` is the
      bubble. Delays are the draft's, in seconds from the play start. */
  script: [
    { kind: "user", text: "Find companies hiring SDRs and reach out to 10 hot leads a day.", at: 0.3 },
    { kind: "type", text: "Setting this up as a daily play. Checking your GTM brain first.", at: 1.2, dur: 1.01 },
    { kind: "tool", text: "brain.read", at: 2.6 },
    { kind: "type", text: "Series A–B SaaS, sold to Heads of Sales. Direct, short, no fluff.", at: 3.1, dur: 1.04 },
    { kind: "tool", text: "signals.connect · hiring", at: 4.6 },
    { kind: "type", text: "38 companies posted an SDR role this week, 41 decision makers.", at: 5.1, dur: 0.99 },
    { kind: "tool", text: "sequence.create · 3 touches", at: 6.5 },
    { kind: "type", text: "Three touches drafted in your voice. First sends go out tomorrow.", at: 7.0, dur: 1.02 },
    { kind: "type", text: "Done. You'll get 10 new hiring-intent leads a day. ", at: 8.6, dur: 1.12, link: "See the play" },
  ] as const,
  toolPrefix: "Used ",
  toolBrand: "Pancake",
} as const;

export type Tint = "yellow" | "pink" | "purple" | "blue" | "green";
const TINT_CYCLE: Tint[] = ["yellow", "pink", "purple", "blue", "green"];

export const KNOWLEDGE = {
  kicker: "Super knowledge",
  title: "Pancake can find anything and anyone.",
  lede: "50+ data providers and tools behind one call, always routed to the cheapest source that has the answer. Think OpenRouter, for GTM.",
  /** 16 cards, draft order; tint cycles yellow→pink→purple→blue→green;
      illustration files live in /public/lp/agents/data/<slug>.png (147×160).
      `delay` is the draft's bob stagger — unused since the hop wave (2026-09-11). */
  cards: [
    ["Email addresses", "email-addresses"],
    ["Phone numbers", "phone-numbers"],
    ["LinkedIn data", "linkedin-data"],
    ["X data", "x-data"],
    ["Web search", "web-search"],
    ["SEO analytics", "seo-analytics"],
    ["GEO ranking", "geo-ranking"],
    ["Hiring signals", "hiring-signals"],
    ["Stack signals", "stack-signals"],
    ["Fundraising signals", "fundraising-signals"],
    ["Competitor search", "competitor-search"],
    ["Influencer signals", "influencer-signals"],
    ["Job changes", "job-changes"],
    ["Website visitors", "website-visitors"],
    ["Company news", "company-news"],
    ["Reviews & intent", "reviews-intent"],
  ].map(([label, slug], i) => ({ label, slug, tint: TINT_CYCLE[i % 5]!, delay: -(i * 0.7) })),
  /** DRAFT COPY (2026-09-11, Tristan to review) — the router demo: an agent's
      request comes in, Pancake routes it to the source that answers
      (founder: "plus créatifs pour intégrer ce composant intelligemment" —
      the 16 tiles are the sources behind the lede's "one call"). `source` =
      the tile slug that lights up. (A result line under the bubble was tried
      and cut — founder 2026-09-11: "remove sloppy text like this"; the lit
      tile is the answer.) */
  routeLabel: "one call",
  requests: [
    { text: "Find Jane's email at Acme.", source: "email-addresses" },
    { text: "Who's hiring SDRs this week?", source: "hiring-signals" },
    { text: "Does ChatGPT recommend us?", source: "geo-ranking" },
    { text: "Who just raised a Series A?", source: "fundraising-signals" },
    { text: "What's on Acme's stack?", source: "stack-signals" },
    { text: "Which visitors came back twice?", source: "website-visitors" },
  ],
} as const;

export const SUPERPOWERS = {
  kicker: "Superpowers",
  /* founder 2026-09-11 on the preview: the draft's "What if your agent could
     download GTM?" "means nothing". Replacement in the house voice (one idea,
     concrete nouns); alternatives in the PR: "Four things your agent can't do
     alone." / "Give your agent the whole GTM stack." No accent word. */
  titleBefore: "Everything your agent needs to find customers.",
  titleAccent: "",
  titleAfter: "",
  prev: "Previous",
  next: "Next",
  slides: [
    {
      num: "01 / 04",
      title: "A GTM brain that knows what you sell, and who you sell to.",
      body: "ICP, personas, competitors, voice. Your agent reads it before every play and writes back what it learned.",
      prompt: "Is this lead ICP? Write a message in my tone.",
      /** mini brain: hub label, token color name */
      brain: [
        ["ICP", "pink-30"],
        ["Personas", "purple-40"],
        ["Voice", "green-30"],
        ["Competitors", "orange-30"],
        ["Positioning", "blue-40"],
      ],
    },
    {
      num: "02 / 04",
      title: "Every phone number, email and signal.",
      body: "50+ providers behind one call. Your agent asks for a person or a signal, Pancake finds the cheapest source that has it.",
      prompt: "Get me everything on Jane at Acme.",
      chips: [
        "jane@acme.com",
        "+1 415 555 0142",
        "linkedin.com/in/jane",
        "Head of Sales · Acme",
        "Hiring: 2 SDRs",
        "Raised $8M · Series A",
        "Stack: HubSpot, Segment",
        "Visited /pricing twice",
      ],
    },
    {
      num: "03 / 04",
      title: "Sending infrastructure, as a prompt.",
      body: "Domains bought, inboxes created, DNS set, warm-up handled. Your agent asks for sending capacity, Pancake builds it.",
      prompt: "Set up 3 sending domains with 3 inboxes each and warm them up.",
      domains: [
        { host: "acme-mail.com", meta: "3 inboxes · warm-up 100%", pct: 100, tone: "green-20" },
        { host: "try-acme.io", meta: "3 inboxes · warm-up 64%", pct: 64, tone: "yellow-30" },
        { host: "acme-outreach.com", meta: "3 inboxes · warm-up 18%", pct: 18, tone: "pink-30" },
      ],
      note: "Bought, configured, DKIM and SPF set. Ready to send in 14 days.",
    },
    {
      num: "04 / 04",
      title: "Campaign creation and sequencing.",
      body: "Describe the outreach in a sentence. Pancake turns it into a workflow, runs it, and stops when someone replies.",
      prompt: "Reach out to these 41 leads: email, LinkedIn if no reply, then one follow-up.",
      steps: [
        { icon: "mail", tint: "yellow", label: "Email", detail: " · intro, in your voice", tag: "Day 1" },
        { note: "no reply after 3 days →" },
        { icon: "linkedin", tint: "blue", label: "LinkedIn", detail: " · connect + short note", tag: "Day 4" },
        { note: "still nothing →" },
        { icon: "mail", tint: "purple", label: "Email", detail: " · follow-up, new angle", tag: "Day 9" },
        { icon: "reply", tint: "green", reply: "Reply from Jane · sequence stops, meeting booked" },
      ],
      note: "41 leads enrolled · each one stops the moment they answer.",
    },
  ],
} as const;

export type PlayStatus = "green" | "orange" | "red";

/** A play's state word, shown next to its dot (Grok Bot's device: the run
    behind each bot is what sells it — a name + a colour did not). */
export const PLAY_STATE: Record<PlayStatus, string> = {
  green: "running",
  orange: "waiting for review",
  red: "retired",
};

export type Play = {
  name: string;
  status: PlayStatus;
  /** what the play does, one line */
  does: string;
  /** the run behind it — three concrete lines, last one = what lands in your lap */
  run: readonly [string, string, string];
};

/* DRAFT COPY (2026-09-11, Tristan to review): the play NAMES are the draft's,
   verbatim; `does` and `run` are new — the founder asked this section to give
   value like the Grok Bot page ("pick a team, open an example to see the run
   behind it"). Numbers echo the chat mock (38 companies hiring SDRs, 41
   decision makers) so the page tells one story. */
export const PLAYS = {
  kicker: "Super plays",
  title: "Put your GTM on autopilot.",
  lede: "Pancake runs a squad of sub-agents. Each Play watches a signal, finds the leads, and hands them to a campaign. When one stops working, it retires and a fresh one takes its seat.",
  rootName: "Pancake",
  rootRole: "runs the squad",
  lanes: [
    {
      title: "Inbound plays",
      tint: "yellow" as Tint,
      plays: [
        { name: "Pricing-page visitors", status: "green", does: "Spots companies on your pricing page and reaches out the same day.", run: ["14 companies visited /pricing", "6 match your ICP", "6 intros drafted, waiting for you"] },
        { name: "Demo-request follow-up", status: "green", does: "Answers every demo request and books the call.", run: ["3 demo requests overnight", "3 replies sent in your voice", "2 meetings on the calendar"] },
        { name: "Newsletter replies", status: "red", does: "Turns newsletter replies into conversations.", run: ["0 replies in 14 days", "Play retired", "Seat given to Webinar attendees"] },
        { name: "Inbound lead scoring", status: "green", does: "Scores every inbound lead against your ICP.", run: ["38 leads scored today", "9 marked hot", "Hot ones routed to you"] },
      ] as Play[],
    },
    {
      title: "Outbound plays",
      tint: "purple" as Tint,
      plays: [
        { name: "Hiring-signal outbound", status: "green", does: "Companies hiring SDRs get a three-touch sequence.", run: ["38 companies posted an SDR role", "41 decision makers found", "3 touches drafted, sending tomorrow"] },
        { name: "Funding-round play", status: "orange", does: "Fresh raises get a congrats and a pitch.", run: ["6 rounds announced this week", "6 notes drafted", "Waiting for your review"] },
        { name: "Competitor mentions", status: "green", does: "Replies to people complaining about your rivals.", run: ["9 mentions found", "3 worth a reply", "3 replies drafted"] },
        { name: "Job-change nudge", status: "green", does: "Champions who changed jobs get a hello at the new company.", run: ["5 champions moved", "5 new companies enriched", "5 hellos drafted"] },
      ] as Play[],
    },
    {
      title: "Content plays",
      tint: "pink" as Tint,
      plays: [
        { name: "Weekly SEO article", status: "orange", does: "Drafts one article a week on the questions buyers ask.", run: ["12 questions found on Google", "1 article drafted", "Waiting for your review"] },
        { name: "LinkedIn posts", status: "green", does: "Turns your wins into posts, in your voice.", run: ["2 wins spotted this week", "2 posts drafted", "Scheduled for Tuesday and Thursday"] },
        { name: "Reddit answers", status: "green", does: "Answers the threads where buyers ask.", run: ["7 threads found", "4 answered", "3 skipped, wrong fit"] },
        { name: "GEO citations check", status: "green", does: "Checks what ChatGPT says about you.", run: ["10 prompts checked", "Cited in 6", "4 gaps sent to the SEO play"] },
      ] as Play[],
    },
  ],
} as const;

export const BRAIN = {
  kicker: "Super smart",
  title: "A GTM brain that remembers every play.",
  lede: "ICP, personas, competitors, positioning, and every experiment your agent ran: what worked and what didn't. Your agent reads the brain before a play and writes back after. An audit trail that makes the next play smarter.",
  root: "Pancake",
  /** [label, token color name, leaf count] — draft order, clockwise from top */
  hubs: [
    ["ICP", "pink-30", 4],
    ["Personas", "purple-40", 2],
    ["Competitors", "orange-30", 3],
    ["Positioning", "blue-40", 3],
    ["Voice", "green-30", 4],
    ["Plays", "yellow-30", 3],
    ["Objections", "blue-30", 3],
    ["Keywords", "yellow-40", 4],
  ] as const,
} as const;

export const VERSUS = {
  kicker: "Super addictive",
  title: "Your agent alone vs. your agent with Pancake.",
  alone: {
    kicker: "Agent alone",
    lines: ["Guesses the ICP", "Scrapes what it can", "Can't send anything", "Forgets by tomorrow"],
  },
  with: {
    kicker: "Agent + Pancake",
    lines: ["50+ sources behind one API", "Warmed inboxes and LinkedIn", "Sequence management", "A brain that remembers"],
  },
  /** Row-by-row comparison (founder 2026-09-11: "show that we're comparing
      thing by thing"). The eight draft lines, verbatim, paired by theme —
      data / sending / follow-up / knowledge — in the draft's right-column
      order; the left column is reordered to face its counterpart. The
      "Forgets by tomorrow ↔ Sequence management" pair is the softest
      (follow-ups over days vs. an agent with no memory) — flagged in the PR. */
  rows: [
    ["Scrapes what it can", "50+ sources behind one API"],
    ["Can't send anything", "Warmed inboxes and LinkedIn"],
    ["Forgets by tomorrow", "Sequence management"],
    ["Guesses the ICP", "A brain that remembers"],
  ],
} as const;

export const CTA = {
  title: "Give your AI agent GTM superpowers.",
  body: "Give this to your agent, and it starts finding customers today.",
  primary: "Start free",
  secondary: "Book a demo",
} as const;

export const WORKS_WITH = {
  label: "Works with",
  any: "any MCP client",
} as const;
