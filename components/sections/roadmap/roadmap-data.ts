/**
 * Open roadmap — shared types, labels, and fallback seed.
 *
 * When Supabase is configured the board renders live rows; when it isn't
 * (local dev / preview without env), the page falls back to SEED_IDEAS so it
 * still renders read-only. The seed started as a copy of
 * supabase/migrations/0001_roadmap.sql; its V1 rows were removed 2026-10-07.
 *
 * This module is import-safe from both server and client code (no secrets,
 * no server-only imports).
 */
import type { BadgeVariant } from "@/components/ui/Badge";

export type RoadmapStatus =
  | "open"
  | "planned"
  | "in-progress"
  | "shipped"
  | "wont-do";

/** Tab = tag. `all` is the catch-all view, not a real tag on an idea. */
export type RoadmapTag = "squads" | "core-features" | "integrations";

export type RoadmapTab = "all" | RoadmapTag;

/** Shape used throughout the UI — mirrors a row of the `ideas` table. */
export type RoadmapIdea = {
  id: string;
  title: string;
  description: string;
  tag: RoadmapTag;
  status: RoadmapStatus;
  authorName: string | null;
  voteCount: number;
  commentCount: number;
};

/** A comment on an idea — mirrors a row of the `comments` table. */
export type RoadmapComment = {
  id: string;
  ideaId: string;
  authorName: string | null;
  body: string;
  createdAt: string;
};

export const TAGS: RoadmapTag[] = ["squads", "core-features", "integrations"];
export const STATUSES: RoadmapStatus[] = [
  "open",
  "planned",
  "in-progress",
  "shipped",
  "wont-do",
];

/** Top-level tabs, in display order. Drives nav + filtering. */
export const ROADMAP_TABS: { id: RoadmapTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "squads", label: "Squads" },
  { id: "core-features", label: "Core features" },
  { id: "integrations", label: "Integrations" },
];

/** Per-tag display label, used on cards, the tag pill, and the create form. */
export const TAG_LABELS: Record<RoadmapTag, string> = {
  squads: "Squads",
  "core-features": "Core features",
  integrations: "Integrations",
};

/**
 * Status → label + Badge variant. The design system has no blue, so "planned"
 * maps to the purple brand accent (closest to the PRD's blue); the rest follow
 * the PRD's gray / yellow / green / red.
 */
export const STATUS_META: Record<
  RoadmapStatus,
  { label: string; variant: BadgeVariant }
> = {
  open: { label: "Open", variant: "neutral" },
  planned: { label: "Planned", variant: "brand-alt-1" },
  "in-progress": { label: "In progress", variant: "brand-alt-2" },
  shipped: { label: "Shipped", variant: "success" },
  "wont-do": { label: "Won't do", variant: "negative" },
};

/** Type guards for validating untrusted input on the server. */
export function isRoadmapTag(value: unknown): value is RoadmapTag {
  return typeof value === "string" && (TAGS as string[]).includes(value);
}
export function isRoadmapStatus(value: unknown): value is RoadmapStatus {
  return typeof value === "string" && (STATUSES as string[]).includes(value);
}

/**
 * Fallback seed (used only when Supabase isn't configured, or its query
 * fails). Ordered by votes; the board re-sorts client-side so this order is
 * just a sensible default.
 *
 * 2026-10-07: the V1 rows are gone — the squads (UX research, an "Email
 * agent squad" set to In progress, Growth), and the ideas built on them
 * (Linear sync and Slack actions run by a squad, shared squad memory, Notion
 * import into it, voice standups). They pitched a product Pancake no longer
 * is, and the fallback would bring them back whenever the live query failed.
 * The seed no longer mirrors supabase/migrations/0001_roadmap.sql; what is
 * left is about the board itself. Plays-era ideas are founder decision D14.
 */
const SEED_IDEAS_RAW: Omit<RoadmapIdea, "commentCount">[] = [
  {
    id: "seed-kanban-roadmap-view",
    title: "Kanban roadmap view",
    description:
      "A board grouped by status (Open → Planned → In progress → Shipped) so anyone can see what the company is building at a glance.",
    tag: "core-features",
    status: "planned",
    authorName: "Camille",
    voteCount: 37,
  },
  {
    id: "seed-downvotes",
    title: "Downvotes on ideas",
    description:
      "Let people downvote ideas they disagree with, not just upvote the ones they like.",
    tag: "core-features",
    status: "wont-do",
    authorName: null,
    voteCount: 12,
  },
];

/** Preview-mode fallback has no real comments, so every seed gets count 0. */
export const SEED_IDEAS: RoadmapIdea[] = SEED_IDEAS_RAW.map((idea) => ({
  ...idea,
  commentCount: 0,
}));
