import type { StoryMcpMarkId } from "./lp-story-mcp-art";

/**
 * Deep-dive story 4, "One ask, the right tools, your approval" — its copy and data. Owner:
 * story-mcp package (2026-10-28; this story 2026-10-30, founder: "Yes, prototype it"). Block 4
 * of the founder's four: "Pour les 4 blocs je ferai donc 1/ Next best action + Unified GTM context
 * 2/ Buying signal + enrichment 3/ Lead lineage 4/ mcp first", with no UI: "ban UI things from
 * motions and try to abstract things … graphic simple and on brand (you can reuse components)";
 * and "no UI should not mean text it should mean abstraction of what our infrastructure does".
 *
 * Why this story: a GTM buyer asks what about 100 tools do for them, and whether the agent emails
 * people on its own. The picture answers both: one ask from the visitor's agent lights only the
 * tool groups the job needs (one group stays unlit), and a person approves before anything goes
 * out. It is drawn in the parts of the one picture the founder loves, the old sources story's end
 * hub (white discs with each vendor's own mark, grey cubic wires, flat brand dots, the hub's
 * near-black, small names; the signals story, LpStorySignals.tsx, is that picture today).
 *
 * The picture (the END = the server markup, LpStoryMcp.tsx), one flow left to right:
 *   - left, the agents: the marks of Claude and Codex on two white discs, their names under them.
 *     Each agent's wire runs from its disc's edge into one point on the lockup's left edge;
 *     Claude's, the one that asks, rests in the hub's near-black, Codex's in the grey;
 *   - middle, Pancake: the brand's lockup (the colour mascot and the footer's wordmark on plum);
 *   - right, the tools: six spokes fan out of one point on the lockup's right edge to six group
 *     stops, each named to its right with a bare noun, top to bottom Signals, Leads (purple, the
 *     infra cards' Data), Brain (yellow, Context), Plays, CRM (pink, Tools) and Enrichment, which
 *     this job does not use: its stop and spoke stay grey and its name sits back (ink-80). The
 *     five used spokes rest near-black. "About 100 tools" heads the group;
 *   - the approval: a ring on the Plays spoke, out in the open between the upper three groups and
 *     the lower three, named "You approve"; it rests filled near-black (approved).
 * Not in it: a chat window, a composer, a tool card, a terminal, a claim, the word "MCP", a
 * person's name, a platform's name. The names and labels are the kit's small names (12/16),
 * hidden on phones: the picture reads without them.
 *
 * The motion (lp-story-mcp-timeline.ts) adds one small label that lives in the motion only:
 * "Thinking…", under the lockup from the ask to the approval, in the kit's name style at ink-80.
 * Hidden at rest (story-mcp.css), so it is never in the END picture.
 *
 * In scripts/homepage-lint.mjs FILES: every string here is linted. Copy sits in fields named
 * `text` or `name`; path data sits under `d`, ids under `id` and colours under `tone`, code keys
 * the lint skips. Never name a copy field after a code key (id, key, kind, type, role, icon,
 * path, url…).
 *
 * Claims (truth §6):
 *   - "About 100 tools": the server serves 96–112 tools, by workspace setup (the public figure
 *     since 2026-10-28: public/llms.txt and docs/infra/infra-landing-brief.md say the same). The
 *     six stops are groups of them, named as the product names them (Signals, Leads, Brain,
 *     Plays, CRM, Enrichment); the caption gives the number.
 *   - The approval: a person approves before outreach goes out (the homepage's own "You approve
 *     every lead"). The ring stands on the Plays spoke, ahead of Plays and the CRM.
 *   - Claude and Codex are the two marks drawn, as the item's title names them (the founder left
 *     the second pick open: "just claude and codex/chat gpt (pick what should be said)"). The
 *     OpenAI glyph is Codex's mark (LpAgentMarks.tsx CodexMark); the name under it says which
 *     agent it is. The body names the other clients; the picture draws no other mark.
 *
 * Geometry: stage px on the 752×489 design box, every point ≥ 40 px from its edges (the nearest:
 * the caption's line box, its top at 56.719; the discs' left, 72; the Plays name's right end,
 * 702.9). The lockup is 245.799×90 at (280, 199.5), so its middle line is the stage's (y 244.5)
 * and the wires meet its edges on that line, with no dot on an edge (founder 2026-10-28, on the
 * dots over the discs: "ca fait un peu vibe coded"). The agents' 100 px discs stand at x 72, their
 * centres 96 above and below that line. The stops are the loved purple confetti dot's size
 * (Ø25.418, as the lineage story's), on an ellipse around the lockup's right edge point (525.799,
 * 244.5) (radii 135 across, 170 down) at ±65°, ±45° and ±20°: the ±20° pair leaves the open gap
 * the approval stands in. A stop's name starts 7 px right of its edge, its line centred on the
 * stop. Every wire is one cubic with horizontal handles, c = 0.426667 × the straight distance
 * between its ends (the loved hub's formula, lp-story-sources-data.ts:89-93 at 630bb8e, removed
 * with its story the same day), written out, never computed at render: each agent's from its
 * disc's right magnet into the lockup's left edge; each spoke from the lockup's right edge to its
 * stop's centre, which the stop covers. The ring sits on the Plays spoke at 42 % of its length
 * (r 6, its 2 px stroke centred on it), "You approve" 10 px right of its centre, its line 17 px
 * above it, in the gap. "Thinking…" sits centred under the lockup (the kit's name under a box).
 *
 * STORY_MCP_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only copy a
 * screen reader gets (the shell's host aria-label).
 *
 * Client-safe literals only: the Stage (server) and the timeline (client chunk) both read it.
 */

export type StoryMcpAgent = {
  /** the agent's mark (lp-story-mcp-art.ts); its disc, its wire and its name share it
      (data-node) */
  id: StoryMcpMarkId;
  /** the agent's name, under its disc (the kit's name style); phones hide it */
  name: string;
  /** disc top-left and diameter (the kit's white disc, SkDisc) */
  disc: { x: number; y: number; size: number };
  /** the wire, from the disc's right magnet (x + size, y + size / 2) into the lockup's left
      edge */
  d: string;
  /** the agent that asks: its wire turns near-black and rests so; the other stays grey */
  asks: boolean;
};

export type StoryMcpTool = {
  /** the group's bare noun, right of its stop (the kit's name style); phones hide it */
  name: string;
  /** the stop's colour once the job uses it: the brand token after `--lp-` (foundation.css), an
      infra card's tone; "grey" for the group this job does not use (it never lights, its spoke
      stays grey and its name sits back) */
  tone: "yellow-30" | "purple-30" | "pink-30" | "grey";
  /** the stop's centre and radius, stage px */
  stop: { x: number; y: number; r: number };
  /** the spoke, from the lockup's right edge to the stop's centre (the stop covers its end) */
  d: string;
};

export type StoryMcpStory = {
  /** Pancake's lockup: its box, stage px (its content's own size, story-mcp.css: the infra
      lockup ×1.25) */
  brand: { x: number; y: number; w: number; h: number };
  /** in reveal order: Claude, then Codex */
  agents: readonly [StoryMcpAgent, StoryMcpAgent];
  /** the tool groups, top to bottom (the order the used ones light in) */
  tools: readonly StoryMcpTool[];
  /** the caption, centred on x over the group (stops and names): it sits over the line
      y = `top` (the kit's name above a box, 21 px over it), 4 px over the top stop */
  label: { text: string; x: number; top: number };
  /** Pancake at work, the motion's only label: centred under the lockup, shown from the ask to
      the approval, hidden at rest (never in the END picture) */
  thinking: { text: string };
  /** the approval: a ring on the spoke of `tools[tool]` (Plays), `at` of its length from the
      lockup; its name, left-aligned at `label.x`, its line centred on `label.y` */
  gate: {
    text: string;
    tool: number;
    at: number;
    ring: { x: number; y: number; r: number };
    label: { x: number; y: number };
  };
};

export const STORY_MCP: StoryMcpStory = {
  brand: { x: 280, y: 199.5, w: 245.799, h: 90 },
  agents: [
    {
      id: "claude",
      name: "Claude",
      disc: { x: 72, y: 98.5, size: 100 },
      d: "M172 148.5C233.653 148.5 218.347 244.5 280 244.5",
      asks: true,
    },
    {
      id: "codex",
      name: "Codex",
      disc: { x: 72, y: 290.5, size: 100 },
      d: "M172 340.5C233.653 340.5 218.347 244.5 280 244.5",
      asks: false,
    },
  ],
  tools: [
    {
      name: "Signals",
      tone: "purple-30",
      stop: { x: 582.852, y: 90.428, r: 12.709 },
      d: "M525.799 244.5C595.899 244.5 512.752 90.428 582.852 90.428",
    },
    {
      name: "Leads",
      tone: "purple-30",
      stop: { x: 621.258, y: 124.292, r: 12.709 },
      d: "M525.799 244.5C591.293 244.5 555.764 124.292 621.258 124.292",
    },
    {
      name: "Brain",
      tone: "yellow-30",
      stop: { x: 652.658, y: 186.357, r: 12.709 },
      d: "M525.799 244.5C585.34 244.5 593.117 186.357 652.658 186.357",
    },
    {
      name: "Plays",
      tone: "pink-30",
      stop: { x: 652.658, y: 302.643, r: 12.709 },
      d: "M525.799 244.5C585.34 244.5 593.117 302.643 652.658 302.643",
    },
    {
      name: "CRM",
      tone: "pink-30",
      stop: { x: 621.258, y: 364.708, r: 12.709 },
      d: "M525.799 244.5C591.293 244.5 555.764 364.708 621.258 364.708",
    },
    {
      name: "Enrichment",
      tone: "grey",
      stop: { x: 582.852, y: 398.572, r: 12.709 },
      d: "M525.799 244.5C595.899 244.5 512.752 398.572 582.852 398.572",
    },
  ],
  label: { text: "About 100 tools", x: 636.52, top: 77.719 },
  thinking: { text: "Thinking…" },
  gate: {
    text: "You approve",
    tool: 3,
    at: 0.42,
    ring: { x: 580.494, y: 266.158, r: 6 },
    label: { x: 590.494, y: 249.158 },
  },
};

/** The whole story. It names Pancake, both agents and the six groups: the stage is aria-hidden,
    so they are read from here only. */
export const STORY_MCP_ALT: string =
  "Animation: Claude and Codex are wired into Pancake, which fans out to six groups of its about 100 tools. Claude asks for a job: Pancake lights only the groups it needs, Signals, Leads and Brain, then waits for your approval before Plays and CRM. Enrichment stays unused.";
