import type { CSSProperties } from "react";

import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { WHITE_GLOVE_PRICING_HREF } from "@/lib/white-glove";
import { WG_PRICE, WGC_HERO as h, WGC_SENTENCE, WGC_TICKET as t } from "./white-glove-copy";

/**
 * PREVIEW ONLY — the three hero options of /white-glove-concepts (founder
 * review after PR347). Delete this file with that route once one is chosen.
 *
 * All three share the founder's H1 set in the homepage H1 recipe (Aeonik
 * Condensed Pro 600, 69.014px from 1201px wide, clamp(52px, 5.4vw, 69.014px)
 * below, the 35.559px mobile title token on phones, -0.03em, line-height
 * normal), the homepage lede (Geist Sans 16/1.5 in plum) and the homepage
 * hero's pill pair. None draws a diagram: the offer is the four items, Custom
 * GTM Brain first. Styles: app/white-glove-concepts/concepts.css.
 */

export const CONCEPTS = [
  { key: "a", label: "A", name: "Order ticket" },
  { key: "b", label: "B", name: "Plum poster" },
  { key: "c", label: "C", name: "Type index" },
] as const;
export type ConceptKey = (typeof CONCEPTS)[number]["key"];

function Title() {
  return (
    <h1 id="wgc-hero-title" className="lp-display wgc-title">
      <span>{h.lines[0]}</span> <span>{h.lines[1]}</span>
    </h1>
  );
}

/** The homepage hero pair: dark primary, tinted secondary (B swaps both for its plum ground). */
function Actions({ onPlum = false }: { onPlum?: boolean }) {
  return (
    <div className="wgc-actions">
      <LpFxLink href={DEMO_PAGE_PATH} className={onPlum ? "lp-btn--tinted" : undefined}>
        {h.primary}
      </LpFxLink>
      <LpFxLink
        href={WHITE_GLOVE_PRICING_HREF}
        className={onPlum ? "lp-btn--outline wgc-btn--on-plum" : "lp-btn--tinted lp-btn--demo"}
      >
        {h.secondary}
      </LpFxLink>
    </div>
  );
}

function Terms() {
  return (
    <p className="wgc-terms">
      <strong>{h.price}</strong> {h.term}
    </p>
  );
}

/** A — the offer as a diner order ticket: four lines, dotted leaders, the total. */
function ConceptA() {
  return (
    <section id="main-content" tabIndex={-1} className="wgc-hero wgc-a" aria-labelledby="wgc-hero-title">
      <div className="wg-wrap wgc-a__grid">
        <div className="wgc-copy">
          <Title />
          <p className="wgc-lede">{h.lede}</p>
          <Actions />
        </div>
        <div className="wgc-ticket">
          <div className="wgc-ticket__paper" role="group" aria-labelledby="wgc-ticket-head">
            <p className="wgc-ticket__head">
              <span id="wgc-ticket-head">{t.head}</span>
              <span>{t.tag}</span>
            </p>
            <ul className="wgc-ticket__items">
              {t.items.map((item) => (
                <li key={item.key} className="wgc-ticket__item" data-tone={item.key}>
                  <span className="wgc-ticket__name">{item.name}</span>
                  <span className="wgc-ticket__lead" aria-hidden="true" />
                  <span className="wgc-ticket__value">{item.value}</span>
                  <span className="wgc-ticket__detail">{item.detail}</span>
                </li>
              ))}
            </ul>
            <p className="wgc-ticket__total">
              <span className="wgc-ticket__total-label">{t.total}</span>
              <span className="wgc-ticket__amount">
                {WG_PRICE}
                <span className="wgc-ticket__per">/month</span>
              </span>
            </p>
            <p className="wgc-ticket__foot">{h.term}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** B — one plum poster card: the H1, then the offer as one sentence with its four terms marked. */
function ConceptB() {
  return (
    <section id="main-content" tabIndex={-1} className="wgc-hero wgc-b" aria-labelledby="wgc-hero-title">
      <div className="wgc-b__card">
        <Title />
        <p className="wgc-b__sentence">
          {WGC_SENTENCE.map((part, i) =>
            "mark" in part ? (
              <mark key={i} className="wgc-mark" data-tone={part.mark}>
                {part.text}
              </mark>
            ) : (
              <span key={i}>{part.text}</span>
            ),
          )}
        </p>
        <div className="wgc-b__foot">
          <Actions onPlum />
          <Terms />
        </div>
      </div>
    </section>
  );
}

/** C — the homepage hero's composition (H1 left, lede and pills right), then the offer as a type index. */
function ConceptC() {
  return (
    <section id="main-content" tabIndex={-1} className="wgc-hero wgc-c" aria-labelledby="wgc-hero-title">
      <div className="wg-wrap">
        <div className="wgc-c__top">
          <Title />
          <div className="wgc-copy wgc-c__aside">
            <p className="wgc-lede">{h.lede}</p>
            <Actions />
            <Terms />
          </div>
        </div>
        <ol className="wgc-index">
          {h.offer.map((item, i) => (
            <li key={item.key} className="wgc-index__row" data-tone={item.key} style={{ "--wgc-i": i } as CSSProperties}>
              <span className="wgc-index__num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="wgc-index__term">
                <span className="wgc-index__q">{item.qualifier}</span>{" "}
                <span className="wgc-index__word">{item.name}</span>
              </p>
              <p className="wgc-index__detail">{item.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function WgConceptHero({ concept }: { concept: ConceptKey }) {
  if (concept === "b") return <ConceptB />;
  if (concept === "c") return <ConceptC />;
  return <ConceptA />;
}

/** The reviewer's switcher: fixed at the foot of the screen, one link per option. */
export function WgConceptSwitch({ concept }: { concept: ConceptKey }) {
  return (
    <nav className="wgc-switch" aria-label="Hero options (preview)">
      <span className="wgc-switch__label">Preview · hero option</span>
      <ul>
        {CONCEPTS.map((c) => (
          <li key={c.key}>
            <a href={`?option=${c.key}`} aria-current={c.key === concept ? "page" : undefined}>
              <span className="wgc-switch__key">{c.label}</span>
              <span className="wgc-switch__name"> {c.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
