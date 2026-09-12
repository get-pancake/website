# Brain replacement verification — September 11, 2026

Code revision: `f874a0cb820450a909ef279683decd1c3daea4e5`.
Draft review: https://github.com/get-pancake/website/pull/295.

Vercel preview: https://pancake-brain-90op7oerw-getpancake.vercel.app/.
Deployment: `dpl_2fkXNTYiYJgTweGiYrZLwWcSQGF9`, READY, explicit `staging` target.
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
  social proof, and signup. The three supporting benefits follow below.
- Both side ornaments reuse the shared `LpPancakes` and `LpRainbowGL` CTA
  variants. Desktop/tablet artwork now uses a fixed 216px stage, uniformly
  scaled to 0.5 of the original CTA. Its ring center is aligned with the frame
  center. The stage no longer grows with the hero height, which had enlarged
  the rings and made the visible portion nearly straight.
- Desktop side gutters are 176px with a 48px inward artwork offset. Tablet
  gutters and offsets taper without stretching the artwork horizontally.
  Phone geometry remains unchanged. The frame clips the full-height render,
  while the smaller stage exposes a substantially larger portion of the curve.
- Visually checked multiple animation phases. An independent geometry review
  sampled the source paths throughout rotation and found the desktop ink stays
  within approximately 142px of each outside edge, inside its 176px gutter.
- The frame centers at its content height instead of stretching the artwork to
  fill tall viewports. The desktop content gap is 24px, signup width is 384px,
  and the headline uses the existing 57.336px type-scale step. Its margins are
  16px. Smaller screens progressively reduce the decorative edges.
- A clipping gutter keeps animated artwork away from the text and signup.
  The right ornament retains explicit matrix translation and origin 0 0 for
  identical WebGL and DOM clipping at responsive scales.
- Benefits now form one compact vertical checklist in a cream panel, with each
  heading grouped with its explanation and consistent spacing/dividers. The
  outreach benefit remains; its trailing heading period was removed.
- The two reassurance statements sit together below the panel. Removed the
  separate repeated trust strip; the existing footer retains the location.
- At 1280 × 720 the hero ends at 720px and signup at 619px. At 1280 × 640
  signup ends at 579px; at 1024 × 768 it ends at 643px. At 1440 × 900,
  the artwork frame is 541px high, with both 176 × 541 canvases rendered.
- Also checked 1201 × 720, 768 × 800, 390 × 844, and 325 × 927. The desktop
  headline retains two lines across its breakpoint. No horizontal overflow.
- On 390 × 844 and 325 × 927 phones, signup ends at 822px and 843px
  respectively; supporting proof and benefits continue in natural page flow.
- Responsive checks used a temporary same-origin iframe in Codex Browser,
  removed before commit and deployment. Visually reviewed the hero at desktop,
  tablet and phone sizes, and the benefits panel at desktop and phone sizes.
- Frame, signup card and benefits panel use the shared 48px radius on desktop
  and tablet, and 32px below 768px. Input/preview Google placeholder retain
  12px; success panel 16px; filled buttons preserve shared squircle paths.
- Google's live sign-in widget retains its provider-owned rectangular styling.
  No auth, attribution, shared renderer or button component code changed.
- Local build, TypeScript check and 17 auth/attribution regression tests passed.
- The READY staging build was verified in Codex Browser at 1280 × 720 and
  369 × 927. The desktop stage computes to 216px and uniform fit 0.5, with
  visibly curved, thinner bands through the checked animation phases. Correct
  fonts and radii, three checklist rows, no repeated trust strip, no horizontal
  overflow, no broken loaded images or console errors. Both side canvases
  rendered; auth/vendor gates and noindex metadata remain intact.

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
