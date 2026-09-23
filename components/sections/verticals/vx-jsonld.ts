// components/sections/verticals/vx-jsonld.ts — structured data for /for pages (spec §8).
// One <script type="application/ld+json"> per page with an @graph:
//   /for/<slug>: WebPage + BreadcrumbList (Home → Industries → vertical) + FAQPage
//   /for:        WebPage + BreadcrumbList (Home → Industries) + ItemList of approved pages
// No SoftwareApplication (homepage-only by design); Organization/WebSite come from the root layout.
// The FAQPage Q/As are the vertical's own v.faq (3–4 items) — the first items VxFaq renders from
// faqItems(v) = [...v.faq, ...VX_FAQ.shared] — so the JSON-LD stays a verbatim subset of the
// visible <details> text (audit gate §7.3.2), and the 5 shared Q/As don't repeat as structured
// data on all 40 URLs (SEO-JSONLD-05).

import { VX_HUB, VX_META, VX_RELATED } from "@/components/sections/verticals/vx-copy";
import { SITE_URL, verticalUrl } from "@/lib/verticals";
import type { VerticalConfig } from "@/lib/verticals/types";

const HUB_URL = `${SITE_URL}/for`;
const WEBSITE = { "@type": "WebSite", name: "Pancake", url: SITE_URL } as const;

function crumbs(items: { name: string; url: string }[], id: string) {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
  };
}

export function verticalJsonLd(v: VerticalConfig) {
  const url = verticalUrl(v);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: VX_META.ogTitle(v),
        description: v.hero.lede,
        inLanguage: "en-US",
        isPartOf: WEBSITE,
        about: { "@type": "Thing", name: v.name.title },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      crumbs(
        [
          { name: VX_RELATED.crumbs.home, url: SITE_URL },
          { name: VX_RELATED.crumbs.hub, url: HUB_URL },
          { name: v.name.title, url },
        ],
        `${url}#breadcrumb`,
      ),
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: v.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

export function hubJsonLd(approved: VerticalConfig[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${HUB_URL}#webpage`,
        url: HUB_URL,
        name: VX_META.hubOgTitle,
        description: VX_HUB.metaDescription,
        inLanguage: "en-US",
        isPartOf: WEBSITE,
        breadcrumb: { "@id": `${HUB_URL}#breadcrumb` },
      },
      crumbs(
        [
          { name: VX_RELATED.crumbs.home, url: SITE_URL },
          { name: VX_RELATED.crumbs.hub, url: HUB_URL },
        ],
        `${HUB_URL}#breadcrumb`,
      ),
      {
        "@type": "ItemList",
        "@id": `${HUB_URL}#list`,
        numberOfItems: approved.length,
        itemListElement: approved.map((v, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: verticalUrl(v),
          name: VX_META.ogTitle(v),
        })),
      },
    ],
  };
}
