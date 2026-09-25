"use client";

import { useEffect, useRef } from "react";

import { FxPill, FxPillLink } from "./FxPill";
import { mountSnake } from "./snake";
import { APP_ORIGIN } from "@/lib/site-config.mjs";

/**
 * Closing CTA — its own snake stage, same engine and reveal as the hero: the
 * beads wander the band and uncover the cream duplicate of the headline as
 * they pass. Content reveals once the band scrolls into view.
 */
export function FinalCta() {
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleSnakeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!stageRef.current || !canvasRef.current) return;
    const cleanup = mountSnake({
      stage: stageRef.current,
      canvas: canvasRef.current,
      overlays: titleSnakeRef.current ? [titleSnakeRef.current] : [],
    });
    // entrance: reveal when the band scrolls into view
    const content = contentRef.current;
    let io: IntersectionObserver | null = null;
    if (content) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            content.classList.add("is-in");
            io?.disconnect();
          }
        },
        { threshold: 0.35 },
      );
      io.observe(content);
    }
    return () => {
      io?.disconnect();
      cleanup();
    };
  }, []);

  return (
    <section ref={stageRef} className="lv2-stage lv2-cta" aria-labelledby="lv2-cta-title">
      <canvas ref={canvasRef} className="lv2-stage-canvas" aria-hidden="true" />
      <div ref={contentRef} className="lv2-cta-content">
        <h2 id="lv2-cta-title" className="lv2-cta-title">
          Try Pancake now
          <span ref={titleSnakeRef} className="lv2-cta-title-snake" aria-hidden="true">
            Try Pancake now
          </span>
        </h2>
        <div className="lv2-button-group">
          <FxPill variant="outline" data-lv2-open="call" data-analytics-id="call_final">
            Book a call
          </FxPill>
          <FxPillLink href={APP_ORIGIN} data-analytics-id="app_final">
            Get started
          </FxPillLink>
        </div>
      </div>
    </section>
  );
}
