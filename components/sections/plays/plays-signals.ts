// components/sections/plays/plays-signals.ts — every fixed string of the three signal pages under
// /plays (2026-10-17, the footer's Features column, "like Gojiberry's": their column ends on a
// "Recently funded startups" page). One page per way a Play finds companies: funding, hiring,
// tech stack. The people signals (posts, engagement) get no page of their own: they would put
// the outreach platform's mechanics on a page built to rank (validate.ts PLATFORM / SEQUENCE).
//
// Truth (pancake-cmo, checked 2026-10-17):
//   - funding: a `company_first` Play (PAN-997) on Coresignal's dated funding rounds: stages, an
//     announcement-date window, HQ country / region / city, headcount, optional tools; a record
//     without a dated round fails (funding-gate.ts, docs/integrations/planner-funding-provider-
//     verification.md). Coresignal then holds the people (play-data-sources.ts);
//   - hiring: `company_hiring` on TheirStack job posts: job-title patterns, posts first seen within
//     N days, direct employers only (agencies' posts excluded), size, industry, country;
//   - stack: `company_stack` on TheirStack: the tools a company's recent job posts ask for (any of
//     several), an ambiguous tool name is not guessed (the run names the candidates);
//   - every lead: one line on why it fits, checked against the Brain's ICP, approved by the
//     member before anyone is contacted; Pancake writes the message from that line.
// Copy rules: /plays's (plays-copy.ts header) + landing-voice budgets; "series X round",
// "fundraising" and "hiring their first" stay out (validate.ts BANNED); the only "N+" is
// "30+ data providers" (homepage-lint ALLOW). scripts/homepage-lint.mjs reads this file.

import { PLAYS_CTA, PLAYS_PATH, PLAYS_WAYS } from "@/components/sections/plays/plays-copy";
import { pricingV2 } from "@/lib/copy";
import { OG_IMAGE_ALT } from "@/lib/social-meta";
import type { SignalKind } from "@/lib/verticals/types";

export type SignalPageId = "funding" | "hiring" | "stack";

export type SignalFaq = { q: string; a: string; inJsonLd?: boolean };

export type SignalPage = {
  id: SignalPageId;
  path: string;
  /** The footer's Features column label: ≤ 153px at 16px, so it never wraps on a 375 phone. */
  footerLabel: string;
  meta: { title: string; description: string; ogTitle: string; crumb: string };
  h1: string;
  lede: string;
  steps: { title: string; body: string }[];
  examples:
    | { from: "written"; lede: string; prompts: string[] }
    /** the approved /for prompts of that signal kind, verbatim (plays-data.ts), each linking to its page */
    | { from: "for"; lede: string; kind: SignalKind; label: string };
  faqTitle: string;
  faq: SignalFaq[];
  /** Its row in the other pages' "More ways" list. */
  related: { title: string; line: string };
};

export const SIGNAL_PATHS: Record<SignalPageId, string> = {
  funding: `${PLAYS_PATH}/recently-funded-startups`,
  hiring: `${PLAYS_PATH}/companies-hiring`,
  stack: `${PLAYS_PATH}/tech-stack`,
};

/* ─── shared ────────────────────────────────────────────────────────────────── */

const APPROVE_STEP = {
  title: "You approve every lead.",
  body: "Each lead comes with one line on why it fits. Pancake writes the first message from that line, in your voice.",
};

const WHO_FAQ: SignalFaq = {
  q: "Who does Pancake find at each company?",
  a: "The people you sell to, by role: a founder, a CTO, a head of marketing. You approve each lead before anyone hears from you.",
};

const COST_FAQ: SignalFaq = {
  q: "What does it cost?",
  a: `From $${pricingV2.monthlyDollars} a month per workspace. A search uses credits, and Pancake shows the estimate before it runs.`,
  // as on the guide (D6): /pricing carries the price in its own structured data
  inJsonLd: false,
};

export const SIGNAL_SHARED = {
  /** The head's eyebrow and the breadcrumb's middle step: the hub. */
  hub: "Example Plays",
  crumbHome: "Home",
  ogImageAlt: OG_IMAGE_ALT,
  steps: { eyebrow: "How it works", h2: "One sentence starts the Play." },
  examples: {
    eyebrow: "Examples",
    h2: "Ask in your own words.",
    /** under the /for examples: back to that group on /plays */
    all: (n: number, label: string) => `All ${n} ${label} examples`,
  },
  faqEyebrow: "FAQ",
  related: { eyebrow: "Example Plays", h2: PLAYS_WAYS.h2 },
  hubRow: { title: "All example Plays", line: "Every example, sorted by how Pancake finds people." },
  cta: PLAYS_CTA,
} as const;

/* ─── the three pages ─────────────────────────────────────────────────────── */

export const SIGNAL_PAGES: Record<SignalPageId, SignalPage> = {
  funding: {
    id: "funding",
    path: SIGNAL_PATHS.funding,
    footerLabel: "Funded startups",
    meta: {
      title: "Find recently funded startups and their buyers · Pancake",
      description:
        "Pancake finds startups with a fresh funding round, checks each one against your ICP, then finds the people you sell to. You approve every lead.",
      ogTitle: "Recently funded startups · Pancake",
      crumb: "Recently funded startups",
    },
    h1: "Sell to recently funded startups.",
    lede: "Pancake finds companies with a fresh round, checks each one against your ICP, then finds the people you sell to.",
    steps: [
      { title: "Say who you want.", body: "Pick the round, the window, the country and the company size. Or say it in one sentence." },
      {
        title: "Pancake checks every round.",
        body: "It reads the date each round was announced and sets aside companies without one. Then it finds the people you sell to.",
      },
      APPROVE_STEP,
    ],
    examples: {
      from: "written",
      lede: "Start from one of these, or write your own.",
      prompts: [
        // the "More ways" funding card's example on /plays, verbatim
        PLAYS_WAYS.cards.find((c) => c.id === "way-funding")!.example,
        "We recruit engineers. Find CTOs at US startups that raised a Series A in the last 90 days.",
        "We run payroll. Find founders of US startups that raised a seed round in the last 6 months.",
        "We design brands. Find marketing heads at New York startups under 50 people that raised a round.",
      ],
    },
    faqTitle: "Questions about funding Plays.",
    faq: [
      { q: "Which rounds can a Play look for?", a: "Seed, Series A or any stage you name. A Play can look for one stage or several." },
      { q: "How recent is recent?", a: "You pick the window, like the last 90 days. Pancake reads the date each round was announced." },
      { q: "Can I narrow it down?", a: "Yes. Add a country, a region or a city, a company size, and the tools a company uses." },
      WHO_FAQ,
      COST_FAQ,
    ],
    related: { title: "Companies with fresh funding", line: "Startups with a recent round, and the people you sell to there." },
  },
  hiring: {
    id: "hiring",
    path: SIGNAL_PATHS.hiring,
    footerLabel: "Companies hiring",
    meta: {
      title: "Find companies hiring for a role, and their buyers · Pancake",
      description:
        "Name a role. Pancake finds companies with recent job posts for it, checks each one against your ICP, then finds the people you sell to. You approve every lead.",
      ogTitle: "Companies hiring · Pancake",
      crumb: "Companies hiring",
    },
    h1: "Sell to companies that are hiring.",
    lede: "Name a role. Pancake finds companies with recent job posts for it, checks each one against your ICP, then finds the people you sell to.",
    steps: [
      { title: "Name the role.", body: "Say the job you watch for, like SDR or data engineer. Add the country and the company size." },
      {
        title: "Pancake reads the job posts.",
        body: "It keeps recent posts from companies hiring for themselves. Then it finds the people you sell to.",
      },
      APPROVE_STEP,
    ],
    examples: {
      from: "for",
      lede: "Each one opens the industry page it comes from.",
      kind: "hiring",
      label: "hiring",
    },
    faqTitle: "Questions about hiring Plays.",
    faq: [
      { q: "Do recruiting agencies count?", a: "No. Pancake keeps companies hiring for themselves and leaves out agencies' job posts." },
      { q: "How recent are the job posts?", a: "You choose, like posts first seen in the last 30 days. Older posts are left out." },
      { q: "Where do the job posts come from?", a: "From TheirStack, one of the 30+ data providers Pancake uses." },
      WHO_FAQ,
      COST_FAQ,
    ],
    related: { title: "Companies hiring a role", line: "Companies with open job posts for a role you name." },
  },
  stack: {
    id: "stack",
    path: SIGNAL_PATHS.stack,
    footerLabel: "Tech stack",
    meta: {
      title: "Find companies by tech stack, and their buyers · Pancake",
      description:
        "Name a tool. Pancake finds companies whose recent job posts ask for it, checks each one against your ICP, then finds the people you sell to. You approve every lead.",
      ogTitle: "Companies by tech stack · Pancake",
      crumb: "Companies by tech stack",
    },
    h1: "Sell to companies by tech stack.",
    lede: "Name a tool. Pancake finds companies whose recent job posts ask for it, checks each one against your ICP, then finds the people you sell to.",
    steps: [
      {
        title: "Name the tool.",
        body: "Say the software you work with or replace, like HubSpot or Snowflake. Add the country and the company size.",
      },
      {
        title: "Pancake checks the job posts.",
        body: "It keeps companies whose recent posts ask for the tool. If a name could mean two tools, Pancake shows you both.",
      },
      APPROVE_STEP,
    ],
    examples: {
      from: "for",
      lede: "Each one opens the industry page it comes from.",
      kind: "stack",
      label: "tech stack",
    },
    faqTitle: "Questions about stack Plays.",
    faq: [
      {
        q: "How does Pancake know a company uses a tool?",
        a: "Its recent job posts ask for it. Pancake reads them through TheirStack, one of its 30+ data providers.",
      },
      { q: "What if a tool's name could mean two things?", a: "Pancake doesn't guess. It shows the tools the name could mean, and you pick one." },
      { q: "Can a Play look for several tools?", a: "Yes. A company fits when its job posts ask for any of them." },
      WHO_FAQ,
      COST_FAQ,
    ],
    related: { title: "Companies using a tool", line: "Companies whose job posts ask for a tool you name." },
  },
};

export const SIGNAL_PAGE_ORDER: SignalPageId[] = ["funding", "hiring", "stack"];
