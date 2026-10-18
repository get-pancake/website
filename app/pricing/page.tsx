/**
 * Pricing V3 — one plan, five levels of monthly credits (2026-10-13, the
 * launch of pancake-cmo PR #1220; the flat $99 plan of 2026-08-06 is gone).
 * The page, top to bottom, each block about what the buyer gets: the plan
 * card (the "Monthly credits" picker, the price, the pancake stack that grows
 * with it, what every level includes), the customer logos, what one lead is
 * (an example lead beside the four things it comes with), "Take it from
 * them" (customers' own results), "More credits, more leads." (every level
 * side by side, with the estimate of qualified leads), the questions buyers
 * ask, the closing band.
 * The pricing body rides the landing skin (.lv2) inside the sitewide chrome
 * (LpNav + LpFooter in main.lp, 2026-10-07); app/pricing/pricing.css keeps
 * it whole inside .lp. Book a demo links to /demo (2026-09-16).
 * Numbers: lib/pricing.ts and lib/trial.ts. Words: lib/copy.ts.
 */
import type { Metadata, Viewport } from "next";

import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { PriceGroups } from "@/components/sections/landing/PriceGroups";
import { BillingFaq } from "@/components/sections/pricing/BillingFaq";
import { PlanCard } from "@/components/sections/pricing/PlanCard";
import { PricingApproaches } from "@/components/sections/pricing/PricingApproaches";
import { PricingClose } from "@/components/sections/pricing/PricingClose";
import { PricingLead } from "@/components/sections/pricing/PricingLead";
import { PricingLevelProvider } from "@/components/sections/pricing/PricingLevel";
import { PricingLevels } from "@/components/sections/pricing/PricingLevels";
import { PricingLogos } from "@/components/sections/pricing/PricingLogos";
import { PricingProof } from "@/components/sections/pricing/PricingProof";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { pricingFaq, pricingV2 } from "@/lib/copy";
import { serializeJsonLd } from "@/lib/json-ld";
import { BASE_LEVEL, CREDIT_LEVELS, formatCredits, type CreditLevel } from "@/lib/pricing";
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
const DESCRIPTION = `Pancake self-serve starts at ${pricingV2.currencySymbol}${BASE_LEVEL.dollars} a month per workspace, with ${formatCredits(BASE_LEVEL.credits)} credits and your whole team included. With White Glove, our team builds your outbound machine for you.`;

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

/* The picker's saving line per level ("Save 4.5% per credit"), built here so
   the client card receives plain strings. */
const SAVE_LABELS = Object.fromEntries(
  CREDIT_LEVELS.filter((level) => level.savePercent > 0).map((level) => [
    level.key,
    pricingV2.save(level.savePercent),
  ]),
) as Partial<Record<CreditLevel["key"], string>>;

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
    <main className="lp">
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
        {/* The plan: one wide card on the brand band, composed like the V1
            pricing hero. The picker and the price on the left, the pancake
            stack growing with the level on the right, what every level
            includes across the bottom. CTA pair runs Start free → Book a demo
            like the nav (founder 2026-09-03: primary first, everywhere). */}
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
              <p className="lv2-section-lede">Build it yourself with Pancake, or have our team build it for you.</p>
            </header>

            <PricingApproaches />

            <div id="self-serve" className="lv2-price-plan">
              <h2 className="lp-display pricing-self-serve-title">Choose your self-serve credits</h2>
              <PlanCard
                pickerLabel={pricingV2.pickerLabel}
                pickerHint={pricingV2.pickerHint}
                perMonth={pricingV2.perMonth}
                creditsLine={pricingV2.creditsLine}
                saveLabels={SAVE_LABELS}
                demoHref={DEMO_PAGE_PATH}
                fine={pricingV2.fine}
              >
                <PriceGroups />
              </PlanCard>
              {/* Above the largest level, sales quotes: a bar under the card,
                  not a second card, so the page keeps one plan. */}
              <p className="lv2-price-enterprise">
                <span>{pricingV2.enterprise.text}</span>
                <a href={DEMO_PAGE_PATH}>
                  {pricingV2.enterprise.cta}
                  <span aria-hidden="true"> →</span>
                </a>
              </p>
            </div>

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
