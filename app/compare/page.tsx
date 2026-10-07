import type { Metadata, Viewport } from "next";

import { ComparePage } from "@/components/sections/compare/ComparePage";
import { COMPARE_META } from "@/components/sections/compare/compare-copy";
import { COMPARE_PATH } from "@/components/sections/compare/compare-data";
import { COMPARE_URL } from "@/components/sections/compare/compare-jsonld";
import { social } from "@/lib/social-meta";
import "@/app/_styles/landing-v3.css";
import "./compare.css";

/**
 * /compare — the comparisons hub (2026-10-07, founder: make the new pages reachable the way
 * competitors do; this reverses the 2026-09-03 call to keep the comparison pages out of sight).
 * Static; indexable. In app/sitemap.ts and llms.txt; every comparison page links back to it
 * (GtmComparisonPage). Add /compare to scripts/known-urls.txt at ship.
 */

// as /for and the comparison pages: iOS paints the island band from body (foundation.css)
export const viewport: Viewport = { themeColor: "#fbf6f1" };

export const metadata: Metadata = {
  title: COMPARE_META.title,
  description: COMPARE_META.description,
  alternates: { canonical: COMPARE_URL },
  robots: { index: true, follow: true },
  // Share card via lib/social-meta.ts: the shared homepage card, alt = its printed text.
  ...social({ path: COMPARE_PATH, title: COMPARE_META.ogTitle, description: COMPARE_META.description }),
};

export default function Compare() {
  return <ComparePage />;
}
