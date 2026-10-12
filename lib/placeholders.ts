/**
 * Fillable placeholder content — the V2 Figma replication's ONE gate (decision 2026-10-09):
 * the bento's stand-in cards (interim stills while a customer's own cut is not on disk), the
 * sources story's data-source discs, a figure waiting for the founder's yes, draft story lines,
 * the agents card's preview body. Dev and Vercel preview builds only. Production never renders a
 * placeholder entry: a slot returns null until real ("final") content lands in its data file,
 * and a section with several slots lays out the final ones it has (the bento) or returns null
 * when it has none. Precedent: components/sections/home/HomeUGCWall.tsx (same expression).
 *
 * Server components only. VERCEL_ENV is not exposed to client bundles (no NEXT_PUBLIC_ prefix),
 * so a client island would read `false` on a preview and disagree with the server HTML: decide in
 * a server component and pass plain data (or a boolean prop) down. The homepage is statically
 * built and preview/production are separate builds, so a build-time constant is correct.
 * Not to be confused with lib/verticals SHOW_DRAFTS (VERCEL_ENV !== "production", also true on a
 * local `next build`).
 */
export const SHOW_PLACEHOLDERS = process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";

/** The one status vocabulary of every V2 data entry: "final" ships, "placeholder" renders only
 *  when SHOW_PLACEHOLDERS (and is then marked data-placeholder in the markup). */
export type ContentStatus = "final" | "placeholder";

/** Entries a server component may render: final ones always, placeholders only in dev/preview. */
export function visibleEntries<T extends { status: ContentStatus }>(
  entries: readonly T[],
  showPlaceholders: boolean = SHOW_PLACEHOLDERS,
): T[] {
  return entries.filter((entry) => entry.status === "final" || showPlaceholders);
}
