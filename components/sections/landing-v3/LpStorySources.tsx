import type { DiveStageProps } from "./lp-dive-stages";

/**
 * Deep-dive story "Sources you can trust" — the stage markup (Figma 4964:1287 / 1294 / 1311).
 * Owner: story-sources package. Contract: lp-dive-stages.ts (server-safe, one root with
 * data-lp-story="sources" + aria-hidden, rest markup = the END picture, paints nothing behind
 * the scene; geometry in app/_styles/landing-v3/story-sources.css).
 *
 * Phase 0 stub: an empty scene.
 */
export function LpStorySourcesStage({ placeholders }: DiveStageProps) {
  return <div data-lp-story="sources" data-placeholders={placeholders || undefined} aria-hidden="true" />;
}
