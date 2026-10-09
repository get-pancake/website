import type { DiveStageProps } from "./lp-dive-stages";

/**
 * Deep-dive story "Run it from Claude or Codex" — the stage markup (Figma 4964:2575 / 3930 / 3981).
 * Owner: story-claude package. Contract: lp-dive-stages.ts (server-safe, one root with
 * data-lp-story="claude" + aria-hidden, rest markup = the END picture, paints nothing behind
 * the scene; geometry in app/_styles/landing-v3/story-claude.css).
 *
 * Phase 0 stub: an empty scene.
 */
export function LpStoryClaudeStage({ placeholders }: DiveStageProps) {
  return <div data-lp-story="claude" data-placeholders={placeholders || undefined} aria-hidden="true" />;
}
