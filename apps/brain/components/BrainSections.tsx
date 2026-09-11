import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";
import { LpSteps } from "@/components/sections/landing-v3/LpSteps";

const FEATURES = [
  "Every agent included",
  "5 to 15 warm leads per month",
  "2 to 3 new customers",
  "30 articles posted",
  "Google ranking and ChatGPT citations",
  "Approvals and a hard spend cap",
];

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
          <LpFxLink
            href="https://app.getpancake.ai/login"
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            className="lp-price-cta"
          >
            Get started
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
            <a href="https://getpancake.ai/privacy">Privacy</a>
            {" • "}
            <a href="https://getpancake.ai/terms">Terms</a>
          </p>
        </div>
        <p className="lp-foot-line">
          {"2026 Pancake · San Francisco, CA · "}
          <a href="https://getpancake.ai/privacy">Privacy</a>
          {" · "}
          <a href="https://getpancake.ai/terms">Terms</a>
        </p>
      </div>
    </footer>
  );
}

export function BrainSections() {
  return (
    <>
      <LpSteps />
      <BrainPricing />
      <BrainFooter />
    </>
  );
}
