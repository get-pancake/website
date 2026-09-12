# Brain replacement verification — September 11, 2026

Code revision: `da0ad0bab6147e174b4f9a2004db21ee73a33b6b`.
Draft review: https://github.com/get-pancake/website/pull/295.

Vercel preview: https://pancake-brain-qhw2ng5od-getpancake.vercel.app/.
Deployment: `dpl_3D8QJkaZhxaxxDdwyMmKwNzB4v29`, READY, explicit `staging` target.
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

- Replaced the top rainbow with the exact left/right CTA ring components from
  the main landing, clipped inside a shared rounded frame. The desktop hero
  remains at least one viewport.
  The hero now contains the headline, a 22-word outreach-focused introduction,
  social proof, and signup. Increased headline/form spacing and restored the
  larger desktop headline after moving supporting details below the fold.
- Removed the two requested AI-search/publishing and approval benefits. Added
  “Start outreach campaigns from Claude or ChatGPT.” with concise personalized
  outreach/follow-up copy. The remaining three benefits form a separate section
  with larger body text and more space; phones use a single column.
- Reassurance text follows the benefits. No supporting content is clipped.
- At 1280 × 720 the hero ends at 720px and the card at 619px. At 1280 × 640
  the card ends at 579px; at 1024 × 768 it ends at 643px.
- The complete signup card ends at 822px on a 390 × 844 phone and 843px on
  a 325 × 927 phone. No horizontal overflow was observed at any checked width.
- Responsive dimensions were verified in same-origin iframe fixtures through
  Codex Browser, since its viewport override did not resize the active tab.
  The temporary fixture was removed before commit and deployment.
- Kept 48px controls, 16px input type, form logic, and attribution unchanged.

## Side artwork and radius checks

- Both ornaments reuse `LpPancakes` and `LpRainbowGL` CTA variants. A reserved
  clipping gutter keeps every animation frame out of the text and form.
- The right ornament uses explicit matrix translation with origin 0 0, matching
  the shared WebGL renderer's clipping calculations and the DOM fallback.
- Both canvases rendered visible 213 × 584 buffers at 1280 × 720. Also checked
  1440 × 900, 1280 × 640, 1024 × 768, 768 × 800, 390 × 844, and 325 × 927.
- Frame and signup card: shared 48px radius on desktop/tablet, 32px below 768px.
  The former tablet-only 32px signup override now matches the reference CTA.
- Inputs and preview Google placeholder: shared 12px. Success panel: 16px.
  Filled buttons retain the exact shared Figma squircle paths (9/12/18px
  recipes by size), and avatars/status indicators remain circular.
- Google's production sign-in widget retains its provider-owned rectangular
  styling. Its internal iframe radius cannot be verified from the disabled
  preview, and it has not been overridden or clipped.
- Hosted preview verified at 325 × 927 and 603 × 927: both side ornaments
  render, the top rainbow is absent, frame/card/input radii match, preview auth
  stays disabled, and no horizontal overflow or console errors were observed.
- No shared component, auth, attribution, or marketing copy changes in this pass.

## Headline casing

- Hero updated to “Put your GTM on full autopilot”. The line break remains
  after “on”; no wording or punctuation was added. Other headings already use
  sentence case, retaining proper names and acronyms. Confirmed the exact heading
  on the READY Vercel preview in Codex Browser.

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
