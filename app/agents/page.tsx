import type { Metadata, Viewport } from "next";

import { LpFitVars } from "@/components/sections/landing-v3/LpFitVars";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpModals } from "@/components/sections/landing-v3/LpModals";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { LpPricing } from "@/components/sections/landing-v3/LpPricing";
import { AgBrain } from "@/components/sections/agents/AgBrain";
import { AgCta } from "@/components/sections/agents/AgCta";
import { AgHero } from "@/components/sections/agents/AgHero";
import { AgKnowledge } from "@/components/sections/agents/AgKnowledge";
import { AgSidekick } from "@/components/sections/agents/AgSidekick";
import { AgSuperpowers } from "@/components/sections/agents/AgSuperpowers";
import { AgVersus } from "@/components/sections/agents/AgVersus";
import { META } from "@/components/sections/agents/ag-copy";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/agents.css";

/**
 * /agents — the second landing (new message + positioning test): the approved
 * draft (pancake-landing-draft.vercel.app) rebuilt on the landing-v3 design
 * system — same nav, rainbow art, pills, CTA card, footer, booking sheet,
 * fonts and tokens as the homepage. Route is provisional (founder: "in fine
 * derrière getpancake.ai/agents, on verra post merge"): noindex, not in the
 * sitemap, until he decides where it lives.
 */

export const viewport: Viewport = { themeColor: "#fbf6f1" };

export const metadata: Metadata = {
  // Tab title is EXACTLY "Pancake" on the landings (founder decision) —
  // the value prop rides on og/twitter titles.
  title: META.title,
  description: META.description,
  robots: { index: false, follow: false },
  alternates: { canonical: "https://getpancake.ai/agents" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/agents",
    title: META.ogTitle,
    description: META.description,
    images: [{ url: "/og-agents.png", width: 1200, height: 630, alt: META.ogTitle }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: META.ogTitle,
    description: META.description,
    images: ["/og-agents.png"],
  },
};

export default function AgentsLanding() {
  return (
    <main id="main-content" className="lp lp-agents">
      {/* --lp-fit for the hero art + CTA slivers (the LpFitVars targets) */}
      <LpFitVars />
      <LpNav />
      <AgHero />
      <AgSidekick />
      <hr className="ag-sep" />
      <AgKnowledge />
      <hr className="ag-sep" />
      <AgSuperpowers />
      {/* Super plays is PARKED (founder 2026-09-11: "let's kill this part for
          now"). AgPlays.tsx, plays.css and PLAYS in ag-copy.ts stay in the
          repo, unmounted, with the CSS import commented out — remount here
          and restore the import to bring it back. */}
      <hr className="ag-sep" />
      <AgBrain />
      <hr className="ag-sep" />
      <AgVersus />
      <AgCta />
      {/* The production footer is designed to follow the pricing section's
          rainbow wave (black band, rings sweeping into the footer); a black
          footer slammed under cream is what the founder called "mauvais
          footer" on the draft. The homepage pricing section closes this page
          the same way — real component, real copy. Flagged in the PR as a
          one-line removal if he wants the page without pricing. */}
      <LpPricing />
      <LpFooter />
      <LpModals />
    </main>
  );
}
