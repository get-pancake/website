# Brain replacement verification — September 11, 2026

Code revision: `0d8d7d0f38149ee689285cff93081f8cdacc2550`.
Draft review: https://github.com/get-pancake/website/pull/295.

Vercel preview: https://pancake-brain-j46bhar1g-getpancake.vercel.app/.
Deployment: `dpl_CpNPbYzy56WF6epmjKbb2i8XZ74x`, READY, explicit `staging` target.
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
- Kept existing Brain marketing text and destinations. Privacy/Terms hash placeholders
  now link to the main site's actual legal pages.

## First viewport refinement

- Compressed the shared rainbow into a shallow band and reduced navigation and
  form spacing. Desktop hero uses `min-height: calc(100svh - navigation height)`;
  text and forms retain natural overflow on smaller windows or with zoom.
- All headline, benefit, proof, signup and reassurance content fits at 1280 × 720,
  1280 × 640, 1440 × 900 and 1024 × 768. No horizontal overflow was observed.
- Phones show the headline and signup before the supporting benefits. At
  390 × 844 the complete card ends at 830px; at 325 × 927 it ends at 827px.
  Longer supporting text remains below the fold without clipping.
- Responsive dimensions were verified in same-origin iframe fixtures through
  Codex Browser, since its viewport override did not resize the active tab.
  The temporary fixture was removed before commit and deployment.
- Hosted updated preview rechecked at 1280 × 720: hero ends at 720px, signup
  card at 609px, proof at 691px and reassurance at 693px. All images loaded,
  no horizontal overflow or console errors, and preview auth remains disabled.
- Kept all marketing copy, 48px controls, 16px input type, form logic, and tracking.

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
