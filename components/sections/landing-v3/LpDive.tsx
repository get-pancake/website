import { LpFeatures } from "./LpFeatures";

/**
 * Deep-dive carousel section — "How Pancake finds customers" as an autoplaying, clickable
 * vertical carousel (V2 Figma 4939:3388). Owner: blue-band package (shell, sky, clouds,
 * parallax); the four scenes come from the fixed registry lp-dive-stages.ts. A DIRECT <section>
 * child of main.lp. Copy: lp-dive-data.ts (homepage-lint FILES); CSS: dive.css + sky.css.
 *
 * Phase 0 stub: renders the production features section (LpFeatures, frozen) unchanged.
 */
export function LpDive() {
  return <LpFeatures />;
}
