"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";

export type Audience = "humans" | "agents";
type AudienceUpdate = Audience | ((current: Audience) => Audience);
const AudienceContext = createContext<{ audience: Audience; setAudience: (value: AudienceUpdate) => void }>({
  audience: "humans",
  setAudience: () => {},
});
export const useAudience = () => useContext(AudienceContext);

// AudienceHeadline (the human H1 + the agent typing line) moved to
// LpAudienceHeadline.tsx on 2026-10-09 (V2 replication phase 0: owner
// agents-view). This file keeps the provider and AudienceSelector (owner
// nav-hero).

const audienceFromUrl = (): Audience =>
  new URL(window.location.href).searchParams.get("audience") === "agents" ? "agents" : "humans";

/** A real URL for sharing/back/forward, without navigation or remounting art.
    The homepage is static (2026-10-07): the server always renders the humans
    view and the URL is read on mount, never during render. Reading it with
    useSearchParams (and the page's searchParams prop) made / dynamic: no CDN
    cache, about twice the TTFB of /pricing. A shared ?audience=agents link
    switches to the agents view once hydrated; both copies are in the HTML
    either way. */
export function LpAudience({ children }: { children: ReactNode }) {
  const [audience, setRenderedAudience] = useState<Audience>("humans");
  const desiredAudience = useRef<Audience>("humans");
  const committedAudience = useRef<Audience>("humans");
  const activeTransition = useRef<ViewTransition | null>(null);
  const request = useRef(0);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    // The URL picks the view on arrival (a shared ?audience=agents link, a
    // reload); browser history drives it after that.
    const arrived = audienceFromUrl();
    if (arrived !== committedAudience.current) {
      committedAudience.current = desiredAudience.current = arrived;
      setRenderedAudience(arrived);
    }
    const onPopState = () => {
      request.current += 1;
      activeTransition.current?.skipTransition();
      const current = audienceFromUrl();
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
    // a section anchor (#how-it-works, #pricing) points at a section the
    // other view may hide: the switched URL carries none
    url.hash = "";
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
  // The labels are click targets too (2026-10-07: tapping "For agents" did
  // nothing). They stay aria-hidden: the switch is the one control screen
  // readers and keyboards get, so there are never three controls for one state.
  return <div ref={selectorRef} className="lp-audience-selector">
    <span
      className="lp-audience-selector__label"
      data-active={audience === "humans"}
      aria-hidden="true"
      onClick={() => { if (audience !== "humans") setAudience("humans"); }}
    >For humans</span>
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
    <span
      className="lp-audience-selector__label"
      data-active={audience === "agents"}
      aria-hidden="true"
      onClick={() => { if (audience !== "agents") setAudience("agents"); }}
    >For agents</span>
  </div>;
}
