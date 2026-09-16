"use client";

import { useEffect, useRef, type RefObject } from "react";

import { isAppCtaId, pushAcquisitionEvent } from "@/lib/analytics/data-layer";

/**
 * The landing-v2 pill FX (FxPill.tsx) ported onto the v3 `.lp-btn` recipe —
 * founder-requested reuse (2026-08-28): a snake-palette circle expands from
 * the pointer to flood the pill while the label slides up (l1 exits, l2
 * arrives), retracting toward the exit point on leave. Geometry stays the
 * Figma-exact `.lp-btn`; the FX layers are pure overlays.
 * LpFxLink is the anchor twin (real navigations, "Book a demo" to /demo
 * included since 2026-09-16); LpFxPill is the button twin for in-page actions
 * (the /demo card's submit, Back, AI sales and restart pills).
 */

const FILLS = [
  "var(--lp-yellow-30)",
  "var(--lp-purple-30)",
  "var(--lp-green-20)",
];

/**
 * The fill a pill starts on is keyed to its label, so every "Start free"
 * runs the same yellow → purple → green cycle wherever it sits on the page.
 * The v2 port seeded by mount order instead (siblings on different fills),
 * which in production hydration order made the nav, hero and CTA "Get
 * started" flood yellow and the pricing one purple — one step off on every
 * hover after that too. The founder read it as a different animation
 * (2026-09-03: "the pricing Get started animation is not the good one, it
 * should be like for other buttons"). Same label, same sequence, now.
 */
/** The two site-wide CTAs get fixed, different starts (their hashes happen
 *  to collide); any other label hashes into the palette. */
const FILL_START: Record<string, number> = { "Start free": 0, "Book a demo": 1 };

function fillIndexFor(label: string): number {
  if (label in FILL_START) return FILL_START[label]!;
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0;
  return h % FILLS.length;
}

function useFxCircle(
  hostRef: RefObject<HTMLElement>,
  circleRef: RefObject<HTMLSpanElement>,
  label: string,
) {
  useEffect(() => {
    const host = hostRef.current;
    const c = circleRef.current;
    if (!host || !c) return;
    let count = fillIndexFor(label);

    const place = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2.35;
      c.style.width = `${d}px`;
      c.style.height = `${d}px`;
      c.style.left = `${e.clientX - r.left}px`;
      c.style.top = `${e.clientY - r.top}px`;
    };

    const onEnter = (e: PointerEvent) => {
      // Hovering pointers only: on touch, iOS fires pointerenter on tap and
      // the flood then sticks with no reliable leave (founder report
      // 2026-08-26). Touch gets the OS press feedback instead.
      if (e.pointerType === "touch") return;
      c.style.transition = "none";
      place(e);
      c.style.background = FILLS[count++ % 3]!;
      void c.offsetWidth; // commit the repositioned, unscaled circle before animating
      c.style.transition = "";
      c.style.transform = "translate(-50%,-50%) scale(1)";
      // The label swap is driven by this class, NOT :hover — CSS-only :hover
      // could slide the plum .l2 onto the still-plum pill with no flood
      // (stationary-cursor page load, pre-hydration, reduced-motion), leaving
      // the label invisible (QA audit 2026-08-28).
      host.classList.add("is-fx");
    };

    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      place(e);
      c.style.transform = "translate(-50%,-50%) scale(0)";
      host.classList.remove("is-fx");
    };

    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [hostRef, circleRef, label]);
}

export function LpFxLink({
  href,
  size,
  className,
  onClick,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  size?: "sm" | "lg";
  children: string;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);
  useFxCircle(linkRef, circleRef, children);

  // Same funnel wiring as v2's FxPillLink: app links emit the allow-listed
  // app_cta_clicked event (GTM/PostHog read it from dataLayer).
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    const ctaId = e.currentTarget.getAttribute("data-analytics-id");
    if (isAppCtaId(ctaId)) pushAcquisitionEvent("app_cta_clicked", { cta_id: ctaId });
  };

  return (
    <a
      {...rest}
      ref={linkRef}
      href={href}
      className={className ? `lp-btn ${className}` : "lp-btn"}
      data-size={size}
      onClick={handleClick}
    >
      <span className="lp-btn-fx" aria-hidden="true">
        <span ref={circleRef} className="c" />
      </span>
      <span className="lp-btn-label">
        <span className="l1">{children}</span>
        <span className="l2" aria-hidden="true">
          {children}
        </span>
      </span>
    </a>
  );
}

export function LpFxPill({
  size,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "lg";
  children: string;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);
  useFxCircle(btnRef, circleRef, children);

  return (
    <button
      type="button"
      {...rest}
      ref={btnRef}
      className={className ? `lp-btn ${className}` : "lp-btn"}
      data-size={size}
    >
      <span className="lp-btn-fx" aria-hidden="true">
        <span ref={circleRef} className="c" />
      </span>
      <span className="lp-btn-label">
        <span className="l1">{children}</span>
        <span className="l2" aria-hidden="true">
          {children}
        </span>
      </span>
    </button>
  );
}
