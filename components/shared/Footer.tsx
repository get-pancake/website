import Link from "next/link";
import { FaDiscord, FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa6";
import { SiX, SiYoutube } from "react-icons/si";

import { DEMO_BOOKING_URL } from "@/lib/booking";

import { PancakeLogo } from "./PancakeLogo";

const socials = [
  { href: "https://x.com/getpancake_ai", label: "Pancake on X", Icon: SiX },
  { href: "https://www.linkedin.com/company/get-pancake", label: "Pancake on LinkedIn", Icon: FaLinkedin },
  { href: "https://www.youtube.com/@trypancake", label: "Pancake on YouTube", Icon: SiYoutube },
  { href: "https://www.tiktok.com/@getpancake", label: "Pancake on TikTok", Icon: FaTiktok },
  { href: "https://www.instagram.com/get.pancake/", label: "Pancake on Instagram", Icon: FaInstagram },
  { href: "https://discord.gg/brJ99Up6ym", label: "Pancake on Discord", Icon: FaDiscord },
];

type FooterLink = { href: string; label: string };

// Link columns. External hrefs (http…) render as <a target="_blank">, internal as <Link>.
const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/open-roadmap", label: "Roadmap" },
      { href: "https://beta.getpancake.ai", label: "Sign in" },
    ],
  },
  {
    title: "Compare",
    links: [
      { href: "/gojiberry-vs-pancake", label: "vs Gojiberry" },
      { href: "/lemlist-vs-pancake", label: "vs Lemlist" },
      { href: "/origami-vs-pancake", label: "vs Origami" },
      { href: "/viktor-vs-pancake", label: "vs Viktor" },
      { href: "/claude-tag-vs-pancake", label: "vs Claude Tag" },
      { href: "/openclaw-vs-pancake", label: "vs OpenClaw" },
      { href: "/pancake-vs-paperclips", label: "vs Paperclips" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/careers", label: "Careers" },
      // The qualification form, not a direct event link — direct links skip
      // the routing questions (lib/booking.ts).
      { href: DEMO_BOOKING_URL, label: "Book a meeting" },
      { href: "https://discord.gg/brJ99Up6ym", label: "Discord" },
    ],
  },
];

/* inline-block + py-1.5 gives each link a ~32px touch box without changing
   the column's optical rhythm (the -my-1.5 on the li absorbs the padding). */
const linkClassName =
  "-my-1.5 inline-block py-1.5 text-base transition-colors hover:text-[var(--text-on-inverted-surface,#fff7ec)]";

function FooterLinkItem({ href, label }: FooterLink) {
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} prefetch={false} className={linkClassName}>
      {label}
    </Link>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: "var(--inverted-surface)",
        color: "var(--subtle-text-on-inverted-surface, #ddcfcd)",
      }}
    >
      {/* Purple glow rising from the bottom — on-brand depth for the dark surface. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
        style={{
          backgroundImage:
            "radial-gradient(120% 140% at 50% 145%, var(--palette-purple-40, #8d43fd), transparent 60%)",
          opacity: 0.45,
        }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 sm:px-6 lg:gap-16 lg:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-5">
            <Link
              href="/"
              aria-label="Pancake home"
              prefetch={false}
              className="w-fit text-[var(--text-on-inverted-surface,#fff7ec)]"
            >
              <PancakeLogo variant="inverted" className="h-11" />
            </Link>
            <p className="max-w-[260px] text-sm leading-relaxed">
              The AI employee that does the work for you.
            </p>
            {/* -m-3 offsets the p-3 hit padding so the icon row keeps its
                optical position; each icon is a 42px touch target (mobile
                review 2026-07-07: bare 18px icons were untappable). Hover
                brightens via color, not opacity (brand: no hover dim). */}
            <div className="-m-3 flex items-center gap-1">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-3 transition-colors hover:text-white"
                  style={{ color: "var(--text-on-inverted-surface, #fff7ec)" }}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-4">
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-on-inverted-surface, #fff7ec)" }}
              >
                {col.title}
              </span>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <FooterLinkItem {...link} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Legal bar */}
        <div
          className="flex flex-col gap-3 border-t pt-8 text-[13px] sm:flex-row sm:items-start sm:justify-between sm:gap-6"
          style={{ borderColor: "color-mix(in srgb, var(--text-on-inverted-surface, #fff7ec) 16%, transparent)" }}
        >
          <span className="whitespace-nowrap">© {year} Pancake. All rights reserved.</span>

          <div className="flex flex-col gap-1 sm:items-end">
            <span className="sm:whitespace-nowrap sm:text-right">
              535 Mission St, San Francisco, CA 94105, USA
            </span>
            <nav aria-label="Legal" className="flex items-center gap-4">
              <Link
                href="/privacy"
                prefetch={false}
                className="whitespace-nowrap transition-colors hover:text-[var(--text-on-inverted-surface)]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                prefetch={false}
                className="whitespace-nowrap transition-colors hover:text-[var(--text-on-inverted-surface)]"
              >
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
