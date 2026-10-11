import type { ContentStatus } from "@/lib/placeholders";

/**
 * Deep-dive story "Sources you can trust" — its copy and data (Figma 4964:1287 / 1294 / 1311). Owner: story-sources package.
 * In scripts/homepage-lint.mjs FILES: every string here is linted. Entries that may only show in
 * dev/preview carry `status: "placeholder"` (lib/placeholders.ts ContentStatus) and are gated by
 * the server parent, never by this module.
 *
 * STORY_SOURCES_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label).
 *
 * The story (designer note 4964:1650): "Leads show up / Dolly zoom into one / Lead properties get
 * listed with green ticks / (potential source DBs ?)". Decisions 2026-10-09 §6: option A (Elena
 * Marchetti keeps her real demo signal, "PMM role open", with "PMM role" bold; Figma's card said
 * "Posted about a release", which is another lead's signal), white card, the rows evened out (no
 * 1.6 px slip), the cursor fades after its click, the Tags highlight only the source that found
 * this lead, and the "source DB" circles are preview-only placeholders with generic glyphs.
 *
 * Client-safe literals only: this module must NOT import lib/verticals/home-demo.ts (server data,
 * and validate.ts bans "email", which "Work email" is — true here: the app finds work emails).
 */

/** Signal kinds the Leads table shows (the demo's chip tones, app/_styles/verticals/demo.css). */
export type StorySourcesKind = "hiring" | "stack";

export type StorySourcesLead = {
  initials: string;
  name: string;
  role: string;
  company: string;
  kind: StorySourcesKind;
  /** the chip label (the demo's SIGNAL_LABEL wording) */
  kindLabel: string;
  /** the detail line under the chip */
  signal: string;
};

export type StorySourcesProp = {
  label: string;
  value: string;
  /** the run of `value` set in Geist 700 (the designer's bold-the-matched-term intent) */
  bold?: string;
};

export type StorySourcesTag = {
  label: string;
  /** Figma's chip width at 12 px, px: pinned on the desktop stage so the wrap and every x match
      Figma (the browser's Geist runs ~0.3 px narrower per chip) */
  w: number;
  /** the source that found this lead: the one chip highlighted */
  matched?: boolean;
};

/** Generic source glyphs (lp-story-sources-art.ts) — never a platform or data-provider logo. */
export type StorySourcesGlyph = "post" | "briefcase" | "stack" | "coin" | "globe";

export type StorySourcesDb = {
  id: string;
  /** what the source is (accessible name if a real one ever ships; the stage itself is aria-hidden) */
  label: string;
  /** "placeholder" renders only when the server parent passes placeholders (dev / preview) */
  status: ContentStatus;
  glyph: StorySourcesGlyph;
  /** circle top-left in desktop stage px (Ø 70.711, Figma Ellipse 109–113) */
  x: number;
  y: number;
  /** the glyph's centre and size in desktop stage px: inside the part of the circle the stage clip
      leaves visible (the circles bleed off the stage edges as drawn) */
  gx: number;
  gy: number;
  gs: number;
  /** the wire from this circle to the card: path origin (stage px) + Figma path data, verbatim
      (Vector 344–348; each path STARTS at its circle, so a dash draw reads "source → lead") */
  wire: { x: number; y: number; d: string };
};

export type StorySourcesStory = {
  head: { title: string; sub: string };
  rows: readonly StorySourcesLead[];
  props: readonly StorySourcesProp[];
  tagsLabel: string;
  tags: readonly StorySourcesTag[];
  dbs: readonly StorySourcesDb[];
};

export const STORY_SOURCES: StorySourcesStory = {
  head: {
    title: "Leads",
    /** production VX_DEMO.app.leads.sub (components/sections/verticals/vx-copy.ts), verbatim */
    sub: "The people this Play found and qualified.",
  },
  /** frame 1 = the homepage demo's Leads pane, prompt 2 ("hiring") of lib/verticals/home-demo.ts,
      first three leads. KEEP IN SYNC with home-demo.ts if the demo's leads change (risk R4). */
  rows: [
    { initials: "EM", name: "Elena Marchetti", role: "VP Marketing", company: "Harborlane", kind: "hiring", kindLabel: "Hiring", signal: "PMM role open" },
    { initials: "LF", name: "Leopold Fairbairn", role: "CMO", company: "Parcelry", kind: "hiring", kindLabel: "Hiring", signal: "Head of PMM role" },
    { initials: "RA", name: "Ruth Adeyinka", role: "Head of Growth", company: "Brimstack", kind: "stack", kindLabel: "Stack", signal: "Wistia in job posts" },
  ],
  /** the picked lead's properties (frame 3), each gets a green tick */
  props: [
    // option A (decision §6): Elena's real signal. Figma: "Posted about a release", bold "release"
    { label: "Signal", value: "PMM role open", bold: "PMM role" },
    { label: "Time", value: "Yesterday" },
    { label: "ICP check", value: "Match" },
    { label: "Work email", value: "Found" },
    { label: "Name", value: "Elena Marchetti" },
    { label: "Role", value: "VP Marketing" },
    { label: "Company", value: "Harborlane" },
  ],
  tagsLabel: "Tags",
  /** where Pancake looks; only the source that found this lead is highlighted (Hiring) */
  tags: [
    { label: "Posts", w: 48 },
    { label: "Engagement", w: 88 },
    { label: "Hiring", w: 50, matched: true },
    { label: "Tech stack", w: 77 },
    { label: "Funding", w: 62 },
    { label: "Lookalikes", w: 76 },
    { label: "Web", w: 42 },
  ],
  /** "potential source DBs ?" — Figma frame 3's circles + wires, in reveal order (clockwise from
      the top-left: Ellipse 109, 110, 111, 113, 112 with Vector 345, 346, 347, 348, 344).
      Placeholders: dev/preview only until the founder decides what the sources are (no platform
      logos; naming a data provider needs his OK). */
  dbs: [
    {
      id: "posts", label: "Posts", status: "placeholder", glyph: "post",
      x: -26.613, y: 40.112, gx: 20, gy: 75.5, gs: 24,
      wire: { x: 29.11, y: 116.779, d: "M 0 0 C 0 11.2231 0.6408 37.1995 3.0346 42.6307 C 4.5270 46.0166 6.9197 48.6984 8.7284 50.7199 C 12.4773 53.0884 20.8601 53.5998 36.2452 53.1872 C 45.3855 52.8380 57.2320 52.2047 69.4374 51.5522" },
    },
    {
      id: "hiring", label: "Hiring", status: "placeholder", glyph: "briefcase",
      x: 674.691, y: -20.165, gx: 710.05, gy: 24, gs: 24,
      wire: { x: 645.798, y: 51.62, d: "M 67.8081 0.0041 C 67.8081 -0.0356 67.8081 -0.0753 67.8081 14.5210 C 67.8081 29.1174 67.8081 58.3511 56.6911 73.4767 C 45.5742 88.6023 23.3404 88.7339 0 88.2750" },
    },
    {
      id: "stack", label: "Tech stack", status: "placeholder", glyph: "stack",
      x: 700.293, y: 315.865, gx: 728, gy: 351.22, gs: 24,
      wire: { x: 643.623, y: 248.698, d: "M 82.5210 61.8076 C 82.5980 61.8076 82.6762 41.2700 82.1273 10.0624 C 81.5399 -0.6076 80.3255 -0.7877 66.6787 0.6190 C 53.0319 2.0257 26.9895 5.0246 0 8.4755" },
    },
    {
      id: "funding", label: "Funding", status: "placeholder", glyph: "coin",
      x: 639.336, y: 470.892, gx: 674.69, gy: 480.5, gs: 14,
      wire: { x: 657.123, y: 397.528, d: "M 28.2860 73.3607 C 28.2049 73.4393 28.1643 71.9441 29.4312 67.2619 C 31.7102 58.8386 43.4644 42.1958 55.1551 22.8364 C 59.3400 15.9063 59.4706 14.5525 56.2966 13.4768 C 53.1227 12.4011 46.5109 11.5679 36.8189 9.2639 C 27.1270 6.9598 14.5552 3.2101 0 0" },
    },
    {
      id: "web", label: "Web", status: "placeholder", glyph: "globe",
      x: 44.098, y: 442.858, gx: 79.45, gy: 465, gs: 22,
      wire: { x: 56.309, y: 318.431, d: "M 9.4330 119.8645 C 9.4330 119.9416 9.4330 115.7418 7.9621 101.4798 C 6.9229 91.4033 3.5495 75.7799 1.9130 61.7935 C -1.0941 36.0938 0.1214 22.1008 1.0255 18.9320 C 7.3726 12.5341 22.3383 4.2778 35.4557 0.3210 C 38.3767 -0.1949 40.6864 -0.2582 43.7735 1.4300" },
    },
  ],
};

export const STORY_SOURCES_ALT: string =
  "Animation: a Leads list shows three people this Play found and qualified. The view zooms into Elena Marchetti, VP Marketing at Harborlane, and her details get a green tick one by one: signal, PMM role open; time, yesterday; ICP check, match; work email, found; name, role and company. Tags list where Pancake looks: posts, engagement, hiring, tech stack, funding, lookalikes and the web. Hiring, the source that found her, is highlighted.";
