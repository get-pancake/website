# Brain replacement verification — September 11, 2026

Code revision: `61c86a9689ca4747e576a6057010535191671d60`.
Draft review: https://github.com/get-pancake/website/pull/295.

Vercel preview: https://pancake-brain-nragottmg-getpancake.vercel.app/.
Deployment: `dpl_BKLE7B7bZhsDFNUsu6JMWVuEyVNx`, READY, explicit `staging` target.
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
- The desktop hero frame now has a minimum height of 896px and 96px vertical
  content padding. Signup padding is also 96px, with a 48px form top gap,
  24px divider/cancel gaps and 16px field gaps. The proof row gap is 64px.
  This increases actual content spacing as well as the overall frame height.
- Removed both desktop height-compaction queries. At 1440 × 900, 1280 × 720,
  and 1280 × 640 the hero frame measures 901px and the signup card 709px.
  Previously the frame was 637px on tall screens and 573px on a 720px laptop.
  The taller layout intentionally scrolls on shorter displays instead of
  collapsing back to fit one viewport.
- At 768 × 800, the frame grows naturally to 981px around a 789px signup card.
  Phones reset the desktop minimum, use 32px card padding and 24px outer
  content padding, and retain 8px field gaps. At 390 × 844 the signup card is
  537px high. No horizontal overflow at any checked size.
- Desktop artwork scale, crop and corner radii are unchanged. Its fit remains
  1, with the 432px/416px crop matching the reference at the relevant widths.
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
  hosted hero frame measures 901px and the signup card 709px, matching the
  local checks. Both side crops remain 416px high with 432px source artwork.

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
