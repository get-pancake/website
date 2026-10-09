/**
 * Deep-dive story "Pancake learns from what wins" — its copy and data (Figma 4964:2021 / 2404 / 2448 / 2490 / 4052). Owner: story-learns package.
 * In scripts/homepage-lint.mjs FILES: every string here is linted. Entries that may only show in
 * dev/preview carry `status: "placeholder"` (lib/placeholders.ts ContentStatus) and are gated by
 * the server parent, never by this module.
 *
 * STORY_LEARNS_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label). Phase 0 stub: empty until written.
 */
export const STORY_LEARNS_ALT: string = "";
