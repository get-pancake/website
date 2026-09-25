import Link from "next/link";

import { PancakeStack } from "@/components/sections/pricing/PancakeStack";
import { pricingV2 } from "@/lib/copy";

import { FxPillLink } from "./FxPill";
import { PriceGroups } from "./PriceGroups";
import { APP_ORIGIN } from "@/lib/site-config.mjs";

/**
 * Pricing — one flat number, Okara-simple (founder call 2026-08-06: $99/month
 * flat, no tokens, no tiers — that model was Pancake V1). One card: price,
 * feature list, app CTA. Figures come from `pricingV2` in lib/copy.ts.
 */
export function LandingPricing() {
  return (
    <section
      className="lv2s lv2s--brand lv2-pricing"
      id="pricing"
      aria-labelledby="lv2-pricing-title"
    >
      <div className="lv2-container">
        <header className="lv2-section-header">
          <h2 id="lv2-pricing-title" className="lv2-section-title">
            {pricingV2.title}
          </h2>
        </header>

        <div className="lv2-price-fold">
          <div className="lv2-price-card">
            <p className="lv2-price-figure">
              <span className="lv2-price-amount">
                {pricingV2.currencySymbol}
                {pricingV2.monthlyDollars}
              </span>
              <span className="lv2-price-cycle">{pricingV2.perMonth}</span>
            </p>
            <p className="lv2-price-sub">{pricingV2.access}</p>
            <PriceGroups />
            <div className="lv2-button-group">
              <FxPillLink href={APP_ORIGIN} data-analytics-id="app_pricing_card">
                Get started
              </FxPillLink>
              <Link href="/pricing" className="lv2-price-link">
                See full pricing
              </Link>
            </div>
            <p className="lv2-price-fine">{pricingV2.fine}</p>
          </div>
          <div className="lv2-price-decor" aria-hidden="true">
            <PancakeStack count={3} />
          </div>
        </div>
      </div>
    </section>
  );
}
