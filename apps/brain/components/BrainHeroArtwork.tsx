"use client";

import { useEffect, useRef, useState } from "react";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";

export function BrainHeroArtwork() {
  const clipRef = useRef<HTMLDivElement>(null);
  const [clipRevision, setClipRevision] = useState(0);

  useEffect(() => {
    const clip = clipRef.current;
    if (!clip) return;
    let previousSize: string | undefined;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    // Shared GL watches the art size. Here the CTA crop can change while its
    // art stays at 432px, so refresh its cached clip after a responsive resize.
    const observer = new ResizeObserver(([entry]) => {
      const size = `${entry.contentRect.width}:${entry.contentRect.height}`;
      if (previousSize !== undefined && size !== previousSize) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => setClipRevision(revision => revision + 1), 120);
      }
      previousSize = size;
    });
    observer.observe(clip);
    return () => {
      observer.disconnect();
      clearTimeout(resizeTimer);
    };
  }, []);

  return <>{(["left", "right"] as const).map(side => {
    const variant = side === "left" ? "ctaLeft" : "ctaRight";
    return <div key={side} ref={side === "left" ? clipRef : undefined} className={`brain-side-rail brain-side-rail--${side}`} aria-hidden="true">
      <div className={`lp-cta__art lp-cta__art--${side} brain-side-art`}>
        <div className={`lp-anim-canvas lp-anim-canvas--cta-${side}`}><LpPancakes variant={variant} /></div>
        <LpRainbowGL key={clipRevision} variant={variant} />
      </div>
    </div>;
  })}</>;
}
