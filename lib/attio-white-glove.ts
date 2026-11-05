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
 * /white-glove demos into Attio, the CRM. Server only: the token is a secret.
 * Flow and reasons: docs/white-glove-demo.md.
 *
 * The White Glove campaign is measured from Attio (the 2026-10-27 call:
 * "demo bookings for White Glove must create a deal in Attio with company
 * name and website linked"; the deals' companies are matched to LinkedIn ad
 * engagement). So:
 *   - every request that is not self-serve lands on the Person (by email) and
 *     the Company (by the email's domain; Attio's enrichment adds the name),
 *     with a note holding the answers: writeAttioWhiteGloveRequest;
 *   - every booking made on the page opens a Deal linked to both, in the
 *     "Demo booked" stage, owned by François (both required by the
 *     workspace's Deals object), with a note:
 *     createAttioWhiteGloveDeal. Bookings made from a /demo review
 *     invitation happen on calendly.com, never on the page, so they do not
 *     open a deal here.
 * Unlike lib/attio-demo-request.ts (/demo, which leaves Deals to Attio's
 * native workflows), this file writes Deals: that is the ask. If an Attio
 * workflow also opens a deal on Calendly bookings, turn one of the two off.
 *
 * Same token as /demo (ATTIO_API_KEY: record_permission:read-write,
 * object_configuration:read, note:read-write); without it nothing is written.
 * Addresses on Pancake's own domains are team tests and never reach Attio.
 * No PII in logs: the step and the HTTP status only. Never throws.
 */

/** For one whole sequence: the request path makes up to four calls (it runs before the
 *  visitor sees the calendar, like /demo's 5 s), the deal path up to eight. */
const REQUEST_TIMEOUT_MS = 5000;
const DEAL_TIMEOUT_MS = 8000;

/** The stage a new deal opens in: the Sales Pipeline's "Demo booked" (checked in
 *  the workspace 2026-11-05; its other stages include "Discovery booked" and
 *  "Escalation required"). */
export const WG_DEAL_STAGE = "Demo booked";

/** The deal's owner when ATTIO_WHITE_GLOVE_DEAL_OWNER is unset. Deal owner is
 *  required in the workspace (checked 2026-11-05); François hosts the White
 *  Glove calls and owns the pipeline's other deals. Members sign in with their
 *  getbasalt.ai addresses (the workspace predates the rename). */
export const WG_DEAL_OWNER: string | null = "francois@getbasalt.ai";

/** How a deal opens: its stage (WG_DEAL_STAGE by default), its owner (a workspace
 *  member's email; Attio's Deals object requires one by default), and the clock. */
export type WgDealOptions = { stage?: string; owner?: string | null; now?: Date };

/** A booking within this window adds a note to the open deal instead of a second deal. */
const DEAL_DEDUP_MS = 30 * 24 * 60 * 60 * 1000;

export type WgBooking = {
  /** ISO time the page saw Calendly's calendly.event_scheduled */
  bookedAt: string;
  /** Calendly's API URIs from that message, when it sent them */
  eventUri?: string;
  inviteeUri?: string;
};

export type WgDealResult = "created" | "exists" | "skipped" | "failed";

/** The deal's name: the company's domain, then the offer. Pure. */
export function wgDealName(email: string): string {
  return `${wgEmailDomain(email)} · White Glove demo`;
}

const ROUTE_TEXT: Record<Exclude<WgRoute, "self_serve">, string> = {
  book: "Qualified: the White Glove calendar opened on the page",
  review: "Pending François's review at https://pancake.ai/demo/review (no calendar shown)",
};

/** The note on the person: the answers, in plain text so no answer can format it. Pure. */
export function wgRequestNote(
  a: WgAnswers,
  route: Exclude<WgRoute, "self_serve">,
  submittedAt: string,
): { title: string; content: string } {
  const lines = [
    `Status: ${ROUTE_TEXT[route]}`,
    ...(route === "review" ? [`Why: ${wgReviewReason(a)}`] : []),
    wgContextLine(a),
    `Work email: ${a.email}`,
    `Page: ${WG_PAGE_URL}`,
    `Submitted: ${submittedAt}`,
  ];
  return { title: "White Glove demo request", content: lines.join("\n") };
}

/** The note on the deal. Pure. */
export function wgDealNote(a: WgAnswers, booking: WgBooking): { title: string; content: string } {
  const lines = [
    "Demo booked on the White Glove page (calendar: Pancake Whiteglove, 45 min).",
    wgContextLine(a),
    `Work email: ${a.email}`,
    ...(booking.eventUri ? [`Calendly event: ${booking.eventUri}`] : []),
    ...(booking.inviteeUri ? [`Calendly invitee: ${booking.inviteeUri}`] : []),
    `Booked: ${booking.bookedAt}`,
    `Page: ${WG_PAGE_URL}`,
  ];
  return { title: "White Glove demo booked", content: lines.join("\n") };
}

type Ids = { companyId: string | null; personId: string };

type PersonRecord = {
  id?: { record_id?: unknown };
  values?: Record<string, unknown[] | undefined>;
};

/** Company by the email's domain, then Person by email (created, or its empty company filled). */
async function companyAndPerson(token: string, signal: AbortSignal, email: string): Promise<Ids | null> {
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
    return { companyId, personId };
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
  if (!personId) {
    console.error("White Glove Attio person has no record id");
    return null;
  }
  return { companyId, personId };
}

async function addNote(
  token: string,
  signal: AbortSignal,
  parent: "people" | "deals",
  recordId: string,
  note: { title: string; content: string },
): Promise<boolean> {
  const noted = await attio(token, signal, "POST", "/notes", {
    data: { parent_object: parent, parent_record_id: recordId, title: note.title, format: "plaintext", content: note.content },
  });
  if (!noted.ok) console.error("White Glove Attio note failed", { parent, status: noted.status });
  return noted.ok;
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
): Promise<AttioResult | "skipped"> {
  if (isTeamEmail(a.email)) return Promise.resolve("skipped");
  return withTimeout(REQUEST_TIMEOUT_MS, async (signal) => {
    const ids = await companyAndPerson(token, signal, a.email);
    if (!ids) return "failed";
    return (await addNote(token, signal, "people", ids.personId, wgRequestNote(a, route, submittedAt))) ? "sent" : "failed";
  });
}

type StatusRecord = { title?: unknown; is_archived?: unknown };

/** The stage to open the deal in: `preferred` when Attio has it, else the pipeline's first. Pure. */
export function pickDealStage(statuses: unknown, preferred: string): string | null {
  const list = (Array.isArray(statuses) ? statuses : []) as StatusRecord[];
  const open = list.filter(
    (s): s is { title: string; is_archived?: unknown } => typeof s?.title === "string" && s.title !== "" && s.is_archived !== true,
  );
  const wanted = preferred.trim().toLowerCase();
  return (open.find((s) => s.title.trim().toLowerCase() === wanted) ?? open[0])?.title ?? null;
}

type DealRecord = { id?: { record_id?: unknown }; created_at?: unknown };

/**
 * A booking on the page: one Deal linked to the Company and the Person, plus
 * a note. A second booking from the same domain within 30 days adds a note to
 * that deal instead. An owner Attio refuses (not a workspace member) is
 * dropped and the deal is created without it, rather than lost.
 */
export function createAttioWhiteGloveDeal(
  token: string,
  a: WgAnswers,
  booking: WgBooking,
  options: WgDealOptions = {},
): Promise<WgDealResult> {
  const now = options.now ?? new Date();
  const preferredStage = options.stage?.trim() || WG_DEAL_STAGE;
  const owner = options.owner?.trim() || null;
  if (isTeamEmail(a.email)) return Promise.resolve("skipped");
  return withTimeout(DEAL_TIMEOUT_MS, async (signal) => {
    const ids = await companyAndPerson(token, signal, a.email);
    if (!ids) return "failed";
    const name = wgDealName(a.email);
    const note = wgDealNote(a, booking);

    // The same company booked again: one deal, one more note.
    const found = await attio(token, signal, "POST", "/objects/deals/records/query", {
      filter: { name },
      limit: 10,
    });
    if (!found.ok) {
      console.error("White Glove Attio deal lookup failed", { status: found.status });
      return "failed";
    }
    const recent = ((found.body as { data?: DealRecord[] } | null)?.data ?? []).find((deal) => {
      const created = typeof deal.created_at === "string" ? Date.parse(deal.created_at) : NaN;
      return typeof deal.id?.record_id === "string" && Number.isFinite(created) && now.getTime() - created < DEAL_DEDUP_MS;
    });
    if (recent && typeof recent.id?.record_id === "string") {
      await addNote(token, signal, "deals", recent.id.record_id, note);
      return "exists";
    }

    // The stage's exact title, when the token may read the pipeline; else the configured title as is.
    const statuses = await attio(token, signal, "GET", "/objects/deals/attributes/stage/statuses");
    if (!statuses.ok) console.error("White Glove Attio deal stages failed", { status: statuses.status });
    const stage =
      (statuses.ok ? pickDealStage((statuses.body as { data?: unknown } | null)?.data, preferredStage) : null) ??
      preferredStage;

    const values = {
      name,
      ...(stage ? { stage } : {}),
      ...(ids.companyId ? { associated_company: [{ target_object: "companies", target_record_id: ids.companyId }] } : {}),
      associated_people: [{ target_object: "people", target_record_id: ids.personId }],
    };
    let created = await attio(token, signal, "POST", "/objects/deals/records", {
      data: { values: owner ? { ...values, owner } : values },
    });
    if (!created.ok && owner && created.status === 400) {
      console.error("White Glove Attio deal owner refused, retrying without it", { status: created.status });
      created = await attio(token, signal, "POST", "/objects/deals/records", { data: { values } });
    }
    if (!created.ok) {
      console.error("White Glove Attio deal create failed", { status: created.status });
      return "failed";
    }
    const dealId = recordIdOf(created.body);
    if (dealId) await addNote(token, signal, "deals", dealId, note);
    return "created";
  });
}
