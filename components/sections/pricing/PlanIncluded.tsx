import { pricingV2 } from "@/lib/copy";

/**
 * /pricing — "Everything in the $99.": what the plan includes beyond the
 * card's outcome lines, as the card's check-mark list in two columns
 * (app/pricing/pricing.css). Server-rendered, zero JS.
 * Copy and fact sources: `pricingV2.included` in lib/copy.ts.
 */
export function PlanIncluded() {
  const { title, items } = pricingV2.included;
  return (
    <section className="lv2s lv2s--surface lv2-included" aria-labelledby="lv2-included-title">
      <div className="lv2-container">
        <header className="lv2-section-header">
          <h2 id="lv2-included-title" className="lv2-section-title">
            {title}
          </h2>
        </header>
        <ul className="lv2-price-value-list lv2-included-list">
          {items.map((item) => (
            <li key={item}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path
                  d="M3 8.5 6.5 12 13 4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
