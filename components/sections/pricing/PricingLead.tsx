import { pricingLead as c } from "@/lib/copy";

/**
 * /pricing — "Not names. Buyers with a reason to talk.": what one lead is,
 * right under the plan, so the price is read against a researched buyer and
 * not a line in a list. The four things every lead comes with on the left;
 * on the right an example lead as the customer receives it (who, the signal,
 * why they fit, the message written for them). Stacked below 1024px
 * (app/pricing/pricing.css). Server-rendered, zero JS.
 * Copy and fact sources: `pricingLead` in lib/copy.ts.
 */
export function PricingLead() {
  const e = c.example;
  return (
    <section className="lv2s lv2s--surface lv2-lead" aria-labelledby="lv2-lead-title">
      <div className="lv2-container">
        <header className="lv2-section-header">
          <h2 id="lv2-lead-title" className="lv2-section-title">
            {c.title}
          </h2>
          <p className="lv2-section-lede">{c.lede}</p>
        </header>

        <div className="lv2-lead-grid">
          <ol className="lv2-lead-points">
            {c.points.map((point, i) => (
              <li key={point.title} className="lv2-lead-point">
                <span className="lv2-lead-point-num" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3 className="lv2-lead-point-title">{point.title}</h3>
                  <p className="lv2-lead-point-body">{point.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <figure className="lv2-lead-card">
            <figcaption className="lv2-lead-card-kicker">{e.kicker}</figcaption>
            <div className="lv2-lead-who">
              <span className="lv2-lead-avatar" aria-hidden="true">
                {e.initials}
              </span>
              <div>
                <p className="lv2-lead-name">{e.name}</p>
                <p className="lv2-lead-role">{e.role}</p>
              </div>
              <span className="badge lv2-lead-signal" data-variant="brand-alt-2">
                {e.signal}
              </span>
            </div>
            <div className="lv2-lead-block">
              <p className="lv2-lead-label">{e.whyLabel}</p>
              <p className="lv2-lead-text">{e.why}</p>
            </div>
            <div className="lv2-lead-block lv2-lead-block--message">
              <p className="lv2-lead-label">{e.messageLabel}</p>
              <p className="lv2-lead-text">{e.message}</p>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
