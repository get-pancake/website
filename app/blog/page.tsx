import type { Metadata, Viewport } from "next";

import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { BLOG_DESCRIPTION, BLOG_FEED_ALTERNATE, BLOG_TITLE } from "@/lib/blog-meta";
import { formatPostDate, getAllPosts } from "@/lib/posts";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";
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

export const metadata: Metadata = {
  title: "Blog · Pancake",
  description: BLOG_DESCRIPTION,
  // The RSS feed (app/blog/rss.xml) is advertised in <head> (2026-10-07).
  alternates: { canonical: `${SITE_ORIGIN}/blog`, types: BLOG_FEED_ALTERNATE },
  // Share card via lib/social-meta.ts (2026-10-07, audit 8.1/8.4).
  ...social({ path: "/blog", title: "Blog · Pancake", description: BLOG_DESCRIPTION }),
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main id="main-content" className="lp">
      <LpNav />

      <section className="lp-blog-hero" aria-labelledby="blog-heading">
        <div className="lp-content lp-blog-hero__inner">
          {/* "Blog" alone said nothing to search or AI engines (2026-10-07,
              audit 6.6); the <title> stays "Blog · Pancake". */}
          <h1 id="blog-heading" className="lp-blog-hero__title lp-title-section">
            {BLOG_TITLE}
          </h1>
          {/* 2026-10-07 (audit 3.14): the V1 "recipes" intro ("help small teams achieve great
              things with AI") no longer said what Pancake does. */}
          <p className="lp-blog-lede">
            Guides, comparisons and notes on finding B2B customers with Plays.
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
