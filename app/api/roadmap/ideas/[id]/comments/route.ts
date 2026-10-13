import { NextResponse } from "next/server";

import { ROADMAP_POSTING_OPEN, type RoadmapComment } from "@/components/sections/roadmap/roadmap-data";
import { isAdmin } from "@/lib/auth/admin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isServiceConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

const SELECT = "id, idea_id, author_name, body, created_at";

type CommentRow = {
  id: string;
  idea_id: string;
  author_name: string | null;
  body: string;
  created_at: string;
};

function mapComment(row: CommentRow): RoadmapComment {
  return {
    id: row.id,
    ideaId: row.idea_id,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at,
  };
}

/** List comments for an idea (oldest first — reads like a conversation). */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isServiceConfigured()) {
    return NextResponse.json({ comments: [] });
  }
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ comments: [] });

  const { data, error } = await admin
    .from("comments")
    .select(SELECT)
    .eq("idea_id", params.id)
    .order("created_at", { ascending: true });

  // Fail-soft: an empty list (e.g. before migration 0002 creates the table)
  // reads as "no comments yet" rather than surfacing an error in the modal.
  if (error || !data) {
    return NextResponse.json({ comments: [] });
  }
  return NextResponse.json({ comments: (data as CommentRow[]).map(mapComment) });
}

/**
 * Post a comment. Open to anyone (no login), guarded by a honeypot + per-IP
 * rate limit + validation. Writes via the service-role client.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  // Paused for visitors (ROADMAP_POSTING_OPEN); a signed-in admin still comments. Checked first, so
  // a paused board answers 403 whatever the backend's state.
  if (!ROADMAP_POSTING_OPEN && !(await isAdmin())) {
    return NextResponse.json({ error: "Comments are paused for now. You can still vote." }, { status: 403 });
  }
  if (!isServiceConfigured()) {
    return NextResponse.json({ error: "Roadmap backend is not configured." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot — pretend success so bots don't learn they were caught.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`roadmap:comment:${ip}`, 15, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "You're commenting too fast. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const text = typeof body.body === "string" ? body.body.trim() : "";
  const authorRaw = typeof body.authorName === "string" ? body.authorName.trim() : "";
  if (text.length < 1 || text.length > 2000) {
    return NextResponse.json({ error: "Comment must be 1–2000 characters." }, { status: 400 });
  }
  const authorName = authorRaw ? authorRaw.slice(0, 80) : null;

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Roadmap backend is not configured." }, { status: 503 });
  }

  const { data, error } = await admin
    .from("comments")
    .insert({ idea_id: params.id, body: text, author_name: authorName })
    .select(SELECT)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Could not post your comment. Try again." }, { status: 500 });
  }
  return NextResponse.json({ comment: mapComment(data as CommentRow) }, { status: 201 });
}
