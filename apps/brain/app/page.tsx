import { LpFitVars } from "@/components/sections/landing-v3/LpFitVars";
import { LpAnimFreeze } from "@/components/sections/landing-v3/LpAnimFreeze";
import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { SignupForm } from "../components/SignupForm";
import { BrainSections } from "../components/BrainSections";
import { BrainHeroArtwork } from "../components/BrainHeroArtwork";

const features = [
  ["Your Claude or ChatGPT becomes your GTM operator", "Plug Pancake in and your assistant runs prospecting and outreach on its own. No new dashboard to learn."],
  ["It finds the people ready to buy", "Keywords, competitors, influencers, hiring activity, tech stacks. Pancake watches the live signals and surfaces warm leads with the conversation attached."],
  ["Launch campaigns without leaving the chat", "Pancake writes personalized messages in your voice and handles the follow-ups."],
];

export default function BrainLanding() {
  return (
    <main className="lp brain" id="main-content">
      <a className="brain-skip" href="#email">Skip to signup</a>
      <LpFitVars /><LpAnimFreeze />
      <header className="lp-nav brain-nav">
        {/* Paid-traffic page: every link stays on the page. The logo reloads the top. */}
        <a className="lp-nav-logo" href="/" aria-label="Pancake">
          <img src="/lp/lp-nav-logo.svg" width={114.956} height={56} alt="" />
        </a>
        <nav className="lp-nav-links" aria-label="Primary">
          <a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a>
        </nav>
        <div className="lp-nav-ctas"><LpFxLink href="#email" size="sm">Start free</LpFxLink></div>
      </header>
      <section className="brain-hero" aria-labelledby="brain-title">
        <div className="brain-hero-frame">
          <BrainHeroArtwork />
          <div className="brain-hero-content">
            <div className="brain-left">
              <div className="brain-pitch">
                <p className="brain-eyebrow"><span aria-hidden="true" />Now in early access</p>
                <h1 id="brain-title" className="lp-display brain-title">Put your GTM on<br />full autopilot</h1>
                <p className="brain-lede">Pancake lets your Claude or ChatGPT run your go-to-market. Find people ready to buy and start outreach campaigns from the same conversation.</p>
              </div>
              <div className="brain-proof">
                <div className="brain-avatars" aria-hidden="true">{["JL", "MK", "SR", "AN", "+"].map(initials => <span key={initials}>{initials}</span>)}</div>
                <p><strong>500+ founders</strong> already run their GTM on autopilot <span className="brain-stars" aria-label="5 stars">★★★★★</span></p>
              </div>
            </div>
            <aside className="brain-signup" id="email" aria-labelledby="signup-title">
              <div className="brain-signup-card">
                <h2 className="lp-display brain-signup-title" id="signup-title">Start free</h2>
                <p className="brain-signup-intro">Create your account. Your assistant takes it from there.</p>
                <SignupForm />
                <p className="brain-cancel">Cancel anytime</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <section className="brain-benefits" id="benefits" aria-label="What Pancake does for you">
        <div className="brain-benefits-panel">
          <ul className="brain-features">
            {features.map(([title, body]) => <li key={title}>
              <img src="/lp/lp-p-check.svg" alt="" width={24} height={24} />
              <div><h2>{title}</h2><p>{body}</p></div>
            </li>)}
          </ul>
        </div>
        <div className="brain-reassurance">
          <p><strong>SOC 2 compliant.</strong> Your data is encrypted at rest and in transit.</p>
          <p><strong>Up and running in 5 min.</strong> Connect Claude or ChatGPT, add your website, go.</p>
        </div>
      </section>
      <BrainSections />
    </main>
  );
}
