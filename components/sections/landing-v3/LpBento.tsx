import type { CSSProperties } from "react";

import { LpBentoVideo } from "@/components/sections/landing-v3/LpBentoVideo";
import {
  BENTO_LIST_LABEL,
  BENTO_LOGO_BODY,
  BENTO_TITLE,
  BENTO_VIDEO_LABELS,
  resolveBento,
  type BentoKpiCard,
  type BentoLogo,
  type BentoPhoto,
  type BentoPlaced,
  type BentoPoster,
  type BentoQuoteCard,
  type BentoVideoCard,
} from "@/components/sections/landing-v3/lp-bento-data";
import { placeholderImageSrc } from "@/components/sections/landing-v3/lp-bento-placeholder";
import { SHOW_PLACEHOLDERS } from "@/lib/placeholders";

/**
 * Testimonials / KPI bento (V2 Figma 4911:762 "Frame 168", 1654 × 1448; mobile artboard
 * 5024:10543). Owner: bento package. Between the CTA and pricing, a DIRECT <section
 * class="lp-bento"> child of main.lp, so the agents view hides it with every other section.
 *
 * Content: the designer's seven cards, shared by four customers (Kinro, Praxis, Vector Legal,
 * AgentMail: lp-bento-data.ts), all final. Gating (lib/placeholders.ts): production renders only "final" cards, so it may hold
 * a partial set; dev / preview fill the other slots with their placeholders (marked
 * data-placeholder; none today). Null when nothing is left, and in production while BENTO_LIVE
 * (lp-bento-data.ts) is off. `placeholders` and `live` are injectable for tests
 * (scripts/placeholder-gate.test.mjs renders the set that goes live).
 *
 * Layout (all numbers come from resolveBento, CSS in bento.css, every card metric in `--u`):
 *   - all seven cards: the artboard. Desktop 4 × 3 on the 1136 column (`--u` = 1 px at ≥ 1200,
 *     the column / 1136 below, tablets included), phones the two-column stack (`--u` = the
 *     column / 560). Which customer sits in which card, and the stack's order, follow one rule:
 *     no two cards of one company touch (lp-bento-data.ts BENTO_SLOT_IDS, FLOW_ORDER);
 *   - a partial set: rows on a 12-column desktop grid (data-layout="rows", spans from the server),
 *     the same two-column stack below 1025 with a lone narrow card widened (data-solo).
 *
 * Motion: the video tiles only (LpBentoVideo, self-gated: a MUTED preview in view, the film with
 * sound in a dialog on demand). The portrait blobs are static (decision §7).
 * Analytics: no new ids (no link surface here; founder approval + a GTM trigger first).
 */
export function LpBento({ placeholders = SHOW_PLACEHOLDERS, live }: { placeholders?: boolean; live?: boolean } = {}) {
  const bento = resolveBento(placeholders, undefined, live);
  if (!bento) return null;
  // the grid's height in each layout, for the content-visibility estimate (bento.css)
  const size = {
    "--lp-bento-grid-u": bento.size.gridU,
    "--lp-bento-tablet-px": bento.size.tabletPx,
    "--lp-bento-tablet-u": bento.size.tabletU,
    "--lp-bento-flow-u": bento.size.flowU,
    "--lp-bento-flow-gaps": bento.size.flowGaps,
  } as CSSProperties;
  return (
    <section className="lp-bento" aria-labelledby="lp-bento-title" style={size}>
      {/* the paddings live on this wrapper, not the section: the section is content-visibility:auto
          (foundation.css), whose contain-intrinsic-size estimate is the CONTENT box */}
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
          <ul className="lp-bento__grid" role="list" aria-label={BENTO_LIST_LABEL} data-layout={bento.full ? "full" : "rows"}>
            {bento.cards.map((placed) => (
              <BentoSlot key={placed.id} placed={placed} full={bento.full} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function BentoSlot({ placed, full }: { placed: BentoPlaced; full: boolean }) {
  const { id, card, row, flow } = placed;
  const attrs = {
    "data-slot": id,
    "data-placeholder": card.status === "placeholder" ? "" : undefined,
    "data-solo": flow.solo ? "" : undefined,
    style: {
      "--lp-bento-flow-order": flow.order,
      "--lp-bento-flow-span": flow.span,
      "--lp-bento-flow-h": flow.height,
      "--lp-bento-span": row?.span,
      "--lp-bento-start": row?.start,
      "--lp-bento-row": row?.height,
    } as CSSProperties,
  };
  if (card.kind === "video") {
    return (
      <li className="lp-bento__card lp-bento__card--video" {...attrs}>
        <VideoTile card={card} sizes={posterSizes(placed, full)} />
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

const round = (n: number, digits = 2) => Number(n.toFixed(digits));

/** The full grid's video tiles, desktop px (the artboard's). */
const FULL_TILE = { videoLg: [560, 750], videoSm: [272, 375] } as const;

/**
 * Poster `sizes`. The poster is cover-fitted, so it is drawn as wide as the tile or as the
 * tile's height × the film's aspect, whichever is larger. Phones: a share of the 560-unit
 * column (the viewport minus its gutters) up to 592 wide, where the stack stops growing
 * (bento.css --lp-bento-stack-max: 560 + the two 16 gutters), then that width in px; above:
 * desktop px (tablet tiles are within a few px).
 */
function posterSizes({ id, card, row, flow }: BentoPlaced, full: boolean): string {
  if (card.kind !== "video") return "100vw";
  const aspect = card.poster.width / card.poster.height;
  const drawn = (width: number, height: number) => Math.max(width, height * aspect);
  const [width, height] = full || !row ? FULL_TILE[id === "videoLg" ? "videoLg" : "videoSm"] : [row.span * 80 + (row.span - 1) * 16, row.height];
  const stack = drawn(flow.span === 2 ? 560 : 272, flow.height);
  return `(max-width: 592px) ${Math.ceil((stack / 560) * 100)}vw, (max-width: 767px) ${Math.ceil(stack)}px, ${Math.ceil(drawn(width, height))}px`;
}

function VideoTile({ card, sizes }: { card: BentoVideoCard; sizes: string }) {
  const { poster, focus, film } = card;
  // the crop of a landscape film in this tile, as shares of the frame's height (bento.css)
  const crop = {
    "--lp-bento-keep": round(focus.keepLeft / poster.height, 5),
    "--lp-bento-centre": round(focus.centre / poster.height, 5),
    "--lp-bento-wide": round(focus.wideLeft / poster.height, 5),
  } as CSSProperties;
  const still = <Poster poster={poster} sizes={sizes} />;
  return (
    <>
      {film ? (
        <LpBentoVideo film={film} filmPoster={"srcSet" in poster ? largest(poster.srcSet) : undefined} title={card.title} labels={BENTO_VIDEO_LABELS} style={crop}>
          {still}
        </LpBentoVideo>
      ) : (
        <div className="lp-bento__media" style={crop}>
          {still}
        </div>
      )}
      <Logo logo={card.logo} />
      <p className="lp-sr-only">{card.description}</p>
    </>
  );
}

/** The last (largest) candidate of a `w`-descriptor srcset. */
const largest = (srcSet: string) => srcSet.split(",").pop()?.trim().split(/\s+/)[0];

/** A tile's rest picture: the film's poster frame, lazy, cover-fitted and cropped by bento.css. */
function Poster({ poster, sizes }: { poster: BentoPoster; sizes: string }) {
  const { width, height } = poster;
  if ("placeholder" in poster) {
    const src = placeholderImageSrc(poster.placeholder);
    if (!src) return null;
    // eslint-disable-next-line @next/next/no-img-element -- a data-URI stand-in can't go through next/image
    return <img className="lp-bento__poster" src={src} width={width} height={height} alt="" loading="lazy" decoding="async" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- art-directed poster, srcset by hand
    <img className="lp-bento__poster" src={poster.src} srcSet={poster.srcSet} sizes={sizes} width={width} height={height} alt="" loading="lazy" decoding="async" />
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
            <p>{keepHyphenated(card.quote)}</p>
          </blockquote>
          <figcaption className="lp-bento__by">
            <b>{name}</b>, {role} at {company}
          </figcaption>
        </div>
      </figure>
    </>
  );
}

/** A hyphenated word stays on one line ("high-intent" broke after its hyphen). */
function keepHyphenated(text: string) {
  return text.split(/(\S+-\S+)/g).map((part, i) =>
    part.includes("-") ? (
      <span key={i} className="lp-bento__nowrap">
        {part}
      </span>
    ) : (
      part
    ),
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
  const src = "placeholder" in photo ? placeholderImageSrc(photo.placeholder) : photo.src;
  if (!src) return <span className="lp-bento__portrait" aria-hidden="true" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- clipped by an SVG path; a data-URI stand-in can't go through next/image
    <img className="lp-bento__portrait" src={src} alt="" width={640} height={640} loading="lazy" decoding="async" aria-hidden="true" />
  );
}

/**
 * A customer's wordmark as an alpha mask in the card's ink, sized by its letter body like the
 * marquee's (so Praxis and Kinro read at one size), with the marquee's YC badge right of the
 * wordmark, its top on the wordmark's top (inside the card's padding line).
 */
function Logo({ logo }: { logo: BentoLogo }) {
  const height = BENTO_LOGO_BODY / (logo.body[1] - logo.body[0]);
  const box = {
    "--lp-bento-logo-w": round(height * logo.ratio),
    "--lp-bento-logo-h": round(height),
  } as CSSProperties;
  const mask = { WebkitMaskImage: `url(${logo.src})`, maskImage: `url(${logo.src})` } as CSSProperties;
  return (
    <span className="lp-bento__logo" data-yc={logo.yc ? "" : undefined} style={box}>
      <span className="lp-bento__logo-art" role="img" aria-label={logo.yc ? `${logo.name} (Y Combinator)` : logo.name} style={mask} />
      {logo.yc && <span className="lp-bento__yc" aria-hidden="true" />}
    </span>
  );
}
