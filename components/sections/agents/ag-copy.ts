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

export const HERO = {
  titleBefore: "Give ",
  titleAccent: "your AI agent",
  titleAfter: "GTM superpowers.",
  give: "Give this to your agent",
  after: "and watch it become a GTM super hero",
} as const;

export const SIDEKICK = {
  kicker: "Super sidekick",
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
      illustration files live in /public/lp/agents/data/<slug>.png (147×160) */
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
} as const;

export const SUPERPOWERS = {
  kicker: "Superpowers",
  titleBefore: "What if your agent could ",
  titleAccent: "download",
  titleAfter: " GTM?",
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

export const PLAYS = {
  kicker: "Super plays",
  title: "Put your GTM on autopilot.",
  lede: "Pancake runs a squad of sub-agents. Each Play watches a signal, finds the leads, and hands them to a campaign. When one stops working, it retires and a fresh one takes its seat.",
  rootName: "Pancake",
  rootRole: "runs the squad",
  columns: [
    {
      title: "Inbound plays",
      tint: "yellow" as Tint,
      plays: [
        ["Pricing-page visitors", "green"],
        ["Demo-request follow-up", "orange"],
        ["Newsletter replies", "red"],
        ["Inbound lead scoring", "green"],
      ] as [string, PlayStatus][],
      pool: ["Pricing-page visitors", "Demo-request follow-up", "Newsletter replies", "Inbound lead scoring", "Webinar attendees", "Free-trial nudges"],
    },
    {
      title: "Outbound plays",
      tint: "purple" as Tint,
      plays: [
        ["Hiring-signal outbound", "green"],
        ["Funding-round play", "orange"],
        ["Competitor mentions", "green"],
        ["Job-change nudge", "green"],
      ] as [string, PlayStatus][],
      pool: ["Hiring-signal outbound", "Funding-round play", "Competitor mentions", "Job-change nudge", "Tech-stack switchers", "Event attendee outreach"],
    },
    {
      title: "Content plays",
      tint: "pink" as Tint,
      plays: [
        ["Weekly SEO article", "green"],
        ["LinkedIn posts", "orange"],
        ["Reddit answers", "green"],
        ["GEO citations check", "green"],
      ] as [string, PlayStatus][],
      pool: ["Weekly SEO article", "LinkedIn posts", "Reddit answers", "GEO citations check", "Customer story drafts", "Changelog posts"],
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
