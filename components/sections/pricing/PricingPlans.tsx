"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { isLevelKey, usePricingLevel } from "./PricingLevel";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { BASE_LEVEL, CREDIT_LEVELS, appHrefForLevel, formatCredits, formatDollars } from "@/lib/pricing";
import { TRIAL_DAYS, TRIAL_FREE_CREDITS_LABEL } from "@/lib/trial";
import { WHITE_GLOVE_MONTHLY_DOLLARS, WHITE_GLOVE_INITIAL_MONTHS } from "@/lib/white-glove";

function Feature({ children }: { children: ReactNode }) {
  return (
    <li>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="m8.5 12 2.3 2.3 4.7-4.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

/** One selector drives the price and every package-aware Start free link. */
export function PricingPlans() {
  const { level: key, setLevel } = usePricingLevel();
  const picker = useRef<HTMLSelectElement>(null);
  const level = CREDIT_LEVELS.find((item) => item.key === key) ?? BASE_LEVEL;

  useEffect(() => {
    const value = picker.current?.value;
    if (value && isLevelKey(value)) setLevel(value);
  }, [setLevel]);

  return (
    <section id="white-glove" className="pricing-plans" aria-label="Compare Pancake plans">
      <article id="self-serve" className="pricing-plan" aria-labelledby="pricing-self-serve-title">
        <header className="pricing-plan__heading">
          <h2 id="pricing-self-serve-title" className="lp-display">Self-serve</h2>
        </header>
        <div className="pricing-plan__price" aria-live="polite" aria-atomic="true">
          <p><span className="pricing-plan__amount lp-display">{formatDollars(level.dollars)}</span><span className="pricing-plan__period">/mo</span></p>
          <p className="pricing-plan__caption">per workspace, billed monthly</p>
        </div>
        <div className="pricing-plan__choice">
          <label htmlFor="pricing-monthly-credits">Monthly credits</label>
          <select
            ref={picker}
            id="pricing-monthly-credits"
            value={key}
            onChange={(event) => { if (isLevelKey(event.target.value)) setLevel(event.target.value); }}
          >
            {CREDIT_LEVELS.map((item) => <option key={item.key} value={item.key}>{formatCredits(item.credits)} credits</option>)}
          </select>
        </div>
        <div className="pricing-plan__features">
          <p className="pricing-plan__intro">Your outbound, in your hands.</p>
          <ul>
            <Feature>Your GTM Brain</Feature>
            <Feature>30+ data providers included</Feature>
            <Feature>Plays and outreach sequences</Feature>
            <Feature>Messages in your voice</Feature>
            <Feature>Unlimited teammates</Feature>
          </ul>
        </div>
        <footer className="pricing-plan__action">
          <LpFxLink className="lp-btn--outline" href={appHrefForLevel(level.key)} data-analytics-id="app_pricing_page">Start free</LpFxLink>
          <p>{TRIAL_DAYS}-day trial · {TRIAL_FREE_CREDITS_LABEL}.<br />Card required to start the trial.</p>
        </footer>
      </article>

      <article className="pricing-plan pricing-plan--white-glove" aria-labelledby="pricing-white-glove-title">
        <header className="pricing-plan__heading">
          <h2 id="pricing-white-glove-title" className="lp-display">White Glove</h2>
          <span className="pricing-plan__badge">Built for you</span>
        </header>
        <div className="pricing-plan__price">
          <p><span className="pricing-plan__amount lp-display">{formatDollars(WHITE_GLOVE_MONTHLY_DOLLARS)}</span><span className="pricing-plan__period">/mo</span></p>
          <p className="pricing-plan__caption">your outbound machine, built by our team</p>
        </div>
        <div className="pricing-plan__choice">
          <p>We build your outbound machine so your team can focus on closing.</p>
        </div>
        <div className="pricing-plan__features">
          <p className="pricing-plan__intro">Self-serve, plus our team.</p>
          <ul>
            <Feature>Your GTM engineer</Feature>
            <Feature>Custom Brain and Plays setup</Feature>
            <Feature>Sequences built for your buyers</Feature>
            <Feature>Unlimited Pancake credits</Feature>
            <Feature>Weekly GTM office hour</Feature>
          </ul>
        </div>
        <footer className="pricing-plan__action">
          <LpFxLink href={DEMO_PAGE_PATH}>Talk to sales</LpFxLink>
          <p>{WHITE_GLOVE_INITIAL_MONTHS}-month initial commitment.<br />Then month to month.</p>
        </footer>
      </article>

      <article className="pricing-plan" aria-labelledby="pricing-enterprise-title">
        <header className="pricing-plan__heading">
          <h2 id="pricing-enterprise-title" className="lp-display">Enterprise</h2>
        </header>
        <div className="pricing-plan__price">
          <p className="pricing-plan__custom lp-display">Custom pricing</p>
          <p className="pricing-plan__caption">shaped around your team and stack</p>
        </div>
        <div className="pricing-plan__choice">
          <p>Connect your data and tools with a setup built for your sales motion.</p>
        </div>
        <div className="pricing-plan__features">
          <p className="pricing-plan__intro">Built around your stack.</p>
          <ul>
            <Feature>All data providers, one endpoint</Feature>
            <Feature>Custom GTM Brain connectors</Feature>
            <Feature>GTM Brain synced with GitHub</Feature>
            <Feature>Custom Plays for your sales motion</Feature>
          </ul>
        </div>
        <footer className="pricing-plan__action">
          <LpFxLink className="lp-btn--outline" href={DEMO_PAGE_PATH}>Talk to sales</LpFxLink>
          <p>Let’s scope what you need.<br />Pricing tailored to your business.</p>
        </footer>
      </article>
    </section>
  );
}
