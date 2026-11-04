import { isPersonalEmail } from "@/lib/personal-email";

/** Browser/server contract for the manually reviewed demo flow. */
export const DEMO_OPTIONS = {
  size: ["1–9", "10–50", "51–200", "201–500", "501+"],
  goal: [
    "Find prospects using buying signals",
    "Scale our existing outbound",
    "Enrich and research our target accounts",
    "Build GTM workflows with Claude or Codex",
    "Build our first outbound motion",
    "Something else",
  ],
  service: ["Self-serve", "White Glove"],
  selfServeBudget: [
    "$99/month only",
    "$100–$349/month",
    "$350–$700/month",
    "$700–$1,300/month",
    "More than $1,300/month",
    "Not sure yet",
  ],
  whiteGloveBudget: [
    "Yes — this investment works for us",
    "I need internal approval",
    "Not in our budget",
  ],
  salesTeam: ["Just me", "2–5", "6–10", "11+", "No outbound team yet"],
  sequencer: [
    "Apollo",
    "Instantly",
    "Smartlead",
    "Outreach",
    "Salesloft",
    "HubSpot sequences",
    "Lemlist",
    "HeyReach",
    "Nooks",
    "Another tool",
    "None yet",
  ],
  volume: [
    "Not sending yet",
    "Under 250",
    "250–1,000",
    "1,000–5,000",
    "5,000+",
    "Not sure",
  ],
} as const;
export type DemoAnswers = {
  name: string;
  email: string;
  website: string;
  role: string;
  size: string;
  goal: string;
  service: string;
  budget: string;
  salesTeam: string;
  sequencer: string;
  volume: string;
};
export const EMPTY_DEMO: DemoAnswers = {
  name: "",
  email: "",
  website: "",
  role: "",
  size: "",
  goal: "",
  service: "",
  budget: "",
  salesTeam: "",
  sequencer: "",
  volume: "",
};
export function isSelfServe(a: DemoAnswers) {
  return (
    a.service === "Self-serve" &&
    ["$99/month only", "$100–$349/month"].includes(a.budget)
  );
}
export function parseQualification(
  body: unknown,
): { ok: true; value: DemoAnswers; id: string } | { ok: false; field: string } {
  if (!body || typeof body !== "object" || Array.isArray(body))
    return { ok: false, field: "name" };
  const raw = body as Record<string, unknown>;
  const a = { ...EMPTY_DEMO };
  for (const k of Object.keys(a) as (keyof DemoAnswers)[]) {
    if (
      typeof raw[k] !== "string" ||
      !(raw[k] as string).trim() ||
      (raw[k] as string).length > 250
    )
      return { ok: false, field: k };
    a[k] = (raw[k] as string).trim().replace(/[\u0000-\u001f\u007f]/g, " ");
  }
  a.email = a.email.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email) || isPersonalEmail(a.email))
    return { ok: false, field: "email" };
  try {
    const url = new URL(a.website);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      !url.hostname.includes(".")
    )
      throw Error();
    a.website = url.origin;
  } catch {
    return { ok: false, field: "website" };
  }
  for (const key of [
    "size",
    "goal",
    "service",
    "salesTeam",
    "sequencer",
    "volume",
  ] as const) {
    if (!(DEMO_OPTIONS[key] as readonly string[]).includes(a[key]))
      return { ok: false, field: key };
  }
  const budgets =
    a.service === "Self-serve"
      ? DEMO_OPTIONS.selfServeBudget
      : DEMO_OPTIONS.whiteGloveBudget;
  if (!(budgets as readonly string[]).includes(a.budget))
    return { ok: false, field: "budget" };
  if (
    typeof raw.submissionId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      raw.submissionId,
    )
  )
    return { ok: false, field: "submissionId" };
  return { ok: true, value: a, id: raw.submissionId.toLowerCase() };
}
