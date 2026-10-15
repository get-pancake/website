import { PH_BADGE_SRC, PH_LAUNCH_URL } from "@/lib/product-hunt";

/**
 * Product Hunt's "#1 Product of the Day" badge under the hero buttons (launch of 2026-10-14;
 * founder 2026-10-15: the Product of the Day badge, in the right place). It took the spot of
 * the launch-day badge, which showed the live upvote count. Out of flow (hero.css "Product
 * Hunt badge"): nothing in the hero moves for it.
 */
export function LpProductHunt() {
  return (
    <a className="lp-hero-ph" href={PH_LAUNCH_URL} target="_blank" rel="noopener noreferrer">
      {/* eslint-disable-next-line @next/next/no-img-element -- Product Hunt's own SVG badge */}
      <img
        src={PH_BADGE_SRC}
        alt="#1 Product of the Day on Product Hunt"
        width={250}
        height={54}
        decoding="async"
      />
    </a>
  );
}
