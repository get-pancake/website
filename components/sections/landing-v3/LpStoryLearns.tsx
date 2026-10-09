import type { DiveStageProps } from "./lp-dive-stages";

/**
 * Deep-dive story "Pancake learns from what wins" — the stage markup (Figma 4964:2021 / 2404 / 2448 / 2490 / 4052).
 * Owner: story-learns package. Contract: lp-dive-stages.ts (server-safe, one root with
 * data-lp-story="learns" + aria-hidden, rest markup = the END picture, paints nothing behind
 * the scene; geometry in app/_styles/landing-v3/story-learns.css).
 *
 * Phase 0 stub: an empty scene.
 */
export function LpStoryLearnsStage({ placeholders }: DiveStageProps) {
  return <div data-lp-story="learns" data-placeholders={placeholders || undefined} aria-hidden="true" />;
}
