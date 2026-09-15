# Brain production cutover — September 14, 2026

Tristan explicitly authorized the production cutover after reviewing Claude's
updated landing. This record supersedes the preview-only deployment status in
the September 11 verification report.

## Deployment and DNS

- Vercel project: `pancake-brain` / `prj_e9TBwJXKfPU2FFqn7nSuaTmBw1MR`.
- Production deployment: `dpl_9drMLr51PiA5iEpXjWZsjm4G31vX`, independently
  confirmed READY with target `production` through the Vercel API.
- Build URL: https://pancake-brain-nms6jxohc-getpancake.vercel.app/.
- Deployment metadata revision: `a69466a267fa93fb8214bf9abe6b73c476460785`;
  application code matches `8e99129`. Subsequent changes through `5b620bc`
  update documentation only.
- `brain.getpancake.ai` was already verified and attached to that exact
  deployment before the DNS change.
- At approximately **2026-09-15 00:36:45 UTC**, Cloud Console saved the A record
  `brain.getpancake.ai.` in project `getpancake`, zone `getpancake-ai`, from
  `185.158.133.1` to `76.76.21.21`. The saved row confirms TTL **300**.
- The `_lovable.brain` verification TXT was preserved. No other DNS records
  were changed.
- Vercel's domain configuration API lists `76.76.21.21` as a supported target.
- Infrastructure PR: https://github.com/get-pancake/pancake-cmo/pull/908,
  reviewed head `0334839cec93625897c708849b1a794d94eee7d2`. It changes only the
  Brain DNS Terraform file. All non-skipped checks passed before entering the
  merge queue at **00:36:52 UTC**.
- PR #908 **merged at 00:52:25 UTC** as
  `9ccfc051bbd4a5aa144b3d9614c61347d790cfe4`, after the merge candidate's
  [CI run](https://github.com/get-pancake/pancake-cmo/actions/runs/34913924718)
  passed. Desired Terraform configuration now matches the live DNS value.

The Terraform DNS workflow validates but does not apply DNS. The repository
also has a broader production-release workflow triggered by infrastructure
changes; merge-queue and release checks must be reported separately. The Console
change updates live DNS, while PR #908 updates the desired Terraform
configuration. No Terraform apply or state import was run during this cutover.

## Verification

- Current auth/attribution contract tests: **17 pass**; TypeScript check passes.
- At approximately **00:42 UTC**, Google Public DNS and the local resolver
  returned `76.76.21.21`; Vercel reported the domain correctly configured.
- The canonical URL returns **HTTP 200 from Vercel**. TLS verification succeeds
  for `brain.getpancake.ai` (certificate expires December 13, 2026). The page
  has the canonical Brain URL and no `noindex` directive.
- The served attribution artifact has SHA256
  `eaf029646b38bdb3285d4e7d78826bc1af3a1d7aa2b8468eeda5e086c0bd5da6`,
  matching the engineer's pinned version byte for byte.
- The served page includes the LeadJourney and LinkedIn vendor loaders.
- `/auth/captcha` returns 200, and magic-link preflight returns 204; both
  allow the exact Brain origin with credentials.
- Codex Browser subsequently displayed the updated landing, active provider
  Google button, both vendor scripts, no broken loaded images, no horizontal
  overflow and no console errors. The initial browser cache of the Lovable
  connection expired; no test signup was submitted to the old page.
- **Google sign-in passed**: Tristan completed the provider interaction on
  the live Brain page; the browser reached authenticated `app.getpancake.ai/home`.
- **Work-email sign-in passed**: the live form showed `Check your inbox`, the
  email arrived at the authorized work address at **00:47:12 UTC**, and clicking
  its one-time link reached the authenticated app home page. The app redeems
  magic-link tokens even when an existing Google session is present.
- **Shared-cookie handoff passed for UTMs**: the received link includes
  `utm_source`, `utm_medium`, `utm_campaign` and `utm_content`. Current backend
  code derives these fields from `request.headers.cookie` in the magic-link
  request, demonstrating that the app received the attribution cookie from
  the Brain form. Query values and authentication tokens are not recorded here.
  No `click_id` was present; provider-click handoff was not exercised.
- These checks used existing accounts and prove sign-in, not new-account
  conversion delivery. No synthetic advertising click ID was introduced.

## Provider conversion verification

LeadJourney and the LinkedIn Insight Tag use the existing configured identifiers.
Browser tag loading is separate from proof that a provider received a conversion.
CMO PR #881 is now merged, but the main Terraform configuration still sets the
LeadJourney destination to `shadow`, with no live watermark. Its runbook requires
new-account signup checks with a real provider `click_id`, plus organic controls.
Existing-account login is not evidence of a new signup conversion.

No provider live-mode setting is changed by this landing cutover. Obvious's tag
checker and the engineer's backend delivery verification remain separate checks.

## Rollback

Restore only the Brain A record to `185.158.133.1`, retaining TTL 300, and revert
the matching Terraform change. The Lovable verification TXT remains available.
Do not perform a full `infra/prod` Terraform apply for this DNS-only rollback.
