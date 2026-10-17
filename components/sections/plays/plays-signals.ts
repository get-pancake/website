// components/sections/plays/plays-signals.ts — every fixed string of the three signal pages under
// /plays (2026-10-17, the footer's Features column, "like Gojiberry's": their column ends on a
// "Recently funded startups" page). One page per way a Play finds companies: funding, hiring,
// tech stack. The people signals (posts, engagement) get no page of their own: they would put
// the outreach platform's mechanics on a page built to rank (validate.ts PLATFORM / SEQUENCE).
//
// Founder, same day: the pages must be simple and explain the guidelines clearly and
// efficiently. So each page says what you get in one line, how to ask for it (three steps),
// shows example requests, then lists the details in plain sight ("Good to know", no accordion).
// No CTA card: Start free sits in the head.
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

import { PLAYS_PATH, PLAYS_WAYS } from "@/components/sections/plays/plays-copy";
import { pricingV2 } from "@/lib/copy";
import { OG_IMAGE_ALT } from "@/lib/social-meta";
import type { SignalKind } from "@/lib/verticals/types";

export type SignalPageId = "funding" | "hiring" | "stack";

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
  /** "Good to know": one-line facts the steps don't already say. */
  know: string[];
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

const COST_KNOW = `From $${pricingV2.monthlyDollars} a month per workspace. A search uses credits, and Pancake shows the estimate first.`;

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
  know: { eyebrow: "Details", h2: "Good to know" },
  related: { eyebrow: "Example Plays", h2: PLAYS_WAYS.h2 },
  hubRow: { title: "All example Plays", line: "Every example, sorted by how Pancake finds people." },
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
    know: [
      "Any stage you name: seed, Series A or later.",
      "Add the tools a company uses to narrow the list.",
      "Rounds come from Coresignal, one of 30+ data providers.",
      COST_KNOW,
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
    know: [
      "You choose how recent the job posts must be.",
      "Staffing agencies' posts are left out.",
      "Job posts come from TheirStack, one of 30+ data providers.",
      COST_KNOW,
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
    know: [
      "Name several tools: a company fits if its posts ask for any of them.",
      "Staffing agencies' posts are left out.",
      "Job posts come from TheirStack, one of 30+ data providers.",
      COST_KNOW,
    ],
    related: { title: "Companies using a tool", line: "Companies whose job posts ask for a tool you name." },
  },
};

export const SIGNAL_PAGE_ORDER: SignalPageId[] = ["funding", "hiring", "stack"];
