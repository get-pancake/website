import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { BentoPlaceholderImage } from "@/components/sections/landing-v3/lp-bento-data";

/**
 * Stand-in images for the bento's placeholder cards (owner: bento package): a still that fills a
 * card while the customer's real asset is not on disk. A stand-in is a layout aid and must never
 * be fetchable from pancake.ai: it lives outside public/, in ./bento-placeholder/<name>.webp, and
 * is read from disk at render time and inlined as a data URI, the way
 * components/sections/home/HomeUGCWall.tsx reads public/ugc at build time.
 *
 * None today: all seven cards are final since 2026-10-12 (the Kinro stills that used this are
 * gone, and the folder with them). The loader stays so the next card that has to wait is one
 * file and one data entry (lp-bento-data.ts: `{ placeholder: "<name>" }` on a card whose status
 * is "placeholder").
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
