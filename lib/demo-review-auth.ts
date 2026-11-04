import { getAdminSession } from "@/lib/auth/admin";
export function getDemoReviewer() {
  const session = getAdminSession();
  const allowed = (
    process.env.DEMO_REVIEWER_EMAILS ||
    "francois@pancake.ai,francois@getpancake.ai"
  )
    .split(",")
    .map((s) => s.trim().toLowerCase());
  return session && allowed.includes(session.email.toLowerCase())
    ? session
    : null;
}
