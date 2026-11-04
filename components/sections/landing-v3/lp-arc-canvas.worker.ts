/**
 * LpArcCanvas's worker: owns the phone hero's canvas (transferControlToOffscreen)
 * and draws the rotation there, so the CPU-rasterized frames of a GPU-less
 * phone never block the page's main thread. Same bitmaps, same frame, same
 * budget as the main-thread renderer (lp-arc-draw.ts); the main thread keeps
 * every DOM decision (geometry, when to run, the artboard swap).
 */
import {
  type ArcGeometry,
  type FromArcWorker,
  type Ring,
  type ToArcWorker,
  MIN_FRAME_MS,
  POP_MS,
  drawRings,
  exceedsBudget,
  freshBudget,
  rasterizeRings,
  releaseRings,
} from "./lp-arc-draw";

interface WorkerScope {
  postMessage(message: FromArcWorker): void;
  onmessage: ((e: MessageEvent<ToArcWorker>) => void) | null;
  requestAnimationFrame?: (cb: (t: number) => void) => number;
  cancelAnimationFrame?: (id: number) => void;
}
const scope = self as unknown as WorkerScope;
const post = (m: FromArcWorker) => scope.postMessage(m);

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let geo: ArcGeometry | null = null;
let gen = 0;
let t0 = 0; // the main thread's clock epoch, as timeOrigin + now
let rings: Ring[] = [];
let base: DOMMatrix | null = null;
let running = false;
let drawn = false;
let stopped = false;
let phase: number | null = null;
let budget = freshBudget();
let raf = 0;
let timer = 0;

const clock = () => performance.timeOrigin + performance.now();

const cancel = () => {
  if (raf && scope.cancelAnimationFrame) scope.cancelAnimationFrame(raf);
  raf = 0;
  clearTimeout(timer);
  timer = 0;
};

const schedule = () => {
  if (raf || timer || !running || stopped) return;
  if (scope.requestAnimationFrame) raf = scope.requestAnimationFrame(tick);
  else timer = setTimeout(() => tick(performance.now()), 16) as unknown as number;
};

const release = (clear: boolean) => {
  cancel();
  releaseRings(rings);
  rings = [];
  base = null;
  if (clear && canvas) {
    canvas.width = 0;
    canvas.height = 0;
  }
};

/** Bitmaps for the current geometry (one-time vector rasterization). */
const build = (): boolean => {
  if (!canvas || !ctx || !geo) return false;
  canvas.width = geo.width;
  canvas.height = geo.height;
  const next = rasterizeRings(geo, (w, h) => new OffscreenCanvas(w, h));
  if (!next || !next.length) return false;
  rings = next;
  base = new DOMMatrix(geo.base);
  // (6 numbers → the same 2D matrix the main thread composed)
  budget = freshBudget(); // geometry creation is a one-time cost, not steady-state drawing
  return true;
};

function tick(_t: number) {
  raf = 0;
  timer = 0;
  // no geometry yet (or released): the main thread sends a fresh one first
  if (!running || stopped || !ctx || !canvas || !geo) return;
  if (!rings.length && !build()) {
    geo = null;
    post({ type: "failed", gen });
    return;
  }
  const now = performance.now();
  if (budget.lastDraw && now - budget.lastDraw < MIN_FRAME_MS) {
    schedule();
    return;
  }
  const at = clock();
  const cycle = phase !== null ? phase : ((at - t0) / 20000) % 1;
  const popP = phase !== null ? 1 : Math.min(1, (at - t0) / POP_MS);
  drawRings(ctx, canvas.width, canvas.height, base!, rings, cycle, popP);
  if (exceedsBudget(budget, now, performance.now() - now)) {
    stopped = true;
    running = false;
    release(true);
    post({ type: "stopped", gen });
    return;
  }
  if (!drawn) {
    drawn = true;
    post({ type: "drawn", gen }); // the main thread swaps the artboard for the canvas
  }
  schedule();
}

scope.onmessage = (e) => {
  const m = e.data;
  switch (m.type) {
    case "canvas":
      canvas = m.canvas;
      ctx = canvas.getContext("2d");
      if (!ctx) post({ type: "ready", ok: false }); // after the hand-over: the artboard stays
      break;
    case "geometry":
      // a new build: drop the old bitmaps, keep the visible frame until the next draw
      cancel();
      releaseRings(rings);
      rings = [];
      geo = m.geo;
      gen = m.gen;
      t0 = m.t0;
      drawn = false;
      if (running) tick(performance.now()); // the first frame now, not a frame later
      break;
    case "run":
      if (m.on === running) break;
      running = m.on && !stopped;
      if (running) {
        budget = freshBudget(); // hidden/off-stage time is never a slow frame
        tick(performance.now());
      } else cancel();
      break;
    case "release":
      // bitmaps go; the geometry too (it is re-read from the DOM on the way back)
      release(m.clear);
      geo = null;
      break;
    case "phase":
      phase = m.value;
      break;
  }
};

// Boot: the main thread hands the canvas over only to a worker that can draw it.
post({
  type: "ready",
  ok:
    typeof OffscreenCanvas === "function" &&
    typeof Path2D === "function" &&
    typeof DOMMatrix === "function" &&
    typeof new OffscreenCanvas(1, 1).getContext === "function",
});
