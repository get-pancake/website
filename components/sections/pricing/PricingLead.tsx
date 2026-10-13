import { pricingLead as c } from "@/lib/copy";

/**
 * /pricing — "Leads matched to your business, not to a filter.": what goes
 * into one lead, right under the plan, so the price is read against a
 * researched buyer and not a line in a list. On the left the four things
 * that work on every lead (the GTM Brain, the data providers, the signals,
 * the outreach); on the right an example lead as the customer receives it:
 * who, the signals found and the provider behind each, the Brain's context,
 * the message. Stacked below 1024px (app/pricing/pricing.css).
 * Server-rendered, zero JS. Copy and fact sources: `pricingLead` in
 * lib/copy.ts.
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
          <ul className="lv2-lead-points">
            {c.points.map((point) => (
              <li key={point.title} className="lv2-lead-point">
                <h3 className="lv2-lead-point-title">{point.title}</h3>
                <p className="lv2-lead-point-body">{point.body}</p>
              </li>
            ))}
          </ul>

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
            </div>
            <div className="lv2-lead-block">
              <p className="lv2-lead-label">{e.signalsLabel}</p>
              <ul className="lv2-lead-signals">
                {e.signals.map((signal) => (
                  <li key={signal.text}>
                    <span>{signal.text}</span>
                    <span className="badge">{signal.source}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lv2-lead-block">
              <p className="lv2-lead-label">{e.brainLabel}</p>
              <p className="lv2-lead-text">{e.brain}</p>
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
