import { getPostBySlug } from "@/lib/posts";

/**
 * The blog's "<tool> alternatives" guide, as a "Keep reading" link of that tool's comparison
 * page: spread it into the config's `related`.
 *
 * A post whose date is still ahead is a noindex "Coming soon" page (lib/posts.ts), and a slug
 * with no post is a 404, so both return nothing: the page never links either. The comparison
 * pages are static, so the link shows up with the first build after the post goes live.
 *
 * Server only (lib/posts reads content/blog from disk): import it from a page, never from a
 * client component.
 */
export function alternativesLink(slug: string, label: string): { href: string; label: string }[] {
  return getPostBySlug(slug) ? [{ href: `/blog/${slug}`, label }] : [];
}
