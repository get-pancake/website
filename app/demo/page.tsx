import type { Metadata, Viewport } from "next";

import { LpAnimFreeze } from "@/components/sections/landing-v3/LpAnimFreeze";
import { LpFitVars } from "@/components/sections/landing-v3/LpFitVars";
import { DemoHero } from "@/components/sections/demo/DemoHero";
import { FOOTER, META } from "@/components/sections/demo/demo-copy";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/demo.css";
import "@/app/_styles/ai-sales-call.css";

/**
 * /demo — contact-sales page in the ElevenLabs split layout (François,
 * 2026-09-15): brain.getpancake.ai's hero on the left, the qualification
 * form (the Calendly routing questions) in the white card on the right.
 * After submit the card hands off to booking: the Calendly calendar the team
 * size routes to, inline and prefilled (lib/booking.ts), then a booked state
 * with the demo video (2026-09-16). "Talk to AI sales" on the booking state
 * opens a full-screen voice call with the ElevenLabs agent (AiSalesCall,
 * styled by ai-sales-call.css).
 * Every "Book a demo" CTA on the site links here. Route is provisional:
 * noindex, not in the sitemap, until the founder decides where it lives
 * (same as /agents).
 */

export const viewport: Viewport = { themeColor: "#fbf6f1" };

export const metadata: Metadata = {
  // Tab title is EXACTLY "Pancake" on the landings (founder rule, app/page.tsx);
  // the value prop rides on og/twitter titles. metadataBase is set in the
  // root layout, so /og-image.png resolves.
  title: META.title,
  description: META.description,
  robots: { index: false, follow: false },
  alternates: { canonical: "https://getpancake.ai/demo" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/demo",
    title: META.ogTitle,
    description: META.description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: META.ogTitle }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: META.ogTitle,
    description: META.description,
    images: ["/og-image.png"],
  },
};

export default function DemoPage() {
  return (
    // id="main-content" is the root layout's skip-link target.
    <main id="main-content" className="lp lp-demo">
      {/* --lp-fit for the card's rainbow sliver (LpFitVars observes .lp-cta__art--right) */}
      <LpFitVars />
      {/* Phones: the page is two to three screens tall; the marquee (a freeze
          stage) must stop off-screen (anim.css, 2026-08-31). The card art is
          not a stage: LpRainbowGL gates itself. */}
      <LpAnimFreeze />
      {/* Conversion page: logo only, no nav links, no Book a demo pill (it would loop) */}
      <header className="lp-nav demo-nav">
        <a className="lp-nav-logo" href="/" aria-label="Pancake home">
          <img alt="" src="/lp/lp-nav-logo.svg" width={114.956} height={56} />
        </a>
      </header>
      <DemoHero />
      {/* LpFooter is a 467px black block with a "Book a demo" link back to
          this page; brain's one-line footer instead. */}
      <footer className="demo-foot">
        <p className="demo-foot__line">
          {FOOTER.line}
          <a href="/privacy">{FOOTER.privacy}</a>
          {FOOTER.sep}
          <a href="/terms">{FOOTER.terms}</a>
        </p>
      </footer>
    </main>
  );
}
