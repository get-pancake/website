"use client";

import { useEffect, useRef, useState } from "react";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";

/**
 * The main CTA card's right rainbow sliver, clipped by the demo card. Port
 * of brain's BrainHeroArtwork (PR #295): class names re-scoped, the GL gate
 * moved to this page's one-column step (1200px, demo.css). Needs LpFitVars
 * on the page (it feeds --lp-fit to .lp-cta__art--right) and must never be
 * remounted: LpFitVars queries the DOM once at mount, so a remounted art
 * gets no --lp-fit and stays blank. DemoHero keeps it a sibling of the
 * swapped card body for that reason.
 */
export function DemoArtwork() {
  const clipRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const [clipRevision, setClipRevision] = useState(0);
  // On one column the art is a 12px strip: the static artboard rings paint
  // it identically, so no WebGL context (≈9MB, a 60fps loop) is spent.
  const [gl, setGl] = useState(false);
  useEffect(() => { setGl(!window.matchMedia("(max-width: 1200px)").matches); }, []);

  useEffect(() => {
    const clip = clipRef.current;
    if (!clip) return;
    let previousSize: string | undefined;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    // LpRainbowGL caches art.offsetParent (this rail) as its clip. The rail
    // follows the card, and the card's height changes between the form,
    // booking (the Calendly frame resizes with calendly.page_height) and
    // booked states while the art keeps its token height, so refresh the
    // cached clip after a settled resize.
    // A card taller than the art (two columns: the booking state's frame)
    // would leave the band blank under the ink: --demo-art-stretch (demo.css)
    // stretches the art vertically to the rail, never below 1, so the ink
    // keeps its width and the shorter states keep their exact ink. The base
    // is the art's layout height (transforms do not change offsetHeight).
    const observer = new ResizeObserver(([entry]) => {
      const artHeight = artRef.current?.offsetHeight ?? 0;
      const stretch = artHeight > 0 ? Math.max(1, entry.contentRect.height / artHeight) : 1;
      clip.style.setProperty("--demo-art-stretch", String(stretch));
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

  return <div ref={clipRef} className="demo-side-rail" aria-hidden="true">
    {/* Without the renderer, the kit shows the artboard only under [data-lp-gl-off]. */}
    <div ref={artRef} className="lp-cta__art lp-cta__art--right demo-side-art" {...(gl ? {} : { "data-lp-gl-off": "" })}>
      <div className="lp-anim-canvas lp-anim-canvas--cta-right"><LpPancakes variant="ctaRight" /></div>
      {gl ? <LpRainbowGL key={clipRevision} variant="ctaRight" /> : null}
    </div>
  </div>;
}
