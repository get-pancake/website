import type { Viewport } from "next";
import Link from "next/link";
import { LuCheck, LuX } from "react-icons/lu";

import { COMPARE_HERO, COMPARE_LINKS, COMPARE_META, COMPARE_SWITCH } from "@/components/sections/compare/compare-copy";
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
import {
  SEARCH_LANDINGS,
  SL_CTA,
  SL_DEMO_ID,
  SL_TRIAL_LINE,
} from "@/components/sections/search-landing/search-landing-copy";
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

/** /claude-for-sales's "how it works" (search-landing-copy.ts), shown on every comparison page. */
const CLAUDE_STEPS = SEARCH_LANDINGS["claude-for-sales"].steps;

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
//   2026-11-17: the pages argue for Pancake (founder: "la comparaison doit donner envie de
//   préférer pancake"), in the /claude-for-sales layout he named as the model. The hero says why
//   to pick Pancake, the "Why teams pick Pancake" cards keep the differences Pancake wins, the
//   steps show how it works, and the table marks Pancake's column only. Gone: the two neutral
//   cards, the "Choose <Tool> · Best fit" card, the "<Tool> wins on …" differences and the
//   table rows where Pancake has no answer. The competitor facts are unchanged, word for word.
const PAGE_MODIFIED = "2026-11-17";
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
  /** The hero of a GTM tool's page (2026-11-17): why to pick Pancake, in the searcher's frame.
   *  title: one claim, <= 8 words. lede: <= 30 words, Pancake as the actor, ends on the payoff.
   *  Every fact in it is already on the page (the differences, the table). Without it the hero
   *  shows heroLede and heroSummary. */
  pitch?: { title: string; lede: string };
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
 *   nav → hero (H1 = the badge + the promise: on a GTM tool's page "<Tool> alternative" + its
 *   pitch, on an AI agent's page its name + its heroLede; the lede, Start free and Watch demo,
 *   the trial line) → the demo film → customer logos → why teams pick Pancake (the differences
 *   Pancake wins, as numbered cards) → how it works (/claude-for-sales's three steps) → the
 *   feature table (Pancake's column marked, the rows where Pancake has an answer) → customer
 *   proof → FAQ (+ keep reading, more comparisons, sources) → closing card (Start free and Talk to
 *   sales) → footer.
 *
 * 2026-11-17 evening: the pages argue for Pancake (PAGE_MODIFIED says what changed). The
 * searches that land here ("clay alternative", "lemlist competitors") read their own words in
 * the H1's badge, in an "Is Pancake a <Tool> alternative?" question in each page's FAQ, and in
 * "More competitors compared" on the siblings line. Only on the GTM tools the site lists
 * (COMPARE_HUB_GROUPS): the AI agents off the hub (Claude Tag, Viktor, OpenClaw, Paperclip) are
 * what a founder runs Pancake from, not competitors (founder, 2026-10-13, compare-data.ts), so
 * their pages keep their name as the badge.
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
  const heroBadge = isCompetitor ? COMPARE_HERO.eyebrow(config.competitor) : pageName;
  // the differences Pancake wins: a "<Tool> wins on …" difference stays out of the page
  const switchReasons = config.differences.filter((d) => !d.title.startsWith(`${config.competitor} wins`));
  // the rows where Pancake has an answer; the competitor's column is read as plain text
  const tableRows = config.rows.filter((row) => row.pancake.mark !== "no");
  // the questions that list what the other tool does better ("What does Clay do that Pancake
  // doesn't?", "Is Lemlist better for …") stay off the page and out of the FAQPage data
  const faqs = config.faqs.filter(
    (f) => !f.q.includes(" do that Pancake doesn") && !f.q.startsWith(`Is ${config.competitor} better`),
  );
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
        mainEntity: faqs.map(({ q, a }) => ({
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
          {/* as /claude-for-sales: H1 = the badge (the searcher's words, "Clay alternative") + the
              page's promise; an AI agent's page keeps its name and heroLede. */}
          <h1 id="cmp-hero-title" className="vx-hero__h1">
            <span className="vx-badge vx-badge--hero" data-tone="brand">
              {heroBadge}
            </span>
            <span className="vx-sr">: </span>
            <span className="vx-hero__title">{config.pitch?.title ?? config.heroLede}</span>
          </h1>
          <p className="vx-hero__lede">{vxNoWidow(config.pitch?.lede ?? config.heroSummary)}</p>
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

      {/* why to switch: the differences Pancake wins, as the search pages' numbered cards, each
          ending on its one-line angle */}
      <section className="vx-sec cmp-switch-sec" aria-labelledby="cmp-switch-title">
        <div className="vx-col">
          <VxHead
            id="cmp-switch-title"
            eyebrow={COMPARE_SWITCH.eyebrow}
            title={isCompetitor ? COMPARE_SWITCH.h2(config.competitor) : COMPARE_SWITCH.h2Agent}
            lede={config.differencesLede}
          />
          <ol className="sl-steps__list cmp-switch">
            {switchReasons.map((reason, i) => (
              <li key={reason.title} className="gd-card sl-step cmp-switch__card">
                <p className="sl-step__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="sl-step__title lp-display">{reason.title}</h3>
                <p className="sl-step__body">{vxNoWidow(reason.body)}</p>
                <p className="cmp-switch__angle">{reason.angle}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* how it works: /claude-for-sales's three steps, the example request drawn as a chat message */}
      <section className="vx-sec sl-steps" aria-labelledby="cmp-steps-title">
        <div className="vx-col">
          <VxHead id="cmp-steps-title" eyebrow={COMPARE_SWITCH.stepsEyebrow} title={CLAUDE_STEPS.h2} />
          <ol className="sl-steps__list">
            {CLAUDE_STEPS.items.map((s, i) => (
              <li key={s.title} className="gd-card sl-step">
                <p className="sl-step__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="sl-step__title lp-display">{s.title}</h3>
                <p className="sl-step__body">{vxNoWidow(s.body)}</p>
                {s.ask ? (
                  <div className="sl-step__ask">
                    <p className="sl-ask">{s.ask}</p>
                  </div>
                ) : null}
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
                {tableRows.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row">{row.feature}</th>
                    {/* data-label: phones draw each row as a card, every value under its tool's name */}
                    <td data-label={config.competitor}>
                      <span className="cmp-mark__text">{row.competitor.text}</span>
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
            {faqs.map((f) => (
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
