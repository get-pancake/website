"use client";

import { useEffect, useState } from "react";

import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { APP_ORIGIN } from "@/lib/site-config.mjs";

/**
 * "Start free" on /guides/claude: the homepage pill (same target, app.pancake.ai), carrying the
 * incoming utm_* parameters so the ManyChat campaign survives the hop to the app. Server HTML
 * links the bare origin; the parameters are added after hydration.
 */
export function GuideStartFree({
  ctaId,
  size,
  className,
  children,
}: {
  ctaId: "app_guide_claude_hero" | "app_guide_claude_final";
  size?: "sm" | "lg";
  className?: string;
  children: string;
}) {
  const [href, setHref] = useState(APP_ORIGIN);

  useEffect(() => {
    const incoming = new URLSearchParams(window.location.search);
    const target = new URL(APP_ORIGIN);
    for (const [key, value] of Array.from(incoming.entries())) {
      if (key.startsWith("utm_")) target.searchParams.append(key, value.slice(0, 200));
    }
    // no URLSearchParams.size: older iOS WebViews (the Instagram in-app browser) lack it
    setHref(target.search ? target.toString() : APP_ORIGIN);
  }, []);

  return (
    <LpFxLink href={href} size={size} className={className} data-analytics-id={ctaId}>
      {children}
    </LpFxLink>
  );
}
