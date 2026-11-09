import type { Metadata } from "next";

import { LpAnimFreeze } from "@/components/sections/landing-v3/LpAnimFreeze";
import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { BrainTrustBand } from "../../components/BrainTrustBand";
import { WgBookDemo } from "../../components/white-glove/WgBookDemo";
import { WgVsl } from "../../components/white-glove/WgVsl";
import { WG_BOOK_ANCHOR } from "../../lib/white-glove/contract";
import { WG_META, WG_PAGE as p } from "../../lib/white-glove/copy";
import { BRAIN_ORIGIN, SITE_ORIGIN } from "../../lib/origins.mjs";
import "./white-glove.css";

/**
 * brain.pancake.ai/white-glove — the White Glove campaign page (campaign ask,
 * 2026-11-06): paid traffic lands on a page whose only way forward is the
 * "Book a demo" form, with the film level with it and playing on arrival.
 * The form is the main website's (pancake.ai/white-glove) and posts to its
 * routes, which own the routing, the review queue and the Attio deal
 * (components/white-glove/WgBookDemo.tsx). Not indexed: pancake.ai/white-glove
 * is the page search engines know. The layout's tags (GTM, LinkedIn Insight,
 * LeadJourney) cover this page as they cover the sign-up page.
 */

const URL = `${BRAIN_ORIGIN}/white-glove`;

export const metadata: Metadata = {
  title: WG_META.title,
  description: WG_META.description,
  alternates: { canonical: URL },
  openGraph: { title: WG_META.title, description: WG_META.description, url: URL, type: "website", images: ["/og-image.png"] },
  robots: { index: false, follow: false },
};

export default function WhiteGloveLanding() {
  return (
    <main className="lp brain wgb" id="main-content">
      <a className="brain-skip" href={`#${WG_BOOK_ANCHOR}`}>
        {p.skip}
      </a>
      <LpAnimFreeze />
      <header className="lp-nav brain-nav">
        {/* Paid-traffic page: every link stays on the page. The logo reloads the top. */}
        <a className="lp-nav-logo" href="/white-glove" aria-label="Pancake">
          <img src="/lp/lp-nav-logo.svg" width={114.956} height={56} alt="" />
        </a>
        <div className="lp-nav-ctas">
          <LpFxLink href={`#${WG_BOOK_ANCHOR}`} className="wgb-nav-cta">
            {p.navCta}
          </LpFxLink>
        </div>
      </header>
      <section className="wgb-hero" aria-labelledby="wgb-title">
        <div className="wgb-hero__inner">
          <div className="wgb-head">
            <p className="brain-eyebrow">{p.eyebrow}</p>
            <h1 id="wgb-title" className="lp-display wgb-title">
              {p.title}
            </h1>
            <p className="wgb-lede">{p.lede}</p>
          </div>
          {/* the film and the form share the first row; phones: film, form, points, logos */}
          <div className="wgb-grid">
            <WgVsl />
            <WgBookDemo />
            <ul className="wgb-points">
              {p.points.map((point) => (
                <li key={point.title}>
                  <img src="/lp/lp-p-check.svg" alt="" width={20} height={20} />
                  <p>
                    <strong>{point.title}</strong>
                    <span>{point.body}</span>
                  </p>
                </li>
              ))}
            </ul>
            <BrainTrustBand />
          </div>
        </div>
      </section>
      <footer className="lp-foot">
        <div className="lp-foot-frame">
          <div className="lp-foot-brand">
            <img className="lp-foot-logo" src="/lp/lp-footer-logo.svg" alt="Pancake" width={239.672} height={116.755} />
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
    </main>
  );
}
