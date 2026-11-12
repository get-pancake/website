"use client";

import { useEffect, useRef } from "react";

import { LpVisionStepStage } from "./LpVisionStepMocks";
import { mountPlayOnce, type PlayOnceRuntime } from "./lp-play-once";
import type { VisionStepVariant } from "./lp-vision-data";

const loadAnimation = (variant: VisionStepVariant): Promise<PlayOnceRuntime> =>
  Promise.all([import("@/lib/gsap"), import("./lp-vision-step-timelines")]).then(([{ gsap }, { buildVisionStep }]) => ({
    gsap,
    build: (stage) => buildVisionStep(variant, stage),
  }));

/**
 * A media card of the vision homepage's 1-2-3: its picture animates in place, as the designer's
 * step cards do (LpStepAnim: DOM + CSS + one GSAP timeline, played once by lp-play-once; the
 * stage is the 464 × 426 design frame and scales as pixels with the card, --lp-fit). Each
 * picture's markup is its END (restIsEnd): reduced motion and a page without script rest on it,
 * and so does a card whose take could not be built.
 */
export function LpVisionStepAnim({ variant, alt, className }: { variant: VisionStepVariant; alt: string; className?: string }) {
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
      restIsEnd: true,
      qa: { registry: "__lpStep", key: variant },
    });
  }, [variant]);

  return (
    <div ref={hostRef} className={className} role="img" aria-label={alt}>
      <LpVisionStepStage variant={variant} />
    </div>
  );
}
