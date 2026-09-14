"use client";

import { useEffect, useState } from "react";
import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";

/**
 * Phone-only sticky "Start free" bar. It appears once the signup card has
 * scrolled out of view above the fold and sends the reader back to it, so
 * the long tail of the page (benefits, steps, pricing) always has a CTA one
 * thumb away. Solid cream, no backdrop blur: a standing blur on phones is
 * the GPU load that has killed WebContent before (anim.css notes).
 */
export function BrainMobileCta() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const card = document.getElementById("email");
    if (!card || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      // Only once the card is above the viewport: never before the reader reaches it.
      setShown(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
    }, { threshold: 0 });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="brain-sticky-cta" data-shown={shown ? "true" : "false"} aria-hidden={!shown}>
      <p className="brain-sticky-cta__note">Five minutes to set up.</p>
      <LpFxLink href="#email" size="sm" tabIndex={shown ? 0 : -1}>Start free</LpFxLink>
    </div>
  );
}
