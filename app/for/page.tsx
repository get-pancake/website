import type { Metadata, Viewport } from "next";

import { LpCta } from "@/components/sections/landing-v3/LpCta";
import { LpFitVars } from "@/components/sections/landing-v3/LpFitVars";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { LpPricing } from "@/components/sections/landing-v3/LpPricing";
import { VxHubGrid } from "@/components/sections/verticals/VxHubGrid";
import {
  VX_CTA_BODY,
  VX_HUB,
  VX_META,
  VX_PRICING_CHECKLIST,
  VX_PRICING_MODE,
} from "@/components/sections/verticals/vx-copy";
import { hubJsonLd } from "@/components/sections/verticals/vx-jsonld";
import { SITE_URL, approvedVerticals } from "@/lib/verticals";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/verticals.css";

/**
 * /for — "Industries" hub (spec §3; founder 2026-09-22 "do like Origami":
 * a hub + an Industries entry in the global nav). Static. Lists every
 * approved vertical grouped by category (drafts too outside Vercel
 * production), then the homepage CTA card and pricing, then the footer.
 */

export const viewport: Viewport = { themeColor: "#fbf6f1" };

const HUB_URL = `${SITE_URL}/for`;

export function generateMetadata(): Metadata {
  const indexable = approvedVerticals().length > 0;
  return {
    title: VX_META.hubTitle(),
    description: VX_HUB.metaDescription,
    alternates: { canonical: HUB_URL },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type: "website",
      url: HUB_URL,
      title: VX_META.hubOgTitle,
      description: VX_HUB.metaDescription,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: VX_META.hubOgTitle }],
      siteName: "Pancake",
    },
    twitter: {
      card: "summary_large_image",
      title: VX_META.hubOgTitle,
      description: VX_HUB.metaDescription,
      images: ["/og-image.png"],
    },
  };
}

export default function IndustriesHub() {
  return (
    <main id="main-content" className="lp lp-vx lp-vx-hub">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubJsonLd(approvedVerticals())) }}
      />
      <LpFitVars />
      <LpNav />
      <VxHubGrid />
      <LpCta title="Try Pancake now" body={VX_CTA_BODY} />
      <LpPricing checklist={VX_PRICING_MODE === "truthful" ? VX_PRICING_CHECKLIST : undefined} />
      <LpFooter />
    </main>
  );
}
