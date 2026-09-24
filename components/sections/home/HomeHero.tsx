import type { CSSProperties } from "react";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { HOME_HERO_ORBIT_LAYERS_OUTER_TO_INNER } from "@/components/sections/home/home-hero-orbit-layers";
import {
  HOME_HERO_MONSTER_ELLIPSE_SRC,
  HOME_HERO_MONSTER_FIGMA_PX,
  HOME_HERO_ORBIT_SATELLITES,
  homeHeroOrbitSatelliteCssRotationDeg,
  homeHeroOrbitSatelliteSrc,
} from "@/components/sections/home/home-hero-orbit-satellites";
import { HomeHeroPancakeMonster } from "@/components/sections/home/HomeHeroPancakeMonster";
import { HomeLogoMarquee } from "@/components/sections/home/HomeLogoMarquee";
import { H1 } from "@/components/ui/Headings";
import { PANCAKE_TINTS } from "@/lib/pancake-palette";
import { TRIAL_LABEL } from "@/lib/trial";

/**
 * Full two-tone pancake (side + top paths from `pancake-svgs/angled-1.svg`,
 * same silhouette as the closing-CTA decor) — used for satellites whose Figma
 * raster export is clipped by its own bounding box (see `inlinePancake` in
 * home-hero-orbit-satellites.ts).
 */
function OrbitSatellitePancake({ palette }: { palette: keyof typeof PANCAKE_TINTS }) {
  const p = PANCAKE_TINTS[palette];
  return (
    <svg className="home-hero-orbit-satellite-img" viewBox="0 0 49 48" aria-hidden focusable="false">
      <path
        d="M25.9537 42C33.3632 42 39.2879 37.7456 43.3461 33.4449C46.1317 30.4929 47.7828 26.7658 47.8255 22.5904C47.9308 12.2895 37.5877 4 24.9673 4C12.347 4 1.61512 11.2979 0.299682 22.5904C-0.498594 29.4427 3.49706 33.162 8.00699 36.2143C12.4861 39.2458 19.7274 42 25.9537 42Z"
        fill={p.side}
      />
      <path
        d="M25.8326 36C32.779 36 38.3334 32.4173 42.138 28.7957C44.7495 26.3098 46.2973 23.1712 46.3374 19.6551C46.4361 10.9807 36.7394 4 24.9078 4C13.0762 4 3.01515 10.1456 1.78193 19.6551C1.03355 25.4254 4.77947 28.5575 9.00753 31.1278C13.2067 33.6806 19.9955 36 25.8326 36Z"
        fill={p.top}
      />
    </svg>
  );
}

/* "AI employee" per founder 2026-07-06 (lifts the old ban — his call);
   text-wrap: balance on the H1 picks the clean two-line break at any
   width instead of the orphan-prone natural wrap. */
const HERO_TITLE = "The AI employee that does the work for you";

/* Founder copy (restored 2026-07-06 — the full rewrite went too far).
   Only the last beat changed: "Come back with finished work" read as the
   USER finishing the work, so Pancake takes the verb. */
const HERO_SUB =
  "Onboard Pancake in Slack. Connect your tools.\nIt comes back with finished work.";

export function HomeHero() {
  return (
    <section
      className="home-hero relative w-full overflow-hidden"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <div
        className={`${HOME_PAGE_CONTAINER_CLASS} grid grid-cols-1 pt-[var(--spacing-home-hero-padding-top-mobile)] pb-[var(--spacing-xxl)] lg:grid-cols-[minmax(0,9fr)_minmax(0,3fr)] lg:gap-x-[var(--spacing-xxl)] lg:pt-[var(--spacing-home-hero-padding-top)] lg:pb-[var(--spacing-xxl)]`}
        style={{ rowGap: "var(--spacing-xl)" }}
      >
        <div className="home-hero-text-stack relative z-[1] lg:pr-[var(--spacing-md)]">
          <H1 className="whitespace-pre-line [text-wrap:balance]">{HERO_TITLE}</H1>
          <p className="home-hero-body whitespace-pre-line">{HERO_SUB}</p>
          <div className="home-hero-cta-row">
            <a
              href="https://app.getpancake.ai"
              className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
              data-size="lg"
            >
              Get started for free
            </a>
            <p className="home-hero-cta-note">{TRIAL_LABEL} • SOC 2 compliant</p>
          </div>
        </div>

        {/* HQ mascot + cream + dotted orbits 1–6 — Figma `428:14900` (see `home-hero-orbit-layers.ts`). */}
        <div className="home-hero-pancake" aria-hidden>
          <div className="home-hero-pancake-stack">
            <div className="home-hero-pancake-stack-inner">
              {/* eslint-disable-next-line @next/next/no-img-element -- Figma-export rasters */}
              <img
                className="home-hero-pancake-ellipse"
                src={HOME_HERO_MONSTER_ELLIPSE_SRC}
                alt=""
                width={946}
                height={946}
                decoding="sync"
                fetchPriority="high"
              />
              {HOME_HERO_ORBIT_LAYERS_OUTER_TO_INNER.map((layer) => (
                <div
                  key={layer.figmaNode}
                  className={`home-hero-pancake-orbit home-hero-pancake-orbit--${layer.orbit}`}
                  data-figma-node={layer.figmaNode}
                  data-figma-name={layer.figmaName}
                >
                  <svg
                    viewBox={layer.viewBox}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid meet"
                    aria-hidden
                  >
                    <path
                      d={layer.pathD}
                      stroke="var(--text)"
                      strokeLinecap="round"
                      strokeWidth={1}
                      strokeDasharray="0.578125 6.9375"
                      {...(layer.pathOpacity !== undefined ? { opacity: layer.pathOpacity } : {})}
                    />
                  </svg>
                </div>
              ))}
              {HOME_HERO_ORBIT_SATELLITES.filter((s) => s.layer === "behindMascot").map((s) => (
                <div
                  key={s.figmaNode}
                  className="home-hero-orbit-satellite home-hero-orbit-satellite--behind"
                  data-figma-node={s.figmaNode}
                  data-orbit={s.orbit}
                  style={
                    {
                      "--sat-dx": `calc(var(--size-home-hero-monster-max-width) * ${s.dxFigma} / ${HOME_HERO_MONSTER_FIGMA_PX})`,
                      "--sat-dy": `calc(var(--size-home-hero-monster-max-width) * ${s.dyFigma} / ${HOME_HERO_MONSTER_FIGMA_PX})`,
                      width: `calc(var(--size-home-hero-monster-max-width) * ${s.widthFigma} / ${HOME_HERO_MONSTER_FIGMA_PX})`,
                      height: `calc(var(--size-home-hero-monster-max-width) * ${s.heightFigma} / ${HOME_HERO_MONSTER_FIGMA_PX})`,
                    } as CSSProperties
                  }
                >
                  <div
                    className="home-hero-orbit-satellite-rot"
                    style={
                      {
                        "--sat-rot": `${homeHeroOrbitSatelliteCssRotationDeg(s.rotationFigmaPluginDeg)}deg`,
                      } as CSSProperties
                    }
                  >
                    {s.inlinePancake ? (
                      <OrbitSatellitePancake palette={s.inlinePancake} />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element -- Figma PNG @2x (skew-accurate vs SVG export)
                      <img
                        className="home-hero-orbit-satellite-img"
                        src={homeHeroOrbitSatelliteSrc(s.figmaNode)}
                        alt=""
                        decoding="async"
                      />
                    )}
                  </div>
                </div>
              ))}
              <HomeHeroPancakeMonster />
              {HOME_HERO_ORBIT_SATELLITES.filter((s) => s.layer === "frontOfMascot").map((s) => (
                <div
                  key={s.figmaNode}
                  className="home-hero-orbit-satellite home-hero-orbit-satellite--front"
                  data-figma-node={s.figmaNode}
                  data-orbit={s.orbit}
                  style={
                    {
                      "--sat-dx": `calc(var(--size-home-hero-monster-max-width) * ${s.dxFigma} / ${HOME_HERO_MONSTER_FIGMA_PX})`,
                      "--sat-dy": `calc(var(--size-home-hero-monster-max-width) * ${s.dyFigma} / ${HOME_HERO_MONSTER_FIGMA_PX})`,
                      width: `calc(var(--size-home-hero-monster-max-width) * ${s.widthFigma} / ${HOME_HERO_MONSTER_FIGMA_PX})`,
                      height: `calc(var(--size-home-hero-monster-max-width) * ${s.heightFigma} / ${HOME_HERO_MONSTER_FIGMA_PX})`,
                    } as CSSProperties
                  }
                >
                  <div
                    className="home-hero-orbit-satellite-rot"
                    style={
                      {
                        "--sat-rot": `${homeHeroOrbitSatelliteCssRotationDeg(s.rotationFigmaPluginDeg)}deg`,
                      } as CSSProperties
                    }
                  >
                    {s.inlinePancake ? (
                      <OrbitSatellitePancake palette={s.inlinePancake} />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element -- Figma PNG @2x (skew-accurate vs SVG export)
                      <img
                        className="home-hero-orbit-satellite-img"
                        src={homeHeroOrbitSatelliteSrc(s.figmaNode)}
                        alt=""
                        decoding="async"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer/partner strips pinned at the bottom of the first viewport —
          the grid above auto-centers in the remaining space (`margin-block:
          auto`). Transparent band: the dotted orbits pass behind it. */}
      <HomeLogoMarquee />
    </section>
  );
}
