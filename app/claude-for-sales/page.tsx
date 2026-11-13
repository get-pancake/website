import type { Metadata, Viewport } from "next";

import { SearchLandingPage, searchLandingMetadata } from "@/components/sections/search-landing/SearchLandingPage";
import { SEARCH_LANDINGS } from "@/components/sections/search-landing/search-landing-copy";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/verticals.css";
import "@/app/_styles/guide-claude.css";
import "@/app/_styles/search-landing.css";

/**
 * /claude-for-sales: where the Google Search ads for Claude for sales searches land (2026-11-13).
 * Copy: search-landing-copy.ts; page and the noindex decision: SearchLandingPage.tsx. Static.
 */

const c = SEARCH_LANDINGS["claude-for-sales"];

export const dynamic = "force-static";

// as /for and the homepage: iOS paints the island band from body (foundation.css)
export const viewport: Viewport = { themeColor: "#fbf6f1" };

export const metadata: Metadata = searchLandingMetadata(c);

export default function ClaudeForSalesPage() {
  return <SearchLandingPage c={c} />;
}
