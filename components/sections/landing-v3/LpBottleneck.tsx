"use client";

import { useEffect, useRef } from "react";

import type { AnimationItem } from "lottie-web";

/**
 * Banner bottle — the designer's Lottie animation (delivered 2026-09-01,
 * "bottleneck": horizontal 1620×720 for desktop, vertical 720×1620 for
 * phones; intro frames 0–330 then a seamless 330–600 loop — the loop file's
 * first frame IS the intro's last). Per the designer's note, the rounded
 * corners and the headings stay in HTML: the card's r48 + overflow:hidden
 * clip this, and LpBanner's titles/body render above.
 *
 * Two founder-reported glitches shaped this structure (2026-09-01):
 * - "la bouteille apparaît après quelques millisecondes": the card's CSS
 *   background paints instantly but the player needs an import + a JSON
 *   fetch. A POSTER of the intro's frame 0 (rendered from the Lottie
 *   itself, public/lp/lp-bottleneck-poster-*.png) ships in the SSR markup
 *   and hides only once the player has painted its own first frame
 *   ([data-live] on the holder).
 * - "après la première goutte la bouteille blink un coup": destroying the
 *   intro player and creating the loop player left empty frames. The
 *   still is DOUBLE-BUFFERED: created on a second host while the intro
 *   plays, pre-rendered at the loop's first frame (== the intro's last),
 *   and the handoff is a visibility swap of two identical frames.
 *
 * Firefox (2026-09-02, founder: the page "freeze encore sur Firefox"): the
 * loop file is 45 static layers plus ONE moving drop ("Shape Layer 38":
 * scales up over frames 330–563, falls 563–591; every bubble's last
 * keyframe is < 330, the bottle and the solids never move). lottie-web's
 * canvas renderer is immediate-mode — clear + redraw all 46 layers on every
 * tick, 3.9 Mpx at dpr 2, and on every rAF (120/s on ProMotion) — which was
 * 35–100% of a core in Gecko (its accelerated Canvas2D falls back to
 * software for path-heavy frames, then uploads 15.6 MB per frame). Now the
 * still (hostB) is rendered ONCE at the loop's first frame and never
 * redrawn, and a third player (hostC) carries ONLY the drop layer in a
 * composition cropped to the drop's travel band (DROP_CROP, ~100×350 comp
 * px): the steady state is one small canvas per frame. Z-order is the
 * file's: the drop layer sits between the background solids and the bottle
 * (it emerges from behind the lip), so the still is rendered WITHOUT its two
 * solids — the card's CSS background is the same #ffbd7a (--lp-yellow-30)
 * the orange solid paints — and the drop host is stacked under the still:
 * card colour, drop, bottle + bubbles. Same pixels, ~50× fewer of them.
 * setSubframe(false) pins every player to the file's authored 60 fps
 * (lottie-web otherwise re-renders on every rAF, including in-between
 * subframes on 120 Hz displays).
 *
 * Budget discipline (post-OOM doctrine): pure-vector files (~77KB each),
 * CANVAS renderer only, lottie-web's canvas-only build dynamically imported
 * the first time the banner comes within a viewport of the screen. Players
 * pause off-stage and on tab hide; reduced-motion never boots the player at
 * all — the poster is the render.
 */

type Orientation = "h" | "v";

const SRC: Record<Orientation, { intro: string; loop: string }> = {
  h: { intro: "/lp/lp-bottleneck-h.json", loop: "/lp/lp-bottleneck-h-loop.json" },
  v: { intro: "/lp/lp-bottleneck-v.json", loop: "/lp/lp-bottleneck-v-loop.json" },
};
const COMP: Record<Orientation, { w: number; h: number }> = { h: { w: 1620, h: 720 }, v: { w: 720, h: 1620 } };
/** The only layer that moves after the loop's first frame (verified on the
    files' keyframes, 2026-09-02). */
const DROP_LAYER = "Shape Layer 38";
/** The drop's travel band in comp coordinates, with ~12px of margin: the
    horizontal drop hangs at (969.6, 383) — its outline spans x ≈ 934…1007
    at full scale — then falls to y 838 (past the comp's bottom); the
    vertical file's drop goes (369.2, 926) → (373.2, 1647). */
const DROP_CROP: Record<Orientation, { x: number; y: number; w: number; h: number }> = {
  h: { x: 920, y: 372, w: 100, h: 348 },
  v: { x: 320, y: 914, w: 100, h: 706 },
};

/** Minimal view of the Lottie JSON this file needs to crop it. */
interface LottieKeyframe {
  s?: number[];
  e?: number[];
  [k: string]: unknown;
}
interface LottieProp {
  a?: number;
  k?: number[] | number | LottieKeyframe[];
  s?: boolean;
  x?: LottieProp;
  y?: LottieProp;
  [k: string]: unknown;
}
interface LottieLayer {
  nm?: string;
  ty?: number;
  parent?: number;
  ks?: { p?: LottieProp; [k: string]: unknown };
  [k: string]: unknown;
}
interface LottieData {
  w: number;
  h: number;
  layers: LottieLayer[];
  [k: string]: unknown;
}

const shiftProp = (p: LottieProp | undefined, dx: number, dy: number): boolean => {
  if (!p) return false;
  if (p.s && p.x && p.y) return shiftProp(p.x, dx, 0) && shiftProp(p.y, dy, 0); // split x/y
  const k = p.k;
  if (Array.isArray(k) && k.length && typeof k[0] === "number") {
    const v = k as number[];
    v[0] += dx;
    v[1] += dy;
    return true;
  }
  if (Array.isArray(k)) {
    for (const kf of k as LottieKeyframe[]) {
      if (kf.s && kf.s.length >= 2) { kf.s[0] += dx; kf.s[1] += dy; }
      if (kf.e && kf.e.length >= 2) { kf.e[0] += dx; kf.e[1] += dy; }
    }
    return true;
  }
  return false;
};

/** The loop file reduced to the drop layer in a composition the size of
    its travel band (layer positions translated). Null = the file does not
    look like what we expect (a parented or missing drop) → the caller
    plays the full loop as before. */
const cropToDrop = (data: LottieData, o: Orientation): LottieData | null => {
  const crop = DROP_CROP[o];
  const drop = data.layers.find((l) => l.nm === DROP_LAYER);
  if (!drop || drop.parent != null || data.w !== COMP[o].w || data.h !== COMP[o].h) return null;
  const copy = JSON.parse(JSON.stringify(drop)) as LottieLayer;
  if (!shiftProp(copy.ks?.p, -crop.x, -crop.y)) return null;
  return { ...data, w: crop.w, h: crop.h, layers: [copy] };
};

export function LpBottleneck() {
  const holderRef = useRef<HTMLDivElement>(null);
  const hostARef = useRef<HTMLDivElement>(null);
  const hostBRef = useRef<HTMLDivElement>(null);
  const hostCRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const holder = holderRef.current;
    const hostA = hostARef.current;
    const hostB = hostBRef.current;
    const hostC = hostCRef.current;
    if (!holder || !hostA || !hostB || !hostC) return;
    const phone = matchMedia("(max-width: 767px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");

    let lottie: typeof import("lottie-web").default | null = null;
    let intro: AnimationItem | null = null;
    let still: AnimationItem | null = null; // hostB: the loop's first frame, drawn once
    let drop: AnimationItem | null = null; // hostC: the drop layer alone, looping
    let active: "intro" | "drop" = "intro";
    let disposed = false;
    let loading = false;
    let onStage = false; // within a viewport: preload + pre-render
    let visible = false; // actually on screen (≥35% of the card): PLAY
    let introReady = false; // renderer up (DOMLoaded)
    let dropReady = false;
    let orientation: Orientation = phone.matches ? "v" : "h";

    const teardown = () => {
      intro?.destroy();
      still?.destroy();
      drop?.destroy();
      intro = still = drop = null;
      active = "intro";
      introReady = dropReady = false;
      hostA.replaceChildren();
      hostB.replaceChildren();
      hostC.replaceChildren();
      hostA.style.visibility = "";
      hostB.style.visibility = "hidden";
      hostC.style.visibility = "hidden";
      holder.removeAttribute("data-live");
    };

    /** hostC covers exactly the drop's travel band under the same
        xMidYMid-slice mapping the full-size players use (aspect ratios of
        card and comp match to 0.05%, so the offsets are ~0 — computed
        anyway so any card size stays exact). */
    const placeDrop = () => {
      const comp = COMP[orientation];
      const crop = DROP_CROP[orientation];
      const W = holder.clientWidth;
      const H = holder.clientHeight;
      if (!(W > 0 && H > 0)) return;
      const scale = Math.max(W / comp.w, H / comp.h);
      const ox = (W - comp.w * scale) / 2;
      const oy = (H - comp.h * scale) / 2;
      hostC.style.left = `${ox + crop.x * scale}px`;
      hostC.style.top = `${oy + crop.y * scale}px`;
      hostC.style.width = `${crop.w * scale}px`;
      hostC.style.height = `${crop.h * scale}px`;
      drop?.resize();
    };

    const create = () => {
      if (disposed || !lottie) return;
      teardown();
      orientation = phone.matches ? "v" : "h";
      const src = SRC[orientation];
      const settings = {
        renderer: "canvas" as const,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice",
          clearCanvas: true,
          dpr: Math.min(window.devicePixelRatio || 1, 2),
        },
      };
      // autoplay OFF: the intro starts only once the card is actually on
      // screen (founder 2026-09-01: it used to start a viewport early, so the
      // pour was already over by the time you saw it). play() is issued from
      // sync() after DOMLoaded — the renderer must be up first.
      const lib = lottie;
      intro = lib.loadAnimation({
        ...settings,
        container: hostA,
        loop: false,
        autoplay: false,
        path: src.intro,
      });
      intro.setSubframe(false);
      intro.addEventListener("DOMLoaded", () => {
        if (disposed) return;
        introReady = true;
        sync();
      });
      // the still pre-renders NOW, hidden, at the loop's first frame — which
      // is the intro's last — so the 5.5s handoff swaps two identical frames.
      // It is never played: after this one frame it costs nothing. Rendered
      // without the file's solids (the card paints that orange) so the drop
      // host under it shows through — the file's own z-order (see header).
      placeDrop();
      const o = orientation;
      fetch(src.loop)
        .then((r) => (r.ok ? (r.json() as Promise<LottieData>) : Promise.reject(new Error(String(r.status)))))
        .then((data) => {
          if (disposed || o !== orientation || !lib) return;
          const cropped = cropToDrop(data, o);
          if (cropped) {
            still = lib.loadAnimation({
              ...settings,
              container: hostB,
              loop: false,
              autoplay: false,
              animationData: { ...data, layers: data.layers.filter((l) => l.ty !== 1) },
            });
            still.addEventListener("DOMLoaded", () => {
              if (!disposed) still?.goToAndStop(0, true);
            });
          }
          // the drop: the loop file cropped to the one layer that moves —
          // or, for a file that does not look like the one we know, the
          // whole loop on hostB as before (solids included)
          drop = lib.loadAnimation({
            ...settings,
            container: cropped ? hostC : hostB,
            loop: true,
            autoplay: false,
            animationData: cropped ?? data,
          });
          drop.setSubframe(false);
          drop.addEventListener("DOMLoaded", () => {
            if (disposed) return;
            dropReady = true;
            drop?.goToAndStop(0, true);
            sync();
          });
        })
        .catch(() => {
          // the loop JSON did not load: the still cannot be built either —
          // the intro's last frame keeps standing on hostA (it is only
          // retired once the still is up, below)
        });
      intro.addEventListener("enterFrame", function reveal() {
        // first painted player frame — retire the poster
        holder.setAttribute("data-live", "");
        intro?.removeEventListener("enterFrame", reveal);
      });
      intro.addEventListener("complete", () => {
        if (disposed) return;
        if (!still && !drop) return; // nothing to hand off to: the last frame stands
        hostB.style.visibility = "";
        hostC.style.visibility = "";
        active = "drop";
        sync();
        // two frames of overlap (identical content), then retire the intro
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            hostA.style.visibility = "hidden";
            intro?.destroy();
            intro = null;
          }),
        );
      });
      sync();
    };

    const sync = () => {
      const anim = active === "intro" ? intro : drop;
      const ready = active === "intro" ? introReady : dropReady;
      if (!anim || !ready) return;
      if (visible && !document.hidden) anim.play();
      else anim.pause();
    };

    const boot = () => {
      if (loading || lottie || disposed || reduced.matches) return;
      loading = true;
      import("lottie-web/build/player/lottie_canvas").then((m) => {
        if (disposed) return;
        lottie = (m.default ?? m) as typeof import("lottie-web").default;
        create();
      });
    };

    // Two observers: a wide one to PRELOAD (import + JSON + pre-rendered
    // still) a viewport ahead, and a tight one to PLAY only once ≥35% of the
    // card is really on screen — so the pour's opening frames are seen.
    const io = new IntersectionObserver(
      (entries) => {
        onStage = entries.some((e) => e.isIntersecting);
        if (onStage) boot();
      },
      { rootMargin: "100% 0%" },
    );
    io.observe(holder);
    const ioPlay = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        sync();
      },
      { threshold: 0.35 },
    );
    ioPlay.observe(holder);
    const ro = new ResizeObserver(() => placeDrop());
    ro.observe(holder);

    const onMedia = () => {
      if (reduced.matches) {
        teardown(); // poster (correct orientation via <picture>) is the render
        return;
      }
      if (lottie) create();
      else boot();
    };
    const onVisibility = () => sync();
    phone.addEventListener("change", onMedia);
    reduced.addEventListener("change", onMedia);
    document.addEventListener("visibilitychange", onVisibility);
    hostB.style.visibility = "hidden";
    hostC.style.visibility = "hidden";

    return () => {
      disposed = true;
      io.disconnect();
      ioPlay.disconnect();
      ro.disconnect();
      phone.removeEventListener("change", onMedia);
      reduced.removeEventListener("change", onMedia);
      document.removeEventListener("visibilitychange", onVisibility);
      teardown();
    };
  }, []);

  return (
    <div ref={holderRef} className="lp-banner__lottie" aria-hidden="true">
      {/* frame-0 poster, in the SSR markup: the bottle is there the instant
          the card is — the player replaces it only once it has painted */}
      <picture className="lp-banner__poster">
        <source media="(max-width: 767px)" srcSet="/lp/lp-bottleneck-poster-v.png" />
        <img src="/lp/lp-bottleneck-poster-h.png" alt="" loading="lazy" decoding="async" />
      </picture>
      <div ref={hostARef} className="lp-banner__lottie-host" />
      {/* the drop alone, UNDER the still: it emerges from behind the lip,
          as in the file (see header) */}
      <div ref={hostCRef} className="lp-banner__lottie-host lp-banner__lottie-host--drop" />
      <div ref={hostBRef} className="lp-banner__lottie-host" />
    </div>
  );
}
