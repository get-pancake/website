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
 * As drawn (founder 2026-10-12). The storyboard is production's old "learns" card redrawn for the
 * stage: a chart reading "56% vs last period", then "What worked" with "Lead with no-shows /
 * Shorter intros / Asking for Thursdays", then "Updating Brain..." and "Brain updated!". Every
 * string is the designer's. A first build relabelled the chart "leads approved" and the list
 * "Brain learned" with audience lessons (the 2026-10-07 truth pass's wording); the founder asked
 * for the designer's version: he had kept this chart on production on 2026-10-08, and "what
 * worked is good".
 *
 * 2026-10-13 (founder: "big audit on copies and motions … stick to our narrative and be crystal
 * clear"). Two strings change, nothing else:
 *   - the figure says what it measures, as the production card he kept did ("+56% reply rate vs
 *     last period"): a "+" before the figure and "reply rate" in its caption. Drawn bare, "56%"
 *     read as a rate of something unnamed;
 *   - the first lesson is the page's story (Acme writes to founders who just raised): "Lead with
 *     the seed round", for the designer's filler "Lead with no-shows". The two others already
 *     fit it (the messages ask for a call on Thursday).
 */

export const LEARNS = {
  /** the chart: where the count starts, what it shows at Figma frame 1 and where it lands, in % */
  share: { start: 0, frame1: 26, end: 56 },
  /** the figure is a change, not a rate: it carries its sign (the count ticks "+0%" … "+56%") */
  sharePrefix: "+",
  /** under the figure, set in caps by the CSS: what it measures, then the storyboard's words */
  shareLabel: "reply rate vs last period",
  /** twelve bars, three a week, on a 451×145 plot: heights in px (Figma frame 2) and left
      edges (16 wide, spread edge to edge: (451 − 16) / 11 apart) */
  bars: [40, 48, 40, 47, 68, 76, 85, 69, 101, 76, 118, 145],
  barX: [0, 39.545, 79.091, 118.636, 158.182, 197.727, 237.273, 276.818, 316.364, 355.909, 395.455, 435],
  plot: { width: 451, height: 145, barWidth: 16, barRadius: 4 },
  weeks: ["Week 1", "Week 2", "Week 3", "Week 4"],
  /** the list under the chart, as drawn */
  learnedTitle: "What worked",
  learned: ["Lead with the seed round", "Shorter intros", "Asking for Thursdays"],
  /** the status line, while Pancake writes the lessons to the Brain, then once it has */
  updating: "Updating Brain...",
  updated: "Brain updated!",
} as const;

export const STORY_LEARNS_ALT: string =
  "Animation: a chart of the reply rate grows week by week over four weeks. Its bars rise and the figure climbs to plus 56% versus last period. The view moves down to a What worked list with three checked lines: Lead with the seed round, Shorter intros and Asking for Thursdays. It closes in on the list while Pancake updates the Brain, then reads Brain updated.";
