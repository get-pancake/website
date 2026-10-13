import { pricingFacts as f } from "@/lib/copy";

/**
 * /pricing — "No surprise bills.": the four facts that make the credit plan a
 * fair deal (the estimate first, rollover, the pause at zero, the saving at
 * higher levels), then one customer line. Four columns from 1024px, two from
 * 640px (app/pricing/pricing.css). Server-rendered, zero JS.
 * Copy and fact sources: `pricingFacts` in lib/copy.ts.
 */
export function PricingFacts() {
  return (
    <section className="lv2s lv2s--surface lv2-facts" aria-labelledby="lv2-facts-title">
      <div className="lv2-container">
        <header className="lv2-section-header">
          <h2 id="lv2-facts-title" className="lv2-section-title">
            {f.title}
          </h2>
        </header>
        <ul className="lv2-facts-list">
          {f.items.map((item) => (
            <li key={item.title} className="lv2-facts-item">
              <h3 className="lv2-facts-item-title">{item.title}</h3>
              <p className="lv2-facts-item-body">{item.body}</p>
            </li>
          ))}
        </ul>
        <figure className="lv2-facts-quote">
          <blockquote>
            <p>“{f.quote.text}”</p>
          </blockquote>
          <figcaption>
            {f.quote.name}, {f.quote.role}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
