/**
 * The text of a `<script type="application/ld+json">` block.
 *
 * JSON.stringify leaves `<` as it is, so a value holding `</script>` (a
 * visitor-written roadmap title, a post title, a FAQ answer) would close the
 * block and the rest would be parsed as markup. `<` is the same character
 * to a JSON parser and cannot end a script element. Every JSON-LD block goes
 * through here (bug check 2026-10-13, M16).
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
