/**
 * Bento copy, data and layout (V2 Figma 4911:762 "Frame 168" and the mobile artboard's stack,
 * 5024:10543 + seven frames). Owner: bento package. In scripts/homepage-lint.mjs FILES: every
 * string here is linted.
 *
 * Content (founder 2026-10-11, decisions §9): the Kinro and Praxis testimonials, the two
 * INDIVIDUAL cuts, never the merged compilation. Quotes are verbatim whole sentences; the numbers
 * are the customers' own. Evidence, frames and timings: artifacts/landing-v2-figma/assets/
 * bento-real/manifest.json and impl/bento-real-assets.md.
 *
 * Seven slots. Each lists its candidate cards with `status` from lib/placeholders.ts:
 *   - "final": real content whose asset is in public/. Always renders, wins its slot.
 *   - "placeholder": a stand-in that renders in dev and on Vercel previews only. Today these are
 *     the two Kinro cards that need Pierre's individual cut (his video tile and his portrait):
 *     they show INTERIM stills taken from the merged compilation, which never get a public URL
 *     (lp-bento-placeholder.ts inlines them).
 * Production renders ONLY final cards, so it may hold a partial set: resolveBento() lays the cards
 * it has out cleanly (rows on desktop, the artboard's two-column stack below) and returns null
 * only when no card is left. With all seven it is the designer's artboard, desktop and phone.
 *
 * How a card becomes final: put its asset in public/lp/bento/, set status "final", keep `source`.
 * Videos, three things per film (recipes: artifacts/landing-v2-figma/assets/bento-real/tools/):
 *   - the film with its sound: the individual cut as H.264 + AAC mp4 (4:3, 960 wide, about
 *     1.2 Mbps, faststart) plus a 640 variant. Fetched ONLY when the visitor opens the sound view;
 *   - the tile's muted preview: a separate video-only cut of about 10 s that loops (480 wide for
 *     phones and small tiles, 720 for large ones, each well under 600 kB). The tile never plays the
 *     film itself (it weighs megabytes; founder precedent 2026-09-07);
 *   - captions for the sound view (WebVTT), and the poster = the full frame (same geometry as the
 *     film and the preview, so one crop serves all three).
 */
import type { ContentStatus } from "@/lib/placeholders";

export const BENTO_TITLE = "Take it from them";
/** The card list's accessible name. */
export const BENTO_LIST_LABEL = "Customer stories";
/** The video tiles' controls. `pause` / `play` drive the muted preview (WCAG 2.2.2); `sound`
 *  opens the film with sound, on demand only; `close` leaves it. */
export const BENTO_VIDEO_LABELS = {
  pause: "Pause preview",
  play: "Play preview",
  sound: "Watch with sound",
  close: "Close video",
} as const;

/**
 * One switch for the founder: false keeps the whole section out of production whatever its
 * entries say (dev and previews still show it). The public launch is 13 Oct 2026 and the
 * testimonial film is scheduled for 15 Oct: flip it if the section must wait for the film.
 */
export const BENTO_LIVE = true;

export type BentoSlotId = "videoLg" | "quoteA" | "kpiA" | "kpiB" | "kpiC" | "quoteB" | "videoSm";
/** The artboard's reading order (row by row on desktop): the DOM order of a full set. */
export const BENTO_SLOT_IDS: readonly BentoSlotId[] = ["videoLg", "quoteA", "kpiA", "kpiB", "kpiC", "quoteB", "videoSm"];

/**
 * A customer's wordmark from public/logos/customers (the marquee's artwork), painted as an alpha
 * mask in the card's ink: plum on cream, white on a video. `ratio` and `body` are LpMarquee's
 * numbers for the same file (artwork width / height; the letter body's top and bottom as shares of
 * the height): the box is sized so every letter body is BENTO_LOGO_BODY tall. `yc`: the small
 * Y Combinator badge of the marquee, above the wordmark's top-right corner.
 */
export type BentoLogo = { name: string; src: string; ratio: number; body: readonly [number, number]; yc?: boolean };
/** Letter-body height of a card logo, desktop px (bento spec §4.4: the V2 marks measure 16–18). */
export const BENTO_LOGO_BODY = 17;

/** Stand-in images kept out of public/ (components/sections/landing-v3/bento-placeholder/). */
export type BentoPlaceholderImage = "kinro-pierre-interim-poster-1000w" | "kinro-pierre-interim-portrait-640";

/** A portrait: a public file, or a stand-in that never gets a public URL. */
export type BentoPhoto = { src: string } | { placeholder: BentoPlaceholderImage };

export type BentoPoster = {
  /** intrinsic size of the largest candidate (the frame every `focus` number is measured in) */
  width: number;
  height: number;
} & (
  | {
      /** smallest candidate (also the no-srcset fallback) */
      src: string;
      srcSet: string;
    }
  | { placeholder: BentoPlaceholderImage }
);

/**
 * Where a landscape film is cropped by a portrait tile (object-fit: cover shows the full height
 * and a band of the width). In px of the poster frame:
 *   - `keepLeft`: the band's left edge in a portrait tile (keeps every face, hides a burned-in
 *     title completely rather than cutting it mid-word);
 *   - `centre`: what a very narrow tile centres on;
 *   - `wideLeft`: the left edge in a near-square tile, wide enough for the title and every face.
 * A tile wider than the film shows the full width. bento.css turns these into object-position.
 */
export type BentoFocus = { keepLeft: number; centre: number; wideLeft: number };

export type BentoFilm = {
  /** the film with its sound: the dialog's source, fetched only once the visitor opens it */
  mp4: string;
  /** a lighter encode of the same film, for a visitor who asked to save data */
  mp4Small?: string;
  /**
   * The tile's muted preview: a short cut of the film WITHOUT an audio track, looped. Never the
   * film itself (megabytes for a tile a few hundred px wide). `mp4` serves phones and small tiles,
   * `mp4Large` a tile drawn taller than LpBentoVideo's LARGE_TILE. Same frame geometry as the
   * poster, first and last frames on a picture cut (the loop reads as one more cut).
   */
  preview: { mp4: string; mp4Large?: string };
  /**
   * WebVTT captions for the sound view. REQUIRED: a film with sound and no captions fails WCAG
   * 1.2.2 (level A), so a film cannot be listed without them. The film's words, checked against
   * its own audio, never an unchecked machine transcript.
   */
  captions: { src: string; srcLang: string; label: string };
};

type CardBase = {
  status: ContentStatus;
  logo: BentoLogo;
  /** Internal provenance. Never rendered (and linted like any string: no figures in it). */
  source?: string;
};

export type BentoVideoCard = CardBase & {
  kind: "video";
  /** Absent: a still tile (an interim poster while the film is not on disk). */
  film?: BentoFilm;
  poster: BentoPoster;
  focus: BentoFocus;
  /** Who speaks: names the sound view. */
  title: string;
  /** Text alternative read in place of the muted preview (which is aria-hidden). */
  description: string;
};

export type BentoQuoteCard = CardBase & {
  kind: "quote";
  /** Verbatim, a whole sentence, no surrounding quotes. */
  quote: string;
  person: { name: string; role: string; company: string };
  photo: BentoPhoto;
};

export type BentoKpiCard = CardBase & {
  kind: "kpi";
  /** The customer's own figure, ≤ 6 glyphs. */
  value: string;
  /** What it counts. One line where it fits; a longer one wraps to two inside the card's content
   *  box and lifts the value by a line, as the designer's component does (bento.css). */
  label: string;
};

export type BentoCard = BentoVideoCard | BentoQuoteCard | BentoKpiCard;

type BentoSlotCard = {
  videoLg: BentoVideoCard;
  quoteA: BentoQuoteCard;
  kpiA: BentoKpiCard;
  kpiB: BentoKpiCard;
  kpiC: BentoKpiCard;
  quoteB: BentoQuoteCard;
  videoSm: BentoVideoCard;
};
type BentoEntries = { [K in BentoSlotId]: readonly BentoSlotCard[K][] };

/* ── the two customers ────────────────────────────────────────────────────────────────────── */

/* Both are in the marquee with the YC badge (public/logos/customers/README.md). */
const PRAXIS: BentoLogo = { name: "Praxis", src: "/logos/customers/praxis.png", ratio: 1392 / 370, body: [0.24, 0.755], yc: true };
const KINRO: BentoLogo = { name: "Kinro", src: "/logos/customers/kinro.svg", ratio: 1308 / 356, body: [0.25, 0.75], yc: true };

/* Names and titles exactly as the films' lower thirds show them ("Diana Khramina / CEO, PRAXIS",
   "Pierre-Alexandre Kamienny / CEO, KINRO"); the company in the logo's spelling. */
const DIANA = { name: "Diana Khramina", role: "CEO", company: "Praxis" };
const PIERRE = { name: "Pierre-Alexandre Kamienny", role: "CEO", company: "Kinro" };

const BENTO_ENTRIES: BentoEntries = {
  /* Kinro, Pierre's individual cut ("Pierre Testimonial 12.mov"): NOT on disk yet (the download
     stalled), so this stays a placeholder: an interim still from the merged compilation, no film.
     To finish: bento-real-assets.md §10, then `film`, a public poster, its own `focus`, "final". */
  videoLg: [
    {
      status: "placeholder",
      kind: "video",
      logo: KINRO,
      poster: { placeholder: "kinro-pierre-interim-poster-1000w", width: 1000, height: 750 },
      focus: { keepLeft: 250, centre: 530, wideLeft: 0 }, // centres the interim still (56.8 % in the 560 × 750 tile)
      title: "Pierre-Alexandre Kamienny, CEO at Kinro",
      description: "Pierre-Alexandre Kamienny, CEO at Kinro, in his customer story.",
      source: "Interim still, merged compilation frame 177. Replace with the Kinro individual cut.",
    },
  ],
  /* Diana, on camera, lips in sync (compilation 31.53–34.43 s; her cut about 36.2–39.6 s). */
  quoteA: [
    {
      status: "final",
      kind: "quote",
      logo: PRAXIS,
      quote: "I cancelled all my subscriptions and I’m using Pancake for three of them.",
      person: DIANA,
      photo: { src: "/lp/bento/praxis-diana-portrait-640.webp" },
      source: "Praxis individual cut (Testimonial Diana - 4 x1.09.mov), checked compilation transcript sentence 8; portrait = frame 524 of the cut.",
    },
  ],
  /* Diana Khramina's own figures: a message to Tristan on 2026-09-18, and the same two on camera
     in her cut ("my reply rate is above 10% on most of campaigns I'm running. So it helped me to
     book at least 10 meetings per week"). The message's wording and link are in the spec
     (artifacts/landing-v2-figma/specs/updates/_bento-real-testimonials.md), kept out of this
     public repository on purpose. Founder 2026-10-11: her figures, in the designer's big-number
     format. The three KPI pairs go to scripts/homepage-lint.mjs as whole strings (bentoKpiClaims
     below), to be checked against its explicit, sourced allow-list. */
  kpiA: [
    { status: "final", kind: "kpi", logo: PRAXIS, value: "10%+", label: "reply rate", source: "Diana Khramina, message to Tristan 2026-09-18 (reference in the spec, see the comment above), repeated on camera in her cut." },
  ],
  kpiB: [
    { status: "final", kind: "kpi", logo: PRAXIS, value: "10+", label: "meetings booked a week", source: "Diana Khramina, message to Tristan 2026-09-18 (reference in the spec, see the comment above), repeated on camera in her cut." },
  ],
  /* Pierre on camera: "Pancake helped me book 15 meetings last week" (compilation 61.68–63.72 s).
     One week, as he says it. Re-check on his individual cut when it lands. */
  kpiC: [
    { status: "final", kind: "kpi", logo: KINRO, value: "15", label: "meetings booked in a week", source: "Pierre-Alexandre Kamienny on camera, merged compilation sentence 14." },
  ],
  /* Pierre, on camera, lips in sync (compilation 28.45–31.33 s). The quote is final copy; the card
     stays a placeholder for its portrait, an interim crop of the compilation (soft at 2x). */
  quoteB: [
    {
      status: "placeholder",
      kind: "quote",
      logo: KINRO,
      quote: "I’m running all of my GTM in Codex using Pancake.",
      person: PIERRE,
      photo: { placeholder: "kinro-pierre-interim-portrait-640" },
      source: "Checked compilation transcript sentence 7. Portrait: interim, redo from the Kinro individual cut.",
    },
  ],
  /* Praxis, Diana's individual cut, founder-validated 2026-09-29 (58.2 s, 4:3). Her name title is
     burned in at x 60–475 of 1440 (4.2–9.07 s) and her face stays within x 501–1064 from 3.667 s
     on: hence `focus`.
     Preview: 3.667–13.433 s of the film (the first shot a portrait tile frames well, to the end of
     the side angle; 0–2.57 s is intro B-roll without her, 2.57–3.67 s a shot whose face a portrait
     tile cuts), video only, 301 kB and 569 kB against 5.6 and 8.8 MB for the film.
     Captions: the cut's 41 lines, timed by forced alignment on the film's own audio. The wording
     was checked by machine (three recognisers, alignment scores, the acoustic model's raw
     reading), NOT by a human listen, and one clause ("We just joined Y Combinator", 13.5 s) is
     kept for meaning where the audio alone reads otherwise:
     artifacts/landing-v2-figma/impl/bento-fixes.md. */
  videoSm: [
    {
      status: "final",
      kind: "video",
      logo: PRAXIS,
      film: {
        mp4: "/lp/bento/praxis-diana-960.mp4",
        mp4Small: "/lp/bento/praxis-diana-640.mp4",
        preview: { mp4: "/lp/bento/praxis-diana-preview-480.mp4", mp4Large: "/lp/bento/praxis-diana-preview-720.mp4" },
        captions: { src: "/lp/bento/praxis-diana.en.vtt", srcLang: "en", label: "English" },
      },
      poster: {
        src: "/lp/bento/praxis-diana-poster-500w.webp",
        srcSet: "/lp/bento/praxis-diana-poster-500w.webp 500w, /lp/bento/praxis-diana-poster-1000w.webp 1000w, /lp/bento/praxis-diana-poster-1440w.webp 1440w",
        width: 1440,
        height: 1080,
      },
      focus: { keepLeft: 480, centre: 782.5, wideLeft: 56 },
      title: "Diana Khramina, CEO at Praxis",
      description: "Diana Khramina, CEO at Praxis, tells how she uses Pancake.",
      source: "Testimonial Diana - 4 x1.09.mov, transcoded 2026-10-11 (manifest.json); poster = frame 586.",
    },
  ],
};

/* ── layout ───────────────────────────────────────────────────────────────────────────────── */

/**
 * The two-column stack (phones at every set; tablets with a partial set): the mobile artboard's
 * order and boxes, in desktop px (`--u` scales them). Wide cards take both columns.
 */
const FLOW_ORDER: readonly BentoSlotId[] = ["videoLg", "kpiA", "kpiB", "quoteA", "kpiC", "videoSm", "quoteB"];
const FLOW_BOX: Record<BentoSlotId, { wide: boolean; height: number }> = {
  videoLg: { wide: true, height: 750 },
  kpiA: { wide: false, height: 365 },
  kpiB: { wide: false, height: 365 },
  quoteA: { wide: true, height: 369 },
  kpiC: { wide: false, height: 375 },
  videoSm: { wide: false, height: 375 },
  quoteB: { wide: true, height: 375 },
};
/** A narrow card left alone on its row takes both columns at a wide card's height. */
const FLOW_SOLO_HEIGHT = 369;
/** Desktop gap between cards, and between the tablet rows (px at `--u` = 1). */
const GAP = 16;
/** The artboard's grid: rows 369 / 365 / 375 (desktop), and the tablet's five rows. */
const FULL_GRID_U = 369 + 365 + 375 + 2 * GAP;
const FULL_TABLET_PX = 369 + 365 + 365 + 375 + 375 + 4 * GAP;

type Kind = "V" | "Q" | "K";
const KIND: Record<BentoSlotId, Kind> = { videoLg: "V", videoSm: "V", quoteA: "Q", quoteB: "Q", kpiA: "K", kpiB: "K", kpiC: "K" };

/**
 * Rows a PARTIAL set may form on the desktop grid (12 columns: 3 = the artboard's 272 card,
 * 6 = its 560 card). Key = how many videos, quotes and KPI cards share the row. `order` and
 * `spans` go together; `start` centres a row that cannot fill the width (a lone video or KPI
 * card; a lone quote takes the full width instead); `height` is the row's,
 * from the artboard (369 quote row, 365 KPI row, 375 the row with the small video tile); `cost`
 * ranks the shapes (0 = a row the designer drew, or as balanced as one).
 */
const ROW_SHAPES: Record<string, { order: readonly Kind[]; spans: readonly number[]; start?: number; height: number; cost: number }> = {
  "1,1,0": { order: ["V", "Q"], spans: [6, 6], height: 369, cost: 0 },
  "0,1,2": { order: ["Q", "K", "K"], spans: [6, 3, 3], height: 369, cost: 0 },
  "1,1,1": { order: ["K", "Q", "V"], spans: [3, 6, 3], height: 375, cost: 0 },
  "0,0,3": { order: ["K", "K", "K"], spans: [4, 4, 4], height: 365, cost: 0 },
  "0,2,0": { order: ["Q", "Q"], spans: [6, 6], height: 369, cost: 0 },
  "1,0,2": { order: ["V", "K", "K"], spans: [6, 3, 3], height: 369, cost: 1 },
  "2,0,0": { order: ["V", "V"], spans: [6, 6], height: 369, cost: 1 },
  "2,1,0": { order: ["V", "Q", "V"], spans: [3, 6, 3], height: 375, cost: 1 },
  "1,0,3": { order: ["V", "K", "K", "K"], spans: [3, 3, 3, 3], height: 375, cost: 1 },
  "2,0,2": { order: ["V", "K", "K", "V"], spans: [3, 3, 3, 3], height: 375, cost: 1 },
  "2,0,1": { order: ["V", "K", "V"], spans: [4, 4, 4], height: 375, cost: 2 },
  "1,0,1": { order: ["V", "K"], spans: [6, 6], height: 369, cost: 3 },
  "0,1,1": { order: ["Q", "K"], spans: [8, 4], height: 369, cost: 3 },
  "0,0,2": { order: ["K", "K"], spans: [6, 6], height: 365, cost: 3 },
  "1,0,0": { order: ["V"], spans: [6], start: 4, height: 369, cost: 5 },
  "0,1,0": { order: ["Q"], spans: [12], height: 369, cost: 5 }, // full width: the text left, the blob in its corner
  "0,0,1": { order: ["K"], spans: [4], start: 5, height: 365, cost: 6 },
};
/** Rows worth a nudge: the designer's own, and a customer's film next to their quote. */
const ROW_FAVOURITES: readonly (readonly BentoSlotId[])[] = [
  ["quoteA", "kpiA", "kpiB"],
  ["kpiC", "quoteB", "videoSm"],
  ["videoSm", "quoteA"],
  ["videoLg", "quoteB"],
];

type Row = { ids: BentoSlotId[]; shape: (typeof ROW_SHAPES)[string]; cost: number };

function rowOf(ids: readonly BentoSlotId[]): Row | null {
  const count = (kind: Kind) => ids.filter((id) => KIND[id] === kind).length;
  const shape = ROW_SHAPES[`${count("V")},${count("Q")},${count("K")}`];
  if (!shape) return null;
  // the shape's kinds, each filled in the artboard's reading order
  const pool = [...ids].sort((a, b) => BENTO_SLOT_IDS.indexOf(a) - BENTO_SLOT_IDS.indexOf(b));
  const ordered = shape.order.map((kind) => pool.splice(pool.findIndex((id) => KIND[id] === kind), 1)[0]);
  const favourite = ROW_FAVOURITES.some((set) => set.length === ids.length && set.every((id) => ids.includes(id)));
  return { ids: ordered, shape, cost: shape.cost + 0.25 - (favourite ? 0.1 : 0) };
}

/** The cheapest way to split the cards into rows (≤ 6 cards: at most 203 partitions). */
function bestRows(ids: readonly BentoSlotId[]): Row[] {
  if (ids.length === 0) return [];
  const [first, ...rest] = ids;
  let best: { rows: Row[]; cost: number } | null = null;
  for (let mask = 0; mask < 1 << rest.length; mask++) {
    const row = rowOf([first, ...rest.filter((_, i) => mask & (1 << i))]);
    if (!row) continue;
    const others = bestRows(rest.filter((_, i) => !(mask & (1 << i))));
    const cost = row.cost + others.reduce((sum, r) => sum + r.cost, 0);
    if (!best || cost < best.cost - 1e-9) best = { rows: [row, ...others], cost };
  }
  // every single card has a shape, so a partition always exists
  return best ? best.rows : [];
}

export type BentoPlaced = {
  id: BentoSlotId;
  card: BentoCard;
  /** Partial set, desktop grid: columns of 12, the first column of a centred row, the row's height. */
  row?: { span: number; start?: number; height: number };
  /** Two-column stack: position, columns, height (desktop px), and whether it stands alone. */
  flow: { order: number; span: 1 | 2; height: number; solo: boolean };
};

export type BentoResolved = {
  /** All seven slots filled: the designer's artboard. Otherwise the fallback layouts. */
  full: boolean;
  /** In DOM order: the reading order on desktop. */
  cards: BentoPlaced[];
  /** Grid heights for the section's content-visibility estimate (bento.css): the desktop grid in
   *  `--u`, the tablet grid in px, the phone stack in `--u` plus its count of 8 px row gaps. */
  size: { gridU: number; tabletPx: number; flowU: number; flowGaps: number };
};

/**
 * What the section renders, or null when it must not render: a final card wins its slot; a
 * placeholder fills it only when `showPlaceholders` (dev / preview, lib/placeholders.ts); an empty
 * slot is simply left out and the remaining cards are laid out again. Null when no card is left,
 * or in production while BENTO_LIVE is off. Server components only (pass SHOW_PLACEHOLDERS).
 * `entries` is injectable for tests.
 */
export function resolveBento(showPlaceholders: boolean, entries: BentoEntries = BENTO_ENTRIES): BentoResolved | null {
  if (!showPlaceholders && !BENTO_LIVE) return null;
  const picked = new Map<BentoSlotId, BentoCard>();
  for (const id of BENTO_SLOT_IDS) {
    const pool: readonly BentoCard[] = entries[id];
    const card = pool.find((c) => c.status === "final") ?? (showPlaceholders ? pool.find((c) => c.status === "placeholder") : undefined);
    if (card) picked.set(id, card);
  }
  if (picked.size === 0) return null;
  const full = picked.size === BENTO_SLOT_IDS.length;

  // the two-column stack: narrow cards pair up, one left alone takes the row
  const flow = new Map<BentoSlotId, BentoPlaced["flow"]>();
  const stack = FLOW_ORDER.filter((id) => picked.has(id));
  const flowRows: number[] = [];
  for (let i = 0; i < stack.length; i++) {
    const id = stack[i];
    const next = stack[i + 1];
    const box = FLOW_BOX[id];
    if (box.wide) {
      flow.set(id, { order: i + 1, span: 2, height: box.height, solo: false });
      flowRows.push(box.height);
    } else if (next && !FLOW_BOX[next].wide) {
      flow.set(id, { order: i + 1, span: 1, height: box.height, solo: false });
      flow.set(next, { order: i + 2, span: 1, height: FLOW_BOX[next].height, solo: false });
      flowRows.push(Math.max(box.height, FLOW_BOX[next].height));
      i++;
    } else {
      flow.set(id, { order: i + 1, span: 2, height: FLOW_SOLO_HEIGHT, solo: true });
      flowRows.push(FLOW_SOLO_HEIGHT);
    }
  }
  const flowU = flowRows.reduce((sum, h) => sum + h, 0);
  const flowGaps = flowRows.length - 1;

  const place = (id: BentoSlotId, row?: BentoPlaced["row"]): BentoPlaced => {
    const card = picked.get(id);
    const at = flow.get(id);
    if (!card || !at) throw new Error(`bento: slot ${id} has no card`);
    return { id, card, row, flow: at };
  };

  if (full) {
    return {
      full,
      cards: BENTO_SLOT_IDS.map((id) => place(id)),
      size: { gridU: FULL_GRID_U, tabletPx: FULL_TABLET_PX, flowU, flowGaps },
    };
  }

  // a partial set: rows on the desktop grid, in the artboard's reading order
  const rank = (row: Row) => Math.min(...row.ids.map((id) => BENTO_SLOT_IDS.indexOf(id)));
  const rows = bestRows(BENTO_SLOT_IDS.filter((id) => picked.has(id))).sort((a, b) => rank(a) - rank(b));
  const cards = rows.flatMap(({ ids, shape }) =>
    ids.map((id, i) => place(id, { span: shape.spans[i], start: i === 0 ? shape.start : undefined, height: shape.height })),
  );
  const gridU = rows.reduce((sum, { shape }) => sum + shape.height, 0) + GAP * (rows.length - 1);
  return { full, cards, size: { gridU, tabletPx: flowU + GAP * flowGaps, flowU, flowGaps } };
}

/**
 * Every KPI card as one "value label" string ("10%+ reply rate"), final and placeholder alike,
 * for scripts/homepage-lint.mjs: a figure such as "10%+" is code-like to its string reader and the
 * label sits in another string, so no rule ever sees the pair. The lint checks each pair against
 * its explicit, sourced allow-list instead (a new figure fails until a human adds it there).
 */
export function bentoKpiClaims(entries: BentoEntries = BENTO_ENTRIES): string[] {
  return BENTO_SLOT_IDS.flatMap((id) => {
    const pool: readonly BentoCard[] = entries[id];
    return pool.flatMap((card) => (card.kind === "kpi" ? [`${card.value} ${card.label}`] : []));
  });
}
