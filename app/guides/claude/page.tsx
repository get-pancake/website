import { readFileSync } from "node:fs";
import path from "node:path";

import type { Metadata, Viewport } from "next";

import { GUIDE_META, GUIDE_PATH } from "@/components/sections/guide-claude/guide-copy";
import { GuidePage } from "@/components/sections/guide-claude/GuidePage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/verticals.css";
import "@/app/_styles/guide-claude.css";

/**
 * /guides/claude — "Use Pancake in Claude", where the ManyChat DMs send people who comment
 * PANCAKE under a post or an ad. Static. Its agent twin, public/guides/claude.md, is served at
 * /guides/claude.md as text/markdown and read here at build time, so both "Copy" buttons hold
 * the whole file inline (no fetch on click: the Instagram in-app browser would block the copy).
 */

export const dynamic = "force-static";

// as /for and the homepage: iOS paints the island band from body (foundation.css)
export const viewport: Viewport = { themeColor: "#fbf6f1" };

const url = `${SITE_ORIGIN}${GUIDE_PATH}`;

export const metadata: Metadata = {
  title: GUIDE_META.title,
  description: GUIDE_META.description,
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    url,
    title: GUIDE_META.title,
    description: GUIDE_META.description,
    // the homepage card (brief §2), so the alt describes that image
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "You run your company. We bring you customers." }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: GUIDE_META.title,
    description: GUIDE_META.description,
    images: ["/og-image.png"],
  },
};

export default function GuideClaudePage() {
  const markdown = readFileSync(path.join(process.cwd(), "public/guides/claude.md"), "utf8");
  return <GuidePage markdown={markdown} />;
}
