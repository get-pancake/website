"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { APP_ORIGIN } from "@/lib/site-config.mjs";

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

  // Desktop "Industries" disclosure (LpNav renders it on the server; this
  // client island drives it). State lives on .lp-nav-ind as data-open, then
  // data-closing for the 200ms fade — nav.css keys the panel, the caret, the
  // bar's overflow and the links row's lift on those. Rules:
  // - a hovering pointer opens it once it SETTLES on the trigger for 100ms
  //   (a pointer still travelling re-arms the delay, so a Product→Blog sweep
  //   never flashes it); leaving starts a 250ms grace that re-entering the
  //   trigger or the panel cancels, and every move inside the triangle from
  //   the exit point to the card's top edge renews (a slow diagonal to the
  //   outer columns crosses the bar band, outside both, on the way);
  // - the caret button opens / closes it (click, Enter, Space); a click on a
  //   panel the hover just opened keeps it open instead of shutting it;
  // - Escape closes it and returns focus from the panel to the caret (WCAG
  //   1.4.13); ArrowUp / ArrowDown / Home / End walk the panel links;
  // - focus leaving the entry, or a press outside it, closes it;
  // - closing moves focus out of the panel first and makes the fading panel
  //   inert, so Tab during the fade lands on Company, never on <body>.
  // Touch (pointerType "touch", or a hover:none device): never opens —
  // "Industries" is the hub link and nav.css hides the caret.
  useEffect(() => {
    const ind = document.querySelector<HTMLElement>(".lp-nav-ind");
    const toggle = ind?.querySelector<HTMLButtonElement>(".lp-nav-ind__toggle");
    const panel = ind?.querySelector<HTMLElement>(".lp-nav-ind__panel");
    const nav = ind?.closest<HTMLElement>(".lp-nav");
    if (!ind || !toggle || !panel || !nav) return;

    const OPEN_DELAY = 100; // ms the pointer must rest before the panel opens
    const GRACE = 250; // ms after leaving before it closes
    const FADE = 200; // = the panel's transform / visibility transition
    const TRAVEL = 0.3; // px/ms: faster than this, the pointer is passing through
    const noHover = window.matchMedia("(hover: none)");

    let state: "closed" | "open" | "closing" = "closed";
    let pinned = false; // opened by the caret: pointer leave does not close it
    let hovering = false;
    let suppressed = false; // shut under a resting pointer: stays shut until it leaves
    let openTimer = 0;
    let graceTimer = 0;
    let fadeTimer = 0;
    let last = { x: 0, y: 0, t: 0 };
    let exit: { x: number; y: number } | null = null; // where the pointer left, above the card

    // The card spans the bar's frame (logo left edge → pills right edge), a
    // function of the bar's width: 100vw would count a classic scrollbar.
    const measure = () => ind.style.setProperty("--lp-nav-w", `${nav.clientWidth}px`);
    const links = () => Array.from(panel.querySelectorAll<HTMLAnchorElement>("a[href]"));

    const open = (byToggle: boolean) => {
      window.clearTimeout(openTimer);
      window.clearTimeout(graceTimer);
      if (byToggle) pinned = true;
      if (state === "open") return;
      window.clearTimeout(fadeTimer);
      measure();
      state = "open";
      panel.removeAttribute("inert");
      delete ind.dataset.closing;
      ind.dataset.open = "";
      toggle.setAttribute("aria-expanded", "true");
      window.addEventListener("resize", measure);
    };

    const close = () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(graceTimer);
      stopCorridor();
      if (state !== "open") return;
      state = "closing";
      pinned = false;
      // Focus first, inert second: inert on a focused subtree drops focus to <body>.
      if (panel.contains(document.activeElement)) toggle.focus({ preventScroll: true });
      panel.setAttribute("inert", "");
      delete ind.dataset.open;
      ind.dataset.closing = "";
      toggle.setAttribute("aria-expanded", "false");
      window.removeEventListener("resize", measure);
      fadeTimer = window.setTimeout(() => {
        state = "closed";
        delete ind.dataset.closing;
        panel.removeAttribute("inert");
      }, FADE);
    };

    // Safe triangle: exit point → the panel's top corners. A pointer moving
    // inside it is on its way to the card, so each move renews the grace; a
    // pointer that rests, or veers off (along the bar to Product / Company),
    // lets the grace run out.
    const onCorridor = (e: PointerEvent) => {
      if (!exit || state !== "open") return;
      const r = panel.getBoundingClientRect();
      if (e.clientY < exit.y - 2 || e.clientY > r.top + 2) return;
      const t = r.top > exit.y ? (e.clientY - exit.y) / (r.top - exit.y) : 1;
      const left = exit.x + (r.left - exit.x) * t;
      const right = exit.x + (r.right - exit.x) * t;
      if (e.clientX < left - 8 || e.clientX > right + 8) return;
      window.clearTimeout(graceTimer);
      graceTimer = window.setTimeout(close, GRACE);
    };
    const stopCorridor = () => {
      exit = null;
      document.removeEventListener("pointermove", onCorridor);
    };

    const arm = () => {
      window.clearTimeout(openTimer);
      openTimer = window.setTimeout(() => open(false), OPEN_DELAY);
    };
    const hoverable = (e: PointerEvent) => e.pointerType !== "touch" && !noHover.matches;

    const onEnter = (e: PointerEvent) => {
      if (!hoverable(e)) return;
      hovering = true;
      window.clearTimeout(graceTimer);
      stopCorridor();
      if (suppressed || state === "open") return;
      if (state === "closing") return open(false); // still on screen: take it back at once
      last = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      arm();
    };
    const onMove = (e: PointerEvent) => {
      if (!hovering || suppressed || state !== "closed") return;
      const dt = e.timeStamp - last.t;
      const travelled = Math.hypot(e.clientX - last.x, e.clientY - last.y);
      last = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      if (dt > 0 && travelled / dt > TRAVEL) arm();
    };
    const onLeave = (e: PointerEvent) => {
      if (!hoverable(e)) return;
      hovering = false;
      suppressed = false;
      window.clearTimeout(openTimer);
      if (state !== "open" || pinned) return;
      graceTimer = window.setTimeout(close, GRACE);
      if (e.clientY < panel.getBoundingClientRect().top) {
        exit = { x: e.clientX, y: e.clientY };
        document.addEventListener("pointermove", onCorridor);
      }
    };

    const onToggle = (e: MouseEvent) => {
      if (state === "open") {
        // A mouse click (detail > 0) on a panel the hover opened a beat
        // earlier means "open": keep it, pinned. Keys always toggle.
        if (!pinned && e.detail > 0) {
          pinned = true;
          return;
        }
        close();
        suppressed = hovering;
        return;
      }
      suppressed = false;
      open(true);
    };

    const onKey = (e: KeyboardEvent) => {
      if (state !== "open") return;
      if (e.key === "Escape") {
        close();
        suppressed = hovering;
        return;
      }
      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || !ind.contains(active)) return;
      const list = links();
      const at = list.indexOf(active as HTMLAnchorElement);
      let next = -1;
      if (e.key === "ArrowDown") next = at < 0 ? 0 : (at + 1) % list.length;
      else if (e.key === "ArrowUp") next = at < 0 ? list.length - 1 : (at - 1 + list.length) % list.length;
      else if (e.key === "Home" && at >= 0) next = 0;
      else if (e.key === "End" && at >= 0) next = list.length - 1;
      if (next < 0 || !list[next]) return;
      e.preventDefault();
      list[next]!.focus();
    };

    const onFocusOut = (e: FocusEvent) => {
      const to = e.relatedTarget;
      if (to instanceof Node && ind.contains(to)) return;
      if (!hovering) close();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (state === "open" && e.target instanceof Node && !ind.contains(e.target)) close();
    };
    const onHoverChange = () => {
      if (noHover.matches) close();
    };
    // Back/forward cache: the page comes back as it was left — possibly with
    // the panel open under a pointer that is long gone.
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      hovering = false;
      suppressed = false;
      close();
    };

    ind.addEventListener("pointerenter", onEnter);
    ind.addEventListener("pointermove", onMove);
    ind.addEventListener("pointerleave", onLeave);
    ind.addEventListener("focusout", onFocusOut);
    toggle.addEventListener("click", onToggle);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown, true);
    noHover.addEventListener("change", onHoverChange);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(graceTimer);
      window.clearTimeout(fadeTimer);
      stopCorridor();
      ind.removeEventListener("pointerenter", onEnter);
      ind.removeEventListener("pointermove", onMove);
      ind.removeEventListener("pointerleave", onLeave);
      ind.removeEventListener("focusout", onFocusOut);
      toggle.removeEventListener("click", onToggle);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown, true);
      noHover.removeEventListener("change", onHoverChange);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("resize", measure);
      delete ind.dataset.open;
      delete ind.dataset.closing;
      panel.removeAttribute("inert");
      toggle.setAttribute("aria-expanded", "false");
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
            href={APP_ORIGIN}
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
