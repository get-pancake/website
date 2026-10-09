import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";
import { APP_ORIGIN } from "@/lib/site-config.mjs";
import { TRIAL_LABEL } from "@/lib/trial";

/**
 * Landing v3 — Pricing (Figma node 4257:5083, 1654×890, bg #000).
 * The grouped rainbow art (lp-pancakes-pricing.svg, 1654×1039) paints the cream
 * top area + wave over the black section; its 148px spill below the section is
 * black-on-black against the footer, so the section clips it safely.
 */

/* Six lines, so the layout holds. AI SEO retired 2026-09-30 (pancake-cmo PR
   #1037): the articles and Google/ChatGPT lines became Plays + messages, and
   the control line names leads only (message review is optional, so never
   "approvals on messages"). No spend cap (founder 2026-09-19): flat plan,
   nothing to cap. The customers line states what Pancake is built for, not
   a promise (founder 2026-10-04: prospects kept asking how we can guarantee
   customers; the Terms promise no results). No lead count (founder
   2026-10-05: "now that there are Plays you can have as many leads as you
   want"): a Play search keeps up to 50 leads, Plays are unlimited, and
   credits run in shadow mode, so nothing caps them. Revisit if credit
   enforcement ships (pancake-cmo PR #1220). The scheduled runs are why new
   leads keep coming. Same lines in pricingV2.value (lib/copy.ts), the /for
   checklist, the app's checkout card and the Brain page. */
const CHECKLIST = [
  "Everything included.",
  "As many Plays and leads as you want.",
  "Warm leads that keep coming.",
  // \u00a0 keeps "customers a month." together when a narrow phone wraps it.
  "Built to land 2 to 3 customers\u00a0a\u00a0month.",
  "A personal message for each lead.",
  "You approve every lead.",
];

/**
 * Optional `checklist` (the /for pages, spec §2.10): omitted, the homepage
 * CHECKLIST above renders unchanged.
 */
export function LpPricing({ checklist = CHECKLIST }: { checklist?: readonly string[] } = {}) {
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
            {checklist.map((item) => (
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
            href={APP_ORIGIN}
            size="lg"
            className="lp-price-cta"
            data-analytics-id="app_pricing_card"
          >
            Start free
          </LpFxLink>
        </div>
        <p className="lp-price-note">{TRIAL_LABEL}</p>
        {/* The route to /pricing (2026-10-07: the homepage linked it from the
            footer only). A text link, not a pill, so Start free stays this
            card's one CTA. */}
        <p className="lp-price-more">
          <a className="lp-textlink" href="/pricing">
            See what one plan covers<span aria-hidden="true"> →</span>
          </a>
        </p>
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
