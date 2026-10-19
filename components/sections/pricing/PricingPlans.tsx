"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { isLevelKey, usePricingLevel } from "./PricingLevel";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { pricingV2 } from "@/lib/copy";
import { BASE_LEVEL, CREDIT_LEVELS, appHrefForLevel, formatCredits, formatDollars, shortCredits } from "@/lib/pricing";
import { TRIAL_DAYS, TRIAL_FREE_CREDITS_LABEL } from "@/lib/trial";
import { WHITE_GLOVE_MONTHLY_DOLLARS, WHITE_GLOVE_INITIAL_MONTHS, WHITE_GLOVE_PAGE_HREF } from "@/lib/white-glove";

/**
 * /pricing — the three plans as three paper slips, the language of the
 * /white-glove order ticket (François, October 2026: "redo the pricing page in
 * a similar design"). Every slip has the same five rows (heading, price,
 * choice, what you get, action), laid on one shared grid (subgrid in
 * pricing.css), so prices, lists and buttons line up across the three.
 * Self-serve's five credit levels are a radio group: it drives the price,
 * the credits line and every package-aware Start free on the page
 * (PricingLevel.tsx). White Glove carries the stamp and the one filled pill.
 * Prices: lib/pricing.ts and lib/white-glove.ts only.
 */

function Feature({ children }: { children: ReactNode }) {
  return (
    <li>
      {/* the homepage pricing card's check (public/lp/lp-p-check.svg), inline */}
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19.6719 6.74023C15.8888 10.172 13.5285 14.1231 12.4111 19.2148L10.502 19.3604C9.39587 16.5018 7.48463 14.777 5.58496 13.9102L6.41504 12.0898C8.15295 12.8828 9.84968 14.2371 11.1436 16.2334C12.5306 11.9122 14.8998 8.36986 18.3281 5.25977L19.6719 6.74023Z" fill="currentColor" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

export function PricingPlans() {
  const { level: key, setLevel } = usePricingLevel();
  const group = useRef<HTMLFieldSetElement>(null);
  const level = CREDIT_LEVELS.find((item) => item.key === key) ?? BASE_LEVEL;

  // A level the browser restored (Back, bfcache) wins over the default once,
  // as the select did before: every package-aware link follows it.
  useEffect(() => {
    const value = group.current?.querySelector<HTMLInputElement>("input:checked")?.value;
    if (value && isLevelKey(value)) setLevel(value);
  }, [setLevel]);

  return (
    <section id="white-glove" className="pricing-plans" aria-label="Compare Pancake plans">
      <article id="self-serve" className="pricing-plan" data-tone="self-serve" aria-labelledby="pricing-self-serve-title">
        <header className="pricing-plan__heading">
          <h2 id="pricing-self-serve-title">Self-serve</h2>
          <span className="pricing-plan__tag">Run it yourself</span>
        </header>
        <div className="pricing-plan__price" aria-live="polite" aria-atomic="true">
          <p className="pricing-plan__figure">
            <span className="pricing-plan__amount">{formatDollars(level.dollars)}</span>
            <span className="pricing-plan__period">/month</span>
          </p>
          <p className="pricing-plan__caption">per workspace, billed monthly</p>
        </div>
        <div className="pricing-plan__choice">
          <fieldset ref={group} className="pricing-levels-picker">
            <legend>{pricingV2.pickerLabel}</legend>
            <div className="pricing-levels-picker__track">
              {CREDIT_LEVELS.map((item) => (
                <label key={item.key} className="pricing-levels-picker__option">
                  <input
                    type="radio"
                    name="pricing-level"
                    value={item.key}
                    checked={item.key === key}
                    onChange={(event) => { if (isLevelKey(event.target.value)) setLevel(event.target.value); }}
                  />
                  <span aria-hidden="true">{shortCredits(item.credits)}</span>
                  <span className="lp-sr-only">{formatCredits(item.credits)} credits, {formatDollars(item.dollars)} a month</span>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="pricing-plan__credits">
            <span>{formatCredits(level.credits)} {pricingV2.creditsLine}</span>
            {level.savePercent > 0 ? <span className="pricing-plan__save">{pricingV2.save(level.savePercent)}</span> : null}
          </p>
          <p className="pricing-plan__hint">{pricingV2.pickerHint}</p>
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

      <article className="pricing-plan pricing-plan--white-glove" data-tone="white-glove" aria-labelledby="pricing-white-glove-title">
        <header className="pricing-plan__heading">
          <h2 id="pricing-white-glove-title">White Glove</h2>
          <span className="pricing-plan__tag pricing-plan__tag--stamp">Built for you</span>
        </header>
        <div className="pricing-plan__price">
          <p className="pricing-plan__figure">
            <span className="pricing-plan__amount">{formatDollars(WHITE_GLOVE_MONTHLY_DOLLARS)}</span>
            <span className="pricing-plan__period">/month</span>
          </p>
          <p className="pricing-plan__caption">unlimited Pancake credits included</p>
        </div>
        <div className="pricing-plan__choice">
          <p className="pricing-plan__summary">
            Our team builds your custom GTM Brain and runs your Plays with you.{" "}
            <a href={WHITE_GLOVE_PAGE_HREF}>Learn more<span className="lp-sr-only"> about White Glove</span></a>
          </p>
        </div>
        <div className="pricing-plan__features">
          <p className="pricing-plan__intro">Self-serve, plus our team.</p>
          <ul>
            <Feature>Dedicated GTM engineer</Feature>
            <Feature>Custom GTM Brain setup</Feature>
            <Feature>Unlimited Plays</Feature>
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

      <article className="pricing-plan" data-tone="enterprise" aria-labelledby="pricing-enterprise-title">
        <header className="pricing-plan__heading">
          <h2 id="pricing-enterprise-title">Enterprise</h2>
          <span className="pricing-plan__tag">Custom setup</span>
        </header>
        <div className="pricing-plan__price">
          <p className="pricing-plan__figure">
            <span className="pricing-plan__amount">Custom</span>
            <span className="pricing-plan__period">pricing</span>
          </p>
          <p className="pricing-plan__caption">tailored to your business</p>
        </div>
        <div className="pricing-plan__choice">
          {/* The founder's sentence, verbatim (October 18, 2026). */}
          <p className="pricing-plan__summary">We build your outbound machine and custom GTM brain</p>
        </div>
        <div className="pricing-plan__features">
          <p className="pricing-plan__intro">Built around your stack.</p>
          <ul>
            <Feature>Dedicated GTM engineer</Feature>
            <Feature>Custom GTM Brain setup</Feature>
            <Feature>Unlimited Plays</Feature>
            <Feature>Custom Plays for your sales motion</Feature>
            <Feature>All data providers, one endpoint</Feature>
            <Feature>Custom GTM Brain connectors</Feature>
            <Feature>GTM Brain synced with GitHub</Feature>
          </ul>
        </div>
        <footer className="pricing-plan__action">
          <LpFxLink className="lp-btn--outline" href={DEMO_PAGE_PATH}>Talk to sales</LpFxLink>
          <p>Let’s scope what you need.<br />Then we build it with you.</p>
        </footer>
      </article>
    </section>
  );
}
