/**
 * Section — the vision (the infra-first landing, 2026-10-21): "Every company will run its
 * go-to-market through agents. Pancake is where they run it." — the thesis line of the infra
 * brief, closing the page on the payoff. Founder, same day: "dont underpromise on what we do or
 * will do in the next future - landing page has to be inspirational and give a waou moment".
 *
 * "Already live" (founder, same evening: "consider coming next as live"): the work the codebase
 * teardown (outputs/pancake-infra-teardown-2026-10-21.md) shows built or rolling out, presented
 * as live by his call: lookalikes (§3.6, the audience-query engine), leads handed to the CRMs
 * (§3.10, merged 2026-10-20 behind flags; Lightfield left out of the line), agent-run setup
 * (§3.1, ADR 0066's identity-scoped tools), and work emails on demand (§3.5, live: credits held,
 * charged only when one is found). Nothing invented.
 * The rainbow is the hero's five ribbon colours as a static sunrise (no WebGL here).
 */

const LIVE = [
  "Lookalikes of your best customers",
  "Leads straight to HubSpot, Attio, Pipedrive and Close",
  "Your agent sets up Pancake from start to finish",
  "Work emails on demand",
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
          <p className="lp-vision__label">Already live</p>
          <ul className="lp-vision__chips">
            {LIVE.map((item) => (
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
