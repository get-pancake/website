import { AgBrainGraph } from "./AgBrainGraph";
import { BRAIN } from "./ag-copy";

/**
 * /agents — Super smart. The draft's 5fr/7fr row (desktop-sec-07): the
 * left-aligned head (kicker / H2 / lede, kicker→H2 16, H2→lede 24) beside the
 * cream card holding the GTM brain — a static SVG drawing for SSR, no-JS and
 * reduced motion, upgraded to the draft's live force graph once JS runs and
 * the card is in view (AgBrainGraph, the only client piece). Stacks head →
 * card ≤1024; phones get the compact graph geometry so the labels stay
 * readable. Layout in agents/brain.css (.ag-brain*).
 */
export function AgBrain() {
  return (
    <section className="ag-sec ag-brain" aria-labelledby="ag-brain-title">
      <div className="ag-sec__inner ag-brain__grid">
        <div className="ag-sec__head ag-sec__head--left ag-brain__head">
          <p className="ag-kicker">{BRAIN.kicker}</p>
          <h2 id="ag-brain-title" className="lp-title-section">
            {BRAIN.title}
          </h2>
          <p className="ag-lede">{BRAIN.lede}</p>
        </div>
        <AgBrainGraph />
      </div>
    </section>
  );
}
