/**
 * Homepage demo window copy (V2 Figma 4939:2645 / clean copy 4963:848): the pills' tablist, the
 * Pancake view (its request and Play still feed every agent app's run), the Claude & Codex view
 * (the run's script and Claude's chrome), and since 2026-10-26 `agents`, one view per agent app.
 * Owner: demo-scroll package. In scripts/homepage-lint.mjs FILES. SERVER ONLY (LpDemo.tsx renders
 * it; the island receives the pill labels and the server-rendered scenes).
 *
 * Sources: V2 verbatim for the window chrome, the agent chip and the pills (the raster chip
 * 4939:2774 reads "Prefer your own agent?" / "Use Pancake with Claude or Codex"). The Pancake
 * view was rewritten on 2026-10-12 (founder brief: suggested Plays, shorter and more relevant
 * copy, one fluid take, a web design agency's story): every string of it is below. The Claude
 * view still shows the production demo's request (lib/verticals/home-demo.ts prompt 0). It
 * has no final design (flagged): its controls are the deep-dive Claude frame's (4964:2575), its
 * run is new copy, and its tool titles are the MCP server's own (pancake-cmo
 * packages/mcp/src/plays-tools.ts).
 */
/** Claude's own chrome (deep-dive Claude frame 4964:3910): the demo's Claude view and the deep
 *  dive's Claude story share it. */
const CLAUDE_CHROME = {
  harness: "claude",
  greeting: "Let’s flip some pancakes",
  placeholder: "How can I help you today?",
  /** The connector chip in the composer. */
  connector: "Pancake",
  model: "Opus 5.5",
  /** The docked composer once the request is sent. */
  reply: "Reply to Claude…",
  always: "Always allow",
  allow: "Allow once",
} as const;

const CLAUDE_ARIA =
  "The same request in Claude, with the Pancake connector. Claude reads the Brain, searches funding news and checks who is hiring through Pancake: 25 founders fit. It shows the Play, asks for permission to deploy it, then confirms the Play is live on Pancake.";

export const LP_DEMO = {
  /** sr-only, after the H2 (HOME_DEMO.demo.h2): what the mock shows, for readers and crawlers
   *  (the stage itself is data-nosnippet). Replaces the tour's TOUR_SUMMARY. */
  summary:
    "Product demo: the same GTM request in Claude and in Codex, through Pancake’s MCP server. Pancake reads the Brain, finds 25 founders and deploys a Play that keeps them coming.",
  /** The pills under the window: one tab per agent app (`agents` below). */
  tablist: "Where you run Pancake",

  pancake: {
    newChat: "New chat",
    /* Founder 2026-10-12: "suggested Plays rather than the three actions", copy closer to what
       Pancake does. The hero says "Deploy GTM ideas in seconds": the window shows one being
       deployed. Not the app's own strings on purpose ("the UI does not need to be iso with the
       product"), but the app's LOGIC (his second pass, 2026-10-13: "il faut reprendre la logique
       pour coller à celle de l'app tout en gardant la simplicité"): Pancake researches, leads
       are found, THEN the Play is deployed, and Pancake says what happens next. The subtitle
       "Type it. Pancake runs it." is gone (same pass). */
    title: "What’s your next GTM idea?",
    placeholder: "Find people who…",
    /* The story (founder 2026-10-12: "something for a web design agency", invented from what
       the app does, "no need that what you write on motion comes from an IRL play"): an agency
       goes after startups that just raised. Funding, hiring and keyword are real Pancake
       signals. No person or company is named: the leads are five pairs of initials. */
    /** What is typed in the chat bar: two signals at once, and nothing about what the company
     *  does (founder 2026-10-13: "faut pas rappeler ce qu'on fait dans le chat, car le brain est
     *  censé le savoir… un prompt qui n'est pas que find companies that just raised mais qui ne
     *  rappelle pas du contexte induit"). Both views type the same request. */
    request: "Find founders who just raised a seed round and are hiring a marketing lead.",
    ideasLabel: "Suggested Plays",
    /** Three Plays, three signals, for the same agency. */
    ideas: [
      { kind: "funding", tag: "Funding", title: "Just raised a round" },
      { kind: "hiring", tag: "Hiring", title: "Hiring a marketing lead" },
      { kind: "keyword", tag: "Keyword", title: "Posting about a rebrand" },
    ],
    chipAsk: "Prefer your own agent?",
    /** A real link to /guides/claude (decision 2026-10-09 §3): the humans view's route to the
     *  guide, which the tour's "Works in Claude and Codex. See how →" link carried before. */
    chipCta: "Use Pancake with Claude or Codex",
    /** The research: three tool calls, one at a time (spinner, then a check and what came
     *  back). `count` ticks up from 0. */
    work: [
      { label: "Reading your Brain", result: "" },
      { label: "Searching funding news", count: 148, result: "rounds" },
      { label: "Checking who is hiring", count: 25, result: "fit" },
    ],
    /** What the research found (the count ticks up), with the leads' initials (invented; no
     *  name is shown). The same number as the Play's pace below: a first search that fills
     *  its week (founder 2026-10-13: "12 leads found est bizarre si tu en run 25 par semaine"). */
    found: 25,
    foundLabel: "leads found",
    leads: ["MR", "JL", "AS", "KD", "TN"],
    /** The Play that keeps them coming: the app's own slots (who, how it finds them, how many,
     *  how often) and the steps it runs, then one button. */
    play: {
      kicker: "Play",
      name: "Funded startups hiring marketing",
      draft: "Draft",
      live: "Live",
      who: { key: "Who", value: "Founders, Heads of Marketing" },
      company: { key: "Company", value: "B2B startups, 10 to 50 people" },
      signal: { key: "Signal", value: ["Seed round", "Hiring marketing"] },
      pace: { key: "Pace", value: "Runs daily, 25 leads a week" },
      then: { key: "Then", value: ["Find", "Qualify", "Reach out"] },
      deploy: "Deploy Play",
    },
    /** Pancake's last word once the Play is live: what happens from here. */
    after: "It’s live and runs daily. Messages go out in your voice.",
    /** role="img" label of the view. */
    aria: "Product demo. A web design agency types a request: Find founders who just raised a seed round and are hiring a marketing lead. Pancake reads its Brain, searches funding news and checks who is hiring: 25 leads found. It proposes a Play to keep them coming: who, which companies, the signal, 25 new leads a week, then find, qualify, reach out. One click deploys it. Pancake confirms it is live and will reach out in the agency’s voice.",
  },

  /* The Claude & Codex view, redrawn 2026-10-13 (founder: "passe au motion sur claude en
     utilisant les UIs claude comme dans la motion design video product hunt, tout en restant
     simple: petit connecteur, qq tool calls, plays… on reste simple mais on donne le waouh").
     Same request, same logic as the Pancake view (research, leads, the Play, deploy), in
     Claude's own interface as the launch film drew it: a connector chip in the composer, one
     card per tool call under the Pancake mark, the permission prompt, then the Play goes Live. */
  claude: {
    /** role="img" label of the Claude view. */
    aria: CLAUDE_ARIA,
    ...CLAUDE_CHROME,
    say: "I’ll run this through Pancake.",
    /** One card per tool call: what it is doing, then what came back (`count` ticks up). */
    tools: [
      { title: "Read GTM Brain", doing: "Reading…", done: "Done" },
      { title: "Search funding news", doing: "Searching…", count: 148, done: "rounds" },
      { title: "Check who is hiring", doing: "Searching…", count: 25, done: "fit" },
    ],
    found: "25 founders fit. Here’s a Play to keep them coming.",
    /** Claude's own permission prompt before a tool that changes something. */
    ask: { lead: "Claude wants to use", tool: "Deploy Play", from: "from", app: "Pancake" },
    /** `note`: what "Live" means for a Play, it keeps running (founder 2026-10-13: "something
     *  like running daily next to the deploy, to show the recurring thing about a play"). */
    deploy: { title: "Deploy Play", doing: "Deploying…", done: "Live", note: "running daily" },
    done: "Your Play is live on Pancake.",
  },

  /* The agent apps the window plays in turn, one pill each (founder 2026-10-26: "The demo sub
     banner should evolve in claude, chatgpt but also grokbot, Or whatever are the top 3-4-5
     harnesses most used on the market … use mobbin to repro the UIs of each one of those tools
     … which will allow us to remove those odd logos"; then, the same day, "let s not put grok",
     "gemini is overkill dude", and "i said just claude and codex/chat gpt (pick what should be
     said)"). Claude and Codex: the two the page already names everywhere (the setup line, the
     diagram, the steps), the two agent harnesses Pancake ships a plugin for, and two of the
     three Clay names (ChatGPT's custom connectors depend on the plan). Each runs the Claude
     view's script above (the same request, tool calls, Play and Live) in its own interface:
     demo.css skins drawn from Mobbin's web screens, and the app's own words below (its home
     line, composer, permission buttons). `ask` opens the app's permission prompt. */
  agents: [
    {
      harness: "claude",
      label: "Claude",
      aria: CLAUDE_ARIA,
      chrome: CLAUDE_CHROME,
      ask: "Claude wants to use",
    },
    {
      /* Codex on the web (Mobbin, 2026): the mark and "Codex" top left, "What should we code
         next?" over a ringed composer, "Ask a question with /plan", the mic and a round send. */
      harness: "codex",
      label: "Codex",
      aria: "The same request in Codex, with the Pancake connector. Codex reads the Brain, searches funding news and checks who is hiring through Pancake: 25 founders fit. It shows the Play, asks for approval to deploy it, then confirms the Play is live on Pancake.",
      chrome: {
        harness: "codex",
        title: "Codex",
        greeting: "What should we code next?",
        placeholder: "Ask a question with /plan",
        connector: "Pancake",
        model: "",
        reply: "Ask for follow-up changes",
        always: "Deny",
        allow: "Approve",
      },
      ask: "Codex wants to use",
    },
  ],
} as const;
