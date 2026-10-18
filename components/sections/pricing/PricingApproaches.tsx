import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { BASE_LEVEL, appHrefForLevel, formatDollars } from "@/lib/pricing";
import { WHITE_GLOVE_DESCRIPTION } from "@/lib/white-glove";

export function PricingApproaches() {
  return (
    <section id="white-glove" className="pricing-approaches" aria-label="Compare self-serve and White Glove">
      <article className="pricing-approach" aria-labelledby="pricing-self-serve-title">
        <h2 id="pricing-self-serve-title" className="lp-display">Pancake self-serve</h2>
        <p>You build your outbound machine with Pancake. Set up your Brain, create your Plays and run them yourself.</p>
        <p className="pricing-approach__offer">From {formatDollars(BASE_LEVEL.dollars)} / month</p>
        <ul>
          <li>Your GTM Brain and every Play</li>
          <li>Choose your monthly credits</li>
          <li>Your whole team included</li>
        </ul>
        <div className="pricing-approach__actions">
          <LpFxLink href={appHrefForLevel(BASE_LEVEL.key)}>Start free</LpFxLink>
          <a className="pricing-approach__details" href="#self-serve">Compare credit levels</a>
        </div>
      </article>
      <article className="pricing-approach pricing-approach--white-glove" aria-labelledby="pricing-white-glove-title">
        <h2 id="pricing-white-glove-title" className="lp-display">Pancake White Glove</h2>
        <p>{WHITE_GLOVE_DESCRIPTION}</p>
        <p className="pricing-approach__offer">Built for you, by our team</p>
        <ul>
          <li>A GTM engineer working with your team</li>
          <li>Your Brain and Plays set up for your business</li>
          <li>Unlimited Pancake credits</li>
        </ul>
        <div className="pricing-approach__actions">
          <LpFxLink href={DEMO_PAGE_PATH}>Talk to sales</LpFxLink>
          <p className="pricing-approach__details">A paid service for companies of any size.</p>
        </div>
      </article>
    </section>
  );
}
