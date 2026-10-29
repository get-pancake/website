/**
 * Deep-dive story "context" — block 1 of the four, "Your agent knows what to do next" (founder
 * 2026-10-28: "Pour les 4 blocs je ferai donc 1/ Next best action + Unified GTM context 2/ Buying
 * signal + enrichment 3/ Lead lineage 4/ mcp first"), its words and its geometry.
 *
 * The founder's asks, in order: "ban UI things from motions and try to abstract things we re
 * talking about being graphic simple and on brand (you can reuse components)"; on the opening
 * that zoomed the claim to fill the stage: "this is not motion like it's plain text"; on the
 * pictures that followed (a big kicker over a 60–72 px value): "Still a huge text - no UI should
 * not mean text it should mean abstraction of what our infrastructure does". So this block draws
 * what the infrastructure does, with no claim in the picture, in the parts of the one picture he
 * loves (the old sources hub: white discs carrying each provider's own mark, grey wires drawing
 * into one near-black dot, flat brand dots, small names under the discs).
 *
 * The picture, left to right (the END, the rest markup in LpStoryContext.tsx):
 *   - the inputs, on a gentle arc facing the centre: ICP (a flat stop in --lp-green-20), Voice
 *     (a flat stop in --lp-yellow-30) and CRM (the kit's white disc carrying the HubSpot mark, the
 *     unmodified public/lp/vendor-logos/hubspot.svg: docs/public-assets/lp/vendor-logos/README.md);
 *   - the unified context: one plum centre (--lp-ink-100). Each input draws one grey wire into
 *     it: the three are read in one call (the dive's body: "It reads your ICP, your voice and your
 *     CRM in one call, then picks the next account to work and the Play to run.");
 *   - the accounts: a loose cluster of ten small dots in --lp-ink-60 (the brand's disabled tone:
 *     the accounts not picked). One wire leaves the centre and lands on one of them, over which a
 *     near-black dot grows (the kit's hub colour): the next best action.
 * The only words are four small labels in the kit's name style (story-kit.css .lp-sk-name, 12/16,
 * 500): ICP, Voice and CRM under their inputs, "Next best action" over the picked account. Phones
 * hide them, like every kit name: the picture reads without them.
 *
 * Geometry: stage px on the 752×489 design box (the phone stack shows the same box scaled to its
 * column, ×0.455 at 390 px), every part at least 40 px inside its edges. Every wire is the loved
 * connector: one cubic with horizontal handles, c = 0.426667 × the straight distance between its
 * ends (the formula of lp-story-sources-data.ts:89-93 at 630bb8e, as in lp-story-signals-data.ts),
 * written out here, never computed at render. Each starts on a cap (the kit's .lp-sk-cap,
 * r 5.333) at its source's right edge and draws from there; an input's wire ends in the centre's
 * middle, under the plum, and the exit wire in the picked account's middle, under its near-black
 * dot. The cluster is placed by hand: every two accounts at least 38 px apart (centres), each
 * about 30 px or more clear of the exit wire's line. Measured in the page's fonts, the whole
 * picture spans x 86–677 and y 82–419.
 *
 * In scripts/homepage-lint.mjs FILES: every string here is linted. Words live in fields named
 * `name` or `text`; the mark sits under `logo`, the wires under `d`, the tones under `tone` and an
 * input's shape under `kind`, code keys the lint skips. Never name a copy field after a code key
 * (id, key, kind, type, role, icon, path, url…).
 *
 * STORY_CONTEXT_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label). Keep it in step with the picture.
 *
 * Client-safe literals only: no import (the timeline reads what it needs from the markup).
 */

/** an input, in its landing order */
export type StoryContextInputId = "icp" | "voice" | "crm";

export type StoryContextInput = {
  id: StoryContextInputId;
  /** its label, centred under it */
  name: string;
  /** its centre and radius, stage px (a disc's diameter is 2r) */
  x: number;
  y: number;
  r: number;
  /** its wire's start cap, on its right edge (x + r, y) */
  cap: { x: number; y: number };
  /** its wire, from the cap into the centre's middle: it draws from its M point */
  d: string;
} & (
  | {
      /** a flat stop in a brand tone (the token after `--lp-`, foundation.css) */
      kind: "stop";
      tone: "green-20" | "yellow-30";
    }
  | {
      /** the kit's white disc carrying the vendor's own file, unmodified, at half its width */
      kind: "disc";
      logo: string;
    }
);

/** an account: a small dot, centre and radius, stage px */
export type StoryContextAccount = { x: number; y: number; r: number };

export type StoryContextStory = {
  /** the unified context: the plum centre. A resting piece, present from frame 0 */
  center: { x: number; y: number; r: number };
  /** array order = landing order = the wires' draw order */
  inputs: readonly StoryContextInput[];
  /** the cluster, present from frame 0; paint order */
  accounts: readonly StoryContextAccount[];
  /** the next best action: which account (its index in `accounts`), the radius of the near-black
      dot that grows over it, and its label, centred over that dot */
  pick: { index: number; r: number; text: string };
  /** the one wire out: from the cap on the centre's right edge to the picked account's middle */
  exit: { cap: { x: number; y: number }; d: string };
};

export const STORY_CONTEXT: StoryContextStory = {
  center: { x: 334, y: 234, r: 20 },
  inputs: [
    {
      id: "icp", name: "ICP", kind: "stop", tone: "green-20", x: 126, y: 98, r: 16,
      cap: { x: 142, y: 98 },
      d: "M142 98C242.389 98 233.611 234 334 234",
    },
    {
      id: "voice", name: "Voice", kind: "stop", tone: "yellow-30", x: 102, y: 234, r: 16,
      cap: { x: 118, y: 234 },
      d: "M118 234C210.16 234 241.84 234 334 234",
    },
    {
      // the 56 px disc: the HubSpot sprocket drawn at 28 px (the kit's half)
      id: "crm", name: "CRM", kind: "disc", logo: "/lp/vendor-logos/hubspot.svg", x: 126, y: 370, r: 28,
      cap: { x: 154, y: 370 },
      d: "M154 370C250.257 370 237.743 234 334 234",
    },
  ],
  accounts: [
    { x: 588, y: 186, r: 9 },
    { x: 630, y: 193, r: 9 },
    { x: 568, y: 226, r: 9 },
    { x: 608, y: 224, r: 9 },
    { x: 649, y: 232, r: 9 },
    { x: 586, y: 262, r: 9 },
    { x: 628, y: 266, r: 9 },
    { x: 668, y: 274, r: 9 },
    { x: 606, y: 302, r: 9 },
    { x: 648, y: 308, r: 9 },
  ],
  /** the cluster's top-left account, where the wire arrives. Its label's line box (y 153–169, the
      text x 541.8–634.2 in the page's font) is 15 px over the account to its right (top 184) and
      5 px over the near-black dot (top 174), the kit's gap under a name, mirrored */
  pick: { index: 0, r: 12, text: "Next best action" },
  /** (354, 234) → (588, 186): distance 238.872, c = 101.919 */
  exit: {
    cap: { x: 354, y: 234 },
    d: "M354 234C455.919 234 486.081 186 588 186",
  },
};

/** What the animation shows, in the order it plays. The stage is aria-hidden: its words are read
    from here only. */
export const STORY_CONTEXT_ALT: string =
  "Animation: your ICP, your voice and your CRM, shown by the HubSpot mark, each draw a line into one center. One line runs from it to one account among many: the next best action.";
