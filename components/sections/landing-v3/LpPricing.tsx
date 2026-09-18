import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";
import { TRIAL_LABEL } from "@/lib/trial";

/**
 * Landing v3 — Pricing (Figma node 4257:5083, 1654×890, bg #000).
 * The grouped rainbow art (lp-pancakes-pricing.svg, 1654×1039) paints the cream
 * top area + wave over the black section; its 148px spill below the section is
 * black-on-black against the footer, so the section clips it safely.
 */

const CHECKLIST = [
  "Every agent included.",
  "5 to 15 warm leads.",
  "2 to 3 new customers.",
  "30 articles posted.",
  "Google ranking and ChatGPT citations.",
  "Approvals and a hard spend cap.",
];

export function LpPricing() {
  return (
    <section id="pricing" className="lp-price">
      <div className="lp-price-frame">
        <h2 className="lp-title-section lp-price-title">Simple, transparent pricing</h2>
        <div className="lp-price-body">
          <div className="lp-price-price">
            {/* Founder copy (2026-09-03): "$99/month" replaces the artboard's
                "99 USD" + "per month, flat" — the number keeps the display
                size, "/month" rides the old per-line style inline. */}
            <p className="lp-price-amount">
              $99
              <span className="lp-price-per">/month</span>
            </p>
          </div>
          <ul className="lp-price-list">
            {CHECKLIST.map((item) => (
              <li key={item} className="lp-price-item">
                <img src="/lp/lp-p-check.svg" alt="" width={24} height={24} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Pricing keeps the primary only (founder 2026-09-03, "enlève Book a
            demo du pricing") — the one surface without the secondary pill. */}
        <div className="lp-price-ctas">
          <LpFxLink
            href="https://app.getpancake.ai"
            size="lg"
            className="lp-price-cta"
            data-analytics-id="app_pricing_card"
          >
            Start free
          </LpFxLink>
        </div>
        <p className="lp-price-note">{TRIAL_LABEL}</p>
      </div>
      {/* Animated pancakes group: 1654×1039 canvas where the old composite img
          sat (top -0.66px, centered); the 2622×1039 container's left offset
          within it is -272px (see anim.css .lp-anim-box--pricing). */}
      {/* NOTE: no opaque backing may live in this canvas — the art overlaps
          the footer by design (arcs sweep over its black), so anything
          opaque here covers the footer's logo (learned 2026-09-01: a black
          "floor" div blanked the Pancake logo). */}
      <div className="lp-price-art" aria-hidden="true">
        <div className="lp-anim-canvas lp-anim-canvas--pricing">
          <LpPancakes variant="pricing" />
        </div>
        {/* desktop rotation on one WebGL canvas (LpRainbowGL.tsx); the DOM
            rings above stay as the static fallback */}
        <LpRainbowGL variant="pricing" />
      </div>
    </section>
  );
}
