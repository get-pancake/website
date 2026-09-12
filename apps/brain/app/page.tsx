import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpFitVars } from "@/components/sections/landing-v3/LpFitVars";
import { LpAnimFreeze } from "@/components/sections/landing-v3/LpAnimFreeze";
import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { SignupForm } from "../components/SignupForm";
import { BrainSections } from "../components/BrainSections";

const features = [
  ["Your Claude or ChatGPT becomes your GTM operator", "Plug Pancake in and your assistant runs prospecting, outreach and content on its own. No new dashboard to learn."],
  ["It finds the people ready to buy", "Keywords, competitors, influencers, hiring activity, tech stacks. Pancake watches the live signals and surfaces warm leads with the conversation attached."],
  ["Start outreach campaigns from Claude or ChatGPT.", "Pancake writes personalized messages in your voice and follows up with the people ready to buy."],
];

export default function BrainLanding() {
  return (
    <main className="lp brain" id="main-content">
      <a className="brain-skip" href="#email">Skip to signup</a>
      <LpFitVars /><LpAnimFreeze />
      <header className="lp-nav brain-nav">
        <a className="lp-nav-logo" href="https://getpancake.ai/" aria-label="Pancake — visit getpancake.ai">
          <img src="/lp/lp-nav-logo.svg" width={114.956} height={56} alt="" />
        </a>
        <nav className="lp-nav-links" aria-label="Primary">
          <a href="#how-it-works">Product</a><a href="https://getpancake.ai/blog">Blog</a>
        </nav>
        <div className="lp-nav-ctas"><LpFxLink href="#email" size="sm">Start free</LpFxLink></div>
      </header>
      <section className="brain-hero" aria-labelledby="brain-title">
        <div className="brain-hero-frame">
          <div className="brain-side-rail brain-side-rail--left" aria-hidden="true">
            <div className="lp-cta__art lp-cta__art--left brain-side-art">
              <div className="lp-anim-canvas lp-anim-canvas--cta-left"><LpPancakes variant="ctaLeft" /></div>
              <LpRainbowGL variant="ctaLeft" />
            </div>
          </div>
          <div className="brain-side-rail brain-side-rail--right" aria-hidden="true">
            <div className="lp-cta__art lp-cta__art--right brain-side-art">
              <div className="lp-anim-canvas lp-anim-canvas--cta-right"><LpPancakes variant="ctaRight" /></div>
              <LpRainbowGL variant="ctaRight" />
            </div>
          </div>
          <div className="brain-hero-content">
            <div className="brain-pitch">
              <p className="brain-eyebrow"><span aria-hidden="true" />Now in early access</p>
              <h1 id="brain-title" className="lp-display brain-title">Put your GTM on<br />full autopilot</h1>
              <p className="brain-lede">Pancake lets your Claude or ChatGPT run your go-to-market. Find people ready to buy and start outreach campaigns from the same conversation.</p>
            </div>
            <div className="brain-proof">
              <div className="brain-avatars" aria-hidden="true">{["JL", "MK", "SR", "AN", "+"].map(initials => <span key={initials}>{initials}</span>)}</div>
              <p><strong>500+ founders</strong> already run their GTM on autopilot <span className="brain-stars" aria-label="5 stars">★★★★★</span></p>
            </div>
            <aside className="brain-signup" id="email" aria-labelledby="signup-title">
              <div className="brain-signup-card">
                <h2 className="lp-display brain-signup-title" id="signup-title">Welcome to Pancake</h2>
                <p className="brain-signup-intro">Create your account and put your GTM on autopilot.</p>
                <SignupForm />
                <p className="brain-cancel">Cancel anytime</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <section className="brain-benefits" aria-label="What Pancake does for you">
        <ul className="brain-features">
          {features.map(([title, body]) => <li key={title}>
            <img src="/lp/lp-p-check.svg" alt="" width={24} height={24} />
            <div><h2>{title}</h2><p>{body}</p></div>
          </li>)}
        </ul>
        <div className="brain-reassurance">
          <p><strong>SOC 2 compliant.</strong> Your data is encrypted at rest and in transit.</p>
          <p><strong>Up and running in 5 min.</strong> Connect Claude or ChatGPT, add your website, go.</p>
        </div>
      </section>
      <div className="brain-trust" aria-label="Pancake commitments">
        {["SOC 2 Type II", "End-to-end encrypted", "San Francisco, CA", "#1 on Product Hunt", "Cancel anytime"].map(text => <span key={text}>{text}</span>)}
      </div>
      <BrainSections />
    </main>
  );
}
