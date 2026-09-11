import { KNOWLEDGE } from "./ag-copy";
import { AgKnowledgeGrid } from "./AgKnowledgeGrid";

/**
 * /agents — Super knowledge. The draft's centered head (kicker / H2 / lede)
 * over its 16 pastel illustration cards: 4×4 on the 1136 column at 1654,
 * recomposed 3-up ≤1024 and 2-up ≤767 (knowledge.css — never shrunk).
 * Every card is one of the 147×160 rasters in /lp/agents/data bobbing on
 * the draft's `bob` keyframes, staggered by the negative per-card delay in
 * KNOWLEDGE.cards so the sixteen never move in step.
 *
 * Server component: the markup is static copy, SSR'd as is. The section's
 * single viewport gate is the <ul> (AgKnowledgeGrid, the only client piece):
 * useInView stamps `data-inview` on it and the CSS runs the 16 loops only
 * while it intersects (never under reduced motion). The cards are passed in
 * as children so they never ship as client code.
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
              {/* toFixed keeps the SSR/CSR strings identical and short
                  ("-2.1s", not the float 3×0.7 evaluates to) */}
              <div
                className="ag-knowledge__bob"
                style={{ animationDelay: `${card.delay.toFixed(1)}s` }}
                aria-hidden="true"
              >
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
