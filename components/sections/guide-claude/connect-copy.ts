import {
  CONTROL,
  FAQ,
  FINAL,
  GUIDE_PATH,
  HERO,
  MCP_URL,
  SETUP_LINE,
  STEP_ASK,
  type ClientTabId,
  type GuideFaqItem,
  type GuideMore,
  type GuidePrompt,
} from "@/components/sections/guide-claude/guide-copy";
import { pricingV2 } from "@/lib/copy";
import { OG_IMAGE_ALT } from "@/lib/social-meta";
import { TRIAL_CREDITS_LABEL, TRIAL_LABEL } from "@/lib/trial";

/**
 * The "Connect" pages: /chatgpt and /codex, one per AI client the site names besides Claude
 * (founder 2026-10-17: a Features column in the footer "like Gojiberry's", whose connect pages
 * are one per assistant). /claude stays the guide for Claude and Claude Code. A connect page is
 * that guide narrowed to one client (ConnectPage, built from GuidePage's own sections): the
 * client's own steps, no tabs, and the prompts, control cards and FAQ in its name.
 *
 * Truth (checked 2026-10-17 against pancake-cmo and get-pancake/agent-plugins):
 *   - the steps are the guide's (STEP_CONNECT.chatgpt / .codex), unchanged;
 *   - "shows the cost of a search before it starts" is the lead-finding tools' own instruction
 *     ("Tell the user the cost before starting one"), the same for every client;
 *   - adding a lead to a sequence: the enroll tool says "call it only after the member
 *     explicitly asks". The client's own confirm dialog is not claimed: it depends on the
 *     client, so the line says what Pancake tells it;
 *   - Codex signs in on its own from Codex CLI 0.148 (agent-plugins codex/README.md);
 *   - ChatGPT's custom servers depend on the plan and workspace, as the guide says.
 */

export type ConnectClientId = Extract<ClientTabId, "chatgpt" | "codex">;

export const CONNECT_PATHS: Record<ConnectClientId, string> = {
  chatgpt: "/chatgpt",
  codex: "/codex",
};

type ConnectRow = { title: string; line: string; href: string };

export type ConnectClient = {
  id: ConnectClientId;
  path: string;
  /** The client's name, as its maker writes it. */
  name: string;
  meta: {
    /** <title>: the client, the protocol people search for, and the outcome. */
    title: string;
    description: string;
    ogTitle: string;
    /** BreadcrumbList: Home → this page (no /connect index page). */
    crumbPage: string;
  };
  hero: {
    title: string;
    lede: string;
    /** The second hero button copies the one thing step 02 needs. */
    copy: { label: string; text: string; blockId: string };
  };
  /** Step 02's title. */
  connectTitle: string;
  /** Step 03 installs the skills (agents with a skills folder: Codex, not ChatGPT). */
  skills: boolean;
  faq: GuideFaqItem[];
};

/* ─── shared pieces, in the client's name ──────────────────────────────────── */

/** The guide's prompts, with the add-to-sequence note in this client's name. */
export function connectAskGroups(name: string): { title: string; prompts: GuidePrompt[]; more?: GuideMore }[] {
  return STEP_ASK.groups.map((g) => ({
    ...g,
    prompts: g.prompts.map((p) =>
      p.id === "prompt-campaign"
        ? {
            ...p,
            note: `Adding a lead to a sequence starts the outreach from your own account. Pancake tells ${name} to do it only when you ask.`,
          }
        : p,
    ),
  }));
}

/** The guide's four control cards; the credit line names this client. */
export function connectControlCards(name: string): { title: string; body: string }[] {
  return CONTROL.cards.map((c) =>
    c.title === "Every credit." ? { ...c, body: `${name} shows the cost of a search before it starts.` } : c,
  );
}

/** The guide's FAQ answers that hold for any client, in this client's name. */
function sharedFaq(name: string): GuideFaqItem[] {
  return [
    FAQ.items[0], // "Do I need an API key?"
    {
      q: "Is it the same data as the app?",
      a: `Yes. Same Brain, same Plays, same leads. A lead you approve in ${name} shows as approved in the app, and the other way around.`,
    },
    {
      q: `Can ${name} send messages without me?`,
      a: `No. Outreach starts only when you add a lead to a sequence. Pancake tells ${name} to do that only when you ask.`,
    },
    {
      q: "What does it cost?",
      a: `Pancake starts with a ${TRIAL_LABEL} and ${TRIAL_CREDITS_LABEL}, then costs from $${pricingV2.monthlyDollars} a month per workspace. Lead searches use credits, and ${name} tells you the cost of each search before it runs.`,
      // as on the guide (D6): /pricing carries the price in its own structured data
      inJsonLd: false,
    },
  ];
}

export const connectFinalBody = (name: string) =>
  `Start your ${TRIAL_LABEL}, connect ${name}, create one Play. New leads keep coming.`;

/* ─── the two pages ─────────────────────────────────────────────────────────── */

export const CONNECT_CLIENTS: Record<ConnectClientId, ConnectClient> = {
  chatgpt: {
    id: "chatgpt",
    path: CONNECT_PATHS.chatgpt,
    name: "ChatGPT",
    meta: {
      title: "Use Pancake in ChatGPT (MCP): find customers from your chat",
      description:
        "Connect Pancake to ChatGPT in five minutes. Ask for warm leads, build Plays and edit any message from your chat. Browser sign-in, no API key.",
      ogTitle: "Use Pancake in ChatGPT",
      crumbPage: "Use Pancake in ChatGPT",
    },
    hero: {
      title: "Find customers from ChatGPT",
      lede: "Pancake gives ChatGPT the brain, the data and the tools to run your go-to-market. Ask for leads, build Plays and edit any message in plain English.",
      copy: { label: "Copy server URL", text: MCP_URL, blockId: "hero-server-url" },
    },
    connectTitle: "Connect ChatGPT",
    skills: false,
    faq: [
      {
        q: "What if ChatGPT has no option for custom servers?",
        a: "Custom servers depend on your ChatGPT plan and workspace settings. Without them, connect Claude or Codex instead.",
      },
      ...sharedFaq("ChatGPT"),
    ],
  },
  codex: {
    id: "codex",
    path: CONNECT_PATHS.codex,
    name: "Codex",
    meta: {
      title: "Use Pancake in Codex (MCP): find customers from Codex",
      description:
        "Connect Pancake to Codex with one line. Ask for warm leads, build Plays and edit any message from Codex. Browser sign-in, no API key.",
      ogTitle: "Use Pancake in Codex",
      crumbPage: "Use Pancake in Codex",
    },
    hero: {
      title: "Find customers from Codex",
      lede: "Pancake gives Codex the brain, the data and the tools to run your go-to-market. Ask for leads, build Plays and edit any message in plain English.",
      copy: { label: "Copy setup line", text: SETUP_LINE, blockId: "hero-setup-line" },
    },
    connectTitle: "Connect Codex",
    skills: true,
    faq: [
      {
        q: "Which version of Codex do I need?",
        a: "Codex CLI 0.148 or newer signs in through your browser. On an older version, update Codex first.",
      },
      {
        q: "Does Codex get the Pancake skills?",
        a: "Yes, once you install them in step 03. The Pancake plugin for Codex includes them too.",
      },
      ...sharedFaq("Codex"),
    ],
  },
};

/** Hero setup line and closing card title: the guide's. */
export const CONNECT_HERO_SETUP = HERO.setup;
export const CONNECT_HERO_PRIMARY = HERO.primary;
export const CONNECT_FINAL = { title: FINAL.title, cta: FINAL.cta } as const;

export const CONNECT_SETUP = {
  eyebrow: "Setup",
  h2: "Set it up",
  /** Step 03 on /codex: the guide's title names three kinds of agent; this page is one. */
  skillsTitle: "Install the skills",
} as const;

export const CONNECT_META_SHARED = {
  crumbHome: "Pancake",
  /** The card is the homepage's, so the alt is the text in that image. */
  ogImageAlt: OG_IMAGE_ALT,
} as const;

/** "Other agents": every other way in, so a visitor on the wrong page finds theirs. */
export const CONNECT_OTHERS = {
  eyebrow: "Other agents",
  /** "Also in Claude and Codex." on /chatgpt. */
  h2: (names: string[]) => `Also in ${names.join(" and ")}.`,
  claude: { title: "Claude", line: "On the web, the desktop app and your phone, and in Claude Code.", href: GUIDE_PATH },
  rows: {
    chatgpt: { title: "ChatGPT", line: "On chatgpt.com, with a browser sign-in.", href: CONNECT_PATHS.chatgpt },
    codex: { title: "Codex", line: "In Codex CLI, from one setup line.", href: CONNECT_PATHS.codex },
  } satisfies Record<ConnectClientId, ConnectRow>,
  other: {
    title: "Other agents",
    line: "VS Code, GitHub Copilot CLI, Factory Droid, goose and other clients with browser sign-in.",
    href: `${GUIDE_PATH}#setup`,
  },
} as const;

/** The rows a client's page lists: Claude, the other connect page(s), then everything else. */
export function connectOtherRows(id: ConnectClientId): ConnectRow[] {
  const others = (Object.keys(CONNECT_OTHERS.rows) as ConnectClientId[])
    .filter((k) => k !== id)
    .map((k) => CONNECT_OTHERS.rows[k]);
  return [CONNECT_OTHERS.claude, ...others, CONNECT_OTHERS.other];
}
