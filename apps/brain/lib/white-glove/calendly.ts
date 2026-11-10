/**
 * The White Glove calendar as a Calendly Inline embed, and the messages it
 * posts back. The main website's lib/booking.ts (whiteGloveBookingEmbedUrl
 * and its helpers), copied: this app builds on its own branch.
 */

/** The "Pancake Whiteglove" event: François, 45 minutes. */
export const WG_CALENDLY_URL = "https://calendly.com/getpancake/pancake-whiteglove";
/** The event's prep question; the answers line goes there. */
const WG_CALENDLY_ANSWER = "a1";
const CONTEXT_MAX = 500;

/** Calendly's postMessage origin: the only sender the page listens to. */
export const CALENDLY_ORIGIN = "https://calendly.com";

/**
 * Below this frame width Calendly stacks its page (event details first, the
 * calendar ~500px down), so narrower frames open compact: details hidden,
 * the calendar first. Measured on the website, 2026-09-07.
 */
export const CALENDLY_TWO_COLUMN_MIN = 1000;

/** Calendly also reports its spinner's height (~26px): not a page. */
export const CALENDLY_MIN_PAGE_HEIGHT = 200;

export type EmbedColors = { background?: string | null; text?: string | null; primary?: string | null };

/**
 * The embed URL: Calendly's embed params, the card's colors, the work email
 * and the answers line in the prep question. No name: the form does not ask
 * for it, Calendly does. Browser only (reads the page's hostname).
 */
export function whiteGloveEmbedUrl(
  email: string,
  context: string,
  { compact = false, colors = {} }: { compact?: boolean; colors?: EmbedColors } = {},
): string {
  const params = new URLSearchParams({
    embed_domain: window.location.hostname,
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
  const address = email.trim();
  if (address) params.set("email", address);
  params.set(WG_CALENDLY_ANSWER, context.slice(0, CONTEXT_MAX));
  return `${WG_CALENDLY_URL}?${params.toString().replace(/\+/g, "%20")}`;
}

/** `#rgb` / `#rrggbb` / `rgb()` → Calendly's `rrggbb`; anything translucent or unknown → null. */
export function toCalendlyHex(color: string | null | undefined): string | null {
  if (!color) return null;
  const value = color.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const digits = hex[1]!;
    const full = digits.length === 3 ? digits.split("").map((d) => d + d).join("") : digits;
    return full.toLowerCase();
  }
  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(value);
  if (rgb) {
    if (rgb[4] !== undefined && Number(rgb[4]) < 1) return null;
    return [rgb[1], rgb[2], rgb[3]].map((n) => Math.min(255, Number(n)).toString(16).padStart(2, "0")).join("");
  }
  return null;
}

/** Calendly's `calendly.page_height` report (`payload.height`, e.g. "742px"), else null. */
export function calendlyPageHeight(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const message = data as { event?: unknown; payload?: { height?: unknown } };
  if (message.event !== "calendly.page_height") return null;
  const raw = message.payload?.height;
  const height = typeof raw === "number" ? raw : typeof raw === "string" ? parseFloat(raw) : NaN;
  return Number.isFinite(height) && height > 0 ? Math.ceil(height) : null;
}

/** True for `calendly.event_scheduled`: the visitor booked inside the embed. */
export function isCalendlyEventScheduled(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  return (data as { event?: unknown }).event === "calendly.event_scheduled";
}
