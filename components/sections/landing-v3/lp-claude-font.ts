/**
 * The Claude-desktop mock's serif (Literata, the Figma "Anthropic Serif" stand-in), loaded for
 * the homepage only — never in app/layout.tsx (decision 2026-10-09). Owner: demo-scroll
 * package; story-claude imports it. Shared with the --lp-claude-* palette (foundation.css).
 *
 * Contract (fixed): `lpClaudeSerif.variable` is a class name that defines the CSS custom
 * property `--lp-font-claude-serif` on the element carrying it — put it on your mock's ROOT and
 * use `font-family: var(--lp-font-claude-serif, Georgia), Georgia, serif` inside (a custom
 * property resolves where it is declared, so it cannot be a .lp token in foundation.css).
 * The intended implementation is next/font/google:
 *   Literata({ subsets: ["latin"], axes: ["opsz"], display: "swap", preload: false,
 *              variable: "--lp-font-claude-serif" })
 *
 * Phase 0 stub: no font (Georgia fallback), same shape.
 */
export const lpClaudeSerif: { className: string; variable: string } = { className: "", variable: "" };
