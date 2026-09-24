import Link from "next/link";
import { hero } from "@/lib/copy";
import { PancakeLogo } from "./PancakeLogo";
import { SiDiscord } from "react-icons/si";

type NavProps = {
  ctaHref?: string;
  showCta?: boolean;
};

export function Nav({ ctaHref = "https://app.getpancake.ai", showCta = true }: NavProps) {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 !shadow-none backdrop-blur-md"
      style={{
        borderBottom: "3px solid var(--border-color)",
        background: "#fffef8",
      }}
    >
      <nav className="mx-auto flex min-h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center text-[var(--text)]"
          aria-label="pancake home"
        >
          <PancakeLogo aria-hidden />
        </Link>
        <div className="flex shrink-0 items-center gap-4 sm:gap-6">
          <Link
            href="/build-in-public"
            className="text-sm font-medium text-[var(--text)] underline-offset-4 transition hover:underline"
          >
            Build in public
          </Link>
          <a
            href="https://squads.getpancake.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[var(--text)] underline-offset-4 transition hover:underline"
          >
            Squads
          </a>
          <Link
            href="/pricing"
            className="text-sm font-medium text-[var(--text)] underline-offset-4 transition hover:underline"
          >
            Pricing
          </Link>
          <a
            href="https://discord.gg/brJ99Up6ym"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text)] transition hover:opacity-70"
            aria-label="Join our Discord"
          >
            <SiDiscord size={20} />
          </a>
          {showCta && (
            <a
              href={ctaHref}
              style={{ backgroundColor: hero.autonomousAccent }}
              className="max-w-[min(72vw,16rem)] rounded-theme brut-border px-2 py-2 text-center text-[0.62rem] font-semibold leading-[1.15] text-black transition sm:max-w-xs sm:px-3 sm:text-[0.7rem] md:max-w-[20rem] md:text-xs lg:text-sm"
            >
              {hero.cta}
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}
