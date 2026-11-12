import { Fragment } from "react";

import { LpVisionStepAnim } from "./LpVisionStepAnim";
import { VISION_STATEMENT, VISION_STEPS } from "./lp-vision-data";

/**
 * The vision homepage's 1-2-3 (2026-11-11, the landing page meeting: "1-2-3 steps to replace the
 * current table layout", and the three steps of today's product further down were "a duplicate":
 * one section now). The designer's steps section as it is (LpSteps: steps.css .lp-steps, a text
 * card and a 464 × 426 media card a row, checkerboard), under the page's statement as its title,
 * with three new pictures (LpVisionStepAnim): connect your sources, connect the dots with market
 * signals, find who to contact and when. Copy: lp-vision-data.ts VISION_STEPS.
 */
export function LpVisionSteps() {
  return (
    <section className="lp-steps lp-vsteps" id="how-it-works">
      <div className="lp-steps__org">
        <header className="lp-steps__head lp-vsteps__head">
          <h2 className="lp-steps__title lp-title-section">
            {VISION_STATEMENT.map((line, i) => (
              <Fragment key={line}>
                {i > 0 ? <br /> : null}
                {line}{" "}
              </Fragment>
            ))}
          </h2>
        </header>
        <div className="lp-steps__list">
          {VISION_STEPS.map((step) => (
            <div className="lp-steps__row" key={step.num} data-lp-slot={`step-${step.num}`}>
              <div className="lp-steps__text">
                <p className="lp-steps__num lp-display">{step.num}</p>
                <span className="lp-steps__spacer" aria-hidden="true" />
                <h3 className="lp-steps__step-title lp-display">{step.title}</h3>
                <p className="lp-steps__body">{step.body}</p>
              </div>
              <LpVisionStepAnim className="lp-steps__media" variant={step.variant} alt={step.alt} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
