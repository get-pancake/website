// components/sections/compare/compare-jsonld.ts — structured data for /compare, one @graph:
//   WebPage + BreadcrumbList (Pancake → Comparisons, the first two crumbs of every comparison
//   page's own trail) + ItemList of the comparison pages, in the order the hub shows them.
// Names are the cards' visible names ("Origami vs Pancake" = each page's H1). No
// SoftwareApplication (homepage-only); Organization and WebSite come from the root layout.

import { COMPARE_META } from "@/components/sections/compare/compare-copy";
import { COMPARE_PATH, compareGroups, compareName, comparePath } from "@/components/sections/compare/compare-data";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

export const COMPARE_URL = `${SITE_ORIGIN}${COMPARE_PATH}`;

export function compareJsonLd() {
  const items = compareGroups().flatMap((g) => g.items);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${COMPARE_URL}#webpage`,
        url: COMPARE_URL,
        name: COMPARE_META.ogTitle,
        description: COMPARE_META.description,
        inLanguage: "en-US",
        isPartOf: { "@type": "WebSite", "@id": `${SITE_ORIGIN}/#website`, name: "Pancake", url: SITE_ORIGIN },
        breadcrumb: { "@id": `${COMPARE_URL}#breadcrumb` },
        mainEntity: { "@id": `${COMPARE_URL}#list` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${COMPARE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: COMPARE_META.crumbs.home, item: SITE_ORIGIN },
          { "@type": "ListItem", position: 2, name: COMPARE_META.crumbs.page, item: COMPARE_URL },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${COMPARE_URL}#list`,
        name: COMPARE_META.crumbs.page,
        numberOfItems: items.length,
        itemListElement: items.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_ORIGIN}${comparePath(c)}`,
          name: compareName(c),
        })),
      },
    ],
  };
}
