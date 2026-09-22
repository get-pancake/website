import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpNavMenu } from "@/components/sections/landing-v3/LpNavMenu";
import { LpNavScroll } from "@/components/sections/landing-v3/LpNavScroll";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { navGroups, verticalPath } from "@/lib/verticals";

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
 * "Industries" (founder 2026-09-22, "do like Origami"): a link to the /for
 * hub with a disclosure panel listing every approved vertical, grouped by
 * category (columns) + "All industries". Server-rendered, so every /for link
 * is in the HTML of every page that carries the nav (crawlable); the panel
 * opens on hover and on keyboard focus (:focus-within — Tab from the link
 * walks into it), CSS only (nav.css). Escape dismisses it (WCAG 1.4.13) via
 * a small effect in LpNavMenu, the nav's client island. Touch: the first
 * tap opens the panel; the sheet (LpNavMenu) links the hub on phones.
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
          href="https://app.getpancake.ai"
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

/** The Industries entry: link to /for + the category-column panel. */
function LpNavIndustries() {
  const groups = navGroups();
  return (
    <div className="lp-nav-ind">
      <a className="lp-nav-ind__trigger" href="/for">
        Industries
        <svg className="lp-nav-ind__caret" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" focusable="false">
          <path d="M2 3.75 5 6.75l3-3" />
        </svg>
      </a>
      {groups.length ? (
        <div className="lp-nav-ind__panel">
          <div className="lp-nav-ind__card">
            <div className="lp-nav-ind__cols">
              {groups.map((g) => (
                <div key={g.category} className="lp-nav-ind__col">
                  <p className="lp-nav-ind__cat">{g.category}</p>
                  <ul>
                    {g.items.map((v) => (
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
      ) : null}
    </div>
  );
}
