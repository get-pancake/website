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
 * Each item says what the visitor's agent gets, aligned with the founder's four blocks (and, on
 * 2026-10-28, "not necessarily say what it say but keep things aligned"): the ICP, the voice and
 * the CRM read in one call, then the next account and the Play (context); signals on hiring,
 * funding and site visits, work emails on demand, his "30+ data providers" and one bill (signals);
 * a lead found where the customer's own data and outside signals cross, keeping the signal and the
 * source that found it (lineage, his "la detection croisee de signaux interne externe"); one
 * install in Claude, Claude Code, ChatGPT or Codex and about 100 tools (mcp). No platform is
 * named. The
 * visitor's agent stays the actor (founder, 2026-10-28): Pancake is the layer under it, so no body
 * says "Pancake suggests".
 *
 * Heading: the designer's "How Pancake finds customers" (V2 4939:3390); on 2026-10-21 "What your
 * agent runs on" (founder: "not clear"); from 2026-10-22 "How Pancake gets you customers", which he
 * kept; on 2026-10-28 "How your agent gets customers", a proposal with the visitor's agent as
 * the actor, which he turned down on the preview (2026-10-29: "Not fan of this title and the
 * 'gets customers'. We could find something beter"); since then "What your agent can do with
 * Pancake": the visitor's agent as the subject, as his benchmark heading "Your agent needs 3
 * things to sell.", and what the four blocks show, without "gets customers". One line from 1024
 * px (823 of 928 px at 57.3 px), two on phones as before. On 2026-10-21 he also
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
export const DIVE_TITLE = "What your agent can do with Pancake";

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
    body: "It reads your ICP, your voice and your CRM in one call, then picks the next account to work and the Play to run.",
    status: "final",
  },
  {
    id: "signals",
    title: "Buying signals, enriched",
    body: "Find companies hiring, newly funded or visiting your site. Work emails on demand. 30+ data providers, one bill.",
    status: "final",
  },
  {
    id: "lineage",
    title: "Where every lead came from",
    body: "Your own data crosses with outside signals, and a lead shows up where both meet. Each lead keeps the signal and the source that found it.",
    status: "final",
  },
  {
    id: "mcp",
    title: "Built for Claude and Codex",
    body: "One install in Claude, Claude Code, ChatGPT or Codex. Your agent creates Plays and reviews leads with about 100 tools.",
    more: { href: GUIDE_PATH, label: "See how", name: "See how to run Pancake from Claude or Codex" },
    status: "final",
  },
];

/** the Pause control (WCAG 2.2.2: the carousel moves on its own for more than 5 s) */
export const DIVE_PAUSE_LABEL = "Pause the carousel";
