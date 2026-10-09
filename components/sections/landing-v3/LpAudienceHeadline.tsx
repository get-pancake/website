"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { useAudience } from "./LpAudience";

// Owner: agents-view package (V2 Figma replication). Moved unchanged out of LpAudience.tsx on
// 2026-10-09 (phase 0, code-map §12.3-2); its rules live in audience-agents.css.

// The agent is the reader, named outright: the line says what IT gets, not
// what it gives its human (founder 2026-09-07: "on comprend pas que c'est
// l'agent qui devient meilleur" — the previous "give your human gtm
// superpowers" made the human the one who improved). Plural + comma per
// François 2026-09-08: "@agents, get gtm superpowers".
const agentHeadline = "@agents, get gtm superpowers";
// Typing bursts: each word types at a steady pace and every space is a short
// pause, the last glyph landing at the end of --lp-type-duration — derived
// from the string, so a copy change keeps the terminal rhythm. Each
// proportional glyph is revealed at its actual width, so the cursor stays
// attached to Aeonik Fono's text.
const glyphProgress = (() => {
  const steps: number[] = [];
  let t = 0;
  for (const letter of agentHeadline) {
    t += letter === " " ? 0.12 : 0.04;
    steps.push(t);
  }
  return steps.map(step => step / t);
})();

/** The H1 is the human headline alone (2026-10-07): LpHero's wrapper is a
    div that keeps the grid both copies overlay in, so crawlers no longer read
    "…customers > @agents, get gtm superpowers" (plus its 28 glyph spans) as
    the page's H1, and the two lines read as sentences (sr-only periods; the
    artboard has none). The agent line stays a span; in the agents view, where
    the human H1 is aria-hidden, it takes the heading role for screen readers. */
export function AudienceHeadline() {
  const { audience } = useAudience();
  const [fontReady, setFontReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    // Wait for the font metrics and their layout to settle before revealing
    // the first glyph. The complete accessible heading is already present.
    void document.fonts.ready.then(() => { if (mounted) setFontReady(true); });
    return () => { mounted = false; };
  }, []);
  return <>
    <h1 id="lp-hero-title" className="lp-hero-title__copy" aria-hidden={audience === "agents"}>
      You run your company<span className="lp-sr-only">.</span> <br />We bring you customers<span className="lp-sr-only">.</span>
    </h1>
    <span
      className="lp-hero-title__copy lp-hero-title__copy--agent"
      aria-hidden={audience === "humans"}
      role={audience === "agents" ? "heading" : undefined}
      aria-level={audience === "agents" ? 1 : undefined}
    >
      <span className="lp-sr-only">{`> ${agentHeadline}`}</span>
      <span className="lp-agent-headline" data-font-ready={fontReady} aria-hidden="true">
        <span className="lp-agent-headline__text"><span className="lp-agent-headline__prompt">{"> "}</span>{Array.from(agentHeadline, (letter, index) =>
          <span key={index} className="lp-agent-headline__glyph" style={{ "--lp-glyph-progress": glyphProgress[index] } as CSSProperties}>{letter}</span>
        )}</span>
        <span className="lp-agent-headline__cursor" />
      </span>
    </span>
  </>;
}
