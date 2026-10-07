import type { MetadataRoute } from "next";
import { PLAYS_PATH } from "@/components/sections/plays/plays-copy";
import { getAllPosts } from "@/lib/posts";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { approvedVerticals, verticalUrl } from "@/lib/verticals";

/**
 * Parse a frontmatter date, falling back to "now" when missing/unparseable.
 * Guards the build: an invalid date reaches `Date.toISOString()` during
 * prerender and throws `RangeError: Invalid time value`, failing the whole deploy.
 */
function safeDate(value: string | undefined): Date {
  const parsed = new Date(value ?? "");
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/** The hub changes when any listed page does: its lastmod = the newest approved config date. */
function maxUpdated(): string {
  return approvedVerticals()
    .map((v) => v.updated)
    .sort()
    .at(-1)!;
}

/** The newest of several ISO dates (missing ones skipped). */
function newest(...dates: (string | undefined)[]): string {
  return dates
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1)!;
}

/** Newest post date — the blog index changes when a post does. */
function newestPostDate(): Date {
  const dates = getAllPosts().map((p) => safeDate(p.last_updated || p.date).getTime());
  return dates.length ? new Date(Math.max(...dates)) : new Date();
}

/**
 * Static pages carry the date their visible content last changed — bump the
 * entry when you ship a copy/content change to that page. `new Date()` here
 * stamped every build as a change, which teaches Google to ignore <lastmod>
 * for the whole sitemap (blog posts and /for included). A bulk phrase swap
 * across many pages is not a content change: don't bump for it.
 *
 * 2026-10-07 (audit 6.4): the homepage, /pricing (title, 6e6df1e), the guide
 * and the 7 comparison pages changed copy today; the comparison dates match
 * GtmComparisonPage's PAGE_MODIFIED (JSON-LD dateModified). /open-roadmap left
 * the sitemap the same day: it is noindex until its future is decided (D14).
 *
 * /plays reads part of its content from data, so its entry takes the newer of the page's own
 * date and that data's (2026-10-07): it shows every approved /for prompt verbatim (maxUpdated).
 */
const STATIC_PAGES: { path: string; updated: string; priority: number }[] = [
  { path: "", updated: "2026-10-07", priority: 1.0 },
  { path: "/pricing", updated: "2026-10-07", priority: 0.8 },
  { path: "/careers", updated: "2026-09-30", priority: 0.5 },
  { path: "/privacy", updated: "2026-09-18", priority: 0.3 },
  { path: "/terms", updated: "2026-09-18", priority: 0.3 },
  { path: "/support", updated: "2026-09-18", priority: 0.3 },
  { path: "/guides/claude", updated: "2026-10-07", priority: 0.7 },
  // example Plays (audit plan 3.7), new on 2026-10-07
  { path: PLAYS_PATH, updated: newest("2026-10-07", maxUpdated()), priority: 0.7 },
  { path: "/viktor-vs-pancake", updated: "2026-10-07", priority: 0.8 },
  { path: "/claude-tag-vs-pancake", updated: "2026-10-07", priority: 0.8 },
  { path: "/gojiberry-vs-pancake", updated: "2026-10-07", priority: 0.8 },
  { path: "/lemlist-vs-pancake", updated: "2026-10-07", priority: 0.8 },
  { path: "/origami-vs-pancake", updated: "2026-10-07", priority: 0.8 },
  // the GTM competitors buyers compare (audit plan 3.10), new on 2026-10-07
  { path: "/unify-vs-pancake", updated: "2026-10-07", priority: 0.8 },
  { path: "/octave-vs-pancake", updated: "2026-10-07", priority: 0.8 },
  { path: "/alta-vs-pancake", updated: "2026-10-07", priority: 0.8 },
  { path: "/openclaw-vs-pancake", updated: "2026-10-07", priority: 0.8 },
  { path: "/pancake-vs-paperclips", updated: "2026-10-07", priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC_PAGES.map((p) => ({
      url: `${SITE_ORIGIN}${p.path}`,
      lastModified: new Date(p.updated),
      priority: p.priority,
    })),
    { url: `${SITE_ORIGIN}/blog`, lastModified: newestPostDate(), priority: 0.8 },
    // /for — the Industries hub + every APPROVED vertical (drafts are noindex and
    // stay out). lastModified = the config's fixed `updated` date (no daily churn).
    ...(approvedVerticals().length
      ? [{ url: `${SITE_ORIGIN}/for`, lastModified: new Date(maxUpdated()), priority: 0.7 }]
      : []),
    ...approvedVerticals().map((v) => ({
      url: verticalUrl(v),
      lastModified: new Date(v.updated),
      priority: 0.7 as number,
    })),
    ...getAllPosts().map((post) => ({
      url: `${SITE_ORIGIN}/blog/${post.slug}`,
      lastModified: safeDate(post.last_updated || post.date),
      priority: 0.7 as number,
    })),
  ];
}
