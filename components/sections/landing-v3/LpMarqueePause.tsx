"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The logo strip's pause control (2026-10-07, WCAG 2.2.2 Pause, Stop, Hide):
 * the loop runs for good beside other content, so it needs a way to stop it.
 * Toggles data-paused on the enclosing .lp-marquee; marquee.css pauses every
 * copy on it (the hover pause covers pointers, this covers keyboards and
 * touch). Minimal styling until the designer draws it.
 *
 * Rendered hidden and shown once the strip is seen to animate, so a strip a
 * page freezes into a static row (/pricing) or a reduced-motion visitor never
 * gets a control for motion that isn't there. A strip LpAnimFreeze has
 * already parked off-screen counts as animated.
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
