import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { BentoPlaceholderImage } from "@/components/sections/landing-v3/lp-bento-data";

/**
 * Stand-in images for the bento's placeholder cards (owner: bento package). Today: the two INTERIM
 * stills of Pierre-Alexandre Kamienny (Kinro), taken from the merged testimonial compilation while
 * his individual cut is not on disk (artifacts/landing-v2-figma/assets/bento-real/, files prefixed
 * INTERIM-). They are layout stand-ins, soft at 2x, and must never be fetchable from pancake.ai:
 * they live outside public/, in ./bento-placeholder/, and are read from disk at render time and
 * inlined as data URIs, the way components/sections/home/HomeUGCWall.tsx reads public/ugc at
 * build time.
 *
 * Only LpBento calls this, and only for a placeholder card, which renders only when
 * SHOW_PLACEHOLDERS (dev, Vercel preview: lib/placeholders.ts). A production build never reads
 * the files, never ships them, never names them in a URL.
 * Server-only: node:fs. Never import this from a client component.
 */
const DIR = join(process.cwd(), "components", "sections", "landing-v3", "bento-placeholder");
const cache = new Map<string, string>();

export function placeholderImageSrc(name: BentoPlaceholderImage): string {
  let uri = cache.get(name);
  if (uri === undefined) {
    try {
      uri = `data:image/webp;base64,${readFileSync(join(DIR, `${name}.webp`)).toString("base64")}`;
    } catch {
      uri = ""; // the tile keeps its base fill: a preview never breaks over a missing stand-in
    }
    cache.set(name, uri);
  }
  return uri;
}
