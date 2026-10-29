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
 * into one near-black dot, flat brand dots, small names under the discs). Then, on that diagram:
 * "Comment garder graphic et ajouter un poil de densité informationnelle a ce motion", around
 * finding the next Play. So the answer has its two halves, which account and which Play, and the
 * context learns from what the Play brings back.
 *
 * The picture, left to right (the END, the rest markup in LpStoryContext.tsx):
 *   - the inputs, on a gentle arc facing the centre: ICP (a flat stop in --lp-green-20), Voice
 *     (a flat stop in --lp-yellow-30) and CRM (the kit's white disc carrying the HubSpot mark, the
 *     unmodified public/lp/vendor-logos/hubspot.svg: docs/public-assets/lp/vendor-logos/README.md);
 *   - the unified context: one plum centre (--lp-ink-100). Each input draws one grey wire into
 *     it: the three are read in one call (the dive's body: "It reads your ICP, your voice and your
 *     CRM in one call, then picks the next account to work and the Play to run.");
 *   - the next best action, on one straight line out of the centre: a loose cluster of nine
 *     small dots in --lp-ink-60 (the brand's disabled tone: the accounts not picked) over the one
 *     account the wire lands on, which turns near-black (the kit's hub colour): which account;
 *     then the line runs on to a Play, a flat --lp-pink-30 stop (the infra card's Tools tone)
 *     carrying a white play mark: which Play, named as the infra card names its Play;
 *   - the loop: one line from the Play's top back over the cluster onto the centre, drawn as
 *     the launch film's hand-drawn arrows are (the founder, pointing at one: "this is on brand"):
 *     one round-ended stroke ending in an open arrowhead. Not the film's little curl: "uniquement
 *     quand elle fait sens et pas sur que ca soit le cas ici". What the Play brings back goes into
 *     the context, which remembers what worked.
 * The words are the kit's small names (story-kit.css .lp-sk-name, 12/16, 500): ICP, Voice and
 * CRM under their inputs; under the line, "Which account" and "Which Play" (one row, in the
 * kicker's ink-80 like the lineage story's group labels) and the Play's name under its own;
 * "Remembers what worked" (ink-80) over the loop's top. Phones hide them, like every kit name:
 * the picture reads without them.
 *
 * Geometry: stage px on the 752×489 design box (the phone stack shows the same box scaled to its
 * column, ×0.455 at 390 px), every part at least 40 px inside its edges. Every wire but the loop
 * is the loved connector: one cubic with horizontal handles, c = 0.426667 × the straight distance
 * between its ends (the formula of lp-story-sources-data.ts:89-93 at 630bb8e, as in
 * lp-story-signals-data.ts), written out here, never computed at render. Each starts on its
 * source's edge (the right edge) with no dot on it (founder 2026-10-28, on the caps over the
 * stops: "ca fait un peu vibe coded"; the best diagrams on Mobbin, Harvest's, Apollo's,
 * OpenPhone's, join a line to its node with nothing on the join) and draws from there; the
 * inputs' wires end in the centre's middle, under the plum, the exit wire in the picked
 * account's middle and the Play's wire in the Play's, each under its dot. The loop starts on
 * the Play's top, under the Play, and is one cubic with vertical handles, (630, 42) and
 * (290, 62), to its tip 12 px over the centre's top, pointing down (the handles that keep its
 * top at y 93.7 and the cluster furthest off it). Its arrowhead: two 9 px strokes at 38° either
 * side of that heading.
 * Placed by hand and checked: every two accounts at least 38 px apart (centres), each at least
 * 43 px off the loop (34 px edge to stroke) and 44 px over the line out. Measured in the page's
 * fonts, the whole picture spans x 66–693 and y 71–429.
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
  /** its wire, from its right edge (x + r, y) into the centre's middle: it draws from its M
      point */
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

/** a free label (kit name style): its text, centred on x, its line box from `top` (16 px tall) */
export type StoryContextLabel = { text: string; x: number; top: number };

export type StoryContextStory = {
  /** the unified context: the plum centre. A resting piece, present from frame 0 */
  center: { x: number; y: number; r: number };
  /** array order = landing order = the wires' draw order */
  inputs: readonly StoryContextInput[];
  /** the cluster and the account picked, present from frame 0; paint order */
  accounts: readonly StoryContextAccount[];
  /** which account: its index in `accounts`, the radius of the near-black dot that grows over
      it, and its label under the line */
  pick: { index: number; r: number; label: StoryContextLabel };
  /** the wire out: from the centre's right edge to the picked account's middle */
  exit: { d: string };
  /** which Play: a flat stop with a white play mark (`mark`, a path), the line on from the
      picked account (from the near-black dot's right edge) into the stop's middle, its label
      under the line and its name under that */
  play: {
    x: number;
    y: number;
    r: number;
    tone: "pink-30";
    mark: string;
    d: string;
    label: StoryContextLabel;
    name: StoryContextLabel;
  };
  /** the loop: from the Play's top, over the cluster, its tip over the centre;
      its open arrowhead (`arrow`); its label over its top */
  loop: { d: string; arrow: string; label: StoryContextLabel };
};

export const STORY_CONTEXT: StoryContextStory = {
  center: { x: 290, y: 244, r: 20 },
  inputs: [
    {
      id: "icp", name: "ICP", kind: "stop", tone: "green-20", x: 126, y: 108, r: 16,
      d: "M142 108C227.759 108 204.241 244 290 244",
    },
    {
      id: "voice", name: "Voice", kind: "stop", tone: "yellow-30", x: 102, y: 244, r: 16,
      d: "M118 244C191.387 244 216.613 244 290 244",
    },
    {
      // the 56 px disc: the HubSpot sprocket drawn at 28 px (the kit's half)
      id: "crm", name: "CRM", kind: "disc", logo: "/lp/vendor-logos/hubspot.svg", x: 126, y: 380, r: 28,
      d: "M154 380C236.062 380 207.938 244 290 244",
    },
  ],
  accounts: [
    { x: 370, y: 160, r: 9 },
    { x: 414, y: 152, r: 9 },
    { x: 458, y: 148, r: 9 },
    { x: 502, y: 154, r: 9 },
    { x: 550, y: 160, r: 9 },
    { x: 394, y: 194, r: 9 },
    { x: 436, y: 190, r: 9 },
    { x: 478, y: 194, r: 9 },
    { x: 520, y: 188, r: 9 },
    { x: 455, y: 244, r: 9 },
  ],
  /** the account on the line, under the cluster. Its label shares the Play label's row (18 + 5
      under the line: the larger dot's gap) */
  pick: { index: 9, r: 12, label: { text: "Which account", x: 455, top: 267 } },
  /** (310, 244) → (455, 244): distance 145, c = 61.867 */
  exit: {
    d: "M310 244C371.867 244 393.133 244 455 244",
  },
  /** (467, 244) → (630, 244): distance 163, c = 69.547. The mark: a 12 × 14 triangle whose
      centroid is the stop's centre */
  play: {
    x: 630, y: 244, r: 18, tone: "pink-30",
    mark: "M626 237L626 251L638 244Z",
    d: "M467 244C536.547 244 560.453 244 630 244",
    label: { text: "Which Play", x: 630, top: 267 },
    name: { text: "Reach warm accounts", x: 630, top: 283 },
  },
  /** its top at y 93.7 (x 462.5): the label's line box ends 6.7 px over it (1 for the stroke,
      the kit's 5 px gap) */
  loop: {
    d: "M630 226C630 42 290 62 290 212",
    arrow: "M295.54 204.91L290 212L284.46 204.91",
    label: { text: "Remembers what worked", x: 462, top: 71 },
  },
};

/** What the animation shows, in the order it plays. The stage is aria-hidden: its words are read
    from here only. */
export const STORY_CONTEXT_ALT: string =
  "Animation: your ICP, your voice and your CRM, shown by the HubSpot mark, each draw a line into one center. One line runs from it to one account among many, which account, then on to which Play: Reach warm accounts. A line loops from the Play back into the center: it remembers what worked.";
