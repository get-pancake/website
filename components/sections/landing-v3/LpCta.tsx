import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { APP_ORIGIN } from "@/lib/site-config.mjs";

/**
 * Landing v3 — Section 7: CTA "Try Pancake now" (Figma node 4389:4492).
 * Cream 1296px card with two animated rainbow slivers hugging the card edges
 * behind a centered 464px text column. Each sliver div sits exactly where the
 * old pre-clipped composite <img> did (left 560×432 @ card x0 / right 529×432
 * @ right:0 == x767 at the 1296 width); inside, the 1478×2622 rotated group
 * container sits at the group's card offset: right (0, -1019), left
 * (-918, -1019) — sliver-relative. The card's overflow clip crops the rest.
 *
 * Optional `title` / `body` (the /for pages, spec §2.9): omitted, the card
 * renders the homepage copy below, byte for byte. A vertical passes its own
 * one-line title (≤464px at 48px) and two body lines.
 */
const CTA_TITLE = "Try Pancake now";
/* "Pancake can’t overspend." retired (founder 2026-09-19): the plan is flat,
   so the cost-certainty line says that instead. */
const CTA_BODY: readonly [string, string] = [
  "$99 a month, flat.",
  "Every lead arrives with its conversation attached.",
];

export function LpCta({
  title = CTA_TITLE,
  body = CTA_BODY,
}: {
  title?: string;
  body?: readonly [string, string];
} = {}) {
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
            <h2 className="lp-title-card lp-cta__title">{title}</h2>
            <p className="lp-cta__body">
              {body[0]}
              <br />
              {body[1]}
            </p>
          </div>
          <div className="lp-cta__btns">
            {/* Primary first, secondary second — the hero's order on every
                surface (founder 2026-09-03). */}
            <LpFxLink href={APP_ORIGIN} data-analytics-id="app_final">
              Start free
            </LpFxLink>
            {/* A same-tab link to /demo (François, 2026-09-16; it opened the
                Calendly sheet before), keeping the call_final id.
                Tinted skin — same as the hero's Book a demo (founder
                2026-09-01: "bouton book a call différent que dans hero");
                the outline variant is retired here. */}
            <LpFxLink
              href={DEMO_PAGE_PATH}
              className="lp-btn--tinted lp-btn--demo"
              data-analytics-id="call_final"
            >
              Book a demo
            </LpFxLink>
          </div>
        </div>
      </div>
    </section>
  );
}
