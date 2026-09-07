# Pancake landing rebuild — progress

- [x] **Phase 1:** Audit & Strip
- [x] **Phase 2:** Install + design kit port (tokens, reset, styles, Aeonik Fono, GSAP, UI primitives, `/kit-test`)
- [ ] **Phase 3:** Rebuild Homepage
- [ ] **Phase 4:** Rebuild `/signup` (visual only — form/API sacred)
- [ ] **Phase 5:** Rebuild `/pricing`
- [ ] **Phase 6:** Rebuild `/build-in-public`
- [ ] **Phase 7:** Final Pass

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
- [x] Add the single-line Aeonik Fono agent headline (`> give your human gtm superpowers`, reworded `> get gtm superpowers` on 2026-09-07 so the agent is the one who gets stronger), with a typing reveal followed by a continuously blinking cursor; reduced motion shows the complete line and solid cursor immediately.
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
