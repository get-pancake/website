/**
 * Bento copy and data (V2 Figma 4911:762 "Frame 168", the testimonials / KPI bento). Owner: bento
 * package. In scripts/homepage-lint.mjs FILES: every string here is linted, placeholders included
 * (decision 2026-10-09 §7: the placeholders are lint-compliant, so they say "Play", carry count
 * KPIs with exact nouns, no "+", no rate claims).
 *
 * Seven fixed slots on a 4 × 3 grid (desktop areas "vl vl qa qa" / "vl vl ka kb" / "kc qb qb vs").
 * Each slot lists its candidate cards; each card carries `status` from lib/placeholders.ts:
 *   - "final": real, founder-signed content (customer consent on file, numbers sourced). It always
 *     renders and wins over a placeholder in the same slot.
 *   - "placeholder": the V2 layout's stand-in (Klarna, invented people, invented numbers, the
 *     licensed Billo creator clips). Dev and Vercel preview only.
 * Production (resolveBento(false)) renders the section only once ALL SEVEN slots hold a final card,
 * otherwise LpBento returns null: the bento's shape depends on every slot (bento spec §4.1, Q6).
 *
 * How a real card lands: add it to its slot with status "final" and `source` (provenance: consent
 * mail, dashboard query, date). Logos: `{ kind: "mask", src: "/logos/customers/<file>" … }` (the
 * real customer artwork, painted in the card's ink). Photos and posters: public/lp/bento/.
 * Videos: 9:16 H.264, 8–15 s loop cut, no audio track, ≤ 2.5 MB, poster = the loop's first frame.
 */
import type { ContentStatus } from "@/lib/placeholders";

export const BENTO_TITLE = "Take it from them";
/** The card list's accessible name (it is a keyboard-scrollable rail on phones). */
export const BENTO_LIST_LABEL = "Customer stories";
/** The video tiles' play / pause control (WCAG 2.2.2: a loop next to other content can be stopped). */
export const BENTO_VIDEO_LABELS = { pause: "Pause video", play: "Play video" } as const;

export type BentoSlotId = "videoLg" | "quoteA" | "kpiA" | "kpiB" | "kpiC" | "quoteB" | "videoSm";
/** DOM order = the desktop reading order (row by row). */
export const BENTO_SLOT_IDS: readonly BentoSlotId[] = ["videoLg", "quoteA", "kpiA", "kpiB", "kpiC", "quoteB", "videoSm"];

/** Inline vector marks drawn in lp-bento-marks.tsx (exact Figma boxes, painted in currentColor). */
export type BentoMarkId = "fleet" | "klarna";

export type BentoLogo =
  /** An inline mark (placeholders: the V2 file's vectors). */
  | { kind: "mark"; mark: BentoMarkId; name: string }
  /** A real customer's artwork (public/logos/customers), painted as an alpha mask in the card's ink
   *  (plum on cream, white on video), in a box of `width` × `height` desktop px. */
  | { kind: "mask"; src: string; width: number; height: number; name: string };

/** A portrait: a public file for real content, or one of the placeholder stock photos, which never
 *  get a public URL (lp-bento-placeholder.ts inlines them, dev/preview only). */
export type BentoPhoto = { src: string } | { placeholder: "portrait-a" | "portrait-b" };

export type BentoPoster = {
  /** smallest candidate (also the no-srcset fallback) */
  src: string;
  srcSet: string;
  /** intrinsic size of the largest candidate */
  width: number;
  height: number;
};

type CardBase = {
  status: ContentStatus;
  logo: BentoLogo;
  /** Internal provenance (consent mail, dashboard query, date). Required for final quote / KPI
   *  cards. Never rendered. */
  source?: string;
};

export type BentoVideoCard = CardBase & {
  kind: "video";
  /** mp4 (H.264) always; webm optional (picked when the browser plays it) */
  video: { mp4: string; webm?: string };
  poster: BentoPoster;
  /** Text alternative read in place of the clip (the video itself is aria-hidden). */
  description: string;
};

export type BentoQuoteCard = CardBase & {
  kind: "quote";
  /** No surrounding quotes; typographic “ ” inside are part of the text. */
  quote: string;
  person: { name: string; role: string; company: string };
  photo: BentoPhoto;
};

export type BentoKpiCard = CardBase & {
  kind: "kpi";
  /** A count, ≤ 6 glyphs ("1,500"). No "+", no rates (homepage-lint). */
  value: string;
  /** What was counted, exact noun, ≤ 24 characters (one line at 176 px). */
  label: string;
};

export type BentoCard = BentoVideoCard | BentoQuoteCard | BentoKpiCard;

export type BentoLayout = {
  videoLg: BentoVideoCard;
  quoteA: BentoQuoteCard;
  kpiA: BentoKpiCard;
  kpiB: BentoKpiCard;
  kpiC: BentoKpiCard;
  quoteB: BentoQuoteCard;
  videoSm: BentoVideoCard;
};

type BentoEntries = { [K in BentoSlotId]: readonly BentoLayout[K][] };

/* ── placeholder stand-ins (V2 4911:762, preview only) ───────────────────────────────────────── */

const PH_KLARNA: BentoLogo = { kind: "mark", mark: "klarna", name: "Klarna" };
const PH_FLEET: BentoLogo = { kind: "mark", mark: "fleet", name: "Fleet" };
const PH_PERSON = { name: "Hana Sato", role: "Founder", company: "Brightloop" };
/* V2 says "…to a live campaign in an afternoon." — "Play", never "campaign" (lint, product term). */
const PH_QUOTE = "We went from “we should really do outbound” to a live Play in an afternoon.";

const BENTO_ENTRIES: BentoEntries = {
  videoLg: [
    {
      status: "placeholder",
      kind: "video",
      logo: PH_FLEET,
      // licensed Billo creator clip (the man in the car), not a customer: preview only
      video: { mp4: "/ugc/ugc-05.mp4" },
      poster: {
        src: "/lp/bento/video-lg-poster-560w.webp",
        srcSet: "/lp/bento/video-lg-poster-560w.webp 560w, /lp/bento/video-lg-poster-1118w.webp 1118w",
        width: 1118,
        height: 1790,
      },
      description: "Placeholder clip",
    },
  ],
  quoteA: [
    { status: "placeholder", kind: "quote", logo: PH_KLARNA, quote: PH_QUOTE, person: PH_PERSON, photo: { placeholder: "portrait-a" } },
  ],
  kpiA: [{ status: "placeholder", kind: "kpi", logo: PH_KLARNA, value: "1,500", label: "leads approved" }],
  kpiB: [{ status: "placeholder", kind: "kpi", logo: PH_FLEET, value: "212", label: "replies received" }],
  kpiC: [{ status: "placeholder", kind: "kpi", logo: PH_FLEET, value: "500", label: "Plays run" }],
  quoteB: [
    { status: "placeholder", kind: "quote", logo: PH_KLARNA, quote: PH_QUOTE, person: PH_PERSON, photo: { placeholder: "portrait-b" } },
  ],
  videoSm: [
    {
      status: "placeholder",
      kind: "video",
      logo: PH_FLEET,
      // licensed Billo creator clip (the woman with the laptop), not a customer: preview only
      video: { mp4: "/ugc/ugc-04.mp4" },
      poster: {
        src: "/lp/bento/video-sm-poster-440w.webp",
        srcSet: "/lp/bento/video-sm-poster-440w.webp 440w, /lp/bento/video-sm-poster-880w.webp 880w",
        width: 880,
        height: 1386,
      },
      description: "Placeholder clip",
    },
  ],
};

/**
 * The card each slot shows, or null when the section must not render: a final card wins; a
 * placeholder fills the slot only when `showPlaceholders` (dev / preview, lib/placeholders.ts);
 * one empty slot hides the whole section. Server components only (pass SHOW_PLACEHOLDERS).
 * `entries` is injectable for tests.
 */
export function resolveBento(showPlaceholders: boolean, entries: BentoEntries = BENTO_ENTRIES): BentoLayout | null {
  const out: Partial<Record<BentoSlotId, BentoCard>> = {};
  for (const id of BENTO_SLOT_IDS) {
    const pool: readonly BentoCard[] = entries[id];
    const card = pool.find((c) => c.status === "final") ?? (showPlaceholders ? pool.find((c) => c.status === "placeholder") : undefined);
    if (!card) return null;
    out[id] = card;
  }
  return out as BentoLayout;
}
