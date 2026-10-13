import { pricingCredits as c } from "@/lib/copy";

/**
 * /pricing — "Credits find your leads. Everything else is included.": the
 * heading on the left, a price list on the right in two groups, each row a
 * name, one line and what it costs ("Estimate first", "50 credits", "Free").
 * It replaced "Everything in the $99." (PlanIncluded.tsx) with the credit
 * plan, 2026-10-13. One column below 1024px (app/pricing/pricing.css).
 * Server-rendered, zero JS. Copy and fact sources: `pricingCredits` in
 * lib/copy.ts.
 */
export function CreditsExplained() {
  return (
    <section className="lv2s lv2s--surface lv2-credits" aria-labelledby="lv2-credits-title">
      <div className="lv2-container lv2-credits-grid">
        <header className="lv2-section-header">
          <h2 id="lv2-credits-title" className="lv2-section-title">
            {c.title}
          </h2>
          <p className="lv2-section-lede">{c.lede}</p>
        </header>

        <div className="lv2-credits-panel">
          <div className="lv2-credits-group">
            <h3 className="lv2-credits-label">
              <span className="badge" data-variant="brand">
                {c.uses.label}
              </span>
            </h3>
            <ul className="lv2-credits-rows">
              {c.uses.rows.map((row) => (
                <li key={row.name} className="lv2-credits-row">
                  <div>
                    <p className="lv2-credits-row-name">{row.name}</p>
                    <p className="lv2-credits-row-body">{row.body}</p>
                  </div>
                  <p className="lv2-credits-row-cost">{row.cost}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="lv2-credits-group">
            <h3 className="lv2-credits-label">
              <span className="badge" data-variant="success">
                {c.included.label}
              </span>
            </h3>
            <ul className="lv2-credits-rows">
              {c.included.items.map((item) => (
                <li key={item} className="lv2-credits-row">
                  <p className="lv2-credits-row-name">{item}</p>
                  <p className="lv2-credits-row-cost" data-free="">
                    {c.included.cost}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
