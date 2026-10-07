/**
 * /open-roadmap/admin — hidden admin sign-in.
 *
 * Not linked from anywhere and excluded from indexing/sitemaps. Admins reach it
 * by URL, sign in with Google, and (if their email is on an allow-listed
 * company domain) get the signed admin cookie that unlocks delete on the board.
 * All the actual auth lives in the API routes + lib/auth; this page is just the
 * entry button and status.
 */
import type { Metadata } from "next";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { AdminSignOut } from "@/components/sections/roadmap/AdminSignOut";
import { Badge } from "@/components/ui/Badge";
import { getAdminSession, isAdminAuthConfigured } from "@/lib/auth/admin";
import "@/app/_styles/landing-v3.css";
import "../roadmap-lp.css";

export const dynamic = "force-dynamic";

// Hidden page: keep it out of search results and crawler paths.
export const metadata: Metadata = {
  title: "Admin sign-in · Pancake roadmap",
  robots: { index: false, follow: false },
};

const ERROR_COPY: Record<string, string> = {
  unconfigured: "Admin sign-in isn’t configured on this deployment yet.",
  denied: "Sign-in was cancelled.",
  state: "Your sign-in link expired or didn’t match. Please try again.",
  exchange: "Couldn’t complete sign-in with Google. Please try again.",
  domain: "That Google account isn’t on an allowed company domain.",
};

export default async function RoadmapAdminPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = getAdminSession();
  const configured = isAdminAuthConfigured();
  const errorKey = searchParams.error;
  const error = errorKey ? ERROR_COPY[errorKey] ?? "Sign-in failed. Please try again." : null;

  return (
    // Same chrome as the board (LpNav + LpFooter in main.lp, 2026-10-07).
    <main id="main-content" className="lp roadmap-page min-h-screen">
      <LpNav />

      <section className="lp-kit home-landing-section" aria-labelledby="roadmap-admin-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <div className="roadmap-admin">
            <header className="roadmap-admin__header">
              <Badge variant="brand-alt-1">Admin</Badge>
              <h1 id="roadmap-admin-heading" className="heading roadmap-admin__title">
                Roadmap admin
              </h1>
              <p className="roadmap-admin__lede">
                Sign in with your Pancake Google account to manage the open roadmap.
              </p>
            </header>

            {error ? (
              <p className="roadmap-admin__error" role="alert">
                {error}
              </p>
            ) : null}

            {session ? (
              <div className="roadmap-admin__panel">
                <p className="roadmap-admin__status" role="status">
                  Signed in as <strong>{session.email}</strong>.
                </p>
                <div className="roadmap-admin__actions">
                  <a
                    href="/open-roadmap"
                    className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
                  >
                    Go to the roadmap
                  </a>
                  <AdminSignOut />
                </div>
              </div>
            ) : configured ? (
              <div className="roadmap-admin__panel">
                <a
                  href="/api/roadmap/auth/google"
                  className="button inline-flex w-fit shrink-0 items-center justify-center gap-[var(--spacing-sm)] no-underline"
                  data-size="lg"
                >
                  <GoogleMark />
                  Sign in with Google
                </a>
              </div>
            ) : (
              <p className="roadmap-admin__hint">
                Admin sign-in isn’t configured on this deployment.
              </p>
            )}
          </div>
        </div>
      </section>

      <LpFooter />
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
