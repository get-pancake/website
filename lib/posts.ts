import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface PostFrontmatter {
  title: string;
  description: string;
  /** SERP <title>, used verbatim when set (keep it ≤ 60 chars). The H1 stays `title`. */
  seo_title?: string;
  /** Publication date. A future date schedules the post: see publishedAt(). */
  date: string;
  last_updated: string;
  /** Missing on a few posts — the template falls back to the Pancake organization. */
  author?: string;
  slug: string;
  pinned?: boolean;
  /** Slugs for the "Keep reading" block (internal links between posts). */
  related?: string[];
  faq?: { question: string; answer: string }[];
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
}

/** Both loaders leave scheduled posts out unless asked: only the page's static params need them. */
export interface PostQuery {
  includeScheduled?: boolean;
}

const POSTS_DIR = path.join(process.cwd(), "content/blog");

/**
 * Scheduled posts (2026-11-03). A post whose `date` is still ahead stays off the blog index, the
 * RSS feed, the sitemap, "Keep reading" and every link to it, and its own URL answers 404. A
 * calendar date goes live at 13:00 UTC that day (5 a.m. in San Francisco in winter), so the date a
 * post shows is the US day it appeared; a date with a time ("2026-11-12T16:00:00Z") goes live at
 * that instant. Nothing redeploys to publish: the blog pages, the feed and the sitemap revalidate
 * every hour (`revalidate` in each route), so a post appears within the hour after its time.
 */
const PUBLISH_HOUR_UTC = 13;

export function publishedAt(date: string): Date {
  const iso = /T\d/.test(date) ? date : `${date}T${String(PUBLISH_HOUR_UTC).padStart(2, "0")}:00:00Z`;
  return new Date(iso);
}

/** False only for a post with a valid date still ahead; an unreadable date stays live as before. */
export function isPublished(meta: Pick<PostFrontmatter, "date">, now: Date = new Date()): boolean {
  const t = publishedAt(String(meta.date ?? "")).getTime();
  return Number.isNaN(t) || t <= now.getTime();
}

/** "September 3, 2026" — the one date format the blog surfaces show.
 *  Frontmatter dates are calendar dates ("2026-07-08" parses as UTC
 *  midnight), so format in UTC: in a US timezone the local build showed the
 *  day before. */
export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function getAllPosts({ includeScheduled = false }: PostQuery = {}): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
      const { data } = matter(raw);
      return {
        ...(data as PostFrontmatter),
        slug: file.replace(/\.mdx$/, ""),
      };
    })
    .filter((post) => includeScheduled || isPublished(post))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

export function getPostBySlug(
  slug: string,
  { includeScheduled = false }: PostQuery = {},
): { meta: PostMeta; content: string } | null {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const meta = { ...(data as PostFrontmatter), slug };
  if (!includeScheduled && !isPublished(meta)) return null;
  return { meta, content };
}
