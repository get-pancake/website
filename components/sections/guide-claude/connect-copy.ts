import {
  GUIDE_PATH,
  HERO,
  MCP_URL,
  SETUP_LINE,
  STEP_ASK,
  STEP_CONNECT,
  type GuidePrompt,
} from "@/components/sections/guide-claude/guide-copy";
import { OG_IMAGE_ALT } from "@/lib/social-meta";

/**
 * The "Connect" pages: /chatgpt and /codex, one per AI client the site names besides Claude
 * (founder 2026-10-17: a Features column in the footer "like Gojiberry's", whose connect pages
 * are one per assistant). /claude stays the guide for Claude and Claude Code.
 *
 * Founder, same day, on these pages: "les pages doivent être simples et expliquer les guidelines
 * clairement et efficacement". So a connect page is a how-to and nothing else: one line on what
 * you get, four numbered steps, five prompts to start with, a "Good to know" list, the other
 * clients. No marketing sections (no "What Pancake does", control cards, FAQ or CTA card).
 *
 * The steps are the product's own (checked 2026-10-17):
 *   - ChatGPT: the guide's ChatGPT tab (STEP_CONNECT.chatgpt: OpenAI's custom MCP server flow,
 *     founder-confirmed 2026-10-13). The app shows no ChatGPT route of its own, and the OpenAI
 *     directory listing was still a draft (pancake-cmo docs/integrations/
 *     pancake-marketplace-submissions.md).
 *   - Codex: the app's terminal route (Settings › Claude & Codex, "Prefer the terminal?":
 *     RECOMMENDED_MCP_CLIENTS in apps/frontend/src/features/settings/mcp-install-data.ts), plus the
 *     sign-in from get-pancake/agent-plugins codex/README.md (`codex mcp login pancake`, Codex CLI
 *     0.148 or newer). The plugin carries the four skills, so there is no skills step. The app's
 *     paste-one-line route (install.md) is the "no terminal" line under Good to know.
 *   - "shows the cost of a search before it runs": the lead-finding tools' own instruction; "only
 *     when you ask": the enroll tool's ("call it only after the member explicitly asks").
 */

export type ConnectClientId = "chatgpt" | "codex";

export const CONNECT_PATHS: Record<ConnectClientId, string> = {
  chatgpt: "/chatgpt",
  codex: "/codex",
};

/** Inline copy: plain text, a <strong> (a button or menu name) or a <code> (what you type). */
export type Inline = string | { b: string } | { code: string };

export type ConnectStep = {
  title: string;
  body: Inline[];
  /** A copy block under the body: a URL, a command or a prompt. */
  block?: { id: string; text: string; code?: boolean };
  /** One line under the block. */
  after?: Inline[];
  /** Step 01 carries the Start free pill. */
  startFree?: boolean;
};

export type ConnectKnow = { text: Inline[]; block?: { id: string; text: string } };

export type ConnectClient = {
  id: ConnectClientId;
  path: string;
  name: string;
  meta: { title: string; description: string; ogTitle: string; crumbPage: string };
  h1: string;
  lede: string;
  steps: ConnectStep[];
  know: ConnectKnow[];
};

/* ─── shared ────────────────────────────────────────────────────────────────── */

const ACCOUNT_STEP: ConnectStep = {
  title: "Create your Pancake account",
  body: ["Click ", { b: "Start free" }, " and add your website. Pancake builds your Brain in a few minutes."],
  startFree: true,
};

const checkStep = (name: string, body: Inline[]): ConnectStep => ({
  title: "Check the connection",
  body,
  block: { id: `${name.toLowerCase()}-check`, text: STEP_CONNECT.chatgpt.checkPrompt },
  after: [`If ${name} answers with your company, you're connected.`],
});

const sharedKnow = (name: string): ConnectKnow[] => [
  { text: ["No API key. You sign in to Pancake in your browser."] },
  { text: ["Same Brain, Plays and leads as the app."] },
  { text: [`${name} shows the cost of a search before it runs.`] },
  { text: ["Outreach starts only when you add a lead to a sequence."] },
];

const REMOVE_KNOW: ConnectKnow = {
  text: ["Remove access anytime in Pancake, under ", { b: "Settings → Claude & Codex" }, "."],
};

/** Five prompts from the guide, in its order: Brain, first Play, new leads, a message, a sequence. */
const PROMPT_IDS = ["prompt-brain", "prompt-first-play", "prompt-morning", "prompt-message", "prompt-campaign"];

export function connectPrompts(name: string): GuidePrompt[] {
  const all: GuidePrompt[] = STEP_ASK.groups.flatMap((g) => [...g.prompts]);
  return PROMPT_IDS.map((id) => all.find((p) => p.id === id)!).map((p) =>
    p.id === "prompt-campaign"
      ? {
          id: p.id,
          text: p.text,
          note: `This starts real outreach from your own account. Pancake tells ${name} to do it only when you ask.`,
        }
      : { id: p.id, text: p.text },
  );
}

export const CONNECT_SHARED = {
  /** Hero line under the lede: the guide's. */
  setup: HERO.setup,
  startFree: HERO.primary,
  steps: { eyebrow: "Setup", h2: "Four steps" },
  prompts: { eyebrow: "Prompts", h2: "Then ask", intro: "Copy one, replace what's in brackets, send." },
  know: { eyebrow: "Details", h2: "Good to know" },
  /** The closing line: every other way in. */
  others: { lead: "Using another AI?", other: { label: "Other agents", href: `${GUIDE_PATH}#setup` } },
  crumbHome: "Pancake",
  ogImageAlt: OG_IMAGE_ALT,
} as const;

/* ─── the two pages ─────────────────────────────────────────────────────────── */

export const CONNECT_CLIENTS: Record<ConnectClientId, ConnectClient> = {
  chatgpt: {
    id: "chatgpt",
    path: CONNECT_PATHS.chatgpt,
    name: "ChatGPT",
    meta: {
      title: "Connect Pancake to ChatGPT (MCP): four steps, no API key",
      description:
        "Add Pancake to ChatGPT as a custom MCP server and sign in in your browser. Then ask for leads, build Plays and edit messages from your chat.",
      ogTitle: "Connect Pancake to ChatGPT",
      crumbPage: "Connect Pancake to ChatGPT",
    },
    h1: "Connect Pancake to ChatGPT",
    lede: "Ask ChatGPT for leads, build Plays and edit messages, on the same workspace as the app.",
    steps: [
      ACCOUNT_STEP,
      {
        title: "Add Pancake to ChatGPT",
        body: [
          "On chatgpt.com, open ",
          { b: "Plugins" },
          ", click + and pick ",
          { b: "Add custom MCP server" },
          ". Name it ",
          { code: "Pancake" },
          " and paste this URL:",
        ],
        block: { id: "chatgpt-url", text: MCP_URL },
      },
      {
        title: "Sign in",
        body: [
          "Choose ",
          { b: "OAuth" },
          ", accept the warning and click ",
          { b: "Create as a plugin" },
          ". Sign in to Pancake, pick your workspace and approve.",
        ],
      },
      checkStep("ChatGPT", ["Install the plugin. In a new chat, type ", { code: "@Pancake" }, " and ask:"]),
    ],
    know: [
      ...sharedKnow("ChatGPT"),
      { text: ["No custom server option? It depends on your ChatGPT plan and workspace. Use Claude or Codex."] },
      REMOVE_KNOW,
    ],
  },
  codex: {
    id: "codex",
    path: CONNECT_PATHS.codex,
    name: "Codex",
    meta: {
      title: "Connect Pancake to Codex (MCP): four steps, no API key",
      description:
        "Install the Pancake plugin for Codex and sign in in your browser. Then ask for leads, build Plays and edit messages from Codex.",
      ogTitle: "Connect Pancake to Codex",
      crumbPage: "Connect Pancake to Codex",
    },
    h1: "Connect Pancake to Codex",
    lede: "Ask Codex for leads, build Plays and edit messages, on the same workspace as the app.",
    steps: [
      ACCOUNT_STEP,
      {
        title: "Install the Pancake plugin",
        body: ["In your terminal, run:"],
        block: {
          id: "codex-plugin",
          text: "codex plugin marketplace add get-pancake/agent-plugins\ncodex plugin add pancake@pancake",
          code: true,
        },
        after: ["It adds the Pancake server and its four skills."],
      },
      {
        title: "Sign in",
        body: ["Run:"],
        block: { id: "codex-login", text: "codex mcp login pancake", code: true },
        after: ["Your browser opens. Sign in to Pancake, pick your workspace and approve."],
      },
      checkStep("Codex", ["Start Codex and ask:"]),
    ],
    know: [
      { text: ["Needs Codex CLI 0.148 or newer."] },
      ...sharedKnow("Codex"),
      REMOVE_KNOW,
      { text: ["No terminal? Paste this line into Codex instead:"], block: { id: "codex-line", text: SETUP_LINE } },
    ],
  },
};

/** The other clients' links, Claude first: "Using another AI? Claude · Codex · Other agents". */
export function connectOthers(id: ConnectClientId): { label: string; href: string }[] {
  const rest = (Object.keys(CONNECT_PATHS) as ConnectClientId[])
    .filter((k) => k !== id)
    .map((k) => ({ label: CONNECT_CLIENTS[k].name, href: CONNECT_PATHS[k] }));
  return [{ label: "Claude", href: GUIDE_PATH }, ...rest, CONNECT_SHARED.others.other];
}
