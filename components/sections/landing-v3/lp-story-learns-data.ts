/**
 * Deep-dive story "Pancake learns from what wins" — its copy and data (Figma storyboard of
 * 2026-10-12: 5061:1443 / 5335 / 5399 / 5459 / 5509). Owner: story-learns package.
 * In scripts/homepage-lint.mjs FILES: every string here is linted. Entries that may only show in
 * dev/preview carry `status: "placeholder"` (lib/placeholders.ts ContentStatus) and are gated by
 * the server parent, never by this module.
 *
 * STORY_LEARNS_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label).
 *
 * Truth. The storyboard is production's old "learns" card redrawn for the stage, with its
 * pre-audit sample copy: a chart reading "56% vs last period", then "What worked" with "Lead with
 * no-shows / Shorter intros / Asking for Thursdays", then "Updating Brain..." and "Brain
 * updated!". Pancake learns who fits from the leads you approve or reject; it learns no message
 * pattern. The designer's layout is kept:
 * - the chart is as drawn, "56%" and "vs last period". The founder kept this chart on production's
 *   card on 2026-10-08 (reverting the 2026-10-07 audit's plain count), so it is not relabelled
 *   here either ("leads approved", 2026-10-12, was mine and is gone).
 * - "What worked" + three message lessons → "Brain learned" + the three audience lessons of
 *   production's card (truth pass 2026-10-07: "the app learns no message patterns").
 * "Updating Brain..." and "Brain updated!" are true as drawn.
 */

export const LEARNS = {
  /** the chart: where the count starts, what it shows at Figma frame 1 and where it lands, in % */
  share: { start: 0, frame1: 26, end: 56 },
  /** under the figure, set in caps by the CSS (as drawn) */
  shareLabel: "vs last period",
  /** twelve bars, three a week, on a 451×145 plot: heights in px (Figma frame 2) and left
      edges (16 wide, spread edge to edge: (451 − 16) / 11 apart) */
  bars: [40, 48, 40, 47, 68, 76, 85, 69, 101, 76, 118, 145],
  barX: [0, 39.545, 79.091, 118.636, 158.182, 197.727, 237.273, 276.818, 316.364, 355.909, 395.455, 435],
  plot: { width: 451, height: 145, barWidth: 16, barRadius: 4 },
  weeks: ["Week 1", "Week 2", "Week 3", "Week 4"],
  /** the list under the chart (Figma: "What worked") */
  learnedTitle: "Brain learned",
  /** (Figma: "Lead with no-shows", "Shorter intros", "Asking for Thursdays") */
  learned: ["Founders, not marketers", "Seed to Series A", "US only"],
  /** the status line, while Pancake writes the lessons to the Brain, then once it has */
  updating: "Updating Brain...",
  updated: "Brain updated!",
} as const;

export const STORY_LEARNS_ALT: string =
  "Animation: a chart grows week by week over four weeks. Its bars rise and the figure climbs to 56% versus last period. The view moves down to a Brain learned list with three checked lines: Founders, not marketers, Seed to Series A and US only. It closes in on the list while Pancake updates the Brain, then reads Brain updated.";
