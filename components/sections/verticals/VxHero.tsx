import { LpArcCanvas } from "@/components/sections/landing-v3/LpArcCanvas";
import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";
import { LpViewportVar } from "@/components/sections/landing-v3/LpViewportVar";
import { VX_CTA_LABELS } from "@/components/sections/verticals/vx-copy";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import type { VerticalConfig } from "@/lib/verticals/types";

/**
 * /for/<vertical> — Hero (spec §2.2). The homepage hero class for class (the
 * AgHero pattern): same rainbow art (LpPancakes DOM rings + LpArcCanvas on
 * phones + LpRainbowGL on desktop, positioned by landing-v3/hero.css through
 * `lp-hero-art`), same bottom-anchored `lp-hero-title` edge, same
 * `lp-hero-col` (lede + the Start free / Book a demo pair, app_hero /
 * call_hero). The only addition is the kit badge "For {vertical}" in the slot
 * the homepage gives its audience toggle: `.vx-hero__lockup` takes over the
 * H1's absolute anchoring (verticals/hero.css), so the H1's bottom and left
 * edges stay pixel-identical and the badge grows upward into the free band
 * under the rings. H1 = two spans + a space (no <br>, no periods), so its
 * textContent reads "You place candidates We bring you clients".
 */
export function VxHero({ v }: { v: VerticalConfig }) {
  return (
    <section id="main-content" tabIndex={-1} className="lp-hero vx-hero" aria-labelledby="vx-hero-title">
      <LpViewportVar />
      <div className="lp-hero-art" aria-hidden="true">
        <div className="lp-anim-canvas lp-anim-canvas--hero">
          <LpPancakes variant="hero" />
        </div>
        <LpArcCanvas />
        <LpRainbowGL variant="hero" />
      </div>
      <div className="lp-hero-inner">
        <div className="vx-hero__lockup">
          {/* The badge rides INSIDE the H1 (SEO: the vertical's name is in the H1) as its own
              block with its own type; the sr-only ": " and "." make the text content read
              "For MSPs: You run IT for companies. We bring you clients". */}
          <h1 id="vx-hero-title" className="lp-hero-title lp-display">
            <span className="vx-badge vx-badge--hero" data-tone="brand">
              {v.name.badge}
            </span>
            <span className="vx-sr">: </span>
            <span className="vx-hero__line">{v.hero.h1[0]}</span>
            <span className="vx-sr">.</span>{" "}
            <span className="vx-hero__line">{v.hero.h1[1]}</span>
          </h1>
        </div>
        <div className="lp-hero-col">
          <p className="lp-hero-lede">{vxNoWidow(v.hero.lede)}</p>
          <div className="lp-hero-btns">
            <LpFxLink href="https://app.getpancake.ai" data-analytics-id="app_hero">
              {VX_CTA_LABELS.primary}
            </LpFxLink>
            <LpFxLink
              href={DEMO_PAGE_PATH}
              className="lp-btn--tinted lp-btn--demo lp-hero-call"
              data-analytics-id="call_hero"
            >
              {VX_CTA_LABELS.secondary}
            </LpFxLink>
          </div>
        </div>
      </div>
    </section>
  );
}
