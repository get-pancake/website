import type { CSSProperties } from "react";

import { pricingProof as p } from "@/lib/copy";

/**
 * /pricing — "Take it from them": what customers got, right under the plan.
 * Four cards of equal height: two figures (a number, what it counts) and two
 * sentences, each signed and carrying the customer's wordmark (the marquee's
 * file, painted as a mask in the card's ink). Four columns from 1100px, two
 * from 640px (app/pricing/pricing.css). Server-rendered, zero JS.
 * Content and sources: `pricingProof` in lib/copy.ts.
 */
export function PricingProof() {
  return (
    <section className="lv2s lv2-proof" aria-labelledby="lv2-proof-title">
      <div className="lv2-container">
        <header className="lv2-section-header">
          <h2 id="lv2-proof-title" className="lv2-section-title">
            {p.title}
          </h2>
        </header>
        <ul className="lv2-proof-list">
          {p.items.map((item) => (
            <li key={item.company} className="lv2-proof-card">
              {"figure" in item ? (
                <p className="lv2-proof-result">
                  <strong className="lv2-proof-figure">{item.figure}</strong>
                  <span className="lv2-proof-label">{item.label}</span>
                </p>
              ) : (
                <blockquote className="lv2-proof-quote">
                  <p>“{item.quote}”</p>
                </blockquote>
              )}
              <div className="lv2-proof-by">
                <span
                  className="lv2-proof-logo"
                  role="img"
                  aria-label={item.company}
                  style={
                    {
                      "--proof-logo": `url(/logos/customers/${item.logo.file})`,
                      aspectRatio: String(item.logo.ratio),
                    } as CSSProperties
                  }
                />
                <span className="lv2-proof-who">{item.who}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
