import type { Metadata, Viewport } from "next";

import { LpAnimFreeze } from "@/components/sections/landing-v3/LpAnimFreeze";
import { LpBanner } from "@/components/sections/landing-v3/LpBanner";
import { LpCta } from "@/components/sections/landing-v3/LpCta";
import { LpDemoTour } from "@/components/sections/landing-v3/LpDemoTour";
import { LpFeatures } from "@/components/sections/landing-v3/LpFeatures";
import { LpFitVars } from "@/components/sections/landing-v3/LpFitVars";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpHero } from "@/components/sections/landing-v3/LpHero";
import { LpMarquee } from "@/components/sections/landing-v3/LpMarquee";
import { LpAudience } from "@/components/sections/landing-v3/LpAudience";
import { LpAgentLab } from "@/components/sections/landing-v3/LpAgentLab";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { LpPricing } from "@/components/sections/landing-v3/LpPricing";
import { LpSteps } from "@/components/sections/landing-v3/LpSteps";
import { pricingV2, SITE_DESCRIPTION } from "@/lib/copy";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { HOME_SOCIAL_TITLE, social } from "@/lib/social-meta";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/home-demo.css";

/**
 * Landing v3 — 1:1 replication of the Figma "Pancake-Design" desktop artboard
 * (node 4197-9774, frame "hero" 4257:4893). Static phase: layout, type, color
 * and art match the artboard exactly; the Figma motion pass lands separately.
 */

// Page-level metadata mirrors the hero (unchanged copy vs v2);
// the root layout still carries the org-wide defaults.

/* NOTE: iOS Safari ignores themeColor for the Dynamic-Island band — the band
   is painted with the BODY's background (body:has(main.lp) in foundation.css,
   device-tested 2026-09-01). viewport-fit=cover is a portrait no-op there too
   (env(safe-area-inset-top) stays 0 in the browser) — don't re-add it. */
export const viewport: Viewport = { themeColor: "#fbf6f1" };

export const metadata: Metadata = {
  /* Tab title is EXACTLY "Pancake" — founder decision, twice (2026-08-31
     "just Pancake next to the favicon"; 2026-09-01 "arrête de remettre qqch
     après Pancake"). NON-NEGOTIABLE — never append a descriptor here again.
     Description = this landing's hero H2 (its SERP line from 2026-08-18 to
     2026-08-31), restored 2026-09-02 on the founder's word ("on a eu des H2
     différents avant sur cette landing page, il faut le remettre") after a
     revert had swapped in the July v1 copy ("AI coworker in Slack, $49/
     month" — wrong positioning, wrong price). Known trade-off: with a
     one-word <title>, Google may build its own title from other signals
     (it showed "Pancake's AI" once); the og/twitter titles carry the full
     "Pancake — You run your company. We bring you customers." and the
     WebSite JSON-LD (root layout) carries the site name + "Pancake AI".
     2026-09-30: AI SEO retired from the product (pancake-cmo PR #1037), so
     only the third clause changed: "grow your AI search visibility" became
     "reach out in your voice". The sentence now lives once, as
     SITE_DESCRIPTION in lib/copy.ts, shared by the hero lede, this metadata,
     the JSON-LD below and the root layout. Change it only with the founder.
     2026-10-07: the og/twitter blocks come from lib/social-meta.ts (adds
     twitter:site, og:locale and the image alt on both cards, audit 8.1); the
     og/twitter title is the same "Pancake — …" line, now HOME_SOCIAL_TITLE,
     which the root layout's fallback uses too (audit 6.13). */
  title: "Pancake",
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_ORIGIN },
  ...social({ path: "", title: HOME_SOCIAL_TITLE, description: SITE_DESCRIPTION }),
};

// SoftwareApplication JSON-LD — homepage only (Organization is in root layout).
// featureList (2026-10-07, audit 6.3): what one plan does, in facts an assistant
// can quote. "Up to 10 sending accounts per Play" waits on D7 (pancake-cmo
// PR #1220 would price extra accounts), like the comparison pages.
const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${SITE_ORIGIN}/#software`,
  name: "Pancake",
  alternateName: "Pancake AI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_ORIGIN,
  description: SITE_DESCRIPTION,
  featureList: [
    "Plays built from one sentence",
    "A new lead search every night, up to 50 leads per search",
    "A reason on every lead",
    "You approve every lead before anyone is contacted",
    "Personal messages you can edit",
    "New leads in Slack and a morning email",
    "MCP server for Claude, Claude Code and Codex",
  ],
  offers: {
    "@type": "Offer",
    url: `${SITE_ORIGIN}/pricing`,
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
  },
  // @id ties this node to the root layout's Organization; name + url stay
  // inline so the node still validates for parsers that don't resolve @id.
  publisher: {
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#organization`,
    name: "Pancake",
    url: SITE_ORIGIN,
  },
};

// Static since 2026-10-07: no searchParams prop (reading ?audience here made
// every request a server render, never cached on the CDN). LpAudience reads
// ?audience=agents on the client once the page has loaded.
export default function Home() {
  return (
    <LpAudience>
      {/* SoftwareApplication JSON-LD — homepage only */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      {/* Serves every section's art canvas — the --lp-fit scale var
          (iOS WebKit cqw-in-trig workaround, see LpFitVars.tsx) */}
      <LpFitVars />
      {/* Frees off-screen sections' animation GPU surfaces — the iPhone
          WebContent OOM guard (see LpAnimFreeze.tsx) */}
      <LpAnimFreeze />
      <LpNav />
      <LpHero />
      <LpMarquee />
      {/* the /for product demo (founder 2026-09-23): after the logos, before the steps */}
      <LpDemoTour />
      <LpAgentLab />
      <LpSteps />
      <LpBanner />
      <LpFeatures />
      <LpCta />
      <LpPricing />
      <LpFooter />
      {/* LpModals unmounted 2026-09-16: every Book a demo CTA links to /demo now (François), so no trigger is left here. */}
    </LpAudience>
  );
}
