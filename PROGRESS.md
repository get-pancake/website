# Pancake landing rebuild — progress

- [x] **Phase 1:** Audit & Strip
- [x] **Phase 2:** Install + design kit port (tokens, reset, styles, Aeonik Fono, GSAP, UI primitives, `/kit-test`)
- [ ] **Phase 3:** Rebuild Homepage
- [ ] **Phase 4:** Rebuild `/signup` (visual only — form/API sacred)
- [ ] **Phase 5:** Rebuild `/pricing`
- [ ] **Phase 6:** Rebuild `/build-in-public`
- [ ] **Phase 7:** Final Pass

## Brain landing / Vercel migration — September 11, 2026

- [x] Compare contractor Brain page with the current v3 landing in Codex Browser.
- [x] Create independent `apps/brain` Vercel app sharing active fonts, tokens, buttons, rainbow and step animations.
- [x] Preserve the canonical attribution script including provider `click_id` and the existing credentialed email/Google auth contract.
- [x] Pass production build, TypeScript, 17 regression tests, and desktop/mobile browser checks.
- [x] Publish and verify a separate Vercel preview; open draft PR #295.
- [ ] Manual Production rebuild, domain/Terraform cutover, and live signup/affiliate verification.

- [x] Simplify the hero to headline, introduction, proof and signup; move benefits below it and replace the two requested claims with outreach from Claude/ChatGPT.

- [x] Replace the top rainbow with shared CTA side ornaments and verify desktop/mobile radii and content clearance.

- [x] Match the main CTA artwork scale, crop and radii exactly; add more vertical hero/form space and keep the aligned benefits checklist.

- [x] 2026-09-14 review fixes (Tristan): LeadJourney and the LinkedIn Insight Tag load on the canonical hostname with the main site's ids; the hero sits on the 1296px grid: the copy on the cream page, aligned with the logo, and the conversion block in a white card on the right, aligned with the nav CTA, with only the right rainbow sliver inside it (full card height, squeezed to 70%, clipped by the card's corners like the main CTA card); the nav is the main site's 120px bar; the card height follows the viewport minus 32px, capped by the row's width budget (H ≤ (row − 920px) / 0.259) and by 840px, so the headline keeps two lines and the form stays above the fold on 1366×768 and 1280×720; tablets and phones stack the copy then the card with a thin edge strip; card copy cut to the conversion essentials (Start free · Add your website. Pancake learns who buys from you and starts the outreach. Set up in five minutes. · Work email · Continue with email · Cancel anytime), the preview notice only appears after someone tries to sign up, and the SOC 2 / reassurance strip is gone; Google sign-in is the provider's pill button with a matching placeholder; AI-search claims removed from the benefits, pricing list, step 02 and metadata; every link stays on the page (nav → How it works / Pricing, pricing CTA → the form); email hint dropped; signup card titled “Start free”.

Preview: https://pancake-brain-87pamlhdo-getpancake.vercel.app/ (2026-09-14, commit 2029249 — copy on cream, conversion card with the right rainbow)

Draft PR: https://github.com/get-pancake/website/pull/295

Details: [Brain verification](apps/brain/docs/verification.md) and [deployment/cutover instructions](apps/brain/README.md).

## Mobile performance — September 7, 2026

- [x] Measure the live homepage with Google Lighthouse on mobile and desktop; inspect local Performance traces and downloaded resources.
- [x] Confirm the active homepage requests no video media.
- [x] Bound the mobile Canvas2D fallback and restore the existing SVG on expensive rendering, releasing its buffers.
- [x] Defer offscreen animation modules/images and remove ten unnecessary font preloads, preserving typography and artwork.
- [x] Validate with production builds, behavioral regression tests, independent review, and Codex Browser interaction/layout checks.
- [x] Prepare a preview and draft PR; production promotion remains manual.

Draft PR: https://github.com/get-pancake/website/pull/283

Preview: https://pancake-git-codex-mobile-performance-getpancake.vercel.app

Measurements, caveats, and reproduction commands: [mobile-performance-2026-09-07.md](docs/mobile-performance-2026-09-07.md).

## Human / agent toggle foundation — September 4, 2026

Scope: original human landing plus a selector above the headline’s right edge. Agent mode keeps the hero layout and uses inverse cream/plum colors, followed by the agent terminal playground requested in the subsequent iteration.

- [x] Restore original v3 copy and section components.
- [x] Keep human layout unchanged apart from the selector.
- [x] Match the Figma Signals switch, with rainbow blue for humans and green for agents.
- [x] Remove the earlier agent copy, demonstrations and setup surfaces.
- [x] Add the inverse hero, preserving artwork and motion phase.
- [x] Keep URL sharing, refresh, browser history and keyboard switching working.
- [x] Add a quick 240ms crossfade in both directions, respecting reduced motion.
- [x] Remove the pre-fade wait and keep the switch’s standard slide outside the page crossfade.
- [x] Set the agent H1 to “Give your human” / “GTM superpowers”, preserving the original font, size and headline box.
- [x] Add the agent-only “Start here” terminal CTA with verified public plugin setup URL and working copy feedback.
- [x] Set the terminal background to pure black; remove “Start here” at the founder’s request.
- [x] Add the single-line Aeonik Fono agent headline (`> give your human gtm superpowers`, reworded `> @agent get gtm superpowers` on 2026-09-07 so the agent is the one who gets stronger), with a typing reveal followed by a continuously blinking cursor; reduced motion shows the complete line and solid cursor immediately.
- [x] Set a balanced agent headline size and remove the initial size jump; begin typing after fonts settle, preserving human layout and setup alignment.
- [x] Align the agent setup block to the original human description/buttons bounds, preserving their position and width on desktop and mobile.
- [x] Replace the paste hint with “friends with” and white Claude / Codex / Cursor / Hermes / OpenClaw logos above the terminal at its right edge, preserving accessible copy feedback.
- [x] Center the desktop terminal on the H1, tighten the lowercase friends row to a 12px gap, and remove the Hermes portrait’s border and backing.
- [x] Compare desktop and phone human layouts against baseline `14ad159`.
- [x] Independently review code and test booking and mobile menu behavior.
- [x] Complete production build and updated Vercel preview verification.

Preview: https://pancake-pozge9pl4-getpancake.vercel.app
Draft PR: https://github.com/get-pancake/website/pull/275

Implementation and validation: [human-agent-design.md](docs/human-agent-design.md).

## Agent terminal playground — September 4, 2026

- [x] Replace the empty agent viewport with a continuously generated GTM pseudocode terminal.
- [x] Use Pretext for actual line reflow around the pointer, with cached text metrics and bounded canvas rendering.
- [x] Add a deliberately impossible paired-tile puzzle, then simplify its presentation to the founder’s classic CAPTCHA reference.
- [x] Keep the title and instruction on separate single lines, each with uniform text size.
- [x] Support keyboard interaction, live feedback, pause/resume, reduced motion and native touch scrolling.
- [x] Exhaustively verify the puzzle’s parity invariant and independently review accessibility and human-mode isolation.

- [x] Remove both terminal bars and their labels/dividers, extend the stream edge to edge, and keep pause in the CAPTCHA footer.

- [x] Replace the hero terminal setup prompt with the founder’s install.md curl instruction, remove the dollar prefix, and copy the same complete text.

- [x] Make the agent hero fill the first viewport including navigation, keeping the terminal playground below the fold until scrolling.
