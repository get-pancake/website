import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { researchDemo } from "@/lib/demo-research";
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET
    ? `Bearer ${process.env.CRON_SECRET}`
    : "";
  const actual = request.headers.get("authorization") || "";
  if (
    !expected ||
    Buffer.byteLength(actual) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
  )
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = createSupabaseAdminClient();
  if (!db) return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  // Interrupted jobs become visible for manual retry rather than spending repeatedly.
  await db
    .from("demo_requests")
    .update({ research_state: "failed" })
    .eq("research_state", "running")
    .lt("research_started_at", new Date(Date.now() - 10 * 60000).toISOString());
  const { data } = await db
    .from("demo_requests")
    .select("id")
    .eq("status", "pending")
    .eq("research_state", "queued")
    .order("created_at")
    .limit(1);
  if (!data?.length) return NextResponse.json({ processed: 0 });
  return NextResponse.json({
    processed: 1,
    completed: await researchDemo(data[0].id),
  });
}
