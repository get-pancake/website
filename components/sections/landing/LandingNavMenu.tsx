"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { DEMO_BOOKING_URL } from "@/lib/booking";

import { NAV_LINKS } from "./nav-links";

/**
 * Mobile nav menu — the plum sheet behind the ≤767px menu button (mobile QA
 * 2026-08-26: below the old breakpoint phones had no route to Pricing or How
 * it works above a footer ~13 viewports down). Footer-rhyme
 * surface: inverted plum, cream links, left-justified. Book a call rides the
 * same data-lv2-open="call" upgrade as the nav pill and reuses its
 * allowlisted cta id — the menu is part of the nav surface, and the
 * analytics contract stays untouched.
 */
export function LandingNavMenu() {
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
    // must wrap inside the sheet (same pattern as LandingModals).
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
  // next route scroll-locked — same belt-and-braces as LandingModals.
  useEffect(() => () => document.body.classList.remove("menu-open"), []);

  return (
    <>
      <button
        ref={openBtnRef}
        type="button"
        className="lv2-nav-menu-btn"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="lv2-nav-menu"
        onClick={show}
      >
        {/* two bars, not three — quieter, matches the kit's thin strokes */}
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden focusable="false">
          <path
            d="M2.5 6.5h15M2.5 13.5h15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <div
        ref={sheetRef}
        id="lv2-nav-menu"
        className={`lv2-nav-menu${open ? " is-open" : ""}`}
        hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="lv2-nav-menu-head">
          <button
            ref={closeBtnRef}
            type="button"
            className="lv2-nav-menu-close"
            aria-label="Close menu"
            onClick={close}
          >
            &#10005;
          </button>
        </div>
        <nav aria-label="Menu">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a key={link.href} href={link.href} onClick={close}>
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} prefetch={false} onClick={close}>
                {link.label}
              </Link>
            ),
          )}
          {/* target/rel mirror the nav pill: on pages without LandingModals
              (/privacy, /terms) the fallback opens a new tab instead of
              navigating the site away; the dialog's preventDefault suppresses
              it everywhere else. */}
          <a
            href={DEMO_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-lv2-open="call"
            data-analytics-id="call_nav"
            onClick={close}
          >
            Book a demo
          </a>
        </nav>
      </div>
    </>
  );
}
