/**
 * /open-roadmap — Pancake's public community roadmap.
 *
 * Public read for everyone; anyone can post an idea (honeypot + rate-limited);
 * allow-listed admins (Google sign-in) can delete. Data comes from Supabase
 * when configured, falling back to static seed (read-only) otherwise so the
 * page always renders. Mutations run through server API routes so the
 * service-role key never reaches the browser.
 *
 * 2026-10-07: noindex (follow) until the board holds Plays-era ideas — it
 * showed V1 "squads", an email agent marked In progress and spam rows, in
 * the page and its ItemList JSON-LD (keep-or-retire is founder decision
 * D14). The V1 meta copy ("Upvote the squads…") is gone. The sitewide chrome
 * (LpNav + LpFooter inside main.lp) replaces HomeNav + the shared footer;
 * the board keeps its kit styling (roadmap-lp.css).
 */
import type { Metadata, Viewport } from "next";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { RoadmapBoard } from "@/components/sections/roadmap/RoadmapBoard";
import { STATUS_META } from "@/components/sections/roadmap/roadmap-data";
import { Badge } from "@/components/ui/Badge";
import { isAdmin } from "@/lib/auth/admin";
import { getIdeas, isPublicIdea } from "@/lib/roadmap/ideas";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";
import "@/app/_styles/landing-v3.css";
import "./roadmap-lp.css";

// Always render per-request: the board reflects live Supabase data and the
// signed-in user. (Without this, a build with env present could cache stale
// rows; a build without env could bake in seed data.)
export const dynamic = "force-dynamic";

/* Status-bar zone matches the lp cream (Dynamic Island fix, 2026-08-31) */
export const viewport: Viewport = { themeColor: "#fbf6f1" };

/* 2026-10-07 (audit 1.8, 8.7): noindex (follow) and out of the sitemap until the
   roadmap's future is decided (D14): the board still showed V1 "squads" ideas and
   spam. "squads" left the descriptions too (the V1 product), and the card's alt is
   the text printed in the shared homepage image (audit 8.4). */
const DESCRIPTION =
  "Upvote the features and integrations you want, post your own ideas, and see what's planned, in progress and shipped.";

export const metadata: Metadata = {
  title: "Open roadmap: Vote on what Pancake builds next · Pancake",
  description: `Pancake's public roadmap. ${DESCRIPTION}`,
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE_ORIGIN}/open-roadmap` },
  ...social({
    path: "/open-roadmap",
    title: "Pancake Open Roadmap: Vote on what we build next",
    description: DESCRIPTION,
  }),
};

export default async function OpenRoadmapPage() {
  const [{ ideas: allIdeas, source, truncated }, admin] = await Promise.all([getIdeas(), isAdmin()]);
  // Ideas naming the outreach platform stay off the public board and its JSON-LD (see
  // isPublicIdea); admins still see every idea so they can edit or delete it.
  const ideas = admin ? allIdeas : allIdeas.filter(isPublicIdea);
  const backendEnabled = source === "supabase";

  // ItemList JSON-LD built from the live list so it can't drift from the page.
  const roadmapJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Pancake Open Roadmap",
    url: `${SITE_ORIGIN}/open-roadmap`,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: ideas.length,
    itemListElement: ideas.map((idea, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: idea.title,
      description: `${idea.description} (Status: ${STATUS_META[idea.status].label})`,
    })),
  };

  return (
    <main id="main-content" className="lp roadmap-page min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(roadmapJsonLd) }}
      />

      <LpNav />

      {/* Hero */}
      <section className="lp-kit home-landing-section roadmap-hero" aria-labelledby="roadmap-hero-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <Badge variant="brand-alt-1">Open roadmap</Badge>
            <h1 id="roadmap-hero-heading" className="heading roadmap-hero__title text-center">
              Tell us what to build next. Make Pancake awesome(r).
            </h1>
          </header>
        </div>
      </section>

      {/* Board */}
      <section
        id="roadmap"
        className="lp-kit home-landing-section home-landing-section--alt roadmap-board-section"
        aria-labelledby="roadmap-board-heading"
      >
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <h2 id="roadmap-board-heading" className="sr-only">
            Roadmap ideas
          </h2>
          <RoadmapBoard
            initialIdeas={ideas}
            backendEnabled={backendEnabled}
            isAdmin={admin}
            truncated={truncated}
          />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="lp-kit home-landing-section" aria-labelledby="roadmap-closing-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner home-landing-section__inner--closing`}>
          <h2 id="roadmap-closing-heading" className="heading home-landing-section__closing-title text-center">
            Got an idea?
          </h2>
          <p className="home-landing-section__lede home-landing-section__lede--closing text-center">
            The best ideas come from the people using Pancake every day. Post
            yours on the board. No account needed.
          </p>
          <div className="home-landing-closing-cta">
            <a
              href="#roadmap"
              className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
              data-size="lg"
            >
              Share an idea
            </a>
          </div>
        </div>
      </section>

      <LpFooter />
    </main>
  );
}
