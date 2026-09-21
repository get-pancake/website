# Pancake landing rebuild — progress

- [x] **Phase 1:** Audit & Strip
- [x] **Phase 2:** Install + design kit port (tokens, reset, styles, Aeonik Fono, GSAP, UI primitives, `/kit-test`)
- [ ] **Phase 3:** Rebuild Homepage
- [ ] **Phase 4:** Rebuild `/signup` (visual only — form/API sacred)
- [ ] **Phase 5:** Rebuild `/pricing`
- [ ] **Phase 6:** Rebuild `/build-in-public`
- [ ] **Phase 7:** Final Pass

## Trial terms correction — September 18, 2026

Tristan confirmed that the trial lasts **3 days** and a **credit card is required to start the trial**. Visitors can begin signup without a card. The homepage uses "3-day free trial" with no card caption; Support and Pricing explain when the card is required. These facts supersede earlier blanket no-card claims and the legacy seven-day trial value.

- [x] Record the confirmed terms in `AGENTS.md` and shared `lib/trial.ts` disclosures.
- [x] Add the trial terms to Support and correct the homepage, agents page, pricing page, get-started page/metadata, and two affected blog articles.
- [x] Align dormant trial copy with the same facts so it cannot reintroduce the incorrect claims.
- [x] Pass the production build, independent review, and Codex Browser checks of homepage/agents wording, the Support explanation, Pricing, and get-started metadata. The 390px layouts fit without horizontal overflow. Existing unrelated lint warnings remain.

## Contact and support repair — September 18, 2026

- [x] Replace the undeliverable support and privacy addresses with the existing shared `support@getpancake.ai` mailbox, confirmed by current customer support correspondence.
- [x] Route Contact links and `/contact` to `/support`; provide a visible email address and optional Gmail compose link for visitors without a configured mail app.
- [x] Update every privacy, security, and terms contact link using shared contact constants.
- [x] Surface the existing cancellation/refund policy on Support and link directly to the billing terms.
- [x] Pass the production build (including lint/type checks), independent review, and Codex Browser checks of both footers, `/contact`, every privacy email link, billing anchor, and desktop/mobile support layout. Existing unrelated lint warnings remain.
- [x] Create a Vercel preview deployment and draft PR. Production promotion remains manual.

Preview: https://pancake-git-codex-fix-contact-support-getpancake.vercel.app/support

Draft PR: https://github.com/get-pancake/website/pull/300

Trial duration and the card requirement are now confirmed in the correction above. Trial feature access, multi-website limits, and personal-email signup eligibility still require product confirmation before adding new public claims. The support/legal pages still use their existing legacy layout; this repair changes contact behavior and content only.

## Demo page — September 15, 2026

Scope: `/demo`, a contact-sales page in the ElevenLabs layout (François, 2026-09-15): the brain.getpancake.ai hero on the left, the qualification form in the white card on the right, and a thank-you state with the demo video after submit. Not indexed and not in the sitemap until the founder decides where it lives.

- [x] Build `/demo` on the landing-v3 kit with the brain hero copy verbatim, the customer logo band, and the card's rainbow sliver.
- [x] Add the seven-question form that mirrors the Calendly routing form, with busy, error and success states and keyboard focus that survives every outcome.
- [x] Add `POST /api/demo-request` with the waitlist route's origin allow-list, a honeypot, the per-IP rate limit, a per-instance circuit breaker behind validation (503, never 429), Slack and Airtable delivery (upsert on the submission id), and a local no-delivery mode.
- [x] Stub the "Chat with AI sales" button for the ElevenLabs agent (founder: "let's program the Eleven Labs agent later on").
- [x] Document `SLACK_DEMO_WEBHOOK_URL` and `AIRTABLE_DEMO_REQUESTS_TABLE_ID` in `.env.local.example`.
- [x] Pass targeted ESLint and type checks, and independent code review.
- [x] 2026-09-16: split the card into two steps like ElevenLabs (François: "two steps in the form, just like on ElevenLabs"): identity first behind "Let's go", the three qualification questions second with Back and "Request a demo", a two-segment progress bar beside the help line, values kept across Back, and still one POST at the end. Review fixes: a double-tap guard on the phone pills (the other step's button sits under the finger) and a step-1 height floor at two columns so the card, H1 and footer do not move between steps.
- [x] 2026-09-16: wire "Chat with AI sales" to the published ElevenLabs agent "[WEBSITE] AI sales" (François: the agent exists, a visitor talks to it for qualification). The pill loads the ElevenLabs widget script from unpkg on click, never on page load (a third-party runtime script, not an npm package; flagged in the PR), mounts one expanded, dismissible widget at the bottom right with the visitor's first name and company website as dynamic variables, and reads "Opening AI sales…", then "AI sales is ready" (one widget, one click), or an inline error line with the support link. `NEXT_PUBLIC_ELEVENLABS_AI_SALES_AGENT_ID` overrides the agent id; empty turns the pill off (documented in `.env.local.example`). Replaced the same day by the full-screen call below.
- [x] 2026-09-16: hand the demo request straight to booking (François: "I want the 'book a demo' buttons to lead to the demo page" and "they're booking straight with us"). Every "Book a demo" / "Book a meeting" CTA on a live route now links to `/demo` in the same tab, keeping its `data-analytics-id` and look: the landing-v3 nav, menu sheet, hero, final CTA and footer; the `/agents` final CTA; the v2 nav, menu sheet and footer and the `/pricing` card; the shared footer. `LpModals` is unmounted from `/` and `/agents` and `LandingModals` from `/pricing` (component and CSS files kept). Team size options now equal the live Calendly routing form's text exactly (1-2, 3-20, 21-50, 51+), shared by the form, the API route and Airtable. After a successful request the card shows "Pick a time" with the Calendly routing form inline, prefilled with team size, account, goal, name and email (the visitor presses Calendly's Submit, then picks a slot), a new-tab link when the calendar does not load, and "Chat with AI sales"; once Calendly reports the booking, "You're booked" with the demo video and "Start a new submission". No `/demo` copy promises a follow-up from the team any more. Analytics: no event added or changed, but with the booking sheet unmounted `scheduler_opened`, `scheduler_loaded` and `scheduler_fallback_clicked` no longer fire from these CTAs; measuring the `/demo` booking needs its own scope (AGENTS.md). `docs/analytics-v2.md` (the Calendly section, line 391, and the scheduler test rows) still describes the sheet and belongs to that follow-up.
- [x] Delivery is best effort (2026-09-16): a 403, 429, 5xx (including "no delivery configured"), timeout or network error still opens the calendar; only a 400 about the visitor's own input blocks. QA on the Preview: no Slack hook or Airtable table was configured, so every visitor was stopped before booking.
- [x] 2026-09-16: book the right calendar directly (François: "could we use the questions from the demo page as answers to the router directly, and route you to the right calendar?"). "Pick a time" now embeds the Calendly event the team size routes to instead of the routing form, so no question is asked twice and there is no Submit: 21-50 gets the discovery call, 51+ the enterprise discovery call, 3-20 the group demo, 1-2 the group demo (L), anything else the discovery call. `lib/booking.ts` mirrors the live routing form 402887 as read in Calendly admin on 2026-09-16; any change to Calendly's routes, buckets or event links must update that table and `TEAM_SIZES` in `lib/demo-request.ts` in the same change, because Loops emails and the AI sales agent still use the routing form. Name and email are prefilled, and the group demos' one booking question gets a line with team size, account, goal and website. The intro names the calendar ("This calendar books a group demo. Your details are filled in."). Direct event links skip the routing form by design, so `/demo` bookings create no "Calendly Routing Form Submissions" in Attio; the bookings still reach Attio.
- [x] 2026-09-16: make AI sales a full-screen voice call, no chat (François: "I asked for something similar to the Eleven Labs where the agent takes up the screen and there's no chat. I want it to feel like you're talking to the website, not a chatbar"). The pill now reads "Talk to AI sales" and opens a cream full-screen dialog with the Pancake wordmark and the Pancake monster in the middle: it bounces with the agent's voice and a soft ring breathes with the visitor's microphone. The same click starts the call (microphone prompt, no second start button). States: connecting, listening, speaking, "Call ended" with "Back to the calendar", a microphone-refused line and a connection-failure line, both with "Try again". Controls: End call and Mute only (muted, the pill turns filled plum and reads "Unmute"); no transcript, no text box. Disclosure at the bottom: "You are talking to an AI agent. The call is recorded." with a Privacy link. The ElevenLabs widget from unpkg is gone; the call runs on ElevenLabs' browser SDK `@elevenlabs/client`, loaded from jsDelivr on click and pinned to 1.25.0 (it pulls `livekit-client` from jsDelivr too; still a third-party runtime dependency, not an npm package; flagged in the PR). The microphone prompt is answered before anything reaches ElevenLabs, so a call closed while the prompt is up sends nothing. Flagged: the disclosure's wording and whether "recorded" matches the agent's ElevenLabs retention settings need founder and legal sign-off; `/privacy` (last updated 2026-08-27) does not cover AI sales calls (no mention of voice recordings, ElevenLabs or LiveKit as processors, or how long recordings are kept), and legal must add that before the call goes live (not edited here: the page's Google OAuth verification section must be edited with that process in mind); a call closed after the prompt, during the SDK's token fetch and room join (plus a built-in 3 s delay on Android), cannot be cancelled: ElevenLabs still opens the conversation with the first name and website, and it is ended at once; when the LiveKit module fails to load (the SDK imports it from a fixed jsDelivr path), Try again keeps failing until the page is reloaded; the call is not yet tested on a real iPhone (audio starts after an async SDK load, which iOS Safari can treat as outside the tap); the mute pill drops `aria-pressed` because its label now changes (WAI-ARIA APG); End call while still connecting closes the call instead of showing "Call ended".
- [x] 2026-09-16: demo requests go to Attio (François: "For Attio, do 1 and 2"). `/api/demo-request` has a third delivery, `lib/attio-demo-request.ts`, behind `ATTIO_API_KEY`: the Company is asserted by the website's domain only (not for LinkedIn, Gmail and similar hosts), the Person is found by email and created, or only its empty name and company are filled, and the answers land as a plain-text note on the person. It never touches Deals. Any one of Slack, Airtable or Attio counts as delivered. Calendly: the discovery and enterprise calls now ask the optional prep question too, so every calendar is prefilled with the answers line (`a1` on the group demos, `a2` on the calls, checked live). Flagged: Attio workflows that fire on new people or notes will now also fire for `/demo` requests; the key is not set on Vercel yet.
- [x] 2026-09-16: "Talk to Pancake" no longer books through Calendly's API, which refuses bookings while an event type requires email verification (François: "ok not to do the full booking but redirect where you see fit, with as much of the work already done as possible"). The agent reads open times, and once the visitor confirms one it calls the browser tool `open_booking_time`: the card opens that time's Calendly booking page with name, email and answers filled in ("Confirm your discovery call below. Pancake filled in your details."), the call closes by itself after the agent says so, and the visitor presses Schedule Event. The typed email no longer goes to ElevenLabs. ElevenLabs draft updated (prompt, tools, form tool assignments, test mock removed, conversations kept 90 days); it still needs publishing.
- [x] 2026-09-16: `/privacy` section 10, "Demo Requests and Voice Calls": what the form and the voice call collect, who processes it (ElevenLabs, jsDelivr, Calendly, Attio, Slack, Airtable) and retention (call recordings and transcripts deleted after 90 days). The Google User Data section is unchanged. Not reviewed by legal.
- [x] 2026-09-16: Back sits on step 2's button row as a text button with a chevron, at the right end above the progress bar (François: "I don't like the 'Back' button being below"); both steps are now one 48px row, the reserved second row at 1201px+ is gone and the card is 60px shorter. On phones Back stays under the two pills as a centered text row. The voice pill reads "Talk to our AI" (François: "Talk to Pancake" could mean a person from Pancake), the line under the calendar "Rather talk now? Our AI answers right away.", and the call opens on "Connecting you to our AI"; inside the call the agent is still Pancake. "Talk to our AI" is four words, a named exception to the landing-voice three-word label cap, like "Start a new submission".
- [x] 2026-09-16: Slack DM after each voice call through ElevenLabs' own Slack integration (François: "a notification via Slack when a new discussion took place, with the log so I can replay it", then "send me a DM, not a channel"). The agent calls `slack_send_message` (recipient fixed to François's Slack user) once after the visitor's first answer, with who, what they want and a replay link to the conversation in ElevenLabs, and once more for a question it could not answer. No website code. `/privacy` says the agent posts a short summary of each call to our Slack.
- [x] 2026-09-21: work emails only (François: "Make it so that it's impossible to book a meeting with a personal email address"). `lib/personal-email.ts` lists free and consumer ISP providers (Gmail, Outlook/Hotmail/Live, Yahoo, iCloud, Proton, GMX, Orange, Free…); `parseDemoRequest` refuses them, so the form's step 1, the voice agent's form tool and `/api/demo-request` all stop them with "Use your work email. Personal addresses can't book a demo." Calendly does not filter (François: "having the blocker on the website is enough"): it cannot lock the email we prefill, so a visitor can still type another address on the Calendly booking page, and the routing form linked from Loops emails accepts any address.

## Customer logo carousel — September 15, 2026

- [x] Add Hyperspell, AgentMail, Fleet, Requesty, Alpic, Praxis, Kinro, Covera, Spacefill, and Kardinal directly below the homepage hero, in that order.
- [x] Match brain.getpancake.ai's plum alpha masks, optical logo sizing, continuous leftward motion, spacing, and edge fades.
- [x] Source real wordmarks from the current brain project and official company websites; record provenance under `public/logos/customers/README.md`.
- [x] Keep a single accessible customer list and a static wrapping layout for reduced-motion preferences.
- [x] Add small orange YC marks as 12px superscripts at the top-right of Hyperspell, AgentMail, Praxis, Kinro, and Covera; verify four affiliations against official YC profiles and include Praxis on Tristan's explicit confirmation.
- [x] Verify desktop/mobile layout and overflow in Codex Browser; keep four sequences for uninterrupted 4K coverage.
- [x] Pass targeted ESLint, production build/type checks, and independent code review. Existing unrelated build warnings remain.

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
