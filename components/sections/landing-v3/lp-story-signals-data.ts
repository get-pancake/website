/**
 * Deep-dive story "signals" (block 2 of 4, "Buying signal + enrichment"; dive title "Buying
 * signals, enriched") — its copy and its geometry. Founder, 2026-10-28: "Pour les 4 blocs je
 * ferai donc 1/ Next best action + Unified GTM context 2/ Buying signal + enrichment 3/ Lead
 * lineage 4/ mcp first", then "ban UI things from motions and try to abstract things … graphic
 * simple and on brand (you can reuse components)", and on the pictures that followed (a big
 * kicker over a 60–72 px value): "Still a huge text - no UI should not mean text it should mean
 * abstraction of what our infrastructure does".
 *
 * So the picture is what the infrastructure does, as ONE left-to-right flow on the 752×489 box,
 * with no big text:
 *   LEFT    the sources: the hub he loves from the old sources story (removed 2026-10-28 with
 *           lp-story-sources-data.ts, 630bb8e), its six providers on white discs with their own
 *           marks, their names and the flat brand confetti, as one group scaled ×0.9 and moved
 *           (below) so the flow fits the box with its outputs, "30+ data providers" over it;
 *   MIDDLE  Pancake's hub: the near-black point where the six wires land;
 *   RIGHT   what comes out: four short wires fan out of the hub to four brand-coloured stops in
 *           a column, each with its label to its right: Hiring, Funding, Site visits, Work email
 *           (the dive's line: "Find companies hiring, newly funded or visiting your site. Work
 *           emails on demand. 30+ data providers, one bill.", lp-dive-data.ts).
 * The only words are small labels in the kit's name style (12/16, story-kit.css .lp-sk-name):
 * the six names, the four outputs and the count. Phones hide all of them (the stack draws the
 * box at ×0.45): the picture reads without them, six marks into one point, four colours out.
 * Everything but the confetti keeps 40 px from the box's edges, line boxes included (the
 * closest: the count's line box 40.7 px from the top, Coresignal's name's 40.6 px from the
 * bottom).
 *
 * The group. Every disc, name and confetti dot is the loved hub's, at the same relative places:
 * X = 90 + 0.9 · x, Y = 18 + 0.9 · y, sizes × 0.9, from that hub's stage px (Dealroom 58.063 /
 * 88.794 / Ø100, Apify 132.965 / 188.794 / Ø74.43, Firecrawl 48 / 285.484 / Ø87.727, Wappalyzer
 * 226.801 / 59.665 / Ø58.258, Coresignal 108.063 / 391.644 / Ø62.117, TheirStack 208.063 /
 * 334.702 / Ø100; its hub point 391 / 246.77, here 441.9 / 240.093). Why ×0.9: at full size the
 * group alone is 413 px tall from Wappalyzer's disc to Coresignal's name, 4 px more than the
 * box's 409 px of room, and the count needs its own line over it. The names keep the kit's
 * 12 px while the discs close in, so two discs move a few px off the scaled place to keep the
 * names' clearances (measured in the page font, ink to disc or wire): Coresignal 6 right and 1
 * down (Firecrawl's name to its disc 7.0 px; the loved picture 6.2, ×0.9 alone 2.5) and
 * Wappalyzer 7 right and 2 up (its name to Dealroom's wire 14.7 px; loved 14.6, ×0.9 alone
 * 10.0). The confetti move with the group, so the pink and blue dots no longer cross the left
 * edge.
 *
 * The count, "30+ data providers": centred on the loved label's axis (x 175.094 in the loved
 * hub, x 247.585 here), its ink 15 px over Wappalyzer's disc and 25 px over Dealroom's name.
 *
 * The outputs: a column 145 px right of the hub, 72 px apart, centred on the hub's y; each
 * label's line box starts 10 px right of its stop's edge, its 16 px line centred on the stop.
 *
 * The wires: one cubic each with horizontal handles, c = 0.426667 × the straight distance
 * between its ends (the loved formula, sources-v2 §4.6), written out here, never computed at
 * render, each drawn from its source: a provider's from its disc's right magnet (x + size,
 * y + size / 2), the edge itself, into the hub point (no cap dot on the edge since 2026-10-28:
 * the founder, on the dots over the discs, "ca fait un peu vibe coded", and the best diagrams
 * join a line to its node's edge with nothing on it); an output's from the hub point, the
 * near-black dot (r 5.333), to its stop's centre, where the stop covers its end.
 * The loved wires keep their shapes (the formula scales with the group; Wappalyzer's and
 * Coresignal's follow their discs' few px).
 *
 * Words. "30+ data providers" is the founder's own figure (2026-10-13: "Mets 30+ data provider
 * sur pancake.ai") and the only N+ the lint allows: keep it exactly, in sentence case (the lint's
 * allowance is case-sensitive). The four outputs are the dive line's own words. The names are the
 * vendors' own spelling: the marks are their trademarks, the unmodified files under
 * public/lp/story-sources/ (see docs/public-assets/lp/story-sources/README.md), never recoloured,
 * redrawn or cropped. No social platform is ever named or drawn here. Why these six: the loved
 * picture's own, six of the data providers the product names to its users (2026-10-13). The two
 * behind a funding signal come first, on the two big discs: Dealroom (funding rounds) and
 * TheirStack (its last-funding date).
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
  /** the wire from the disc's right magnet (x + size, y + size / 2) to the hub point: one
      cubic with horizontal handles,
      c = 0.426667 × the distance (written out, never computed at render) */
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

/** what comes out of the hub, top to bottom */
export type StorySignalsOutputId = "hiring" | "funding" | "visits" | "email";

export type StorySignalsOutput = {
  id: StorySignalsOutputId;
  /** the signal, in its label right of the stop (the kit's name style); phones hide it */
  text: string;
  /** the stop's brand token after `--lp-` (foundation.css), and the tone of the signal that rides
      out to it (its pulse's --lp-sk-pulse): the colour leaves the hub with the signal */
  color: "green-20" | "yellow-30" | "blue-30" | "purple-30";
  /** the stop's centre, stage px (radius: STORY_SIGNALS.stopR) */
  x: number;
  y: number;
  /** the label's line box, top-left, stage px: 10 px right of the stop's edge, its 16 px line
      centred on the stop's y */
  at: { x: number; y: number };
  /** the wire from the hub point to the stop's centre: one cubic with horizontal handles,
      c = 0.426667 × the distance (written out, never computed at render) */
  d: string;
};

export type StorySignalsStory = {
  /** the count, over the providers: its line box's top-left, stage px (header: on the loved
      label's axis, its ink 15 px over Wappalyzer's disc and 25 px over Dealroom's name) */
  label: { text: string; x: number; y: number };
  /** the hub point, stage px: where every provider's wire lands and every output's starts */
  point: { x: number; y: number };
  /** the providers: one entry per drawn disc (scripts/placeholder-gate.test.mjs counts them);
      array order = paint order, the `over` disc after the wires */
  nodes: readonly StorySignalsNode[];
  /** the providers' wires' paint order (Figma z-order) */
  wireOrder: readonly StorySignalsNodeId[];
  /** the flat confetti dots (Figma Ellipse 121–125), painted first */
  dots: readonly StorySignalsDot[];
  /** the four outputs, top to bottom = their draw order */
  outputs: readonly StorySignalsOutput[];
  /** the outputs' stops' radius: the loved purple confetti dot's Ø25.418 / 2, as the lineage
      story's signal stop */
  stopR: number;
};

export const STORY_SIGNALS: StorySignalsStory = {
  label: { text: "30+ data providers", x: 194.685, y: 40.698 },
  point: { x: 441.9, y: 240.093 },
  /** The loved discs at ×0.9, Coresignal and Wappalyzer a few px off (header). Which provider
      sits on which disc is set by room for its name: the shortest names go where the next disc
      is closest (QA of 2026-10-13 measured every name against the discs, dots and wires). All
      final: nothing here is a placeholder, so production and previews draw the same six. */
  nodes: [
    {
      id: "e115", name: "Apify", logo: "/lp/story-sources/apify.svg",
      x: 209.668, y: 187.915, size: 66.987, order: 3,
      d: "M276.655 221.409C347.609 221.409 370.946 240.093 441.9 240.093",
    },
    {
      // the first provider behind the funding (its funding rounds)
      id: "e116", name: "Dealroom", logo: "/lp/story-sources/dealroom.svg",
      x: 142.257, y: 97.915, size: 90, order: 0, nameAbove: true,
      d: "M232.257 142.915C330.847 142.915 343.31 240.093 441.9 240.093",
    },
    {
      id: "e117", name: "Firecrawl", logo: "/lp/story-sources/firecrawl.png",
      x: 133.2, y: 274.936, size: 78.954, order: 4,
      d: "M212.154 314.413C315.18 314.413 338.874 240.093 441.9 240.093",
    },
    {
      id: "e119", name: "Wappalyzer", logo: "/lp/story-sources/wappalyzer.svg",
      x: 301.121, y: 69.698, size: 52.432, order: 2,
      d: "M353.553 95.914C425.7 95.914 369.753 240.093 441.9 240.093",
    },
    {
      id: "e120", name: "Coresignal", logo: "/lp/story-sources/coresignal.svg",
      x: 193.257, y: 371.48, size: 55.905, order: 5,
      d: "M249.162 399.433C355.86 399.433 335.202 240.093 441.9 240.093",
    },
    {
      // the second provider behind the funding (its last-funding date)
      id: "e118", name: "TheirStack", logo: "/lp/story-sources/theirstack.svg",
      x: 277.257, y: 319.232, size: 90, order: 1, over: true,
      d: "M367.257 364.232C429.061 364.232 380.096 240.093 441.9 240.093",
    },
  ],
  wireOrder: ["e115", "e118", "e120", "e117", "e116", "e119"],
  dots: [
    { color: "green-20", x: 141.047, y: 209.823, size: 14.189 },
    { color: "purple-30", x: 282.685, y: 243.317, size: 22.876 },
    { color: "yellow-30", x: 117.214, y: 393.641, size: 25.362 },
    { color: "blue-30", x: 85.296, y: 268.879, size: 25.362 },
    { color: "pink-30", x: 85.296, y: 5.36, size: 36.492 },
  ],
  /** a column 145 px right of the hub, 72 px apart, centred on the hub's y */
  outputs: [
    {
      id: "hiring", text: "Hiring", color: "green-20", x: 586.9, y: 132.093,
      at: { x: 609.609, y: 124.093 },
      d: "M441.9 240.093C519.042 240.093 509.758 132.093 586.9 132.093",
    },
    {
      id: "funding", text: "Funding", color: "yellow-30", x: 586.9, y: 204.093,
      at: { x: 609.609, y: 196.093 },
      d: "M441.9 240.093C505.645 240.093 523.155 204.093 586.9 204.093",
    },
    {
      id: "visits", text: "Site visits", color: "blue-30", x: 586.9, y: 276.093,
      at: { x: 609.609, y: 268.093 },
      d: "M441.9 240.093C505.645 240.093 523.155 276.093 586.9 276.093",
    },
    {
      id: "email", text: "Work email", color: "purple-30", x: 586.9, y: 348.093,
      at: { x: 609.609, y: 340.093 },
      d: "M441.9 240.093C519.042 240.093 509.758 348.093 586.9 348.093",
    },
  ],
  stopR: 12.709,
};

/** What the animation shows. It names the six providers and the four outputs: the stage is
    aria-hidden, so their names are read from here only. Since 2026-10-30 the data rides the lines
    in and four signals ride out and light their stops (lp-story-signals-timeline.ts). */
export const STORY_SIGNALS_ALT: string =
  "Animation: six data providers, Dealroom, TheirStack, Wappalyzer, Apify, Firecrawl and Coresignal, each draw a line into one point and send their data along it. From that point, four signals run out one after another and light up Hiring, Funding, Site visits and Work email. A label reads 30+ data providers.";
