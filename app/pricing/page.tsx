/**
 * Pricing V2 — one flat plan, Okara-simplified (founder call 2026-08-06:
 * $99/month flat, everything included; the V1 token-pack model is retired).
 * The pricing body rides the landing skin (.lv2): header + single plan card
 * with the feature list. Book a demo links to /demo (2026-09-16); the
 * booking modal is no longer mounted.
 * 2026-10-07: the sitewide chrome (LpNav + LpFooter inside main.lp, like the
 * homepage, /for and /blog) replaced LandingNav/LandingFooter, so clicking
 * Pricing no longer drops Industries and Product. The lv2 body sits in its
 * own div.lv2; app/pricing/pricing.css keeps it whole inside .lp. Added the
 * logo row, "Everything in the $99." and "Billing questions.".
 */
import type { Metadata, Viewport } from "next";

import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { FxPillLink } from "@/components/sections/landing/FxPill";
import { PriceGroups } from "@/components/sections/landing/PriceGroups";
import { BillingFaq } from "@/components/sections/pricing/BillingFaq";
import { PancakeStack } from "@/components/sections/pricing/PancakeStack";
import { PlanIncluded } from "@/components/sections/pricing/PlanIncluded";
import { PlanMap } from "@/components/sections/pricing/PlanMap";
import { PricingLogos } from "@/components/sections/pricing/PricingLogos";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { pricingFaq, pricingPlan, pricingV2 } from "@/lib/copy";
import { APP_ORIGIN, SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";
import { TRIAL_DAYS, TRIAL_NOTICE } from "@/lib/trial";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/landing-v2.css";
import "./pricing.css";

/* No team label: it read "AI sales and marketing team" until AI SEO was
   retired (2026-09-30), then "AI GTM team" until the launch positioning
   (2026-10-07). "per workspace" since 2026-10-06, the unit the plan is
   billed on (see pricingPlan). */
const DESCRIPTION = `Pancake is ${pricingV2.currencySymbol}${pricingV2.monthlyDollars}/month per workspace, with as many Plays and leads as you want. Everything included. No tiers, no seats.`;

// "per workspace", like the card (2026-10-06); it said "flat" until 2026-10-07.
const TITLE = `Pancake Pricing: $${pricingV2.monthlyDollars}/month per workspace`;
const URL = `${SITE_ORIGIN}/pricing`;

/* Status-bar zone matches the lp cream behind LpNav (as on every lp page). */
export const viewport: Viewport = { themeColor: "#fbf6f1" };

/* Brand-first title: the page answers "pancake pricing" / "pancake ai pricing".
   The self canonical matters — without it the page inherited the homepage
   canonical from the root layout and Google treated /pricing as a duplicate
   of `/` (fixed 2026-09-24). The text/markdown alternate (2026-10-07) points
   agents at public/pricing.md, the same facts without 50 KB of HTML. */
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: URL,
    types: { "text/markdown": `${SITE_ORIGIN}/pricing.md` },
  },
  // Share card via lib/social-meta.ts (2026-10-07, audit 8.1/8.4): adds
  // twitter:site and gives the homepage card the alt of its own text.
  ...social({ path: "/pricing", title: TITLE, description: DESCRIPTION }),
};

const SELLER = {
  "@type": "Organization",
  "@id": `${SITE_ORIGIN}/#organization`,
  name: "Pancake",
} as const;

/* SoftwareApplication JSON-LD — the homepage's #software entity, not a second
   product (2026-10-07: it was a separate Product named "Pancake: AI agents
   that bring you customers"). Same @id, so this node only adds the offers:
   the plan, kept in lockstep with the visible card via pricingV2 (the
   UnitPriceSpecification says the price is per month; a bare Offer price
   reads as a one-off), and the free trial from lib/trial.ts. */
const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${SITE_ORIGIN}/#software`,
  name: "Pancake",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_ORIGIN,
  offers: [
    {
      "@type": "Offer",
      name: "Pancake plan",
      url: URL,
      description: "Per workspace, billed monthly. Teammates included.",
      price: String(pricingV2.monthlyDollars),
      priceCurrency: pricingV2.currency,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: String(pricingV2.monthlyDollars),
        priceCurrency: pricingV2.currency,
        billingDuration: "P1M",
        unitText: "MONTH",
      },
      availability: "https://schema.org/InStock",
      seller: SELLER,
    },
    {
      "@type": "Offer",
      name: "Free trial",
      url: URL,
      description: TRIAL_NOTICE,
      price: "0",
      priceCurrency: pricingV2.currency,
      eligibleDuration: { "@type": "QuantitativeValue", value: TRIAL_DAYS, unitCode: "DAY" },
      availability: "https://schema.org/InStock",
      seller: SELLER,
    },
  ],
};

/* FAQPage JSON-LD — the PlanMap and Billing answers, verbatim, so search
   engines and assistants quote the per-workspace and billing rules instead
   of guessing them. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [...pricingPlan.faq, ...pricingFaq.items].map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function PricingPage() {
  return (
    <main id="main-content" className="lp">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <LpNav />
      <div className="lv2">
        {/* Same composition as the homepage pricing fold — brand band, card,
            pancake-stack mascot — so "See full pricing" doesn't land on a
            barer page than the teaser it came from (mobile QA 2026-08-26).
            CTA pair runs Start free → Book a demo like the nav
            (founder 2026-09-03: primary first, everywhere). */}
        <section
          className="lv2s lv2s--brand lv2-pricing-page"
          aria-labelledby="lv2-pricing-page-title"
        >
          <div className="lv2-container">
            <header className="lv2-section-header">
              <h1 id="lv2-pricing-page-title" className="lv2-section-title">
                {pricingV2.title}
              </h1>
              <p className="lv2-section-lede">{pricingV2.blurb}</p>
            </header>

            <div className="lv2-price-fold">
              <div className="lv2-price-card">
                <p className="lv2-price-figure">
                  <span className="lv2-price-amount">
                    {pricingV2.currencySymbol}
                    {pricingV2.monthlyDollars}
                  </span>
                  <span className="lv2-price-cycle">{pricingV2.perMonth}</span>
                </p>
                <p className="lv2-price-sub">{pricingV2.access}</p>
                <PriceGroups />
                <div className="lv2-button-group">
                  <FxPillLink href={APP_ORIGIN} data-analytics-id="app_pricing_page">
                    Start free
                  </FxPillLink>
                  <FxPillLink
                    variant="outline"
                    href={DEMO_PAGE_PATH}
                    data-analytics-id="call_pricing_page"
                  >
                    Book a demo
                  </FxPillLink>
                </div>
                <p className="lv2-price-fine">{pricingV2.fine}</p>
              </div>
              <div className="lv2-price-decor" aria-hidden="true">
                <PancakeStack count={3} />
              </div>
            </div>

            {/* Proof next to the price (2026-10-07): the homepage logos. */}
            <PricingLogos />
          </div>
        </section>
        {/* What the $99 covers — workspace, Plays, accounts, team (2026-10-06,
            after a customer asked whether it includes a second workspace and
            a second sending account). */}
        <PlanMap />
        <PlanIncluded />
        <BillingFaq />
      </div>
      <LpFooter />
      {/* LandingModals unmounted 2026-09-16: every Book a demo CTA links to /demo now (François), so no trigger is left here. */}
    </main>
  );
}
