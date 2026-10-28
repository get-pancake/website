import type { StoryMcpMarkId } from "./lp-story-mcp-art";

/**
 * Deep-dive story "Built for Claude and Codex" — its copy and data. Owner: story-mcp package
 * (2026-10-28). Block 4 of the founder's four, on the section then titled "How Pancake gets you
 * customers": "Pour les 4 blocs je ferai donc 1/ Next best action + Unified GTM context 2/ Buying
 * signal + enrichment 3/ Lead lineage 4/ mcp first", drawn in the one picture he loves (the old
 * sources story's end hub: white discs, grey cubic wires with round start caps into one
 * near-black dot), with no UI: "ban UI things from motions and try to abstract things … graphic
 * simple and on brand (you can reuse components)". Spec: the design panel's final build spec of
 * 2026-10-28, §3.0 (the shared kit) and §3.4 (this story), whose rendered END and cue pictures
 * the build matches.
 *
 * The picture (the END = the server markup, LpStoryMcp.tsx): the claim top left, "IN THE CHAT"
 * over "About 100 tools"; under it the brand's lockup, Pancake, with the marks of Claude and
 * Codex on two white discs to its right. A wire runs from each disc into one near-black point,
 * and one stem from that point into Pancake: the direction is always the agents into Pancake.
 * Nothing is written beside the marks. Not in it: a chat window, a composer, a tool card, a model
 * label, an install line, the word "MCP" (spec §4.9: it stays off the page and the ALT; "MCP
 * first" can become the kicker on his word).
 *
 * In scripts/homepage-lint.mjs FILES: every string here is linted. Copy sits in fields named
 * `text`; path data sits under `d` and ids under `id`, code keys the lint skips.
 *
 * Claims (truth §6):
 *   - "About 100 tools": the server's tool count is 96–112, by workspace setup (spec §4.5: a new
 *     public figure; public/llms.txt says "About 100 tools" in the same change). The display
 *     face's trial cut carries letters, digits and spaces only, so the figure is never "100+".
 *   - "In the chat": the visitor's agent reaches those tools from its own chat (Claude, Claude
 *     Code, Codex: the item's body, "Your agent creates Plays and reviews leads with about 100
 *     tools").
 *   - Codex, not ChatGPT (spec §4.8: the founder left the pick open, "just claude and codex/chat
 *     gpt (pick what should be said)"; ChatGPT connects only as a custom plugin, by plan or admin
 *     setting, and its mark is the Codex glyph anyway).
 *
 * Geometry: stage px on the 752×489 design box, from spec §3.4 (its geometry helper, geo.cjs).
 * Each agent's wire is one cubic with horizontal handles, c = 0.426667 × the straight distance
 * (the loved hub's formula, lp-story-sources-data.ts:89-93 at 630bb8e, removed with its story
 * the same day), written out from the disc's start cap into the point, never computed at render.
 *
 * STORY_MCP_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only copy a
 * screen reader gets (the shell's host aria-label).
 *
 * Client-safe literals only: the Stage (server) and the timeline (client chunk) both read it.
 */

export type StoryMcpAgent = {
  /** the agent's mark (lp-story-mcp-art.ts); its disc, its wire and its cap share it (data-node) */
  id: StoryMcpMarkId;
  /** disc top-left and diameter (the kit's white disc, SkDisc) */
  disc: { x: number; y: number; size: number };
  /** the wire's start cap: the disc's left magnet (x, y + size / 2), over the disc's edge */
  cap: { x: number; y: number };
  /** the wire, from the cap into the point */
  d: string;
};

export type StoryMcpStory = {
  /** the claim: a spaced-caps kicker (sentence case here, the caps are story-kit.css's) over a
      value in the display face (placed by story-mcp.css) */
  kicker: { text: string };
  value: { text: string };
  /** where both wires land and the stem starts: the near-black dot, on the lockup's middle line */
  point: { x: number; y: number };
  /** the stem, from the point into Pancake: it ends at x 441, under the lockup's right edge
      (441.8), so it reads as plugged in */
  stem: { d: string };
  /** in reveal order: Claude, then Codex */
  agents: readonly [StoryMcpAgent, StoryMcpAgent];
};

export const STORY_MCP: StoryMcpStory = {
  kicker: { text: "In the chat" },
  value: { text: "About 100 tools" },
  point: { x: 486, y: 345 },
  stem: { d: "M486 345H441" },
  agents: [
    {
      id: "claude",
      disc: { x: 556, y: 234, size: 96 },
      cap: { x: 556, y: 282 },
      d: "M556 282C515.818 282 526.182 345 486 345",
    },
    {
      id: "codex",
      disc: { x: 556, y: 360, size: 96 },
      cap: { x: 556, y: 408 },
      d: "M556 408C515.818 408 526.182 345 486 345",
    },
  ],
};

/** The whole story. It names Pancake and both agents: the stage is aria-hidden, so they are read
    from here only. */
export const STORY_MCP_ALT: string =
  "Animation: under the words In the chat, About 100 tools, the Pancake logo. The marks of Claude and Codex appear one at a time, each with a line into one point, then a single line runs from that point into Pancake.";
