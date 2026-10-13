import { SUPPORT_PATH } from "@/lib/contact";
import { pricingFaq } from "@/lib/copy";

/**
 * /pricing — "Billing questions.": the heading and the way to support on one
 * line, then the questions as native <details> in two columns across the
 * container (the first is open on load). Every answer is in the HTML whether
 * open or not, and the same answers ship in the page's FAQPage JSON-LD. One
 * column below 900px (app/pricing/pricing.css). Server-rendered, zero JS.
 * Copy and fact sources: `pricingFaq` in lib/copy.ts.
 */
export function BillingFaq() {
  const half = Math.ceil(pricingFaq.items.length / 2);
  const columns = [pricingFaq.items.slice(0, half), pricingFaq.items.slice(half)];
  return (
    <section className="lv2s lv2-billing" aria-labelledby="lv2-billing-title">
      <div className="lv2-container">
        <header className="lv2-billing-head">
          <h2 id="lv2-billing-title" className="lv2-section-title">
            {pricingFaq.title}
          </h2>
          <p className="lv2-billing-more">
            {pricingFaq.more.text} <a href={SUPPORT_PATH}>{pricingFaq.more.cta}</a>
          </p>
        </header>
        <div className="lv2-faq">
          {columns.map((items, col) => (
            <div key={col} className="lv2-faq-col">
              {items.map((item, i) => (
                <details key={item.q} className="lv2-faq-item" open={col === 0 && i === 0}>
                  <summary>
                    <span>{item.q}</span>
                    <span className="lv2-faq-icon" aria-hidden="true" />
                  </summary>
                  <p className="lv2-faq-answer">{item.a}</p>
                </details>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
