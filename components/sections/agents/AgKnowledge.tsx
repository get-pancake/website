import { KNOWLEDGE } from "./ag-copy";
import { AgKnowledgeGrid } from "./AgKnowledgeGrid";

/**
 * /agents — Super knowledge. The draft's centered head (kicker / H2 / lede)
 * over its 16 pastel illustration cards: 4×4 on the 1136 column at 1654,
 * recomposed 2-up ≤767 (knowledge.css — never shrunk). Every card is one of
 * the 147×160 rasters in /lp/agents/data.
 *
 * Motion (founder, preview review 2026-09-11: "a more juicy way to present
 * all those pancakes" — Mobbin: Framer's developer tiles, Framer's plugin
 * grid, Lattice's integrations wall): the cards POP in once when the grid
 * enters the viewport (staggered spring along the top-left → bottom-right
 * diagonal), then every ~5s one HOP ripples across the sixteen illustrations
 * while the grid is on screen; hovering a card lifts it, deepens its tint and
 * hops its illustration; on touch a tap hops it. The draft's all-at-once
 * bob loop is retired (KNOWLEDGE.cards[i].delay is no longer read).
 *
 * Server component: the markup is static copy, SSR'd as is — the settled
 * grid is what SSR / no-JS / reduced-motion show. The section's single
 * client piece is the <ul> (AgKnowledgeGrid): it stamps `data-armed` /
 * `data-entered` / `data-inview` for the CSS and schedules the wave and the
 * hops. The cards are passed in as children so they never ship as client
 * code.
 */
export function AgKnowledge() {
  return (
    <section className="ag-sec ag-knowledge" aria-labelledby="ag-knowledge-title">
      <div className="ag-sec__inner">
        <div className="ag-sec__head">
          <p className="ag-kicker">{KNOWLEDGE.kicker}</p>
          <h2 id="ag-knowledge-title" className="lp-title-section">
            {KNOWLEDGE.title}
          </h2>
          <p className="ag-lede">{KNOWLEDGE.lede}</p>
        </div>
        <AgKnowledgeGrid>
          {KNOWLEDGE.cards.map((card) => (
            <li key={card.slug} className={`ag-card ag-knowledge__card ag-tint--${card.tint}`}>
              {/* the hop wrapper: the illustration moves, the card frame stays
                  square to the grid (founder rule: no rotated frames) */}
              <div className="ag-knowledge__hop" aria-hidden="true">
                <img
                  className="ag-knowledge__art"
                  src={`/lp/agents/data/${card.slug}.png`}
                  alt=""
                  width={147}
                  height={160}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="ag-title-sm ag-knowledge__label">{card.label}</p>
            </li>
          ))}
        </AgKnowledgeGrid>
      </div>
    </section>
  );
}
