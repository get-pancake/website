import { pricingCredits as c } from "@/lib/copy";

/**
 * /pricing — "Credits find your leads. Everything else is included.": the two
 * things a credit buys as two cards (name, what it costs, one line each),
 * then "What never uses a credit" as the plan card's check-mark list in two
 * columns
 * (app/pricing/pricing.css). It replaced "Everything in the $99."
 * (PlanIncluded.tsx) with the credit plan, 2026-10-13. Server-rendered, zero
 * JS. Copy and fact sources: `pricingCredits` in lib/copy.ts.
 */
export function CreditsExplained() {
  return (
    <section className="lv2s lv2s--surface lv2-credits" aria-labelledby="lv2-credits-title">
      <div className="lv2-container">
        <header className="lv2-section-header">
          <h2 id="lv2-credits-title" className="lv2-section-title">
            {c.title}
          </h2>
          <p className="lv2-section-lede">{c.lede}</p>
        </header>

        <ul className="lv2-credits-uses">
          {c.uses.map((use) => (
            <li key={use.name} className="lv2-credits-use">
              <h3 className="lv2-credits-use-name">{use.name}</h3>
              <p className="lv2-credits-use-cost">{use.cost}</p>
              <p className="lv2-credits-use-body">{use.body}</p>
            </li>
          ))}
        </ul>

        <h3 className="lv2-credits-included-title">{c.included.title}</h3>
        <ul className="lv2-price-value-list lv2-included-list">
          {c.included.items.map((item) => (
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
