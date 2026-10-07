import { BLOG_DESCRIPTION, BLOG_FEED_URL, BLOG_TITLE } from "@/lib/blog-meta";
import { getAllPosts } from "@/lib/posts";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

/**
 * RSS 2.0 feed of the blog (2026-10-07, audit 6.12): /rss.xml, /feed.xml and
 * /blog/rss.xml all answered 404, so aggregators and AI news crawlers had no
 * feed for the posts. Built once at build time from the same frontmatter as
 * the pages; this static segment wins over app/blog/[slug].
 */
export const dynamic = "force-static";

const xml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** RFC 822 date, as RSS 2.0 requires. Frontmatter dates are UTC calendar dates. */
const rfc822 = (iso: string) => new Date(iso).toUTCString();

export function GET() {
  // Newest first by publication date; the index pins posts, a feed doesn't.
  const posts = getAllPosts().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const lastBuild = posts.reduce((max, p) => {
    const t = new Date(p.last_updated || p.date).getTime();
    return Number.isNaN(t) ? max : Math.max(max, t);
  }, 0);

  const items = posts
    .map((p) => {
      const url = `${SITE_ORIGIN}/blog/${p.slug}`;
      return [
        "<item>",
        `<title>${xml(p.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<description>${xml(p.description ?? "")}</description>`,
        `<pubDate>${rfc822(p.date)}</pubDate>`,
        p.author ? `<dc:creator>${xml(p.author)}</dc:creator>` : "",
        "</item>",
      ].join("");
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>${xml(BLOG_TITLE)}</title>
<link>${SITE_ORIGIN}/blog</link>
<description>${xml(BLOG_DESCRIPTION)}</description>
<language>en-us</language>
${lastBuild ? `<lastBuildDate>${new Date(lastBuild).toUTCString()}</lastBuildDate>` : ""}
<atom:link href="${BLOG_FEED_URL}" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
