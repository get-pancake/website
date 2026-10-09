import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";

import {
  DIVE_ORDER,
  DIVE_STAGE_BOX,
  DIVE_STAGES,
  type DiveItemId,
  type DiveStageLayout,
} from "@/components/sections/landing-v3/lp-dive-stages";
import { SHOW_PLACEHOLDERS } from "@/lib/placeholders";
import "@/app/_styles/landing-v3.css";
import "./harness.css";

import { StageHarness } from "./StageHarness";

/**
 * Deep-dive stage harness (V2 Figma replication, 2026-10-09) — a dev/preview-only page for the
 * four story packages and the carousel shell: every registry stage (lp-dive-stages.ts) at its
 * design size, desktop 752×489 and the phone 400×520 box, on a frame painted with
 * --lp-dive-stage-bg like the shell's stage card, with controls to build, play, seek and show
 * the rest picture.
 *
 *   /lp-dev/stages                         all four stories, both boxes, rest pictures
 *   /lp-dev/stages?story=claude            one story
 *   /lp-dev/stages?story=claude&t=2.5      built and paused at 2.5 s (both boxes)
 *   /lp-dev/stages?t=end                   every story at progress(1) (= its rest picture)
 *   /lp-dev/stages?play=1                  build and play on load
 *   …&layout=desktop|phone                 one box only (default both)
 *   …&placeholders=0                       the production picture (default: SHOW_PLACEHOLDERS)
 *   …&fit=0.5                              scale the boxes as pixels (the shell's --lp-fit)
 *
 * QA hooks: window.__lpStory.<id> = the desktop box's timeline (as on the homepage);
 * window.__lpDevStages["<id>:<layout>"] = { build, play, pause, seek, end, rest, tl, cue };
 * each frame carries data-state="rest" | "built" | "playing" | "error".
 *
 * Never in production: notFound() unless NODE_ENV=development or VERCEL_ENV=preview; noindex;
 * not in app/sitemap.ts nor scripts/known-urls.txt.
 */

export const metadata: Metadata = {
  title: "Stage harness",
  robots: { index: false, follow: false },
};

const DEV_OR_PREVIEW = process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";

type SearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default function StageHarnessPage({ searchParams }: { searchParams: SearchParams }) {
  if (!DEV_OR_PREVIEW) notFound();

  const story = one(searchParams.story);
  const ids: readonly DiveItemId[] = story && (DIVE_ORDER as readonly string[]).includes(story)
    ? [story as DiveItemId]
    : DIVE_ORDER;
  const layoutParam = one(searchParams.layout);
  const layouts: DiveStageLayout[] = layoutParam === "desktop" || layoutParam === "phone" ? [layoutParam] : ["desktop", "phone"];
  const placeholdersParam = one(searchParams.placeholders);
  const placeholders = placeholdersParam === undefined ? SHOW_PLACEHOLDERS : placeholdersParam !== "0";
  const fitParam = Number(one(searchParams.fit));
  const fit = Number.isFinite(fitParam) && fitParam > 0 ? fitParam : 1;
  const tParam = one(searchParams.t);
  const seekTo = tParam === undefined ? null : tParam === "end" ? "end" : Number.isFinite(Number(tParam)) ? Number(tParam) : null;
  const autoplay = one(searchParams.play) === "1";

  return (
    <main className="lp lp-devstages">
      <header className="lp-devstages__head">
        <h1>Deep-dive stage harness</h1>
        <p>
          Registry: components/sections/landing-v3/lp-dive-stages.ts · placeholders {placeholders ? "on" : "off"} ·
          fit {fit} · query: story, t (s | end), play=1, layout, placeholders=0, fit
        </p>
      </header>
      <StageHarness seekTo={seekTo} autoplay={autoplay}>
        {ids.map((id) => {
          const { Stage, alt } = DIVE_STAGES[id];
          return (
            <section key={id} className="lp-devstages__story" data-story={id}>
              <h2>
                {id}
                <span>{alt || "(no alt yet)"}</span>
              </h2>
              <div className="lp-devstages__row">
                {layouts.map((layout) => {
                  const box = DIVE_STAGE_BOX[layout];
                  return (
                    <div
                      key={layout}
                      className="lp-devstages__frame"
                      data-story={id}
                      data-layout={layout}
                      data-state="rest"
                      style={{ width: box.width * fit, "--lp-fit": fit } as CSSProperties}
                    >
                      <div className="lp-devstages__controls" data-controls />
                      <div className="lp-devstages__fit" style={{ width: box.width * fit, height: box.height * fit }}>
                        <div
                          className="lp-devstages__scene"
                          data-lp-layout={layout}
                          role="img"
                          aria-label={alt}
                          style={{ width: box.width, height: box.height }}
                        >
                          <Stage placeholders={placeholders} />
                        </div>
                      </div>
                      <p className="lp-devstages__meta">
                        {layout} {box.width}×{box.height}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </StageHarness>
    </main>
  );
}
