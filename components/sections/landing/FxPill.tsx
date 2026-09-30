"use client";

import Link from "next/link";
import { useEffect, useRef, type RefObject } from "react";

import { Button, type ButtonProps } from "@/components/ui/Button";
import { isAppCtaId, pushAcquisitionEvent } from "@/lib/analytics/data-layer";

/**
 * Kit Button wearing landing-v2's exact clothes — both halves of its hover:
 * the label slides up (l1 exits, l2 arrives) while a snake-palette circle
 * expands from the pointer to flood the button, retracting toward the exit
 * point on leave. Same port as the retired report page's FxButton (the
 * /ai-gtm-report scanner, removed 2026-09-30), scoped with lv2- class names
 * so the landing page carries its own styles. Geometry overrides live in
 * landing-v2.css under `.lv2 .button`. `FxPillLink` is the anchor twin for
 * real navigations.
 */

const FILLS = [
  "var(--palette-yellow-30)",
  "var(--palette-purple-30)",
  "var(--palette-green-20)",
];

/** Module-level seed so sibling buttons start on different fills, like the landing. */
let fxSeed = 0;

function useFxCircle(hostRef: RefObject<HTMLElement>, circleRef: RefObject<HTMLSpanElement>) {
  useEffect(() => {
    const host = hostRef.current;
    const c = circleRef.current;
    if (!host || !c) return;
    let count = fxSeed++;

    const place = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2.35;
      c.style.width = `${d}px`;
      c.style.height = `${d}px`;
      c.style.left = `${e.clientX - r.left}px`;
      c.style.top = `${e.clientY - r.top}px`;
    };

    const onEnter = (e: PointerEvent) => {
      // Hover FX is for hovering pointers only: on touch, iOS fires
      // pointerenter on tap and the flood then sticks (no reliable leave),
      // leaving the button stained after the finger lifts (founder report
      // 2026-08-26). Touch gets the OS press feedback instead.
      if (e.pointerType === "touch") return;
      c.style.transition = "none";
      place(e);
      c.style.background = FILLS[count++ % 3]!;
      void c.offsetWidth; // commit the repositioned, unscaled circle before animating
      c.style.transition = "";
      c.style.transform = "translate(-50%,-50%) scale(1)";
    };

    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      place(e);
      c.style.transform = "translate(-50%,-50%) scale(0)";
    };

    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [hostRef, circleRef]);
}

function FxInner({
  circleRef,
  children,
}: {
  circleRef: RefObject<HTMLSpanElement>;
  children: string;
}) {
  return (
    <>
      <span className="lv2-btn-fx" aria-hidden="true">
        <span ref={circleRef} className="c" />
      </span>
      <span className="lv2-btn-label">
        <span className="l1">{children}</span>
        <span className="l2" aria-hidden="true">
          {children}
        </span>
      </span>
    </>
  );
}

export function FxPill({ children, ...rest }: ButtonProps & { children: string }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);
  useFxCircle(btnRef, circleRef);

  return (
    <Button {...rest} ref={btnRef}>
      <FxInner circleRef={circleRef}>{children}</FxInner>
    </Button>
  );
}

/** The same pill as a real <a> — for navigations (SEO + middle-click). */
export function FxPillLink({
  href,
  variant,
  children,
  onClick,
  className,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: "outline";
  children: string;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);
  useFxCircle(linkRef, circleRef);

  // The waitlist pills used to emit lead_form_viewed on click; their app-link
  // replacements keep the funnel measurable through the allow-listed
  // app_cta_clicked event (GTM/PostHog read it from dataLayer).
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    const ctaId = e.currentTarget.getAttribute("data-analytics-id");
    if (isAppCtaId(ctaId)) pushAcquisitionEvent("app_cta_clicked", { cta_id: ctaId });
  };

  return (
    <Link
      {...rest}
      ref={linkRef}
      href={href}
      className={className ? `button ${className}` : "button"}
      data-variant={variant}
      onClick={handleClick}
    >
      <FxInner circleRef={circleRef}>{children}</FxInner>
    </Link>
  );
}
