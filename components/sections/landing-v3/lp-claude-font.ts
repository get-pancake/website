import { Literata } from "next/font/google";

/**
 * The Claude-desktop mock's serif (Literata, the stand-in for Figma's proprietary "Anthropic
 * Serif"), loaded for the homepage only — never in app/layout.tsx (decision 2026-10-09). Owner:
 * demo-scroll package. Shared with the --lp-claude-* palette (foundation.css). One consumer: the
 * demo window's "Claude & Codex" view (LpClaudeScene.tsx via LpDemo.tsx: greeting 300, replies
 * 400). The deep-dive "Run it from Claude or Codex" stage also used it (300 / 400 / 700) until
 * it was removed with its story on 2026-10-28.
 *
 * Contract (fixed): `lpClaudeSerif.variable` is a class name that defines the CSS custom
 * property `--lp-font-claude-serif` on the element carrying it — put it on your mock's ROOT and
 * use `font-family: var(--lp-font-claude-serif, Georgia), Georgia, serif` inside (a custom
 * property resolves where it is declared, so it cannot be a .lp token in foundation.css).
 *
 * Weights: Literata is a variable font (wght 200–900 + opsz 7–72). The opsz axis is what keeps
 * the 37 px greeting within 0.2 % of Figma (story-claude measured 2.75 px off without it), and
 * next/font only accepts `axes` on the variable cut — so the "only the weights used" rule
 * resolves to ONE variable woff2 (latin, ~110 KB) that serves 300, 400 and 700 alike, rather
 * than three static files that would lose opsz.
 *
 * preload: false — no <link rel=preload> in <head>: the file is fetched only when text set in
 * this face renders (both mocks start hidden or below the fold), never on the first screen.
 * display: swap — Georgia (the declared fallback) paints until it lands.
 */
export const lpClaudeSerif = Literata({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  preload: false,
  variable: "--lp-font-claude-serif",
});
