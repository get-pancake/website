"use client";

import { useEffect, useRef } from "react";

import { LpStepStage } from "./LpStepMocks";
import { mountPlayOnce, type PlayOnceRuntime } from "./lp-play-once";
import type { StepVariant } from "./lp-step-timelines";

/** playback rate of the three steps (1 = the compositions' pace) */
const STEP_SPEED = 1;

const loadAnimation = (variant: StepVariant): Promise<PlayOnceRuntime> =>
  Promise.all([import("@/lib/gsap"), import("./lp-step-timelines")]).then(
    ([{ gsap }, { buildStepTimeline }]) => ({ gsap, build: (stage) => buildStepTimeline(variant, stage) }),
  );

/**
 * A "Pancake fills your pipeline" media card that animates its mock UI in
 * place — DOM + CSS + one GSAP timeline per step (lp-step-timelines.ts),
 * replacing the three storyboard mp4s of the same compositions (founder
 * 2026-09-07: the same treatment as the four feature cards — no 0.5–1.3 MB
 * video downloads, vector-crisp at every DPR, the animations replicated
 * exactly).
 *
 * Playback is lp-play-once.ts, shared with the feature cards (2026-09-30:
 * prepared a viewport ahead, played as the card arrives, the picture when
 * the visitor flies past, finished when they scroll away; once, then the
 * last frame holds — the brain, the Agents view, the filled calendar).
 * Unlike the feature cards, the markup's rest state IS the composition's
 * frame 0 (what the video's poster showed: never blank), so the
 * server-rendered card is already the right still and nothing flashes at
 * hydration; if the build ever throws, that still stands ("static").
 *
 * Geometry: the stage is the 464×426 media card at design size and scales as
 * pixels with the card (--lp-fit = card width / 464, via ResizeObserver).
 * Above 1360 the card is the fixed 464 box (fallback 1, the poster shows
 * from the server render); below, the stage waits for the measurement
 * (data-lp-fit) because iOS WebKit mis-resolves the CSS trig fallback (the
 * LpFitVars diagnosis) and would paint the poster blown up until then. Text
 * never rewraps at any width: the mock lays out exactly like the desktop
 * render, always.
 */
export function LpStepAnim({
  variant,
  alt,
  className,
}: {
  variant: StepVariant;
  /** what the animation shows — the only copy a screen reader gets */
  alt: string;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const stage = host?.querySelector<HTMLElement>(".lp-step-stage");
    if (!host || !stage) return;
    return mountPlayOnce({
      host,
      stage,
      designWidth: 464,
      load: () => loadAnimation(variant),
      restIsEnd: false,
      qa: { registry: "__lpStep", key: variant },
      speed: STEP_SPEED,
    });
  }, [variant]);

  return (
    <div ref={hostRef} className={className} role="img" aria-label={alt}>
      <LpStepStage variant={variant} />
    </div>
  );
}
