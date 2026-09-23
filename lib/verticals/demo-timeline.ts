// lib/verticals/demo-timeline.ts — the VxDemo cue table and its pure frame function.
// Vertical-free: no config data, no strings, no DOM. Imported by the client island
// (VxDemoPlayer) and safe to import anywhere. Spec §4.7.
//
// Model: every tab is a timeline in ms from the tab's start. `frameAt(tab, t, lens)`
// returns WHICH cue ids are on at `t` (never how they look — CSS owns that), how many
// characters are typed / streamed, and where the cursor is heading. The rest markup
// (SSR, no JS, reduced motion) is the final frame, so `frameAt(tab, endOf(tab))`
// must describe exactly what the server rendered: every cue on, every swap "after",
// nothing typed, the message ghost visible, the cursor hidden.

export type DemoTab = 0 | 1 | 2 | 3;

/** Per-prompt lengths the timeline depends on (text lengths, row counts). */
export interface DemoLens {
  /** Prompt text length (chars) — typed into the Brief composer. */
  typeLen: number;
  /** Proposal rows (3–4). */
  rows: number;
  /** Signals-page cards that switch on after approval (= proposed kinds). */
  sigs: number;
  /** Follow-up message length (chars) — streamed in the Outreach tab. */
  streamLen: number;
}

/** Autoplay dwell per tab (ms): the rest of the dwell after END holds the final frame. */
export const DWELL: readonly [number, number, number, number] = [10000, 10000, 9500, 9000];

const TYPE_START = 250;
const TYPE_MS = 18;
const SEND = 2300;
const STREAM_START = 2500;
const STREAM_MS = 14;
const STREAM_MAX = 3000;

/** The proposal card (and its first row) arrives; later rows follow every ROW_MS. */
const PROP = 3000;
const ROW_MS = 120;

const sorted = (list: Cue[]): Cue[] => [...list].sort((a, b) => a[1] - b[1]);

const streamEnd = (lens: DemoLens) => STREAM_START + Math.min(STREAM_MS * lens.streamLen, STREAM_MAX);

/** Last cue of a tab. At t ≥ END the frame is the final frame. */
export function endOf(tab: DemoTab, lens: DemoLens): number {
  if (tab === 0) return 6400;
  if (tab === 1) return 6300;
  if (tab === 2) return streamEnd(lens) + 300;
  return 5000;
}

type Cue = readonly [id: string, at: number];

interface TabCues {
  /** Reveal-in-place cues (`[data-cue]` → `.is-on`). */
  on: Cue[];
  /** Before → after swaps (`[data-swap]` → `.is-sw`). */
  sw: Cue[];
  /** State marks (`[data-mark]` → `.is-mk`), e.g. the selected lead row. */
  mk: Cue[];
}

function cuesOf(tab: DemoTab, lens: DemoLens): TabCues {
  if (tab === 0) {
    // the proposal card arrives WITH its first row; the Approve footer only once every row is in
    // (b.bubble also hides the empty conversation's starter chips: data-uncue)
    const on: Cue[] = [
      ["b.bubble", SEND],
      ["b.tool", 2480],
      ["b.reply", 2680],
      ["b.prop", PROP],
    ];
    for (let j = 0; j < lens.rows; j++) on.push([`b.row${j}`, PROP + ROW_MS * j]);
    on.push(["b.foot", PROP + ROW_MS * Math.max(0, lens.rows - 1) + 300]);
    const sw: Cue[] = [["b.approved", 5120]];
    for (let i = 0; i < lens.sigs; i++) sw.push([`b.sig${i}`, 5400 + 220 * i]);
    return { on: sorted(on), sw, mk: [] };
  }
  if (tab === 1) {
    return {
      // the table card arrives WITH row 0; the sheet with its chips, then properties, signal,
      // timeline, and its Approve footer last
      on: [
        ["l.rows", 400],
        ["l.row0", 400],
        ["l.row1", 550],
        ["l.row2", 700],
        ["l.row3", 850],
        ["l.row4", 1000],
        ["l.bad", 1200],
        ["l.drawer", 2550],
        ["l.d1", 2550],
        ["l.d2", 2700],
        ["l.d3", 2850],
        ["l.d4", 3050],
        ["l.foot", 3400],
      ],
      sw: [["l.added", 5520]],
      mk: [["l.sel", 2450]],
    };
  }
  if (tab === 2) {
    // the journey card arrives with its head (lead + status chip); while the message streams the
    // note reads "Writing from their activity…", then swaps to the Drafted note with the footnote
    const on: Cue[] = [["o.head", 200]];
    for (let k = 0; k < 6; k++) on.push([`o.s${k}`, 400 + 240 * k]);
    on.push(["o.next", 2200], ["o.foot", streamEnd(lens) + 300]);
    return { on, sw: [["o.drafted", streamEnd(lens) + 300]], mk: [] };
  }
  return {
    // "Here are the fresh leads of the day": both posts land together
    on: [
      ["s.intro", 300],
      ["s.lead0", 900],
      ["s.lead1", 1050],
    ],
    sw: [["s.approved", 3520]],
    mk: [],
  };
}

/** Cursor plan: glides between `[data-cursor]` targets, presses on arrival. */
interface Move {
  to: string;
  t0: number;
  t1: number;
  /** Offset (px) from the target's centre: the post-click drift off what was clicked. */
  d?: readonly [number, number];
}
interface Press {
  target: string;
  t0: number;
  t1: number;
  /** false = the cursor clicks but the target itself does not scale (row picks). */
  scale: boolean;
}
interface CursorPlan {
  show: number;
  hide: number;
  moves: Move[];
  presses: Press[];
}

/** After a click the cursor drifts this far down-right, off the text the click revealed. */
const DRIFT = [28, 28] as const;
const drift = (to: string, pressEnd: number): Move => ({ to, t0: pressEnd + 60, t1: pressEnd + 360, d: DRIFT });

const CURSOR: Record<DemoTab, CursorPlan | null> = {
  0: {
    show: 4300,
    hide: 6400,
    moves: [{ to: "b.approve", t0: 4300, t1: 5000 }, drift("b.approve", 5120)],
    presses: [{ target: "b.approve", t0: 5000, t1: 5120, scale: true }],
  },
  1: {
    show: 1800,
    hide: 6300,
    moves: [
      { to: "l.pick", t0: 1800, t1: 2450 },
      drift("l.pick", 2450),
      { to: "l.approve", t0: 4700, t1: 5400 },
      drift("l.approve", 5520),
    ],
    presses: [
      { target: "l.pick", t0: 2330, t1: 2450, scale: false },
      { target: "l.approve", t0: 5400, t1: 5520, scale: true },
    ],
  },
  2: null,
  3: {
    // Slack: "Approved" replaces the buttons and "Open in Pancake" sits under them, so the
    // cursor fades out 200ms after the click instead of drifting onto the link
    show: 2700,
    hide: 3720,
    moves: [{ to: "s.approve", t0: 2700, t1: 3400 }],
    presses: [{ target: "s.approve", t0: 3400, t1: 3520, scale: true }],
  },
};

/** Where the cursor enters from, as a fraction of the stage (just under its bottom edge). */
export const CURSOR_ENTRY = { x: 0.78, y: 1.04 } as const;

export interface DemoCursor {
  visible: boolean;
  /** null = CURSOR_ENTRY. */
  from: string | null;
  to: string | null;
  /** Pixel offsets from the `from` / `to` targets' centres (post-click drifts). */
  fromD: readonly [number, number];
  toD: readonly [number, number];
  /** Eased progress 0–1 from `from` to `to`. */
  k: number;
  /** Target currently pressed (scale .96), if any. */
  press: string | null;
  /** The cursor itself is mid-click. */
  click: boolean;
}

export interface DemoFrame {
  /** Number of `on` cues reached (the cue lists are sorted, so a count is the set). */
  on: string[];
  sw: string[];
  mk: string[];
  /** Characters typed into the Brief composer (0 = placeholder shown). */
  typed: number;
  /** null = final message (ghost visible); n = streaming, n chars in the live span. */
  stream: number | null;
  cursor: DemoCursor;
  /** t ≥ END. */
  end: boolean;
  /** Cheap identity of the class state, for diffing between frames. */
  sig: string;
}

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

function reached(list: Cue[], t: number): string[] {
  const out: string[] = [];
  for (const [id, at] of list) if (t >= at) out.push(id);
  return out;
}

const ZERO = [0, 0] as const;
const NO_CURSOR: DemoCursor = { visible: false, from: null, to: null, fromD: ZERO, toD: ZERO, k: 0, press: null, click: false };

function cursorAt(tab: DemoTab, t: number): DemoCursor {
  const plan = CURSOR[tab];
  if (!plan) return NO_CURSOR;
  const visible = t >= plan.show && t < plan.hide;
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
  let press: string | null = null;
  let click = false;
  for (const p of plan.presses) {
    if (t >= p.t0 && t < p.t1) {
      click = true;
      if (p.scale) press = p.target;
    }
  }
  return { visible, from, to, fromD, toD, k, press, click };
}

/** Pure: the frame of `tab` at `t` ms. Deterministic, seekable, no side effects. */
export function frameAt(tab: DemoTab, t: number, lens: DemoLens): DemoFrame {
  const end = endOf(tab, lens);
  const tt = Math.max(0, Math.min(t, end));
  const c = cuesOf(tab, lens);
  const on = reached(c.on, tt);
  const sw = reached(c.sw, tt);
  const mk = reached(c.mk, tt);

  let typed = 0;
  if (tab === 0 && tt >= TYPE_START && tt < SEND) {
    typed = Math.min(lens.typeLen, Math.floor((tt - TYPE_START) / TYPE_MS) + 1);
  }

  let stream: number | null = null;
  if (tab === 2) {
    const se = streamEnd(lens);
    if (tt < se + 300) {
      // armed: nothing until the stream starts, then the live span fills, then the ghost returns
      const perChar = (se - STREAM_START) / Math.max(1, lens.streamLen);
      stream = tt < STREAM_START ? 0 : Math.min(lens.streamLen, Math.floor((tt - STREAM_START) / perChar) + 1);
    }
  }

  const cursor = t >= end ? NO_CURSOR : cursorAt(tab, tt);
  return {
    on,
    sw,
    mk,
    typed,
    stream,
    cursor,
    end: t >= end,
    sig: `${on.length}|${sw.length}|${mk.length}|${cursor.press ?? ""}`,
  };
}

/** Every cue id of a tab (the final frame = all of them). */
export function finalFrame(tab: DemoTab, lens: DemoLens): DemoFrame {
  return frameAt(tab, endOf(tab, lens), lens);
}
