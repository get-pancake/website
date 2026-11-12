/**
 * The six hard problems' stories (the vision homepage, 2026-11-11) — their words and their
 * geometry. Five of the six are drawn here; the sixth, crossing, is the page's lineage story
 * (lp-story-lineage-*), which already shows your own data and outside signals meeting on one lead.
 *
 * The founder, on the six tables that stood here: "c'est parfois tres technique, tres database …
 * sur les six hard problems, on peut plutot montrer des motion design simples et efficaces, bien
 * penses, bien architectures, qui depeignent le probleme qu'on solve". So each story is a small
 * diagram of the problem being solved, in the parts of the one picture he loves (the story kit:
 * white discs with a vendor's own mark, flat brand stops, grey wires, the near-black dot, small
 * names), with no UI and no claim in the picture: the words are in the list beside it.
 *
 * One scene = its END picture (the nodes, the wires, the labels: stage px on the 752×489 box) and
 * its take (the steps, in seconds). LpStoryProblems.tsx draws the END; lp-story-problems-timeline.ts
 * hides the build-up at frame 0 and plays the steps with the kit's verbs: a wire draws, a dot grows
 * to its size, a line of type rises, a piece turns near-black. Nothing travels along a wire, nothing
 * overshoots, nothing loops. Every frame 0 is a composed picture: the problem, before Pancake.
 *
 *   p-sources    your tools on one side, data providers on the other: every wire lands on one dot
 *   p-dedup      the same person in three sources: three dots, three wires, then one record
 *   p-matching   people with no tie: the company's wire reaches the CEO, then down to each report;
 *                the buyer's line to the company turns near-black
 *   p-history    one account and its empty line: the datapoints land on it in the order they happened
 *   p-moves      a buyer leaves a company: a wire follows them to the next one, where they land
 *
 * Read by scripts/homepage-lint.mjs (FILES). No person and no real company is named: a dot is a
 * role. A vendor's mark is the vendor's own file, unmodified.
 */

export type ProblemStoryId = "p-sources" | "p-dedup" | "p-matching" | "p-history" | "p-moves";

export type SpTone = "yellow-30" | "purple-30" | "pink-30" | "green-20" | "blue-30";

export type SpNode =
  /** a vendor's mark on a white disc */
  | { kind: "disc"; id: string; x: number; y: number; r: number; logo: string; name?: string }
  /** a flat brand dot: a kind of source, a company, a datapoint */
  | { kind: "stop"; id: string; x: number; y: number; r: number; tone: SpTone; name?: string }
  /** a grey dot: a person, a record. `ink`: near-black at rest. `gone`: not in the END picture
      (it was there at frame 0). `dim`: stepped back at rest */
  | { kind: "dot"; id: string; x: number; y: number; r: number; ink?: true; gone?: true; dim?: true; name?: string };

export type SpWire =
  /** the kit's curve, written out (see `curve`) */
  | { id: string; d: string; ink?: true }
  /** a straight wire whose end can move with its dot */
  | { id: string; line: readonly [number, number, number, number]; ink?: true };

/** a line of type: x = its centre, y = the top of its line box */
export type SpLabel = { id: string; x: number; y: number; text: string; group?: true; gone?: true };

export type SpStep =
  | { at: number; wire: string; dur?: number; linear?: true }
  /** a dot grows from `from` (0 by default: it was not there) to `to` (its END radius by default) */
  | { at: number; grow: string; from?: number; to?: number }
  /** wires and dots turn from the kit's grey to their END near-black */
  | { at: number; ink: readonly string[] }
  | { at: number; rise: string }
  /** pieces step back (or leave) */
  | { at: number; fade: readonly string[]; to: number; dur?: number }
  /** a dot comes from `from` to its END place; the wires in `with` end on it all the way */
  | { at: number; move: string; from: readonly [number, number]; with?: readonly string[]; dur?: number };

export type SpScene = {
  id: ProblemStoryId;
  /** what the animation shows (the stage's aria-label) */
  alt: string;
  nodes: readonly SpNode[];
  wires: readonly SpWire[];
  labels: readonly SpLabel[];
  steps: readonly SpStep[];
  /** s: the END holds to here */
  end: number;
};

/* ── geometry helpers ── */
const f3 = (n: number) => Number(n.toFixed(3));
/** the loved picture's wire: one cubic with horizontal handles, c = 0.426667 × the straight
    distance between its ends (the lineage story's formula) */
function curve(x1: number, y1: number, x2: number, y2: number): string {
  const c = 0.426667 * Math.hypot(x2 - x1, y2 - y1);
  const dir = x2 >= x1 ? 1 : -1;
  return `M ${f3(x1)} ${f3(y1)} C ${f3(x1 + dir * c)} ${f3(y1)} ${f3(x2 - dir * c)} ${f3(y2)} ${f3(x2)} ${f3(y2)}`;
}
/** radii: a mark's disc, a stop, a person, the found one (the lineage story's) */
const DISC = 28;
const STOP = 19;
const LEAD = 8;
const FOUND = 12;
/** a name's line box under a node: its top (story-kit.css puts a name 5 px under its node) */
const under = (y: number, r: number) => y + r + 5;
/** over a node */
const over = (y: number, r: number) => y - r - 21;

const LOGO = {
  crm: "/lp/vendor-logos/hubspot.svg",
  events: "/lp/vendor-logos/luma.svg",
  product: "/lp/vendor-logos/posthog.svg",
  theirstack: "/lp/story-sources/theirstack.svg",
  dealroom: "/lp/story-sources/dealroom.svg",
  coresignal: "/lp/story-sources/coresignal.svg",
  wappalyzer: "/lp/story-sources/wappalyzer.svg",
} as const;

/* ── 1. sources: every source in one place ── */
const S = { left: 124, right: 628, hub: [376, 245] as const, rows: [110, 200, 290, 380] as const, pr: 24 };
const SOURCES: SpScene = {
  id: "p-sources",
  alt: "Your CRM, calls, events and database on one side, data providers on the other: every wire lands on one dot.",
  nodes: [
    { kind: "disc", id: "crm", x: S.left, y: S.rows[0], r: DISC, logo: LOGO.crm, name: "CRM" },
    { kind: "stop", id: "calls", x: S.left, y: S.rows[1], r: STOP, tone: "purple-30", name: "Calls" },
    { kind: "disc", id: "events", x: S.left, y: S.rows[2], r: DISC, logo: LOGO.events, name: "Events" },
    { kind: "stop", id: "db", x: S.left, y: S.rows[3], r: STOP, tone: "blue-30", name: "Your database" },
    { kind: "disc", id: "p1", x: S.right, y: S.rows[0], r: S.pr, logo: LOGO.theirstack },
    { kind: "disc", id: "p2", x: S.right, y: S.rows[1], r: S.pr, logo: LOGO.dealroom },
    { kind: "disc", id: "p3", x: S.right, y: S.rows[2], r: S.pr, logo: LOGO.coresignal },
    { kind: "disc", id: "p4", x: S.right, y: S.rows[3], r: S.pr, logo: LOGO.wappalyzer },
    { kind: "dot", id: "hub", x: S.hub[0], y: S.hub[1], r: FOUND, ink: true, name: "One place" },
  ],
  wires: [
    { id: "l1", d: curve(S.left + DISC, S.rows[0], S.hub[0], S.hub[1]) },
    { id: "l2", d: curve(S.left + STOP, S.rows[1], S.hub[0], S.hub[1]) },
    { id: "l3", d: curve(S.left + DISC, S.rows[2], S.hub[0], S.hub[1]) },
    { id: "l4", d: curve(S.left + STOP, S.rows[3], S.hub[0], S.hub[1]) },
    { id: "r1", d: curve(S.right - S.pr, S.rows[0], S.hub[0], S.hub[1]) },
    { id: "r2", d: curve(S.right - S.pr, S.rows[1], S.hub[0], S.hub[1]) },
    { id: "r3", d: curve(S.right - S.pr, S.rows[2], S.hub[0], S.hub[1]) },
    { id: "r4", d: curve(S.right - S.pr, S.rows[3], S.hub[0], S.hub[1]) },
  ],
  labels: [
    { id: "g-own", x: S.left, y: 52, text: "Your data", group: true },
    { id: "g-out", x: S.right, y: 52, text: "30+ data providers", group: true },
  ],
  steps: [
    { at: 0.3, wire: "l1" },
    { at: 0.45, wire: "l2" },
    { at: 0.6, wire: "l3" },
    { at: 0.75, wire: "l4" },
    // the first tip lands: the dot is there, at the size of a wire's end
    { at: 0.85, grow: "hub", to: 5.333 },
    { at: 1.15, wire: "r1" },
    { at: 1.3, wire: "r2" },
    { at: 1.45, wire: "r3" },
    { at: 1.6, wire: "r4" },
    // all eight are in: it grows to its size, and is named
    { at: 2.2, grow: "hub", from: 5.333 },
    { at: 2.3, rise: "hub-name" },
  ],
  end: 3.3,
};

/* ── 2. deduplication: one person, one record. Since the landing page meeting (2026-11-11) it is
   the "entity resolution" feature, on the meeting's own example: the same person at an event, in
   a product signup and on a social profile, under different emails ── */
const D = { src: 150, rec: 560, rows: [125, 245, 365] as const };
const DEDUP: SpScene = {
  id: "p-dedup",
  alt: "The same Head of Sales is at an event, in a product signup and on a social profile, under a work email and a personal one: three dots, which become one record.",
  nodes: [
    { kind: "disc", id: "crm", x: D.src, y: D.rows[0], r: DISC, logo: LOGO.events, name: "Event" },
    { kind: "disc", id: "events", x: D.src, y: D.rows[1], r: DISC, logo: LOGO.product, name: "Product signup" },
    { kind: "stop", id: "calls", x: D.src, y: D.rows[2], r: STOP, tone: "purple-30", name: "Social profile" },
    // the two other sightings: there at frame 0, each on its own line, gone once they are one
    { kind: "dot", id: "seen-a", x: D.rec, y: D.rows[1], r: LEAD, gone: true },
    { kind: "dot", id: "seen-c", x: D.rec, y: D.rows[1], r: LEAD, gone: true },
    { kind: "dot", id: "rec", x: D.rec, y: D.rows[1], r: FOUND, ink: true, name: "Head of Sales" },
  ],
  wires: [
    { id: "w-a", line: [D.src + DISC, D.rows[0], D.rec, D.rows[1]], ink: true },
    { id: "w-b", line: [D.src + DISC, D.rows[1], D.rec, D.rows[1]], ink: true },
    { id: "w-c", line: [D.src + STOP, D.rows[2], D.rec, D.rows[1]], ink: true },
  ],
  labels: [
    { id: "n-a", x: D.rec, y: under(D.rows[0], LEAD), text: "Work email", gone: true },
    { id: "n-c", x: D.rec, y: under(D.rows[2], LEAD), text: "Personal email", gone: true },
    { id: "one", x: D.rec, y: over(D.rows[1], FOUND), text: "One record", group: true },
  ],
  steps: [
    { at: 0.3, wire: "w-a" },
    { at: 0.45, wire: "w-b" },
    { at: 0.6, wire: "w-c" },
    // three sightings of one person: their names go, then the two outer ones join the middle
    { at: 1.5, fade: ["n-a", "n-c"], to: 0, dur: 0.25 },
    { at: 1.6, move: "seen-a", from: [D.rec, D.rows[0]], with: ["w-a"], dur: 0.55 },
    { at: 1.6, move: "seen-c", from: [D.rec, D.rows[2]], with: ["w-c"], dur: 0.55 },
    { at: 2.15, fade: ["seen-a", "seen-c"], to: 0, dur: 0.15 },
    { at: 2.15, grow: "rec", from: LEAD },
    { at: 2.15, ink: ["rec", "w-a", "w-b", "w-c"] },
    { at: 2.3, rise: "one" },
  ],
  end: 3.2,
};

/* ── 3. matching: every person tied to their company ── */
const M = {
  co: [118, 245] as const,
  ceo: [290, 245] as const,
  hos: [452, 150] as const,
  hom: [452, 340] as const,
  sdr: [628, 96] as const,
  ae: [628, 204] as const,
  cr: 22,
};
const MATCHING: SpScene = {
  id: "p-matching",
  alt: "People with no tie to a company: the company’s wire reaches the CEO, then each report. The Head of Sales’ line to the company turns near-black.",
  nodes: [
    { kind: "stop", id: "co", x: M.co[0], y: M.co[1], r: M.cr, tone: "yellow-30", name: "Company" },
    { kind: "dot", id: "ceo", x: M.ceo[0], y: M.ceo[1], r: LEAD, name: "CEO" },
    { kind: "dot", id: "hos", x: M.hos[0], y: M.hos[1], r: FOUND, ink: true, name: "Head of Sales" },
    { kind: "dot", id: "hom", x: M.hom[0], y: M.hom[1], r: LEAD, name: "Head of Marketing" },
    { kind: "dot", id: "sdr", x: M.sdr[0], y: M.sdr[1], r: LEAD, name: "SDR manager" },
    { kind: "dot", id: "ae", x: M.ae[0], y: M.ae[1], r: LEAD, name: "Account Executive" },
  ],
  wires: [
    { id: "w1", d: curve(M.co[0] + M.cr, M.co[1], M.ceo[0], M.ceo[1]), ink: true },
    { id: "w2", d: curve(M.ceo[0], M.ceo[1], M.hos[0], M.hos[1]), ink: true },
    { id: "w3", d: curve(M.ceo[0], M.ceo[1], M.hom[0], M.hom[1]) },
    { id: "w4", d: curve(M.hos[0], M.hos[1], M.sdr[0], M.sdr[1]) },
    { id: "w5", d: curve(M.hos[0], M.hos[1], M.ae[0], M.ae[1]) },
  ],
  labels: [],
  steps: [
    { at: 0.3, wire: "w1", dur: 0.5 },
    { at: 0.75, wire: "w2" },
    { at: 0.9, wire: "w3" },
    { at: 1.4, wire: "w4" },
    { at: 1.55, wire: "w5" },
    // the buyer, and the line that ties them to the company
    { at: 2.25, grow: "hos", from: LEAD },
    { at: 2.25, ink: ["hos", "w1", "w2"] },
  ],
  end: 3.2,
};

/* ── 4. history: every signal, dated. Since the landing page meeting (2026-11-11) it is the
   "lead journey" feature: one lead, its touches in the order they happened ── */
const H = { y: 245, acct: 112, xs: [236, 360, 484, 608] as const, r: 10, slot: 3 };
const HISTORY: SpScene = {
  id: "p-history",
  alt: "One lead and its empty line: four touches land on it in the order they happened. Your event, a signup, a question on pricing, a reply.",
  nodes: [
    { kind: "stop", id: "acct", x: H.acct, y: H.y, r: STOP, tone: "purple-30", name: "One lead" },
    { kind: "stop", id: "d1", x: H.xs[0], y: H.y, r: H.r, tone: "pink-30", name: "Your event" },
    { kind: "stop", id: "d2", x: H.xs[1], y: H.y, r: H.r, tone: "purple-30", name: "Signed up" },
    { kind: "stop", id: "d3", x: H.xs[2], y: H.y, r: H.r, tone: "yellow-30", name: "Asked pricing" },
    { kind: "stop", id: "d4", x: H.xs[3], y: H.y, r: H.r, tone: "green-20", name: "Replied" },
    // the line's empty places, there at frame 0 (nothing is recorded yet), each gone once its
    // datapoint has landed on it
    { kind: "dot", id: "s1", x: H.xs[0], y: H.y, r: H.slot, gone: true },
    { kind: "dot", id: "s2", x: H.xs[1], y: H.y, r: H.slot, gone: true },
    { kind: "dot", id: "s3", x: H.xs[2], y: H.y, r: H.slot, gone: true },
    { kind: "dot", id: "s4", x: H.xs[3], y: H.y, r: H.slot, gone: true },
  ],
  wires: [{ id: "line", line: [H.acct + STOP, H.y, H.xs[3], H.y] }],
  labels: [
    { id: "t1", x: H.xs[0], y: over(H.y, H.r), text: "Sep 12", group: true },
    { id: "t2", x: H.xs[1], y: over(H.y, H.r), text: "Sep 30", group: true },
    { id: "t3", x: H.xs[2], y: over(H.y, H.r), text: "Oct 21", group: true },
    { id: "t4", x: H.xs[3], y: over(H.y, H.r), text: "Nov 4", group: true },
  ],
  // frame 0: the account and its line, with nothing on it. Then one datapoint every half second,
  // in the order they happened: it grows on its place, its date and its name come up
  steps: [
    { at: 0.5, grow: "d1" },
    { at: 0.5, fade: ["s1"], to: 0, dur: 0.15 },
    { at: 0.56, rise: "t1" },
    { at: 0.56, rise: "d1-name" },
    { at: 1.0, grow: "d2" },
    { at: 1.0, fade: ["s2"], to: 0, dur: 0.15 },
    { at: 1.06, rise: "t2" },
    { at: 1.06, rise: "d2-name" },
    { at: 1.5, grow: "d3" },
    { at: 1.5, fade: ["s3"], to: 0, dur: 0.15 },
    { at: 1.56, rise: "t3" },
    { at: 1.56, rise: "d3-name" },
    { at: 2.0, grow: "d4" },
    { at: 2.0, fade: ["s4"], to: 0, dur: 0.15 },
    { at: 2.06, rise: "t4" },
    { at: 2.06, rise: "d4-name" },
  ],
  end: 3.1,
};

/* ── 5. lineage: your buyer changes jobs, Pancake follows ── */
const V = { a: [140, 318] as const, old: [250, 318] as const, b: [612, 172] as const, now: [502, 172] as const, cr: 22 };
const MOVES: SpScene = {
  id: "p-moves",
  alt: "A Head of Sales leaves one company: a wire follows them to the next one, where they land as VP Sales.",
  nodes: [
    { kind: "stop", id: "a", x: V.a[0], y: V.a[1], r: V.cr, tone: "yellow-30", name: "Old company" },
    { kind: "dot", id: "old", x: V.old[0], y: V.old[1], r: LEAD, dim: true, name: "Head of Sales" },
    { kind: "stop", id: "b", x: V.b[0], y: V.b[1], r: V.cr, tone: "pink-30", name: "New company" },
    { kind: "dot", id: "now", x: V.now[0], y: V.now[1], r: FOUND, ink: true, name: "VP Sales" },
  ],
  wires: [
    { id: "wa", line: [V.a[0] + V.cr, V.a[1], V.old[0], V.old[1]] },
    { id: "follow", d: curve(V.old[0], V.old[1], V.now[0], V.now[1]), ink: true },
    { id: "wb", line: [V.now[0], V.now[1], V.b[0] - V.cr, V.b[1]], ink: true },
  ],
  labels: [],
  steps: [
    { at: 0.4, wire: "follow", dur: 0.7 },
    { at: 1.0, grow: "now" },
    { at: 1.05, wire: "wb", dur: 0.4 },
    { at: 1.25, rise: "now-name" },
    // where they were steps back
    { at: 1.5, fade: ["old", "old-name"], to: 0.45, dur: 0.3 },
  ],
  end: 2.7,
};

export const PROBLEM_SCENES: readonly SpScene[] = [SOURCES, DEDUP, MATCHING, HISTORY, MOVES];
export const PROBLEM_SCENE: Record<ProblemStoryId, SpScene> = {
  "p-sources": SOURCES,
  "p-dedup": DEDUP,
  "p-matching": MATCHING,
  "p-history": HISTORY,
  "p-moves": MOVES,
};
