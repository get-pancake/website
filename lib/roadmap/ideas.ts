import "server-only";

import {
  SEED_IDEAS,
  type RoadmapIdea,
  type RoadmapStatus,
  type RoadmapTag,
} from "@/components/sections/roadmap/roadmap-data";
import { isBackendConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Raw `ideas` row shape from Supabase. (comment_count added in migration 0002.) */
type IdeaRow = {
  id: string;
  title: string;
  description: string;
  tag: RoadmapTag;
  status: RoadmapStatus;
  author_name: string | null;
  vote_count: number;
  comment_count?: number;
};

export function mapIdeaRow(row: IdeaRow): RoadmapIdea {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    tag: row.tag,
    status: row.status,
    authorName: row.author_name,
    voteCount: row.vote_count,
    commentCount: row.comment_count ?? 0,
  };
}

/** Visitor ideas that name the outreach platform stay off the public board (founder 2026-09-29,
 *  "vitrine plus compliant": the site never names it, and a visitor's post would). They stay in
 *  Supabase, admins still see them on the board, and they come back if the text is edited.
 *  Same pattern as PLATFORM in lib/verticals/validate.ts. */
const OFF_BOARD = /linked\s*in|sales\s*nav(igator)?\b|\binmails?\b/i;

export function isPublicIdea(idea: RoadmapIdea): boolean {
  return !OFF_BOARD.test(`${idea.title} ${idea.description}`);
}

export type IdeasResult = {
  ideas: RoadmapIdea[];
  /** Where the data came from — drives the "preview mode" notice + UI gating. */
  source: "supabase" | "seed";
  /** True when the fetch hit FETCH_LIMIT (more rows exist than were returned). */
  truncated: boolean;
};

/**
 * Fetch ideas for the page. Falls back to the static seed (read-only) whenever
 * Supabase isn't configured or the query fails, so the page always renders.
 */
export async function getIdeas(): Promise<IdeasResult> {
  if (!isBackendConfigured()) {
    return { ideas: SEED_IDEAS, source: "seed", truncated: false };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return { ideas: SEED_IDEAS, source: "seed", truncated: false };

  // Cap the fetch so the client (which filters/searches/sorts in-memory) stays
  // bounded. The board paginates this set with a "Show more" control. If the
  // board ever outgrows this, move filtering + pagination server-side.
  const FETCH_LIMIT = 500;
  const baseCols = "id, title, description, tag, status, author_name, vote_count";

  const run = (cols: string) =>
    supabase
      .from("ideas")
      .select(cols)
      .order("vote_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(FETCH_LIMIT);

  let res = await run(`${baseCols}, comment_count`);
  // Resilience: if migration 0002 (comment_count) hasn't run yet, retry without
  // it so the board still shows real data instead of falling back to seed.
  if (res.error) {
    res = await run(baseCols);
  }

  const data = res.data as IdeaRow[] | null;
  if (res.error || !data) {
    return { ideas: SEED_IDEAS, source: "seed", truncated: false };
  }

  return {
    ideas: (data as IdeaRow[]).map(mapIdeaRow),
    source: "supabase",
    truncated: data.length >= FETCH_LIMIT,
  };
}
