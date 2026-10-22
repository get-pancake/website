import { PH_BADGE_ALT, PH_BADGE_SRC, PH_LAUNCH_URL } from "@/lib/product-hunt";

/**
 * Product Hunt's "#1 Product of the Week" badge (launch of 2026-10-14; founder 2026-10-22: "Badge
 * should be product of the week + should be on a better place? Where did we put it on pancake
 * v1?"). V1 had its badge first on the right of the nav bar; this one sits there too where the
 * bar has room (≥1280, nav.css "Product Hunt badge"), and under the hero buttons below that
 * (hero.css "Product Hunt badge": out of flow, nothing in the hero moves for it). The two
 * placements never show at once.
 */
export function LpProductHunt({ placement = "hero" }: { placement?: "hero" | "nav" }) {
  return (
    <a
      className={placement === "nav" ? "lp-nav-ph" : "lp-hero-ph"}
      href={PH_LAUNCH_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Product Hunt's own SVG badge */}
      <img src={PH_BADGE_SRC} alt={PH_BADGE_ALT} width={250} height={54} decoding="async" />
    </a>
  );
}
