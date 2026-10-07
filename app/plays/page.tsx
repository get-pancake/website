import type { Metadata, Viewport } from "next";

import { PlaysPage } from "@/components/sections/plays/PlaysPage";
import { PLAYS_META } from "@/components/sections/plays/plays-copy";
import { playsDescription } from "@/components/sections/plays/plays-data";
import { PLAYS_URL } from "@/components/sections/plays/plays-jsonld";
import "@/app/_styles/landing-v3.css";
import "./plays.css";

/**
 * /plays — example Plays: the 120 approved /for prompts grouped by how the Play finds people,
 * each linking to its /for page, plus the ways the app finds people that no /for prompt shows
 * yet (audit plan 3.7, 2026-10-07). Static; indexable. In app/sitemap.ts and llms.txt
 * (2026-10-07); the footer link ships with the site-chrome branch; add to scripts/known-urls.txt
 * at ship.
 */

// as /for and the homepage: iOS paints the island band from body (foundation.css)
export const viewport: Viewport = { themeColor: "#fbf6f1" };

export function generateMetadata(): Metadata {
  const description = playsDescription();
  return {
    title: PLAYS_META.title,
    description,
    alternates: { canonical: PLAYS_URL },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      url: PLAYS_URL,
      title: PLAYS_META.ogTitle,
      description,
      // the shared homepage card, so the alt is the text in that image
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: PLAYS_META.ogImageAlt }],
      siteName: "Pancake",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: PLAYS_META.xHandle,
      creator: PLAYS_META.xHandle,
      title: PLAYS_META.ogTitle,
      description,
      images: [{ url: "/og-image.png", alt: PLAYS_META.ogImageAlt }],
    },
  };
}

export default function Plays() {
  return <PlaysPage />;
}
