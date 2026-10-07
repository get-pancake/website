/** Locked marketing copy — do not change without explicit approval */

import { TRIAL_LABEL, TRIAL_NOTICE } from "@/lib/trial";

/**
 * The site description: the homepage hero lede, which is also the Google
 * description line (homepage + root-layout metadata, og/twitter, and the
 * Organization + SoftwareApplication JSON-LD all read it from here).
 * 2026-09-30: AI SEO retired from the product (pancake-cmo PR #1037), so the
 * third clause "grow your AI search visibility" became "reach out in your
 * voice". Founder-sensitive: change only with the founder's sign-off.
 */
export const SITE_DESCRIPTION =
  "Pancake’s AI agents monitor buying signals, find warm leads, reach out in your voice, and learn from every interaction.";

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

/** The plan price in dollars, the one number every pricing line reads. */
const MONTHLY_DOLLARS = 99;

/**
 * Pricing V2 — the GTM landing's model (founder call 2026-08-06): one flat
 * subscription, no token packs, no tiers. Okara-style single plan.
 * 2026-10-07: the V1 `pricing` object ($49 + token packs, "$100 in free
 * credits") and its unmounted components were deleted, so a revert can't
 * bring that offer back (one already did, 2026-09-02).
 * public/pricing.md mirrors this block, pricingPlan and pricingFaq for
 * agents: change it in the same commit. One line is left out of the .md on
 * purpose: "Built to land 2 to 3 customers a month" (open founder decision
 * D4b; add it there if he keeps it).
 */
export const pricingV2 = {
  monthlyDollars: MONTHLY_DOLLARS,
  currency: "USD" as const,
  currencySymbol: "$",
  /** Okara's shape, value instead of a feature inventory (founder, 2026-08-19):
      plain header, the price, an access line, then what a month buys, with
      the figures up front.
      2026-10-07: the /pricing H1 names the brand and the price, the same unit
      as the title tag. It read "Simple, transparent pricing", the homepage
      H2 word for word (LpPricing.tsx keeps that line). Still a plain header. */
  title: `Pancake pricing: $${MONTHLY_DOLLARS} a month per workspace`,
  blurb: "One plan, everything included. No hidden fees, no surprises.",
  /** "per workspace", not "flat" (2026-10-06): a customer read the $99 as
      possibly covering a second workspace. Billing is per workspace in the
      app (pancake-cmo `subscribe-additional-workspace.ts`). */
  perMonth: "/ month per workspace",
  /** The line under the price (Okara: "Full agent suite access").
      2026-10-07: it read "Everything included", which repeated the lede
      right above it. Teammates are a plain included feature in the app
      (`workspace_seats`, no quota). */
  access: "Your whole team included",
  /** Intro to the value list. It read "What a month gets you:" until the
      leads line dropped its count (2026-10-05). */
  includedIntro: "What you get:",
  /** The value lines — figure first. The lead and customer ranges are the
      founder's own (2026-08-19).
      No spend cap here (founder 2026-09-19): the plan is flat, there is no
      variable spend to cap, and a prospect read the old "hard spend cap" as
      LLM API costs on top of the $99.
      AI SEO retired 2026-09-30 (pancake-cmo PR #1037): the "30 articles,
      ranking on Google and cited by ChatGPT" line is gone, and the control
      line names leads only. You approve every lead before anyone is
      contacted; reading or editing a message before it sends is optional, so
      never write "approvals on messages". Kept in step with the
      homepage CHECKLIST (LpPricing.tsx).
      The customers line says what Pancake is built for, never a promise
      (founder 2026-10-04: "how can you guarantee customers?" kept coming
      back, and the Terms promise no results). `lead` sits before the
      figure so the number stays bold mid-line. No lead count (founder
      2026-10-05): Plays make leads as many as you want, and the nightly run
      has them waiting every morning. Revisit if credit enforcement ships
      (pancake-cmo PR #1220). */
  value: [
    { rest: "As many Plays and leads as you want" },
    { rest: "Warm leads every morning" },
    { lead: "Built to land", figure: "2 to 3", rest: "customers a month" },
    { rest: "A personal message for each lead, in your voice" },
    { rest: "You approve every lead. You stay in control." },
  ],
  /** The line under the CTA (Okara's "Cancel anytime" slot). */
  fine: TRIAL_NOTICE,
  /** "Everything in the $99." — the /pricing section under the plan map
      (PlanIncluded.tsx), added 2026-10-07: the card sells outcomes and left
      out what competitors charge extra for. Every line is in pancake-cmo
      (Brain from the website, nightly Play schedules, AI ICP check with a
      reason, warm-up + up to 3 steps, reply detection that stops the
      sequence, Slack posts + the 08:30 digest, the MCP server).
      Not listed until the PR #1220 pricing decision: work-email lookup and
      up to 10 sending accounts per Play (#1220 would bill both). The FAQ in
      pricingPlan already answers the accounts question. */
  included: {
    title: `Everything in the $${MONTHLY_DOLLARS}.`,
    items: [
      "Your Brain, built from your website",
      "A fresh search every night, on your schedule",
      "An ICP check and a reason on every lead",
      "A warm-up, then up to three messages",
      "Replies stop the sequence and get sorted",
      "New leads in Slack and an 08:30 email",
      "Pancake in Claude and Codex",
    ],
  },
} as const;

/**
 * What one plan covers — the /pricing section under the card (PlanMap.tsx),
 * written 2026-10-06 after a customer email: "Does $99 include a second
 * workspace and second LinkedIn account? … We have two separate ICPs."
 * Every line is checked against pancake-cmo main (2026-10-06):
 * - One plan per workspace: a second workspace is its own subscription at the
 *   same price, charged off-session to the card on file, no trial
 *   (`billing/commands/subscribe-additional-workspace.ts`).
 * - Teammates: `workspace_seats` is a plain included feature, no quota.
 * - Sending accounts: no billing gate on connecting more; a sequence sends
 *   from ONE account or rotates across a group of 1-10
 *   (`ROUND_ROBIN_POOL_MAX_SENDERS`). If the $39 sender licence of the 09-24
 *   pricing spec ships, rewrite the accounts answer first.
 * - Two audiences: a Play owns its targeting, copied from the Brain then
 *   edited per Play (ADR 0075); the Brain stays shared.
 * The platform is never named (François 2026-09-23): "accounts you send
 * from", never LinkedIn.
 */
export const pricingPlan = {
  title: "One plan per workspace.",
  lede: "A workspace is one company. Its plan covers the Brain, every Play, your whole team and the accounts you send from.",
  workspace: "Your workspace",
  price: `${pricingV2.currencySymbol}${pricingV2.monthlyDollars} / month`,
  brain: {
    name: "Brain",
    body: "What Pancake knows about your company and how you sell. Every Play uses it.",
  },
  plays: [
    { name: "Agency owners", senders: ["Sarah"] },
    { name: "Marketing leads", senders: ["Sarah", "Tom"] },
  ],
  playKicker: "Play",
  playMeta: "Its own audience and messages",
  sendsAs: "Sends as",
  newPlay: { name: "New Play", body: "As many as you want" },
  team: { members: ["Sarah", "Tom", "Maya"], body: "Invite your whole team at no extra cost." },
  another: {
    name: "Another company?",
    body: `That's a second workspace, with its own Brain and its own ${pricingV2.currencySymbol}${pricingV2.monthlyDollars} plan.`,
  },
  faq: [
    {
      q: "I sell to two audiences. One workspace or two?",
      a: "One. Give each audience its own Play, with its own targeting, messages and accounts. Both Plays share the Brain.",
    },
    {
      q: "Can I send from more than one account?",
      a: "Yes, at no extra cost. Each Play sends from one account or rotates across up to ten.",
    },
    {
      q: "Do I pay per teammate?",
      a: "No. Invite your whole team to the workspace.",
    },
    {
      q: "When do I need a second workspace?",
      a: `When you run a second company or brand. It gets its own Brain and its own ${pricingV2.currencySymbol}${pricingV2.monthlyDollars} plan, charged to the same card from day one, without a second trial.`,
    },
  ],
} as const;

/**
 * "Billing questions." — the /pricing section under "Everything in the $99."
 * (BillingFaq.tsx), added 2026-10-07 from the questions buyers sent
 * (2026-09-18 and 2026-09-19 threads). Its answers join pricingPlan.faq in
 * the page's FAQPage JSON-LD. Sources:
 * - Signup starts without a card; the card starts the trial (lib/trial.ts,
 *   confirmed 2026-09-18). The trial paywall shows the leads already found.
 * - Cancel before the trial ends and nothing is charged (app billing copy);
 *   access runs to the end of the paid period (/support, Terms §4).
 * - One search keeps 1-50 leads (`leadLimit`); Plays search again each night.
 * - Promotion codes apply to the monthly payments after the trial
 *   (`TRIAL_PROMOTION_NOTE`, `allow_promotion_codes`).
 * Not answered until the founder decides: refunds and an annual plan, how
 * credits are explained, and what the trial includes (AGENTS.md: trial
 * feature access is not confirmed).
 */
export const pricingFaq = {
  title: "Billing questions.",
  items: [
    {
      q: "How does the free trial work?",
      a: `Sign up free. Pancake reads your website, builds your Brain and shows the first leads it found. Add a card to start the ${TRIAL_LABEL}.`,
    },
    {
      q: "What happens when the trial ends?",
      a: `Your plan starts at ${pricingV2.currencySymbol}${pricingV2.monthlyDollars} a month per workspace, on the card you added. Cancel before the trial ends and you pay nothing.`,
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes. There is no long-term commitment. You keep access to the end of the billing period you paid for.",
    },
    {
      q: "Do I need my own data tools or API keys?",
      a: "No. Lead data and the ICP check are in the plan. Claude, Claude Code and Codex connect with a browser sign-in, no API key.",
    },
    {
      q: "Is there a limit on leads?",
      a: "Each Play search keeps up to 50 new leads, and every Play searches again each night.",
    },
    {
      q: "Can I use Pancake from my AI agent?",
      a: "Yes, on the same plan. Claude, Claude Code and Codex use the same Brain, Plays and leads as the app.",
    },
    {
      q: "Have a code?",
      a: "Enter it when you add your card. It applies to your monthly payments after the trial.",
    },
  ],
} as const;
