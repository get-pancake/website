"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { useAudience } from "./LpAudience";
import { LpAgentPrompt } from "./LpAgentPrompt";
import { AS_MEDIA, mountAgentsAssembly } from "./lp-agents-scroll";
import { AGENT_WALL_TEXT } from "./lp-agents-wall-data";

/**
 * The agents view's code wall — Figma V2 4939:3457 (section 777 → 2064 at 1654): a still wall of
 * white pseudocode (4939:3760, Andale Mono 16/18 in a 1136 column) under a centred blue card with a
 * 1 px white outline (4964:4098) that holds the install prompt. Replaces production's black
 * terminal stream (LpAgentTerminalStream, retired). The card is its prompt row alone since
 * 2026-11-02: its body held production's "Prove you're not human" puzzle, which the founder did
 * not like ("ce qu on aimait pas ici c etait que l espece de capcha"); the wall, the card and the
 * hero stay as they were. On tablets and phones, where the hero's install box does not fade out
 * above it, the wall goes without the card (it would show that box twice). Owner: agents-view
 * package; styles in agent-lab.css.
 *
 * Kept from production: `section.lp-agent-lab#agent-playground` (the integrator's agents-view hide
 * rule shows `.lp-agent-lab` and the anchor stays), hidden from assistive tech outside the view.
 * The wall and card render once the view has been shown (and stay): the humans HTML carries no
 * hidden pseudocode — the agents view is client-only anyway (LpAudience reads the URL on mount).
 *
 * Motion (lp-agents-scroll.ts, desktop with motion allowed): the wall prints on scroll, then locks
 * printed. Reduced motion, tablets, phones and short windows: the rest picture (state 03).
 */
export function LpAgentLab() {
  const { audience } = useAudience();
  const active = audience === "agents";
  const section = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  // render the wall the first time the view shows, in the same commit (the switch's snapshot)
  if (active && !seen) setSeen(true);

  // Scroll assembly: mounted in the commit that shows the view, so its first picture is already
  // the scroll pose; follows the desktop/motion gate live.
  useLayoutEffect(() => {
    const el = section.current;
    if (!active || !el) return;
    const gate = matchMedia(AS_MEDIA);
    let unmount: (() => void) | null = null;
    const sync = () => {
      if (gate.matches && !unmount) unmount = mountAgentsAssembly(el);
      else if (!gate.matches && unmount) {
        unmount();
        unmount = null;
      }
    };
    sync();
    gate.addEventListener("change", sync);
    return () => {
      gate.removeEventListener("change", sync);
      unmount?.();
    };
  }, [active]);

  return <section
    ref={section}
    className="lp-agent-lab lp-agents-wall"
    id="agent-playground"
    aria-label="Set up Pancake with your agent"
    aria-hidden={!active}
  >
    {seen && <>
      <div className="lp-agents-wall__code" aria-hidden="true">{AGENT_WALL_TEXT}</div>
      {/* the section colour over the rows not yet printed (scroll assembly only) */}
      <div className="lp-agents-wall__cover" aria-hidden="true" />
      <div className="lp-agents-wall__slot">
        <div className="lp-agents-wall__card">
          <LpAgentPrompt variant="card" />
        </div>
      </div>
    </>}
  </section>;
}
