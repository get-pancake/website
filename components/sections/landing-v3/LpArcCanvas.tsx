"use client";

import { useEffect, useRef, useState } from "react";

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
 * Scope: ≤767px, motion-safe, homepage hero only, when WebGL cannot draw.
 * The DOM rings are static; this canvas is the fallback moving copy.
 */

/** Backing resolution caps — the knobs that keep this OOM-safe. */
const MAX_DPR = 2; // visible canvas; art bands are soft, 2× reads clean on 3× glass
const BITMAP_SCALE = 0.75; // ring bitmaps at 3/4 of drawn resolution (~0.56× memory)
const POP_START = { w: 2440.574, h: 2381.047 }; // lp-anim-pop 0% keyframe (anim.css)
const POP_MS = 500;
const MIN_FRAME_MS = 1000 / 30 - 1; // 1ms tolerance for RAF timestamp rounding
const LONG_DRAW_MS = 50;
const LONG_DRAW_LIMIT = 3;
const BUDGET_WINDOW_MS = 2000;
const MIN_FPS = 12;
const SLOW_WINDOW_LIMIT = 2;

interface FrameBudget {
  lastDraw: number;
  windowStart: number;
  frames: number;
  slowFrames: number;
  slowWindows: number;
  expensiveDraws: number;
}

const freshBudget = (): FrameBudget => ({
  lastDraw: 0, windowStart: 0, frames: 0, slowFrames: 0, slowWindows: 0, expensiveDraws: 0,
});

/** Direct draw cost catches CPU rasterization; output cadence also catches
 * deferred raster/compositor work. One busy frame never disables motion. */
function exceedsBudget(budget: FrameBudget, now: number, drawMs: number): boolean {
  budget.expensiveDraws = drawMs > LONG_DRAW_MS ? budget.expensiveDraws + 1 : 0;
  if (budget.expensiveDraws >= LONG_DRAW_LIMIT) return true;
  if (!budget.lastDraw) {
    budget.windowStart = now;
  } else {
    budget.frames++;
    if (now - budget.lastDraw > 1000 / MIN_FPS) budget.slowFrames++;
    const elapsed = now - budget.windowStart;
    if (elapsed >= BUDGET_WINDOW_MS) {
      const slow = budget.frames * 1000 / elapsed < MIN_FPS && budget.slowFrames / budget.frames > 0.5;
      budget.slowWindows = slow ? budget.slowWindows + 1 : 0;
      budget.windowStart = now;
      budget.frames = 0;
      budget.slowFrames = 0;
    }
  }
  budget.lastDraw = now;
  return budget.slowWindows >= SLOW_WINDOW_LIMIT;
}

interface Ring {
  poseX: number;
  poseY: number;
  poseW: number;
  poseH: number;
  pose: DOMMatrix;
  dir: 1 | -1;
  bitmap: HTMLCanvasElement | null;
  path: Path2D;
  viewW: number;
  viewH: number;
  fill: string;
  /** settled fill box (pose space); non-pop = the pose box itself */
  fillW: number;
  fillH: number;
  isPop: boolean;
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

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const t0 = performance.now(); // shared clock epoch — phase survives rebuilds
    let rings: Ring[] = [];
    let base = new DOMMatrix();
    let dpr = 1;
    let raf = 0;
    let onStage = true;
    let disposed = false;
    let budget = freshBudget();

    const releaseBitmaps = () => {
      for (const ring of rings) {
        if (!ring.bitmap) continue;
        ring.bitmap.width = 0;
        ring.bitmap.height = 0;
        ring.bitmap = null;
      }
      rings = [];
    };

    /** Read the full static geometry from the live DOM. False = retry later
        (pre-LpFitVars there is no reliable fit scale on iOS — the trig
        fallback is the documented cqw-in-trig garbage). */
    const build = (): boolean => {
      const cdiv = art.querySelector<HTMLElement>(".lp-anim-canvas--hero");
      const box = art.querySelector<HTMLElement>(".lp-anim-box--hero");
      if (!cdiv || !box || !art.style.getPropertyValue("--lp-fit")) return false;
      const cdivT = getComputedStyle(cdiv).transform;
      if (!cdivT || cdivT === "none") return false;

      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const cw = art.clientWidth;
      const ch = art.clientHeight;
      if (!(cw > 0 && ch > 0)) return false;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);

      const mCanvas = new DOMMatrix(cdivT); // origin 0 0 (anim.css)
      base = new DOMMatrix().scale(dpr).multiply(mCanvas);
      const fitScale = Math.sqrt(Math.abs(mCanvas.a * mCanvas.d - mCanvas.b * mCanvas.c));
      const k = fitScale * dpr * BITMAP_SCALE;

      const next: Ring[] = [];
      for (const arc of Array.from(box.querySelectorAll<HTMLElement>(".lp-anim-arc"))) {
        const pose = arc.querySelector<HTMLElement>(".lp-anim-pose");
        const spin = arc.querySelector<HTMLElement>(".lp-anim-spin");
        const svg = arc.querySelector<SVGSVGElement>("svg");
        const pathEl = svg?.querySelector("path");
        if (!pose || !spin || !svg || !pathEl) return false;
        const poseT = getComputedStyle(pose).transform;
        const vb = svg.viewBox.baseVal;
        const d = pathEl.getAttribute("d");
        const fill = getComputedStyle(pathEl).fill;
        if (!poseT || poseT === "none" || !d || !vb || !(vb.width > 0)) return false;

        const isPop = svg.classList.contains("lp-anim-pop");
        const scs = getComputedStyle(svg);
        const fillW = isPop ? parseFloat(scs.width) : pose.offsetWidth;
        const fillH = isPop ? parseFloat(scs.height) : pose.offsetHeight;

        // one-time vector rasterization at final drawn resolution × BITMAP_SCALE
        const bw = Math.max(1, Math.ceil(fillW * k));
        const bh = Math.max(1, Math.ceil(fillH * k));
        const off = document.createElement("canvas");
        off.width = bw;
        off.height = bh;
        const octx = off.getContext("2d");
        if (!octx) return false;
        // path coords (viewBox space) → fill box (preserveAspectRatio="none")
        octx.setTransform((bw / vb.width) * 1, 0, 0, (bh / vb.height) * 1, 0, 0);
        octx.fillStyle = fill;
        octx.fill(new Path2D(d));

        next.push({
          poseX: box.offsetLeft + arc.offsetLeft + pose.offsetLeft,
          poseY: box.offsetTop + arc.offsetTop + pose.offsetTop,
          poseW: pose.offsetWidth,
          poseH: pose.offsetHeight,
          pose: new DOMMatrix(poseT),
          dir: spin.classList.contains("lp-anim-spin--ccw") ? -1 : 1,
          bitmap: off,
          path: new Path2D(d),
          viewW: vb.width,
          viewH: vb.height,
          fill,
          fillW,
          fillH,
          isPop,
        });
      }
      if (!next.length) return false;
      rings = next;
      return true;
    };

    const easeOut = (x: number) => 1 - (1 - x) * (1 - x);

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

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      for (const r of rings) {
        if (!r.bitmap) continue;
        const cx = r.poseW / 2;
        const cy = r.poseH / 2;
        const m = base
          .translate(r.poseX + cx, r.poseY + cy)
          .multiply(r.pose)
          .rotate(r.dir * cycle * 360)
          .translate(-cx, -cy);
        ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
        let w = r.fillW;
        let h = r.fillH;
        if (r.isPop && popP < 1) {
          const e = easeOut(popP);
          w = POP_START.w + (r.fillW - POP_START.w) * e;
          h = POP_START.h + (r.fillH - POP_START.h) * e;
        }
        ctx.drawImage(
          r.bitmap,
          0,
          0,
          r.bitmap.width,
          r.bitmap.height,
          (r.poseW - w) / 2,
          (r.poseH - h) / 2,
          w,
          h,
        );
      }
      if (exceedsBudget(budget, now, performance.now() - now)) {
        budgetStoppedRef.current = true;
        stopAndRestore();
        clearTimeout(glWait);
        releaseBitmaps();
        canvas.width = 0;
        canvas.height = 0;
        return;
      }
      if (!art.hasAttribute("data-lp-arc-canvas")) {
        art.setAttribute("data-lp-arc-canvas", ""); // first frame drew — swap
      }
      raf = requestAnimationFrame(frame);
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
      if (!raf && phone.matches && !reduced.matches && onStage && !document.hidden) {
        budget = freshBudget(); // hidden/off-stage time is never a slow frame
        raf = requestAnimationFrame(frame);
      }
    };
    // WebGL handoff / bail-out (context loss, reduced motion flip) → this
    // renderer stops / resumes accordingly, phase held by the clock
    const glWatch = new MutationObserver(() => {
      if (art.hasAttribute("data-lp-gl")) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        art.removeAttribute("data-lp-arc-canvas");
        releaseBitmaps();
        canvas.width = 0; // and the 2D backing store (build() re-sizes it)
        canvas.height = 0;
      } else {
        start();
      }
    });
    glWatch.observe(art, { attributes: true, attributeFilter: ["data-lp-gl", "data-lp-gl-off"] });
    const stopAndRestore = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
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
          if (raf) cancelAnimationFrame(raf);
          raf = 0;
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
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else start();
    };
    // The bitmap fallback uses the same palette as the static SVG and GL.
    // Rebuilding the fills retains t0, so toggling never resets the rotation.
    const paletteWatch = new MutationObserver(() => {
      releaseBitmaps();
      // An active fallback must also paint the new snapshot immediately.
      // Keep the same clock and replace, rather than duplicate, its RAF.
      if (raf && art.hasAttribute("data-lp-arc-canvas") && phone.matches && !reduced.matches) {
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
      releaseBitmaps();
      canvas.width = 0;
      canvas.height = 0;
      clearTimeout(glWait);
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
