/* Data for the three "Pancake fills your pipeline" step animations — every
   number and string verbatim from the pancake-studio compositions the mp4s
   were rendered from (shorts/brain-research-loop, pipeline-checklist-loop,
   meetings-calendar-loop, 464×426 design frames). Shared by the markup
   (LpStepMocks.tsx, which lays the rest state = the composition's frame 0) and
   the timelines (lp-step-timelines.ts), so both walk the same lists in the
   same order. */

/* ── step 01 · the knowledge graph (coordinates from the designer's
   step-1-brain.svg, hub by hub, as the composition builds them) ── */

export const S1_CENTER = { x: 246.5, y: 202.92 };

/** [edgeX, edgeY, dotX, dotY]; edgeX null = a dot without an edge;
    two entries = an edge without a dot (the SVG has one such line) */
export type S1Leaf = [number, number] | [number, number, number, number] | [null, null, number, number];
export type S1Hub = {
  fill: string;
  /** the blue cluster stays crisp while the others soften under the panel */
  blue?: boolean;
  dot: [number, number];
  e: [number, number];
  leaves: S1Leaf[];
  /** [edgeX1, edgeY1, edgeX2, edgeY2, dotX, dotY] — second-level branches */
  sub?: [number, number, number, number, number, number][];
};

export const S1_HUBS: S1Hub[] = [
  {
    fill: "#BA8BFF",
    dot: [179.883, 142.425],
    e: [179, 142.92],
    leaves: [
      [42, 129.92, 42.832, 129.969],
      [42, 44.5, 42, 44],
      [239.5, 26.9196, 239.496, 27.4015],
      [95.5, 204.42, 96.082, 203.42],
      [151, 67.0001, 151, 67],
      [202, 31.9196, 201.871, 31.8497],
      [140.5, 159.92, 141.164, 159.922],
      [80, 148.42, 80.9531, 148.425],
    ],
  },
  {
    fill: "#68CEA7",
    dot: [292.691, 148.425],
    e: [292, 148.42],
    leaves: [
      [355, 31.9196, 354.938, 31.902],
      [437.5, 67.0001, 436, 67],
      [422, 137.5, 421, 139],
      [324.5, 31.9196, 325.121, 30.9718],
      [422, 26.9196, 421.348, 27.9718],
      [287, 96.4196, 286.691, 97.3063],
      [355, 167.92, 354.938, 168.413],
    ],
  },
  {
    fill: "#FF7AA0",
    dot: [159.719, 249.097],
    e: [161, 248.42],
    leaves: [
      [61.5, 353.42, 62, 354],
      [239.5, 405.5],
      [168, 347.5, 169, 349],
      [42, 298.42, 42.832, 298.725],
      [42, 221.42, 42.832, 220.968],
      [115.5, 387.92, 115.445, 387.98],
    ],
    sub: [
      [61.5, 353.42, 19.5, 354.92, 19, 354],
      [61.5, 353.42, 32, 398.92, 31.9414, 398.569],
      [61.5, 353.42, 80, 398.92, 79.4414, 398.569],
      [168, 347.5, 159, 398.92, 160, 398],
      [168, 347.5, 188, 398.92, 189, 398],
    ],
  },
  {
    fill: "#FFBD7A",
    dot: [354.938, 231.066],
    e: [355, 231.92],
    leaves: [
      [386, 325, 386, 325],
      [442.5, 330.92, 442, 328],
      [389, 227.92, 389.055, 228.066],
      [333.5, 263.92, 333.543, 264.42],
      [439, 272.5, 439, 273],
      [null, null, 465.855, 355.008],
      [null, null, 465.855, 291.538],
    ],
  },
  {
    fill: "#6EBBFF",
    blue: true,
    dot: [291, 315],
    e: [289.5, 313.5],
    leaves: [
      [283.5, 374.5, 285, 375],
      [311.5, 398.92, 312, 398],
      [333.5, 411.42, 333.543, 411.15],
      [363, 374.5, 364, 375],
      [262, 360.5, 262, 361],
      [324.5, 330.92, 324.348, 331.342],
    ],
  },
];

/** `len` is a fixed 3-decimal string: it is server-rendered into the markup
    (dash array / offset) and re-derived on the client, and Math.hypot is not
    correctly rounded across engines (Node vs Firefox/WebKit differed in the
    last digit → hydration mismatch); sqrt of the sum of squares is. */
export type S1Edge = { x1: number; y1: number; x2: number; y2: number; len: string; hub: number };
export type S1Dot = { x: number; y: number; r: number; fill: string; hub: number };

/** The graph flattened in the composition's build order: for each hub its edge
    and dot, then every leaf's edge / dot, then the sub-branches. The markup
    renders these lists and the timeline consumes them with the same cursors. */
export function s1Graph(): { edges: S1Edge[]; dots: S1Dot[] } {
  const edges: S1Edge[] = [];
  const dots: S1Dot[] = [];
  const edge = (hub: number, x1: number, y1: number, x2: number, y2: number) =>
    edges.push({ x1, y1, x2, y2, len: Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)).toFixed(3), hub });
  const dot = (hub: number, x: number, y: number, r: number, fill: string) => dots.push({ x, y, r, fill, hub });
  S1_HUBS.forEach((h, i) => {
    edge(i, S1_CENTER.x, S1_CENTER.y, h.e[0], h.e[1]);
    dot(i, h.dot[0], h.dot[1], 6, h.fill);
    h.leaves.forEach((L) => {
      if (L[0] !== null) edge(i, h.e[0], h.e[1], L[0], L[1]);
      if (L.length === 4) dot(i, L[2], L[3], 3, h.fill);
    });
    h.sub?.forEach((S) => {
      edge(i, S[0], S[1], S[2], S[3]);
      dot(i, S[4], S[5], 3, h.fill);
    });
  });
  return { edges, dots };
}

/** per-key jitter of the typing of "studio-pelican.com" — its glyph edges are
    measured from the live text in lp-step-timelines.ts (the Fono advance table
    that used to live here broke the moment the mocks moved to Geist Sans) */
export const S1_JIT = [0, 0.02, -0.01, 0.03, 0, -0.02, 0.04, 0, 0.01, -0.01, 0.05, 0, 0.02, -0.02, 0.03, 0, 0.01, 0];

/** the market-profile rows that resolve out of the skeletons */
export const S1_ROWS = [
  { top: 230, name: "Company", sub: "Studio Pelican" },
  { top: 298, name: "Offering", sub: "SaaS launch videos" },
  { top: 366, name: "Ideal clients", sub: "B2B SaaS teams" },
];
export const S1_SKELETON_TOPS = [230, 286, 342];

/* ── step 02 · the Agents list and the Pipeline checklist (ctx-B-pipeline +
   step-2-pipeline.svg) ── */

type Shape = { w: number; h: number; d: string };
export const S2_BLOB =
  "M17.2921 32C22.2317 32 26.1815 28.4173 28.887 24.7957C30.7441 22.3098 31.8448 19.1712 31.8732 15.6551C31.9435 6.98067 25.048 7.95594e-07 16.6345 7.95594e-07C8.22089 7.95594e-07 1.06633 6.14557 0.189371 15.6551C-0.342812 21.4254 2.32096 24.5575 5.32758 27.1278C8.31366 29.6806 13.1412 32 17.2921 32Z";
// pancake "sides" / "top" shapes, each in its own box (w,h) placed inside the 22.4 mask box at (4.8,4.8)
const SIDES_FLAT: Shape = { w: 22.4, h: 14.9333, d: "M12.1045 14.9333C15.5622 14.9333 18.3271 13.2614 20.2209 11.5713C21.5208 10.4112 22.2913 8.94656 22.3113 7.30571C22.3604 3.25765 17.5336 -4.4041e-07 11.6441 -4.4041e-07C5.75462 -4.4041e-07 0.746432 2.86793 0.13256 7.30571C-0.239969 9.99852 1.62467 11.4602 3.7293 12.6597C5.81956 13.851 9.19885 14.9333 12.1045 14.9333Z" };
const TOP_FLAT: Shape = { w: 21, h: 11.2, d: "M11.3479 11.2C14.5896 11.2 17.1816 9.94607 18.9571 8.6785C20.1758 7.80843 20.8981 6.70992 20.9168 5.47928C20.9629 2.44324 16.4378 2.43651e-07 10.9164 2.43651e-07C5.39496 2.43651e-07 0.69978 2.15095 0.124275 5.47928C-0.224971 7.49889 1.52313 8.59512 3.49622 9.49475C5.45584 10.3882 8.62392 11.2 11.3479 11.2Z" };
const SIDES_TALL: Shape = { w: 22.4, h: 17.7333, d: "M12.1045 17.7333C15.5622 17.7333 18.3271 15.7479 20.2209 13.741C21.5208 12.3634 22.2913 10.624 22.3113 8.67553C22.3604 3.86846 17.5336 4.66573e-07 11.6441 4.66573e-07C5.75462 4.66573e-07 0.746432 3.40567 0.13256 8.67553C-0.239969 11.8732 1.62467 13.6089 3.7293 15.0333C5.81956 16.448 9.19885 17.7333 12.1045 17.7333Z" };
const TOP_TALL: Shape = { w: 21, h: 14.9333, d: "M11.3479 14.9333C14.5896 14.9333 17.1816 13.2614 18.9571 11.5713C20.1758 10.4112 20.8981 8.94656 20.9168 7.30571C20.9629 3.25765 16.4378 -2.14412e-07 10.9164 -2.14412e-07C5.39496 -2.14412e-07 0.69978 2.86793 0.124275 7.30571C-0.224971 9.99852 1.52313 11.4602 3.49622 12.6597C5.45584 13.851 8.62392 14.9333 11.3479 14.9333Z" };
const SIDES_LEAN: Shape = { w: 22.4, h: 17.7333, d: "M10.3361 17.1482C12.5847 17.1482 16.0917 17.1982 18.2696 15.8552C20.9299 14.2147 22.2798 11.5282 22.3048 9.12794C22.3541 4.40577 17.9235 -1.15237e-07 12.0264 -1.15237e-07C9.33379 -1.15237e-07 6.2594 0.565498 4.26957 1.81631C1.90146 3.30492 0.0973683 5.27985 0.0973683 8.43309C0.0973874 13.5322 3.53149 17.1482 10.3361 17.1482Z" };
const TOP_LEAN: Shape = { w: 21, h: 14.9333, d: "M9.69006 14.4406C11.7982 14.4406 15.086 14.4827 17.1277 13.3517C19.6217 11.9703 20.8873 9.70793 20.9108 7.68669C20.9569 3.71012 16.8033 -1.27466e-07 11.2748 -1.27466e-07C8.75042 -1.27466e-07 5.86818 0.476209 4.00272 1.52952C1.78261 2.78309 0.0912828 4.44619 0.0912828 7.10155C0.0913007 11.3955 3.31077 14.4406 9.69006 14.4406Z" };
const SIDES_AI: Shape = { w: 22.4, h: 17.7333, d: "M10.9002 17.7333C14.3635 17.7333 18.3206 15.3924 20.2175 13.4307C21.5195 12.0842 22.2912 10.3842 22.3111 8.47964C22.3604 3.78111 17.5259 -5.25725e-07 11.6271 -5.25725e-07C8.93376 -5.25725e-07 6.45749 0.92406 4.4671 2.16861C2.09832 3.64976 0.0973958 5.34218 0.0973958 8.47964C0.0974149 13.5532 5.28502 17.7333 10.9002 17.7333Z" };
const TOP_AI: Shape = { w: 21, h: 14.9333, d: "M10.219 14.9333C13.4657 14.9333 17.1756 12.962 18.9539 11.3101C20.1745 10.1762 20.898 8.74456 20.9167 7.14075C20.9628 3.18409 16.4306 2.5052e-07 10.9004 2.5052e-07C8.3754 2.5052e-07 6.05389 0.778156 4.18791 1.8262C1.96717 3.07349 0.0913086 4.49868 0.0913086 7.14075C0.0913265 11.4132 4.95471 14.9333 10.219 14.9333Z" };

export type S2Eye = { x: number; y: number; w: number; h: number; rot: number };
export type S2Row = {
  name: string;
  count: string;
  blob: string;
  sides: Shape;
  sidesFill: string;
  sidesOpacity?: number;
  top: Shape;
  topFill: string;
  py: number;
  eyes: [S2Eye, S2Eye];
};

/** Five agent rows: blob tint, pancake parts + their offsets inside the 22.4
    mask box, eye boxes (Figma left/top/w/h + rotation) */
export const S2_ROWS: S2Row[] = [
  { name: "Pipeline", count: "24 warm leads", blob: "#FFE9D1", sides: SIDES_FLAT, sidesFill: "#FFDBB5", top: TOP_FLAT, topFill: "#FFBD7A", py: 3.73,
    eyes: [{ x: 12.8, y: 8.32, w: 4.438, h: 6.104, rot: 85.05 }, { x: 20.56, y: 8.0, w: 3.472, h: 4.776, rot: 85.05 }] },
  { name: "Signals", count: "48 detected", blob: "#EFDDF1", sides: SIDES_TALL, sidesFill: "#DEC3F5", top: TOP_TALL, topFill: "#BA8BFF", py: 1.87,
    eyes: [{ x: 11.17, y: 10.78, w: 4.438, h: 6.104, rot: 85.05 }, { x: 18.93, y: 10.46, w: 3.472, h: 4.776, rot: 85.05 }] },
  { name: "Content", count: "3 articles live", blob: "#FFD9DA", sides: SIDES_LEAN, sidesFill: "#FFBBC7", top: TOP_LEAN, topFill: "#FF7AA0", py: 1.87,
    eyes: [{ x: 11.41, y: 10.65, w: 3.971, h: 5.792, rot: 89.88 }, { x: 20.8, y: 11.2, w: 3.107, h: 4.532, rot: 89.88 }] },
  { name: "Replies", count: "12 received", blob: "#CEEAD5", sides: SIDES_LEAN, sidesFill: "#68CEA7", sidesOpacity: 0.32, top: TOP_LEAN, topFill: "#68CEA7", py: 1.87,
    eyes: [{ x: 16.48, y: 11.2, w: 4.259, h: 5.916, rot: -86.98 }, { x: 9.6, y: 11.88, w: 3.332, h: 4.629, rot: -86.98 }] },
  { name: "AI search", count: "4 mentions", blob: "#BCDBFF", sides: SIDES_AI, sidesFill: "#92C5FF", top: TOP_AI, topFill: "#57A5FF", py: 1.87,
    eyes: [{ x: 11.24, y: 10.35, w: 4.315, h: 5.953, rot: 93.6 }, { x: 19.05, y: 11.11, w: 3.376, h: 4.658, rot: 93.6 }] },
];
/** frame-1 row boxes (h 40, gap 16) */
export const S2_ROW_TOP = (i: number) => 169 + 56 * i;
/** Pipeline row → frame-3 header row (pt 4) */
export const S2_HEADER_DY = 74.75 - 169;

export type S2Item = { label: string; top: number; done?: boolean; muted?: boolean };
export const S2_ITEMS: S2Item[] = [
  { label: "Monitor buying signals", top: 146.75, done: true },
  { label: "Find people ready to buy", top: 194.75, done: true },
  { label: "Enrich every prospect", top: 242.75, done: true },
  { label: "Score leads for ICP fit", top: 298.75 }, // static: 48-tall slot, py 12 → same centre as a 32 row at 298.75
  { label: "Write outreach in your voice", top: 354.75 },
  { label: "Follow-up automatically", top: 402.75, muted: true }, // static SVG: #9A818F
  { label: "Learn from every reply", top: 450.75, muted: true }, // static SVG: #9A818F (off-canvas)
];
export const S2_CHECK_D = "M6 12.4615C7.96737 13.3592 9.90629 15.1306 11.0165 18C12.0904 13.1066 14.3706 9.29236 18 6";
/** items processed in order; item 6 sits off-canvas */
export const S2_PROC = [0, 1, 2, 3, 4, 5];

/* ── step 03 · the calendar week (ctx-C-calendar + step-3-calendar.svg;
   Mon 19 – Fri 23 = the real October 2026 work week, corrected 2026-09-03) ── */

export const S3_DAY_W = 96;
/** number slide into the circle (circle centre = day x + 46): Mon sits there
    at frame 0 (left 33) — [Mon: out-of-circle offset, Tue..Fri: into-circle offset] */
export const S3_NUM_DX = [-9.9, 11.4, 9.8, 11.0, 19.7];
export const S3_DAYS = [
  { name: "Mon", num: "19", left: 24, numLeft: 33 },
  { name: "Tue", num: "20", left: 120, numLeft: 21.6 },
  { name: "Wed", num: "21", left: 216, numLeft: 23.2 },
  { name: "Thu", num: "22", left: 312, numLeft: 22 },
  { name: "Fri", num: "23", left: 408, numLeft: 13.3 },
];
export const S3_RULE_TOPS = [145, 201, 257, 313];
export const S3_TICK_TOPS = [141, 197, 253, 309];

export type S3Chip = {
  id: string;
  day: number;
  x: number;
  top: number;
  h: 52 | 24;
  color: "purple" | "yellow" | "green" | "blue";
  lines: string[];
  pop: number;
  outcome: "closed" | "follow";
};
export const S3_CHIPS: S3Chip[] = [
  { id: "sam-m", day: 0, x: 24, top: 203, h: 24, color: "blue", lines: ["Samantha M ..."], pop: 0.55, outcome: "closed" },
  { id: "jul-mon", day: 0, x: 24, top: 315, h: 24, color: "yellow", lines: ["Julien Aubert"], pop: 0.85, outcome: "follow" },
  { id: "martin", day: 1, x: 120, top: 175, h: 52, color: "purple", lines: ["Martin Torres", "& Studio P"], pop: 1.15, outcome: "closed" },
  { id: "lumen", day: 1, x: 120, top: 259, h: 52, color: "green", lines: ["Lumen", "Collective"], pop: 1.85, outcome: "closed" },
  { id: "fern", day: 3, x: 312, top: 203, h: 52, color: "purple", lines: ["Fernhollow", "Studio"], pop: 2.15, outcome: "closed" },
  { id: "sam", day: 2, x: 216, top: 317, h: 52, color: "blue", lines: ["Samantha ..."], pop: 2.45, outcome: "follow" },
  { id: "jul-wed", day: 2, x: 216, top: 175, h: 52, color: "yellow", lines: ["Julien Aubert"], pop: 2.95, outcome: "closed" },
  { id: "martc", day: 3, x: 312, top: 259, h: 52, color: "yellow", lines: ["Martin C.", "Follow-up"], pop: 3.95, outcome: "closed" },
];
