# Brain replacement verification — September 11, 2026

Code revision: `57f95828b4158fac06560a4a65d378b87d21a46c`.
Draft review: https://github.com/get-pancake/website/pull/295.

Vercel preview: https://pancake-brain-h4od8kz51-getpancake.vercel.app/.
Deployment: `dpl_9o5ifTRzEcNRzR4Lm767TAmoBYqG`, READY, explicit `staging` target.
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

## Hero, side artwork and benefits refinement

- The hero contains the sentence-case headline, a 22-word outreach introduction,
  social proof, and signup. Its content gap is 24px and signup width is 384px.
- The rainbows reuse the main landing's `LpPancakes` and `LpRainbowGL` CTA
  variants with the same artwork scale AND the same visible vertical crop.
  Absolute clip frames center the ornaments without changing the hero height.
- Compared the live `getpancake.ai` CTA and Brain in Codex Browser at 1280 × 720:
  both have left artwork 560 × 432, right artwork 529 × 432, fit 1, top 0,
  416px crop height, and 48px radius. The measured geometry matches exactly.
- Above 1360px, the crop is 432px like the shared CTA. At 768–1024px it follows
  the shared 336px artwork / 384px crop recipe. Narrower desktop/tablet widths
  shift the ornaments outward for text clearance; phones retain their prior
  compact edge treatment.
- Both clip parents span the frame width on desktop, so a narrow gutter cannot
  cut the inside curve into a straight line. The content reserves side space
  separately. No shared artwork, renderer, colors or button recipes changed.
- A local ResizeObserver refreshes the renderer after the clip size changes,
  since shared GL observes only artwork size. Refresh is debounced by 120ms
  to avoid recreating WebGL contexts continuously during a window drag.
  Verified in-place 1201 → 1440 → 768 → 1440 resizing; final canvases return
  to the full 560 × 432 and 529 × 432 desktop dimensions.
- Benefits remain one vertical checklist in a cream panel. Each heading stays
  grouped with its explanation; reassurance follows below. The repeated trust
  strip is removed, and the existing footer retains the location.
- Increased desktop hero content padding and signup card padding from 32 to 48px,
  form top gap from 16 to 24px, and divider/cancel spacing from 8 to 16px. The
  proof row has 48px breathing room on taller screens. Label/input/help grouping
  remains 8px. At 1440 × 900, the hero frame is 637px tall (previously 541), and
  the signup card is 541px tall (previously 477).
- Screens at most 800px tall retain 32px outer/card padding; the existing short
  viewport adjustment still applies below 700px. At 1280 × 720 signup ends at 635px;
  at 1280 × 640 it ends at 595px; at 1024 × 768 it ends at 659px. The hero still
  ends at the viewport edge. Also checked 768 × 800, 390 × 844 and325 × 927.
- Phones use 24px signup padding and the roomier form gaps, with natural vertical
  scrolling. No horizontal overflow at any checked size. Desktop artwork stage,
  crop height and radii are unchanged; its fit remains 1.
- The responsive iframe fixture was removed before commit and deployment.
  Build, TypeScript validation and diff checks pass. The unchanged auth and
  attribution code remains covered by the existing 17 passing regressions.
- Frame, signup and benefits use shared 48px desktop/tablet and 32px mobile
  radii. Inputs/preview Google placeholder retain 12px, success panel 16px,
  and filled buttons preserve the exact shared squircle paths. Google's live
  sign-in widget retains its provider-owned rectangular styling.

- The READY hosted preview was visually verified at 1280 × 720. Its measured
  artwork dimensions, fit, top position, crop height and radius match the live
  main CTA values above. No horizontal overflow, broken loaded images or
  browser errors; auth remains disabled and noindex metadata is intact. The
  hosted 1280 × 720 hero frame is now 573px tall, with a 509px signup card,
  24px form top gap and 16px divider margins.

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
