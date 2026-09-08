/**
 * Vendor-neutral acquisition events for the landing funnel.
 *
 * This module is deliberately an allow-list: callers cannot attach arbitrary
 * form values, URLs, or query strings to an event. GTM owns all vendor mapping;
 * UI components only publish these product-level events to `dataLayer`.
 */

export const WAITLIST_CTA_IDS = [
  "waitlist_nav",
  "waitlist_hero",
  "waitlist_lead_finding",
  "waitlist_pricing_card",
  "waitlist_final",
  "waitlist_pricing_page",
] as const;

export const CALL_CTA_IDS = [
  "call_nav",
  "call_hero",
  "call_final",
  "call_pricing_page",
  "call_careers",
] as const;

/** The "Get started" links to app.getpancake.ai (waitlist retired 2026-08-24). */
export const APP_CTA_IDS = [
  "app_nav",
  "app_hero",
  "app_lead_finding",
  "app_pricing_card",
  "app_final",
  "app_pricing_page",
] as const;

export type WaitlistCtaId = (typeof WAITLIST_CTA_IDS)[number];
export type CallCtaId = (typeof CALL_CTA_IDS)[number];
export type AppCtaId = (typeof APP_CTA_IDS)[number];
export type AcquisitionCtaId = WaitlistCtaId | CallCtaId | AppCtaId;

const WAITLIST_CTA_ID_SET = new Set<string>(WAITLIST_CTA_IDS);
const CALL_CTA_ID_SET = new Set<string>(CALL_CTA_IDS);
const APP_CTA_ID_SET = new Set<string>(APP_CTA_IDS);
const ATTRIBUTION_QUERY_KEYS = new Set([
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
]);

export function isWaitlistCtaId(value: string | null): value is WaitlistCtaId {
  return value !== null && WAITLIST_CTA_ID_SET.has(value);
}

export function isCallCtaId(value: string | null): value is CallCtaId {
  return value !== null && CALL_CTA_ID_SET.has(value);
}

export function isAppCtaId(value: string | null): value is AppCtaId {
  return value !== null && APP_CTA_ID_SET.has(value);
}

type LeadFormContext = {
  form_id: "landing_waitlist";
  lead_type: "waitlist";
  cta_id: WaitlistCtaId;
};

type SchedulerContext = {
  /** The Calendly routing form (replaced zcal ZEHl48rv on 2026-09-07). */
  scheduler_id: "d3zd-2yc-x2s";
  cta_id: CallCtaId;
};

export type AcquisitionEventPayloads = {
  lead_form_viewed: LeadFormContext & { open_method: "cta" };
  lead_form_started: LeadFormContext;
  scheduler_opened: SchedulerContext & { presentation: "embed" };
  scheduler_loaded: SchedulerContext & { presentation: "embed" };
  scheduler_fallback_clicked: SchedulerContext;
  lead_submit_failed: LeadFormContext & {
    failure_type: "validation" | "server" | "network";
    status_code?: number;
  };
  lead_submitted: LeadFormContext & { handoff_count: number };
  app_cta_clicked: { cta_id: AppCtaId };
};

export type AcquisitionEventName = keyof AcquisitionEventPayloads;
export const PANCAKE_ACQUISITION_EVENT = "pancake:acquisition-event";

const ACQUISITION_EVENT_NAMES = new Set<AcquisitionEventName>([
  "lead_form_viewed",
  "lead_form_started",
  "scheduler_opened",
  "scheduler_loaded",
  "scheduler_fallback_clicked",
  "lead_submit_failed",
  "lead_submitted",
  "app_cta_clicked",
]);

export function isAcquisitionEventName(value: unknown): value is AcquisitionEventName {
  return typeof value === "string" && ACQUISITION_EVENT_NAMES.has(value as AcquisitionEventName);
}

type EventMetadata = {
  funnelStage: "lead" | "meeting" | "app";
  conversionTier: "primary" | "micro" | "diagnostic";
};

const EVENT_METADATA: Record<AcquisitionEventName, EventMetadata> = {
  lead_form_viewed: { funnelStage: "lead", conversionTier: "micro" },
  lead_form_started: { funnelStage: "lead", conversionTier: "micro" },
  scheduler_opened: { funnelStage: "meeting", conversionTier: "micro" },
  scheduler_loaded: { funnelStage: "meeting", conversionTier: "micro" },
  scheduler_fallback_clicked: { funnelStage: "meeting", conversionTier: "micro" },
  lead_submit_failed: { funnelStage: "lead", conversionTier: "diagnostic" },
  lead_submitted: { funnelStage: "lead", conversionTier: "primary" },
  // CTA clicks are micro by contract — signups convert in-app, not here.
  app_cta_clicked: { funnelStage: "app", conversionTier: "micro" },
};

type DataLayerWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
};

/**
 * GTM's data model can retain a Data Layer Variable from an earlier push.
 * Supplying every optional mapped field on every event prevents, for example,
 * a failed submission's `failure_type` from leaking onto the next Lead.
 */
export function emptyMappedEventFields() {
  return {
    page_view_kind: null,
    funnel_stage: null,
    conversion_tier: null,
    cta_id: null,
    form_id: null,
    lead_type: null,
    handoff_count: null,
    failure_type: null,
    status_code: null,
    scheduler_id: null,
    presentation: null,
    attribution_id: null,
  };
}

export function readAttributionId() {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("pancake_attribution="));
  if (!cookie) return null;

  try {
    const value = decodeURIComponent(cookie.slice("pancake_attribution=".length));
    const parsed = JSON.parse(value) as { aid?: unknown };
    return typeof parsed.aid === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(parsed.aid)
      ? parsed.aid
      : null;
  } catch {
    return null;
  }
}

function createEventId(eventName: AcquisitionEventName) {
  if (typeof window.crypto?.randomUUID === "function") {
    return `${eventName}.${window.crypto.randomUUID()}`;
  }

  return `${eventName}.${Date.now()}.${Math.random().toString(36).slice(2)}`;
}

/** `location.pathname` never contains campaign parameters or form input. */
function currentPagePath() {
  const path = window.location.pathname.split(/[?#]/, 1)[0] || "/";
  return path.startsWith("/") ? path.slice(0, 300) : "/";
}

/**
 * Keep campaign attribution available to GA while excluding arbitrary query
 * values (emails, tokens, form state, and other secrets) from every vendor.
 */
export function currentAnalyticsPageLocation() {
  const pagePath = currentPagePath();
  const cleanUrl = new URL(`${window.location.origin}${pagePath}`);
  const sourceParams = new URLSearchParams(window.location.search);

  for (const [key, value] of Array.from(sourceParams.entries())) {
    if (ATTRIBUTION_QUERY_KEYS.has(key)) {
      cleanUrl.searchParams.append(key, value.slice(0, 500));
    }
  }

  return cleanUrl.toString().slice(0, 1000);
}

function sanitizePayload(
  eventName: AcquisitionEventName,
  payload: AcquisitionEventPayloads[AcquisitionEventName],
): Record<string, string | number> | null {
  // Copy only named, bounded fields. Never spread caller input into dataLayer.
  const raw = payload as unknown as Record<string, unknown>;

  if (eventName === "app_cta_clicked") {
    const ctaId = typeof raw.cta_id === "string" ? raw.cta_id : null;
    if (!isAppCtaId(ctaId)) return null;
    return { cta_id: ctaId };
  }

  if (eventName.startsWith("lead_")) {
    const ctaId = typeof raw.cta_id === "string" ? raw.cta_id : null;
    if (!isWaitlistCtaId(ctaId)) return null;

    const clean: Record<string, string | number> = {
      form_id: "landing_waitlist",
      lead_type: "waitlist",
      cta_id: ctaId,
    };

    if (eventName === "lead_form_viewed") clean.open_method = "cta";

    if (eventName === "lead_submit_failed") {
      const failureType = raw.failure_type;
      if (failureType !== "validation" && failureType !== "server" && failureType !== "network") {
        return null;
      }
      clean.failure_type = failureType;
      if (
        typeof raw.status_code === "number" &&
        Number.isInteger(raw.status_code) &&
        raw.status_code >= 400 &&
        raw.status_code <= 599
      ) {
        clean.status_code = raw.status_code;
      }
    }

    if (eventName === "lead_submitted") {
      clean.handoff_count =
        typeof raw.handoff_count === "number" && Number.isFinite(raw.handoff_count)
          ? Math.max(0, Math.min(6, Math.trunc(raw.handoff_count)))
          : 0;
    }

    return clean;
  }

  const ctaId = typeof raw.cta_id === "string" ? raw.cta_id : null;
  if (!isCallCtaId(ctaId)) return null;

  const clean: Record<string, string | number> = {
    scheduler_id: "d3zd-2yc-x2s",
    cta_id: ctaId,
  };
  if (eventName === "scheduler_opened" || eventName === "scheduler_loaded") {
    clean.presentation = "embed";
  }
  return clean;
}

export function pushAcquisitionEvent<Name extends AcquisitionEventName>(
  eventName: Name,
  payload: AcquisitionEventPayloads[Name],
  options?: { eventId?: string },
): string | null {
  if (typeof window === "undefined") return null;

  const cleanPayload = sanitizePayload(
    eventName,
    payload as AcquisitionEventPayloads[AcquisitionEventName],
  );
  if (!cleanPayload) return null;

  // Durable conversions use the ID returned by the server after Airtable has
  // accepted the row. GTM can reuse it for browser/server deduplication across
  // Meta and any other destination. Micro-events remain client-generated.
  const eventId =
    eventName === "lead_submitted"
      ? cleanLeadConversionEventId(options?.eventId)
      : createEventId(eventName);
  if (!eventId) return null;
  const metadata = EVENT_METADATA[eventName];
  const attributionId = readAttributionId();
  const pagePath = currentPagePath();
  const analyticsWindow = window as DataLayerWindow;
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  const dataLayerEvent = {
    ...emptyMappedEventFields(),
    event: eventName,
    schema_version: 1,
    event_id: eventId,
    event_timestamp_ms: Date.now(),
    page_path: pagePath,
    page_location: currentAnalyticsPageLocation(),
    page_title: document.title.slice(0, 300),
    funnel_stage: metadata.funnelStage,
    conversion_tier: metadata.conversionTier,
    attribution_id: attributionId,
    ...cleanPayload,
  };
  analyticsWindow.dataLayer.push(dataLayerEvent);
  window.dispatchEvent(
    new CustomEvent(PANCAKE_ACQUISITION_EVENT, {
      detail: dataLayerEvent,
    }),
  );

  return eventId;
}

function cleanLeadConversionEventId(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^lead\.[0-9a-f]{64}$/.test(trimmed) ? trimmed : null;
}
