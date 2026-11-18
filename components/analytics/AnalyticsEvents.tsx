"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  currentAnalyticsPageLocation,
  emptyMappedEventFields,
  pushToDataLayer,
  readAttributionId,
} from "@/lib/analytics/data-layer";

let lastPageViewKey: string | null = null;

function createPageViewId() {
  if (typeof window.crypto?.randomUUID === "function") {
    return `page_view.${window.crypto.randomUUID()}`;
  }

  return `page_view.${Date.now()}.${Math.random().toString(36).slice(2)}`;
}

/**
 * Publish one vendor-neutral page view for the initial load and every App
 * Router navigation. Only the campaign/click identifiers allow-listed by the
 * data-layer helper survive in `page_location`; arbitrary query values can
 * contain emails, magic-link tokens, or other secrets and are discarded.
 */
export function AnalyticsEvents() {
  return (
    <Suspense fallback={null}>
      <AnalyticsEventEffects />
    </Suspense>
  );
}

function AnalyticsEventEffects() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const mountedRef = useRef(false);

  useEffect(() => {
    const cleanPath = pathname.startsWith("/") ? pathname.slice(0, 300) : "/";
    const pageLocation = currentAnalyticsPageLocation();
    const pageViewKey = `${pageLocation}|${document.title}`;
    if (lastPageViewKey === pageViewKey) return;
    lastPageViewKey = pageViewKey;

    const attributionId = readAttributionId();
    // If Google's tag fails on it, this page view is skipped and the page stays.
    pushToDataLayer({
      ...emptyMappedEventFields(),
      event: "page_view",
      schema_version: 1,
      event_id: createPageViewId(),
      event_timestamp_ms: Date.now(),
      page_path: cleanPath,
      page_location: pageLocation,
      page_title: document.title.slice(0, 300),
      page_view_kind: mountedRef.current ? "virtual" : "initial",
      source: "next_app_router",
      attribution_id: attributionId,
    });

    mountedRef.current = true;
  }, [pathname, routeKey]);

  return null;
}
