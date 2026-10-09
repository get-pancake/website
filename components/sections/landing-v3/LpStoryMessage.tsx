import type { DiveStageProps } from "./lp-dive-stages";

/**
 * Deep-dive story "A personal message for every lead" — the stage markup (Figma 4964:1469 / 1471 / 1729 / 1821 / 1899).
 * Owner: story-message package. Contract: lp-dive-stages.ts (server-safe, one root with
 * data-lp-story="message" + aria-hidden, rest markup = the END picture, paints nothing behind
 * the scene; geometry in app/_styles/landing-v3/story-message.css).
 *
 * Phase 0 stub: an empty scene.
 */
export function LpStoryMessageStage({ placeholders }: DiveStageProps) {
  return <div data-lp-story="message" data-placeholders={placeholders || undefined} aria-hidden="true" />;
}
