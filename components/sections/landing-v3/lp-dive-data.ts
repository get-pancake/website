import { GUIDE_PATH } from "@/components/sections/guide-claude/guide-copy";
import type { ContentStatus } from "@/lib/placeholders";

import type { DiveItemId } from "./lp-dive-stages";

/**
 * Deep-dive carousel copy (V2 Figma 4939:3388, "How Pancake finds customers"). Owner: blue-band
 * package. In scripts/homepage-lint.mjs FILES: every string here is linted. The item ids and
 * their order are fixed by lp-dive-stages.ts (DiveItemId, DIVE_ORDER); each stage's alt text
 * comes from its story data module (STORY_<NAME>_ALT), not from here.
 *
 * The four blocks since 2026-10-28 (founder, on the section then titled "How Pancake gets you
 * customers": "encore tres verticalized agents", then his four primitives): "1/ Next best action
 * + Unified GTM context 2/ Buying signal + enrichment 3/ Lead lineage 4/ mcp first".
 * Each item says what the visitor's agent gets: the Brain read in one call, and suggested Plays
 * that start from what already brought leads (context); signals on hiring for the roles a product
 * replaces, on the tools it works with and on funding, work emails on demand, his "30+ data
 * providers" and one bill for all of them (signals); each lead's signal, Play and sources, and a
 * lead already found coming back with a new signal (lineage); the install for Claude and Codex,
 * its tools, and Plays that keep running on their own schedule (mcp). No platform is named. The
 * visitor's agent stays the actor (founder, 2026-10-28): Pancake is the layer under it, so no body
 * says "Pancake suggests".
 *
 * Heading: the designer's "How Pancake finds customers" (V2 4939:3390); on 2026-10-21 "What your
 * agent runs on" (founder: "not clear"); from 2026-10-22 "How Pancake gets you customers", which he
 * kept; since 2026-10-28 "How your agent gets customers", a proposal with the visitor's agent as
 * the actor, waiting on his yes. The 2026-10-22 heading is its fallback. On 2026-10-21 he also
 * asked for no "already live" labels ("dont say 'already live' just push a simple and strong
 * narrative with the key features in this cloud section").
 * The f5 "See example Plays" link is not carried over: the nav (Product) and the footer
 * ("Example Plays") both link /plays.
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

/** the section heading (V2 4939:3390 "How Pancake finds customers", the agent as its actor) */
export const DIVE_TITLE = "How your agent gets customers";

/**
 * THE PHONE SWITCH (≤767; decision 2026-10-11 §9 F3, mobile artboard 5024:8914).
 * - "stack" (the designer's artboard): the four items stacked, all open, no carousel UI; each
 *   item's stage is the DESKTOP 752×489 scene scaled to the column, played once on its own
 *   (lp-play-once) when the visitor reaches it.
 * - "carousel" (the 2026-10-09 phone shell): one stage over the tab list, in the 400×520 box from
 *   599 down. The four stories of 2026-10-28 have no 400×520 composition: flipped, they clip
 *   (README, Scene boxes). Flip it only once they are drawn for that box.
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
    id: "context",
    title: "Your agent knows\nwhat to do next",
    body: "It reads your whole Brain in one call: who buys, your voice, your competitors. Suggested Plays start from what already brought you leads.",
    status: "final",
  },
  {
    id: "signals",
    title: "Buying signals, enriched",
    body: "Find companies hiring for the roles you replace, using the tools you work with, or newly funded. Work emails on demand. 30+ data providers, one bill.",
    status: "final",
  },
  {
    id: "lineage",
    title: "Where every lead came from",
    body: "Each lead remembers the signal and the Play that found it. Every fact keeps its source. A lead you already have comes back when it shows a new signal.",
    status: "final",
  },
  {
    id: "mcp",
    title: "Built for Claude and Codex",
    body: "Your agent creates Plays and reviews leads with about 100 tools. Plays keep running after the chat ends.",
    more: { href: GUIDE_PATH, label: "See how", name: "See how to run Pancake from Claude or Codex" },
    status: "final",
  },
];

/** the Pause control (WCAG 2.2.2: the carousel moves on its own for more than 5 s) */
export const DIVE_PAUSE_LABEL = "Pause the carousel";
