// No "use client" on purpose: a plain module, reached only through LpVisionStepAnim's import()
// (lp-play-once loads it with GSAP, out of the page's first bundle).
import { gsap } from "@/lib/gsap";

import { ART_SOURCES } from "./lp-toy-art";
import { toyCanvas } from "./lp-toy-canvas";
import {
  TOY_EASE,
  TOY_STEP,
  toyDecode,
  toyGlide,
  toyGone,
  toyHideGlide,
  toyHidePop,
  toyHideRise,
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
 *       it sends comes up, and its bead takes its place on the machine. A row comes out of the
 *       machine for what each source sends and the two piles come up, with their counts
 *   t2  the radar's hand turns once round the account; each signal lands as it passes, with
 *       what it says; a line then connects the dots into the account
 *   t3  a tag comes up on three hubs of the Brain, what it draws on, and each one's branch into
 *       the centre goes dark; then the next best Play
 * Since 2026-11-16 nothing in them glows, opens a ring, rides a cable, swells or bounces
 * (lp-toy-kit.ts has the rule). Until then: beads ran down the cables and the machine turned, a
 * glowing beam swept the radar and rings opened on it, signals ran along the Brain's branches
 * into a centre that swelled under a halo, and two ideas came out before the Play. What carried
 * a meaning was given a plain form the same day (founder: "il y a pas des trucs importants que tu
 * as enlevé sans remplacer"): the radar's scan is one thin hand, the signals that fed the Brain
 * are its branches going dark.
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

/* ── 01 · your sources plug in, the tables come up ── */

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
  /** a round's rows, in the order they come out of the machine */
  const roundOf = (id: string) => {
    const rows = q.all(`.lp-t1-row[data-round="${id}"]`);
    if (rows.length < 4) throw new Error("lp-toy t1: the rows of a round");
    return rows;
  };
  const rounds = { open: roundOf("open"), b: roundOf("b"), a: roundOf("a") };
  /** a bead of each source's tone on the machine: it takes its place as its source connects */
  const riders = q.all(".lp-t1-rider");
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
  toyDecode(stage);

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
  for (const side of ["l", "r"]) {
    piles[side].forEach((img, n) => set(img, { autoAlpha: n === 0 ? 1 : 0 }));
    set(counts[side].el, { toyCount: 0 });
  }
  for (const rows of everyRound) {
    rows.forEach((row) => {
      const side = row.dataset.side ?? "l";
      toyHideGlide(row, anchor(`pile-${side}-mouth`), anchor(`pile-${side}-row${num(row, "row")}`), 0.3);
    });
  }

  const tl = gsap.timeline({ paused: true });
  /** after a source sends, its row comes out of the machine this much later, and takes this long
      to its pile */
  const OUT = 0.3;
  const GLIDE = 0.44;
  /** rows landed on each pile, and what each table counts, over the whole take */
  const landed: Record<string, number> = { l: 0, r: 0 };
  const counted: Record<string, number> = { l: 0, r: 0 };
  /** the drawing of a pile after `n` rows: it fills, then it rolls */
  const pileAfter = (side: string, n: number) => piles[side][n <= full ? n : full + ((n - full) % roll)];

  /** A round's rows: each comes out of the machine's mouth at its time onto its pile, and its
      table counts it. Returns when the last one has landed. */
  const feed = (rows: HTMLElement[], outs: readonly number[]) => {
    rows.forEach((row, k) => {
      const side = row.dataset.side ?? "l";
      const out = outs[k];
      toyGlide(tl, row, out, GLIDE);
      const lands = out + GLIDE;
      const n = (landed[side] += 1);
      const before = pileAfter(side, n - 1);
      const after = pileAfter(side, n);
      toyGone(tl, row, lands);
      toyGone(tl, before, lands);
      toyShow(tl, after, lands);
      // its table counts it: a fifth of the table's rows while the pile fills, then what a row adds
      const count = counts[side];
      const was = counted[side];
      const now = n <= full ? Math.round((count.to * n) / full) : was + T1_ADDS[side][(n - full - 1) % T1_ADDS[side].length];
      counted[side] = now;
      for (let step = 1; step <= 3; step++) {
        tl.to(count.el, { toyCount: Math.round(was + ((now - was) * step) / 3), duration: TOY_STEP, ease: "none" }, lands + (step - 1) * 0.06);
      }
    });
    return outs[outs.length - 1] + GLIDE;
  };

  /* ── the opening: the four sources connect one after the other ── */
  const FIRST = 0.4;
  const EVERY = 0.62;
  // when each row comes out: one per source as it connects, then the others, closer
  const outs = rounds.open.map((_, k) => (k < 4 ? FIRST + k * EVERY + 0.32 : FIRST + 3 * EVERY + 0.32 + (k - 3) * 0.3) + OUT);
  sets[0].marks.forEach((mark, i) => {
    const t = FIRST + i * EVERY;
    tl.to(mark, { opacity: 1, duration: 0.14, ease: "power1.out" }, t);
    tl.to(mark, { scale: 1, duration: 0.4, ease: TOY_EASE.pop, force3D: false }, t);
    tl.to(sets[0].names[i], { opacity: 1, duration: 0.2, ease: "power1.out" }, t);
    tl.to(cables[i], { clipPath: OPEN, duration: 0.3, ease: "power2.out" }, t + 0.06);
    // what it sends: up as it connects, gone as the one after the next comes up
    toyRise(tl, sets[0].sends[i], t + 0.1);
    toyLeave(tl, sets[0].sends[i], t + 2 * EVERY - 0.1);
    // its bead takes its place on the machine once its cable is in
    if (riders[i]) toyPop(tl, riders[i], t + 0.32, 0.35);
  });
  /** the picture: the four sources connected, the two piles full */
  const picture = feed(rounds.open, outs) + 0.45;

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
  for (const [from, to, rows] of [
    [sets[0], sets[1], rounds.b],
    [sets[1], sets[0], rounds.a],
  ] as const) {
    t += HOLD;
    swap(from, to, t);
    const at = t;
    t = feed(rows, rows.map((_, k) => (k < 4 ? at + k * SWAP + 0.52 : at + 3 * SWAP + 0.52 + (k - 3) * 0.3) + OUT)) + 0.45;
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
      hand: q.one(`.lp-t2-hand[data-round="${id}"]`),
      pieces: all(".lp-t2-blip"),
      says: all(".lp-t2-says"),
      who: q.one(`.lp-t2-who[data-round="${id}"]`),
      line: q.all<SVGPathElement>(`.lp-t2-line[data-round="${id}"] path`),
    };
    if (scan.pieces.length < 2 || scan.says.length !== scan.pieces.length || scan.line.length !== scan.pieces.length) {
      throw new Error("lp-toy t2: a badge and a stretch of the line for each signal");
    }
    // how long each stretch of the line is: it is drawn at a steady pace
    return { ...scan, lengths: scan.line.map((path) => path.getTotalLength()), from: num(scan.hand, "from"), way: num(scan.hand, "way") < 0 ? -1 : 1 };
  };
  const first = scanOf("a");
  const other = scanOf("b");
  toyDecode(stage);

  // frame 0: the radar and the account as you know it; nothing has landed
  const set = gsap.set;
  for (const scan of [first, other]) {
    set(scan.hand, { autoAlpha: 0, rotation: scan.from, transformOrigin: "0% 50%" });
    toyHidePop(scan.pieces, 0.3);
    toyHideRise(scan.says, 6);
    // (autoRound off: GSAP would round a length in px to a whole number, and a dash offset
    // that goes from 1 to 0 would jump at its middle: the line would appear at once)
    set(scan.line, { autoAlpha: 0, strokeDashoffset: 1, autoRound: false });
  }
  toyHideRise(other.who, 6);

  const tl = gsap.timeline({ paused: true });
  /** the hand turns once in … and the line is drawn in … */
  const TURN = 3.1;
  const TRACE = 1.7;
  /** A scan: the radar's hand comes on and turns once; each signal lands as it passes, with
      what it says; the hand goes, and the line goes from dot to dot into the account. Returns
      when it has. */
  const scanAt = (scan: typeof first, at: number) => {
    tl.to(scan.hand, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, at);
    tl.to(scan.hand, { rotation: scan.from + scan.way * 360, duration: TURN, ease: "none", force3D: false }, at);
    scan.pieces.forEach((piece, k) => {
      const t = at + (Math.abs(num(piece, "at") - scan.from) / 360) * TURN;
      toyPop(tl, piece, t, 0.4);
      toyRise(tl, scan.says[k], t + 0.12);
    });
    // it has gone round: the hand goes, and the line connects the dots, one after the other
    const done = at + TURN;
    tl.to(scan.hand, { autoAlpha: 0, duration: 0.3, ease: "power1.in" }, done - 0.1);
    const whole = scan.lengths.reduce((sum, length) => sum + length, 0) || 1;
    let t = done + 0.2;
    scan.line.forEach((path, k) => {
      const takes = Math.max(0.16, (TRACE * scan.lengths[k]) / whole);
      tl.to(path, { autoAlpha: 1, duration: TOY_STEP, ease: "none" }, t);
      tl.to(path, { strokeDashoffset: 0, duration: takes, ease: "power1.inOut", autoRound: false }, t);
      t += takes;
    });
    return t + 0.65;
  };
  /** What a scan left goes (its dots, what they say, the line), and another account takes its
      place. Every piece ends where a scan finds it. Returns when it is clear. */
  const clearAt = (scan: typeof first, next: typeof first, at: number) => {
    scan.says.forEach((say, k) => toyLeave(tl, say, at + k * 0.04));
    scan.pieces.forEach((piece, k) => tl.to(piece, { autoAlpha: 0, scale: 0.3, duration: 0.22, ease: "power1.in", force3D: false }, at + 0.05 + k * 0.04));
    tl.to(scan.line, { autoAlpha: 0, duration: 0.25, ease: "power1.in" }, at);
    const reset = at + 0.45;
    tl.to(scan.line, { strokeDashoffset: 1, duration: TOY_STEP, ease: "none", autoRound: false }, reset);
    tl.to(scan.says, { y: 6, duration: TOY_STEP, ease: "none" }, reset);
    tl.to(scan.hand, { rotation: scan.from, duration: TOY_STEP, ease: "none" }, reset);
    // the account changes: its name goes, the other name comes up
    const swaps = at + 0.2;
    toyLeave(tl, scan.who, swaps);
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

/* ── 03 · the Brain: what it draws on, then the next best Play ── */

function buildT3(stage: HTMLElement): Built {
  const q = toyQuery(stage, "t3");
  const data = (el: Element, key: string) => (el as HTMLElement).dataset[key] ?? "";
  /** the points that come and go from one round to the next: each with its branch */
  const pointsOf = (kind: string) =>
    q.all<SVGCircleElement>(`.lp-t3-dot[data-kind="${kind}"]`).map((dot) => {
      const same = `[data-kind="${kind}"][data-hub="${data(dot, "hub")}"][data-n="${data(dot, "n")}"]`;
      return { dot, edge: q.one<SVGPathElement>(`.lp-t3-edge${same}`) };
    });
  const goes = pointsOf("goes");
  const comes = pointsOf("comes");
  /** a round's pieces (LpToySteps.tsx THOUGHTS): "a" is the picture, "b" the next round's */
  const thoughtOf = (id: string) => {
    const tags = q.all(`.lp-t3-tag[data-round="${id}"]`);
    if (!tags.length) throw new Error("lp-toy t3: the Brain's tags");
    return {
      tags,
      /** each tag's hub's branch into the centre, drawn dark as the tag comes up */
      feeds: tags.map((tag) => q.one<SVGPathElement>(`.lp-t3-feed[data-hub="${data(tag, "hub")}"]`)),
      play: q.one(`.lp-t3-play[data-round="${id}"]`),
    };
  };
  const first = thoughtOf("a");
  const other = thoughtOf("b");
  if (!goes.length || !comes.length) throw new Error("lp-toy t3: the points that come and go");
  const PLAY_AWAY = { autoAlpha: 0, y: 16, scale: 0.92 };

  // frame 0: the Brain, whole and still; no tag on it, no Play yet
  const set = gsap.set;
  // (a point of the graph grows from its own middle)
  set(q.all(".lp-t3-dot"), { transformOrigin: "50% 50%" });
  for (const point of comes) {
    set(point.dot, { autoAlpha: 0, scale: 0 });
    // (autoRound off: buildT2 has why)
    set(point.edge, { autoAlpha: 0, strokeDashoffset: 1, autoRound: false });
  }
  for (const thought of [first, other]) {
    toyHidePop(thought.tags, 0.6);
    // (autoRound off: buildT2 has why)
    set(thought.feeds, { autoAlpha: 0, strokeDashoffset: 1, autoRound: false });
    set(thought.play, PLAY_AWAY);
  }

  const tl = gsap.timeline({ paused: true });
  /** The Brain shows what it draws on: a tag on a hub after the other, each one's branch drawn
      dark into the centre. Then the Play it recommends. Returns when the reader has had the
      time to read it. */
  const thinkAt = (thought: typeof first, at: number) => {
    const EVERY = 0.42;
    const FEED = 0.4;
    thought.tags.forEach((tag, k) => {
      const t = at + k * EVERY;
      toyPop(tl, tag, t, 0.4);
      tl.to(thought.feeds[k], { autoAlpha: 1, duration: TOY_STEP, ease: "none" }, t + 0.08);
      tl.to(thought.feeds[k], { strokeDashoffset: 0, duration: FEED, ease: "power2.out", autoRound: false }, t + 0.08);
    });
    const says = at + (thought.tags.length - 1) * EVERY + 0.08 + FEED + 0.3;
    tl.to(thought.play, { autoAlpha: 1, duration: 0.16, ease: "power1.out" }, says);
    tl.to(thought.play, { y: 0, scale: 1, duration: 0.5, ease: TOY_EASE.pop, force3D: false }, says);
    return says + 0.9;
  };
  /** What it came up with goes: the Play, the tags, the dark branches. Every piece ends where
      the Brain's next thought finds it. Returns when it is clear. */
  const forgetAt = (thought: typeof first, at: number) => {
    tl.to(thought.play, { ...PLAY_AWAY, duration: 0.26, ease: "power1.in", force3D: false }, at);
    thought.tags.forEach((tag, k) => tl.to(tag, { autoAlpha: 0, scale: 0.6, duration: 0.2, ease: "power1.in", force3D: false }, at + 0.05 + k * 0.04));
    tl.to(thought.feeds, { autoAlpha: 0, duration: 0.25, ease: "power1.in" }, at + 0.05);
    tl.to(thought.feeds, { strokeDashoffset: 1, duration: TOY_STEP, ease: "none", autoRound: false }, at + 0.36);
    return at + 0.42;
  };
  /** The Brain changes: some of its points draw back into their hubs, others grow out of
      theirs. Returns when it has. */
  const changeAt = (out: typeof goes, into: typeof goes, at: number) => {
    out.forEach((point, k) => {
      const t = at + k * 0.14;
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
    });
    return grows + into.length * 0.14 + 0.55;
  };

  /* the opening: the Brain, still, then what it thinks */
  const picture = thinkAt(first, 0.9);
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
  // the picture's drawings go on a canvas (lp-toy-canvas.ts): read at rest, before the take writes
  const canvas = toyCanvas(stage);
  try {
    const built = BUILDERS[variant](stage);
    canvas.follow(built.tl);
    return {
      ...built,
      cleanup() {
        canvas.dispose();
        built.cleanup();
      },
    };
  } catch (err) {
    canvas.dispose();
    throw err;
  }
}
