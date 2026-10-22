/**
 * Section — the vision (the infra-first landing, 2026-10-21): "Every company will run its
 * go-to-market through agents. Pancake is where they run it." — the thesis line of the infra
 * brief, closing the page on the payoff. Founder, same day: "dont underpromise on what we do or
 * will do in the next future - landing page has to be inspirational and give a waou moment".
 *
 * The line alone since the same evening: its feature list ("Already live") moved into the deep
 * dive's four stories (founder: "dont say 'already live' just push a simple and strong narrative
 * with the key features in this cloud section").
 * The rainbow is the hero's five ribbon colours as a static sunrise (no WebGL here).
 */

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
        <svg className="lp-vision__arcs" viewBox="0 0 1200 320" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
          {ARCS.map((tone, i) => (
            <circle key={tone} data-tone={tone} cx="600" cy="760" r={640 - i * 44} />
          ))}
        </svg>
      </div>
    </section>
  );
}
