"use client";

import { useEffect, useRef } from "react";

import { LpStepStage } from "./LpStepMocks";
import { mountPlayOnce, type PlayOnceRuntime } from "./lp-play-once";
import type { StepVariant } from "./lp-step-timelines";

/** playback rate of the three steps (1 = the compositions' pace) */
const STEP_SPEED = 1;

/** The variants whose server markup is their END picture (lp-play-once `restIsEnd`, the deep
    dive's phone stack contract): reduced motion and a page without script show it, and the
    driver cues the first frame unseen below the fold before it plays. s4 (step 02 since
    2026-10-28, Claude and the envelopes it sends): its first frame is Claude alone, so the
    burst is the picture worth resting on. The others rest on their first frame. */
const REST_IS_END: Record<StepVariant, boolean> = { s0: false, s1: false, s2: false, s3: false, s4: true };

const loadAnimation = (variant: StepVariant): Promise<PlayOnceRuntime> =>
  Promise.all([import("@/lib/gsap"), import("./lp-step-timelines")]).then(
    ([{ gsap }, { buildStepTimeline }]) => ({ gsap, build: (stage) => buildStepTimeline(variant, stage) }),
  );

/**
 * A "Pancake fills your pipeline" media card that animates its mock UI in
 * place — DOM + CSS + one GSAP timeline per step (lp-step-timelines.ts).
 * It replaced the three storyboard mp4s (founder 2026-09-07: no 0.5–1.3 MB
 * video downloads, vector-crisp at every DPR); since 2026-10-11 step 02 and
 * step 03's intro are the designer's "How it works" storyboards.
 *
 * Playback is lp-play-once.ts (2026-09-30: prepared a viewport ahead,
 * played as the card arrives, the picture when the visitor flies past,
 * finished when they scroll away; once, then the last frame holds — the
 * brain, the Play card, the filled calendar). The markup's rest state IS
 * each animation's frame 0 (the empty input, the chat request, the selected
 * leads: never blank), so the server-rendered card is already the right
 * still and nothing flashes at hydration; if the build ever throws, that
 * still stands ("static"). Since 2026-10-28 one exception, s4 (step 02's
 * envelope burst): its markup is its END picture (REST_IS_END above).
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
  placeholder = false,
  showPlaceholders = false,
}: {
  variant: StepVariant;
  /** what the animation shows — the only copy a screen reader gets */
  alt: string;
  className?: string;
  /** a dev/preview-only slot entry (lp-steps-content.ts status "placeholder"): marked
      data-placeholder, decided by the server component (VERCEL_ENV is server-only) */
  placeholder?: boolean;
  /** lib/placeholders SHOW_PLACEHOLDERS, from the server component too: whether the mock
      may draw its own "placeholder" details (lp-step-data.ts, e.g. a Play-card figure that
      waits for the founder's yes) */
  showPlaceholders?: boolean;
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
      restIsEnd: REST_IS_END[variant],
      qa: { registry: "__lpStep", key: variant },
      speed: STEP_SPEED,
    });
  }, [variant]);

  return (
    <div ref={hostRef} className={className} role="img" aria-label={alt} data-placeholder={placeholder ? "" : undefined}>
      <LpStepStage variant={variant} placeholders={showPlaceholders} />
    </div>
  );
}
