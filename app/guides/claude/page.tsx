import { readFileSync } from "node:fs";
import path from "node:path";

import type { Metadata, Viewport } from "next";

import { GUIDE_MD_PATH, GUIDE_META, GUIDE_PATH } from "@/components/sections/guide-claude/guide-copy";
import { GuidePage } from "@/components/sections/guide-claude/GuidePage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { OG_IMAGE, social } from "@/lib/social-meta";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/verticals.css";
import "@/app/_styles/guide-claude.css";

/**
 * /guides/claude — "Use Pancake in Claude", where the ManyChat DMs send people who comment
 * PANCAKE under a post or an ad. Static. Its agent twin, public/guides/claude.md, is served at
 * /guides/claude.md as text/markdown and read here at build time, so both "Copy" buttons hold
 * the whole file inline (no fetch on click: the Instagram in-app browser would block the copy).
 * 2026-10-07 (audit 7.7, 8.5): the head announces that twin (<link rel="alternate"
 * type="text/markdown">), the title names Claude Code, Codex and MCP, and the share card gets its
 * own og:title and a twitter:image:alt. The image stays the homepage card (brief §2).
 * The og/twitter blocks come from lib/social-meta.ts (audit 8.1: twitter:site, og:locale).
 */

export const dynamic = "force-static";

// as /for and the homepage: iOS paints the island band from body (foundation.css)
export const viewport: Viewport = { themeColor: "#fbf6f1" };

const url = `${SITE_ORIGIN}${GUIDE_PATH}`;

export const metadata: Metadata = {
  title: GUIDE_META.title,
  description: GUIDE_META.description,
  alternates: { canonical: url, types: { "text/markdown": `${SITE_ORIGIN}${GUIDE_MD_PATH}` } },
  // the homepage card (brief §2), so the alt describes that image
  ...social({
    path: GUIDE_PATH,
    title: GUIDE_META.ogTitle,
    description: GUIDE_META.description,
    image: { url: OG_IMAGE, alt: GUIDE_META.ogImageAlt },
  }),
};

export default function GuideClaudePage() {
  const markdown = readFileSync(path.join(process.cwd(), "public/guides/claude.md"), "utf8");
  return <GuidePage markdown={markdown} />;
}
