/**
 * Bento copy, data and layout (V2 Figma 4911:762 "Frame 168" and the mobile artboard's stack,
 * 5024:10543 + seven frames). Owner: bento package. In scripts/homepage-lint.mjs FILES: every
 * string here is linted.
 *
 * Content: SEVEN cards, the seven the designer drew, no more (founder 2026-10-13: "we should be
 * able to stick to the 7 placeholders that the designer set"; for a few hours that day the
 * section had eight, then nine cards and a fourth row). His conditions for the mix, same day:
 * "2 videos + this testimonial [Pierre's quote] should be kept … and make sure every company
 * appears at least once". Four customers share the seven cards:
 *   - Praxis (Diana Khramina, CEO): the LARGE film, one figure;
 *   - Kinro (Pierre-Alexandre Kamienny, CEO): the small film, his quote, one figure;
 *   - Vector Legal: one figure; AgentMail: one written quote.
 * The films are the two INDIVIDUAL cuts, never the merged compilation; the numbers are the
 * customers' own; AgentMail's written quote was shortened at the founder's request.
 * Why Praxis's film is the large one: both quote slots touch the large tile, so Pierre's quote
 * can only stay if the large film is not Kinro's (the neighbours rule, BENTO_SLOT_IDS).
 * Left out to stay at seven: Diana's on-camera quote ("I cancelled all my subscriptions and I’m
 * using Pancake for three of them."), her second figure ("10+ meetings booked a week") and
 * Vector Legal's quote CARD with its portrait (its figure is the card now). Git history has the
 * entries and the portraits (commits 9770bda, 584b77d). Evidence, frames and timings:
 * artifacts/landing-v2-figma/assets/bento-real/manifest.json (Praxis), manifest-kinro.json
 * (Kinro), impl/bento-real-assets.md and impl/bento-real-assets-kinro.md.
 *
 * Seven slots. Each lists its candidate cards with `status` from lib/placeholders.ts:
 *   - "final": real content whose asset is in public/. Always renders, wins its slot.
 *   - "placeholder": a stand-in that renders in dev and on Vercel previews only (marked
 *     data-placeholder). NONE today: every card is final. The mechanism
 *     stays for the next card that has to wait for its asset: a stand-in image never gets a
 *     public URL (lp-bento-placeholder.ts inlines it from ./bento-placeholder/).
 * Production renders ONLY final cards, so it may hold a partial set: resolveBento() lays the cards
 * it has out cleanly (rows on desktop, the artboard's two-column stack below) and returns null
 * only when no card is left. With all seven it is the designer's artboard, desktop and phone.
 *
 * How a card becomes final: put its asset in public/lp/bento/, set status "final", keep `source`.
 * Videos, three things per film (recipes: artifacts/landing-v2-figma/assets/bento-real/tools/):
 *   - the film with its sound: the individual cut as H.264 + AAC mp4 (4:3, 960 wide, about
 *     1.2 Mbps, faststart) plus a 640 variant. Fetched ONLY when the visitor opens the sound view;
 *   - the tile's muted preview: a separate video-only cut of about 10 s that loops (480 wide for
 *     small tiles, 720 for large ones, each under 600 kB: scripts/placeholder-gate.test.mjs holds
 *     that line). The tile never plays the film itself (it weighs megabytes; founder precedent
 *     2026-09-07);
 *   - captions for the sound view (WebVTT), and the poster = the full frame (same geometry as the
 *     film and the preview, so one crop serves all three).
 */
import type { ContentStatus } from "@/lib/placeholders";

export const BENTO_TITLE = "Take it from them";
/** The card list's accessible name. */
export const BENTO_LIST_LABEL = "Customer stories";
/** The video tiles' two controls: `open` names the tile, which is one button that opens the film
 *  in the player (its visible sign is a small play disc); `close` leaves the player. Until
 *  2026-10-13 the tile also had a "Watch with sound" pill and a pause button for the silent
 *  preview: the founder asked for both to go ("enlève le watch with sound … retire le bouton
 *  pause"). */
export const BENTO_VIDEO_LABELS = {
  open: "Play video",
  close: "Close video",
} as const;

/**
 * One switch for the founder: false keeps the whole section out of production whatever its
 * entries say (dev and Vercel previews still show it). ON since 2026-10-12 (founder: "yes push
 * Kinro, it's fine and publish testimonials available"): production renders the final cards, all
 * seven today (the Kinro and Praxis films, quotes and figures, the designer's artboard). It was
 * off for a few hours that day (verifier TA-03) while the films' early release was his to decide.
 */
export const BENTO_LIVE = true;

export type BentoSlotId = "videoLg" | "quoteA" | "kpiA" | "kpiB" | "kpiC" | "quoteB" | "videoSm";
/**
 * The artboard's reading order (row by row on desktop): the DOM order of a full set.
 *   vl vl qa qa
 *   vl vl ka kb
 *   kc qb qb vs
 *
 * NO TWO CARDS OF ONE COMPANY TOUCH, side by side or one above the other (founder 2026-10-13, on
 * two Praxis figures next to each other: "we have to reshuffle so that the same company does not
 * appear back to back"). What sits where (K = Kinro, P = Praxis, V = Vector Legal, A = AgentMail):
 *   vl P  P  | qa K  K
 *   vl P  P  | ka V  | kb P
 *   kc K  | qb A  A  | vs K
 * Every pair that shares an edge is two different companies (kb is one column away from vl). The
 * artboard's own filling (Praxis in qa, ka and kb) was not. With Kinro's film in vl, Pierre's
 * quote would touch it from either quote slot: hence Praxis's film there. Before moving a card or changing one's company, check the eleven
 * pairs again: vl-qa, vl-ka, qa-ka, qa-kb, ka-kb, vl-kc, vl-qb, ka-qb, kb-vs, kc-qb, qb-vs. The
 * phone stack has the same rule (FLOW_ORDER).
 */
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

/**
 * A stand-in image for a "placeholder" card, kept out of public/: the base name of a .webp in
 * components/sections/landing-v3/bento-placeholder/ (lp-bento-placeholder.ts inlines it, dev and
 * previews only). No card uses one today, and the folder is gone with the last stand-in: create
 * it again with the file.
 */
export type BentoPlaceholderImage = string;

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
   * film itself (megabytes for a tile a few hundred px wide). `mp4` serves small tiles, `mp4Large`
   * a tile drawn taller than LpBentoVideo's LARGE_TILE (on a phone: only the stack's large tile,
   * LARGE_TILE_PHONE). Same frame geometry as the poster, first and last frames on a picture cut
   * (the loop reads as one more cut).
   */
  preview: {
    mp4: string;
    mp4Large?: string;
    /**
     * The same cut CROPPED to what a portrait tile shows (806 of the frame's 1440 px, from the
     * card's focus.keepLeft), for the large tile: the landscape encodes spend most of their pixels
     * on parts of the frame that tile never shows, and what it does show was stretched 2.8 × on a
     * 2x screen (founder 2026-10-13: the Kinro tile "is a bit blur"). LpBentoVideo plays it in a
     * tile narrower than 0.8 : 1, centred (bento.css [data-crop="portrait"]); `mp4Hi` (the crop at
     * the film's own resolution) on a desktop tile drawn taller than 900 device px.
     */
    portrait?: { mp4: string; mp4Hi?: string };
  };
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
  /** Absent: a still tile (a stand-in poster while the film is not on disk). */
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

/* ── the customers ────────────────────────────────────────────────────────────────────────── */

/* All four are in the marquee with the YC badge (docs/public-assets/logos/customers/README.md). */
const PRAXIS: BentoLogo = { name: "Praxis", src: "/logos/customers/praxis.png", ratio: 1392 / 370, body: [0.24, 0.755], yc: true };
const KINRO: BentoLogo = { name: "Kinro", src: "/logos/customers/kinro.svg", ratio: 1308 / 356, body: [0.25, 0.75], yc: true };

/* Names and titles exactly as the films' lower thirds show them ("Diana Khramina / CEO, PRAXIS",
   "Pierre-Alexandre Kamienny / CEO, KINRO"); the company in the logo's spelling. */
const PIERRE = { name: "Pierre-Alexandre Kamienny", role: "CEO", company: "Kinro" };
/* AgentMail: the marquee's wordmark and numbers (LpMarquee.tsx). The founder named him "Adi from
   AgentMail"; surname and title are Y Combinator's company page (Adi Singh, listed as a founder),
   not his own word: to be confirmed with him. */
const AGENTMAIL: BentoLogo = { name: "AgentMail", src: "/logos/customers/agentmail.svg", ratio: 1986 / 363, body: [0.2, 0.78], yc: true };
const ADI = { name: "Adi Singh", role: "Co-founder", company: "AgentMail" };
/* Vector Legal (YC W26): the marquee's composed lockup and numbers. Its figure came from
   "Aurelie, Head of GTM" (the founder's words, first name only); a figure card names no person. */
const VECTOR_LEGAL: BentoLogo = { name: "Vector Legal", src: "/logos/customers/vector-legal.png", ratio: 1111 / 151, body: [0.079, 0.795], yc: true };

const BENTO_ENTRIES: BentoEntries = {
  /* Kinro, Pierre's individual cut ("Pierre Testimonial 12.mov", the cut locked on 2026-09-22;
     48.2 s, 4:3). He is on screen from frame 0. His name title is burned in at x 54–790 of 1440,
     from 3.567 to 8.367 s: a portrait tile can neither hide it nor show it whole (it sees 806 px
     of the 1440), hence the two choices below.
     `focus` (manifest-kinro.json): his face in the tile in nine shots out of ten, the lamp out
     from under the logo. 63.1 % in the 560 × 750 tile and its phone twin, 62.2 % in a 272 × 375
     one. Poster = frame 96 (3.2 s), before the title.
     Preview (founder 2026-10-13: "focus the video preview on a few seconds where he is face to
     face, not the side angle"): frames 445–740 of the film, 14.833–24.700 s, the long FRONT shot
     from its first frame to its third jump cut. Until then it ran 8.367–18.000 s (founder
     2026-10-12, "start the preview at 8.4s"), which held five seconds of a close profile. Video
     only, 182 and 343 kB (landscape), 408 kB (the portrait crop) against 4.7 and 7.4 MB for the
     film. The tile never shows the title; with sound the film plays from 0.
     Captions: the cut's nine sentences in 29 lines, timed by forced alignment on the film's own
     audio. As for Praxis the wording was checked by machine (three recognisers, alignment scores,
     the acoustic model's raw reading), NOT by a human listen. Six sentences are word for word
     the checked transcript of the merged compilation; one exists only in this cut ("Nurturing
     the data…", 24.9 s); two follow this cut's audio where it reads otherwise than that
     transcript ("of other top partners", 42.2 s, there "of all the top partners"; "don't need
     to download", 35.8 s, there "you don't need"):
     artifacts/landing-v2-figma/impl/bento-kinro.md. */
  videoSm: [
    {
      status: "final",
      kind: "video",
      logo: KINRO,
      film: {
        mp4: "/lp/bento/kinro-pierre-960.mp4",
        mp4Small: "/lp/bento/kinro-pierre-640.mp4",
        /* portrait: the same frames, cropped 806 × 1080 from x 400 (= focus.keepLeft, the window
           of a portrait tile), at 538 × 720 (recipe: artifacts/…/bento-real/tools/
           encode-preview-portrait-mp4.sh). Since 2026-10-13 this film is in the SMALL tile; the
           806 × 1080 encode it had for the large one is out of public/. */
        preview: {
          mp4: "/lp/bento/kinro-pierre-preview-480.mp4",
          mp4Large: "/lp/bento/kinro-pierre-preview-720.mp4",
          portrait: { mp4: "/lp/bento/kinro-pierre-preview-portrait-720.mp4" },
        },
        captions: { src: "/lp/bento/kinro-pierre.en.vtt", srcLang: "en", label: "English" },
      },
      poster: {
        src: "/lp/bento/kinro-pierre-poster-500w.webp",
        srcSet: "/lp/bento/kinro-pierre-poster-500w.webp 500w, /lp/bento/kinro-pierre-poster-1000w.webp 1000w, /lp/bento/kinro-pierre-poster-1440w.webp 1440w",
        width: 1440,
        height: 1080,
      },
      focus: { keepLeft: 400, centre: 800, wideLeft: 50 },
      title: "Pierre-Alexandre Kamienny, CEO at Kinro",
      description: "Pierre-Alexandre Kamienny, CEO at Kinro, tells how he uses Pancake.",
      source: "Pierre Testimonial 12.mov, transcoded 2026-10-12 (manifest-kinro.json); poster = frame 96.",
    },
  ],
  /* Pierre, alone on screen, lips in sync over the whole sentence (his cut 14.93–17.80 s; the
     merged compilation 28.45–31.33 s). The founder, 2026-10-13: "this testimonial should be
     kept". Portrait: a crop of frame 92 of his own cut, 430 px native, so soft at 2x (founder
     2026-10-12: accepted). */
  quoteA: [
    {
      status: "final",
      kind: "quote",
      logo: KINRO,
      quote: "I’m running all of my GTM in Codex using Pancake.",
      person: PIERRE,
      photo: { src: "/lp/bento/kinro-pierre-portrait-640.webp" },
      source: "Kinro individual cut (Pierre Testimonial 12.mov), checked compilation transcript sentence 7; portrait = frame 92 of the cut.",
    },
  ],
  /* Vector Legal's figure. The founder supplied it on 2026-10-13 as a written quote from
     "Aurelie, Head of GTM & Partnerships": pipeline in 7 days from outreach on high-intent
     signals, with a dollar amount on that pipeline. The card showed the amount until 2026-10-17
     (founder: "il faut changer les testimonials de vector legal pour ne pas parler d'argent",
     then "find a quote that is cool to read and not money oriented" and "quote should still be
     promotional and bullish"): it keeps her time and her outcome, never a sum. /pricing quotes
     her with the same claim, "Pancake built our pipeline in 7 days." (lib/copy.ts
     pricingProof). Her yes on the new wording is the founder's to get. No other record of it
     is in the repository (scripts/homepage-lint.mjs BENTO_KPI_ALLOW). */
  kpiA: [
    { status: "final", kind: "kpi", logo: VECTOR_LEGAL, value: "7 days", label: "to real pipeline", source: "Vector Legal, written statement relayed by the founder on 2026-10-13, without its dollar amount since 2026-10-17 (see the comment above)." },
  ],
  /* Diana Khramina's own figure: a message to Tristan on 2026-09-18, and the same on camera in
     her cut ("my reply rate is above 10% on most of campaigns I'm running. So it helped me to
     book at least 10 meetings per week"). The message's wording and link are in the spec
     (artifacts/landing-v2-figma/specs/updates/_bento-real-testimonials.md), kept out of this
     public repository on purpose. Founder 2026-10-11: her figures, in the designer's big-number
     format. Every KPI pair goes to scripts/homepage-lint.mjs as a whole string (bentoKpiClaims
     below), to be checked against its explicit, sourced allow-list. Her second figure ("10+
     meetings booked a week") is left out: seven cards. */
  kpiB: [
    { status: "final", kind: "kpi", logo: PRAXIS, value: "10%+", label: "reply rate", source: "Diana Khramina, message to Tristan 2026-09-18 (reference in the spec, see the comment above), repeated on camera in her cut." },
  ],
  /* Pierre on camera: "Pancake helped me book 15 meetings last week" (his cut 39.57–41.52 s, the
     same sentence and the same audio as the merged compilation's 61.68–63.72 s; side-angle
     camera, lips in sync up to "meetings"). One week, as he says it. */
  kpiC: [
    { status: "final", kind: "kpi", logo: KINRO, value: "15", label: "meetings booked in a week", source: "Pierre-Alexandre Kamienny on camera, Kinro individual cut and merged compilation sentence 14 (manifest-kinro.json)." },
  ],
  /* AgentMail, a WRITTEN quote the founder supplied on 2026-10-13 and asked to shorten ("simplify
     quote", then "no longer than" 49 characters). His two sentences, in full: "One Pancake Play
     turns the people engaging with our posts into leads and reaches out to them. It replaced
     every tools we had to run inbound campaigns." The card keeps the second one's claim.
     An edited quote under a real name: the founder gets Adi's yes on this wording.
     Portrait: the 512 px headshot he sent (soft at 2x in the 257 u blob). */
  quoteB: [
    {
      status: "final",
      kind: "quote",
      logo: AGENTMAIL,
      quote: "One Pancake Play replaced all our inbound tools.",
      person: ADI,
      photo: { src: "/lp/bento/agentmail-adi-portrait-512.webp" },
      source: "Written quote and headshot supplied by the founder on 2026-10-13; shortened at his request (the original is in the comment above).",
    },
  ],
  /* Praxis, Diana's individual cut, founder-validated 2026-09-29 (58.2 s, 4:3). Her name title is
     burned in at x 60–475 of 1440 (4.2–9.07 s) and her face stays within x 501–1064 from 3.667 s
     on: hence `focus`.
     Preview (2026-10-13, the founder's note on Kinro's applied here: "a few seconds where he is
     face to face, not the side angle"): frames 403–641, 13.43–21.40 s, three FRONT shots in a
     row. Until then 3.667–13.433 s, which ended on four seconds of a side angle. Video only,
     276 and 545 kB (landscape), 584 kB (the portrait crop) against 5.6 and 8.8 MB for the film.
     Captions: the cut's 41 lines, timed by forced alignment on the film's own audio. The wording
     was checked by machine (three recognisers, alignment scores, the acoustic model's raw
     reading), NOT by a human listen, and one clause ("We just joined Y Combinator", 13.5 s) is
     kept for meaning where the audio alone reads otherwise:
     artifacts/landing-v2-figma/impl/bento-fixes.md. */
  videoLg: [
    {
      status: "final",
      kind: "video",
      logo: PRAXIS,
      film: {
        mp4: "/lp/bento/praxis-diana-960.mp4",
        mp4Small: "/lp/bento/praxis-diana-640.mp4",
        /* All four previews are cut from the MASTER ("Testimonial Diana - 4 x1.09.mov",
           1440 × 1080) since 2026-10-13 (founder: "put the diana video preview in higher
           quality"); until then they were second-generation cuts of the 960 web encode, and the
           large tile on a 2x screen stretched 720 lines over 1500. portrait: the frame's 806 px
           from x 480 (= focus.keepLeft), the window of the large tile, at 538 × 720 and, for a
           2x screen, at the master's own 806 × 1080 (`mp4Hi`).
           Recipes: artifacts/…/bento-real/tools/encode-preview-portrait-mp4.sh (portrait) and
           encode-preview-mp4.sh (landscape), frames 403–641. */
        preview: {
          mp4: "/lp/bento/praxis-diana-preview-480.mp4",
          mp4Large: "/lp/bento/praxis-diana-preview-720.mp4",
          portrait: { mp4: "/lp/bento/praxis-diana-preview-portrait-720.mp4", mp4Hi: "/lp/bento/praxis-diana-preview-portrait-1080.mp4" },
        },
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
/* The same rule in the stack: no two cards of one company in a row or in two rows that follow
   each other. The mobile artboard's order (vl / ka kb / qa / kc vs / qb) would put Kinro's
   figure beside Kinro's film, under Kinro's quote. This order is the artboard's reading order:
   the first two figures pair up (Vector Legal | Praxis), Kinro's figure and Kinro's film each
   take a row of their own (FLOW_SOLO_*).  P · K · (V|P) · K · A · K: */
const FLOW_ORDER: readonly BentoSlotId[] = ["videoLg", "quoteA", "kpiA", "kpiB", "kpiC", "quoteB", "videoSm"];
const FLOW_BOX: Record<BentoSlotId, { wide: boolean; height: number }> = {
  videoLg: { wide: true, height: 750 },
  kpiA: { wide: false, height: 365 },
  kpiB: { wide: false, height: 365 },
  quoteA: { wide: true, height: 369 },
  kpiC: { wide: false, height: 375 },
  videoSm: { wide: false, height: 375 },
  quoteB: { wide: true, height: 375 },
};
/** A narrow card left alone on its row takes both columns at a wide card's height; a figure
 *  alone needs less (its logo and its number: 250 keeps the card a band, not an empty box). */
const FLOW_SOLO_HEIGHT = 369;
const FLOW_SOLO_KPI_HEIGHT = 250;
/** Desktop gap between cards, and between the tablet rows (px at `--u` = 1). */
const GAP = 16;
/** The artboard's grid: rows 369 / 365 / 375. Tablets draw the same grid, scaled (a two-column
 *  tablet layout cannot keep one company's cards apart), so its height there is in `--u` too. */
const FULL_GRID_U = 369 + 365 + 375 + 2 * GAP;

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
/** Rows worth a nudge: the designer's own. */
const ROW_FAVOURITES: readonly (readonly BentoSlotId[])[] = [
  ["quoteA", "kpiA", "kpiB"],
  ["kpiC", "quoteB", "videoSm"],
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
  /** Every slot filled: the full grid. Otherwise the fallback layouts. */
  full: boolean;
  /** In DOM order: the reading order on desktop. */
  cards: BentoPlaced[];
  /** Grid heights for the section's content-visibility estimate (bento.css): the desktop grid in
   *  `--u`; on tablets the full grid in `--u` (tabletU) or a partial set's stack in px (tabletPx),
   *  the other being 0; the phone stack in `--u` plus its count of 8 px row gaps. */
  size: { gridU: number; tabletPx: number; tabletU: number; flowU: number; flowGaps: number };
};

/**
 * What the section renders, or null when it must not render: a final card wins its slot; a
 * placeholder fills it only when `showPlaceholders` (dev / preview, lib/placeholders.ts); an empty
 * slot is simply left out and the remaining cards are laid out again. Null when no card is left,
 * or in production while BENTO_LIVE is off. Server components only (pass SHOW_PLACEHOLDERS).
 * `entries` and `live` are injectable for tests (`live: true` = the set production shows once
 * the switch is on).
 */
export function resolveBento(
  showPlaceholders: boolean,
  entries: BentoEntries = BENTO_ENTRIES,
  live: boolean = BENTO_LIVE,
): BentoResolved | null {
  if (!showPlaceholders && !live) return null;
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
      const height = KIND[id] === "K" ? FLOW_SOLO_KPI_HEIGHT : FLOW_SOLO_HEIGHT;
      flow.set(id, { order: i + 1, span: 2, height, solo: true });
      flowRows.push(height);
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
      size: { gridU: FULL_GRID_U, tabletPx: 0, tabletU: FULL_GRID_U, flowU, flowGaps },
    };
  }

  // a partial set: rows on the desktop grid, in the artboard's reading order
  const rank = (row: Row) => Math.min(...row.ids.map((id) => BENTO_SLOT_IDS.indexOf(id)));
  const rows = bestRows(BENTO_SLOT_IDS.filter((id) => picked.has(id))).sort((a, b) => rank(a) - rank(b));
  const cards = rows.flatMap(({ ids, shape }) =>
    ids.map((id, i) => place(id, { span: shape.spans[i], start: i === 0 ? shape.start : undefined, height: shape.height })),
  );
  const gridU = rows.reduce((sum, { shape }) => sum + shape.height, 0) + GAP * (rows.length - 1);
  return { full, cards, size: { gridU, tabletPx: flowU + GAP * flowGaps, tabletU: 0, flowU, flowGaps } };
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
