import { LpBottleneck } from "@/components/sections/landing-v3/LpBottleneck";

/**
 * Section 5 — Banner "Building got 10x easier / Selling didn't"
 * (Figma 4257:4953, 1654×753 wrapper p-16; card 4420:961 1622×721 r48).
 * Art = the designer's "bottleneck" Lottie (2026-09-01): horizontal
 * 1620×720 on desktop, vertical 720×1620 ≤767, intro 0–330 chaining into a
 * seamless 330–600 loop, canvas-rendered and lazy (LpBottleneck.tsx). Per
 * the designer's note the rounded corners (card r48 + overflow hidden) and
 * the headings stay HTML — titles/body overlay the animation below. The
 * previous hand-built art stack (union bottle + CSS bubble cohort + drop +
 * the ≤767 dome/bottle/31-bubble composition) was replaced wholesale; its
 * dormant CSS stays in banner.css until a cleanup pass.
 *
 * V2 (Figma fr8NgOCTUxsEbrMEJA3YKu 4911:534, red note "Blue background for next section starts
 * here", 2026-10-09, blue-band package): `sky` (the default — the homepage is the only user)
 * paints the wrapper light blue under a cream blob (lp-banner--sky, sky.css), so the blue band
 * of the deep dive starts in the banner's gutters. The card is unchanged.
 */
export function LpBanner({ sky = true }: { sky?: boolean } = {}) {
  return (
    <section id="why" className={sky ? "lp-banner lp-banner--sky" : "lp-banner"}>
      <div className="lp-banner__card">
        <LpBottleneck />
        <h2 className="lp-title-section lp-banner__title lp-banner__title--left">
          {"Building got "}
          <br className="lp-banner__br" />
          {"10x easier."}
        </h2>
        <p className="lp-title-section lp-banner__title lp-banner__title--right">
          Selling didn’t.
        </p>
      </div>
    </section>
  );
}
