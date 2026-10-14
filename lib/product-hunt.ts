/**
 * The Product Hunt launch of 2026-10-14 (post "pancake-7"; the first launch, "pancake-6", was
 * 2026-05-28). The homepage hero shows Product Hunt's own badge from the minute the launch
 * opens (LpProductHunt.tsx).
 */

/** Product Hunt's day opens at 00:01 Pacific; that date is PDT, UTC−7. */
export const PH_LAUNCH_AT_MS = Date.UTC(2026, 9, 14, 7, 1);

/** The launch page, at the address the launch messages already carry, with the badge's own
 *  utm tags (Product Hunt's embed snippet). */
export const PH_LAUNCH_URL =
  "https://www.producthunt.com/products/pancake-6?launch=pancake-7&embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-pancake-7";

/** Product Hunt draws the badge, upvote count included, and keeps each address four hours in
 *  its cache. Its widget takes the post's slug as `post_id` ("pancake-6" returns the same file
 *  as the first launch's numeric id). `t` only makes this address one nobody fetches before
 *  the launch, so the first picture cached is a launch-day one. */
export const PH_BADGE_SRC = `https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=pancake-7&theme=light&t=${PH_LAUNCH_AT_MS}`;
