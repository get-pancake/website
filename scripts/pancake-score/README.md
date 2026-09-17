# Pancake score (weekly)

Every Monday, `.github/workflows/pancake-score.yml` runs `run.mjs`:

1. It reads product events from the analytics MCP (`https://analytics.getpancake.ai/mcp`, read-only SQL on `analytics_store`).
2. It finds trialing and paying workspaces and scores each one from its actions (`score.mjs`).
3. It sends `pancake_score_updated` to Loops for each member, which triggers the "Pancake score — Weekly level up" email and sets the `pancakeScore` and `pancakeLevel` contact properties.

Nothing in the Pancake app changes. The rules follow the Notion page "Pancake score: build spec".

## Points

| Action | Analytics event | Points |
| --- | --- | --- |
| Connect LinkedIn | `campaign_sender_connected`, or `activation_journey_connection` (linkedin, connected) | 15 |
| Decide on leads | `lead_feedback_submitted`, 3 points each | 15 max |
| Get outreach running | `campaign_lead_enrolled` | 15 |
| Approve an article | `seo_article_approved` | 15 |
| Build the GTM Brain | `onboarding_done` | 10 |
| Refine the GTM Brain | `brain_artifact_edited` | 10 |
| Connect Slack | `slack_connected`, or `activation_journey_connection` (slack, connected) | 10 |
| Connect Claude or Codex | `mcp_grant_connected`, or `activation_journey_connection` (agent, connected) | 10 |

Levels: Batter 0–24, Short stack 25–49, Full stack 50–79, GTM machine 80–100.

## Who gets the email

- Members of workspaces whose latest billing event says trialing, active or past due.
- Not in the first 3 days of a trial (the trial emails cover it), not at 100, and not with fewer than 3 moves left (the email shows three). Those people still get `pancakeScore` and `pancakeLevel` updated.
- Never `@getpancake.ai` or `@getbasalt.ai` addresses.
- At most one score email per person per week (Loops idempotency key).

## Setup

Repository secrets (Settings → Secrets and variables → Actions):

- `ANALYTICS_MCP_TOKEN`: from analytics.getpancake.ai, "Connect MCP".
- `LOOPS_API_KEY`: from Loops, Settings → API.

Repository variable `PANCAKE_SCORE_SEND` = `true` turns on the Monday send. Until then, scheduled runs only report counts.

## Run it by hand

Actions → "Pancake score (weekly)" → Run workflow:

- `dry-run`: counts per level and how many emails are due. No emails.
- `only_email`: sends one sample score email to that address.
- `send`: sends to everyone who is due.

Tests: `node --test scripts/pancake-score.test.mjs`
