import type { Metadata, Viewport } from "next";

import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpMarquee } from "@/components/sections/landing-v3/LpMarquee";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import {
  LpVisionAgent,
  LpVisionClose,
  LpVisionHero,
  LpVisionProblems,
  LpVisionRows,
  LpVisionWarehouse,
} from "@/components/sections/landing-v3/LpVision";
import { pricingV2, SITE_DESCRIPTION } from "@/lib/copy";
import { serializeJsonLd } from "@/lib/json-ld";
import { BASE_LEVEL, CREDIT_LEVELS, TOP_LEVEL, formatCredits } from "@/lib/pricing";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { HOME_SOCIAL_TITLE, social } from "@/lib/social-meta";
import "@/app/_styles/landing-v3.css";

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
     "Pancake — <the hero H1>" (HOME_SOCIAL_TITLE; the launch H1 since
     2026-10-13) and the WebSite JSON-LD (root layout) carries the site
     name + "Pancake AI".
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
// can quote. No sending-account count: one account is in the plan and each
// extra one is a paid licence (lib/pricing.ts), which /pricing explains.
// offers (2026-10-13, the credit plan): the range of the five levels of
// monthly credits, from lib/pricing.ts; /pricing lists each one.
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
    "Searches that run on your schedule, up to 50 leads per search",
    "A reason on every lead",
    "Personal messages you can edit",
    "New leads in Slack and a morning email",
    "MCP server for Claude, Claude Code, ChatGPT and Codex",
  ],
  offers: {
    "@type": "AggregateOffer",
    url: `${SITE_ORIGIN}/pricing`,
    description: `One plan per workspace, billed monthly, from ${formatCredits(BASE_LEVEL.credits)} to ${formatCredits(TOP_LEVEL.credits)} credits a month.`,
    lowPrice: String(BASE_LEVEL.dollars),
    highPrice: String(TOP_LEVEL.dollars),
    offerCount: CREDIT_LEVELS.length,
    priceCurrency: pricingV2.currency,
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

// The vision homepage (2026-11-09): Pancake as the revenue data warehouse. Static:
// the hero (the claim, the product window), the customers on the first dark band, why now and
// the four things Pancake does, the six hard problems, what Pancake is, how an agent uses it, the
// close. Only the problems' list needs JavaScript. Sections: LpVision.tsx.
// The page before it (the hero with its For agents view, the film, the infra bricks, the steps,
// the deep dive, the testimonials, the pricing card) is off this page; its files stay.
export default function Home() {
  return (
    <main className="lp lp-vision-page">
      {/* SoftwareApplication JSON-LD — homepage only */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(softwareApplicationJsonLd) }}
      />
      <LpNav />
      <LpVisionHero />
      {/* the customers, on the dark band the hero's window opens */}
      <div className="lp-vd lp-vlogos">
        <LpMarquee labelled />
      </div>
      <LpVisionRows />
      <LpVisionProblems />
      <LpVisionWarehouse />
      <LpVisionAgent />
      <LpVisionClose />
      <LpFooter />
    </main>
  );
}
