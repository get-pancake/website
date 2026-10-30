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

/**
 * The shared share card: the homepage's rainbow card, printing the hero H1.
 * 2026-10-13 (founder, launch audit): the card and its title follow the H1; they printed
 * "You run your company. We bring you customers." until then, then "Deploy GTM ideas that
 * bring you customers" (og-image-2026-10.png). 2026-10-27: the new H1, "Infrastructure to
 * run your GTM factory", set as the card was drawn (Aeonik Condensed 600, 82 px, line pitch
 * 96, left 109, tracking -0.0206em, #2c002a on #fbf6f1; the rainbow untouched), then on
 * 2026-10-28 "Infrastructure powering your GTM factory" the same way (og-image-2026-10-28.png;
 * its longer first line still stops 72 px before the rainbow at 82 px), then the same evening
 * "Infrastructure to power your GTM factory" (founder: "might be better en fait";
 * og-image-2026-10-28b.png, redrawn over the same card: first line 92 px before the rainbow),
 * and on 2026-10-30 "Infrastructure powering" again (a co-founder asked "to power or
 * powering?" on the preview; the founder: "Switch to 'powering'"): the 2026-10-28 card is
 * back, its rainbow byte for byte the other cards'. The file has
 * a NEW name because chat apps and social networks keep a picture by its address: the same
 * address would keep showing the old headline. /og-image.png holds the same new picture,
 * for any page or post that still points at it. When this card changes again: new file
 * name here, and the app's own copy too (pancake-cmo apps/frontend/index.html).
 */
export const OG_IMAGE = "/og-image-2026-10-28.png";

/** Alt text = the text printed in the card (audit 8.4), never the page's own name. */
export const OG_IMAGE_ALT = "Infrastructure powering your GTM factory";

/** og:title / twitter:title of the homepage and of the root-layout fallback (one
 *  punctuation for both, audit 6.13). The homepage <title> stays exactly "Pancake". */
export const HOME_SOCIAL_TITLE = "Pancake — Infrastructure powering your GTM factory";

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
