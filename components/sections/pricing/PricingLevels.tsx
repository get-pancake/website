import { pricingLevels as c, pricingV2 } from "@/lib/copy";
import { CREDIT_LEVELS, formatCredits, formatDollars, leadsEstimateLabel } from "@/lib/pricing";

/**
 * /pricing — "More credits, more leads.": the five levels side by side, each
 * by what it gets you (an estimate of leads a month), its credits and its
 * price. The picker in the plan card shows one level at a time; this shows
 * them all. A table (it is one), restyled as rows; stacked on a phone
 * (app/pricing/pricing.css). Server-rendered, zero JS.
 * Copy: `pricingLevels` in lib/copy.ts. Numbers: lib/pricing.ts.
 */
export function PricingLevels() {
  return (
    <section className="lv2s lv2-levels" aria-labelledby="lv2-levels-title">
      <div className="lv2-container">
        <header className="lv2-section-header">
          <h2 id="lv2-levels-title" className="lv2-section-title">
            {c.title}
          </h2>
          <p className="lv2-section-lede">{c.lede}</p>
        </header>
        <table className="lv2-levels-table">
          <thead>
            <tr>
              <th scope="col">{c.columns.leads}</th>
              <th scope="col">{c.columns.credits}</th>
              <th scope="col">{c.columns.price}</th>
            </tr>
          </thead>
          <tbody>
            {CREDIT_LEVELS.map((level) => (
              <tr key={level.key}>
                <th scope="row" className="lv2-levels-leads">
                  {c.leads(leadsEstimateLabel(level.credits))}
                </th>
                <td className="lv2-levels-credits">{formatCredits(level.credits)}</td>
                <td className="lv2-levels-price">
                  <span>
                    <strong>{formatDollars(level.dollars)}</strong> {c.perMonth}
                  </span>
                  {level.savePercent > 0 ? (
                    <span className="badge" data-variant="success">
                      {pricingV2.save(level.savePercent)}
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="lv2-levels-note">{c.note}</p>
      </div>
    </section>
  );
}
