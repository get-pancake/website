"use client";

import { useLayoutEffect, useRef } from "react";

import { useAudience } from "./LpAudience";
import { ASCII_CELL, ASCII_GRIDS, ASCII_PITCH, asciiColumns, drawAsciiArc, type AsciiGrid } from "./lp-agents-ascii";
import { ASCII_LOOP_MS, readAsciiSpin } from "./lp-agents-ascii-spin";

/** Redraws a second: a terminal's cadence, not a film's; lighter on small screens. */
const FPS: Record<AsciiGrid, number> = { desktop: 15, tablet: 12, phone: 10 };
/** A frame (sample + redraw) this slow, this many times in a row, and the art holds its picture. */
const SLOW_FRAME_MS = 12;
const SLOW_FRAME_LIMIT = 5;
/** Longest step the loop's clock takes in one frame: a stalled tab resumes where it was. */
const MAX_STEP_MS = 250;

/**
 * Agents-view hero art (V2 Figma 4911:1461: the ASCII rainbow 4911:2624). Owner: agents-view
 * package. Mounted by LpHero as the FIRST child inside `.lp-hero-art` (decision 2026-10-09), so it
 * shares the rings' box: page top-left at every width, lifted with the art on short windows.
 *
 * Renders nothing in the humans view. In the agents view: one canvas holding the character grid —
 * desktop (≥1025) the 276-column node, spaced across the art's width like the rings' scaleX past
 * 1654; tablet / phone a coarser grid at the same glyph size, centred (recomposed, never scaled
 * into dust). The first draw runs in a layout effect, i.e. inside LpAudience's flushSync commit,
 * so the switch never shows an empty sky. Unmounting on the way back frees the bitmap. The rings
 * stay laid out and keep drawing unseen (audience-agents.css), so a switch back shows them at once.
 * Placement and tiers: audience-agents.css (.lp-agents-ascii). Spec §5.1.
 *
 * Animated since 2026-10-12 (founder: "let's animate this thing"), in the humans rainbow's own
 * logic: the rings turn on the 20 s loop and the grid is that rainbow re-sampled into characters
 * (lp-agents-ascii-spin.ts), from cycle 0 = the designer's picture at mount. Not a CSS animation,
 * so not in the freeze system; its own gates, like LpRainbowGL: it runs only while the canvas is
 * on screen and the tab visible, at FPS redraws a second, redraws only the lines that changed, and
 * holds its picture if frames get slow. Reduced motion, or rings it cannot read: the designer's
 * static grid, drawn once, as before. `window.__lpArcPhase` (the rainbow's test hook) pins the
 * cycle here too.
 */
export function LpHeroAgentArt() {
  const { audience } = useAudience();
  return audience === "agents" ? <LpAgentsAscii /> : null;
}

function LpAgentsAscii() {
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = ref.current;
    const art = canvas?.parentElement;
    if (!canvas || !art) return;
    const desktop = matchMedia("(min-width: 1025px)");
    const tablet = matchMedia("(min-width: 768px)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let spin = reduce.matches ? null : readAsciiSpin(art);
    let drawn = "";
    let dprQuery: MediaQueryList | null = null;

    // what the canvas holds: its layout, its context and the lines painted on it
    let grid: AsciiGrid = "desktop";
    let advance = ASCII_CELL;
    let width = 0;
    let wholeLines = true;
    let g: CanvasRenderingContext2D | null = null;
    let shown: readonly string[] | null = null;

    // the loop's clock only runs while frames are drawn, so the art never jumps
    let elapsed = 0;
    let lastTick = 0;
    let lastDraw = 0;
    let raf = 0;
    let onStage = true;
    let slowFrames = 0;

    const lines = (): readonly string[] => {
      if (!spin) return ASCII_GRIDS[grid];
      const hook = (window as unknown as { __lpArcPhase?: number }).__lpArcPhase;
      const cycle = typeof hook === "number" ? hook : (elapsed / ASCII_LOOP_MS) % 1;
      const rows = ASCII_GRIDS[grid];
      return spin.sample(asciiColumns(rows), rows.length, cycle);
    };

    const paint = (next: readonly string[]) => {
      if (!g) return;
      if (!shown || !wholeLines) {
        if (shown) g.clearRect(0, 0, width, next.length * ASCII_PITCH);
        drawAsciiArc(g, next, advance);
      } else {
        for (let row = 0; row < next.length; row++) {
          if (next[row] === shown[row]) continue;
          g.clearRect(0, row * ASCII_PITCH, width, ASCII_PITCH);
          drawAsciiArc(g, [next[row]], advance, row);
        }
      }
      shown = next;
    };

    const draw = () => {
      grid = desktop.matches ? "desktop" : tablet.matches ? "tablet" : "phone";
      const rows = ASCII_GRIDS[grid];
      // desktop: 276 cells across the art (1654 wide, or the viewport past it)
      advance = grid === "desktop" ? Math.max(1654, art.clientWidth) / 276 : ASCII_CELL;
      width = Math.ceil(asciiColumns(rows) * advance);
      const height = rows.length * ASCII_PITCH;
      // ≤ 2x, and never a backing store wider than 4096 px (Gecko's compositor cap)
      const dpr = Math.min(window.devicePixelRatio || 1, 2, 4096 / width);
      const key = `${grid}|${advance}|${dpr}`;
      if (key === drawn) return;
      drawn = key;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.dataset.grid = grid;
      canvas.dataset.spin = spin ? "on" : "off";
      g = canvas.getContext("2d");
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = getComputedStyle(canvas).color;
      // a line is 11 CSS px: on a whole-number DPR its edges are device pixels and one line can be
      // cleared alone; otherwise (the 4096 cap) every frame redraws the grid
      wholeLines = Number.isInteger(dpr);
      shown = null;
      paint(lines());
    };

    const frame = (now: number) => {
      raf = 0;
      if (!spin) return;
      elapsed += Math.min(now - lastTick, MAX_STEP_MS);
      lastTick = now;
      if (now - lastDraw >= 1000 / FPS[grid] - 1) {
        lastDraw = now;
        const start = performance.now();
        paint(lines());
        if (performance.now() - start > SLOW_FRAME_MS) {
          slowFrames += 1;
          if (slowFrames >= SLOW_FRAME_LIMIT) {
            // too heavy here: hold the picture on screen (no jump back to the static grid)
            spin = null;
            canvas.dataset.spin = "held";
            return;
          }
        } else {
          slowFrames = 0;
        }
      }
      run();
    };
    const run = () => {
      if (raf || !spin || !onStage || document.hidden) return;
      lastTick = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const watchDpr = () => {
      dprQuery?.removeEventListener("change", onDpr);
      dprQuery = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      dprQuery.addEventListener("change", onDpr);
    };
    const onDpr = () => {
      watchDpr();
      draw();
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else run();
    };
    const onReduce = () => {
      if (!reduce.matches || !spin) return;
      // motion turned off while it runs: the designer's static grid, for good
      stop();
      spin = null;
      canvas.dataset.spin = "off";
      shown = null;
      g?.clearRect(0, 0, width, ASCII_GRIDS[grid].length * ASCII_PITCH);
      paint(ASCII_GRIDS[grid]);
    };

    draw();
    watchDpr();
    const ro = new ResizeObserver(draw);
    ro.observe(art);
    const io = new IntersectionObserver(([entry]) => {
      onStage = entry.isIntersecting;
      if (onStage) run();
      else stop();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", onReduce);
    run();
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onReduce);
      dprQuery?.removeEventListener("change", onDpr);
      // free the backing store now (≈ 11.6 MB at 2x desktop), not at the next GC
      canvas.width = 0;
      canvas.height = 0;
    };
  }, []);

  return <canvas ref={ref} className="lp-agents-ascii" aria-hidden="true" />;
}
