"use client";

import { useEffect, useRef } from "react";

/**
 * The phone rail's scroll snap, armed on the visitor's first touch (owner: bento package).
 *
 * WebKit trap (Playwright WebKit 2026-10-09, reproducible about 3 runs in 4): a scroll-snap
 * container that gets its first layout while the PAGE is being scrolled toward it lands on a
 * random card (scrollLeft 260 / 594 / 806 / 1066 / 1451 instead of 0), with or without
 * content-visibility. Snapping that is switched on once the rail is on screen never does it, and
 * a position the visitor chose survives scrolling away and back. So bento.css snaps only under
 * [data-snap], and this island sets it on the first interaction with the rail (touch, pointer,
 * wheel, keyboard focus). Without JS the rail scrolls freely, unsnapped.
 */
export function LpBentoRail() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const rail = ref.current?.closest(".lp-bento__frame")?.querySelector<HTMLElement>(".lp-bento__grid");
    if (!rail) return;
    const events = ["pointerdown", "touchstart", "wheel", "focusin"] as const;
    const arm = () => {
      rail.setAttribute("data-snap", "");
      for (const type of events) rail.removeEventListener(type, arm);
    };
    for (const type of events) rail.addEventListener(type, arm, { passive: true });
    return () => {
      for (const type of events) rail.removeEventListener(type, arm);
    };
  }, []);

  return <span ref={ref} hidden />;
}
