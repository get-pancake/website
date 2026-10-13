import { SUPPORT_PATH } from "@/lib/contact";
import { pricingFaq } from "@/lib/copy";

/**
 * /pricing — "Billing questions.": the heading and the way to support on the
 * left, the questions on the right as native <details> (one open at a time
 * where the browser supports `name`; the first is open on load). Every answer
 * is in the HTML whether open or not, and the same answers ship in the page's
 * FAQPage JSON-LD. One column below 1024px (app/pricing/pricing.css).
 * Server-rendered, zero JS. Copy and fact sources: `pricingFaq` in
 * lib/copy.ts.
 */
export function BillingFaq() {
  return (
    <section className="lv2s lv2-billing" aria-labelledby="lv2-billing-title">
      <div className="lv2-container lv2-billing-grid">
        <header className="lv2-section-header">
          <h2 id="lv2-billing-title" className="lv2-section-title">
            {pricingFaq.title}
          </h2>
          <p className="lv2-section-lede">{pricingFaq.lede}</p>
          <p className="lv2-billing-more">
            {pricingFaq.more.text} <a href={SUPPORT_PATH}>{pricingFaq.more.cta}</a>
          </p>
        </header>
        <div className="lv2-faq">
          {pricingFaq.items.map((item, i) => (
            <details key={item.q} className="lv2-faq-item" name="pricing-faq" open={i === 0}>
              <summary>
                <span>{item.q}</span>
                <span className="lv2-faq-icon" aria-hidden="true" />
              </summary>
              <p className="lv2-faq-answer">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
