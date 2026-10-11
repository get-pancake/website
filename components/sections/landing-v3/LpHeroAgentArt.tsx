"use client";

import { useLayoutEffect, useRef } from "react";

import { useAudience } from "./LpAudience";
import { ASCII_CELL, ASCII_GRIDS, ASCII_PITCH, asciiColumns, drawAsciiArc, type AsciiGrid } from "./lp-agents-ascii";

/**
 * Agents-view hero art (V2 Figma 4911:1461: the static ASCII rainbow 4911:2624). Owner: agents-view
 * package. Mounted by LpHero as the FIRST child inside `.lp-hero-art` (decision 2026-10-09), so it
 * shares the rings' box: page top-left at every width, lifted with the art on short windows.
 *
 * Renders nothing in the humans view. In the agents view: one canvas, drawn ONCE (no loop, not in
 * the freeze system) from the Figma character grid — desktop (≥1025) the 276-column node, spaced
 * across the art's width like the rings' scaleX past 1654; tablet / phone a downsampled grid at the
 * same glyph size, centred (recomposed, never scaled into dust). The draw runs in a layout effect,
 * i.e. inside LpAudience's flushSync commit, so the View Transition's new snapshot already holds
 * the ASCII (the switch never shows an empty sky). Unmounting on the way back frees the bitmap.
 * The rings stay laid out and keep drawing unseen (audience-agents.css), so a switch back shows
 * them at once. Placement and tiers: audience-agents.css (.lp-agents-ascii). Spec §5.1.
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
    let drawn = "";
    let dprQuery: MediaQueryList | null = null;

    const draw = () => {
      const grid: AsciiGrid = desktop.matches ? "desktop" : tablet.matches ? "tablet" : "phone";
      const rows = ASCII_GRIDS[grid];
      // desktop: 276 cells across the art (1654 wide, or the viewport past it)
      const advance = grid === "desktop" ? Math.max(1654, art.clientWidth) / 276 : ASCII_CELL;
      const width = Math.ceil(asciiColumns(rows) * advance);
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
      const g = canvas.getContext("2d");
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = getComputedStyle(canvas).color;
      drawAsciiArc(g, rows, advance);
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

    draw();
    watchDpr();
    const ro = new ResizeObserver(draw);
    ro.observe(art);
    return () => {
      ro.disconnect();
      dprQuery?.removeEventListener("change", onDpr);
      // free the backing store now (≈ 11.6 MB at 2x desktop), not at the next GC
      canvas.width = 0;
      canvas.height = 0;
    };
  }, []);

  return <canvas ref={ref} className="lp-agents-ascii" aria-hidden="true" />;
}
