import { getDemoReviewer } from "@/lib/demo-review-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import ReviewQueue from "./queue";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/demo.css";
import "@/app/_styles/demo-request.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Demo requests · Pancake",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const session = getDemoReviewer();
  if (!session)
    return (
      <main className="lp lp-demo request-preview">
        <section className="request-review">
          <h1 className="lp-display">Demo request review</h1>
          <p>Sign in with your authorized Pancake Google account.</p>
          <a href="/api/roadmap/auth/google?returnTo=demo-review">
            Sign in with Google →
          </a>
        </section>
      </main>
    );
  const db = createSupabaseAdminClient();
  if (!db)
    return (
      <main>
        <h1>Review queue unavailable</h1>
        <p>The database is not configured.</p>
      </main>
    );
  const { data, error } = await db
    .from("demo_requests")
    .select(
      "id,created_at,answers,status,research_state,research,notes,email_state,crm_state",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (error)
    return (
      <main>
        <h1>Review queue unavailable</h1>
        <p>Please try again.</p>
      </main>
    );
  return <ReviewQueue rows={data || []} reviewer={session.email} />;
}
