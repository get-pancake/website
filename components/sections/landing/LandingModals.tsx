"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { isCallCtaId, pushAcquisitionEvent } from "@/lib/analytics/data-layer";
import { DEMO_BOOKING_URL, DEMO_SCHEDULER_ID, demoBookingEmbedUrl } from "@/lib/booking";

import { suspendAllSnakes } from "./snake";

/**
 * The landing's booking dialog — the Calendly qualification form sheet. The
 * form asks two required questions and routes to the right demo event inside
 * Calendly; Calendly owns the questions and the routing, the site only opens
 * the form (lib/booking.ts). One instance mounts at page level; any element
 * anywhere on the page opens it via `data-lv2-open="call"` (a document-level
 * click listener, so server components can be triggers). The waitlist dialog
 * that used to live here was retired 2026-08-24 when every waitlist CTA
 * became a direct link to app.getpancake.ai.
 */

export function LandingModals() {
  const [open, setOpen] = useState(false);
  const [calLoud, setCalLoud] = useState(false);
  /** Mirror of open for the stable open() callback — the static page's
   *  re-entry guard (`if (open) return`) must survive useCallback([]). */
  const openRef = useRef(false);
  const lastFocus = useRef<Element | null>(null);
  const callRef = useRef<HTMLDivElement>(null);
  const calFrameRef = useRef<HTMLIFrameElement>(null);
  const activeCtaIdRef = useRef<string | null>(null);
  const frameLoadedRef = useRef(false);
  const schedulerLoadedRef = useRef(false);

  const close = useCallback(() => {
    openRef.current = false;
    setOpen(false);
    setCalLoud(false);
    document.body.classList.remove("modal-open");
    suspendAllSnakes(false);
    if (lastFocus.current instanceof HTMLElement) lastFocus.current.focus();
    activeCtaIdRef.current = null;
  }, []);

  const openDialog = useCallback((rawCtaId: string | null) => {
    if (openRef.current) return; // the dialog is already up — ignore background triggers

    const ctaId = isCallCtaId(rawCtaId) ? rawCtaId : null;
    activeCtaIdRef.current = ctaId;
    frameLoadedRef.current = false;
    schedulerLoadedRef.current = false;
    openRef.current = true;
    lastFocus.current = document.activeElement;
    setOpen(true);
    document.body.classList.add("modal-open");
    suspendAllSnakes(true);

    if (isCallCtaId(ctaId)) {
      pushAcquisitionEvent("scheduler_opened", {
        scheduler_id: DEMO_SCHEDULER_ID,
        cta_id: ctaId,
        presentation: "embed",
      });
    }
  }, []);

  // Unmount with the dialog open (client-side navigation) must not strand the
  // page scroll-locked or the snakes pointer-suspended on the next route.
  useEffect(
    () => () => {
      document.body.classList.remove("modal-open");
      suspendAllSnakes(false);
    },
    [],
  );

  // Any [data-lv2-open="call"] element on the page is a trigger. Triggers may
  // be links carrying the booking URL as an href fallback (they still work as
  // plain links on pages that don't mount this component) — preventDefault
  // keeps the dialog from also navigating here.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = (e.target as Element | null)?.closest?.("[data-lv2-open]");
      if (!t) return;
      if (t.getAttribute("data-lv2-open") !== "call") return;
      e.preventDefault();
      openDialog(t.getAttribute("data-analytics-id"));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [openDialog]);

  // Focus management + Escape + tab trap, straight from the static page.
  useEffect(() => {
    if (!open) return;
    const scrim = callRef.current;
    if (!scrim) return;
    const first = scrim.querySelector<HTMLElement>("[data-lv2-close]");
    requestAnimationFrame(() => first?.focus());

    const focusables = () =>
      Array.from(
        scrim.querySelectorAll<HTMLElement>(
          'button, input, textarea, a[href], iframe, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("hidden") && el.offsetParent !== null);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const firstEl = items[0]!,
        lastEl = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // If the frame is blocked (third-party storage, extension, strict privacy
  // mode) the fallback link is the way through — surface it after a beat.
  // Calendly sizes itself inside the frame; landing-v2.css sets its responsive height.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      const f = calFrameRef.current;
      try {
        if (!f || !f.contentWindow || !frameLoadedRef.current) setCalLoud(true);
      } catch {
        setCalLoud(true);
      }
    }, 3500);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <div
      ref={callRef}
      className={`lv2-scrim${open ? " is-open" : ""}`}
      hidden={!open}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="lv2-sheet is-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lv2-call-title"
      >
        <button
          type="button"
          className="lv2-sheet-close"
          data-lv2-close=""
          aria-label="Close"
          onClick={close}
        >
          &#10005;
        </button>
        <h3 id="lv2-call-title" className="lv2-call-title">
          Book a demo
        </h3>
        <div className="lv2-cal-wrap">
          {/* the Calendly iframe exists only while the dialog is open */}
          {open && (
            <iframe
              ref={calFrameRef}
              className="lv2-cal-frame"
              title="Book a demo with Pancake"
              allow="clipboard-write; camera; microphone"
              referrerPolicy="no-referrer-when-downgrade"
              src={demoBookingEmbedUrl()}
              onLoad={() => {
                frameLoadedRef.current = true;
                if (schedulerLoadedRef.current) return;
                const ctaId = activeCtaIdRef.current;
                if (!isCallCtaId(ctaId)) return;
                schedulerLoadedRef.current = true;
                pushAcquisitionEvent("scheduler_loaded", {
                  scheduler_id: DEMO_SCHEDULER_ID,
                  cta_id: ctaId,
                  presentation: "embed",
                });
              }}
            />
          )}
        </div>
        <p className={`lv2-sheet-note${calLoud ? " is-loud" : ""}`}>
          Two quick questions route you to the right demo, then pick your slot. Form not loading?{" "}
          <a
            href={DEMO_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              const ctaId = activeCtaIdRef.current;
              if (!isCallCtaId(ctaId)) return;
              pushAcquisitionEvent("scheduler_fallback_clicked", {
                scheduler_id: DEMO_SCHEDULER_ID,
                cta_id: ctaId,
              });
            }}
          >
            Open it in a new tab
          </a>
          .
        </p>
      </div>
    </div>
  );
}
