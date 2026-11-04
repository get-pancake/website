import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DEMO_BOOKING_DESTINATIONS } from "@/lib/booking";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: { token: string } },
) {
  const headers = {
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex, nofollow",
  };
  if (!/^[a-f0-9]{64}$/.test(params.token))
    return new Response("Invitation unavailable.", { status: 404, headers });
  const db = createSupabaseAdminClient();
  if (!db)
    return new Response("Please try again later.", { status: 503, headers });
  const { data } = await db
    .from("demo_requests")
    .select("answers")
    .eq(
      "invite_token_hash",
      createHash("sha256").update(params.token).digest("hex"),
    )
    .eq("status", "approved")
    .gt("invite_expires_at", new Date().toISOString())
    .maybeSingle();
  if (!data)
    return new Response(
      "This invitation has expired or is unavailable. Reply to your invitation email for help.",
      { status: 404, headers },
    );
  const destination =
    data.answers.service === "White Glove"
      ? DEMO_BOOKING_DESTINATIONS.whiteGlove
      : DEMO_BOOKING_DESTINATIONS.enterprise;
  // A server redirect avoids loading analytics on the secret invitation URL.
  return new NextResponse(null, {
    status: 303,
    headers: { ...headers, Location: destination.url },
  });
}
