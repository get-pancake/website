import type { CSSProperties } from "react";

import { LpBentoRail } from "@/components/sections/landing-v3/LpBentoRail";
import { LpBentoVideo } from "@/components/sections/landing-v3/LpBentoVideo";
import {
  BENTO_LIST_LABEL,
  BENTO_SLOT_IDS,
  BENTO_TITLE,
  BENTO_VIDEO_LABELS,
  resolveBento,
  type BentoCard,
  type BentoKpiCard,
  type BentoLogo,
  type BentoPhoto,
  type BentoQuoteCard,
  type BentoSlotId,
  type BentoVideoCard,
} from "@/components/sections/landing-v3/lp-bento-data";
import { BentoMark } from "@/components/sections/landing-v3/lp-bento-marks";
import { placeholderPortraitSrc } from "@/components/sections/landing-v3/lp-bento-placeholder";
import { SHOW_PLACEHOLDERS } from "@/lib/placeholders";

/**
 * Testimonials / KPI bento (V2 Figma 4911:762 "Frame 168", 1654 × 1448). Owner: bento package.
 * Between the CTA and pricing (decision 2026-10-09 page order), a DIRECT <section class="lp-bento">
 * child of main.lp, so the agents view hides it with every other section (audience.css).
 *
 * Gating (lib/placeholders.ts, decision §7): production renders the section only once every slot of
 * lp-bento-data.ts holds a "final" card, else null; dev / preview fill the empty slots with the V2
 * placeholders (marked data-placeholder). `placeholders` is injectable for tests only.
 *
 * Desktop = the artboard: title, then a 4 × 3 grid of seven cards on the 1136 column (cols 272,
 * rows 369 / 365 / 375, gaps 16), every card metric in `--u` (1 px at ≥ 1200, the column / 1136
 * below, so 1025–1199 scales the composed grid, never crops it). Tablet: two columns. Phones: a
 * horizontal swipe rail of equal-height cards (founder precedent 2026-08-31), its scroll snap armed
 * on the first touch by LpBentoRail (a WebKit trap, see there). CSS: bento.css.
 *
 * Motion: the video tiles only (LpBentoVideo, self-gated). The two portrait blobs are STATIC
 * (decision §7: the 20 s spin on them is the copied ring vector's, not designed for faces).
 * "View story" (explorations 4962:565 / 4962:675) is not built: no story pages exist.
 * Analytics: no new ids (no link surface here).
 */
export function LpBento({ placeholders = SHOW_PLACEHOLDERS }: { placeholders?: boolean } = {}) {
  const layout = resolveBento(placeholders);
  if (!layout) return null;
  return (
    <section className="lp-bento" aria-labelledby="lp-bento-title">
      {/* the paddings live on this wrapper, not the section: the section is content-visibility:auto
          (foundation.css), whose contain-intrinsic-size estimate is the CONTENT box, so it states
          the whole height (1448 / 2182 / 625) only with a padding-free section */}
      <div className="lp-bento__inner">
        {/* the portrait blob (Figma 4939:4700 path ÷ its 310.59 × 313.19 bbox; 4939:4710 is the same
            shape × 0.82859), in bbox units so one clip serves every size */}
        <svg className="lp-bento__defs" width="0" height="0" aria-hidden="true" focusable="false">
          <clipPath id="lp-bento-blob" clipPathUnits="objectBoundingBox">
            <path d="M 0.47536 0 C 0.70022 0 1 0.23911 1 0.48527 C 1 0.75155 0.79849 1 0.53304 1 C 0.41183 1 0.28267 0.95266 0.19369 0.88213 C 0.08778 0.79818 -0.00146 0.70226 0.00002 0.52445 C 0.00241 0.23691 0.22266 0 0.47536 0 Z" />
          </clipPath>
        </svg>
        <h2 id="lp-bento-title" className="lp-title-section lp-bento__title">
          {BENTO_TITLE}
        </h2>
        <div className="lp-bento__frame">
          {/* tabIndex: the list is a scroll rail on phones; keyboard users scroll it from here */}
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be focusable (WCAG 2.1.1) */}
          <ul className="lp-bento__grid" role="list" aria-label={BENTO_LIST_LABEL} tabIndex={0}>
            {BENTO_SLOT_IDS.map((id) => (
              <BentoSlot key={id} id={id} card={layout[id]} />
            ))}
          </ul>
          <LpBentoRail />
        </div>
      </div>
    </section>
  );
}

function BentoSlot({ id, card }: { id: BentoSlotId; card: BentoCard }) {
  const attrs = {
    "data-slot": id,
    "data-placeholder": card.status === "placeholder" ? "" : undefined,
  };
  if (card.kind === "video") {
    return (
      <li className="lp-bento__card lp-bento__card--video" {...attrs}>
        <VideoTile id={id} card={card} />
      </li>
    );
  }
  if (card.kind === "quote") {
    return (
      <li className="lp-bento__card lp-bento__card--quote" {...attrs}>
        <QuoteCard card={card} />
      </li>
    );
  }
  return (
    <li className="lp-bento__card lp-bento__card--kpi" {...attrs}>
      <KpiCard card={card} />
    </li>
  );
}

/** Poster `sizes`: the poster is cover-fitted, so the drawn width is the tile's width (portrait
 *  tiles narrower than the art) or its height × the art's aspect (the phone rail's 9:16 tiles). */
const POSTER_SIZES: Partial<Record<BentoSlotId, string>> = {
  videoLg: "(max-width: 767px) 275px, (max-width: 1024px) 480px, 560px",
  videoSm: "(max-width: 767px) 280px, (max-width: 1024px) 480px, 272px",
};

function VideoTile({ id, card }: { id: BentoSlotId; card: BentoVideoCard }) {
  return (
    <>
      <LpBentoVideo
        mp4={card.video.mp4}
        webm={card.video.webm}
        poster={{ ...card.poster, sizes: POSTER_SIZES[id] ?? "100vw" }}
        labels={BENTO_VIDEO_LABELS}
      />
      <Logo logo={card.logo} />
      <p className="lp-sr-only">{card.description}</p>
    </>
  );
}

function QuoteCard({ card }: { card: BentoQuoteCard }) {
  const { name, role, company } = card.person;
  return (
    <>
      <Portrait photo={card.photo} />
      <figure className="lp-bento__col">
        <Logo logo={card.logo} />
        <div className="lp-bento__foot">
          <blockquote className="lp-bento__quote">
            <p>{card.quote}</p>
          </blockquote>
          <figcaption className="lp-bento__by">
            <b>{name}</b>, {role} at {company}
          </figcaption>
        </div>
      </figure>
    </>
  );
}

function KpiCard({ card }: { card: BentoKpiCard }) {
  return (
    <>
      <Logo logo={card.logo} />
      <p className="lp-bento__kpi">
        <span className="lp-bento__value">{card.value}</span>{" "}
        <span className="lp-bento__label">{card.label}</span>
      </p>
    </>
  );
}

/** The bleeding portrait: the Figma blob bbox, the photo cover-fitted into it (= Figma's FILL of
 *  a square photo), clipped by the blob path; the card clips the bleed. Decorative: the caption
 *  names the person. */
function Portrait({ photo }: { photo: BentoPhoto }) {
  const src = "placeholder" in photo ? placeholderPortraitSrc(photo.placeholder) : photo.src;
  if (!src) return <span className="lp-bento__portrait" aria-hidden="true" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- clipped by an SVG path; the data-URI placeholders can't go through next/image
    <img className="lp-bento__portrait" src={src} alt="" width={400} height={400} decoding="async" aria-hidden="true" />
  );
}

function Logo({ logo }: { logo: BentoLogo }) {
  if (logo.kind === "mark") return <BentoMark mark={logo.mark} name={logo.name} />;
  const style = {
    "--lp-bento-logo-w": logo.width,
    "--lp-bento-logo-h": logo.height,
    WebkitMaskImage: `url(${logo.src})`,
    maskImage: `url(${logo.src})`,
  } as CSSProperties;
  return <span className="lp-bento__logo lp-bento__logo--mask" role="img" aria-label={logo.name} style={style} />;
}
