import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import { VxPage } from "@/components/sections/verticals/VxPage";
import { VX_META } from "@/components/sections/verticals/vx-copy";
import { VERTICAL_SLUGS, getVertical, isApproved, verticalUrl } from "@/lib/verticals";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/verticals.css";

/**
 * /for/<vertical> — one static page per VerticalConfig (spec §8). Every slug
 * in the registry is prerendered (drafts included, noindex); anything else
 * 404s (dynamicParams = false). Build output: ● /for/[vertical] × N.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return VERTICAL_SLUGS.map((vertical) => ({ vertical }));
}

// as /agents and the homepage: iOS paints the island band from body (foundation.css)
export const viewport: Viewport = { themeColor: "#fbf6f1" };

export function generateMetadata({ params }: { params: { vertical: string } }): Metadata {
  const v = getVertical(params.vertical);
  if (!v) return {};
  const url = verticalUrl(v);
  const ogTitle = VX_META.ogTitle(v);
  return {
    // VX_TITLE_MODE (vx-copy.ts): founder 2026-09-22 — descriptive SEO titles on
    // /for pages ("Pancake for Recruiting Agencies: Find Companies Hiring");
    // the homepage, /agents and /demo keep exactly "Pancake".
    title: VX_META.title(v),
    description: v.hero.lede,
    alternates: { canonical: url },
    robots: isApproved(v) ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type: "website",
      url,
      title: ogTitle,
      description: v.hero.lede,
      // the shared homepage card, so the alt describes that image, not this page
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: VX_META.ogImageAlt }],
      siteName: "Pancake",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: v.hero.lede,
      images: [{ url: "/og-image.png", alt: VX_META.ogImageAlt }],
    },
  };
}

export default function VerticalPage({ params }: { params: { vertical: string } }) {
  const v = getVertical(params.vertical);
  if (!v) notFound();
  return <VxPage v={v} />;
}
