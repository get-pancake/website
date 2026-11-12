// No "use client" on purpose: a plain module, reached only through LpVisionCurtain's import()
// (lp-play-once loads it with GSAP, out of the page's first bundle).
import { gsap } from "@/lib/gsap";

import { clipTo, HIDDEN_CLIP, measureGlyphs, STEP, type Glyph } from "./lp-demo-pancake-timeline";
import { registerTxtPlugin } from "./lp-gsap-txt";
import { VISION_CURTAIN } from "./lp-vision-data";

/**
 * The window under the vision homepage's hero (LpVisionCurtain.tsx, 2026-11-11): Claude on the
 * left, Pancake's table on the right, both at work (founder: "J'animerai Claude et la database
 * pour montrer que c'est dynamique"). A take, then a loop.
 *
 * THE TAKE, once (lp-play-once drives it):
 *   0     Claude's window is there from the first frame, a new chat in it (founder: "le rideau
 *         Claude s'ouvre un peu tard, les gens auront deja scroll down": nothing slides in)
 *   0.6   a signal lands in the table (NULL becomes a value, the signals' count ticks), and the
 *         Brain writes its next best Play: the database works before anyone asks
 *   1.5   the question is typed in Claude's composer (38 ms a glyph), held, sent: the bubble
 *   3.7   one tool call: Claude reads the three tables (their tabs take Claude's ring in turn);
 *         done, its ring is around the three rows that came back, its mark on the first one
 *   5.0   the answer streams a word at a time; each account's row lights as Claude names it
 *   8.0   "Yes, run it." is typed and sent; the Play's tool call starts and Claude's ring closes
 *         on the one cell; done, the cell is live
 *
 * THE LOOP, for as long as the card is on screen (founder: "Je prolongerai les animations en mode
 * endless loop: What's the next best Play to run?"; this card's one exception to "plays once,
 * nothing loops"). It starts when the take is over (data-lp-anim="done": played, or shown at once
 * to a visitor who arrived on it) and every round is the same exchange about the next account:
 *   the table   the row's signal lands and the Brain writes its Play (when they are not there
 *               already); the Play of the row that comes after it, run a round ago, is cleared
 *   the ask     "What's the next best Play to run?" is typed and sent
 *   the answer  the tabs take Claude's ring (it reads), then the Play's name and why: Claude's
 *               ring and its mark go to that cell, and the row lights
 *   the run     "Run it." is typed and sent; the Play's card starts, then it is live in its cell
 * It never restarts: the conversation goes on (what has left through the top of the view is
 * dropped) and the table keeps changing. It waits while the card is off screen (less than a fifth
 * of it on show), and does not run under reduced motion.
 *
 * The contract of the page's timelines (lp-step-timelines.ts, the dive's stories): the server
 * markup is the END picture; every piece is looked up and measured BEFORE anything is written (a
 * missing piece throws there and the server's picture stands); frame 0 is a block of gsap.set;
 * the take holds tweens only, an instant change being a 1 ms tween (`step`), so it can be seeked
 * both ways (QA: window.__lpVision.curtain). States that are colours (a lit row, Claude's ring, a
 * flash) are attributes the timelines flip (flagOn / flagOff below) and vision.css eases. No ease
 * overshoots (power1 to power3 only). A round of the loop is one more timeline of the same
 * tweens, built when it starts: its four lines are added to the thread and measured, then played
 * (QA: window.__lpVision.loop).
 *
 * The thread is anchored to the bottom of its view once it is taller than it (vision.css), so the
 * END needs no script; while lines are still to come it is shifted down by what has not arrived
 * yet, and moves up as each line needs room.
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
/* the loop, seconds */
/** from a signal landing to the question: its Play has been written and read */
const LOOP_LANDED = 1.2;
/** a short word ("Run it.") waits less before it is sent */
const GO_HOLD = 0.3;
/** the finished round, before the next question */
const LOOP_REST = 0.9;
/** the share of the card that has to be on screen for the loop to run */
const ON_SCREEN = 0.2;

/** the attributes the take flips (vision.css reads them); cleared when the take is torn down */
const FLAGS = ["data-unlit", "data-sel", "data-flash", "data-lit", "data-read", "data-noflag", "data-noring", "data-nostate"] as const;
type Flag = (typeof FLAGS)[number];
/* The server's picture holds back what only the loop shows (vision.css): a cell Claude is not
   on yet (data-idle), a row not lit yet (data-dim). The take swaps each for its own flags, which
   it can lift; they are put back when it is torn down. */
const IDLE = "data-idle";
const DIM = "data-dim";
/** a line the loop added to the thread */
const LOOP = "data-loop";

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

type Land = { td: HTMLTableCellElement; was: HTMLElement; now: HTMLElement; th: HTMLElement | undefined };
type Line = { el: HTMLElement; words: HTMLElement[] };
type Tool = { el: HTMLElement; doing: HTMLElement; done: HTMLElement; num: HTMLElement | null; to: number };
/** a row the loop comes to: its two cells, what Claude says of it, and where it stands now */
type Turn = {
  tr: HTMLTableRowElement;
  signal: Land;
  play: Land;
  name: string;
  to: string;
  why: string;
  /** its signal and its Play are on show · its Play is live · the row is lit */
  filled: boolean;
  live: boolean;
  lit: boolean;
};

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
  const rowOf = (key: string) => $<HTMLTableRowElement>(`.lp-vcut__db tr[data-row="${key}"]`);
  const rows = (["a", "b", "c"] as const).map(rowOf);
  const landing = (key: string): Land => {
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
  const dimRows = $$<HTMLTableRowElement>(`.lp-vcut__db tr[${DIM}]`);
  /** the loop's rows, in the order Claude goes through them, as the take's END leaves them: a's
      Play live under Claude's ring, the three named rows lit, the others as the markup has them */
  const loopCopy = VISION_CURTAIN.loop;
  const turns: Turn[] = loopCopy.turns.map((turn) => {
    const tr = rowOf(turn.row);
    const signal = landing(`${turn.row}-signal`);
    const play = landing(`${turn.row}-play`);
    return {
      tr,
      signal,
      play,
      name: play.now.textContent ?? "",
      to: turn.to,
      why: turn.why,
      filled: !signal.td.hasAttribute("data-void") && !play.td.hasAttribute("data-void"),
      live: play.td === byCell,
      lit: rows.includes(tr),
    };
  });
  // Claude's side
  const col = $(".lp-vcut__col");
  const view = $(".lp-vcut__view");
  const greet = $(".lp-vcut__greet");
  const thread = $(".lp-vcut__thread");
  const bubbles = [1, 2].map((n) => $(`.lp-vcut__bubble[data-n="${n}"]`));
  const toolOf = (el: HTMLElement): Tool => {
    const num = el.querySelector<HTMLElement>(".lp-vcut__tool-done b");
    return {
      el,
      doing: $(".lp-vcut__tool-doing", el),
      done: $(".lp-vcut__tool-done", el),
      num,
      to: num ? Number(num.dataset.to) || 0 : 0,
    };
  };
  const tools = [1, 2].map((n) => toolOf($(`.lp-vcut__tool[data-n="${n}"]`)));
  const lineOf = (el: HTMLElement): Line => ({ el, words: $$(".lp-vcut__w", el) });
  const says = [1, 2, 3].map((n) => lineOf($(`.lp-vcut__say[data-n="${n}"]`)));
  const picks = $$(".lp-vcut__picks li").map(lineOf);
  if (picks.length !== rows.length) throw new Error("vision-curtain: one row for each account Claude names");
  const phs = [1, 2].map((n) => $(`.lp-vcut__ph[data-n="${n}"]`));
  /** what is typed: the take's question and its go-ahead, then the loop's two */
  const typed = [1, 2, 3, 4].map((n) => $(`.lp-vcut__typed[data-n="${n}"]`));
  const caret = $(".lp-vcut__caret");
  const send = $(".lp-vcut__send");
  const art = $(".lp-vcut__art");

  /* ── the geometry, read on the untouched END layout ── */
  const glyphs: Glyph[][] = [typed[0], typed[1]].map(measureGlyphs);
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
  /** Where a bubble's text starts, against where it was typed: the bubble leaves from there.
      `standing` is how far below its resting place the thread stands when the bubble leaves. */
  const liftOf = (bubble: HTMLElement, from: HTMLElement, standing: number) => {
    const a = from.getBoundingClientRect();
    const b = bubble.getBoundingClientRect();
    const cs = getComputedStyle(bubble);
    return {
      x: a.left - (b.left + (parseFloat(cs.paddingLeft) || 0)),
      y: a.top - (b.top + (parseFloat(cs.paddingTop) || 0) + standing),
    };
  };
  const lifts = [liftOf(bubbles[0], typed[0], over), liftOf(bubbles[1], typed[1], over - scrolls.say2)];
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

  /* ── the moves, for the take and for each round of the loop ── */
  let signals = Number((signalsCount.textContent ?? "").replace(/\D/g, "")) || 0;
  const movesOn = (tl: Timeline) => {
    const step = (targets: gsap.TweenTarget, vars: gsap.TweenVars, t: number) => tl.to(targets, { ...vars, duration: STEP, ease: "none" }, t);
    const on = (el: Element, name: Flag, t: number) => step(el, { flagOn: name }, t);
    const off = (el: Element, name: Flag, t: number) => step(el, { flagOff: name }, t);
    /** an attribute held for a while */
    const pulse = (el: Element, name: Flag, t: number, hold: number) => {
      on(el, name, t);
      off(el, name, t + hold);
    };
    /** a datapoint lands: NULL gives way to the value, the cell flashes, the column's source
        lights; a signal adds one to the signals' count */
    const landAt = (land: Land, t: number, signal: boolean) => {
      tl.to(land.was, { opacity: 0, duration: 0.16, ease: "power1.in" }, t);
      tl.to(land.now, { opacity: 1, duration: 0.3, ease: "power1.out" }, t + 0.1);
      pulse(land.td, "data-flash", t + 0.1, FLASH);
      if (land.th) pulse(land.th, "data-lit", t, 0.9);
      if (signal) step(signalsCount, { txt: fmt(++signals) }, t + 0.1);
    };
    /** what is typed in the composer: the text shows glyph by glyph, the caret follows */
    const type = (el: HTMLElement, marks: Glyph[], placeholder: HTMLElement, t0: number) => {
      step(placeholder, { autoAlpha: 0 }, t0 - STEP);
      step(caret, { opacity: 1, x: 0, y: 0 }, t0 - 0.3);
      tl.to(send, { opacity: 1, duration: 0.2, ease: "power2.out" }, t0);
      marks.forEach((g, k) => {
        const t = t0 + k * DT;
        step(el, { clipPath: clipTo(g) }, t);
        step(caret, { x: g.right + 1, y: g.top }, t);
      });
      const done = t0 + Math.max(marks.length - 1, 0) * DT;
      step(el, { clipPath: "none" }, done + 0.08);
      return done;
    };
    /** sent: the button is pressed, the text leaves the composer as the bubble (the caller moves
        the thread to make room for it) */
    const sendAt = (el: HTMLElement, bubble: HTMLElement, press: number) => {
      tl.to(send, { keyframes: [{ scale: 0.86, duration: 0.08, ease: "power2.out" }, { scale: 1, duration: 0.22, ease: "power2.out" }] }, press);
      const t = press + 0.1;
      step(caret, { opacity: 0 }, t);
      step(el, { clipPath: HIDDEN_CLIP }, t);
      tl.to(send, { opacity: 0.45, duration: 0.2, ease: "power1.out" }, t);
      tl.to(bubble, { autoAlpha: 1, duration: 0.14, ease: "power1.out" }, t);
      tl.to(bubble, { x: 0, y: 0, duration: 0.6, ease: "power3.out" }, t);
      tl.to(phs[1], { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, t + 0.45);
      return t;
    };
    /** a line of Claude's answer, a word at a time */
    const stream = (line: Line, t: number) => {
      step(line.el, { autoAlpha: 1 }, t);
      line.words.forEach((w, k) => tl.to(w, { opacity: 1, duration: 0.16, ease: "power1.out" }, t + k * WORD));
      return t + Math.max(line.words.length - 1, 0) * WORD + 0.16;
    };
    /** a tool call: its card, what it is doing, then what came back (a count ticks up) */
    const call = (tool: Tool, start: number, work: number) => {
      tl.to(tool.el, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power3.out" }, start);
      const done = start + work;
      tl.to(tool.doing, { autoAlpha: 0, duration: 0.1, ease: "power1.in" }, done);
      tl.to(tool.done, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, done + 0.06);
      const num = tool.num;
      if (num) for (let k = 1; k <= 6; k++) step(num, { txt: fmt(Math.round((tool.to * k) / 6)) }, done + 0.06 + (k - 1) * 0.05);
      return done;
    };
    return { step, on, off, pulse, landAt, type, sendAt, stream, call };
  };

  /* ── the take ── */
  const tl = gsap.timeline({ paused: true });
  const T = movesOn(tl);
  /** the thread moves up to `scrolled` (a no-op while everything fits) */
  let scrolled = 0;
  const scrollTo = (to: number, t: number, duration = 0.45, ease = "power2.out") => {
    if (to <= scrolled) return;
    scrolled = to;
    tl.to(thread, { y: over - to, duration, ease }, t);
  };

  // the database at work, alone: a signal, then the Play the Brain makes of it
  T.landAt(lands.aSignal, LAND_A, true);
  T.landAt(lands.aPlay, BRAIN_A, false);

  // the question
  const typed1 = T.type(typed[0], glyphs[0], phs[0], TYPE_1);
  T.landAt(lands.m1, TYPE_1 + 0.75, true);
  const sent1 = T.sendAt(typed[0], bubbles[0], typed1 + TYPED_HOLD);
  scrollTo(scrolls.bubble1, sent1, 0.6, "power3.out");
  tl.to(greet, { autoAlpha: 0, y: -8, duration: 0.2, ease: "power2.in" }, sent1);

  // Claude reads the three tables: each tab takes its ring in turn; back with the rows, its ring
  // is around them and its mark on the first one's Play
  const READ = sent1 + 0.45;
  scrollTo(scrolls.tool1, READ - 0.1);
  const read = T.call(tools[0], READ, 0.9);
  tabs.forEach((tab, k) => T.pulse(tab, "data-read", READ + 0.1 + k * 0.26, 0.3));
  rows.forEach((row) => T.on(row, "data-sel", read));
  T.off(byCell, "data-noflag", read);

  // the answer, and each account's row as it is named
  scrollTo(scrolls.say1, read + 0.3);
  let t = T.stream(says[0], read + 0.4) + 0.1;
  picks.forEach((pick, k) => {
    T.off(rows[k], "data-unlit", t + 0.05);
    scrollTo(scrolls.picks[k], t - 0.1);
    t = T.stream(pick, t) + 0.06;
  });
  tl.to(art, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, t);
  scrollTo(scrolls.say2, t);
  const asked = T.stream(says[1], t + 0.1);

  // (the table goes on: another signal, lower down)
  T.landAt(lands.m2, asked + 0.15, true);

  // "Yes, run it."
  const typed2 = T.type(typed[1], glyphs[1], phs[1], asked + 0.8);
  const sent2 = T.sendAt(typed[1], bubbles[1], typed2 + TYPED_HOLD);
  scrollTo(scrolls.bubble2, sent2, 0.6, "power3.out");

  // the Play runs: Claude's ring closes on the cell; done, the cell is live
  const RUN = sent2 + 0.5;
  scrollTo(scrolls.tool2, RUN - 0.1);
  const ran = T.call(tools[1], RUN, 0.7);
  rows.forEach((row) => T.off(row, "data-sel", RUN));
  T.off(byCell, "data-noring", RUN);
  T.off(byCell, "data-nostate", ran + 0.06);
  T.pulse(byCell, "data-flash", ran + 0.06, FLASH);
  scrollTo(scrolls.say3, ran + 0.3);
  const done = T.stream(says[2], ran + 0.4);
  // (a beat on the finished picture before the take is over)
  T.step(card, {}, done + 0.6);

  /* ── the loop ── */
  /** started · torn down · waiting off screen · reduced motion (no new round) */
  let looping = false;
  let gone = false;
  let held = true;
  let still = false;
  /** the round under way, how many are done, the turn that comes next, the row Claude is on */
  let round: Timeline | undefined;
  let rounds = 0;
  let at = 0;
  let cur: Turn | undefined = turns.find((turn) => turn.live);

  const el = (tag: string, cls: string, text?: string) => {
    const node = document.createElement(tag);
    node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const lineEl = (tag: string, cls: string, text?: string) => {
    const node = el(tag, cls, text);
    node.setAttribute(LOOP, "");
    return node;
  };
  /** A phone's table shows its first rows only: a row counts while its Play's cell is above the
      card's bottom edge (wherever the visitor has slid the curtain). */
  const onShow = (turn: Turn) => {
    const r = turn.play.td.getBoundingClientRect();
    return r.height > 0 && r.bottom <= card.getBoundingClientRect().bottom + 1;
  };

  /** What has left through the top of the view for good goes. The thread stands on its bottom
      edge, so nothing on show moves. */
  const tidy = () => {
    const top = view.getBoundingClientRect().top;
    for (const line of $$(`:scope > [${LOOP}]`, thread)) {
      if (line.getBoundingClientRect().bottom > top - 80) break;
      line.remove();
    }
  };

  const buildRound = () => {
    const pool = turns.filter(onShow);
    // (nothing to go through: a card that is not laid out now. Asked again once it is on screen)
    if (pool.length < 2) return void (looping = false);
    // the next row on show, and the one that comes after it
    const from = (i: number) => {
      let k = i % turns.length;
      while (!pool.includes(turns[k])) k = (k + 1) % turns.length;
      return k;
    };
    const i = from(at);
    const turn = turns[i];
    const next = turns[from(i + 1)];
    at = i + 1;

    // the round's four lines, added to the thread: the ask, the answer, the go-ahead, the run
    const ask = lineEl("p", "lp-vcut__bubble", loopCopy.ask);
    const say = lineEl("p", "lp-vcut__say");
    const words = [el("b", "lp-vcut__w", turn.name), ...`${turn.to} ${turn.why}`.split(" ").map((word) => el("span", "lp-vcut__w", word))];
    words.forEach((word, k) => say.append(k ? " " : "", word));
    const go = lineEl("p", "lp-vcut__bubble", loopCopy.go);
    const runEl = tools[1].el.cloneNode(true) as HTMLElement;
    runEl.removeAttribute("data-n");
    [runEl, ...$$("[style]", runEl)].forEach((node) => node.removeAttribute("style"));
    runEl.setAttribute(LOOP, "");
    const run = toolOf(runEl);
    const runName = runEl.querySelector(".lp-vcut__tool-t i");
    if (runName) runName.textContent = turn.name;

    // measured before anything is written: the thread rests on its bottom edge (y 0), the new
    // lines at their END places under what was there
    const before = thread.offsetHeight;
    thread.append(ask, say, go, runEl);
    const height = thread.offsetHeight;
    const added = height - before;
    const pad = parseFloat(getComputedStyle(thread).paddingBottom) || 0;
    /** how far below its resting place the thread stands while this line is the last on show */
    const under = (line: HTMLElement) => Math.min(added, Math.max(0, height - pad - (line.offsetTop + line.offsetHeight)));
    const y = { ask: under(ask), say: under(say), go: under(go), run: under(runEl) };
    const marks = [measureGlyphs(typed[2]), measureGlyphs(typed[3])];
    const liftAsk = liftOf(ask, typed[2], added);
    const liftGo = liftOf(go, typed[3], y.say);

    set(thread, { y: added });
    set(ask, { autoAlpha: 0, x: liftAsk.x, y: liftAsk.y });
    set(go, { autoAlpha: 0, x: liftGo.x, y: liftGo.y });
    set(say, { autoAlpha: 0 });
    set(words, { opacity: 0 });
    set(runEl, { autoAlpha: 0, y: 6 });
    set(run.doing, { autoAlpha: 1 });
    set(run.done, { autoAlpha: 0 });

    const c = gsap.timeline({
      paused: true,
      onComplete: () => {
        rounds++;
        nextRound();
      },
    });
    const R = movesOn(c);
    // (the first round leaves the take's last picture a moment)
    let t0 = rounds ? 0.1 : 0.6;

    // the table: the Play that ran a round ago, on the row that comes after this one, is cleared;
    // this row's signal lands and the Brain writes its Play
    if (next.live) {
      R.on(next.play.td, "data-nostate", t0);
      for (const cell of [next.signal, next.play]) {
        c.to(cell.now, { opacity: 0, duration: 0.25, ease: "power1.in" }, t0);
        c.to(cell.was, { opacity: 0.72, duration: 0.3, ease: "power1.out" }, t0 + 0.2);
      }
      next.live = false;
      next.filled = false;
    }
    if (!turn.filled) {
      R.landAt(turn.signal, t0, true);
      R.landAt(turn.play, t0 + 0.55, false);
      turn.filled = true;
      t0 += LOOP_LANDED;
    } else {
      t0 += 0.4;
    }

    // the ask
    const typedAsk = R.type(typed[2], marks[0], phs[1], t0);
    const sentAsk = R.sendAt(typed[2], ask, typedAsk + TYPED_HOLD);
    c.to(thread, { y: y.ask, duration: 0.6, ease: "power3.out" }, sentAsk);

    // the answer. Claude reads first (the tabs take its ring in turn); then the Play's name: its
    // ring and its mark go to that cell, and the row lights (it alone)
    tabs.forEach((tab, k) => R.pulse(tab, "data-read", sentAsk + 0.2 + k * 0.16, 0.22));
    const answer = sentAsk + 0.85;
    c.to(thread, { y: y.say, duration: 0.45, ease: "power2.out" }, answer - 0.1);
    const named = answer + 0.05;
    for (const row of turns) {
      if (row === turn || !row.lit) continue;
      R.on(row.tr, "data-unlit", named);
      row.lit = false;
    }
    if (!turn.lit) R.off(turn.tr, "data-unlit", named);
    turn.lit = true;
    if (cur && cur !== turn) {
      R.on(cur.play.td, "data-noring", named);
      R.on(cur.play.td, "data-noflag", named);
    }
    R.off(turn.play.td, "data-noring", named);
    R.off(turn.play.td, "data-noflag", named);
    cur = turn;
    const said = R.stream({ el: say, words }, answer);

    // the go-ahead
    const typedGo = R.type(typed[3], marks[1], phs[1], said + 0.6);
    const sentGo = R.sendAt(typed[3], go, typedGo + GO_HOLD);
    c.to(thread, { y: y.go, duration: 0.6, ease: "power3.out" }, sentGo);

    // the Play runs; done, it is live in its cell
    const start = sentGo + 0.4;
    c.to(thread, { y: y.run, duration: 0.45, ease: "power2.out" }, start - 0.1);
    const live = R.call(run, start, 0.7) + 0.06;
    R.off(turn.play.td, "data-nostate", live);
    R.pulse(turn.play.td, "data-flash", live, FLASH);
    turn.live = true;
    R.step(card, {}, live + LOOP_REST);

    round = c;
    if (!held) c.play();
  };

  /** A round that cannot be built (a piece gone, a layout it cannot read) ends the loop where it
      stands: the picture on show is a finished one. */
  function nextRound() {
    round = undefined;
    if (gone || still) return;
    try {
      tidy();
      buildRound();
    } catch (err) {
      gone = true;
      if (process.env.NODE_ENV !== "production") console.error(err);
    }
  }
  const startLoop = () => {
    if (looping || gone || still || card.dataset.lpAnim !== "done") return;
    looping = true;
    nextRound();
  };
  const onState = new MutationObserver(startLoop);
  onState.observe(card, { attributes: true, attributeFilter: ["data-lp-anim"] });
  // (it waits while less than a fifth of the card is on screen: off screen, or the strip of it
  // that shows on the first screen)
  const onScreen = new IntersectionObserver(
    (entries) => {
      held = entries[entries.length - 1].intersectionRatio < ON_SCREEN;
      if (round) round.paused(held);
      else if (!held) startLoop();
    },
    { threshold: [0, ON_SCREEN] },
  );
  onScreen.observe(card);
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onMotion = () => {
    still = motion.matches;
    if (still) {
      // the round under way ends at once: a finished picture, and no other round
      looping = false;
      round?.progress(1);
    } else {
      startLoop();
    }
  };
  motion.addEventListener("change", onMotion);
  still = motion.matches;
  // QA: the loop's state, and a way to end the round under way at once
  type Probe = { loop?: { skip: () => void; state: () => Record<string, unknown> } };
  const probe = window as unknown as { __lpVision?: Probe };
  probe.__lpVision = {
    ...probe.__lpVision,
    loop: {
      skip: () => void round?.progress(1),
      state: () => ({ looping, held, still, rounds, at, lines: thread.children.length, playing: !!round && !round.paused() }),
    },
  };

  return {
    tl,
    cue: 0,
    cleanup() {
      gone = true;
      onState.disconnect();
      onScreen.disconnect();
      motion.removeEventListener("change", onMotion);
      round?.kill();
      round = undefined;
      $$(`[${LOOP}]`, thread).forEach((line) => line.remove());
      delete probe.__lpVision?.loop;
      // the server's picture: none of the take's attributes, its own stand-ins back
      for (const name of FLAGS) card.querySelectorAll(`[${name}]`).forEach((node) => node.removeAttribute(name));
      idleCells.forEach((cell) => cell.setAttribute(IDLE, ""));
      dimRows.forEach((row) => row.setAttribute(DIM, ""));
    },
  };
}
