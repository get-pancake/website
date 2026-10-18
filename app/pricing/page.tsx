/**
 * Three compact offers: self-serve with an inline credit picker, White Glove
 * delivery and Enterprise integrations. Shared credit selection also updates
 * the closing signup CTA. Billing figures stay in lib/pricing.ts; service
 * terms in lib/white-glove.ts. PAN-2367, founder reference October 18, 2026.
 */
import type { Metadata, Viewport } from "next";

import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { BillingFaq } from "@/components/sections/pricing/BillingFaq";
import { PricingPlans } from "@/components/sections/pricing/PricingPlans";
import { PricingClose } from "@/components/sections/pricing/PricingClose";
import { PricingLead } from "@/components/sections/pricing/PricingLead";
import { PricingLevelProvider } from "@/components/sections/pricing/PricingLevel";
import { PricingLevels } from "@/components/sections/pricing/PricingLevels";
import { PricingLogos } from "@/components/sections/pricing/PricingLogos";
import { PricingProof } from "@/components/sections/pricing/PricingProof";
import { pricingFaq, pricingV2 } from "@/lib/copy";
import { serializeJsonLd } from "@/lib/json-ld";
import { BASE_LEVEL, CREDIT_LEVELS, formatCredits } from "@/lib/pricing";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";
import { TRIAL_DAYS, TRIAL_NOTICE } from "@/lib/trial";
import "@/app/_styles/components.css";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/landing-v2.css";
import "./pricing.css";

/* "from": the first level's price. "per workspace" since 2026-10-06, the
   unit the plan is billed on. The description says what
   the price buys and the one choice a buyer makes. */
const DESCRIPTION = `Compare Pancake self-serve from ${pricingV2.currencySymbol}${BASE_LEVEL.dollars}/month, White Glove outbound setup and Enterprise with custom pricing, data access and GTM Brain connectors.`;

const TITLE = `Pancake Pricing: from $${BASE_LEVEL.dollars}/month per workspace`;
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
   product (2026-10-07). Same @id, so this node only adds the offers: one per
   level of monthly credits, in lockstep with the picker through
   CREDIT_LEVELS (the UnitPriceSpecification says the price is per month; a
   bare Offer price reads as a one-off), and the free trial from
   lib/trial.ts. */
const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${SITE_ORIGIN}/#software`,
  name: "Pancake",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_ORIGIN,
  offers: [
    ...CREDIT_LEVELS.map((level) => ({
      "@type": "Offer",
      name: `Pancake plan, ${formatCredits(level.credits)} credits a month`,
      url: URL,
      description: `Per workspace, billed monthly. ${formatCredits(level.credits)} credits a month. Teammates included.`,
      price: String(level.dollars),
      priceCurrency: pricingV2.currency,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: String(level.dollars),
        priceCurrency: pricingV2.currency,
        billingDuration: "P1M",
        unitText: "MONTH",
      },
      availability: "https://schema.org/InStock",
      seller: SELLER,
    })),
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

/* FAQPage JSON-LD — the billing answers, verbatim, so search engines and
   assistants quote the leads estimate, the trial and the billing rules
   instead of guessing them. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: pricingFaq.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function PricingPage() {
  return (
    // No id here: the skip link's #main-content target is the first section past the nav, so
    // the next Tab reaches the page's content instead of the logo.
    <main className="lp lp-pricing-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />
      <LpNav />
      {/* The picked level is shared by the card and the closing band's Start
          free (PricingLevel.tsx). */}
      <PricingLevelProvider>
      <div className="lv2">
        {/* Compact plan comparison; the credit picker lives inside self-serve. */}
        <section
          id="main-content"
          tabIndex={-1}
          className="lv2s lv2s--brand lv2-pricing-page"
          aria-labelledby="lv2-pricing-page-title"
        >
          <div className="lv2-container">
            <header className="lv2-section-header">
              {/* The first words are for search engines and screen readers
                  only: the heading still reads "Pancake pricing: …". */}
              <h1 id="lv2-pricing-page-title" className="lv2-section-title lv2-pricing-headline">
                <span className="lp-sr-only">{pricingV2.srTitle} </span>
                {pricingV2.title}
              </h1>
              <p className="lv2-section-lede">Run it yourself, let us build it, or connect your whole GTM stack.</p>
            </header>

            <PricingPlans />

            {/* Proof next to the price (2026-10-07): the homepage logos. */}
            <PricingLogos />
          </div>
        </section>
        {/* What ONE lead is (so the price is read against a researched buyer,
            not a name), what customers got, every level by what it gets you,
            then the questions buyers ask (founder 2026-10-13: "user centric,
            value oriented, see what your customer gets"). The sections that
            explained the credit mechanics and drew the workspace are gone. */}
        <PricingLead />
        <PricingProof />
        <PricingLevels />
        <BillingFaq />
        <PricingClose />
      </div>
      </PricingLevelProvider>
      <LpFooter />
      {/* LandingModals unmounted 2026-09-16: every Book a demo CTA links to /demo now (François), so no trigger is left here. */}
    </main>
  );
}
