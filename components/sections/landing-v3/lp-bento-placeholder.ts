import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Placeholder portraits for the bento's quote cards (owner: bento package). They are the V2 file's
 * stock photos (Figma IMAGE 43d3d05d / 90e768c4, 400 × 400, re-encoded WebP): invented people with
 * no licence on file, so they must never be fetchable from pancake.ai. They live outside public/,
 * in ./bento-placeholder/, and are read from disk at render time and inlined as data URIs, the
 * way components/sections/home/HomeUGCWall.tsx reads public/ugc at build time.
 *
 * Only LpBento calls this, and only for a placeholder card, which renders only when
 * SHOW_PLACEHOLDERS (dev, Vercel preview: lib/placeholders.ts). A production build never reads
 * the files, never ships them, never names them in a URL.
 * Server-only: node:fs. Never import this from a client component.
 */
const DIR = join(process.cwd(), "components", "sections", "landing-v3", "bento-placeholder");
const cache = new Map<string, string>();

export function placeholderPortraitSrc(name: "portrait-a" | "portrait-b"): string {
  let uri = cache.get(name);
  if (uri === undefined) {
    try {
      uri = `data:image/webp;base64,${readFileSync(join(DIR, `${name}.webp`)).toString("base64")}`;
    } catch {
      uri = ""; // the blob keeps its Figma base fill (green-20): a preview never breaks over a photo
    }
    cache.set(name, uri);
  }
  return uri;
}
