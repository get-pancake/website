import type { Metadata } from "next";

import { SITE_ORIGIN } from "@/lib/site-config.mjs";

/**
 * Share-card metadata (og:* and twitter:*) for every route, in one place
 * (2026-10-07, audit 8.1).
 *
 * Why a helper: Next 14 replaces a parent's `openGraph` and `twitter` objects
 * wholesale when a route sets its own, so a field set only in the root layout
 * (twitter:site, og:locale) vanishes on every page with its own card. Spread
 * `...social({...})` into a route's metadata instead of writing the two
 * blocks by hand.
 *
 * No `%s · Pancake` title template on purpose: page titles already carry their
 * own brand suffix (or none, like the homepage's exact "Pancake").
 */

/** The brand X account: the footers' x.com/getpancake_ai link and the Organization sameAs. */
export const X_HANDLE = "@getpancake_ai";

/** The shared share card: the homepage's rainbow card. */
export const OG_IMAGE = "/og-image.png";

/** Alt text = the text printed in /og-image.png (audit 8.4), never the page's own name. */
export const OG_IMAGE_ALT = "You run your company. We bring you customers.";

/** og:title / twitter:title of the homepage and of the root-layout fallback (one
 *  punctuation for both, audit 6.13). The homepage <title> stays exactly "Pancake". */
export const HOME_SOCIAL_TITLE = "Pancake — You run your company. We bring you customers.";

export type SocialImage = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  type?: string;
};

/** The default card, with the size and type both platforms read. */
export const DEFAULT_SOCIAL_IMAGE: SocialImage = {
  url: OG_IMAGE,
  alt: OG_IMAGE_ALT,
  width: 1200,
  height: 630,
  type: "image/png",
};

type SocialInput = {
  /** Route path ("" for the homepage, "/pricing"…). Omit it only in the root
   *  layout: an og:url there would be inherited by every route without a card. */
  path?: string;
  title: string;
  description: string;
  /** Defaults to the shared homepage card. Pass the alt of the image actually shown. */
  image?: SocialImage;
  /** Blog posts: og:type "article" plus its dates and byline. */
  article?: { publishedTime?: string; modifiedTime?: string; authors?: string[] };
};

export function social({
  path,
  title,
  description,
  image,
  article,
}: SocialInput): Pick<Metadata, "openGraph" | "twitter"> {
  const card = { ...DEFAULT_SOCIAL_IMAGE, ...image };
  const shared = {
    ...(path !== undefined && { url: `${SITE_ORIGIN}${path}` }),
    title,
    description,
    siteName: "Pancake",
    locale: "en_US",
    images: [card],
  };
  return {
    openGraph: article ? { ...shared, type: "article", ...article } : { ...shared, type: "website" },
    twitter: {
      card: "summary_large_image",
      site: X_HANDLE,
      creator: X_HANDLE,
      title,
      description,
      images: [card],
    },
  };
}
