import "server-only";

import { createHash } from "node:crypto";

import { META_BROWSER_PIXEL_ID } from "@/lib/analytics/vendor-config";
import { isProductionSiteHost, SITE_ORIGIN } from "@/lib/site-config.mjs";

const META_GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION ?? "v25.0";
const META_FETCH_TIMEOUT_MS = 2500;
/** Where a lead happened when the Referer cannot tell: the canonical homepage. */
const FALLBACK_EVENT_SOURCE_URL = `${SITE_ORIGIN}/`;
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

type MetaLeadDelivery =
  | { status: "sent" }
  | { status: "disabled"; reason: "environment" | "flag" | "credentials" }
  | { status: "failed"; reason: "timeout" | "network" | "upstream" | "invalid_input" };

export type MetaWaitlistLead = {
  eventId: string;
  email: string;
  requestHostname: string;
  eventSourceUrl?: string;
  eventTimeSeconds?: number;
  clientIp?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
  attributionId?: string;
  ctaId?: string;
  handoffCount: number;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function cleanString(value: string | undefined, maxLength: number) {
  const cleaned = value?.trim();
  return cleaned ? cleaned.slice(0, maxLength) : undefined;
}

function cleanEventSourceUrl(value: string | undefined) {
  const rawUrl = cleanString(value, 2048);
  if (!rawUrl) return FALLBACK_EVENT_SOURCE_URL;

  try {
    const source = new URL(rawUrl);
    if (
      source.protocol !== "https:" ||
      source.username ||
      source.password ||
      !isProductionSiteHost(source.hostname)
    ) {
      return FALLBACK_EVENT_SOURCE_URL;
    }

    const cleaned = new URL(`${source.origin}${source.pathname}`);
    for (const [key, value] of Array.from(source.searchParams.entries())) {
      if (ATTRIBUTION_QUERY_KEYS.has(key)) {
        cleaned.searchParams.append(key, value.slice(0, 500));
      }
    }
    return cleaned.toString();
  } catch {
    return FALLBACK_EVENT_SOURCE_URL;
  }
}

function cleanEventTimeSeconds(value: number | undefined) {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return Math.floor(Date.now() / 1000);
  }
  // Never send a future timestamp. Keeping the original Airtable submission
  // time on retries prevents a delayed recovery from looking like a new lead.
  return Math.min(value, Math.floor(Date.now() / 1000));
}

function analyticsDeliveryMode(requestHostname: string): "live" | "test" | null {
  const canonicalRequestHost = isProductionSiteHost(requestHostname);
  const production =
    process.env.NODE_ENV === "production" &&
    process.env.VERCEL_ENV === "production" &&
    canonicalRequestHost;
  if (production) return "live";

  // A non-canonical or non-production delivery is allowed only into Meta Test
  // Events. The generic analytics debug flag alone must never pollute the live
  // dataset, including from a production deployment's generated Vercel URL.
  return (
    process.env.PANCAKE_ANALYTICS_DEBUG === "1" &&
    Boolean(process.env.META_TEST_EVENT_CODE?.trim())
  )
    ? "test"
    : null;
}

/**
 * Deliver the server copy of a verified waitlist Lead.
 *
 * The caller is the Airtable write path, never the browser. That makes a
 * fabricated public POST insufficient to create a conversion and lets Meta
 * receive normalized, SHA-256-hashed matching data without putting PII in GTM.
 */
export async function sendMetaWaitlistLead(input: MetaWaitlistLead): Promise<MetaLeadDelivery> {
  const deliveryMode = analyticsDeliveryMode(input.requestHostname);
  if (!deliveryMode) {
    return { status: "disabled", reason: "environment" };
  }
  if (process.env.META_CAPI_LEAD_MATCHING_ENABLED !== "true") {
    return { status: "disabled", reason: "flag" };
  }

  const pixelId = process.env.META_PIXEL_ID?.trim();
  const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN?.trim();
  if (!accessToken || pixelId !== META_BROWSER_PIXEL_ID) {
    return { status: "disabled", reason: "credentials" };
  }

  const email = input.email.trim().toLowerCase();
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ||
    !/^lead\.[0-9a-f]{64}$/.test(input.eventId)
  ) {
    return { status: "failed", reason: "invalid_input" };
  }

  const userData: Record<string, string | string[]> = {
    em: [sha256(email)],
  };
  const clientIp = cleanString(input.clientIp, 120);
  const clientUserAgent = cleanString(input.clientUserAgent, 500);
  const fbp = cleanString(input.fbp, 500);
  const fbc = cleanString(input.fbc, 500);
  const attributionId = cleanString(input.attributionId, 100);
  if (clientIp) userData.client_ip_address = clientIp;
  if (clientUserAgent) userData.client_user_agent = clientUserAgent;
  if (fbp?.startsWith("fb.")) userData.fbp = fbp;
  if (fbc?.startsWith("fb.")) userData.fbc = fbc;
  if (attributionId) userData.external_id = [sha256(attributionId)];

  const customData: Record<string, string | number> = {
    content_name: "Pancake v2 waitlist",
    conversion_name: "v2_waitlist_lead_submitted",
    conversion_tier: "primary",
    funnel_stage: "lead",
    form_id: "landing_waitlist",
    lead_type: "waitlist",
    handoff_count: Math.max(0, Math.min(6, Math.trunc(input.handoffCount))),
  };
  const ctaId = cleanString(input.ctaId, 100);
  if (ctaId) customData.cta_id = ctaId;

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: "Lead",
        event_time: cleanEventTimeSeconds(input.eventTimeSeconds),
        event_id: input.eventId,
        event_source_url: cleanEventSourceUrl(input.eventSourceUrl),
        action_source: "website",
        user_data: userData,
        custom_data: customData,
      },
    ],
  };
  // Never attach a forgotten Test Events code to a canonical live delivery.
  const testEventCode = process.env.META_TEST_EVENT_CODE?.trim();
  if (deliveryMode === "test" && testEventCode) payload.test_event_code = testEventCode;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), META_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(
        accessToken,
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      // Never log the request payload, email hash, or access token.
      console.error("Meta CAPI waitlist delivery failed", { status: response.status });
      return { status: "failed", reason: "upstream" };
    }
    return { status: "sent" };
  } catch {
    const timedOut = controller.signal.aborted;
    console.error("Meta CAPI waitlist delivery failed", {
      reason: timedOut ? "timeout" : "network",
    });
    return { status: "failed", reason: timedOut ? "timeout" : "network" };
  } finally {
    clearTimeout(timeout);
  }
}
