/** Locked marketing copy — do not change without explicit approval */

import {
  BASE_LEVEL,
  CREDITS_PER_LEAD,
  EXTRA_SENDER_DOLLARS,
  WORK_EMAIL_CREDITS,
  formatCredits,
  leadsEstimateLabel,
} from "@/lib/pricing";
import {
  TRIAL_CARD_REQUIREMENT,
  TRIAL_CREDITS,
  TRIAL_CREDITS_LABEL,
  TRIAL_DAYS,
  TRIAL_FREE_CREDITS_LABEL,
  TRIAL_OFFER,
} from "@/lib/trial";

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
 * 2026-10-27: the lede stays under the founder's new H1, "Infrastructure to
 * run your GTM factory"; "Infrastructure powering your GTM factory" since
 * 2026-10-28 (it also stops echoing this line's "to run your").
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
 * - Say what the buyer gets (leads, messages, replies, proof from customers),
 *   then what a level gets them. The mechanics come last and short: credits
 *   pay for a search's research and each work email found, everything else
 *   is included (the app's Usage page says the same,
 *   `apps/frontend/src/features/credits/copy.ts`).
 * - Never a dollar value for a credit. Leads per credit: an ESTIMATE only,
 *   always "about" and as a range (lib/pricing.ts CREDITS_PER_LEAD, founder
 *   2026-10-13: "we have to give an estimate of what credits give you"),
 *   never a figure a level "buys": a search is charged the research it did,
 *   and the app shows the real estimate before it runs.
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
  /** The page's top: the deal in two short sentences on ONE line (the entry
      price, and that you only move up once Pancake pays for itself), then a
      lede that also holds on one line on a desktop. Founder 2026-10-13, on
      two earlier tries: "this has to be improved" (it read "Pancake pricing:
      from $99 a month"), then "so many empty space and useless retour à la
      ligne" and "remove this pancake pricing stuff" (a badge above a
      two-line headline). `srTitle` is read by screen readers and search
      engines only, so the H1 still names the brand and the page. */
  srTitle: "Pancake pricing:",
  title: `Start at $${BASE_LEVEL.dollars}. Scale when it works.`,
  /** What the buyer gets, not how the plan is built (founder 2026-10-13, on a
      page that explained credits: "you're being soooo conceptual and
      answering things no one asks … user centric, value oriented, see what
      your customer gets"). */
  blurb: "Buyers found for you, a personal message for each, sent from your account. One plan for your whole team.",
  /** "per workspace", not "flat" (2026-10-06): billing is per workspace in the
      app (pancake-cmo `subscribe-additional-workspace.ts`). */
  perMonth: "/ month per workspace",
  /** The picker's label, the hint on its line, and the line under the price.
      The hint answers "can I start higher?" where the choice is made
      (founder 2026-10-13: the headline points at the lowest price; "if they
      want to pay more, do they have the possibility?"). No leads estimate
      under the price (founder, same day: "ça fait poser des questions"): it
      is in the levels table and the questions, after the section that says
      what one lead is. */
  pickerLabel: "Monthly credits",
  pickerHint: "Start on any level. Change anytime.",
  creditsLine: "credits a month",
  /** Shown from the second level up. The figure is the app's own. */
  save: (percent: number) => `Save ${percent}% per credit`,
  /** Intro to the value list: the same list whatever the level. */
  includedIntro: "What you get, at every level:",
  /** The six things a customer has at every level: their GTM Brain, the
      data, leads matched to their ICP, a message for each, the approval, the
      whole team. Each holds on one line in the card's three columns. "Why
      they fit" is not a selling line (founder 2026-10-13: "stop making 'the
      reason' such a power argument"). Rollover and the rest of the credit
      mechanics are in the levels table and the questions, not here. Reading
      a message before it sends is optional, so never "approvals on
      messages". */
  value: [
    { rest: "Your GTM Brain, built from your website." },
    { rest: "30+ data providers included." },
    { rest: "Leads matched to your ICP." },
    { rest: "A personal message for each lead." },
    { rest: "You approve every lead first." },
    { rest: "Your whole team. No seats to pay." },
  ],
  /** The line under the CTA (Okara's "Cancel anytime" slot): the trial is
      the same whatever the level picked above. */
  fine: `${TRIAL_OFFER}, at every level. ${TRIAL_CARD_REQUIREMENT}.`,
  /** Above the largest level, sales quotes (the app's "Need more credits or a
      custom setup? Contact sales"). No Enterprise feature list exists, so the
      line promises none. */
  enterprise: { text: "Need more credits or a custom setup?", cta: "Talk to sales" },
} as const;

/**
 * "Leads matched to your business, not to a filter." — what goes into ONE
 * lead, before any count of them (PricingLead.tsx). Founder 2026-10-13: say
 * that it is "pas que des leads mais vraiment des trucs de ouf ultra précis",
 * "car sinon ça fait cher juste le lead"; then, on a first version built on
 * "why they fit": "talk gtm brain (context etc), talk data providers … stop
 * making 'the reason' such a power argument while I am not sure it's the
 * case". So the four things are the homepage's own triad (the brain, the
 * data, the tools) plus the signals, each said as what the buyer gets, and
 * "why they fit" is not a claim anywhere on the page.
 * Facts:
 * - GTM Brain: built from the customer's website; it holds their ICP,
 *   personas, competitors, messaging and voice, every Play starts from it,
 *   and it learns from the leads they approve or pass (not from replies:
 *   lp-steps-content.ts).
 * - "30+ data providers" is the homepage's own label (lp-story-signals-data.ts,
 *   the dive's signals story; the founder's figure, 2026-10-13: "Mets 30+ data provider sur
 *   pancake.ai"); the three named here are the ones behind funding, open
 *   roles and people data, as the dive's signals story draws them (Dealroom
 *   on the seed round's disc). No contract or API key on the customer's side.
 * - Signals: the ways a Play finds people (/plays). Job changes and news are
 *   NOT among them.
 * - Outreach: a personal message per lead in the customer's voice, sent from
 *   their own account once they approve the lead; a reply stops the sequence.
 * The example is the homepage's cast (Tamsin Okafor of Quillfern, a lead of
 * the invented seller Acme, which designs websites for startups;
 * lp-step-data.ts holds the cast; the dive's lineage story traces her open
 * role to TheirStack, as the badge does; the signals story puts Dealroom on
 * the funding, as the seed round's badge does), labelled as one lead. Keep
 * them in step.
 */
export const pricingLead = {
  title: "Leads matched to your business, not to a filter.",
  lede: "Your GTM Brain, 30+ data providers and outreach in your voice work on every lead. All in the plan.",
  points: [
    {
      title: "Your GTM Brain",
      body: "Pancake reads your website and learns your ICP, your personas, your competitors and your voice. Every search and message starts from that context, and it learns from each lead you approve or pass.",
    },
    {
      title: "30+ data providers, included",
      body: "Dealroom, TheirStack, Coresignal and more, in one plan. No contract to sign, no API key, no data bill on the side.",
    },
    {
      title: "Live buying signals",
      body: "Funding rounds, open roles, tech stacks, posts and who reacts to them. A Play keeps searching on your schedule, so new leads keep coming.",
    },
    {
      title: "Outreach from your account",
      body: "A personal message for each lead, in your voice, sent from your own account once you approve the lead. A reply stops the sequence.",
    },
  ],
  example: {
    kicker: "One lead, as you get it",
    initials: "TO",
    name: "Tamsin Okafor",
    role: "Founder & CEO, Quillfern",
    signalsLabel: "Signals found",
    signals: [
      { text: "Raised a seed round this month", source: "Dealroom" },
      { text: "Hiring a marketing lead", source: "TheirStack" },
    ],
    brainLabel: "Matched by your GTM Brain",
    brain: "You design websites for startups that just raised.",
    messageLabel: "Message, in your voice",
    message: "Hi Tamsin, congrats on Quillfern’s seed round. Want a new website live before your marketing lead starts?",
  },
} as const;

/**
 * "Take it from them" — what customers got, in their own figures and words
 * (PricingProof.tsx). Each is a customer's own statement, sourced in the
 * homepage testimonials' file (components/sections/landing-v3/
 * lp-bento-data.ts and its allow-list in scripts/homepage-lint.mjs): Kinro's
 * "15" and AgentMail's quote as the homepage shows them; Vector Legal's
 * homepage figure ("7 days to real pipeline") said as Aurelie's sentence,
 * without the dollar amount of her statement (her yes on that wording is the
 * founder's to get); Praxis's "10+ meetings booked a week" is Diana Khramina's second
 * figure, which left the homepage's seven cards for room, not for doubt
 * (her message of 2026-09-18 and her film). The title is the homepage's
 * (BENTO_TITLE). `logo` is the marquee's file in public/logos/customers, with
 * its width / height.
 */
export const pricingProof = {
  title: "Take it from them",
  items: [
    {
      figure: "15",
      label: "meetings booked in a week",
      who: "Pierre-Alexandre Kamienny, CEO",
      company: "Kinro",
      logo: { file: "kinro.svg", ratio: 1308 / 356 },
    },
    {
      figure: "10+",
      label: "meetings booked a week",
      who: "Diana Khramina, CEO",
      company: "Praxis",
      logo: { file: "praxis.png", ratio: 1392 / 370 },
    },
    {
      // her quote again since 2026-10-17, without the dollar amount of her statement
      // (founder: "not money oriented", "still promotional and bullish")
      quote: "Pancake built our pipeline in 7 days.",
      who: "Aurelie, Head of GTM",
      company: "Vector Legal",
      logo: { file: "vector-legal.png", ratio: 1111 / 151 },
    },
    {
      quote: "One Pancake Play replaced all our inbound tools.",
      who: "Adi Singh, Co-founder",
      company: "AgentMail",
      logo: { file: "agentmail.svg", ratio: 1986 / 363 },
    },
  ],
} as const;

/**
 * "More credits, more leads." — every level side by side, by what it gets
 * you (PricingLevels.tsx). The leads column is the ESTIMATE of lib/pricing.ts
 * (CREDITS_PER_LEAD: planning figures from pancake-cmo ADR 0078, not a
 * measurement), so the lede says what it rests on and that a narrow audience
 * costs more. The note under the table is the whole of the credit mechanics a
 * buyer needs before the questions.
 */
export const pricingLevels = {
  title: "More credits, more leads.",
  lede: `A lead like the one above takes about ${CREDITS_PER_LEAD.low} to ${CREDITS_PER_LEAD.high} credits of research. A narrow audience costs more, and Pancake shows the real estimate before a search runs.`,
  columns: { credits: "Monthly credits", leads: "Qualified leads a month", price: "Price", saving: "Saving" },
  leads: (range: string) => `About ${range}`,
  perMonth: "/ month",
  note: `A work email is ${WORK_EMAIL_CREDITS} credits more, only when Pancake finds one. Building Plays, messages and replies use no credits. Unused credits roll over.`,
} as const;

/**
 * The closing band of /pricing (PricingClose.tsx): the trial said as what it
 * is, the page's two CTAs again, and the way to /compare. The prices of the
 * tools a buyer weighs Pancake against are on those pages, dated and sourced,
 * not repeated here.
 */
export const pricingClose = {
  title: `Start with ${TRIAL_FREE_CREDITS_LABEL}.`,
  body: `About ${leadsEstimateLabel(TRIAL_CREDITS)} leads on your own buyers. Cancel within ${TRIAL_DAYS} days and you pay nothing.`,
  compare: "See Pancake next to the tools you compare it with",
} as const;

/**
 * "Billing questions." — the questions buyers have sent us or asked on calls
 * (BillingFaq.tsx), in the order they come up: what do I get, the trial,
 * levels, running out, cancelling, the team, accounts, audiences, tools. A
 * question nobody asked ("What do credits pay for?") left on 2026-10-13
 * (founder: "answering things no one asks"); its facts sit in the answers
 * that need them. The four answers of the former workspace drawing
 * ("One plan per workspace.", a customer's email of 2026-10-06) are here too.
 * The same answers ship in the page's FAQPage JSON-LD and in llms-full.txt.
 * Sources (pancake-cmo PR #1220 unless said):
 * - Leads: the estimate of lib/pricing.ts. A search keeps 1-50 leads.
 * - Signup starts without a card; the card starts the trial (lib/trial.ts).
 *   The trial paywall shows the leads already found.
 * - Conversion: the level picked is charged at the trial's end. Cancel before
 *   and nothing is charged.
 * - Levels: the pricing page's choice is carried into the app
 *   (`selected-package.ts`); a larger level starts today and keeps every
 *   unused credit, a smaller one starts at the next renewal.
 * - Out of credits: searches pause; "Start a new monthly cycle" is offered
 *   once the balance cannot pay for the next operation (`package.restart`).
 * - Rollover: carry min(unused, monthly credits) at renewal.
 * - Cancel: access and credits run to the end of the paid period (/support,
 *   Terms §4).
 * - Teammates: unlimited at every level. Sending accounts: ONE included, each
 *   extra a $39/month licence; a sequence sends from one account or rotates
 *   across a group of 1-10. The platform is never named (François
 *   2026-09-23): "sending account".
 * - Two audiences: a Play owns its targeting (ADR 0075). A second workspace
 *   is its own subscription, no trial (`subscribe-additional-workspace.ts`).
 * - Promotion codes apply to the monthly payments after the trial.
 * Not answered until the founder decides: refunds and an annual plan.
 */
export const pricingFaq = {
  title: "Self-serve billing questions.",
  more: { text: "Another question?", cta: "Ask support" },
  items: [
    {
      q: "How many leads will I get?",
      a: `About ${leadsEstimateLabel(BASE_LEVEL.credits)} qualified leads a month on ${formatCredits(BASE_LEVEL.credits)} credits, and twice that at each level up. Each one is matched to your business by your GTM Brain, on data from 30+ providers, and gets a personal message. It is an estimate: a narrow audience costs more, and Pancake shows the real one before a search runs.`,
    },
    {
      q: "How does the free trial work?",
      a: `Sign up free. Pancake reads your website, builds your Brain and shows the first leads it found. Add a card to start the trial: ${TRIAL_DAYS} days and ${TRIAL_CREDITS_LABEL}, about ${leadsEstimateLabel(TRIAL_CREDITS)} leads.`,
    },
    {
      q: "What happens when the trial ends?",
      a: "Your plan starts on the card you added, on the level you picked. Cancel before the trial ends and you pay nothing.",
    },
    {
      q: "Can I start on a higher level, or change later?",
      a: "Yes. Pick your level at the top of this page and Start free opens Pancake on it. Later, more credits start the same day and you keep the ones you have. Fewer credits start at your next renewal.",
    },
    {
      q: "What happens when I run out of credits?",
      a: "Searches pause. Your leads, messages and replies stay, and you are never billed extra. Move up a level, or start your next month early.",
    },
    {
      q: "Do unused credits roll over?",
      a: "Yes. At each renewal you keep what is left, up to one month of credits.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes. There is no long-term commitment. You keep access and your credits to the end of the period you paid for.",
    },
    {
      q: "Do I pay per teammate?",
      a: "No. Invite your whole team to the workspace.",
    },
    {
      q: "Can I send from more than one account?",
      a: `Yes. One sending account is included. Each extra account is $${EXTRA_SENDER_DOLLARS} a month. A Play sends from one account or rotates across up to ten.`,
    },
    {
      q: "I sell to two audiences. Do I need two plans?",
      a: "No. Give each audience its own Play, with its own targeting and messages, on the same plan. A second company or brand is a second workspace, with its own plan.",
    },
    {
      q: "Do I need my own data tools or API keys?",
      a: "No. Your credits pay for the lead data and the ICP check. Claude, Claude Code, ChatGPT and Codex connect with a browser sign-in, no API key.",
    },
    {
      q: "Can I use Pancake from Claude or Codex?",
      a: "Yes, on the same plan. Claude, Claude Code, ChatGPT and Codex use the same Plays, leads and credits as the app.",
    },
    {
      q: "Have a code?",
      a: "Enter it when you add your card. It applies to your monthly payments after the trial.",
    },
  ],
} as const;
