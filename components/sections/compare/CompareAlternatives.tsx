import { COMPARE_ALTERNATIVES } from "@/components/sections/compare/compare-copy";
import { GTM_ALTERNATIVES_POSTS } from "@/components/sections/compare/compare-data";
import { VxArrow } from "@/components/sections/verticals/VxRelated";
import { VxHead } from "@/components/sections/verticals/VxHead";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";
import { getPostBySlug } from "@/lib/posts";

/** "Origami Alternatives: 6 AI Tools to Find Buyers in 2026" → name + line, both the post's own words. */
function splitTitle(title: string): { name: string; line: string } {
  const at = title.indexOf(": ");
  return at < 0 ? { name: title, line: "" } : { name: title.slice(0, at), line: title.slice(at + 2) };
}

/**
 * /compare: the blog's GTM "<tool> alternatives" guides, in the /for Related rows (related.css,
 * read-only reuse): name, line, arrow; the row is the link. Each row reads its post's own title,
 * split at the colon, so the hub writes no copy for a post, and a slug whose post is gone is
 * skipped (no dead link). Server, zero JS.
 */
export function CompareAlternatives() {
  const rows = GTM_ALTERNATIVES_POSTS.flatMap((slug) => {
    const post = getPostBySlug(slug);
    return post ? [{ slug, ...splitTitle(post.meta.title) }] : [];
  });
  if (rows.length === 0) return null;
  return (
    <section className="vx-sec vx-related" aria-labelledby="cmp-alts-title">
      <div className="vx-col">
        <VxHead
          id="cmp-alts-title"
          eyebrow={COMPARE_ALTERNATIVES.eyebrow}
          title={COMPARE_ALTERNATIVES.h2}
          lede={COMPARE_ALTERNATIVES.lede}
        />
        <ul className="vx-rel">
          {rows.map((r) => (
            <li key={r.slug}>
              <a className="vx-rel__row" href={`/blog/${r.slug}`}>
                <span className="vx-rel__name lp-display">{r.name}</span>
                <span className="vx-rel__line">{vxNoWidow(r.line)}</span>
                <VxArrow className="vx-rel__arrow" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
