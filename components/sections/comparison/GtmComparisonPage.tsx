import type { Viewport } from "next";
import Link from "next/link";
import { LuBadgeCheck, LuCheck, LuCreditCard, LuLock, LuSparkles, LuUserCheck, LuX } from "react-icons/lu";

import { COMPARE_LINKS, COMPARE_META } from "@/components/sections/compare/compare-copy";
import {
  COMPARE_PATH,
  compareEntry,
  compareName,
  comparePath,
  compareSiblings,
} from "@/components/sections/compare/compare-data";
import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { Badge } from "@/components/ui/Badge";
import { H2, H3 } from "@/components/ui/Headings";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { APP_ORIGIN, SITE_ORIGIN } from "@/lib/site-config.mjs";
import "@/app/_styles/landing-v3.css";
import "./comparison.css";

// Two different dates, kept apart on purpose:
// - PAGE_MODIFIED: when Pancake's side of these pages last changed (JSON-LD dateModified).
//   2026-09-30: AI SEO retired from the product; the copy now describes Plays.
//   2026-10-07: site audit. The V1 "Take it from them" posts, the "GTM team" pitch and the
//   unverified "SOC 2 compliant" badge are gone; "per workspace" pricing; the landing nav and
//   footer (LpNav/LpFooter) replace HomeNav and the shared Footer.
// - FACTS_REVIEWED: when the competitor facts (features, prices) were last checked.
//   Shown under Sources. Move it only after re-checking every competitor's public pages.
//   2026-10-07: all seven re-checked on the vendors' own pages (Origami's plans moved to
//   $49 / $129 / $399, and it now runs the plays you approve).
//   REMINDER: re-check by 2027-01-05 (90 days), then move this date again.
const PAGE_MODIFIED = "2026-10-07";
const FACTS_REVIEWED = "October 7, 2026";

/** Status-bar zone matches the landing cream (the Dynamic Island fix every main.lp page carries). */
export const comparisonViewport: Viewport = { themeColor: "#fbf6f1" };

export type ComparisonCellData = { text: string; mark?: "yes" | "no" };
export type ComparisonRow = {
  feature: string;
  competitor: ComparisonCellData;
  pancake: ComparisonCellData;
};

export type GtmComparisonConfig = {
  slug: string;
  competitor: string;
  competitorInitial: string;
  heroLede: string;
  heroSummary: string;
  competitorBody: string;
  competitorChoose: string;
  pancakeBody: string;
  pancakeChoose: string;
  verdictTitle: string;
  verdictLede: string;
  competitorBestFit: string;
  differencesLede: string;
  differences: { n: string; title: string; body: string; angle: string }[];
  rows: ComparisonRow[];
  closingTitle: string;
  closingLede: string;
  faqs: { q: string; a: string }[];
  related: { href: string; label: string }[];
  sources: { href: string; label: string }[];
};

function ComparisonCell({ cell }: { cell: ComparisonCellData }) {
  if (!cell.mark) return <span className="vvp-mark__text">{cell.text}</span>;
  const Icon = cell.mark === "yes" ? LuCheck : LuX;
  return (
    <span className="vvp-mark">
      <Icon
        size={18}
        aria-hidden
        className={cell.mark === "yes" ? "vvp-mark__icon vvp-mark__icon--yes" : "vvp-mark__icon vvp-mark__icon--no"}
      />
      <span className="vvp-mark__text">{cell.text}</span>
    </span>
  );
}

/**
 * The CTA pair, "Start free" then "Book a demo", the hero's order on every surface
 * (founder 2026-09-03). Each placement has its own allow-listed ids (lib/analytics/data-layer.ts),
 * so comparison clicks don't merge into the homepage hero and final metrics.
 */
function CtaPair({ placement }: { placement: "hero" | "final" }) {
  return (
    <div className="vvp-hero__cta-row">
      <LpFxLink
        href={APP_ORIGIN}
        data-analytics-id={placement === "hero" ? "app_compare_hero" : "app_compare_final"}
      >
        Start free
      </LpFxLink>
      <LpFxLink
        href={DEMO_PAGE_PATH}
        className="lp-btn--tinted lp-btn--demo"
        data-analytics-id={placement === "hero" ? "call_compare_hero" : "call_compare_final"}
      >
        Book a demo
      </LpFxLink>
    </div>
  );
}

/**
 * This page's card on /compare (2026-10-07: the hub links every comparison page, and each page
 * links back). The hub shows each page's own heroLede, so a page missing from
 * components/sections/compare/compare-data.ts, or a competitor name or heroLede changed here and
 * not there, fails the build (the pages are static, so this runs at prerender) with the fix.
 */
function hubEntry(config: GtmComparisonConfig) {
  const entry = compareEntry(config.slug);
  if (!entry || entry.competitor !== config.competitor || entry.line !== config.heroLede) {
    throw new Error(
      `/${config.slug} is missing or out of date in components/sections/compare/compare-data.ts: ` +
        `set competitor "${config.competitor}" and line "${config.heroLede}" (the page's heroLede), so /compare lists it.`,
    );
  }
  return entry;
}

export function GtmComparisonPage({ config }: { config: GtmComparisonConfig }) {
  const entry = hubEntry(config);
  const canonicalUrl = `${SITE_ORIGIN}/${config.slug}`;
  const pageName = compareName(entry);
  // "More comparisons": the other pages of this page's /compare group, minus the ones its own
  // "Keep reading" line already links.
  const moreComparisons = compareSiblings(config.slug).filter(
    (c) => !config.related.some((link) => link.href === comparePath(c)),
  );
  // One @graph: WebPage (with an @id) + BreadcrumbList (Pancake > Comparisons > this page; the
  // /compare hub, 2026-10-07) + FAQPage. Organization and WebSite come from the root layout;
  // the WebSite reference keeps name + url inline for parsers that don't resolve @id.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        name: pageName,
        url: canonicalUrl,
        description: config.heroSummary,
        inLanguage: "en-US",
        dateModified: PAGE_MODIFIED,
        isPartOf: { "@type": "WebSite", "@id": `${SITE_ORIGIN}/#website`, name: "Pancake", url: SITE_ORIGIN },
        breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
        author: { "@type": "Person", name: "François de Fitte" },
        about: [
          { "@type": "Thing", name: config.competitor },
          { "@type": "Thing", name: "Pancake" },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: COMPARE_META.crumbs.home, item: SITE_ORIGIN },
          { "@type": "ListItem", position: 2, name: COMPARE_META.crumbs.page, item: `${SITE_ORIGIN}${COMPARE_PATH}` },
          { "@type": "ListItem", position: 3, name: pageName, item: canonicalUrl },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        isPartOf: { "@id": `${canonicalUrl}#webpage` },
        mainEntity: config.faqs.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };

  return (
    // The landing chrome (LpNav + LpFooter, landing-v3.css) around the kit-built body.
    // comparison.css keeps landing-v3's unlayered base out of .vvp-body.
    <main id="main-content" className="lp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <LpNav />

      <div className="vvp-body">
        <section className="home-landing-section" aria-labelledby="vvp-hero-heading">
          <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
            <header className="home-landing-section__header">
              <h1 id="vvp-hero-heading" className="heading home-landing-section__title vvp-hero__title text-center">
                {pageName}
              </h1>
              <p className="home-landing-section__lede text-center">{config.heroLede}</p>
              <p className="vvp-hero__summary text-center">{config.heroSummary}</p>
            </header>

            <div className="vvp-hero__cta">
              <CtaPair placement="hero" />
              <a href="#vvp-compare" className="vvp-hero__jump">
                See how they compare
              </a>
              {/* 2026-10-07: "SOC 2 compliant" removed (no report on file, audit D2). Restore it
                  only with a /security page that backs it. */}
              <ul className="vvp-hero__badges">
                <li className="vvp-hero__badge"><LuSparkles aria-hidden /> $99 a month per workspace</li>
                <li className="vvp-hero__badge"><LuCreditCard aria-hidden /> No extra seats to hire</li>
                <li className="vvp-hero__badge"><LuUserCheck aria-hidden /> You approve every lead</li>
                <li className="vvp-hero__badge"><LuLock aria-hidden /> Private by default</li>
              </ul>
            </div>

            <div className="vvp-hero__cards">
              <article className="vvp-pcard vvp-pcard--viktor">
                <span className="vvp-pcard__icon" aria-hidden>{config.competitorInitial}</span>
                <H3 className="heading vvp-pcard__title">{config.competitor}</H3>
                <p className="vvp-pcard__body">{config.competitorBody}</p>
                <p className="vvp-pcard__choose">{config.competitorChoose}</p>
              </article>
              <article className="vvp-pcard vvp-pcard--pancake">
                <span className="vvp-pcard__icon vvp-pcard__icon--logo" aria-hidden>
                  {/* eslint-disable-next-line @next/next/no-img-element -- raster brand mark */}
                  <img src="/pancake-mark.png" alt="" width={48} height={48} />
                </span>
                <H3 className="heading vvp-pcard__title">Pancake</H3>
                <p className="vvp-pcard__body">{config.pancakeBody}</p>
                <p className="vvp-pcard__choose">{config.pancakeChoose}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="home-landing-section home-landing-section--alt" aria-labelledby="vvp-verdict-heading">
          <div className={`${HOME_PAGE_CONTAINER_CLASS} vvp-verdict-grid`}>
            <div className="vvp-verdict-aside">
              <Badge variant="brand-alt-1">The verdict</Badge>
              <H2 id="vvp-verdict-heading" className="heading vvp-verdict-aside__title">{config.verdictTitle}</H2>
              <p className="vvp-verdict-aside__lede">{config.verdictLede}</p>
            </div>
            <article className="vvp-tweet">
              <div className="vvp-tweet__head">
                <span className="vvp-tweet__avatar" aria-hidden>{config.competitorInitial}</span>
                <span className="vvp-tweet__id">
                  <span className="vvp-tweet__name">Choose {config.competitor}<LuBadgeCheck className="vvp-tweet__verified" aria-hidden /></span>
                  <span className="vvp-tweet__handle">Best fit</span>
                </span>
              </div>
              <p className="vvp-tweet__text">{config.competitorBestFit}</p>
              <p className="vvp-tweet__foot">An honest comparison, based on public product information.</p>
            </article>
          </div>
        </section>

        <section className="home-landing-section" aria-labelledby="vvp-diffs-heading">
          <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
            <header className="home-landing-section__header">
              <H2 id="vvp-diffs-heading" className="heading home-landing-section__title text-center">
                Five differences that matter
              </H2>
              <p className="home-landing-section__lede text-center">{config.differencesLede}</p>
            </header>
            <ol className="vvp-diffs">
              {config.differences.map((difference) => (
                <li key={difference.n} className="vvp-diff">
                  <span className="vvp-diff__num" aria-hidden>{difference.n}</span>
                  <div className="vvp-diff__content">
                    <H3 className="heading vvp-diff__title">{difference.title}</H3>
                    <p className="vvp-diff__body">{difference.body}</p>
                    <p className="vvp-diff__angle">{difference.angle}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="vvp-compare" className="home-landing-section home-landing-section--alt" aria-labelledby="vvp-table-heading">
          <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
            <header className="home-landing-section__header">
              <H2 id="vvp-table-heading" className="heading home-landing-section__title text-center">Head to head, feature by feature</H2>
            </header>
            <div className="home-landing-section__figure">
              <table className="influencers-tiers__table vvp-table">
                <thead><tr><th scope="col">Feature</th><th scope="col">{config.competitor}</th><th scope="col">Pancake</th></tr></thead>
                <tbody>
                  {config.rows.map((row) => (
                    <tr key={row.feature}>
                      <th scope="row">{row.feature}</th>
                      <td><ComparisonCell cell={row.competitor} /></td>
                      <td><ComparisonCell cell={row.pancake} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* "Take it from them" (the V1 X posts) removed 2026-10-07: they described features
            Pancake doesn't have. The slot stays empty until real customer quotes exist. */}

        <section className="home-landing-section" aria-labelledby="vvp-closing-heading">
          <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner home-landing-section__inner--closing`}>
            <h2 id="vvp-closing-heading" className="heading home-landing-section__closing-title text-center">{config.closingTitle}</h2>
            <p className="home-landing-section__lede home-landing-section__lede--closing text-center">{config.closingLede}</p>
            <div className="home-landing-closing-cta">
              <CtaPair placement="final" />
              {/* each phrase stays whole on phones (393px left "lead" alone on line 2) */}
              <p className="home-landing-closing-cta__note">
                <span className="vvp-nowrap">$99 a month per workspace&nbsp;•</span>{" "}
                <span className="vvp-nowrap">You approve every lead</span>
              </p>
              {/* 2026-10-07 (founder: make the comparison pages reachable, as Unify, Origami,
                  Octave and Alta do): back to the /compare hub. The hero's text-link recipe
                  (vvp-hero__jump); the arrow is aria-hidden, so the link reads its words only. */}
              <Link href={COMPARE_PATH} className="vvp-hero__jump">
                {COMPARE_LINKS.seeAll}
                <span aria-hidden="true">&nbsp;→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="home-landing-section home-landing-section--alt" aria-labelledby="vvp-faq-heading">
          <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
            <header className="home-landing-section__header">
              <H2 id="vvp-faq-heading" className="heading home-landing-section__title text-center">Questions founders ask</H2>
            </header>
            <ul className="vvp-faq">
              {config.faqs.map(({ q, a }) => (
                <li key={q} className="vvp-faq__item">
                  <H3 className="heading vvp-faq__q">{q}</H3>
                  <p className="vvp-faq__a">{a}</p>
                </li>
              ))}
            </ul>
            <p className="vvp-related">
              Keep reading: {config.related.map((link, index) => (
                <span key={link.href}>{index > 0 ? ", " : ""}<Link href={link.href} className="underline">{link.label}</Link></span>
              ))}.
            </p>
            {moreComparisons.length > 0 ? (
              <p className="vvp-related">
                {COMPARE_LINKS.more}{" "}
                {moreComparisons.map((c) => (
                  <span key={c.slug}>
                    <Link href={comparePath(c)} className="underline">{compareName(c)}</Link>,{" "}
                  </span>
                ))}
                or <Link href={COMPARE_PATH} className="underline">{COMPARE_LINKS.moreAll}</Link>.
              </p>
            ) : null}
            <p className="vvp-related">
              Sources: {config.sources.map((source, index) => (
                <span key={source.href}>{index > 0 ? ", " : ""}<a href={source.href} target="_blank" rel="noopener noreferrer" className="underline">{source.label}</a></span>
              ))}. Reviewed {FACTS_REVIEWED}.
            </p>
          </div>
        </section>
      </div>

      <LpFooter />
    </main>
  );
}
