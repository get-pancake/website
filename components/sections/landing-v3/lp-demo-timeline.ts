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

/** Last cue of each view (ms). At t ≥ END the frame is the end picture. */
export const END: readonly [number, number] = [5520, 6400];

/** Autoplay dwell per view (ms): the run + a ~2.2 s hold on the end picture, then the other view. */
export const DWELL: readonly [number, number] = [7720, 8600];

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
   request is the hero scroll's persistent element, already typed — so every beat moved −3980 ms. */
const SEND = 1020;
const PANCAKE: ViewCues = {
  on: [
    ["p.send", SEND], // head, Get started, cards and the chip leave; the docked input and the bubble arrive
    ["p.reply", 1520],
    ["p.prop", 2020],
    ["p.row0", 2020],
    ["p.row1", 2370],
    ["p.foot", 2720],
  ],
  sw: [["p.approved", 4040]],
  presses: [
    { target: "p.send", t0: 900, t1: SEND },
    { target: "p.go", t0: 3920, t1: 4040 },
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
    show: 3220,
    hide: END[0],
    moves: [
      { to: "p.go", t0: 3220, t1: 3920 },
      { to: "p.go", t0: 4100, t1: 4400, d: DRIFT },
    ],
    clicks: [{ t0: 3920, t1: 4040 }],
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

/* ── hero scroll (storyboard 4940:4919 → 4920 → 4981, spec §6) ───────────────────────────────
   One progress p (0 = state 01, 1 = state 03) over the scroll range below; CSS turns it into the
   poses (demo.css "hero scroll"): window scale .4956 → 1 and opacity 0 (until p .3355) → 1, head
   −28.13 px until p .5481, pills fade in after p .5481, hero copy drifts 25.54 px·p and fades
   out between p .5481 and .85.
   Range: the WINDOW's top from 299.42 px above the viewport's bottom (01: 656.58 on a 956-tall
   window) to 141 px from its top (03). The storyboard measures from the window; since V2's
   2026-10-11 update the section's top sits HS_WINDOW_INSET above it (4939:2645 is 793 tall, the
   window at section y 26), and the driver's trigger is the section, so the two constants below
   are the storyboard's numbers shifted by that inset. demo.css mirrors them (padding-top and
   the pre-script animation-range). */
/** The air above the window inside the section (demo.css `.lp-demowin { padding-top }`, ≥768). */
export const HS_WINDOW_INSET = 26;
/** p = 0: the section's top this far above the viewport's bottom (the window's: 299.42). */
export const HS_START_FROM_BOTTOM = 299.42 + HS_WINDOW_INSET; // 325.42
/** p = 1: the section's top this far under the viewport's top (the window's: 141). */
export const HS_END_FROM_TOP = 141 - HS_WINDOW_INSET; // 115

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
