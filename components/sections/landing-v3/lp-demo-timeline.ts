// lp-demo-timeline.ts — the homepage demo window's cue tables and its pure frame function
// (V2 Figma 4939:2645, demo-scroll spec §4.1 / §5.2). No DOM, no strings, no React: imported by
// the client island (LpDemoPlayer) and safe anywhere.
//
// Two views play in turn in ONE app window:
//   0 Pancake        — the V2 picture (empty state, the request already typed) is frame 0 and the
//                      server markup; the request is sent, the production Play moment replays at
//                      production's own metrics, as storyboard frame "4" (5024:8353, "Same as
//                      today") draws it (bubble, reply, Play card, the cursor presses "Create play
//                      and run search", Created), then holds.
//   1 Claude & Codex — the same request in a Claude-desktop mock: Claude plans the Play through
//                      Pancake's MCP tools, asks before creating it ("Allow once"), creates it and
//                      runs its first search.
// `frameAt(view, t)` says WHICH ids are on at `t` ms of the view (CSS owns how they look):
//   on → [data-cue]  revealed in place (.is-on)      — and [data-uncue] hidden from then (.is-off)
//   sw → [data-swap] children [data-s=before|after]  (.is-sw)
//   press → [data-press] scaled .96 while pressed     (.is-press)
//   cursor → glides between [data-cursor] targets
// Frame 0 of each view is its rest picture; END is its end picture (no cursor). The player holds
// the end picture until DWELL, then crossfades to the other view.

export type LpDemoView = 0 | 1;

/** Extra time (ms) the Pancake view rests on the designer's picture ("Ready when you are", the
 *  three cards, the chip link) before the request is sent. 0 = production's beat: the send lands
 *  1.02 s after the demo starts and 1.02 s after each return from the Claude & Codex view.
 *  ONE constant, a founder decision (verifier DT-5): 1480 holds the picture 2.5 s. Every Pancake
 *  cue, press, cursor move, END[0] and DWELL[0] shift with it; the conversation's own timing
 *  ("same as today") and the Claude & Codex view do not change. */
export const REST_HOLD = 0;

/** Last cue of each view (ms). At t ≥ END the frame is the end picture. */
export const END: readonly [number, number] = [5520 + REST_HOLD, 6400];

/** Autoplay dwell per view (ms): the run + a ~2.2 s hold on the end picture, then the other view. */
export const DWELL: readonly [number, number] = [7720 + REST_HOLD, 8600];

/** Where the cursor enters from, as a fraction of the window (just under its bottom edge: the
 *  window clips it, so it slides in from the edge). Production's CURSOR_ENTRY. */
export const CURSOR_ENTRY = { x: 0.78, y: 1.04 } as const;

type Cue = readonly [id: string, at: number];

interface ViewCues {
  /** Reveal-in-place cues ([data-cue] → .is-on; [data-uncue] → .is-off from the same time). */
  on: Cue[];
  /** Before → after swaps ([data-swap] → .is-sw). */
  sw: Cue[];
  /** Presses ([data-press] → .is-press while t0 ≤ t < t1). */
  presses: { target: string; t0: number; t1: number }[];
}

/* Pancake: production's Play tab (lib/verticals/demo-timeline.ts tab 0) minus the typing — the
   request is already typed in the designer's rest picture — so every beat moved −3980 ms
   (then + REST_HOLD: `h`). */
const SEND = 1020;
const h = (ms: number) => ms + REST_HOLD;
const PANCAKE: ViewCues = {
  on: [
    ["p.send", h(SEND)], // head, Get started, cards and the chip leave; the docked input and the bubble arrive
    ["p.reply", h(1520)],
    ["p.prop", h(2020)],
    ["p.row0", h(2020)],
    ["p.row1", h(2370)],
    ["p.foot", h(2720)],
  ],
  sw: [["p.approved", h(4040)]],
  presses: [
    { target: "p.send", t0: h(900), t1: h(SEND) },
    { target: "p.go", t0: h(3920), t1: h(4040) },
  ],
};

/* Claude & Codex (no final design: flagged). Tool titles are the MCP server's own
   (pancake-cmo packages/mcp/src/plays-tools.ts: plays_plan / plays_create / plays_run). */
const CLAUDE: ViewCues = {
  on: [
    ["c.send", SEND], // greeting, composer and Project / Manual leave; the dock and the bubble arrive
    ["c.say", 1520],
    ["c.t1", 2020],
    ["c.plan", 2920],
    ["c.ask", 3270],
    ["c.t2", 4590],
    ["c.t3", 4940],
    ["c.done", 5900],
  ],
  sw: [
    ["c.t1done", 2620],
    ["c.allowed", 4590],
    ["c.t2done", 5190],
    ["c.t3done", 5540],
  ],
  presses: [
    { target: "c.send", t0: 900, t1: SEND },
    { target: "c.allow", t0: 4470, t1: 4590 },
  ],
};

const CUES: Record<LpDemoView, ViewCues> = { 0: PANCAKE, 1: CLAUDE };

/** Cursor plan: glides between [data-cursor] targets; a post-click drift moves it off the target. */
interface Move {
  to: string;
  t0: number;
  t1: number;
  d?: readonly [number, number];
}
interface CursorPlan {
  show: number;
  hide: number;
  moves: Move[];
  /** The cursor itself is mid-click (its arrow shrinks). */
  clicks: { t0: number; t1: number }[];
}

/** After a click the cursor drifts this far down-right, off what the click revealed (production). */
const DRIFT = [28, 28] as const;

const CURSOR: Record<LpDemoView, CursorPlan> = {
  0: {
    show: h(3220),
    hide: END[0],
    moves: [
      { to: "p.go", t0: h(3220), t1: h(3920) },
      { to: "p.go", t0: h(4100), t1: h(4400), d: DRIFT },
    ],
    clicks: [{ t0: h(3920), t1: h(4040) }],
  },
  1: {
    show: 3770,
    hide: 5300,
    moves: [
      { to: "c.allow", t0: 3770, t1: 4470 },
      { to: "c.allow", t0: 4650, t1: 4950, d: DRIFT },
    ],
    clicks: [{ t0: 4470, t1: 4590 }],
  },
};

export interface LpDemoCursor {
  visible: boolean;
  /** null = CURSOR_ENTRY. */
  from: string | null;
  to: string | null;
  fromD: readonly [number, number];
  toD: readonly [number, number];
  /** Eased progress 0–1 from `from` to `to`. */
  k: number;
  click: boolean;
}

export interface LpDemoFrame {
  on: string[];
  sw: string[];
  press: string | null;
  cursor: LpDemoCursor;
  /** t ≥ END: the end picture. */
  end: boolean;
  /** Cheap identity of the class state, for diffing between frames. */
  sig: string;
}

const ZERO = [0, 0] as const;
const NO_CURSOR: LpDemoCursor = { visible: false, from: null, to: null, fromD: ZERO, toD: ZERO, k: 0, click: false };

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

function reached(list: Cue[], t: number): string[] {
  const out: string[] = [];
  for (const [id, at] of list) if (t >= at) out.push(id);
  return out;
}

function cursorAt(view: LpDemoView, t: number): LpDemoCursor {
  const plan = CURSOR[view];
  if (t < plan.show || t >= plan.hide) return NO_CURSOR;
  let from: string | null = null;
  let to: string | null = null;
  let fromD: readonly [number, number] = ZERO;
  let toD: readonly [number, number] = ZERO;
  let k = 0;
  for (const m of plan.moves) {
    if (t < m.t0) break;
    if (t < m.t1) {
      to = m.to;
      toD = m.d ?? ZERO;
      k = easeOutCubic((t - m.t0) / (m.t1 - m.t0));
      break;
    }
    // arrived: rest here until the next move starts
    from = m.to;
    to = m.to;
    fromD = m.d ?? ZERO;
    toD = fromD;
    k = 1;
  }
  const click = plan.clicks.some((c) => t >= c.t0 && t < c.t1);
  return { visible: true, from, to, fromD, toD, k, click };
}

/** Pure: the frame of `view` at `t` ms. Deterministic, seekable, no side effects. */
export function frameAt(view: LpDemoView, t: number): LpDemoFrame {
  const end = END[view];
  const tt = Math.max(0, Math.min(t, end));
  const c = CUES[view];
  const on = reached(c.on, tt);
  const sw = reached(c.sw, tt);
  const press = c.presses.find((p) => tt >= p.t0 && tt < p.t1)?.target ?? null;
  const cursor = t >= end ? NO_CURSOR : cursorAt(view, tt);
  return {
    on,
    sw,
    press,
    cursor,
    end: t >= end,
    sig: `${on.length}|${sw.length}|${press ?? ""}`,
  };
}

/** The rest picture (frame 0 = the server markup for the Pancake view). */
export const restFrame = (view: LpDemoView) => frameAt(view, 0);

/** The end picture (reduced motion shows the Claude view this way). */
export const finalFrame = (view: LpDemoView) => frameAt(view, END[view]);

/* ── the one scroll effect: the window grows a little (founder 2026-10-12, _decisions §10) ────
   The window is assembled from the first frame. On desktop the card (window + pills) grows from
   GROW_FROM to 1 about its top centre, linked to the scroll: g = 0 → 1 while the window's top
   travels from where it sits at the top of the page (the fold at most: on a first load its top
   bar peeks 70 px above the fold) up to GROW_END_AT of the viewport height, and back
   when the visitor scrolls up. lp-demo-scroll.ts writes g as --lp-demowin-grow on the card; demo.css turns it into the
   card's scale. */
/** The card's scale at g = 0 (demo.css repeats it: `0.94 + 0.06 * g`). */
export const GROW_FROM = 0.94;
/** g = 1 when the window's top reaches this share of the viewport height. */
export const GROW_END_AT = 0.35;
/** The tallest viewport the effect runs in (px). From 1450 the whole window (hero 777 + 26 +
 *  647) sits in the first viewport: it is drawn at 1. demo.css repeats it in its media query. */
export const GROW_MAX_HEIGHT = 1449;
/** Where the effect runs (demo.css uses the same query). */
export const GROW_QUERY = `(min-width: 1025px) and (max-height: ${GROW_MAX_HEIGHT}px) and (prefers-reduced-motion: no-preference)`;
/** A page that opens already scrolled: the first value eases in over this long (ms; demo.css
 *  `[data-grow-settle]` transition, 300 ms). */
export const GROW_SETTLE_MS = 300;

/* ── phones ≤767: the mobile artboard's card (5024:8631 → 5024:9506) ─────────────────────────
   The Pancake view is a fixed design box scaled as pixels (demo.css "phones"). */
/** The phone layout's media query (demo.css uses the same breakpoint). */
export const PHONE_QUERY = "(max-width: 767px)";
/** The design box's width in du (218 px ÷ 0.399025); demo.css `.lp-demowin__view { width }`. */
export const PHONE_BOX_W = 546.33;
/** F2 (decision §9, 2026-10-11): on phones the artboard draws ONE card and no pills, so the
 *  Pancake view plays once and holds its end picture, and the Claude & Codex view is never
 *  shown there. `false` brings the pills and the two-view loop back on phones (the card gets
 *  no `data-phone-solo`; demo.css keeps the rules for it). */
export const PHONE_SOLO = true;
