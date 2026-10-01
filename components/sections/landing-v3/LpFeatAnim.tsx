"use client";

import { useEffect, useRef } from "react";

import { LpFeatStage } from "./LpFeatMocks";
import { mountPlayOnce, type PlayOnceRuntime } from "./lp-play-once";
import type { FeatVariant } from "./lp-feat-timelines";

/** playback rate of the four build-ups (1 = the compositions' pace) */
const FEAT_SPEED = 1;

const loadAnimation = (variant: FeatVariant): Promise<PlayOnceRuntime> =>
  Promise.all([import("@/lib/gsap"), import("./lp-feat-timelines")]).then(
    ([{ gsap }, { buildFeatTimeline }]) => ({ gsap, build: (stage) => buildFeatTimeline(variant, stage) }),
  );

/**
 * A "How Pancake finds customers" media zone that animates its mock UI in
 * place — DOM + CSS + one GSAP timeline per card (lp-feat-timelines.ts),
 * replacing the mp4 renders of the same compositions (founder 2026-09-03: no
 * 500 KB–1 MB video downloads, vector-crisp at every DPR).
 *
 * Playback is lp-play-once.ts (2026-09-30, founder: "l'écran doit rester
 * blanc le moins longtemps possible"): prepared a viewport ahead, played as
 * the card arrives, the picture when the visitor flies past, finished when
 * they scroll away, once, then the last frame holds — the designer's
 * picture. The server-rendered stage IS that picture (restIsEnd), so a card
 * is never blank: before the code arrives, without JS, with reduced motion,
 * or if a build throws. The timeline rewinds to its first frame only while
 * the card is off screen.
 *
 * Geometry: the stage is the 560×621 zone at design size and scales as
 * pixels with the zone (--lp-fit = zone width / 560, via ResizeObserver; at
 * ≥1341 the zone is the fixed 560 box, below the stage waits for the
 * measurement — iOS mis-resolves the CSS trig fallback, LpFitVars). Text
 * therefore never rewraps at any width: the mock lays out exactly like the
 * desktop render, always.
 */
export function LpFeatAnim({
  variant,
  alt,
  className,
}: {
  variant: FeatVariant;
  /** what the animation shows — the only copy a screen reader gets */
  alt: string;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const stage = host?.querySelector<HTMLElement>(".lp-feat-stage");
    if (!host || !stage) return;
    return mountPlayOnce({
      host,
      stage,
      designWidth: 560,
      load: () => loadAnimation(variant),
      restIsEnd: true,
      qa: { registry: "__lpFeat", key: variant },
      layoutRoot: host.closest<HTMLElement>(".lp-feat"),
      speed: FEAT_SPEED,
    });
  }, [variant]);

  return (
    <div ref={hostRef} className={className} role="img" aria-label={alt}>
      <LpFeatStage variant={variant} />
    </div>
  );
}
