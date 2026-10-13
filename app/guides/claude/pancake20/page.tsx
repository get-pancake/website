import { readFileSync } from "node:fs";
import path from "node:path";

import type { Metadata, Viewport } from "next";

import {
  GUIDE_META,
  GUIDE_OFFER_PATH,
  GUIDE_PATH,
  withOfferMarkdown,
} from "@/components/sections/guide-claude/guide-copy";
import { GuidePage } from "@/components/sections/guide-claude/GuidePage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { OG_IMAGE, social } from "@/lib/social-meta";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/verticals.css";
import "@/app/_styles/guide-claude.css";

/**
 * /guides/claude/pancake20 — the campaign copy of "Use Pancake in Claude": where the ManyChat
 * DMs send people who comment PANCAKE under a post or an ad (brief by Simon, Sonho, 2026-10-06).
 * The same page as ../page.tsx plus the PANCAKE20 offer: the promo bar, the hero coupon, the
 * code in the FAQ and under the closing button, and one line of the Markdown its Copy buttons
 * hold. Split from the guide on 2026-10-13 (founder: the code "should not appear on a page
 * accessible from the main landing page").
 * Nothing on the site links here and search engines are told to skip it: noindex, canonical to
 * the guide, absent from the sitemap and llms.txt. DMs sent before the split link to the guide;
 * its bridge script forwards those arrivals here (GuidePage OFFER_BRIDGE_JS).
 */

export const dynamic = "force-static";

export const viewport: Viewport = { themeColor: "#fbf6f1" };

export const metadata: Metadata = {
  title: GUIDE_META.title,
  description: GUIDE_META.description,
  alternates: { canonical: `${SITE_ORIGIN}${GUIDE_PATH}` },
  robots: { index: false, follow: true },
  ...social({
    path: GUIDE_OFFER_PATH,
    title: GUIDE_META.ogTitle,
    description: GUIDE_META.description,
    image: { url: OG_IMAGE, alt: GUIDE_META.ogImageAlt },
  }),
};

export default function GuideClaudeOfferPage() {
  const markdown = readFileSync(path.join(process.cwd(), "public/guides/claude.md"), "utf8");
  return <GuidePage markdown={withOfferMarkdown(markdown)} offer />;
}
