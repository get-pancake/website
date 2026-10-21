/**
 * Section — the vision (the infra-first landing, 2026-10-21): "Every company will run its
 * go-to-market through agents. Pancake is where they run it." — the thesis line of the infra
 * brief, closing the page on the payoff. Founder, same day: "dont underpromise on what we do or
 * will do in the next future - landing page has to be inspirational and give a waou moment".
 *
 * "Coming next" names only work the codebase teardown shows built or rolling out
 * (outputs/pancake-infra-teardown-2026-10-21.md): lookalikes (§3.6, the audience-query engine),
 * leads handed to five CRMs (§3.10, merged 2026-10-20 behind flags; Lightfield left out of the
 * line), agent-run setup (§3.1, ADR 0066's identity-scoped tools), more providers behind the
 * gateway (§3.4, SDKs built for Linkup, Exa, Crustdata, Ocean.io, PredictLeads). Nothing invented.
 * The rainbow is the hero's five ribbon colours as a static sunrise (no WebGL here).
 */

const NEXT = [
  "Lookalikes of your best customers",
  "Leads straight to HubSpot, Attio, Pipedrive and Close",
  "Your agent sets up Pancake from start to finish",
  "More data providers behind the same door",
] as const;

/** outer to inner: the hero's ribbon order */
const ARCS = ["yellow", "pink", "purple", "blue", "green"] as const;

export function LpVision() {
  return (
    <section id="vision" className="lp-vision" aria-labelledby="lp-vision-title">
      <div className="lp-vision__card">
        <h2 id="lp-vision-title" className="lp-vision__title lp-display">
          <span className="lp-vision__line">
            Every company will run its <span className="lp-vision__nobr">go-to-market</span> through agents.
          </span>{" "}
          <span className="lp-vision__line lp-vision__accent">Pancake is where they run it.</span>
        </h2>
        <div className="lp-vision__next">
          <p className="lp-vision__label">Coming next</p>
          <ul className="lp-vision__chips">
            {NEXT.map((item) => (
              <li key={item} className="lp-vision__chip">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <svg className="lp-vision__arcs" viewBox="0 0 1200 320" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
          {ARCS.map((tone, i) => (
            <circle key={tone} data-tone={tone} cx="600" cy="760" r={640 - i * 44} />
          ))}
        </svg>
      </div>
    </section>
  );
}
