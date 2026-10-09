/**
 * Deep-dive story "A personal message for every lead" — its copy and data (Figma 4964:1469 / 1471 / 1729 / 1821 / 1899). Owner: story-message package.
 * In scripts/homepage-lint.mjs FILES: every string here is linted. Entries that may only show in
 * dev/preview carry `status: "placeholder"` (lib/placeholders.ts ContentStatus) and are gated by
 * the server parent, never by this module.
 *
 * STORY_MESSAGE_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label). Phase 0 stub: empty until written.
 */
export const STORY_MESSAGE_ALT: string = "";
