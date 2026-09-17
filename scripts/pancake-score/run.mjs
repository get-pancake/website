// Weekly Pancake score job. Reads product events from the analytics MCP (read-only SQL),
// scores every trialing or paying workspace, and sends `pancake_score_updated` to Loops,
// which triggers the "Pancake score — Weekly level up" email.
//
// Env:
//   ANALYTICS_MCP_TOKEN  bearer token for https://analytics.getpancake.ai/mcp (required)
//   LOOPS_API_KEY        Loops API key (required unless MODE=dry-run without ONLY_EMAIL)
//   MODE                 "dry-run" (default: compute and report only) or "send"
//   ONLY_EMAIL           send one sample score email to this address, and nothing else
//
// Logs never contain customer emails or names, only counts.

import { createHash } from "node:crypto";
import { buildScore } from "./score.mjs";

const MCP_URL = process.env.ANALYTICS_MCP_URL || "https://analytics.getpancake.ai/mcp";
const LOOPS_URL = "https://app.loops.so/api/v1";
const MODE = process.env.MODE === "send" ? "send" : "dry-run";
const ONLY_EMAIL = (process.env.ONLY_EMAIL || "").trim().toLowerCase() || null;
const INTERNAL_DOMAINS = ["getpancake.ai", "getbasalt.ai"];
const PAGE_SIZE = 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const env = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Analytics MCP (streamable HTTP, JSON-RPC) ─────────────────────────────

let rpcId = 0;
let mcpSessionId = null;

const parseSse = (text, id) => {
  for (const block of text.split(/\r?\n\r?\n/)) {
    const data = block
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (!data) continue;
    const message = JSON.parse(data);
    if (message.id === id) return message;
  }
  throw new Error("analytics MCP: no response in event stream");
};

const mcp = async (method, params, { notification = false } = {}) => {
  const id = notification ? undefined : ++rpcId;
  const response = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env("ANALYTICS_MCP_TOKEN")}`,
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...(mcpSessionId ? { "mcp-session-id": mcpSessionId } : {}),
    },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, ...(notification ? {} : { id }) }),
  });
  mcpSessionId = response.headers.get("mcp-session-id") || mcpSessionId;
  if (!response.ok) throw new Error(`analytics MCP ${method}: HTTP ${response.status}`);
  if (notification) return null;
  const text = await response.text();
  const message = (response.headers.get("content-type") || "").includes("text/event-stream")
    ? parseSse(text, id)
    : JSON.parse(text);
  if (message.error) throw new Error(`analytics MCP ${method}: ${message.error.message}`);
  return message.result;
};

const connectMcp = async () => {
  await mcp("initialize", {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: { name: "pancake-score", version: "1.0.0" },
  });
  await mcp("notifications/initialized", {}, { notification: true });
};

const runSql = async (sql) => {
  const result = await mcp("tools/call", {
    name: "analytics_sql",
    arguments: { sql, limit: PAGE_SIZE },
  });
  const text = result?.content?.find((part) => part.type === "text")?.text ?? "";
  if (result?.isError) throw new Error(`analytics_sql: ${text}`);
  const payload = result.structuredContent ?? JSON.parse(text);
  const names = payload.columns.map((column) => column.name);
  return {
    rows: payload.rows.map((row) => Object.fromEntries(names.map((name, i) => [name, row[i]]))),
    truncated: Boolean(payload.truncated),
  };
};

// ─── Query ─────────────────────────────────────────────────────────────────

const ACTION_EVENTS = `'campaign_sender_connected', 'activation_journey_connection',
  'lead_feedback_submitted', 'campaign_lead_enrolled', 'seo_article_approved',
  'onboarding_done', 'brain_artifact_edited', 'slack_connected', 'mcp_grant_connected'`;

const connection = (kind) =>
  `(e.event_name = 'activation_journey_connection' AND e.properties->>'connection' = '${kind}' AND e.properties->>'result' = 'connected')`;

const sqlLiteral = (value) => `'${String(value).replace(/'/g, "''")}'`;

export const scoreQuery = (after = null) => `
WITH status_events AS (
  SELECT workspace_id, occurred_at, event_name,
    CASE
      WHEN event_name = 'trial_started' THEN 'trialing'
      WHEN event_name IN ('subscription_started', 'subscription_renewed', 'payment_succeeded') THEN 'active'
      WHEN event_name = 'payment_failed' THEN 'past_due'
      WHEN event_name = 'trial_ended' AND properties->>'outcome' = 'converted' THEN 'active'
      WHEN event_name = 'trial_ended' THEN 'ended'
      WHEN event_name = 'subscription_updated' THEN properties->>'status'
    END AS status
  FROM analytics_store.analytics_events
  WHERE workspace_id IS NOT NULL
    AND event_name IN ('trial_started', 'trial_ended', 'subscription_started',
      'subscription_renewed', 'payment_succeeded', 'payment_failed', 'subscription_updated')
),
current_status AS (
  SELECT DISTINCT ON (workspace_id) workspace_id, status
  FROM status_events
  WHERE status IS NOT NULL
  ORDER BY workspace_id, occurred_at DESC
),
active AS (
  SELECT c.workspace_id, c.status,
    (SELECT max(s.occurred_at) FROM status_events s
      WHERE s.workspace_id = c.workspace_id AND s.event_name = 'trial_started') AS trial_started_at
  FROM current_status c
  WHERE c.status IN ('trialing', 'active', 'past_due')
),
actions AS (
  SELECT e.workspace_id,
    min(e.occurred_at) FILTER (WHERE e.event_name = 'campaign_sender_connected' OR ${connection("linkedin")}) AS linkedin_at,
    count(*) FILTER (WHERE e.event_name = 'lead_feedback_submitted') AS lead_decisions,
    count(*) FILTER (WHERE e.event_name = 'lead_feedback_submitted' AND e.occurred_at < now() - interval '7 days') AS lead_decisions_week_ago,
    min(e.occurred_at) FILTER (WHERE e.event_name = 'campaign_lead_enrolled') AS outreach_at,
    min(e.occurred_at) FILTER (WHERE e.event_name = 'seo_article_approved') AS article_at,
    min(e.occurred_at) FILTER (WHERE e.event_name = 'onboarding_done') AS brain_built_at,
    min(e.occurred_at) FILTER (WHERE e.event_name = 'brain_artifact_edited') AS brain_refined_at,
    min(e.occurred_at) FILTER (WHERE e.event_name = 'slack_connected' OR ${connection("slack")}) AS slack_at,
    min(e.occurred_at) FILTER (WHERE e.event_name = 'mcp_grant_connected' OR ${connection("agent")}) AS agent_at
  FROM analytics_store.analytics_events e
  JOIN active a ON a.workspace_id = e.workspace_id
  WHERE e.event_name IN (${ACTION_EVENTS})
  GROUP BY e.workspace_id
),
members AS (
  SELECT DISTINCT e.workspace_id, lower(trim(p.email)) AS email
  FROM analytics_store.analytics_events e
  JOIN active a ON a.workspace_id = e.workspace_id
  JOIN analytics_store.user_profiles p ON p.user_id = e.user_id
  WHERE p.email IS NOT NULL AND trim(p.email) <> ''
)
SELECT m.workspace_id, m.email, a.status, a.trial_started_at,
  x.linkedin_at, x.lead_decisions, x.lead_decisions_week_ago, x.outreach_at, x.article_at,
  x.brain_built_at, x.brain_refined_at, x.slack_at, x.agent_at
FROM members m
JOIN active a ON a.workspace_id = m.workspace_id
LEFT JOIN actions x ON x.workspace_id = m.workspace_id
${after ? `WHERE (m.workspace_id, m.email) > (${sqlLiteral(after.workspace_id)}, ${sqlLiteral(after.email)})` : ""}
ORDER BY m.workspace_id, m.email`;

const fetchRows = async () => {
  const all = [];
  let after = null;
  for (;;) {
    const { rows, truncated } = await runSql(scoreQuery(after));
    all.push(...rows);
    if (!truncated && rows.length < PAGE_SIZE) return all;
    after = rows[rows.length - 1];
  }
};

// ─── Scoring ───────────────────────────────────────────────────────────────

const doneBy = (timestamp, cutoff) => timestamp !== null && timestamp !== undefined && new Date(timestamp) < cutoff;

export const statesFromRow = (row, now = new Date()) => {
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
  const at = (column, cutoff) => doneBy(row[column], cutoff);
  const build = (cutoff, decisions) => ({
    linkedin: at("linkedin_at", cutoff),
    leadDecisions: Number(decisions) || 0,
    outreach: at("outreach_at", cutoff),
    article: at("article_at", cutoff),
    brainBuilt: at("brain_built_at", cutoff),
    brainRefined: at("brain_refined_at", cutoff),
    slack: at("slack_at", cutoff),
    agent: at("agent_at", cutoff),
  });
  return {
    state: build(new Date(now.getTime() + DAY_MS), row.lead_decisions),
    stateWeekAgo: build(weekAgo, row.lead_decisions_week_ago),
  };
};

const isInternal = (email) => INTERNAL_DOMAINS.some((domain) => email.endsWith(`@${domain}`));

// ─── Loops ─────────────────────────────────────────────────────────────────

const isoWeek = (date) => {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / DAY_MS + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
};

const loops = async (method, path, body, idempotencyKey) => {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(`${LOOPS_URL}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${env("LOOPS_API_KEY")}`,
        "content-type": "application/json",
        ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}),
      },
      body: JSON.stringify(body),
    });
    // 409 = this week's email for this person was already sent by an earlier run.
    if (response.status === 409 && idempotencyKey) return "already_sent";
    if ((response.status === 429 || response.status >= 500) && attempt < 4) {
      await sleep(1000 * attempt);
      continue;
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === false) {
      throw new Error(`Loops ${path}: HTTP ${response.status} ${result.message ?? ""}`.trim());
    }
    return "ok";
  }
};

const sendScoreEmail = (email, built, week) =>
  loops(
    "POST",
    "/events/send",
    {
      email,
      eventName: "pancake_score_updated",
      pancakeScore: built.score,
      pancakeLevel: built.level,
      eventProperties: built.eventProperties,
    },
    `pancake-score:${week}:${createHash("sha256").update(email).digest("hex").slice(0, 40)}`,
  );

const updateContactScore = (email, built) =>
  loops("PUT", "/contacts/update", {
    email,
    pancakeScore: built.score,
    pancakeLevel: built.level,
  });

// ─── Main ──────────────────────────────────────────────────────────────────

const main = async () => {
  const now = new Date();
  const week = isoWeek(now);
  await connectMcp();
  const rows = await fetchRows();

  const recipients = [];
  const workspaces = new Set();
  const skipped = {};
  const levels = {};
  for (const row of rows) {
    if (isInternal(row.email)) {
      skipped.internal_email = (skipped.internal_email ?? 0) + 1;
      continue;
    }
    const trialStartedDaysAgo = row.trial_started_at
      ? (now - new Date(row.trial_started_at)) / DAY_MS
      : null;
    const built = buildScore({ ...statesFromRow(row, now), trialStartedDaysAgo, status: row.status });
    workspaces.add(row.workspace_id);
    levels[built.level] = (levels[built.level] ?? 0) + 1;
    if (built.skipReason) skipped[built.skipReason] = (skipped[built.skipReason] ?? 0) + 1;
    recipients.push({ email: row.email, built });
  }

  const emailable = recipients.filter((r) => !r.built.skipReason);
  console.log(`Mode: ${ONLY_EMAIL ? "sample to one address" : MODE} · week ${week}`);
  console.log(`Trialing or paying workspaces with a known member: ${workspaces.size}`);
  console.log(`People scored: ${recipients.length} · score emails due: ${emailable.length}`);
  console.log(`By level: ${JSON.stringify(levels)}`);
  console.log(`No email this week: ${JSON.stringify(skipped)}`);

  if (ONLY_EMAIL) {
    const sorted = [...emailable].sort((a, b) => a.built.score - b.built.score);
    const sample = sorted[Math.floor(sorted.length / 2)];
    if (!sample) throw new Error("No eligible score to use as a sample");
    await sendScoreEmail(ONLY_EMAIL, sample.built, `${week}-sample-${Date.now()}`);
    console.log(`Sample sent: score ${sample.built.score} (${sample.built.level})`);
    return;
  }
  if (MODE !== "send") return;

  const outcome = { sent: 0, already_sent: 0, contact_updated: 0, failed: 0 };
  for (const { email, built } of recipients) {
    try {
      if (built.skipReason) {
        await updateContactScore(email, built);
        outcome.contact_updated++;
      } else {
        const result = await sendScoreEmail(email, built, week);
        outcome[result === "already_sent" ? "already_sent" : "sent"]++;
      }
    } catch (error) {
      outcome.failed++;
      console.error(error.message);
    }
    await sleep(150); // Loops allows 10 requests per second
  }
  console.log(`Loops: ${JSON.stringify(outcome)}`);
  if (outcome.failed > 0) process.exitCode = 1;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
