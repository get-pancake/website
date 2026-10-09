import { LpDemoTour } from "./LpDemoTour";

/**
 * Homepage demo window section (V2 Figma 4939:2645 + the hero-scroll storyboard
 * 4940:4919 / 4920 / 4981). Owner: demo-scroll package. It sits right under the hero, before
 * the customer logos (decision 2026-10-09 page order), as a DIRECT <section> child of main.lp
 * (the agents view hides it with every human section, audience.css). Copy: lp-demo-data.ts
 * (homepage-lint FILES); CSS: app/_styles/landing-v3/demo.css. Class block `lp-demowin`
 * (section.lp-demowin, .lp-demowin__*): `lp-demo` is taken by /demo's <main>, and the landing-v3
 * manifest ships there too. Freeze: `.lp-demowin` is a STAGE and `.lp-demowin__caret` a MEMBER
 * (LpAnimFreeze.tsx + anim.css, done in phase 0).
 *
 * Phase 0 stub: renders the production demo tour (LpDemoTour) unchanged.
 */
export function LpDemo() {
  return <LpDemoTour />;
}
