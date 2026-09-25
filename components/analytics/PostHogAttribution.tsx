"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

import {
  isAcquisitionEventName,
  PANCAKE_ACQUISITION_EVENT,
} from "@/lib/analytics/data-layer";
import { isProductionSiteHost, POSTHOG_ORIGIN } from "@/lib/site-config.mjs";

const POSTHOG_KEY = "phc_zPxWVjFcxYkbR7VnfdFkxvWdaGNChzVa2Yjmwe5PSrey";
const POSTHOG_HOST = POSTHOG_ORIGIN;
const POSTHOG_UI_HOST = "https://eu.posthog.com";

const attributionKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "fbclid",
  "gclid",
  "gbraid",
  "wbraid",
  "li_fat_id",
  "msclkid",
  "rdt_cid",
  "ttclid",
  "twclid",
] as const;

const latestTouchKeys = [...attributionKeys, "landing_url", "referrer"] as const;

let initialized = false;
let lastCapturedPageUrl: string | null = null;

export function PostHogAttribution() {
  return (
    <Suspense fallback={null}>
      <PostHogAttributionEffects />
    </Suspense>
  );
}

function PostHogAttributionEffects() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    if (!isApprovedProductionHost()) return;
    if (initialized) return;

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      ui_host: POSTHOG_UI_HOST,
      person_profiles: "identified_only",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_heatmaps: false,
      capture_performance: false,
      disable_session_recording: true,
      cross_subdomain_cookie: true,
      mask_personal_data_properties: true,
      custom_personal_data_properties: [
        "email",
        "secret",
        "token",
        "access_token",
        "code",
        "key",
        "password",
      ],
      before_send: (event) => {
        if (!event) return null;
        return {
          ...event,
          properties: sanitizePostHogProperties(event.properties),
          $set: sanitizePostHogProperties(event.$set),
          $set_once: sanitizePostHogProperties(event.$set_once),
        };
      },
    });
    initialized = true;

    const attribution = readAttribution();
    const context = readContext();
    const initialAttribution = prefixKeys("pancake_initial_", {
      ...attribution,
      ...context,
    });
    const latestAttribution = prefixKeys("pancake_latest_", {
      ...attribution,
      ...context,
    });

    posthog.register_once(initialAttribution);
    clearLatestTouchSuperProperties();
    posthog.register(latestAttribution);
    posthog.setPersonProperties(
      {
        ...emptyLatestTouchProperties(),
        ...latestAttribution,
      },
      initialAttribution,
    );

    capturePageView();

    if (Object.keys(attribution).length > 0 || document.referrer) {
      posthog.capture("marketing_landing_viewed", {
        $current_url: context.landing_url,
        ...attribution,
        ...context,
      });
    }
  }, []);

  useEffect(() => {
    if (!isApprovedProductionHost()) return;
    capturePageView();
  }, [routeKey]);

  useEffect(() => {
    if (!isApprovedProductionHost()) return;
    const captureAcquisitionEvent = (rawEvent: Event) => {
      if (!(rawEvent instanceof CustomEvent) || !isRecord(rawEvent.detail)) return;
      const eventName = rawEvent.detail.event;
      if (!isAcquisitionEventName(eventName)) return;

      posthog.capture(eventName, cleanAcquisitionProperties(rawEvent.detail));
    };

    window.addEventListener(PANCAKE_ACQUISITION_EVENT, captureAcquisitionEvent);
    return () => window.removeEventListener(PANCAKE_ACQUISITION_EVENT, captureAcquisitionEvent);
  }, []);

  return null;
}

function readAttribution() {
  const params = new URLSearchParams(window.location.search);
  const attribution: Record<string, string> = {};
  for (const key of attributionKeys) {
    const value = params.get(key);
    if (value) attribution[key] = value.slice(0, 500);
  }
  return attribution;
}

function readContext() {
  const context: Record<string, string> = {
    landing_url: cleanLandingUrl(window.location.href),
  };
  if (document.referrer) {
    const referrer = cleanReferrer(document.referrer);
    if (referrer) context.referrer = referrer;
  }
  return context;
}

function prefixKeys(prefix: string, values: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [`${prefix}${key}`, value]),
  );
}

function clearLatestTouchSuperProperties() {
  for (const key of latestTouchKeys) {
    posthog.unregister(`pancake_latest_${key}`);
  }
}

function emptyLatestTouchProperties() {
  return Object.fromEntries(
    latestTouchKeys.map((key) => [`pancake_latest_${key}`, null]),
  );
}

function capturePageView() {
  if (!isApprovedProductionHost()) return;
  const pageUrl = cleanLandingUrl(window.location.href);
  if (lastCapturedPageUrl === pageUrl) return;
  lastCapturedPageUrl = pageUrl;

  posthog.capture("$pageview", {
    $current_url: pageUrl,
    ...readAttribution(),
    ...readContext(),
  });
}

/** Both domains, apex and www: `cross_subdomain_cookie` scopes PostHog's cookie to the one visited. */
function isApprovedProductionHost() {
  return isProductionSiteHost(window.location.hostname);
}

function cleanLandingUrl(value: string) {
  try {
    const sourceUrl = new URL(value);
    const cleanUrl = new URL(sourceUrl.toString());
    cleanUrl.search = "";
    cleanUrl.hash = "";

    for (const [key, parameterValue] of Array.from(sourceUrl.searchParams.entries())) {
      if (attributionKeys.includes(key as (typeof attributionKeys)[number])) {
        cleanUrl.searchParams.append(key, parameterValue.slice(0, 500));
      }
    }

    return cleanUrl.toString();
  } catch {
    return "";
  }
}

function cleanReferrer(value: string) {
  try {
    const referrer = new URL(value);
    if (referrer.protocol !== "https:" && referrer.protocol !== "http:") return "";
    return `${referrer.protocol}//${referrer.host}/`;
  } catch {
    return "";
  }
}

function sanitizePostHogProperties<T extends Record<string, unknown> | undefined>(properties: T): T {
  if (!properties) return properties;

  const sanitized = Object.fromEntries(
    Object.entries(properties).map(([key, value]) => {
      if (typeof value !== "string") return [key, value];

      const normalizedKey = key.toLowerCase();
      const isUrl = normalizedKey === "$current_url" || normalizedKey.endsWith("_url");
      const isReferrer = normalizedKey === "$referrer" || normalizedKey.endsWith("referrer");

      if (isReferrer) return [key, cleanReferrer(value)];
      return isUrl ? [key, cleanLandingUrl(value)] : [key, value];
    }),
  );

  return sanitized as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const ACQUISITION_PROPERTY_KEYS = new Set([
  "schema_version",
  "event_id",
  "event_timestamp_ms",
  "page_path",
  "page_location",
  "page_title",
  "funnel_stage",
  "conversion_tier",
  "attribution_id",
  "form_id",
  "lead_type",
  "cta_id",
  "open_method",
  "handoff_count",
  "failure_type",
  "status_code",
  "scheduler_id",
  "presentation",
]);

function cleanAcquisitionProperties(detail: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(detail).filter(
      ([key, value]) =>
        ACQUISITION_PROPERTY_KEYS.has(key) &&
        (typeof value === "string" || typeof value === "number" || typeof value === "boolean"),
    ),
  );
}
