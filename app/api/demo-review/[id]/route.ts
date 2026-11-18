import { NextResponse } from "next/server";
import { getDemoReviewer } from "@/lib/demo-review-auth";
import { hasApprovedOrigin } from "@/lib/request-origin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { approveDemo } from "@/lib/demo-invitation";
import { researchDemo } from "@/lib/demo-research";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = getDemoReviewer();
  if (!session || !hasApprovedOrigin(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  if (!/^[0-9a-f-]{36}$/.test(params.id))
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const raw = await request.text();
  if (raw.length > 12000)
    return NextResponse.json({ error: "Too large" }, { status: 413 });
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const notes = typeof body.notes === "string" ? body.notes.slice(0, 8000) : "";
  if (body.action === "approve") {
    const result = await approveDemo(params.id, session.email, notes);
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  }
  if (body.action === "research") {
    return NextResponse.json({ ok: await researchDemo(params.id) });
  }
  if (body.action === "self_serve") {
    const db = createSupabaseAdminClient();
    if (!db)
      return NextResponse.json({ error: "Unavailable" }, { status: 503 });
    const { data, error } = await db
      .from("demo_requests")
      .update({
        status: "self_serve",
        reviewed_by: session.email,
        reviewed_at: new Date().toISOString(),
        notes,
      })
      .eq("id", params.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    return NextResponse.json(
      { ok: !error && !!data },
      { status: error || !data ? 409 : 200 },
    );
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
