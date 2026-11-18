import "server-only";

import { attio, companyDomain, recordIdOf, type AttioResult } from "@/lib/attio-demo-request";
import {
  WG_PAGE_URL,
  isTeamEmail,
  wgContextLine,
  wgEmailDomain,
  wgReviewReason,
  type WgAnswers,
  type WgRoute,
} from "@/lib/white-glove-demo";

/**
 * /white-glove demo requests into Attio, the CRM. Server only: the token is a
 * secret. Flow and reasons: docs/white-glove-demo.md.
 *
 * The White Glove campaign is measured from Attio (the 2026-10-27 call:
 * "demo bookings for White Glove must create a deal in Attio with company
 * name and website linked"; the deals' companies are matched to LinkedIn ad
 * engagement). Every request that is not self-serve lands on the Person (by
 * email) and the Company (by the email's domain; Attio's enrichment adds the
 * name), with a note holding the answers and the page used:
 * writeAttioWhiteGloveRequest.
 *
 * The site opens no Deal. The CRM's own Calendly integration opens one for
 * every booking on the White Glove calendar, linked to the company and the
 * person, wherever the booking was made (this page, a /demo review
 * invitation, calendly.com). A second writer here would only duplicate it.
 *
 * Same token as /demo (ATTIO_API_KEY: record_permission:read-write,
 * object_configuration:read, note:read-write); without it nothing is written.
 * Addresses on Pancake's own domains are team tests and never reach Attio.
 * No PII in logs: the step and the HTTP status only. Never throws.
 */

/** Up to four calls, made before the visitor sees the calendar: /demo's 5 s budget. */
const REQUEST_TIMEOUT_MS = 5000;

const ROUTE_TEXT: Record<Exclude<WgRoute, "self_serve">, string> = {
  book: "Qualified: the White Glove calendar opened on the page",
  review: "Pending François's review at https://pancake.ai/demo/review (no calendar shown)",
};

/** The note on the person: the answers, in plain text so no answer can format it. Pure. */
export function wgRequestNote(
  a: WgAnswers,
  route: Exclude<WgRoute, "self_serve">,
  submittedAt: string,
  pageUrl: string = WG_PAGE_URL,
): { title: string; content: string } {
  const lines = [
    `Status: ${ROUTE_TEXT[route]}`,
    ...(route === "review" ? [`Why: ${wgReviewReason(a)}`] : []),
    wgContextLine(a, pageUrl),
    `Work email: ${a.email}`,
    `Page: ${pageUrl}`,
    `Submitted: ${submittedAt}`,
  ];
  return { title: "White Glove demo request", content: lines.join("\n") };
}

type PersonRecord = {
  id?: { record_id?: unknown };
  values?: Record<string, unknown[] | undefined>;
};

/**
 * Company by the email's domain, then Person by email (created, or its empty
 * company filled). The person's record id, or null.
 */
async function companyAndPerson(token: string, signal: AbortSignal, email: string): Promise<string | null> {
  let companyId: string | null = null;
  const domain = companyDomain(`https://${wgEmailDomain(email)}/`);
  if (domain) {
    const company = await attio(token, signal, "PUT", "/objects/companies/records?matching_attribute=domains", {
      data: { values: { domains: [{ domain }] } },
    });
    if (company.ok) companyId = recordIdOf(company.body);
    else console.error("White Glove Attio company failed", { status: company.status });
  }
  const companyRef = companyId ? [{ target_object: "companies", target_record_id: companyId }] : undefined;

  const found = await attio(token, signal, "POST", "/objects/people/records/query", {
    filter: { email_addresses: { email_address: { $eq: email } } },
    limit: 1,
  });
  if (!found.ok) {
    console.error("White Glove Attio person lookup failed", { status: found.status });
    return null;
  }
  const existing = ((found.body as { data?: PersonRecord[] } | null)?.data ?? [])[0];
  if (existing && typeof existing.id?.record_id === "string" && existing.id.record_id) {
    const personId = existing.id.record_id;
    const company = existing.values?.company;
    if (companyRef && (!Array.isArray(company) || company.length === 0)) {
      const patched = await attio(token, signal, "PATCH", `/objects/people/records/${encodeURIComponent(personId)}`, {
        data: { values: { company: companyRef } },
      });
      if (!patched.ok) console.error("White Glove Attio person update failed", { status: patched.status });
    }
    return personId;
  }
  const created = await attio(token, signal, "PUT", "/objects/people/records?matching_attribute=email_addresses", {
    data: {
      values: {
        email_addresses: [{ email_address: email }],
        ...(companyRef ? { company: companyRef } : {}),
      },
    },
  });
  if (!created.ok) {
    console.error("White Glove Attio person create failed", { status: created.status });
    return null;
  }
  const personId = recordIdOf(created.body);
  if (!personId) console.error("White Glove Attio person has no record id");
  return personId;
}

function withTimeout<T>(ms: number, run: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return run(controller.signal).finally(() => clearTimeout(timer));
}

/** A request that is not self-serve: Company, Person and a note with the answers. */
export function writeAttioWhiteGloveRequest(
  token: string,
  a: WgAnswers,
  route: Exclude<WgRoute, "self_serve">,
  submittedAt: string,
  pageUrl: string = WG_PAGE_URL,
): Promise<AttioResult | "skipped"> {
  if (isTeamEmail(a.email)) return Promise.resolve("skipped");
  return withTimeout(REQUEST_TIMEOUT_MS, async (signal) => {
    const personId = await companyAndPerson(token, signal, a.email);
    if (!personId) return "failed";
    const note = wgRequestNote(a, route, submittedAt, pageUrl);
    const noted = await attio(token, signal, "POST", "/notes", {
      data: { parent_object: "people", parent_record_id: personId, title: note.title, format: "plaintext", content: note.content },
    });
    if (!noted.ok) console.error("White Glove Attio note failed", { status: noted.status });
    return noted.ok ? "sent" : "failed";
  });
}
