import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface PostFrontmatter {
  title: string;
  description: string;
  /** SERP <title>, used verbatim when set (keep it ≤ 60 chars). The H1 stays `title`. */
  seo_title?: string;
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

const POSTS_DIR = path.join(process.cwd(), "content/blog");

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

export function getAllPosts(): PostMeta[] {
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
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

export function getPostBySlug(slug: string): { meta: PostMeta; content: string } | null {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return {
    meta: { ...(data as PostFrontmatter), slug },
    content,
  };
}
