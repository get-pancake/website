import { NextResponse } from "next/server";

import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { hasApprovedOrigin } from "@/lib/request-origin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isServiceConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

/**
 * Anonymous voting with per-browser dedup. The client sends a stable
 * `voterToken` (a random id kept in localStorage); the cast_vote / remove_vote
 * RPCs enforce one vote per (idea, token) and keep ideas.vote_count atomic.
 * Per-IP rate limit blunts token-cycling bots. The token is whatever the caller
 * sends, so the origin allow-list (lib/request-origin.ts) at least keeps another
 * site from voting through a visitor's browser.
 */
async function readToken(request: Request): Promise<string | null> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const token = typeof body.voterToken === "string" ? body.voterToken : "";
    return token.length >= 8 && token.length <= 100 ? token : null;
  } catch {
    return null;
  }
}

function tooFast(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`roadmap:vote:${ip}`, 60, 60 * 1000);
  return limit.ok ? null : limit.retryAfter;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return mutateVote(request, params.id, "cast_vote");
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return mutateVote(request, params.id, "remove_vote");
}

async function mutateVote(request: Request, ideaId: string, fn: "cast_vote" | "remove_vote") {
  if (!hasApprovedOrigin(request)) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 });
  }
  if (!isServiceConfigured()) {
    return NextResponse.json({ error: "Roadmap backend is not configured." }, { status: 503 });
  }

  const retryAfter = tooFast(request);
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: "Slow down a moment." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const voterToken = await readToken(request);
  if (!voterToken) {
    return NextResponse.json({ error: "Invalid vote token." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Roadmap backend is not configured." }, { status: 503 });
  }

  const { data, error } = await admin.rpc(fn, {
    p_idea_id: ideaId,
    p_voter_token: voterToken,
  });

  if (error) {
    return NextResponse.json({ error: "Could not record your vote." }, { status: 500 });
  }

  return NextResponse.json({ voteCount: typeof data === "number" ? data : 0 });
}
