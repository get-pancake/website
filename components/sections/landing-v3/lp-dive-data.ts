import { GUIDE_PATH } from "@/components/sections/guide-claude/guide-copy";
import type { ContentStatus } from "@/lib/placeholders";

import type { DiveItemId } from "./lp-dive-stages";

/**
 * Deep-dive carousel copy (V2 Figma 4939:3388, "How Pancake finds customers"). Owner: blue-band
 * package. In scripts/homepage-lint.mjs FILES: every string here is linted. The item ids and
 * their order are fixed by lp-dive-stages.ts (DiveItemId, DIVE_ORDER); each stage's alt text
 * comes from its story data module (STORY_<NAME>_ALT), not from here.
 *
 * Copy (decision 2026-10-09 §5):
 * - sources: V2's body with "experts" for "influencers" (the product term, production's signal
 *   list 2026-10-07).
 * - message: not in Figma → production f2 body (founder-approved 2026-10-07).
 * - learns: not in Figma → production f4 body.
 * - claude: not in Figma → the story-claude line, plus "See how →" to the Claude guide (the
 *   crawlable route the demo tour's "Works in Claude and Codex" link used to carry).
 * The f5 "See example Plays" link is not carried over: the nav (Product) and the footer
 * ("Example Plays") both link /plays.
 *
 * Wrap budget: a body is at most 4 lines at 272px / 13.333px Geist (~170 characters), or the
 * active list (anchored at the row's top 17.5) outgrows the 489 row.
 */

export type DiveItem = {
  id: DiveItemId;
  /** "\n" = the designed line break (two-column layouts only; stacked layouts reflow) */
  title: string;
  body: string;
  /** one quiet text link under the body, shown while the item is active */
  more?: { href: string; label: string };
  /** s on the end picture before advancing (decision: one global 2.0 s) */
  hold?: number;
  status: ContentStatus;
};

/** the section heading (production copy, = V2 4939:3390) */
export const DIVE_TITLE = "How Pancake finds customers";

/** s each item holds its end picture before the carousel advances (critic C10: one global hold) */
export const DIVE_HOLD_S = 2;
/** s the bar runs for an item whose timeline has nothing to play (a build that threw, an empty
    stage): reading time on its picture */
export const DIVE_FALLBACK_S = 6;

export const DIVE_ITEMS: readonly DiveItem[] = [
  {
    id: "sources",
    title: "Sources you can trust",
    body: "Choose the keywords, competitors, experts, hiring activity, and tech stacks that matter. Pancake finds matching buyers and keeps the source attached.",
    status: "final",
  },
  {
    id: "message",
    title: "A personal message for\nevery lead",
    body: "Pancake opens with their signal: a post, an open role, a new tool. Each sequence has its own language and tone. Edit any draft before it sends.",
    status: "final",
  },
  {
    id: "learns",
    title: "Pancake learns from what wins",
    body: "Approve or reject a lead and your brain learns who fits. Each Play tracks contacts, replies and wins, so you see what works.",
    status: "final",
  },
  {
    id: "claude",
    title: "Run it from Claude or Codex",
    body: "Connect Pancake to Claude or Codex with a browser sign-in. Build Plays, review leads and edit messages from the chat you already use.",
    more: { href: GUIDE_PATH, label: "See how" },
    status: "final",
  },
];

/** the keyboard Pause control (WCAG 2.2.2: the carousel moves on its own for more than 5 s) */
export const DIVE_PAUSE_LABEL = "Pause the carousel";
