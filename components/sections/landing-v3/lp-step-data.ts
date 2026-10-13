/* Data for the three "Pancake fills your pipeline" step animations, 464×426
   design frames. Step 01 and step 03's calendar: every number and string
   verbatim from the pancake-studio compositions the mp4s were rendered from
   (shorts/brain-research-loop, meetings-calendar-loop). Step 02 and step 03's
   intro: the designer's "How it works" storyboards (Figma, 2026-10-11), which
   replaced the pipeline-checklist-loop composition. Shared by the markup
   (LpStepMocks.tsx, which lays the rest state = each animation's frame 0) and
   the timelines (lp-step-timelines.ts), so both walk the same lists in the
   same order. */

import type { ContentStatus } from "@/lib/placeholders";

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
  /** the hub's name, painted over the graph (Figma V2 4962:839–845, red note "Labels in 2nd
      level dots", 2026-10-09): Geist SemiBold 10/16 in the text colour. `cx` = the Figma
      text box's centre x (the label is centred on it, so browser text widths never shift
      it); `top` = the box's y + ~1, pixel-calibrated (Chromium/WebKit draw Geist 10/16 a
      pixel above Figma's raster; Firefox lands 1px lower, as with the centre label).
      Figma boxes: Competitors 133,113.969 60×16 · ICPs 283.543,116.969 22×16 ·
      Outreach 92.352,241.097 45×16 · Influencers 350.977,202.42 55×16 ·
      Market Research 222,328.342 82×16. */
  label: { text: string; cx: number; top: number };
};

export const S1_HUBS: S1Hub[] = [
  {
    fill: "#BA8BFF",
    label: { text: "Competitors", cx: 163, top: 115 },
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
    label: { text: "ICPs", cx: 294.543, top: 118 },
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
    label: { text: "Outreach", cx: 114.852, top: 242 },
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
    label: { text: "Influencers", cx: 378.477, top: 204 },
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
    label: { text: "Market Research", cx: 263, top: 330 },
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

/** per-key jitter of the typing of "acme.com" — its glyph edges are
    measured from the live text in lp-step-timelines.ts (the Fono advance table
    that used to live here broke the moment the mocks moved to Geist Sans) */
export const S1_JIT = [0, 0.02, -0.01, 0.03, 0, -0.02, 0.04, 0, 0.01, -0.01, 0.05, 0, 0.02, -0.02, 0.03, 0, 0.01, 0];

/** the market-profile rows that resolve out of the skeletons */
export const S1_ROWS = [
  { top: 230, name: "Company", sub: "Acme" },
  { top: 298, name: "Offering", sub: "Websites for startups" },
  { top: 366, name: "Ideal clients", sub: "Funded B2B startups" },
];
export const S1_SKELETON_TOPS = [230, 286, 342];

/* ── steps 02 and 03 · the "How it works" storyboards (Figma page 4197:9774, delivered
   2026-10-11; red notes 4964:1637 "Deltas: New" and 4964:1640 "Deltas: New intro before
   calendar"). Step 02 = frames 5016:4214 → 5022:4850 → 5022:4979 → 5016:4238 → 5022:5248 →
   5022:5381 → 5022:5590 → 5022:6230; step 03's intro = 5022:6116 → 5018:4344 → 5022:4757 →
   5022:4781 → 5022:6080, then today's calendar. Geometry lives in steps.css, at the frames'
   own 464×426 coordinates.

   COPY: the storyboard's sample strings come from a real session in the live app (what look
   like real people's names and titles, a platform icon after every name, a message from
   another story, typos). The strings below are the homepage's own invented Acme
   story instead (sender Astrid Norling; the leads of lib/verticals/home-demo.ts, validated
   by validate.ts), each measured to keep Figma's line counts. No platform icon is drawn.
   The storyboard's verbatim strings, one by one: specs/updates/steps-how-it-works.md §9.2.
   Every string of both mocks lives HERE (this file is in scripts/homepage-lint.mjs FILES;
   LpStepMocks.tsx only maps it). A field must never be named after a code key the lint
   skips (role, kind, variant, tone, icon, path, url, id, key, type…): hence `position`.
   The two alt texts in lp-steps-content.ts retell these strings: keep in sync. ── */

/** a checkbox's tick in a 24 box (Figma draws the same curve × 2/3 in its 16 box) */
export const SX_CHECK_D = "M6 12.4615C7.96737 13.3592 9.90629 15.1306 11.0165 18C12.0904 13.1066 14.3706 9.29236 18 6";

export type SxLead = { name: string; position: string; initials: string };
/** the Leads table (step 02 frames 5–7, step 03 frame 1): six rows, the sixth cut by the card.
    Figma shows "AL" on every avatar (a placeholder): each lead carries its own initials.
    The positions are the Play's (2026-10-13: "Founders and marketing leads" of funded startups;
    two of them were product marketers, the launch-video story's cast). */
export const SX_LEADS: readonly SxLead[] = [
  { name: "Tamsin Okafor", position: "Founder & CEO", initials: "TO" },
  { name: "Wes Pomeroy", position: "VP Marketing", initials: "WP" },
  { name: "Imani Coldwell", position: "CMO", initials: "IC" },
  { name: "Anders Forsythe", position: "Co-founder", initials: "AF" },
  { name: "Rosa Hartigan", position: "Founder & CEO", initials: "RH" },
  { name: "Elena Marchetti", position: "VP Marketing", initials: "EM" },
];
export const SX_LEADS_COPY = { title: "Leads", lead: "Lead", position: "Position" };
/** the table's pose in step 02 frame 5, relative to its resting pose (frame 6 = step 03
    frame 1 = steps.css .lp-sx-leads): Figma draws it 27px further left and 3.78px lower */
export const SX_LEADS_F5 = { x: -27, y: 3.78 };
/** when each row starts its 0.5 s linear fade, in seconds after the first: at the f5 label
    (0.5 s in) the rows read 1 / .8 / .6 / .4 / .32 / .16, Figma's frame 5 exactly */
export const SX_LEADS_ROW_IN = [0, 0.1, 0.2, 0.3, 0.34, 0.42];

/* ── step 02 · say who you want → one question → a Play takes shape → leads → the Play ── */

export const S2_CHAT = {
  prompt: "Find founders who just raised a seed round",
  worked: "Worked across 5 steps",
  /** three lines at 338px (Figma's count) */
  answer:
    "Happy to set that up: founders of B2B startups in the United States that just raised. One thing decides who qualifies: the size of the company.",
  /** the thread's scroll between frames 1 and 2 */
  scrollY: -250.14,
};
export const S2_QUESTION = {
  head: "Question",
  text: "What size of companies?",
  /** Figma repeats "1-50 employees" on the second row (a copy-paste): the app's own second
      option is "51-500 employees" */
  options: ["1-50 employees", "51-500 employees", "500+", "Any size"],
  own: "Write your own...",
  /** the option the hand picks (frame 3) */
  picked: 0,
};
export type S2Slot = { label: string; /** null = not decided yet (a numbered grey disc) */ value: string | null };
export const S2_DRAFT = {
  eyebrow: "New Play",
  title: "Your Play takes shape here",
  undecided: "Not decided yet",
  /** the app's four slots (pancake-cmo play-draft.ts SLOT_LABEL: Who · How we find them ·
      At most · When). Figma's fourth row repeats "Who" with a check next to "Not decided
      yet" (a copy-paste): it is "When", undecided. */
  slots: [
    { label: "Who", value: "Founders and marketing leads" },
    { label: "How we find them", value: "A seed round, raised this month" },
    { label: "At most", value: "25" },
    { label: "When", value: null },
  ] as readonly S2Slot[],
  thinking: "Pancake is reading your brain and your Plays...",
};
export const S2_BAR = { selected: "13 selected", add: "Add 13 to sequence" };

/** a figure of the Play card. `status` is the homepage's one content gate (lib/placeholders):
    "final" ships, "placeholder" renders on dev and Vercel previews only. */
export type S2Figure = { value: string; label: string; status: ContentStatus };
export type S2Play = { state: string; name: string; summary: string; figures: readonly S2Figure[]; review: string };
/** The two Play cards of the end picture (Figma 5022:6230 = V2 art card 5024:8277 pastes ONE
    app screenshot twice; rebuilt in DOM from the product's own card). Card 2 only shows its
    first 50px.
    The "reply rate" figure (value "—", no rate is claimed) is drawn by the designer and is
    the app's own label, but a rate label on the homepage needs the founder's yes
    (specs/updates/v2-desktop-diff.md §6.3 / §7.3): it is a "placeholder" until then, i.e.
    visible on dev and previews, absent in production. His yes = change its status to "final". */
export const S2_PLAYS: readonly [S2Play, S2Play] = [
  {
    state: "Active",
    /* two lines, as the card is drawn (the hero demo's Play, said in full) */
    name: "Funded startups hiring a marketing lead",
    summary: "Find Founder, CEO, Head of Marketing, and 2 more profiles at startups that just raised…",
    figures: [
      { value: "13", label: "leads found", status: "final" },
      { value: "—", label: "reply rate", status: "placeholder" },
    ],
    review: "Review 13 leads",
  },
  {
    state: "Active",
    name: "Startups posting about a rebrand",
    summary: "Find Founder, Head of Brand, and 3 more profiles at companies planning a rebrand…",
    figures: [
      { value: "24", label: "leads found", status: "final" },
      { value: "—", label: "reply rate", status: "placeholder" },
    ],
    review: "Review 24 leads",
  },
];
/** the Play card's sparkline in its 88×28 box (the app's polyline: flat, then up). `len` is a
    fixed 3-decimal string (75.4 + √(12.6² + 22²)), the S1Edge.len rule: it is server-rendered
    into the dash array, so it is never computed with Math.hypot at render. */
export const S2_SPARK = { d: "M0 25H75.4L88 3", len: "100.753" };

/* ── step 03 · the intro before the calendar: one lead, a message, her reply, the meeting ── */

export const S3_THREAD = {
  lead: { name: "Tamsin Okafor", initials: "TO", company: "Quillfern", position: "Founder & CEO" },
  drafting: "Drafting...",
  sent: "Sent",
  /** Acme designs websites for funded startups, and the Play is the hero demo's (founders who
      just raised a seed round and are hiring a marketing lead; founder 2026-10-13, "on topic"):
      the message names both signals, then the offer. Three lines at 327px, at weight 500 (the
      draft) and 400 (once it is history). The deep dive's message story shows the same message
      (lp-story-message-data.ts, the "answered" conversation): keep in sync. */
  message:
    "Hi Tamsin, congrats on Quillfern’s seed round. Want a new website live before your marketing lead starts?",
  replyFrom: "Tamsin Okafor",
  /** two lines at 279px */
  reply: "Hey, sounds interesting. I’m free Thursday 3pm!",
  meet: "Meet",
  meetTitle: "Tamsin X Acme",
  /** "3.30pm" is the storyboard's own form, kept verbatim */
  meetWhen: "Thursday 3pm – 3.30pm • 30 min",
  meetWho: "Tamsin Okafor, Astrid Norling",
  /** the thread's pose at frames 4 and 5 (Figma: x 52 → 52.75, y −96.5 then −246.5) */
  scroll: [
    { x: 0.75, y: -96.5 },
    { x: 0.75, y: -246.5 },
  ],
};

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
  /** the badge stamped once the meeting is past: "Booked" (2026-10-07, was
      "Closed": Pancake can't know a deal closed) or "→ follow-up" */
  outcome: "booked" | "follow";
};
/** the chip the thread's Meet card turns into (founder 2026-10-13: "better animated", no cut
    between the thread and the calendar): it is in the week from the calendar's first frame,
    and the other meetings pop around it. */
export const S3_LANDED = "tamsin";
export const S3_CHIPS: S3Chip[] = [
  { id: "sam-m", day: 0, x: 24, top: 203, h: 24, color: "blue", lines: ["Samantha M ..."], pop: 0.55, outcome: "booked" },
  { id: "jul-mon", day: 0, x: 24, top: 315, h: 24, color: "yellow", lines: ["Julien Aubert"], pop: 0.85, outcome: "follow" },
  { id: "martin", day: 1, x: 120, top: 175, h: 52, color: "purple", lines: ["Martin Torres", "& Acme"], pop: 1.15, outcome: "booked" },
  { id: "lumen", day: 1, x: 120, top: 259, h: 52, color: "green", lines: ["Lumen", "Collective"], pop: 1.85, outcome: "booked" },
  /* the meeting of the thread: its card lands here and becomes this chip (S3_LANDED). It was
     "Fernhollow Studio", same box, popping at 2.15 like the others. */
  { id: "tamsin", day: 3, x: 312, top: 203, h: 52, color: "purple", lines: ["Tamsin Okafor", "& Acme"], pop: 2.15, outcome: "booked" },
  { id: "sam", day: 2, x: 216, top: 317, h: 52, color: "blue", lines: ["Samantha ..."], pop: 2.45, outcome: "follow" },
  { id: "jul-wed", day: 2, x: 216, top: 175, h: 52, color: "yellow", lines: ["Julien Aubert"], pop: 2.95, outcome: "booked" },
  { id: "martc", day: 3, x: 312, top: 259, h: 52, color: "yellow", lines: ["Martin C.", "Follow-up"], pop: 3.95, outcome: "booked" },
];
