/**
 * Deep-dive story "signals" (block 2 of 4, "Buying signal + enrichment"; dive title "Buying
 * signals, enriched") — its copy and data. Founder, 2026-10-28: "Pour les 4 blocs je ferai donc
 * 1/ Next best action + Unified GTM context 2/ Buying signal + enrichment 3/ Lead lineage 4/ mcp
 * first", and on the old four: "ban UI things from motions and try to abstract things … graphic
 * simple and on brand (you can reuse components)". The one picture he loves is the old sources
 * story's END: the hub of white discs with each provider's own mark, grey wires into one
 * near-black dot, the five confetti dots and "WHY THEY FIT" over "Just raised". This block IS
 * that hub, nearly verbatim. Build spec: the design panel's §3.2 (2026-10-28).
 *
 * Copied from lp-story-sources-data.ts at 630bb8e (removed with its story the same day): the six
 * providers on their discs, every place and size, every wire, the hub point, the confetti, the
 * label's axis and the reveal order. Dealroom keeps its disc (founder, 2026-10-28). The spec's
 * changes (its §4 item 3):
 *   - the zoomed panel's leftovers go (its edge, the "Profile / View" row, the cut-off body
 *     line) and so does the whole leads-table opening: no UI (founder, above);
 *   - "Just raised" moves from a zoomed 13 px UI label to the display face, 72/72, under the
 *     kicker (the kit's value; the visual judge marked a Geist value as fatal);
 *   - the count label doubles to 26/32 and stays at the top: the loved geometry leaves no lower
 *     slot (Wappalyzer's disc is 17 px under it).
 *
 * Words. "30+ data providers" is the founder's own figure (2026-10-13: "Mets 30+ data provider
 * sur pancake.ai") and the only N+ the lint allows: keep it exactly, in sentence case (the lint's
 * allowance is case-sensitive). "Why they fit" is his approved wording, stored in sentence case:
 * the caps are the kit's text-transform. The value is set in the Condensed trial cut, which has
 * letters, digits and spaces only. The names are the vendors' own spelling: the marks are their
 * trademarks, the unmodified files under public/lp/story-sources/ (see
 * docs/public-assets/lp/story-sources/README.md), never recoloured, redrawn or cropped. No social
 * platform is ever named or drawn here. Why these six: the loved picture's own, six of the data
 * providers the product names to its users (2026-10-13). The two behind a "just raised" lead come
 * first, on the two big discs: Dealroom (funding rounds) and TheirStack (its last-funding date).
 *
 * In scripts/homepage-lint.mjs FILES: every string here is linted. Copy lives in fields named
 * `text` or `name`; the lint skips code keys, so the marks' files are `logo` and the wires' path
 * data is `d`. Never name a copy field after a code key (id, key, kind, type, role, icon, path,
 * url…). Client-safe literals only.
 *
 * STORY_SIGNALS_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label). Keep it in step with the picture.
 */

/** Figma Ellipse 115–120 (the loved hub's six discs) */
export type StorySignalsNodeId = "e115" | "e116" | "e117" | "e118" | "e119" | "e120";

export type StorySignalsNode = {
  id: StorySignalsNodeId;
  /** the data provider, in the vendor's own spelling: written under its disc (above it with
      `nameAbove`) on desktop, so nobody has to recognise a mark. Phones hide it (story-kit.css) */
  name: string;
  /** the vendor's own mark: an unmodified file under /lp/story-sources/, drawn at half the
      disc's width on a white disc (as the app's vendor chip does) */
  logo: string;
  /** disc top-left and diameter, stage px */
  x: number;
  y: number;
  size: number;
  /** reveal order (its wire draws at T.draw[order], lp-story-signals-timeline.ts): the two
      providers behind the funding first, then the four others top to bottom */
  order: number;
  /** the name sits ABOVE the disc (default: under it), where the next disc is too close under */
  nameAbove?: boolean;
  /** painted above the wires (Figma z-order: Ellipse 118) */
  over?: boolean;
  /** start cap: the disc's right magnet (x + size, y + size / 2), stage px */
  cap: { x: number; y: number };
  /** the wire from the cap to the hub point (391, 246.77): one cubic with horizontal handles,
      c = 0.426667 × the distance (sources-v2 §4.6; written out, never computed at render) */
  d: string;
};

export type StorySignalsDot = {
  /** the brand token after `--lp-` (foundation.css) */
  color: "green-20" | "purple-30" | "yellow-30" | "blue-30" | "pink-30";
  /** top-left and diameter, stage px */
  x: number;
  y: number;
  size: number;
};

export type StorySignalsStory = {
  /** the block's claim: the kicker (the kit's spaced caps, 34/40) over the value (the display
      face, 72/72). In its END place from frame 0 (the cue) */
  claim: { kicker: { text: string }; value: { text: string } };
  /** the count, over the providers (the loved hub label at twice its size) */
  label: { text: string };
  /** the hub point, stage px: where every wire lands, 18 px left of the kicker's ink */
  point: { x: number; y: number };
  /** one entry per drawn disc (scripts/placeholder-gate.test.mjs counts them); array order =
      paint order, the `over` disc after the wires */
  nodes: readonly StorySignalsNode[];
  /** the wires' paint order (Figma z-order) */
  wireOrder: readonly StorySignalsNodeId[];
  /** the flat confetti dots (Figma Ellipse 121–125), painted first */
  dots: readonly StorySignalsDot[];
};

export const STORY_SIGNALS: StorySignalsStory = {
  claim: {
    kicker: { text: "Why they fit" },
    value: { text: "Just raised" },
  },
  label: { text: "30+ data providers" },
  point: { x: 391, y: 246.77 },
  /** The loved discs, places and sizes unchanged. Which provider sits on which disc is set by
      room for its name: the shortest names go where the next disc is closest (QA of 2026-10-13
      measured every name against the discs, dots and wires). All final: nothing here is a
      placeholder, so production and previews draw the same six. */
  nodes: [
    {
      id: "e115", name: "Apify", logo: "/lp/story-sources/apify.svg",
      x: 132.965, y: 188.794, size: 74.43, order: 3,
      cap: { x: 207.395, y: 226.009 },
      d: "M207.395 226.009C286.232 226.009 312.163 246.77 391 246.77",
    },
    {
      // the first provider behind the funding (its funding rounds)
      id: "e116", name: "Dealroom", logo: "/lp/story-sources/dealroom.svg",
      x: 58.063, y: 88.794, size: 100, order: 0, nameAbove: true,
      cap: { x: 158.063, y: 138.794 },
      d: "M158.063 138.794C267.608 138.794 281.455 246.77 391 246.77",
    },
    {
      id: "e117", name: "Firecrawl", logo: "/lp/story-sources/firecrawl.png",
      x: 48, y: 285.484, size: 87.727, order: 4,
      cap: { x: 135.727, y: 329.347 },
      d: "M135.727 329.347C250.201 329.347 276.526 246.77 391 246.77",
    },
    {
      id: "e119", name: "Wappalyzer", logo: "/lp/story-sources/wappalyzer.svg",
      x: 226.801, y: 59.665, size: 58.258, order: 2,
      cap: { x: 285.059, y: 88.794 },
      d: "M285.059 88.794C366.215 88.794 309.844 246.77 391 246.77",
    },
    {
      id: "e120", name: "Coresignal", logo: "/lp/story-sources/coresignal.svg",
      x: 108.063, y: 391.644, size: 62.117, order: 5,
      cap: { x: 170.18, y: 422.702 },
      d: "M170.18 422.702C290.644 422.702 270.536 246.77 391 246.77",
    },
    {
      // the second provider behind the funding (its last-funding date)
      id: "e118", name: "TheirStack", logo: "/lp/story-sources/theirstack.svg",
      x: 208.063, y: 334.702, size: 100, order: 1, over: true,
      cap: { x: 308.063, y: 384.702 },
      d: "M308.063 384.702C376.734 384.702 322.329 246.77 391 246.77",
    },
  ],
  wireOrder: ["e115", "e118", "e120", "e117", "e116", "e119"],
  dots: [
    { color: "green-20", x: 56.719, y: 213.137, size: 15.765 },
    { color: "purple-30", x: 214.094, y: 250.352, size: 25.418 },
    { color: "yellow-30", x: 30.238, y: 417.379, size: 28.18 },
    { color: "blue-30", x: -5.227, y: 278.754, size: 28.18 },
    { color: "pink-30", x: -5.227, y: -14.044, size: 40.547 },
  ],
};

/** What the animation shows. It names the six providers: the stage is aria-hidden, so their
    names are read from here only. */
export const STORY_SIGNALS_ALT: string =
  "Animation: beside the words Why they fit, Just raised, six data providers: Dealroom, TheirStack, Wappalyzer, Apify, Firecrawl and Coresignal. A line runs from each into one point beside the words, starting with the two that track funding. Then a label appears: 30+ data providers.";
