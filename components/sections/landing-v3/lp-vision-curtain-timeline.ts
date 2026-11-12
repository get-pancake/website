// No "use client" on purpose: a plain module, reached only through LpVisionCurtain's import()
// (lp-play-once loads it with GSAP, out of the page's first bundle).
import { gsap } from "@/lib/gsap";

import { clipTo, HIDDEN_CLIP, measureGlyphs, STEP, type Glyph } from "./lp-demo-pancake-timeline";
import { registerTxtPlugin } from "./lp-gsap-txt";
import { DB_HERO_STORY, DB_PEOPLE_STORY, DB_SIGNALS_STORY } from "./lp-vision-tables";

/**
 * The window under the vision homepage's hero (LpVisionCurtain.tsx, 2026-11-11, reworked
 * 2026-11-12): Claude on the left, Pancake's tables on the right. The tables LIVE, asked or not,
 * and everything they do happens IN BULK; the window moves over them like a camera. The founder:
 * "on fait un peu du ligne à ligne alors que ce qu'on veut c'est plus de dynamisme", "il faut
 * qu'on retrouve un côté plus autonome et dynamique où la base vit seule", "I don't want to see
 * line by line actions, more bulk stuff, and the mono selection of cells makes think it's a
 * gsheet", "it switches from tables, scroll right, sometimes unzoom to show much more cells, not
 * reproduce a human scrolling an excel".
 *
 * THE TAKE (lp-play-once drives it; the copy is VISION_CURTAIN.thread, the rows DB_HERO,
 * DB_PEOPLE and DB_SIGNALS, what changes when DB_HERO_STORY and the two others):
 *   0     a new chat in Claude's window, the companies table
 *   0.3   CUT to the signals table: a batch of six signals comes in on top, the count ticks
 *   1.5   CUT back to companies: the batch lands on six accounts at once (their signals, their fit
 *         recomputed), and the whole table re-sorts in one move. Meanwhile the first line is
 *         typed: "Which accounts should we work on now?"
 *   3.3   Claude's call. The camera PULLS BACK (thousands of cells), the accounts with a signal
 *         are picked all at once, the others go, the kept ones come together; the camera comes
 *         back in and Claude's frame closes around them while the count says 86
 *   6.7   three duplicates merge at once
 *   7.9   CUT to the people table: three people change jobs in one batch and go to the top; the
 *         first is the VP Sales who bought from you at Notion, now at Ramp
 *   9.6   CUT back to companies: Ramp and Brex come into the view, the table re-sorts. Claude says
 *         it unasked; told "Yes. And send our end-of-year gifts to the top five.", it opens the
 *         Plays' column, writes the five Plays at once and they go live together
 *   16.8  CUT to signals: three more signals, one a new signup at Linear; Claude flags it
 *   18.0  CUT back to companies: two accounts rescored, the table re-sorts, Linear's Play written
 *   20.1  the camera PANS RIGHT to the CRM's columns: five accounts updated at once, Ramp's deal
 *         open again; then back
 * and a beat on the finished picture. No cell is ever selected on its own: Claude's ring goes
 * round groups (the 86, the duplicates, the top five, a column).
 *
 * THEN IT PLAYS AGAIN, for as long as the card is on screen (this card's one exception to "plays
 * once, nothing loops"). The finished picture rests, a new chat opens (the conversation and the
 * tables go and come back on the take's first frame) and the same take plays. It is the take's
 * own timeline, sent back to its start: nothing is rebuilt. It waits while the card is off screen
 * (less than a fifth of it on show), while the visitor has scrolled up the conversation or holds
 * the handle, and it does not run under reduced motion.
 *
 * The contract of the page's timelines (lp-step-timelines.ts, the dive's stories): the server
 * markup is the END picture; every piece is looked up and measured BEFORE anything is written (a
 * missing piece throws there and the server's picture stands); frame 0 is a block of gsap.set;
 * the take holds tweens only, an instant change being a 1 ms tween (`step`), so it can be seeked
 * both ways (QA: window.__lpVision.curtain). States that are colours or presence (a lit row, a
 * ring, a flash, the view bar's filter, the tab in front, a line of the conversation that has
 * arrived, the column that is still shut) are attributes the take flips (flagOn / flagOff below)
 * and vision.css reads. What moves is tweened here: a row's own transform and opacity (the grid's
 * lines are its cells' borders, they go with it), a pane's, a lens's (the camera: scale and x),
 * the Plays column's opening (--open-play). No ease overshoots (power1 to power3).
 *
 * Nothing here depends on how wide Claude's column is or where its conversation is scrolled: the
 * visitor resizes the two with the handle and scrolls the conversation while the take plays. So
 * a line arrives by being let into the flow (data-in) and the component scrolls to it; the lengths
 * measured are the typed glyphs (against their own line), a row's height and, when the camera
 * pans, how much of the table is on show at that moment.
 */

type Timeline = gsap.core.Timeline;
export type BuiltCurtain = { tl: Timeline; cleanup: () => void; cue: number };

/* the take, seconds */
/** the first cut, before anything is asked */
const CUT_1 = 0.3;
/** the first line is typed while the table is still at it */
const START = 1.5;
/** one glyph every 30 ms, a held beat before it is sent */
const DT = 0.03;
const TYPED_HOLD = 0.32;
/** from a line sent to its tool call, and from the call to the table's move */
const CALL = 0.3;
const MOVE = 0.15;
/** one word of Claude's answer every 45 ms */
const WORD = 0.045;
/** how long a cell stays flashed once its value is in */
const FLASH = 0.55;
/** a cut between two tables (the one in front goes, then the next comes in), a re-sort, the
    camera's moves */
const CUT_OUT = 0.14;
const CUT = 0.3;
const SORT = 0.6;
const CAMERA = 0.65;
/** how far the camera pulls back (the lens's scale) */
const PULL = 0.55;
/** the table's dip while a column opens (it is laid out once, under it) */
const DIP = 0.14;
/** from a batch landed to the fits recomputed, and how long the fits count */
const THINK = 0.35;
const COUNT = 0.3;
/** the finished picture, before the take is over */
const END_HOLD = 1.2;
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
  "data-on",
] as const;
type Flag = (typeof FLAGS)[number];

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
  gsap.registerPlugin(plugin("flagOn"), plugin("flagOff"), typePlugin);
}

/* The composer's typing as one seek-safe tween: its ratio is how much of the line is typed. A
   plugin, not an onUpdate: a seek (the driver's progress(1, true), a pause at a time) suppresses
   callbacks, a plugin renders on every render. Ratio 0 shows nothing and puts the caret at the
   composer's start; any later ratio shows the glyphs typed by then, the caret after the last. */
type TypeData = { el: HTMLElement; marks: Glyph[]; x: (v: number) => void; y: (v: number) => void };
const typePlugin = {
  name: "typeLine",
  init(this: TypeData, target: HTMLElement, value: { marks: Glyph[]; caret: HTMLElement }) {
    this.el = target;
    this.marks = value.marks;
    this.x = gsap.quickSetter(value.caret, "x", "px") as (v: number) => void;
    this.y = gsap.quickSetter(value.caret, "y", "px") as (v: number) => void;
  },
  render(ratio: number, d: TypeData) {
    const n = d.marks.length;
    const k = Math.min(n - 1, Math.floor(ratio * n - 1 + 1e-6));
    const g = k < 0 ? null : d.marks[k];
    d.el.style.clipPath = g ? clipTo(g) : HIDDEN_CLIP;
    d.x(g ? g.right + 1 : 0);
    d.y(g ? g.top : 0);
  },
};

const fmt = (n: number) => n.toLocaleString("en-US");

type Row = HTMLTableRowElement;
type Line = { el: HTMLElement; words: HTMLElement[] };
type Tool = { el: HTMLElement; doing: HTMLElement | null; done: HTMLElement; num: HTMLElement | null; to: number };
type Land = { td: HTMLTableCellElement; was: HTMLElement; now: HTMLElement; th: HTMLElement | undefined };
type Pane = "companies" | "people" | "signals";
const PANES: Pane[] = ["companies", "people", "signals"];
type Moment = 0 | 1 | 2 | 3;

/** a table of the window: its rows in the markup's order, where each stands untouched, a row's
    height, and the way to its rows and cells */
function tableOf(root: HTMLElement, $: <T extends Element = HTMLElement>(sel: string, r?: ParentNode) => T) {
  const body = Array.from(root.querySelectorAll<Row>("tbody tr"));
  if (body.length < 4) throw new Error("vision-curtain: a table to work");
  const slotOf = new Map(body.map((tr, k) => [tr, k]));
  const head = $<Row>("thead tr", root);
  return {
    root,
    body,
    head,
    slot: (tr: Row) => slotOf.get(tr) ?? 0,
    row: (key: string) => {
      const tr = body.find((r) => r.dataset.row === key);
      if (!tr) throw new Error(`vision-curtain: row ${key} missing`);
      return tr;
    },
    /** a row's height, its line included (the stylesheet's 34 px if the table has no layout yet) */
    H: body[1].offsetHeight || 34,
    col: (name: string) => head.querySelector<HTMLElement>(`th[data-col="${name}"]`),
    /** where each row stands as the builder has left it, in the order it builds the take (a
        re-sort tweens only the rows whose place changes: a tween that moves nothing still costs
        its build) */
    pos: new Map<Row, number>(),
  };
}

export function buildVisionCurtain(card: HTMLElement): BuiltCurtain {
  const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = card): T => {
    const el = root.querySelector<T>(sel);
    if (!el) throw new Error(`vision-curtain: ${sel} missing`);
    return el;
  };
  const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = card) => Array.from(root.querySelectorAll<T>(sel));
  const S = DB_HERO_STORY;
  const SAYS = S.status;

  /* ── the pieces ── */
  // Pancake's side: its layer, the three panes and their lenses, the tabs
  const dbLayer = $(".lp-vcut__db");
  const panes = Object.fromEntries(PANES.map((name) => [name, $(`.lp-vcut__pane[data-pane="${name}"]`)])) as Record<Pane, HTMLElement>;
  const lenses = Object.fromEntries(PANES.map((name) => [name, $(".lp-vcut__lens", panes[name])])) as Record<Pane, HTMLElement>;
  const tabEls = Object.fromEntries(PANES.map((name) => [name, $(`.lp-vcut__tabs [data-tab="${name}"]`)])) as Record<Pane, HTMLElement>;
  const signalsTabCount = $("small", tabEls.signals);
  const signalsCount = $(".lp-vcut__scount", panes.signals);
  // the companies table, its view bar, its frame
  const db = $(".lp-db", panes.companies);
  const C = tableOf(db, $);
  const filterBar = $(".lp-vcut__filter", panes.companies);
  const countSome = $('.lp-vcut__count [data-when="some"]', panes.companies);
  const countEl = $(".lp-vcut__count", panes.companies);
  const statusLine = $(".lp-vcut__status");
  const statusText = $(".lp-vcut__status-t");
  // the people and the signals tables
  const P = tableOf($(".lp-db", panes.people), $);
  const G = tableOf($(".lp-db", panes.signals), $);
  const cellOf = (tr: Row, col: string) => $<HTMLTableCellElement>(`td[data-col="${col}"]`, tr);
  const numOf = (tr: Row) => $<HTMLTableCellElement>("td.lp-db__n", tr);
  const landOf = (td: HTMLTableCellElement, th?: HTMLElement | null): Land => ({ td, was: $(".lp-db__was", td), now: $(".lp-db__now", td), th: th ?? undefined });

  /* the companies' rows: what each holds at each moment. A row that changes is in S.rows; the
     others keep what their cells print (a fit, a signal or NULL) */
  const keyOf = (tr: Row) => tr.dataset.row ?? "";
  const changing = S.rows as Record<string, { fit: readonly number[]; signal: readonly (string | null)[] }>;
  const staticFit = new Map(C.body.map((tr) => [keyOf(tr), Number(cellOf(tr, "fit").textContent) || 0]));
  const staticSignal = new Map(
    C.body.map((tr) => {
      const td = cellOf(tr, "signal");
      return [keyOf(tr), td.querySelector(".lp-db__null") && !td.hasAttribute("data-land") ? null : (td.textContent ?? "").trim()];
    }),
  );
  const fitAt = (tr: Row, m: Moment) => changing[keyOf(tr)]?.fit[m] ?? staticFit.get(keyOf(tr)) ?? 0;
  const signalAt = (tr: Row, m: Moment) => (keyOf(tr) in changing ? changing[keyOf(tr)].signal[m] : staticSignal.get(keyOf(tr)) ?? null);
  const dups = S.pairs.map(([, dup]) => C.row(dup));
  /** the rows on show at a moment, top to bottom: ranked by fit (ties keep the markup's order) */
  const rank = (rows: Row[], m: Moment) => [...rows].sort((a, b) => fitAt(b, m) - fitAt(a, m) || C.slot(a) - C.slot(b));
  const O = {
    start: rank(C.body, 0),
    batch1: rank(C.body, 1),
    view: rank(C.body.filter((tr) => signalAt(tr, 1) !== null), 1),
    dedup: rank(C.body.filter((tr) => signalAt(tr, 1) !== null && !dups.includes(tr)), 1),
    moves: rank(C.body.filter((tr) => signalAt(tr, 2) !== null && !dups.includes(tr)), 2),
    end: rank(C.body.filter((tr) => signalAt(tr, 3) !== null && !dups.includes(tr)), 3),
  };
  if (O.end.some((tr, k) => C.slot(tr) !== k)) throw new Error("vision-curtain: the rows the take ends on come first, in their final order");
  const hero = C.row(S.hero);
  const gifts = S.gifts.map((key) => C.row(key));
  if (gifts.some((tr, k) => O.moves[k] !== tr)) throw new Error("vision-curtain: the five Plays go to the top five");
  const plays = gifts.map((tr) => landOf(cellOf(tr, "next_best_play")));
  const drafted = landOf(cellOf(C.row(S.drafted), "next_best_play"));
  /** the cells a batch changes: a signal (NULL that lands, or one replaced) and a fit */
  const batchAt = (m: 1 | 2 | 3) =>
    C.body.filter((tr) => keyOf(tr) in changing && (changing[keyOf(tr)].fit[m] !== changing[keyOf(tr)].fit[m - 1] || changing[keyOf(tr)].signal[m] !== changing[keyOf(tr)].signal[m - 1]));
  const crm = Object.entries(S.crm).map(([key, change]) => ({ tr: C.row(key), change: change as { touch: readonly [string, string]; deal?: readonly [string, string] } }));
  // the people who move, and the signals' batches
  const PS = DB_PEOPLE_STORY;
  const movers = Object.entries(PS.movers).map(([key, was]) => {
    const tr = P.row(key);
    return { tr, was, now: (cellOf(tr, "company").textContent ?? "").trim() };
  });
  const pHero = P.row(PS.hero);
  const pBefore = PS.before.map((key) => P.row(key));
  const sBatches = DB_SIGNALS_STORY.batches.map((keys) => keys.map((key) => G.row(key)));
  const sNew = sBatches.flat();
  const sOld = G.body.filter((tr) => !sNew.includes(tr));
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
  const tools = { filter: tool("filter"), ping: tool("ping"), run: tool("run"), signup: tool("signup") };
  const says = { say1: say("say1"), say2: say("say2"), say3: say("say3"), say4: say("say4"), say5: say("say5") };
  const typed = { ask1: $('.lp-vcut__typed[data-line="ask1"]'), ask2: $('.lp-vcut__typed[data-line="ask2"]') };
  const phs = [1, 2].map((n) => $(`.lp-vcut__ph[data-n="${n}"]`));
  const caret = $(".lp-vcut__caret");
  const send = $(".lp-vcut__send");

  /* ── the geometry, read on the untouched END layout ── */
  const glyphs = { ask1: measureGlyphs(typed.ask1), ask2: measureGlyphs(typed.ask2) };
  /** where the CRM's last column ends in the companies table (the camera pans to it) */
  const touchTh = C.col("last_touch");
  const touchRight = touchTh ? touchTh.offsetLeft + touchTh.offsetWidth : 0;
  /** where a row stands, as the `k`th of an order */
  const yAt = (T: ReturnType<typeof tableOf>, tr: Row, k: number) => (k - T.slot(tr)) * T.H;

  registerTxtPlugin();
  registerFlagPlugins();

  /* ── frame 0: a new chat in Claude's window, the companies table before anything ── */
  const set = gsap.set;
  const flag = (el: Element, name: Flag) => set(el, { flagOn: name });
  // the panes: the companies table in front, its lens at rest
  for (const name of PANES) {
    // (opacity only, kept visible: a hidden pane is painted from nothing on the frame a cut shows
    // it, a 300 ms frame on a slow phone; a transparent one on its own layer is ready)
    set(panes[name], { opacity: name === "companies" ? 1 : 0, visibility: "visible", x: 0 });
    set(lenses[name], { scale: 1, x: 0, force3D: false });
    set(tabEls[name], { [name === "companies" ? "flagOn" : "flagOff"]: "data-on" });
  }
  // companies: every row, ranked by its first fit, with its first signal
  O.start.forEach((tr, k) => {
    set(tr, { autoAlpha: 1, y: yAt(C, tr, k) });
    set(numOf(tr), { txt: String(k + 1) });
    C.pos.set(tr, k);
  });
  for (const tr of C.body) {
    const key = keyOf(tr);
    if (!(key in changing)) continue;
    set(cellOf(tr, "fit"), { txt: String(changing[key].fit[0]) });
    const td = cellOf(tr, "signal");
    if (td.hasAttribute("data-land")) {
      set($(".lp-db__was", td), { opacity: 0.72 });
      set($(".lp-db__now", td), { opacity: 0 });
    } else {
      set(td, { txt: changing[key].signal[0] ?? "" });
    }
  }
  set(countSome, { txt: S.count[0] });
  set(statusText, { txt: SAYS.idle });
  // (the server's picture has the filter on: off, until it is asked for)
  set(filterBar, { flagOff: "data-filter" });
  // the Plays' column is shut, its Plays not written; the columns a narrow window folds away when
  // it opens are there (vision.css reads --keep-narrow only on a narrow window)
  flag(db, "data-shut-play");
  flag(db, "data-keep-narrow");
  set(db, { "--open-play": 0, "--keep-narrow": 1 });
  for (const land of [...plays, drafted]) {
    set(land.was, { opacity: 0.72 });
    set(land.now, { opacity: 0 });
  }
  plays.forEach((land) => flag(land.td, "data-nostate"));
  // what the CRM says before it syncs
  for (const { tr, change } of crm) {
    set(cellOf(tr, "last_touch"), { txt: change.touch[0] });
    if (change.deal) set($(".lp-db__tag", cellOf(tr, "crm_deal")), { txt: change.deal[0] });
  }
  flag(hero, "data-unlit");
  // people: the three who move are where their old date ranks them, with their old company
  pBefore.forEach((tr, k) => {
    set(tr, { y: yAt(P, tr, k) });
    set(numOf(tr), { txt: String(k + 1) });
    P.pos.set(tr, k);
  });
  for (const { tr, was } of movers) {
    set(cellOf(tr, "company"), { txt: was.company });
    set(cellOf(tr, "moved"), { txt: was.moved });
    const w = landOf(cellOf(tr, "was_at"));
    set(w.was, { opacity: 0.72 });
    set(w.now, { opacity: 0 });
  }
  flag(pHero, "data-unlit");
  // signals: only the old ones, from the top; the batches are still to come
  set(sNew, { autoAlpha: 0 });
  sOld.forEach((tr, k) => {
    set(tr, { autoAlpha: 1, y: yAt(G, tr, k) });
    set(numOf(tr), { txt: String(k + 1) });
    G.pos.set(tr, k);
  });
  let signals = DB_SIGNALS_STORY.count;
  set([signalsTabCount, signalsCount], { txt: fmt(signals) });
  // Claude's side
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
    // One tween for the whole line (it was two steps a glyph: ~180 tweens to build for two lines).
    // It starts a DT before the first glyph (nothing typed) and ends on the last glyph, so any
    // time, seeked either way, shows the glyphs typed by then and the caret after the last one.
    const n = marks.length;
    if (n) tl.to(el, { typeLine: { marks, caret }, duration: n * DT, ease: "none" }, t0 - DT);
    const done = t0 + Math.max(n - 1, 0) * DT;
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
  /** the status line says what the data did */
  const status = (text: string, t: number) => {
    step(statusText, { txt: text }, t);
    pulse(statusLine, "data-lit", t, 0.7);
  };
  /** a value lands: NULL gives way to it, the cell flashes */
  const landAt = (land: Land, t: number) => {
    tl.to(land.was, { opacity: 0, duration: 0.16, ease: "power1.in" }, t);
    tl.to(land.now, { opacity: 1, duration: 0.3, ease: "power1.out" }, t + 0.1);
    pulse(land.td, "data-flash", t + 0.1, FLASH);
  };
  /** a value is replaced: the new one, the cell flashes */
  const swap = (td: HTMLElement, text: string, t: number) => {
    step(td, { txt: text }, t + 0.1);
    pulse(td, "data-flash", t + 0.1, FLASH);
  };
  /** the rows of `order` go to their places in it, all in one move, and take its numbers (the
      rows in `except` take their numbers, and are moved by the caller) */
  const settle = (T: ReturnType<typeof tableOf>, order: Row[], t: number, duration = SORT, ease = "power2.inOut", except: Row[] = []) => {
    order.forEach((tr, k) => {
      if (T.pos.get(tr) === k) return; // already there, its number with it
      if (!except.includes(tr)) tl.to(tr, { y: yAt(T, tr, k), duration, ease, force3D: false }, t);
      step(numOf(tr), { txt: String(k + 1) }, t + duration * 0.4);
      T.pos.set(tr, k);
    });
    return t + duration;
  };
  /** The camera cuts to another table: its tab comes to the front; the pane in front goes, THEN
      the new one comes in, from the side of its tab. Never both at once: two tables crossing
      each other half faded read as a smear (founder: "sur les mouvements latéraux, c'est pas
      net"). The layer clips at the handle's line (vision.css), so nothing slides onto Claude's
      side */
  let shown: Pane = "companies";
  const cutTo = (name: Pane, t: number) => {
    const from = shown;
    if (from === name) return t;
    const dir = PANES.indexOf(name) > PANES.indexOf(from) ? 1 : -1;
    off(tabEls[from], "data-on", t);
    on(tabEls[name], "data-on", t);
    tl.to(panes[from], { opacity: 0, duration: CUT_OUT, ease: "power1.in" }, t);
    step(panes[from], { x: 0 }, t + CUT_OUT);
    step(panes[name], { x: 18 * dir }, t + CUT_OUT - STEP);
    tl.to(panes[name], { opacity: 1, x: 0, duration: CUT, ease: "power2.out" }, t + CUT_OUT);
    shown = name;
    return t + CUT_OUT + CUT;
  };
  /** the camera on the companies table: pulled back (scale) or panned (x) */
  const camera = (vars: gsap.TweenVars, t: number) => tl.to(lenses.companies, { ...vars, duration: CAMERA, ease: "power2.inOut", force3D: false }, t);
  /** a batch lands on the companies table at moment `m`: every signal it brings at once, then
      every fit it changes at once (each counts to its new number) */
  const companiesBatch = (m: 1 | 2 | 3, t: number) => {
    const rows = batchAt(m);
    for (const tr of rows) {
      const key = keyOf(tr);
      const sig = changing[key].signal;
      if (sig[m] !== sig[m - 1]) {
        const td = cellOf(tr, "signal");
        if (td.hasAttribute("data-land") && sig[m - 1] === null) landAt(landOf(td), t);
        else swap(td, sig[m] ?? "", t);
      }
      const fit = changing[key].fit;
      if (fit[m] !== fit[m - 1]) {
        const td = cellOf(tr, "fit");
        for (let k = 1; k <= 6; k++) step(td, { txt: String(Math.round(fit[m - 1] + ((fit[m] - fit[m - 1]) * k) / 6)) }, t + THINK + ((k - 1) * COUNT) / 5);
        pulse(td, "data-flash", t + THINK, COUNT + FLASH);
      }
    }
    const th = C.col("signal");
    if (th) pulse(th, "data-lit", t, 0.9);
    return t + THINK + COUNT + 0.1;
  };
  /** a batch of signals comes in on top of the signals table: the rows below move down together */
  const signalsBatch = (k: number, t: number) => {
    const fresh = sBatches[k];
    const order = [...sBatches.slice(0, k + 1).reverse().flat(), ...sOld];
    settle(G, order, t, 0.45, "power3.out", fresh);
    for (const tr of fresh) {
      step(tr, { y: yAt(G, tr, order.indexOf(tr)) }, t);
      tl.to(tr, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, t + 0.15);
      pulse(tr, "data-flash", t + 0.15, FLASH);
    }
    signals += fresh.length;
    for (let s = 1; s <= 4; s++) step([signalsTabCount, signalsCount], { txt: fmt(signals - fresh.length + Math.round((fresh.length * s) / 4)) }, t + 0.1 + s * 0.06);
    return t + 0.55;
  };

  /* ── the take ── */
  // the data at work before anything is asked: a batch of signals comes in...
  let t = cutTo("signals", CUT_1);
  status(SAYS.batch1, t);
  t = signalsBatch(0, t);
  // ...and lands on six accounts at once; the whole table re-sorts in one move
  t = cutTo("companies", t + 0.45);
  const landed1 = companiesBatch(1, t);
  status(SAYS.rescore1, t + THINK);
  settle(C, O.batch1, landed1);

  // asked: which accounts to work. The camera pulls back on the whole table, the accounts that
  // have a signal are picked all at once, the others go, the kept ones come together, the camera
  // comes back in and Claude's frame closes around them
  const typed1 = type(typed.ask1, glyphs.ask1, phs[0], START);
  const sent1 = sendAt(typed.ask1, bubbles.ask1, typed1 + TYPED_HOLD);
  tl.to(greet, { autoAlpha: 0, y: -8, duration: 0.2, ease: "power2.in" }, sent1);
  const call1 = Math.max(sent1 + CALL, landed1 + SORT + 0.1);
  arrive(tools.filter.el, call1);
  const f = call1 + MOVE;
  camera({ scale: PULL }, f);
  O.view.forEach((tr) => on(tr, "data-pick", f + CAMERA * 0.8));
  const fF = f + CAMERA + 0.35;
  on(filterBar, "data-filter", fF);
  tl.to(O.batch1.filter((tr) => !O.view.includes(tr)), { autoAlpha: 0, duration: 0.25, ease: "power1.in" }, fF);
  settle(C, O.view, fF + 0.15, 0.5, "power3.out");
  camera({ scale: 1 }, fF + 0.6);
  const filtered = fF + 0.6 + CAMERA;
  on(panes.companies, "data-ring", filtered - 0.1);
  O.view.forEach((tr) => off(tr, "data-pick", filtered + 0.15));
  back(tools.filter, filtered);
  on(countEl, "data-lit", filtered);
  const said1 = stream(says.say1, filtered + 0.2);
  off(panes.companies, "data-ring", said1 + 0.5);
  off(countEl, "data-lit", said1 + 0.5);

  // the data goes on: the duplicates merge, all three at once (Claude's ring takes the pairs, each
  // duplicate goes into its twin, what stood under comes up)
  const pair = said1 + 0.75;
  for (const [keep, dup] of S.pairs.map(([a, b]) => [C.row(a), C.row(b)])) {
    on(keep, "data-rt", pair);
    on(dup, "data-rb", pair);
    for (const tr of [keep, dup]) on(tr, "data-rl", pair);
    tl.to(dup, { y: yAt(C, dup, O.dedup.indexOf(keep)), duration: 0.42, ease: "power2.inOut", force3D: false }, pair + 0.4);
    C.pos.set(dup, O.dedup.indexOf(keep));
    tl.to(dup, { autoAlpha: 0, duration: 0.22, ease: "power1.in" }, pair + 0.55);
    // (the ring closes on the one row left)
    on(keep, "data-rb", pair + 0.7);
    for (const name of ["data-rt", "data-rb", "data-rl"] as const) off(keep, name, pair + 0.9);
    for (const name of ["data-rb", "data-rl"] as const) off(dup, name, pair + 0.82);
    pulse(keep, "data-flash", pair + 0.7, FLASH);
  }
  status(SAYS.merge, pair);
  settle(C, O.dedup, pair + 0.4, 0.5, "power3.out");
  step(countSome, { txt: S.count[1] }, pair + 0.6);

  // CUT to the people: three people change jobs in one batch and go to the top. The first one
  // bought from you at Notion: now at Ramp. (Meanwhile their companies' signals come in: the
  // signals table, out of sight, takes them)
  const people = cutTo("people", pair + 1.2);
  status(SAYS.moves, people);
  for (const { tr, now } of movers) {
    swap(cellOf(tr, "company"), now, people);
    landAt(landOf(cellOf(tr, "was_at")), people + 0.05);
    swap(cellOf(tr, "moved"), "today", people + 0.05);
  }
  const pSorted = settle(P, P.body, people + 0.45, SORT, "power2.inOut");
  off(pHero, "data-unlit", pSorted);
  signalsBatch(1, people);
  const ping = pSorted - 0.2;
  arrive(tools.ping.el, ping);

  // CUT back to companies: Ramp and Brex have a signal now, Glean a new one; rescored at once,
  // the two come into the view and the table re-sorts in one move
  const back2 = cutTo("companies", pSorted + 0.55);
  const landed2 = companiesBatch(2, back2);
  status(SAYS.rescore2, back2 + THINK);
  const entering = O.moves.filter((tr) => !O.dedup.includes(tr));
  for (const tr of entering) {
    step(tr, { y: yAt(C, tr, O.moves.indexOf(tr)) }, landed2);
    tl.to(tr, { autoAlpha: 1, duration: 0.35, ease: "power1.out" }, landed2 + 0.15);
    pulse(tr, "data-flash", landed2 + 0.15, FLASH);
  }
  const sorted2 = settle(C, O.moves, landed2, SORT, "power2.inOut", entering);
  step(countSome, { txt: S.count[2] }, landed2 + 0.2);
  off(hero, "data-unlit", sorted2);
  const said2 = stream(says.say2, sorted2 - 0.3);

  // "Yes. And send our end-of-year gifts to the top five." The Plays' column opens, Claude's ring
  // takes the five rows, their five Plays are written at once and go live together
  const typed2 = type(typed.ask2, glyphs.ask2, phs[1], said2 + 0.6);
  const sent2 = sendAt(typed.ask2, bubbles.ask2, typed2 + TYPED_HOLD);
  arrive(tools.run.el, sent2 + CALL);
  const o = sent2 + CALL + MOVE;
  on(gifts[0], "data-rt", o);
  on(gifts[gifts.length - 1], "data-rb", o);
  gifts.forEach((tr) => on(tr, "data-rl", o));
  // The column opens under a short dip of the table: its width (and, on a narrow window, the deal's
  // and the signal's folding away) changes in one frame, so the table is laid out once. Tweened,
  // the widths had the whole table laid out again every frame for half a second (a slow phone
  // dropped to 20 frames a second there)
  const OPEN = o + DIP;
  tl.to(lenses.companies, { opacity: 0.3, duration: DIP, ease: "power1.in" }, o);
  off(db, "data-shut-play", OPEN);
  on(db, "data-wr-play", OPEN);
  step(db, { "--open-play": 1, "--keep-narrow": 0 }, OPEN);
  off(db, "data-keep-narrow", OPEN + STEP);
  tl.to(lenses.companies, { opacity: 1, duration: 0.3, ease: "power1.out" }, OPEN + STEP * 2);
  const playTh = C.col("next_best_play");
  if (playTh) pulse(playTh, "data-lit", o, 1.3);
  plays.forEach((land) => landAt(land, o + 0.45));
  const live = o + 1.0;
  // live: each Play's state shows, inside the flash its writing started (a second flash on the
  // same cell would overlap that one, and a seek back would land on the wrong side of it)
  plays.forEach((land) => off(land.td, "data-nostate", live));
  status(SAYS.plays, live);
  back(tools.run, live);
  off(db, "data-wr-play", live + 0.35);
  off(gifts[0], "data-rt", live + 0.45);
  off(gifts[gifts.length - 1], "data-rb", live + 0.45);
  gifts.forEach((tr) => off(tr, "data-rl", live + 0.45));
  const said3 = stream(says.say3, live + 0.3);

  // CUT to signals: three more come in, one a new signup at Linear; Claude flags it
  const sig2 = cutTo("signals", said3 + 0.5);
  status(SAYS.batch2, sig2);
  const sLanded = signalsBatch(2, sig2);
  arrive(tools.signup.el, sLanded);
  // CUT back to companies: two accounts rescored at once, the table re-sorts, Linear's Play is
  // written (not run: Claude points it out)
  const back3 = cutTo("companies", sLanded + 0.5);
  const landed3 = companiesBatch(3, back3);
  status(SAYS.rescore3, back3 + THINK);
  const sorted3 = settle(C, O.end, landed3);
  landAt(drafted, sorted3 + 0.05);
  const said4 = stream(says.say4, sorted3 - 0.2);

  // the CRM syncs: the camera pans right to its columns, five accounts are updated at once (the
  // gifts sent, Ramp's reply, its deal open again), and back
  const pan = said4 + 0.5;
  camera(
    {
      x: () => {
        const r = card.getBoundingClientRect();
        const d = dbLayer.getBoundingClientRect();
        const visible = r.right - Math.max(r.left, d.left);
        return -Math.max(0, touchRight - visible + 12);
      },
    },
    pan,
  );
  const sync = pan + CAMERA + 0.1;
  for (const { tr, change } of crm) {
    swap(cellOf(tr, "last_touch"), change.touch[1], sync);
    if (change.deal) swap($(".lp-db__tag", cellOf(tr, "crm_deal")), change.deal[1], sync);
  }
  const lt = C.col("last_touch");
  if (lt) pulse(lt, "data-lit", sync, 0.9);
  status(SAYS.crm, sync);
  const said5 = stream(says.say5, sync + 0.3);
  camera({ x: 0 }, Math.max(said5 + 0.6, sync + 1.6));
  // (a beat on the finished picture before the take is over)
  step(card, {}, Math.max(said5 + 0.6, sync + 1.6) + CAMERA + END_HOLD);

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
  const cleared = [view, ...Object.values(lenses)];

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
        pane: Object.keys(tabEls).find((name) => tabEls[name as Pane].hasAttribute("data-on")),
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
      // filter is on in it, the companies tab is the one in front)
      for (const name of FLAGS) card.querySelectorAll(`[${name}]`).forEach((node) => node.removeAttribute(name));
      card.removeAttribute("data-take");
      filterBar.setAttribute("data-filter", "");
      tabEls.companies.setAttribute("data-on", "");
    },
  };
}
