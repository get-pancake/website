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
 */
export function LpBanner() {
  return (
    <section id="why" className="lp-banner">
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
