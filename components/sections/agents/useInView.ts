"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Viewport gate for the page's ambient animations — the same doctrine as the
 * homepage (LpAnimFreeze / LpRainbowGL on-stage gating): a loop runs only
 * while its section intersects, and never under prefers-reduced-motion.
 * Also stamps `data-inview` on the element for CSS-driven animations.
 */
export function useInView<T extends HTMLElement>(
  options: IntersectionObserverInit = { rootMargin: "0px 0px 0px 0px", threshold: 0 },
): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      el.dataset.inview = "true";
      return;
    }
    const io = new IntersectionObserver((entries) => {
      const e = entries[entries.length - 1];
      if (!e) return;
      setInView(e.isIntersecting);
      if (e.isIntersecting) el.dataset.inview = "true";
      else delete el.dataset.inview;
    }, options);
    io.observe(el);
    return () => io.disconnect();
    // options are static per call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, inView];
}

/** `prefers-reduced-motion: reduce`, live (a mid-visit flip is honored). */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}
