import type { Metadata, Viewport } from "next";

import { LpAnimFreeze } from "@/components/sections/landing-v3/LpAnimFreeze";
import { LpBanner } from "@/components/sections/landing-v3/LpBanner";
import { LpBento } from "@/components/sections/landing-v3/LpBento";
import { LpCta } from "@/components/sections/landing-v3/LpCta";
import { LpDemo } from "@/components/sections/landing-v3/LpDemo";
import { LpDive } from "@/components/sections/landing-v3/LpDive";
import { LpFitVars } from "@/components/sections/landing-v3/LpFitVars";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpHero } from "@/components/sections/landing-v3/LpHero";
import { LpBuild } from "@/components/sections/landing-v3/LpBuild";
import { LpForAgents } from "@/components/sections/landing-v3/LpForAgents";
import { LpInfra } from "@/components/sections/landing-v3/LpInfra";
import { LpSetupPill } from "@/components/sections/landing-v3/LpSetupLine";
import { LpWhy } from "@/components/sections/landing-v3/LpWhy";
import { LpMarquee } from "@/components/sections/landing-v3/LpMarquee";
import { LpAudience } from "@/components/sections/landing-v3/LpAudience";
import { LpAgentLab } from "@/components/sections/landing-v3/LpAgentLab";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { LpPricing } from "@/components/sections/landing-v3/LpPricing";
import { LpSteps } from "@/components/sections/landing-v3/LpSteps";
import {
  AGENT_CARD_BODY,
  AGENT_CARD_BODY_PLACEHOLDER,
} from "@/components/sections/landing-v3/lp-agents-wall-data";
import { pricingV2, SITE_DESCRIPTION } from "@/lib/copy";
import { serializeJsonLd } from "@/lib/json-ld";
import { BASE_LEVEL, CREDIT_LEVELS, TOP_LEVEL, formatCredits } from "@/lib/pricing";
import { SHOW_PLACEHOLDERS } from "@/lib/placeholders";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";
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

/* The infra-first landing (2026-10-21): the homepage's og/twitter title follows its new H1.
   HOME_SOCIAL_TITLE (lib/social-meta.ts) stays the root layout's fallback for the subpages. */
const HOME_INFRA_SOCIAL_TITLE = "Pancake — Agentic infrastructure to run your go-to-market";

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
  ...social({ path: "", title: HOME_INFRA_SOCIAL_TITLE, description: SITE_DESCRIPTION }),
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
    "You approve every lead before anyone is contacted",
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

// Static since 2026-10-07: no searchParams prop (reading ?audience here made
// every request a server render, never cached on the CDN). LpAudience reads
// ?audience=agents on the client once the page has loaded.
export default function Home() {
  return (
    <LpAudience>
      {/* SoftwareApplication JSON-LD — homepage only */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(softwareApplicationJsonLd) }}
      />
      {/* Serves every section's art canvas — the --lp-fit scale var
          (iOS WebKit cqw-in-trig workaround, see LpFitVars.tsx) */}
      <LpFitVars />
      {/* Frees off-screen sections' animation GPU surfaces — the iPhone
          WebContent OOM guard (see LpAnimFreeze.tsx) */}
      <LpAnimFreeze />
      {/* V2 Figma replication (fr8NgOCTUxsEbrMEJA3YKu 4911:346, 2026-10-09) page order. Every
          section is a DIRECT <section> child of main.lp: the agents view hides all of them but
          the hero and the lab (audience.css, integrator rule). */}
      <LpNav />
      <LpHero />
      {/* the demo window, right under the hero (V2 red note: swapped with the logos) */}
      <LpDemo />
      {/* customers band after the demo, before the steps (V2 4911:371 "Trusted by many") */}
      <LpMarquee labelled />
      {/* The infra-first page (2026-10-21), told as every infrastructure page tells it (the outline
          the founder approved, from Cargo, Landbase, Crustdata, Explorium, Octave, Clay, Apollo
          and Stripe): the shift, the model (three layers), the steps, how an agent plugs in, build
          and run; then the designer's banner, deep dive and CTA (one sky: nothing may
          sit between those three, sky.css), proof and pricing. The hero's For agents view keeps
          the one-line install (LpAgentStart), as Cargo's Agent / Human toggle does. */}
      <LpWhy />
      <LpInfra />
      <LpAgentLab
        cardBody={SHOW_PLACEHOLDERS && AGENT_CARD_BODY_PLACEHOLDER ? AGENT_CARD_BODY_PLACEHOLDER : AGENT_CARD_BODY}
      />
      <LpSteps />
      <LpForAgents />
      <LpBuild />
      <LpBanner />
      {/* the deep-dive carousel (V2 4939:3388) in place of the four feature cards */}
      <LpDive />
      {/* the close: the CTA pair, then the one-line setup to copy */}
      <LpCta sky setup={<LpSetupPill />} />
      {/* testimonials / KPI bento (V2 4911:762): dev and previews show it, gaps filled with
          marked stand-ins. Production renders nothing while BENTO_LIVE (lp-bento-data.ts) is
          off, as it is today (the founder's go on the date and the customers' OK); once on,
          its final cards only (a partial set) */}
      <LpBento />
      <LpPricing />
      <LpFooter />
      {/* LpModals unmounted 2026-09-16: every Book a demo CTA links to /demo now (François), so no trigger is left here. */}
    </LpAudience>
  );
}
