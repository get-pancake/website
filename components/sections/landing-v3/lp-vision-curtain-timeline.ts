// No "use client" on purpose: a plain module, reached only through LpVisionCurtain's import()
// (lp-play-once loads it with GSAP, out of the page's first bundle).
import { gsap } from "@/lib/gsap";

import { clipTo, HIDDEN_CLIP, measureGlyphs, STEP, type Glyph } from "./lp-demo-pancake-timeline";
import { registerTxtPlugin } from "./lp-gsap-txt";

/**
 * The take of the window under the vision homepage's hero (LpVisionCurtain.tsx, 2026-11-11):
 * Claude on the left, Pancake's table on the right, both at work (founder: "J'animerai Claude et
 * la database pour montrer que c'est dynamique").
 *
 *   0     Claude's window is there from the first frame, a new chat in it (founder: "le rideau
 *         Claude s'ouvre un peu tard, les gens auront deja scroll down": nothing slides in)
 *   0.6   a signal lands in the table (NULL becomes a value, the signals' count ticks), and the
 *         Brain writes its next best Play: the database works before anyone asks
 *   1.5   the question is typed in Claude's composer (38 ms a glyph), held, sent: the bubble
 *   3.7   one tool call: Claude reads the three tables (their tabs take Claude's ring in turn);
 *         done, its flag and its ring are on the three rows that came back
 *   5.0   the answer streams a word at a time; each account's row lights as Claude names it
 *   8.0   "Yes, run it." is typed and sent; the Play's tool call starts and Claude's ring closes
 *         on the one cell; done, the cell is live
 *
 * The contract of the page's timelines (lp-step-timelines.ts, the dive's stories): the server
 * markup is the END picture; every piece is looked up and measured BEFORE anything is written (a
 * missing piece throws there and the server's picture stands); frame 0 is a block of gsap.set;
 * the timeline holds tweens only, an instant change being a 1 ms tween (`step`), so it can be
 * seeked both ways (QA: window.__lpVision.curtain). States that are colours (a lit row, Claude's
 * ring, a flash) are attributes the timeline flips (flagOn / flagOff below) and vision.css eases.
 * No ease overshoots (power1 to power3 only), nothing loops.
 *
 * The thread is anchored to the bottom of its view once it is taller than it (vision.css), so the
 * END needs no script; during the take it is shifted down by what has not arrived yet, and moves
 * up as each line needs room.
 */

type Timeline = gsap.core.Timeline;
export type BuiltCurtain = { tl: Timeline; cleanup: () => void; cue: number };

/* the take, seconds. Something moves within a second (the table's first datapoint), and the
   question waits until both sides have been seen (the page's rule for a typed prompt) */
const LAND_A = 0.6;
const BRAIN_A = 1.15;
const TYPE_1 = 1.5;
/** one glyph every 38 ms (the page's pace for a typed request), a held beat before it is sent */
const DT = 0.038;
const TYPED_HOLD = 0.4;
/** one word of Claude's answer every 45 ms */
const WORD = 0.045;
/** how long a cell stays flashed once its datapoint has landed */
const FLASH = 0.55;

/** the attributes the take flips (vision.css reads them); cleared when the take is torn down */
const FLAGS = ["data-unlit", "data-sel", "data-flash", "data-lit", "data-read", "data-noflag", "data-noring", "data-nostate"] as const;
type Flag = (typeof FLAGS)[number];
/* The server's picture holds back what only the loop shows (vision.css): a cell Claude is not
   on yet (data-idle), a row not lit yet (data-dim). The take swaps each for its own flags, which
   it can lift; they are put back when it is torn down. */
const IDLE = "data-idle";
const DIM = "data-dim";

/* Seek-safe attribute flips, as lp-gsap-txt's text swap: `flagOn` has the attribute at/after its
   position and not before, `flagOff` the reverse. Explicit both ways, so a seek in either
   direction (and gsap.context's revert, which renders at ratio 0) lands on the right state
   whatever order the tweens were first rendered in. */
let flagsRegistered = false;
function registerFlagPlugins() {
  if (flagsRegistered) return;
  flagsRegistered = true;
  const plugin = (name: "flagOn" | "flagOff") => ({
    name,
    init(this: { t: Element; a: string }, target: Element, value: unknown) {
      this.t = target;
      this.a = String(value);
    },
    render(ratio: number, data: { t: Element; a: string }) {
      const has = name === "flagOn" ? ratio >= 1 : ratio < 1;
      if (has) data.t.setAttribute(data.a, "");
      else data.t.removeAttribute(data.a);
    },
  });
  gsap.registerPlugin(plugin("flagOn"), plugin("flagOff"));
}

const fmt = (n: number) => n.toLocaleString("en-US");

export function buildVisionCurtain(card: HTMLElement): BuiltCurtain {
  const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = card): T => {
    const el = root.querySelector<T>(sel);
    if (!el) throw new Error(`vision-curtain: ${sel} missing`);
    return el;
  };
  const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = card) => Array.from(root.querySelectorAll<T>(sel));

  /* ── the pieces ── */
  // Pancake's side
  const tabs = (["companies", "people", "signals"] as const).map((name) => $(`.lp-vcut__tabs [data-tab="${name}"]`));
  const signalsCount = $("small", tabs[2]);
  const headRow = $<HTMLTableRowElement>(".lp-vcut__db thead tr");
  const rows = (["a", "b", "c"] as const).map((key) => $<HTMLTableRowElement>(`.lp-vcut__db tr[data-row="${key}"]`));
  const landing = (key: string) => {
    const td = $<HTMLTableCellElement>(`.lp-vcut__db td[data-land="${key}"]`);
    return { td, was: $(".lp-db__was", td), now: $(".lp-db__now", td), th: headRow.cells[td.cellIndex] as HTMLElement | undefined };
  };
  /** the values the take lands: row a's signal and its Play, then two datapoints further down */
  const lands = {
    aSignal: landing("a-signal"),
    aPlay: landing("a-play"),
    m1: landing("m1-signal"),
    m2: landing("m2-signal"),
  };
  /** every value that can come and go, with where it stands in the take: not there yet (late:
      the take lands it; void: only the loop does), or there all along */
  const cells = $$<HTMLTableCellElement>(".lp-vcut__db td[data-land]").map((td) => ({
    was: $(".lp-db__was", td),
    now: $(".lp-db__now", td),
    there: !td.hasAttribute("data-late") && !td.hasAttribute("data-void"),
  }));
  /** the cell Claude works in during the take (row a's Play), and those it only comes to later */
  const byCell = $(`.lp-vcut__db td[data-by]:not([${IDLE}])`);
  const idleCells = $$(`.lp-vcut__db td[data-by][${IDLE}]`);
  const dimRows = $$(`.lp-vcut__db tr[${DIM}]`);
  // Claude's side
  const col = $(".lp-vcut__col");
  const view = $(".lp-vcut__view");
  const greet = $(".lp-vcut__greet");
  const thread = $(".lp-vcut__thread");
  const bubbles = [1, 2].map((n) => $(`.lp-vcut__bubble[data-n="${n}"]`));
  const toolOf = (n: number) => {
    const el = $(`.lp-vcut__tool[data-n="${n}"]`);
    const num = el.querySelector<HTMLElement>(".lp-vcut__tool-done b");
    return {
      el,
      doing: $(".lp-vcut__tool-doing", el),
      done: $(".lp-vcut__tool-done", el),
      num,
      to: num ? Number(num.dataset.to) || 0 : 0,
    };
  };
  const tools = [toolOf(1), toolOf(2)];
  const lineOf = (el: HTMLElement) => ({ el, words: $$(".lp-vcut__w", el) });
  const says = [1, 2, 3].map((n) => lineOf($(`.lp-vcut__say[data-n="${n}"]`)));
  const picks = $$(".lp-vcut__picks li").map(lineOf);
  if (picks.length !== rows.length) throw new Error("vision-curtain: one row for each account Claude names");
  const phs = [1, 2].map((n) => $(`.lp-vcut__ph[data-n="${n}"]`));
  const typed = [1, 2].map((n) => $(`.lp-vcut__typed[data-n="${n}"]`));
  const caret = $(".lp-vcut__caret");
  const send = $(".lp-vcut__send");
  const art = $(".lp-vcut__art");

  /* ── the geometry, read on the untouched END layout ── */
  const glyphs: Glyph[][] = typed.map(measureGlyphs);
  const viewH = view.clientHeight;
  // the thread's END place is its bottom on the view's: `over` of it is above the view's top
  const over = Math.max(0, thread.offsetHeight - viewH);
  const padBottom = parseFloat(getComputedStyle(thread).paddingBottom) || 0;
  /** how far the thread has to be scrolled for this piece's bottom to show */
  const need = (el: HTMLElement) => Math.min(over, Math.max(0, el.offsetTop + el.offsetHeight + padBottom - viewH));
  const scrolls = {
    bubble1: need(bubbles[0]),
    tool1: need(tools[0].el),
    say1: need(says[0].el),
    picks: picks.map((p) => need(p.el)),
    say2: need(says[1].el),
    bubble2: need(bubbles[1]),
    tool2: need(tools[1].el),
    say3: need(says[2].el),
  };
  /** where a bubble's text starts, against where it was typed: the bubble leaves from there */
  const lift = (i: number, scrolled: number) => {
    const from = typed[i].getBoundingClientRect();
    const to = bubbles[i].getBoundingClientRect();
    const cs = getComputedStyle(bubbles[i]);
    return {
      x: from.left - (to.left + (parseFloat(cs.paddingLeft) || 0)),
      // the thread is `over - scrolled` lower than its END place while this bubble leaves
      y: from.top - (to.top + (parseFloat(cs.paddingTop) || 0) + (over - scrolled)),
    };
  };
  const lifts = [lift(0, 0), lift(1, scrolls.say2)];
  void col.offsetWidth; // (the column is laid out: the reads above stand)

  registerTxtPlugin();
  registerFlagPlugins();

  /* ── frame 0: a new chat in Claude's window, the table before its signal ── */
  const set = gsap.set;
  const flag = (el: Element, name: Flag) => set(el, { flagOn: name });
  for (const cell of cells) {
    set(cell.was, { opacity: cell.there ? 0 : 0.72 });
    set(cell.now, { opacity: cell.there ? 1 : 0 });
  }
  [...rows, ...dimRows].forEach((row) => flag(row, "data-unlit"));
  for (const cell of [byCell, ...idleCells]) {
    flag(cell, "data-noflag");
    flag(cell, "data-noring");
    flag(cell, "data-nostate");
  }
  // (the take's own flags are on: the server's stand-ins for them go)
  idleCells.forEach((cell) => cell.removeAttribute(IDLE));
  dimRows.forEach((row) => row.removeAttribute(DIM));
  set(greet, { autoAlpha: 1, y: 0 });
  set(thread, { y: over });
  set(bubbles[0], { autoAlpha: 0, x: lifts[0].x, y: lifts[0].y });
  set(bubbles[1], { autoAlpha: 0, x: lifts[1].x, y: lifts[1].y });
  for (const tool of tools) {
    set(tool.el, { autoAlpha: 0, y: 6 });
    set(tool.doing, { autoAlpha: 1 });
    set(tool.done, { autoAlpha: 0 });
    if (tool.num) set(tool.num, { txt: "0" });
  }
  for (const line of [...says, ...picks]) {
    set(line.el, { autoAlpha: 0 });
    set(line.words, { opacity: 0 });
  }
  set(phs[0], { autoAlpha: 1 });
  set(phs[1], { autoAlpha: 0 });
  set(typed, { clipPath: HIDDEN_CLIP });
  set(caret, { opacity: 1, x: 0, y: 0 });
  set(send, { opacity: 0.45, scale: 1 });
  set(art, { autoAlpha: 0 });
  // the take's own frame is in place: the stylesheet's stand-in for it goes (data-pre, vision.css)
  card.setAttribute("data-open", "");

  /* ── the take ── */
  const tl = gsap.timeline({ paused: true });
  const step = (targets: gsap.TweenTarget, vars: gsap.TweenVars, t: number) => tl.to(targets, { ...vars, duration: STEP, ease: "none" }, t);
  const on = (el: Element, name: Flag, t: number) => step(el, { flagOn: name }, t);
  const off = (el: Element, name: Flag, t: number) => step(el, { flagOff: name }, t);
  /** an attribute held for a while */
  const pulse = (el: Element, name: Flag, t: number, hold: number) => {
    on(el, name, t);
    off(el, name, t + hold);
  };

  let signals = Number((signalsCount.textContent ?? "").replace(/\D/g, "")) || 0;
  /** a datapoint lands: NULL gives way to the value, the cell flashes, the column's source lights;
      a signal adds one to the signals' count */
  const landAt = (land: (typeof lands)[keyof typeof lands], t: number, signal: boolean) => {
    tl.to(land.was, { opacity: 0, duration: 0.16, ease: "power1.in" }, t);
    tl.to(land.now, { opacity: 1, duration: 0.3, ease: "power1.out" }, t + 0.1);
    pulse(land.td, "data-flash", t + 0.1, FLASH);
    if (land.th) pulse(land.th, "data-lit", t, 0.9);
    if (signal) step(signalsCount, { txt: fmt(++signals) }, t + 0.1);
  };
  /** the thread moves up to `scrolled` (a no-op while everything fits) */
  let scrolled = 0;
  const scrollTo = (to: number, t: number, duration = 0.45, ease = "power2.out") => {
    if (to <= scrolled) return;
    scrolled = to;
    tl.to(thread, { y: over - to, duration, ease }, t);
  };
  /** what is typed in the composer: the text shows glyph by glyph, the caret follows */
  const type = (i: number, t0: number) => {
    step(phs[i], { autoAlpha: 0 }, t0 - STEP);
    step(caret, { opacity: 1, x: 0, y: 0 }, t0 - 0.3);
    tl.to(send, { opacity: 1, duration: 0.2, ease: "power2.out" }, t0);
    glyphs[i].forEach((g, k) => {
      const t = t0 + k * DT;
      step(typed[i], { clipPath: clipTo(g) }, t);
      step(caret, { x: g.right + 1, y: g.top }, t);
    });
    const done = t0 + Math.max(glyphs[i].length - 1, 0) * DT;
    step(typed[i], { clipPath: "none" }, done + 0.08);
    return done;
  };
  /** sent: the button is pressed, the text leaves the composer as the bubble, the thread makes room */
  const sendAt = (i: number, press: number, to: number) => {
    tl.to(send, { keyframes: [{ scale: 0.86, duration: 0.08, ease: "power2.out" }, { scale: 1, duration: 0.22, ease: "power2.out" }] }, press);
    const t = press + 0.1;
    step(caret, { opacity: 0 }, t);
    step(typed[i], { clipPath: HIDDEN_CLIP }, t);
    tl.to(send, { opacity: 0.45, duration: 0.2, ease: "power1.out" }, t);
    tl.to(bubbles[i], { autoAlpha: 1, duration: 0.14, ease: "power1.out" }, t);
    tl.to(bubbles[i], { x: 0, y: 0, duration: 0.6, ease: "power3.out" }, t);
    scrollTo(to, t, 0.6, "power3.out");
    tl.to(phs[1], { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, t + 0.45);
    return t;
  };
  /** a line of Claude's answer, a word at a time */
  const stream = (line: (typeof says)[number], t: number, to: number) => {
    scrollTo(to, t - 0.1);
    step(line.el, { autoAlpha: 1 }, t);
    line.words.forEach((w, k) => tl.to(w, { opacity: 1, duration: 0.16, ease: "power1.out" }, t + k * WORD));
    return t + Math.max(line.words.length - 1, 0) * WORD + 0.16;
  };
  /** a tool call: its card, what it is doing, then what came back (a count ticks up) */
  const call = (tool: (typeof tools)[number], start: number, work: number, to: number) => {
    scrollTo(to, start - 0.1);
    tl.to(tool.el, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power3.out" }, start);
    const done = start + work;
    tl.to(tool.doing, { autoAlpha: 0, duration: 0.1, ease: "power1.in" }, done);
    tl.to(tool.done, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, done + 0.06);
    const num = tool.num;
    if (num) for (let k = 1; k <= 6; k++) step(num, { txt: fmt(Math.round((tool.to * k) / 6)) }, done + 0.06 + (k - 1) * 0.05);
    return done;
  };

  // the database at work, alone: a signal, then the Play the Brain makes of it
  landAt(lands.aSignal, LAND_A, true);
  landAt(lands.aPlay, BRAIN_A, false);

  // the question
  const typed1 = type(0, TYPE_1);
  landAt(lands.m1, TYPE_1 + 0.75, true);
  const sent1 = sendAt(0, typed1 + TYPED_HOLD, scrolls.bubble1);
  tl.to(greet, { autoAlpha: 0, y: -8, duration: 0.2, ease: "power2.in" }, sent1);

  // Claude reads the three tables: each tab takes its ring in turn; back with the rows, its flag
  // and its ring are on them
  const READ = sent1 + 0.45;
  const read = call(tools[0], READ, 0.9, scrolls.tool1);
  tabs.forEach((tab, k) => pulse(tab, "data-read", READ + 0.1 + k * 0.26, 0.3));
  rows.forEach((row) => on(row, "data-sel", read));
  off(byCell, "data-noflag", read);

  // the answer, and each account's row as it is named
  let t = stream(says[0], read + 0.4, scrolls.say1) + 0.1;
  picks.forEach((pick, k) => {
    off(rows[k], "data-unlit", t + 0.05);
    t = stream(pick, t, scrolls.picks[k]) + 0.06;
  });
  tl.to(art, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, t);
  const asked = stream(says[1], t + 0.1, scrolls.say2);

  // (the table goes on: another signal, lower down)
  landAt(lands.m2, asked + 0.15, true);

  // "Yes, run it."
  const TYPE_2 = asked + 0.8;
  const typed2 = type(1, TYPE_2);
  const sent2 = sendAt(1, typed2 + TYPED_HOLD, scrolls.bubble2);

  // the Play runs: Claude's ring closes on the cell; done, the cell is live
  const RUN = sent2 + 0.5;
  const ran = call(tools[1], RUN, 0.7, scrolls.tool2);
  rows.forEach((row) => off(row, "data-sel", RUN));
  off(byCell, "data-noring", RUN);
  off(byCell, "data-nostate", ran + 0.06);
  pulse(byCell, "data-flash", ran + 0.06, FLASH);
  const done = stream(says[2], ran + 0.4, scrolls.say3);
  // (a beat on the finished picture before the take is over)
  step(card, {}, done + 0.6);

  return {
    tl,
    cue: 0,
    cleanup() {
      // the server's picture: none of the take's attributes
      for (const name of FLAGS) card.querySelectorAll(`[${name}]`).forEach((el) => el.removeAttribute(name));
      idleCells.forEach((cell) => cell.setAttribute(IDLE, ""));
      dimRows.forEach((row) => row.setAttribute(DIM, ""));
    },
  };
}
