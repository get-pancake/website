/**
 * /open-roadmap — Pancake's public community roadmap.
 *
 * Public read for everyone; anyone can post an idea (honeypot + rate-limited);
 * allow-listed admins (Google sign-in) can delete. Data comes from Supabase
 * when configured, falling back to static seed (read-only) otherwise so the
 * page always renders. Mutations run through server API routes so the
 * service-role key never reaches the browser.
 */
import type { Metadata } from "next";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { HomeNav } from "@/components/sections/home/HomeNav";
import { RoadmapBoard } from "@/components/sections/roadmap/RoadmapBoard";
import { STATUS_META } from "@/components/sections/roadmap/roadmap-data";
import { Footer } from "@/components/shared/Footer";
import { Badge } from "@/components/ui/Badge";
import { isAdmin } from "@/lib/auth/admin";
import { getIdeas } from "@/lib/roadmap/ideas";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

// Always render per-request: the board reflects live Supabase data and the
// signed-in user. (Without this, a build with env present could cache stale
// rows; a build without env could bake in seed data.)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Open roadmap: Vote on what Pancake builds next · Pancake",
  description:
    "Pancake's public roadmap. Upvote the squads, features, and integrations you want, post your own ideas, and see what's planned, in progress, and shipped.",
  alternates: { canonical: `${SITE_ORIGIN}/open-roadmap` },
  openGraph: {
    type: "website",
    url: `${SITE_ORIGIN}/open-roadmap`,
    title: "Pancake Open Roadmap: Vote on what we build next",
    description:
      "Upvote the squads, features, and integrations you want, and post your own ideas. See what's planned, in progress, and shipped.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pancake Open Roadmap" }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pancake Open Roadmap: Vote on what we build next",
    description:
      "Upvote the squads, features, and integrations you want, and post your own ideas.",
    images: ["/og-image.png"],
  },
};

export default async function OpenRoadmapPage() {
  const [{ ideas, source, truncated }, admin] = await Promise.all([getIdeas(), isAdmin()]);
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
    <main id="main-content" className="roadmap-page min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(roadmapJsonLd) }}
      />

      <HomeNav />

      {/* Hero */}
      <section className="home-landing-section roadmap-hero" aria-labelledby="roadmap-hero-heading">
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
        className="home-landing-section home-landing-section--alt roadmap-board-section"
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
      <section className="home-landing-section" aria-labelledby="roadmap-closing-heading">
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

      <Footer />
    </main>
  );
}
