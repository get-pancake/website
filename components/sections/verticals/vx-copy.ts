// components/sections/verticals/vx-copy.ts — every FIXED string of the /for template.
// Rule: nothing in this file may name a vertical (lint VX_FIXED_LEAK in validate.ts).
// App-UI strings are verbatim from get-pancake/pancake-cmo @07513e8 (product-truth §3,
// campaigns/copy.ts, signal-copy.ts, leads-table.tsx, slack lead-finding-message.ts), except
// where the app names the outreach platform: /for pages never do (founder 2026-09-23, validate.ts
// PLATFORM), so those read "People signals", "Profile · View ↗", "your own account". Since
// 2026-09-29 (founder: "vitrine plus compliant") the outreach is told at the outcome level too —
// a warm-up, a first touch with no pitch, up to three messages — never the visit / like / invite
// steps (validate.ts SEQUENCE).
// In the repo, import TRIAL_LABEL from "@/lib/trial" instead of the local constant below.

import { TRIAL_LABEL } from "@/lib/trial";
import type { SignalKind, VerticalConfig } from "@/lib/verticals/types";


/* ─── switches (one line each = one founder answer) ─────────────────────────── */

/** D1. "brand" = <title>Pancake</title> (the landings rule, as /agents and /demo).
 *  Founder answer 2026-09-22: descriptive titles win on the /for pages (the homepage stays "Pancake"). */
export const VX_TITLE_MODE = "descriptive" as "brand" | "descriptive"; // founder 2026-09-22: descriptive SEO titles on /for/*
/** D15. "truthful" = VX_PRICING_CHECKLIST on /for pages; "homepage" = LpPricing default. */
export const VX_PRICING_MODE: "truthful" | "homepage" = "truthful";
// D3 (one AI SEO line in the pricing checklist) is gone: AI SEO retired from the product on
// 2026-09-30 (pancake-cmo PR #1037). validate.ts AI_SEO fails the build on any AI SEO claim.

/* ─── signal vocabulary ─────────────────────────────────────────────────────── */

export const SIGNAL_LABEL: Record<SignalKind, string> = {
  keyword: "Keyword",
  competitor: "Competitor",
  influencer: "Influencer",
  own_brand: "Own brand",
  hiring: "Hiring",
  stack: "Stack",
};
/** Slack says "Tech stack" where the app says "Stack" (describeLeadSignal). */
export const SLACK_SIGNAL_LABEL: Record<SignalKind, string> = { ...SIGNAL_LABEL, stack: "Tech stack" };
/** App order (SIGNAL_GROUPS): the people signals, then Company signals. The app names the first
 *  group after the platform; /for pages never name it (founder 2026-09-23, see validate.ts
 *  PLATFORM), so the mock reads "People signals" (people posting, engaging, following). */
export const SIGNAL_GROUPS: { label: string; kinds: SignalKind[] }[] = [
  { label: "People signals", kinds: ["keyword", "competitor", "influencer", "own_brand"] },
  { label: "Company signals", kinds: ["hiring", "stack"] },
];
/** signal-settings.ts: defaultEnabledSignalKinds vs optInSignalKinds. */
export const SIGNAL_OPT_IN: SignalKind[] = ["hiring", "stack"];

/* ─── page chrome ───────────────────────────────────────────────────────────── */

export const VX_CTA_LABELS = { primary: "Start free", secondary: "Book a demo" } as const;

/** The breadcrumb (visible in the hero, and the BreadcrumbList JSON-LD): Home › Industries › {name.title}. */
export const VX_CRUMBS = { home: "Home", hub: "Industries", aria: "Breadcrumb" } as const;

/* ─── VxHero (founder 2026-09-22: functional, Origami-style — no homepage art) ─── */

export const VX_HERO = {
  /** The label line inside the H1 (= og:title): "Pancake for {plural}". */
  label: (v: VerticalConfig) => `Pancake for ${v.name.plural}`,
  /** The caps label over the example-prompt rows. */
  promptsLabel: "Example prompts",
  /** Each row's accessible name suffix: the row plays that prompt in the demo below. */
  promptHint: "Play it in the demo.",
};

/* ─── VxDemo ────────────────────────────────────────────────────────────────── */

export const VX_DEMO = {
  tablistAria: "Pancake, step by step",
  tabs: [
    { key: "brief", num: "01", label: "Play", title: "Tell Pancake who to reach.", body: "It builds the Play and runs its first search." },
    { key: "leads", num: "02", label: "Leads", title: "Wake up to warm leads.", body: "New leads land by 8:30 AM, each with the reason it fits." },
    { key: "outreach", num: "03", label: "Sequence", title: "A personal message for every lead.", body: "Pancake warms up each lead, then writes as you." },
    { key: "slack", num: "04", label: "Slack", title: "Approve from Slack.", body: "New leads post to your channel. Approve or reject in one click." },
  ],
  controls: { pause: "Pause demo", play: "Play demo" },
  /** role="img" labels per pane; {prompt} = active prompt text, {lead} = lead 0 name. */
  paneAria: {
    brief: "Pancake’s chat. The request “{prompt}” becomes a new Play, created. Its first search is running.",
    leads: "The Play’s leads, each with why they fit. {lead} is open, approved and ready to contact.",
    outreach: "The first message Pancake writes for {lead}, from their activity, in your voice.",
    slack: "A Slack channel where Pancake posts new leads with Approve and Reject buttons. {lead} is approved.",
  },
  /** The app window. 2026-10-07 (founder: "on comprend pas le produit… trop de boutons, trop de
   *  texte"): the window keeps the logo only (no nav, no rail, no "Use in Claude / Codex"), and
   *  each tab shows one moment of pancake-cmo @ac480839 with nothing around it. */
  app: {
    /** Tab 01's page, before and after the Play is created: the Plays empty state (plays/copy.ts,
     *  the deferred state's second sentence), then the new Play with its search status
     *  (plays/copy.ts searchStatus, PAN-1740) and the Active filter's word. */
    plays: {
      readyTitle: "Ready when you are",
      readyBody: "Tell Pancake who you want to find, and it builds your first Play with you.",
      status: "Active",
      searching: "Searching for new leads",
      leave: "You can leave this page: the search keeps going without you.",
    },
    chat: {
      /** The app's composer placeholder (launch-week capture). */
      placeholder: "Ask Pancake anything…",
      /** Shown instead of `placeholder` when the chat column is under 300px. */
      placeholderShort: "Ask Pancake…",
      /** The Play card: plays/play-draft-panel.tsx + play-draft.ts SLOT_LABEL. Its one button
       *  creates the Play and starts its first search ("Create only" is gone). Who and How only. */
      play: {
        kicker: "New play",
        draft: "Draft",
        created: "Created",
        who: "Who",
        how: "How we find them",
        /** The Who value: the leads' job titles, two then "+N more" (SIGNAL_PREVIEW_LIMIT grammar). */
        more: (n: number) => `+${n} more`,
        create: "Create play and run search",
        ready: "Your play is ready. Its first search is running.",
      },
      stackSuffix: ", named in job posts",
    },
    leads: {
      title: "Leads",
      sub: "The people this Play found and qualified.",
      approve: "Approve",
      add: "Start contacting",
    },
    drawer: {
      /** The caption of the "why this lead fits" box. */
      signal: "Signal",
    },
    campaign: {
      title: "Sequence",
      status: "Active",
      sub: "Pancake runs this Play’s outreach, tuned for you.",
      upNext: "Up next · First message",
      /** campaigns/copy.ts sheet.writing → journey.draftNote, as a before / after pair. */
      writing: "Writing from their activity…",
      draft: "Drafted — sends when the sequence reaches this step.",
      /** sheet.writtenFrom(n): engagement leads (n = the sightings on the lead's timeline). */
      writtenFrom: (n: number) => `Written from ${n} signal${n === 1 ? "" : "s"} + your Brain voice.`,
      /** sheet.writtenInVoice: hiring / stack leads have no sightings (finalize-run: "No sightings"). */
      writtenInVoice: "Written in your Brain voice.",
    },
    slack: {
      channels: "Channels",
      channelList: ["general", "new-leads", "sales"],
      channel: "new-leads",
      bot: "Pancake",
      app: "APP",
      time: "8:30 AM",
      intro: "Hey 👋! Here are the fresh leads of the day. Enjoy!",
      leadIntro: "New lead from Pancake",
      approve: "Approve",
      reject: "Reject",
      approved: "Approved",
      open: "Open in Pancake",
      composer: "Message #new-leads",
    },
  },
} as const;

/* ─── VxSignals ─────────────────────────────────────────────────────────────── */

const list = (xs: string[]) =>
  xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

export const VX_SIGNALS = {
  eyebrow: "Signals",
  watching: "Watching",
  more: (n: number) => `+${n} more`,
  lede: (v: VerticalConfig) => `Pancake watches six buying signals. These four matter most to ${v.name.short}.`,
  /** The 2 kinds NOT on the cards ("can also watch": nothing is watched until set up), then the
   *  opt-in fact, on every page (signal-settings.ts optInSignalKinds = hiring, stack: off by
   *  default). "Both" when the first sentence just named exactly those two (no back-to-back
   *  "Hiring and Stack … Hiring and Stack"). */
  foot: (v: VerticalConfig) => {
    const shown = v.signals.cards.map((c) => c.kind);
    const all = SIGNAL_GROUPS.flatMap((g) => g.kinds);
    const missingKinds = all.filter((k) => !shown.includes(k));
    const missing = missingKinds.map((k) => SIGNAL_LABEL[k]);
    const sameTwo = missingKinds.length === SIGNAL_OPT_IN.length && SIGNAL_OPT_IN.every((k) => missingKinds.includes(k));
    const optIn = sameTwo ? "Both" : list(SIGNAL_OPT_IN.map((k) => SIGNAL_LABEL[k]));
    return `Pancake can also watch the ${list(missing)} signals. ${optIn} start switched off. One click turns each on.`;
  },
};

/* ─── VxControl (entirely fixed; names come from prompt 0 lead 0 + workspace) ─── */

export const VX_CONTROL = {
  eyebrow: "Control",
  h2: "You choose who hears from you.",
  lede: "Pancake contacts only the leads you approve and add to a sequence. Nothing goes out for 10 minutes, so you can undo.",
  facts: [
    { title: "Under your name", body: "Every message goes out as you, in your voice." },
    { title: "No pitch up front", body: "The first touch never sells." },
    { title: "Weekdays, business hours", body: "Pancake sends Monday to Friday, 9\u00a0AM to 6\u00a0PM, in your time zone." },
  ],
  dialog: {
    title: (lead: string) => `Start contacting ${lead}?`,
    rows: (sender: string) => [
      ["Sequence", "Active"],
      ["Sends as", `${sender} — your own account`],
      ["Messages", "3 personal messages, written from their activity in your Brain voice"],
      ["First action", "No earlier than 9:42\u00a0AM, inside the send window."],
      ["Send window", "Mon–Fri · 9\u00a0AM–\u20606\u00a0PM (ET)"],
      ["Objective", `Book a meeting — replies get\u00a0cal.example/${sender.split(" ")[0].toLowerCase()}`],
    ],
    cancel: "Cancel",
    confirm: "Start contacting",
  },
  toast: {
    title: (lead: string) => `${lead} is in the sequence`,
    body: "Nothing goes out before 9:42\u00a0AM. Undo any time until then.",
    undo: "Undo",
  },
  /** role="img" label for the dialog + toast mock (screen-reader text, one sentence each). */
  aria: (lead: string, sender: string) =>
    `Pancake’s confirmation before ${lead} joins the sequence: outreach sends as ${sender} from your own account, Monday to Friday, 9 AM to 6 PM. After you confirm, nothing goes out before 9:42 AM and you can undo until then.`,
};

/* ─── VxFaq ─────────────────────────────────────────────────────────────────── */

export const VX_FAQ = {
  eyebrow: "FAQ",
  h2: (v: VerticalConfig) => `Questions ${v.name.short} ask.`,
  /** Appended after the 3–4 vertical items, in this order (visible list only: the FAQPage
   *  JSON-LD carries the vertical items alone, so these 5 don't repeat on 40 URLs). */
  shared: [
    {
      q: "What does Pancake send?",
      a: "Up to three short messages under your name, after a light warm-up. No emails, no calls.",
    },
    {
      q: "What do I approve?",
      a: "Every lead. Pancake contacts only leads you approve and add to a sequence, and you get 10 minutes to undo.",
    },
    {
      q: "Can I read the messages before they send?",
      a: "Yes. Each lead gets personal messages in your voice. Read and edit any of them before it goes out, or let them send as written. A reply stops the sequence.",
    },
    {
      q: "How many leads will I get?",
      a: "As many as you want. Each Play search keeps up to 50 new leads, you run as many Plays as you need, and Pancake searches again every night.",
    },
    {
      q: "What does it cost?",
      a: `$99 a month per workspace, with unlimited seats. The ${TRIAL_LABEL} needs a card.`,
    },
  ],
};

/* ─── VxRelated + breadcrumb ────────────────────────────────────────────────── */

export const VX_RELATED = {
  /** The breadcrumb moved to the hero (2026-09-22): the section eyebrow is the hub's name. */
  eyebrow: "Industries",
  h2: "Pancake for teams like yours.",
  hubRow: { title: "All industries", line: "See every industry Pancake works for." },
};

/* ─── LpCta / LpPricing overrides (optional props, homepage defaults untouched) ─ */

export const VX_CTA_BODY: [string, string] = ["$99 a month per workspace.", "First leads arrive tomorrow morning."];

/** The /for pricing checklist: the same six lines on every /for page and the hub. The fifth line
 *  was the AI SEO article until 2026-09-30; it now matches the homepage's Plays line. */
export const VX_PRICING_CHECKLIST: readonly string[] = [
  "Warm leads every morning.",
  "Every lead comes with its reason.",
  "Outreach from your own account.",
  "You approve every lead first.",
  "As many Plays and leads as you want.",
  "Unlimited seats.",
];

/* ─── /for hub ──────────────────────────────────────────────────────────────── */

/** Hub lede = hub meta description (the vertical pages use description = hero lede too). */
const HUB_LEDE =
  "One page per industry, from agencies and consultants to software startups, each with the signals Pancake watches and the leads it finds.";

export const VX_HUB = {
  eyebrow: "Industries",
  h1: "Pick your industry.",
  lede: HUB_LEDE,
  draft: "Draft",
  soon: "More industries soon.",
  metaDescription: HUB_LEDE,
};

/* ─── titles / meta ─────────────────────────────────────────────────────────── */

export const VX_META = {
  title: (v: VerticalConfig) => (VX_TITLE_MODE === "brand" ? "Pancake" : v.meta.seoTitle),
  /** og:title + twitter:title = the H1's label line, in both modes (/agents precedent, ag-copy META). */
  ogTitle: (v: VerticalConfig) => VX_HERO.label(v),
  /** n = the number of listed pages (the hub passes approvedVerticals().length). */
  hubTitle: (n: number) => (VX_TITLE_MODE === "brand" ? "Pancake" : `Pancake by Industry: Find B2B Customers in ${n} Markets`),
  hubOgTitle: "Pancake for your industry",
  /** og:image:alt / twitter:image:alt: every /for URL shares /og-image.png, the homepage card. */
  ogImageAlt: "Pancake: You run your company. We bring you customers.",
};
