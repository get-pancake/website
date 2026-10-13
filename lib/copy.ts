/** Locked marketing copy — do not change without explicit approval */

import { BASE_LEVEL, EXTRA_SENDER_DOLLARS, TOP_LEVEL, WORK_EMAIL_CREDITS, formatCredits } from "@/lib/pricing";
import { TRIAL_CREDITS_LABEL, TRIAL_DAYS, TRIAL_FREE_CREDITS_LABEL, TRIAL_NOTICE } from "@/lib/trial";

/**
 * The site description: the homepage hero lede, which is also the Google
 * description line (homepage + root-layout metadata, og/twitter, and the
 * Organization + SoftwareApplication JSON-LD all read it from here).
 * 2026-09-30: AI SEO retired from the product (pancake-cmo PR #1037), so the
 * third clause "grow your AI search visibility" became "reach out in your
 * voice". Founder-sensitive: change only with the founder's sign-off.
 * 2026-10-12: the founder's own new lede, with the H1 "Deploy GTM ideas in
 * seconds" (LpAudienceHeadline.tsx). His second pass that day: the first was
 * H1 "Agentic infrastructure to run your go-to-market" over a longer lede.
 */
export const SITE_DESCRIPTION =
  "Pancake gives your agent the brain, the data and the tools to run your go-to-market.";

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
 * Pricing V3 — one plan, five levels of monthly credits (2026-10-13, launch
 * of pancake-cmo PR #1220, ADR 0078). It replaces the flat plan of 2026-08-06
 * ("$99, everything included, as many leads as you want"): leads are no
 * longer unmetered, the trial is 7 days with 15,000 credits, and an extra
 * sending account is a paid licence. The numbers live in lib/pricing.ts and
 * lib/trial.ts; this block is the words.
 *
 * How it is said (founder brief 2026-10-13: "radically simple"):
 * - "One plan": every level is the same product. Only the monthly credits
 *   change, so the page never says tier, package or pack.
 * - Credits pay for two things, a search's research and each work email
 *   found. Everything else is included. Same sentence as the app's Usage page
 *   (`apps/frontend/src/features/credits/copy.ts`).
 * - Never a dollar value for a credit and never a count of leads a level
 *   "buys": a search is charged the research it did, and the app shows the
 *   estimate before it runs. The trial is how a buyer measures it.
 * - No spend cap (founder 2026-09-19). "Searches pause" is the whole rule
 *   when credits run out: no overage and no automatic top-up exist.
 * - The platform is never named (François 2026-09-23): "sending account",
 *   never the network.
 * public/pricing.md mirrors this block for agents: change it in the same
 * commit.
 */
export const pricingV2 = {
  /** The first level's price: what every "from $99" line reads. */
  monthlyDollars: BASE_LEVEL.dollars,
  currency: "USD" as const,
  currencySymbol: "$",
  /** The page's top. The kicker keeps the brand and "pricing" inside the H1
      (the 2026-10-07 audit wanted them there, like the title tag); the
      headline is the deal in two short sentences: the entry price, and that
      you only move up once Pancake pays for itself. It read "Pancake pricing:
      from $99 a month" until the founder's "this has to be improved"
      (2026-10-13). The lede: what stays the same, and the three things that
      make the credits safe to buy (your pick, rollover, change anytime). */
  kicker: "Pancake pricing",
  /** Two sentences, one per line from 768px (they flow as one on a phone). */
  titleLines: [`Start at $${BASE_LEVEL.dollars}.`, "Scale when it works."],
  blurb:
    "One plan, the whole product, your whole team. Pick your monthly credits, keep the ones you don't use, and change them anytime.",
  /** "per workspace", not "flat" (2026-10-06): billing is per workspace in the
      app (pancake-cmo `subscribe-additional-workspace.ts`). */
  perMonth: "/ month per workspace",
  /** The picker's label and the line under the price. */
  pickerLabel: "Monthly credits",
  creditsLine: "credits a month",
  /** Shown from the second level up. The figure is the app's own. */
  save: (percent: number) => `Save ${percent}% per credit`,
  /** Intro to the value list: the same list whatever the level. */
  includedIntro: "What you get, at every level:",
  /** The value lines: what the buyer gets, never how the plan is built
      (founder 2026-10-13, on a first draft that listed credits, Plays and
      seats: "not all fully value oriented for the user"). The scheduled
      searches keep leads coming; rollover is the month it saves; a Play is
      the idea it lets you try (creating and testing one is free, only a
      search uses credits); you approve every lead before anyone is contacted
      (reading a message before it sends is optional, so never "approvals on
      messages"); seats are the bill you don't get.
      Gone with the flat plan: "…and leads as you want" (searches use
      credits) and, here only, "Built to land 2 to 3 customers a month": it
      described the $99 month, and this list is the same at every level. The
      homepage card, which shows the first level, opens on it
      (LpPricing.tsx). */
  value: [
    { rest: "Warm leads that keep coming." },
    { rest: "Slow month? Unused credits roll over." },
    { rest: "Try any GTM idea. Building a Play is free." },
    { rest: "A personal message for each lead, in your voice." },
    { rest: "You approve every lead before anyone is contacted." },
    { rest: "Your whole team, with no seats to pay." },
  ],
  /** The line under the CTA (Okara's "Cancel anytime" slot). */
  fine: TRIAL_NOTICE,
  /** Above the largest level, sales quotes (the app's "Need more credits or a
      custom setup? Contact sales"). No Enterprise feature list exists, so the
      line promises none. */
  enterprise: { text: "Need more credits or a custom setup?", cta: "Talk to sales" },
} as const;

/**
 * "Credits find your leads. Everything else is included." — the /pricing
 * section under the card
 * (CreditsExplained.tsx). Every line is in pancake-cmo PR #1220:
 * - a production search is charged the research it did (it reserves credits
 *   while it runs, the rest comes back) and the app shows an estimate before
 *   it starts (`run-credit-estimate.ts`);
 * - a work email found is 50 credits, once; none found, nothing charged;
 * - creating, writing and testing a Play are free ("Creating and testing
 *   Plays is free"), and nothing else is in the task catalogue: the Brain,
 *   the sequence, reply handling, Slack and the digest, the MCP server.
 * The included list is the former "Everything in the $99." minus the two
 * lines a search now pays for (the searches themselves and the ICP check).
 */
export const pricingCredits = {
  title: "Credits find your leads. Everything else is included.",
  lede: "A search uses credits. So does a work email. Nothing else does.",
  /** The price list, in two groups: a name, one line, and what it costs on
      the right. A search has no fixed price (it is charged the research it
      did), so its cost reads as what the buyer gets instead: the estimate. */
  uses: {
    label: "Uses credits",
    rows: [
      {
        name: "A search",
        body: "Pancake finds people and checks each one against your ICP. Credits it doesn't use come back.",
        cost: "Estimate first",
      },
      {
        name: "A work email",
        body: "Only when Pancake finds one. No email, no credits.",
        cost: `${WORK_EMAIL_CREDITS} credits`,
      },
    ],
  },
  included: {
    label: "Never uses a credit",
    cost: "Free",
    items: [
      "Building and testing your Plays",
      "Your Brain, built from your website",
      "A warm-up, then up to three messages",
      "Replies stop the sequence and get sorted",
      "New leads in Slack and an 08:30 email",
      "Pancake in Claude and Codex",
    ],
  },
} as const;

/**
 * "No surprise bills." — why the credit plan is a fair deal, in four facts
 * (PricingFacts.tsx). Sources, all pancake-cmo PR #1220:
 * - the estimate before a search (`expectedCostLine`);
 * - rollover: at each renewal the balance keeps up to twice the monthly
 *   credits (`capNote`), i.e. one month of unused credits on top of the new
 *   month's;
 * - out of credits, chargeable work pauses; packs and auto top-up were
 *   removed (ADR 0078 §10), so nothing is billed beyond the plan;
 * - the per-credit saving grows to 18% at the largest level.
 */
export const pricingFacts = {
  title: "No surprise bills.",
  items: [
    {
      title: "You see the cost first.",
      body: "Pancake shows an estimate before a search runs.",
    },
    {
      title: "A slow month isn't lost.",
      body: "Unused credits roll over. Your balance holds up to two months of them.",
    },
    {
      title: "Never billed beyond your plan.",
      body: "Run out, and searches pause. No overage, no automatic top-up.",
    },
    {
      title: "More credits cost less.",
      body: `Up to ${TOP_LEVEL.savePercent}% less per credit at the higher levels.`,
    },
  ],
  /** AgentMail's line from the homepage testimonials (lp-bento-data.ts
      quoteC, the founder's shortened wording of 2026-10-13): keep the two
      in step. */
  quote: {
    text: "One Pancake Play replaced all our inbound tools.",
    name: "Adi Singh",
    role: "Co-founder, AgentMail",
    company: "AgentMail",
  },
} as const;

/**
 * The closing band of /pricing (PricingClose.tsx): the trial said as what it
 * is, the page's two CTAs again, and the way to /compare. The prices of the
 * tools a buyer weighs Pancake against are on those pages, dated and sourced,
 * not repeated here.
 */
export const pricingClose = {
  title: `Start with ${TRIAL_FREE_CREDITS_LABEL}.`,
  body: `Valid for ${TRIAL_DAYS} days. Cancel before the trial ends and you pay nothing.`,
  compare: "See Pancake next to the tools you compare it with",
} as const;

/**
 * What one plan covers — the /pricing section with the workspace drawing
 * (PlanMap.tsx), written 2026-10-06 after a customer email ("Does $99 include
 * a second workspace and second LinkedIn account?") and rewritten for the
 * credit plan on 2026-10-13. Checked against pancake-cmo PR #1220:
 * - One plan per workspace: a second workspace is its own subscription,
 *   charged off-session to the card on file, no trial, on the first level
 *   (`subscribe-additional-workspace.ts`; the member moves up from Billing).
 * - Credits: one balance per workspace, shared by every Play and teammate.
 * - Teammates: unlimited users at every level.
 * - Sending accounts: ONE is included; each extra is a $39/month licence
 *   (`EXTRA_SENDER_LICENCE_PRICE`). It was "at no extra cost" until
 *   2026-10-13. A sequence still sends from one account or rotates across a
 *   group of 1-10 (`ROUND_ROBIN_POOL_MAX_SENDERS`). The drawing shows one
 *   account so it stays the "from $99" workspace.
 * - Two audiences: a Play owns its targeting, copied from the Brain then
 *   edited per Play (ADR 0075); the Brain stays shared.
 */
export const pricingPlan = {
  title: "One plan per workspace.",
  lede: "A workspace is one company. Its plan covers the Brain, every Play and your whole team. They share one balance of credits.",
  workspace: "Your workspace",
  price: `From ${pricingV2.currencySymbol}${pricingV2.monthlyDollars} / month`,
  brain: {
    name: "Brain",
    body: "What Pancake knows about your company and how you sell. Every Play uses it.",
  },
  plays: [
    { name: "Agency owners", senders: ["Sarah"] },
    { name: "Marketing leads", senders: ["Sarah"] },
  ],
  playKicker: "Play",
  playMeta: "Its own audience and messages",
  sendsAs: "Sends as",
  newPlay: { name: "New Play", body: "As many as you want" },
  team: { members: ["Sarah", "Tom", "Maya"], body: "Invite your whole team at no extra cost." },
  another: {
    name: "Another company?",
    body: "That's a second workspace, with its own Brain, its own plan and its own credits.",
  },
  faq: [
    {
      q: "I sell to two audiences. One workspace or two?",
      a: "One. Give each audience its own Play, with its own targeting and messages. Both Plays share the Brain and the credits.",
    },
    {
      q: "Can I send from more than one account?",
      a: `Yes. One sending account is included. Each extra account is $${EXTRA_SENDER_DOLLARS} a month. A Play sends from one account or rotates across up to ten.`,
    },
    {
      q: "Do I pay per teammate?",
      a: "No. Invite your whole team to the workspace.",
    },
    {
      q: "When do I need a second workspace?",
      a: "When you run a second company or brand. It gets its own Brain, plan and credits, charged to the same card from day one, without a second trial.",
    },
  ],
} as const;

/**
 * "Billing questions." — the last /pricing section (BillingFaq.tsx). Its
 * answers join pricingPlan.faq in the page's FAQPage JSON-LD. Sources
 * (pancake-cmo PR #1220 unless said):
 * - Signup starts without a card; the card starts the trial (lib/trial.ts).
 *   The trial paywall shows the leads already found.
 * - Conversion: the level picked is charged at the trial's end; unused trial
 *   credits expire then (`trialExpiryNote`). Cancel before and nothing is
 *   charged.
 * - Leads per credit: no figure exists to quote (see pricingV2). A search
 *   keeps 1-50 leads (`leadLimit`).
 * - Rollover: carry min(unused, monthly credits) at renewal, cap 2x.
 * - Out of credits: searches pause; an upgrade keeps every unused credit and
 *   starts a new month today; "Start a new monthly cycle" is offered once the
 *   balance cannot pay for the next operation (`package.restart`).
 * - Changes: a larger level starts today, a smaller one at the next renewal
 *   (`change.description`).
 * - Cancel: access and credits run to the end of the paid period (/support,
 *   Terms §4).
 * - Promotion codes apply to the monthly payments after the trial
 *   (`TRIAL_PROMOTION_NOTE`, `allow_promotion_codes`).
 * Not answered until the founder decides: refunds and an annual plan.
 */
export const pricingFaq = {
  title: "Billing questions.",
  lede: "Credits, the trial, and changing or cancelling your plan.",
  more: { text: "Another question?", cta: "Ask support" },
  items: [
    {
      q: "What do credits pay for?",
      a: `Two things: the research a search does to find and check your leads, and each work email found, at ${WORK_EMAIL_CREDITS} credits. Building and testing Plays is free.`,
    },
    {
      q: "How many leads do I get for my credits?",
      a: "It depends on who you look for: a narrow audience takes more research per lead. Pancake shows an estimate before a search runs, and the trial lets you measure it on your own audience.",
    },
    {
      q: "Do unused credits roll over?",
      a: `Yes. At each renewal you keep what is left, up to one month of credits. On ${formatCredits(BASE_LEVEL.credits)} credits a month, your balance holds up to ${formatCredits(BASE_LEVEL.credits * 2)}.`,
    },
    {
      q: "What happens when I run out of credits?",
      a: "Searches pause, and your Brain, Plays and leads stay. You are never billed extra. Move up a level and keep what is left, or start your next month early.",
    },
    {
      q: "Can I change my monthly credits?",
      a: "Yes. More credits start today, and you keep the ones you have. Fewer credits start at your next renewal.",
    },
    {
      q: "How does the free trial work?",
      a: `Sign up free. Pancake reads your website, builds your Brain and shows the first leads it found. Add a card to start the trial: ${TRIAL_DAYS} days and ${TRIAL_CREDITS_LABEL}.`,
    },
    {
      q: "What happens when the trial ends?",
      a: "Your plan starts on the card you added, with the monthly credits you picked. Unused trial credits end with the trial. Cancel before it ends and you pay nothing.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes. There is no long-term commitment. You keep access and your credits to the end of the billing period you paid for.",
    },
    {
      q: "Do I need my own data tools or API keys?",
      a: "No. Your credits pay for the lead data and the ICP check. Claude, Claude Code and Codex connect with a browser sign-in, no API key.",
    },
    {
      q: "Can I use Pancake from my AI agent?",
      a: "Yes, on the same plan. Claude, Claude Code and Codex use the same Brain, Plays, leads and credits as the app.",
    },
    {
      q: "Have a code?",
      a: "Enter it when you add your card. It applies to your monthly payments after the trial.",
    },
  ],
} as const;
