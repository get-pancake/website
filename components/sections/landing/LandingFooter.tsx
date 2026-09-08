import Link from "next/link";

import { DEMO_BOOKING_URL } from "@/lib/booking";

/**
 * Landing footer — rime.ai-style plum band: link columns on the left, the
 * vector wordmark beside them on the right (painted via CSS mask so it stays
 * crisp at any size), and a mono legal bar at the bottom. No pancake mark and
 * no pink hover on this surface (founder, 2026-08-24).
 *
 * Server component on purpose: every target is a real href (anchors into the
 * landing sections, routes, or external links) — no modal triggers, so the
 * footer behaves identically on /, /pricing, and the legal pages.
 */

type FooterLink = { href: string; label: string; external?: boolean };

// Primary v2 destinations plus the editorial routes founders still need to
// discover from every page. The "Compare" column (Gojiberry / Lemlist /
// Origami vs Pancake) left on 2026-09-03: those pages carry the previous
// positioning and the founder wants them out of the site's link tree
// ("you're finding again some pages like pancake vs viktor…"). The routes
// still exist; only the links went.
const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "https://app.getpancake.ai", label: "Open the app", external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#why", label: "About" },
      { href: "/careers", label: "Careers" },
      { href: "/blog", label: "Blog" },
      { href: "https://partners.dub.co/pancake-ai", label: "Affiliate program", external: true },
      { href: DEMO_BOOKING_URL, label: "Book a demo", external: true },
      { href: "mailto:hey@pancake.ai", label: "Contact" },
      { href: "/support", label: "Support" },
    ],
  },
  {
    title: "Social",
    links: [
      { href: "https://x.com/getpancake_ai", label: "X", external: true },
      { href: "https://www.linkedin.com/company/get-pancake", label: "LinkedIn", external: true },
      { href: "https://discord.gg/brJ99Up6ym", label: "Discord", external: true },
      { href: "https://www.youtube.com/@trypancake", label: "YouTube", external: true },
      { href: "https://www.tiktok.com/@getpancake", label: "TikTok", external: true },
      { href: "https://www.instagram.com/get.pancake", label: "Instagram", external: true },
    ],
  },
];

function FooterLinkItem({ href, label, external }: FooterLink) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }
  if (href.startsWith("mailto:")) {
    return <a href={href}>{label}</a>;
  }
  return (
    <Link href={href} prefetch={false}>
      {label}
    </Link>
  );
}

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="lv2-footer">
      <div className="lv2-footer-inner">
        <div className="lv2-footer-top">
          <nav className="lv2-footer-cols" aria-label="Footer">
            {COLUMNS.map((col) => (
              <div key={col.title} className="lv2-footer-col">
                <span className="lv2-footer-eyebrow">{col.title}</span>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <FooterLinkItem {...link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <a href="/" className="lv2-footer-brand" aria-label="Pancake — home">
            <span className="lv2-footer-wordmark" aria-hidden="true" />
          </a>
        </div>

        <div className="lv2-footer-legal">
          <span>
            © {year} Pancake · San Francisco, CA
          </span>
          <nav aria-label="Legal">
            <Link href="/privacy" prefetch={false}>
              Privacy
            </Link>
            <Link href="/terms" prefetch={false}>
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
