import { pricingV2 } from "@/lib/copy";
import { TRIAL_DAYS, TRIAL_LABEL } from "@/lib/trial";

/**
 * /guides/claude — the page the ManyChat DMs send to people who comment
 * PANCAKE under an Instagram or Facebook post or ad (brief by Simon, Sonho,
 * 2026-10-06: raw/pancake-manychat-guide-claude-build-brief-2026-10-06.md).
 * The brief's copy is final and used word for word, with three house-rule
 * edits:
 *   - the trial is TRIAL_DAYS long (lib/trial.ts: 3 days, card required);
 *     the brief said 7;
 *   - "20%" without the French space before the sign;
 *   - the competitor prompt says "profile URL", never the platform's name
 *     (compliance rule, website PR #315);
 *   - Control and FAQ lines fact-checked against the app (see CONTROL), and
 *     the FAQ's cost answer gives the price.
 * 2026-10-07 (site audit 1.5, 5, 6.5, 7.5, 7.7, 8.5): "the people who fit", not "ready to
 * buy"; "sequence", never "campaign"; "Every draft." (not "Every message.", which reads as
 * approving every message); eight ways a Play finds leads, the public/llms.txt list (it said
 * six); the first search runs right away (not "first leads tomorrow morning"); the "Other
 * agents" line names only clients with browser sign-in and says Cursor can't connect yet; a
 * descriptive title and an og:title of its own. The credit lines wait on the founder (D6).
 * The agent version of this guide is public/guides/claude.md (same edits);
 * the page embeds it at build time so "Copy as Markdown" never awaits the
 * network (the Instagram in-app browser blocks clipboard writes after an
 * await).
 */

export const GUIDE_PATH = "/guides/claude";
export const GUIDE_MD_PATH = "/guides/claude.md";
export const PROMO_CODE = "PANCAKE20";

export const GUIDE_META = {
  /** <title>: the three clients and the protocol people search for (audit 7.7). */
  title: "Use Pancake in Claude, Claude Code or Codex (MCP)",
  description:
    "Connect Pancake to Claude, Claude Code or Codex in five minutes. Ask for warm leads, build Plays and edit any message from one chat. No API key.",
  /** og:title / twitter:title (audit 8.5): og:site_name already says Pancake. */
  ogTitle: "Use Pancake in Claude",
  /** The card is the homepage's (brief §2), so the alt is the text in that image. */
  ogImageAlt: "You run your company. We bring you customers.",
  /** BreadcrumbList: Home → this guide (there is no /guides index page). */
  crumbHome: "Pancake",
  crumbPage: "Use Pancake in Claude",
} as const;

export const PROMO_BAR = {
  long: `20% off Pancake for a year with code ${PROMO_CODE}`,
  short: `20% off with code ${PROMO_CODE}`,
  copy: "Copy code",
} as const;

export const HERO = {
  title: "Find customers from your Claude chat",
  lede: "Connect Pancake to Claude once. Then ask for warm leads, build Plays and edit your outreach in plain English, on the same Brain and the same leads as the app.",
  setup: "Setup takes five minutes and needs no API key.",
  primary: "Start free",
  copySetup: "Copy setup for your AI",
} as const;

export const COUPON = {
  big: "20% off",
  sub: "for a whole year",
  line: "Your code for Pancake. Enter it when you add your card.",
  copy: "Copy code",
  fine: `Your ${TRIAL_LABEL} comes first. The discount runs for 12 months after it.`,
} as const;

export const WHAT = {
  eyebrow: "What Pancake does",
  h2: "Pancake finds the people who fit",
  paragraphs: [
    "Pancake reads your website and builds your GTM Brain: who buys from you, what to say to them, where to find them.",
    "Plays use that Brain. You tell Pancake who you want to reach, it builds the search with you, and you run it. Every night Pancake searches again, so new leads wait for you each morning. Each one comes with one line on why it fits.",
    "You approve every lead before anyone hears from you. Pancake writes a personal message from that reason, in your voice, and sends it from your own account. A reply stops the sequence.",
  ],
  /** The public/llms.txt list, in the same count (the site said "six" in places, llms.txt eight). */
  cardTitle: "Eight ways a Play finds leads",
  ways: [
    "People who engage with posts by a competitor, an expert or your brand",
    "Everyone who reacted to one specific post",
    "People who engage with topics you choose",
    "Companies using a given technology",
    "Companies hiring for a given role",
    "Companies that just raised money",
    "Companies that look like your best customers",
    "A direct match on role, industry, company size and location",
  ],
} as const;

export const WHY = {
  eyebrow: "Why Claude",
  h2: "Brief Claude like a colleague",
  paragraphs: [
    "Type what you want in plain English. Claude reads your Pancake workspace before it answers and asks before it changes anything.",
    "Before a search spends credits, Claude shows you the cost and waits for your yes.",
  ],
} as const;

export const SETUP = {
  eyebrow: "Setup",
  h2: "Set it up",
  aiCard: {
    title: "Let your AI do the setup",
    body: "Copy this page as Markdown and paste it into Claude Code, Codex or Claude. Your AI connects Pancake, checks your Brain with you and builds your first Play.",
    copy: "Copy as Markdown",
    view: "View the .md",
  },
  byHand: "Or do it by hand",
} as const;

/** "Copied" states (brief §1): 1.5 s on code/prompt blocks, 2 s on the Markdown buttons. */
export const COPIED = {
  label: "Copied",
  ms: 1500,
  mdLabel: "Copied. Paste it in your AI",
  mdMs: 2000,
} as const;

export const STEP_ACCOUNT = {
  num: "01",
  title: "Create your Pancake account",
  items: [
    { before: "Go to pancake.ai and click ", strong: "Start free", after: `. You get a ${TRIAL_DAYS}-day free trial.` },
    { before: "Add your website." },
    { before: "Pancake researches it and builds your Brain in a few minutes." },
  ],
  note: "Read the Brain once and fix what is wrong. Every Play starts from it.",
} as const;

export const MCP_URL = "https://app.pancake.ai/api/mcp";
const SETUP_LINE = "Set up Pancake by reading https://pancake.ai/install.md and following its instructions";

export type ClientTabId = "claude" | "claude-code" | "codex" | "other";

export const STEP_CONNECT = {
  num: "02",
  title: "Connect your AI",
  tabsLabel: "Your AI client",
  tabs: [
    { id: "claude", label: "Claude", logo: "claude" },
    { id: "claude-code", label: "Claude Code", logo: "claude" },
    { id: "codex", label: "Codex", logo: "openai" },
    { id: "other", label: "Other agents", logo: "mcp" },
  ] as const satisfies readonly { id: ClientTabId; label: string; logo: "claude" | "openai" | "mcp" }[],
  claude: {
    caption: "claude.ai, desktop app",
    steps: {
      openSettings: { before: "In Claude, open ", strong: "Settings → Connectors", mid: " and click ", strong2: "Add custom connector", after: "." },
      name: { before: "Name it ", code: "Pancake", after: " and paste this URL:" },
      add: { before: "Click ", strong: "Add", after: ". A Pancake window opens: pick your workspace and approve." },
      check: "Open a new chat and check the connection:",
    },
    url: MCP_URL,
    checkPrompt: "What's in my Pancake Brain? Answer in five lines.",
    after:
      "If Claude answers with your company, you're connected. Add the connector on the web or desktop app first; you can then use it from Claude on your phone.",
  },
  claudeCode: {
    intro: "Paste this line into Claude Code:",
    line: SETUP_LINE,
    manualIntro: "Claude Code adds the server and asks you to sign in. To do it by hand:",
    manual: `claude mcp add --transport http --scope user pancake ${MCP_URL}`,
    after: { before: "Then type ", code: "/mcp", after: ", select Pancake and sign in." },
  },
  codex: {
    intro: "Paste this line into Codex:",
    line: SETUP_LINE,
    manualIntro: "To do it by hand:",
    manual: `codex mcp add pancake --url ${MCP_URL}\ncodex mcp login pancake`,
  },
  other: {
    // 2026-10-07 (audit 7.5): only clients with browser sign-in. The plugin repo marks Cursor
    // "expected to FAIL without CIMD" and Gemini CLI as needing a static client id.
    intro:
      "VS Code, GitHub Copilot CLI, Factory Droid, goose and other clients with browser sign-in: paste the same line. Your agent checks what your client supports and sets it up. Cursor can't connect yet.",
    line: SETUP_LINE,
  },
  signIn: "Sign-in happens in your browser. Pancake never asks you for an API key, a token or a password.",
} as const;

export const STEP_SKILLS = {
  num: "03",
  title: "Install the skills (Claude Code, Codex, other agents)",
  intro: "Skills teach your agent how to work with Pancake. Paste this line:",
  line: "Install the Pancake skills by reading https://raw.githubusercontent.com/get-pancake/agent-plugins/main/skills.md and following its instructions.",
  tableIntro: "You get four skills:",
  head: ["Skill", "What it does"] as const,
  rows: [
    ["pancake", "How to work well with the tools"],
    ["pancake-daily-leads", "Find N leads today under a credit ceiling"],
    ["pancake-review-leads", "Judge the leads since your last check"],
    ["pancake-refresh-icp", "Resolve Brain proposals, then show the diff"],
  ] as const,
  after: "The Claude Code and Codex plugins already include them.",
} as const;

export type GuidePrompt = { id: string; text: string; lead?: string; note?: string };

export const STEP_ASK = {
  num: "04",
  title: "Ask",
  intro: "Copy a prompt, replace what's in brackets, send. Start with the first one.",
  groups: [
    {
      title: "Check your Brain",
      prompts: [
        { id: "prompt-brain", text: "Read my Pancake Brain. Who do you think my best customers are, and what would you change?" },
      ],
    },
    {
      title: "Build your first Play",
      prompts: [
        {
          id: "prompt-first-play",
          text: "I sell [what you sell] to [who you sell to]. Build me a Pancake Play that finds [the people you want] who [what they are doing right now]. Show me the plan and what it will cost before you run it.",
        },
        {
          id: "prompt-example",
          lead: "Example from a video studio:",
          text: "We make SaaS launch videos. Find US product marketers posting about an upcoming release.",
        },
        {
          id: "prompt-track",
          text: "Track [profile URL of a competitor or an expert]. I want the people who engage with their posts.",
        },
      ],
    },
    {
      title: "Every morning",
      prompts: [
        { id: "prompt-morning", text: "Show me the leads that came in since yesterday, best fit first, with the reason for each one." },
        { id: "prompt-daily", text: "Find me [10] new leads today. Stay under [500] credits and tell me what you spent." },
      ],
    },
    {
      title: "Your outreach",
      prompts: [
        { id: "prompt-message", text: "Show me the message Pancake wrote for [name]. Make it shorter and open on their post." },
        {
          id: "prompt-campaign",
          text: "Add [name] to my sequence.",
          note: "Adding a lead to a sequence starts the outreach from your own account. Claude asks you to confirm first.",
        },
      ],
    },
    {
      title: "Teach Pancake",
      prompts: [
        { id: "prompt-pass", text: "Pass on [name]: [why they are not a fit]." },
        { id: "prompt-brain-suggestions", text: "Pancake has suggestions for my Brain. Show me what would change, then apply the ones I accept." },
      ],
    },
  ] satisfies readonly { title: string; prompts: readonly GuidePrompt[] }[],
  outro: "When you pass on a lead and say why, Pancake proposes Brain changes. You accept them or ignore them.",
} as const;

export const CONTROL = {
  eyebrow: "Control",
  h2: "You stay in charge",
  cards: [
    { title: "Every lead.", body: "Nobody hears from you until you approve them." },
    { title: "Every draft.", body: "Read and edit any message before it goes out. It leaves from your own account, under your name." },
    // Fact-checked against pancake-cmo main (2026-10-06): per-AI credit ceilings exist but run in
    // shadow mode, and the per-client Pause switch hides behind the creditsUiEnabled flag (off),
    // so the brief's "own daily and monthly credit ceiling" and "Pause" lines are out; the
    // settings item is "Claude / Codex", not "MCP → Manage access". Restore them when they ship.
    { title: "Every credit.", body: "Claude shows the cost of a search before it starts." },
    { title: "Every connection.", body: "Remove an AI anytime in Pancake, under Settings\u00a0→ Claude\u00a0/\u00a0Codex." },
  ],
} as const;

export const FAQ = {
  eyebrow: "FAQ",
  h2: "Questions",
  items: [
    { q: "Do I need an API key?", a: "No. You sign in to Pancake in your browser and pick a workspace." },
    {
      q: "Is it the same data as the app?",
      a: "Yes. Same Brain, same Plays, same leads. A lead you approve in Claude shows as approved in the app, and the other way around.",
    },
    {
      q: "Can Claude send messages without me?",
      a: "No. Claude asks before it changes anything, and outreach starts only when you add a lead to a sequence.",
    },
    {
      q: "What does it cost?",
      a: `Pancake starts with a ${TRIAL_LABEL}, then costs $${pricingV2.monthlyDollars} a month per workspace (20% less for a year with code ${PROMO_CODE}). Lead searches use credits, and Claude tells you the cost of each search before it runs.`,
      /** Visible only, not in the FAQPage JSON-LD: the credits story waits on the founder (D6),
       *  and structured data is what assistants quote. */
      inJsonLd: false,
    },
    {
      q: "Where else do my leads show up?",
      a: "In the app, in Slack if you connect it, and in a morning email that sums up what is waiting.",
    },
  ],
} as const;

export const FINAL = {
  // a new Play's first search starts as soon as it exists (2026-10-07), then every night
  title: "Your first search runs right away",
  body: `Start your ${TRIAL_LABEL}, connect Claude, create one Play. New leads every morning.`,
  cta: "Start free",
  note: `Code ${PROMO_CODE} · 20% off for a year`,
} as const;

export const LOGO_SRC = {
  claude: "/integrations/claude.svg",
  openai: "/integrations/openai.svg",
} as const;
