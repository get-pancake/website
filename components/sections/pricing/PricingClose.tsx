import { COMPARE_PATH } from "@/components/sections/compare/compare-data";
import { FxPillLink } from "@/components/sections/landing/FxPill";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { pricingClose as c } from "@/lib/copy";
import { APP_ORIGIN } from "@/lib/site-config.mjs";

/**
 * /pricing — the closing band: the trial as what it is, the page's two CTAs
 * again (same analytics ids as the card: one page, one pair), and the way to
 * the comparison pages. The page used to end on its last answer.
 * Copy: `pricingClose` in lib/copy.ts.
 */
export function PricingClose() {
  return (
    <section className="lv2s lv2s--brand lv2-close" aria-labelledby="lv2-close-title">
      <div className="lv2-container lv2-close-row">
        <div className="lv2-close-copy">
          <h2 id="lv2-close-title" className="lv2-section-title">
            {c.title}
          </h2>
          <p className="lv2-section-lede">{c.body}</p>
        </div>
        <div className="lv2-close-actions">
          <div className="lv2-button-group">
            <FxPillLink href={APP_ORIGIN} data-analytics-id="app_pricing_page">
              Start free
            </FxPillLink>
            <FxPillLink variant="outline" href={DEMO_PAGE_PATH} data-analytics-id="call_pricing_page">
              Book a demo
            </FxPillLink>
          </div>
          <p className="lv2-close-more">
            <a href={COMPARE_PATH}>
              {c.compare}
              <span aria-hidden="true"> →</span>
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
