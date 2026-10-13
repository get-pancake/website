import { NextResponse } from "next/server";

import { ROADMAP_POSTING_OPEN, isRoadmapTag } from "@/components/sections/roadmap/roadmap-data";
import { isAdmin } from "@/lib/auth/admin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { mapIdeaRow } from "@/lib/roadmap/ideas";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isServiceConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

const IDEA_SELECT = "id, title, description, tag, status, author_name, vote_count";

/**
 * Create an idea. Open to anyone (no login), guarded by:
 *   1. a honeypot field (`website`) — bots fill it, humans never see it
 *   2. a per-IP rate limit (5 / 10 min)
 *   3. server-side validation
 * Writes go through the service-role client (anon role has no insert rights).
 */
export async function POST(request: Request) {
  // Paused for visitors (ROADMAP_POSTING_OPEN); a signed-in admin still posts. Checked first, so
  // a paused board answers 403 whatever the backend's state.
  if (!ROADMAP_POSTING_OPEN && !(await isAdmin())) {
    return NextResponse.json({ error: "New ideas are paused for now. You can still vote." }, { status: 403 });
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

  // Honeypot: pretend success so bots don't learn they were caught.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`roadmap:create:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "You're posting too fast. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const tag = body.tag;
  const authorRaw = typeof body.authorName === "string" ? body.authorName.trim() : "";

  if (title.length < 3 || title.length > 255) {
    return NextResponse.json({ error: "Title must be 3–255 characters." }, { status: 400 });
  }
  if (description.length > 4000) {
    return NextResponse.json({ error: "Description is too long (4000 char max)." }, { status: 400 });
  }
  if (!isRoadmapTag(tag)) {
    return NextResponse.json({ error: "Pick a valid category." }, { status: 400 });
  }
  const authorName = authorRaw ? authorRaw.slice(0, 80) : null;

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Roadmap backend is not configured." }, { status: 503 });
  }

  const { data, error } = await admin
    .from("ideas")
    .insert({ title, description, tag, author_name: authorName })
    .select(IDEA_SELECT)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Could not save your idea. Try again." }, { status: 500 });
  }

  return NextResponse.json({ idea: mapIdeaRow(data) }, { status: 201 });
}
