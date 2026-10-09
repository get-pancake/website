/**
 * Deep-dive story "Run it from Claude or Codex" — its copy and data (Figma 4964:2575 / 3930 / 3981). Owner: story-claude package.
 * In scripts/homepage-lint.mjs FILES: every string here is linted. Entries that may only show in
 * dev/preview carry `status: "placeholder"` (lib/placeholders.ts ContentStatus) and are gated by
 * the server parent, never by this module.
 *
 * STORY_CLAUDE_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label). Phase 0 stub: empty until written.
 */
export const STORY_CLAUDE_ALT: string = "";
