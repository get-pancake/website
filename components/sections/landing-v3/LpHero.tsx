import { AudienceHeadline, AudienceSelector } from "./LpAudience";
import { LpAgentStart } from "./LpAgentStart";
import { LpArcCanvas } from "@/components/sections/landing-v3/LpArcCanvas";
import { LpFxLink, LpFxPill } from "@/components/sections/landing-v3/LpFxButton";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";
import { LpViewportVar } from "@/components/sections/landing-v3/LpViewportVar";

// Landing v3 — Hero (Figma node 4257:4906, 1654×758).
// The rainbow art (animated per-arc pancakes group, anim.css) lives in a
// 1654×1417 canvas anchored at PAGE top-left (it covers the nav band + hero);
// the section overflows it above via top:-120px. The 2622×1478 pancakes
// container sits at (-435, -61.65) in that canvas (hero-frame center
// (876, 557.35) per Figma node 4257:4907, +120px nav offset). hero.css keeps
// sizing/clip on .lp-hero-art exactly as it did for the old <img>.
export function LpHero() {
  return (
    <section className="lp-hero" aria-labelledby="lp-hero-title">
      <LpViewportVar />
      <div className="lp-hero-art" aria-hidden="true">
        <div className="lp-anim-canvas lp-anim-canvas--hero">
          <LpPancakes variant="hero" />
        </div>
        {/* phones: the rotation lives here (one canvas) while the DOM rings
            above hold the static artboard pose — see LpArcCanvas.tsx */}
        <LpArcCanvas />
        {/* desktop: WebGL rendering of the same rings — one canvas instead
            of six composited layers — see LpRainbowGL.tsx */}
        <LpRainbowGL variant="hero" />
      </div>
      <div className="lp-hero-inner">
        <div className="lp-perspective"><AudienceSelector /></div>
        <h1 id="lp-hero-title" className="lp-hero-title lp-display">
          <AudienceHeadline />
        </h1>
        <div className="lp-hero-col lp-hero-col--human">
          <p className="lp-hero-lede">
            Pancake’s AI agents monitor buying signals, find warm leads, grow
            your AI search visibility, and learn from every interaction.
          </p>
          <div className="lp-hero-btns">
            <LpFxLink href="https://app.getpancake.ai" data-analytics-id="app_hero">
              Start free
            </LpFxLink>
            {/* Opens the Calendly booking sheet via LpModals' data-lv2-open
                contract; analytics fire there off the allow-listed call_hero
                id. All widths (founder 2026-09-01) — the desktop artboard
                draws one CTA, deliberately overridden. */}
            <LpFxPill
              className="lp-btn--tinted lp-btn--demo lp-hero-call"
              data-lv2-open="call"
              data-analytics-id="call_hero"
            >
              Book a demo
            </LpFxPill>
          </div>
        </div>
        <div className="lp-hero-col lp-hero-col--agent"><LpAgentStart /></div>
      </div>
    </section>
  );
}
