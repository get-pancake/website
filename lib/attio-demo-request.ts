import { PANCAKE_DOMAINS, SITE_HOST } from "@/lib/site-config.mjs";

/**
 * /demo requests into Attio, the CRM (François, 2026-09-16: "the answer to
 * the form merges with the answer to the Calendly form, so that we don't
 * have data living in silos").
 *
 * Every successful request lands on the Person in Attio, matched by email,
 * the same key the Calendly app (Neon Deer) uses for bookings. So a visitor
 * who never books is still in the CRM, and a booking later lands on the
 * same Person. Server only (the token is a secret): imported by
 * app/api/demo-request/route.ts.
 *
 * Per request, following Attio's documented safe pattern (research
 * 2026-09-16, docs.attio.com):
 *   1. Company: assert by the website's domain, sending the domain only.
 *      Assert adds to the matched attribute and never deletes other
 *      domains; the name comes from Attio's own enrichment. Skipped for
 *      hosts that are not a company (linkedin.com, a Gmail address typed as
 *      a website, …).
 *   2. Person: query by email. A new person is asserted by email with name
 *      and company. An existing person only gets the fields that are empty
 *      (PATCH), so a rep's edits and existing links are never overwritten.
 *   3. Note: one plain-text note on the person with the answers.
 * It never reads or writes Deals: the native Attio workflows own them
 * (decisions/2026-09-07-calendly-routing-form-for-demo-booking.md).
 *
 * Token: ATTIO_API_KEY, a workspace access token with the scopes
 * record_permission:read-write, object_configuration:read and
 * note:read-write. Without it the delivery is skipped. No PII in logs:
 * the step and HTTP status only.
 *
 * A retry of the same submission (after a timeout) can add a second note:
 * notes have no upsert. Rare, and harmless next to losing the answers.
 */

const ATTIO_API = "https://api.attio.com/v2";
/** For the whole sequence (at most four calls), like the route's other deliveries. */
const TOTAL_TIMEOUT_MS = 5000;

export type AttioDemoLead = {
  firstName: string;
  lastName: string;
  email: string;
  /** normalised, e.g. "https://acme.com/" */
  website: string;
  teamSize: string;
  hasAccount: "yes" | "no";
  goal?: string;
  source: string;
  submittedAt: string;
  pageUrl: string;
};

export type AttioResult = "sent" | "failed";

/** Hosts a visitor may type as "company website" that are not their company. */
const NOT_A_COMPANY = new Set([
  "linkedin.com",
  "facebook.com",
  "instagram.com",
  "x.com",
  "twitter.com",
  "github.com",
  "medium.com",
  "substack.com",
  "youtube.com",
  "google.com",
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
  "notion.site",
  "calendly.com",
  ...PANCAKE_DOMAINS,
]);

/** The website's company domain ("acme.com"), or null when it is not one. Pure. */
export function companyDomain(website: string): string | null {
  let host: string;
  try {
    host = new URL(website).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host.startsWith("www.")) host = host.slice(4);
  if (!host.includes(".") || NOT_A_COMPANY.has(host)) return null;
  // A subdomain of a platform (acme.notion.site, acme.substack.com) is not a company domain either.
  if (Array.from(NOT_A_COMPANY).some((platform) => host.endsWith(`.${platform}`))) return null;
  return host;
}

/** The note on the person, in plain text so no answer can format it. Pure. */
export function attioNote(lead: AttioDemoLead): { title: string; content: string } {
  const lines = [
    `Team size: ${lead.teamSize}`,
    `Has a Pancake account: ${lead.hasAccount === "yes" ? "Yes" : "No"}`,
    `Main goal: ${lead.goal ?? "Not answered"}`,
    `Company website: ${lead.website}`,
    `Source: ${lead.source} (${lead.pageUrl})`,
    `Submitted: ${lead.submittedAt}`,
  ];
  return { title: `Demo request from ${SITE_HOST}`, content: lines.join("\n") };
}

type AttioCall = { ok: true; body: unknown } | { ok: false; status: number | "timeout" | "network" };

async function attio(
  token: string,
  signal: AbortSignal,
  method: string,
  path: string,
  body?: unknown,
): Promise<AttioCall> {
  try {
    const response = await fetch(`${ATTIO_API}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
      cache: "no-store",
    });
    if (!response.ok) return { ok: false, status: response.status };
    return { ok: true, body: await response.json().catch(() => null) };
  } catch {
    return { ok: false, status: signal.aborted ? "timeout" : "network" };
  }
}

function recordIdOf(body: unknown): string | null {
  const id = (body as { data?: { id?: { record_id?: unknown } } } | null)?.data?.id?.record_id;
  return typeof id === "string" && id ? id : null;
}

type PersonRecord = { id?: { record_id?: unknown }; values?: Record<string, unknown[] | undefined> };

function isEmpty(values: PersonRecord["values"], slug: string): boolean {
  const value = values?.[slug];
  return !Array.isArray(value) || value.length === 0;
}

/** Write one demo request to Attio. Never throws; logs the failing step without PII. */
export async function writeAttioDemoRequest(token: string, lead: AttioDemoLead): Promise<AttioResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TOTAL_TIMEOUT_MS);
  try {
    return await write(token, lead, controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

async function write(token: string, lead: AttioDemoLead, signal: AbortSignal): Promise<AttioResult> {
  // 1. Company, by domain only.
  let companyId: string | null = null;
  const domain = companyDomain(lead.website);
  if (domain) {
    const company = await attio(token, signal, "PUT", "/objects/companies/records?matching_attribute=domains", {
      data: { values: { domains: [{ domain }] } },
    });
    if (company.ok) companyId = recordIdOf(company.body);
    else console.error("Demo request Attio company failed", { status: company.status });
  }

  // Attio's personal-name write format: an object with all three parts.
  const name = { first_name: lead.firstName, last_name: lead.lastName, full_name: `${lead.firstName} ${lead.lastName}` };
  const companyRef = companyId ? [{ target_object: "companies", target_record_id: companyId }] : undefined;

  // 2. Person, by email: create, or fill only what is empty.
  const found = await attio(token, signal, "POST", "/objects/people/records/query", {
    filter: { email_addresses: { email_address: { $eq: lead.email } } },
    limit: 1,
  });
  if (!found.ok) {
    console.error("Demo request Attio person lookup failed", { status: found.status });
    return "failed";
  }
  const existing = ((found.body as { data?: PersonRecord[] } | null)?.data ?? [])[0];
  let personId: string | null = null;
  if (existing && typeof existing.id?.record_id === "string") {
    personId = existing.id.record_id;
    const values: Record<string, unknown> = {};
    if (isEmpty(existing.values, "name")) values.name = name;
    if (companyRef && isEmpty(existing.values, "company")) values.company = companyRef;
    if (Object.keys(values).length > 0) {
      const patched = await attio(token, signal, "PATCH", `/objects/people/records/${encodeURIComponent(personId)}`, {
        data: { values },
      });
      if (!patched.ok) console.error("Demo request Attio person update failed", { status: patched.status });
    }
  } else {
    const created = await attio(token, signal, "PUT", "/objects/people/records?matching_attribute=email_addresses", {
      data: {
        values: {
          email_addresses: [{ email_address: lead.email }],
          name,
          ...(companyRef ? { company: companyRef } : {}),
        },
      },
    });
    if (!created.ok) {
      console.error("Demo request Attio person create failed", { status: created.status });
      return "failed";
    }
    personId = recordIdOf(created.body);
  }
  if (!personId) {
    console.error("Demo request Attio person has no record id");
    return "failed";
  }

  // 3. The answers, as a note on the person.
  const note = attioNote(lead);
  const noted = await attio(token, signal, "POST", "/notes", {
    data: { parent_object: "people", parent_record_id: personId, title: note.title, format: "plaintext", content: note.content },
  });
  if (!noted.ok) {
    console.error("Demo request Attio note failed", { status: noted.status });
    return "failed";
  }
  return "sent";
}
