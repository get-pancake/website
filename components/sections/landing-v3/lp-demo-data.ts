/**
 * Homepage demo window copy (V2 Figma 4939:2645 / clean copy 4963:848): the two pills, the
 * Pancake view, the Claude & Codex view. Owner: demo-scroll package. In scripts/homepage-lint.mjs
 * FILES. SERVER ONLY (LpDemo.tsx renders it; the island receives only the pill labels).
 *
 * Sources: V2 verbatim for the window chrome, the empty state, "Get started" + its cards, the
 * agent chip and the pills (the raster chip 4939:2774 reads "Prefer your own agent?" / "Use
 * Pancake with Claude or Codex"). The request, the reply and the Play card come from the
 * production demo data (lib/verticals/home-demo.ts prompt 0 + vx-copy.ts, both checked by
 * lib/verticals/validate.ts) and are passed in by LpDemo.tsx, not repeated here: the Pancake
 * conversation is production's Play pane at production's own metrics (storyboard frame "4"
 * 5024:8353, "Same as today"), so no string of it is new. The Claude view
 * has no final design (flagged): its controls are the deep-dive Claude frame's (4964:2575), its
 * run is new copy, and its tool titles are the MCP server's own (pancake-cmo
 * packages/mcp/src/plays-tools.ts).
 */
export const LP_DEMO = {
  /** sr-only, after the H2 (HOME_DEMO.demo.h2): what the mock shows, for readers and crawlers
   *  (the stage itself is data-nosnippet). Replaces the tour's TOUR_SUMMARY. */
  summary:
    "Product demo: tell Pancake who to reach. It builds the Play and runs its first search. The same request works from Claude or Codex, through Pancake’s MCP server.",
  /** The pills under the window: a two-view tablist. */
  tablist: "Where you run Pancake",
  pills: ["Pancake", "Claude & Codex"],

  pancake: {
    newChat: "New chat",
    title: "Ready when you are",
    sub: "Tell Pancake who you want to find",
    getStarted: "Get started",
    // V2 verbatim; only the first body ends with a period in V2 (flagged, kept)
    cards: [
      { title: "Create a play", body: "Pancake builds it with you." },
      { title: "Review my leads", body: "Decide who to contact first" },
      { title: "See what’s working", body: "Which plays bring the best replies" },
    ],
    chipAsk: "Prefer your own agent?",
    /** A real link to /guides/claude (decision 2026-10-09 §3): the humans view's route to the
     *  guide, which the tour's "Works in Claude and Codex. See how →" link carried before. */
    chipCta: "Use Pancake with Claude or Codex",
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
