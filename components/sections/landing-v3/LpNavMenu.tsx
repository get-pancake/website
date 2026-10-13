"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { APP_ORIGIN } from "@/lib/site-config.mjs";

/** One page in a nav menu (LpNav's RESOURCES_MENU). */
export type LpNavItem = {
  /** ≤ 3 words. The desktop panels and the phone sheet both show it alone. */
  label: string;
  href: string;
};

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
 * 2026-10-07: the sheet carries the desktop bar's entries — Product,
 * Industries, Pricing, Resources as a labelled list (LpNav's RESOURCES_MENU,
 * the same prop, so both stay in step), Sign in. Product is one link since
 * 2026-10-13, like the bar's. The CTA pair sticks to the sheet's foot when
 * the list is taller than the screen.
 */
export function LpNavMenu({ resources }: { resources: LpNavItem[] }) {
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

  // Desktop disclosures — Industries, Resources (LpNav renders them
  // on the server; this client island drives them). One controller per
  // .lp-nav-dd entry (wireDisclosure below), and one open at a time: an
  // entry that opens closes the others.
  useEffect(() => {
    const entries = Array.from(document.querySelectorAll<HTMLElement>(".lp-nav .lp-nav-dd"));
    const wired: Disclosure[] = [];
    const closeOthers = (self: Disclosure) => {
      for (const d of wired) if (d !== self) d.close();
    };
    for (const entry of entries) {
      const d = wireDisclosure(entry, closeOthers);
      if (d) wired.push(d);
    }
    return () => {
      for (const d of wired) d.destroy();
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
        {/* Same groups, labels and hrefs as the desktop bar (LpNav) — one
            source of nav truth. Labelled lists, hairlines between groups. */}
        <nav aria-label="Menu">
          <ul className="lp-nav-menu-group">
            {/* same-page hash (/#how-it-works on the homepage): close()
                shuts the sheet first, then LpNavScroll scrolls */}
            <li>
              <a href="/#how-it-works" onClick={close}>
                Product
              </a>
            </li>
            {/* the /for hub (the desktop bar's Industries panel lists every
                vertical; on phones the hub page is the list) */}
            <li>
              <a href="/for" onClick={close}>
                Industries
              </a>
            </li>
            <li>
              <a href="/pricing" onClick={close}>
                Pricing
              </a>
            </li>
          </ul>
          <SheetGroup id="lp-nav-menu-resources" label="Resources" items={resources} onPick={close} />
          <ul className="lp-nav-menu-group">
            {/* 2026-10-07: the bar's "Sign in" (returning customers), same
                signin_nav id, kept out of the acquisition allow-list. */}
            <li>
              <a href={APP_ORIGIN} data-analytics-id="signin_nav" onClick={close}>
                Sign in
              </a>
            </li>
          </ul>
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

/** A labelled list in the phone sheet: small caps label over its links. */
function SheetGroup({
  id,
  label,
  items,
  onPick,
}: {
  id: string;
  label: string;
  items: LpNavItem[];
  onPick: () => void;
}) {
  return (
    <div className="lp-nav-menu-group">
      <p className="lp-nav-menu-label" id={id}>
        {label}
      </p>
      <ul aria-labelledby={id}>
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href} onClick={onPick}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Disclosure = { close: () => void; destroy: () => void };

/**
 * One desktop ▾ entry (.lp-nav-dd: the button, the panel). State lives on the
 * entry as data-open, then data-closing for the 200ms fade — nav.css keys the
 * panel, the caret, the bar's overflow and the links row's lift on those.
 * Click only since 2026-10-13 (founder: "Pas de hover"): a pointer passing
 * over the bar opens nothing; mouse, touch and keyboard share one path.
 * - the button opens / closes it (click, tap, Enter, Space);
 * - Escape closes it and returns focus from the panel to the button (WCAG
 *   1.4.13); ArrowUp / ArrowDown / Home / End walk the panel links;
 * - focus moving out of the entry, or a press outside it, closes it;
 * - another entry opening closes it (one open at a time, 2026-10-07);
 * - closing moves focus out of the panel first and makes the fading panel
 *   inert, so Tab during the fade lands on the next entry, never on <body>.
 */
function wireDisclosure(entry: HTMLElement, closeOthers: (self: Disclosure) => void): Disclosure | null {
  const trigger = entry.querySelector<HTMLButtonElement>("button.lp-nav-dd__trigger");
  const panel = entry.querySelector<HTMLElement>(".lp-nav-dd__panel");
  const nav = entry.closest<HTMLElement>(".lp-nav");
  if (!trigger || !panel || !nav) return null;

  const FADE = 200; // = the panel's transform / visibility transition

  let state: "closed" | "open" | "closing" = "closed";
  let fadeTimer = 0;

  // The Industries card spans the bar's frame (logo left edge → pills right
  // edge), a function of the bar's width: 100vw would count a classic
  // scrollbar. The compact card sizes to its content and ignores it.
  // Every card's max-height counts from where the bar actually sits:
  // /guides/claude's promo bar pushes it down, and a fixed 100vh − 124px ran
  // the card's foot off the screen.
  const measure = () => {
    entry.style.setProperty("--lp-nav-w", `${nav.clientWidth}px`);
    entry.style.setProperty("--lp-nav-top", `${Math.round(nav.getBoundingClientRect().top)}px`);
  };
  const links = () => Array.from(panel.querySelectorAll<HTMLAnchorElement>("a[href]"));

  const open = () => {
    if (state === "open") return;
    closeOthers(self);
    window.clearTimeout(fadeTimer);
    measure();
    state = "open";
    panel.removeAttribute("inert");
    delete entry.dataset.closing;
    entry.dataset.open = "";
    trigger.setAttribute("aria-expanded", "true");
    window.addEventListener("resize", measure);
  };

  const close = () => {
    if (state !== "open") return;
    state = "closing";
    // Focus first, inert second: inert on a focused subtree drops focus to <body>.
    if (panel.contains(document.activeElement)) trigger.focus({ preventScroll: true });
    panel.setAttribute("inert", "");
    delete entry.dataset.open;
    entry.dataset.closing = "";
    trigger.setAttribute("aria-expanded", "false");
    window.removeEventListener("resize", measure);
    fadeTimer = window.setTimeout(() => {
      state = "closed";
      delete entry.dataset.closing;
      panel.removeAttribute("inert");
    }, FADE);
  };

  const onTrigger = () => {
    if (state === "open") close();
    else open();
  };

  const onKey = (e: KeyboardEvent) => {
    if (state !== "open") return;
    if (e.key === "Escape") {
      close();
      return;
    }
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !entry.contains(active)) return;
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

  // Focus moving to another element closes it. Focus going nowhere does not:
  // a press on the card's padding or a category heading blurs the button
  // without leaving the entry (a press outside closes through onPointerDown).
  const onFocusOut = (e: FocusEvent) => {
    const to = e.relatedTarget;
    if (to instanceof Node && !entry.contains(to)) close();
  };
  const onPointerDown = (e: PointerEvent) => {
    if (state === "open" && e.target instanceof Node && !entry.contains(e.target)) close();
  };
  // Back/forward cache: the page comes back as it was left, possibly with
  // the panel open.
  const onPageShow = (e: PageTransitionEvent) => {
    if (e.persisted) close();
  };

  entry.addEventListener("focusout", onFocusOut);
  trigger.addEventListener("click", onTrigger);
  document.addEventListener("keydown", onKey);
  document.addEventListener("pointerdown", onPointerDown, true);
  window.addEventListener("pageshow", onPageShow);

  const self: Disclosure = {
    close,
    destroy: () => {
      window.clearTimeout(fadeTimer);
      entry.removeEventListener("focusout", onFocusOut);
      trigger.removeEventListener("click", onTrigger);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("resize", measure);
      delete entry.dataset.open;
      delete entry.dataset.closing;
      panel.removeAttribute("inert");
      trigger.setAttribute("aria-expanded", "false");
    },
  };
  return self;
}
