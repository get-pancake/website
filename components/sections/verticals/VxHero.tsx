import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { VxArrow } from "@/components/sections/verticals/VxRelated";
import { SIGNAL_LABEL, VX_CRUMBS, VX_CTA_LABELS, VX_HERO } from "@/components/sections/verticals/vx-copy";
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
 *   prompts      "Example prompts": the demo's three prompts as rows. Each is a real link to
 *                #vx-demo (crawlable, works without JS); the demo island (VxDemoPlayer) takes
 *                the clicks over, plays that prompt from the Brief tab and marks the row it is
 *                showing (data-active + aria-current). Server HTML = prompt 0 active, which is
 *                what the demo renders before JS.
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
        <p className="vx-hero__label" id="vx-prompts-label">
          {VX_HERO.promptsLabel}
        </p>
        {/* one grid, rows on a subgrid: the badges share one column, so every prompt starts
            on the same x and every arrow ends on the same x (equal rows, not ragged pills) */}
        <ul className="vx-hp-list" aria-labelledby="vx-prompts-label">
          {v.demo.prompts.map((p, i) => (
            <li key={i}>
              <a
                className="vx-hp"
                href="#vx-demo"
                data-vx-prompt={i}
                data-active={i === 0 ? "" : undefined}
                aria-current={i === 0 ? "true" : undefined}
              >
                {/* display: contents on desktop (the badge and the text stay subgrid cells); on
                    phones the 2-line clamp box (the full prompt is still in the HTML and is
                    typed in full in the demo) */}
                <span className="vx-hp__body">
                  <span className="vx-badge" data-tone={p.kind}>
                    {SIGNAL_LABEL[p.kind]}
                  </span>
                  <span className="vx-hp__text">
                    {p.text}
                    <span className="vx-sr"> {VX_HERO.promptHint}</span>
                  </span>
                </span>
                {/* points DOWN: the row plays the prompt in the demo right below (it never leaves the page) */}
                <VxArrow className="vx-hp__arrow" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
