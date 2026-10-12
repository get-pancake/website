// No "use client" on purpose (as the deep-dive story builders): this module is reached only
// through LpDemoPlayer's import(), so it stays a lazy chunk with GSAP and never a client entry
// of app/page. Browser-only code runs inside the builder alone.
import { gsap } from "@/lib/gsap";

import { registerTxtPlugin } from "./lp-gsap-txt";

/**
 * The homepage demo window's Pancake view as ONE paused, seek-safe GSAP timeline (founder brief
 * 2026-10-12: "l'enchaînement du motion actuel est saccadé alors que ça doit se faire de manière
 * plus fluide, pas besoin de coupure de plans"; "the first part goes super fast"). Frame 0 = the
 * server markup = the home; the player (LpDemoPlayer) seeks it with its own clock, so it holds
 * no callbacks and no randomness, and seeks both ways.
 *
 * One take, nothing cuts: each thing that leaves eases out while the next eases in, and the two
 * objects that live through it MOVE instead of being swapped:
 *   0      home: title, empty chat bar, three suggested Plays, chip
 *   0.30   the request types into the chat bar (22 ms a glyph, a caret on the glyph edges)
 *   +0.28  the send button is pressed
 *   SEND   the request lifts out of the bar into the thread (one move, up and to the right);
 *          the home eases away; the SAME bar glides down and becomes the dock
 *   +0.38  the Play card rises. Its three rows work one at a time (spinner + what Pancake is
 *          doing, 0.55 s), then resolve (check + value): who, the signal, what happens next.
 *          The name lands with the last row; the card grows and the button comes
 *   CLICK  the cursor glides to "Deploy Play" and presses it
 *   LIVE   the button fills, the card goes Live (Draft → Live), its outline draws clockwise,
 *          the first leads arrive (five faces, the count ticks up)
 * About 7 s. Easing follows the house baseline (entrances power3.out, landings back.out, moves
 * power3.inOut, exits power2.in and shorter than entrances); text at rest never moves.
 *
 * Geometry is measured once, on the rest layout (before any set): the bar's two places come from
 * the view's --pk-* properties (demo.css; the phone box overrides them), the rest from offsets,
 * so the same code plays the desktop window and the phone card. The player rebuilds it when the
 * stage's size changes.
 *
 * GSAP traps avoided as in lp-story-claude-timeline.ts: every instant change is a 1 ms tween
 * (`step`), never a zero-duration set (gsap.context's revert replays those last, in an order
 * that differs per engine), and every property the timeline touches has a frame-0 gsap.set.
 */

export type BuiltDemo = { tl: gsap.core.Timeline; cleanup: () => void };

/* Typing helpers: the clip-path staircase of the stories (lp-story-claude-timeline.ts). */
type Glyph = { right: number; top: number; bottom: number };
/** each glyph's right edge and line box, in the element's own unscaled px (Range rects) */
function measureGlyphs(el: HTMLElement): Glyph[] {
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
const HIDDEN_CLIP = "polygon(0 0, 0 0, 0 0, 0 0, 0 0, 0 0)";
const clipTo = (g: Glyph) =>
  `polygon(0 0, 100% 0, 100% ${g.top}px, ${g.right}px ${g.top}px, ${g.right}px ${g.bottom}px, 0 ${g.bottom}px)`;

/** typing: first glyph, then one every 22 ms */
const T0 = 0.3;
const DT = 0.022;
/** an "instant" step: 1 ms (a tween, so gsap.context reverts it in time order) */
const STEP = 0.001;
/** one row of the card: how long Pancake "works" on it, and the beat to the next row */
const ROW_WORK = 0.55;
const ROW_BEAT = 0.62;
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
  const card = $(".lp-demowin__playc");
  const skel = $(".lp-demowin__play-skel");
  const name = $(".lp-demowin__play-name");
  const pillDraft = $('.lp-demowin__badge-st > [data-s="draft"]');
  const pillLive = $('.lp-demowin__badge-st > [data-s="live"]');
  const rows = $$(".lp-demowin__rows li").map((li) => {
    const q = <T extends Element = HTMLElement>(sel: string) => li.querySelector<T>(sel)!;
    const done = q(".lp-demowin__done");
    return {
      idle: q(".lp-demowin__st-idle"),
      spin: q(".lp-demowin__st-spin"),
      ok: q(".lp-demowin__st-ok"),
      key: q(".lp-demowin__k"),
      doing: q(".lp-demowin__doing"),
      done,
      // chips and arrows land one after the other; a plain text value lands whole
      parts: Array.from(done.children) as HTMLElement[],
    };
  });
  const foot = $(".lp-demowin__foot");
  const go = $(".lp-demowin__go");
  const goFill = $(".lp-demowin__go-fill");
  const found = $(".lp-demowin__found");
  const avs = $$(".lp-demowin__av");
  const count = $(".lp-demowin__count b");
  const ring = $<SVGSVGElement>(".lp-demowin__ring");
  const ringRect = $<SVGRectElement>(".lp-demowin__ring rect");
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

  const glyphs = measureGlyphs(barText);
  // the request leaves from where it was typed and lands in the thread
  const fromX = bar.offsetLeft + barText.offsetLeft - bubble.offsetLeft;
  const fromY = barTop + barText.offsetTop - bubble.offsetTop;

  const fullH = card.offsetHeight;
  const footH = foot.offsetHeight;
  const cardW = card.offsetWidth;

  // the Live outline: a rounded rectangle RING_GAP outside the card
  const rw = cardW + RING_GAP * 2;
  const rh = fullH + RING_GAP * 2;
  ring.setAttribute("viewBox", `0 0 ${rw} ${rh}`);
  ring.style.left = `${card.offsetLeft - RING_GAP}px`;
  ring.style.top = `${card.offsetTop - RING_GAP}px`;
  ring.style.width = `${rw}px`;
  ring.style.height = `${rh}px`;
  ringRect.setAttribute("x", "1");
  ringRect.setAttribute("y", "1");
  ringRect.setAttribute("width", String(rw - 2));
  ringRect.setAttribute("height", String(rh - 2));
  ringRect.setAttribute("rx", String(CARD_R + RING_GAP - 1));

  // the cursor's target: the button's centre, in the window's own px
  const appBox = app.getBoundingClientRect();
  const scale = app.offsetWidth ? appBox.width / app.offsetWidth : 1;
  const goBox = go.getBoundingClientRect();
  // (right of the label and low on the button, so the arrow never covers the words)
  const tx = (goBox.left + goBox.width * 0.64 - appBox.left) / scale;
  const ty = (goBox.top + goBox.height * 0.62 - appBox.top) / scale;
  const ex = app.offsetWidth * CURSOR_FROM.x;
  const ey = app.offsetHeight * CURSOR_FROM.y;

  const finalCount = Number(count.textContent) || 0;
  registerTxtPlugin();

  const tl = gsap.timeline({ paused: true });
  // an instant change as a 1 ms tween, not a zero-duration set (see the header)
  const step = (targets: gsap.TweenTarget, vars: gsap.TweenVars, t: number) =>
    tl.to(targets, { ...vars, duration: STEP, ease: "none" }, t);

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
  gsap.set(card, { autoAlpha: 0, y: 18, height: fullH - footH });
  gsap.set(skel, { opacity: 1 });
  gsap.set(name, { autoAlpha: 0, y: 4 });
  gsap.set(pillDraft, { autoAlpha: 1 });
  gsap.set(pillLive, { autoAlpha: 0, scale: 0.9 });
  for (const r of rows) {
    gsap.set(r.idle, { opacity: 1 });
    gsap.set(r.spin, { opacity: 0 });
    gsap.set(r.ok, { opacity: 0, scale: 0.4 });
    gsap.set(r.key, { opacity: 0.5 });
    gsap.set(r.doing, { opacity: 0 });
    gsap.set(r.done, { autoAlpha: 0, x: 6 });
    if (r.parts.length) gsap.set(r.parts, { opacity: 0, y: 4 });
  }
  gsap.set(go, { autoAlpha: 0, y: 8, scale: 1 });
  gsap.set(goFill, { scaleX: 0 });
  gsap.set(found, { autoAlpha: 0 });
  gsap.set(avs, { opacity: 0, scale: 0.4 });
  gsap.set(count, { txt: "0" });
  gsap.set(ring, { opacity: 0 });
  gsap.set(ringRect, { strokeDashoffset: 1 });
  if (cursor) gsap.set(cursor, { x: ex, y: ey, opacity: 0 });
  if (cursorArrow) gsap.set(cursorArrow, { scale: 1, transformOrigin: "2px 2px" });

  /* ── 1 · the request types into the chat bar ── */
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
  const PRESS = TYPED + 0.28;
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

  /* ── 3 · the Play card rises and builds itself, one row at a time ── */
  const CARD = SEND + 0.38;
  tl.to(card, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, CARD);
  tl.to(card, { y: 0, duration: 0.6, ease: "power3.out" }, CARD);
  let built = CARD;
  rows.forEach((r, k) => {
    const start = CARD + 0.3 + k * ROW_BEAT;
    const done = start + ROW_WORK;
    step(r.idle, { opacity: 0 }, start);
    tl.to(r.spin, { opacity: 1, duration: 0.12, ease: "power1.out" }, start);
    tl.to(r.key, { opacity: 1, duration: 0.2, ease: "power1.out" }, start);
    tl.to(r.doing, { opacity: 1, duration: 0.18, ease: "power1.out" }, start);
    tl.to(r.spin, { opacity: 0, duration: 0.1, ease: "power1.in" }, done);
    tl.to(r.doing, { opacity: 0, duration: 0.12, ease: "power1.in" }, done);
    tl.to(r.ok, { opacity: 1, scale: 1, duration: 0.32, ease: "back.out(2.2)" }, done + 0.02);
    tl.to(r.done, { autoAlpha: 1, x: 0, duration: 0.34, ease: "power3.out" }, done + 0.08);
    if (r.parts.length) {
      tl.to(r.parts, { opacity: 1, y: 0, duration: 0.26, ease: "power3.out", stagger: 0.05 }, done + 0.1);
    }
    built = done;
  });
  // the name lands with the last row
  tl.to(skel, { opacity: 0, duration: 0.15, ease: "power1.in" }, built - 0.1);
  tl.to(name, { autoAlpha: 1, y: 0, duration: 0.32, ease: "power3.out" }, built - 0.02);

  /* ── 4 · the card grows, the button comes, the cursor presses it ── */
  const BTN = built + 0.2;
  tl.to(card, { height: fullH, duration: 0.42, ease: "power3.inOut" }, BTN);
  tl.to(go, { autoAlpha: 1, y: 0, duration: 0.36, ease: "power3.out" }, BTN + 0.12);
  const CUR = BTN + 0.3;
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

  /* ── 5 · deployed: the button fills, the card goes Live, the first leads arrive ── */
  const DEPLOY = CLICK + 0.1;
  tl.to(goFill, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, DEPLOY);
  if (cursor) tl.to(cursor, { opacity: 0, duration: 0.2, ease: "power1.in" }, DEPLOY + 0.35);
  const LIVE = DEPLOY + 0.5;
  tl.to(pillDraft, { autoAlpha: 0, duration: 0.12, ease: "power1.in" }, LIVE);
  tl.to(pillLive, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, LIVE + 0.05);
  tl.to(ring, { opacity: 1, duration: 0.1, ease: "none" }, LIVE);
  tl.to(ringRect, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, LIVE);
  tl.to(go, { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, LIVE + 0.05);
  tl.to(found, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, LIVE + 0.2);
  avs.forEach((av, i) => {
    tl.to(av, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, LIVE + 0.25 + i * 0.09);
  });
  // the count ticks up to the markup's figure
  const ticks = 6;
  for (let i = 1; i <= ticks; i++) {
    step(count, { txt: String(Math.round((finalCount * i) / ticks)) }, LIVE + 0.25 + (i - 1) * 0.1);
  }
  // a still beat, so the timeline's end is the finished picture
  tl.to({}, { duration: 0.2 }, LIVE + 1.05);

  const touched: Element[] = [
    intro, label, ...ideas, chip, bar, barPh, barText, barAsk, caret, send, bubble, card, skel, name,
    pillDraft, pillLive, go, goFill, found, ...avs, count, ringRect,
    ...rows.flatMap((r) => [r.idle, r.spin, r.ok, r.key, r.doing, r.done, ...r.parts]),
    ...(cursor ? [cursor] : []),
    ...(cursorArrow ? [cursorArrow] : []),
  ];
  return {
    tl,
    // the caller reverts its gsap.context first; then the outline's geometry and the empty
    // style="" that revert leaves go, so the markup is the server's again
    cleanup: () => {
      ring.removeAttribute("viewBox");
      ring.removeAttribute("style");
      for (const a of ["x", "y", "width", "height", "rx"]) ringRect.removeAttribute(a);
      for (const el of touched) if (el.getAttribute("style") === "") el.removeAttribute("style");
    },
  };
}
