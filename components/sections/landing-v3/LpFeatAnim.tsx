"use client";

import { useEffect, useRef } from "react";

import type { gsap } from "@/lib/gsap";

import { LpFeatStage } from "./LpFeatMocks";
import type { FeatVariant } from "./lp-feat-timelines";

const loadAnimation = () => Promise.all([
  import("@/lib/gsap"),
  import("./lp-feat-timelines"),
]);

/**
 * A "How Pancake finds customers" media zone that animates its mock UI in
 * place — DOM + CSS + one GSAP timeline per card (lp-feat-timelines.ts),
 * replacing the four mp4 renders of the same compositions (founder
 * 2026-09-03: no 500 KB–1 MB video downloads, vector-crisp at every DPR).
 *
 * Same contract as LpLoopVideo had for these cards:
 * - plays ONCE, when the zone is 60 % in view; scrolled away before the end
 *   → paused, resumed on return; once complete it never restarts and holds
 *   its last frame — the designer's picture;
 * - prefers-reduced-motion shows that picture directly (seek to the end),
 *   and a flip of the preference mid-visit is honored (lifted → starts over);
 * - before the timeline is armed the stage stays hidden (= the blank cream
 *   the video's first-frame poster showed), so hydration never flashes the
 *   final picture. If the build ever throws, the rest-state DOM shows as a
 *   still ("static").
 *
 * Geometry: the stage is the 560×621 zone at design size and scales as
 * pixels with the zone (--lp-fit = zone width / 560, via ResizeObserver;
 * CSS trig fallback pre-hydration — the LpFitVars recipe, since iOS
 * mis-resolves container units inside trig). Text therefore never rewraps
 * at any width: the mock lays out exactly like the desktop render, always.
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

    // fit scale: the layout content width of the zone (immune to ancestor transforms)
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const box = entry.contentBoxSize?.[0];
        const width = box ? box.inlineSize : entry.contentRect.width;
        if (!(width > 0)) continue;
        host.style.setProperty("--lp-fit", String(width / 560));
      }
    });
    ro.observe(host);

    const motionMq = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let touching = false;
    let inView = false;
    let done = false;
    let loadRequested = false;
    let runtime: Awaited<ReturnType<typeof loadAnimation>> | undefined;
    let tl: gsap.core.Timeline | undefined;
    let cleanupDom: (() => void) | undefined;
    let ctx: gsap.Context | undefined;

    const sync = () => {
      if (!tl) return;
      if (motionMq.matches) {
        // the final still, no motion at all (events suppressed: not "done" —
        // lifting the preference mid-visit starts the build-up over)
        tl.pause();
        tl.progress(1, true);
        return;
      }
      if (done) return;
      if (inView) {
        tl.play();
        host.dataset.lpAnim = "playing";
      } else {
        tl.pause();
      }
    };

    // Fetch the animation code only when the card first touches the viewport.
    // Build only while intersecting so f2 can measure its glyphs: the section
    // uses content-visibility:auto, and a skipped subtree has no geometry.
    // Until then the server-rendered stage stays hidden (= cream).
    const arm = () => {
      if (ctx || disposed) return;
      if (!runtime) {
        if (loadRequested) return;
        loadRequested = true;
        void loadAnimation().then((loaded) => {
          if (disposed) return;
          runtime = loaded;
          // A slow connection may finish after the visitor has scrolled away.
          // Keep the code ready and build on their next viewport entry.
          if (touching) arm();
        }).catch((err) => {
          if (disposed) return;
          host.dataset.lpAnim = "static";
          if (process.env.NODE_ENV !== "production") console.error(err);
        });
        return;
      }
      const [{ gsap }, { buildFeatTimeline }] = runtime;
      ctx = gsap.context(() => {
        try {
          const built = buildFeatTimeline(variant, stage);
          tl = built.tl;
          cleanupDom = built.cleanup;
          tl.eventCallback("onComplete", () => {
            done = true;
            host.dataset.lpAnim = "done";
          });
          tl.pause(0); // frame 0 (the composition's first frame: cream only)
          host.dataset.lpAnim = "armed";
          // QA hook (like __lpArcPhase / __lpRingPhase): seek a card's timeline
          // to any moment and compare with the composition's render
          const w = window as unknown as { __lpFeat?: Record<string, gsap.core.Timeline> };
          w.__lpFeat = { ...w.__lpFeat, [variant]: tl };
        } catch (err) {
          // never a blank card: the rest-state markup is the designer's picture
          host.dataset.lpAnim = "static";
          if (process.env.NODE_ENV !== "production") console.error(err);
        }
      }, stage);
      // Loading is asynchronous: use the current visibility and motion
      // preference, including changes made while the chunk was downloading.
      sync();
    };

    const onMotion = () => {
      if (!tl) return;
      if (!motionMq.matches && !done) tl.progress(0, true);
      sync();
    };
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        touching = e.isIntersecting;
        // "focused on it" = 60 % visible (the video's threshold)
        inView = touching && e.intersectionRatio >= 0.6 - 1e-3;
        if (touching) arm();
        sync();
      },
      { threshold: [0, 0.6] },
    );
    io.observe(host);
    motionMq.addEventListener("change", onMotion);

    return () => {
      disposed = true;
      io.disconnect();
      ro.disconnect();
      motionMq.removeEventListener("change", onMotion);
      ctx?.revert();
      cleanupDom?.();
      const w = window as unknown as { __lpFeat?: Record<string, gsap.core.Timeline> };
      if (w.__lpFeat) delete w.__lpFeat[variant];
      delete host.dataset.lpAnim;
      host.style.removeProperty("--lp-fit");
    };
  }, [variant]);

  return (
    <div ref={hostRef} className={className} role="img" aria-label={alt}>
      <LpFeatStage variant={variant} />
    </div>
  );
}
