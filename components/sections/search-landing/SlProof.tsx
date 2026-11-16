import Image from "next/image";
import type { CSSProperties } from "react";

import {
  BENTO_LOGO_BODY,
  resolveBento,
  type BentoCard,
  type BentoLogo,
} from "@/components/sections/landing-v3/lp-bento-data";
import { SL_PROOF } from "@/components/sections/search-landing/search-landing-copy";
import { VxHead } from "@/components/sections/verticals/VxHead";

/**
 * The customer proof section of the paid search pages (SearchLandingPage.tsx), also on every
 * comparison page since 2026-11-16 (GtmComparisonPage.tsx): the homepage's own customer cards in
 * SL_PROOF's slots, one row of three (search-landing.css .sl-proof). Draws nothing when no slot
 * has a final card.
 */
export function SlProof() {
  const proof = proofCards();
  if (!proof.length) return null;
  return (
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
