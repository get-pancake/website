"use client";

import { useEffect, useRef } from "react";

/** A pointer on the band slows the loop to this share of its speed (founder
    2026-10-12: "a slowdown and not a complete stop"), eased over these times. */
const HOVER_RATE = 0.3;
const SLOW_MS = 450;
const RESUME_MS = 700;

/**
 * The logo strip's hover slow-down. It used to be the strip's pause button too
 * (2026-10-07, WCAG 2.2.2); the founder removed the button on 2026-10-13
 * ("Remove pause button from logo carroussel"), so nothing stops the strip
 * for good any more: reduced motion still gets the static row (marquee.css),
 * and LpAnimFreeze still parks it off screen.
 *
 * The copies' CSS animations keep running and only their playbackRate is
 * eased (Web Animations), so the strip never jumps. The animations are looked
 * up on every pointer event: the freeze drops and recreates them on phones,
 * and a recreated one starts back at full speed.
 *
 * Renders a hidden hook, only to find its strip. (The name stays: one import.)
 */
export function LpMarqueePause() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const strip = ref.current?.closest<HTMLElement>(".lp-marquee");
    const band = strip?.querySelector<HTMLElement>(".lp-marquee__band");
    if (!strip || !band || !window.matchMedia("(hover: hover)").matches) return;
    let rate = 1;
    let frame = 0;
    const loops = () =>
      Array.from(strip.querySelectorAll<HTMLElement>(".lp-marquee__seq")).flatMap((seq) => seq.getAnimations());
    const ease = (to: number, ms: number) => {
      cancelAnimationFrame(frame);
      const from = rate;
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / ms);
        rate = from + (to - from) * (1 - (1 - p) ** 3); // ease-out cubic
        for (const loop of loops()) loop.updatePlaybackRate(rate);
        if (p < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };
    const slow = (event: PointerEvent) => { if (event.pointerType === "mouse") ease(HOVER_RATE, SLOW_MS); };
    const resume = (event: PointerEvent) => { if (event.pointerType === "mouse") ease(1, RESUME_MS); };
    band.addEventListener("pointerenter", slow);
    band.addEventListener("pointerleave", resume);
    return () => {
      cancelAnimationFrame(frame);
      band.removeEventListener("pointerenter", slow);
      band.removeEventListener("pointerleave", resume);
      for (const loop of loops()) loop.updatePlaybackRate(1);
    };
  }, []);

  return <i ref={ref} hidden aria-hidden="true" />;
}
