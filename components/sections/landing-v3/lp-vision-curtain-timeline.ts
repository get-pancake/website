// No "use client" on purpose: a plain module, reached only through LpVisionCurtain's import()
// (lp-play-once loads it with GSAP, out of the page's first bundle).
import { gsap } from "@/lib/gsap";

import { clipTo, HIDDEN_CLIP, measureGlyphs, STEP, type Glyph } from "./lp-demo-pancake-timeline";
import { registerTxtPlugin } from "./lp-gsap-txt";
import { VISION_CURTAIN } from "./lp-vision-data";
import { DB_HERO_STORY } from "./lp-vision-tables";

/**
 * The window under the vision homepage's hero (LpVisionCurtain.tsx, 2026-11-11): Claude on the
 * left, Pancake's companies table on the right. The table LIVES, asked or not; Claude steps in
 * twice. The founder, on the takes before this one: "on fait un peu du ligne a ligne alors que ce
 * qu'on veut c'est plus de dynamisme", "un data model underneath mon Claude"; then, on a take
 * where five typed commands each moved the table once: "tu fais des commandes one shot qui
 * touchent à la base, il faut qu'on retrouve un côté plus autonome et dynamique où la base vit
 * seule".
 *
 * THE TAKE (lp-play-once drives it; the copy is VISION_CURTAIN.thread, the rows DB_HERO, where
 * each row stands at each moment DB_HERO_STORY.orders). The table is ranked by the Brain's fit
 * all along. What it does by itself comes in threes: a SIGNAL lands in a row (NULL gives way to
 * the value, the cell flashes); the Brain RESCORES the account (its fit counts up); the row GOES
 * TO ITS NEW RANK, lit while it travels, and the rows it passes move down. The status line under
 * the rows says each thing as it happens.
 *   0     a new chat in Claude's window. Within half a second the table works: a signal on an
 *         account, its new fit, its row up two places
 *   1.3   typed, sent: "Which accounts should we work on now?" One tool call; the view bar's
 *         filter becomes `signal is not NULL`, the rows that have no signal go, the others come
 *         together. Claude's answer
 *         ... and the table goes on: two rows that are one company MERGE, a new signal lands on
 *         an account of the view and it climbs to the top
 *         THEN THE ONE THAT STOPS YOU: a signal lands on an account that had none, a deal that
 *         was lost. It has one now, so its row ENTERS the view; its fit jumps, it lights and
 *         goes to the top. Pancake tells Claude, and Claude says it, unasked: the account hired
 *         the buyer of an account you won. (The table does not wait for the answer: another
 *         account enters meanwhile)
 *         typed, sent: "Yes. Work every account that passes 90." A standing order. The Brain's
 *         column of Plays OPENS (the ones to its right move over), the Plays of the two rows
 *         above 90 are written, Claude's ring and its mark take each cell and it goes live
 *         FROM HERE NOTHING IS TYPED. A signal lands on a third account: fit, rank, its Play
 *         written, Claude runs it. The first account answers: its deal, lost, is OPEN again. A
 *         fourth account passes 90.
 * and a beat on the finished picture.
 *
 * THEN IT PLAYS AGAIN, for as long as the card is on screen (this card's one exception to "plays
 * once, nothing loops"; founder: "Je prolongerai les animations en mode endless loop"). The
 * finished picture rests, a new chat opens (the conversation and the table go and come back on
 * the take's first frame, as a cleared chat and a cleared view) and the same take plays. It is
 * the take's own timeline, sent back to its start: nothing is rebuilt. It waits while the card
 * is off screen (less than a fifth of it on show), while the visitor has scrolled up the
 * conversation or holds the handle, and it does not run under reduced motion.
 *
 * The contract of the page's timelines (lp-step-timelines.ts, the dive's stories): the server
 * markup is the END picture; every piece is looked up and measured BEFORE anything is written (a
 * missing piece throws there and the server's picture stands); frame 0 is a block of gsap.set;
 * the take holds tweens only, an instant change being a 1 ms tween (`step`), so it can be seeked
 * both ways (QA: window.__lpVision.curtain). States that are colours or presence (a lit row,
 * Claude's ring, a flash, the view bar's filter, a line of the conversation that has arrived,
 * the column that is still shut) are attributes the take flips (flagOn / flagOff below) and
 * vision.css reads. What moves is tweened here: a row's own transform and opacity (the grid's
 * lines are its cells' borders, they go with it), the column's opening (--open-play, a number
 * from 0 to 1 the stylesheet multiplies its width by). No ease overshoots (power1 to power3).
 *
 * Nothing here depends on how wide Claude's column is or where its conversation is scrolled: the
 * visitor resizes the two with the handle and scrolls the conversation while the take plays. So
 * a line arrives by being let into the flow (data-in) and the component scrolls to it; and the
 * only lengths measured are the typed glyphs (against their own line) and a row's height.
 */

type Timeline = gsap.core.Timeline;
export type BuiltCurtain = { tl: Timeline; cleanup: () => void; cue: number };

/* the take, seconds */
/** the table's first move, before anything is asked */
const ALIVE = 0.35;
/** the first line is typed while the table is still at it */
const START = 1.3;
/** one glyph every 30 ms, a held beat before it is sent */
const DT = 0.03;
const TYPED_HOLD = 0.32;
/** from a line sent to its tool call, and from the call to the table's move */
const CALL = 0.3;
const MOVE = 0.15;
/** one word of Claude's answer every 45 ms */
const WORD = 0.045;
/** how long a cell stays flashed once its value is in */
const FLASH = 0.5;
/** from a signal landed to the Brain's new fit, and how long the fit counts */
const THINK = 0.4;
const COUNT = 0.3;
/** how long a row takes to its new rank (the one that stops you travels further) */
const CLIMB = 0.55;
const CLIMB_FAR = 0.8;
/** the finished picture, before the take is over */
const END_HOLD = 1.4;
/* the loop, seconds */
/** the finished picture's rest before a new chat */
const LOOP_REST = 3.5;
/** the share of the card that has to be on screen for the loop to run */
const ON_SCREEN = 0.2;

/** the attributes the take flips (vision.css reads them); cleared when the take is torn down */
const FLAGS = [
  "data-in",
  "data-unlit",
  "data-flash",
  "data-lit",
  "data-read",
  "data-top",
  "data-noflag",
  "data-noring",
  "data-nostate",
  "data-filter",
  "data-rt",
  "data-rb",
  "data-rl",
  "data-keep-narrow",
  "data-shut-play",
  "data-wr-play",
  "data-pick",
  "data-ring",
] as const;
type Flag = (typeof FLAGS)[number];
/** the server's picture has Claude's ring on the last cell it ran only (data-idle on the
    others, vision.css). The take swaps it for its own flags, which it can lift */
const IDLE = "data-idle";

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

type Row = HTMLTableRowElement;
type Line = { el: HTMLElement; words: HTMLElement[] };
type Tool = { el: HTMLElement; doing: HTMLElement | null; done: HTMLElement; num: HTMLElement | null; to: number };
type Land = { td: HTMLTableCellElement; was: HTMLElement; now: HTMLElement; th: HTMLElement | undefined };
type Scored = keyof typeof DB_HERO_STORY.fits;

export function buildVisionCurtain(card: HTMLElement): BuiltCurtain {
  const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = card): T => {
    const el = root.querySelector<T>(sel);
    if (!el) throw new Error(`vision-curtain: ${sel} missing`);
    return el;
  };
  const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = card) => Array.from(root.querySelectorAll<T>(sel));
  const S = DB_HERO_STORY;
  const SAYS = S.status;
  const counts = VISION_CURTAIN.filter.some;

  /* ── the pieces ── */
  // Pancake's side
  const db = $(".lp-vcut__db .lp-db");
  const companiesTab = $('.lp-vcut__tabs [data-tab="companies"]');
  const signalsTab = $('.lp-vcut__tabs [data-tab="signals"]');
  const headRow = $<Row>(".lp-vcut__db thead tr");
  /** the view bar (its filter), the count of what the view holds, the status line */
  const filterBar = $(".lp-vcut__filter");
  const countSome = $('.lp-vcut__count [data-when="some"]');
  const countEl = $(".lp-vcut__count");
  const statusLine = $(".lp-vcut__status");
  const statusText = $(".lp-vcut__status-t");
  /** every row of the table, in the markup's order: a row's slot is where it stands untouched */
  const body = $$<Row>(".lp-vcut__db tbody tr");
  const slotOf = new Map(body.map((tr, k) => [tr, k]));
  const slot = (tr: Row) => slotOf.get(tr) ?? 0;
  const rowOf = (key: string) => {
    const tr = body.find((row) => row.dataset.row === key);
    if (!tr) throw new Error(`vision-curtain: row ${key} missing`);
    return tr;
  };
  const cellOf = (key: string, col: string) => $<HTMLTableCellElement>(`td[data-col="${col}"]`, rowOf(key));
  const numOf = (tr: Row) => $<HTMLTableCellElement>("td.lp-db__n", tr);
  /** the orders the rows stand in, moment after moment (DB_HERO_STORY.orders) */
  const O = Object.fromEntries(Object.entries(S.orders).map(([name, keys]) => [name, keys.map(rowOf)])) as Record<keyof typeof S.orders, Row[]>;
  if (O.base.length !== body.length || new Set(O.base).size !== body.length) throw new Error("vision-curtain: every row has one place before anything is asked");
  if (O.legal.some((tr, k) => slot(tr) !== k)) throw new Error("vision-curtain: the rows the take ends on come first, in their final order");
  const [keep, dup] = S.pair.map(rowOf);
  const hero = rowOf(S.hero);
  /** a value that lands while the take plays: its cell, NULL and the value, its column's head */
  const landing = (key: string): Land => {
    const td = $<HTMLTableCellElement>(`.lp-vcut__db td[data-land="${key}"]`);
    return { td, was: $(".lp-db__was", td), now: $(".lp-db__now", td), th: headRow.cells[td.cellIndex] as HTMLElement | undefined };
  };
  const scored = Object.keys(S.fits) as Scored[];
  const fits = Object.fromEntries(scored.map((key) => [key, cellOf(key, "fit")])) as Record<Scored, HTMLTableCellElement>;
  /** the signals that land in a cell that had none, and those that take the place of an older
      one (the cell's own words are the new signal: the END's) */
  const lands = { ro: landing("ro-signal"), fi: landing("fi-signal"), tr: landing("tr-signal") };
  const swaps = Object.fromEntries(
    (Object.keys(S.was) as (keyof typeof S.was)[]).map((key) => {
      const td = cellOf(key, "signal");
      return [key, { td, to: td.textContent ?? "", th: headRow.cells[td.cellIndex] as HTMLElement | undefined }];
    }),
  ) as Record<keyof typeof S.was, { td: HTMLTableCellElement; to: string; th: HTMLElement | undefined }>;
  type Signalled = keyof typeof lands | keyof typeof swaps;
  /** the Plays the Brain writes and Claude runs, in the order it runs them */
  const ran = ["fi", "lo", "dv", "lg"] as const;
  const plays = Object.fromEntries(ran.map((key) => [key, landing(`${key}-play`)])) as Record<(typeof ran)[number], Land>;
  const idleCells = ran.map((key) => plays[key].td).filter((td) => td.hasAttribute(IDLE));
  /** the deal that reopens: its cell, its tag */
  const heroDeal = cellOf(S.hero, "crm_deal");
  const heroTag = $(".lp-db__tag", heroDeal);
  // Claude's side
  const view = $(".lp-vcut__view");
  const greet = $(".lp-vcut__greet");
  const lineEl = (id: string) => $(`.lp-vcut__thread > [data-line="${id}"]`);
  const say = (id: string): Line => {
    const el = lineEl(id);
    return { el, words: $$(".lp-vcut__w", el) };
  };
  const tool = (id: string): Tool => {
    const el = lineEl(id);
    const num = el.querySelector<HTMLElement>(".lp-vcut__tool-done b");
    return { el, doing: el.querySelector<HTMLElement>(".lp-vcut__tool-doing"), done: $(".lp-vcut__tool-done", el), num, to: num ? Number(num.dataset.to) || 0 : 0 };
  };
  const bubbles = { ask1: lineEl("ask1"), ask2: lineEl("ask2") };
  const tools = { filter: tool("filter"), ping: tool("ping"), rule: tool("rule"), run1: tool("run1"), run2: tool("run2") };
  const says = { say1: say("say1"), say2: say("say2"), say3: say("say3"), say4: say("say4") };
  const typed = { ask1: $('.lp-vcut__typed[data-line="ask1"]'), ask2: $('.lp-vcut__typed[data-line="ask2"]') };
  const phs = [1, 2].map((n) => $(`.lp-vcut__ph[data-n="${n}"]`));
  const caret = $(".lp-vcut__caret");
  const send = $(".lp-vcut__send");

  /* ── the geometry, read on the untouched END layout ── */
  const glyphs = { ask1: measureGlyphs(typed.ask1), ask2: measureGlyphs(typed.ask2) };
  /** how far apart two rows stand: a row's own height, its line included (the stylesheet's 34 px
      if the table has no layout yet) */
  const H = body[1].offsetHeight || 34;
  /** where a row stands, as the `k`th of an order */
  const yAt = (tr: Row, k: number) => (k - slot(tr)) * H;

  registerTxtPlugin();
  registerFlagPlugins();

  /* ── frame 0: a new chat in Claude's window, the table before anything ── */
  const set = gsap.set;
  const flag = (el: Element, name: Flag) => set(el, { flagOn: name });
  O.base.forEach((tr, k) => {
    set(tr, { autoAlpha: 1, y: yAt(tr, k) });
    set(numOf(tr), { txt: String(k + 1) });
  });
  set(countSome, { txt: counts[0] });
  set(statusText, { txt: SAYS.idle });
  // (the server's picture has the filter on: off, until it is asked for)
  set(filterBar, { flagOff: "data-filter" });
  // the Brain's column of Plays is shut; the columns a narrow window folds away when it opens
  // are there (vision.css reads --keep-narrow only on a narrow window)
  flag(db, "data-shut-play");
  flag(db, "data-keep-narrow");
  set(db, { "--open-play": 0, "--keep-narrow": 1 });
  for (const key of scored) set(fits[key], { txt: String(S.fits[key][0]) });
  for (const land of Object.values(lands)) {
    set(land.was, { opacity: 0.72 });
    set(land.now, { opacity: 0 });
  }
  for (const key of Object.keys(swaps) as (keyof typeof swaps)[]) set(swaps[key].td, { txt: S.was[key] });
  // (the deal that reopens is still lost)
  set(heroTag, { txt: "closed_lost" });
  for (const key of ran) {
    const { td, was, now } = plays[key];
    set(was, { opacity: 0.72 });
    set(now, { opacity: 0 });
    flag(td, "data-noflag");
    flag(td, "data-noring");
    flag(td, "data-nostate");
  }
  flag(hero, "data-unlit");
  set(greet, { autoAlpha: 1, y: 0 });
  for (const el of [...Object.values(bubbles), ...Object.values(tools).map((it) => it.el)]) set(el, { autoAlpha: 0, y: 8 });
  for (const it of Object.values(tools)) {
    if (!it.doing) continue;
    set(it.doing, { autoAlpha: 1 });
    set(it.done, { autoAlpha: 0 });
    if (it.num) set(it.num, { txt: "0" });
  }
  for (const line of Object.values(says)) {
    set(line.el, { autoAlpha: 0 });
    set(line.words, { opacity: 0 });
  }
  set(phs[0], { autoAlpha: 1 });
  set(phs[1], { autoAlpha: 0 });
  set(Object.values(typed), { clipPath: HIDDEN_CLIP });
  set(caret, { opacity: 1, x: 0, y: 0 });
  set(send, { opacity: 0.45, scale: 1 });
  // (the take's own flags are on: the server's stand-in for them goes)
  idleCells.forEach((td) => td.removeAttribute(IDLE));
  // the take is in charge: a line of the conversation is in the flow once it has arrived
  // (data-in), and the stylesheet's stand-in for this frame goes (data-pre, vision.css)
  card.setAttribute("data-take", "");
  card.setAttribute("data-open", "");

  /* ── the moves ── */
  const tl = gsap.timeline({ paused: true });
  const step = (targets: gsap.TweenTarget, vars: gsap.TweenVars, t: number) => tl.to(targets, { ...vars, duration: STEP, ease: "none" }, t);
  const on = (el: Element, name: Flag, t: number) => step(el, { flagOn: name }, t);
  const off = (el: Element, name: Flag, t: number) => step(el, { flagOff: name }, t);
  /** an attribute held for a while */
  const pulse = (el: Element, name: Flag, t: number, hold: number) => {
    on(el, name, t);
    off(el, name, t + hold);
  };
  /* Claude's side */
  /** a line of the conversation arrives: it is let into the flow, then comes up */
  const arrive = (el: HTMLElement, t: number) => {
    on(el, "data-in", t);
    tl.to(el, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power3.out" }, t + STEP);
  };
  /** what is typed in the composer: the text shows glyph by glyph, the caret follows */
  const type = (el: HTMLElement, marks: Glyph[], placeholder: HTMLElement, t0: number) => {
    step(placeholder, { autoAlpha: 0 }, t0 - STEP);
    step(caret, { opacity: 1, x: 0, y: 0 }, t0 - 0.25);
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
  /** sent: the button is pressed, the composer empties, the bubble arrives */
  const sendAt = (el: HTMLElement, bubble: HTMLElement, press: number) => {
    tl.to(send, { keyframes: [{ scale: 0.86, duration: 0.08, ease: "power2.out" }, { scale: 1, duration: 0.22, ease: "power2.out" }] }, press);
    const t = press + 0.1;
    step(caret, { opacity: 0 }, t);
    step(el, { clipPath: HIDDEN_CLIP }, t);
    tl.to(send, { opacity: 0.45, duration: 0.2, ease: "power1.out" }, t);
    arrive(bubble, t);
    tl.to(phs[1], { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, t + 0.45);
    return t;
  };
  /** a line of Claude's answer, a word at a time */
  const stream = (line: Line, t: number) => {
    on(line.el, "data-in", t);
    step(line.el, { autoAlpha: 1 }, t + STEP);
    line.words.forEach((w, k) => tl.to(w, { opacity: 1, duration: 0.16, ease: "power1.out" }, t + STEP + k * WORD));
    return t + Math.max(line.words.length - 1, 0) * WORD + 0.16;
  };
  /** a tool call is back: what it was doing gives way to what came back (a count ticks up) */
  const back = (it: Tool, t: number) => {
    if (!it.doing) return;
    tl.to(it.doing, { autoAlpha: 0, duration: 0.1, ease: "power1.in" }, t);
    tl.to(it.done, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, t + 0.06);
    const num = it.num;
    if (num) for (let k = 1; k <= 6; k++) step(num, { txt: fmt(Math.round((it.to * k) / 6)) }, t + 0.06 + (k - 1) * 0.05);
  };
  /* Pancake's side */
  /** the status line says what the table does */
  const status = (text: string, t: number) => {
    step(statusText, { txt: text }, t);
    pulse(statusLine, "data-lit", t, 0.7);
  };
  /** a value lands: NULL gives way to it, the cell flashes, the column's source lights */
  const landAt = (land: Land, t: number) => {
    tl.to(land.was, { opacity: 0, duration: 0.16, ease: "power1.in" }, t);
    tl.to(land.now, { opacity: 1, duration: 0.3, ease: "power1.out" }, t + 0.1);
    pulse(land.td, "data-flash", t + 0.1, FLASH);
    if (land.th) pulse(land.th, "data-lit", t, 0.9);
  };
  /** the rows of `order` go to their places in it, and take its numbers */
  const settle = (order: Row[], t: number, duration: number, ease: string) => {
    order.forEach((tr, k) => {
      tl.to(tr, { y: yAt(tr, k), duration, ease, force3D: false }, t);
      step(numOf(tr), { txt: String(k + 1) }, t + duration * 0.4);
    });
  };
  /** a signal comes in: it lands in a cell that had none, or takes the place of an older one */
  const signalIn = (key: Signalled, t: number, said: string) => {
    if (key in lands) {
      landAt(lands[key as keyof typeof lands], t);
    } else {
      const swap = swaps[key as keyof typeof swaps];
      step(swap.td, { txt: swap.to }, t + 0.1);
      pulse(swap.td, "data-flash", t + 0.1, FLASH);
      if (swap.th) pulse(swap.th, "data-lit", t, 0.9);
    }
    pulse(signalsTab, "data-read", t, 0.5);
    status(said, t);
  };
  /** the Brain rescores the account: its fit counts to the new number. Returns when it has. */
  const rescore = (key: Scored, t: number, said: string) => {
    const [from, to] = S.fits[key];
    for (let k = 1; k <= 6; k++) step(fits[key], { txt: String(Math.round(from + ((to - from) * k) / 6)) }, t + ((k - 1) * COUNT) / 5);
    pulse(fits[key], "data-flash", t, COUNT + FLASH);
    status(said, t);
    return t + COUNT;
  };
  /** its row goes to its new rank, lit and over the others while it travels */
  const climbs = (key: string, order: Row[], t: number, far = false) => {
    const tr = rowOf(key);
    const duration = far ? CLIMB_FAR : CLIMB;
    on(tr, "data-top", t);
    if (tr !== hero) pulse(tr, "data-flash", t, duration);
    settle(order, t, duration, "power2.inOut");
    off(tr, "data-top", t + duration + 0.05);
    return t + duration;
  };
  /** What the table does by itself, in three: a signal on the account, its new fit, its new
      rank. Returns when the row is there. */
  const rises = (key: Scored & Signalled, order: Row[], t: number, said: { signal: string; fit: string }) => {
    signalIn(key, t, said.signal);
    return climbs(key, order, rescore(key, t + THINK, said.fit) + 0.05);
  };
  /** A signal lands on an account that had none: it is one of the accounts to work now, so its
      row comes into the view at its rank (the rows under it make room) and the count goes up. */
  const enters = (key: keyof typeof lands, order: Row[], t: number, said: string, count: string) => {
    const tr = rowOf(key);
    settle(order, t, 0.4, "power3.out");
    signalIn(key, t + 0.1, said);
    tl.to(tr, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, t + 0.2);
    if (tr !== hero) pulse(tr, "data-flash", t + 0.2, FLASH + 0.2);
    step(countSome, { txt: count }, t + 0.25);
    return t + 0.6;
  };
  /** the Brain writes the account's next best Play */
  const writes = (key: (typeof ran)[number], t: number) => landAt(plays[key], t);
  /** Claude runs it: its ring and its mark come to the cell (from the one it ran before), and
      the Play goes live. Returns when it is. */
  const runs = (key: (typeof ran)[number], t: number) => {
    const before = ran[ran.indexOf(key) - 1];
    if (before) {
      on(plays[before].td, "data-noring", t);
      on(plays[before].td, "data-noflag", t);
    }
    off(plays[key].td, "data-noring", t);
    off(plays[key].td, "data-noflag", t);
    const live = t + 0.35;
    off(plays[key].td, "data-nostate", live);
    pulse(plays[key].td, "data-flash", live, FLASH);
    return live;
  };

  /* ── the take ── */
  // the table, by itself, before anything is asked
  rises("ro", O.rescored, ALIVE, { signal: SAYS.roSignal, fit: SAYS.roFit });

  // asked: which accounts to work. The view narrows to the ones that have a signal
  const typed1 = type(typed.ask1, glyphs.ask1, phs[0], START);
  const sent1 = sendAt(typed.ask1, bubbles.ask1, typed1 + TYPED_HOLD);
  tl.to(greet, { autoAlpha: 0, y: -8, duration: 0.2, ease: "power2.in" }, sent1);
  arrive(tools.filter.el, sent1 + CALL);
  const f = sent1 + CALL + MOVE;
  // Claude's call is at work in the table: it picks the rows that have a signal, top to bottom
  // (founder: "je lierais un peu les 86 en montrant que ça les entoure et les filtre dans la
  // database"). Its ring is the table's only: nothing is framed on Claude's side (founder: "pas
  // sûr qu'il faille encadrer côté Claude")
  pulse(companiesTab, "data-read", f, 0.4);
  const kept = O.rescored.filter((tr) => O.view.includes(tr));
  kept.forEach((tr) => on(tr, "data-pick", f + 0.05 + O.rescored.indexOf(tr) * 0.025));
  // the filter: the others go, the picked ones come together under the head, and Claude's frame
  // closes around them while the count says how many there are
  const fF = f + 0.6;
  on(filterBar, "data-filter", fF);
  tl.to(O.rescored.filter((tr) => !O.view.includes(tr)), { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, fF);
  settle(O.view, fF + 0.12, 0.45, "power3.out");
  on(db, "data-ring", fF + 0.35);
  kept.forEach((tr) => off(tr, "data-pick", fF + 0.6));
  const filtered = fF + 0.62;
  back(tools.filter, filtered);
  on(countEl, "data-lit", filtered);
  const said1 = stream(says.say1, filtered + 0.2);
  off(db, "data-ring", said1 + 0.35);
  off(countEl, "data-lit", said1 + 0.35);

  // the table goes on. Two rows are one company: the ring takes the pair, the duplicate goes
  // into the row over it, what stood under comes up
  const pair = said1 + 0.55;
  on(keep, "data-rt", pair);
  on(keep, "data-rl", pair);
  on(dup, "data-rb", pair);
  on(dup, "data-rl", pair);
  status(SAYS.merge, pair);
  const m = pair + 0.42;
  tl.to(dup, { y: yAt(dup, O.merged.indexOf(keep)), duration: 0.4, ease: "power2.inOut", force3D: false }, m);
  tl.to(dup, { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, m + 0.16);
  off(dup, "data-rb", m + 0.4);
  off(dup, "data-rl", m + 0.4);
  on(keep, "data-rb", m + 0.3);
  pulse(keep, "data-flash", m + 0.3, FLASH);
  for (const name of ["data-rt", "data-rb", "data-rl"] as const) off(keep, name, m + 0.8);
  settle(O.merged, m, 0.45, "power3.out");
  step(countSome, { txt: counts[1] }, m + 0.25);
  // a new signal on an account of the view: it goes to the top
  const up1 = rises("lo", O.logistics, m + 0.85, { signal: SAYS.loSignal, fit: SAYS.loFit });

  // the one that stops you. A signal lands on a deal that was lost: it comes into the view, its
  // fit jumps, its row lights and goes to the top. Pancake tells Claude (the call's card), and
  // Claude says it, unasked
  const stop = up1 + 0.4;
  const inView = enters("fi", O.entered, stop, SAYS.fiSignal, counts[2]);
  off(hero, "data-unlit", inView + 0.1);
  const up2 = climbs("fi", O.fintech, rescore("fi", inView + 0.1, SAYS.fiFit) + 0.05, true);
  const ping = inView + 0.1 + COUNT;
  arrive(tools.ping.el, ping);
  // as its card comes in, the account's row takes Claude's ring
  for (const name of ["data-rt", "data-rb", "data-rl"] as const) on(hero, name, ping);
  const said2 = stream(says.say2, up2 - 0.15);
  for (const name of ["data-rt", "data-rb", "data-rl"] as const) off(hero, name, said2 + 0.2);
  // (and while the answer is read and the next line typed, the table is still at it: another
  // account comes into the view)
  enters("tr", O.travel, said2 + 0.5, SAYS.trSignal, counts[3]);

  // the standing order. The Brain's column of Plays opens, the Plays of the rows above 90 are
  // written, and Claude runs them one after the other
  const typed2 = type(typed.ask2, glyphs.ask2, phs[1], said2 + 0.75);
  const sent2 = sendAt(typed.ask2, bubbles.ask2, typed2 + TYPED_HOLD);
  arrive(tools.rule.el, sent2 + CALL);
  const o = sent2 + CALL + MOVE;
  // as its card comes in, the rows above 90 (the two at the top) take Claude's ring
  const [top1, top2] = O.travel;
  on(top1, "data-rt", o - 0.05);
  on(top2, "data-rb", o - 0.05);
  for (const tr of [top1, top2]) on(tr, "data-rl", o - 0.05);
  off(db, "data-shut-play", o);
  on(db, "data-wr-play", o);
  tl.to(db, { "--open-play": 1, duration: 0.45, ease: "power3.out" }, o + STEP);
  // (a narrow window: the deal's and the signal's columns fold away as this one opens)
  tl.to(db, { "--keep-narrow": 0, duration: 0.45, ease: "power3.out" }, o + STEP);
  off(db, "data-keep-narrow", o + 0.46);
  pulse($('th[data-col="next_best_play"]', headRow), "data-lit", o, 1.3);
  writes("fi", o + 0.5);
  writes("lo", o + 0.7);
  status(SAYS.plays, o + 0.5);
  off(db, "data-wr-play", o + 1.05);
  const live1 = runs("fi", o + 1.05);
  const live2 = runs("lo", live1 + 0.3);
  back(tools.rule, live2 + 0.1);
  off(top1, "data-rt", live2 + 0.4);
  off(top2, "data-rb", live2 + 0.4);
  for (const tr of [top1, top2]) off(tr, "data-rl", live2 + 0.4);
  const said3 = stream(says.say3, live2 + 0.3);

  // from here nothing is typed. A third account passes 90: its Play is written, Claude runs it
  const auto = (key: "dv" | "lg", order: Row[], card: Tool, t0: number, said: { signal: string; fit: string; live: string }) => {
    const up = rises(key, order, t0, said);
    writes(key, up + 0.1);
    arrive(card.el, up + 0.2);
    const live = runs(key, up + 0.4);
    status(said.live, live);
    back(card, live + 0.05);
    return live;
  };
  const live3 = auto("dv", O.devtools, tools.run1, said3 + 0.6, { signal: SAYS.dvSignal, fit: SAYS.dvFit, live: SAYS.dvLive });

  // the first account answers: its deal, lost, is open again
  const reopen = live3 + 0.8;
  step(heroTag, { txt: "open" }, reopen);
  pulse(heroDeal, "data-flash", reopen, FLASH + 0.3);
  status(SAYS.reopen, reopen);
  const said4 = stream(says.say4, reopen + 0.3);

  // and a fourth account passes 90
  const live4 = auto("lg", O.legal, tools.run2, said4 + 0.7, { signal: SAYS.lgSignal, fit: SAYS.lgFit, live: SAYS.lgLive });
  // (a beat on the finished picture before the take is over)
  step(card, {}, live4 + END_HOLD);

  /* ── the loop ── */
  /** torn down · waiting off screen · reduced motion (the take does not play again) */
  let gone = false;
  let held = true;
  let still = false;
  /** how many times the take has been sent back to its start */
  let cycles = 0;
  /** the finished picture's rest, and the new chat's fade */
  let wait: gsap.core.Tween | undefined;
  let turn: Timeline | undefined;
  /** what goes and comes back when a new chat opens: Claude's view, Pancake's table (the take
      itself never tweens these two) */
  const cleared = [view, $("table", db)];

  /** A new chat: the take is sent back to its first frame behind a short fade, and plays. */
  const again = () => {
    wait = undefined;
    if (gone || still) return;
    // the visitor is reading back up the conversation, or has the handle in hand: it waits
    if (view.hasAttribute("data-up") || card.querySelector(".lp-vcut__handle:active")) {
      wait = gsap.delayedCall(1, again);
      wait.paused(held);
      return;
    }
    turn = gsap
      .timeline({
        onComplete: () => {
          turn = undefined;
          cycles++;
          tl.play();
          tl.paused(held);
        },
      })
      .to(cleared, { opacity: 0, duration: 0.28, ease: "power1.in" })
      .add(() => {
        tl.timeScale(1);
        tl.pause(0);
      })
      .to(cleared, { opacity: 1, duration: 0.32, ease: "power1.out" });
    turn.paused(held);
  };
  /** The take is over (lp-play-once marks the card: played, or shown at once to a visitor who
      arrived on it; and each time it has played again): the finished picture rests, then a new
      chat. */
  const rest = () => {
    if (gone || still || wait || turn || card.dataset.lpAnim !== "done" || tl.progress() < 1) return;
    wait = gsap.delayedCall(LOOP_REST, again);
    wait.paused(held);
  };
  const onState = new MutationObserver(rest);
  onState.observe(card, { attributes: true, attributeFilter: ["data-lp-anim"] });
  // (it waits while less than a fifth of the card is on screen: off screen, or the strip of it
  // that shows on the first screen. The first take is lp-play-once's: only the ones after it
  // are held here)
  const onScreen = new IntersectionObserver(
    (entries) => {
      held = entries[entries.length - 1].intersectionRatio < ON_SCREEN;
      wait?.paused(held);
      turn?.paused(held);
      if (cycles > 0 && !turn && tl.progress() < 1) tl.paused(held);
      else if (!held) rest();
    },
    { threshold: [0, ON_SCREEN] },
  );
  onScreen.observe(card);
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onMotion = () => {
    still = motion.matches;
    if (!still) return rest();
    // (lp-play-once puts the take on its END picture: no rest, no new chat)
    wait?.kill();
    turn?.kill();
    wait = turn = undefined;
    gsap.set(cleared, { opacity: 1 });
  };
  motion.addEventListener("change", onMotion);
  still = motion.matches;
  // QA: the loop's state, and a way to end what is under way at once (the rest, or the take)
  type Probe = { loop?: { skip: () => void; state: () => Record<string, unknown> } };
  const probe = window as unknown as { __lpVision?: Probe };
  probe.__lpVision = {
    ...probe.__lpVision,
    loop: {
      skip: () => {
        if (wait) {
          wait.kill();
          again();
        } else if (turn) {
          turn.progress(1);
        } else {
          tl.progress(1);
        }
      },
      state: () => ({
        cycles,
        held,
        still,
        resting: !!wait,
        turning: !!turn,
        playing: tl.isActive(),
        at: Math.round(tl.time() * 100) / 100,
        lines: $$(".lp-vcut__thread > [data-in]").length,
        up: view.hasAttribute("data-up"),
        filter: filterBar.hasAttribute("data-filter"),
        status: statusText.textContent,
      }),
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
      wait?.kill();
      turn?.kill();
      wait = turn = undefined;
      gsap.set(cleared, { clearProps: "opacity" });
      delete probe.__lpVision?.loop;
      // the server's picture: none of the take's attributes, and its own back (the view bar's
      // filter is on in it, Claude's ring is on the last cell it ran only)
      for (const name of FLAGS) card.querySelectorAll(`[${name}]`).forEach((node) => node.removeAttribute(name));
      card.removeAttribute("data-take");
      filterBar.setAttribute("data-filter", "");
      idleCells.forEach((td) => td.setAttribute(IDLE, ""));
    },
  };
}
