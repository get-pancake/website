"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";

import { useSearchParams } from "next/navigation";

export type Audience = "humans" | "agents";
type AudienceUpdate = Audience | ((current: Audience) => Audience);
const AudienceContext = createContext<{ audience: Audience; setAudience: (value: AudienceUpdate) => void }>({
  audience: "humans",
  setAudience: () => {},
});
export const useAudience = () => useContext(AudienceContext);

// The agent is the reader: the line says what IT gets, not what it gives
// its human (founder 2026-09-07: "on comprend pas que c'est l'agent qui
// devient meilleur" — the previous "give your human gtm superpowers" made the
// human the one who improved).
const agentHeadline = "get gtm superpowers";
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
    <span className="lp-hero-title__copy" aria-hidden={audience === "agents"}>
      You run your company<br />We bring you customers
    </span>
    <span className="lp-hero-title__copy lp-hero-title__copy--agent" aria-hidden={audience === "humans"}>
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

/** A real URL for sharing/back/forward, without navigation or remounting art. */
export function LpAudience({ initialAudience, children }: { initialAudience: Audience; children: ReactNode }) {
  const searchParams = useSearchParams();
  const urlAudience: Audience = searchParams ? (searchParams.get("audience") === "agents" ? "agents" : "humans") : initialAudience;
  const [audience, setRenderedAudience] = useState(urlAudience);
  const desiredAudience = useRef(urlAudience);
  const committedAudience = useRef(urlAudience);
  const activeTransition = useRef<ViewTransition | null>(null);
  const request = useRef(0);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    // Browser history still drives the view. Ignore a stale router restore
    // when another toggle has already moved the URL forward.
    const current: Audience = new URL(window.location.href).searchParams.get("audience") === "agents" ? "agents" : "humans";
    if (urlAudience !== current || current === committedAudience.current) return;
    request.current += 1;
    activeTransition.current?.skipTransition();
    committedAudience.current = current;
    desiredAudience.current = current;
    setRenderedAudience(current);
  }, [urlAudience]);

  useEffect(() => {
    const onPopState = () => {
      request.current += 1;
      activeTransition.current?.skipTransition();
      const current: Audience = new URL(window.location.href).searchParams.get("audience") === "agents" ? "agents" : "humans";
      committedAudience.current = desiredAudience.current = current;
      setRenderedAudience(current);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      request.current += 1;
      activeTransition.current?.skipTransition();
    };
  }, []);

  const setAudience = useCallback((update: AudienceUpdate) => {
    const value = typeof update === "function" ? update(desiredAudience.current) : update;
    desiredAudience.current = value;
    const id = ++request.current;
    activeTransition.current?.skipTransition();
    const url = new URL(window.location.href);
    if (value === "agents") url.searchParams.set("audience", "agents");
    else url.searchParams.delete("audience");
    const commit = () => {
      if (request.current !== id) return;
      committedAudience.current = value;
      flushSync(() => {
        setRenderedAudience(value);
        if (url.href !== window.location.href) window.history.pushState(null, "", url);
        setAnnouncement(value === "agents" ? "For agents selected." : "For humans selected.");
      });
    };
    if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      commit();
      return;
    }
    // Commit in the capture callback without waiting for animation frames.
    // View Transitions suppress rendering during capture, so waiting for a
    // redraw here postponed the response until the old 80ms timeout expired.
    const transition = document.startViewTransition(commit);
    activeTransition.current = transition;
    const clear = () => { if (activeTransition.current === transition) activeTransition.current = null; };
    void transition.ready.catch(() => {}); // A rapid toggle may skip its predecessor.
    void transition.finished.then(clear, clear);
  }, []);
  return (
    <AudienceContext.Provider value={{ audience, setAudience }}>
      <main id="main-content" className="lp lp-audience-page" data-audience={audience}>
        <span className="lp-sr-only" role="status">{announcement}</span>
        {children}
      </main>
    </AudienceContext.Provider>
  );
}

export function AudienceSelector() {
  const { audience, setAudience } = useAudience();
  const selectorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const selector = selectorRef.current;
    const placement = selector?.parentElement;
    const inner = placement?.closest<HTMLElement>(".lp-hero-inner");
    const heading = inner?.querySelector<HTMLElement>(".lp-hero-title");
    const humanColumn = inner?.querySelector<HTMLElement>(".lp-hero-col--human");
    if (!selector || !placement || !inner || !heading || !humanColumn) return;
    // Anchor to the original headline without changing its markup or flow.
    // Divide out the hero's existing short-window scale so both stay aligned.
    const position = () => {
      const box = inner.getBoundingClientRect();
      const title = heading.getBoundingClientRect();
      const column = humanColumn.getBoundingClientRect();
      const scale = box.width / inner.offsetWidth || 1;
      // offsetWidth rounds fractional mobile widths; retain that precision
      // when mapping the original column's bounds into the overlay.
      const columnScale = box.width / parseFloat(getComputedStyle(inner).width) || 1;
      const gutter = parseFloat(getComputedStyle(inner).getPropertyValue("--lp-space-8"));
      const gap = parseFloat(getComputedStyle(inner).getPropertyValue("--lp-space-4"));
      const half = selector.offsetWidth / 2;
      const edge = Math.min(gutter, Math.max(0, inner.offsetWidth / 2 - half));
      const center = Math.max(half + edge, Math.min((title.right - box.left) / scale - gap, inner.offsetWidth - half - edge));
      placement.style.setProperty("--lp-audience-center", `${center}px`);
      placement.style.setProperty("--lp-audience-top", `${(title.top - box.top) / scale}px`);
      // Preserve the original column's horizontal alignment. On desktop,
      // center the terminal itself on the headline; phones keep the stacked
      // column. The hidden human content continues to define page geometry.
      inner.style.setProperty("--lp-agent-terminal-center", `${(title.top + title.height / 2 - box.top) / columnScale}px`);
      inner.style.setProperty("--lp-hero-col-top", `${(column.top - box.top) / columnScale}px`);
      inner.style.setProperty("--lp-hero-col-left", `${(column.left - box.left) / columnScale}px`);
      inner.style.setProperty("--lp-hero-col-width", `${column.width / columnScale}px`);
      inner.style.setProperty("--lp-hero-col-height", `${column.height / columnScale}px`);
      inner.dataset.titleReady = "true";
      placement.dataset.ready = "true";
    };
    const observer = new ResizeObserver(position);
    observer.observe(inner);
    observer.observe(heading);
    observer.observe(humanColumn);
    observer.observe(selector);
    position();
    return () => observer.disconnect();
  }, []);
  return <div ref={selectorRef} className="lp-audience-selector">
    <span className="lp-audience-selector__label" data-active={audience === "humans"}>For humans</span>
    <button
      type="button"
      className="lp-audience-switch"
      role="switch"
      aria-label="For agents"
      aria-checked={audience === "agents"}
      onClick={() => setAudience(current => current === "agents" ? "humans" : "agents")}
    >
      <span className="lp-audience-switch__track" aria-hidden="true">
        <span className="lp-audience-switch__thumb" />
      </span>
    </button>
    <span className="lp-audience-selector__label" data-active={audience === "agents"}>For agents</span>
  </div>;
}
