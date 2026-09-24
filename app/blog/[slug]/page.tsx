import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { formatPostDate, getAllPosts, getPostBySlug, type PostMeta } from "@/lib/posts";
import "@/app/_styles/landing-v3.css";
import "../blog.css";

/**
 * Blog post on the landing-v3 system (2026-09-03) — see app/blog/page.tsx for
 * the why. Header band (date / title / description / byline) on the 1296
 * grid, the markdown body on a 760px measure, the frontmatter FAQ as cream
 * cards, then "Keep reading" (frontmatter `related`). Article + FAQPage +
 * BreadcrumbList JSON-LD.
 */

/* Status-bar zone matches the lp cream (Dynamic Island fix, 2026-08-31) */
export const viewport: Viewport = { themeColor: "#fbf6f1" };

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

const SITE = "https://getpancake.ai";
const ORG_ID = `${SITE}/#organization`;
const OG_IMAGE = "/og-image.png";
const TITLE_SUFFIX = " · Pancake";
/** Google truncates SERP titles around 60 characters. */
const TITLE_BUDGET = 60;

/** SERP title: the frontmatter `seo_title` verbatim when set; otherwise the
 *  H1 plus " · Pancake" when that fits the budget, else the H1 alone (a
 *  truncated brand suffix only wastes the budget — Google shows the site
 *  name on its own line). */
function serpTitle(meta: PostMeta): string {
  if (meta.seo_title) return meta.seo_title;
  const branded = `${meta.title}${TITLE_SUFFIX}`;
  return branded.length <= TITLE_BUDGET ? branded : meta.title;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = `${SITE}/blog/${slug}`;
  const title = serpTitle(post.meta);
  return {
    title: { absolute: title },
    description: post.meta.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description: post.meta.description,
      publishedTime: post.meta.date,
      modifiedTime: post.meta.last_updated,
      authors: post.meta.author ? [post.meta.author] : undefined,
      siteName: "Pancake",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Pancake" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.meta.description,
      images: [OG_IMAGE],
    },
  };
}

/* ReactMarkdown emits a bare <table>; the comparison tables in the posts are
   wider than the 760px measure on phones, so each one gets a scrolling box.
   `node` (the hast node react-markdown passes) must not reach the DOM. */
type TableProps = ComponentPropsWithoutRef<"table"> & { node?: unknown };
const markdownComponents: Components = {
  table: ({ node: _node, ...props }: TableProps) => (
    <div className="lp-blog-tablewrap">
      <table {...props} />
    </div>
  ),
};

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { meta, content } = post;
  const url = `${SITE}/blog/${slug}`;

  // "Keep reading": frontmatter slugs that resolve to a live post, max 3.
  const related = (meta.related ?? [])
    .filter((s) => s !== slug)
    .map((s) => getPostBySlug(s)?.meta)
    .filter((m): m is PostMeta => Boolean(m))
    .slice(0, 3);

  const pancakeOrg = {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Pancake",
    url: SITE,
    logo: { "@type": "ImageObject", url: `${SITE}/pancake-mark.png` },
  };

  // Build Article JSON-LD
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    image: `${SITE}${OG_IMAGE}`,
    datePublished: meta.date,
    dateModified: meta.last_updated || meta.date,
    // No named author on a few posts: credit the organization, never an
    // empty Person.
    author: meta.author ? { "@type": "Person", name: meta.author } : pancakeOrg,
    publisher: pancakeOrg,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pancake", item: SITE },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 3, name: meta.title, item: url },
    ],
  };

  // Build FAQPage JSON-LD if post has FAQ entries
  const faqJsonLd =
    meta.faq && meta.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: meta.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <main id="main-content" className="lp">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <LpNav />

      <article>
        <header className="lp-blog-hero">
          <div className="lp-content lp-blog-hero__inner">
            <a className="lp-blog-back" href="/blog">
              &larr; All posts
            </a>
            <p className="lp-blog-meta">
              <time dateTime={meta.date}>{formatPostDate(meta.date)}</time>
            </p>
            <h1 className="lp-blog-post__title lp-display">{meta.title}</h1>
            <p className="lp-blog-lede lp-blog-post__lede">{meta.description}</p>
            <p className="lp-blog-meta">
              <span>By {meta.author ?? "Pancake"}</span>
              <span aria-hidden="true">&middot;</span>
              <span>Last updated {formatPostDate(meta.last_updated || meta.date)}</span>
            </p>
          </div>
        </header>

        <div className="lp-blog-article">
          <div className="lp-content">
            <div className="lp-blog-article__inner">
              <div className="lp-blog-prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {content}
                </ReactMarkdown>
              </div>

              {/* FAQ section rendered from frontmatter */}
              {meta.faq && meta.faq.length > 0 && (
                <section className="lp-blog-faq" aria-labelledby="blog-faq-heading">
                  <h2 id="blog-faq-heading" className="lp-blog-faq__title">
                    Frequently asked questions
                  </h2>
                  <dl className="lp-blog-faq__list">
                    {meta.faq.map((item) => (
                      <div key={item.question} className="lp-blog-faq__item">
                        <dt className="lp-blog-faq__q">{item.question}</dt>
                        <dd className="lp-blog-faq__a">{item.answer}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              {related.length > 0 && (
                <section className="lp-blog-related" aria-labelledby="blog-related-heading">
                  <h2 id="blog-related-heading" className="lp-blog-faq__title">
                    Keep reading
                  </h2>
                  <ul className="lp-blog-cards">
                    {related.map((r) => (
                      <li key={r.slug}>
                        <a className="lp-blog-card" href={`/blog/${r.slug}`}>
                          <h3 className="lp-blog-card__title lp-display">{r.title}</h3>
                          <p className="lp-blog-card__desc">{r.description}</p>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      </article>

      <LpFooter />
    </main>
  );
}
