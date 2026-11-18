import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { parseQualification, isSelfServe } from "@/lib/demo-qualification";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasApprovedOrigin } from "@/lib/request-origin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { writeAttioDemoRequest } from "@/lib/attio-demo-request";
export const runtime = "nodejs";
export const maxDuration = 30;
export async function POST(request: Request) {
  if (!hasApprovedOrigin(request))
    return NextResponse.json(
      { error: "Request not allowed." },
      { status: 403 },
    );
  if (Number(request.headers.get("content-length")) > 16384)
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  const text = await request.text();
  if (text.length > 16384)
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (body?.nickname) return NextResponse.json({ ok: true, route: "review" });
  const limit = rateLimit(`demo-review:${getClientIp(request)}`, 5, 600000);
  if (!limit.ok)
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  const parsed = parseQualification(body);
  if (!parsed.ok)
    return NextResponse.json(
      { error: `Please check ${parsed.field}.`, field: parsed.field },
      { status: 400 },
    );
  const a = parsed.value;
  // No sales request, CRM write, research spend, or booking link for low budgets.
  if (isSelfServe(a))
    return NextResponse.json({ ok: true, route: "self_serve" });
  const capacity = rateLimit("demo-review:global", 600, 600000);
  if (!capacity.ok)
    return NextResponse.json(
      { error: "Please try again shortly." },
      { status: 503 },
    );
  const db = createSupabaseAdminClient();
  if (!db)
    return NextResponse.json(
      { error: "We could not save your request. Please try again." },
      { status: 503 },
    );
  const hash = createHash("sha256").update(JSON.stringify(a)).digest("hex");
  const { error } = await db
    .from("demo_requests")
    .insert({ id: parsed.id, answers: a, request_hash: hash });
  if (error) {
    if (error.code === "23505") {
      const { data } = await db
        .from("demo_requests")
        .select("request_hash")
        .eq("id", parsed.id)
        .single();
      if (data?.request_hash === hash)
        return NextResponse.json({ ok: true, route: "review" });
    }
    return NextResponse.json(
      { error: "We could not save your request. Please try again." },
      { status: 503 },
    );
  }
  // The private queue is durable before optional CRM delivery; research is retried by cron.
  const token = process.env.ATTIO_API_KEY;
  if (token) {
    const parts = a.name.split(/\s+/);
    const result = await writeAttioDemoRequest(token, {
      firstName: parts.shift()!,
      lastName: parts.join(" "),
      email: a.email,
      website: a.website,
      teamSize: a.size,
      whiteGlove: a.service === "White Glove" ? "yes" : "no",
      hasAccount: "no",
      goal: a.goal,
      source: "demo-review",
      submittedAt: new Date().toISOString(),
      pageUrl: "https://pancake.ai/demo",
      qualification: a,
    });
    await db
      .from("demo_requests")
      .update({ crm_state: result })
      .eq("id", parsed.id);
  }
  return NextResponse.json({ ok: true, route: "review" });
}
