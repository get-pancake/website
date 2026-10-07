// components/sections/plays/plays-jsonld.ts — structured data for /plays, one @graph:
//   WebPage + BreadcrumbList (Home → Example Plays) + ItemList + FAQPage.
// ItemList = every example on the page, in page order, each `url` an anchor on /plays (the
// all-on-one-page list form): the 120 /for prompts, then the "More ways" examples. Names and
// the FAQ Q/As are the visible strings, verbatim. No SoftwareApplication (homepage-only, as on
// /for); Organization and WebSite come from the root layout.

import { PLAYS_FAQ, PLAYS_META, PLAYS_PATH, PLAYS_WAYS } from "@/components/sections/plays/plays-copy";
import type { PlayGroup } from "@/components/sections/plays/plays-data";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

export const PLAYS_URL = `${SITE_ORIGIN}${PLAYS_PATH}`;

export function playsJsonLd(groups: PlayGroup[], description: string) {
  const items = [
    ...groups.flatMap((g) => g.examples.map((e) => ({ name: e.text, id: e.id }))),
    ...PLAYS_WAYS.cards.map((c) => ({ name: c.example, id: c.id })),
  ];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${PLAYS_URL}#webpage`,
        url: PLAYS_URL,
        name: PLAYS_META.ogTitle,
        description,
        inLanguage: "en-US",
        isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
        breadcrumb: { "@id": `${PLAYS_URL}#breadcrumb` },
        mainEntity: { "@id": `${PLAYS_URL}#list` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PLAYS_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: PLAYS_META.crumbs.home, item: SITE_ORIGIN },
          { "@type": "ListItem", position: 2, name: PLAYS_META.crumbs.page, item: PLAYS_URL },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${PLAYS_URL}#list`,
        name: PLAYS_META.crumbs.page,
        numberOfItems: items.length,
        itemListElement: items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          url: `${PLAYS_URL}#${it.id}`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${PLAYS_URL}#faq`,
        mainEntity: PLAYS_FAQ.items.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}
