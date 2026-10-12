/**
 * Homepage demo window copy (V2 Figma 4939:2645 / clean copy 4963:848): the two pills, the
 * Pancake view, the Claude & Codex view. Owner: demo-scroll package. In scripts/homepage-lint.mjs
 * FILES. SERVER ONLY (LpDemo.tsx renders it; the island receives only the pill labels).
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
export const LP_DEMO = {
  /** sr-only, after the H2 (HOME_DEMO.demo.h2): what the mock shows, for readers and crawlers
   *  (the stage itself is data-nosnippet). Replaces the tour's TOUR_SUMMARY. */
  summary:
    "Product demo: type a GTM idea. Pancake builds the Play, and one click deploys it. The same request works from Claude or Codex, through Pancake’s MCP server.",
  /** The pills under the window: a two-view tablist. */
  tablist: "Where you run Pancake",
  pills: ["Pancake", "Claude & Codex"],

  pancake: {
    newChat: "New chat",
    /* Founder 2026-10-12: "suggested Plays rather than the three actions", copy closer to what
       Pancake does, and "not more complex and not more words than the current one" (this view
       reads about 90 words, the one before about 130). The hero says "Deploy GTM ideas in
       seconds": the window shows one being deployed. Not the app's own strings on purpose
       ("the UI does not need to be iso with the product"). */
    title: "What’s your next GTM idea?",
    sub: "Type it. Pancake runs it.",
    placeholder: "Find people who…",
    /* The story (founder 2026-10-12: "something for a web design agency", invented from what
       the app does, "no need that what you write on motion comes from an IRL play"): an agency
       goes after startups that just raised. Funding, hiring and keyword are real Pancake
       signals. No person or company is named: the leads are five pairs of initials. */
    /** What is typed in the chat bar (short: the first part goes fast). The Claude & Codex view
     *  keeps the production request until it is redrawn. */
    request: "Find startups that just raised a seed round.",
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
    /** The Play card. Its three rows are the work Pancake does while it builds a Play: each
     *  shows `doing` with a spinner, then its value with a check (the app fills its own
     *  numbered slots the same way). */
    play: {
      kicker: "Play",
      name: "Startups after a seed round",
      draft: "Draft",
      live: "Live",
      rows: [
        { key: "Who", doing: "Reading your Brain" },
        { key: "Signal", doing: "Checking funding news" },
        { key: "Then", doing: "Planning outreach" },
      ],
      who: "Founders, Heads of Marketing",
      signal: ["Seed round", "Raised this month"],
      steps: ["Find", "Qualify", "Reach out"],
      /** The first leads' initials (invented; no name is shown). */
      leads: ["MR", "JL", "AS", "KD", "TN"],
      deploy: "Deploy Play",
      /** After the click: the first search's leads arrive (the count ticks up to `found`). */
      found: 12,
      foundLabel: "leads found",
    },
    /** role="img" label of the view. */
    aria: "Product demo. A web design agency types a request: Find startups that just raised a seed round. Pancake builds a Play from it: who to find, the signal to watch, and what happens next. One click deploys it and its first leads arrive.",
  },

  claude: {
    /** role="img" label of the Claude view. */
    aria: "The same request in Claude. Claude plans the Play with Pancake, asks before creating it, then creates it and runs its first search.",
    /** Deep-dive Claude frame 4964:3910. */
    greeting: "Let’s flip some pancakes",
    modes: ["Chat", "Cowork"],
    model: "Opus 5",
    effort: "High",
    below: ["Project", "Manual"],
    placeholder: "Reply to Claude…",
    say: "I’ll set this up as a Play in Pancake.",
    tools: { plan: "Plan a new Play", create: "Create a saved Play", run: "Run a saved Play" },
    ask: "Create it and run its first search?",
    allow: "Allow once",
    done: "Done. Your play is ready. Its first search is running.",
  },
} as const;
