import Link from "next/link";

import { DEMO_BOOKING_URL } from "@/lib/booking";

import { FxPillLink } from "./FxPill";
import { LandingNavMenu } from "./LandingNavMenu";
import { NAV_LINKS } from "./nav-links";

/**
 * Landing nav — rime.ai-shaped: wordmark left, text links + two pills right
 * (Book a call outline, Get started primary). Text links collapse away below
 * 768px, where the bar pins to the top and a menu button opens the plum
 * sheet carrying the same map (mobile QA 2026-08-26 — the footer alone was
 * the only navigation on a ~13-viewport page). "Book a call" is a real link
 * to the Calendly form with a data-lv2-open="call" upgrade: pages that mount LandingModals
 * intercept it into the booking dialog, everywhere else it just navigates.
 */

export function LandingNav() {
  return (
    <header className="lv2-nav">
      <div className="lv2-nav-inner">
        <a href="https://getpancake.ai/" className="lv2-nav-wordmark" aria-label="Pancake">
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size brand asset, same treatment as the static landing */}
          <img src="/pancake-wordmark.png" alt="Pancake" />
        </a>
        <div className="lv2-nav-right">
          <nav className="lv2-nav-links" aria-label="Primary">
            {NAV_LINKS.map((link) =>
              link.external ? (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} prefetch={false}>
                  {link.label}
                </Link>
              ),
            )}
          </nav>
          {/* Primary first, secondary second — the founder's site-wide CTA
              order (2026-09-03), same labels as the v3 chrome. */}
          <FxPillLink href="https://app.getpancake.ai" data-analytics-id="app_nav">
            Start free
          </FxPillLink>
          <FxPillLink
            variant="outline"
            href={DEMO_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="lv2-nav-call"
            data-lv2-open="call"
            data-analytics-id="call_nav"
          >
            Book a demo
          </FxPillLink>
          <LandingNavMenu />
        </div>
      </div>
    </header>
  );
}
