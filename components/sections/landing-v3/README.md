# Landing v3 — Figma replication notes

Sources of truth:
- V1 artboard: Figma `Pancake-Design`, page `└-> Desktop` (node `4197-9774`), frame `hero` (`4257:4893`, 1654×9632). Extracted 2026-08-28.
- **V2 (2026-10-09, updated by the designer 2026-10-11):** Figma `fr8NgOCTUxsEbrMEJA3YKu`, desktop frame `4911:346` (1654 wide), mobile frame `5024:8631` (402 wide), the red notes ("Deltas"), the hero-scroll, "How it works" and deep-dive storyboards, the agents view `4911:1461`. Only the red-noted deltas, the storyboards and the mobile pieces come from V2: production copy and founder decisions win everywhere else. Specs, decisions and the per-package reports live in `artifacts/landing-v2-figma/` (`specs/_decisions.md` is binding, §9 = the 2026-10-11 amendments).

## Structure

| Piece | Where |
|---|---|
| Token layer (Figma variables 1:1) | `app/_styles/landing-v3/foundation.css` — `--lp-*` vars scoped to `.lp` |
| Shared recipes | `.lp-btn` (3 exact sizes), `.lp-title-section`, `.lp-title-card`, `.lp-chip`, `.lp-mockcard`, `.lp-content` |
| Sections | `Lp*.tsx` here + one CSS file each in `app/_styles/landing-v3/` (manifest: `app/_styles/landing-v3.css`) |
| Art assets | `public/lp/` — grouped SVG exports from Figma (backdrop/page rects stripped) + icons/photos. `public/lp/manifest.json` maps Figma asset ids → files |
| Placeholder gate | `lib/placeholders.ts` (`SHOW_PLACEHOLDERS`, `ContentStatus`, `visibleEntries`) |
| Stage harness (dev / preview only) | `app/lp-dev/stages/` → `/lp-dev/stages` |

## The homepage since V2 (2026-10-09; second and final passes 2026-10-12)

Page order (`app/page.tsx`): `LpNav` · `LpHero` · `LpDemo` · `LpMarquee labelled` · `LpAgentLab` (agents view only) · `LpSteps` · `LpBanner` (sky) · `LpDive` · `LpCta sky` · `LpBento` · `LpPricing` · `LpFooter`. At 1654 with motion the page is 8586 tall on a preview (nav 120, hero 657, demo 793, logos 130, steps 1773, banner 753, dive 894, CTA 624, bento 1448, pricing 890, footer 504: every section starts on V2's y) and 7138 in production, where the bento is held back by `BENTO_LIVE` (8195 once its five final cards are live, 1057 tall). At 402 a preview is 11148 tall.

Every section is a **direct `<section>` child of `main.lp`**: the agents view (`?audience=agents`) hides all of them except `.lp-hero` and `.lp-agent-lab` (one rule in `audience.css`, integrator-owned). A new section that is not a direct child stays visible there.

Two CSS block names are taken: `lp-demo` is `/demo`'s main (the homepage demo is `lp-demowin`), `lp-agents` is `/agents`' main.

### Placeholder gating: one mechanism

`lib/placeholders.ts`: `SHOW_PLACEHOLDERS` is true in dev and on Vercel previews, false in production. Data entries carry `status: "final" | "placeholder"`.
- Read it in **server components only** (`VERCEL_ENV` is not in client bundles); pass a boolean or filtered data down. Readers today: `app/page.tsx` (agents card body), `LpSteps` (it passes `showPlaceholders` to `LpStepAnim`), `LpDive` (it passes `placeholders` to every story Stage), `LpBento`, the harness page.
- Production renders no placeholder and no empty shell: a slot with no final entry is left out, a section with no final entry returns null, and a step row with no final art throws at build (`LpSteps`). **The bento is off in production today**: `BENTO_LIVE = false` in `lp-bento-data.ts` (the founder's go on the date and the customers' OK are pending). Once on, production renders a partial set (its final cards, laid out again).
- What is placeholder today: two bento cards (Kinro's video tile and Pierre's quote card, waiting for his individual cut), the data-source hub of the sources story (so production ends that story one frame earlier), the "reply rate" figure on step 02's Play cards, one line each in the learns and claude stories. Everything a placeholder renders is marked `data-placeholder`.
- Guard: `node --test scripts/placeholder-gate.test.mjs` server-renders the gated sections as a production build and as a preview build and checks both (production's bento follows `BENTO_LIVE`; the set that goes live is rendered and checked either way: its final slots, no stand-in image or stand-in customer; no `<video>` in server markup; every subset of the seven slots lays out; every film has a preview clip under 600 kB and a captions track, and every bento file named exists under `public/`; the sources story's two endings). Not in `prebuild`.

### Nav and hero (V2 `4911:347`, `4911:355`)

- The bar ends in [Sign in, tinted 73×38] [Start free, 110×38], gap 8 (red note "Sign in instead of Book a demo"). Sign in is an `LpFxLink` (`lp-btn--tinted lp-nav-signin`, `signin_nav`, never an acquisition id). Book a demo left the bar: it stays in the hero, the final CTA and the phone sheet. Phones keep logo + Start free + burger. This nav is site-wide.
- Every `.lp-btn--tinted` is `--lp-tinted-surface` `#f8e5d4` with a 500 label, site-wide (was `#f5e5d6` / 600).
- Homepage hero rules are scoped to `.lp-hero--home` (`/agents`' AgHero reuses the unscoped classes and their short-window tiers). On desktop (≥1025) the hero's height follows the window's so the demo window's top bar peeks at the bottom of the first screen (founder 2026-10-12, `_decisions.md` §10): `--lp-hero-h = clamp(380, max(svh − 216, min(544, svh − 120)), 657)`: 657 from 873 tall up, a 96 px peek (26 inset + 70 of window) from 760 to 873, tapering to 0 at 664. The art lifts `--lp-hero-lift = clamp(0, (873 − svh) × 0.3, 34)` (60 at ≤ 639 tall) and the copy block `.lp-hero-inner` scales about its bottom centre by `--lp-hero-s = clamp(0.66, (H − 358 + LIFT) / 299, 1)` (`tan(atan2())` inside `@supports`, three safe steps without CSS trig). The 299 keeps the rotating rainbow at least 42 px off the headline over the whole loop (the decision's first 286 let it dip to 31.6 around 855 tall). The art is clipped at the hero's bottom, lift included. All of it is CSS on `--lp-svh` with `100svh` before hydration: no jump, CLS 0. The homepage selectors are one class more specific than the tiers: keep it so. H1 box bottom 63 and right column bottom 71: V2's composition with the founder's 2026-09-01 36 px drop kept. **2026-10-13 (founder, several passes the same day):** (1) **the humans H1 is one line on desktop and tablets, two on phones** (the artboard's 35.559 there, break in the markup shown at ≤767 only: "yes two lines on phones", to keep the H1 / lede ratio) ("Deploy GTM ideas in seconds", 11.23 × its font size wide: `--lp-h1-fs`, the designer's 69.014 from 1278 wide up, less as the block narrows); (2) **the copy block is 1214 wide, centred** (`max(32px, 50% − 607px)` on both sides: H1 775 + 71 + the 368 column; V2's 1136 does not hold one line, and the nav's 1296 put the first letter under the rainbow's left arm); (3) **the one line is level with the lede** (centred on it, as V2's first line is: "l'alignement du h1 avec le h2"; `bottom` on `#lp-hero-title`, never on the shared box). The block's height did not change (it was raised 36 px to V2's 99 / 107 for a few hours that day: a misreading of "respecter les proportions du figma", which was about the H1 / H2 sizes; put back), and the rainbow is at the designer's place: at 1214 wide the ring stays 35 px or more off the headline at the worst moment of its loop, from 1100 to 1920 wide (`artifacts/…/impl/first-screen-peek-tools/rings.mjs`). A different H1 needs its width re-measured (`artifacts/…/pw/h1-fit.mjs`).
- The right column `.lp-hero-aside` is the audience toggle row, then `.lp-hero-swap`: one grid cell where the human column and the agent column overlay. The human column sizes the cell (`visibility: hidden` in the agents view), so the toggle sits on the same pixel in both views; the agent column must stay no taller. No JS measuring. ≤1024 the toggle row leads the stacked block, left-aligned.
- `.lp-hs-hero` marks the H1 and the aside for the **agents view's** scroll assembly (drift and fade, `data-as-out`); the humans view no longer moves them. Both are transform-free (left offsets). Keep them free of their own `translate`, `opacity`, `visibility` and transitions at ≥1025. `<LpHeroAgentArt />` is the first child of `.lp-hero-art`.
- Phones: the demo card overlaps the hero's last 17 px (`--lp-demowin-phone-peek` in `demo.css`). Keep that strip free of hero content.
- Phones (≤767): the homepage hero's top padding is `61.44vw − 51px` (the toggle row and its gap come out of the art zone), so the block's minimum height equals production's and the hero ends on the fold from 390×664 up. Do not add in-flow height above the H1 without taking it off this padding. `/agents` keeps the full `61.44vw`.

### Demo window (V2 `4939:2645`; conversation as storyboard frame "4" `5024:8353`; phones `5024:9506`)

- `LpDemo.tsx` (server) renders ONE app window under the hero, 26 px below it (section 793 = 26 + 647 + 24 + 36 + 60). Two pills, Pancake / Claude & Codex, autoplay between two views. **The Pancake view was redrawn on 2026-10-12** (founder brief: suggested Plays instead of the three actions, copy closer to what Pancake does, a few tool calls, a designed Play card, ONE fluid take with no cut, and "not more complex and not more words than the current one", "the first part goes super fast"). The designer's home is kept (his window, bar, centred 487 column, title, chat bar, three cards, chip, at his coordinates); the story is a web design agency going after startups that just raised (invented, founder: "no need that what you write on motion comes from an IRL play"). The take, about 7 s: the request types into the chat bar, lifts into the thread while the SAME bar glides down to the dock, the Play card rises and its three rows work one at a time (spinner + what Pancake is doing, then check + value: Who, Signal, Then), the cursor presses "Deploy Play", the card goes Live, its outline draws, five leads arrive. Its markup is the REST picture (the home) plus every later element hidden; `lp-demo-pancake-timeline.ts` is one seek-safe GSAP timeline over it (lazy chunk: fetched on the visitor's first input or at the first start, never at load; reduced motion never fetches it). Everything is placed against the window through `--pk-*` properties (`demo.css`), which the phone box overrides: the same timeline plays the desktop window and the phone card. Claude & Codex is a Claude-desktop mock on the production request (**no final design yet**, to be redrawn next).
- Copy: `lp-demo-data.ts` (linted): every string of the Pancake view; the Claude view's request and Play card still come from `lib/verticals/home-demo.ts` prompt 0 + `vx-copy.ts` (validated by the build). The one client island is `LpDemoPlayer.tsx`: a rAF clock (ms since the view started) that runs only while started, ≥35 % on screen, the tab visible, not paused and motion allowed, and drives two engines: the Pancake timeline is seeked every frame (its length is the timeline's own, + a 2.2 s hold), the Claude view keeps the class cues of `lp-demo-timeline.ts`. The clock waits for the Pancake timeline to be built; a stage resize rebuilds it (at once if the view is at rest or hidden, else when it next starts). A keyboard-only Pause (WCAG 2.2.2); QA hook `window.__lpDemo` (non-production builds or `?lpqa`): `seek(view, ms)`, `state()` (`pk` = timeline built, `end` = the run's length).
- The window is assembled and opaque from the first frame (founder 2026-10-12: "qqch de très simple avec un léger agrandissement de la fenêtre"). Its one scroll effect (`GROW_QUERY` in `lp-demo-timeline.ts`: ≥1025 wide, ≤ 1449 tall, motion allowed): the card (window + pills) grows from 0.94 to 1 about its top centre, so the top edge never moves, and goes back to 0.94 when the visitor scrolls back up (founder, same day: "when I scroll back up it should go back to initial size"). `lp-demo-scroll.ts` (`mountWindowGrow`, passive scroll + one rAF, no GSAP) writes `--lp-demowin-grow` (0 → 1) on the card while the window's top travels from where it sits at scroll 0 (the fold at most) to 35 % of the viewport height; `demo.css` turns it into `scale: 0.94 + 0.06 × g`. The property is registered non-inheriting: a write restyles the card alone. It follows the scroll both ways for the whole visit; the listener runs only while the card is on screen. Leaving the query clears the property (the card is drawn at 1) and entering it again brings the effect back. `data-grow-done` on the section is for captures only (`?still`, the QA seek). No `will-change`. Unset = 0 = the server's first paint; a page that opens already scrolled eases to its value in 300 ms (`data-grow-settle`). Scale 1 on phones, tablets, reduced motion, windows from 1450 px tall and without JS (`<noscript>`). The 0.94, the query and the 300 ms are repeated in `demo.css`: change them together.
- First start of the demo, one rule at every width: the window's top crosses 60 % of the viewport, or 1 s with half of the window on screen; a pill click starts it at once. Firefox gets its own hairline rules (Gecko paints no inset ring under 1 CSS px, at any pixel ratio).
- Phones (≤767): the same markup is recomposed as a portrait, phone-shaped card. It is a fixed design box of 546.33 × 1072.61 du (du = desktop px = Figma px ÷ 0.399025) scaled as pixels: `transform: scale(var(--lp-demowin-fit, tan(atan2(var(--lp-demowin-phone-w), 546.33px))))`, never `zoom`, no `will-change`. Every px inside the phone block of `demo.css` is a du. Two switches: `--lp-demowin-phone-w` is the card's width on screen (`calc(218 / 402 * 100vw)`; the legible alternative is `calc(100vw - 32px)`), and `PHONE_SOLO` (`lp-demo-timeline.ts`) hides the pills and the Claude & Codex view, so the Pancake view plays once and holds its end picture. The card is a picture there: `pointer-events: none`, the chip link out of the tab order. Firefox gets its own hairline rule (Gecko drops rings under a device pixel).
- `.lp-demowin` must stay out of the `content-visibility` list: its observers have to fire before it is on screen. The card's bottom padding on phones (74.885) depends on the labelled marquee's 3.811 top padding.
- The Claude serif is Literata, `lp-claude-font.ts` (next/font/google, one variable woff2, `preload: false`, homepage only), shared with the claude story; one palette `--lp-claude-*`.

### Customers band and steps (V2 `4911:371`, `4911:373`; storyboards `5016:4214 → 5022:6230`, `5022:6116 → 5022:6080`)

- `<LpMarquee labelled />` puts "Trusted by many" above the real logo strip, 130 px tall, right under the demo. `labelled` is opt-in: `/demo`, `/pricing` and `/for` keep the bare strip, pixel-identical. V2's grey tech-logo strip is the V1 placeholder and is never built. A pointer on the band slows the loop to 30 % of its speed and eases it back (`LpMarqueePause`, playbackRate, 2026-10-12: "a slowdown and not a complete stop"); the pause button is the one way to stop it.
- Step 01's graph names its five hubs (`S1_HUBS[].label` in `lp-step-data.ts`, `.lp-s1-hlabel`); the centre label stays "Studio Pelican".
- Step 02 and step 03's intro are the designer's "How it works" storyboards (2026-10-11). Step 02: chat request → one question → the Play takes shape → Leads table → select all → the Play card (8.95 s, `S2_T`). Step 03: selected leads → a message typed and sent → her reply → the meeting, then the calendar as before, nested at `S3_CAL_RATE` 1.25 (10.7 s, `S3_T`). QA labels: `window.__lpStep.s2.seek("f1" … "f8")`, `.s3.seek("f1" … "f5" | "cal")`.
- The mocks' strings are the Studio Pelican story, all in `lp-step-data.ts` (linted, with `LpStepMocks.tsx`); the storyboard's sample names and its platform icon are not used. `S2_PLAYS[].figures[].status` gates the "reply rate" figure (preview only until the founder's yes).
- Text `top` values in the storyboard block of `steps.css` come from a three-engine sweep (`artifacts/…/pw/ls2-sweep.sh`): re-run it, do not nudge by eye. The Leads view's x and the selection bar's y carry their half pixel as a transform.
- Copy and art of the three rows live in `lp-steps-content.ts`. Each row's `art` is a priority list of candidates (`anim` | `image` 464×426 | `empty`), each with a `status`; `LpSteps` shows the first one the gate allows. To preview new art without shipping it, add it first with `status: "placeholder"` and keep the final entry after it.
- Strings a step timeline sets go through `px()` (`lp-step-timelines.ts`): one unit, no trailing zeros. GSAP reads `"21.000px"` as a number with the unit `".000px"` and probes the DOM for every such value; the typing staircase paid 412 forced layouts in one tick (verify M-03). `artifacts/…/pw/lsf-clipcost.mjs` counts the probes.
- On 1x screens the chat boxes of step 02 (two cards, question card, option discs) draw their hairline as one pixel at half strength (`steps.css`, the `@media (max-resolution: 1.5dppx)` block). It must stay after the rules it overrides. Boxes that carry a half pixel in their position keep the 0.5px ring.
- Phones (≤767): the labelled logos band is 82 px (pad 3.811, gap 16, slot 42.67) and the steps start 96 px under it (mobile artboard `5024:8948`, `5024:8706`). On phones `lp-play-once.ts` fetches nothing "a viewport ahead" while the page rests untouched at its top (`whenTouched`): V2's shorter demo card put step 01 inside the prepare margin of tall phones, and GSAP was fetched at load under the Lighthouse / PSI mobile viewport (verify M3). Tablets and desktop prepare at load where step 01 is within a viewport, as production does.

### Blue band and the deep dive (V2 `4911:534 → 4939:3388 → 4911:739`; phones `5024:8914`, `5024:10542`)

- The sky (`--lp-sky`) starts under a cream blob in the banner's gutters (`LpBanner`, `sky` default), carries "How Pancake finds customers" (`LpDive`) and ends on the CTA's cream hill (`<LpCta sky />`, homepage only: every other CTA surface is unchanged, r48 on cream). Sky rules: `sky.css`.
- Clouds (`.lp-sky-cloud`) drift on scroll at their own depth: `lp-sky-parallax.ts` via `LpSkyParallax`, one passive rAF listener gated by an IntersectionObserver, one variable per cloud, depths and bounds in `sky.css`. Reduced motion = the artboard pose. `.lp-dive` is `content-visibility: auto`, so the heading clouds' travel is clamped inside the section box. Clouds pick their parallax anchor in `sky.css` (`--lp-sky-anchor`: `section` or `own`): the heading pair drifts around its own place on tablets and every cloud does on phones.
- `LpDive` server-renders every tab, body and stage (each story's END picture). Desktop and tablets: `lp-dive-carousel.ts` (via `LpDiveCarousel`, entry `mountDive`) plays one turn per item on a master GSAP timeline: story cue → end, then a 2.0 s hold, the bar linear over both. First start follows `lp-play-once.ts`'s contract (prepared a viewport ahead, cued unseen, played at the 60 % focus line or after a 1 s dwell). It runs only while ≥50 % of the stage is on screen, never rewinds on screen, holds the advance under keyboard focus, has a Pause control under the card's bottom-right corner (shown on keyboard focus, while pressed, while a pointer is over the stage, always on touch screens: WCAG 2.2.2), and in reduced motion fetches nothing and swaps end pictures. A mouse at rest on the stage still holds nothing (founder precedent 2026-09-22 on the demo). Item 4's "See how →" is drawn inside its item (body, 8, link, 24, hairline): the tab's hairline and bar ride down by `--lp-dive-more` while it is selected. The tabs are `<div role="tab">` (so they can become plain text on phones); Enter and Space are handled by the driver.
- **Phones (≤767, decisions §9 F3).** `DIVE_PHONE_LAYOUT` (`lp-dive-data.ts`, written on the section as `data-lp-phone`) is `"stack"`: `dive.css` re-lays the SAME markup out as four stacked items, all open (wrappers `display: contents`, order from `--lp-dive-i`: tab 3i, link 3i+1, panel 3i+2), each panel becoming its own stage card with the desktop scene at (W − 48) / 752. `mountDive` then runs `mountDiveStack` instead of the carousel: every stage is an `lp-play-once` card (`restIsEnd`, registry `__lpStory`), the tab semantics are dropped (four `role="heading"` titles, `aria-owns` for the reading order) and restored when the width crosses 767. `"carousel"` restores the 2026-10-09 phone build.
- Scene boxes: 752 × 489 everywhere, scaled as pixels by `--lp-fit` (never `zoom`). The 400 × 520 phone recompositions (stories' `@container lp-dive-scene (max-width: 599px)` rules, builders' `data-lp-layout="phone"` branches) are only reached with `DIVE_PHONE_LAYOUT = "carousel"` and in `/lp-dev/stages?layout=phone`. Do not delete them until the founder confirms F3.
- Phone sky: `lp-sky-banner-top-phone.svg` and `lp-sky-cta-hill-phone.svg` are the artboard's curves, anchored to the cards (banner card top + 524, CTA card top + 270 / 288); CTA card r32 (24 on desktop and tablets). Phone clouds = the three the designer added to the mobile artboard on 2026-10-12 (`5061:696`, `5061:699`, `5061:702` = dive A, dive B, CTA A; dive C and CTA B hidden), at the artboard's px sizes, each anchored to the corner it touches (banner card bottom-right, left edge beside the title, CTA card top-right), behind ONE switch (`sky.css`, ≤767: `.lp-sky-cloud { display: block }` ↔ `none`). Cloud A rests above the dive section's top edge, so at ≤767 the section's box starts `--lp-sky-room` (72 px) higher, with a transparent band: `sky.css` sets the margin and the background, `dive.css` adds the same amount to the top padding. The parallax driver measures each phone cloud against its own resting place and attaches no listener when no cloud has a box.
- Registry: `lp-dive-stages.ts` (Stage + alt, imported by the server `LpDive`) and `lp-dive-loaders.ts` (the lazy loaders, **client only**). A story is `LpStory<Name>.tsx` (server-safe, one root `[data-lp-story]`, rest markup = end picture), `lp-story-<name>-timeline.ts` (`buildStory<Name>(root) → { tl, cleanup, cue }`), `lp-story-<name>-data.ts` (linted copy, `STORY_<NAME>_ALT`), optional `-art.ts`, `story-<name>.css`.
- Bundle rule: a timeline module carries **no `"use client"`** and imports no `"use client"` module other than `@/lib/gsap`, and the registry holds no loader. Next turns every `"use client"` module a server graph reaches, even through `import()`, into an eager entry of the page: GSAP and the builders shipped in the homepage's first bundle until the loaders moved out (2026-10-11).
- Builder rules (GSAP 3.15): sets and tweens only, no callbacks, no randomness; `tl.progress(1)` pixel-matches the server markup; `cue` is never an empty frame. `gsap.context().revert()` replays zero-duration tweens last, in an engine-dependent order (Firefox differs): use 1 ms tweens for instant changes, or restore the rest markup in `cleanup()`. Dispose order is `ctx.revert()` then `cleanup()`. Typing reveals the real text with a clip-path staircase, never per-character spans. The `txt` plugin is `lp-gsap-txt.ts`.
- QA: `window.__lpDive` (`mode` = `"carousel"` | `"stack"`, `timelines`, `select`, `pause`, `play`, `state()`, `pose(i, p, at)`: item i frozen with its bar at p and its story at `at`, seconds, a label or `"end"`; `pose(0)` is the V2 artboard, bar .509596 and Sources on frame 3), `window.__lpStory.<id>`, and `/lp-dev/stages` (dev and previews only, `notFound()` in production, noindex, not in the sitemap): every stage in both boxes with play / seek / end / rest controls; `?story=`, `&t=<s>|end`, `&layout=desktop|phone`, `&placeholders=0`, `&fit=`.

The four stories:

| Item | What plays | Notes |
|---|---|---|
| sources, "Sources you can trust" (`4964:1287 / 5024:7457 / 5024:7601 / 5024:8172`, storyboard of 2026-10-11) | A Leads table, the hand clicks Elena Marchetti's row, her details panel opens over the dimmed table, the camera zooms ×3.89 into "Why they fit" and six data-source discs wire into it | **Two endings.** Every hub node is `status: "placeholder"`, so production ends on the open panel (`data-end="details"`, 2.59 s) and previews on the zoom (`data-end="sources"`, 4.85 s); a node set to `"final"` lights the zoom up in production. No platform name or mark, no third-party logo (generic glyphs), no counted source claim. Rows mirror `home-demo.ts`: keep in sync. Labels `f1` to `f4`. Each element clears its inline transform when it lands (Firefox text snapping); the camera is never cleared (`--src-cam-s` 3.8908 is the scale GSAP leaves inline). Strokes under 1 px are scaled `::after` rings |
| message, "A personal message for every lead" (`4964:1469 / 1471 / 1729`, `5061:1002 / 1091 / 1209`, final since 2026-10-12) | A lead's post wired to her lead card; the message Pancake drafts for her, sent; three more conversations at other depths; the sending account's name; its three leads with their status; six more accounts out of focus (the rest picture). 11.6 s | `lp-story-message-timeline.ts` (frames 1–2) + `lp-story-message-tail.ts` (frames 3–6); neither takes `"use client"`. One conversation component at four depths and one account component at seven scales, each placed from Figma's own origin and scale; the per-depth corrections and `--z` exist because Figma lays every instance out again. Text tops come from a three-engine sweep (`artifacts/…/pw/smsg2-sweep.mjs`): change one by re-running it. No Send button, no hand correction |
| learns, "Pancake learns from what wins" (`5061:1443 / 5335 / 5399 / 5459 / 5509`, storyboard of 2026-10-12) | A chart grows week by week while its figure ticks to 56% ("vs last period", as drawn); the view moves down to a "What worked" list whose three lines check off; the camera closes in while Pancake updates the Brain, then "Brain updated!". 6.15 s, cue 0, labels `f1…f5` | Two layers under one camera: `.lp-sl-chart` (stage scale, hidden at rest) and `.lp-sl-notes` (the end picture's scale, ×1.68919, so the rest picture has no transform); the timeline moves both with the same x / y / scale. The bars are an SVG plot (attributes tweened). Every string is the designer's: "56%", "vs last period", "What worked" and its three lines (founder 2026-10-12; a first build had relabelled them "leads approved" and "Brain learned"). `cleanup()` restores the rest markup itself (`gsap.context().revert()` orders zero-duration tweens differently per engine) and kills its clearing `gsap.set` at once, or GSAP leaves `style=""` behind. The trial Aeonik has no "%": that glyph comes from a fallback face |
| claude, "Run it from Claude or Codex" (`4964:2575…`) | Claude's home, the prompt typed, the send with a ×1.35 dolly, the reply, "Connecting...", "11 leads found". 5.05 s | Codex + Claude marks, never Cursor (it can't connect yet). The prompt targets the US. The follow-up line is preview-only. Icons sit in boxes on whole stage pixels with the sub-pixel remainder on the drawing (every engine snaps an `<svg>` box). The composer's and the Cowork pill's hairlines are scaled `::after` rings, not spread shadows (Gecko draws no shadow spread under a pixel, WebKit a full one). The tops marked "all engines" put each baseline on Figma's row in Blink, WebKit and Gecko. `cleanup()` strips the empty `style=""` GSAP's revert leaves |

### Bento, "Take it from them" (V2 `4911:762`, mobile `5024:10543`)

`LpBento.tsx` (server), between the CTA and pricing. Content: the Kinro and Praxis testimonials (founder 2026-10-11), the two individual cuts, never the merged compilation. Seven slots in `lp-bento-data.ts` (videoLg, quoteA, kpiA, kpiB, kpiC, quoteB, videoSm), each card `status: "final" | "placeholder"`.

- **Gating.** `resolveBento(SHOW_PLACEHOLDERS)`: a final card wins its slot, a placeholder fills it in dev and previews only, an empty slot is left out. `BENTO_LIVE` is the founder's switch and it is **off** (final pass, verifier TA-03): production renders no bento until the date and the customers' OK are confirmed. Once on, **production renders a partial set** (today five cards: the Praxis film, Diana's quote, three KPI cards) and nothing only when no final card exists.
- **Placeholders today:** Kinro's video tile and Pierre's quote card, which wait for his individual cut. Their stills are interim crops of the compilation; they sit outside `public/` (`bento-placeholder/`) and are inlined as data URIs by `lp-bento-placeholder.ts` (server-only), so they never get a pancake.ai URL.
- **Layout.** Every card metric is `calc(N * var(--u))`. Seven cards (`data-layout="full"`) = the artboard: 4 × 3 on the 1136 column (`--u` 1 px at ≥1200, frame / 1136 at 1025–1199), two columns on tablets, the mobile artboard's two-column stack on phones (`--u` = frame / 560). A partial set (`data-layout="rows"`): rows on 12 columns picked by the server from `ROW_SHAPES`, and the same stack below 1025 with a lone narrow card widened (`data-solo`). All spans, orders and heights are written inline by the server; CSS guesses nothing.
- **Logos** are the marquee's artwork as alpha masks, sized by letter body (`BENTO_LOGO_BODY`), with the marquee's YC badge, its top on the wordmark's top so nothing passes the card's 48 padding line.
- **Video tiles (`LpBentoVideo`).** Two separate things and two separate files. The muted preview: `film.preview`, a video-only cut of about 10 s (480 wide for phones and small tiles, 720 for large ones, under 600 kB each) that loops; poster at rest, a `<video preload="none" loop>` created a viewport ahead, playing only while ≥60 % in view, with a pause / play disc; reduced motion fetches nothing until Play. The tile never plays the film. The film with sound: `film.mp4`, fetched only when the tile's button ("Watch with sound") opens a native modal `<dialog>` with the full frame, the browser's controls and the captions on. Nothing ever plays with sound without a click. The tiles gate themselves (not freeze members).
- **Crop.** The films are 4:3, the tiles mostly portrait. Each film carries `focus` (`keepLeft`, `centre`, `wideLeft`, in poster px); `bento.css` turns it into `object-position` with container units, the same for the poster and the preview, so nothing shifts when the preview fades in.
- **Captions.** `film.captions` is required: a film cannot be listed without a WebVTT track (WCAG 1.2.2). The Praxis track was checked against the audio by machine (three recognisers, forced alignment), not by a human listen: `artifacts/landing-v2-figma/impl/bento-fixes.md`.
- **Phones.** The stack scales with the column up to its 560 design width, then stays 560 and centred (`--lp-bento-stack-max` in `bento.css`, one switch). A KPI label longer than its box wraps to two lines, as the designer's component does.
- **KPI figures** are the customers' own, each with its `source`. `bentoKpiClaims()` hands the "value label" pairs to `scripts/homepage-lint.mjs`, which checks them against `BENTO_KPI_ALLOW`, a sourced allow-list: a new figure fails the build until a human adds it there with its source.
- **Kinro (done 2026-10-12).** His cut is wired like the Praxis one: film `kinro-pierre-960.mp4` (+640), posters, portrait from his own cut, captions, and a silent preview clip that starts at 8.367 s, the first frame without the burned-in name title (founder: "start the preview at 8.4s"); with sound the film plays from 0. Recipe and as-run tools: `artifacts/landing-v2-figma/impl/bento-real-assets-kinro.md`, `impl/bento-kinro.md`.
- **QA.** `node --test scripts/placeholder-gate.test.mjs`; `artifacts/landing-v2-figma/pw/bento2-geom.mjs`, `bento2-shot.mjs`, `bento2-diff.py`, `impl/bento-fixes-tools/film.mjs` and `reduced.mjs` (they replace `bento2-video.mjs` and `bento2-loop.mjs`); the live set on the dev page: `artifacts/…/impl/bento-fixes-tools/measure.mjs --prod`.

### Agents view (V2 `4911:1461`)

`?audience=agents` turns the homepage into one blue page (`--lp-blue-40`, white ink, square corners, 1 px white outlines) set in Geist Mono. All of it is agents-scoped CSS (`audience-agents.css`, after `audience.css`; `agent-lab.css`); `LpNav` is unchanged.
- Nav: pixel logo (`public/lp/lp-nav-logo-pixel.svg`, kept in a 142×44 whole-pixel box because Chromium snaps mask rects), an outlined Sign in and a white Start free.
- Hero art: an ASCII rainbow on a canvas (`LpHeroAgentArt` + `lp-agents-ascii.ts`, grids generated by script: never hand-edit). Animated since 2026-10-12 (founder: "let's animate this thing") in the humans rainbow's own logic: `lp-agents-ascii-spin.ts` reads the six hero rings from the DOM, turns them on the 20 s loop and samples them one character per cell (one pixel per cell on a scratch canvas, about 0.2 ms), fitted so cycle 0 is the designer's picture. Its own gates, not the freeze system: on screen and tab visible only, 15 / 12 / 10 redraws a second (desktop / tablet / phone), only the changed lines repainted, the picture held if frames get slow; reduced motion keeps the designer's static grid. `window.__lpArcPhase` pins the cycle. Checked over the whole loop: no character comes within 24 px of the headline, the toggle or the install box at 402 to 1920. The rings stay laid out and `visibility: hidden`, so their GL loop repaints the way back.
- The switch (`LpAudience`, 2026-10-12): no View Transition any more. The thumb and the bold label move on the frame after the click (`data-pending` on the selector), the other view is committed right after that frame, and the hero fades up over 180 ms. The snapshot crossfade it replaces froze the page 80 to 160 ms and took about 400 ms to show the other view (founder: "the untoggle from agents > human is slow").
- Headline "> @agents," / "get gtm superpowers" (`LpAudienceHeadline`): production typing over two rows, not rendered in the humans view, capped so it never outgrows the human H1.
- Right column: install box (`LpAgentPrompt`, shared with the card), then "friends with" + five marks (`LpAgentStart`, `LpAgentMarks`).
- Code wall (`LpAgentLab`, still `section.lp-agent-lab#agent-playground`): production's pseudocode under a 690×562 outlined card whose body is a typed slot (`lp-agents-wall-data.ts`): production's puzzle (`LpAgentCaptcha`, final) or an install-session transcript draft (placeholder, off by default).
- Scroll assembly (`lp-agents-scroll.ts`, desktop with motion): its own range (the window's top from 299.42 px above the fold to 141 px from the top), passive scroll + rAF writing `--lp-as*`; it locks assembled (`data-as-done`), and from p ≥ .85 the faded hero blocks get `data-as-out` (`visibility: hidden`). The terminal stream is gone; `/agents` is a separate page, untouched.

### content-visibility, freeze, fit

- `content-visibility: auto` on `.lp-banner, .lp-dive, .lp-bento` (never `.lp-demowin`, `.lp-cta` or the pricing art). `contain-intrinsic-size` sizes the CONTENT box (padding adds on top). The estimates sit in `foundation.css`, except two that depend on what the section renders and live with it: the bento's in `bento.css` (`.lp > .lp-bento`, from the grid height `LpBento` computes for the set it renders) and the phone deep-dive stack's in `dive.css`. Re-measured in the final pass of 2026-10-12: within 1.4 % of the rendered height at 1654 / 1440 / 1024 / 768 / 402 / 393 in Chromium, and at 1654 / 768 / 402 in WebKit and Firefox (tablet dive estimate 990: the Pause control's band added 4 px). Re-run `artifacts/landing-v2-figma/pw/integrate-measure.mjs` whenever one of these sections changes height.
- Freeze (`LpAnimFreeze.tsx` + `anim.css`): stages `.lp-banner__card`, `.lp-marquee`, `.lp-demowin`; members the ring spins, bubbles, `.lp-marquee__seq`, `.lp-demowin__caret`. An infinite CSS loop joins both lists and both off-stage blocks, or gates itself: the demo's tool-row spinner turns only under `[data-run]`, the agents cursor has its own in-view gate, the bento previews and every GSAP timeline gate themselves. The second and final passes added no CSS loop.
- `LpFitVars` targets are unchanged: the dive stages, the step cards and the phone demo card write their own fit variable.
- Firefox drops an inset `box-shadow` thinner than a device pixel. Gecko paints none under 1 CSS px at any pixel ratio. The sources story and the phone demo card draw their hairlines another way, the desktop demo window has its own Firefox rules (`demo.css`, `@supports (-moz-appearance: none)`) and step 02's chat boxes a 1x rule (`steps.css`); `.lp-chip`, `.lp-mockcard` and the learns story still use sub-pixel inset rings: look at a new one in Firefox before relying on it.

### Decisions to confirm with the founder

1. **Bento: the switch is ON** (`BENTO_LIVE = true`, founder 2026-10-12: "publish testimonials available"): production renders the seven real cards (Kinro and Praxis films, quotes, figures). The repository is public, so the films have been downloadable since they were pushed; he approved it. One human listen of both caption files is still owed.
2. Tinted pills are `#f8e5d4` / 500 everywhere (hero and CTA "Book a demo", `/for`, `/plays`, `/compare`, 404, `/agents`).
3. Hero: the 36 px drop is kept (H1 63 / aside 71) against V2's 99 / 107.
4. Nav: Sign in replaces Book a demo in the bar, so `call_nav` now fires from the phone sheet only. ≤1024 the toggle sits above the H1.
5. Demo, desktop: the Pancake conversation is today's production demo at its own size, centred, with the input right under it (frame 4); the Claude & Codex view has no final design; the chip has no analytics id. The designer's rest picture is on screen 1.02 s per loop (`REST_HOLD = 1480` holds it 2.5 s). The window finishes assembling by itself when a visitor stops past the storyboard's midpoint; windows 1450 px tall or more get no scroll assembly; the hero's faded links stop being clickable. The demo's Pause is still keyboard-only (production parity): the carousel's pointer and touch reveal can be copied there (`demo.css`, `.lp-demowin__ctrl-btn`).
6. Demo, phones: the designer's small card (218 px on a 402 screen, type at 5 to 11 px: a picture of the product, not a UI), no pills and no Claude & Codex view, the conversation at the bottom of the card once sent. Switches: `--lp-demowin-phone-w`, `PHONE_SOLO`.
7. Steps: step 02's title is V2's, its body production's (it no longer mirrors the new animation); "reply rate" on the Play cards is preview only; the storyboard's lead names looked real and were replaced by the Studio Pelican cast; step 03 now runs 10.7 s and its calendar does not show the meeting just booked; "3.30pm" as drawn; the graph says "Influencers" while carousel item 1 says "experts".
8. Blue band: parallax depths (dive +0.12 / −0.06 / −0.10, CTA +0.10 / −0.08), no hover pause, but a Pause button a mouse or a finger can reach, under the stage card (not drawn by the designer), CTA radius 24 on desktop and tablets and 32 on phones (homepage only), phone deep dive = four stacked items (switch `DIVE_PHONE_LAYOUT`), clouds kept on phones (switch in `sky.css`), "See how →" on phones sits where the artboard draws nothing (item 4 is 28 px taller).
9. Stories: sources ends on the open panel in production (the hub, its six glyphs and its "Data sources" label are preview only: which sources, which words, is "40+" a number we stand behind); the end picture shows one lead "Booked" out of three (drawn, not a stated rate), sender names stand where the designer drew mailbox addresses, "Waiting for a reply" for his "Waiting response", and the invented names passed one web search each, which is not an exhaustive check (message); a storyboard the designer was still drawing on 2026-10-12: re-read it before calling the story final (learns); "…in the US" and "Opus 5" will age (claude).
10. Agents view: on windows taller than about 1100 px it loads part-assembled, and above about 1900 px with its copy part-faded (the humans side's clamp and height ceiling are not ported: designer WIP), and at 371–385 px wide the agent column is 19 px taller than the human one; Cursor is still in "friends with" although it can't connect yet; the card body is the production puzzle; `@chenglou/pretext` has no importer left (removing it is a package change); the ⌘K note is not built; `/agents` could 301 to `/?audience=agents`.
11. The trial Aeonik faces have no `? ! ' " : ; & @ # % + ( )`: those glyphs draw in the fallback face until the licensed files land (the bento names Geist before the OS font for them).
12. No new analytics id anywhere (the demo chip, the bento and "Watch with sound" carry none).

### Designer WIP and what is left (Figma state 2026-10-11, build of 2026-10-12)

Marked WIP by the designer, so today's build is an interim: the agents view and the Claude & Codex demo view. No longer WIP since 2026-10-12: the message story (six frames), the "Pancake learns from what wins" storyboard (five frames, drawn that day) and "Run it from Claude or Codex" (unchanged, no WIP mark left).

Built on 2026-10-12 from the 2026-10-11 delivery (`artifacts/landing-v2-figma/specs/updates/`, decisions §9): the demo section at 793 with storyboard frame 4, steps 02 and 03, the new sources storyboard, the bento with the real testimonials, and the mobile artboard's five pieces (phone-shaped demo card, stacked deep dive, phone sky and CTA r32, stacked bento, logos and steps rhythm).

Fixed in the final pass of 2026-10-12 (the verifiers' findings, `artifacts/landing-v2-figma/verify/` and `impl/*-fixes.md`): the hero scroll on tall windows, for a visitor who stops mid-assembly and before hydration; the phone hero back on the first screen; step 03's fast-forward cost; the carousel's Pause for mouse and touch; the bento's preview clip and captions; Firefox and 1x hairlines.

Left: the founder's go for the bento (`BENTO_LIVE`), one human listen of the Praxis captions, Kinro's film and portrait (his cut is not on disk), the sources hub's real content, the founder's yes on the "reply rate" figure, PSI mobile on a public preview, real-device checks (iPhone: the 0.5 px hairlines, the `tan(atan2())` pre-hydration scales, the film's dialog). Known and left: every centred condensed title sits about 0.9 px right of Figma's ink, as on production (CSS centres the line with its trailing letter-spacing; `padding-right: 0.03em` on the title fixes one). Not drawn, so unchanged: tablets, the phone toggle row, the phone step art, pricing, the footer.

## Why some tokens differ from `tokens.css`

The Figma file's variables differ from the old palette on three points, and AGENTS.md says Figma wins — but only this page uses the new values, so they are scoped to `.lp` instead of edited in `@layer semantic`:

- `--lp-ink-10: #fffbf6` (old `--palette-chrome-10: #FFFCF8`)
- `--lp-green-10: #ceead5` (old `#CFF0E1`)
- page background `#fbf6f1` and the `--lp-ink-tr-*` alpha ramp are new.

## Fonts

All display type (hero headline, every section title, "99 USD") is **Aeonik Condensed Pro TRIAL** — upright cuts in `app/fonts/aeonik-condensed/` (CoType trial zip, downloaded 2026-08-28 at Tristan's direction), loaded in `app/layout.tsx` as `--font-aeonik-condensed` and consumed via `--lp-font-cond`. Body, labels, buttons and the mock UIs read in **Geist Sans** since 2026-09-09 (founder: everything that isn't Aeonik reads in Geist Sans — the Fono mono was hard to read at body sizes): one variable woff2 in `app/fonts/geist/`, loaded as `--font-geist-sans`, consumed via `--lp-font-sans` (and as the kit's `--font-body`). UI-mock labels use Aeonik Medium.

No V2 font is site-wide (nothing new in `app/layout.tsx`). The agents view reads in **Geist Mono** (`--lp-font-mono`, an `@font-face` in `audience-agents.css`, fetched only when the agents view renders or the toggle is hovered) and its code wall in system Andale Mono. The Claude mocks use **Literata** (`lp-claude-font.ts`). Aeonik Fono remains on blog `code` and on `/agents`' own page.

⚠️ All three Aeonik families are TRIAL-licensed — settle the CoType license before this ships to production.

## Buttons

The four CTAs are `LpFxLink` (`LpFxButton.tsx`) — the landing-v2 pill FX ported onto the
Figma-exact `.lp-btn` geometry: pointer-anchored circle flood (yellow-30/purple-30/green-20
cycle) + label slide on hover, touch-guarded, `app_cta_clicked` analytics on the existing
allow-listed ids (app_nav / app_hero / app_final / app_pricing_card). The resting label is
cream; the slide-in label is plum for contrast on the pastel flood.
Every Figma rectangle carries cornerSmoothing (buttons .75, cards .6, testimonials 1.0) —
`corner-shape: squircle` is applied via the grouped rule in `foundation.css`; browsers
without support fall back to plain rounded corners at the same radii.
Gotcha that bit us: `.lp a { color: inherit }` outranks `.lp-btn` — anchor buttons need the
`.lp a.lp-btn` color rule or their labels render plum-on-plum (invisible).

## Motion (shipped 2026-08-28, Figma-exact)

Extracted with `get_motion_context`: ONE 20 000 ms linear infinite master loop
rooted at the page frame — every animated node shares the clock, and t=0 equals
the static artboard (enforced by a pixel-parity gate).

- Rings (`LpPancakes.tsx`, variants hero/pricing/ctaRight/ctaLeft): full-circle
  vectors (`public/lp/lp-arc-1..6.svg`, mapped by fill color) at their Figma
  bboxes; static pose as a fitted `matrix()` (mirror + 0.47° shear, fitted to
  <0.01px against the baked composites); a spinner inside the pose applies the
  track sign unmodified (0→±360°/20 s). The cream ring "pops" −50px over the
  first 500 ms of each loop (`lp-anim-pop`, cubic-bezier(0,0,.58,1)) — that is
  Figma's own keyframe, so raw t=0 differs from the settled artboard by exactly
  that annulus.
- Banner bubbles (`LpBubbles.tsx`): 44 near-circles in card coords spinning
  about their own centers — VERIFIED against Figma's own prototype render
  (`export_video` of 4257:4893, measured frame-by-frame): the bubbles do NOT
  orbit/pour, they shimmer in place. The four tracks with absolute-angle
  offsets end at each node's static rotation, so all 44 run +360° from a 0°
  offset — no animation-delay anywhere (earlier delays were a mis-encoding,
  removed 2026-08-28). The drop and bottle do not animate at all.
- Cream-ring pop plays ONCE (`20s linear 1 forwards`) — Figma exports it as
  infinite but replaying it broke the loop wrap (founder report).
- CTA desync (founder, 2026-08-28): the left CTA group runs at
  `animation-delay: -7.3s` so the two mirrored rainbows never render as a
  perfect reflection mid-animation.
- All keyframes in `app/_styles/landing-v3/anim.css`; `prefers-reduced-motion`
  disables everything (static = artboard).
- WebKit guard: the hero/CTA/pricing text containers carry
  `transform: translateZ(0)` (+ `isolation: isolate` on the hero) — Safari's
  heuristic overlap-promotion dropped the H1's layer on scroll-return over
  the big animated ring layers.
- Perf note: transform-only compositor animations; the software-GL headless QA
  harness caps at ~35 fps (its compositor, not main-thread — static page reads
  63 fps there). Verify scroll feel on the Vercel preview with a real GPU.

## Founder overrides of the artboard (2026-08-28)

These intentionally diverge from the static Figma export — don't "fix" them
back during a fidelity pass:

- Casing: no capitals on common nouns mid-sentence ("Pancake sells it",
  "While you run your business,", "GTM brain").
- CTAs (founder, 2026-09-03): primary "Start free" (app.getpancake.ai)
  and secondary "Book a demo" (a same-tab link to /demo since 2026-09-16; it opened the Calendly qualification-form sheet before) on the hero and final
  CTA, always in that order. The nav bar carries [Sign in, tinted] [Start free]
  since 2026-10-09 (V2 red note "Sign in instead of Book a demo"); Book a demo
  stays in the hero, the final CTA and the phone sheet. Pricing keeps the
  primary only (founder, same
  day: "enlève Book a demo du pricing"); the phone bar keeps the primary
  only (the sheet carries both), the final CTA shows both on phones too.
  Pills keep the artboard widths (110/136/203 — founder: "button keep same
  sizes"; "Start free trial" had widened them, hence the shorter label);
  "Book a demo" fits by trading side padding (`.lp-btn--demo`). The v2
  chrome (pricing, support, privacy, terms) carries the same labels and
  order.
- Copy pass (founder, 2026-09-03), verbatim: steps heading "Pancake fills
  your pipeline." (was "Pancake sells it"); step 01 body "From your website,
  Pancake learns who buys from you, what to say, and where to show up. Always
  up to date." (2026-09-30, AI SEO retired: now "…and where to find them.");
  pricing "$99/month" (display "$99" + inline
  "/month" in the per-line style) instead of "99 USD" / "per month, flat".
- Steps media cards are the designer's vector illustrations (Figma 4636:3164,
  2026-09-02: knowledge graph / pipeline checklist / calendar week), exported
  as 464×426 SVGs with outlined text (`/public/how/step-*.svg`), contain-fit
  in a card that keeps the 464/426 aspect at every width — nothing cropped on
  phones. Step 03 copy is the founder's override, not the artboard's. The
  old studio loop trio (`/public/how/*-loop.mp4`) is unused; `agents-loop.mp4` (it
  showed the AI SEO planner) was deleted on 2026-09-30, the other two stay served;
  the designer's storyboard loops took each card over as the founder approved
  them (all three done 2026-09-02), and since 2026-09-07 they animate IN PLACE
  as DOM + CSS + GSAP (founder: no 500 KB–1 MB video downloads, vector-crisp at
  every DPR; "réplique parfaitement les
  animations"). `LpStepAnim.tsx` drives them through `lp-play-once.ts` (see
  "Playback" below; plays once, holds the last frame = the brain / the Play
  card / the filled week, reduced motion = that frame);
  `LpStepMocks.tsx` is the mocks' markup, `steps.css` (bottom) their geometry,
  `lp-step-timelines.ts` the three timelines: step 01 and step 03's calendar
  ported tween for tween from the pancake-studio compositions
  (`shorts/brain-research-loop`, `meetings-calendar-loop` — the storyboards
  the mp4s were rendered from); step 02 and step 03's intro built from the
  designer's 2026-10-11 "How it works" storyboards (see "Customers band and
  steps" above), `lp-step-data.ts` their numbers. Unlike the
  deep-dive stories (rest = end picture), the rest markup IS the composition's
  frame 0 (the poster the
  video showed), so the server-rendered card is already the right still. The
  464×426 stage scales AS PIXELS with the card (`--lp-fit`, ResizeObserver +
  trig fallback) and the card keeps clipping at its radius, as it clipped the
  video. QA hook: `window.__lpStep[s1..s3]` = the timelines (seek a time or a
  storyboard label + screenshot).
  The storyboard mp4s + posters and `LpLoopVideo.tsx` are gone; the SVG
  illustrations (`/public/how/step-*.svg`) stay as the designer's stills.
- Playback (2026-09-30, founder: "les motions apparaissent de manière molle…
  quand tu scrolles rapidement tu fais face à beaucoup de vides"):
  `lp-play-once.ts` drives the step cards, and the deep-dive carousel reuses
  its constants and helpers for its first start. Prepared a viewport
  ahead (code fetched, timeline built once the content-visibility section
  renders, one build per frame); switched, unseen, 15 % of a viewport below
  the fold to its FIRST SCENE (each builder's `cue`: a composed frame, never
  empty); played once its top crosses 60 % of the viewport height, or after
  1 s with half of it on screen when scrolling stopped (founder: "tu
  commences les animations trop vite quand mon écran n'est pas focus
  dessus"); the picture instead of a build-up when the visitor flies past
  (> 2.5 px/ms, or a jump of half a viewport); fast-forwarded to the picture
  (~0.35 s) when the card leaves through the top unfinished; finished once
  it is gone after playing; never rewound while on screen. The WebGL
  arts (CTA, pricing) draw one frame a viewport ahead on desktop
  (LpRainbowGL WARM_MARGIN) so a fast scroll no longer meets the pricing
  section's black band; the banner poster loads eagerly a viewport out.
- Logo strip scrolls (seamless 1424px-period tile
  `lp-logo-strip-tile.png`, ~34 px/s leftward, blend moved to the track).
- Testimonials ("Take it from them", Figma 4257:5006): removed from the
  homepage 2026-09-28 (founder: old content — 8 fictional authors/tweets
  from the AI-org pitch). The V2 bento (`LpBento`) sits between the CTA and
  pricing since 2026-10-09; since 2026-10-12 it holds the real Kinro and
  Praxis testimonials; production shows its final cards once `BENTO_LIVE`
  is on, and nothing until then (see "Bento" above). The V2 stand-ins (Klarna, invented people and numbers)
  are gone from the code.
- "How Pancake finds customers" was four stacked feature cards (f5 Plays, f1
  signals, f2 message, f4 brain: `LpFeatures`, `LpFeatAnim`, `LpFeatMocks`,
  `lp-feat-timelines.ts`, `lp-feat-art.ts`, `features.css`) until 2026-10-11.
  The V2 deep-dive carousel replaced them and the files are deleted (they are
  in git history, last on main at `45be32e`). What carries over: the mock UIs
  are in-page DOM + CSS + GSAP, never video; the rest markup is the designer's
  picture, so a card is never blank; typing reveals the real text with a
  clip-path staircase (a per-character span layer lost kerning in WebKit);
  people and companies are fictional and web-checked. The f2 card had NO Send
  button (founder 2026-09-03, "ressortir l'esprit que c'est autonome"), and
  the V2 message story has none either since the designer's 2026-10-12
  storyboard. The f4 "+56%" chart is no longer on the
  homepage.
- Footer content sits 48px closer to the pricing rings (brand top 56.43,
  cols top 76.75; Figma: 104.43/124.75). Since 2026-10-07 the footer is in
  flow with padding and has no fixed height (it was 467; Figma 515), so the
  four link columns can grow without overflowing.
- Demo: the /for product demo sat on the homepage as `LpDemoTour` from
  2026-09-23 to 2026-10-09 (four tabs, VxDemo). The V2 demo window replaced
  it (see "Demo window and hero scroll" above) and moved right under the
  hero, before the customers band (red note "swapped position / 'Trusted by
  many'"). `lib/verticals/home-demo.ts` is still its validated data source.
- /careers runs on this design system (`app/careers/page.tsx` +
  `app/_styles/landing-v3/careers.css`, imported by the page only — not in
  the landing-v3.css manifest).
