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
  const [cardAbove, setCardAbove] = useState(false);
  const [pricingCtaInView, setPricingCtaInView] = useState(false);
  const shown = cardAbove && !pricingCtaInView;

  useEffect(() => {
    const card = document.getElementById("email");
    if (!card || typeof IntersectionObserver === "undefined") return;
    // Only once the card is above the viewport: never before the reader reaches it.
    const cardObserver = new IntersectionObserver(([entry]) => {
      setCardAbove(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
    }, { threshold: 0 });
    cardObserver.observe(card);
    // Never two identical pills on one screen: step aside for the pricing CTA.
    const pricingCta = document.querySelector(".lp-price-cta");
    const pricingObserver = pricingCta && new IntersectionObserver(([entry]) => setPricingCtaInView(entry.isIntersecting), { threshold: 0 });
    if (pricingCta && pricingObserver) pricingObserver.observe(pricingCta);
    return () => { cardObserver.disconnect(); pricingObserver?.disconnect(); };
  }, []);

  return (
    <div className="brain-sticky-cta" data-shown={shown ? "true" : "false"} aria-hidden={!shown}>
      <p className="brain-sticky-cta__note">Five minutes to set up.</p>
      <LpFxLink href="#email" tabIndex={shown ? 0 : -1}>Start free</LpFxLink>
    </div>
  );
}
