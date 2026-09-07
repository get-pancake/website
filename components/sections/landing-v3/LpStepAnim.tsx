"use client";

import { useEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";

import { LpStepStage } from "./LpStepMocks";
import { buildStepTimeline, type StepVariant } from "./lp-step-timelines";

/**
 * A "Pancake fills your pipeline" media card that animates its mock UI in
 * place — DOM + CSS + one GSAP timeline per step (lp-step-timelines.ts),
 * replacing the three storyboard mp4s of the same compositions (founder
 * 2026-09-07: the same treatment as the four feature cards — no 0.5–1.3 MB
 * video downloads, vector-crisp at every DPR, the animations replicated
 * exactly).
 *
 * Same contract as LpLoopVideo had for these cards (and LpFeatAnim keeps):
 * - plays ONCE, when the card is 60 % in view; scrolled away before the end
 *   → paused, resumed on return; once complete it never restarts and holds
 *   its last frame — the brain, the Agents view, the filled calendar;
 * - prefers-reduced-motion shows that last frame directly (seek to the end),
 *   and a flip of the preference mid-visit is honored (lifted → starts over);
 * - the markup's rest state IS the composition's frame 0 (what the video's
 *   poster showed), so the server-rendered card is already the right still
 *   and nothing flashes at hydration; if the build ever throws, that still
 *   stands ("static").
 *
 * Geometry: the stage is the 464×426 media card at design size and scales as
 * pixels with the card (--lp-fit = card width / 464, via ResizeObserver; CSS
 * trig fallback pre-hydration — the LpFitVars recipe, since iOS mis-resolves
 * container units inside trig). Text therefore never rewraps at any width:
 * the mock lays out exactly like the desktop render, always.
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

    // fit scale: the layout content width of the card (immune to ancestor transforms)
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const box = entry.contentBoxSize?.[0];
        const width = box ? box.inlineSize : entry.contentRect.width;
        if (!(width > 0)) continue;
        host.style.setProperty("--lp-fit", String(width / 464));
      }
    });
    ro.observe(host);

    const motionMq = matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    let done = false;
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

    // Built when the card first touches the viewport — laid out (step 02
    // measures its check marks), and nothing is spent on cards the visitor
    // never reaches. Until then the rest markup (frame 0) stands.
    const arm = () => {
      if (ctx) return;
      ctx = gsap.context(() => {
        try {
          const built = buildStepTimeline(variant, stage);
          tl = built.tl;
          cleanupDom = built.cleanup;
          tl.eventCallback("onComplete", () => {
            done = true;
            host.dataset.lpAnim = "done";
          });
          tl.pause(0); // frame 0 = the rest markup
          host.dataset.lpAnim = "armed";
          // QA hook (like __lpFeat): seek a card's timeline to any moment and
          // compare with the composition's render
          const w = window as unknown as { __lpStep?: Record<string, gsap.core.Timeline> };
          w.__lpStep = { ...w.__lpStep, [variant]: tl };
        } catch (err) {
          // never a broken card: the rest-state markup is the poster still
          host.dataset.lpAnim = "static";
          if (process.env.NODE_ENV !== "production") console.error(err);
        }
      }, stage);
    };

    const onMotion = () => {
      if (!tl) return;
      if (!motionMq.matches && !done) tl.progress(0, true);
      sync();
    };
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        if (e.isIntersecting) arm();
        // "focused on it" = 60 % visible (the video's threshold)
        inView = e.isIntersecting && e.intersectionRatio >= 0.6 - 1e-3;
        sync();
      },
      { threshold: [0, 0.6] },
    );
    io.observe(host);
    motionMq.addEventListener("change", onMotion);

    return () => {
      io.disconnect();
      ro.disconnect();
      motionMq.removeEventListener("change", onMotion);
      ctx?.revert();
      cleanupDom?.();
      const w = window as unknown as { __lpStep?: Record<string, gsap.core.Timeline> };
      if (w.__lpStep) delete w.__lpStep[variant];
      delete host.dataset.lpAnim;
      host.style.removeProperty("--lp-fit");
    };
  }, [variant]);

  return (
    <div ref={hostRef} className={className} role="img" aria-label={alt}>
      <LpStepStage variant={variant} />
    </div>
  );
}
