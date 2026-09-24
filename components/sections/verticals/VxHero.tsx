import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { VxPromptRows } from "@/components/sections/verticals/VxPromptRows";
import { VX_CRUMBS, VX_CTA_LABELS, VX_HERO } from "@/components/sections/verticals/vx-copy";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import type { VerticalConfig } from "@/lib/verticals/types";

/**
 * /for/<vertical> — Hero (founder 2026-09-22: "more functional than inspirational — check
 * Origami"). No homepage art: a left-aligned product-page head on the text edge (--vx-edge),
 * so the demo's tab bar starts above the fold.
 *
 *   breadcrumb   Home › Industries › {name.title}   (= the BreadcrumbList JSON-LD)
 *   <h1>         kit badge "Pancake for {plural}" (= og:title) + the functional hero.title;
 *                an sr-only ": " between them, so the H1 reads "Pancake for X: Find …"
 *   lede         hero.lede (= meta description)
 *   CTA pair     Start free (app_hero) · Book a demo (/demo, call_hero)
 *   prompts      "Example prompts": the demo's three prompts as rows (VxPromptRows, shared with
 *                the homepage's demo section). Each is a real link to #vx-demo; the demo island
 *                (VxDemoPlayer) takes the clicks over and plays that prompt.
 */
export function VxHero({ v }: { v: VerticalConfig }) {
  return (
    <section id="main-content" tabIndex={-1} className="vx-hero" aria-labelledby="vx-hero-title">
      <div className="vx-col">
        <nav className="vx-crumbs" aria-label={VX_CRUMBS.aria}>
          <ol>
            <li>
              <a href="/">{VX_CRUMBS.home}</a>
            </li>
            <li>
              <a href="/for">{VX_CRUMBS.hub}</a>
            </li>
            <li>
              <span aria-current="page">{v.name.title}</span>
            </li>
          </ol>
        </nav>
        <h1 id="vx-hero-title" className="vx-hero__h1">
          <span className="vx-badge vx-badge--hero" data-tone="brand">
            {VX_HERO.label(v)}
          </span>
          <span className="vx-sr">: </span>
          <span className="vx-hero__title">{v.hero.title}</span>
        </h1>
        <p className="vx-hero__lede">{vxNoWidow(v.hero.lede)}</p>
        <div className="lp-hero-btns vx-hero__btns">
          <LpFxLink href="https://app.getpancake.ai" data-analytics-id="app_hero">
            {VX_CTA_LABELS.primary}
          </LpFxLink>
          <LpFxLink href={DEMO_PAGE_PATH} className="lp-btn--tinted lp-btn--demo" data-analytics-id="call_hero">
            {VX_CTA_LABELS.secondary}
          </LpFxLink>
        </div>
        <VxPromptRows prompts={v.demo.prompts} />
      </div>
    </section>
  );
}
