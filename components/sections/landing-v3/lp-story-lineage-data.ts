/**
 * Deep-dive story 3, "Where every lead came from" ("Lead lineage") — its words and its geometry.
 * Owner: story-lineage package (2026-10-28). Contract: lp-dive-stages.ts; the final build spec
 * of 2026-10-28, §3.0 (the shared kit and its verbs) and §3.3 (this story).
 *
 * The founder's four blocks for the section (2026-10-28): "Pour les 4 blocs je ferai donc 1/
 * Next best action + Unified GTM context 2/ Buying signal + enrichment 3/ Lead lineage 4/ mcp
 * first", with no UI in the motions: "ban UI things from motions and try to abstract things …
 * graphic simple and on brand (you can reuse components)". Drawn in the parts of the one
 * picture he loves, the old sources story's end hub (story-kit.css): white disc, grey wire with
 * its cap, near-black dot, a confetti colour, spaced caps over a big value. Here it is ONE
 * trace that runs back from a lead to the signal that found her, then on to that signal's
 * source (Mobbin: Qatalog 90b2e510-2ae2-41fd-89c3-d7b815dfac79, one path through its nodes;
 * Joby Aviation c0ccdeed-d21d-46be-adf1-1a5cf4561265, one line drawn back to its origin).
 *
 * The END picture (the rest markup, LpStoryLineage.tsx), stage px on the 752×489 box:
 *   - the lead: the page's cast, Tamsin Okafor (Founder & CEO at Quillfern, the steps' lead:
 *     lp-step-data.ts SX_LEADS and S3_THREAD). KEEP IN SYNC if that cast changes. A near-black
 *     dot (the loved hub dot) and her name beside it, in the loved names' weight (500) at 32/40;
 *   - the signal: a purple stop, the loved purple confetti dot's size (Ø25.418) and colour
 *     (purple-30, story-lineage.css: signals sit in the infra section's purple Data card). The
 *     kicker is his wording, "Which signal"; the value is the Play's own signal ("Hiring a
 *     marketing lead": the hero demo's Play "Funded startups hiring a marketing lead",
 *     lp-step-data.ts S1_ROWS "Best signal");
 *   - the source: TheirStack, the provider behind the product's hiring signals ("Find companies
 *     hiring for roles your product can replace or support"), its own unmodified mark on a
 *     white disc (SkDisc), with NO name under it, so the picture keeps three words (the ALT
 *     names it; a 12 px name can come on the founder's word);
 *   - the trace: two wires in the loved formula (one cubic with horizontal handles,
 *     c = 0.426667 × the straight distance, lp-story-sources-data.ts:89-93 at 630bb8e; written
 *     out, never computed at render): from the lead's dot to the stop, then from the stop to
 *     the disc's right magnet (x + size, y + size / 2), where the cap lands.
 * Clearances (spec §3.3, measured in the page's fonts): the trace is 23.5 px from the name and
 * 37.1 px from the kicker; all type is at least 52 px from the stage's edges.
 *
 * In scripts/homepage-lint.mjs FILES: every string here is linted. Words live in fields named
 * `text` or `name`, never under a code key the lint skips (id, key, kind, type, role, icon,
 * path, url…); the wires sit under `d` and the mark under `logo`, two keys it skips on purpose.
 * The kicker is stored in sentence case: the caps are the kit's (text-transform). US spelling.
 * The display face's trial cut has letters, digits and spaces only (story-kit.css T5): the
 * value never carries + ’ ( · % !.
 *
 * STORY_LINEAGE_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label).
 */

export type StoryLineagePoint = { x: number; y: number };

/** an SVG dot: centre and radius, stage px */
export type StoryLineageDot = StoryLineagePoint & { r: number };

export type StoryLineageTrace = {
  /** the lead → the signal, then the signal → the source (the draw order) */
  id: "signal" | "source";
  /** one cubic from the wire's start (where it draws from) to its end */
  d: string;
};

export type StoryLineageStory = {
  /** the claim, in its END place from frame 0: a line box's top-left each, stage px. The kicker's
      ink starts on the stop's left edge (x 287.291); the value's top is the kicker's + 64 */
  kicker: { text: string; x: number; y: number };
  value: { text: string; x: number; y: number };
  /** the lead: her name's line box (its caps' middle on the dot's y, its ink from x 486 to
      699.9) and her dot, where the trace starts */
  lead: { name: string; x: number; y: number; dot: StoryLineageDot };
  /** the purple stop the trace passes through */
  signal: StoryLineageDot;
  /** the source: its disc (top-left, diameter), the vendor's own file, and the cap on the
      disc's right magnet, where the trace ends */
  source: { logo: string; x: number; y: number; size: number; cap: StoryLineageDot };
  /** paint order = draw order */
  traces: readonly StoryLineageTrace[];
};

export const STORY_LINEAGE: StoryLineageStory = {
  kicker: { text: "Which signal", x: 286.001, y: 233.389 },
  /** two lines (white-space: pre), 64/64: "marketing lead" is the longer, 367.05 wide */
  value: { text: "Hiring a\nmarketing lead", x: 283.831, y: 297.389 },
  lead: {
    name: "Tamsin Okafor",
    x: 485.63,
    y: 80.115,
    /** r = SK_CAP_R (lp-story-kit.ts): the loved hub dot */
    dot: { x: 468, y: 100, r: 5.333 },
  },
  /** r = the loved purple confetti dot's Ø25.418 / 2 */
  signal: { x: 300, y: 200, r: 12.709 },
  source: {
    logo: "/lp/story-sources/theirstack.svg",
    x: 48,
    y: 274,
    size: 112,
    /** r = SK_CAP_R */
    cap: { x: 160, y: 330, r: 5.333 },
  },
  traces: [
    { id: "signal", d: "M468 100C384.583 100 383.417 200 300 200" },
    { id: "source", d: "M300 200C218.485 200 241.515 330 160 330" },
  ],
};

export const STORY_LINEAGE_ALT: string =
  "Animation: a lead, Tamsin Okafor, appears above the words Which signal, Hiring a marketing lead. A line traces back from her to the signal that found her, then on to its source, the TheirStack mark.";
