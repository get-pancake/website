"use client";

import { useEffect, useRef, useState } from "react";

import type { KitchenCast, KitchenMode, PancakeKitchen } from "./kitchen/kitchen";
import { WORDS } from "./kitchen/words";

/**
 * Kitchen — "Anyone can cook." / "Always overcooked." (2026-11-12). Pancake as a kitchen that
 * runs by itself: signals ride in as ingredients, three chefs cook, stacks of pancakes leave as
 * leads. A switch shows the same kitchen without Pancake, and the title changes with it.
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
 * - three.js and the scene are imported the first time the section comes within a viewport of
 *   the screen: about 200 kB gzipped that the first load never pays for.
 * - The scene pauses off screen and on tab hide (kitchen.js does it).
 * - Reduced motion never boots the scene: the poster is the render.
 * - Phones never boot it either (LIVE, below). It was never measured on one, and the page has
 *   an iPhone memory history (LpAnimFreeze). The poster is the render there too, and the switch
 *   swaps it.
 * - Where WebGL is missing, or once the browser takes the GPU context back, the poster shows.
 */

/** Where the live scene runs. Below it, the poster is the render. */
const LIVE = "(min-width: 768px)";
const MODES = ["with", "without"] as const;

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
  /** on the sky band (the homepage: under the clouds, between the deep dive and the testimonials,
      which paint the sky too): the section paints it, so the band does not break */
  sky?: boolean;
} = {}) {
  const [mode, setMode] = useState<KitchenMode>(first);
  /** the mode the scene booted in, once it is live: null while the poster is the render */
  const [booted, setBooted] = useState<KitchenMode | null>(null);
  /** the switch was used: from then on the title comes up when it changes */
  const [touched, setTouched] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const kitchen = useRef<PancakeKitchen | null>(null);
  /** the mode at the moment the scene boots: the visitor may flip the switch before it does */
  const latest = useRef(mode);

  useEffect(() => {
    const el = stage.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (!window.matchMedia(LIVE).matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let gone = false;
    const stop = () => {
      kitchen.current?.dispose();
      kitchen.current = null;
      setBooted(null);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        import("./kitchen/kitchen")
          .then(({ createPancakeKitchen, POSTER_TIMES }) => {
            if (gone) return;
            const at = latest.current;
            const live = createPancakeKitchen(el, { cast, mode: at, vendorLogos, time: POSTER_TIMES[at], intro: false });
            kitchen.current = live;
            // the browser took the GPU context back (memory pressure, a driver reset)
            live.canvas.addEventListener("webglcontextlost", stop, { once: true });
            setBooted(at);
          })
          // no WebGL, or the chunk did not load: the poster stays
          .catch(() => undefined);
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => {
      gone = true;
      io.disconnect();
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
          <Title className="lp-kitchen__title lp-title-section" aria-live="polite">
            <span key={mode} className="lp-kitchen__title-text" data-swap={touched ? "" : undefined}>
              {WORDS[mode].title}
            </span>
          </Title>
          <div className="lp-kitchen__switch" role="group" aria-label={WORDS.switchLabel}>
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                className="lp-kitchen__option"
                aria-pressed={mode === m}
                onClick={() => {
                  setTouched(true);
                  setMode(m);
                }}
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
