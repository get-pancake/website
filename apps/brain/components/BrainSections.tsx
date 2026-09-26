import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";
import { LP_STEPS, LpSteps } from "@/components/sections/landing-v3/LpSteps";
import { S2_ROWS } from "@/components/sections/landing-v3/lp-step-data";
import { SITE_ORIGIN } from "../lib/origins.mjs";

// Brain sells outreach only (founder call, 2026-09-11): the main site's AI-search
// bullets stay off this page, in the pricing list and in step 02 alike.
const FEATURES = [
  "Every agent included",
  "5 to 15 warm leads per month",
  "2 to 3 new customers",
  // No spend cap (founder 2026-09-19, main site PR #302): the plan is $99 flat,
  // there is no variable spend to cap. The control line names what you approve
  // today; articles stay off this outreach-only page.
  "Approvals on every lead",
];

// The homepage mock lists Content and AI search agents; this page sells
// outreach only, so those two rows become outreach ones (same faces).
const BRAIN_S2_ROWS = S2_ROWS.map((row) =>
  row.name === "Content" ? { ...row, name: "Follow-ups", count: "31 sent" }
  : row.name === "AI search" ? { ...row, name: "Meetings", count: "6 booked" }
  : row,
);

const BRAIN_STEPS = LP_STEPS.map((step) =>
  step.num === "02"
    ? { ...step, body: "Pancake reaches out to the people ready to buy, in your voice.", s2Rows: BRAIN_S2_ROWS }
    : step,
);

function BrainPricing() {
  return (
    <section id="pricing" className="lp-price">
      <div className="lp-price-frame">
        <h2 className="lp-title-section lp-price-title">Simple, transparent pricing</h2>
        <div className="lp-price-body">
          <div className="lp-price-price">
            <p className="lp-price-amount">99<span className="brain-price-currency"> USD</span></p>
            <p className="lp-price-per">per month, flat</p>
          </div>
          <ul className="lp-price-list">
            {FEATURES.map((feature) => (
              <li key={feature} className="lp-price-item">
                <img src="/lp/lp-p-check.svg" alt="" width={24} height={24} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lp-price-ctas">
          {/* One exit on this page: the signup form. */}
          <LpFxLink href="#email" size="lg" className="lp-price-cta">
            Start free
          </LpFxLink>
        </div>
      </div>
      <div className="lp-price-art" aria-hidden="true">
        <div className="lp-anim-canvas lp-anim-canvas--pricing">
          <LpPancakes variant="pricing" />
        </div>
        <LpRainbowGL variant="pricing" />
      </div>
    </section>
  );
}

function BrainFooter() {
  return (
    <footer className="lp-foot">
      <div className="lp-foot-frame">
        <div className="lp-foot-brand">
          <img
            className="lp-foot-logo"
            src="/lp/lp-footer-logo.svg"
            alt="Pancake"
            width={239.672}
            height={116.755}
          />
          <p className="lp-foot-lines">
            2026 Pancake
            <br />
            San Francisco, CA
          </p>
          <p className="lp-foot-legal">
            <a href={`${SITE_ORIGIN}/privacy`}>Privacy</a>
            {" • "}
            <a href={`${SITE_ORIGIN}/terms`}>Terms</a>
          </p>
        </div>
        <p className="lp-foot-line">
          {"2026 Pancake · San Francisco, CA · "}
          <a href={`${SITE_ORIGIN}/privacy`}>Privacy</a>
          {" · "}
          <a href={`${SITE_ORIGIN}/terms`}>Terms</a>
        </p>
      </div>
    </footer>
  );
}

export function BrainSections() {
  return (
    <>
      <LpSteps steps={BRAIN_STEPS} />
      <BrainPricing />
      <BrainFooter />
    </>
  );
}
