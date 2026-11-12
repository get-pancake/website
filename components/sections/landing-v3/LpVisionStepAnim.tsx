"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { mountPlayOnce, type PlayOnceRuntime } from "./lp-play-once";
import type { VisionStepVariant, VisionToyVariant } from "./lp-vision-data";

/* (written here, not imported from lp-vision-data.ts: this island must not carry the page's copy) */
const isToyVariant = (variant: VisionStepVariant): variant is VisionToyVariant => variant.startsWith("t");

/* a flat picture (v1, v2, v3) or a toy picture (t1, t2, t3): each family's takes are a chunk of
   their own, fetched only by a page that shows one */
const loadAnimation = (variant: VisionStepVariant): Promise<PlayOnceRuntime> =>
  isToyVariant(variant)
    ? Promise.all([import("@/lib/gsap"), import("./lp-toy-step-timelines")]).then(([{ gsap }, { buildToyStep }]) => ({
        gsap,
        build: (stage) => buildToyStep(variant, stage),
      }))
    : Promise.all([import("@/lib/gsap"), import("./lp-vision-step-timelines")]).then(([{ gsap }, { buildVisionStep }]) => ({
        gsap,
        build: (stage) => buildVisionStep(variant, stage),
      }));

/**
 * A media card of the vision homepage's 1-2-3: its picture animates in place, as the designer's
 * step cards do (LpStepAnim: DOM + CSS + one GSAP timeline, played once by lp-play-once; the
 * stage is the 464 × 426 design frame and scales as pixels with the card, --lp-fit). Each
 * picture's markup is its END (restIsEnd): reduced motion and a page without script rest on it,
 * and so does a card whose take could not be built.
 *
 * The picture itself is the island's CHILD (LpVisionStepStage, rendered by the server section):
 * its markup reaches the browser as HTML, and neither the stages nor the toy sets' art
 * (lp-toy-art.ts) are in the page's first bundle. Only the takes are fetched, when a card nears.
 */
export function LpVisionStepAnim({ variant, alt, className, children }: { variant: VisionStepVariant; alt: string; className?: string; children: ReactNode }) {
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
      {children}
    </div>
  );
}
