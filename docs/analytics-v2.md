# Pancake v2 analytics and advertising runbook

## Purpose and current status

This is the operational source of truth for tracking on the Pancake v2 landing page. The current funnel has only two outcomes:

- Join the waitlist.
- Book a call.

A new waitlist record is the only primary conversion that can be measured today. A booked meeting will become a primary conversion only after a signed Calendly webhook proves that the booking genuinely exists. Opening the scheduler, loading it, or clicking its fallback link is not a booked conversion.

As of this document:

- The implementation is on branch `codex/ads-tracking-v2`, rebased from the current landing-page repository.
- Both Google Tag Manager changes are drafts and are **not published**: web workspace `6` has 28 modifications, and server workspace `7` has 1 modification.
- The code is **not deployed to production** by this runbook.
- Post-commit preview QA ran against `https://pancake-b4bpstlq1-getpancake.vercel.app`, deployment `dpl_GfK6T5qvwH2AnFT93LDtKAkwjLVJ`. The landing waitlist, fresh-session duplicate behavior, report-gate isolation, and scheduler loading passed; the exact Airtable QA rows were deleted afterward.
- Final code commit `f01b43e` has a separate ready preview at `https://pancake-br2gcjti5-getpancake.vercel.app`, deployment `dpl_G5X39Sf9P7iqsE3KtHszY8eYN2wP`. Its production build and landing-page smoke load passed; no additional external waitlist row or booking was created from this final preview.
- Pancake now owns Meta dataset/pixel `1427782115875153`. Its Traffic Permissions allow `getpancake.ai`, including their subdomains. Meta Lead tracking nevertheless remains paused because creating a new dataset-scoped CAPI token is blocked on Business Portfolio admin or developer access.
- The five Airtable analytics-delivery fields have been created and verified in Airtable. Deployment still requires a stable `ANALYTICS_EVENT_ID_SECRET`; without it, the waitlist API intentionally returns 503 before writing a lead.
- Production `AIRTABLE_TOKEN` was changed in place from Vercel's **Needs Attention** / non-sensitive state to **Sensitive**, without changing its value. Vercel now shows **Sensitive / Production**; the setting was updated on August 17, 2026, and no redeploy was triggered. Because the unchanged credential was previously readable, later rotation is still recommended.
- Reddit Business Manager `Pancake` now has website `https://getpancake.ai`, confirmed by the UI success toast. A dedicated Pancake ad account/pixel is still pending; the support session ended at a satisfaction survey without a visible ticket/reference or a newly provisioned account.
- Google Ads administrator access was verified on August 18, 2026 for the authoritative existing Pancake account, customer ID `606-248-5603`. That account contains historical campaigns, spend, and conversion goals; all observed campaigns are currently paused. This migration has not created a Google Ads campaign, budget, billing method, conversion action, GA4 link, or GTM tag. A separate unused account shell, `339-764-4166`, was mistakenly started while access to the existing account was unavailable; it must not be used or deleted without an explicit cleanup decision.

No access token, webhook secret, API key, or local environment value belongs in this document.

## Measurement principles

1. The website emits vendor-neutral product events. GTM maps those events to GA4 and advertising platforms.
2. A click or modal open is never counted as a primary conversion.
3. A waitlist conversion is emitted only after Airtable creates a genuinely new row, or when the same client submission UUID recovers an ambiguous lost response for that row.
4. Durable conversions use a stable server-issued event ID so browser and server copies can be deduplicated.
5. URLs sent to analytics exclude arbitrary query strings and form values. `page_path` is always query-free; `page_location` preserves only the exact allow-listed campaign and click identifiers needed for attribution.
6. Preview and local traffic must not pollute production advertising datasets.
7. No tracking change is automatically published to GTM or promoted to production.

## Exact v2 event taxonomy

Every acquisition event has `schema_version=1` and includes:

- `event_id`
- `event_timestamp_ms`
- query-free `page_path`
- `page_location` containing only origin, path, and approved campaign/click parameters
- `page_title`
- `funnel_stage`
- `conversion_tier`
- `attribution_id` when the attribution cookie contains a valid ID

### Supporting page-view event

| Event | When it fires | Important fields | Conversion status |
| --- | --- | --- | --- |
| `page_view` | Once on the initial render and once for each Next.js App Router navigation | `page_view_kind=initial\|virtual`, `source=next_app_router` | Supporting event only |

### App CTA event (added 2026-08-24)

The landing waitlist was retired on 2026-08-24: every former waitlist pill is
now a direct link to `https://app.getpancake.ai` labeled "Get started". Those
links emit one allow-listed micro event so the funnel stays measurable:

| Event | Tier | Exact firing rule | Event-specific fields |
| --- | --- | --- | --- |
| `app_cta_clicked` | Micro | A "Get started" app link is clicked (fires before navigation) | `cta_id` |

Approved app CTA IDs are `app_nav`, `app_hero`, `app_lead_finding`,
`app_pricing_card`, `app_final`, and `app_pricing_page`.

**GTM action required:** the published container has no trigger for
`app_cta_clicked` yet, and the `lead_form_*`/`lead_submitted` events below can
no longer fire from the landing (the waitlist modal has no remaining trigger).
Add a Custom Event trigger for `app_cta_clicked` and decide deliberately what
replaces `lead_submitted` as the paid-platform conversion (the in-app signup is
the natural successor). PostHog already captures the new event via
`PANCAKE_ACQUISITION_EVENT` with no changes.

### Waitlist events (retired from the landing 2026-08-24)

The events below remain implemented in `lib/analytics/data-layer.ts` and the
`/api/waitlist` route (still called by the `/ai-gtm-report` flow via
`useReport`), but no landing CTA opens the waitlist modal anymore, so they no
longer fire from `/` or `/pricing`.

All waitlist events use `form_id=landing_waitlist` and `lead_type=waitlist`.

| Event | Tier | Exact firing rule | Event-specific fields |
| --- | --- | --- | --- |
| `lead_form_viewed` | Micro | The waitlist modal opens from an approved CTA | `open_method=cta`, `cta_id` |
| `lead_form_started` | Micro | The visitor first interacts with the waitlist form | `cta_id` |
| `lead_submit_failed` | Diagnostic | Client validation, network, or server submission failure | `failure_type=validation\|network\|server`; optional HTTP `status_code` from 400 to 599 |
| `lead_submitted` | **Primary** | Airtable's atomic email upsert confirms that it created a new row | `cta_id`, `handoff_count`; event ID must match `lead.<64 lowercase hex characters>` |

Ordinary duplicate emails and honeypot submissions may show the success UI, but they return `newly_created=false` and no conversion event ID. An exact retry chain is the sole exception: when its UUID matches `Analytics Submission ID` on an eligible v2 row, the API returns `recovered_conversion=true` with the already-persisted event ID so the browser can repair an ambiguous lost response. A later submission with a different UUID must not emit `lead_submitted`.

Approved waitlist CTA IDs are:

- `waitlist_nav`
- `waitlist_hero`
- `waitlist_lead_finding`
- `waitlist_pricing_card`
- `waitlist_final`
- `waitlist_pricing_page`

### Scheduler events

All scheduler events use `scheduler_id=d3zd-2yc-x2s` — the Calendly qualification/routing form. Two required questions route each visitor to the correct meeting type; direct event links would bypass qualification.

| Event | Tier | Exact firing rule | Event-specific fields |
| --- | --- | --- | --- |
| `scheduler_opened` | Micro | The embedded scheduler modal opens | `presentation=embed`, `cta_id` |
| `scheduler_loaded` | Micro | The Calendly iframe reports that it loaded | `presentation=embed`, `cta_id` |
| `scheduler_fallback_clicked` | Micro | The visitor clicks the fallback link to the Calendly form | `cta_id` |
| `meeting_booked` | **Future primary** | A verified and replay-safe signed scheduler webhook proves a completed booking | Contract to be finalized from the real webhook payload; never emitted by the browser alone. Calendly webhook implementation and activation are tracked in PAN-808 |

Approved scheduler CTA IDs are:

- `call_hero`
- `call_final`
- `call_pricing_page`

The old `trial_click`, `meeting_click`, onboarding, Slack, and subscription events are not part of the v2 funnel and must not be configured as v2 primary conversions.

## Attribution and privacy behavior

The first-party attribution cookie keeps an opaque attribution ID and an allow-listed, bounded history. Supported campaign identifiers include UTM parameters plus `fbclid`, `gclid`, `gbraid`, `wbraid`, `li_fat_id`, `msclkid`, `rdt_cid`, `ttclid`, and `twclid`.

The production website code is configured to send PostHog manual page views and the allow-listed acquisition events. On the landing integration, autocapture, page-leave capture, heatmaps, performance capture, and session recording are disabled. Referrers are reduced to their origin, and arbitrary URL parameters are removed.

For the landing waitlist (`Source=landing-v2`) only, the waitlist API normalizes email for duplicate lookup and performs an email-keyed Airtable upsert. Before the write, it creates a stable opaque `lead.<64 lowercase hex characters>` ID using HMAC-SHA256 over the normalized email and the server-only `ANALYTICS_EVENT_ID_SECRET`. The secret is mandatory, must contain at least 32 characters, and must remain stable across deployments. The browser receives only the opaque digest; no email address, Airtable record ID, secret, or free-form field is placed in the data layer.

Each valid `landing-v2` landing-waitlist browser attempt chain generates one UUID and reuses it after a failed request. The initial upsert atomically persists that UUID, the event ID, and `waitlist-v2`. Only a landing-waitlist row with the expected version/event pair is eligible for advertising-delivery recovery, and only a request with the matching UUID may recover the browser conversion. `gtm-report` email-gate submissions are outside this advertising ledger and must not emit or recover a waitlist ad conversion. Legacy rows have no version and are never backfilled.

The `GTM Waitlist` table contains this exact ledger schema, verified present in the Airtable UI:

| Field | Airtable type | Purpose |
| --- | --- | --- |
| `Analytics Delivery Version` | Single line text | Eligibility marker; current value is `waitlist-v2` |
| `Analytics Event ID` | Single line text | Stable opaque browser/server deduplication ID |
| `Analytics Submission ID` | Single line text | Owner UUID for the original browser retry chain |
| `Slack Delivered At` | Date including time | Written only after a successful Slack response |
| `Meta CAPI Delivered At` | Date including time | Written only after a successful Meta CAPI response |

Delivery timestamps are deliberately omitted from every upsert, so a concurrent/retried form write cannot clear proof of an earlier success. A matching retry reads the ledger and attempts only blank destinations. Meta reuses the stable event ID and the original `Submitted At` time. Slack Incoming Webhooks have no idempotency key, so Slack is at-least-once if the webhook succeeds but the Airtable timestamp update is lost. The ledger materially improves recovery, but it is not a transactional exactly-once queue.

## Vendor ownership and known identifiers

| Vendor or surface | Owner | Known identifiers and intended behavior |
| --- | --- | --- |
| GTM web container | GTM | Account `6360623272`; container `255346716`; public ID `GTM-P3Z79WKD`; workspace `6` has 28 unpublished modifications |
| GTM server container | GTM / existing server endpoint | Container `255385456`; public ID `GTM-PRNN2DZS`; workspace `7` has 1 unpublished modification; GA transport endpoint `https://gtm.getpancake.ai` |
| Google Analytics 4 | Two unpublished GTM drafts | Measurement ID `G-6KWBYRZSDX`; the web and server drafts together are configured to forward the explicit page view and all v2 acquisition events after production deployment and coordinated publication; `lead_submitted` key-event designation remains pending GA Editor access |
| PostHog | Website code | EU Cloud project `Pancake-v1`, project ID `170554`; direct sanitized capture through `e.getpancake.ai` |
| Meta | Base pixel in website code; browser Lead mapping in GTM; server Lead delivery inside the verified waitlist API | Pancake-owned website dataset/pixel `1427782115875153`; Traffic Permissions allow `getpancake.ai` plus subdomains; Pancake ad account `538746742816593`; direct initial `PageView` remains; browser and CAPI waitlist `Lead` must share the same opaque `event_id` |
| LinkedIn | GTM only | Ad account `545060035`; company page `104917696`; partner ID `9238938`; event-specific waitlist conversion `29569610` named `v2_waitlist_lead_submitted` |
| X Ads | GTM only | Ads account `18ce55v07al`; profile `@getpancake_ai`; website source `rehvg`; Lead event `rehvk`, full event ID `tw-rehvg-rehvk` |
| Reddit | Tracking disabled until Pancake has a dedicated account and pixel | Business Manager `Pancake`, Business ID `53c537e5-7d98-4d2d-b641-1375882f0935`, now has website `https://getpancake.ai`, verified by a UI success toast; it still exposes only `BasaltAI Main Ad Account` and its paused pixel `a2_hvwir7k3hfy1`, which are not approved for Pancake tracking |
| Google Ads | Existing Pancake account; no v2 GTM conversion tag yet | Authoritative customer ID `606-248-5603`; administrator access verified; historical campaigns and conversion goals exist, and all observed campaigns are paused. Audit and reuse the existing account before adding any v2 measurement. Unused duplicate shell `339-764-4166` is not approved for use |
| Calendly | Qualification form embed; signed backend booking integration | Routing form `d3zd-2yc-x2s`; conversion delivery requires activation and verification of the backend webhook, tracked in PAN-808. |

Steady-state ownership is deliberate:

- GTM and Meta base code remain in the root layout.
- Direct LinkedIn and Reddit code are removed from the new website code so they cannot double-fire with GTM.
- GA4 has no separate direct `gtag` installation.
- PostHog remains direct because it is product analytics, not a GTM advertising tag.

## Exact unpublished GTM drafts

The web-container workspace shows **28 unpublished modifications**, and the server-container workspace shows **1 unpublished modification**, both verified directly in their GTM UIs. Do not describe either set as live until named versions are manually published.

### Data Layer Variables

Web workspace `6` contains these version-2 variables:

- `DLV - event_id`
- `DLV - schema_version`
- `DLV - page_path`
- `DLV - page_location`
- `DLV - page_title`
- `DLV - page_view_kind`
- `DLV - funnel_stage`
- `DLV - conversion_tier`
- `DLV - cta_id`
- `DLV - form_id`
- `DLV - lead_type`
- `DLV - handoff_count`
- `DLV - failure_type`
- `DLV - status_code`
- `DLV - scheduler_id`
- `DLV - presentation`
- `DLV - attribution_id`

The website code clears every optional mapped field on every data-layer push. This prevents a value retained by GTM's data model—for example, a previous failure's `failure_type`—from leaking into a later event.

### Triggers

- `Production page load`, requiring Page Hostname regex `^(www\.)?getpancake\.ai$`.

- `v2 acquisition events`, custom-event regex:

  `^(lead_form_viewed|lead_form_started|scheduler_opened|scheduler_loaded|scheduler_fallback_clicked|lead_submit_failed|lead_submitted)$`

- `v2 waitlist lead submitted`, exact custom event:

  `lead_submitted`

  It also requires Page Hostname regex `^(www\.)?getpancake\.ai$`.

- The legacy `Custom events` trigger remains attached to the GA event-forwarding tag and currently matches:

  `^(trial_click|meeting_click|meeting_booked|page_view|user_signed_up|slack_connected|onboarding_done|subscription_started)$`

  In v2, this trigger is needed for explicit `page_view`; the other names are legacy compatibility only and are not v2 conversions. Retire or isolate them after confirming that no other route still needs them.

### GA4 tags

- `Google Tag G-6KWBYRZSDX`
  - Is configured to fire on Initialization / All Pages when the web draft is published with the production code.
  - Sets `server_container_url=https://gtm.getpancake.ai`.
  - Sets `send_page_view=false`.
- `Forward events to GA4`
  - Is configured to send event name `{{Event}}` to `G-6KWBYRZSDX` after the code is deployed to production and the web GTM draft is published.
  - Uses both the legacy `Custom events` trigger and `v2 acquisition events`.
  - Maps exactly 17 Data Layer Variables: `event_id`, `schema_version`, `page_path`, `page_location`, `page_title`, `page_view_kind`, `funnel_stage`, `conversion_tier`, `cta_id`, `form_id`, `lead_type`, `handoff_count`, `failure_type`, `status_code`, `scheduler_id`, `presentation`, and `attribution_id`.

### Advertising tags

- Existing `LinkedIn - Page Visit`, partner ID `9238938`, is configured to fire on production page loads when the code is live and the web GTM draft is published.
- `LinkedIn - v2 Waitlist Lead - 29569610` is configured to fire only on `v2 waitlist lead submitted` after production deployment and GTM publication.
- `X - Base Pixel - rehvg` is configured to load the Pancake X website source on production page loads after production deployment and GTM publication.
- `X - Waitlist Lead Submitted - rehvk` is configured to fire `tw-rehvg-rehvk` only on `v2 waitlist lead submitted` after production deployment and GTM publication, setting `conversion_id` to the stable `event_id`.
- The legacy `Reddit - Page Visit` tag points to Basalt pixel `a2_hvwir7k3hfy1`. It is paused, must stay paused, and must not be reused. Do not insert or enable any Reddit ID until the separate Pancake pixel exists and ownership has been verified.
- `Meta - v2 Waitlist Lead - Browser` is present but **paused** until all Meta gates below pass. Its UI-verified code sends browser `Lead` using Meta's `eventID` option with the server-issued event ID. The website's server-only CAPI module independently sends the matching server copy after the waitlist API verifies a new eligible Airtable row, and can retry a missing server delivery for the same persisted submission chain; GTM never calls a public CAPI relay.

### Host gating already present in the draft and code

Paid-media base and conversion tags require an exact production hostname: `getpancake.ai` or `www.getpancake.ai`. They do not fire on localhost, Vercel preview domains, or unrelated subdomains. The LinkedIn and X base tags use `Production page load`; the LinkedIn, X, and paused Meta Lead tags use the hostname-constrained `v2 waitlist lead submitted` trigger.

Website code independently limits direct Meta and PostHog to a Vercel production deployment and checks the exact runtime hostname. The React funnel is unusable without JavaScript, so unguardable GTM and Meta `noscript` fallbacks are intentionally omitted rather than letting a generated production Vercel hostname create vendor requests.

Setting `PANCAKE_ANALYTICS_DEBUG=1` on a non-production deployment enables GTM for Tag Assistant; it does not enable direct Meta or PostHog. Server CAPI can additionally send to Meta **Test Events only** when a test-event code, the explicit CAPI feature flag, matching pixel credentials, and the other Meta gates are all separately present. Because the paid browser tags are hostname-gated in GTM, preview validation cannot send LinkedIn, X, Reddit, or Meta production browser events.

Do not remove either layer of gating. The deployment-environment check and the runtime/container hostname checks protect different failure modes.

### Server-container GA forwarding dependency

GA4 delivery is a two-container pipeline:

`website dataLayer -> GTM-P3Z79WKD web container -> gtm.getpancake.ai -> GTM-PRNN2DZS server container -> GA4`

A direct audit of server container `GTM-PRNN2DZS`—container `255385456`, workspace `7`—found 0 draft changes before this fix and one tag:

- `Google Analytics GA4`
- Measurement ID `G-6KWBYRZSDX`
- Event Name `{{Event Name}}`
- Passes all event parameters and user properties
- Triggered by `Custom Event`

The published server trigger admitted only the legacy event set, including `page_view`:

`^(trial_click|meeting_click|meeting_booked|page_view|user_signed_up|slack_connected|onboarding_done|subscription_started)$`

It did not admit any of the seven v2 acquisition events. Publishing only the web draft would therefore have sent those events to the server endpoint, where the published server trigger would have dropped them before GA4.

The unpublished server draft now expands `Custom Event` to include:

- `lead_form_viewed`
- `lead_form_started`
- `scheduler_opened`
- `scheduler_loaded`
- `scheduler_fallback_clicked`
- `lead_submit_failed`
- `lead_submitted`

The resulting server draft regex is:

`^(trial_click|meeting_click|meeting_booked|page_view|user_signed_up|slack_connected|onboarding_done|subscription_started|lead_form_viewed|lead_form_started|scheduler_opened|scheduler_loaded|scheduler_fallback_clicked|lead_submit_failed|lead_submitted)$`

The server workspace UI now shows exactly **1 unpublished modification**. This fixes the server-side filter configuration, but it does not prove GA4 receipt. Both workspace `6` and workspace `7` must be preview-validated and published as one coordinated release.

## GA4 page-view design

There is one source of GA page-view truth:

1. The website emits one `page_view` on initial render and one on each App Router navigation.
2. The GTM Google Tag uses `send_page_view=false`, so it does not generate a competing automatic initial page view.
3. Once published with the production code, web tag `Forward events to GA4` is intended to send the website event to the server endpoint.
4. Once the server draft is also published, its expanded `Custom Event` trigger is intended to admit `page_view` and the seven v2 acquisition events, and `Google Analytics GA4` is intended to forward them to GA4.
5. There is no direct `gtag` page-view sender in the website.

In the GA4 web stream, open Enhanced Measurement, then Page views, and disable or verify disabled the advanced option that sends events for browser-history changes. If that setting remains enabled, Next.js navigation can be counted twice even though GTM uses `send_page_view=false`.

Once GA access exists:

- Confirm one initial and one virtual event in DebugView and Realtime.
- Pending GA Editor access: mark `lead_submitted` as the only current v2 key event. It is not yet verified or configured as a GA4 key event.
- Register useful low-cardinality event dimensions such as `cta_id`, `funnel_stage`, `conversion_tier`, `form_id`, `lead_type`, `scheduler_id`, `failure_type`, and `page_view_kind`.
- Do not register `event_id` as a reporting dimension because it is intentionally unique and would create high cardinality.
- Verify that requests reach the server endpoint successfully and that the server container does not add duplicate GA events.

## Meta Lead and CAPI activation gates

Keep the Meta waitlist tag paused until every item below is true:

1. The canonical Pancake Website dataset/pixel `1427782115875153` is selected everywhere.
2. Meta dataset Traffic Permissions allow `getpancake.ai` and its subdomains. Retire the old scheduler domain permission with its native tracking settings during the backend cutover.
3. Business Portfolio admin or developer access has been granted, and a **new** CAPI token has been generated specifically for the owned Pancake dataset. Do not reuse a token from an old or unrelated dataset.
4. Production `META_PIXEL_ID` is explicitly configured to the same ID used by the browser bootstrap, the new token is installed securely, and `META_CAPI_LEAD_MATCHING_ENABLED=true` is intentionally set.
5. Meta Test Events shows one browser `Lead` and one server `Lead` with the same stable `lead.<64 lowercase hex characters>` event ID.
6. Events Manager reports the pair as deduplicated into one conversion.
7. The trigger is limited to a genuinely new `lead_submitted` on a production hostname.
8. The business has approved the advertising-data basis for sending hashed email and attribution identifiers, given the explicit decision not to install a CMP in this release.

There is no public browser-to-CAPI endpoint. After an origin-checked, rate-limited waitlist request produces a new eligible Airtable row—or an exact persisted submission retry finds its server delivery timestamp blank—the waitlist API calls a server-only Meta module. That module sends only `Lead`, preserves the original Airtable submission time on retry, sanitizes the source URL, hashes normalized email and the optional attribution ID, and refuses delivery unless the server pixel exactly matches the browser pixel. Live delivery additionally requires both a Vercel production deployment and an exact request hostname of `getpancake.ai` or `www.getpancake.ai`; any noncanonical host is allowed only into Meta Test Events with all explicit test gates enabled. CAPI is currently blocked because the required Business Portfolio role and new token do not yet exist. Keep both the feature flag disabled and the GTM browser Lead tag paused; enabling only the browser copy would silently create browser-only conversions.

## Validation matrix

Use GTM Preview / Tag Assistant against a non-production deployment first. Production advertising tags must remain blocked by hostname while preview behavior is inspected. This matrix is the intended acceptance contract, not a claim that GA, LinkedIn, or X has already received these events. GA delivery requires the reviewed code in production plus both GTM drafts; LinkedIn and X require the production code plus the web draft. All three still require the relevant vendor setup/access and final validation.

| Test | Data layer and backend expectation | Analytics expectation | Advertising expectation |
| --- | --- | --- | --- |
| Initial `/` load | Exactly one `page_view` with `page_view_kind=initial`; query-free path and a location containing only approved attribution parameters | After production deployment and both GTM publications, expect one GA event; production PostHog code is configured for one `$pageview` | On production only, expect the direct Meta `PageView` and the published LinkedIn/X base tags to fire; Reddit tracking stays disabled and the paused Basalt tag must not fire |
| Navigate to `/pricing` | Exactly one `page_view` with `page_view_kind=virtual` | After production deployment and both GTM publications, expect one GA event; production PostHog code is configured for one `$pageview` | No primary conversion is intended |
| Open waitlist | One `lead_form_viewed` with the clicked CTA ID | The web and server GA drafts plus production PostHog code are configured for the micro event | No paid conversion is intended |
| Begin waitlist form | At most one `lead_form_started` for the interaction | The web and server GA drafts plus production PostHog code are configured for the micro event | No paid conversion is intended |
| Invalid email | One diagnostic `lead_submit_failed` with `failure_type=validation` | The web and server GA drafts plus production PostHog code are configured for the diagnostic event | No paid conversion is intended |
| Server or network failure | One diagnostic failure with the correct type and safe status when available | The web and server GA drafts plus production PostHog code are configured for the diagnostic event | No paid conversion is intended |
| Later duplicate email | A new submission UUID does not match the stored owner; API returns `newly_created=false`, `recovered_conversion=false`, and no event ID | No primary `lead_submitted` is intended | No paid conversion is intended |
| Exact retry after ambiguous timeout | The reused submission UUID matches; API returns `newly_created=false`, `recovered_conversion=true`, and the same opaque event ID; only blank Slack/Meta ledger destinations are retried | The browser emits the canonical `lead_submitted` once for that retry chain | When Meta is later enabled and validated, the deduplication design reuses the same `event_id`; no Meta delivery is currently claimed |
| Honeypot submission | Pretend-success response with `newly_created=false` | No primary `lead_submitted` is intended | No paid conversion is intended |
| New unique email | One Airtable row, one HMAC-derived opaque `lead.<64 lowercase hex characters>` ID, one submission UUID, delivery timestamps only after success, and one `lead_submitted` | The web and server GA drafts are configured to forward the event after both are published, but GA4 key-event designation is pending Editor access; production PostHog code is configured to capture it | LinkedIn `29569610` and X `tw-rehvg-rehvk` are configured to fire after production deployment and web GTM publication; Meta browser Lead and CAPI remain off until their gates pass; Reddit tracking is disabled; Google Ads is not configured |
| Open scheduler | One `scheduler_opened` | The web and server GA drafts plus production PostHog code are configured for the micro event | No paid conversion is intended |
| Calendly form loads | One `scheduler_loaded` | The web and server GA drafts plus production PostHog code are configured for the micro event | No paid conversion is intended |
| Click Calendly fallback | One `scheduler_fallback_clicked` | The web and server GA drafts plus production PostHog code are configured for the micro event | No paid conversion is intended |
| Complete a booking after canonical webhook launch | One signature-verified, idempotent `meeting_booked` from the confirmed webhook path | Configure and then validate the canonical key event | Configure and validate one deduplicated cross-vendor conversion per explicitly enabled vendor |
| Privacy inspection | No email, free text, secret, arbitrary query, or full external referrer in event payloads | Sanitized URLs only | Only approved fields and attribution identifiers |

A controlled new-lead test writes a real Airtable row and can notify Slack. Agree on the test address and record-handling plan before running it.

## Post-commit preview verification — August 17, 2026

The post-commit verification used:

- Full funnel QA preview: `https://pancake-b4bpstlq1-getpancake.vercel.app`
- Full funnel QA deployment ID: `dpl_GfK6T5qvwH2AnFT93LDtKAkwjLVJ`
- Final code commit `f01b43e` smoke preview: `https://pancake-br2gcjti5-getpancake.vercel.app`
- Final code deployment ID: `dpl_G5X39Sf9P7iqsE3KtHszY8eYN2wP`

The following behavior was directly verified:

- A new `landing-v2` waitlist submission succeeded.
- The same email submitted from a fresh browser session also completed the user flow and was correctly treated as a duplicate.
- Airtable contained exactly one matching `landing-v2` row. Its analytics event ID matched `lead.<64 lowercase hexadecimal characters>` and its submission ID was a valid UUID. `Slack Delivered At` was blank because `SLACK_WAITLIST_WEBHOOK_URL` was not configured in preview, so Slack delivery was **not tested**. `Meta CAPI Delivered At` was blank because Meta server delivery was preview-gated, as intended.
- The exact waitlist QA row was deleted after verification.
- The `/ai-gtm-report` email-gate contract passed and remained outside the advertising-delivery ledger. Its exact Airtable QA row was also deleted.
- The scheduler iframe and available slots loaded without browser errors.
- The final code preview completed its Vercel production build and loaded the landing page successfully. The only code change after the full funnel QA was Airtable environment-value normalization, which is covered by the focused 6/6 test suite; no second external submission was created solely to retest that guard.

The web GTM workspace was checked directly in its UI: its 28 draft modifications, tag settings, triggers, 17 mapped variables, vendor IDs, and paused Meta state matched the configuration documented above. The later direct server-container audit found the legacy trigger gap described above and produced the single unpublished server-workspace fix. Neither container's live event flow has yet been certified through Tag Assistant and GA4.

Tag Assistant's popup could not establish its live preview connection inside Codex Browser. Direct DOM inspection did show `gtm.js` and `gtag` loaded on the preview, which proves that the scripts loaded but does **not** certify tag firing or GA4 receipt. Final Tag Assistant validation must run in a normal main-world browser. GA4 DebugView/Realtime validation must follow after the required property access is available.

## External blockers

### Meta

The Pancake Website dataset/pixel `1427782115875153` is owned by Pancake. CAPI token generation still requires the appropriate Business Portfolio role. Keep server delivery disabled and the GTM Meta Lead tag paused until a new token exists and the activation gates pass.

### Reddit

Reddit Business Manager `Pancake` has Business ID `53c537e5-7d98-4d2d-b641-1375882f0935`. Its business website was successfully changed from the former Basalt URL to `https://getpancake.ai`, confirmed by Reddit's UI success toast. The manager still contains only `BasaltAI Main Ad Account`, using pixel `a2_hvwir7k3hfy1`, and the UI exposes no **Create Ad Account** control, so Codex did not create or repurpose anything.

A support request was sent for a separate `Pancake Main Ad Account` and dedicated Pancake pixel. Reddit's AI support escalated the request to a human at 21:04 PT, but the support session subsequently closed to a satisfaction survey without a visible ticket/reference, a human response, or a newly provisioned account. Basalt remains the only account shown. No Reddit identifier is approved for this release, and the old Basalt pixel remains paused and must not be reused.

### Google Ads

Google Ads administrator access is verified for the authoritative existing Pancake account, customer ID `606-248-5603`. The account is not blank: it contains historical campaigns and spend, plus existing primary conversion goals for purchases, subscriptions, lead-form submissions, sign-ups, appointments, and engagement. All three observed campaigns are currently paused, and no ad is serving. Do not recreate this setup from scratch. Audit the existing conversion actions and their sources first, then reuse or replace them deliberately for the v2 funnel.

The separate customer `339-764-4166` is an unused duplicate shell mistakenly started while access to `606-248-5603` was unavailable. It has no approved role in the Pancake setup. No campaign, billing method, budget, conversion action, or spend was introduced there by this migration. Do not use or delete it without an explicit cleanup decision.

This migration has not yet added a Google Ads GTM tag, v2 waitlist conversion, GA4 link, campaign, billing method, budget, or spend. Any future waitlist conversion must target `606-248-5603` and fire only for the confirmed primary `lead_submitted` event. Create a booked-meeting conversion only after the signed Calendly webhook exists; scheduler opens, loads, and clicks are not conversions.

### Google Analytics

The current Google login does not show the property for `G-6KWBYRZSDX`. Editor access is still required to open DebugView and verify Enhanced Measurement, custom definitions, key events, retention, filters, and any future Google Ads link. The code and both GTM drafts can be reviewed without that role, but end-to-end GA4 delivery must not be called verified until Tag Assistant has connected through both the web and server containers in a normal main-world browser and DebugView/Realtime have been observed in the property.

The website and GTM design is intentionally manual for Next.js SPA page views. Per Google's SPA guidance, the GA4 web stream's Enhanced Measurement option for page changes based on browser-history events must be disabled to prevent duplicate virtual page views. This setting cannot be certified until the property is accessible.

### Calendly

Every booking CTA opens the published qualification form `https://calendly.com/d/d3zd-2yc-x2s`. Its two required questions route all ten answer combinations to group demo, discovery, enterprise discovery or product feedback. Cancellation feedback has a separate direct link.

The signed webhook implementation lives in `get-pancake/pancake-cmo`, tracked in PAN-808 and PR #793. Only verified booking creation for sales meeting types counts as a conversion. Feedback, rescheduling and cancellation never count as new sales bookings. Production conversion delivery remains unverified until the signing key, subscription and release are activated and checked.

Retirement order: verify Calendly ingestion and downstream delivery, disable the retired provider's webhook/native analytics settings, then deploy removal of its old receiver and apply infrastructure teardown. Website clicks and iframe loads remain micro-events.

### Airtable delivery durability

The authorized `landing-v2` delivery ledger closes the normal commit-before-timeout gap for the landing waitlist without a package, cron, or public relay. Its event ID is computed before the upsert, so every landing-waitlist request for the same normalized email and stable secret uses the same opaque ID. A retry from the same browser attempt chain can recover the canonical browser response and retry only Slack/Meta destinations without timestamps. `gtm-report` submissions and legacy rows cannot enter this advertising-delivery path.

Airtable `performUpsert` does not support a conditional create-only owner field. In the extremely narrow case where two first `landing-v2` requests for the same previously unseen email arrive simultaneously with different submission UUIDs, the losing update can overwrite `Analytics Submission ID`. Both requests still use the same event ID and only one Airtable row is created, but exact browser ownership cannot be guaranteed under that race. The route suppresses an immediate browser conversion on the losing upsert response; do not claim transactional exactly-once browser delivery. Meta remains deduplicable by the stable event ID. Slack is at-least-once if its success timestamp cannot be recorded.

### Vercel credential hardening

The production `AIRTABLE_TOKEN` environment variable had been flagged **Needs Attention** because it was not marked sensitive. It was updated in place with the same value on August 17, 2026, and is now UI-verified as **Sensitive / Production**. This settings change did not trigger a Vercel redeploy, and no credential value is recorded here.

Code-level input hardening is also implemented in `lib/airtable-config.ts`. It trims surrounding deployment-UI whitespace, accepts only a structurally valid Airtable base ID, and rejects token values containing internal carriage-return or line-feed characters. The landing waitlist route, the shared Airtable client, and the metrics path all use these normalizers. The focused configuration tests pass 6/6. This guard reduces malformed header and deployment-input failures; it does not replace later credential rotation.

Marking the variable sensitive prevents future UI reads, but it does not undo the fact that the unchanged credential was previously readable. Rotate the Airtable credential in a later controlled maintenance step, update Vercel with the replacement, verify the waitlist contract, and revoke the old credential. Do not rotate it casually during the coordinated analytics release.

## Deployment procedure

### Before production

1. Reconfirm the five already-created Airtable ledger fields above, then configure a stable 32+-character `ANALYTICS_EVENT_ID_SECRET` before deploying the new API contract. If the secret is absent or shorter than 32 characters, a `landing-v2` waitlist request returns 503 and performs no Airtable write; the separate `gtm-report` email gate remains outside the advertising ledger. Keep the same secret across deployments; changing it changes the deterministic event ID and breaks recovery for existing v2 rows.
2. Finish code review, focused delivery-ledger tests, type checking, linting, and a production build.
3. Verify the existing production/preview host gating in website code and web GTM workspace `6`; verify the event allow-list and GA tag in server GTM workspace `7`.
4. Create a Vercel preview with `PANCAKE_ANALYTICS_DEBUG=1`; do not promote it automatically. By itself, this flag enables GTM only, while direct Meta and PostHog remain disabled. Meta CAPI test delivery also requires its separate test code, feature flag, and matching credentials.
5. Connect GTM Preview in a normal main-world browser and execute the validation matrix through **both** web workspace `6` and server workspace `7`. Confirm explicitly that every production-host paid tag remains blocked, that all seven v2 events reach the server container, and that the server GA tag is eligible to fire for them. GA4 receipt still requires DebugView/Realtime access.
6. Keep Meta paused and Reddit tracking disabled with the Basalt tag paused. In Google Ads, use only customer `606-248-5603`; audit its existing conversion actions before adding any v2 conversion, and do not activate campaigns, billing, budgets, or spend as part of this release.
7. Record the exact commit, web workspace `6` state, and server workspace `7` state that passed testing.

### Coordinated production release

1. Tristan manually promotes the verified code to production.
2. Confirm that the new production page loads and emits one `schema_version=1` initial `page_view`.
3. Publish the reviewed server-container workspace `7` draft as a clearly named version, then immediately publish the matching web-container workspace `6` draft. The server allow-list expansion is backward-compatible and must land first so the web container cannot send v2 events into the legacy server-side filter.
4. Treat the two GTM publications as one coordinated release. Do not publish the web draft before the production code or the server draft. Code-first can produce a very short interval with two GA initial page views because the previous web GTM version still auto-sends one; keep that interval as short as possible.
5. Run production smoke checks for page view, modal micro events, scheduler micro events, and one agreed unique waitlist lead.
6. Check GA DebugView/Realtime and PostHog promptly. Advertising platforms can report with delay, so recheck their diagnostics later without firing duplicate test submissions.
7. Record the production Vercel deployment, web GTM version, and server GTM version together as one release set.

## Rollback

The code deployment, web GTM version, and server GTM version form one release set. Do not roll back only one layer and leave the pipeline mismatched.

### A single vendor is wrong

Pause only the affected vendor conversion tag, publish a small named GTM hotfix, and leave the shared event contract and GA page-view design intact. Meta is already paused until its gates pass.

### The GTM release is broadly wrong

1. Revert the web container to its previously published GTM version so it stops producing the new mapping.
2. Revert the server container to its matching previously published GTM version.
3. Immediately roll the Vercel production deployment back to its matching previous code version.
4. Expect a brief return of the previous tracking behavior during the coordinated rollback; verify GA page views and ensure no new conversion tag continues firing.

### The website release is broadly wrong

1. Pause or revert new conversion tags first so they cannot consume malformed events.
2. Roll Vercel back to the previous deployment.
3. Restore the matching previous web and server GTM versions immediately afterward.

Never delete a GTM container, tag history, or vendor dataset during rollback. Published versions in both containers and Vercel deployments provide the recovery path.

## Accepted no-CMP limitation

Tristan explicitly chose not to add a visible consent banner or CMP. This runbook therefore does not implement a full consent-management flow or claim that the resulting setup is compliant for EU, UK, or Swiss traffic.

That decision can affect both legal exposure and measurement quality. It must remain documented as an accepted limitation. A later legal or policy review may require a CMP and Google Consent Mode v2; if the decision changes, consent behavior must be designed and tested as a separate release rather than silently added inside this migration.

## Known follow-up improvements

These are not reasons to invent conversions, but they prevent the setup from being described as fully complete:

- Persist approved first-touch/latest-touch fields and `attribution_id` into the CRM if Airtable fields are added and authorized.
- If strict transactional browser exactly-once delivery becomes necessary, move conversion ownership to a datastore with conditional writes or a queue; Airtable cannot provide that guarantee for simultaneous first writers.
- Decide whether pricing-page retargeting needs explicit Meta, LinkedIn, or X virtual page-view events; current primary-conversion accuracy does not depend on them.
- Retire legacy GTM event names after confirming no remaining route consumes them.
- Expand the focused delivery-ledger tests to cover the complete browser event contract, safe URL behavior, and vendor activation gates.
- Update project-level analytics documentation after this migration ships so a future agent does not restore the removed direct LinkedIn or Reddit integrations.
