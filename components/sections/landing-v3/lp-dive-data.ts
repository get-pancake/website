import type { ContentStatus } from "@/lib/placeholders";

import type { DiveItemId } from "./lp-dive-stages";

/**
 * Deep-dive carousel items (V2 Figma 4939:3388): titles, bodies, hold times. Owner: blue-band
 * package. In scripts/homepage-lint.mjs FILES. The item ids and order are fixed by
 * lp-dive-stages.ts (DiveItemId, DIVE_ORDER); the alt texts come from the story data modules.
 *
 * Phase 0 stub: the item type only.
 */
export type DiveItem = {
  id: DiveItemId;
  title: string;
  body: string;
  /** s on the end picture before advancing (decision: one global 2.0 s) */
  hold?: number;
  status: ContentStatus;
};
