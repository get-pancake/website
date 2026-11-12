// No "use client" on purpose: a plain module, reached only through the takes' lazy chunks
// (lp-toy-kit.ts has why).
import { gsap } from "@/lib/gsap";

/**
 * The toy pictures' drawings, on a canvas (2026-11-12). Founder, on the preview: "Les animations
 * sont un peu glitchy parfois, est-ce qu'on les passerait pas en canvas pour que ce soit plus
 * opti ? Comme la kitchen quoi".
 *
 * WHY. A toy picture is a stack of drawings (LpToyKit.tsx ToyPic: an <img> a layer) that GSAP
 * moves with 2D transforms, in the page's own paint layer: no will-change, no 3D transform, as
 * the page asks since its composited layers cost it Safari (LpAnimFreeze, LpRainbowGL). So each
 * frame of a take the browser painted the picture again, every drawing under the piece that
 * moved. Measured on a production build in Chromium (the first picture, 1440 px, a processor
 * four times slower than the test machine's): 18.7 ms of painting a frame, 40 frames a second.
 * WebKit paints on its main thread and scales every drawing in software, so it pays more.
 *
 * WHAT. The drawings are painted here instead, as the kitchen is: this module reads where GSAP
 * has put each one and blits it. The takes do not change: they still tween the <img> elements,
 * which are no longer displayed (so writing to them costs the page nothing), and GSAP's own
 * record of each element is what is drawn. The page's type (badges, names, counts) stays HTML
 * over the canvas, sharp at any size.
 *
 * HOW.
 * - A RUN is a stretch of drawings with nothing else of the page between them, in paint order.
 *   Each run gets one canvas, placed where its first drawing was: what the page draws between
 *   two runs (a ring on the ground, a beam, a mark) keeps its place in the stack.
 * - The <img> elements stay the picture's markup, and its fallback. The canvas takes over once
 *   its first frame is drawn ([data-toy-canvas] on the picture, toys.css), and gives the picture
 *   back whenever it stops: far from the screen (its memory is freed), on dispose, or if a
 *   drawing does not load. Reduced motion never builds a take, so never comes here.
 * - A picture takes its canvases when its take first plays near the screen, not before: one that
 *   waits (a card not reached yet, the three stories of the carousel that are not on) costs no
 *   memory.
 * - The drawings are read only while the take's playhead moves (`follow`), and a frame is drawn
 *   only when one of them changed: a picture that waits or holds costs nothing.
 * - `?lp-toy=dom` keeps the <img> elements as the render (to compare, or if a browser misdraws).
 *   `?lp-toy=canvas` takes the canvases as soon as the picture is near, before its take plays
 *   (for a review page that seeks a take by hand).
 *
 * What it reads of a drawing: GSAP's transform (x, y, scale, rotation, about the element's
 * transform-origin), its opacity and visibility, a clip-path that is an inset(), and those of a
 * wrapper that holds nothing but drawings (the phone that shakes as one piece). So a drawing
 * must be moved by GSAP alone: one that a stylesheet moves (a `translate`, an animation) would
 * stand still here. A picture built another way (a drawing inside a wrapper that also holds
 * type) is left to the page: `toyCanvas` then does nothing.
 */

type Xy = readonly [number, number];
/** a wrapper that holds nothing but drawings: it moves them as one piece */
type Group = {
  el: HTMLElement;
  parent: Group | null;
  left: number;
  top: number;
  w: number;
  h: number;
  origin: Xy;
  restVisible: boolean;
  restOpacity: number;
  /** as of the frame `tick`: what it gives the drawings it holds */
  tick: number;
  visible: boolean;
  alpha: number;
  m: Matrix;
  moved: boolean;
};
type Pic = {
  el: HTMLImageElement;
  group: Group | null;
  src: string;
  left: number;
  top: number;
  w: number;
  h: number;
  origin: Xy;
  restVisible: boolean;
  restOpacity: number;
  clips: boolean;
  /** what was last drawn: visible, alpha, the matrix, the clip's four insets */
  state: Float64Array;
};
type Run = { before: Element; pics: Pic[]; canvas: HTMLCanvasElement | null; ctx: CanvasRenderingContext2D | null; fresh: boolean };
/** a 2D matrix as CSS writes it: x' = a·x + c·y + e, y' = b·x + d·y + f */
type Matrix = [a: number, b: number, c: number, d: number, e: number, f: number];
type Source = ImageBitmap | HTMLImageElement;

export type ToyCanvas = {
  /** the take that moves the drawings: while its playhead stands still, nothing is read */
  follow: (take: gsap.core.Timeline) => void;
  dispose: () => void;
};

const PIC = "lp-toy-pic";
const NOTHING: ToyCanvas = { follow() {}, dispose() {} };
/** the canvas draws at most this many pixels per stage px: the drawings' own resolution */
const MAX_SCALE = 2;
/** how near the picture comes before the canvas takes over, and how far before it lets go */
const NEAR = "100% 0px";
const FAR = "250% 0px";

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];
const multiply = (m: Matrix, n: Matrix): Matrix => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];

/** "12px 30px" or "50% 82%" (a computed or an inline transform-origin) in the element's own px */
function originOf(value: string, w: number, h: number, fallback: Xy): Xy {
  const parts = value.trim().split(/\s+/);
  if (parts.length < 2) return fallback;
  const one = (part: string, size: number) => {
    const n = parseFloat(part);
    if (Number.isNaN(n)) return part === "left" || part === "top" ? 0 : part === "right" || part === "bottom" ? size : size / 2;
    return part.endsWith("%") ? (size * n) / 100 : n;
  };
  return [one(parts[0], w), one(parts[1], h)];
}

type GsapCache = { x?: string | number; y?: string | number; scaleX?: number; scaleY?: number; rotation?: string | number };
/**
 * GSAP's record of an element's transform, as a matrix about `origin`; null when it is none.
 * The record (`_gsap`) is what GSAP itself writes the element's style from: x and y in px, the
 * scales as numbers, the rotation in degrees. An element GSAP never touched has none.
 */
function transformOf(el: Element, origin: Xy): Matrix | null {
  const cache = (el as unknown as { _gsap?: GsapCache })._gsap;
  if (!cache || cache.x === undefined) return null;
  // (a piece back on its place may be a hair off it, the rounding of a sum: that is on it)
  const near = (v: number) => (Math.abs(v) < 0.005 ? 0 : v);
  const x = near(parseFloat(String(cache.x)) || 0);
  const y = near(parseFloat(String(cache.y)) || 0);
  const sx = cache.scaleX ?? 1;
  const sy = cache.scaleY ?? 1;
  const deg = near(parseFloat(String(cache.rotation)) || 0);
  if (!x && !y && sx === 1 && sy === 1 && !deg) return null;
  const r = (deg * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  const a = cos * sx;
  const b = sin * sx;
  const c = -sin * sy;
  const d = cos * sy;
  // T(origin) · T(x, y) · R · S · T(−origin)
  return [a, b, c, d, x + origin[0] - a * origin[0] - c * origin[1], y + origin[1] - b * origin[0] - d * origin[1]];
}

/** inline visibility over what the stylesheet gives at rest; "inherit" asks the wrapper */
const visibleOf = (el: HTMLElement, rest: boolean, parent: boolean) => {
  const v = el.style.visibility;
  return v === "hidden" ? false : v === "visible" ? true : v === "inherit" ? parent : rest;
};
const opacityOf = (el: HTMLElement, rest: number) => {
  const v = el.style.opacity;
  return v === "" ? rest : Number(v);
};

/**
 * Draws the drawings of the picture `root` on canvases, for as long as it is near the screen.
 * Call it BEFORE the take writes anything (it reads the picture at rest), and `dispose` it in
 * the take's cleanup.
 */
export function toyCanvas(root: HTMLElement): ToyCanvas {
  const set = root.querySelector<HTMLElement>(".lp-toy-set");
  if (!set || typeof IntersectionObserver === "undefined") return NOTHING;
  const asked = new URLSearchParams(window.location.search).get("lp-toy");
  if (asked === "dom") return NOTHING;
  const eager = asked === "canvas";

  /* ── the picture at rest: its drawings, in paint order, by runs ── */
  const pics: Pic[] = [];
  const groups: Group[] = [];
  const runs: Run[] = [];
  let open: Run | null = null;
  const onlyDrawings = (el: Element) => Array.from(el.querySelectorAll("*")).every((d) => d.classList.contains(PIC) || d.querySelector(`.${PIC}`));
  let plain = true;
  const visit = (parent: Element, group: Group | null, top: Element | null) => {
    for (const child of Array.from(parent.children)) {
      if (child instanceof HTMLImageElement && child.classList.contains(PIC)) {
        const w = Number(child.getAttribute("width")) || 0;
        const h = Number(child.getAttribute("height")) || 0;
        const style = getComputedStyle(child);
        if (!open) runs.push((open = { before: top ?? child, pics: [], canvas: null, ctx: null, fresh: true }));
        const pic: Pic = {
          el: child,
          group,
          src: child.currentSrc || child.src,
          left: parseFloat(child.style.left) || 0,
          top: parseFloat(child.style.top) || 0,
          w,
          h,
          origin: originOf(style.transformOrigin, w, h, [w / 2, h / 2]),
          restVisible: style.visibility !== "hidden",
          restOpacity: Number(style.opacity),
          clips: style.clipPath !== "none",
          state: new Float64Array(12),
        };
        pics.push(pic);
        open.pics.push(pic);
        continue;
      }
      if (!child.querySelector(`.${PIC}`)) {
        open = null; // something the page draws: the run ends under it
        continue;
      }
      if (!(child instanceof HTMLElement) || !onlyDrawings(child)) {
        plain = false;
        return;
      }
      const style = getComputedStyle(child);
      const w = child.offsetWidth;
      const h = child.offsetHeight;
      const wrapper: Group = {
        el: child,
        parent: group,
        left: child.offsetLeft,
        top: child.offsetTop,
        w,
        h,
        origin: originOf(style.transformOrigin, w, h, [w / 2, h / 2]),
        restVisible: style.visibility !== "hidden",
        restOpacity: Number(style.opacity),
        tick: -1,
        visible: true,
        alpha: 1,
        m: IDENTITY,
        moved: false,
      };
      groups.push(wrapper);
      visit(child, wrapper, top ?? child);
      if (!plain) return;
    }
  };
  // A picture may be read while it is hidden as a whole (a panel of the carousel that is not on:
  // visibility is inherited, so every drawing in it computes "hidden"). What a drawing gets from
  // above the picture is not its own rest: the picture is read as if it showed.
  const hiddenFromAbove = root.style.visibility;
  root.style.visibility = "visible";
  try {
    visit(set, null, null);
  } finally {
    root.style.visibility = hiddenFromAbove;
  }
  if (!plain || !pics.length) return NOTHING;
  // GSAP reads an element's transform the first time it moves it. Have it read them now, while
  // the drawings are displayed: it cannot read one that is not (it would move it in the document
  // to find out).
  for (const piece of [...pics, ...groups]) gsap.getProperty(piece.el, "x");

  /* ── live: the canvases are the render ── */
  let disposed = false;
  let live = false;
  let acquiring = false;
  let wanted = false;
  let scale = 1;
  let frame = 0;
  let take: gsap.core.Timeline | null = null;
  let seen = NaN;
  /** frames in a row in which the take's playhead moved: it plays */
  let moving = 0;
  const sources = new Map<string, Source>();

  const groupNow = (group: Group): Group => {
    if (group.tick === frame) return group;
    group.tick = frame;
    const up = group.parent ? groupNow(group.parent) : null;
    group.visible = visibleOf(group.el, group.restVisible, up ? up.visible : true);
    group.alpha = opacityOf(group.el, group.restOpacity) * (up ? up.alpha : 1);
    const inline = group.el.style.transformOrigin;
    const own = transformOf(group.el, inline ? originOf(inline, group.w, group.h, group.origin) : group.origin);
    // (a wrapper's box starts at its own left and top, inside its parent's)
    const placed: Matrix = [1, 0, 0, 1, group.left, group.top];
    const local = own ? multiply(placed, own) : placed;
    group.m = up ? multiply(up.m, local) : local;
    group.moved = Boolean(own) || Boolean(up?.moved);
    return group;
  };

  const next = new Float64Array(12);
  /** reads a drawing as GSAP has it now; true if it is not what was last drawn */
  const read = (pic: Pic): boolean => {
    const group = pic.group ? groupNow(pic.group) : null;
    const s = pic.state;
    const visible = visibleOf(pic.el, pic.restVisible, group ? group.visible : true);
    const alpha = visible ? opacityOf(pic.el, pic.restOpacity) * (group ? group.alpha : 1) : 0;
    if (!visible || alpha <= 0.002) {
      if (s[0] === 0) return false;
      s[0] = 0;
      return true;
    }
    const inline = pic.el.style.transformOrigin;
    const own = transformOf(pic.el, inline ? originOf(inline, pic.w, pic.h, pic.origin) : pic.origin);
    let m: Matrix = own ? [own[0], own[1], own[2], own[3], own[4] + pic.left, own[5] + pic.top] : [1, 0, 0, 1, pic.left, pic.top];
    if (group) m = multiply(group.m, m);
    // a drawing at rest sits on whole pixels, as the page lays an image: it stays as sharp
    if (!own && !group?.moved) {
      m[4] = Math.round(m[4] * scale) / scale;
      m[5] = Math.round(m[5] * scale) / scale;
    }
    next[0] = 1;
    next[1] = alpha;
    for (let i = 0; i < 6; i++) next[2 + i] = m[i];
    next[8] = next[9] = next[10] = next[11] = 0;
    if (pic.clips) {
      // inset(top right bottom left), in % of the drawing's box
      const inset = /inset\(([^)]*)\)/.exec(pic.el.style.clipPath);
      if (inset) {
        const v = inset[1].trim().split(/\s+/).map((part) => parseFloat(part) || 0);
        next[8] = v[0] ?? 0;
        next[9] = v[1] ?? next[8];
        next[10] = v[2] ?? next[8];
        next[11] = v[3] ?? next[9];
      }
    }
    let changed = false;
    for (let i = 0; i < 12; i++) {
      if (Math.abs(s[i] - next[i]) > 1e-4) changed = true;
      s[i] = next[i];
    }
    return changed;
  };

  const paint = (run: Run) => {
    const { canvas, ctx } = run;
    if (!canvas || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const pic of run.pics) {
      const s = pic.state;
      if (s[0] === 0) continue;
      const source = sources.get(pic.src);
      if (!source) continue;
      ctx.globalAlpha = s[1];
      ctx.setTransform(s[2] * scale, s[3] * scale, s[4] * scale, s[5] * scale, s[6] * scale, s[7] * scale);
      const clipped = s[8] > 0 || s[9] > 0 || s[10] > 0 || s[11] > 0;
      if (clipped) {
        ctx.save();
        ctx.beginPath();
        ctx.rect((pic.w * s[11]) / 100, (pic.h * s[8]) / 100, pic.w * (1 - (s[11] + s[9]) / 100), pic.h * (1 - (s[8] + s[10]) / 100));
        ctx.clip();
      }
      ctx.drawImage(source, 0, 0, pic.w, pic.h);
      if (clipped) ctx.restore();
    }
    ctx.globalAlpha = 1;
  };

  /** after GSAP's own tick: redraw the runs in which a drawing changed */
  const tick = () => {
    if (!live) return;
    if (take) {
      // the take alone moves the drawings: where its playhead has not moved, nothing has
      const at = take.totalTime();
      if (at === seen && !runs.some((run) => run.fresh)) return;
      seen = at;
    }
    frame++;
    for (const run of runs) {
      let dirty = run.fresh;
      for (const pic of run.pics) if (read(pic)) dirty = true;
      if (dirty) {
        run.fresh = false;
        paint(run);
      }
    }
  };

  /** the canvases' size in device px: the picture's own on the page, up to the drawings' */
  const fit = () => {
    // (the set's width as laid out, in stage px, and as it shows on the page, scaled with its card)
    const design = set.offsetWidth;
    const onPage = design ? (set.getBoundingClientRect().width / design) * (window.devicePixelRatio || 1) : 0;
    scale = Math.min(MAX_SCALE, Math.max(0.5, onPage || 1));
    const w = Math.max(1, Math.round(design * scale));
    const h = Math.max(1, Math.round(set.offsetHeight * scale));
    for (const run of runs) {
      if (!run.canvas || !run.ctx || (run.canvas.width === w && run.canvas.height === h)) continue;
      run.canvas.width = w;
      run.canvas.height = h;
      run.ctx.imageSmoothingQuality = "high"; // (a new size resets the context)
      run.fresh = true;
    }
  };
  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => live && (fit(), tick())) : null;

  /** the page's own drawings are the render again, and what the canvases held is freed */
  const release = () => {
    live = false;
    gsap.ticker.remove(tick);
    ro?.disconnect();
    // the page's own drawings first, then the canvases go
    delete root.dataset.toyCanvas;
    for (const group of groups) delete group.el.dataset.toyGroup;
    for (const run of runs) {
      if (run.canvas) {
        run.canvas.width = run.canvas.height = 0; // frees its memory at once
        run.canvas.remove();
      }
      run.canvas = run.ctx = null;
      run.fresh = true;
    }
    for (const pic of pics) pic.state[0] = -1;
    sources.forEach((source) => "close" in source && source.close());
    sources.clear();
  };

  const acquire = async () => {
    if (live || acquiring || disposed) return;
    acquiring = true;
    try {
      // every drawing, decoded and held: a blit never waits for a decode
      const first = new Map<string, HTMLImageElement>();
      for (const pic of pics) if (!first.has(pic.src)) first.set(pic.src, pic.el);
      await Promise.all(
        Array.from(first, async ([src, img]) => {
          img.loading = "eager";
          if (!img.complete || !img.naturalWidth) await img.decode();
          sources.set(src, typeof createImageBitmap === "function" ? await createImageBitmap(img) : img);
        }),
      );
      if (disposed || !wanted) throw new Error("the picture left while its drawings loaded");
      for (const run of runs) {
        const canvas = document.createElement("canvas");
        canvas.className = "lp-toy-canvas";
        canvas.setAttribute("aria-hidden", "true");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no 2D canvas");
        run.canvas = canvas;
        run.ctx = ctx;
        run.before.parentNode?.insertBefore(canvas, run.before);
      }
      live = true;
      fit();
      tick(); // the first frame, before the page's own drawings go
      for (const group of groups) group.el.dataset.toyGroup = "";
      root.dataset.toyCanvas = "";
      gsap.ticker.add(tick);
      ro?.observe(set);
    } catch {
      // a drawing that did not load, no canvas, a picture that left: the page's own drawings stay
      release();
    } finally {
      acquiring = false;
    }
  };

  /** near the screen and not live yet: the canvases are taken once the take plays (two frames in
      a row: a build takes its take to its end in one step, which is not playing) */
  const wait = () => {
    if (live || acquiring || !take) return;
    const at = take.totalTime();
    moving = Number.isNaN(seen) || at === seen ? 0 : moving + 1;
    seen = at;
    if (moving < 2) return;
    gsap.ticker.remove(wait);
    seen = NaN;
    void acquire();
  };
  const near = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting || wanted) return;
      wanted = true;
      moving = 0;
      if (eager) void acquire();
      else if (take) gsap.ticker.add(wait);
    },
    { rootMargin: NEAR },
  );
  const far = new IntersectionObserver(
    ([entry]) => {
      if (!entry || entry.isIntersecting) return;
      wanted = false;
      gsap.ticker.remove(wait);
      release();
    },
    { rootMargin: FAR },
  );
  near.observe(root);
  far.observe(root);

  return {
    follow(timeline) {
      take = timeline;
      seen = NaN;
      // (near the screen already, and waiting for a take to follow)
      if (wanted && !live && !acquiring && !eager) gsap.ticker.add(wait);
    },
    dispose() {
      disposed = true;
      wanted = false;
      near.disconnect();
      far.disconnect();
      gsap.ticker.remove(wait);
      release();
    },
  };
}
