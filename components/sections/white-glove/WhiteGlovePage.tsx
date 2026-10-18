import { LpCta } from "@/components/sections/landing-v3/LpCta";
import { LpFitVars } from "@/components/sections/landing-v3/LpFitVars";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { WHITE_GLOVE_PRICING_HREF } from "@/lib/white-glove";
import { WgMachine } from "./WgMachine";
import { WG_CTA, WG_FAQ, WG_GET, WG_HERO, WG_HOW, WG_PRICE, WG_PRICE_PANEL } from "./white-glove-copy";

/**
 * /white-glove — the White Glove offer (PAN-2368, offer confirmed October 18,
 * 2026). Sitewide chrome (LpNav, LpCta, LpFooter) around five sections:
 * the hero with the machine drawn as a pancake stack (WgMachine), what the
 * customer gets as a ruled list, who does what in a plum band, the price
 * next to self-serve, then the questions. Server-rendered; the only client
 * code is the shared pill FX and the CTA's rainbow. Styles:
 * app/white-glove/white-glove.css, scoped to .lp-wg. Copy: white-glove-copy.ts.
 */

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="m8.5 12 2.3 2.3 4.7-4.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TONES = ["engineer", "brain", "plays", "sequences", "credits", "office"] as const;

export function WhiteGlovePage({ jsonLd }: { jsonLd: string[] }) {
  return (
    // No id on main: the skip link's #main-content target is the hero, as on /pricing.
    <main className="lp lp-wg">
      {jsonLd.map((json, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
      {/* --lp-fit for the closing card's rainbow slivers */}
      <LpFitVars />
      <LpNav />

      <section id="main-content" tabIndex={-1} className="wg-hero" aria-labelledby="wg-hero-title">
        <div className="wg-wrap wg-hero__grid">
          <div className="wg-hero__copy">
            <p className="wg-badge">{WG_HERO.badge}</p>
            <h1 id="wg-hero-title" className="wg-hero__title">
              {WG_HERO.title.map((line) => (
                <span key={line}>{line} </span>
              ))}
            </h1>
            <p className="wg-hero__lede">{WG_HERO.lede}</p>
            <div className="wg-hero__actions">
              <LpFxLink href={DEMO_PAGE_PATH}>{WG_HERO.primary}</LpFxLink>
              <LpFxLink className="lp-btn--outline" href={WHITE_GLOVE_PRICING_HREF}>
                {WG_HERO.secondary}
              </LpFxLink>
            </div>
            <p className="wg-hero__price">
              <strong>{WG_HERO.price}</strong> {WG_HERO.term}
            </p>
          </div>
          <WgMachine />
        </div>
      </section>

      <section className="wg-get" aria-labelledby="wg-get-title">
        <div className="wg-wrap wg-get__grid">
          <header className="wg-head">
            <h2 id="wg-get-title" className="wg-title">{WG_GET.title}</h2>
            <p className="wg-lede">{WG_GET.lede}</p>
          </header>
          <ol className="wg-get__list">
            {WG_GET.items.map((item, i) => (
              <li key={item.title} className="wg-get__item" data-tone={TONES[i]}>
                <span className="wg-get__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="wg-get__name">{item.title}</h3>
                <p className="wg-get__body">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wg-how" aria-labelledby="wg-how-title">
        <div className="wg-wrap">
          <div className="wg-how__card">
            <header className="wg-head wg-head--inverted">
              <h2 id="wg-how-title" className="wg-title">{WG_HOW.title}</h2>
              <p className="wg-lede">{WG_HOW.lede}</p>
            </header>
            <ol className="wg-how__steps">
              {WG_HOW.steps.map((step, i) => (
                <li key={step.name} className="wg-how__step">
                  <p className="wg-how__name">
                    <span className="wg-how__dot" aria-hidden="true">{i + 1}</span>
                    {step.name}
                  </p>
                  <dl className="wg-how__roles">
                    <div>
                      <dt>{WG_HOW.us}</dt>
                      <dd>{step.us}</dd>
                    </div>
                    <div>
                      <dt>{WG_HOW.you}</dt>
                      <dd>{step.you}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="wg-price" aria-labelledby="wg-price-title">
        <div className="wg-wrap">
          <header className="wg-head wg-head--center">
            <h2 id="wg-price-title" className="wg-title">{WG_PRICE_PANEL.title}</h2>
          </header>
          <div className="wg-price__panel">
            <article className="wg-price__main" aria-labelledby="wg-price-main-title">
              <h3 id="wg-price-main-title" className="wg-price__name">{WG_PRICE_PANEL.name}</h3>
              <p className="wg-price__amount">
                <span className="lp-display">{WG_PRICE}</span>
                <span className="wg-price__period">/mo</span>
              </p>
              <p className="wg-price__caption">{WG_PRICE_PANEL.caption}</p>
              <ul className="wg-price__terms">
                {WG_PRICE_PANEL.terms.map((term) => (
                  <li key={term}>
                    <Check />
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
              <LpFxLink href={DEMO_PAGE_PATH}>{WG_PRICE_PANEL.cta}</LpFxLink>
            </article>
            <aside className="wg-price__alt" aria-labelledby="wg-price-alt-title">
              <h3 id="wg-price-alt-title" className="wg-price__name">{WG_PRICE_PANEL.alt.name}</h3>
              <p className="wg-price__alt-price">{WG_PRICE_PANEL.alt.price}</p>
              <p className="wg-price__alt-body">{WG_PRICE_PANEL.alt.body}</p>
              <a className="wg-link" href={WHITE_GLOVE_PRICING_HREF}>
                {WG_PRICE_PANEL.alt.cta}
                <span aria-hidden="true"> →</span>
              </a>
            </aside>
          </div>
        </div>
      </section>

      <section className="wg-faq" aria-labelledby="wg-faq-title">
        <div className="wg-wrap wg-faq__grid">
          <header className="wg-head">
            <h2 id="wg-faq-title" className="wg-title">{WG_FAQ.title}</h2>
          </header>
          <div className="wg-faq__list">
            {WG_FAQ.items.map((item, i) => (
              <details key={item.q} className="wg-faq__item" open={i === 0}>
                <summary>
                  <span>{item.q}</span>
                  <span className="wg-faq__icon" aria-hidden="true" />
                </summary>
                <p className="wg-faq__answer">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <LpCta
        title={WG_CTA.title}
        body={WG_CTA.body}
        note={WG_CTA.note}
        buttons={
          <>
            <LpFxLink href={DEMO_PAGE_PATH}>{WG_CTA.primary}</LpFxLink>
            <LpFxLink href={WHITE_GLOVE_PRICING_HREF} className="lp-btn--tinted lp-btn--demo">
              {WG_CTA.secondary}
            </LpFxLink>
          </>
        }
      />
      <LpFooter />
    </main>
  );
}
