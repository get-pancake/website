import type { StorySourcesGlyph } from "./lp-story-sources-data";

/**
 * Deep-dive story "Sources you can trust" — vector art for the stage (owner: story-sources).
 * Path data only, no copy (no strings a reader sees).
 */

/** The "check" icon (Figma component 313:13520), the same path as public/lp/lp-p-check.svg
    (pricing checklist), 24×24 viewBox, filled with --lp-green-30. Inlined: seven ticks, no request,
    crisp under the stage's scale. */
export const STORY_SOURCES_CHECK =
  "M19.6719 6.74023C15.8888 10.172 13.5285 14.1231 12.4111 19.2148L10.502 19.3604C9.39587 16.5018 7.48463 14.777 5.58496 13.9102L6.41504 12.0898C8.15295 12.8828 9.84968 14.2371 11.1436 16.2334C12.5306 11.9122 14.8998 8.36986 18.3281 5.25977L19.6719 6.74023Z";

/** The demo's pointer (components/sections/verticals/VxDemoPlayer.tsx), 18×22 viewBox. */
export const STORY_SOURCES_CURSOR = "M1.5 1.5v16.2l4.3-4.1 2.9 6.6 3-1.3-2.9-6.5h6z";

/** Generic source glyphs for the preview-only "source DB" circles (24×24 viewBox, 1.75 stroke,
    round caps; drawn for this stage). Truth gate: never a platform or data-provider mark. */
export const STORY_SOURCES_GLYPHS: Record<StorySourcesGlyph, string> = {
  /** a post: a card with text lines */
  post: "M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M8 9h8 M8 12.5h8 M8 16h5",
  /** an open role: a briefcase */
  briefcase: "M5 7.5h14a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2z M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5 M3 13h18",
  /** a tech stack: three layers */
  stack: "M12 3.5 3.5 8 12 12.5 20.5 8z M3.5 12 12 16.5 20.5 12 M3.5 16 12 20.5 20.5 16",
  /** funding: a coin */
  coin: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z M14.5 9.25c-.45-.8-1.35-1.25-2.5-1.25-1.4 0-2.5.75-2.5 1.9 0 2.6 5 1.4 5 4.2 0 1.15-1.1 1.9-2.5 1.9-1.15 0-2.05-.45-2.5-1.25 M12 6.5V8 M12 16v1.5",
  /** the web: a globe */
  globe: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z M3 12h18 M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3z",
};
