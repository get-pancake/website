"use client";

import { useEffect } from "react";

import {
  isAcquisitionEventName,
  PANCAKE_ACQUISITION_EVENT,
} from "@/lib/analytics/data-layer";
import { isProductionSiteHost } from "@/lib/site-config.mjs";

/**
 * Browser twin of the server-side Meta CAPI `Lead` conversion.
 *
 * The waitlist API route sends the authoritative CAPI Lead with the durable
 * `lead.<sha256>` event ID. Meta's browser/server deduplication needs a Pixel
 * event carrying the SAME event name and `eventID`; the Pixel side contributes
 * the browser match signals (fbp/fbc cookies, live page context) that lift the
 * event match quality of the server event it dedupes against.
 *
 * The Pixel bootstrap itself lives in `app/layout.tsx` (production-gated, so
 * this component is only mounted when `fbq` exists). The GTM web container was
 * audited on 2026-08-25 and carries no Meta tag, so firing the twin here — next
 * to the code-owned PageView — cannot double-send; if a Meta Lead tag is ever
 * added to GTM instead, remove this component in the same change.
 *
 * No PII crosses here: the listener consumes the same allowlisted, vendor-
 * neutral `lead_submitted` payload the data layer publishes (never form
 * values), and Meta matching stays cookie/CAPI-based.
 */

const LEAD_EVENT_ID_RE = /^lead\.[0-9a-f]{64}$/;

type MetaPixelWindow = Window & {
  fbq?: (...args: unknown[]) => void;
};

const firedEventIds = new Set<string>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function trackMetaLeadTwin(detail: Record<string, unknown>): boolean {
  if (detail.event !== "lead_submitted") return false;

  const eventId = detail.event_id;
  if (typeof eventId !== "string" || !LEAD_EVENT_ID_RE.test(eventId)) return false;
  if (firedEventIds.has(eventId)) return false;

  const fbq = (window as MetaPixelWindow).fbq;
  if (typeof fbq !== "function") return false;

  const ctaId = typeof detail.cta_id === "string" ? detail.cta_id.slice(0, 100) : undefined;
  const handoffCount =
    typeof detail.handoff_count === "number" && Number.isFinite(detail.handoff_count)
      ? Math.max(0, Math.min(6, Math.trunc(detail.handoff_count)))
      : 0;

  // Mirrors the CAPI event's custom_data (lib/analytics/meta-capi.ts) so the
  // deduped pair reads identically in Events Manager.
  fbq(
    "track",
    "Lead",
    {
      content_name: "Pancake v2 waitlist",
      conversion_name: "v2_waitlist_lead_submitted",
      conversion_tier: "primary",
      funnel_stage: "lead",
      form_id: "landing_waitlist",
      lead_type: "waitlist",
      handoff_count: handoffCount,
      ...(ctaId ? { cta_id: ctaId } : {}),
    },
    { eventID: eventId },
  );
  firedEventIds.add(eventId);
  return true;
}

export function MetaPixelEvents() {
  useEffect(() => {
    if (!isProductionSiteHost(window.location.hostname)) return;

    const onAcquisitionEvent = (rawEvent: Event) => {
      if (!(rawEvent instanceof CustomEvent) || !isRecord(rawEvent.detail)) return;
      if (!isAcquisitionEventName(rawEvent.detail.event)) return;
      trackMetaLeadTwin(rawEvent.detail);
    };

    window.addEventListener(PANCAKE_ACQUISITION_EVENT, onAcquisitionEvent);
    return () => window.removeEventListener(PANCAKE_ACQUISITION_EVENT, onAcquisitionEvent);
  }, []);

  return null;
}
