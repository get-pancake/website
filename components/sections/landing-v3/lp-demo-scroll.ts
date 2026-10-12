"use client";

// lp-demo-scroll.ts — the demo window's one scroll effect (founder 2026-10-12, _decisions §10):
// the card (window + pills) grows from .94 to 1 about its top centre while the visitor scrolls.
// It replaces the hero-scroll assembly (storyboard 01 → 02 → 03): the window is there, assembled
// and opaque, from the first frame.
//
// ONE progress g, written as `--lp-demowin-grow` on the card; demo.css turns it into the card's
// scale (`0.94 + 0.06 * g`, transform-origin 50% 0: the top edge never moves, so the peek at the
// bottom of the first screen is the static window's own top). Unset = 0 = the server's first
// paint. The property is registered non-inheriting (demo.css): a write restyles the card alone.
//   g = 0  the window's top where it sits at the top of the page, the fold at most
//          (so a fresh load always starts at .94, whatever the window height);
//   g = 1  the window's top at GROW_END_AT (35 %) of the viewport height.
// At 1 it LOCKS for the visit: `data-grow-done` on the section, the property removed, every
// listener and observer gone. Never shrinks back on screen; a fresh page load starts again.
// Anything else that ends the effect is final too: the window leaving GROW_QUERY (resized under
// 1025 wide or over 1449 tall, reduced motion turned on) or scrolled away through the top.
//
// Cost: a passive scroll listener + one rAF per frame, one rect read and at most one style write
// (a custom property that only feeds the card's `scale`: no layout, no subtree restyle). Nothing
// runs while the card is off screen (IntersectionObserver), nor after the lock. No will-change,
// no GSAP.
//
// A page that opens already scrolled (a reload mid-page, an anchor): the first paint is the
// server's .94, so the first value eases in over GROW_SETTLE_MS (`data-grow-settle`, one-shot)
// instead of jumping; a card that is already above the viewport locks at once, unseen.

import { GROW_END_AT, GROW_QUERY, GROW_SETTLE_MS } from "./lp-demo-timeline";

export interface WindowGrow {
  /** Lock at scale 1 now (QA, and the player's cleanup path). */
  lock: () => void;
  /** { g, done }: the last value written and whether the effect has locked. */
  state: () => { g: number; done: boolean };
  destroy: () => void;
}

export function mountWindowGrow(section: HTMLElement, card: HTMLElement): WindowGrow {
  const mq = window.matchMedia(GROW_QUERY);
  let done = false;
  let live = false;
  let raf = 0;
  let settle = 0;
  let last = "";
  let g = 0;
  let io: IntersectionObserver | null = null;
  let ro: ResizeObserver | null = null;

  const schedule = () => {
    if (!raf && !done) raf = requestAnimationFrame(update);
  };
  const attach = () => {
    if (live || done) return;
    live = true;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    // the hero above glides to its new height after a resize settles (hero.css, 450 ms): the
    // window moves with it without any scroll or resize event
    const hero = document.querySelector(".lp-hero");
    if (hero && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(schedule);
      ro.observe(hero);
    }
  };
  const detach = () => {
    if (!live) return;
    live = false;
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    ro?.disconnect();
    ro = null;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const lock = () => {
    if (done) return;
    done = true;
    g = 1;
    detach();
    io?.disconnect();
    io = null;
    mq.removeEventListener("change", onQuery);
    section.setAttribute("data-grow-done", "");
    card.style.removeProperty("--lp-demowin-grow");
  };

  /** g from the card's place on screen; null while the section is not rendered (agents view). */
  const measure = (): number | null => {
    if (card.getClientRects().length === 0) return null;
    const top = card.getBoundingClientRect().top;
    const vh = window.innerHeight;
    const start = Math.min(vh, top + window.scrollY);
    const end = vh * GROW_END_AT;
    if (start - end < 1) return 1;
    return Math.min(1, Math.max(0, (start - top) / (start - end)));
  };

  function update() {
    raf = 0;
    if (done) return;
    const v = measure();
    if (v === null) return;
    if (v >= 1) {
      // still easing in from the first paint: the timer below locks when it lands
      if (settle) write(1);
      else lock();
      return;
    }
    write(v);
  }
  const write = (v: number) => {
    g = v;
    const s = v.toFixed(4);
    if (s === last) return;
    last = s;
    card.style.setProperty("--lp-demowin-grow", s);
  };

  function onQuery() {
    if (!mq.matches) lock();
  }

  if (!mq.matches) {
    // phones, tablets, very tall windows, reduced motion: demo.css draws the window at 1
    lock();
  } else {
    mq.addEventListener("change", onQuery);
    const first = measure();
    if (first !== null && first > 0) {
      const r = card.getBoundingClientRect();
      if (r.bottom <= 0) {
        lock(); // opened below the window: it is at 1 before anyone scrolls back to it
      } else {
        section.setAttribute("data-grow-settle", "");
        write(first);
        settle = window.setTimeout(() => {
          settle = 0;
          section.removeAttribute("data-grow-settle");
          if (!done) update();
        }, GROW_SETTLE_MS + 40);
      }
    }
    if (!done) {
      io = new IntersectionObserver((entries) => {
        const e = entries[entries.length - 1];
        if (e.isIntersecting) {
          attach();
          schedule();
        } else {
          // left the screen: through the top = past the end, it locks; else nothing to run
          if (card.getClientRects().length > 0 && card.getBoundingClientRect().bottom <= 0) lock();
          else detach();
        }
      });
      io.observe(card);
    }
  }

  return {
    lock,
    state: () => ({ g: +g.toFixed(4), done }),
    destroy: () => {
      window.clearTimeout(settle);
      detach();
      io?.disconnect();
      mq.removeEventListener("change", onQuery);
      section.removeAttribute("data-grow-settle");
      section.removeAttribute("data-grow-done");
      card.style.removeProperty("--lp-demowin-grow");
    },
  };
}
