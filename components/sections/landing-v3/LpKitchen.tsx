"use client";

import { useEffect, useRef, useState } from "react";

import type { KitchenCast, KitchenMode, PancakeKitchen } from "./kitchen/kitchen";
import { WORDS } from "./kitchen/words";
import { whenInput } from "./lp-play-once";

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
 * - three.js and the scene are imported once the visitor has touched the page (a scroll, a move,
 *   a key) and the section comes within half a viewport of the screen: about 200 kB gzipped and
 *   the scene's set-up that the first load never pays for. A page nobody touches, and Lighthouse,
 *   keep the poster (2026-11-12: under the logos, the section was within a viewport at load on a
 *   desktop, and its boot landed in the page's first seconds).
 * - The scene pauses off screen and on tab hide (kitchen.js does it).
 * - Reduced motion never boots the scene: the poster is the render.
 * - Phones never boot it either (LIVE, below): no 3D there, and the page has an iPhone memory
 *   history (LpAnimFreeze). Since 2026-11-12 (founder: "Activons l'animation sur mobile … la
 *   bonne taille", then "en code simple genre déterministe et supprimer le truc où je peux
 *   toucher et ça change l'angle") they play a LOOP of the scene instead: a 36 s video drawn
 *   frame by frame from it (scripts/kitchen-phone-loops.mjs), the camera fixed, no badges, as
 *   wide as the screen, the whole kitchen on the page's margins (kitchen.css). Same rule as the scene:
 *   it loads once the visitor has touched the page and the section is within half a screen,
 *   plays while on screen, and never with reduced motion or Data Saver. Its first frame is the
 *   phone poster, so the poster hands over to it without a jump; the switch swaps the loop.
 * - Where WebGL is missing, or once the browser takes the GPU context back, the poster shows.
 */

/** Where the live scene runs. Below it, phones: the poster, then the loop. */
const LIVE = "(min-width: 768px)";
const MODES = ["with", "without"] as const;

/** the still pictures: one per mode and cast, and one without the vendor marks on the tank */
function poster(mode: KitchenMode, cast: KitchenCast, vendorLogos: boolean) {
  const name = `/lp/kitchen/${mode}-${cast}${mode === "without" && !vendorLogos ? "-plain" : ""}`;
  /* wide: 1944 x 1094, with the badges. phone: 960 x 448, the phone loop's framing (the whole
     kitchen) and its first frame, without the badges (they cover each other at that size) */
  return { wide: `${name}.webp`, phone: `${name}-phone.webp` };
}

/** the phone loop of a mode: drawn for the homepage's kitchen only (the pancake chefs, the vendor
    marks on the tank); any other kitchen keeps its still on a phone */
function loopOf(mode: KitchenMode, cast: KitchenCast, vendorLogos: boolean) {
  return cast === "pancakes" && vendorLogos ? `/lp/kitchen/${mode}-pancakes-phone.mp4` : null;
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
    let io: IntersectionObserver | undefined;
    const watch = () => {
      if (gone) return;
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          io?.disconnect();
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
        { rootMargin: "50% 0px" },
      );
      io.observe(el);
    };
    // (after the visitor's first input: at once on a page opened scrolled down)
    const cancelInput = whenInput(watch);
    return () => {
      gone = true;
      cancelInput();
      io?.disconnect();
      stop();
    };
  }, [cast, vendorLogos]);

  useEffect(() => {
    latest.current = mode;
    kitchen.current?.setMode(mode);
  }, [mode]);

  /* ── phones: the loop (no 3D). `phoneLoop` is set once it may load: the visitor touched the
     page, and the section came within half a screen. */
  const [phoneLoop, setPhoneLoop] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = stage.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia(LIVE).matches || !loopOf("with", cast, vendorLogos)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Data Saver: the still is the picture (about 1 MB a loop)
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
    let gone = false;
    let io: IntersectionObserver | undefined;
    const watch = () => {
      if (gone) return;
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          io?.disconnect();
          setPhoneLoop(true);
        },
        { rootMargin: "50% 0px" },
      );
      io.observe(el);
    };
    const cancelInput = whenInput(watch);
    return () => {
      gone = true;
      cancelInput();
      io?.disconnect();
    };
  }, [cast, vendorLogos]);
  /* it plays while on screen and waits off it. Muted and inline, set on the element itself before
     each play: iOS lets a video play by itself only then (React does not write `muted` as an
     attribute). A play the browser refuses (iOS Low Power Mode) leaves the poster. */
  useEffect(() => {
    const v = video.current;
    if (!phoneLoop || !v || typeof IntersectionObserver === "undefined") return;
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    let onScreen = false;
    const play = () => {
      if (onScreen && !document.hidden) v.play().catch(() => undefined);
      else v.pause();
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = Boolean(entry?.isIntersecting);
      play();
    });
    io.observe(v);
    document.addEventListener("visibilitychange", play);
    // a new mode is a new source: it plays from its start once it can
    v.addEventListener("loadeddata", play);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", play);
      v.removeEventListener("loadeddata", play);
    };
  }, [phoneLoop]);

  /* live, the poster stays the one already loaded: it is hidden, and a new one would download */
  const shown = booted ?? mode;
  const still = poster(shown, cast, vendorLogos);
  const loop = phoneLoop ? loopOf(mode, cast, vendorLogos) : null;
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
          {/* phones: the loop over its own first frame (the poster above), decorative: the
              poster's alt says what it shows */}
          {loop ? (
            <video
              ref={video}
              className="lp-kitchen__loop"
              src={loop}
              poster={poster(mode, cast, vendorLogos).phone}
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              aria-hidden="true"
              tabIndex={-1}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
