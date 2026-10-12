// No "use client" on purpose (as the deep-dive story builders): this module is reached only
// through LpDemoPlayer's import(), so it stays a lazy chunk with GSAP and never a client entry
// of app/page. Browser-only code runs inside the builder alone.
import { gsap } from "@/lib/gsap";

import { registerTxtPlugin } from "./lp-gsap-txt";

/**
 * The homepage demo window's Pancake view as ONE paused, seek-safe GSAP timeline (founder brief
 * 2026-10-12: "l'enchaînement du motion actuel est saccadé alors que ça doit se faire de manière
 * plus fluide, pas besoin de coupure de plans"). Frame 0 = the server markup = the home; the
 * player (LpDemoPlayer) seeks it with its own clock, so it holds no callbacks and no randomness,
 * and seeks both ways.
 *
 * The story follows the app's logic (founder 2026-10-13: "le prompt est écrit beaucoup trop
 * rapidement, le play décrit est beaucoup trop simple, il manque la follow-up après les douze
 * leads found… la partie déploiement arrive après qu'il y ait eu des leads found"):
 *   0      home: title, empty chat bar, three suggested Plays, chip
 *   0.40   the request types into the chat bar at a reading pace (38 ms a glyph, a caret on
 *          the glyph edges), then holds 0.45 s
 *   SEND   the send button is pressed; the request lifts out of the bar into the thread (one
 *          move); the home eases away; the SAME bar glides down and becomes the dock
 *   WORK   the research: three tool calls, one at a time (spinner + what Pancake is doing,
 *          0.55 s, then a check and what came back, its number ticking up)
 *   FOUND  the leads it found: five faces pop, the count ticks up (25, the Play's weekly pace)
 *   PLAY   the research folds away (the faces move up with it) and the Play rises: its name,
 *          then its five rows one after the other (who, company, signal, pace, steps), then
 *          the card grows and the button comes
 *   CLICK  the cursor glides to "Deploy Play" and presses it; the button fills
 *   LIVE   Draft → Live, the button leaves (the card closes on its rows), the outline draws
 *          clockwise, and Pancake says what happens from here
 * About 11 s. Easing follows the house baseline (entrances power3.out, landings back.out,
 * moves power3.inOut, exits power2.in and shorter than entrances); one thing at a time; text
 * at rest never moves.
 *
 * Geometry is measured once, on the rest layout (before any set): the bar's two places come from
 * the view's --pk-* properties (demo.css; the phone box overrides them), the rest from rects,
 * so the same code plays the desktop window and the phone card. The player rebuilds it when the
 * stage's size changes.
 *
 * GSAP traps avoided as in lp-story-claude-timeline.ts: every instant change is a 1 ms tween
 * (`step`), never a zero-duration set (gsap.context's revert replays those last, in an order
 * that differs per engine), and every property the timeline touches has a frame-0 gsap.set.
 */

export type BuiltDemo = { tl: gsap.core.Timeline; cleanup: () => void };

/* Typing helpers: the clip-path staircase of the stories (lp-story-claude-timeline.ts). */
export type Glyph = { right: number; top: number; bottom: number };
/** each glyph's right edge and line box, in the element's own unscaled px (Range rects) */
export function measureGlyphs(el: HTMLElement): Glyph[] {
  const box = el.getBoundingClientRect();
  const s = el.offsetWidth ? box.width / el.offsetWidth : 1; // the card's scale, the phone fit
  const glyphs: Glyph[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = (node as Text).data;
    let i = 0;
    for (const ch of text) {
      const range = document.createRange();
      range.setStart(node, i);
      range.setEnd(node, i + ch.length);
      const r = range.getBoundingClientRect();
      i += ch.length;
      if (r.width === 0 && glyphs.length) {
        glyphs.push(glyphs[glyphs.length - 1]); // a collapsed space: nothing new shows
        continue;
      }
      glyphs.push({
        right: (r.right - box.left) / s,
        top: (r.top - box.top) / s,
        bottom: (r.bottom - box.top) / s,
      });
    }
  }
  return glyphs;
}
export const HIDDEN_CLIP = "polygon(0 0, 0 0, 0 0, 0 0, 0 0, 0 0)";
export const clipTo = (g: Glyph) =>
  `polygon(0 0, 100% 0, 100% ${g.top}px, ${g.right}px ${g.top}px, ${g.right}px ${g.bottom}px, 0 ${g.bottom}px)`;

/** typing: first glyph, then one every 38 ms (a pace one can read), and a held beat before send */
const T0 = 0.4;
const DT = 0.038;
const TYPED_HOLD = 0.45;
/** an "instant" step: 1 ms (a tween, so gsap.context reverts it in time order) */
export const STEP = 0.001;
/** one tool call: how long Pancake "works" on it, and the beat to the next one */
const WORK = 0.55;
const WORK_BEAT = 0.64;
/** the outline's gap around the card, and the card's own radius (demo.css --lp-r-m) */
const RING_GAP = 5;
const CARD_R = 16;
/** where the cursor comes from, as a share of the window (just under its bottom edge) */
const CURSOR_FROM = { x: 0.78, y: 1.04 } as const;

export function buildDemoPancake(view: HTMLElement): BuiltDemo {
  const $ = <T extends Element = HTMLElement>(sel: string): T => {
    const el = view.querySelector<T>(sel);
    if (!el) throw new Error(`demo-pancake: ${sel} missing`);
    return el;
  };
  const $$ = <T extends Element = HTMLElement>(sel: string) => Array.from(view.querySelectorAll<T>(sel));

  const app = $(".lp-demowin__app");
  const intro = $(".lp-demowin__intro");
  const label = $(".lp-demowin__label");
  const ideas = $$(".lp-demowin__idea");
  const chip = $(".lp-demowin__chip");
  const bar = $(".lp-demowin__bar");
  const barPh = $(".lp-demowin__bar-ph");
  const barText = $(".lp-demowin__bar-text");
  const barAsk = $(".lp-demowin__bar-ask");
  const caret = $(".lp-demowin__bar .lp-demowin__caret");
  const send = $(".lp-demowin__send");
  const bubble = $(".lp-demowin__bubble");
  const work = $(".lp-demowin__work");
  const calls = $$(".lp-demowin__work li").map((li) => {
    const q = <T extends Element = HTMLElement>(sel: string) => li.querySelector<T>(sel)!;
    const num = li.querySelector<HTMLElement>(".lp-demowin__work-r b");
    return {
      li,
      spin: q(".lp-demowin__st-spin"),
      ok: q(".lp-demowin__st-ok"),
      result: q(".lp-demowin__work-r"),
      num,
      to: num ? Number(num.textContent) || 0 : 0,
    };
  });
  const found = $(".lp-demowin__found");
  const avs = $$(".lp-demowin__av");
  const count = $(".lp-demowin__count b");
  const wrap = $(".lp-demowin__playw");
  const card = $(".lp-demowin__playc");
  const head = $(".lp-demowin__play-head");
  const badgeDraft = $('.lp-demowin__badge-st > [data-s="draft"]');
  const badgeLive = $('.lp-demowin__badge-st > [data-s="live"]');
  const rows = $$(".lp-demowin__rows li").map((li) => ({
    li,
    ok: li.querySelector<HTMLElement>(".lp-demowin__st-ok")!,
  }));
  const foot = $(".lp-demowin__foot");
  const go = $(".lp-demowin__go");
  const goFill = $(".lp-demowin__go-fill");
  const ring = $<SVGSVGElement>(".lp-demowin__ring");
  const ringRect = $<SVGRectElement>(".lp-demowin__ring rect");
  const after = $(".lp-demowin__after");
  const cursor = view.querySelector<HTMLElement>(".lp-demowin__cursor");
  const cursorArrow = cursor?.querySelector<SVGElement>("svg") ?? null;

  /* ── geometry, on the rest layout ── */
  const cs = getComputedStyle(view);
  const px = (prop: string, fallback: number) => {
    const v = parseFloat(cs.getPropertyValue(prop));
    return Number.isFinite(v) ? v : fallback;
  };
  const barTop = px("--pk-bar-top", bar.offsetTop);
  const barH = px("--pk-bar-h", bar.offsetHeight);
  const dockTop = px("--pk-dock-top", barTop);
  const dockH = px("--pk-dock-h", 48);

  // everything below is in the window's own px: rects divided by its on-screen scale
  const appBox = app.getBoundingClientRect();
  const scale = app.offsetWidth ? appBox.width / app.offsetWidth : 1;
  const at = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: (r.left - appBox.left) / scale, y: (r.top - appBox.top) / scale, w: r.width / scale, h: r.height / scale };
  };

  const glyphs = measureGlyphs(barText);
  // the request leaves from where it was typed and lands in the thread
  const typedAt = at(barText);
  const bubbleAt = at(bubble);
  const fromX = typedAt.x - bubbleAt.x;
  const fromY = typedAt.y - bubbleAt.y;

  // the research folds away once the leads are found: its height and the gap above it
  const workH = work.offsetHeight;
  const workGap = parseFloat(getComputedStyle(work).marginTop) || 0;

  const fullH = card.offsetHeight;
  const footH = foot.offsetHeight;
  const closedH = fullH - footH;

  // the Live outline: a rounded rectangle RING_GAP outside the card as it ends (no button)
  const rw = card.offsetWidth + RING_GAP * 2;
  const rh = closedH + RING_GAP * 2;
  ring.setAttribute("viewBox", `0 0 ${rw} ${rh}`);
  ringRect.setAttribute("x", "1");
  ringRect.setAttribute("y", "1");
  ringRect.setAttribute("width", String(rw - 2));
  ringRect.setAttribute("height", String(rh - 2));
  ringRect.setAttribute("rx", String(CARD_R + RING_GAP - 1));

  // the cursor's target: the button, where it sits once the research has folded away
  // (right of the label and low on the button, so the arrow never covers the words)
  const goAt = at(go);
  const tx = goAt.x + goAt.w * 0.64;
  const ty = goAt.y + goAt.h * 0.62 - (workH + workGap);
  const ex = app.offsetWidth * CURSOR_FROM.x;
  const ey = app.offsetHeight * CURSOR_FROM.y;

  const foundTo = Number(count.textContent) || 0;
  registerTxtPlugin();

  const tl = gsap.timeline({ paused: true });
  // an instant change as a 1 ms tween, not a zero-duration set (see the header)
  const step = (targets: gsap.TweenTarget, vars: gsap.TweenVars, t: number) =>
    tl.to(targets, { ...vars, duration: STEP, ease: "none" }, t);
  /** a number that ticks up to `to` in six steps from `t` */
  const tick = (el: Element, to: number, t: number, every = 0.07) => {
    for (let i = 1; i <= 6; i++) step(el, { txt: String(Math.round((to * i) / 6)) }, t + (i - 1) * every);
  };

  /* ── frame 0 = the home (= the markup) ── */
  gsap.set([intro, label, ...ideas], { autoAlpha: 1, y: 0 });
  gsap.set(chip, { autoAlpha: 1 });
  gsap.set(bar, { top: barTop, height: barH });
  gsap.set(barPh, { autoAlpha: 1 });
  gsap.set(barText, { clipPath: HIDDEN_CLIP });
  gsap.set(barAsk, { autoAlpha: 0 });
  gsap.set(caret, { x: 0, y: 0, opacity: 1 });
  gsap.set(send, { opacity: 0.4, scale: 1 });
  gsap.set(bubble, { autoAlpha: 0, x: fromX, y: fromY });
  gsap.set(work, { autoAlpha: 1, height: workH, marginTop: workGap });
  for (const c of calls) {
    gsap.set(c.li, { autoAlpha: 0, y: 6 });
    gsap.set(c.spin, { opacity: 1 });
    gsap.set(c.ok, { opacity: 0, scale: 0.4 });
    gsap.set(c.result, { autoAlpha: 0, x: 6 });
    if (c.num) gsap.set(c.num, { txt: "0" });
  }
  gsap.set(found, { autoAlpha: 0, y: 6 });
  gsap.set(avs, { opacity: 0, scale: 0.4 });
  gsap.set(count, { txt: "0" });
  gsap.set(wrap, { autoAlpha: 0, y: 16 });
  gsap.set(card, { height: closedH });
  gsap.set(head, { autoAlpha: 0, y: 4 });
  gsap.set(badgeDraft, { autoAlpha: 1 });
  gsap.set(badgeLive, { autoAlpha: 0, scale: 0.9 });
  for (const r of rows) {
    gsap.set(r.li, { autoAlpha: 0, y: 5 });
    gsap.set(r.ok, { scale: 0.4 });
  }
  gsap.set(go, { autoAlpha: 0, y: 8, scale: 1 });
  gsap.set(goFill, { scaleX: 0 });
  gsap.set(ring, { opacity: 0 });
  gsap.set(ringRect, { strokeDashoffset: 1 });
  gsap.set(after, { autoAlpha: 0, y: 6 });
  if (cursor) gsap.set(cursor, { x: ex, y: ey, opacity: 0 });
  if (cursorArrow) gsap.set(cursorArrow, { scale: 1, transformOrigin: "2px 2px" });

  /* ── 1 · the request types into the chat bar, at a pace one can read ── */
  step(barPh, { autoAlpha: 0 }, T0 - STEP);
  tl.to(send, { opacity: 1, duration: 0.2, ease: "power2.out" }, T0);
  glyphs.forEach((g, i) => {
    const t = T0 + i * DT;
    step(barText, { clipPath: clipTo(g) }, t);
    step(caret, { x: g.right + 1, y: g.top }, t); // in step with the clip
  });
  const TYPED = T0 + Math.max(glyphs.length - 1, 0) * DT;
  step(barText, { clipPath: "none" }, TYPED + 0.08);

  /* ── 2 · press, SEND: the request lifts into the thread, the bar becomes the dock ── */
  const PRESS = TYPED + TYPED_HOLD;
  tl.to(
    send,
    {
      keyframes: [
        { scale: 0.86, duration: 0.08, ease: "power2.out" },
        { scale: 1, duration: 0.3, ease: "back.out(2)" },
      ],
    },
    PRESS,
  );
  const SEND = PRESS + 0.1;
  step(caret, { opacity: 0 }, SEND);
  step(barText, { clipPath: HIDDEN_CLIP }, SEND);
  tl.to(send, { opacity: 0.4, duration: 0.2, ease: "power1.out" }, SEND);
  tl.to(bubble, { autoAlpha: 1, duration: 0.14, ease: "power1.out" }, SEND);
  tl.to(bubble, { x: 0, y: 0, duration: 0.6, ease: "power3.out" }, SEND);
  tl.to(intro, { autoAlpha: 0, y: -10, duration: 0.2, ease: "power2.in" }, SEND); // gone before the request crosses it
  tl.to([label, ...ideas], { autoAlpha: 0, y: 10, duration: 0.26, ease: "power2.in", stagger: 0.035 }, SEND);
  tl.to(chip, { autoAlpha: 0, duration: 0.25, ease: "power2.in" }, SEND);
  tl.to(bar, { top: dockTop, height: dockH, duration: 0.62, ease: "power3.inOut" }, SEND + 0.04);
  tl.to(barAsk, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, SEND + 0.5);

  /* ── 3 · the research: three tool calls, one at a time ── */
  const WORK0 = SEND + 0.6;
  let worked = WORK0;
  calls.forEach((c, k) => {
    const start = WORK0 + k * WORK_BEAT;
    const done = start + WORK;
    tl.to(c.li, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power3.out" }, start);
    tl.to(c.spin, { opacity: 0, duration: 0.1, ease: "power1.in" }, done);
    tl.to(c.ok, { opacity: 1, scale: 1, duration: 0.32, ease: "back.out(2.2)" }, done + 0.02);
    tl.to(c.result, { autoAlpha: 1, x: 0, duration: 0.3, ease: "power3.out" }, done + 0.04);
    if (c.num) tick(c.num, c.to, done + 0.04, 0.05);
    worked = done;
  });

  /* ── 4 · what it found: five faces, the count ticks up ── */
  const FOUND = worked + 0.3;
  tl.to(found, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out" }, FOUND);
  avs.forEach((av, i) => {
    tl.to(av, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, FOUND + 0.08 + i * 0.08);
  });
  tick(count, foundTo, FOUND + 0.08, 0.075);

  /* ── 5 · the research folds away and the Play that keeps them coming is drawn ── */
  const PLAY = FOUND + 1.0;
  tl.to(work, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, PLAY);
  tl.to(work, { height: 0, marginTop: 0, duration: 0.5, ease: "power3.inOut" }, PLAY + 0.05);
  tl.to(wrap, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, PLAY + 0.2);
  tl.to(wrap, { y: 0, duration: 0.6, ease: "power3.out" }, PLAY + 0.2);
  tl.to(head, { autoAlpha: 1, y: 0, duration: 0.32, ease: "power3.out" }, PLAY + 0.35);
  let drawn = PLAY + 0.55;
  rows.forEach((r, k) => {
    const t = PLAY + 0.55 + k * 0.13;
    tl.to(r.li, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out" }, t);
    tl.to(r.ok, { scale: 1, duration: 0.3, ease: "back.out(2.2)" }, t + 0.04);
    drawn = t + 0.3;
  });

  /* ── 6 · the card grows, the button comes, the cursor presses it ── */
  const BTN = drawn + 0.15;
  tl.to(card, { height: fullH, duration: 0.42, ease: "power3.inOut" }, BTN);
  tl.to(go, { autoAlpha: 1, y: 0, duration: 0.36, ease: "power3.out" }, BTN + 0.12);
  const CUR = BTN + 0.35;
  const CLICK = CUR + 0.68;
  if (cursor) {
    tl.to(cursor, { opacity: 1, duration: 0.15, ease: "power1.out" }, CUR);
    tl.to(cursor, { x: tx, y: ty, duration: 0.6, ease: "power2.inOut" }, CUR); // one glide, straight to it
  }
  if (cursorArrow) {
    tl.to(
      cursorArrow,
      {
        keyframes: [
          { scale: 0.86, duration: 0.08, ease: "power2.out" },
          { scale: 1, duration: 0.2, ease: "power2.out" },
        ],
      },
      CLICK,
    );
  }
  tl.to(
    go,
    {
      keyframes: [
        { scale: 0.97, duration: 0.08, ease: "power2.out" },
        { scale: 1, duration: 0.3, ease: "back.out(1.6)" },
      ],
    },
    CLICK,
  );

  /* ── 7 · deployed: the button fills, the Play goes Live, Pancake says what is next ── */
  const DEPLOY = CLICK + 0.1;
  tl.to(goFill, { scaleX: 1, duration: 0.55, ease: "power2.inOut" }, DEPLOY);
  if (cursor) tl.to(cursor, { opacity: 0, duration: 0.2, ease: "power1.in" }, DEPLOY + 0.4);
  const LIVE = DEPLOY + 0.6;
  tl.to(badgeDraft, { autoAlpha: 0, duration: 0.12, ease: "power1.in" }, LIVE);
  tl.to(badgeLive, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, LIVE + 0.05);
  // the button has done its job: it leaves and the card closes on its rows
  tl.to(go, { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, LIVE + 0.1);
  tl.to(card, { height: closedH, duration: 0.42, ease: "power3.inOut" }, LIVE + 0.2);
  tl.to(ring, { opacity: 1, duration: 0.1, ease: "none" }, LIVE + 0.55);
  tl.to(ringRect, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, LIVE + 0.55);
  tl.to(after, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" }, LIVE + 0.75);
  // a still beat, so the timeline's end is the finished picture
  tl.to({}, { duration: 0.2 }, LIVE + 1.4);

  const touched: Element[] = [
    intro, label, ...ideas, chip, bar, barPh, barText, barAsk, caret, send, bubble, work, found, ...avs, count,
    wrap, card, head, badgeDraft, badgeLive, go, goFill, ring, ringRect, after,
    ...calls.flatMap((c) => [c.li, c.spin, c.ok, c.result, ...(c.num ? [c.num] : [])]),
    ...rows.flatMap((r) => [r.li, r.ok]),
    ...(cursor ? [cursor] : []),
    ...(cursorArrow ? [cursorArrow] : []),
  ];
  return {
    tl,
    // the caller reverts its gsap.context first; then the outline's geometry and the empty
    // style="" that revert leaves go, so the markup is the server's again
    cleanup: () => {
      ring.removeAttribute("viewBox");
      for (const a of ["x", "y", "width", "height", "rx"]) ringRect.removeAttribute(a);
      for (const el of touched) if (el.getAttribute("style") === "") el.removeAttribute("style");
    },
  };
}
