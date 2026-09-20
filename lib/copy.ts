/** Locked marketing copy — do not change without explicit approval */

import { TRIAL_DAYS, TRIAL_NOTICE } from "@/lib/trial";

export const hero = {
  /** H1 line 1 (break before autonomous) */
  h1Before: "Let OpenClaw run your",
  /** H1 line 2: autonomous + ref marker SVG + h1After */
  h1After: " company.",
  h2: "Instantly deploy an army of open source agents to run your company.",
  h3: "Human board. AI execution.",
  /** Hero + navbar primary CTA */
  cta: "Start building",
  /** Hero autonomous + ref markers + CTA fill (sync themes/neo-brutalism --accent) */
  autonomousAccent: "#FF8FA3",
  humanBoardAnchorId: "human-board-execution",
} as const;

export const orgChart = {
  title: "An entire organization working for you while you sleep.",
  youLabel: "You",
  ceoLabel: "AI Co-Founder",
  /** Shown once under each cluster’s agent grid */
  moreComingSoon: "+ build your own",
  /** Visual clusters only — flat reporting to your AI cofounder */
  clusters: [
    {
      id: "growth",
      label: "GROWTH",
      tint: "#FFE4EC",
      agents: [
        "Outbound SDR",
        "Email Marketer",
        "Ad Manager",
        "Copywriter",
        "Social Media Manager",
        "Partnership Outreach",
      ],
    },
    {
      id: "engineering",
      label: "ENGINEERING",
      tint: "#E4EEFF",
      agents: [
        "Full-stack Engineer",
        "DevOps",
        "QA Tester",
        "Performance Monitor",
        "Security Auditor",
      ],
    },
    {
      id: "operations",
      label: "OPERATIONS",
      tint: "#FFF8E1",
      agents: [
        "Scheduling",
        "Customer Support",
        "Recruiting Screener",
        "Contract Reviewer",
        "Invoicing",
        "Onboarding Specialist",
      ],
    },
  ],
  features: [
    {
      title: "Markdown-configured",
      description:
        "Every agent, role, and workflow defined in .md files you control",
    },
    {
      title: "Plugged into your brain",
      description:
        "Agents pull context from your Notion, docs, and meeting notes. They know your business.",
    },
    {
      title: "Always on",
      description: "Your agent org runs 24/7. No downtime, no sick days",
    },
  ],
} as const;

export const slack = {
  titleLine1: "Your agents live in Slack.",
  titleLine2: "They don't wait to be asked.",
  workspaceName: "Your Company",
  channels: ["#briefing", "#outbound", "#content", "#product"] as const,
  defaultChannel: "#briefing" as const,
  /** Unread counts shown on channel rows (Slack-style badges) */
  channelUnread: {
    "#briefing": 1,
    "#outbound": 3,
    "#content": 1,
    "#product": 2,
  } as const,
  /** Agents that post in channels — sidebar DMs removed; used for avatars in the thread */
  agents: [
    { handle: "aria", initials: "AR", avatarColor: "#E9738E" },
    { handle: "scout", initials: "SC", avatarColor: "#1264A3" },
    { handle: "ghostwriter", initials: "GW", avatarColor: "#5B2C83" },
    { handle: "shipwright", initials: "SW", avatarColor: "#2EB67D" },
  ] as const,
} as const;

export const itLearns = {
  headlineBefore: "Give feedback. It gets ",
  headlineAccent: "sharper",
  subhead: "Correct it once. It remembers forever.",
} as const;

export const safeCompliant = {
  title: "You're always in control.",
  badges: [
    {
      icon: "check" as const,
      title: "Human guardrails",
      description: "Sensitive actions pause and wait for your go-ahead.",
    },
    {
      icon: "list" as const,
      title: "Full audit trail",
      description: "Every action every agent takes is recorded.",
    },
    {
      icon: "lock" as const,
      title: "Scoped access",
      description: "Each agent only sees what it needs.",
    },
  ],
} as const;

export const stackIntegrations = {
  title: "Plug in your stack. Agents do the rest.",
  subtitle:
    "Connect your tools. Your agents read, write, ship, and sell through them, like an employee would.",
  integrations: [
    {
      id: "github",
      name: "GitHub",
      description: "Opens PRs, writes tests, ships hotfixes at 3 AM.",
    },
    {
      id: "vercel",
      name: "Vercel",
      description: "Deploys previews, promotes to prod, rolls back.",
    },
    {
      id: "granola",
      name: "Granola",
      description: "Meeting notes and call context feed agent memory.",
    },
    {
      id: "gmail",
      name: "Gmail",
      description: "Reads inbox, drafts replies, labels and routes mail.",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      description: "Sources leads, sends personalized outreach.",
    },
    {
      id: "x",
      name: "X",
      description: "Posts threads, engages replies, grows audience.",
    },
    {
      id: "notion",
      name: "Notion",
      description: "Writes postmortems, specs, changelogs, CRM updates.",
    },
    {
      id: "slack",
      name: "Slack",
      description: "Reports progress, asks approvals, briefs you daily.",
    },
  ],
  mcpRow: "+ Any tool with an API",
} as const;

export const finalCta = {
  title: "Build your autonomous company.",
  subtitle: "Deploy in minutes. Scale without hiring.",
  cta: "Start building",
} as const;

export const talkToHuman = {
  title: "Or talk to a human",
  subtitle: "Let's put your company on autopilot",
} as const;

/**
 * Pricing — radically honest. Two costs: a small fixed $29 for an always-on
 * cloud machine plus usage at cost (we make our margin on the bulk discount
 * the labs give us, not on a markup over the user). One plan, one slider,
 * one total. Numbers are the single source of truth for the page.
 *
 * The slider is calibrated to TEAM SIZE rather than token volumes — users
 * don't think in tokens. Internally `tokens` is kept so back-office math
 * and the FAQ remain honest, but nothing user-facing surfaces a number.
 */
export const pricing = {
  // Hard pricing numbers — source of truth.
  // $49 always-on setup + a token usage pack. Five discrete pack sizes:
  // $50, $100, $250, $500, $1000 — visible as the slider stops.
  infrastructureDollars: 49,
  /** 5 discrete slider stops. Each tier has a pancake-universe plan name
   *  used as the active kicker above the price, plus an audience line
   *  shown where the old "X hours of agent work a week" sat. `pancakes`
   *  drives the mascot stack height (1–5). */
  /** `accent` is a readable variant of the NEWLY-ADDED pancake's brand
   *  hue for that tier — used as the colour of the big plan-name beneath
   *  the stack. Addition order (top → bottom of the 5-stack):
   *  golden → purple → mint → orange → pink. So each tier's accent maps
   *  to the colour that lands at the bottom of its stack. */
  tiers: [
    { totalDollars: 99,   tokens: 12_500_000,  pancakes: 1, planName: "Syrup",      forAudience: "For side projects",        accent: "#F38F43" }, // $49 setup + $50 pack — golden → yellow-40
    { totalDollars: 149,  tokens: 25_000_000,  pancakes: 2, planName: "Flapjack",   forAudience: "For solopreneurs",         accent: "#8D43FD" }, // $49 setup + $100 pack — purple-40
    { totalDollars: 299,  tokens: 62_500_000,  pancakes: 3, planName: "Stack",      forAudience: "For small founding teams", accent: "#037D48" }, // $49 setup + $250 pack — green-30 (mint)
    { totalDollars: 549,  tokens: 125_000_000, pancakes: 4, planName: "Tower",      forAudience: "For startups",             accent: "#D43900" }, // $49 setup + $500 pack — orange-30
    { totalDollars: 1049, tokens: 250_000_000, pancakes: 5, planName: "Skyscraper", forAudience: "For scaleups",             accent: "#E33A6A" }, // $49 setup + $1000 pack — pink-40
  ],
  defaultTierIndex: 0,
  trial: {
    /** $100 in free credits to start. Surfaced verbatim in `trialCaption`;
     *  kept as a number for back-office math. */
    freeTokensDollars: 100,
    /** Keep legacy pages aligned with the current confirmed trial duration. */
    days: TRIAL_DAYS,
  },
  currency: "USD" as const,
  currencySymbol: "$",
  // Hero copy.
  title: "No tiers. No tricks.",
  /** Reflects the bundle: a $49 always-on cloud (the machine + the
   *  tools that run on it) plus a monthly token allocation. One slider,
   *  one total. Doubles as the SEO meta description. */
  subtitle:
    "Pancake is $49/month flat for an always-on AI agent: Slack, iMessage, phone, email, browser, model-agnostic harness, and more. Pick your token pack. No tiers, no tricks.",
  perMonth: "/ month",
  /** Two-card hero. LEFT card = the fixed-price promise; RIGHT card =
   *  the variable token pack the user picks. Reads as "Pancake is $49
   *  for the always-on cloud. Tokens are bought separately, you pick
   *  the pack." */
  basePlan: {
    kicker: "Always-on",
    /** Single-line title — benefit-led, frames the 4-item highlight
     *  list that combines related features in plain language (e.g.
     *  "browses and researches the web" = browser automation + Exa
     *  search; "its own inbox and iMessage" = email + iMessage
     *  access). The detailed 12-item breakdown still lives in
     *  PricingIncluded just below. */
    title: "Everything needed to make your company autonomous",
    highlights: [
      { name: "private cloud computer",         icon: "linux" },
      { name: "any AI model",                   icon: "harness" },
      { name: "browses and researches the web", icon: "browser" },
      { name: "its own inbox (and iMessage coming soon)", icon: "imessage" },
    ],
    /** Italic footnote rendered with extra line-break spacing below
     *  the highlights list — softly points the user to the full
     *  12-item PricingIncluded section just below the hero. */
    footnote: "More details below",
  },
  /** Single-line label combines the action ("Pick your token pack")
   *  with the radical-honesty signal ("at labs' public price") so the
   *  right card mirrors the left card's one-line title format. */
  tokenPickLabel: "Pick your token pack at labs' public price",
  totalLabel: "/ month total",
  /** Two-part breakdown — kept for back-office/aria use; the visible
   *  hero no longer shows them as inline math. */
  breakdownFixedLabel: "always-on cloud",
  breakdownTokensLabel: "tokens",
  /** Everything bundled into the $49 always-on cloud — shown as a
   *  dedicated section right under the hero. 12 punchy items, each
   *  with a marketing-ready label + a one-line detail + an `icon`
   *  key mapped in IncludedIcons. The "Soon" flag tags features
   *  shipping later so the roadmap stays honest.
   *
   *  Order is row-grouped (3 cols × 4 rows) so related items sit next
   *  to each other in the grid:
   *    R1 — foundation:  compute · secrets · LLM
   *    R2 — messaging:   Slack · phone · inbox
   *    R3 — web:         browsing · live web · deep search
   *    R4 — capabilities: sub-agents · iMessage · credit-card
   *                                     ↑ both "Soon" — roadmap row sits
   *                                       last so the live capabilities
   *                                       read first. */
  included: {
    title: "Everything your $49 buys",
    subtitle: "All bundled. No add-ons, no upgrade tiers.",
    items: [
      { name: "Always-on compute",            detail: "Private cloud computer, 50GB storage", icon: "linux" },
      { name: "Encrypted secrets",            detail: "API keys + credentials, E2E",          icon: "vault" },
      { name: "Any LLM, your choice",         detail: "Claude, GPT, Gemini. Model-agnostic", icon: "harness" },
      { name: "Slack-native",                 detail: "Lives in your channels and DMs",       icon: "slack" },
      { name: "Phone number for your Pancake", detail: "SMS + voice",                         icon: "phone" },
      { name: "Email inbox for your Pancake", detail: "Send and receive email",               icon: "mail" },
      { name: "Authenticated browsing",       detail: "Signed into your accounts",            icon: "browser" },
      { name: "Live web access",              detail: "Real-time fetch from any URL",         icon: "globe" },
      { name: "Deep web search",              detail: "Agentic research + crawling",          icon: "search" },
      { name: "Unlimited sub-agents",         detail: "Run multiple agents in parallel",      icon: "subagents" },
      { name: "iMessage access",              detail: "Discuss with Pancake on iMessage", soon: true, icon: "imessage" },
      { name: "Credit card for agents",       detail: "For real-world purchases", soon: true, icon: "creditcard" },
    ],
  } as const,
  // Trial CTA below the widget.
  trialCta: "Get started for free",
  trialCaption: "$100 in free credits",
  trialHref: "https://beta.getpancake.ai",
  // 3-column manifesto (shown BEFORE the buys cards — trust before value:
  // the user needs to believe the price is fair before they care what it
  // gets them). Title doubles as the page's main headline since the hero
  // section above runs without an H1/H2.
  manifesto: {
    title: "No tiers. No tricks.",
    items: [
      {
        title: "No platform markup.",
        body:
          "Most AI tools mark up tokens 3x or 5x. We charge what the labs charge. Our margin is the volume discount they give us.",
      },
      {
        title: "Your own cloud computer.",
        body:
          "Everything above. $49 a month. Always yours, never shared, never throttled.",
      },
      {
        title: "No surprises.",
        body:
          "Your unused tokens carry over. Bump the slider any time, prorated. Cancel anytime.",
      },
    ],
  },
  // "What you can do" — asymmetric cards with Slack-style exchanges.
  // Layout: 2 cards top row, 1 wide card bottom. Each card carries an
  // `intensity` (1/2/3) that drives a WiFi-style signal indicator
  // signalling how "big" the work is. Replaces the old token-range
  // strings which forced the user to do math.
  buys: {
    title: "What you can do",
    cards: [
      {
        kicker: "QUICK TASKS",
        intensity: 1,
        tag: "An hour of work, done in 5 minutes.",
        wide: false,
        user: {
          name: "Sarah",
          initial: "S",
          accent: "#E8E0F2",
          accentInk: "#4A3C7B",
          time: "8:14am",
          text: "@Pancake write me an X thread about why we pivoted last month. Use the framing from my last 3 threads. Schedule it for 2pm today.",
        },
        agent: {
          time: "8:19am",
          text: "Drafted, edited, scheduled in Typefully for 2pm: pancake.dev/t/9f2. 6 posts, opens with a hook on the \"we were wrong\" angle you used in your March 12 thread. Want me to draft a LinkedIn version too?",
        },
      },
      {
        kicker: "WORKFLOWS",
        intensity: 2,
        tag: "Half a day of ops, done while you focus on something else.",
        wide: false,
        user: {
          name: "Mike",
          initial: "M",
          accent: "#D5E4EB",
          accentInk: "#1F4660",
          time: "10:04am",
          text: "@Pancake 27 demo requests came in over the weekend. Qualify each against our ICP (B2B SaaS, 20+ employees, US/EU). Reject the bottom half politely, book the top half on my Cal.com with a 1-pager prep doc for each.",
        },
        agent: {
          time: "1:47pm",
          text: "Done. 14 disqualified with a polite \"not a fit right now\" reply (drafts in your Gmail, awaiting your send). 13 qualified: 11 booked themselves on Cal, 2 pending. Prep docs in pancake.dev/inbound. Three look like fast closers. Flagged at the top.",
        },
      },
      {
        kicker: "FULL PROJECTS",
        intensity: 3,
        tag: "A week of outbound a BDR would do.",
        wide: true,
        user: {
          name: "Tom",
          initial: "T",
          accent: "#EAE2D2",
          accentInk: "#6E5520",
          time: "Monday 9:02am",
          text: "@Pancake I want 30 sales calls booked by Friday. ICP is mid-market e-commerce, 50-500 employees, hiring growth or marketing roles. Find them, write personalized outbound, send from my Apollo, book demos on my Cal.com when they reply. Check in with me Wednesday.",
        },
        agent: {
          time: "Wednesday 4:18pm",
          text: "Day 3 update. 184 prospects sourced, 142 emails sent, 38 replies, 19 demos booked so far. 4 hot conversations need you (in #pancake-hot in Slack). Disqualified 8 that didn't match ICP on closer look. Tracking to ~32 demos by Friday. Want me to push harder on the LinkedIn channel to hit 35?",
          artifact: "outbound-tracker",
        },
      },
    ],
  },
  // FAQ accordion.
  faq: {
    title: "Questions",
    items: [
      {
        q: "What is the $49 for?",
        a: "Your AI agent's full setup: an always-on cloud computer with 50GB storage, a real phone number for SMS and voice, an email inbox, Slack (and iMessage coming soon) access, an encrypted secret vault, a model-agnostic harness (Claude, GPT, Gemini), authenticated browser automation, live web fetch, agentic deep search, and unlimited sub-agents. No tiers, no upgrades. Every account gets the full kit for $49/month.",
      },
      {
        q: "How do token packs work?",
        a: "You pick one of five monthly packs at signup ($50, $100, $250, $500, or $1000) and that pack covers your agent's LLM and tool usage for the month. Bump up or down any time from your settings; changes take effect immediately, prorated. We pass tokens through at the labs' public price, no markup. Our margin is the volume discount we get for buying in bulk.",
      },
      {
        q: "Which LLMs can I use?",
        a: "Any of them. The harness is model-agnostic: Claude, GPT, Gemini, and others. Your agents can pick the best model for each task, or you can pin a default in your config.",
      },
      {
        q: "Does my token allocation roll over?",
        a: "Yes. Unused tokens carry over to the next month, so nothing you've paid for goes to waste.",
      },
      {
        q: "How do seats work?",
        a: "Unlimited. Your whole team shares one workspace and one pool of tokens. No per-seat pricing, ever.",
      },
      {
        q: "What if I run out mid-month?",
        a: "Bump the slider to a larger pack from your settings. The new pack takes effect immediately and you only pay the difference, prorated for the remaining days.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. Cancel from your settings and it takes effect immediately. No long-term commitment, no cancellation fee.",
      },
      {
        q: "What about the credit card for agents?",
        a: "Coming soon. Your agents will get a real virtual credit card to make real-world purchases (book travel, buy SaaS subscriptions, order supplies) within limits you set. Bundled with the $49 plan when it ships.",
      },
    ],
  },
} as const;


/**
 * Pricing V2 — the GTM landing's model (founder call 2026-08-06): one flat
 * subscription, no token packs, no tiers. Okara-style single plan. The V1
 * `pricing` object above stays only for legacy pages until they migrate.
 */
export const pricingV2 = {
  monthlyDollars: 99,
  currency: "USD" as const,
  currencySymbol: "$",
  /** Okara's shape, value instead of a feature inventory (founder, 2026-08-19):
      plain header, the price, an access line, then what a month buys, with
      the figures up front. */
  title: "Simple, transparent pricing",
  blurb: "One plan, everything included. No hidden fees, no surprises.",
  perMonth: "/ month flat",
  /** The line under the price (Okara: "Full agent suite access"). */
  access: "Every agent included",
  /** Intro to the value list. */
  includedIntro: "What a month gets you:",
  /** The value lines — figure first. The lead and customer ranges are the
      founder's own (2026-08-19). The 90-day AI-search window is a placeholder
      he has to confirm before this ships.
      No spend cap here (founder 2026-09-19): the plan is flat, there is no
      variable spend to cap, and a prospect read the old "hard spend cap" as
      LLM API costs on top of the $99. The control line names what you approve
      today — leads and articles. */
  value: [
    { figure: "5 to 15", rest: "warm leads" },
    { figure: "2 to 3", rest: "new customers" },
    { figure: "30", rest: "articles, ranking on Google and cited by ChatGPT within 90 days" },
    { rest: "Approvals on leads and articles. You stay in control." },
  ],
  /** The line under the CTA (Okara's "Cancel anytime" slot). */
  fine: TRIAL_NOTICE,
} as const;
