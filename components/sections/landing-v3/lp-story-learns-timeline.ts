// No "use client" on purpose (phase N, 2026-10-11, as the three other story timelines): this
// module is reached only through the client loaders (lp-dive-loaders.ts), and a "use client"
// module that a server graph ever reaches again would ship eagerly in the homepage bundle.
import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import { registerTxtPlugin } from "./lp-gsap-txt";
import { LEARNS } from "./lp-story-learns-data";

/**
 * Deep-dive story "Pancake learns from what wins" — its build-up as ONE paused, seek-safe GSAP
 * timeline on the stage root (Figma storyboard of 2026-10-12: 5061:1443 / 5335 / 5399 / 5459 /
 * 5509). Owner: story-learns package. Contract: lp-dive-stages.ts and code-map §6.2 — frame 0
 * via gsap.set (the caller's gsap.context reverts it), sets and tweens only (no callbacks, no
 * randomness), progress(1) = the server markup, `cue` = the first composed scene. Reached only
 * through its lazy loader (DIVE_LOADERS.learns, lp-dive-loaders.ts).
 *
 * The storyboard has no prototype or motion data: the beats are derived from its five frames,
 * in the vocabulary of production's old "learns" card (bars from the baseline, a ticking count,
 * a card that slides in, a status that swaps). Times in seconds (T below):
 *
 *   0      cue: the chart card, its figure at 0%, no bar yet
 *   A 0.35–1.57  the bars grow from the baseline: weeks 1-2 one after another, a short beat,
 *          then weeks 3-4; the figure ticks up with them and its arrow pops
 *                                                   → Figma frame 1 at 1.05, frame 2 at 1.60
 *   B 2.05–3.27  the view moves down 262: the chart leaves through the top while the heading
 *          slides in and the three lines check off one after another     → frame 3 at 3.30
 *   C 3.60–4.50  the camera closes in ×1.68919 on the list; the avatar pops and
 *          "Updating Brain..." appears                                   → frame 4 at 4.60
 *     4.75–5.35  the avatar pulses twice while the Brain updates
 *   D 5.40–6.15  "Updating Brain..." gives way to "Brain updated!"        → frame 5 = the end
 *          (6.15 s) = the server markup
 * The five frames are timeline labels too: f1 … f5 (the shell's pose() and the harness take them).
 *
 * The camera. The chart layer is drawn at the stage's scale, the notes layer at the end
 * picture's scale (×Z). Both carry the same affine move at every instant — x, y and scale
 * tweened together, one ease, origin 0 0, the notes' scale always the chart's ÷ Z — so they
 * travel as one sheet of paper, and at the end the notes layer is the identity: the rest picture
 * is plain layout, with no transform to undo.
 */

/** the close-up's zoom: frame 5's type over frame 3's (60.811 / 36 = 27.027 / 16) */
const Z = 1.68919;
/** the move down from the chart to the list, stage px (frame 2 → 3: the chart 109 → -153) */
const SCROLL = 262;

/** Camera poses, as each layer's own x / y / scale (transform-origin 0 0; GSAP applies
    translate, then scale: stage = x + scale·local).
    Solved from the frames: the heading sits at (126, 198.25) in frame 3 and (126, -36) in frame
    5, so the notes layer in frame 3 is x 126·(1 − 1/Z), y 198.25 + 36/Z, scale 1/Z; the chart in
    frames 4-5 is x 126·(1 − Z), y −36 − Z·(198.25 + 262), scale Z (off stage by then). */
const POSE = {
  /** frames 1-2: the chart at rest, the notes a move below */
  chart: { x: 0, y: 0, scale: 1 },
  notes: { x: 51.408, y: 219.562 + SCROLL, scale: 1 / Z },
  /** frame 3 */
  listChart: { x: 0, y: -SCROLL, scale: 1 },
  listNotes: { x: 51.408, y: 219.562, scale: 1 / Z },
  /** frames 4-5: the close-up (the notes layer is the identity) */
  closeChart: { x: -86.838, y: -813.45, scale: Z },
  closeNotes: { x: 0, y: 0, scale: 1 },
} as const;

/** The list's rows are 37 apart in frame 3 and 62.027 apart in frame 5, which is 36.72 × Z
    (Figma rounds each frame's row height on its own: 21 and 35). The notes layer is laid out
    for frame 5, so until the close-up each row sits this much lower per row, in the layer's own
    px, and settles with the camera. */
const ROW_SETTLE = 37 * Z - 62.027;

/** Figma frame 1: weeks 1-2 stand, bars 7-10 are on their way at these heights (px), the last
    two have not started */
const FRAME1_HEIGHTS: Record<number, number> = { 6: 61.283, 7: 19.322, 8: 34.384, 9: 13.899 };

const BAR = {
  /** each bar's growth, ease power2.out (a cubic: its inverse places bars 7-10 on frame 1) */
  dur: 0.4,
  /** one bar after another */
  step: 0.06,
} as const;

const T = {
  bars: 0.35, // A: the first bar leaves the baseline
  arrow: 0.5, // the figure's arrow pops as the count starts to climb
  count: 0.45, // the count's first tick
  f1: 1.05, // Figma frame 1: bars 1-6 have just landed (0.35 + 5 × 0.06 + 0.4)
  countEnd: 1.57, // the count lands with the last bar (f1 + 2 × 0.06 + 0.4)
  f2: 1.6, // Figma frame 2
  scroll: 2.05, // B: the view moves down
  title: 2.3, // the heading slides in
  lines: 2.5, // the first line comes in
  lineStep: 0.12, // one line after another
  check: 0.08, // a line's check pops this long after the line starts
  f3: 3.3, // Figma frame 3
  zoom: 3.6, // C: the camera closes in
  avatar: 4.1, // the avatar pops
  doing: 4.2, // "Updating Brain..." appears
  f4: 4.6, // Figma frame 4
  pulse1: 4.75, // the avatar pulses twice while the Brain updates
  pulse2: 5.05,
  done: 5.4, // D: "Updating Brain..." leaves
  updated: 5.58, // "Brain updated!" lands once it has gone
  end: 6.15, // Figma frame 5 = the server markup
} as const;

const DUR = {
  scroll: 0.75,
  zoom: 0.9,
} as const;

/** how far the heading and the lines rise as they come in, stage px */
const RISE = { title: 32, line: 14 } as const;
/** the count shows frame 1's figure this long before the frame, and moves on this long after */
const COUNT_LEAD = 0.02;

/** an "instant" change as a 1 ms tween (gsap.context reverts tweens in time order; zero-duration
    sets come back in an engine-dependent order — see cleanup) */
const STEP = 0.001;

function query(root: HTMLElement) {
  return {
    $: <E extends Element = HTMLElement>(sel: string): E => {
      const el = root.querySelector<E>(sel);
      if (!el) throw new Error(`lp-story-learns: missing ${sel}`);
      return el;
    },
    $$: <E extends Element = HTMLElement>(sel: string): E[] => Array.from(root.querySelectorAll<E>(sel)),
  };
}

export function buildStoryLearns(root: HTMLElement): BuiltStory {
  registerTxtPlugin();
  const { $, $$ } = query(root);

  const chart = $(".lp-sl-chart");
  const notes = $(".lp-sl-notes");
  const pct = $(".lp-sl-pct");
  const arrow = $<SVGSVGElement>(".lp-sl-arrow");
  const bars = $$<SVGRectElement>(".lp-sl-bar");
  const title = $(".lp-sl-title");
  const items = $$(".lp-sl-item");
  const checks = $$<SVGSVGElement>(".lp-sl-check");
  const avatar = $<SVGSVGElement>(".lp-sl-avatar");
  const doing = $(".lp-sl-doing");
  const done = $(".lp-sl-done");

  // the rest markup, for cleanup(): every element this builder styles and its inline style, the
  // figure's text, and the bars' geometry (SVG attributes: the only thing tweened on them)
  const touched: Element[] = [chart, notes, pct, arrow, title, ...items, ...checks, avatar, doing, done];
  const restStyle = touched.map((el) => el.getAttribute("style"));
  const restPct = pct.textContent;
  const restBars = bars.map((bar) => [bar.getAttribute("y"), bar.getAttribute("height")] as const);
  /** the plot's floor: a bar of height h stands at y = FLOOR − h */
  const FLOOR = LEARNS.plot.height;

  /* ── frame 0 = cue: the chart card, 0%, no bar; the notes a move below, unseen ── */
  gsap.set(chart, { autoAlpha: 1, ...POSE.chart });
  gsap.set(notes, { ...POSE.notes });
  gsap.set(pct, { txt: `${LEARNS.share.start}%` });
  gsap.set(arrow, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" });
  gsap.set(bars, { attr: { y: FLOOR, height: 0 } });
  // distances inside the notes layer are in its own px: ×Z of a stage px until the close-up
  gsap.set(title, { autoAlpha: 0, y: RISE.title * Z });
  items.forEach((item, i) => gsap.set(item, { autoAlpha: 0, y: RISE.line * Z + ROW_SETTLE * i }));
  gsap.set(checks, { scale: 0.4, transformOrigin: "50% 50%" });
  gsap.set(avatar, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" });
  gsap.set(doing, { autoAlpha: 0, y: 6 });
  gsap.set(done, { autoAlpha: 0, y: 6 });

  const tl = gsap.timeline({ paused: true });

  /* ── A · the bars grow, the figure ticks ── */
  LEARNS.bars.forEach((height, i) => {
    let start: number;
    if (i < 6) {
      start = T.bars + BAR.step * i; // weeks 1-2, in a row: all six stand at T.f1
    } else if (i in FRAME1_HEIGHTS) {
      // on its way at T.f1: power2.out is 1 − (1 − p)³, so the bar started dur·(1 − ∛(1 − q))
      // before the frame, q = its share of its height there
      start = T.f1 - BAR.dur * (1 - Math.cbrt(1 - FRAME1_HEIGHTS[i] / height));
    } else {
      start = T.f1 + BAR.step * (i - 9); // the last two, after the frame
    }
    tl.to(bars[i], { attr: { y: FLOOR - height, height }, duration: BAR.dur, ease: "power2.out" }, start);
  });
  tl.to(arrow, { autoAlpha: 1, duration: 0.15, ease: "power2.out" }, T.arrow);
  tl.to(arrow, { scale: 1, duration: 0.35, ease: "back.out(2)" }, T.arrow);
  // the count: even ticks up to frame 1's figure (it reads 26% from COUNT_LEAD before the
  // frame), then production's curve to the end figure: brisk ticks, soft landing
  const { start: n0, frame1: n1, end: n2 } = LEARNS.share;
  for (let n = n0 + 1; n <= n1; n++) {
    tl.set(pct, { txt: `${n}%` }, T.count + ((T.f1 - COUNT_LEAD - T.count) * (n - n0)) / (n1 - n0));
  }
  for (let n = n1 + 1; n <= n2; n++) {
    const p = 1 - Math.pow(1 - (n - n1) / (n2 - n1), 1 / 1.6);
    tl.set(pct, { txt: `${n}%` }, T.f1 + COUNT_LEAD + (T.countEnd - T.f1 - COUNT_LEAD) * p);
  }

  /* ── B · the view moves down to the list ── */
  tl.to(chart, { ...POSE.listChart, duration: DUR.scroll, ease: "power3.inOut" }, T.scroll);
  tl.to(notes, { ...POSE.listNotes, duration: DUR.scroll, ease: "power3.inOut" }, T.scroll);
  tl.to(title, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, T.title);
  items.forEach((item, i) => {
    const t = T.lines + T.lineStep * i;
    tl.to(item, { autoAlpha: 1, y: ROW_SETTLE * i, duration: 0.45, ease: "power3.out" }, t);
    tl.to(checks[i], { scale: 1, duration: 0.45, ease: "back.out(2)" }, t + T.check);
  });

  /* ── C · the camera closes in on the list; Pancake updates the Brain ── */
  tl.to(chart, { ...POSE.closeChart, duration: DUR.zoom, ease: "power3.inOut" }, T.zoom);
  tl.to(notes, { ...POSE.closeNotes, duration: DUR.zoom, ease: "power3.inOut" }, T.zoom);
  tl.to(items, { y: 0, duration: DUR.zoom, ease: "power3.inOut" }, T.zoom); // the rows settle (ROW_SETTLE)
  // the chart has left through the top by then: off the paint list, as in the rest markup
  tl.to(chart, { autoAlpha: 0, duration: 0.05, ease: "none" }, T.zoom + DUR.zoom);
  tl.to(avatar, { autoAlpha: 1, duration: 0.15, ease: "power2.out" }, T.avatar);
  tl.to(avatar, { scale: 1, duration: 0.4, ease: "back.out(2)" }, T.avatar);
  tl.to(doing, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, T.doing);
  [T.pulse1, T.pulse2].forEach((t) => {
    tl.to(avatar, { scale: 1.08, duration: 0.12, ease: "power2.out" }, t);
    tl.to(avatar, { scale: 1, duration: 0.18, ease: "power2.inOut" }, t + 0.12);
  });

  /* ── D · "Brain updated!" ── */
  tl.to(doing, { autoAlpha: 0, y: -6, duration: 0.18, ease: "power2.in" }, T.done);
  tl.to(done, { autoAlpha: 1, y: 0, duration: 0.32, ease: "back.out(1.6)" }, T.updated);
  tl.to(avatar, { scale: 1.15, duration: 0.12, ease: "power2.out" }, T.updated);
  tl.to(avatar, { scale: 1, duration: 0.23, ease: "power2.inOut" }, T.updated + 0.12);

  /* ── end = frame 5 = the server markup: what stays on screen sheds its (identity) transforms,
     so no text rests in a transformed layer (Gecko rasters such a layer differently). A 1 ms
     tween, not a set: a clearProps in a zero-duration set is not undone by a backward seek. ── */
  tl.to(
    [notes, title, ...items, ...checks, avatar, done],
    { x: 0, y: 0, scale: 1, clearProps: "transform", duration: STEP, ease: "none" },
    T.end - STEP,
  );
  // the storyboard's frames, by name
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  /* cleanup runs after the caller's ctx.revert(). That revert is not enough on its own here:
     gsap.context sorts what it reverts with a comparator that is inconsistent for zero-duration
     tweens (the count's ticks) and for tweens starting at the same time, so their order is
     engine-dependent. Put the rest markup back explicitly: clear GSAP's inline styles and
     transform cache, restore the server's inline styles, the bars' geometry and the figure.
     The clearing set is killed at once: left on the root timeline, GSAP renders it a second time
     on its next tick and writes an empty style="" back on what was just restored. */
  const cleanup = () => {
    gsap.set(touched, { clearProps: "all" }).kill();
    touched.forEach((el, i) => {
      const style = restStyle[i];
      if (style === null) {
        // read, then remove: Blink only drops a style="" it has already serialised (the figure,
        // whose style GSAP first touched in the clearing set above, kept an empty attribute)
        el.getAttribute("style");
        el.removeAttribute("style");
      } else el.setAttribute("style", style);
    });
    bars.forEach((bar, i) => {
      const [y, height] = restBars[i];
      if (y !== null) bar.setAttribute("y", y);
      if (height !== null) bar.setAttribute("height", height);
      bar.removeAttribute("data-svg-origin"); // GSAP's mark on an SVG shape it has measured
      bar.getAttribute("style");
      bar.removeAttribute("style");
    });
    pct.textContent = restPct;
  };

  return { tl, cleanup, cue: 0 };
}
