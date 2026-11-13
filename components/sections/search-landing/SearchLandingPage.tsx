import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";

import { LpAnimFreeze } from "@/components/sections/landing-v3/LpAnimFreeze";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpMarquee } from "@/components/sections/landing-v3/LpMarquee";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { LpVideo } from "@/components/sections/landing-v3/LpVideo";
import {
  BENTO_LOGO_BODY,
  resolveBento,
  type BentoCard,
  type BentoLogo,
} from "@/components/sections/landing-v3/lp-bento-data";
import {
  SL_CTA,
  SL_DEMO_ID,
  SL_EXAMPLES,
  SL_FAQ_HEAD,
  SL_PROOF,
  SL_TRIAL_LINE,
  SL_WAYS,
  type SearchLandingCopy,
} from "@/components/sections/search-landing/search-landing-copy";
import { VxHead } from "@/components/sections/verticals/VxHead";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";
import { APP_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";

/** Each page's <head>: its own title and description, noindex (why: below), the homepage's share
 *  card. No canonical, as on /guides/claude: the root layout sets none, and a noindex page needs
 *  none. */
export function searchLandingMetadata(c: SearchLandingCopy): Metadata {
  return {
    title: c.meta.title,
    description: c.meta.description,
    robots: { index: false, follow: true },
    ...social({ path: c.path, title: c.meta.ogTitle, description: c.meta.description }),
  };
}

/**
 * A paid search landing page (2026-11-13): /claude-for-sales, /ai-sales-agents,
 * /lead-generation-software, one per Google Search ad group (search-landing-copy.ts). Built to
 * answer the ad, light and fast: the /for kit and the Claude guide's sheet (.lp-vx, .lp-guide)
 * plus search-landing.css, none of the homepage's canvases or scroll scenes.
 *
 *   nav → hero (H1 = the searcher's words + the ad's promise, Start free above the fold, the
 *   trial line) → the demo film (click to play, nothing loads before) → customer logos →
 *   how it works (3 steps) → Plays (example requests + the eight ways) → customer proof →
 *   control or pricing (3 cards) → FAQ → closing card → footer.
 *
 * Start free is the homepage's: same address (the app's origin) and the same allow-listed
 * analytics ids, app_hero in the hero and app_final in the closing card; page_path tells the
 * pages apart. The film's anchor (#demo) is a plain in-page link, not tracked.
 *
 * noindex (each page.tsx): these pages answer the ads. The blog's guides cover the same
 * searches for organic traffic (claude-for-sales-prospecting, mcp-for-sales, ai-sdr,
 * ai-lead-generation-tools), so indexing a short ad page on the same words would compete with
 * them. Google Ads does not need the page in the index: its own crawler (AdsBot) rates the
 * landing page, and robots.txt lets every crawler in. Out of the sitemap and llms.txt, linked
 * from no page; scripts/known-urls.txt keeps the addresses from ever answering 404.
 *
 * Client islands: the nav's, the two pills, the film, the logo band's slow-down.
 */
export function SearchLandingPage({ c }: { c: SearchLandingCopy }) {
  const proof = proofCards();
  return (
    <main className="lp lp-vx lp-guide lp-search">
      {/* frees the logo band's GPU layers off-screen (iPhone OOM guard), as on /for */}
      <LpAnimFreeze />
      <LpNav />
      <section id="main-content" tabIndex={-1} className="vx-hero sl-hero" aria-labelledby="sl-hero-title">
        <div className="vx-col">
          <h1 id="sl-hero-title" className="vx-hero__h1">
            <span className="vx-badge vx-badge--hero" data-tone="brand">
              {c.hero.badge}
            </span>
            <span className="vx-sr">: </span>
            <span className="vx-hero__title">{c.hero.title}</span>
          </h1>
          <p className="vx-hero__lede">{vxNoWidow(c.hero.lede)}</p>
          <div className="lp-hero-btns vx-hero__btns sl-hero__btns">
            <LpFxLink href={APP_ORIGIN} data-analytics-id="app_hero">
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

      <section className="vx-sec sl-steps" aria-labelledby="sl-steps-title">
        <div className="vx-col">
          <VxHead id="sl-steps-title" eyebrow={c.steps.eyebrow} title={c.steps.h2} />
          <ol className="sl-steps__list">
            {c.steps.items.map((s, i) => (
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

      <section className="vx-sec sl-plays" aria-labelledby="sl-plays-title">
        <div className="vx-col">
          <VxHead id="sl-plays-title" eyebrow={c.plays.eyebrow} title={c.plays.h2} lede={c.plays.lede} />
          <div className="gd-what__grid">
            <div className="sl-examples">
              <p className="sl-examples__label">{SL_EXAMPLES.label}</p>
              <ul className="sl-examples__list">
                {SL_EXAMPLES.items.map((e) => (
                  <li key={e} className="sl-ask">
                    {e}
                  </li>
                ))}
              </ul>
            </div>
            <div className="gd-card gd-ways">
              <h3 className="gd-card__title lp-display">{SL_WAYS.title}</h3>
              <ol className="gd-ways__list">
                {SL_WAYS.items.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {proof.length ? (
        <section className="vx-sec sl-proof" aria-labelledby="sl-proof-title">
          <div className="vx-col">
            <VxHead id="sl-proof-title" eyebrow={SL_PROOF.eyebrow} title={SL_PROOF.h2} />
            <ul className="sl-proof__grid">
              {proof.map((card, i) => (
                <li key={i} className="gd-card sl-proof__card" data-kind={card.kind}>
                  <ProofCard card={card} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="vx-sec sl-cards" aria-labelledby="sl-cards-title">
        <div className="vx-col">
          <VxHead id="sl-cards-title" eyebrow={c.cards.eyebrow} title={c.cards.h2} />
          <ul className="gd-control__grid">
            {c.cards.items.map((card) => (
              <li key={card.title} className="gd-card gd-control__card">
                <h3 className="gd-card__title lp-display">{card.title}</h3>
                <p>{vxNoWidow(card.body)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="vx-sec vx-faq-sec" aria-labelledby="sl-faq-title">
        <div className="vx-col">
          <VxHead id="sl-faq-title" eyebrow={SL_FAQ_HEAD.eyebrow} title={SL_FAQ_HEAD.h2} />
          <div className="vx-faq">
            {c.faq.map((f) => (
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
        </div>
      </section>

      <section className="vx-sec sl-final" aria-labelledby="sl-final-title">
        <div className="vx-col">
          <div className="sl-final__card">
            <h2 id="sl-final-title" className="sl-final__title lp-display">
              {c.final.title}
            </h2>
            <p className="sl-final__body">{vxNoWidow(c.final.body)}</p>
            <div className="lp-hero-btns sl-final__btns">
              <LpFxLink href={APP_ORIGIN} data-analytics-id="app_final">
                {SL_CTA.primary}
              </LpFxLink>
            </div>
            <p className="sl-trial">{SL_TRIAL_LINE}</p>
          </div>
        </div>
      </section>

      <LpFooter />
    </main>
  );
}

/** The homepage's final customer cards for SL_PROOF's slots, in that order. Production shows only
 *  final cards (resolveBento(false)); a slot without one is left out. */
function proofCards(): BentoCard[] {
  const resolved = resolveBento(false);
  if (!resolved) return [];
  const bySlot = new Map(resolved.cards.map((p) => [p.id, p.card]));
  return SL_PROOF.slots.flatMap((id) => {
    const card = bySlot.get(id);
    return card && card.kind !== "video" ? [card] : [];
  });
}

function ProofCard({ card }: { card: BentoCard }) {
  if (card.kind === "quote") {
    const photo = "src" in card.photo ? card.photo.src : null;
    return (
      <figure className="sl-proof__fig">
        <blockquote className="sl-proof__quote lp-display">
          <p>{`“${card.quote}”`}</p>
        </blockquote>
        <figcaption className="sl-proof__who">
          {photo ? <Image className="sl-proof__photo" src={photo} alt="" width={40} height={40} sizes="40px" /> : null}
          <span className="sl-proof__person">
            <span className="sl-proof__name">{card.person.name}</span>
            <span className="sl-proof__role">{`${card.person.role}, ${card.person.company}`}</span>
          </span>
        </figcaption>
        <CompanyLogo logo={card.logo} />
      </figure>
    );
  }
  if (card.kind === "kpi") {
    return (
      <figure className="sl-proof__fig">
        <p className="sl-proof__value lp-display">{card.value}</p>
        <figcaption className="sl-proof__label">{card.label}</figcaption>
        <CompanyLogo logo={card.logo} />
      </figure>
    );
  }
  return null;
}

/** The customer's wordmark as the bento draws it: an alpha mask in the ink colour, sized so the
 *  letter body is BENTO_LOGO_BODY tall; the Y Combinator mark beside it when the company is YC. */
function CompanyLogo({ logo }: { logo: BentoLogo }) {
  const height = BENTO_LOGO_BODY / (logo.body[1] - logo.body[0]);
  const style: CSSProperties = {
    WebkitMaskImage: `url(${logo.src})`,
    maskImage: `url(${logo.src})`,
    height: `${height.toFixed(2)}px`,
    width: `${(height * logo.ratio).toFixed(2)}px`,
  };
  return (
    <p className="sl-proof__logo">
      <span className="sl-proof__mark" role="img" aria-label={logo.name} style={style} />
      {logo.yc ? <span className="sl-proof__yc" role="img" aria-label="Y Combinator" /> : null}
    </p>
  );
}
