import type { StoryMcpMarkId } from "./lp-story-mcp-art";

/**
 * Deep-dive story "Built for Claude and Codex" — its copy and data. Owner: story-mcp package
 * (2026-10-28). Block 4 of the founder's four: "Pour les 4 blocs je ferai donc 1/ Next best
 * action + Unified GTM context 2/ Buying signal + enrichment 3/ Lead lineage 4/ mcp first", with
 * no UI: "ban UI things from motions and try to abstract things … graphic simple and on brand
 * (you can reuse components)". On the pictures that led with a big kicker over a 60–72 px value
 * (this one's was "IN THE CHAT / About 100 tools"): "Still a huge text - no UI should not mean
 * text it should mean abstraction of what our infrastructure does". So the claim is gone and the
 * picture says it: one install puts Pancake under the visitor's agent, and the agent gets
 * Pancake's tools. It is drawn in the parts of the one picture he loves, the old sources story's
 * end hub (white discs with each vendor's own mark, grey cubic wires with round start caps into
 * one near-black dot, flat brand dots, small names under the discs; the signals story,
 * LpStorySignals.tsx, is that picture today).
 *
 * The picture (the END = the server markup, LpStoryMcp.tsx), one flow left to right:
 *   - left, the agents: the marks of Claude and Codex on two white discs, their names under them;
 *   - middle, Pancake: the brand's lockup (the colour mascot and the footer's wordmark on plum).
 *     Each agent's wire runs from its disc into one point on the lockup's left edge: the in-port,
 *     the loved hub's near-black dot;
 *   - right, what the agent gets: six short wires fan out of one point on the lockup's right edge
 *     (the out-port: their shared start, the same near-black dot, as the loved hub drew the caps of
 *     six wires meeting in one point) to six flat stops in the infra section's three tones, a pair
 *     of each, top to bottom as the logo's pancakes and the infra cards: yellow (Context), purple
 *     (Data), pink (Tools). One small label over the fan: "About 100 tools".
 * The direction is always the agents into Pancake, then Pancake out to its tools. Not in it: a
 * chat window, a composer, a tool card, a terminal, an install line, a claim, the word "MCP",
 * any other agent's mark. The names and the label are the kit's small names (12/16), hidden on
 * phones: the picture reads without them.
 *
 * In scripts/homepage-lint.mjs FILES: every string here is linted. Copy sits in fields named
 * `text` or `name`; path data sits under `d`, ids under `id` and colours under `tone`, code keys
 * the lint skips. Never name a copy field after a code key (id, key, kind, type, role, icon,
 * path, url…).
 *
 * Claims (truth §6):
 *   - "About 100 tools": the server serves 96–112 tools, by workspace setup (the public figure
 *     since 2026-10-28: public/llms.txt and docs/infra/infra-landing-brief.md say the same). The
 *     item's body says it in full: "Your agent creates Plays and reviews leads with about 100
 *     tools". Six stops stand for them; the label gives the number.
 *   - Claude and Codex are the two marks drawn, as the item's title names them (the founder left
 *     the second pick open: "just claude and codex/chat gpt (pick what should be said)"). The
 *     OpenAI glyph is Codex's mark (LpAgentMarks.tsx CodexMark); the name under it says which
 *     agent it is. The body names the other clients; the picture draws no other mark.
 *
 * Geometry: stage px on the 752×489 design box, every point ≥ 40 px from its edges (the nearest:
 * the label's line box, its top at 64.197; the discs' left, 72). The lockup is 245.799×90 at
 * (280, 199.5), so its middle line is the stage's (y 244.5) and the two ports sit on its edges on
 * that line. The agents' 100 px discs stand at x 72, their centres 96 above and below that line.
 * The stops are the loved purple confetti dot's size (Ø25.418, as the lineage story's stop), on
 * an ellipse around the out-port (radii 140 across, 172 down) at ±8°, ±41° and ±56°: three
 * pairs. Every wire is one cubic with horizontal handles, c = 0.426667 × the straight distance
 * between its ends (the loved hub's formula, lp-story-sources-data.ts:89-93 at 630bb8e, removed
 * with its story the same day), written out from where it draws, never computed at render: each
 * agent's from its disc's right magnet (its start cap) into the in-port; each of the fan's from
 * the out-port to its stop's centre, which the stop covers.
 *
 * STORY_MCP_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only copy a
 * screen reader gets (the shell's host aria-label).
 *
 * Client-safe literals only: the Stage (server) and the timeline (client chunk) both read it.
 */

export type StoryMcpAgent = {
  /** the agent's mark (lp-story-mcp-art.ts); its disc, its wire, its cap and its name share it
      (data-node) */
  id: StoryMcpMarkId;
  /** the agent's name, under its disc (the kit's name style); phones hide it */
  name: string;
  /** disc top-left and diameter (the kit's white disc, SkDisc) */
  disc: { x: number; y: number; size: number };
  /** the wire's start cap: the disc's right magnet (x + size, y + size / 2), over the disc's
      edge */
  cap: { x: number; y: number };
  /** the wire, from the cap into the in-port */
  d: string;
};

export type StoryMcpTool = {
  /** the stop's colour: the brand token after `--lp-` (foundation.css), an infra card's tone */
  tone: "yellow-30" | "purple-30" | "pink-30";
  /** the stop's centre and radius, stage px */
  stop: { x: number; y: number; r: number };
  /** the wire, from the out-port to the stop's centre (the stop covers its end) */
  d: string;
};

export type StoryMcpStory = {
  /** Pancake's lockup: its box, stage px (its content's own size, story-mcp.css: the infra
      lockup ×1.25) */
  brand: { x: number; y: number; w: number; h: number };
  /** where both agents' wires land: the near-black dot, on the lockup's left edge */
  inPort: { x: number; y: number };
  /** where the fan's wires start: their shared start, the same near-black dot, on the lockup's
      right edge */
  outPort: { x: number; y: number };
  /** in reveal order: Claude, then Codex */
  agents: readonly [StoryMcpAgent, StoryMcpAgent];
  /** the fan, in reveal order (top to bottom) */
  tools: readonly StoryMcpTool[];
  /** the one label, centred on x (the stops' span): it sits over the line y = `top` (the kit's
      name above a box, 21 px over it), 4 px over the top stop */
  label: { text: string; x: number; top: number };
};

export const STORY_MCP: StoryMcpStory = {
  brand: { x: 280, y: 199.5, w: 245.799, h: 90 },
  inPort: { x: 280, y: 244.5 },
  outPort: { x: 525.799, y: 244.5 },
  agents: [
    {
      id: "claude",
      name: "Claude",
      disc: { x: 72, y: 98.5, size: 100 },
      cap: { x: 172, y: 148.5 },
      d: "M172 148.5C233.653 148.5 218.347 244.5 280 244.5",
    },
    {
      id: "codex",
      name: "Codex",
      disc: { x: 72, y: 290.5, size: 100 },
      cap: { x: 172, y: 340.5 },
      d: "M172 340.5C233.653 340.5 218.347 244.5 280 244.5",
    },
  ],
  tools: [
    {
      tone: "yellow-30",
      stop: { x: 604.086, y: 101.906, r: 12.709 },
      d: "M525.799 244.5C595.205 244.5 534.68 101.906 604.086 101.906",
    },
    {
      tone: "yellow-30",
      stop: { x: 631.458, y: 131.658, r: 12.709 },
      d: "M525.799 244.5C591.756 244.5 565.501 131.658 631.458 131.658",
    },
    {
      tone: "purple-30",
      stop: { x: 664.437, y: 220.562, r: 12.709 },
      d: "M525.799 244.5C585.827 244.5 604.409 220.562 664.437 220.562",
    },
    {
      tone: "purple-30",
      stop: { x: 664.437, y: 268.438, r: 12.709 },
      d: "M525.799 244.5C585.827 244.5 604.409 268.438 664.437 268.438",
    },
    {
      tone: "pink-30",
      stop: { x: 631.458, y: 357.342, r: 12.709 },
      d: "M525.799 244.5C591.756 244.5 565.501 357.342 631.458 357.342",
    },
    {
      tone: "pink-30",
      stop: { x: 604.086, y: 387.094, r: 12.709 },
      d: "M525.799 244.5C595.205 244.5 534.68 387.094 604.086 387.094",
    },
  ],
  label: { text: "About 100 tools", x: 634.262, top: 85.197 },
};

/** The whole story. It names Pancake and both agents: the stage is aria-hidden, so they are read
    from here only. */
export const STORY_MCP_ALT: string =
  "Animation: the marks of Claude and Codex each draw a line into Pancake. From Pancake, lines fan out to its tools, about 100 of them.";
