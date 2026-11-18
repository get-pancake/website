/**
 * The Product Hunt launch of 2026-10-14 (post "pancake-7"; the first launch, "pancake-6", was
 * 2026-05-28) finished #1 Product of the Day, then #1 Product of the Week (week of 2026-10-12,
 * producthunt.com/leaderboard/weekly/2026/42: Pancake 576, ahead of Jockey and Inferock). The
 * site shows the week's badge (LpProductHunt.tsx): in the nav bar on wide screens, where the
 * first launch (V1) had it, and under the hero buttons below that.
 */

/** The launch page, at the address the launch messages already carry, with the utm tags of
 *  Product Hunt's embed snippet for this badge. */
export const PH_LAUNCH_URL =
  "https://www.producthunt.com/products/pancake-6?launch=pancake-7&embed=true&utm_source=badge-top-post-badge&utm_medium=badge&utm_campaign=badge-pancake-7";

/** Product Hunt's "#1 Product of the Week" badge, saved as its widget serves it
 *  (`top-post-badge.svg?post_id=pancake-7&theme=light&period=weekly`, 2026-10-22). The rank is
 *  final, so the site serves its own copy instead of asking Product Hunt on every visit. */
export const PH_BADGE_SRC = "/lp/lp-ph-product-of-the-week.svg";

export const PH_BADGE_ALT = "#1 Product of the Week on Product Hunt";
