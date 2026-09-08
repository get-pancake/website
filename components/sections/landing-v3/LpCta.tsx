import { LpFxLink, LpFxPill } from "@/components/sections/landing-v3/LpFxButton";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";

/**
 * Landing v3 — Section 7: CTA "Try Pancake now" (Figma node 4389:4492).
 * Cream 1296px card with two animated rainbow slivers hugging the card edges
 * behind a centered 464px text column. Each sliver div sits exactly where the
 * old pre-clipped composite <img> did (left 560×432 @ card x0 / right 529×432
 * @ right:0 == x767 at the 1296 width); inside, the 1478×2622 rotated group
 * container sits at the group's card offset: right (0, -1019), left
 * (-918, -1019) — sliver-relative. The card's overflow clip crops the rest.
 */
export function LpCta() {
  return (
    <section className="lp-cta">
      <div className="lp-cta__card">
        <div aria-hidden="true" className="lp-cta__art lp-cta__art--left">
          <div className="lp-anim-canvas lp-anim-canvas--cta-left">
            <LpPancakes variant="ctaLeft" />
          </div>
          {/* desktop rotation on one WebGL canvas per sliver (LpRainbowGL) */}
          <LpRainbowGL variant="ctaLeft" />
        </div>
        <div aria-hidden="true" className="lp-cta__art lp-cta__art--right">
          <div className="lp-anim-canvas lp-anim-canvas--cta-right">
            <LpPancakes variant="ctaRight" />
          </div>
          <LpRainbowGL variant="ctaRight" />
        </div>
        <div className="lp-cta__content">
          <div className="lp-cta__text">
            <h2 className="lp-title-card lp-cta__title">Try Pancake now</h2>
            <p className="lp-cta__body">
              Pancake can’t overspend.
              <br />
              Every lead arrives with its conversation attached.
            </p>
          </div>
          <div className="lp-cta__btns">
            {/* Primary first, secondary second — the hero's order on every
                surface (founder 2026-09-03). */}
            <LpFxLink href="https://app.getpancake.ai" data-analytics-id="app_final">
              Start free
            </LpFxLink>
            {/* opens the Calendly booking sheet (LpModals) via the data-lv2-open
                contract; scheduler analytics fire in the modal off call_final.
                Tinted skin — same as the hero's Book a demo (founder
                2026-09-01: "bouton book a call différent que dans hero");
                the outline variant is retired here. */}
            <LpFxPill
              className="lp-btn--tinted lp-btn--demo"
              data-lv2-open="call"
              data-analytics-id="call_final"
            >
              Book a demo
            </LpFxPill>
          </div>
        </div>
      </div>
    </section>
  );
}
