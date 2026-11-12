// No "use client" on purpose: a plain module, reached only through LpVisionStepAnim's import()
// (lp-play-once loads it with GSAP, out of the page's first bundle).
import { gsap } from "@/lib/gsap";

import { ART_SOURCES } from "./lp-toy-art";
import {
  TOY_EASE,
  TOY_STEP,
  toyAlong,
  toyDecode,
  toyGone,
  toyHideAlong,
  toyHideHop,
  toyHidePop,
  toyHideRise,
  toyHop,
  toyLeave,
  toyPop,
  toyQuery,
  toyRise,
  toyShow,
} from "./lp-toy-kit";

/**
 * The takes of the three toy pictures of the 1-2-3 (LpToySteps.tsx, 2026-11-12), one per card,
 * played by lp-play-once as its card reaches the reader.
 *   t1  the four sources connect one after the other: its mark lights, its cable draws in, what
 *       it sends comes up, a bead runs down the cable into the machine. The machine turns (the
 *       beads on its turntable), a row hops out for each bead and the two piles come up, with
 *       their counts
 *   t2  the radar's beam comes on and turns once; each time it passes a signal a ring opens on
 *       the face, a bead lands in it and what it says comes up; the beam fades, a line connects
 *       the dots into the account, which lifts a little and warms
 *   t3  the Brain wakes (a ripple through its hubs); signals run in from its points, hub by hub,
 *       to the centre, which swells; a tag comes up on three hubs; two ideas drop out and land
 *       under it, then the next best Play comes up
 * The contract of the page's timelines (lp-vision-step-timelines.ts): the markup is the picture;
 * every piece is looked up before anything is written (a missing piece throws there and the
 * server's picture stands); frame 0 is a block of gsap.set; the timeline holds tweens only (an
 * instant change is a 1 ms tween), so it can be seeked both ways (QA: window.__lpStep.t1).
 * The feel is lp-toy-kit.ts's (TOY_EASE).
 *
 * THE PICTURES GO ROUND (founder, 2026-11-12: "pas qu'elles s'arrêtent à la fin, mais qu'elles
 * redémarrent", and each round "peut display des trucs différents"). A take is one timeline in
 * two parts. The opening builds the picture from nothing and ends on it: that time is the
 * take's `loop`. What follows is the round the card then plays for as long as it is looked at
 * (lp-play-once `loop`): it holds the picture, shows something else (other sources, another
 * account, a Brain that changed), holds that, and comes back to the picture, so that its last
 * frame is the frame at `loop` and the round starts again without a jump. A piece a round plays
 * twice is tweened twice: a tween reads where its piece is when it starts, so each part leaves
 * its pieces where the next one expects them.
 */

type Timeline = gsap.core.Timeline;
type Built = { tl: Timeline; cleanup: () => void; cue: number; loop: number; next?: () => void };
type Point = readonly [number, number];

/** s a picture holds before it changes */
const HOLD = 2.4;

const fmt = (n: number) => n.toLocaleString("en-US");
const num = (el: HTMLElement, key: string) => Number(el.dataset[key]);
const CLOSED = "inset(0% 0% 100% 0%)";
const OPEN = "inset(0% 0% 0% 0%)";

/**
 * GSAP `toyCount` plugin: a table's count, as a seek-safe step (lp-gsap-txt's rule: the new
 * value at or after the tween's position, the one before it otherwise). The element shows it
 * over its `data-base`, which is what the rounds before this one added: the timeline goes round,
 * the count goes on (buildT1's `next`).
 */
type CountData = { t: HTMLElement; end: number; start: number | null; text: string | null };
let countRegistered = false;
function registerCountPlugin() {
  if (countRegistered) return;
  countRegistered = true;
  gsap.registerPlugin({
    name: "toyCount",
    init(this: CountData, target: HTMLElement, value: unknown) {
      this.t = target;
      this.end = Number(value);
      // (no count written yet: before this tween the element shows the markup's own text)
      const n = target.dataset.n;
      this.start = n === undefined ? null : Number(n);
      this.text = target.textContent;
    },
    render(ratio: number, data: CountData) {
      if (ratio < 1 && data.start === null) {
        delete data.t.dataset.n;
        data.t.textContent = data.text;
        return;
      }
      const n = ratio >= 1 ? data.end : (data.start ?? 0);
      data.t.dataset.n = String(n);
      data.t.textContent = fmt(n + (Number(data.t.dataset.base) || 0));
    },
  });
}

/**
 * GSAP `toyOrbit` plugin: a bead rides the turntable. The ring is a circle of the set, so an
 * ellipse of the picture (`rx`, `ry`); the bead rests at `rest` on it (in turns from the ring's
 * right, where the markup lays it) and this tween takes it from `from` to `to` turns past its
 * rest. A pure function of the tween's progress, so the take can be seeked both ways.
 * (Until 2026-11-12 CSS placed the bead, from a custom property the take tweened. The beads
 * never moved: the first time GSAP transforms an element it folds the element's own `translate`
 * into its transform and sets `translate: none`.)
 */
type Orbit = { rest: number; from: number; to: number; rx: number; ry: number };
type OrbitData = Orbit & { setX: (v: number) => void; setY: (v: number) => void };
let orbitRegistered = false;
function registerOrbitPlugin() {
  if (orbitRegistered) return;
  orbitRegistered = true;
  gsap.registerPlugin({
    name: "toyOrbit",
    init(this: OrbitData, target: HTMLElement, value: Orbit) {
      Object.assign(this, value);
      this.setX = gsap.quickSetter(target, "x", "px") as (v: number) => void;
      this.setY = gsap.quickSetter(target, "y", "px") as (v: number) => void;
    },
    render(ratio: number, data: OrbitData) {
      const rest = data.rest * 2 * Math.PI;
      const a = rest + (data.from + (data.to - data.from) * ratio) * 2 * Math.PI;
      data.setX((Math.cos(a) - Math.cos(rest)) * data.rx);
      data.setY((Math.sin(a) - Math.sin(rest)) * data.ry);
    },
  });
}

/* ── 01 · your sources plug in, the machine turns, the tables come up ── */

/** what a row adds to its table once the piles are full, row after row (companies, people) */
const T1_ADDS: Record<string, readonly number[]> = { l: [118, 96, 142, 87, 131], r: [312, 268, 402, 236, 351] };

function buildT1(stage: HTMLElement): Built {
  const q = toyQuery(stage, "t1");
  const art = ART_SOURCES;
  const byDock = (a: HTMLElement, b: HTMLElement) => num(a, "dock") - num(b, "dock");
  /** the sources that hold the docks by turns: the page's four, then four more (LpToySteps.tsx) */
  const sourcesOf = (set: number) => {
    const pick = (sel: string) => q.all(`${sel}[data-set="${set}"]`).sort(byDock);
    const sources = { marks: pick(".lp-t1-mark"), names: pick(".lp-t1-name"), sends: pick(".lp-t1-send") };
    if (sources.marks.length !== 4 || sources.names.length !== 4 || sources.sends.length !== 4) throw new Error("lp-toy t1: four sources a set, a name and a badge each");
    return sources;
  };
  const sets = [sourcesOf(0), sourcesOf(1)];
  const cables = q.all(".lp-t1-cable").sort(byDock);
  /** a round's beads, and the row each one becomes */
  const roundOf = (id: string) => {
    const round = { tokens: q.all(`.lp-t1-token[data-round="${id}"]`), rows: q.all(`.lp-t1-row[data-round="${id}"]`) };
    if (round.tokens.length < 4 || round.tokens.length !== round.rows.length) throw new Error("lp-toy t1: a row for each bead");
    return round;
  };
  const rounds = { open: roundOf("open"), b: roundOf("b"), a: roundOf("a") };
  const riders = q.all(".lp-t1-rider");
  const glow = q.one(".lp-t1-hub");
  const pile = (side: string) => q.all(`.lp-t1-pile[data-side="${side}"]`).sort((a, b) => num(a, "n") - num(b, "n"));
  const piles: Record<string, HTMLElement[]> = { l: pile("l"), r: pile("r") };
  const counts: Record<string, { el: HTMLElement; to: number }> = {};
  for (const side of ["l", "r"]) {
    const el = q.one(`.lp-t1-table[data-side="${side}"] em`);
    counts[side] = { el, to: num(el, "to") || 0 };
  }
  if (cables.length !== 4) throw new Error("lp-toy t1: a cable a dock");
  /** a full pile: its drawing, and how many drawings a full pile has as it rolls */
  const full = piles.l.findIndex((img) => img.dataset.on !== undefined);
  const roll = piles.l.length - full;
  if (full < 1 || roll < 1 || piles.r.length !== piles.l.length) throw new Error("lp-toy t1: the two piles, at every height");
  registerCountPlugin();
  registerOrbitPlugin();
  toyDecode(stage);

  const path = (dock: number) => (art.paths as unknown as Record<string, readonly Point[]>)[`cable${dock}`];
  const anchor = (name: string) => (art.anchors as unknown as Record<string, Point>)[name];
  const everyRound = [rounds.open, rounds.b, rounds.a];

  // frame 0: nothing connected, the machine at rest, the two feet empty
  const set = gsap.set;
  set(sets[0].marks, { opacity: 0.45, scale: 0.86 });
  set(sets[0].names, { opacity: 0.45 });
  set(sets[1].marks, { autoAlpha: 0, scale: 0.7 });
  set(sets[1].names, { autoAlpha: 0 });
  set(cables, { clipPath: CLOSED });
  toyHideRise([...sets[0].sends, ...sets[1].sends], 8);
  toyHidePop(riders, 0.4);
  set(glow, { "--toy-glow": 0 });
  for (const side of ["l", "r"]) {
    piles[side].forEach((img, n) => set(img, { autoAlpha: n === 0 ? 1 : 0 }));
    set(counts[side].el, { toyCount: 0 });
  }
  for (const round of everyRound) {
    round.tokens.forEach((token) => toyHideAlong(token, path(num(token, "dock")), path(num(token, "dock"))[0]));
    round.rows.forEach((row) => {
      const side = row.dataset.side ?? "l";
      toyHideHop(row, anchor(`pile-${side}-mouth`), anchor(`pile-${side}-row${num(row, "row")}`), 0.3);
    });
  }

  const tl = gsap.timeline({ paused: true });
  /** a bead takes this long down its cable; then the row is on its way out */
  const RUN = 0.5;
  const INSIDE = 0.14;
  const HOP = 0.44;
  /** rows landed on each pile, and what each table counts, over the whole take */
  const landed: Record<string, number> = { l: 0, r: 0 };
  const counted: Record<string, number> = { l: 0, r: 0 };
  /** the drawing of a pile after `n` rows: it fills, then it rolls */
  const pileAfter = (side: string, n: number) => piles[side][n <= full ? n : full + ((n - full) % roll)];

  /** A round's beads: each leaves its dock at its time and runs down its cable into the
      machine; the row it becomes hops out onto its pile, and its table counts it. */
  const feed = (round: { tokens: HTMLElement[]; rows: HTMLElement[] }, leaves: readonly number[]) => {
    round.tokens.forEach((token, k) => {
      const line = path(num(token, "dock"));
      const t = leaves[k];
      toyPop(tl, token, t, 0.25);
      toyAlong(tl, token, line, line[0], t, RUN);
      toyGone(tl, token, t + RUN);
      // the row it becomes: out of the machine's mouth, onto its pile
      const row = round.rows[k];
      const side = row.dataset.side ?? "l";
      const out = t + RUN + INSIDE;
      toyHop(tl, row, anchor(`pile-${side}-mouth`), anchor(`pile-${side}-row${num(row, "row")}`), out, HOP, 22);
      const lands = out + HOP;
      const n = (landed[side] += 1);
      const before = pileAfter(side, n - 1);
      const after = pileAfter(side, n);
      toyGone(tl, row, lands);
      toyGone(tl, before, lands);
      toyShow(tl, after, lands);
      // (the pile gives a little under the row that lands on it)
      tl.fromTo(after, { scaleY: 0.955 }, { scaleY: 1, duration: 0.26, ease: "power2.out", transformOrigin: "50% 100%", force3D: false, immediateRender: false }, lands);
      // its table counts it: a fifth of the table's rows while the pile fills, then what a row adds
      const count = counts[side];
      const was = counted[side];
      const now = n <= full ? Math.round((count.to * n) / full) : was + T1_ADDS[side][(n - full - 1) % T1_ADDS[side].length];
      counted[side] = now;
      for (let step = 1; step <= 3; step++) {
        tl.to(count.el, { toyCount: Math.round(was + ((now - was) * step) / 3), duration: TOY_STEP, ease: "none" }, lands + (step - 1) * 0.06);
      }
    });
  };
  /** the riders' rest on the turntable (the markup's), the ring, and how far it has turned */
  const rests = riders.map((rider) => num(rider, "rest") || 0);
  const ring = { rx: anchor("ring-x")[0] - anchor("ring-o")[0], ry: anchor("ring-z")[1] - anchor("ring-o")[1] };
  let turned = 0;
  /** the machine turns from the first bead in to the last row out: whole turns, so that the
      riders are back on their rest when it stops */
  const turn = (leaves: readonly number[], turns: number) => {
    const from = leaves[0] + RUN;
    const to = leaves[leaves.length - 1] + RUN + INSIDE + HOP + 0.25;
    const was = turned;
    turned += turns;
    riders.forEach((rider, i) => tl.to(rider, { toyOrbit: { rest: rests[i], from: was, to: turned, ...ring }, duration: to - from, ease: "power1.inOut" }, from));
    return to;
  };

  /* ── the opening: the four sources connect one after the other ── */
  const FIRST = 0.4;
  const EVERY = 0.62;
  // when each bead leaves its dock: one per source as it connects, then the others, closer
  const opens = rounds.open.tokens.map((_, k) => (k < 4 ? FIRST + k * EVERY + 0.32 : FIRST + 3 * EVERY + 0.32 + (k - 3) * 0.3));
  sets[0].marks.forEach((mark, i) => {
    const t = FIRST + i * EVERY;
    tl.to(mark, { opacity: 1, duration: 0.14, ease: "power1.out" }, t);
    tl.to(mark, { scale: 1, duration: 0.4, ease: TOY_EASE.pop, force3D: false }, t);
    tl.to(sets[0].names[i], { opacity: 1, duration: 0.2, ease: "power1.out" }, t);
    tl.to(cables[i], { clipPath: OPEN, duration: 0.3, ease: "power2.out" }, t + 0.06);
    // what it sends: up as it connects, gone as the one after the next comes up
    toyRise(tl, sets[0].sends[i], t + 0.1);
    toyLeave(tl, sets[0].sends[i], t + 2 * EVERY - 0.1);
  });
  tl.to(glow, { "--toy-glow": 1, duration: 0.3, ease: "power1.out" }, opens[0] + RUN);
  // (each rider joins as its source's first bead comes in; all ride the same turns)
  riders.forEach((rider, i) => toyPop(tl, rider, opens[i] + RUN, 0.35));
  feed(rounds.open, opens);
  /** the picture: the four sources connected, the two piles full */
  const picture = turn(opens, 3) + 0.2;

  /* ── the round: other sources take the docks, then the first four are back ── */
  const SWAP = 0.55;
  /** The docks change hands, left to right: the source that held each one leaves it (its mark,
      its name, its cable), another connects in its place and says what it sends. */
  const swap = (from: (typeof sets)[number], to: (typeof sets)[number], at: number) => {
    for (let i = 0; i < 4; i++) {
      const t = at + i * SWAP;
      tl.to(from.marks[i], { autoAlpha: 0, scale: 0.7, duration: 0.16, ease: "power1.in", force3D: false }, t);
      tl.to(from.names[i], { autoAlpha: 0, duration: 0.14, ease: "power1.in" }, t);
      tl.to(cables[i], { clipPath: CLOSED, duration: 0.16, ease: "power1.in" }, t);
      toyPop(tl, to.marks[i], t + 0.18, 0.4);
      tl.to(to.names[i], { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, t + 0.18);
      tl.to(cables[i], { clipPath: OPEN, duration: 0.3, ease: "power2.out" }, t + 0.24);
      // (its badge left upwards the last time it showed: back under its place first)
      tl.to(to.sends[i], { y: 8, duration: TOY_STEP, ease: "none" }, t + 0.26);
      toyRise(tl, to.sends[i], t + 0.28);
      toyLeave(tl, to.sends[i], t + 0.28 + 2 * SWAP - 0.12);
    }
  };
  let t = picture;
  for (const [from, to, round] of [
    [sets[0], sets[1], rounds.b],
    [sets[1], sets[0], rounds.a],
  ] as const) {
    t += HOLD;
    swap(from, to, t);
    const leaves = round.tokens.map((_, k) => (k < 4 ? t + k * SWAP + 0.52 : t + 3 * SWAP + 0.52 + (k - 3) * 0.3));
    feed(round, leaves);
    t = turn(leaves, 2) + 0.2;
  }
  // (the round ends on the picture it started from: the tables have grown, that is all)
  tl.to(stage, { duration: TOY_STEP }, t);
  /** what a round added to each table: the next one counts on from there */
  const grown: Record<string, number> = { l: counted.l - counts.l.to, r: counted.r - counts.r.to };
  return {
    tl,
    cue: 0,
    loop: picture,
    next() {
      for (const side of ["l", "r"]) {
        const el = counts[side].el;
        el.dataset.base = String((Number(el.dataset.base) || 0) + grown[side]);
      }
    },
    cleanup() {
      for (const side of ["l", "r"]) delete counts[side].el.dataset.base;
    },
  };
}

/* ── 02 · a radar over one account: the signals land, a line connects the dots ── */

function buildT2(stage: HTMLElement): Built {
  const q = toyQuery(stage, "t2");
  /** a scan's pieces (LpToySteps.tsx SCANS): "a" is the picture, "b" the next round's */
  const scanOf = (id: string) => {
    const all = <T extends Element = HTMLElement>(sel: string) => q.all<T>(`${sel}[data-round="${id}"]`);
    const scan = {
      beam: q.one(`.lp-t2-beam[data-round="${id}"]`),
      pieces: all(".lp-t2-blip"),
      pings: all(".lp-t2-ping"),
      says: all(".lp-t2-says"),
      who: q.one(`.lp-t2-who[data-round="${id}"]`),
      line: q.all<SVGPathElement>(`.lp-t2-line[data-round="${id}"] path`),
    };
    if (scan.pieces.length < 2 || scan.pings.length !== scan.pieces.length || scan.says.length !== scan.pieces.length || scan.line.length !== scan.pieces.length) {
      throw new Error("lp-toy t2: a ring, a badge and a stretch of the line for each signal");
    }
    // how long each stretch of the line is: it is drawn at a steady pace
    return { ...scan, lengths: scan.line.map((path) => path.getTotalLength()), from: num(scan.beam, "from"), way: num(scan.beam, "way") < 0 ? -1 : 1 };
  };
  const first = scanOf("a");
  const other = scanOf("b");
  const heat = q.one(".lp-t2-heat");
  const account = q.one(".lp-t2-account");
  toyDecode(stage);

  // frame 0: the radar and the account as you know it; nothing has landed
  const set = gsap.set;
  for (const scan of [first, other]) {
    set(scan.beam, { autoAlpha: 0, rotation: scan.from });
    toyHidePop(scan.pieces, 0.3);
    set(scan.pings, { autoAlpha: 0, scale: 0.3 });
    toyHideRise(scan.says, 6);
    // (autoRound off: GSAP would round a length in px to a whole number, and a dash offset
    // that goes from 1 to 0 would jump at its middle: the line would appear at once)
    set(scan.line, { autoAlpha: 0, strokeDashoffset: 1, autoRound: false });
  }
  toyHideRise(other.who, 6);
  set(heat, { autoAlpha: 0, scale: 0.6 });

  const tl = gsap.timeline({ paused: true });
  /** the beam turns once in … and the line is drawn in … */
  const TURN = 3.1;
  const TRACE = 1.7;
  /** A scan: the beam comes on and turns once; each time it passes a signal a ring opens on the
      face, the piece lands in it and what it says comes up; the beam fades, the line goes from
      dot to dot into the account, which lifts a little and warms. Returns when it has. */
  const scanAt = (scan: typeof first, at: number) => {
    tl.to(scan.beam, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, at);
    tl.to(scan.beam, { rotation: scan.from + scan.way * 360, duration: TURN, ease: "none", force3D: false }, at);
    scan.pieces.forEach((piece, k) => {
      const t = at + (Math.abs(num(piece, "at") - scan.from) / 360) * TURN;
      tl.to(scan.pings[k], { autoAlpha: 0.9, duration: 0.08, ease: "none" }, t);
      tl.to(scan.pings[k], { scale: 1.9, duration: 0.7, ease: "power2.out", force3D: false }, t);
      tl.to(scan.pings[k], { autoAlpha: 0, duration: 0.45, ease: "power1.in" }, t + 0.25);
      toyPop(tl, piece, t + 0.04, 0.4);
      toyRise(tl, scan.says[k], t + 0.16);
    });
    // the beam has gone round: it fades, and the line connects the dots, one after the other
    const done = at + TURN;
    tl.to(scan.beam, { autoAlpha: 0, duration: 0.4, ease: "power1.in" }, done - 0.1);
    const whole = scan.lengths.reduce((sum, length) => sum + length, 0) || 1;
    let t = done + 0.2;
    scan.line.forEach((path, k) => {
      const takes = Math.max(0.16, (TRACE * scan.lengths[k]) / whole);
      tl.to(path, { autoAlpha: 1, duration: TOY_STEP, ease: "none" }, t);
      tl.to(path, { strokeDashoffset: 0, duration: takes, ease: "power1.inOut", autoRound: false }, t);
      t += takes;
      // (the dot the line reaches answers)
      const reached = scan.pieces[k + 1];
      if (reached) tl.to(reached, { keyframes: [{ scale: 1.22, duration: 0.12, ease: "power2.out" }, { scale: 1, duration: 0.26, ease: "power2.inOut" }], force3D: false }, t - 0.08);
    });
    // the account takes it in: it lifts a little, and warms
    const lands = t - 0.1;
    tl.to(heat, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power2.out", force3D: false }, lands);
    tl.to(account, { keyframes: [{ y: -5, duration: 0.16, ease: "power2.out" }, { y: 0, duration: 0.3, ease: TOY_EASE.pop }], force3D: false }, lands);
    return lands + 0.75;
  };
  /** What a scan left goes (its dots, what they say, the line), the account cools, and another
      account takes its place. Every piece ends where a scan finds it. Returns when it is clear. */
  const clearAt = (scan: typeof first, next: typeof first, at: number) => {
    scan.says.forEach((say, k) => toyLeave(tl, say, at + k * 0.04));
    scan.pieces.forEach((piece, k) => tl.to(piece, { autoAlpha: 0, scale: 0.3, duration: 0.22, ease: "power1.in", force3D: false }, at + 0.05 + k * 0.04));
    tl.to(scan.line, { autoAlpha: 0, duration: 0.25, ease: "power1.in" }, at);
    tl.to(heat, { autoAlpha: 0, scale: 0.6, duration: 0.35, ease: "power1.in", force3D: false }, at);
    const reset = at + 0.45;
    tl.to(scan.line, { strokeDashoffset: 1, duration: TOY_STEP, ease: "none", autoRound: false }, reset);
    tl.to(scan.says, { y: 6, duration: TOY_STEP, ease: "none" }, reset);
    tl.to(scan.pings, { scale: 0.3, duration: TOY_STEP, ease: "none" }, reset);
    tl.to(scan.beam, { rotation: scan.from, duration: TOY_STEP, ease: "none" }, reset);
    // the account changes: its name goes, the piece turns over, the other name comes up
    const swaps = at + 0.2;
    toyLeave(tl, scan.who, swaps);
    tl.to(account, { keyframes: [{ y: -9, scaleX: 0.86, duration: 0.18, ease: "power2.out" }, { y: 0, scaleX: 1, duration: 0.32, ease: TOY_EASE.pop }], force3D: false }, swaps + 0.08);
    tl.to(next.who, { y: 6, duration: TOY_STEP, ease: "none" }, swaps + 0.2);
    toyRise(tl, next.who, swaps + 0.24);
    return swaps + 0.6;
  };

  /* the opening: the first scan, onto the picture */
  const picture = scanAt(first, 0.3);
  /* the round: the picture holds, the radar scans another account, holds, and comes back */
  let t = clearAt(first, other, picture + HOLD);
  t = scanAt(other, t);
  t = clearAt(other, first, t + HOLD);
  t = scanAt(first, t);
  tl.to(stage, { duration: TOY_STEP }, t);
  return { tl, cue: 0, loop: picture, cleanup() {} };
}

/* ── 03 · the Brain: signals run in, ideas come out, the next best Play ── */

function buildT3(stage: HTMLElement): Built {
  const q = toyQuery(stage, "t3");
  const data = (el: Element, key: string) => (el as HTMLElement).dataset[key] ?? "";
  const halo = q.one(".lp-t3-halo");
  const centre = q.one<SVGCircleElement>(".lp-t3-centre");
  const hubs = q.all<SVGCircleElement>(".lp-t3-hub");
  const hubOf = (id: string) => hubs.find((hub) => data(hub, "hub") === id);
  /** the points that come and go from one round to the next: each with its branch and the ring
      that marks it */
  const pointsOf = (kind: string) =>
    q.all<SVGCircleElement>(`.lp-t3-dot[data-kind="${kind}"]`).map((dot) => {
      const same = `[data-kind="${kind}"][data-hub="${data(dot, "hub")}"][data-n="${data(dot, "n")}"]`;
      return { dot, edge: q.one<SVGPathElement>(`.lp-t3-edge${same}`), ring: q.one(`.lp-t3-ring${same}`) };
    });
  const goes = pointsOf("goes");
  const comes = pointsOf("comes");
  /** a round's pieces (LpToySteps.tsx THOUGHTS): "a" is the picture, "b" the next round's */
  const thoughtOf = (id: string) => {
    const thought = {
      tags: q.all(`.lp-t3-tag[data-round="${id}"]`),
      runs: q.all(`.lp-t3-run[data-round="${id}"]`),
      ideas: q.all(`.lp-t3-idea[data-round="${id}"]`),
      play: q.one(`.lp-t3-play[data-round="${id}"]`),
    };
    if (!thought.tags.length || !thought.runs.length || !thought.ideas.length) throw new Error("lp-toy t3: the Brain's tags, its signals and its ideas");
    return thought;
  };
  const first = thoughtOf("a");
  const other = thoughtOf("b");
  if (!hubs.length || !goes.length || !comes.length) throw new Error("lp-toy t3: the Brain's hubs, and the points that come and go");
  const heart: Point = [Number(centre.getAttribute("cx")), Number(centre.getAttribute("cy"))];
  /** where an idea rests: it flies there from the centre */
  const restOf = (el: HTMLElement): Point => [parseFloat(el.style.left), parseFloat(el.style.top)];
  /** an idea before it comes out: on the centre, small */
  const inHeart = (idea: HTMLElement) => {
    const rest = restOf(idea);
    return { x: heart[0] - rest[0], y: heart[1] - rest[1], scale: 0.3 };
  };
  const PLAY_AWAY = { autoAlpha: 0, y: 16, scale: 0.92 };
  const HALO_LOW = { opacity: 0.3, scale: 0.78 };

  // frame 0: the Brain, whole and still; no tag on it, no idea yet
  const set = gsap.set;
  // (a point of the graph swells from its own middle)
  set([centre, ...hubs, ...q.all(".lp-t3-dot")], { transformOrigin: "50% 50%" });
  set(halo, HALO_LOW);
  for (const point of comes) {
    set(point.dot, { autoAlpha: 0, scale: 0 });
    // (autoRound off: buildT2 has why)
    set(point.edge, { autoAlpha: 0, strokeDashoffset: 1, autoRound: false });
  }
  set(
    [...goes, ...comes].map((point) => point.ring),
    { autoAlpha: 0, scale: 0.4 },
  );
  for (const thought of [first, other]) {
    toyHidePop(thought.tags, 0.6);
    set(thought.runs, { autoAlpha: 0, scale: 0.5 });
    thought.ideas.forEach((idea) => set(idea, { autoAlpha: 0, ...inHeart(idea) }));
    set(thought.play, PLAY_AWAY);
  }

  const tl = gsap.timeline({ paused: true });
  /** a hub, or the centre, swells and settles: what a signal does to it as it passes */
  const swell = (el: gsap.TweenTarget, at: number, by: number) =>
    tl.to(el, { keyframes: [{ scale: by, duration: 0.16, ease: "power2.out" }, { scale: 1, duration: 0.34, ease: "power2.inOut" }] }, at);

  /** The Brain thinks: signals run in, each from a point to its hub, then on to the centre. The
      first one through a hub brings up the hub's tag. The centre swells, the ideas come out one
      after the other, then the Play it recommends. Returns when the reader has had the time to
      read it. */
  const thinkAt = (thought: typeof first, at: number) => {
    const EVERY = 0.2;
    const TO_HUB = 0.26;
    const TO_HEART = 0.34;
    const tagged = new Set<string>();
    let lastIn = at;
    thought.runs.forEach((run, k) => {
      const id = data(run, "hub");
      const hub = hubOf(id);
      if (!hub) throw new Error("lp-toy t3: a signal without its hub");
      const from: Point = [num(run, "x"), num(run, "y")];
      const via: Point = [num(run, "hx"), num(run, "hy")];
      const t = at + k * EVERY;
      tl.to(run, { autoAlpha: 1, scale: 1, duration: 0.12, ease: "power1.out", force3D: false }, t);
      tl.to(run, { x: via[0] - from[0], y: via[1] - from[1], duration: TO_HUB, ease: "power1.in", force3D: false }, t + 0.06);
      const reaches = t + 0.06 + TO_HUB;
      swell(hub, reaches - 0.04, 1.6);
      const tag = thought.tags.find((el) => data(el, "hub") === id);
      if (tag && !tagged.has(id)) {
        tagged.add(id);
        toyPop(tl, tag, reaches, 0.4);
      }
      tl.to(run, { x: heart[0] - from[0], y: heart[1] - from[1], duration: TO_HEART, ease: "power1.inOut", force3D: false }, reaches);
      lastIn = reaches + TO_HEART;
      tl.to(run, { autoAlpha: 0, scale: 0.4, duration: 0.1, ease: "power1.in", force3D: false }, lastIn - 0.06);
      // (the centre takes each one in: its light grows)
      tl.to(halo, { opacity: 0.5 + 0.1 * k, scale: 0.84 + 0.035 * k, duration: 0.2, ease: "power1.out", force3D: false }, lastIn - 0.05);
    });
    // (a tag whose hub no signal went through comes up with the last of them)
    thought.tags.filter((tag) => !tagged.has(data(tag, "hub"))).forEach((tag) => toyPop(tl, tag, lastIn - 0.2, 0.4));
    // they cross: the centre swells, and the ideas come out, one after the other
    const thinks = lastIn + 0.05;
    swell(centre, thinks, 1.4);
    tl.to(halo, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out", force3D: false }, thinks);
    let t = thinks + 0.22;
    thought.ideas.forEach((idea) => {
      // (it drops out under the Brain, then goes to its side: clear of the tags)
      tl.to(idea, { autoAlpha: 1, duration: 0.1, ease: "none" }, t);
      tl.to(idea, { y: 0, duration: 0.5, ease: "power2.out", force3D: false }, t);
      tl.to(idea, { x: 0, duration: 0.5, ease: "power2.inOut", force3D: false }, t);
      tl.to(idea, { scale: 1, duration: 0.5, ease: TOY_EASE.pop, force3D: false }, t);
      t += 0.38;
    });
    // and the one it recommends
    const says = t + 0.2;
    swell(centre, says - 0.1, 1.25);
    tl.to(thought.play, { autoAlpha: 1, duration: 0.16, ease: "power1.out" }, says);
    tl.to(thought.play, { y: 0, scale: 1, duration: 0.5, ease: TOY_EASE.pop, force3D: false }, says);
    return says + 0.9;
  };
  /** What it came up with goes: the ideas, the Play, the tags; its light dims. Every piece ends
      where the Brain's next thought finds it. Returns when it is clear. */
  const forgetAt = (thought: typeof first, at: number) => {
    thought.ideas.forEach((idea, k) => tl.to(idea, { autoAlpha: 0, y: 8, duration: 0.22, ease: "power1.in", force3D: false }, at + k * 0.05));
    tl.to(thought.play, { ...PLAY_AWAY, duration: 0.26, ease: "power1.in", force3D: false }, at);
    thought.tags.forEach((tag, k) => tl.to(tag, { autoAlpha: 0, scale: 0.6, duration: 0.2, ease: "power1.in", force3D: false }, at + 0.05 + k * 0.04));
    tl.to(halo, { ...HALO_LOW, duration: 0.4, ease: "power1.inOut", force3D: false }, at);
    const reset = at + 0.36;
    thought.ideas.forEach((idea) => tl.to(idea, { ...inHeart(idea), duration: TOY_STEP, ease: "none" }, reset));
    tl.to(thought.runs, { x: 0, y: 0, scale: 0.5, duration: TOY_STEP, ease: "none" }, reset);
    return at + 0.42;
  };
  /** The Brain changes: some of its points draw back into their hubs, others grow out of
      theirs, each under a ring that opens where it was or will be. Returns when it has. */
  const changeAt = (out: typeof goes, into: typeof goes, at: number) => {
    const ringAt = (ring: HTMLElement, t: number) => {
      tl.fromTo(ring, { autoAlpha: 0.9, scale: 0.4 }, { scale: 1.7, duration: 0.6, ease: "power2.out", force3D: false, immediateRender: false }, t);
      tl.to(ring, { autoAlpha: 0, duration: 0.4, ease: "power1.in" }, t + 0.2);
    };
    out.forEach((point, k) => {
      const t = at + k * 0.14;
      ringAt(point.ring, t);
      tl.to(point.dot, { scale: 0, duration: 0.2, ease: "power2.in" }, t + 0.04);
      tl.to(point.dot, { autoAlpha: 0, duration: TOY_STEP, ease: "none" }, t + 0.24);
      tl.to(point.edge, { strokeDashoffset: 1, duration: 0.24, ease: "power1.in", autoRound: false }, t + 0.1);
      tl.to(point.edge, { autoAlpha: 0, duration: TOY_STEP, ease: "none" }, t + 0.34);
    });
    const grows = at + out.length * 0.14 + 0.25;
    into.forEach((point, k) => {
      const t = grows + k * 0.14;
      tl.to(point.edge, { autoAlpha: 1, duration: TOY_STEP, ease: "none" }, t);
      tl.to(point.edge, { strokeDashoffset: 0, duration: 0.26, ease: "power2.out", autoRound: false }, t);
      tl.to(point.dot, { autoAlpha: 1, duration: TOY_STEP, ease: "none" }, t + 0.16);
      tl.to(point.dot, { scale: 1, duration: 0.36, ease: TOY_EASE.pop }, t + 0.16);
      ringAt(point.ring, t + 0.2);
    });
    return grows + into.length * 0.14 + 0.55;
  };

  /* the opening: the Brain wakes (a ripple through its hubs, from the first one round) and thinks */
  hubs.forEach((hub, k) => swell(hub, 0.2 + k * 0.06, 1.45));
  const picture = thinkAt(first, 0.2 + hubs.length * 0.06 + 0.5);
  /* the round: the picture holds; the Brain changes and thinks again, holds, and comes back */
  let t = forgetAt(first, picture + HOLD);
  t = changeAt(goes, comes, t);
  t = thinkAt(other, t);
  t = forgetAt(other, t + HOLD);
  t = changeAt(comes, goes, t);
  t = thinkAt(first, t);
  tl.to(stage, { duration: TOY_STEP }, t);
  return { tl, cue: 0, loop: picture, cleanup() {} };
}

const BUILDERS = { t1: buildT1, t2: buildT2, t3: buildT3 } as const;
export type ToyStepVariant = keyof typeof BUILDERS;

export function buildToyStep(variant: ToyStepVariant, stage: HTMLElement): Built {
  return BUILDERS[variant](stage);
}
