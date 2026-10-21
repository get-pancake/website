import type { Metadata, Viewport } from "next";

import { PlaysSignalPage } from "@/components/sections/plays/PlaysSignalPage";
import { SIGNAL_PAGES, SIGNAL_SHARED } from "@/components/sections/plays/plays-signals";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { OG_IMAGE, social } from "@/lib/social-meta";
import "@/app/_styles/landing-v3.css";
import "../plays.css";
import "../plays-signal.css";

/**
 * /plays/companies-hiring — a signal page of the /plays family (PlaysSignalPage), linked from the
 * footer's Features column (2026-10-17). Its own folder, not a [slug] route, so
 * scripts/url-guard.mjs sees the page. Static, indexable, in the sitemap, llms.txt and
 * scripts/known-urls.txt.
 */

export const dynamic = "force-static";

// as /for and the homepage: iOS paints the island band from body (foundation.css)
export const viewport: Viewport = { themeColor: "#fbf6f1" };

const page = SIGNAL_PAGES.hiring;

export const metadata: Metadata = {
  title: page.meta.title,
  description: page.meta.description,
  alternates: { canonical: `${SITE_ORIGIN}${page.path}` },
  robots: { index: true, follow: true },
  ...social({
    path: page.path,
    title: page.meta.ogTitle,
    description: page.meta.description,
    image: { url: OG_IMAGE, alt: SIGNAL_SHARED.ogImageAlt },
  }),
};

export default function CompaniesHiringPage() {
  return <PlaysSignalPage id="hiring" />;
}
