/**
 * Landing v3 — Footer (Figma node 4258:253, 1654×515, bg #000).
 * Brand block at x259; three right-aligned link columns (right edges at frame
 * x1011/1203/1395). Internal targets use relative hrefs (same tab); external
 * targets open in a new tab. Contact opens the support page so visitors
 * can reach us without a configured desktop mail client.
 * "Affiliate program" is a founder addition (2026-09-03: "Affiliate should
 * appear in the footer of the landing page") — the artboard's Company column
 * has four links; don't drop it to match Figma.
 */

import { DEMO_PAGE_PATH } from "@/lib/booking";
import { SUPPORT_PATH } from "@/lib/contact";
import { APP_ORIGIN } from "@/lib/site-config.mjs";

type FootLink = { label: string; href: string; external?: boolean };

const COLUMNS: { id: string; title: string; links: FootLink[] }[] = [
  {
    id: "product",
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Open the app", href: APP_ORIGIN, external: true },
    ],
  },
  {
    id: "company",
    title: "Company",
    links: [
      { label: "About", href: "/#why" },
      { label: "Careers", href: "/careers" },
      { label: "Affiliate program", href: "https://partners.dub.co/pancake-ai", external: true },
      // Same tab: /demo (François, 2026-09-16), no longer the Calendly form.
      { label: "Book a demo", href: DEMO_PAGE_PATH },
      { label: "Contact", href: SUPPORT_PATH },
    ],
  },
  {
    id: "social",
    title: "Social",
    links: [
      { label: "X", href: "https://x.com/getpancake_ai", external: true },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/get-pancake", external: true },
      { label: "Discord", href: "https://discord.gg/brJ99Up6ym", external: true },
      { label: "YouTube", href: "https://www.youtube.com/@trypancake", external: true },
      { label: "TikTok", href: "https://www.tiktok.com/@getpancake", external: true },
      { label: "Instagram", href: "https://www.instagram.com/get.pancake", external: true },
    ],
  },
];

export function LpFooter() {
  return (
    <footer className="lp-foot">
      <div className="lp-foot-frame">
        <div className="lp-foot-brand">
          <img
            className="lp-foot-logo"
            src="/lp/lp-footer-logo.svg"
            alt=""
            width={239.672}
            height={116.755}
          />
          <p className="lp-foot-lines">
            2026 Pancake
            <br />
            San Francisco, CA
          </p>
          <p className="lp-foot-legal">
            <a href="/privacy">Privacy</a> • <a href="/terms">Terms</a>
          </p>
        </div>
        <nav className="lp-foot-cols" aria-label="Footer">
          {COLUMNS.map((col) => (
            <div key={col.id} className="lp-foot-col" data-col={col.id}>
              <p className="lp-foot-head">{col.title}</p>
              <div className="lp-foot-links">
                {col.links.map((link) =>
                  link.external ? (
                    <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <a key={link.label} href={link.href}>
                      {link.label}
                    </a>
                  ),
                )}
              </div>
            </div>
          ))}
        </nav>
        {/* ≤767 only (CSS-gated): compact meta line replacing lines + legal. */}
        <p className="lp-foot-line">
          {"2026 Pancake · San Francisco, CA · "}
          <a href="/privacy">Privacy</a>
          {" · "}
          <a href="/terms">Terms</a>
        </p>
      </div>
    </footer>
  );
}
