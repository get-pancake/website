// components/sections/verticals/vx-copy.ts — every FIXED string of the /for template.
// Rule: nothing in this file may name a vertical (lint VX_FIXED_LEAK in validate.ts).
// App-UI strings are verbatim from get-pancake/pancake-cmo @07513e8 (product-truth §3,
// campaigns/copy.ts, signal-copy.ts, leads-table.tsx, slack lead-finding-message.ts).
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
/** App order (SIGNAL_GROUPS): LinkedIn signals, then Company signals. */
export const SIGNAL_GROUPS: { label: string; kinds: SignalKind[] }[] = [
  { label: "LinkedIn signals", kinds: ["keyword", "competitor", "influencer", "own_brand"] },
  { label: "Company signals", kinds: ["hiring", "stack"] },
];
/** signal-copy.ts SIGNAL_CARD_COPY[kind].empty — the Signals-page card before setup. */
export const SIGNAL_EMPTY: Record<SignalKind, string> = {
  keyword: "No keywords are in your brain yet.",
  competitor: "No competitors are in your brain yet.",
  influencer: "No influencers or experts are in your brain yet.",
  own_brand: "No company, team, or personal LinkedIn profiles are connected yet.",
  hiring: "No hiring roles were collected for this signal.",
  stack: "No technologies were collected for this signal.",
};
/** signal-settings.ts: defaultEnabledSignalKinds vs optInSignalKinds. */
export const SIGNAL_OPT_IN: SignalKind[] = ["hiring", "stack"];

/* ─── page chrome ───────────────────────────────────────────────────────────── */

export const VX_CTA_LABELS = { primary: "Start free", secondary: "Book a demo" } as const;
export const VX_NOTE = "Illustrative. Names and companies are fictional.";

/* ─── VxDemo ────────────────────────────────────────────────────────────────── */

export const VX_DEMO = {
  eyebrow: "How it works",
  lede:
    "Pick an example. Pancake turns it into signals, finds the people and writes the outreach. You approve each lead.",
  promptsLabel: "Try an example",
  promptsAria: "Example prompts",
  tablistAria: "Pancake, step by step",
  tabs: [
    { key: "brief", num: "01", label: "Brief", title: "Say who you sell to.", body: "Pancake turns it into signals to watch. You approve them once." },
    { key: "leads", num: "02", label: "Leads", title: "Wake up to warm leads.", body: "New leads land by 8:30 AM, each with the signal behind it." },
    { key: "outreach", num: "03", label: "Outreach", title: "Reach out as yourself.", body: "Pancake visits, likes and invites from your LinkedIn, then writes." },
    { key: "slack", num: "04", label: "Slack", title: "Approve from Slack.", body: "New leads post to your channel. Approve or reject in one click." },
  ],
  controls: { pause: "Pause demo", play: "Play demo", replay: "Replay demo" },
  /** role="img" labels per pane; {prompt} = active prompt text, {lead} = lead 0 name. */
  paneAria: {
    brief: "Pancake's Signals page and chat. The request “{prompt}” becomes proposed signal settings, approved. First leads arrive tomorrow morning.",
    leads: "Pancake's Leads page: five qualified leads. {lead} is open with the reason the lead fits, approved and ready to add to the campaign.",
    outreach: "Pancake's Campaign page: {lead}'s LinkedIn journey. Profile visit and like done, connection request now, first message drafted.",
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
      kbd: "⌘K",
      placeholder: "Ask a follow-up or change your dashboard…",
      /** Tool row of the live copilot transcript (observed 2026-09-22): label + status. */
      tool: "Checking signal settings",
      toolDone: "Done",
      proposalTitle: "Signal settings",
      proposed: "Proposed",
      approved: "Approved",
      approve: "Approve",
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
      props: { company: "Company", seniority: "Seniority", country: "Country", linkedin: "LinkedIn" },
      country: "United States",
      profile: "Profile ↗",
      signal: "Signal",
      why: "Why this lead fits",
    },
    campaign: {
      title: "Campaign",
      status: "Active",
      sub: "Pancake runs one warm outreach campaign, tuned for you.",
      journey: "Campaign journey · Step 3 of 6",
      leadStatus: "Invited",
      steps: [
        { label: "Visit their profile", sub: "", state: "Done" },
        { label: "Like a recent post", sub: "", state: "Done" },
        { label: "Send a connection request", sub: "No note — just the request, so it never reads as a pitch.", state: "Now" },
        { label: "Follow-up message", sub: "after 6 hours", state: "Upcoming" },
        { label: "Follow-up message", sub: "after 3 days", state: "Upcoming" },
        { label: "Follow-up message", sub: "after 3 days", state: "Upcoming" },
      ],
      upNext: "Up next · Follow-up message",
      draft: "Drafted — sends when the sequence reaches this step.",
      written: "Written from 2 signals + your Brain voice.",
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
  /** Derived from the 2 kinds NOT on the cards + the opt-in kinds that ARE on the cards. */
  foot: (v: VerticalConfig) => {
    const shown = v.signals.cards.map((c) => c.kind);
    const all = SIGNAL_GROUPS.flatMap((g) => g.kinds);
    const missing = all.filter((k) => !shown.includes(k)).map((k) => SIGNAL_LABEL[k]);
    const optIn = shown.filter((k) => SIGNAL_OPT_IN.includes(k)).map((k) => SIGNAL_LABEL[k]);
    const a = `Pancake also watches ${list(missing)}.`;
    const b = optIn.length ? ` ${list(optIn)} ${optIn.length > 1 ? "take" : "takes"} one click to switch on.` : "";
    return a + b;
  },
};

/* ─── VxControl (entirely fixed; names come from prompt 0 lead 0 + workspace) ─── */

export const VX_CONTROL = {
  eyebrow: "Control",
  h2: "You choose who hears from you.",
  lede: "Pancake contacts only the leads you approve and add to your campaign. Nothing goes out for 10 minutes, so you can undo.",
  facts: [
    { title: "Your own LinkedIn", body: "Outreach goes out from your account, paced by LinkedIn's own limits." },
    { title: "No pitch in the invite", body: "Connection requests go out with no note." },
    { title: "Weekdays, business hours", body: "Pancake sends Monday to Friday, 9 AM to 6 PM, in your time zone." },
  ],
  dialog: {
    title: (lead: string) => `Add ${lead} to your campaign?`,
    rows: (sender: string) => [
      ["Campaign", "Active"],
      ["Sends as", `${sender} — your own LinkedIn account`],
      ["Sequence", "LinkedIn signal outreach"],
      ["Messages", "3 personal messages, written from their activity in your Brain voice"],
      ["First action", "No earlier than 9:42 AM, inside the send window."],
      ["Send window", "Mon–Fri · 9 AM–6 PM (ET)"],
      ["Objective", `Book a meeting — replies get cal.example/${sender.split(" ")[0].toLowerCase()}`],
    ],
    cancel: "Cancel",
    confirm: "Add to campaign",
  },
  toast: {
    title: (lead: string) => `${lead} added to your campaign`,
    body: "Nothing goes out before 9:42 AM. Undo any time until then.",
    undo: "Undo",
  },
  /** role="img" label for the dialog + toast mock (screen-reader text, one sentence each). */
  aria: (lead: string, sender: string) =>
    `Pancake's confirmation before ${lead} joins your campaign: outreach sends as ${sender} from your own LinkedIn account, Monday to Friday, 9 AM to 6 PM. After you confirm, nothing goes out before 9:42 AM and you can undo until then.`,
};

/* ─── VxFaq ─────────────────────────────────────────────────────────────────── */

export const VX_FAQ = {
  eyebrow: "FAQ",
  h2: (v: VerticalConfig) => `Questions ${v.name.short} ask.`,
  /** Appended after the 3–4 vertical items, in this order. Same array → FAQPage JSON-LD. */
  shared: [
    {
      q: "What does Pancake send, and where?",
      a: "LinkedIn only, from your own account. A profile visit, a like, a connection request with no note, then up to three messages. No emails, no calls.",
    },
    {
      q: "What do I approve?",
      a: "Every lead. Pancake contacts only leads you approve and add to your campaign, and you get 10 minutes to undo.",
    },
    {
      q: "Can I read the messages before they send?",
      a: "You can read each one in the lead's campaign journey. Messages send on their own when their step comes. You can't edit or approve them one by one. To stop outreach, remove the lead or pause the campaign.",
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
  crumbs: { home: "Home", hub: "Industries" },
  crumbAria: "Breadcrumb",
  h2: "Pancake for teams like yours.",
  hubRow: { title: "All industries", line: "See every industry Pancake works for." },
};

/* ─── LpCta / LpPricing overrides (optional props, homepage defaults untouched) ─ */

export const VX_CTA_BODY: [string, string] = ["$99 a month, flat.", "First leads arrive tomorrow morning."];

export const VX_PRICING_CHECKLIST: string[] = [
  "5 to 15 new leads a day.",
  "Every lead comes with its reason.",
  "LinkedIn outreach from your account.",
  "You approve every lead first.",
  VX_AI_SEO_MENTION ? "One article a day for your site." : "Works with Claude Code and Codex.",
  "Unlimited seats.",
];

/* ─── /for hub ──────────────────────────────────────────────────────────────── */

export const VX_HUB = {
  eyebrow: "Industries",
  h1: "Pick your industry.",
  lede: "Each page shows the signals, example prompts and leads that fit one market.",
  draft: "Draft",
  soon: "More industries soon.",
  metaDescription:
    "Pancake finds the people your business sells to, from the signals they leave on LinkedIn and in job posts. Pick your industry.",
};

/* ─── titles / meta ─────────────────────────────────────────────────────────── */

export const VX_META = {
  title: (v: VerticalConfig) => (VX_TITLE_MODE === "brand" ? "Pancake" : v.meta.seoTitle),
  /** og:title + twitter:title ride the value prop in both modes (/agents precedent, ag-copy META). */
  ogTitle: (v: VerticalConfig) => `Pancake for ${v.name.plural}`,
  hubTitle: () => (VX_TITLE_MODE === "brand" ? "Pancake" : "Industries — Pancake"),
  hubOgTitle: "Pancake for your industry",
};
