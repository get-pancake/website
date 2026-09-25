import type { Metadata, Viewport } from "next";

import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { formatPostDate, getAllPosts } from "@/lib/posts";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import "@/app/_styles/landing-v3.css";
import "./blog.css";

/**
 * Blog index on the landing-v3 system (2026-09-03). Until now the blog kept
 * the v1 chrome (HomeNav + the shared Footer), so one click from the homepage
 * exposed the retired link tree — roadmap, beta sign-in, the seven comparison
 * pages of the previous positioning. Same footing as /careers: no Figma
 * artboard, the design language only. landing-v3.css is the homepage manifest
 * (the nav + footer rules live there); blog.css is page-only.
 */

/* Status-bar zone matches the lp cream (Dynamic Island fix, 2026-08-31) */
export const viewport: Viewport = { themeColor: "#fbf6f1" };

const DESCRIPTION =
  "Guides and tool comparisons for founders who sell: buying signals, warm leads, outreach and the AI tools that run go-to-market.";

export const metadata: Metadata = {
  title: "Blog · Pancake",
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_ORIGIN}/blog` },
  openGraph: {
    type: "website",
    url: `${SITE_ORIGIN}/blog`,
    title: "Blog · Pancake",
    description: DESCRIPTION,
    siteName: "Pancake",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pancake" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog · Pancake",
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main id="main-content" className="lp">
      <LpNav />

      <section className="lp-blog-hero" aria-labelledby="blog-heading">
        <div className="lp-content lp-blog-hero__inner">
          <h1 id="blog-heading" className="lp-blog-hero__title lp-title-section">
            Blog
          </h1>
          <p className="lp-blog-lede">
            We are Pancake and we help small teams achieve great things with AI. This is where we
            share our recipes, come cook with us!
          </p>
        </div>
      </section>

      <section className="lp-blog-list" aria-label="All posts">
        <div className="lp-content">
          {posts.length === 0 ? (
            <p className="lp-blog-empty">No posts yet. Check back soon.</p>
          ) : (
            <ul className="lp-blog-cards">
              {posts.map((post) => (
                <li key={post.slug}>
                  <a className="lp-blog-card" href={`/blog/${post.slug}`}>
                    <p className="lp-blog-meta">
                      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                      {post.pinned && <span className="lp-blog-meta__pin">Pinned</span>}
                    </p>
                    <h2 className="lp-blog-card__title lp-display">{post.title}</h2>
                    <p className="lp-blog-card__desc">{post.description}</p>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <LpFooter />
    </main>
  );
}
