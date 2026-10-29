"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { useAudience } from "./LpAudience";

// Owner: agents-view package (V2 Figma replication). Moved out of LpAudience.tsx on 2026-10-09
// (phase 0, code-map §12.3-2); its rules live in audience-agents.css.

// The agent is the reader, named outright: the line says what IT gets, not
// what it gives its human (founder 2026-09-07: "on comprend pas que c'est
// l'agent qui devient meilleur" — the previous "give your human gtm
// superpowers" made the human the one who improved). Plural + comma per
// François 2026-09-08: "@agents, get gtm superpowers".
// V2 (Figma 4939:3740, 2026-10-09) sets it on two lines in Geist Mono 56 —
// production words in V2's composition: "> @agents," / "get gtm superpowers"
// (V2 draws the squashed ">@agents" / "getgtmsuperpowers", an older copy).
const AGENT_PROMPT = "> ";
const AGENT_LINES = ["@agents,", "get gtm superpowers"] as const;
const agentHeadline = AGENT_LINES.join(" ");

// Typing bursts: each word types at a steady pace and every space (and the
// line break) is a short pause, the last glyph landing at the end of
// --lp-type-duration — derived from the strings, so a copy change keeps the
// terminal rhythm. Mono glyphs, so per-glyph spans never disturb kerning.
const { glyphProgress, row1End } = (() => {
  const steps: number[][] = [];
  let t = 0;
  AGENT_LINES.forEach((line, row) => {
    if (row > 0) t += 0.12; // the line break weighs like a space
    steps.push(Array.from(line, (letter) => (t += letter === " " ? 0.12 : 0.04)));
  });
  const first = steps[0];
  return {
    glyphProgress: steps.map((row) => row.map((step) => step / t)),
    row1End: first[first.length - 1] / t,
  };
})();

/** The font the agent line types in (Geist Mono, audience-agents.css @font-face) is fetched on
 *  first use — humans never download it. Asking for it by the element's own computed family
 *  works whatever the token resolves to. */
const loadAgentFont = (el: Element) =>
  document.fonts.load(`400 56px ${getComputedStyle(el).fontFamily}`);

/** The H1 is the human headline alone (2026-10-07): LpHero's wrapper is a
    div that keeps the grid both copies overlay in, so crawlers no longer read
    "…customers > @agents, get gtm superpowers" (plus its glyph spans) as
    the page's H1, and the two lines read as sentences (sr-only periods; the
    artboard has none). The agent line stays a span; in the agents view, where
    the human H1 is aria-hidden, it takes the heading role for screen readers. */
export function AudienceHeadline() {
  const { audience } = useAudience();
  const agents = audience === "agents";
  const headline = useRef<HTMLSpanElement>(null);
  const [fontReady, setFontReady] = useState(false);
  const [inView, setInView] = useState(true);

  // Warm-up (humans view): hovering, focusing or touching the toggle starts the 31 kB font fetch,
  // so it is usually there before the 240 ms crossfade ends.
  useEffect(() => {
    const el = headline.current;
    const selector = el?.closest(".lp-hero")?.querySelector(".lp-audience-selector");
    if (!el || !selector) return;
    const warm = () => {
      void loadAgentFont(el).catch(() => {});
      for (const type of ["pointerenter", "focusin", "touchstart"]) selector.removeEventListener(type, warm);
    };
    for (const type of ["pointerenter", "focusin", "touchstart"]) selector.addEventListener(type, warm, { passive: true });
    return () => {
      for (const type of ["pointerenter", "focusin", "touchstart"]) selector.removeEventListener(type, warm);
    };
  }, []);

  // Font gate: the line stays hidden until Geist Mono is in (never a reflow mid-typing).
  // `document.fonts.ready` would not do: it resolves before a never-requested face is asked for.
  // A slow network reveals the line after 3 s in the fallback mono.
  useEffect(() => {
    const el = headline.current;
    if (!agents || fontReady || !el) return;
    let live = true;
    const reveal = () => { if (live) setFontReady(true); };
    const fallback = window.setTimeout(reveal, 3000);
    void loadAgentFont(el).then(reveal, reveal);
    return () => {
      live = false;
      clearTimeout(fallback);
    };
  }, [agents, fontReady]);

  // The resting cursor's blink is the line's only infinite loop: paused while the line is off
  // screen (its own gate — the hero is deliberately not an LpAnimFreeze stage).
  useEffect(() => {
    const el = headline.current;
    if (!agents || !el) return;
    const io = new IntersectionObserver((entries) => setInView(entries.some((e) => e.isIntersecting)));
    io.observe(el);
    return () => io.disconnect();
  }, [agents]);

  const glyphs = (row: number) =>
    Array.from(AGENT_LINES[row], (letter, index) => (
      <span
        key={index}
        className="lp-agent-headline__glyph"
        style={{ "--lp-glyph-progress": glyphProgress[row][index] } as CSSProperties}
      >
        {letter}
      </span>
    ));

  return <>
    <h1 id="lp-hero-title" className="lp-hero-title__copy" aria-hidden={agents}>
      Infrastructure to power <br />your GTM factory
    </h1>
    <span
      className="lp-hero-title__copy lp-hero-title__copy--agent"
      aria-hidden={!agents}
      role={agents ? "heading" : undefined}
      aria-level={agents ? 1 : undefined}
    >
      <span className="lp-sr-only">{`> ${agentHeadline}`}</span>
      <span
        ref={headline}
        className="lp-agent-headline"
        data-font-ready={fontReady}
        data-inview={inView}
        aria-hidden="true"
        style={{ "--lp-row1-end": row1End } as CSSProperties}
      >
        <span className="lp-agent-headline__line">
          <span className="lp-agent-headline__prompt">{AGENT_PROMPT}</span>
          {glyphs(0)}
          <span className="lp-agent-headline__cursor" data-line="1">|</span>
        </span>
        <span className="lp-agent-headline__line">
          {glyphs(1)}
          <span className="lp-agent-headline__cursor" data-line="2">|</span>
        </span>
      </span>
    </span>
  </>;
}
