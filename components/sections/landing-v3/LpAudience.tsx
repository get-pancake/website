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

/** The cut between the views: the hero fades up from this opacity over this
    long once the other view is committed (see setAudience). */
const AUDIENCE_CUT_FROM = 0.4;
const AUDIENCE_CUT_MS = 180;

/** The selector's "the click is taken" state, ahead of the commit. */
const setPending = (page: HTMLElement | null, value: Audience | null) => {
  page?.querySelectorAll<HTMLElement>(".lp-audience-selector").forEach(selector => {
    if (value) selector.setAttribute("data-pending", value);
    else selector.removeAttribute("data-pending");
  });
};

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
  const request = useRef(0);
  const main = useRef<HTMLElement>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    // The URL picks the view on arrival (a shared ?audience=agents link, a
    // reload); browser history drives it after that.
    const arrived = audienceFromUrl();
    if (arrived !== committedAudience.current) {
      committedAudience.current = desiredAudience.current = arrived;
      setRenderedAudience(arrived);
    }
    const page = main.current;
    const onPopState = () => {
      request.current += 1;
      setPending(page, null);
      const current = audienceFromUrl();
      committedAudience.current = desiredAudience.current = current;
      setRenderedAudience(current);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      request.current += 1;
      setPending(page, null);
    };
  }, []);

  /* The switch answers first, the page follows (founder 2026-10-12: "the
     untoggle from agents > human is slow … like there is a lag"). The View
     Transition this replaced froze the page for 80–160 ms while the browser
     captured both views (the humans view is the heavier one to render), then
     crossfaded for 240 ms: about 400 ms before the other view was readable.
     Now: (1) data-pending on the selector slides the thumb on the very next
     frame (audience.css; a transform transition, so the compositor keeps it
     moving while the main thread renders the other view; on the selector, not
     on <main>, so that frame restyles one row and not the page: on <main> it
     cost WebKit about 45 ms); (2) the view is committed
     right after that frame, with no snapshot and no crossfade; (3) the hero
     fades up from a little under full opacity so the cut is not hard. */
  const setAudience = useCallback((update: AudienceUpdate) => {
    const value = typeof update === "function" ? update(desiredAudience.current) : update;
    desiredAudience.current = value;
    const id = ++request.current;
    const page = main.current;
    const url = new URL(window.location.href);
    if (value === "agents") url.searchParams.set("audience", "agents");
    else url.searchParams.delete("audience");
    // a section anchor (#how-it-works, #pricing) points at a section the
    // other view may hide: the switched URL carries none
    url.hash = "";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const commit = () => {
      if (request.current !== id) return;
      const changed = committedAudience.current !== value;
      committedAudience.current = value;
      flushSync(() => {
        setRenderedAudience(value);
        if (url.href !== window.location.href) window.history.pushState(null, "", url);
        setAnnouncement(value === "agents" ? "For agents selected." : "For humans selected.");
      });
      setPending(page, null);
      if (changed && !reduced) {
        page?.querySelector<HTMLElement>(".lp-hero")?.animate(
          [{ opacity: AUDIENCE_CUT_FROM }, { opacity: 1 }],
          { duration: AUDIENCE_CUT_MS, easing: "cubic-bezier(.22, 1, .36, 1)" },
        );
      }
    };
    if (reduced || !page) {
      commit();
      return;
    }
    setPending(page, value);
    // one painted frame for the thumb, then the commit (a timeout after the
    // frame callback runs right after that frame's paint, sooner than a
    // second animation frame would)
    requestAnimationFrame(() => { setTimeout(commit, 0); });
  }, []);
  return (
    <AudienceContext.Provider value={{ audience, setAudience }}>
      {/* No id here: the skip link's #main-content target is the hero (LpHero), past the nav. */}
      <main ref={main} className="lp lp-audience-page" data-audience={audience}>
        <span className="lp-sr-only" role="status">{announcement}</span>
        {children}
      </main>
    </AudienceContext.Provider>
  );
}

/** The audience toggle — Figma V2 4939:3521 (row) / 4939:3523 (switch).
    In flow since V2 (designer red note 2026-10-09, "Humans/Agents toggle
    position and look"): it heads the hero's right column, server-rendered in
    place — no measuring, no overlay, no ready-gating. The active label is
    bold (700), the inactive one medium (500); each label reserves its bold
    width through `data-label` (audience.css ghost), so a weight swap never
    moves the switch. */
export function AudienceSelector() {
  const { audience, setAudience } = useAudience();
  // The labels are click targets too (2026-10-07: tapping "For agents" did
  // nothing). They stay aria-hidden: the switch is the one control screen
  // readers and keyboards get, so there are never three controls for one state.
  return <div className="lp-audience-selector">
    <span
      className="lp-audience-selector__label"
      data-label="For humans"
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
      data-label="For agents"
      data-active={audience === "agents"}
      aria-hidden="true"
      onClick={() => { if (audience !== "agents") setAudience("agents"); }}
    >For agents</span>
  </div>;
}
