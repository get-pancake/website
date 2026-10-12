"use client";

import { useEffect, useRef, useState } from "react";

/** A pointer on the band slows the loop to this share of its speed (founder
    2026-10-12: "a slowdown and not a complete stop"), eased over these times. */
const HOVER_RATE = 0.3;
const SLOW_MS = 450;
const RESUME_MS = 700;

/**
 * The logo strip's pause control (2026-10-07, WCAG 2.2.2 Pause, Stop, Hide):
 * the loop runs for good beside other content, so it needs a way to stop it.
 * Toggles data-paused on the enclosing .lp-marquee; marquee.css pauses every
 * copy on it. It is the one way to stop the strip for every input: a pointer
 * resting on the band only slows it (below). Minimal styling until the
 * designer draws it.
 *
 * Rendered hidden and shown once the strip is seen to animate, so a strip a
 * page freezes into a static row (/pricing) or a reduced-motion visitor never
 * gets a control for motion that isn't there. A strip LpAnimFreeze has
 * already parked off-screen counts as animated.
 *
 * Hover slow-down: the copies' CSS animations keep running and only their
 * playbackRate is eased (Web Animations), so the strip never jumps and the
 * pause button and the off-stage freeze, which both only pause, are untouched.
 * The animations are looked up on every pointer event: the freeze drops and
 * recreates them on phones, and a recreated one starts back at full speed.
 */
export function LpMarqueePause() {
  const [animated, setAnimated] = useState(false);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const strip = ref.current?.closest<HTMLElement>(".lp-marquee");
    const seq = strip?.querySelector<HTMLElement>(".lp-marquee__seq");
    if (!strip || !seq) return;
    if (strip.hasAttribute("data-lp-offstage") || getComputedStyle(seq).animationName !== "none") {
      setAnimated(true);
    }
  }, []);

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

  useEffect(() => {
    ref.current?.closest<HTMLElement>(".lp-marquee")?.toggleAttribute("data-paused", paused);
  }, [paused]);

  return (
    <button
      ref={ref}
      type="button"
      className="lp-marquee__pause"
      hidden={!animated}
      aria-label={paused ? "Play the customer logos" : "Pause the customer logos"}
      onClick={() => setPaused((p) => !p)}
    >
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
        {paused ? <path d="M3 1.5v9l7.5-4.5z" /> : <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />}
      </svg>
    </button>
  );
}
