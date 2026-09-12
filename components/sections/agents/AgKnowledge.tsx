import { KNOWLEDGE } from "./ag-copy";
import { AgKnowledgeRouter } from "./AgKnowledgeRouter";

/**
 * /agents — Super knowledge. The draft's centered head (kicker / H2 / lede)
 * over ONE cream card: the router demo of the lede's claim ("50+ data
 * providers and tools behind one call, always routed to the cheapest source
 * that has the answer. Think OpenRouter, for GTM."). Founder, preview review
 * 2026-09-11: the flat wall of sixteen pastel tiles (hop wave, green hover)
 * was rejected — "plus créatifs pour intégrer ce composant intelligemment".
 * So the tiles became the SOURCES of a live router: REQUESTS (the six agent
 * bubbles of KNOWLEDGE.requests, a short scrolling history) → the HUB (the
 * mascot, "one call") → the SOURCES (the sixteen tiles, 4×4), joined by a
 * dashed trace and a travelling dot that lights the one tile that answers.
 *
 * Server component: every string is static copy, SSR'd as is; the first
 * request is rendered routed (active bubble, its result line, its tile lit)
 * so the section is complete without JS. The single client piece is the
 * stage wrapper (AgKnowledgeRouter) — it measures, slots the rows, draws
 * the legs and schedules the loop; this markup is passed in as children so
 * none of it ships as client code (README rule 7).
 */

const FIRST_SOURCE = KNOWLEDGE.requests[0]?.source;

/* what a screen reader gets instead of the aria-hidden request history */
const SR_DEMO = `Demo: six agent requests go through ${KNOWLEDGE.routeLabel} to Pancake, which routes each one to the single source that has the answer.`;

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

        <AgKnowledgeRouter>
          <p className="lp-sr-only">{SR_DEMO}</p>

          {/* REQUESTS — one row per request: the agent bubble alone (a result
              line was cut — founder 2026-09-11: "remove sloppy text like
              this"; the lit tile is the answer). The first row is the SSR
              active slot; AgKnowledgeRouter re-slots the rest. */}
          <ol className="ag-knowledge__reqs" aria-hidden="true">
            {KNOWLEDGE.requests.map((req, i) => (
              <li
                key={req.text}
                className="ag-knowledge__req"
                data-source={req.source}
                data-slot={i === 0 ? "0" : undefined}
                data-arrived={i === 0 ? "" : undefined}
              >
                <p className="ag-knowledge__bubble">{req.text}</p>
              </li>
            ))}
          </ol>

          {/* HUB — the mascot in a hairline ring, "one call" under it */}
          <div className="ag-knowledge__hub" aria-hidden="true">
            <span className="ag-knowledge__hub-ring">
              <img className="ag-knowledge__mascot" src="/pancake-monster.png" alt="" width={64} height={66} />
            </span>
            <span className="ag-knowledge__hub-label">{KNOWLEDGE.routeLabel}</span>
          </div>

          {/* SOURCES — the sixteen tiles, 4×4, every label readable by AT
              (visually hidden on phones, where the result line carries it) */}
          <ul className="ag-knowledge__tiles">
            {KNOWLEDGE.cards.map((card) => (
              <li
                key={card.slug}
                className={`ag-knowledge__tile ag-tint--${card.tint}${card.slug === FIRST_SOURCE ? " is-on" : ""}`}
                data-slug={card.slug}
              >
                {/* the hop wrapper: the illustration jumps, the tile stays square to the grid */}
                <span className="ag-knowledge__hop" aria-hidden="true">
                  <img
                    className="ag-knowledge__art"
                    src={`/lp/agents/data/${card.slug}.png`}
                    alt=""
                    width={147}
                    height={160}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="ag-knowledge__label">{card.label}</span>
              </li>
            ))}
          </ul>

          {/* THE ROUTE — two dashed legs and the two dots, drawn by the client piece */}
          <svg className="ag-knowledge__route" aria-hidden="true" focusable="false">
            <path className="ag-knowledge__leg" />
            <path className="ag-knowledge__leg" />
            <circle className="ag-knowledge__dot" r="3" />
            <circle className="ag-knowledge__dot" r="3" />
          </svg>
        </AgKnowledgeRouter>
      </div>
    </section>
  );
}
