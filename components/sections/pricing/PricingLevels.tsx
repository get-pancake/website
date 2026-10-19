"use client";

import { usePricingLevel } from "./PricingLevel";
import { pricingLevels as c, pricingV2 } from "@/lib/copy";
import { CREDIT_LEVELS, formatCredits, formatDollars, leadsEstimateLabel } from "@/lib/pricing";

/**
 * /pricing — "More credits, more leads.": the five levels side by side, each
 * by what it gets you (an estimate of leads a month), its credits and its
 * price. The picker in the Self-serve slip shows one level at a time; this
 * shows them all, with the level picked there marked (the same shared state,
 * PricingLevel.tsx; the first level in the server HTML). A table (it is one),
 * restyled as rows; stacked on a phone (app/pricing/pricing.css).
 * Copy: `pricingLevels` in lib/copy.ts. Numbers: lib/pricing.ts.
 */
export function PricingLevels() {
  const { level: picked } = usePricingLevel();
  return (
    <section className="lv2s lv2s--surface lv2-levels" aria-labelledby="lv2-levels-title">
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
              {/* the saving has a column of its own, so the badges line up
                  whatever the width of the price before them */}
              <th scope="col">
                <span className="lp-sr-only">{c.columns.saving}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {CREDIT_LEVELS.map((level) => (
              <tr key={level.key} data-picked={level.key === picked ? "" : undefined}>
                <th scope="row" className="lv2-levels-leads">
                  {c.leads(leadsEstimateLabel(level.credits))}
                  {level.key === picked ? <span className="lp-sr-only"> (the level picked above)</span> : null}
                </th>
                <td className="lv2-levels-credits">{formatCredits(level.credits)}</td>
                <td className="lv2-levels-price">
                  <strong>{formatDollars(level.dollars)}</strong> {c.perMonth}
                </td>
                <td className="lv2-levels-save">
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
