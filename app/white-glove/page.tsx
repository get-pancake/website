import type { Metadata, Viewport } from "next";

import { WhiteGlovePage } from "@/components/sections/white-glove/WhiteGlovePage";
import { WG_FAQ, WG_META, WG_TERM } from "@/components/sections/white-glove/white-glove-copy";
import { pricingV2 } from "@/lib/copy";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";
import { WHITE_GLOVE_MONTHLY_DOLLARS, WHITE_GLOVE_PAGE_HREF } from "@/lib/white-glove";
import "@/app/_styles/landing-v3.css";
import "./white-glove.css";

/**
 * /white-glove — the White Glove offer page (PAN-2368). Indexable, in the
 * sitemap and llms.txt; public/white-glove.md carries the same facts for
 * agents. /demo's "Learn more about White Glove" and the pricing card link here.
 */

const URL = `${SITE_ORIGIN}${WHITE_GLOVE_PAGE_HREF}`;

// as every lp page: iOS paints the island band from body (foundation.css)
export const viewport: Viewport = { themeColor: "#fbf6f1" };

export const metadata: Metadata = {
  title: WG_META.title,
  description: WG_META.description,
  alternates: {
    canonical: URL,
    types: { "text/markdown": `${SITE_ORIGIN}/white-glove.md` },
  },
  ...social({ path: WHITE_GLOVE_PAGE_HREF, title: WG_META.ogTitle, description: WG_META.description }),
};

/* The service and its monthly price (UnitPriceSpecification: a bare Offer
   price reads as a one-off), provided by the homepage's Organization. */
const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${URL}#service`,
  name: "Pancake White Glove",
  alternateName: "Pancake Forward Deployed",
  serviceType: "Outbound sales setup and operation",
  description: WG_META.description,
  url: URL,
  provider: { "@type": "Organization", "@id": `${SITE_ORIGIN}/#organization`, name: "Pancake" },
  offers: {
    "@type": "Offer",
    url: URL,
    description: WG_TERM,
    price: String(WHITE_GLOVE_MONTHLY_DOLLARS),
    priceCurrency: pricingV2.currency,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: String(WHITE_GLOVE_MONTHLY_DOLLARS),
      priceCurrency: pricingV2.currency,
      billingDuration: "P1M",
      unitText: "MONTH",
    },
  },
};

/* The visible answers, verbatim. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: WG_FAQ.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function WhiteGlove() {
  return <WhiteGlovePage jsonLd={[serializeJsonLd(serviceJsonLd), serializeJsonLd(faqJsonLd)]} />;
}
