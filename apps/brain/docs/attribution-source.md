# Attribution artifact provenance

`public/pancake-attribution.min.js` is copied byte for byte from Pancake's canonical built artifact:

- Repository: `get-pancake/pancake-cmo`
- Commit: `99d1f394809fcd98893181202f6a1aa1ea651068`
- Source path: `packages/attribution-snippet/dist/pancake-attribution.min.js`
- SHA256: `eaf029646b38bdb3285d4e7d78826bc1af3a1d7aa2b8468eeda5e086c0bd5da6`
- Integration guide: <https://github.com/get-pancake/pancake-cmo/blob/99d1f394809fcd98893181202f6a1aa1ea651068/packages/attribution-snippet/LANDING_SETUP.md>

Load this artifact synchronously near the start of the document head, before the page can navigate to authentication. Do not minify, rewrite, or substitute the older main-website copy: the latter lacks the provider's `click_id` support. The copy writes the shared `.getpancake.ai` attribution cookie; it performs no network request and makes no conversion claim.

The cookie keeps an anonymous ID and up to five acquisition touches for 90 days. Retain inbound UTMs and `click_id` in the URL until this script runs. Auth requests use `credentials: "include"` so the app receives the shared cookie. PAN-880 carries its newest signal-bearing touch into emailed magic links; PAN-887 deduplicates the same-browser re-observation on the server.

LeadJourney's browser tracker remains separate. Actual new-account conversion delivery belongs to the existing backend analytics router, never this form. At inspection time, PAN-891 / PR #881 remained open and described the provider destination as in shadow; delivery being live is not asserted by this rebuild.

## Preview behavior

Email/Google auth is enabled by default only for a production deployment at the exact origin `https://brain.getpancake.ai`. Preview and local pages display their real form but disable requests to the production auth service. `NEXT_PUBLIC_BRAIN_AUTH_ALLOWED_ORIGINS` can explicitly allow exact origins for a controlled test; this does not bypass backend CORS, Google OAuth allowed origins, or reCAPTCHA domain settings. The default API paths are unchanged, and there is no proxy.

`NEXT_PUBLIC_BRAIN_DEPLOYMENT_ENV` is set from Vercel's deployment environment by the app configuration. `NEXT_PUBLIC_BRAIN_GOOGLE_CLIENT_ID` may override the existing public OAuth client ID, which is a browser identifier, not a secret.

## Validation

`npm test` runs the auth request contract tests and the pinned snippet checksum / isolated cookie test. They use mocked fetch and a local VM; they never submit a signup or call an advertising vendor.
