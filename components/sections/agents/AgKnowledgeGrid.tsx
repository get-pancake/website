"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { useInView, useReducedMotion } from "./useInView";

/**
 * /agents — the Super knowledge grid's viewport gate and motion scheduler.
 * The only client piece of the section; the cards are static copy rendered
 * by the server component (AgKnowledge) and passed in as children, so none
 * of that markup ships as client code (README rule 7, review #29).
 *
 * What it drives (knowledge.css owns every keyframe, duration and easing):
 *
 * - ENTRANCE, once per page visit. On mount, when motion is allowed, the
 *   grid is stamped `data-armed` (the CSS hides the cards); the first time
 *   it intersects, every card gets its diagonal slot (`--ag-k-slot`, from
 *   the live geometry so 4 or 2 columns both sweep top-left → bottom-right)
 *   and the grid is stamped `data-entered`: the cards pop in, staggered, and
 *   hold. Never re-runs. SSR / no-JS / reduced motion never arm, so they
 *   show the settled grid.
 * - WAVE, ambient. While the grid intersects (useInView → `data-inview`),
 *   every 5s one hop ripples along the same diagonal, one illustration
 *   every 60ms (≈1.3s across the sixteen), then rest. The schedule starts
 *   after the entrance has settled, restarts cleanly on re-entry and is torn
 *   down (timers cleared, hop classes stripped) the moment the grid leaves.
 * - HOVER / TAP. A fine pointer entering a card hops its illustration
 *   (the lift + deeper tint are CSS :hover, knowledge.css); on touch a tap
 *   (pointerdown → pointerup on the same card, no drag) hops it — no sticky
 *   hover state. Nothing happens to the other cards.
 *
 * A hop = the `is-hop` class on the illustration wrapper for one run of the
 * 320ms keyframes, removed on animationend (timeout fallback for throttled
 * background tabs). Nothing random, nothing during render; every timer and
 * listener is cleaned up.
 */

const CARD = ".ag-knowledge__card";
const HOP = ".ag-knowledge__hop";
const HOP_CLASS = "is-hop";
/** knowledge.css `ag-knowledge-hop` duration — the fallback removal waits for it plus a margin */
const HOP_MS = 320;
const WAVE_STEP_MS = 60;
const WAVE_EVERY_MS = 5000;
/** the entrance settles at ≈945ms (15 × 35ms + 420ms); a beat after that */
const WAVE_AFTER_ENTRANCE_MS = 1600;
const WAVE_AFTER_REENTRY_MS = 900;
/** a touch that travels further is a scroll, not a tap */
const TAP_SLOP_PX = 10;

/** element → end-now callback of its running hop (bookkeeping, see hop()) */
const running = new WeakMap<HTMLElement, () => void>();

/** Play one hop on an illustration wrapper; a wrapper already mid-hop is left to finish. */
function hop(el: HTMLElement) {
  if (running.has(el)) return;
  let timer = 0;
  const end = () => {
    window.clearTimeout(timer);
    el.removeEventListener("animationend", end);
    el.classList.remove(HOP_CLASS);
    running.delete(el);
  };
  running.set(el, end);
  el.addEventListener("animationend", end);
  timer = window.setTimeout(end, HOP_MS + 80);
  el.classList.add(HOP_CLASS);
}

/** End a wrapper's hop right now (teardown) — no-op when it isn't hopping. */
function settle(el: HTMLElement) {
  running.get(el)?.();
}

/**
 * The cards ordered along the top-left → bottom-right diagonal, read from the
 * live grid geometry (rows = distinct offsetTop, columns = distinct
 * offsetLeft) so the same sweep works for the 4-up and the 2-up layouts.
 * Inside one diagonal front the upper card goes first.
 */
function diagonalOrder(cards: HTMLElement[]): HTMLElement[] {
  const rows = Array.from(new Set(cards.map((c) => c.offsetTop))).sort((a, b) => a - b);
  const cols = Array.from(new Set(cards.map((c) => c.offsetLeft))).sort((a, b) => a - b);
  const key = (c: HTMLElement) => {
    const r = rows.indexOf(c.offsetTop);
    const col = cols.indexOf(c.offsetLeft);
    return (r + col) * cards.length + r;
  };
  return cards
    .map((card) => ({ card, key: key(card) }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.card);
}

const cardOf = (target: EventTarget | null) =>
  target instanceof Element ? target.closest<HTMLElement>(CARD) : null;
const hopOf = (card: HTMLElement) => card.querySelector<HTMLElement>(HOP);

export function AgKnowledgeGrid({ children }: { children: ReactNode }) {
  const [gridRef, inView] = useInView<HTMLUListElement>();
  const reduced = useReducedMotion();
  const entered = useRef(false);
  const waved = useRef(false);

  // Arm the entrance (hide the cards until the grid enters) — only with JS
  // running and motion allowed. useReducedMotion syncs one render late, so
  // the media query is also read directly: never a hidden frame under
  // reduced motion. A mid-visit flip to "reduce" disarms (shows everything).
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const reduceNow = reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceNow) delete grid.dataset.armed;
    else if (!entered.current) grid.dataset.armed = "true";
  }, [gridRef, reduced]);

  // Entrance: the first intersection stamps the slots and `data-entered`.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !inView || entered.current) return;
    entered.current = true;
    if (!grid.dataset.armed) return; // not armed (reduced motion): the settled grid, no pop
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(CARD));
    diagonalOrder(cards).forEach((card, slot) => card.style.setProperty("--ag-k-slot", String(slot)));
    grid.dataset.entered = "true";
  }, [gridRef, inView]);

  // Wave scheduler: runs only while the grid intersects and motion is allowed.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !inView || reduced) return;
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };
    const wave = () => {
      const cards = Array.from(grid.querySelectorAll<HTMLElement>(CARD));
      diagonalOrder(cards).forEach((card, slot) => {
        const fig = hopOf(card);
        if (fig) later(() => hop(fig), slot * WAVE_STEP_MS);
      });
      later(wave, WAVE_EVERY_MS);
    };
    later(wave, waved.current ? WAVE_AFTER_REENTRY_MS : WAVE_AFTER_ENTRANCE_MS);
    waved.current = true;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      grid.querySelectorAll<HTMLElement>(HOP).forEach(settle);
    };
  }, [gridRef, inView, reduced]);

  // Hover hop (fine pointers) and tap hop (touch). Delegated on the <ul>.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || reduced) return;
    let down: { card: HTMLElement; x: number; y: number } | null = null;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const card = cardOf(e.target);
      // moving between the illustration and the label of the same card is not a new entry
      if (!card || (e.relatedTarget instanceof Node && card.contains(e.relatedTarget))) return;
      const fig = hopOf(card);
      if (fig) hop(fig);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      const card = cardOf(e.target);
      down = card ? { card, x: e.clientX, y: e.clientY } : null;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || !down) return;
      const { card, x, y } = down;
      down = null;
      if (cardOf(e.target) !== card) return;
      if (Math.abs(e.clientX - x) > TAP_SLOP_PX || Math.abs(e.clientY - y) > TAP_SLOP_PX) return;
      const fig = hopOf(card);
      if (fig) hop(fig);
    };
    const onCancel = () => {
      down = null;
    };
    grid.addEventListener("pointerover", onOver);
    grid.addEventListener("pointerdown", onDown, { passive: true });
    grid.addEventListener("pointerup", onUp, { passive: true });
    grid.addEventListener("pointercancel", onCancel);
    return () => {
      grid.removeEventListener("pointerover", onOver);
      grid.removeEventListener("pointerdown", onDown);
      grid.removeEventListener("pointerup", onUp);
      grid.removeEventListener("pointercancel", onCancel);
    };
  }, [gridRef, reduced]);

  return (
    <ul ref={gridRef} className="ag-knowledge__grid">
      {children}
    </ul>
  );
}
