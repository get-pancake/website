import type { Metadata, Viewport } from "next";

import { SearchLandingPage, searchLandingMetadata } from "@/components/sections/search-landing/SearchLandingPage";
import { SEARCH_LANDINGS } from "@/components/sections/search-landing/search-landing-copy";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/verticals.css";
import "@/app/_styles/guide-claude.css";
import "@/app/_styles/search-landing.css";

/**
 * /chatgpt-for-sales: the ChatGPT twin of /claude-for-sales (2026-11-16), for the ChatGPT Search ads and
 * the ChatGPT-angle tests.
 * Copy: search-landing-copy.ts; page and the noindex decision: SearchLandingPage.tsx. Static.
 */

const c = SEARCH_LANDINGS["chatgpt-for-sales"];

export const dynamic = "force-static";

// as /for and the homepage: iOS paints the island band from body (foundation.css)
export const viewport: Viewport = { themeColor: "#fbf6f1" };

export const metadata: Metadata = searchLandingMetadata(c);

export default function ChatGptForSalesPage() {
  return <SearchLandingPage c={c} />;
}
