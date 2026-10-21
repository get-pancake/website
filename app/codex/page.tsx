import type { Metadata, Viewport } from "next";

import { ConnectPage } from "@/components/sections/guide-claude/ConnectPage";
import { CONNECT_CLIENTS, CONNECT_SHARED } from "@/components/sections/guide-claude/connect-copy";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { OG_IMAGE, social } from "@/lib/social-meta";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/verticals.css";
import "@/app/_styles/guide-claude.css";
import "@/app/_styles/verticals/know.css";

/**
 * /codex — "Connect Pancake to Codex": a short how-to (ConnectPage), linked from the footer's
 * Features column (2026-10-17). Static, indexable, in the sitemap, llms.txt and
 * scripts/known-urls.txt. The share card is the homepage's, as on /claude.
 */

export const dynamic = "force-static";

// as /for and the homepage: iOS paints the island band from body (foundation.css)
export const viewport: Viewport = { themeColor: "#fbf6f1" };

const client = CONNECT_CLIENTS.codex;

export const metadata: Metadata = {
  title: client.meta.title,
  description: client.meta.description,
  alternates: { canonical: `${SITE_ORIGIN}${client.path}` },
  ...social({
    path: client.path,
    title: client.meta.ogTitle,
    description: client.meta.description,
    image: { url: OG_IMAGE, alt: CONNECT_SHARED.ogImageAlt },
  }),
};

export default function CodexPage() {
  return <ConnectPage id="codex" />;
}
