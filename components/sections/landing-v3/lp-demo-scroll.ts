"use client";

// lp-demo-scroll.ts — the demo window's one scroll effect (founder 2026-10-12, _decisions §10):
// the card (window + pills) grows from .94 to 1 about its top centre while the visitor scrolls
// down, and goes back to .94 when they scroll back up ("when I scroll back up it should go back
// to initial size"). It replaces the hero-scroll assembly (storyboard 01 → 02 → 03): the window
// is there, assembled and opaque, from the first frame.
//
// ONE progress g, written as `--lp-demowin-grow` on the card; demo.css turns it into the card's
// scale (`0.94 + 0.06 * g`, transform-origin 50% 0: the top edge never moves, so the peek at the
// bottom of the first screen is the static window's own top). Unset = 0 = the server's first
// paint. The property is registered non-inheriting (demo.css): a write restyles the card alone.
//   g = 0  the window's top where it sits at the top of the page, the fold at most
//          (so a fresh load always starts at .94, whatever the window height);
//   g = 1  the window's top at GROW_END_AT (35 %) of the viewport height, and above it.
// g follows the scroll both ways for the whole visit: nothing locks. Outside GROW_QUERY (under
// 1025 wide, over 1449 tall, reduced motion) the property is cleared and demo.css draws the card
// at 1; the effect comes back if the window enters the query again.
//
// Cost: a passive scroll listener + one rAF per frame while the card is on screen, one rect read
// and at most one style write (a custom property that only feeds the card's `scale`: no layout,
// no subtree restyle; no write while the value stands still, so none above the 35 % line).
// Nothing runs while the card is off screen (IntersectionObserver). No will-change, no GSAP.
//
// A page that opens already scrolled (a reload mid-page, an anchor): the first paint is the
// server's .94, so the first value eases in over GROW_SETTLE_MS (`data-grow-settle`, one-shot)
// instead of jumping; a card that is already above the viewport takes its 1 at once, unseen.
//
// lock() is for captures only (`?still`, the QA seek): the card at 1, `data-grow-done` on the
// section, every listener and observer gone.

import { GROW_END_AT, GROW_QUERY, GROW_SETTLE_MS } from "./lp-demo-timeline";

export interface WindowGrow {
  /** Freeze at scale 1 for good (captures: `?still`, the QA seek). */
  lock: () => void;
  /** { g, done }: the last value written and whether lock() froze the effect. */
  state: () => { g: number; done: boolean };
  destroy: () => void;
}

export function mountWindowGrow(section: HTMLElement, card: HTMLElement): WindowGrow {
  const mq = window.matchMedia(GROW_QUERY);
  let done = false;
  let live = false;
  let onScreen = false;
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
    if (live || done || !mq.matches) return;
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
  const clear = () => {
    last = "";
    card.style.removeProperty("--lp-demowin-grow");
  };

  const lock = () => {
    if (done) return;
    done = true;
    g = 1;
    window.clearTimeout(settle);
    settle = 0;
    section.removeAttribute("data-grow-settle");
    detach();
    io?.disconnect();
    io = null;
    mq.removeEventListener("change", onQuery);
    section.setAttribute("data-grow-done", "");
    clear();
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
    if (done || !mq.matches) return;
    const v = measure();
    if (v !== null) write(v);
  }
  const write = (v: number) => {
    g = v;
    const s = v.toFixed(4);
    if (s === last) return;
    last = s;
    card.style.setProperty("--lp-demowin-grow", s);
  };

  function onQuery() {
    if (mq.matches) {
      // back in the query (a resize, motion allowed again): take the scroll's value at once
      update();
      if (onScreen) attach();
    } else {
      // phones, tablets, very tall windows, reduced motion: demo.css draws the card at 1
      detach();
      g = 1;
      clear();
    }
  }

  mq.addEventListener("change", onQuery);
  if (!mq.matches) {
    g = 1;
  } else {
    const first = measure();
    if (first !== null && first > 0) {
      if (card.getBoundingClientRect().bottom <= 0) {
        write(first); // opened below the window: it is at 1 before anyone scrolls back to it
      } else {
        section.setAttribute("data-grow-settle", "");
        write(first);
        settle = window.setTimeout(() => {
          settle = 0;
          section.removeAttribute("data-grow-settle");
          update();
        }, GROW_SETTLE_MS + 40);
      }
    }
  }
  io = new IntersectionObserver((entries) => {
    onScreen = entries[entries.length - 1].isIntersecting;
    // the value where it enters and where it leaves (1 above the screen, its rest value below),
    // so it never comes back on screen with a stale size
    update();
    if (onScreen) attach();
    else detach();
  });
  io.observe(card);

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
