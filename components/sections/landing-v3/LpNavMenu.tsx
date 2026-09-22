"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { DEMO_PAGE_PATH } from "@/lib/booking";

/**
 * Mobile nav menu — burger + plum sheet behind the ≤767px bar (Figma mobile
 * artboard 4389:8182 draws only the closed bar: logo left, three-line burger
 * right — 23.88w, 2px strokes, 6.65px apart, right edge 28.44 from the frame).
 * The open state is not designed in Figma, so it follows the kit + the v2
 * contract (LandingNavMenu): full-screen inverted-plum sheet, cream links,
 * left-justified, Escape closes, focus trapped, body scroll locked via
 * body.menu-open (same :has(main.lp) scoping as the modal lock).
 * The bar's "Get started" pill moves in here on mobile and keeps its
 * allow-listed app_nav id; "Book a demo" is a same-tab link to /demo, like
 * the bar's pill (François, 2026-09-16), and keeps its call_nav id.
 */
export function LpNavMenu() {
  const [open, setOpen] = useState(false);
  const openBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    document.body.classList.remove("menu-open");
    openBtnRef.current?.focus();
  }, []);

  const show = useCallback(() => {
    setOpen(true);
    document.body.classList.add("menu-open");
  }, []);

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
    // Escape + Tab trap — aria-modal promises containment, so keyboard focus
    // must wrap inside the sheet (same pattern as LpModals).
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const sheet = sheetRef.current;
      if (!sheet) return;
      const items = Array.from(
        sheet.querySelectorAll<HTMLElement>("button, a[href]"),
      ).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0]!,
        last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    // Rotating past the breakpoint hides the button that manages the sheet —
    // close rather than strand a full-screen overlay with no visible owner.
    const mq = window.matchMedia("(min-width: 768px)");
    const onMq = () => {
      if (mq.matches) close();
    };
    mq.addEventListener("change", onMq);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open, close]);

  // Unmount with the menu open (client-side navigation) must not strand the
  // next route scroll-locked — same belt-and-braces as LpModals.
  useEffect(() => () => document.body.classList.remove("menu-open"), []);

  // Desktop "Industries" panel (LpNav, CSS :hover / :focus-within): Escape
  // dismisses it without moving the pointer or losing the keyboard place
  // (WCAG 1.4.13) — focus returns to the Industries link and the panel stays
  // shut until the pointer leaves or focus leaves the entry.
  useEffect(() => {
    const ind = document.querySelector<HTMLElement>(".lp-nav-ind");
    if (!ind) return;
    const trigger = ind.querySelector<HTMLElement>(".lp-nav-ind__trigger");
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const focusedInside = ind.contains(document.activeElement);
      if (!focusedInside && !ind.matches(":hover")) return;
      ind.dataset.dismissed = "";
      if (focusedInside) trigger?.focus();
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!ind.contains(e.relatedTarget as Node | null)) delete ind.dataset.dismissed;
    };
    const onLeave = () => {
      if (!ind.contains(document.activeElement)) delete ind.dataset.dismissed;
    };
    document.addEventListener("keydown", onKey);
    ind.addEventListener("focusout", onFocusOut);
    ind.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("keydown", onKey);
      ind.removeEventListener("focusout", onFocusOut);
      ind.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      <button
        ref={openBtnRef}
        type="button"
        className="lp-nav-menu-btn"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="lp-nav-menu"
        onClick={show}
      >
        {/* Figma-exact burger: three 2px plum lines, 23.88 wide, 6.65 apart */}
        <svg
          width="23.88"
          height="15.3"
          viewBox="0 0 23.88 15.3"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M0 1h23.88M0 7.65h23.88M0 14.3h23.88"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </button>
      <div
        ref={sheetRef}
        id="lp-nav-menu"
        className={`lp-nav-menu${open ? " is-open" : ""}`}
        hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="lp-nav-menu-head">
          <button
            ref={closeBtnRef}
            type="button"
            className="lp-nav-menu-close"
            aria-label="Close menu"
            onClick={close}
          >
            &#10005;
          </button>
        </div>
        {/* Same labels/hrefs as the desktop bar (LpNav) — one source of nav truth. */}
        <nav aria-label="Menu">
          <a href="/#how-it-works" onClick={close}>
            Product
          </a>
          {/* the /for hub (the desktop bar's Industries panel lists every
              vertical; on phones the hub page is the list) */}
          <a href="/for" onClick={close}>
            Industries
          </a>
          <a href="/#why" onClick={close}>
            Company
          </a>
          <a href="/blog" onClick={close}>
            Blog
          </a>
        </nav>
        <div className="lp-nav-menu-ctas">
          <LpFxLink
            href="https://app.getpancake.ai"
            className="lp-nav-menu-app"
            data-analytics-id="app_nav"
            onClick={close}
          >
            Start free
          </LpFxLink>
          {/* Same tab: /demo is part of the site. close() unlocks the body
              scroll before the navigation, as for the links above. */}
          <LpFxLink
            href={DEMO_PAGE_PATH}
            className="lp-btn--outline lp-btn--demo lp-nav-menu-call"
            data-analytics-id="call_nav"
            onClick={close}
          >
            Book a demo
          </LpFxLink>
        </div>
      </div>
    </>
  );
}
