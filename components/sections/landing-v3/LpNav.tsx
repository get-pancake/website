import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpNavMenu } from "@/components/sections/landing-v3/LpNavMenu";
import { LpNavScroll } from "@/components/sections/landing-v3/LpNavScroll";
import { DEMO_BOOKING_URL } from "@/lib/booking";

/**
 * Landing v3 — Nav (Figma node 4257:4894, 1654×120).
 * Logo left edge 179px, links dead-center, dark CTA right-anchored at the
 * same 179px margin (= the 1296 content grid's side margin at 1654).
 * Link targets are provisional (not specified in Figma) — flagged in the PR.
 * CTA pair (founder 2026-09-03): "Start free" then "Book a demo", the
 * hero's order, on every surface — the artboard bar drew one pill.
 * ≤767px (Figma mobile node 4389:8182): logo + burger only — links and the
 * pill move into LpNavMenu's sheet; the pill keeps its app_nav id there.
 */
export function LpNav() {
  return (
    <header className="lp-nav">
      <a className="lp-nav-logo" href="/" aria-label="Pancake home">
        <img alt="" src="/lp/lp-nav-logo.svg" width={114.956} height={56} />
      </a>
      <nav className="lp-nav-links" aria-label="Primary">
        <a href="/#how-it-works">Product</a>
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
        {/* Same trigger contract as the sheet's pill: LpModals' document
            listener turns the booking href into the dialog on pages that
            mount it; elsewhere it opens the Calendly form in a new tab.
            Hidden ≤767 (nav.css) — the bar has room for one pill, the sheet
            carries both. */}
        <LpFxLink
          href={DEMO_BOOKING_URL}
          size="sm"
          className="lp-btn--tinted lp-btn--demo"
          target="_blank"
          rel="noopener noreferrer"
          data-lv2-open="call"
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
