# Demo requests and approval

The public `/demo` page asks about identity, company size, goals, service, budget, outbound team, tool and volume. Self-serve budgets below $350 go directly to the walkthrough and Juicy, without a sales request or enrichment. $350+ and unknown budgets, plus White Glove requests, go to manual review. Selecting White Glove never opens a calendar.

## Storage and review

Apply `supabase/migrations/20261104021927_demo_request_review.sql` to the website's Supabase project before deploying. The table is server-only: RLS enabled, no anon/authenticated grants or policies. The server validates option membership and service/budget combinations. Submission UUID plus normalized-answer hash makes retries idempotent. A successful response means the private queue has persisted the request, even if Attio is unavailable. Attio notes include the complete qualification and a link to review.

`/demo/review` requires the existing verified staff Google session AND membership in `DEMO_REVIEWER_EMAILS` (default: François's pancake.ai/getpancake.ai addresses). The Google callback only accepts a fixed demo-review return destination; no arbitrary redirect parameter is used. The queue shows the 100 latest requests, research, CRM delivery and invitation status.

## Research

`/api/cron/demo-research` is protected by `CRON_SECRET` and runs every ten minutes. It processes at most one queued request per invocation, using `ANTHROPIC_API_KEY` and the basic web-search tool, at most three searches. `DEMO_RESEARCH_MODEL` optionally overrides `claude-sonnet-4-5-20250929`. No raw work-email address is sent to research, only its domain. The report requires source citations, distinguishes applicant claims, and never decides approval. Failed or interrupted jobs remain visible for manual retry; they do not spend indefinitely. An authorized reviewer can run a queued/failed request immediately.

## Invitations

`SENDGRID_API_KEY` must have mail-send permission. `DEMO_INVITATION_FROM` defaults to `hi@pancake.ai` and must be a verified sender. Approval atomically claims a pending request before sending. Invites are delivered as both HTML and plain text; click/open tracking is disabled. Only the SHA-256 digest of the random 256-bit invite token is stored. The invitation expires after fourteen days and is checked server-side before redirecting to the existing service-specific calendar. The secret route is a no-store, no-referrer server response, so no site analytics loads on the token URL.

A provider 202 means accepted, not delivered. Definite provider rejection reverts approval. Timeout/5xx means uncertain delivery; the queue records it, blocks automatic resends, and asks the reviewer to check the provider. A repeated click cannot send another invitation. Marking a request self-serve is an internal decision only and does not send a rejection email.

## Deployment and validation

The local `/demo-preview` mock is excluded from Vercel deployments and is not part of this change. There are no sample requests in production. Existing public Calendly URLs are not disabled by this website change; the site no longer offers them before approval.

Run `node --test scripts/demo-policy.test.cjs scripts/demo-review.test.cjs`, `npx tsc --noEmit`, and `npm run build`. Integration tests stub providers and never send a customer email. Verify the live configuration and authenticated review flow before promoting the deployment.
