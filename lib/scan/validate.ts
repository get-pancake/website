import "server-only";

import { PANCAKE_DOMAINS } from "@/lib/site-config.mjs";

/**
 * Target validation for the free scan. Mirrors the waitlist route's
 * `normalizeUrl` contract (accepts bare "acme.com") and adds the guards a
 * paid-API-backed endpoint needs: no internal hosts, no IP literals, and no
 * mega-domains whose ranking data is meaningless at our scale.
 */

const MEGA_DOMAINS = new Set([
  "google.com",
  "facebook.com",
  "amazon.com",
  "youtube.com",
  "wikipedia.org",
  "apple.com",
  "microsoft.com",
  "instagram.com",
  "x.com",
  "twitter.com",
]);

const OWN_DOMAINS = new Set([...PANCAKE_DOMAINS, "getbasalt.ai"]);

const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

/** Accept "acme.com" as well as a full URL; return null when it can't be one. */
export function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    return url.hostname.includes(".") ? url.toString() : null;
  } catch {
    return null;
  }
}

/** "www.acme.com" → "acme.com"; used as the cache key and DataForSEO target. */
export function apexHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

export type ScanTarget =
  | { ok: true; url: string; host: string }
  | { ok: false; reason: string };

export function validateScanTarget(raw: unknown): ScanTarget {
  if (typeof raw !== "string" || raw.length > 300) {
    return { ok: false, reason: "Enter your company's domain, like acme.com." };
  }
  const normalized = normalizeUrl(raw);
  if (!normalized) {
    return { ok: false, reason: "That doesn't look like a domain. Try acme.com." };
  }
  const url = new URL(normalized);
  const host = apexHost(url.hostname);

  if (url.port) return { ok: false, reason: "Ports aren't supported. Use the plain domain." };
  if (IPV4_RE.test(host) || host.includes(":")) {
    return { ok: false, reason: "IP addresses aren't scannable. Use the domain name." };
  }
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".test")
  ) {
    return { ok: false, reason: "Internal hosts aren't scannable from here." };
  }
  if (OWN_DOMAINS.has(host)) {
    return { ok: false, reason: "That's us. Try your company's site, or the doctolib.fr demo." };
  }
  if (MEGA_DOMAINS.has(host)) {
    return {
      ok: false,
      reason: "That one's a bit beyond a free scan. Try your actual company site.",
    };
  }
  return { ok: true, url: `https://${url.hostname}${url.pathname === "/" ? "" : url.pathname}`, host };
}
