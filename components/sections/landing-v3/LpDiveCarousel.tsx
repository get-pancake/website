"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { mountDiveCarousel } from "./lp-dive-carousel";

/**
 * The deep-dive carousel's one client island: the row (tab list + stage), server-rendered by
 * LpDive and passed in as children, with the driver (lp-dive-carousel.ts) mounted on it. All
 * four tabs, bodies and stage pictures are in the server HTML (SEO, no JS, reduced motion); the
 * driver then owns the selection state in the DOM. Owner: blue-band package.
 */
export function LpDiveCarousel({
  className,
  fallback,
  children,
}: {
  className?: string;
  /** s an item without a playable timeline keeps its picture (lp-dive-data DIVE_FALLBACK_S) */
  fallback: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = ref.current;
    if (!row) return;
    return mountDiveCarousel(row, { fallback });
  }, [fallback]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
