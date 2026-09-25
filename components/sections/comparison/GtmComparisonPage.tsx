import Link from "next/link";
import { LuBadgeCheck, LuCheck, LuCreditCard, LuLock, LuShieldCheck, LuSparkles, LuX } from "react-icons/lu";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { HomeNav } from "@/components/sections/home/HomeNav";
import { HomeLandingTestimonials } from "@/components/sections/home/HomeLandingTestimonials";
import { Footer } from "@/components/shared/Footer";
import { Badge } from "@/components/ui/Badge";
import { H2, H3 } from "@/components/ui/Headings";
import { APP_ORIGIN, SITE_ORIGIN } from "@/lib/site-config.mjs";

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

export function GtmComparisonPage({ config }: { config: GtmComparisonConfig }) {
  const canonicalUrl = `${SITE_ORIGIN}/${config.slug}`;
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${config.competitor} vs Pancake`,
    url: canonicalUrl,
    description: config.heroSummary,
    dateModified: "2026-08-27",
    isPartOf: { "@type": "WebSite", name: "Pancake", url: SITE_ORIGIN },
    author: { "@type": "Person", name: "François de Fitte" },
    about: [
      { "@type": "Thing", name: config.competitor },
      { "@type": "Thing", name: "Pancake" },
    ],
  };
  const faqPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }} />

      <HomeNav />

      <section className="home-landing-section" aria-labelledby="vvp-hero-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <h1 id="vvp-hero-heading" className="heading home-landing-section__title text-center">
              {config.competitor} v. Pancake
            </h1>
            <p className="home-landing-section__lede text-center">{config.heroLede}</p>
            <p className="vvp-hero__summary text-center">{config.heroSummary}</p>
          </header>

          <div className="vvp-hero__cta">
            <div className="vvp-hero__cta-row">
              <a href={APP_ORIGIN} className="button inline-flex w-fit shrink-0 items-center justify-center no-underline" data-size="lg">
                Try Pancake
              </a>
              <a href="#vvp-compare" className="button inline-flex w-fit shrink-0 items-center justify-center no-underline" data-size="lg" data-variant="subtle">
                See how they compare
              </a>
            </div>
            <ul className="vvp-hero__badges">
              <li className="vvp-hero__badge"><LuSparkles aria-hidden /> $99 a month</li>
              <li className="vvp-hero__badge"><LuCreditCard aria-hidden /> No extra seats to hire</li>
              <li className="vvp-hero__badge"><LuShieldCheck aria-hidden /> SOC 2 compliant</li>
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

      <section className="home-landing-section home-landing-section--testimonials" aria-labelledby="vvp-testimonials-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner home-landing-section__inner--testimonials`}>
          <header className="home-landing-section__header">
            <H2 id="vvp-testimonials-heading" className="heading home-landing-section__title text-center">Take it from them</H2>
          </header>
        </div>
        <HomeLandingTestimonials />
      </section>

      <section className="home-landing-section home-landing-section--alt" aria-labelledby="vvp-closing-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner home-landing-section__inner--closing`}>
          <h2 id="vvp-closing-heading" className="heading home-landing-section__closing-title text-center">{config.closingTitle}</h2>
          <p className="home-landing-section__lede home-landing-section__lede--closing text-center">{config.closingLede}</p>
          <div className="home-landing-closing-cta">
            <a href={APP_ORIGIN} className="button inline-flex w-fit shrink-0 items-center justify-center no-underline" data-size="lg">Try Pancake</a>
            <p className="home-landing-closing-cta__note">$99 a month • No GTM team required • SOC 2 compliant</p>
          </div>
        </div>
      </section>

      <section className="home-landing-section" aria-labelledby="vvp-faq-heading">
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
          <p className="vvp-related">
            Sources: {config.sources.map((source, index) => (
              <span key={source.href}>{index > 0 ? ", " : ""}<a href={source.href} target="_blank" rel="noopener noreferrer" className="underline">{source.label}</a></span>
            ))}. Reviewed August 27, 2026.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
