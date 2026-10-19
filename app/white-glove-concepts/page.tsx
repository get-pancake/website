import type { Metadata, Viewport } from "next";

import { CONCEPTS, WgConceptHero, WgConceptSwitch, type ConceptKey } from "@/components/sections/white-glove/WgConceptHeroes";
import { WhiteGlovePage } from "@/components/sections/white-glove/WhiteGlovePage";
import { WGC_CTA_BODY, WGC_GET_ORDER } from "@/components/sections/white-glove/white-glove-copy";
import "@/app/_styles/landing-v3.css";
import "../white-glove/white-glove.css";
import "./concepts.css";

/**
 * PREVIEW ONLY — /white-glove-concepts?option=a|b|c: three hero options for
 * the White Glove page, each on the full revised page ("How we work together"
 * removed, the price and questions kept), for the founder to compare. Not in
 * the sitemap, llms.txt or known-urls; noindex, no structured data. Delete
 * this route, WgConceptHeroes.tsx, concepts.css and the WGC_* copy once one
 * hero is chosen; /white-glove itself is unchanged until then.
 */

export const viewport: Viewport = { themeColor: "#fbf6f1" };

export const metadata: Metadata = {
  title: "White Glove hero options (preview)",
  robots: { index: false, follow: false },
};

function conceptOf(option: string | string[] | undefined): ConceptKey {
  const value = Array.isArray(option) ? option[0] : option;
  return CONCEPTS.find((c) => c.key === value)?.key ?? "a";
}

export default function WhiteGloveConcepts({ searchParams }: { searchParams: { option?: string | string[] } }) {
  const concept = conceptOf(searchParams.option);
  return (
    <WhiteGlovePage
      jsonLd={[]}
      className={`lp-wg--concept lp-wg--concept-${concept}`}
      hero={<WgConceptHero concept={concept} />}
      showHow={false}
      getOrder={WGC_GET_ORDER}
      ctaBody={WGC_CTA_BODY}
      preview={<WgConceptSwitch concept={concept} />}
    />
  );
}
