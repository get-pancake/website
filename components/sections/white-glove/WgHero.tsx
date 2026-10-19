import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { WHITE_GLOVE_PRICING_HREF } from "@/lib/white-glove";
import { WG_HERO as h, WG_PRICE, WG_TICKET as t } from "./white-glove-copy";

/**
 * The /white-glove hero, chosen by François on October 18, 2026: the H1, the
 * lede and the homepage hero's pill pair on the left; on the right the offer
 * as an order ticket (four lines with dotted leaders, the monthly total, the
 * term). Real text, no diagram. Type is the live homepage's: the H1 is the
 * homepage H1 recipe, the total is the homepage price figure's face. Styles:
 * app/white-glove/white-glove.css (".wg-hero", ".wg-ticket").
 */
export function WgHero() {
  return (
    <section id="main-content" tabIndex={-1} className="wg-hero" aria-labelledby="wg-hero-title">
      <div className="wg-wrap wg-hero__grid">
        <div className="wg-hero__copy">
          <h1 id="wg-hero-title" className="lp-display wg-hero__title">
            <span>{h.lines[0]}</span> <span>{h.lines[1]}</span>
          </h1>
          <p className="wg-hero__lede">{h.lede}</p>
          <div className="wg-hero__actions">
            <LpFxLink href={DEMO_PAGE_PATH}>{h.primary}</LpFxLink>
            <LpFxLink href={WHITE_GLOVE_PRICING_HREF} className="lp-btn--tinted lp-btn--demo">
              {h.secondary}
            </LpFxLink>
          </div>
        </div>
        <div className="wg-ticket">
          <div className="wg-ticket__paper" role="group" aria-labelledby="wg-ticket-head">
            <p className="wg-ticket__head">
              <span id="wg-ticket-head">{t.head}</span>
              <span>{t.tag}</span>
            </p>
            <ul className="wg-ticket__items">
              {t.items.map((item) => (
                <li key={item.key} className="wg-ticket__item" data-tone={item.key}>
                  <span className="wg-ticket__name">{item.name}</span>
                  <span className="wg-ticket__lead" aria-hidden="true" />
                  <span className="wg-ticket__value">{item.value}</span>
                  <span className="wg-ticket__detail">{item.detail}</span>
                </li>
              ))}
            </ul>
            <p className="wg-ticket__total">
              <span className="wg-ticket__total-label">{t.total}</span>
              <span className="wg-ticket__amount">
                {WG_PRICE}
                <span className="wg-ticket__per">{t.per}</span>
              </span>
            </p>
            <p className="wg-ticket__foot">{h.term}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
