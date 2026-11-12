import { LpDive } from "./LpDive";
import { DbTable } from "./LpVisionDb";
import { VISION_FEATURES, VISION_WAREHOUSE } from "./lp-vision-data";
import type { DiveItem } from "./lp-dive-data";
import { DB_WAREHOUSE } from "./lp-vision-tables";

/**
 * The vision homepage's own sections (2026-11-09; in the designer's forms since 2026-11-11, when
 * the founder asked for the current page's graphic pieces back; recomposed the same day after the
 * landing page meeting). The page (app/page.tsx) is:
 *   LpHero             the designer's hero, with the vision's headline and lede
 *   LpVisionCurtain    the window under it: Claude's window, Pancake's table, a curtain between
 *   LpMarquee          the customers, on cream
 *   LpVisionSteps      the statement and the 1-2-3, on the designer's step cards (its own file)
 *   LpBanner           the bottle, with the page's two lines; it opens the sky
 *   LpVisionFeatures   the clouds: what your agent can do with Pancake (the designer's deep dive)
 *   LpVisionWarehouse  what Pancake is, three cards
 *   LpBento, LpCta     what customers got, then the close on its hill
 *   LpPricing          the two plans
 * Every table is a real one (LpVisionDb.tsx, data in lp-vision-tables.ts): the founder asked for
 * "de la vraie db" after a first set of drawn mock-ups.
 * Copy: lp-vision-data.ts. Styles: vision.css.
 */

/* ── the clouds: what your agent can do with Pancake ──────────────────────── */

/** In the list: the feature as its title; under it, once open, what it means. The picture beside
    it is one of the dive's stories. */
const FEATURE_ITEMS: readonly DiveItem[] = VISION_FEATURES.items.map((feature) => ({
  id: feature.story,
  title: feature.title,
  body: feature.body,
  status: "final",
}));

export function LpVisionFeatures() {
  return <LpDive items={FEATURE_ITEMS} title={VISION_FEATURES.title} />;
}

/* ── what Pancake is: three cards ─────────────────────────────────────────── */

export function LpVisionWarehouse() {
  return (
    <section className="lp-vc lp-vsky lp-vware" aria-labelledby="lp-vware-title">
      <div className="lp-v__inner">
        <h2 id="lp-vware-title" className="lp-title-section lp-v__title">
          {VISION_WAREHOUSE.title}
        </h2>
        <ul className="lp-vware__grid">
          {VISION_WAREHOUSE.cards.map((card) => (
            <li key={card.id} className="lp-vware__card" data-tone={card.tone}>
              <div className="lp-vware__pic" aria-hidden="true">
                <DbTable table={DB_WAREHOUSE[card.id]} theme="light" tone={card.tone} />
              </div>
              <h3 className="lp-vware__title">{card.title}</h3>
              <p className="lp-vware__body">{card.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
