// components/sections/verticals/vx-copy.ts — every FIXED string of the /for template.
// Rule: nothing in this file may name a vertical (lint VX_FIXED_LEAK in validate.ts).
// App-UI strings are verbatim from get-pancake/pancake-cmo @07513e8 (product-truth §3,
// campaigns/copy.ts, signal-copy.ts, leads-table.tsx, slack lead-finding-message.ts), except
// where the app names the outreach platform: /for pages never do (founder 2026-09-23, validate.ts
// PLATFORM), so those read "People signals", "Profile · View ↗", "Send an invite", "your own account".
// In the repo, import TRIAL_LABEL from "@/lib/trial" instead of the local constant below.

import { TRIAL_LABEL } from "@/lib/trial";
import type { SignalKind, VerticalConfig } from "@/lib/verticals/types";


/* ─── switches (one line each = one founder answer) ─────────────────────────── */

/** D1. "brand" = <title>Pancake</title> (the landings rule, as /agents and /demo).
 *  Founder answer 2026-09-22: descriptive titles win on the /for pages (the homepage stays "Pancake"). */
export const VX_TITLE_MODE = "descriptive" as "brand" | "descriptive"; // founder 2026-09-22: descriptive SEO titles on /for/*
/** D15. "truthful" = VX_PRICING_CHECKLIST on /for pages; "homepage" = LpPricing default. */
export const VX_PRICING_MODE: "truthful" | "homepage" = "truthful";
/** D3. true = one AI SEO line in the pricing checklist (the only mention on the page). */
export const VX_AI_SEO_MENTION = true;

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
/** signal-copy.ts SIGNAL_CARD_COPY[kind].empty — the Signals-page card before setup. */
export const SIGNAL_EMPTY: Record<SignalKind, string> = {
  keyword: "No keywords are in your brain yet.",
  competitor: "No competitors are in your brain yet.",
  influencer: "No influencers or experts are in your brain yet.",
  own_brand: "No company, team, or personal profiles are connected yet.",
  hiring: "No hiring roles were collected for this signal.",
  stack: "No technologies were collected for this signal.",
};
/** signal-settings.ts: defaultEnabledSignalKinds vs optInSignalKinds. */
export const SIGNAL_OPT_IN: SignalKind[] = ["hiring", "stack"];

/* ─── page chrome ───────────────────────────────────────────────────────────── */

export const VX_CTA_LABELS = { primary: "Start free", secondary: "Book a demo" } as const;
export const VX_NOTE = "Illustrative. Names and companies are fictional.";

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
    { key: "brief", num: "01", label: "Brief", title: "Say who you sell to.", body: "Pancake turns it into signals to watch. You approve them once." },
    { key: "leads", num: "02", label: "Leads", title: "Wake up to warm leads.", body: "New leads land by 8:30 AM, each with the signal behind it." },
    { key: "outreach", num: "03", label: "Outreach", title: "Reach out as yourself.", body: "Pancake visits, likes and invites from your own account, then writes." },
    { key: "slack", num: "04", label: "Slack", title: "Approve from Slack.", body: "New leads post to your channel. Approve or reject in one click." },
  ],
  controls: { pause: "Pause demo", play: "Play demo", replay: "Replay demo" },
  /** role="img" labels per pane; {prompt} = active prompt text, {lead} = lead 0 name. */
  paneAria: {
    brief: "Pancake’s Signals page and chat. The request “{prompt}” becomes proposed signal settings, approved. First leads arrive tomorrow morning.",
    leads: "Pancake’s Leads page: five qualified leads. {lead} is open with the reason the lead fits, approved and ready to add to the campaign.",
    outreach: "Pancake’s Campaign page: {lead}’s campaign journey. Profile visit and like done, invite now, first message drafted for after they accept.",
    slack: "A Slack channel where Pancake posts new leads with Approve and Reject buttons. {lead} is approved.",
  },
  app: {
    nav: ["Outbound", "AI SEO", "Brain"],
    cta: "Use in Claude / Codex",
    rail: ["Overview", "Leads", "Campaign"],
    railFoot: "Signals",
    signals: {
      title: "Signals",
      sub: "Choose the signals Pancake uses to find qualified leads.",
      setUp: "Set up",
      /** SIGNAL_PREVIEW_LIMIT grammar on the Signals-page cards. */
      more: (n: number) => `+${n} more`,
    },
    chat: {
      head: "Ask Pancake anything",
      /** The panel header's right-side action (the app shows ⌘K only on the launcher pill). */
      newChat: "New chat",
      placeholder: "Ask a follow-up or change your dashboard…",
      /** Shown instead of `placeholder` when the chat column is under 300px. */
      placeholderShort: "Ask a follow-up…",
      /** copilot/host/starters.ts PAGE_STARTERS.outboundSignals — the empty conversation's chips. */
      starters: [
        "Which signals should I turn on?",
        "How does post engagement find leads?",
        "What do the hiring and stack signals track?",
      ],
      /** Tool row of the live copilot transcript (observed 2026-09-22): label + status. */
      tool: "Checking signal settings",
      toolDone: "Done",
      proposalTitle: "Signal settings",
      /** The live proposal card's caps kicker, then its approved state. */
      proposed: "Recommended next move",
      approved: "Approved",
      /** The confirm of the app's review dialog: the demo folds Review → confirm into one click. */
      approve: "Approve change",
      saved: "Saved. First leads arrive tomorrow morning.",
      stackSuffix: ", named in job posts",
    },
    leads: {
      title: "Leads",
      sub: "People matched to your ideal customer profile, with the signal behind each match.",
      count: (n: number) => `${n} qualified lead${n === 1 ? "" : "s"} in this workspace`,
      approve: "Approve",
      add: "Add to campaign",
      bad: "Bad leads (1)",
    },
    drawer: {
      askAi: "Ask AI",
      stage: "qualified",
      confidence: (n: number) => `Confidence ${n}%`,
      /** The app's platform row reads "Profile" here (no platform name on /for, founder 2026-09-23). */
      props: { company: "Company", seniority: "Seniority", country: "Country", profile: "Profile" },
      country: "United States",
      profileLink: "View ↗",
      signal: "Signal",
      /** leads/lead-timeline.tsx: the sheet's TIMELINE section. */
      timeline: "Timeline",
      qualified: "Qualified as a lead",
      commented: "Commented on a post",
      reacted: "Reacted to a post",
      like: "Like",
      viewPost: "View post ↗",
      /** The cold-lead note (hiring / stack leads have no engagement sightings). */
      cold: (source: string) => `No engagement signals yet — this lead was sourced via ${source}.`,
    },
    campaign: {
      title: "Campaign",
      status: "Active",
      sub: "Pancake runs one warm outreach campaign, tuned for you.",
      /** campaigns/copy.ts journey.panelTitle · journey.stepOf(3, 6). */
      journey: "Campaign journey · Step 3 of 6",
      /** campaigns/copy.ts leads.status.invited (the invite step is current → "invited", blue). */
      leadStatus: "Invited",
      /** sequence-template.ts v2: visit → like → note-less invite → message 1 six hours after they
       *  accept → two follow-ups 72h apart (an unaccepted invite ends the sequence after 7 days). */
      steps: [
        { label: "Visit their profile", sub: "", state: "Done" },
        { label: "Like a recent post", sub: "", state: "Done" },
        { label: "Send an invite", sub: "No note — just the invite, so it never reads as a pitch.", state: "Now" },
        { label: "First message (after they accept)", sub: "6 hours after they accept", state: "Upcoming" },
        { label: "Follow-up message", sub: "after 3 days", state: "Upcoming" },
        { label: "Follow-up message", sub: "after 3 days", state: "Upcoming" },
      ],
      /** Phones: the three message steps folded into one row. */
      fold: "3 follow-up messages",
      upNext: "Up next · First message (after they accept)",
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
  lede: "Pancake contacts only the leads you approve and add to your campaign. Nothing goes out for 10 minutes, so you can undo.",
  facts: [
    { title: "Your own account", body: "Outreach goes out under your name, at a human pace." },
    { title: "No pitch in the invite", body: "Invites go out with no note." },
    { title: "Weekdays, business hours", body: "Pancake sends Monday to Friday, 9\u00a0AM to 6\u00a0PM, in your time zone." },
  ],
  dialog: {
    title: (lead: string) => `Add ${lead} to your campaign?`,
    rows: (sender: string) => [
      ["Campaign", "Active"],
      ["Sends as", `${sender} — your own account`],
      ["Sequence", "Signal outreach"],
      ["Messages", "3 personal messages, written from their activity in your Brain voice"],
      ["First action", "No earlier than 9:42\u00a0AM, inside the send window."],
      ["Send window", "Mon–Fri · 9\u00a0AM–\u20606\u00a0PM (ET)"],
      ["Objective", `Book a meeting — replies get\u00a0cal.example/${sender.split(" ")[0].toLowerCase()}`],
    ],
    cancel: "Cancel",
    confirm: "Add to campaign",
  },
  toast: {
    title: (lead: string) => `${lead} added to your campaign`,
    body: "Nothing goes out before 9:42\u00a0AM. Undo any time until then.",
    undo: "Undo",
  },
  /** role="img" label for the dialog + toast mock (screen-reader text, one sentence each). */
  aria: (lead: string, sender: string) =>
    `Pancake’s confirmation before ${lead} joins your campaign: outreach sends as ${sender} from your own account, Monday to Friday, 9 AM to 6 PM. After you confirm, nothing goes out before 9:42 AM and you can undo until then.`,
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
      a: "From your own account: a profile visit, a like on a recent post, an invite with no note, then up to three messages. No emails, no calls.",
    },
    {
      q: "What do I approve?",
      a: "Every lead. Pancake contacts only leads you approve and add to your campaign, and you get 10 minutes to undo.",
    },
    {
      q: "Can I read the messages before they send?",
      a: "You can read each one in the lead’s campaign journey. Messages send on their own when their step comes. You can’t edit or approve them one by one. To stop outreach, remove the lead or pause the campaign.",
    },
    {
      q: "How many leads will I get?",
      a: "Pancake aims for 5 to 15 new leads a day, delivered each morning. The count depends on how many people match your signals.",
    },
    {
      q: "What does it cost?",
      a: `$99 a month, flat, with unlimited seats. The ${TRIAL_LABEL} needs a card.`,
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

export const VX_CTA_BODY: [string, string] = ["$99 a month, flat.", "First leads arrive tomorrow morning."];

/** Pages whose readers SELL articles (the config caveat: never sell Pancake's daily article
 *  to them) swap the AI SEO line for the Claude Code line. A Set on purpose: slugs are routing
 *  keys, not visible copy, and a Set serializes to {} so the FIXED_LEAK copy lint
 *  (validate.ts) keeps scanning only real strings. */
export const VX_NO_ARTICLE_SLUGS: ReadonlySet<string> = new Set(["seo-agencies"]);

/** The /for pricing checklist; `slug` = the page (the hub passes none). */
export const VX_PRICING_CHECKLIST = (slug?: string): string[] => [
  "5 to 15 new leads a day.",
  "Every lead comes with its reason.",
  "Outreach from your own account.",
  "You approve every lead first.",
  VX_AI_SEO_MENTION && !(slug && VX_NO_ARTICLE_SLUGS.has(slug))
    ? "One article a day for your site."
    : "Works with Claude Code and Codex.",
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
