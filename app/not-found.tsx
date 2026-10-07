import type { Metadata } from "next";

import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { VxHead } from "@/components/sections/verticals/VxHead";
import { VxArrow } from "@/components/sections/verticals/VxRelated";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { SUPPORT_PATH } from "@/lib/contact";
import { APP_ORIGIN } from "@/lib/site-config.mjs";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/verticals-hub.css";

/**
 * 404 (2026-10-07): the sitewide nav and footer around the /for hub's head
 * and cards, so a dead link still leads somewhere. It used to be a bare
 * system-ui box with the homepage's title, no link and a skip link to
 * nothing. Five ways back in, then the CTA pair (founder 2026-09-03: "Start
 * free" then "Book a demo"). Next adds the noindex itself.
 */

export const metadata: Metadata = {
  title: "Page not found · Pancake",
};

const WAYS_BACK = [
  { name: "Home", href: "/", line: "Tell Pancake who to reach. It builds the Play." },
  { name: "Pricing", href: "/pricing", line: "$99 a month per workspace." },
  { name: "Industries", href: "/for", line: "Pancake for your industry, with example Plays." },
  { name: "Blog", href: "/blog", line: "Guides and comparisons for founders who sell." },
  { name: "Support", href: SUPPORT_PATH, line: "Questions about your account, billing or a connection." },
] as const;

export default function NotFound() {
  return (
    <main className="lp lp-vx lp-vx-hub">
      <LpNav />
      {/* the skip link's #main-content target, past the nav (as on /for) */}
      <section
        id="main-content"
        tabIndex={-1}
        className="vx-sec vx-hub vx-hub-head"
        aria-labelledby="nf-title"
        style={{ paddingBottom: "var(--vx-rhythm)" }}
      >
        <div className="vx-col">
          <VxHead
            as="h1"
            id="nf-title"
            eyebrow="Page not found"
            title="This page doesn’t exist."
            lede="Try one of these instead."
          />
          <div className="vx-hub__groups">
            <ul className="vx-hub-grid">
              {WAYS_BACK.map((way) => (
                <li key={way.href}>
                  <a className="vx-hubcard" href={way.href}>
                    <span className="vx-hubcard__name lp-display">
                      <span className="vx-hubcard__title">{way.name}</span>
                    </span>
                    <VxArrow className="vx-hubcard__arrow" />
                    <span className="vx-hubcard__line">{way.line}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-hero-btns" style={{ marginTop: "var(--vx-head-gap)" }}>
            <LpFxLink href={APP_ORIGIN} data-analytics-id="app_404">
              Start free
            </LpFxLink>
            <LpFxLink href={DEMO_PAGE_PATH} className="lp-btn--tinted lp-btn--demo" data-analytics-id="call_404">
              Book a demo
            </LpFxLink>
          </div>
        </div>
      </section>
      <LpFooter />
    </main>
  );
}
