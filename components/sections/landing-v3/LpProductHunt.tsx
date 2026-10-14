"use client";

import { useEffect, useState } from "react";

import { PH_BADGE_SRC, PH_LAUNCH_AT_MS, PH_LAUNCH_URL } from "@/lib/product-hunt";

/**
 * Product Hunt's badge under the hero buttons (founder 2026-10-13: "put the badge on our
 * website when we launch on PH at midnight PT"). The page is static, so the badge is always in
 * the markup, hidden, and shows itself from PH_LAUNCH_AT_MS on:
 *   - the inline script right after it runs while the page is parsed, so a visitor who loads
 *     the page after the launch has the badge in the first picture;
 *   - the effect covers what the script cannot: a tab left open across midnight, an arrival
 *     by an in-site link (React does not run inline scripts it inserts), and `?ph` on the
 *     address, which shows the badge early to check it on a preview (under its own image
 *     address: Product Hunt's cache must not hold a pre-launch picture of the real one).
 * Out of flow (hero.css "Product Hunt badge"): nothing in the hero moves when it appears.
 */
export function LpProductHunt() {
  const [state, setState] = useState<"waiting" | "live" | "preview">("waiting");

  useEffect(() => {
    const wait = PH_LAUNCH_AT_MS - Date.now();
    if (wait <= 0) {
      setState("live");
      return;
    }
    if (new URLSearchParams(window.location.search).has("ph")) {
      setState("preview");
      return;
    }
    const t = setTimeout(() => setState("live"), wait);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* suppressHydrationWarning: the script below may have taken `hidden` off before React hydrates */}
      <a
        className="lp-hero-ph"
        href={PH_LAUNCH_URL}
        target="_blank"
        rel="noopener noreferrer"
        hidden={state === "waiting"}
        suppressHydrationWarning
      >
        {/* lazy: nothing is fetched from Product Hunt while the badge is hidden */}
        {/* eslint-disable-next-line @next/next/no-img-element -- Product Hunt's own SVG, the live upvote count drawn in */}
        <img
          src={state === "preview" ? `${PH_BADGE_SRC}&preview=1` : PH_BADGE_SRC}
          alt="Pancake on Product Hunt"
          width={250}
          height={54}
          loading="lazy"
          decoding="async"
        />
      </a>
      <script
        dangerouslySetInnerHTML={{
          __html: `if(Date.now()>=${PH_LAUNCH_AT_MS})document.currentScript.previousElementSibling.hidden=false`,
        }}
      />
    </>
  );
}
