/**
 * SINCE 2026-11-11 THE WINDOW IS CLAUDE'S. On the vision homepage the item reads "Run everything
 * from Claude" (the founder: "from Claude (not your agent)"), so the picture beside it is Claude's
 * window: its spark and name, its serif for the home line and the answer, its composer. The job,
 * the steps, the Play and the motion are unchanged. Below, "Codex" is this story's history: read
 * it as "the agent's window".
 *
 * Deep-dive story 4, "Codex at work" (the item "Built for Claude and Codex", lp-dive-data.ts) —
 * its copy and data. Owner: story-mcp package (2026-10-28; this picture 2026-11-01). Block 4 of
 * the founder's four: "Pour les 4 blocs je ferai donc 1/ Next best action + Unified GTM context 2/
 * Buying signal + enrichment 3/ Lead lineage 4/ mcp first".
 *
 * The founder replaced the block's diagram (2026-11-01): "not a big fan of this one. but not sure
 * how to make it better. Maybe we could just do a screenshot of codex doing stuff like in the
 * h1... but I feel like the right hand part forces you to think too much, and there's already too
 * many of those schemas with arrows". He picked a Codex window at the end of one job, in the
 * homepage demo's own look (LpClaudeScene.tsx, demo.css "Claude & Codex view" and "Codex"), with
 * no arrows and a job of its own. So the dive's "no UI" rule is lifted for this block, on his
 * word; everything else of the dive holds (no bounce, nothing travelling, plays once).
 *
 * The job is the page's own story: the homepage's seller designs websites for startups, and the
 * demo's home suggests the Play "Posting about a rebrand" (lp-demo-data.ts `ideas`, the keyword
 * signal). Here Codex is asked for exactly that, runs it through Pancake (the connector in its
 * composer, the Pancake mark on each step), and answers with the Play. The demo's own job
 * ("Find founders who just raised a seed round and are hiring a marketing lead.") stays the hero's.
 *
 * The picture (the END = the server markup, LpStoryMcp.tsx): Codex's window at the end of the job.
 * Top left, its mark and name; the thread: the ask in the user's bubble, Pancake's three steps as
 * Codex's log lines (each done), one line of answer and the Play's card (its name and two rows);
 * the composer docked at the bottom, waiting for a follow-up, with the Pancake connector.
 *
 * In scripts/homepage-lint.mjs FILES: every string here is linted. Copy sits in fields named
 * `text` or `name`, or in the window's own chrome fields below (title, greeting, placeholder,
 * reply, connector, doing, done, kicker, value): never a code key (id, key, kind, type, role,
 * icon, path, url…), which the lint skips.
 *
 * Copy rules (truth §6 and the founder's): no count and no figure (the demo's "148 rounds" and
 * "25 founders fit" are the hero's, not here), no frequency word, no person's name, no platform's
 * name, nothing about approving, and never the word "MCP". "Codex" and "Pancake" are the two apps
 * the item names. Codex's own words (its home line, its placeholders) are the demo's
 * (lp-demo-data.ts agents[1].chrome); the steps are in the demo's step style ("Read GTM Brain",
 * "Search funding news"…). The Play's two rows are the demo card's kind (Who, Signal); its
 * signal is the keyword signal of the demo's suggested Play, as two keywords.
 *
 * Geometry: stage px on the 752×489 design box. The window stands 20 px inside the box
 * (712×449); everything in it is placed against the window, at the demo window's own metrics
 * (story-mcp.css). STORY_MCP_ALT is fixed (lp-dive-stages.ts imports it): what the animation
 * shows, the only copy a screen reader gets (the shell's host aria-label).
 *
 * Client-safe literals only: the Stage (server) and the timeline (client chunk) both read it.
 */

export type StoryMcpStep = {
  /** the step, as Codex logs it (the demo's tool-call title) */
  text: string;
  /** what the step says while it runs */
  doing: string;
  /** what it says once done */
  done: string;
};

export type StoryMcpRow = {
  /** the row's name (the demo card's key column) */
  name: string;
  /** its value: words, or chips */
  value: string | readonly string[];
};

export type StoryMcpStory = {
  /** the window: its box in the stage, stage px */
  window: { x: number; y: number; w: number; h: number };
  /** Codex's own chrome (the demo's agents[1].chrome): its name top left, its home line (frame 0
      only, hidden at rest), the composer's placeholder before the ask, and once it is sent */
  title: string;
  greeting: string;
  placeholder: string;
  reply: string;
  /** the connector chip in the composer */
  connector: string;
  /** the ask, typed in the composer, then the user's bubble */
  ask: { text: string };
  /** Pancake's steps, in order */
  steps: readonly StoryMcpStep[];
  /** Codex's one line over the result */
  result: { text: string };
  /** the result: the Play's card (the demo card's style), its name and two rows */
  play: { kicker: string; name: string; rows: readonly StoryMcpRow[] };
};

export const STORY_MCP: StoryMcpStory = {
  window: { x: 20, y: 20, w: 712, h: 449 },
  // Claude's own words (lp-demo-data.ts CLAUDE_CHROME)
  title: "Claude",
  greeting: "Let’s flip some pancakes",
  placeholder: "How can I help you today?",
  reply: "Reply to Claude…",
  connector: "Pancake",
  ask: { text: "Find startups posting about a rebrand." },
  steps: [
    // ("Read GTM Brain" until the vision homepage, which says "revenue", never "GTM", 2026-11-11)
    { text: "Read your Brain", doing: "Reading…", done: "Done" },
    { text: "Search posts about a rebrand", doing: "Searching…", done: "Done" },
    { text: "Build the Play", doing: "Building…", done: "Done" },
  ],
  result: { text: "Here’s a Play to keep them coming." },
  play: {
    kicker: "Play",
    name: "Startups planning a rebrand",
    rows: [
      { name: "Who", value: "Founders, Heads of Brand" },
      { name: "Signal", value: ["Rebrand", "New website"] },
    ],
  },
};

/** The whole story. It names Claude, Pancake, the ask and the Play: the stage is aria-hidden, so
    they are read from here only. */
export const STORY_MCP_ALT: string =
  "Animation: in Claude, with the Pancake connector, someone types: Find startups posting about a rebrand. Pancake reads your Brain, searches posts about a rebrand and builds the Play. Claude answers with the Play, Startups planning a rebrand: founders and heads of brand, on rebrand and new website signals.";
