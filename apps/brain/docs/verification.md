# Brain replacement verification — September 11, 2026

Code revision: `bfb4ef6b0a9b236309a08ff61d3aaf0dfd37e270`.
Draft review: https://github.com/get-pancake/website/pull/295.

Vercel preview: https://pancake-brain-dfq5dcss1-getpancake.vercel.app/.
Deployment: `dpl_5RmxSg4BTK7HPosiEBwtkGotCEZR`, READY, explicit `staging` target.
Vercel built the reviewed source directly after the new project's Git source
retrieval failed. The app is not linked for automatic Git deployments.

## Design and browser checks

- Compared the live Brain page and current `getpancake.ai` in Codex Browser.
- Reused the current v3 foundation, Geist reading face, Aeonik Condensed display
  faces, logo assets, exact button paths/effects, rainbow renderers and step animations.
- Desktop viewport: 1280 × 720. Mobile viewport: 325 × 927.
- Confirmed computed heading/body fonts, no horizontal overflow, intact assets,
  mobile signup anchor and input, corrected pricing currency wrap, and footer.
- No console errors in the checked production-built local page.
- Hosted preview also passed: exact fonts, all images loaded, no horizontal
  overflow, no console errors, `noindex, nofollow`, and auth/vendor gates intact.
- Preserved Brain destinations and the untouched product/pricing copy. Privacy/Terms
  hash placeholders now link to the main site's actual legal pages.

## Hero and outreach refinement

- Kept the shallow shared rainbow and a desktop hero of at least one viewport.
  The hero now contains the headline, a 22-word outreach-focused introduction,
  social proof, and signup. Increased headline/form spacing and restored the
  larger desktop headline after moving supporting details below the fold.
- Removed the two requested AI-search/publishing and approval benefits. Added
  “Start outreach campaigns from Claude or ChatGPT.” with concise personalized
  outreach/follow-up copy. The remaining three benefits form a separate section
  with larger body text and more space; phones use a single column.
- Reassurance text follows the benefits. No supporting content is clipped.
- At 1280 × 720 the hero ends at 720px and the card at 647px. At 1280 × 640
  the card ends at 587px; at 1024 × 768 it ends at 671px.
- The complete signup card ends at 822px on a 390 × 844 phone and 843px on
  a 325 × 927 phone. No horizontal overflow was observed at any checked width.
- Responsive dimensions were verified in same-origin iframe fixtures through
  Codex Browser, since its viewport override did not resize the active tab.
  The temporary fixture was removed before commit and deployment.
- Hosted preview rechecked at 1280 × 720: the three intended benefits are present,
  the benefits section begins below the hero at 720px, all images load, no console
  errors or horizontal overflow occur, and preview authentication stays disabled.
- Kept 48px controls, 16px input type, form logic, and attribution unchanged.

## Automated checks

`npm run build`, `npm run typecheck`, `npm test`, and `git diff --check` pass.
Build retains only the existing Next image advisory for the shared SVG assets.

17 regression tests cover the pinned attribution artifact, every supported UTM
and click identifier (including provider `click_id`), cookie scope/lifetime,
identity/history retention, preview isolation, query privacy, credentialed auth
requests, 204 magic-link success, Google nonce/login contract, and failure/retry
handling. Tests use VM cookies and mocked fetch; they do not create accounts.

## Remaining production verification

No live signup was submitted and no backend conversion postback was sent.
Real email/Google signup, parent-domain cookie handoff and provider delivery must
be checked on `brain.getpancake.ai` during the manual cutover. The current backend
does not allow arbitrary Vercel preview origins. LeadJourney backend routing was
not modified; its pending source-gating work is tracked separately in CMO PR #881.

The production domain and provider-managed DNS remain unchanged. Follow the
Production rebuild and Terraform/DNS steps in the app README when approved.
