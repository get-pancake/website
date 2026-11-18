import type { Viewport } from "next";
import Link from "next/link";
import { LuBadgeCheck, LuCheck, LuX } from "react-icons/lu";

import { COMPARE_HERO, COMPARE_LINKS, COMPARE_META } from "@/components/sections/compare/compare-copy";
import {
  COMPARE_HUB_GROUPS,
  COMPARE_PATH,
  compareEntry,
  compareName,
  comparePath,
  compareSiblings,
} from "@/components/sections/compare/compare-data";
import { LpAnimFreeze } from "@/components/sections/landing-v3/LpAnimFreeze";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpMarquee } from "@/components/sections/landing-v3/LpMarquee";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { LpVideo } from "@/components/sections/landing-v3/LpVideo";
import { SlProof } from "@/components/sections/search-landing/SlProof";
import { SL_CTA, SL_DEMO_ID, SL_TRIAL_LINE } from "@/components/sections/search-landing/search-landing-copy";
import { VxHead } from "@/components/sections/verticals/VxHead";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { serializeJsonLd } from "@/lib/json-ld";
import { APP_ORIGIN, SITE_ORIGIN } from "@/lib/site-config.mjs";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/verticals.css";
import "@/app/_styles/guide-claude.css";
import "@/app/_styles/search-landing.css";
import "./comparison.css";

// Two different dates, kept apart on purpose:
// - PAGE_MODIFIED: when Pancake's side of these pages last changed (JSON-LD dateModified).
//   2026-09-30: AI SEO retired from the product; the copy now describes Plays.
//   2026-10-07: site audit. The V1 "Take it from them" posts, the "GTM team" pitch and the
//   unverified "SOC 2 compliant" badge are gone; "per workspace" pricing; the landing nav and
//   footer (LpNav/LpFooter) replace HomeNav and the shared Footer.
//   2026-10-13: the credit plan. Every page says "from $99 a month", the 7-day trial and its
//   15,000 credits (#333).
//   2026-11-03: the trial comes with 30,000 credits (pancake-cmo PAN-2391, since 2026-10-21).
//   2026-11-16: the paid search pages' layout (below): the demo film, the customer logos and
//   the homepage's customer cards join every page.
// - FACTS_REVIEWED: when the competitor facts (features, prices) were last checked.
//   Shown under Sources. Move it only after re-checking every competitor's public pages.
//   2026-10-07: all seven re-checked on the vendors' own pages (Origami's plans moved to
//   $49 / $129 / $399, and it now runs the plays you approve).
//   REMINDER: re-check by 2027-01-05 (90 days), then move this date again.
// A page written after that review carries its own two dates in its config (`modified`,
// `factsReviewed`), so it never claims a review it did not get. 2026-11-10: Clay, Apollo,
// ZoomInfo, Instantly, HeyReach, 11x and Smartlead, each read on the vendor's own pages that
// day. Drop a page's own dates once a full review moves the two constants past them.
// A page's own `modified` also dates a change made to some pages only: 2026-11-17, the thirteen
// GTM tool pages took the "<Tool> alternative" eyebrow, the "Is Pancake a <Tool> alternative?"
// question and the competitors line (below); the four AI agent pages did not change.
// dateModified is the newer of the page's own date and PAGE_MODIFIED.
const PAGE_MODIFIED = "2026-11-16";
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
  /** JSON-LD dateModified ("2026-11-10"), for a page newer than PAGE_MODIFIED. */
  modified?: string;
  /** The date under Sources ("November 10, 2026"), for a page checked after FACTS_REVIEWED. */
  factsReviewed?: string;
};

function ComparisonCell({ cell }: { cell: ComparisonCellData }) {
  if (!cell.mark) return <span className="cmp-mark__text">{cell.text}</span>;
  const Icon = cell.mark === "yes" ? LuCheck : LuX;
  return (
    <span className="cmp-mark">
      <Icon
        size={18}
        aria-hidden
        className={cell.mark === "yes" ? "cmp-mark__icon cmp-mark__icon--yes" : "cmp-mark__icon cmp-mark__icon--no"}
      />
      <span className="cmp-mark__text">{cell.text}</span>
    </span>
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

/**
 * Every /<tool>-vs-pancake page (and /pancake-vs-paperclips). Since 2026-11-16 it wears the paid
 * search pages' layout (SearchLandingPage.tsx), the ad landing pages that start the most trials:
 * they show the product, the customers and the trial line where these showed two text cards and
 * three badges. The comparison itself is unchanged, word for word.
 *
 *   nav → hero (on a GTM tool's page the "<Tool> alternative" eyebrow, then H1 = the page's
 *   name as the badge + the heroLede, the heroSummary, Start free and Watch demo, the trial
 *   line) → the demo film → customer logos → the verdict (the two cards, then when the
 *   competitor fits better) → five differences → the feature table → customer proof → FAQ
 *   (+ keep reading, more comparisons, sources) → closing card (Start free and Talk to sales)
 *   → footer.
 *
 * The searches that land on these pages ("clay alternative", "lemlist competitors") read their
 * own words near the top (2026-11-17): the eyebrow over the H1, an "Is Pancake a <Tool>
 * alternative?" question in each page's FAQ, and "More competitors compared" on the siblings
 * line. Only on the GTM tools the site lists (COMPARE_HUB_GROUPS): the AI agents off the hub
 * (Claude Tag, Viktor, OpenClaw, Paperclip) are what a founder runs Pancake from, not
 * competitors (founder, 2026-10-13, compare-data.ts), so their pages keep the plain head.
 *
 * The kits: the /for kit and the Claude guide's sheet (.lp-vx, .lp-guide), the search pages'
 * sheet (.lp-search), and comparison.css for the few pieces only these pages have (.lp-cmp).
 * The design kit (components.css) no longer loads here.
 *
 * Analytics: Start free keeps the comparison ids (app_compare_hero, app_compare_final), Talk to
 * sales its own (call_compare_final); page_path tells the pages apart. The film's anchor (#demo)
 * is a plain in-page link, not tracked, as on the search pages.
 */
export function GtmComparisonPage({ config }: { config: GtmComparisonConfig }) {
  const entry = hubEntry(config);
  const canonicalUrl = `${SITE_ORIGIN}/${config.slug}`;
  const pageName = compareName(entry);
  // a GTM tool the site lists, so a competitor: the "<Tool> alternative" words (comment above)
  const isCompetitor = COMPARE_HUB_GROUPS.includes(entry.group);
  const dateModified = config.modified && config.modified > PAGE_MODIFIED ? config.modified : PAGE_MODIFIED;
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
        dateModified,
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
    <main className="lp lp-vx lp-guide lp-search lp-cmp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      {/* frees the logo band's GPU layers off-screen (iPhone OOM guard), as on the search pages */}
      <LpAnimFreeze />
      <LpNav />

      <section id="main-content" tabIndex={-1} className="vx-hero sl-hero" aria-labelledby="cmp-hero-title">
        <div className="vx-col">
          {/* the kit's section eyebrow, where the /for hero has its breadcrumb: same 20px line, so
              the hero keeps the /for rhythm. Outside the H1, which stays "X vs Pancake: …" */}
          {isCompetitor ? <p className="vx-eyebrow">{COMPARE_HERO.eyebrow(config.competitor)}</p> : null}
          {/* the H1 reads "Clay vs Pancake: Tables you build versus Plays you deploy from Claude." */}
          <h1 id="cmp-hero-title" className="vx-hero__h1">
            <span className="vx-badge vx-badge--hero" data-tone="brand">
              {pageName}
            </span>
            <span className="vx-sr">: </span>
            <span className="vx-hero__title">{config.heroLede}</span>
          </h1>
          <p className="vx-hero__lede">{vxNoWidow(config.heroSummary)}</p>
          <div className="lp-hero-btns vx-hero__btns sl-hero__btns">
            <LpFxLink href={APP_ORIGIN} data-analytics-id="app_compare_hero">
              {SL_CTA.primary}
            </LpFxLink>
            <LpFxLink href={`#${SL_DEMO_ID}`} className="lp-btn--tinted lp-btn--demo">
              {SL_CTA.demo}
            </LpFxLink>
          </div>
          <p className="sl-trial">{SL_TRIAL_LINE}</p>
        </div>
      </section>

      <div id={SL_DEMO_ID} className="sl-film">
        <LpVideo grow={false} className="sl-video" />
      </div>

      <div className="vx-logos sl-logos">
        <LpMarquee labelled />
      </div>

      <section className="vx-sec cmp-verdict" aria-labelledby="cmp-verdict-title">
        <div className="vx-col">
          <VxHead id="cmp-verdict-title" eyebrow="The verdict" title={config.verdictTitle} lede={config.verdictLede} />
          <div className="cmp-pair">
            <article className="gd-card cmp-card">
              <span className="cmp-card__icon" aria-hidden="true">
                {config.competitorInitial}
              </span>
              <h3 className="cmp-card__name lp-display">{config.competitor}</h3>
              <p className="cmp-card__body">{vxNoWidow(config.competitorBody)}</p>
              <p className="cmp-card__choose">{config.competitorChoose}</p>
            </article>
            <article className="gd-card cmp-card cmp-card--pancake">
              <span className="cmp-card__icon cmp-card__icon--logo" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element -- raster brand mark */}
                <img src="/pancake-mark.png" alt="" width={48} height={48} />
              </span>
              <h3 className="cmp-card__name lp-display">Pancake</h3>
              <p className="cmp-card__body">{vxNoWidow(config.pancakeBody)}</p>
              <p className="cmp-card__choose">{config.pancakeChoose}</p>
            </article>
          </div>
          <div className="cmp-fit">
            <p className="cmp-fit__who">
              <span className="cmp-fit__avatar" aria-hidden="true">
                {config.competitorInitial}
              </span>
              <span className="cmp-fit__id">
                <span className="cmp-fit__name">
                  Choose {config.competitor}
                  <LuBadgeCheck className="cmp-fit__verified" aria-hidden />
                </span>
                <span className="cmp-fit__handle">Best fit</span>
              </span>
            </p>
            <p className="cmp-fit__text">{vxNoWidow(config.competitorBestFit)}</p>
            <p className="cmp-fit__foot">An honest comparison, based on public product information.</p>
          </div>
        </div>
      </section>

      <section className="vx-sec cmp-diffs-sec" aria-labelledby="cmp-diffs-title">
        <div className="vx-col">
          <VxHead id="cmp-diffs-title" eyebrow="Differences" title="Five differences that matter" lede={config.differencesLede} />
          <ol className="cmp-diffs">
            {config.differences.map((difference) => (
              <li key={difference.n} className="cmp-diff">
                <p className="cmp-diff__num" aria-hidden="true">
                  {difference.n}
                </p>
                <h3 className="cmp-diff__title lp-display">{difference.title}</h3>
                <div className="cmp-diff__text">
                  <p className="cmp-diff__body">{vxNoWidow(difference.body)}</p>
                  <p className="cmp-diff__angle">{difference.angle}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* the id keeps the old "See how they compare" anchor (#vvp-compare) working */}
      <section id="vvp-compare" className="vx-sec cmp-table-sec" aria-labelledby="cmp-table-title">
        <div className="vx-col">
          <VxHead id="cmp-table-title" eyebrow="Features" title="Head to head, feature by feature" />
          <div className="cmp-table-wrap">
            <table className="cmp-table">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">{config.competitor}</th>
                  <th scope="col">Pancake</th>
                </tr>
              </thead>
              <tbody>
                {config.rows.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row">{row.feature}</th>
                    {/* data-label: phones draw each row as a card, every value under its tool's name */}
                    <td data-label={config.competitor}>
                      <ComparisonCell cell={row.competitor} />
                    </td>
                    <td data-label="Pancake">
                      <ComparisonCell cell={row.pancake} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SlProof />

      <section className="vx-sec vx-faq-sec" aria-labelledby="cmp-faq-title">
        <div className="vx-col">
          <VxHead id="cmp-faq-title" eyebrow="FAQ" title="Questions founders ask" />
          <div className="vx-faq">
            {config.faqs.map((f) => (
              <details key={f.q} className="vx-qa">
                <summary>
                  <span className="vx-qa__q">{vxNoWidow(f.q, 16)}</span>
                  <svg className="vx-qa__icon" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
                    <path d="M10 3.5v13M3.5 10h13" />
                  </svg>
                </summary>
                <p className="vx-qa__a">{vxNoWidow(f.a)}</p>
              </details>
            ))}
          </div>
          <div className="cmp-links">
            <p>
              Keep reading:{" "}
              {config.related.map((link, index) => (
                <span key={link.href}>
                  {index > 0 ? ", " : ""}
                  <Link href={link.href}>{link.label}</Link>
                </span>
              ))}
              .
            </p>
            {moreComparisons.length > 0 ? (
              <p>
                {isCompetitor ? COMPARE_LINKS.moreCompetitors : COMPARE_LINKS.more}{" "}
                {moreComparisons.map((c) => (
                  <span key={c.slug}>
                    <Link href={comparePath(c)}>{compareName(c)}</Link>,{" "}
                  </span>
                ))}
                or <Link href={COMPARE_PATH}>{COMPARE_LINKS.moreAll}</Link>.
              </p>
            ) : null}
            <p>
              Sources:{" "}
              {config.sources.map((source, index) => (
                <span key={source.href}>
                  {index > 0 ? ", " : ""}
                  <a href={source.href} target="_blank" rel="noopener noreferrer">
                    {source.label}
                  </a>
                </span>
              ))}
              . Reviewed {config.factsReviewed ?? FACTS_REVIEWED}.
            </p>
          </div>
        </div>
      </section>

      <section className="vx-sec sl-final" aria-labelledby="cmp-final-title">
        <div className="vx-col">
          <div className="sl-final__card">
            <h2 id="cmp-final-title" className="sl-final__title lp-display">
              {config.closingTitle}
            </h2>
            <p className="sl-final__body">{vxNoWidow(config.closingLede)}</p>
            {/* the pair the comparison pages always closed on: Start free, then Talk to sales */}
            <div className="lp-hero-btns sl-final__btns">
              <LpFxLink href={APP_ORIGIN} data-analytics-id="app_compare_final">
                {SL_CTA.primary}
              </LpFxLink>
              <LpFxLink href={DEMO_PAGE_PATH} className="lp-btn--tinted lp-btn--demo" data-analytics-id="call_compare_final">
                Talk to sales
              </LpFxLink>
            </div>
            <p className="sl-trial">{SL_TRIAL_LINE}</p>
            {/* back to the /compare hub (2026-10-07); the arrow is aria-hidden, so the link reads its words only */}
            <p className="cmp-all">
              <Link href={COMPARE_PATH}>
                {COMPARE_LINKS.seeAll}
                <span aria-hidden="true">&nbsp;→</span>
              </Link>
            </p>
          </div>
        </div>
      </section>

      <LpFooter />
    </main>
  );
}
