import { AudienceSelector } from "./LpAudience";
import { AudienceHeadline } from "./LpAudienceHeadline";
import { LpAgentStart } from "./LpAgentStart";
import { LpHeroInstall } from "./LpHeroInstall";
import { LpHeroAgentArt } from "./LpHeroAgentArt";
import { LpArcCanvas } from "@/components/sections/landing-v3/LpArcCanvas";
import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpProductHunt } from "@/components/sections/landing-v3/LpProductHunt";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";
import { LpViewportVar } from "@/components/sections/landing-v3/LpViewportVar";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { SITE_DESCRIPTION } from "@/lib/copy";
import { APP_ORIGIN } from "@/lib/site-config.mjs";

// Landing v3 — Hero (Figma V2 node 4911:355, 1654×657; was V1 4257:4906,
// 1654×758). The rainbow art (animated per-arc pancakes group, anim.css)
// lives in a 1654×1417 canvas anchored at PAGE top-left (it covers the nav
// band + hero); the section overflows it above via top:-120px. The 2622×1478
// pancakes container sits at (-435, -61.65) in that canvas (hero-frame
// center (876, 557.35) per Figma node 4257:4907 = V2 4911:356, +120px nav
// offset: the rings did not move in V2). hero.css keeps sizing/clip on
// .lp-hero-art exactly as it did for the old <img>.
//
// V2 (designer red note, 2026-10-09: "Humans/Agents toggle position and
// look"): the toggle heads the right column (4911:366 "Frame 181": toggle
// row, lede, buttons; gap 24), in flow — no JS measuring, no overlay. The
// human and agent columns overlay in ONE grid cell (.lp-hero-swap) that the
// human column sizes (it stays laid out, visibility:hidden, in the agents
// view), so the toggle sits on the same pixel in both views. DOM order =
// H1, switch, lede, buttons (tab order switch → Start free → Talk to sales);
// ≤1024 the aside dissolves (display:contents) and the toggle leads the
// stacked block. `lp-hero--home` scopes every homepage geometry change:
// /agents (AgHero) reuses the unscoped hero classes with V1 geometry.
// `lp-hs-hero` marks the two copy blocks the AGENTS view's scroll assembly
// drifts and fades (lp-agents-scroll.ts, audience-agents.css;
// translate/opacity only — hero.css keeps both blocks transform-free on the
// homepage for it). The humans view no longer moves them (2026-10-12).
//
// First screen (founder 2026-10-12, _decisions §10): on desktop the hero's
// height follows the window's so the demo window's top bar peeks 70px above
// the fold, the art lifts a little on short windows and the copy block
// (.lp-hero-inner) scales about its bottom centre — all CSS, hero.css
// "Homepage first screen"; nothing here measures anything.
export function LpHero() {
  return (
    <section id="main-content" tabIndex={-1} className="lp-hero lp-hero--home" aria-labelledby="lp-hero-title">
      <LpViewportVar />
      <div className="lp-hero-art" aria-hidden="true">
        {/* agents view art slot (V2 4911:1461, owner agents-view): renders
            nothing in the humans view — see LpHeroAgentArt.tsx */}
        <LpHeroAgentArt />
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
        {/* A div since 2026-10-07: the grid the human and agent copies overlay
            in. The H1 (id lp-hero-title, which aria-labelledby above names) is
            the human copy inside it — AudienceHeadline in LpAudienceHeadline.tsx. */}
        <div className="lp-hero-title lp-display lp-hs-hero">
          <AudienceHeadline />
        </div>
        {/* V2 4911:366 "Frame 181": toggle row, then the swap cell (lede +
            buttons for humans, the install command for agents). */}
        <div className="lp-hero-aside lp-hs-hero">
          <AudienceSelector />
          <div className="lp-hero-swap">
            <div className="lp-hero-col lp-hero-col--human">
              {/* The hero lede = the Google description line (SITE_DESCRIPTION,
                  lib/copy.ts): founder-sensitive, 2026-09-30 AI SEO retired. */}
              {/* "go-to-market" never breaks at a hyphen (it did at 375 wide: "go-to-" / "market.") */}
              <p className="lp-hero-lede">
                {SITE_DESCRIPTION.split(/(go-to-market)/).map((part, i) =>
                  part === "go-to-market" ? (
                    <span key={i} className="lp-hero-nobr">
                      {part}
                    </span>
                  ) : (
                    part
                  ),
                )}
              </p>
              <div className="lp-hero-btns">
                <LpFxLink href={APP_ORIGIN} data-analytics-id="app_hero">
                  Start free
                </LpFxLink>
                {/* A same-tab link to /demo (François, 2026-09-16; it opened the
                    Calendly sheet before), keeping the allow-listed call_hero id.
                    All widths (founder 2026-09-01) — the desktop artboard draws
                    one CTA, deliberately overridden. */}
                <LpFxLink
                  href={DEMO_PAGE_PATH}
                  className="lp-btn--tinted lp-btn--demo lp-hero-call"
                  data-analytics-id="call_hero"
                >
                  Talk to sales
                </LpFxLink>
                {/* out of flow, under the row: #1 Product of the Day on Product Hunt */}
                <LpProductHunt />
                {/* out of flow, in the same slot from 1280 (where the badge is in the nav): "or
                    install in" and the agents' marks, the setup line's card on hover */}
                <LpHeroInstall />
              </div>
            </div>
            <div className="lp-hero-col lp-hero-col--agent"><LpAgentStart /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
