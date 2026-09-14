"use client";

import { useEffect, useRef, useState } from "react";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";

/** The main CTA card's right rainbow sliver, clipped by the signup card. */
export function BrainHeroArtwork() {
  const clipRef = useRef<HTMLDivElement>(null);
  const [clipRevision, setClipRevision] = useState(0);
  // On phones and tablets the art is a 12px strip: the static artboard rings
  // paint it identically, so no WebGL context (≈9MB, a 60fps loop) is spent.
  const [gl, setGl] = useState(false);
  useEffect(() => { setGl(!window.matchMedia("(max-width: 1024px)").matches); }, []);

  useEffect(() => {
    const clip = clipRef.current;
    if (!clip) return;
    let previousSize: string | undefined;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    // Shared GL watches the art size. Here the card's crop can change while
    // the art follows it, so refresh its cached clip after a responsive resize.
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

  return <div ref={clipRef} className="brain-side-rail" aria-hidden="true">
    {/* Without the renderer, the kit shows the artboard only under [data-lp-gl-off]. */}
    <div className="lp-cta__art lp-cta__art--right brain-side-art" {...(gl ? {} : { "data-lp-gl-off": "" })}>
      <div className="lp-anim-canvas lp-anim-canvas--cta-right"><LpPancakes variant="ctaRight" /></div>
      {gl ? <LpRainbowGL key={clipRevision} variant="ctaRight" /> : null}
    </div>
  </div>;
}
