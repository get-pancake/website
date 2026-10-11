/**
 * Deep-dive story "Pancake learns from what wins" — its copy and data (Figma 4964:2021 / 2404 / 2448 / 2490 / 4052). Owner: story-learns package.
 * In scripts/homepage-lint.mjs FILES: every string here is linted. Entries that may only show in
 * dev/preview carry `status: "placeholder"` (lib/placeholders.ts ContentStatus) and are gated by
 * the server parent, never by this module.
 *
 * STORY_LEARNS_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label).
 *
 * Truth (decision 2026-10-09 §6, option b): V2 drew "Reply rate 93% / 12% / 80% / 56%" with
 * Strong / Weak / Medium. The app has no reply-rate verdict and no "Medium": a signal reads Strong
 * at a 👍 share of 70% or more and Weak at 40% or less, from 3 verdicts, and stays unlabeled in
 * between (pancake-cmo apps/frontend/src/features/settings/signal-performance.ts). So each Play
 * row shows the share of its leads you approved, labeled by those thresholds; the in-between row
 * has no label. The four Play names replace V2's placeholder (one name x4); the weak one is the
 * product-marketer Play and the strong ones are founders and freshly funded teams, so the
 * "Brain learned" chips of the end picture follow from the list.
 */

/** how a row's value is painted and labeled once the two months have passed */
export type LearnsTone = "strong" | "weak" | "none";

export type LearnsRow = {
  /** the Play's name */
  name: string;
  /** share of approved leads at the cue (all rows start equal and unlabeled), in % */
  start: number;
  /** share after two months (frame 2), in % */
  end: number;
  tone: LearnsTone;
  /** the value box width at rest, px (Figma rounds its auto-width text boxes: 93% 30, 12% 26) */
  valueWidth: number;
  /** lifts out of the list and drops into the brain (true) or slides away (false) */
  winner: boolean;
};

/** the app's labels (signal-performance.ts SIGNAL_TONE_LABEL); in between = no label */
export const LEARNS_STATUS: Record<LearnsTone, string> = {
  strong: "Strong",
  weak: "Weak",
  none: "",
};

export const LEARNS = {
  title: "Plays",
  /** the share of a Play's reviewed leads that got a 👍 */
  rateLabel: "Approved",
  /** value box width at the cue ("50%"), px */
  cueValueWidth: 30,
  rows: [
    { name: "Founders about to launch", start: 50, end: 93, tone: "strong", valueWidth: 30, winner: true },
    { name: "SaaS companies hiring a product marketer", start: 50, end: 12, tone: "weak", valueWidth: 26, winner: false },
    { name: "Teams that just raised", start: 50, end: 80, tone: "strong", valueWidth: 30, winner: true },
    { name: "Companies hiring an SDR", start: 50, end: 56, tone: "none", valueWidth: 30, winner: false },
  ] satisfies readonly LearnsRow[],
  /** the month axis: strip index k = -1…4 (the cue shows oct/nov/dec on the three majors, the
      list two months later dec/jan/feb). dx = the label's left offset from its tick on the
      752 design (Figma's text boxes; dec splits Figma's -11.449 / -12.551 by ±0.55) */
  months: [
    { label: "sep", dx: -10 },
    { label: "oct", dx: -12.551 },
    { label: "nov", dx: -8.992 },
    { label: "dec", dx: -12 },
    { label: "jan", dx: -8.992 },
    { label: "feb", dx: -11.449 },
  ],
  brainLabel: "Brain",
  /* end picture (production f4's cards, copy truth-passed 2026-10-07) */
  learnedTitle: "Brain learned",
  learned: ["Founders, not marketers", "Seed to Series A", "US only"],
  updatedTitle: "Brain updated",
  updatedSub: "Your next search starts from it.",
} as const;

export const STORY_LEARNS_ALT: string =
  "Animation: four Plays in a list, each with the share of its leads you approved. Two months pass on a timeline: two Plays pull ahead and are marked Strong, one falls to Weak and one stays unlabeled in between. The two strong Plays lift out of the list, the others slide away, and both drop into the brain. Then a Brain learned card lists Founders, not marketers, Seed to Series A and US only, and a Brain updated card says your next search starts from it.";
