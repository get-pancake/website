"use client";

import { useEffect } from "react";

/**
 * Freezes the viewport height into --lp-svh so the hero's fold clamp
 * (hero.css) doesn't reflow on every frame of a live window-resize drag —
 * that continuous relayout under six big animated ring layers read as
 * "resize breaks the rainbow's fluidity" (founder, 2026-08-31).
 * On phones/touch devices, height-only resizes are browser chrome or the
 * keyboard: keep the initial composition instead of moving the page after
 * a scroll. Width/orientation changes still remeasure, as do settled
 * desktop resizes (150ms quiet). CSS falls back to 100svh before hydration.
 */
export function LpViewportVar() {
  useEffect(() => {
    const root = document.documentElement;
    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    let measuredWidth = 0;
    let orientationChanged = false;
    const apply = () => {
      const width = window.innerWidth;
      if (mobile.matches && measuredWidth === width && !orientationChanged) return;
      measuredWidth = width;
      orientationChanged = false;
      const h = window.innerHeight;
      const prev = parseFloat(root.style.getPropertyValue("--lp-svh")) || 0;
      if (Math.abs(h - prev) >= 1) root.style.setProperty("--lp-svh", `${h}px`);
    };
    apply();
    let t: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(apply, 150);
    };
    const onOrientationChange = () => {
      orientationChanged = true;
      onResize();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientationChange);

    // Scroll-return layer heal (founder recurrence 2026-08-31): real Safari
    // can evict the hero text's composited layer while scrolled deep and
    // fail to repaint it on return — DOM reports fine, pixels are gone.
    // When the scroll re-enters the hero zone from below, force one style
    // invalidation on the promoted layer so WebKit re-rasterizes it. Cheap:
    // rAF-throttled, fires only on the boundary crossing.
    const inner = document.querySelector<HTMLElement>(".lp-hero-inner");
    let wasDeep = window.scrollY > 900;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const deep = window.scrollY > 900;
        if (wasDeep && !deep && inner) {
          inner.style.transform = "translateZ(0.001px)";
          requestAnimationFrame(() => {
            inner.style.transform = "";
          });
        }
        wasDeep = deep;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientationChange);
      window.removeEventListener("scroll", onScroll);
      root.style.removeProperty("--lp-svh");
    };
  }, []);
  return null;
}
