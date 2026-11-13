import { CONTROL, FAQ, FINAL, WHAT } from "@/components/sections/guide-claude/guide-copy";
import { BENTO_TITLE, type BentoSlotId } from "@/components/sections/landing-v3/lp-bento-data";
import {
  BASE_LEVEL,
  PHONE_CREDITS,
  WORK_EMAIL_CREDITS,
  formatCredits,
  formatDollars,
  leadsEstimateLabel,
} from "@/lib/pricing";
import { TRIAL_CARD_REQUIREMENT, TRIAL_CREDITS_LABEL, TRIAL_LABEL } from "@/lib/trial";

/**
 * The paid search landing pages (2026-11-13): one page per search intent the ads answer, so the
 * searcher lands on the words they typed and the promise the ad made, instead of the homepage or
 * the /claude setup guide. The ads lead with Claude ("Tell Claude who to reach", "Deploy GTM
 * Plays from Claude", "Make Claude your sales machine"), so every page does too.
 *
 *   /claude-for-sales          Claude and MCP for sales, prospecting and lead generation
 *   /ai-sales-agents           AI sales agents, outbound sales automation, AI prospecting
 *   /lead-generation-software  lead generation software, B2B and AI lead generation
 *
 * Competitor searches keep their /<tool>-vs-pancake pages and /compare.
 *
 * noindex, out of the sitemap and llms.txt, linked from no page (SearchLandingPage.tsx says
 * why). Every figure comes from lib/trial.ts and lib/pricing.ts; the customer proof is the
 * homepage's own cards (lp-bento-data.ts); the eight ways, the control cards and two FAQ answers
 * are the Claude guide's (guide-copy.ts). Linted with the homepage copy (scripts/homepage-lint.mjs).
 */

export type SearchLandingId = "claude-for-sales" | "ai-sales-agents" | "lead-generation-software";

type Card = { title: string; body: string };
type Step = { title: string; body: string; /** an example request, shown as a chat message */ ask?: string };
type Qa = { q: string; a: string };

export type SearchLandingCopy = {
  id: SearchLandingId;
  path: `/${SearchLandingId}`;
  meta: { title: string; description: string; ogTitle: string };
  /** H1 = the badge (the searcher's words) + the title (the ad's promise) */
  hero: { badge: string; title: string; lede: string };
  steps: { eyebrow: string; h2: string; items: readonly [Step, Step, Step] };
  plays: { eyebrow: string; h2: string; lede: string };
  cards: { eyebrow: string; h2: string; items: readonly Card[] };
  faq: readonly Qa[];
  final: { title: string; body: string };
};

/* ── shared ───────────────────────────────────────────────────────────────────────────────── */

export const SL_CTA = {
  primary: "Start free",
  demo: "Watch demo",
} as const;

/** Under the hero buttons: the trial and the entry price (the card requirement is in the FAQ). */
export const SL_TRIAL_LINE = `${TRIAL_LABEL} with ${TRIAL_CREDITS_LABEL}. From ${formatDollars(BASE_LEVEL.dollars)} a month per workspace.`;

/** The film's section name, for the "Watch the demo" anchor. */
export const SL_DEMO_ID = "demo";

/** Three of the homepage's customer cards, three companies (lp-bento-data.ts: Kinro's quote,
 *  Praxis's and Vector Legal's figures). */
export const SL_PROOF: { eyebrow: string; h2: string; slots: readonly BentoSlotId[] } = {
  eyebrow: "Customers",
  h2: BENTO_TITLE,
  slots: ["quoteA", "kpiB", "kpiA"],
};

/** The left column of the Plays section: what people ask for (the demo film's Play, two of the
 *  app's own new-Play suggestions, play-suggestions.ts, and two of /plays/recently-funded-startups'
 *  examples, plays-signals.ts). */
export const SL_EXAMPLES = {
  label: "Example Plays",
  items: [
    "Heads of sales at Series A startups hiring SDRs",
    "Founders of Series A B2B software companies in the US",
    "Heads of sales engaging with posts about outbound",
    "We recruit engineers. Find CTOs at US startups that raised a Series A in the last 90 days.",
    "We design brands. Find marketing heads at New York startups under 50 people that raised a round.",
  ],
} as const;

export const SL_FAQ_HEAD = { eyebrow: "FAQ", h2: "Questions" } as const;

/** The Claude guide's eight ways a Play finds leads (public/llms.txt's list). */
export const SL_WAYS = { title: WHAT.cardTitle, items: WHAT.ways } as const;

/** One of the Claude guide's FAQ answers, by its question: a renamed question fails the build. */
function guideQa(q: string): Qa {
  const item = FAQ.items.find((f) => f.q === q);
  if (!item) throw new Error(`search landing: the Claude guide has no FAQ "${q}" (guide-copy.ts)`);
  return { q: item.q, a: item.a };
}

const COST: Qa = {
  q: "What does it cost?",
  a: `Pancake starts with a ${TRIAL_LABEL} and ${TRIAL_CREDITS_LABEL}, then costs from ${formatDollars(BASE_LEVEL.dollars)} a month per workspace. ${TRIAL_CARD_REQUIREMENT}.`,
};

const WHO: Qa = {
  q: "Who is it for?",
  a: "Founders who do their own sales, small B2B teams, agencies and GTM engineers. If you already work in Claude, start there.",
};

const FIRST_SEARCH = FINAL.title;

/* ── the three pages ──────────────────────────────────────────────────────────────────────── */

export const SEARCH_LANDINGS: Record<SearchLandingId, SearchLandingCopy> = {
  "claude-for-sales": {
    id: "claude-for-sales",
    path: "/claude-for-sales",
    meta: {
      title: "Claude for Sales: Prospecting and Lead Generation in Claude | Pancake",
      description:
        "Use Claude for sales prospecting. Connect Pancake once, then ask Claude for real leads, why each one fits and outreach from your own account.",
      ogTitle: "Claude for sales",
    },
    hero: {
      badge: "Claude for sales",
      title: "Make Claude your sales machine",
      lede: "Connect Pancake once. Then Claude finds real leads, tells you why each one fits and writes to them from your own account.",
    },
    steps: {
      eyebrow: "How it works",
      h2: "Tell Claude who to reach",
      items: [
        {
          title: "Connect Pancake",
          body: "Add Pancake as a connector in Claude and sign in with your browser. No API key. Pancake reads your website and builds your Brain.",
        },
        {
          title: "Ask in plain English",
          body: "Pancake turns your request into a Play, a search that keeps running. Claude shows you the cost before it starts.",
          ask: "Find heads of sales at Series A startups hiring SDRs.",
        },
        {
          title: "Pancake reaches out",
          body: "Every lead comes with why it fits. Add the ones you want to a sequence: Pancake writes each a personal message in your voice, sent from your own account.",
        },
      ],
    },
    plays: {
      eyebrow: "Plays",
      h2: "Deploy GTM Plays from Claude",
      lede: "A Play is one GTM idea turned into a search that keeps running. Run one per audience.",
    },
    cards: { eyebrow: CONTROL.eyebrow, h2: CONTROL.h2, items: CONTROL.cards },
    faq: [
      {
        q: "Does it work in Claude Code, ChatGPT and Codex?",
        a: "Yes. Pancake connects to Claude, Claude Code, ChatGPT and Codex with a browser sign-in, and it has its own app too.",
      },
      guideQa("Do I need an API key?"),
      guideQa("Is it the same data as the app?"),
      COST,
      WHO,
    ],
    final: { title: FIRST_SEARCH, body: FINAL.body },
  },

  "ai-sales-agents": {
    id: "ai-sales-agents",
    path: "/ai-sales-agents",
    meta: {
      title: "AI Sales Agents for Outbound: Find Buyers and Reach Out | Pancake",
      description:
        "An AI sales agent for outbound. Tell Pancake who to reach, from Claude or the app: it finds the people, checks each one fits and writes from your own account.",
      ogTitle: "AI sales agents",
    },
    hero: {
      badge: "AI sales agents",
      title: "Find buyers. Start the conversation.",
      lede: "Tell Pancake who to reach, from Claude or in the app. It finds the people, checks each one fits and writes to them from your own account.",
    },
    steps: {
      eyebrow: "How it works",
      h2: "Outbound from one sentence",
      items: [
        {
          title: "Say who to reach",
          body: "From Claude, ChatGPT, Codex or the Pancake Agent in the app. Pancake builds the Play: who to find and how to find them.",
          ask: "Find heads of sales at Series A startups hiring SDRs.",
        },
        {
          title: "Every lead checked for fit",
          body: "Pancake checks each lead against the ideal customer in your Brain. Every lead comes with why it fits: an open role, a funding round, a post they engaged with.",
        },
        {
          title: "A personal message per lead",
          body: "Written from why they fit, in your voice, and sent from your own account. A reply stops the sequence and comes back to you.",
        },
      ],
    },
    plays: {
      eyebrow: "Plays",
      h2: "Warm leads from buying signals",
      lede: "Each Play watches for one kind of signal and keeps searching on its own.",
    },
    cards: {
      eyebrow: CONTROL.eyebrow,
      h2: CONTROL.h2,
      items: [
        { title: "Your account.", body: "Messages go out under your name, from your own account." },
        { title: "Your voice.", body: "Read and edit any message before it goes out." },
        { title: "Your replies.", body: "Pancake labels each reply and hands it to you. It never answers for you." },
      ],
    },
    faq: [
      {
        q: "Who sends the messages?",
        a: "You do. Pancake writes each message from why the lead fits, and it goes out under your name, from your own account.",
      },
      {
        q: "What happens when someone replies?",
        a: "The sequence stops for that person. Pancake labels the reply and hands it to you to answer.",
      },
      {
        q: "Can it find emails and phone numbers?",
        a: "Yes. Pancake finds a lead's work email or phone number when you ask, and charges nothing when none is found.",
      },
      {
        q: "Does it work from Claude?",
        a: "Yes. Claude, Claude Code, ChatGPT and Codex connect with a browser sign-in. In the app, the same work happens in a chat with the Pancake Agent.",
      },
      COST,
    ],
    final: {
      title: FIRST_SEARCH,
      body: `Start your ${TRIAL_LABEL}, say who you want to reach, and your first Play starts searching.`,
    },
  },

  "lead-generation-software": {
    id: "lead-generation-software",
    path: "/lead-generation-software",
    meta: {
      title: "Lead Generation Software for B2B: Warm Leads That Keep Coming | Pancake",
      description: `B2B lead generation software. Tell Pancake who you want to reach: it finds them, checks they fit and keeps searching. From ${formatDollars(BASE_LEVEL.dollars)} a month, with a ${TRIAL_LABEL}.`,
      ogTitle: "Lead generation software",
    },
    hero: {
      badge: "Lead generation software",
      title: "Warm leads that keep coming",
      lede: "Tell Pancake who you want to reach. It finds them, checks they fit and keeps searching, with a reason on every lead.",
    },
    steps: {
      eyebrow: "How it works",
      h2: "From one sentence to warm leads",
      items: [
        {
          title: "Add your website",
          body: "Pancake reads it and builds your Brain: what you sell, who buys it, your competitors and your voice.",
        },
        {
          title: "Say who you want",
          body: "One sentence, in the app or from Claude. Pancake builds the Play, and it keeps searching on its own.",
          ask: "Find founders of Series A B2B software companies in the US.",
        },
        {
          title: "Get leads with a reason",
          body: "Every lead comes with why it fits. Find a work email or phone number, export the leads to your CRM, or let Pancake write to them from your own account.",
        },
      ],
    },
    plays: {
      eyebrow: "Plays",
      h2: "B2B leads from live signals",
      lede: "One Play per audience. Each keeps searching on its own, and every lead comes with why it fits.",
    },
    cards: {
      eyebrow: "Pricing",
      h2: `One plan, from ${formatDollars(BASE_LEVEL.dollars)} a month`,
      items: [
        { title: "Your whole team.", body: "One plan per workspace, with every Play and one sending account." },
        {
          title: `About ${leadsEstimateLabel(BASE_LEVEL.credits)} leads a month.`,
          body: `On ${formatCredits(BASE_LEVEL.credits)} credits. A narrow audience costs more, and Pancake shows the estimate before a search runs.`,
        },
        {
          title: "Emails and phone numbers.",
          body: `A work email is ${WORK_EMAIL_CREDITS} credits, a phone number ${PHONE_CREDITS}. Nothing is charged when none is found.`,
        },
      ],
    },
    faq: [
      {
        q: "Where do the leads come from?",
        a: "Pancake searches 50+ data providers and live signals: posts people engage with, open roles, funding rounds and tech stacks. Each lead is checked against the ideal customer in your Brain.",
      },
      {
        q: "Can I export my leads?",
        a: "Yes. Download a Play's leads as CSV, or send the ones you pick to HubSpot, Attio, Pipedrive and other CRMs.",
      },
      {
        q: "Does it reach out for me?",
        a: "When you want it to. Add leads to a sequence and Pancake writes each one a personal message, sent from your own account. A reply stops the sequence.",
      },
      COST,
      WHO,
    ],
    final: {
      title: FIRST_SEARCH,
      body: `Start your ${TRIAL_LABEL}, add your website and say who you want. New leads keep coming.`,
    },
  },
};
