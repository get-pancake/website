import { LpCta } from "@/components/sections/landing-v3/LpCta";
import { LpFitVars } from "@/components/sections/landing-v3/LpFitVars";
import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { ExampleGrid, PlaysPlusIcon } from "@/components/sections/plays/PlaysExamples";
import { PLAYS_PATH } from "@/components/sections/plays/plays-copy";
import { groupId, playGroups } from "@/components/sections/plays/plays-data";
import {
  SIGNAL_PAGE_ORDER,
  SIGNAL_PAGES,
  SIGNAL_SHARED,
  type SignalPage,
  type SignalPageId,
} from "@/components/sections/plays/plays-signals";
import { VxHead } from "@/components/sections/verticals/VxHead";
import { VxArrow } from "@/components/sections/verticals/VxRelated";
import { VX_CTA_LABELS } from "@/components/sections/verticals/vx-copy";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { serializeJsonLd } from "@/lib/json-ld";
import { APP_ORIGIN, SITE_ORIGIN } from "@/lib/site-config.mjs";

/** How many examples a page shows before "All N … examples" (one row fewer than /plays). */
const SIGNAL_VISIBLE = 4;

/**
 * A signal page under /plays (funding, hiring, tech stack; the footer's Features column,
 * 2026-10-17). The /plays kit end to end (.lp-vx: text edge, section rhythm, VxHead, kit
 * badges, the example cards, the FAQ accordion, the /for "Related" rows) with the homepage's
 * nav, CTA card and footer:
 *
 *   Nav → Head (H1 + lede, Start free · Book a demo) → How it works (three cards) → Examples
 *   (written ones, or the approved /for prompts of that kind, each linking to its page) → FAQ →
 *   More ways (the other two pages + /plays) → CTA card → Footer
 *
 * Server, zero JS of its own. The head's pills keep /plays's ids (app_plays_hero /
 * call_plays_hero, allow-listed): these pages are part of the /plays family, and page_path
 * tells them apart. Structured data: WebPage + BreadcrumbList (Home → Example Plays → this
 * page) + FAQPage, the FAQ's Q/As verbatim (the cost answer stays visible-only, as on /plays's
 * siblings).
 */
export function PlaysSignalPage({ id }: { id: SignalPageId }) {
  const page = SIGNAL_PAGES[id];
  return (
    <main className="lp lp-vx lp-vx-plays lp-vx-signal">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(signalJsonLd(page)) }} />
      {/* --lp-fit for the CTA slivers (iOS cqw-in-trig workaround) */}
      <LpFitVars />
      <LpNav />
      <Head page={page} />
      <Steps page={page} />
      <Examples page={page} />
      <Faq page={page} />
      <MoreWays id={id} />
      <LpCta title={SIGNAL_SHARED.cta.title} body={SIGNAL_SHARED.cta.body} />
      <LpFooter />
    </main>
  );
}

function Head({ page }: { page: SignalPage }) {
  return (
    <section id="main-content" tabIndex={-1} className="vx-sec pl-head" aria-labelledby="pl-title">
      <div className="vx-col">
        <VxHead as="h1" id="pl-title" eyebrow={SIGNAL_SHARED.hub} title={page.h1} lede={page.lede} />
        <div className="lp-hero-btns pl-head__btns">
          <LpFxLink href={APP_ORIGIN} data-analytics-id="app_plays_hero">
            {VX_CTA_LABELS.primary}
          </LpFxLink>
          <LpFxLink href={DEMO_PAGE_PATH} className="lp-btn--tinted lp-btn--demo" data-analytics-id="call_plays_hero">
            {VX_CTA_LABELS.secondary}
          </LpFxLink>
        </div>
      </div>
    </section>
  );
}

/** Three cards, one sentence or two each: the /plays "More ways" card recipe, numbered. */
function Steps({ page }: { page: SignalPage }) {
  return (
    <section className="vx-sec pl-sig-steps-sec" aria-labelledby="pl-steps-title">
      <div className="vx-col">
        <VxHead id="pl-steps-title" eyebrow={SIGNAL_SHARED.steps.eyebrow} title={SIGNAL_SHARED.steps.h2} />
        <ol className="pl-sig-steps">
          {page.steps.map((s, i) => (
            <li key={s.title} className="pl-sig-step">
              <span className="vx-badge" data-tone="neutral">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="vx-sig-card__title lp-display">{s.title}</h3>
              <p className="vx-sig-card__body">{vxNoWidow(s.body)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Examples({ page }: { page: SignalPage }) {
  const ex = page.examples;
  let body;
  if (ex.from === "written") {
    body = (
      <ul className="pl-ex-grid">
        {ex.prompts.map((text) => (
          <li key={text}>
            <p className="pl-ex pl-ex--static">
              <span className="pl-ex__text">{vxNoWidow(text)}</span>
            </p>
          </li>
        ))}
      </ul>
    );
  } else {
    const group = playGroups().find((g) => g.kind === ex.kind);
    const examples = group?.examples ?? [];
    body = (
      <>
        <ExampleGrid examples={examples.slice(0, SIGNAL_VISIBLE)} />
        {examples.length > SIGNAL_VISIBLE ? (
          <p className="pl-sig-all">
            <a className="lp-textlink" href={`${PLAYS_PATH}#${groupId(ex.kind)}`}>
              {SIGNAL_SHARED.examples.all(examples.length, ex.label)}
              <span aria-hidden="true"> →</span>
            </a>
          </p>
        ) : null}
      </>
    );
  }
  return (
    <section className="vx-sec pl-sig-ex-sec" aria-labelledby="pl-ex-title">
      <div className="vx-col">
        <VxHead id="pl-ex-title" eyebrow={SIGNAL_SHARED.examples.eyebrow} title={SIGNAL_SHARED.examples.h2} lede={ex.lede} />
        {body}
      </div>
    </section>
  );
}

/** The /plays FAQ accordion (native <details>, all closed, every answer in the server HTML). */
function Faq({ page }: { page: SignalPage }) {
  return (
    <section className="vx-sec vx-faq-sec" aria-labelledby="pl-faq-title">
      <div className="vx-col">
        <VxHead id="pl-faq-title" eyebrow={SIGNAL_SHARED.faqEyebrow} title={page.faqTitle} />
        <div className="vx-faq">
          {page.faq.map((f) => (
            <details key={f.q} className="vx-qa">
              <summary>
                <span className="vx-qa__q">{vxNoWidow(f.q, 16)}</span>
                <PlaysPlusIcon className="vx-qa__icon" />
              </summary>
              <p className="vx-qa__a">{vxNoWidow(f.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The /for "Related" rows: the other two signal pages, then the hub. */
function MoreWays({ id }: { id: SignalPageId }) {
  const rows = SIGNAL_PAGE_ORDER.filter((k) => k !== id).map((k) => ({
    href: SIGNAL_PAGES[k].path,
    ...SIGNAL_PAGES[k].related,
  }));
  return (
    <section className="vx-sec vx-related" aria-labelledby="pl-more-title">
      <div className="vx-col">
        <VxHead id="pl-more-title" eyebrow={SIGNAL_SHARED.related.eyebrow} title={SIGNAL_SHARED.related.h2} />
        <ul className="vx-rel">
          {rows.map((r) => (
            <li key={r.href}>
              <a className="vx-rel__row" href={r.href}>
                <span className="vx-rel__name lp-display">{r.title}</span>
                <span className="vx-rel__line">{vxNoWidow(r.line)}</span>
                <VxArrow className="vx-rel__arrow" />
              </a>
            </li>
          ))}
          <li>
            <a className="vx-rel__row vx-rel__row--hub" href={PLAYS_PATH}>
              <span className="vx-rel__name lp-display">{SIGNAL_SHARED.hubRow.title}</span>
              <span className="vx-rel__line">{SIGNAL_SHARED.hubRow.line}</span>
              <VxArrow className="vx-rel__arrow" />
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}

function signalJsonLd(page: SignalPage) {
  const url = `${SITE_ORIGIN}${page.path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.meta.ogTitle,
        description: page.meta.description,
        inLanguage: "en-US",
        isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SIGNAL_SHARED.crumbHome, item: SITE_ORIGIN },
          { "@type": "ListItem", position: 2, name: SIGNAL_SHARED.hub, item: `${SITE_ORIGIN}${PLAYS_PATH}` },
          { "@type": "ListItem", position: 3, name: page.meta.crumb, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: page.faq
          .filter((f) => f.inJsonLd !== false)
          .map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };
}
