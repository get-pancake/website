import { pricingFaq } from "@/lib/copy";

/**
 * /pricing — "Billing questions.": trial, cancelling, codes, lead limits and
 * agent use, in PlanMap's answer markup (dl.lv2-plan-faq), two columns from
 * 1024px (app/pricing/pricing.css). The same answers ship in the page's
 * FAQPage JSON-LD. Server-rendered, zero JS.
 * Copy and fact sources: `pricingFaq` in lib/copy.ts.
 */
export function BillingFaq() {
  return (
    <section className="lv2s lv2-billing" aria-labelledby="lv2-billing-title">
      <div className="lv2-container">
        <header className="lv2-section-header">
          <h2 id="lv2-billing-title" className="lv2-section-title">
            {pricingFaq.title}
          </h2>
        </header>
        <dl className="lv2-plan-faq lv2-billing-faq">
          {pricingFaq.items.map((item) => (
            <div key={item.q} className="lv2-plan-faq-item">
              <dt>{item.q}</dt>
              <dd>{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
