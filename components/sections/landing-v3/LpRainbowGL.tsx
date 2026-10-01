"use client";

import { useEffect, useRef } from "react";

/**
 * Rainbow renderer — WebGL, one canvas per art (hero, pricing, the two CTA
 * slivers), replacing the CSS cohort's per-ring composited layers. Desktop
 * since 2026-09-01; every width since 2026-09-02 (founder: "le même travail
 * de fluidité / anti-freeze sur mobile — quand on arrive en bas ça casse"):
 * the DOM rings are static at every width and this canvas is the only
 * motion; LpArcCanvas (the phone hero's bitmap renderer) yields to it on
 * handoff and remains the fallback.
 *
 * Why (2026-09-01, after a day of desktop-Safari failures): every rotating
 * ring was its own ~2400×2600px composited layer — six per section, ten in
 * the CTA — and real Macs choked on the standing GPU allocation (flicker,
 * square tiles, layer eviction of the H1, hover FX painting garbage).
 * Benchmarked three replacements with the live geometry: Canvas2D path
 * fills (what a Lottie canvas player does — CPU rasterization in WebKit,
 * cost grows with load), Canvas2D bitmap blits (drops frames in Chromium),
 * and WebGL meshes — flat CPU, trivial GPU work, tiny memory. WebGL won.
 *
 * Fidelity: nothing is re-derived. Each ring's path, viewBox, pose matrix,
 * layout offsets, spin direction and designed delay (the CTA-left −7.3s)
 * are read from the DOM that anim.css/LpPancakes already position, and the
 * canvas div's computed transform (fit / wide-screen scaleX) is applied as
 * is. The frame composes the same matrices the CSS version did. Ring paths
 * are flattened once in plain JS (~8 user units per segment — sub-0.02px
 * sagitta at these radii) and filled through the stencil buffer exactly
 * like the SVG renderer evaluates the path's evenodd rule; MSAA does the
 * edge anti-aliasing.
 *
 * Handoff: the canvas draws its first frame, THEN [data-lp-gl] on the art
 * hides the DOM rings. The static DOM artboard is the permanent fallback —
 * no WebGL2, context loss that does not recover, reduced motion, the
 * `?lp-nogl` kill switch, or a machine that measurably cannot hold the
 * loop (the governor below): [data-lp-gl-off] lands and the artboard shows.
 *
 * Firefox, round two (2026-09-02, founder: the page "freeze encore sur
 * Firefox" after the getPointAtLength fix of the day before). What Gecko
 * pays that Blink/WebKit do not, and what changed here:
 *  1. The fill did ~18 full-buffer 4×MSAA stencil passes per hero frame:
 *     a centroid fan over the outer contour, a second fan over the `hole`
 *     circle LpPancakes cuts for the DOM compositor, and a colour pass over
 *     ONE triangle twice the ring's bbox (the whole canvas), with a stencil
 *     reset on every sample. An Apple GPU keeps the stencil on-chip; an
 *     Intel/AMD iGPU is fill-bound at 20–40ms a frame, and in Firefox a
 *     late GPU stalls the compositor and the content main thread (every
 *     presented WebGL frame is a synchronous GetFrontBuffer IPC to the GPU
 *     process). Now each ring owns one stencil BIT (INVERT parity == the
 *     path's evenodd rule; ≤6 rings ≤ 8 bits, so nothing is ever reset),
 *     the hole subpath is not drawn at all, and the colour pass rasterises
 *     an ANNULUS from the hole radius outward instead of the canvas — the
 *     same pixels (the hole's interior is hidden under the next ring by
 *     construction, see LpPancakes.ArcSpec.hole) for ~4× less fill.
 *  2. Draws are capped at 60/s: on a 120 Hz ProMotion display every cost
 *     above doubled for a 0.15° step nobody can see (the loop turns
 *     18°/s; 60 Hz screens always showed 0.3°/frame).
 *  3. The four contexts were created — shaders compiled, MSAA buffers
 *     allocated (~640 MB), a first frame drawn — inside the hydration task,
 *     three of them for arts that then shrank to 1×1 a frame later. A
 *     context now exists only once its canvas comes within the observer
 *     margin, and the observer watches the CANVAS (the hero's visible
 *     61.96% band), not the un-clipped art: the hero stopped drawing ~760px
 *     late and pricing + both slivers drew concurrently for 584px of scroll.
 *  4. Off-stage the drawing buffer shrank to 1×1 at once and re-allocated
 *     its MSAA surfaces on re-entry — a fling or a scroll bounce across a
 *     section edge was a 250–330 MB GPU allocation each way. The release is
 *     now deferred (SHRINK_DELAY_MS) and cancelled by a return.
 *  5. `failIfMajorPerformanceCaveat` is a no-op in Firefox ≥ 86 (pref
 *     webgl.disable-fail-if-major-performance-caveat): under software
 *     WebRender (hardware acceleration off, blocklisted driver, remote
 *     desktop) Firefox still hands out a hardware WebGL whose every frame is
 *     read back into the CPU compositor — 23 MB per hero frame. A governor
 *     now decides for real: a software renderer string bails at init, and a
 *     loop that cannot sustain 12 fps for two consecutive 2s windows
 *     degrades every art to the static artboard for the session
 *     (sessionStorage "lp-gl" = "off"; `?lp-gl=force` bypasses it).
 *  6. Context loss (GPU-process restart, driver reset): Gecko restores a
 *     lost context at most once, and only if the GPU process is already
 *     back — otherwise the canvas is lost for good. The renderer now falls
 *     back to the artboard immediately AND retries on a fresh canvas element
 *     with backoff, so the rotation comes back instead of staying frozen at
 *     the artboard pose for the rest of the visit.
 *  7. `powerPreference: "low-power"` could put the context on the other GPU
 *     of a dual-GPU MacBook Pro, forcing a per-frame surface copy; six
 *     flat-colour meshes need no hint.
 */

type Variant = "hero" | "pricing" | "ctaLeft" | "ctaRight";

const SEL: Record<Variant, { canvas: string; box: string }> = {
  hero: { canvas: ".lp-anim-canvas--hero", box: ".lp-anim-box--hero" },
  pricing: { canvas: ".lp-anim-canvas--pricing", box: ".lp-anim-box--pricing" },
  ctaLeft: { canvas: ".lp-anim-canvas--cta-left", box: ".lp-anim-box--cta-left" },
  ctaRight: { canvas: ".lp-anim-canvas--cta-right", box: ".lp-anim-box--cta-right" },
};

const LOOP_MS = 20000; // the Figma master loop
const POP_START = { w: 2440.574, h: 2381.047 }; // lp-anim-pop 0% keyframe
const POP_MS = 500;
const MAX_DPR = 2;
const MIN_SAMPLES = 256;
const MAX_SAMPLES = 2048;
const CHORD = 8; // user units per flattened segment (sub-0.02px sagitta here)
const MIN_FRAME_MS = 14; // ≤ 60 draws/s (a 16.7ms period never skips; 8.3ms draws every other tick)
const SHRINK_DELAY_MS = 1000; // off-stage grace before the drawing buffer is released
// Desktop: one frame is drawn this far ahead of the loop's margin, so a fast
// scroll never meets the art's section before its first frame (2026-09-30:
// pricing showed its black band, title unreadable, for two frames). Phones
// already run the loop from 75 %.
const WARM_MARGIN = "100% 0%";
const ANNULUS_SEGMENTS = 180; // inner edge of the colour pass (chord error 0.4px at r 1200, under the next ring)
const GOVERNOR_WINDOW_MS = 2000;
const GOVERNOR_MIN_FRAMES = 24; // < 12 fps sustained …
const GOVERNOR_LONG_MS = 40; // … with more than a third of the frames slower than this …
const GOVERNOR_LONG_RATIO = 0.35;
const GOVERNOR_STRIKES = 2; // … for two consecutive windows → static artboard for the session
const GOVERNOR_WARMUP_MS = 1500; // first frames after boot (pop settle, hydration) are not judged
const RECOVER_DELAYS_MS = [800, 2500, 6000]; // fresh-canvas retries after a context loss

interface Mesh {
  vao: WebGLVertexArrayObject;
  vbuf: WebGLBuffer;
  /** [first, count] of the stencil fans (one per subpath drawn) */
  fans: [number, number][];
  /** colour pass: first vertex, count, primitive mode */
  cover: [number, number, number];
}

interface Ring {
  poseX: number;
  poseY: number;
  poseW: number;
  poseH: number;
  pose: DOMMatrix;
  dir: 1 | -1;
  delayMs: number;
  mesh: Mesh;
  color: [number, number, number, number];
  path: SVGPathElement;
  viewW: number;
  viewH: number;
  fillW: number;
  fillH: number;
  isPop: boolean;
}

/** `?lp-nogl` — kill switch: no WebGL anywhere (static artboard; phones
    keep the LpArcCanvas hero). `?lp-gl=force` — no governor (measurements
    on a machine that would otherwise degrade). */
const query = () => (typeof location !== "undefined" ? new URLSearchParams(location.search) : null);
const killSwitch = () => query()?.has("lp-nogl") ?? false;
const forceGL = () => query()?.get("lp-gl") === "force";
const SESSION_KEY = "lp-gl";

/** Page-wide verdict shared by the four instances: once one of them finds
    WebGL unusable (no context, a software renderer, a loop that cannot keep
    up), the others show the artboard at once instead of finding out one by
    one. Persisted for the session so a reload does not re-run the trial. */
let verdict: "unknown" | "off" = "unknown";
const offHandlers = new Set<() => void>();
const readVerdict = (): "unknown" | "off" => {
  if (verdict === "off") return "off";
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "off") verdict = "off";
  } catch {
    /* storage may be unavailable (privacy modes) — the in-memory verdict stands */
  }
  return verdict;
};
const declareOff = () => {
  verdict = "off";
  try {
    sessionStorage.setItem(SESSION_KEY, "off");
  } catch {
    /* see above */
  }
  offHandlers.forEach((fn) => fn());
};

const SOFTWARE_GL = /swiftshader|llvmpipe|softpipe|software|basic render|warp\b|mesa offscreen/i;

/** Ring outline → one flattened polygon PER SUBPATH. The LpPancakes rings
    are annuli: a hand-drawn outer contour plus an inner circle drawn with
    an `A` arc, two subpaths in one `d`; the fill rule then combines them
    exactly like the SVG renderer does. Sampling them as one outline would
    bridge the two with a chord — a hairline crack through every band (found
    the hard way, 2026-09-01). Flattened once per distinct `d` for the life
    of the page (the six ring paths are shared by every art). */
const FLAT = new Map<string, number[][] | null>();
function flatten(d: string): number[][] | null {
  let polys = FLAT.get(d);
  if (polys === undefined) {
    polys = flattenPath(d) ?? sampleSubpaths(d);
    FLAT.set(d, polys);
  }
  return polys;
}

/** Plain-JS path flattener: M L H V C S A Z (absolute and relative) — the
    whole vocabulary of the ring exports and of LpPancakes.withHole. Cubics
    are stepped at ~CHORD units of control-polygon length, arcs by angle at
    the same chord; anything else (Q/T) returns null and the DOM sampler
    below takes over. Pure arithmetic: microseconds, in every engine. */
function flattenPath(d: string): number[][] | null {
  const tok = d.match(/[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi);
  if (!tok) return null;
  const polys: number[][] = [];
  let cur: number[] | null = null;
  let cmd = "";
  let i = 0;
  let x = 0, y = 0, sx = 0, sy = 0, px = 0, py = 0;
  const num = () => {
    const v = parseFloat(tok[i++]);
    if (!Number.isFinite(v)) throw new Error("path");
    return v;
  };
  const push = (nx: number, ny: number) => {
    if (!cur) {
      cur = [x, y];
      polys.push(cur);
    }
    cur.push(nx, ny);
    x = nx;
    y = ny;
  };
  const cubic = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => {
    const x0 = x, y0 = y;
    const len = Math.hypot(x1 - x0, y1 - y0) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x3 - x2, y3 - y2);
    const n = Math.min(512, Math.max(8, Math.ceil(len / CHORD)));
    for (let k = 1; k <= n; k++) {
      const t = k / n, u = 1 - t;
      const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t;
      push(a * x0 + b * x1 + c * x2 + e * x3, a * y0 + b * y1 + c * y2 + e * y3);
    }
    px = x2;
    py = y2;
  };
  // SVG implementation notes F.6.5: endpoint → center parameterization
  const arc = (rx: number, ry: number, deg: number, fa: number, fs: number, x2: number, y2: number) => {
    const x1 = x, y1 = y;
    if (x1 === x2 && y1 === y2) return;
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    if (!rx || !ry) return push(x2, y2);
    const phi = (deg * Math.PI) / 180, cs = Math.cos(phi), sn = Math.sin(phi);
    const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
    const x1p = cs * dx + sn * dy, y1p = -sn * dx + cs * dy;
    const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
    if (lam > 1) {
      rx *= Math.sqrt(lam);
      ry *= Math.sqrt(lam);
    }
    const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
    const coef = (fa !== fs ? 1 : -1) * Math.sqrt(Math.max(0, (rx * rx * ry * ry - den) / den));
    const cxp = (coef * rx * y1p) / ry, cyp = (-coef * ry * x1p) / rx;
    const cx = cs * cxp - sn * cyp + (x1 + x2) / 2, cy = sn * cxp + cs * cyp + (y1 + y2) / 2;
    const ang = (ux: number, uy: number, vx: number, vy: number) => {
      const s = Math.sign(ux * vy - uy * vx) || 1;
      return s * Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy)))));
    };
    const ux = (x1p - cxp) / rx, uy = (y1p - cyp) / ry;
    const t1 = ang(1, 0, ux, uy);
    let dt = ang(ux, uy, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
    if (!fs && dt > 0) dt -= 2 * Math.PI;
    else if (fs && dt < 0) dt += 2 * Math.PI;
    const n = Math.min(2048, Math.max(4, Math.ceil((Math.abs(dt) * Math.max(rx, ry)) / CHORD)));
    for (let k = 1; k <= n; k++) {
      const t = t1 + (dt * k) / n, ct = Math.cos(t), st = Math.sin(t);
      push(cx + rx * ct * cs - ry * st * sn, cy + rx * ct * sn + ry * st * cs);
    }
  };
  try {
    while (i < tok.length) {
      const t = tok[i];
      if (/[A-Za-z]/.test(t)) {
        cmd = t;
        i++;
        if (cmd === "Z" || cmd === "z") {
          cur = null;
          x = px = sx;
          y = py = sy;
          continue;
        }
      } else if (!cmd) return null;
      const rel = cmd === cmd.toLowerCase();
      switch (cmd.toUpperCase()) {
        case "M": {
          let nx = num(), ny = num();
          if (rel) { nx += x; ny += y; }
          cur = [nx, ny];
          polys.push(cur);
          x = sx = px = nx;
          y = sy = py = ny;
          cmd = rel ? "l" : "L";
          break;
        }
        case "L": {
          let nx = num(), ny = num();
          if (rel) { nx += x; ny += y; }
          push(nx, ny);
          px = x; py = y;
          break;
        }
        case "H": {
          let nx = num();
          if (rel) nx += x;
          push(nx, y);
          px = x; py = y;
          break;
        }
        case "V": {
          let ny = num();
          if (rel) ny += y;
          push(x, ny);
          px = x; py = y;
          break;
        }
        case "C": {
          let x1 = num(), y1 = num(), x2 = num(), y2 = num(), x3 = num(), y3 = num();
          if (rel) { x1 += x; y1 += y; x2 += x; y2 += y; x3 += x; y3 += y; }
          cubic(x1, y1, x2, y2, x3, y3);
          break;
        }
        case "S": {
          let x2 = num(), y2 = num(), x3 = num(), y3 = num();
          if (rel) { x2 += x; y2 += y; x3 += x; y3 += y; }
          cubic(2 * x - px, 2 * y - py, x2, y2, x3, y3);
          break;
        }
        case "A": {
          const rx = num(), ry = num(), deg = num(), fa = num(), fs = num();
          let x2 = num(), y2 = num();
          if (rel) { x2 += x; y2 += y; }
          arc(rx, ry, deg, fa, fs, x2, y2);
          px = x; py = y;
          break;
        }
        default:
          return null;
      }
    }
  } catch {
    return null;
  }
  const out = polys.filter((p) => p.length >= 6);
  return out.length ? out : null;
}

/** Fallback flattener through a scratch SVGPathElement (any command the
    browser knows). Slow in Gecko (see header) — only ever reached for a
    path vocabulary the JS flattener does not cover. */
function sampleSubpaths(d: string): number[][] | null {
  const pieces = d.split(/(?=[Mm])/).map((s) => s.trim()).filter(Boolean);
  if (!pieces.length) return null;
  const scratch = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const polys: number[][] = [];
  for (const piece of pieces) {
    scratch.setAttribute("d", piece);
    const len = scratch.getTotalLength();
    if (!(len > 0)) continue;
    const n = Math.min(MAX_SAMPLES, Math.max(MIN_SAMPLES, Math.round(len / CHORD)));
    const out: number[] = [];
    for (let k = 0; k < n; k++) {
      const pt = scratch.getPointAtLength((k / n) * len);
      if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) return null;
      out.push(pt.x, pt.y);
    }
    polys.push(out);
  }
  return polys.length ? polys : null;
}

/** Outline → the primitives of a stencil polygon fill. Pass 1 draws a fan
    from the centroid over the outer contour; with INVERT on one stencil
    bit every sample ends with the outline's parity — the SVG evenodd rule,
    exact for the hand-drawn contours (neither star-shaped nor free of
    self-overlap, which a plain triangulation got wrong). Pass 2 colours
    where the bit is set: for a ring with a `hole` that is an ANNULUS from
    the hole radius out to the bbox (the hole subpath itself is never
    drawn — the interior it would cut is hidden under the next ring by
    construction); a ring without a hole gets its bbox as two triangles.
    No stencil write happens in pass 2, so shared edges cannot seam. */
function meshFor(
  polys: number[][],
  hole: number,
  cx: number,
  cy: number,
): { verts: number[]; fans: [number, number][]; cover: [number, number, number] } {
  const verts: number[] = [];
  const fans: [number, number][] = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  // the hole circle, when present, is the subpath whose points all sit at
  // the hole radius from the ring's centre — skip it
  const outline = hole > 0
    ? polys.filter((poly) => {
        for (let i = 0; i < poly.length; i += 2) {
          if (Math.abs(Math.hypot(poly[i] - cx, poly[i + 1] - cy) - hole) > 2) return true;
        }
        return false;
      })
    : polys;
  for (const poly of outline.length ? outline : polys) {
    const n = poly.length / 2;
    let sx = 0, sy = 0;
    for (let i = 0; i < n; i++) {
      const x = poly[2 * i], y = poly[2 * i + 1];
      sx += x; sy += y;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    const start = verts.length / 2;
    verts.push(sx / n, sy / n, ...poly, poly[0], poly[1]);
    fans.push([start, verts.length / 2 - start]);
  }
  const first = verts.length / 2;
  if (hole > 0 && outline.length) {
    // annulus strip: inner ring ON the hole circle, outer ring past the bbox corners
    const R = Math.hypot(Math.max(maxX - cx, cx - minX), Math.max(maxY - cy, cy - minY)) + 4;
    for (let k = 0; k <= ANNULUS_SEGMENTS; k++) {
      const a = (k / ANNULUS_SEGMENTS) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      verts.push(cx + hole * c, cy + hole * s, cx + R * c, cy + R * s);
    }
    return { verts, fans, cover: [first, verts.length / 2 - first, WebGL2RenderingContext.TRIANGLE_STRIP] };
  }
  const x0 = minX - 2, y0 = minY - 2, x1 = maxX + 2, y1 = maxY + 2;
  verts.push(x0, y0, x1, y0, x0, y1, x0, y1, x1, y0, x1, y1);
  return { verts, fans, cover: [first, 6, WebGL2RenderingContext.TRIANGLES] };
}

function rgba(fill: string): [number, number, number, number] | null {
  const hex = fill.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
  }
  const rgb = fill.match(/rgba?\(([^)]+)\)/);
  if (rgb) {
    const [r, g, b] = rgb[1].split(",").map((v) => parseFloat(v));
    return [r / 255, g / 255, b / 255, 1];
  }
  return null;
}

const VS = `#version 300 es
layout(location = 0) in vec2 p;
uniform mat3 m;
void main() { vec3 q = m * vec3(p, 1.0); gl_Position = vec4(q.xy, 0.0, 1.0); }`;
const FS = `#version 300 es
precision mediump float;
uniform vec4 col;
out vec4 o;
void main() { o = col; }`;

export function LpRainbowGL({ variant }: { variant: Variant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reactCanvas = canvasRef.current;
    const art = reactCanvas?.parentElement;
    if (!reactCanvas || !art) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const sel = SEL[variant];
    const phone = matchMedia("(max-width: 767px)").matches;
    const governed = !forceGL();

    // the canvas in use: React's, or a fresh element after a context loss
    let canvas: HTMLCanvasElement = reactCanvas;
    let gl: WebGL2RenderingContext | null = null;
    let prog: WebGLProgram | null = null;
    let uM: WebGLUniformLocation | null = null;
    let uC: WebGLUniformLocation | null = null;
    let rings: Ring[] = [];
    // GPU geometry per distinct path, kept for the life of the context: a
    // rebuild (scroll-return, resize) re-reads the DOM but uploads nothing
    let meshes = new Map<string, Mesh>();
    let base = new DOMMatrix();
    let scissor: [number, number, number, number] | null = null;
    let dpr = 1;
    let raf = 0;
    let near = false; // within the observer margin → the loop runs
    let warm = false; // one frame requested ahead of that margin (desktop)
    let live = false; // [data-lp-gl] is on: the canvas is the render
    let disposed = false;
    let lost = false;
    let off = false; // this instance is on the artboard for good
    let popT0 = 0;
    // Phase clock anchored at THIS art's first drawn frame: cycle 0 == the
    // static artboard the DOM shows until the handoff, so the swap is
    // continuous even when it happens on screen (fast fling), and the two
    // CTA slivers — booting in the same frame — keep their −7.3s offset.
    let t0 = 0;
    let builtW = 0;
    let builtH = 0;
    let resizeTimer = 0;
    let shrinkTimer = 0;
    let recoverTimer = 0;
    let recoverAttempt = 0;
    let lastDraw = 0;
    // governor window (see header, 5)
    let bootAt = 0;
    let winStart = 0;
    let winFrames = 0;
    let winLong = 0;
    let strikes = 0;

    const dropMeshes = () => {
      const g = gl;
      if (g && !g.isContextLost()) {
        meshes.forEach((m) => {
          g.deleteVertexArray(m.vao);
          g.deleteBuffer(m.vbuf);
        });
      }
      meshes = new Map();
      rings = [];
    };

    const initGL = (): boolean => {
      gl = canvas.getContext("webgl2", {
        antialias: true,
        alpha: true,
        depth: false,
        premultipliedAlpha: true,
        stencil: true,
        powerPreference: "default",
        // honoured by Blink (a SwiftShader GL is worse than the artboard);
        // a no-op in Gecko — the renderer-string check below covers it
        failIfMajorPerformanceCaveat: true,
      });
      if (!gl || gl.isContextLost()) return false;
      if (governed) {
        const dbg = gl.getExtension("WEBGL_debug_renderer_info");
        const renderer = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
        if (SOFTWARE_GL.test(renderer)) return false;
      }
      const sh = (type: number, src: string) => {
        const h = gl!.createShader(type)!;
        gl!.shaderSource(h, src);
        gl!.compileShader(h);
        return h;
      };
      prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      // one synchronous status query (a link failure covers compile
      // failures) — in Gecko every value-returning GL call is a sync IPC
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);
      uM = gl.getUniformLocation(prog, "m");
      uC = gl.getUniformLocation(prog, "col");
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.STENCIL_TEST);
      gl.disable(gl.CULL_FACE);
      art.removeAttribute("data-lp-gl-off");
      return true;
    };

    /** Geometry + sizing from the live DOM. False = not ready yet, retry. */
    const build = (): boolean => {
      if (!gl) return false;
      const cdiv = art.querySelector<HTMLElement>(sel.canvas);
      const box = cdiv?.querySelector<HTMLElement>(sel.box);
      if (!cdiv || !box || !art.style.getPropertyValue("--lp-fit")) return false;
      const cdivT = getComputedStyle(cdiv).transform;
      if (!cdivT || cdivT === "none") return false;
      const fit = new DOMMatrix(cdivT); // transform-origin 0 0 (anim.css)
      const axisAligned = Math.abs(fit.b) < 1e-6 && Math.abs(fit.c) < 1e-6;
      // the ring box (.lp-anim-box, overflow:clip) in art space
      const bp0 = fit.transformPoint(new DOMPoint(box.offsetLeft, box.offsetTop));
      const bp1 = fit.transformPoint(new DOMPoint(box.offsetLeft + box.offsetWidth, box.offsetTop + box.offsetHeight));
      const bx0 = Math.min(bp0.x, bp1.x), bx1 = Math.max(bp0.x, bp1.x);
      const by0 = Math.min(bp0.y, bp1.y), by1 = Math.max(bp0.y, bp1.y);

      // Canvas placement in art space. Hero / pricing: the art rect itself
      // (CSS: inset 0, hero 61.96%). CTA slivers: the box spills far outside
      // the art rect and the CARD (overflow:hidden) is the real clip — on
      // desktop the card cuts exactly at the art, but on phones the arts are
      // rotated 90° into the card (cta.css) and the spilled ink lands inside
      // it: part of the mobile artboard, so the canvas must cover box ∩ card,
      // mapped into art space through the art's own transform (origin 0 0).
      let vx = 0, vy = 0;
      const clipEl = variant === "ctaLeft" || variant === "ctaRight" ? art.offsetParent : null;
      if (clipEl instanceof HTMLElement) {
        const artT = getComputedStyle(art).transform;
        const inv = (artT && artT !== "none" ? new DOMMatrix(artT) : new DOMMatrix()).inverse();
        const ox = art.offsetLeft, oy = art.offsetTop;
        const cs = [[0, 0], [clipEl.clientWidth, 0], [0, clipEl.clientHeight], [clipEl.clientWidth, clipEl.clientHeight]]
          .map(([x, y]) => inv.transformPoint(new DOMPoint(x - ox, y - oy)));
        const rx0 = Math.max(bx0, Math.min(...cs.map((c) => c.x))), rx1 = Math.min(bx1, Math.max(...cs.map((c) => c.x)));
        const ry0 = Math.max(by0, Math.min(...cs.map((c) => c.y))), ry1 = Math.min(by1, Math.max(...cs.map((c) => c.y)));
        if (!(rx1 - rx0 > 1 && ry1 - ry0 > 1)) return false;
        vx = rx0;
        vy = ry0;
        canvas.style.left = `${rx0}px`;
        canvas.style.top = `${ry0}px`;
        canvas.style.width = `${rx1 - rx0}px`;
        canvas.style.height = `${ry1 - ry0}px`;
      }

      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (!(cw > 0 && ch > 0)) return false;

      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const bw = Math.round(cw * dpr);
      const bh = Math.round(ch * dpr);
      if (canvas.width !== bw) canvas.width = bw;
      if (canvas.height !== bh) canvas.height = bh;
      gl.viewport(0, 0, bw, bh);

      // device px → clip space, then art-space (CSS px) → device px
      const proj = new DOMMatrix([2 / bw, 0, 0, -2 / bh, -1, 1]);
      base = proj.multiply(new DOMMatrix().scale(dpr)).multiply(new DOMMatrix().translate(-vx, -vy)).multiply(fit);

      // the Figma group clip as a scissor rect when the fit matrix is
      // axis-aligned (desktop: scale / scaleX; every CTA). The phone hero's
      // fit carries rotate(15°)·flipX — a rect can't express that clip, and
      // the art's own clip-path already bounds the visible ink there
      // (LpArcCanvas never clipped either): no scissor.
      if (axisAligned) {
        const sx = Math.max(0, Math.floor((bx0 - vx) * dpr));
        const sy = Math.max(0, Math.floor((by0 - vy) * dpr));
        const ex = Math.min(bw, Math.ceil((bx1 - vx) * dpr));
        const ey = Math.min(bh, Math.ceil((by1 - vy) * dpr));
        scissor = [sx, bh - ey, Math.max(0, ex - sx), Math.max(0, ey - sy)];
      } else {
        scissor = null;
      }

      const next: Ring[] = [];
      for (const arc of Array.from(box.querySelectorAll<HTMLElement>(".lp-anim-arc"))) {
        const pose = arc.querySelector<HTMLElement>(".lp-anim-pose");
        const spin = arc.querySelector<HTMLElement>(".lp-anim-spin");
        const svg = arc.querySelector<SVGSVGElement>("svg");
        const pathEl = svg?.querySelector("path");
        if (!pose || !spin || !svg || !pathEl) return false;
        const poseT = getComputedStyle(pose).transform;
        const vb = svg.viewBox.baseVal;
        const color = rgba(getComputedStyle(pathEl).fill);
        if (!poseT || poseT === "none" || !vb || !(vb.width > 0) || !color) return false;
        const d = pathEl.getAttribute("d");
        if (!d) return false;
        let mesh = meshes.get(d);
        if (!mesh) {
          const polys = flatten(d);
          if (!polys) return false;
          const hole = parseFloat(pathEl.getAttribute("data-lp-hole") || "") || 0;
          const m = meshFor(polys, hole, vb.width / 2, vb.height / 2);
          const vao = gl.createVertexArray();
          const vbuf = gl.createBuffer();
          if (!vao || !vbuf) return false;
          gl.bindVertexArray(vao);
          gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(m.verts), gl.STATIC_DRAW);
          gl.enableVertexAttribArray(0);
          gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
          gl.bindVertexArray(null);
          mesh = { vao, vbuf, fans: m.fans, cover: m.cover };
          meshes.set(d, mesh);
        }
        const spinCs = getComputedStyle(spin);
        const isPop = svg.classList.contains("lp-anim-pop");
        const scs = getComputedStyle(svg);
        if (isPop) {
          // continue the CSS entrance settle from wherever it is when a DOM
          // pop is running (none at any width since 2026-09-02 — Gecko
          // reflowed and re-rasterised a 2400px ring on every frame of it);
          // otherwise the first build plays it from now, later rebuilds are
          // settled
          const a = typeof svg.getAnimations === "function"
            ? svg.getAnimations().find((k) => (k as CSSAnimation).animationName === "lp-anim-pop")
            : undefined;
          if (a && typeof a.currentTime === "number") popT0 = performance.now() - a.currentTime;
          else if (!popT0) popT0 = performance.now();
        }
        next.push({
          poseX: box.offsetLeft + arc.offsetLeft + pose.offsetLeft,
          poseY: box.offsetTop + arc.offsetTop + pose.offsetTop,
          poseW: pose.offsetWidth,
          poseH: pose.offsetHeight,
          pose: new DOMMatrix(poseT),
          dir: spin.classList.contains("lp-anim-spin--ccw") ? -1 : 1,
          // the designed phase offset (CTA-left −7.3s). --lp-phase, not
          // animation-delay: the desktop static rules and the handoff both
          // set `animation: none`, and that shorthand resets the delay to
          // 0s — reading it made every rebuild re-mirror the two slivers
          delayMs:
            (parseFloat(spinCs.getPropertyValue("--lp-phase")) || parseFloat(spinCs.animationDelay) || 0) * 1000,
          mesh,
          color,
          path: pathEl,
          viewW: vb.width,
          viewH: vb.height,
          fillW: isPop ? parseFloat(scs.width) : pose.offsetWidth,
          fillH: isPop ? parseFloat(scs.height) : pose.offsetHeight,
          isPop,
        });
      }
      if (!next.length) return false;
      rings = next;
      builtW = art.offsetWidth;
      builtH = art.offsetHeight;
      if (!popT0) popT0 = performance.now();
      return true;
    };

    const easeOut = (x: number) => 1 - (1 - x) * (1 - x);

    const frame = () => {
      raf = 0;
      // ahead = the single frame drawn before the loop's margin: the static
      // pose (cycle 0, pop done), exactly what the loop's first frame draws
      const ahead = !near;
      if (disposed || lost || off || (ahead && !warm) || document.hidden || !gl) return;
      if (!rings.length && !build()) {
        raf = requestAnimationFrame(frame); // LpFitVars not there yet — retry
        return;
      }
      const now = performance.now();
      // ≤ 60 draws/s (see header, 2); the phase clock keeps running
      if (!ahead && lastDraw && now - lastDraw < MIN_FRAME_MS) {
        raf = requestAnimationFrame(frame);
        return;
      }
      if (!ahead) {
        if (!t0) t0 = now;
        if (!bootAt) bootAt = now;
      }
      // test hook: freeze the clock at a cycle fraction (gates only);
      // designed delays still apply, so hook 0 == the static artboard incl.
      // the CTA-left ±131.4° de-mirror
      const hook = (window as unknown as { __lpArcPhase?: number }).__lpArcPhase;
      const elapsed = typeof hook === "number" ? hook * LOOP_MS : ahead ? 0 : now - t0;
      const popP = typeof hook === "number" || ahead ? 1 : Math.min(1, (now - popT0) / POP_MS);

      gl.stencilMask(0xff);
      gl.clearColor(0, 0, 0, 0);
      gl.disable(gl.SCISSOR_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
      if (scissor) {
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(scissor[0], scissor[1], scissor[2], scissor[3]);
      }
      for (let k = 0; k < rings.length; k++) {
        const r = rings[k];
        const cycle = ((((elapsed - r.delayMs) % LOOP_MS) + LOOP_MS) % LOOP_MS) / LOOP_MS;
        let w = r.fillW;
        let h = r.fillH;
        if (r.isPop && popP < 1) {
          const e = easeOut(popP);
          w = POP_START.w + (r.fillW - POP_START.w) * e;
          h = POP_START.h + (r.fillH - POP_START.h) * e;
        }
        const cx = r.poseW / 2;
        const cy = r.poseH / 2;
        const m = base
          .translate(r.poseX + cx, r.poseY + cy)
          .multiply(r.pose)
          .rotate(r.dir * cycle * 360)
          .translate(-cx, -cy)
          .translate((r.poseW - w) / 2, (r.poseH - h) / 2)
          .scale(w / r.viewW, h / r.viewH);
        gl.uniformMatrix3fv(uM, false, [m.a, m.b, 0, m.c, m.d, 0, m.e, m.f, 1]);
        gl.uniform4fv(uC, r.color);
        gl.bindVertexArray(r.mesh.vao);
        // one stencil bit per ring (see header, 1); an eighth+ ring — never
        // built, six is the max — would restart on a cleared buffer
        if (k && k % 8 === 0) {
          gl.stencilMask(0xff);
          gl.clear(gl.STENCIL_BUFFER_BIT);
        }
        const bit = 1 << k % 8;
        // pass 1 — the outline's parity into this ring's bit (no colour)
        gl.colorMask(false, false, false, false);
        gl.stencilMask(bit);
        gl.stencilFunc(gl.ALWAYS, 0, 0xff);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);
        for (const [start, count] of r.mesh.fans) gl.drawArrays(gl.TRIANGLE_FAN, start, count);
        // pass 2 — colour where the bit is set, writing no stencil
        gl.colorMask(true, true, true, true);
        gl.stencilMask(0);
        gl.stencilFunc(gl.NOTEQUAL, 0, bit);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        gl.drawArrays(r.mesh.cover[2], r.mesh.cover[0], r.mesh.cover[1]);
      }
      gl.bindVertexArray(null);
      if (!live) {
        live = true;
        art.setAttribute("data-lp-gl", ""); // first frame drew — swap
      }
      if (ahead) {
        warm = false; // drawn ahead; the loop waits for its own margin
        return;
      }
      // governor (see header, 5): a loop that cannot keep 12 fps for two
      // consecutive windows means the GPU (or its readback) is the
      // bottleneck — every art goes static for the session
      if (governed && lastDraw) {
        const d = now - lastDraw;
        winFrames++;
        if (d > GOVERNOR_LONG_MS) winLong++;
        if (now - winStart >= GOVERNOR_WINDOW_MS) {
          if (now - bootAt > GOVERNOR_WARMUP_MS + GOVERNOR_WINDOW_MS && winFrames < GOVERNOR_MIN_FRAMES && winLong / winFrames > GOVERNOR_LONG_RATIO) {
            strikes++;
          } else {
            strikes = 0;
          }
          winStart = now;
          winFrames = 0;
          winLong = 0;
          if (strikes >= GOVERNOR_STRIKES) {
            lastDraw = now;
            declareOff();
            return;
          }
        }
      }
      lastDraw = now;
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (warm && raf) {
        // a frame-ahead request is superseded by the loop itself
        cancelAnimationFrame(raf);
        raf = 0;
        warm = false;
      }
      if (raf || disposed || lost || off) return;
      if (reduced.matches || !near || document.hidden) return;
      if (!gl && !initGL()) {
        // no usable WebGL2 — the static artboard stays, for every art
        declareOff();
        return;
      }
      if (live && canvas.width === 1) {
        // back on stage: restore the drawing buffer (was released off-stage);
        // the meshes stay — the rebuild is DOM reads only
        rings = [];
      }
      lastDraw = 0;
      winStart = performance.now();
      winFrames = 0;
      winLong = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      warm = false;
    };
    // Desktop, within a viewport of the art: create the context and draw the
    // static pose once, so the canvas is the render before the section shows.
    // No boot pop for an art drawn unseen (it would replay on the loop's
    // first frames); the buffer is released like the loop's, off stage.
    const warmUp = () => {
      if (phone || near || raf || disposed || lost || off) return;
      if (reduced.matches || document.hidden) return;
      if (live && canvas.width !== 1) return; // it already holds its frame
      if (!gl && !initGL()) {
        declareOff();
        return;
      }
      if (live) rings = []; // the buffer was released off stage: rebuild
      if (!popT0) popT0 = performance.now() - POP_MS;
      warm = true;
      raf = requestAnimationFrame(frame);
    };
    const warmIo = phone
      ? null
      : new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              warmUp();
              return;
            }
            if (near) return;
            clearTimeout(shrinkTimer);
            shrinkTimer = window.setTimeout(() => {
              if (near || disposed) return;
              if (gl && live && canvas.width !== 1) {
                canvas.width = 1;
                canvas.height = 1;
              }
            }, SHRINK_DELAY_MS);
          },
          { rootMargin: WARM_MARGIN },
        );
    const restoreDom = () => {
      stop();
      live = false;
      art.removeAttribute("data-lp-gl");
      art.setAttribute("data-lp-gl-off", ""); // the artboard shows (anim.css)
    };
    const goOff = () => {
      // this session's verdict (or a permanent loss): artboard, buffers freed
      off = true;
      clearTimeout(shrinkTimer);
      clearTimeout(recoverTimer);
      restoreDom();
      dropMeshes();
      if (canvas.width !== 1) {
        canvas.width = 1;
        canvas.height = 1;
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        near = entries.some((e) => e.isIntersecting);
        clearTimeout(shrinkTimer);
        if (near) start();
        else {
          stop();
          // release the (MSAA) drawing buffer once the art has really gone
          // — not on a scroll bounce across the margin (see header, 4)
          shrinkTimer = window.setTimeout(() => {
            if (near || disposed) return;
            if (gl && live && canvas.width !== 1) {
              canvas.width = 1;
              canvas.height = 1;
            }
          }, SHRINK_DELAY_MS);
        }
      },
      // observed: the CANVAS (the hero's visible band; the CTA's box ∩
      // card), not the art. Phones keep the 0.75-viewport slack LpAnimFreeze
      // proved — a fling at ~100px/frame must not reach a released canvas
      // (ring-less art for a frame or two: the 2026-08-31 "missing CTA band"
      // look). Desktop keeps the tighter margin (bigger buffers).
      { rootMargin: phone ? "75% 0%" : "25% 0%" },
    );
    // relayout → rebuild, but only when the art actually changed size (the
    // observer also fires once on observe, and on every off-stage/on-stage
    // visibility flip in some engines), and settled — a live drag resize
    // would otherwise rebuild every frame
    const relayout = () => {
      if (art.offsetWidth === builtW && art.offsetHeight === builtH) return;
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        rings = [];
        start();
      }, 120);
    };
    const ro = new ResizeObserver(relayout);
    // zoom / monitor change: the buffer scale follows devicePixelRatio
    let dprMq = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const onDpr = () => {
      dprMq.removeEventListener("change", onDpr);
      dprMq = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      dprMq.addEventListener("change", onDpr);
      rings = [];
      start();
    };
    const onMedia = () => {
      if (!reduced.matches) start();
      else restoreDom();
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    // Context loss (see header, 6): the artboard shows at once; the same
    // context may come back (webglcontextrestored) — if it does not, a
    // fresh canvas element gets a fresh context, with backoff
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      meshes = new Map(); // GPU objects died with the context
      rings = [];
      restoreDom();
      scheduleRecover();
    };
    const onRestored = () => {
      if (disposed || !lost) return;
      clearTimeout(recoverTimer);
      lost = false;
      gl = null;
      if (initGL()) start();
      else scheduleRecover();
    };
    const listen = (c: HTMLCanvasElement) => {
      c.addEventListener("webglcontextlost", onLost);
      c.addEventListener("webglcontextrestored", onRestored);
      io.observe(c);
      warmIo?.observe(c);
    };
    const unlisten = (c: HTMLCanvasElement) => {
      c.removeEventListener("webglcontextlost", onLost);
      c.removeEventListener("webglcontextrestored", onRestored);
      io.unobserve(c);
      warmIo?.unobserve(c);
    };
    const scheduleRecover = () => {
      clearTimeout(recoverTimer);
      const delay = RECOVER_DELAYS_MS[recoverAttempt];
      if (delay == null) {
        goOff(); // this art stays on the artboard; the others are unaffected
        return;
      }
      recoverTimer = window.setTimeout(() => {
        if (disposed || !lost) return;
        recoverAttempt++;
        // a Gecko canvas whose context is lost for good never gets another
        // one — a new element does
        const fresh = document.createElement("canvas");
        fresh.className = canvas.className;
        fresh.setAttribute("aria-hidden", "true");
        fresh.style.cssText = canvas.style.cssText;
        unlisten(canvas);
        canvas.insertAdjacentElement("afterend", fresh);
        if (canvas === reactCanvas) reactCanvas.style.display = "none";
        else canvas.remove();
        canvas = fresh;
        listen(fresh);
        gl = null;
        lost = false;
        if (initGL()) start();
        else {
          lost = true;
          scheduleRecover();
        }
      }, delay);
    };

    // Recolor the existing meshes without restarting the shared motion clock.
    const audienceRoot = variant === "hero" ? art.closest("[data-audience]") : null;
    const paletteWatch = new MutationObserver(() => {
      for (const ring of rings) ring.color = rgba(getComputedStyle(ring.path).fill) || ring.color;
      // Repaint before the new View Transition snapshot, without waiting for
      // a display frame. Replace the pending RAF so there is still one loop.
      if (raf && live && !reduced.matches) {
        cancelAnimationFrame(raf);
        raf = 0;
        lastDraw = 0;
        frame();
      }
    });
    if (audienceRoot) paletteWatch.observe(audienceRoot, { attributes: true, attributeFilter: ["data-audience"] });

    const onOff = () => goOff();
    offHandlers.add(onOff);

    if (reduced.matches) {
      // reduced motion never boots (the artboard shows); a later flip does
      art.setAttribute("data-lp-gl-off", "");
    } else if (killSwitch() || (governed && readVerdict() === "off")) {
      // no WebGL for this page / session — the static DOM artboard stays;
      // the attribute tells LpArcCanvas to take the phone hero right away
      // (`?lp-gl=force` ignores a stored verdict as well as the governor)
      art.setAttribute("data-lp-gl-off", "");
      off = true;
    }
    // the context is created lazily, when the canvas first comes within
    // the observer margin (the hero: on the first delivery after mount)
    listen(canvas);
    ro.observe(art);
    dprMq.addEventListener("change", onDpr);
    reduced.addEventListener("change", onMedia);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      offHandlers.delete(onOff);
      paletteWatch.disconnect();
      restoreDom();
      art.removeAttribute("data-lp-gl-off"); // a remount decides afresh
      clearTimeout(resizeTimer);
      clearTimeout(shrinkTimer);
      clearTimeout(recoverTimer);
      io.disconnect();
      warmIo?.disconnect();
      ro.disconnect();
      dprMq.removeEventListener("change", onDpr);
      reduced.removeEventListener("change", onMedia);
      document.removeEventListener("visibilitychange", onVisibility);
      unlisten(canvas);
      // GPU buffers go; the context itself is left to die with the canvas.
      // Forcing loseContext() here poisoned React's dev double-mount: the
      // second effect run got the same, now-lost, context back and bailed.
      dropMeshes();
      if (canvas !== reactCanvas) {
        canvas.remove();
        reactCanvas.style.display = "";
      }
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className={`lp-gl-canvas lp-gl-canvas--${variant}`}
      aria-hidden="true"
    />
  );
}
