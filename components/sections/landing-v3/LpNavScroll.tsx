"use client";

import { useEffect } from "react";

/** The click id the LeadJourney tracker appends to every same-site link. */
const DECORATION_PARAMS = ["lj_click_id"];

/** The query string without the tracker's decoration, for "same page?" checks. */
function undecoratedSearch(params: URLSearchParams): string {
  const clean = new URLSearchParams(params);
  for (const key of DECORATION_PARAMS) clean.delete(key);
  clean.sort();
  return clean.toString();
}

/**
 * Sticky-nav scroll state (founder 2026-09-01: "comme Linear.app, une barre
 * en haut qui reste en permanence"). The bar itself is position:sticky in
 * nav.css — this only stamps .is-scrolled once the page leaves the very top,
 * flipping the bar from the artboard's transparent band to the opaque cream
 * chrome. rAF-throttled, passive, and idempotent.
 *
 * Same-page hash links (2026-10-07, code fallback for the LeadJourney link
 * setting): the tracker rewrites every same-site href to
 * /?lj_click_id=…#how-it-works, so Product, How it works, About and any
 * in-page anchor became a full reload (a second pageview in every analytics
 * tool) instead of a scroll. One click listener on window, mounted on every
 * page that carries the nav: a plain left click on a link to this pathname
 * (and this query, ignoring the tracker's param) with a hash whose target
 * exists → smooth scroll there (scroll-margin respected), the clean URL in
 * the address bar (replaceState, without the link's click id), a synthetic
 * hashchange for listeners that rely on it (the /guides/claude tabs), and on
 * a keyboard activation focus moves to the target like a native fragment
 * jump. Window + bubble phase on purpose: it runs LAST, so a link another
 * script already handled (the /for prompt rows → VxDemoPlayer, which bails
 * on defaultPrevented) is left alone; the phone sheet's onClick has closed
 * the sheet by then, and the scroll still waits a frame. The tracker still
 * decorates the hrefs, so copied links keep the click id until the
 * LeadJourney setting limits decoration to the app.
 */
export function LpNavScroll() {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".lp-nav");
    if (!nav) return;
    let ticking = false;
    const apply = () => {
      ticking = false;
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      if ((link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      const here = new URL(window.location.href);
      if (url.origin !== here.origin || url.pathname !== here.pathname) return;
      if (undecoratedSearch(url.searchParams) !== undecoratedSearch(here.searchParams)) return;
      let id = "";
      try {
        id = decodeURIComponent(url.hash.slice(1));
      } catch {
        return;
      }
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      e.preventDefault();
      const oldURL = window.location.href;
      const clean = `${here.pathname}${here.search}#${url.hash.slice(1)}`;
      // Keep Next's own history state: the App Router stores its tree there.
      window.history.replaceState(window.history.state, "", clean);
      if (window.location.href !== oldURL) {
        window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL, newURL: window.location.href }));
      }
      const keyboard = e.detail === 0;
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
        if (!keyboard) return;
        if (!target.hasAttribute("tabindex")) {
          target.setAttribute("tabindex", "-1");
          target.setAttribute("data-lp-hash-target", "");
          target.addEventListener(
            "blur",
            () => {
              target.removeAttribute("tabindex");
              target.removeAttribute("data-lp-hash-target");
            },
            { once: true },
          );
        }
        target.focus({ preventScroll: true });
      });
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  return null;
}
