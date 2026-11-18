/**
 * The phone hero's bitmap renderer, shared by LpArcCanvas (main thread) and
 * lp-arc-canvas.worker.ts (a worker that owns the canvas): the ring bitmaps,
 * one frame, and the frame budget — the same code on either thread, so the
 * two paths draw the same pixels.
 *
 * Why a worker (2026-11-03): this renderer only runs where WebGL cannot draw,
 * which is where Canvas2D is CPU-rasterized too. There a frame (six rotated,
 * resampled ring bitmaps) costs 80–220 ms, so the three frames the budget
 * allows before it restores the static artboard were three long main-thread
 * tasks right after the first paint: about 0.5 s of PageSpeed's blocking time
 * (its runners have no GPU). In a worker the same frames block nothing.
 */

export const POP_START = { w: 2440.574, h: 2381.047 }; // lp-anim-pop 0% keyframe (anim.css)
export const POP_MS = 500;
export const MIN_FRAME_MS = 1000 / 30 - 1; // 1ms tolerance for RAF timestamp rounding
const LONG_DRAW_MS = 50;
const LONG_DRAW_LIMIT = 3;
const SEVERE_DRAW_MS = 200; // one draw this costly already visibly blocks interaction
const BUDGET_WINDOW_MS = 2000;
const MIN_FPS = 12;
const SLOW_WINDOW_LIMIT = 2;

export interface FrameBudget {
  lastDraw: number;
  windowStart: number;
  frames: number;
  slowFrames: number;
  slowWindows: number;
  expensiveDraws: number;
}

export const freshBudget = (): FrameBudget => ({
  lastDraw: 0, windowStart: 0, frames: 0, slowFrames: 0, slowWindows: 0, expensiveDraws: 0,
});

/** Direct draw cost catches CPU rasterization; output cadence also catches
 * deferred raster/compositor work. Ordinary busy frames need repetition;
 * a single severely blocking draw is already sufficient evidence. */
export function exceedsBudget(budget: FrameBudget, now: number, drawMs: number): boolean {
  if (drawMs >= SEVERE_DRAW_MS) return true;
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

/** One ring as the DOM positions it — plain data, so it crosses to a worker. */
export interface RingSpec {
  poseX: number;
  poseY: number;
  poseW: number;
  poseH: number;
  /** the pose element's computed transform as DOMMatrix init numbers (6 =
      2D, 16 = 3D): parsed on the main thread, since a worker's DOMMatrix
      takes no CSS string */
  pose: number[];
  dir: 1 | -1;
  d: string;
  viewW: number;
  viewH: number;
  fill: string;
  /** settled fill box (pose space); non-pop = the pose box itself */
  fillW: number;
  fillH: number;
  isPop: boolean;
}

/** The whole static geometry of one build: backing size, the canvas div's
    matrix (DPR applied) and the rings. */
export interface ArcGeometry {
  width: number;
  height: number;
  /** DOMMatrix init: 6 numbers for a 2D matrix, 16 otherwise (exact, no string round trip) */
  base: number[];
  /** ring bitmap resolution: fit scale × DPR × BITMAP_SCALE */
  k: number;
  rings: RingSpec[];
}

type Bitmap = HTMLCanvasElement | OffscreenCanvas;
type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export interface Ring extends RingSpec {
  m: DOMMatrix;
  bitmap: Bitmap | null;
}

/** One-time vector rasterization of each ring at final drawn resolution ×
    BITMAP_SCALE. `make` returns a blank canvas of that size (a DOM canvas on
    the main thread, an OffscreenCanvas in the worker). Null = a 2D context
    could not be had. */
export function rasterizeRings(geo: ArcGeometry, make: (w: number, h: number) => Bitmap): Ring[] | null {
  const out: Ring[] = [];
  for (const spec of geo.rings) {
    const bw = Math.max(1, Math.ceil(spec.fillW * geo.k));
    const bh = Math.max(1, Math.ceil(spec.fillH * geo.k));
    const off = make(bw, bh);
    const octx = off.getContext("2d") as Ctx2D | null;
    if (!octx) return null;
    // path coords (viewBox space) → fill box (preserveAspectRatio="none")
    octx.setTransform((bw / spec.viewW) * 1, 0, 0, (bh / spec.viewH) * 1, 0, 0);
    octx.fillStyle = spec.fill;
    octx.fill(new Path2D(spec.d));
    out.push({ ...spec, m: new DOMMatrix(spec.pose), bitmap: off });
  }
  return out;
}

export function releaseRings(rings: Ring[]) {
  for (const ring of rings) {
    if (!ring.bitmap) continue;
    ring.bitmap.width = 0;
    ring.bitmap.height = 0;
    ring.bitmap = null;
  }
}

const easeOut = (x: number) => 1 - (1 - x) * (1 - x);

/** One frame: the six bitmaps under the exact DOM transform chain, the spin
    angle δ = ±360° · cycle added in pose space, the cream ring's pop settle
    while popP < 1. */
export function drawRings(
  ctx: Ctx2D,
  width: number,
  height: number,
  base: DOMMatrix,
  rings: Ring[],
  cycle: number,
  popP: number,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  for (const r of rings) {
    if (!r.bitmap) continue;
    const cx = r.poseW / 2;
    const cy = r.poseH / 2;
    const m = base
      .translate(r.poseX + cx, r.poseY + cy)
      .multiply(r.m)
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
    ctx.drawImage(r.bitmap, 0, 0, r.bitmap.width, r.bitmap.height, (r.poseW - w) / 2, (r.poseH - h) / 2, w, h);
  }
}

/** Messages between LpArcCanvas and its worker. `gen` tags every geometry so
    a late answer about an older one is ignored. */
export type ToArcWorker =
  | { type: "canvas"; canvas: OffscreenCanvas }
  | { type: "geometry"; gen: number; geo: ArcGeometry; t0: number }
  | { type: "run"; on: boolean }
  | { type: "release"; clear: boolean }
  | { type: "phase"; value: number | null };

export type FromArcWorker =
  | { type: "ready"; ok: boolean }
  | { type: "drawn"; gen: number }
  | { type: "stopped"; gen: number }
  | { type: "failed"; gen: number };
