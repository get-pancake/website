"use client";

import { useAudience } from "./LpAudience";

// Owner: agents-view package (V2 Figma replication). Moved out of LpAudience.tsx on 2026-10-09
// (phase 0, code-map §12.3-2).

/** The H1 is the human headline alone (2026-10-07): LpHero's wrapper is a div, so crawlers read
    one H1, and the line reads as a sentence. In the agents view it stays laid out, hidden and
    aria-hidden (audience.css), so the hero keeps its geometry and the toggle its place; that
    view's own heading is in LpAgentStart (2026-11-01: the typed "> @agents, get gtm superpowers"
    line that overlaid this H1 left with the code wall). */
export function AudienceHeadline() {
  const { audience } = useAudience();
  return <h1 id="lp-hero-title" className="lp-hero-title__copy" aria-hidden={audience === "agents"}>
    Infrastructure powering <br />your GTM factory
  </h1>;
}
