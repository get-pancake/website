import type { StorySourcesPropId } from "./lp-story-sources-data";

/**
 * Deep-dive story "Sources you can trust" — vector art for the stage (owner: story-sources).
 * Path data only, no copy (no strings a reader sees), so this file is not in homepage-lint.
 * Storyboard of 2026-10-11 (Figma 4964:1287 / 5024:7457 / 5024:7601 / 5024:8172,
 * specs/updates/sources-v2.md §4, §10.5).
 *
 * The hub's discs carry NO art from here: each shows its data provider's own mark, an unmodified
 * file under public/lp/story-sources/ (a trademark is never redrawn as path data). The generic
 * source glyphs this file held until 2026-10-13 went with the placeholder discs.
 */

/** The hand cursor (Figma instance 5024:7594 "State=Hand", 30×30 box). `shape` is drawn at
    translate(3 3): white fill, #171717 1.125 round stroke; `knuckles` in box coordinates, #171717
    1.5 round. Hot spot (fingertip) ≈ box (9.5, 3). */
export const STORY_SOURCES_HAND = {
  shape:
    "M4.246 18.71C3.829 18.145 3.323 16.992 2.422 15.591C1.911 14.799.644 13.307.267 12.549C-.06 11.88-.025 11.579.053 11.025C.191 10.037 1.136 9.269 2.144 9.373C2.906 9.45 3.552 9.989 4.133 10.498C4.484 10.805 4.915 11.4 5.175 11.737C5.414 12.045 5.473 12.172 5.728 12.537C6.066 13.019 6.171 13.258 6.042 12.727C5.938 11.947 5.768 10.616 5.521 9.439C5.333 8.546 5.288 8.406 5.109 7.72C4.92 6.991 4.823 6.48 4.645 5.707C4.522 5.16 4.3 4.042 4.24 3.413C4.156 2.554 4.112 1.151 4.627.507C5.031.002 5.957-.15 6.531.161C7.282.568 7.71 1.738 7.905 2.205C8.256 3.044 8.473 4.014 8.662 5.287C8.903 6.908 9.346 9.157 9.361 9.63C9.396 9.05 9.261 7.829 9.355 7.272C9.44 6.768 9.836 6.182 10.332 6.023C10.752 5.889 11.244 5.84 11.677 5.936C12.136 6.037 12.62 6.389 12.801 6.721C13.332 7.702 13.343 9.706 13.365 9.599C13.491 9.008 13.469 7.667 13.781 7.109C13.987 6.741 14.511 6.409 14.79 6.356C15.221 6.274 15.751 6.249 16.204 6.343C16.57 6.42 17.065 6.886 17.198 7.109C17.518 7.65 17.7 9.179 17.754 9.715C17.776 9.937 17.863 9.099 18.184 8.558C18.78 7.554 20.889 7.359 20.97 9.563C21.007 10.591 20.999 10.544 20.999 11.235C20.999 12.048 20.982 12.537 20.941 13.125C20.895 13.753 20.769 15.174 20.586 15.863C20.459 16.336 20.041 17.4 19.629 18.038C19.629 18.038 18.052 20.003 17.881 20.888C17.707 21.772 17.765 21.778 17.731 22.405C17.697 23.031 17.908 23.854 17.908 23.854C17.908 23.854 16.731 24.018 16.097 23.909C15.523 23.81 14.813 22.587 14.63 22.213C14.377 21.698 13.839 21.797 13.629 22.177C13.298 22.779 12.588 23.859 12.086 23.927C11.106 24.059 9.072 23.975 7.479 23.958C7.479 23.958 7.751 22.369 7.146 21.824C6.698 21.416 5.928 20.591 5.467 20.157L4.246 18.71Z",
  knuckles: "M12.75 17.25v4.5M15.75 17.25v4.5M18.75 17.25v4.5",
} as const;

/** The quick-link tile after each lead's name: a 10.667 square at (2.668, 2.797) in a 16 box, in
    --lp-blue-40. Figma draws a platform's mark in it; ours is the same tile with a neutral
    "open" arrow (never a platform logo: founder rule 2026-09-23). */
export const STORY_SOURCES_TILE = {
  square:
    "M1.345 0h7.976c.753 0 1.346.592 1.346 1.345v7.976c0 .753-.593 1.346-1.346 1.346H1.345C.592 10.667 0 10.074 0 9.321V1.345C0 .592.592 0 1.345 0z",
  arrow: "M3.55 7.12 7.12 3.55M4.25 3.55h2.87v2.87",
} as const;

/** "Add to sequence"'s plus (Figma 13.333 box, filled). */
export const STORY_SOURCES_PLUS = "M7.5 5.833h5.833V7.5H7.5v5.833H5.833V7.5H0V5.833h5.833V0H7.5v5.833z";

/** Line icons of the lead's property grid (24 grid, stroke only, round caps and joins): the
    rebuilt rows of the app's lead sheet, which Figma pasted as a raster (image 43). */
export const STORY_SOURCES_ICONS: Record<StorySourcesPropId | "search" | "out", string> = {
  /** Industry: buildings */
  industry: "M3 21h18M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M14 9h4a1 1 0 0 1 1 1v11M8 8h3M8 12h3M8 16h3",
  /** Location: a pin */
  location: "M12 21.5s-7-5.9-7-11.6a7 7 0 0 1 14 0c0 5.7-7 11.6-7 11.6zM9.4 10a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0-5.2 0z",
  /** Seniority: an id card */
  seniority:
    "M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM14.5 10.5H18M14.5 14H18M6 16c.5-1.5 1.5-2.3 2.8-2.3s2.3.8 2.8 2.3M6.9 10.6a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0-3.8 0z",
  /** Profile: a person in a circle (Figma's row carries a platform's mark and name) */
  profile:
    "M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0zM9 10a3 3 0 1 0 6 0a3 3 0 1 0-6 0zM6.2 18.4c1.2-2.4 3.3-3.6 5.8-3.6s4.6 1.2 5.8 3.6",
  /** Email: an envelope */
  email: "M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3.5 7.5l8.5 6 8.5-6",
  /** the "Find email" chip's magnifier */
  search: "M4.5 10.5a6 6 0 1 0 12 0a6 6 0 1 0-12 0zM15 15l5 5",
  /** "View": an arrow out of a box */
  out: "M14 4h6v6M20 4l-8.5 8.5M18 13.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5.5",
};
