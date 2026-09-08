/**
 * The demo-booking destination — Calendly's qualification/routing form
 * (2 required questions: team size + tried Pancake), which routes each
 * combination to the right event type inside Calendly. Every "Book a demo"
 * CTA must use THIS form URL: direct event links would bypass qualification
 * (Calendly setup 2026-09-07, all 10 routing combinations preview-tested).
 */
export const DEMO_BOOKING_URL = "https://calendly.com/d/d3zd-2yc-x2s";

/** The routing form's Calendly id — the `scheduler_id` on analytics events. */
export const DEMO_SCHEDULER_ID = "d3zd-2yc-x2s" as const;

/** Calendly's postMessage origin — the only sender the dialogs listen to. */
export const CALENDLY_ORIGIN = "https://calendly.com";

/**
 * Below this frame width Calendly stacks the booking page (logo, host, event
 * details, THEN the calendar — the calendar lands ~500px down); at or above
 * it the page is two columns with the calendar in view at once. Measured
 * 2026-09-07: 952px stacked, 1000px two-column. Frames narrower than this
 * open the embed compact (event details hidden) so the calendar comes first.
 */
export const CALENDLY_TWO_COLUMN_MIN = 1000;

/** Calendly posts its loading spinner's height too (26px measured
 *  2026-09-07); page-height reports under this are not a page and must not
 *  resize the frame. Its shortest real page (the routing form) is ~650px. */
export const CALENDLY_MIN_PAGE_HEIGHT = 200;

/** Colors the embed is skinned with — Calendly's `background_color` /
 *  `text_color` / `primary_color` params. The dialogs read them off their own
 *  sheet at open time (computed CSS), so the embed follows the design tokens
 *  instead of duplicating hex values here. Any CSS color string; values that
 *  don't reduce to a flat hex are left to Calendly's defaults. */
export type EmbedColors = {
  background?: string | null;
  text?: string | null;
  primary?: string | null;
};

export type EmbedOptions = {
  /** Hide the event's details block (host, title, duration) so the calendar
   *  is the first thing in the frame — for frames under
   *  CALENDLY_TWO_COLUMN_MIN, where Calendly stacks the page. */
  compact?: boolean;
  colors?: EmbedColors;
};

/**
 * The URL the booking dialogs iframe. `embed_domain`/`embed_type` are
 * Calendly's own embed contract (enables its in-frame sizing + postMessage);
 * every param set here survives the routing form's redirect to the event
 * type (verified 2026-09-07). Call only from the browser (the dialogs render
 * the frame after a click).
 */
export function demoBookingEmbedUrl({ compact = false, colors = {} }: EmbedOptions = {}) {
  const domain = typeof window === "undefined" ? "getpancake.ai" : window.location.hostname;
  const params = new URLSearchParams({
    embed_domain: domain,
    embed_type: "Inline",
    hide_gdpr_banner: "1",
  });
  if (compact) params.set("hide_event_type_details", "1");
  const background = toCalendlyHex(colors.background);
  const text = toCalendlyHex(colors.text);
  const primary = toCalendlyHex(colors.primary);
  if (background) params.set("background_color", background);
  if (text) params.set("text_color", text);
  if (primary) params.set("primary_color", primary);
  return `${DEMO_BOOKING_URL}?${params.toString()}`;
}

/**
 * `#rgb` / `#rrggbb` / `rgb(r, g, b)` (what getComputedStyle hands back for
 * the tokens) → Calendly's `rrggbb`. Anything else — transparent, translucent,
 * color-mix(), empty — returns null so the param is left to Calendly.
 */
export function toCalendlyHex(color: string | null | undefined): string | null {
  if (!color) return null;
  const value = color.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const digits = hex[1]!;
    const full =
      digits.length === 3
        ? digits
            .split("")
            .map((d) => d + d)
            .join("")
        : digits;
    return full.toLowerCase();
  }
  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(value);
  if (rgb) {
    if (rgb[4] !== undefined && Number(rgb[4]) < 1) return null;
    return [rgb[1], rgb[2], rgb[3]]
      .map((n) => Math.min(255, Number(n)).toString(16).padStart(2, "0"))
      .join("");
  }
  return null;
}

/**
 * The height Calendly reports for its page inside an Inline embed — the
 * `calendly.page_height` message (`payload.height`, e.g. "742px"). Null for
 * any other message. Callers must have checked the event's origin already.
 */
export function calendlyPageHeight(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const message = data as { event?: unknown; payload?: { height?: unknown } };
  if (message.event !== "calendly.page_height") return null;
  const raw = message.payload?.height;
  const height = typeof raw === "number" ? raw : typeof raw === "string" ? parseFloat(raw) : NaN;
  return Number.isFinite(height) && height > 0 ? Math.ceil(height) : null;
}
