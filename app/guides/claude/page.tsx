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
 * /guides/claude — the CAMPAIGN page: where the ManyChat DMs send people who comment PANCAKE
 * under a post or an ad (brief by Simon, Sonho, 2026-10-06). "Use Pancake in Claude" with the
 * PANCAKE20 offer: the promo bar, the hero coupon, the code in the FAQ and under the closing
 * button, and one line of the Markdown its Copy buttons hold. Exactly the page that shipped with
 * #321, at the address the DMs carry: those are not going to be edited (founder 2026-10-13).
 * Nothing on the site links here any more (its twin without the offer, /claude, is the one the
 * nav, the footer and the homepage link), and search engines are told to skip it: noindex,
 * canonical to /claude, absent from the sitemap and llms.txt. Static.
 */

export const dynamic = "force-static";

// as /for and the homepage: iOS paints the island band from body (foundation.css)
export const viewport: Viewport = { themeColor: "#fbf6f1" };

export const metadata: Metadata = {
  title: GUIDE_META.title,
  description: GUIDE_META.description,
  alternates: { canonical: `${SITE_ORIGIN}${GUIDE_PATH}` },
  robots: { index: false, follow: true },
  // the homepage card (brief §2), so the alt describes that image
  ...social({
    path: GUIDE_OFFER_PATH,
    title: GUIDE_META.ogTitle,
    description: GUIDE_META.description,
    image: { url: OG_IMAGE, alt: GUIDE_META.ogImageAlt },
  }),
};

export default function GuideClaudeCampaignPage() {
  const markdown = readFileSync(path.join(process.cwd(), "public/guides/claude.md"), "utf8");
  return <GuidePage markdown={withOfferMarkdown(markdown)} offer />;
}
