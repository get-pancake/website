/**
 * Deep-dive story 4, "Codex at work" (the item "Built for Claude and Codex") — the window's icons.
 * Owner: story-mcp package. Path data only, no copy (not linted; scripts/homepage-lint.mjs reads
 * the Stage and the data module).
 *
 * COPIED from the homepage demo's icon masks (app/_styles/landing-v3/demo.css, "icon masks
 * (data-ico)": codex, mic, arrow-up, plus), never imported: there they are CSS masks under the
 * demo window's own `.lp-demowin` scope. Here the Stage draws them as inline strokes in
 * currentColor (LpStoryMcp.tsx McpIcon), at the demo's sizes. Keep the copies in step: never
 * hand-edit a path, re-copy it.
 */

export type StoryMcpIconId = "codex" | "mic" | "up" | "plus";

export type StoryMcpIcon = {
  viewBox: string;
  /** the stroke's width, in the view box's units (the mask's own) */
  stroke: number;
  /** the corner joins (the arrow's are bevelled, as the mask's) */
  join: "round" | "bevel";
  /** path data */
  d: string;
  /** a circle under the path (the Codex mark's ring) */
  circle?: { cx: number; cy: number; r: number };
  /** a rounded rectangle under the path (the mic's body) */
  rect?: { x: number; y: number; width: number; height: number; rx: number };
};

export const SMCP_ICONS: Record<StoryMcpIconId, StoryMcpIcon> = {
  /** Codex's mark, top left of its window (demo.css data-ico="codex") */
  codex: {
    viewBox: "0 0 24 24",
    stroke: 2,
    join: "round",
    circle: { cx: 12, cy: 12, r: 9.5 },
    d: "m8.5 9.5 2.5 2.5-2.5 2.5M13 15h3",
  },
  /** the composer's mic (data-ico="mic") */
  mic: {
    viewBox: "0 0 24 24",
    stroke: 1.8,
    join: "round",
    rect: { x: 9, y: 3, width: 6, height: 12, rx: 3 },
    d: "M5 11a7 7 0 0 0 14 0M12 18v3",
  },
  /** the round send's arrow (data-ico="arrow-up") */
  up: {
    viewBox: "0 0 13.9744 13.9744",
    stroke: 0.873403,
    join: "bevel",
    d: "M6.9878 12.2276V1.74672M11.7915 6.55043L6.9878 1.74672L2.18408 6.55043",
  },
  /** the composer's plus (data-ico="plus") */
  plus: {
    viewBox: "0 0 17.4681 17.4681",
    stroke: 1.09175,
    join: "round",
    d: "M3.05368 8.73358H14.4079M8.7308 3.05646V14.4107",
  },
};
