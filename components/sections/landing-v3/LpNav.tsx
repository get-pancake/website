import type { CSSProperties } from "react";

import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpNavMenu } from "@/components/sections/landing-v3/LpNavMenu";
import { LpNavScroll } from "@/components/sections/landing-v3/LpNavScroll";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { APP_ORIGIN } from "@/lib/site-config.mjs";
import { navGroups, verticalPath } from "@/lib/verticals";
import type { VerticalCategory } from "@/lib/verticals/types";

/**
 * Landing v3 — Nav (Figma node 4257:4894, 1654×120).
 * Logo left edge 179px, links dead-center, dark CTA right-anchored at the
 * same 179px margin (= the 1296 content grid's side margin at 1654).
 * Link targets are provisional (not specified in Figma) — flagged in the PR.
 * CTA pair (founder 2026-09-03): "Start free" then "Book a demo", the
 * hero's order, on every surface — the artboard bar drew one pill.
 * ≤767px (Figma mobile node 4389:8182): logo + burger only — links and the
 * pill move into LpNavMenu's sheet; the pill keeps its app_nav id there.
 *
 * "Industries" (founder 2026-09-22, "do like Origami"): a plain link to the
 * /for hub, then a caret button that discloses a panel listing every
 * approved vertical by category + "All industries". Server-rendered, so
 * every /for link is in the HTML of every page that carries the nav
 * (crawlable). The panel is a disclosure (not a menu): LpNavMenu's effect —
 * the nav's client island — opens it on a settled hover or on the caret
 * (click / Enter / Space) and closes it on Escape, pointer leave (after a
 * grace), focus leaving, or a press outside; data-open / data-closing on
 * .lp-nav-ind drive nav.css. Closed = visibility:hidden, so its links are
 * out of the Tab order: Tab goes Industries → caret → Company. Touch
 * (hover:none): no caret, no panel — "Industries" is just the hub link.
 */
export function LpNav() {
  return (
    <header className="lp-nav">
      <a className="lp-nav-logo" href="/" aria-label="Pancake home">
        <img alt="" src="/lp/lp-nav-logo.svg" width={114.956} height={56} />
      </a>
      <nav className="lp-nav-links" aria-label="Primary">
        <a href="/#how-it-works">Product</a>
        <LpNavIndustries />
        <a href="/#why">Company</a>
        <a href="/blog">Blog</a>
      </nav>
      <div className="lp-nav-ctas">
        <LpFxLink
          href={APP_ORIGIN}
          size="sm"
          data-analytics-id="app_nav"
        >
          Start free
        </LpFxLink>
        {/* A same-tab link to /demo on every page, like the sheet's pill
            (François, 2026-09-16: the "Book a demo" buttons lead to the demo
            page; the Calendly dialog is no longer mounted). Hidden ≤767
            (nav.css) — the bar has room for one pill, the sheet carries both. */}
        <LpFxLink
          href={DEMO_PAGE_PATH}
          size="sm"
          className="lp-btn--tinted lp-btn--demo"
          data-analytics-id="call_nav"
        >
          Book a demo
        </LpFxLink>
      </div>
      <LpNavMenu />
      <LpNavScroll />
    </header>
  );
}

/**
 * Panel layout, column by column (founder parallelism rule): each column
 * stacks a short category over a long one, so the two rows share their
 * heading baselines — row 1 Sales | Tech | IT | Energy (4/3/4/3 links),
 * row 2 Marketing | Consultants | Startups | Vertical software (9/6/5/6).
 * ≤1024 the four columns fold into two (columns 1–2 → left, 3–4 → right),
 * keeping every pair. The /for hub keeps CATEGORY_ORDER; this is nav-only.
 */
const NAV_COLUMNS = [
  ["Sales, GTM & recruiting", "Marketing & creative agencies"],
  ["Tech & build agencies", "Consultants & advisors"],
  ["IT, cloud & security", "Startups & solo founders"],
  ["Energy & industry", "Vertical software"],
] as const satisfies readonly (readonly VerticalCategory[])[];

// Compile-time guard: a new VerticalCategory must be placed in NAV_COLUMNS,
// or its pages would silently drop out of the nav.
type Unplaced = Exclude<VerticalCategory, (typeof NAV_COLUMNS)[number][number]>;
const everyCategoryPlaced: [Unplaced] extends [never] ? true : Unplaced = true;
void everyCategoryPlaced;

const catId = (category: string) =>
  `lp-nav-ind-cat-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

/** The Industries entry: hub link + caret toggle + the category grid panel. */
function LpNavIndustries() {
  const groups = navGroups();
  const cells = NAV_COLUMNS.flatMap((column, c) =>
    column.flatMap((category, r) => {
      const group = groups.find((g) => g.category === category);
      if (!group) return [];
      const place = {
        "--lp-ind-col": c + 1,
        "--lp-ind-row": r + 1,
        "--lp-ind-col-sm": Math.floor(c / 2) + 1,
        "--lp-ind-row-sm": (c % 2) * 2 + r + 1,
      } as CSSProperties;
      return [{ group, place }];
    }),
  );
  return (
    <div className="lp-nav-ind">
      <a className="lp-nav-ind__trigger" href="/for">
        Industries
      </a>
      {cells.length ? (
        <>
          <button
            type="button"
            className="lp-nav-ind__toggle"
            aria-expanded="false"
            aria-controls="lp-nav-ind-panel"
            aria-label="Show industries"
          >
            <svg className="lp-nav-ind__caret" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" focusable="false">
              <path d="M2 3.75 5 6.75l3-3" />
            </svg>
          </button>
          <div className="lp-nav-ind__panel" id="lp-nav-ind-panel">
            <div className="lp-nav-ind__card">
              <div className="lp-nav-ind__cols">
                {cells.map(({ group, place }) => (
                  <div key={group.category} className="lp-nav-ind__col" style={place}>
                    <p className="lp-nav-ind__cat" id={catId(group.category)}>
                      {group.category}
                    </p>
                    <ul aria-labelledby={catId(group.category)}>
                      {group.items.map((v) => (
                        <li key={v.slug}>
                          <a href={verticalPath(v)}>{v.name.title}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <a className="lp-nav-ind__all" href="/for">
                All industries
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
                  <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
                </svg>
              </a>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
