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
import { LpTestimonials } from "@/components/sections/landing-v3/LpTestimonials";
import { pricingV2 } from "@/lib/copy";
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
     (it showed "Pancake's AI" once); the og/twitter titles and the JSON-LD
     names carry the full "Pancake — You run your company. We bring you
     customers." so it has a coherent descriptive title to pick instead. */
  title: "Pancake",
  description:
    "Pancake’s AI agents monitor buying signals, find warm leads, grow your AI search visibility, and learn from every interaction.",
  alternates: { canonical: "https://getpancake.ai" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai",
    title: "Pancake — You run your company. We bring you customers.",
    description:
      "Pancake’s AI agents monitor buying signals, find warm leads, grow your AI search visibility, and learn from every interaction.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "You run your company. We bring you customers." }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pancake — You run your company. We bring you customers.",
    description:
      "Pancake’s AI agents monitor buying signals, find warm leads, grow your AI search visibility, and learn from every interaction.",
    images: ["/og-image.png"],
  },
};

// SoftwareApplication JSON-LD — homepage only (Organization is in root layout).
const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Pancake",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://getpancake.ai",
  description:
    "Pancake’s AI agents monitor buying signals, find warm leads, grow your AI search visibility, and learn from every interaction.",
  offers: {
    "@type": "Offer",
    url: "https://getpancake.ai/pricing",
    price: String(pricingV2.monthlyDollars),
    priceCurrency: pricingV2.currency,
    availability: "https://schema.org/InStock",
  },
  publisher: {
    "@type": "Organization",
    name: "Pancake",
    url: "https://getpancake.ai",
  },
};

export default function Home({ searchParams }: { searchParams: { audience?: string } }) {
  return (
    <LpAudience initialAudience={searchParams.audience === "agents" ? "agents" : "humans"}>
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
      <LpTestimonials />
      <LpPricing />
      <LpFooter />
      {/* LpModals unmounted 2026-09-16: every Book a demo CTA links to /demo now (François), so no trigger is left here. */}
    </LpAudience>
  );
}
