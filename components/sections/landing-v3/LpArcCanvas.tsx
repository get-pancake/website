"use client";

import { useEffect, useRef, useState } from "react";

import {
  type ArcGeometry,
  type FromArcWorker,
  type Ring,
  type RingSpec,
  type ToArcWorker,
  MIN_FRAME_MS,
  POP_MS,
  drawRings,
  exceedsBudget,
  freshBudget,
  rasterizeRings,
  releaseRings,
} from "./lp-arc-draw";

/**
 * Mobile hero-arc renderer — brings the rainbow's 20s rotation back to
 * phones WITHOUT the composited-layer cost that killed WebContent.
 *
 * Why: with the CSS cohort, each of the six full-ring vectors is its own
 * continuously-animating composited layer (2390×2331 CSS px each — ~190MB
 * of standing GPU surfaces at phone DPR, the page's biggest allocation and
 * the confirmed cause of iOS Safari's "A problem repeatedly occurred"
 * founder crash, resolved 2026-09-01 by holding phones static). This
 * component instead draws all six rings into ONE canvas sized to the
 * visible art box: each ring's path is filled ONCE into an offscreen
 * bitmap (Path2D — vector-crisp, no per-frame SVG rasterization), then
 * every frame is six GPU blits under the exact DOM transform chain.
 * ~55MB total, zero compositor churn, and the bitmaps are released
 * whenever the hero is off-stage. Draws are capped near 30fps; measured
 * expensive draws or a persistently slow loop restore the static SVG.
 * WebGL rejection must not start an unlimited software-rendered loop.
 *
 * Fidelity: nothing is re-derived. The static geometry — the canvas div's
 * fit/mirror matrix (mobile: scale·rotate15°·flipX conjugate), each arc's
 * layout offsets, each pose matrix, each ring path and viewBox — is read
 * from the live DOM that anim.css/LpPancakes already position, so the
 * canvas render composes the SAME matrices the CSS version did, with only
 * the spin angle δ(t) = ±360° · (t mod 20s)/20s added in pose space.
 * The cream ring's once-per-load 500ms "pop" settle is reproduced. The
 * DOM rings stay in the tree (visibility:hidden via [data-lp-arc-canvas]
 * once the first frame lands — an atomic swap, and the static artboard
 * remains the fallback whenever this bails).
 *
 * Off the main thread (2026-11-03): this renderer runs only where WebGL
 * cannot draw, and there Canvas2D is CPU-rasterized too — a frame costs
 * 80–220 ms, so the budget's three trial frames were three long tasks right
 * after the first paint (about half of PageSpeed's blocking time: its
 * runners have no GPU). In Chromium the canvas now goes to a worker
 * (transferControlToOffscreen, lp-arc-canvas.worker.ts) that rasterizes and
 * draws with the same code (lp-arc-draw.ts); this component keeps every DOM
 * decision: geometry, when to run, and the artboard swap when the worker
 * says its first frame is drawn. Other engines keep the main-thread
 * renderer: their worker canvases are not known to be accelerated
 * (WebKit), and a CPU worker could lose the rotation where the GPU canvas
 * holds it today (WebGL off, accelerated 2D on — iOS Lockdown Mode).
 *
 * Scope: ≤767px, motion-safe, homepage hero only, when WebGL cannot draw.
 * The DOM rings are static; this canvas is the fallback moving copy.
 */

/** Backing resolution caps — the knobs that keep this OOM-safe. */
const MAX_DPR = 2; // visible canvas; art bands are soft, 2× reads clean on 3× glass
const BITMAP_SCALE = 0.75; // ring bitmaps at 3/4 of drawn resolution (~0.56× memory)

/** A matrix as exact DOMMatrix init numbers (a worker cannot parse CSS). */
const matrixInit = (m: DOMMatrix): number[] =>
  m.is2D ? [m.a, m.b, m.c, m.d, m.e, m.f] : Array.from(m.toFloat64Array());

/** Read the full static geometry from the live DOM. Null = retry later
    (pre-LpFitVars there is no reliable fit scale on iOS — the trig
    fallback is the documented cqw-in-trig garbage). */
function readGeometry(art: HTMLElement): ArcGeometry | null {
  const cdiv = art.querySelector<HTMLElement>(".lp-anim-canvas--hero");
  const box = art.querySelector<HTMLElement>(".lp-anim-box--hero");
  if (!cdiv || !box || !art.style.getPropertyValue("--lp-fit")) return null;
  const cdivT = getComputedStyle(cdiv).transform;
  if (!cdivT || cdivT === "none") return null;

  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  const cw = art.clientWidth;
  const ch = art.clientHeight;
  if (!(cw > 0 && ch > 0)) return null;

  const mCanvas = new DOMMatrix(cdivT); // origin 0 0 (anim.css)
  const base = new DOMMatrix().scale(dpr).multiply(mCanvas);
  const fitScale = Math.sqrt(Math.abs(mCanvas.a * mCanvas.d - mCanvas.b * mCanvas.c));

  const rings: RingSpec[] = [];
  for (const arc of Array.from(box.querySelectorAll<HTMLElement>(".lp-anim-arc"))) {
    const pose = arc.querySelector<HTMLElement>(".lp-anim-pose");
    const spin = arc.querySelector<HTMLElement>(".lp-anim-spin");
    const svg = arc.querySelector<SVGSVGElement>("svg");
    const pathEl = svg?.querySelector("path");
    if (!pose || !spin || !svg || !pathEl) return null;
    const poseT = getComputedStyle(pose).transform;
    const vb = svg.viewBox.baseVal;
    const d = pathEl.getAttribute("d");
    const fill = getComputedStyle(pathEl).fill;
    if (!poseT || poseT === "none" || !d || !vb || !(vb.width > 0)) return null;

    const isPop = svg.classList.contains("lp-anim-pop");
    const scs = getComputedStyle(svg);
    rings.push({
      poseX: box.offsetLeft + arc.offsetLeft + pose.offsetLeft,
      poseY: box.offsetTop + arc.offsetTop + pose.offsetTop,
      poseW: pose.offsetWidth,
      poseH: pose.offsetHeight,
      pose: matrixInit(new DOMMatrix(poseT)),
      dir: spin.classList.contains("lp-anim-spin--ccw") ? -1 : 1,
      d,
      viewW: vb.width,
      viewH: vb.height,
      fill,
      fillW: isPop ? parseFloat(scs.width) : pose.offsetWidth,
      fillH: isPop ? parseFloat(scs.height) : pose.offsetHeight,
      isPop,
    });
  }
  if (!rings.length) return null;
  return {
    width: Math.round(cw * dpr),
    height: Math.round(ch * dpr),
    base: matrixInit(base),
    k: fitScale * dpr * BITMAP_SCALE,
    rings,
  };
}

/** Set once a worker answered that it cannot draw (no OffscreenCanvas 2D or
    Path2D there) or failed to load: the main-thread renderer from then on. */
let workerUnsupported = false;
/** Geometry tags, page-wide, so an answer about an older build never matches. */
let arcGen = 0;

/** Chromium: OffscreenCanvas from a placeholder, in a worker. The UA-CH
    object is Chromium's own (Safari, Firefox and iOS browsers have none). */
const offThreadCapable = (canvas: HTMLCanvasElement) =>
  !workerUnsupported &&
  typeof Worker === "function" &&
  typeof OffscreenCanvas === "function" &&
  typeof canvas.transferControlToOffscreen === "function" &&
  "userAgentData" in navigator;

/** One worker per canvas element: a transferred canvas cannot be handed over
    twice, so an effect re-run on the same element (Strict Mode, the phone
    breakpoint) talks to the worker it already has. */
interface ArcWorker {
  worker: Worker;
  /** "boot" until the worker answered, then "on" (canvas handed over) or "off" */
  state: "boot" | "on" | "off";
  /** the element is the worker's for good once transferred */
  handedOver: boolean;
  listener: ((m: FromArcWorker) => void) | null;
  /** a boot answer that came while no effect run was listening */
  pendingReady: boolean | null;
}
const workers = new WeakMap<HTMLCanvasElement, ArcWorker>();

/** `window.__lpArcPhase` (the rainbow's test hook) pins the cycle. LpRainbowGL
    and LpHeroAgentArt read it on their own frames; a worker cannot, so its
    value is forwarded on every write (the getter keeps the plain reads). */
const phaseListeners = new Set<(v: number | null) => void>();
let phaseHooked = false;
function watchPhase(fn: (v: number | null) => void): () => void {
  const w = window as unknown as { __lpArcPhase?: unknown };
  if (!phaseHooked) {
    phaseHooked = true;
    let value = w.__lpArcPhase;
    Object.defineProperty(window, "__lpArcPhase", {
      configurable: true,
      enumerable: true,
      get: () => value,
      set: (v: unknown) => {
        value = v;
        phaseListeners.forEach((l) => l(typeof v === "number" ? v : null));
      },
    });
  }
  phaseListeners.add(fn);
  fn(typeof w.__lpArcPhase === "number" ? w.__lpArcPhase : null);
  return () => phaseListeners.delete(fn);
}

export function LpArcCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const budgetStoppedRef = useRef(false);
  // flips when the viewport crosses the phone breakpoint → the effect
  // re-runs and boots (or tears down) the renderer
  const [phoneKey, setPhoneKey] = useState(0);
  useEffect(() => {
    const phone = matchMedia("(max-width: 767px)");
    const onChange = () => setPhoneKey((k) => k + 1);
    phone.addEventListener("change", onChange);
    return () => phone.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const art = canvas?.closest<HTMLElement>(".lp-hero-art");
    if (!canvas || !art) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const phone = matchMedia("(max-width: 767px)");
    // Phone-only renderer: on desktop the canvas is display:none (anim.css)
    // and this loop can never draw — creating a 2D context (a canvas IPC
    // channel in Gecko), three observers and the 1.5s verdict timer there
    // was pure hydration cost. A viewport that later shrinks to a phone
    // re-runs the effect through the `phoneKey` state below.
    if (!phone.matches || budgetStoppedRef.current) return;

    // The worker path, or the main-thread one. A canvas already handed to a
    // worker (an earlier run of this effect) stays with it.
    let aw = workers.get(canvas) ?? null;
    let threaded = !!aw && aw.state !== "off";
    let ctx: CanvasRenderingContext2D | null = null;
    if (!aw && offThreadCapable(canvas)) threaded = true;
    if (!threaded) {
      if (aw?.handedOver) return; // handed over, then lost: the artboard stays
      ctx = canvas.getContext("2d");
      if (!ctx) return;
    }

    const t0 = performance.now(); // shared clock epoch — phase survives rebuilds
    let rings: Ring[] = [];
    let base = new DOMMatrix();
    let raf = 0;
    let onStage = true;
    let disposed = false;
    let budget = freshBudget();

    // ── worker path state ──
    let gen = 0; // the geometry the worker holds; 0 = none
    let geoRaf = 0;
    let running = false; // what the worker was last told
    let unwatchPhase: (() => void) | null = null;
    const send = (m: ToArcWorker, transfer?: Transferable[]) => aw?.worker.postMessage(m, transfer ?? []);

    const releaseBitmaps = () => {
      if (threaded) {
        if (geoRaf) cancelAnimationFrame(geoRaf);
        geoRaf = 0;
        if (gen) send({ type: "release", clear: false });
        gen = 0;
        return;
      }
      releaseRings(rings);
      rings = [];
    };
    /** Release AND blank the drawing buffer (build re-sizes it). */
    const clearCanvas = () => {
      if (threaded) {
        if (geoRaf) cancelAnimationFrame(geoRaf);
        geoRaf = 0;
        send({ type: "release", clear: true });
        gen = 0;
        return;
      }
      releaseRings(rings);
      rings = [];
      canvas.width = 0;
      canvas.height = 0;
    };

    /** Main thread: geometry + bitmaps in one pass. False = retry later. */
    const build = (): boolean => {
      const geo = readGeometry(art);
      if (!geo) return false;
      canvas.width = geo.width;
      canvas.height = geo.height;
      const next = rasterizeRings(geo, (w, h) => {
        const off = document.createElement("canvas");
        off.width = w;
        off.height = h;
        return off;
      });
      if (!next || !next.length) return false;
      rings = next;
      base = new DOMMatrix(geo.base);
      return true;
    };

    const frame = () => {
      raf = 0;
      if (disposed || budgetStoppedRef.current || !onStage || document.hidden || reduced.matches) return;
      if (art.hasAttribute("data-lp-gl")) {
        // LpRainbowGL drew (2026-09-02: it runs on phones too) — yield; the
        // attribute observer below restarts this renderer if it ever bails
        art.removeAttribute("data-lp-arc-canvas");
        return;
      }
      if (!rings.length) {
        // Geometry creation is a one-time cost, not steady-state drawing.
        budget = freshBudget();
        if (!build()) {
          raf = requestAnimationFrame(frame); // LpFitVars not there yet — retry
          return;
        }
      }
      const now = performance.now();
      if (budget.lastDraw && now - budget.lastDraw < MIN_FRAME_MS) {
        raf = requestAnimationFrame(frame);
        return;
      }
      // test hook: freeze the clock at a given cycle fraction (gates only)
      const hook = (window as unknown as { __lpArcPhase?: number }).__lpArcPhase;
      const cycle = typeof hook === "number" ? hook : ((now - t0) / 20000) % 1;
      const popP = typeof hook === "number" ? 1 : Math.min(1, (now - t0) / POP_MS);
      drawRings(ctx!, canvas.width, canvas.height, base, rings, cycle, popP);
      if (exceedsBudget(budget, now, performance.now() - now)) {
        budgetStop();
        return;
      }
      if (!art.hasAttribute("data-lp-arc-canvas")) {
        art.setAttribute("data-lp-arc-canvas", ""); // first frame drew — swap
      }
      raf = requestAnimationFrame(frame);
    };

    const budgetStop = () => {
      budgetStoppedRef.current = true;
      stopAndRestore();
      clearTimeout(glWait);
      clearCanvas();
    };

    /** May the canvas draw now? (the main-thread frame checks the same) */
    const mayRun = () =>
      !disposed &&
      !budgetStoppedRef.current &&
      onStage &&
      !document.hidden &&
      !reduced.matches &&
      phone.matches &&
      !art.hasAttribute("data-lp-gl");

    /** Worker path: geometry to the worker (read once LpFitVars has run),
        then run. The worker draws its first frame as soon as it has both. */
    const sendGeometry = () => {
      geoRaf = 0;
      if (!mayRun() || !aw || aw.state !== "on") return;
      const geo = readGeometry(art);
      if (!geo) {
        geoRaf = requestAnimationFrame(sendGeometry); // LpFitVars not there yet — retry
        return;
      }
      gen = ++arcGen;
      send({ type: "geometry", gen, geo, t0: performance.timeOrigin + t0 });
    };
    const runWorker = (on: boolean) => {
      if (running === on) return;
      running = on;
      send({ type: "run", on });
    };
    /** The worker is gone or cannot draw. Before the hand-over the canvas is
        still free: the main-thread renderer takes it. After it, the static
        artboard is the render (the element stays the worker's, unusable). */
    const workerLost = (handedOver: boolean) => {
      if (!aw) return;
      aw.state = "off";
      aw.listener = null;
      aw.worker.terminate();
      workerUnsupported = true;
      if (handedOver) {
        gen = 0;
        stopAndRestore();
        return;
      }
      workers.delete(canvas);
      aw = null;
      threaded = false;
      ctx = canvas.getContext("2d");
      if (ctx) start();
    };
    const onWorker = (m: FromArcWorker) => {
      if (disposed || !aw) return;
      if (m.type === "ready") {
        if (!m.ok) {
          // no OffscreenCanvas 2D / Path2D / DOMMatrix in workers here (at
          // boot), or no 2D context for the canvas (after the hand-over)
          workerLost(aw.handedOver);
          return;
        }
        if (aw.state !== "boot") return;
        let offscreen: OffscreenCanvas;
        try {
          offscreen = canvas.transferControlToOffscreen();
        } catch {
          workerLost(false); // the element could not be handed over: draw it here
          return;
        }
        aw.state = "on";
        aw.handedOver = true;
        send({ type: "canvas", canvas: offscreen }, [offscreen]);
        start();
        return;
      }
      if (m.type === "stopped") {
        // the frame budget said no (the worker stopped for good): the
        // artboard returns, as the main-thread renderer's budget does
        gen = 0;
        budgetStop();
        return;
      }
      if (m.gen !== gen) return; // about an older geometry
      if (m.type === "drawn") {
        if (mayRun() && !art.hasAttribute("data-lp-arc-canvas")) {
          art.setAttribute("data-lp-arc-canvas", ""); // first frame drew — swap
        }
      } else if (m.type === "failed") {
        gen = 0;
        stopAndRestore();
      }
    };
    const bootWorker = () => {
      if (aw) {
        aw.listener = onWorker;
        const pending = aw.pendingReady;
        if (pending !== null) {
          aw.pendingReady = null;
          onWorker({ type: "ready", ok: pending });
        }
        return;
      }
      const worker = new Worker(new URL("./lp-arc-canvas.worker.ts", import.meta.url));
      const entry: ArcWorker = { worker, state: "boot", handedOver: false, listener: onWorker, pendingReady: null };
      aw = entry;
      worker.onmessage = (e: MessageEvent<FromArcWorker>) => {
        if (entry.listener) entry.listener(e.data);
        else if (e.data.type === "ready" && entry.state === "boot") entry.pendingReady = e.data.ok;
      };
      // a script that never loaded, or an exception inside the worker: the
      // current effect run handles it as a worker that cannot draw
      worker.onerror = () => {
        if (entry.state === "off") return;
        if (entry.listener) {
          entry.listener({ type: "ready", ok: false });
          return;
        }
        entry.state = "off"; // between two runs of the effect
        entry.worker.terminate();
        workerUnsupported = true;
        if (!entry.handedOver) workers.delete(canvas);
      };
      workers.set(canvas, entry);
    };

    // LpRainbowGL owns the hero when it can: wait for its verdict
    // ([data-lp-gl] = drew, [data-lp-gl-off] = no WebGL / kill switch)
    // instead of racing it — both renderers building in the same frame
    // meant ~50MB of ring bitmaps allocated for nothing at every load.
    // A verdict that never comes (a build stalled pre-LpFitVars) is
    // covered by the timeout.
    let glWait = 0;
    let glTimedOut = false;
    const start = () => {
      if (disposed || budgetStoppedRef.current) return;
      if (art.hasAttribute("data-lp-gl")) return; // the WebGL renderer owns the hero
      if (!art.hasAttribute("data-lp-gl-off") && !glTimedOut) {
        if (!glWait) {
          glWait = window.setTimeout(() => {
            glTimedOut = true;
            start();
          }, 1500);
        }
        return;
      }
      if (!phone.matches || reduced.matches || !onStage || document.hidden) return;
      if (threaded) {
        if (!aw || aw.listener !== onWorker) bootWorker(); // the worker answers "ready", then start() again
        if (!aw || aw.state !== "on") return;
        unwatchPhase ??= watchPhase((value) => send({ type: "phase", value }));
        if (!gen && !geoRaf) sendGeometry();
        runWorker(true); // the worker resets its own budget: hidden time is never a slow frame
        return;
      }
      if (!raf) {
        budget = freshBudget(); // hidden/off-stage time is never a slow frame
        raf = requestAnimationFrame(frame);
      }
    };
    /** Stop drawing; the bitmaps stay (they rebuild on the way back). */
    const pause = () => {
      if (threaded) {
        if (geoRaf) cancelAnimationFrame(geoRaf);
        geoRaf = 0;
        runWorker(false);
        return;
      }
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    // WebGL handoff / bail-out (context loss, reduced motion flip) → this
    // renderer stops / resumes accordingly, phase held by the clock
    const glWatch = new MutationObserver(() => {
      if (art.hasAttribute("data-lp-gl")) {
        pause();
        art.removeAttribute("data-lp-arc-canvas");
        clearCanvas(); // and the 2D backing store (build re-sizes it)
      } else {
        start();
      }
    });
    glWatch.observe(art, { attributes: true, attributeFilter: ["data-lp-gl", "data-lp-gl-off"] });
    const stopAndRestore = () => {
      pause();
      art.removeAttribute("data-lp-arc-canvas"); // DOM artboard pose returns
    };

    // Off-stage: stop drawing AND drop the ~50MB of ring bitmaps — they
    // rebuild from Path2D in one pass on re-entry, phase held by the clock.
    const io = new IntersectionObserver(
      (entries) => {
        onStage = entries.some((e) => e.isIntersecting);
        if (onStage) {
          start();
        } else {
          pause();
          releaseBitmaps();
        }
      },
      { rootMargin: "75% 0%" },
    );
    io.observe(art);

    const onMedia = () => {
      if (phone.matches && !reduced.matches) start();
      else stopAndRestore();
    };
    const onVisibility = () => {
      if (document.hidden) pause();
      else start();
    };
    // The bitmap fallback uses the same palette as the static SVG and GL.
    // Rebuilding the fills retains t0, so toggling never resets the rotation.
    const paletteWatch = new MutationObserver(() => {
      const showing = art.hasAttribute("data-lp-arc-canvas") && phone.matches && !reduced.matches;
      if (threaded) {
        // the worker draws the new fills as soon as it has them
        releaseBitmaps();
        if (showing && running) sendGeometry();
        else start();
        return;
      }
      releaseBitmaps();
      // An active fallback must also paint the new snapshot immediately.
      // Keep the same clock and replace, rather than duplicate, its RAF.
      if (raf && showing) {
        cancelAnimationFrame(raf);
        raf = 0;
        frame();
      } else start();
    });
    const audienceRoot = art.closest("[data-audience]");
    if (audienceRoot) paletteWatch.observe(audienceRoot, { attributes: true, attributeFilter: ["data-audience"] });

    // orientation / fold changes: geometry + backing sizes are stale
    const ro = new ResizeObserver(() => {
      releaseBitmaps();
      start();
    });
    ro.observe(art);
    phone.addEventListener("change", onMedia);
    reduced.addEventListener("change", onMedia);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      disposed = true;
      stopAndRestore();
      clearCanvas();
      clearTimeout(glWait);
      unwatchPhase?.();
      if (aw) {
        aw.listener = null;
        // unmounted (the element left the page): the worker goes with it;
        // a re-run on the same element (Strict Mode) keeps it
        if (!canvas.isConnected) {
          aw.worker.terminate();
          workers.delete(canvas);
        }
      }
      glWatch.disconnect();
      paletteWatch.disconnect();
      io.disconnect();
      ro.disconnect();
      phone.removeEventListener("change", onMedia);
      reduced.removeEventListener("change", onMedia);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [phoneKey]);

  return <canvas ref={canvasRef} className="lp-arc-canvas" aria-hidden="true" />;
}
