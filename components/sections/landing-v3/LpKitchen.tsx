"use client";

import { useEffect, useRef, useState } from "react";

import type { KitchenCast, KitchenMode, PancakeKitchen } from "./kitchen/kitchen";
import { WORDS } from "./kitchen/words";
import { whenInput } from "./lp-play-once";

/**
 * Kitchen — "We keep the kitchen clean." (2026-11-12). Pancake as a kitchen that runs by
 * itself: signals ride in as ingredients, three chefs cook, stacks of pancakes leave as leads. A
 * switch shows the same kitchen without Pancake. The title is the same for both (until
 * 2026-11-12 it changed with the switch: "Anyone can cook." / "Always overcooked.").
 *
 * Every word is in kitchen/words.js. The third-party marks are in kitchen/logos.js: read the
 * note at its top before this ships.
 *
 * The picture is a live 3D scene (./kitchen, on three.js). It follows the page's budget
 * discipline, as the banner bottle does (LpBottleneck):
 * - A POSTER ships in the markup, one per mode and cast (public/lp/kitchen, drawn from the
 *   scene itself by scripts/kitchen-posters.mjs). The scene starts at the poster's own moment
 *   (POSTER_TIMES, no opening), so the first frame it paints is the poster. The poster then
 *   fades out from under it ([data-live] on the stage, kitchen.css).
 * - three.js and the scene are imported once the visitor has touched the page (a scroll, a move,
 *   a key) and the section comes within half a viewport of the screen: about 200 kB gzipped and
 *   the scene's set-up that the first load never pays for. A page nobody touches, and Lighthouse,
 *   keep the poster (2026-11-12: under the logos, the section was within a viewport at load on a
 *   desktop, and its boot landed in the page's first seconds).
 * - The scene pauses off screen and on tab hide (kitchen.js does it).
 * - Reduced motion never boots the scene: the poster is the render.
 * - Phones boot it too since 2026-11-12 (founder, on the preview: "La kitchen ne marche pas sur
 *   mobile, c'est paused on dirait. Fix ça"). Until then the poster was the render under 768 px:
 *   the scene had never been measured on a phone, and the page has an iPhone memory history
 *   (LpAnimFreeze). So a phone gives the scene's memory back: once the section is two screens
 *   away the scene is disposed and the poster is the render again, and it boots again when the
 *   visitor comes back (FAR, below). At that width the scene draws no badge (kitchen/overlay.js),
 *   as its poster.
 * - A device that cannot hold the loop gets the poster back for the rest of the visit (onSlow,
 *   kitchen.js: under 12 frames a second for 4 s). `?lp-gl=force` skips that test, and
 *   `?lp-nogl` keeps the poster, as for the page's other WebGL (LpRainbowGL).
 * - Where WebGL is missing, or once the browser takes the GPU context back, the poster shows.
 */

const PHONE = "(max-width: 767px)";
/** how near the section comes before the scene boots, and (phones) how far before it is freed */
const NEAR = "50% 0px";
const FAR = "200% 0px";
const MODES = ["with", "without"] as const;
/** this visit's verdict: the device could not hold the loop, the poster is the render */
let tooSlow = false;

/** the still pictures: one per mode and cast, and one without the vendor marks on the tank */
function poster(mode: KitchenMode, cast: KitchenCast, vendorLogos: boolean) {
  const name = `/lp/kitchen/${mode}-${cast}${mode === "without" && !vendorLogos ? "-plain" : ""}`;
  /* wide: 1944 x 1094, with the badges. phone: 1170 x 657, without (too small to read there) */
  return { wide: `${name}.webp`, phone: `${name}-phone.webp` };
}

export function LpKitchen({
  cast = "pancakes",
  mode: first = "with",
  vendorLogos = true,
  as: Title = "h2",
  id = "kitchen",
  sky = false,
}: {
  /** who cooks: the pancake chefs (the Pancake mark in 3D) or the little chefs */
  cast?: KitchenCast;
  /** the kitchen the section opens on */
  mode?: KitchenMode;
  /** without Pancake: the Snowflake and BigQuery marks on the slow tank */
  vendorLogos?: boolean;
  /** the title's tag: "h1" only where this section is the page's hero (one h1 per page) */
  as?: "h1" | "h2";
  id?: string;
  /** on the sky band (between two sections that paint the sky): the section paints it too, so the
      band does not break. The homepage has it on cream, under the logos */
  sky?: boolean;
} = {}) {
  const [mode, setMode] = useState<KitchenMode>(first);
  /** the mode the scene booted in, once it is live: null while the poster is the render */
  const [booted, setBooted] = useState<KitchenMode | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const kitchen = useRef<PancakeKitchen | null>(null);
  /** the mode at the moment the scene boots: the visitor may flip the switch before it does */
  const latest = useRef(mode);

  useEffect(() => {
    const el = stage.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const query = new URLSearchParams(window.location.search);
    if (tooSlow || query.has("lp-nogl")) return;
    const judged = query.get("lp-gl") !== "force";
    const phone = window.matchMedia(PHONE);
    let gone = false;
    let near: IntersectionObserver | undefined;
    let far: IntersectionObserver | undefined;
    const stop = () => {
      far?.disconnect();
      kitchen.current?.dispose();
      kitchen.current = null;
      setBooted(null);
    };
    const watch = () => {
      if (gone || tooSlow) return;
      near = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          near?.disconnect();
          import("./kitchen/kitchen")
            .then(({ createPancakeKitchen, POSTER_TIMES }) => {
              if (gone) return;
              const at = latest.current;
              const live = createPancakeKitchen(el, {
                cast,
                mode: at,
                vendorLogos,
                time: POSTER_TIMES[at],
                intro: false,
                // a phone's picture is small: it is drawn as sharp as its poster (1170 px wide)
                maxPixelRatio: phone.matches ? 3 : 2,
                ...(judged
                  ? {
                      onSlow: () => {
                        tooSlow = true;
                        stop();
                      },
                    }
                  : null),
              });
              kitchen.current = live;
              // the browser took the GPU context back (memory pressure, a driver reset)
              live.canvas.addEventListener("webglcontextlost", stop, { once: true });
              setBooted(at);
              // a phone gives the memory back once the section is far, and boots again on the way back
              if (!phone.matches) return;
              far = new IntersectionObserver(
                ([away]) => {
                  if (!away || away.isIntersecting) return;
                  stop();
                  watch();
                },
                { rootMargin: FAR },
              );
              far.observe(el);
            })
            // no WebGL, or the chunk did not load: the poster stays
            .catch(() => undefined);
        },
        { rootMargin: NEAR },
      );
      near.observe(el);
    };
    // (after the visitor's first input: at once on a page opened scrolled down)
    const cancelInput = whenInput(watch);
    return () => {
      gone = true;
      cancelInput();
      near?.disconnect();
      stop();
    };
  }, [cast, vendorLogos]);

  useEffect(() => {
    latest.current = mode;
    kitchen.current?.setMode(mode);
  }, [mode]);

  /* live, the poster stays the one already loaded: it is hidden, and a new one would download */
  const shown = booted ?? mode;
  const still = poster(shown, cast, vendorLogos);
  return (
    <section className={sky ? "lp-kitchen lp-kitchen--sky" : "lp-kitchen"} id={id} data-mode={mode}>
      <div className="lp-kitchen__org">
        <header className="lp-kitchen__head">
          <Title className="lp-kitchen__title lp-title-section">{WORDS.title}</Title>
          <div className="lp-kitchen__switch" role="group" aria-label={WORDS.switchLabel}>
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                className="lp-kitchen__option"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
              >
                {WORDS[m].option}
              </button>
            ))}
          </div>
        </header>
        <div className="lp-kitchen__stage" ref={stage} data-live={booted ? "" : undefined}>
          <picture>
            <source media="(max-width: 767px)" srcSet={still.phone} />
            <img
              className="lp-kitchen__poster"
              src={still.wide}
              alt={WORDS[shown].alt}
              width={1944}
              height={1094}
              loading={Title === "h1" ? "eager" : "lazy"}
              decoding="async"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
