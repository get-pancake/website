import { LpBuildAnim } from "@/components/sections/landing-v3/LpBuildAnim";

/**
 * Section — "Find any buyer you can describe." (the infra-first landing, 2026-10-21). The value,
 * not the mechanism: 2026-10-22 "Your sentence becomes software." ("not clear"), then "Ask once.
 * Pancake keeps finding leads." ("ask once is not a value prop").
 *
 * The wow of the page, said simply (founder, same day: "infra does not mean complex"): you ask
 * in one sentence, Pancake writes the search as a program, tests it on a sample, puts it live
 * and runs it. The product's agent-written programs (teardown §3.3: built, versioned, previewed
 * on a sampled run before promotion, restorable to an earlier revision; live in production since
 * 2026-10-12 for the workspaces the coded-job-plays flag admits, rolling out). The founder asked
 * for the near future to be shown without limits, so the page presents it as what Pancake does.
 */

const FACTS = ["Tested before it goes live", "Every version saved", "Roll back anytime"] as const;

export function LpBuild() {
  return (
    <section id="build" className="lp-build" aria-labelledby="lp-build-title">
      <div className="lp-build__org">
        <header className="lp-build__head">
          <h2 id="lp-build-title" className="lp-build__title lp-title-section">
            Find any buyer you can describe.
          </h2>
          <p className="lp-build__lede">
            Describe who you want. Pancake writes the search, tests it on real companies and runs it on your schedule. You
            never touch the code.
          </p>
        </header>
        <LpBuildAnim />
        <ul className="lp-build__facts">
          {FACTS.map((fact) => (
            <li key={fact} className="lp-build__fact">
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                <path d="M3.5 8.5l3 3 6-7" />
              </svg>
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
