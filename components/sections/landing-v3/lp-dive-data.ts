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
 * - sources: until 2026-10-13 V2's body with "experts" for "influencers" ("Choose the keywords,
 *   competitors, experts, hiring activity, and tech stacks that matter. Pancake finds matching
 *   buyers and keeps the source attached."). Since then it names what its story now shows
 *   (founder: "use our most known data providers"): three of the six providers the product
 *   itself names to its users (pancake-cmo apps/frontend vendor-logo.tsx), in their spelling.
 * - message: not in Figma → production f2 body (founder-approved 2026-10-07), with one example
 *   changed on 2026-10-13: its third signal read "a new tool", which no conversation of the
 *   reworked story shows (a post, an open role, a seed round, a rebrand). Now "a funding round".
 * - learns: not in Figma → production f4 body.
 * - claude: not in Figma → the story-claude line, plus "See how →" to the Claude guide (the
 *   crawlable route the demo tour's "Works in Claude and Codex" link used to carry).
 * The f5 "See example Plays" link is not carried over: the nav (Product) and the footer
 * ("Example Plays") both link /plays.
 *
 * The infra-first page (2026-10-21, founder: "The cloud part detailing features should stay below
 * this thing but repurposed for infra! we should keep those clouds but change what we say"): the
 * same four stories and stages, said as what an agent runs on — the data (one door to the
 * providers), the tools (your own accounts), the Brain (it learns, and your agent can read it),
 * and the agent itself. Heading "What your agent runs on".
 *
 * Wrap budget: a body is at most 4 lines at 272px / 13.333px Geist (~170 characters), or the
 * active list (anchored at the row's top 17.5) outgrows the 489 row.
 */

export type DiveItem = {
  id: DiveItemId;
  /** "\n" = the designed line break (the two-column layouts and the phone stack, where the
      artboard keeps it; the tablet list reflows) */
  title: string;
  body: string;
  /** one quiet text link under the body, shown while the item is active (always, in the phone
      stack). `name` = its accessible name: where the link goes, read out of context (a links
      list, a tab stop). It starts with the visible label (WCAG 2.5.3 Label in Name). */
  more?: { href: string; label: string; name: string };
  /** s on the end picture before advancing (decision: one global 2.0 s) */
  hold?: number;
  status: ContentStatus;
};

/** the section heading (production copy, = V2 4939:3390) */
export const DIVE_TITLE = "What your agent runs on";

/**
 * THE PHONE SWITCH (≤767; decision 2026-10-11 §9 F3, mobile artboard 5024:8914).
 * - "stack" (the designer's artboard): the four items stacked, all open, no carousel UI; each
 *   item's stage is the DESKTOP 752×489 scene scaled to the column, played once on its own
 *   (lp-play-once) when the visitor reaches it.
 * - "carousel" (the 2026-10-09 phone build): one stage over the tab list, the 400×520 phone
 *   recompositions of the four stories from 599 down. Still in the code, this constant away.
 * LpDive writes it on the section (data-lp-phone); dive.css and lp-dive-carousel.ts key off it.
 */
export const DIVE_PHONE_LAYOUT: "stack" | "carousel" = "stack";

/** s each item holds its end picture before the carousel advances (critic C10: one global hold) */
export const DIVE_HOLD_S = 2;
/** s the bar runs for an item whose timeline has nothing to play (a build that threw, an empty
    stage): reading time on its picture */
export const DIVE_FALLBACK_S = 6;

export const DIVE_ITEMS: readonly DiveItem[] = [
  {
    id: "sources",
    title: "30+ data providers, one door",
    body: "Funding rounds, open roles and tech stacks from Dealroom, TheirStack, Wappalyzer and more, behind one sign-in. Every lead shows where it came from.",
    status: "final",
  },
  {
    id: "message",
    title: "Personal messages from\nyour own accounts",
    body: "Pancake opens with their signal: a post, an open role, a funding round. Messages go out under your name. Edit any draft before it sends.",
    status: "final",
  },
  {
    id: "learns",
    title: "The Brain learns\nfrom what wins",
    body: "Approve or reject a lead and the Brain learns who fits. Every Play tracks contacts, replies and wins, and your agent can read them.",
    status: "final",
  },
  {
    id: "claude",
    title: "Run it from Claude or Codex",
    body: "Connect Claude or Codex with a browser sign-in. Your agent builds Plays, reviews leads and edits messages on the same workspace as the app.",
    more: { href: GUIDE_PATH, label: "See how", name: "See how to run Pancake from Claude or Codex" },
    status: "final",
  },
];

/** the Pause control (WCAG 2.2.2: the carousel moves on its own for more than 5 s) */
export const DIVE_PAUSE_LABEL = "Pause the carousel";
