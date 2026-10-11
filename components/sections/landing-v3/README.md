# Landing v3 — Figma replication notes

Sources of truth:
- V1 artboard: Figma `Pancake-Design`, page `└-> Desktop` (node `4197-9774`), frame `hero` (`4257:4893`, 1654×9632). Extracted 2026-08-28.
- **V2 (2026-10-09, updated by the designer 2026-10-11):** Figma `fr8NgOCTUxsEbrMEJA3YKu`, frame `4911:346` (1654 wide), its red notes ("Deltas"), the hero-scroll and deep-dive storyboards, the agents view `4911:1461`. Only the red-noted deltas come from V2: production copy and founder decisions win everywhere else. Specs, decisions and the per-package reports live in `artifacts/landing-v2-figma/` (`specs/_decisions.md` is binding).

## Structure

| Piece | Where |
|---|---|
| Token layer (Figma variables 1:1) | `app/_styles/landing-v3/foundation.css` — `--lp-*` vars scoped to `.lp` |
| Shared recipes | `.lp-btn` (3 exact sizes), `.lp-title-section`, `.lp-title-card`, `.lp-chip`, `.lp-mockcard`, `.lp-content` |
| Sections | `Lp*.tsx` here + one CSS file each in `app/_styles/landing-v3/` (manifest: `app/_styles/landing-v3.css`) |
| Art assets | `public/lp/` — grouped SVG exports from Figma (backdrop/page rects stripped) + icons/photos. `public/lp/manifest.json` maps Figma asset ids → files |
| Placeholder gate | `lib/placeholders.ts` (`SHOW_PLACEHOLDERS`, `ContentStatus`, `visibleEntries`) |
| Stage harness (dev / preview only) | `app/lp-dev/stages/` → `/lp-dev/stages` |

## The homepage since V2 (2026-10-09)

Page order (`app/page.tsx`): `LpNav` · `LpHero` · `LpDemo` · `LpMarquee labelled` · `LpAgentLab` (agents view only) · `LpSteps` · `LpBanner` (sky) · `LpDive` · `LpCta sky` · `LpBento` · `LpPricing` · `LpFooter`. At 1654 with motion the page is 8560 tall on a preview (nav 120, hero 657, demo 767, logos 130, steps 1773, banner 753, dive 894, CTA 624, bento 1448, pricing 890, footer 504) and 7112 in production, where the bento does not render yet.

Every section is a **direct `<section>` child of `main.lp`**: the agents view (`?audience=agents`) hides all of them except `.lp-hero` and `.lp-agent-lab` (one rule in `audience.css`, integrator-owned). A new section that is not a direct child stays visible there.

Two CSS block names are taken: `lp-demo` is `/demo`'s main (the homepage demo is `lp-demowin`), `lp-agents` is `/agents`' main.

### Placeholder gating: one mechanism

`lib/placeholders.ts`: `SHOW_PLACEHOLDERS` is true in dev and on Vercel previews, false in production. Data entries carry `status: "final" | "placeholder"`.
- Read it in **server components only** (`VERCEL_ENV` is not in client bundles); pass a boolean or filtered data down. Readers today: `app/page.tsx` (agents card body), `LpSteps`, `LpDive` (it passes `placeholders` to every story Stage), `LpBento`, the harness page.
- Production renders no placeholder and no empty shell: a slot or section with no final entry returns null (`LpBento`), and a step row with no final art throws at build (`LpSteps`).
- What is placeholder today: the whole bento (seven cards), the "source DB" circles of the sources story, one line each in the learns and claude stories. Everything a placeholder renders is marked `data-placeholder`.
- Guard: `node --test scripts/placeholder-gate.test.mjs` server-renders the gated sections as a production build and as a preview build and checks both. Not in `prebuild`.

### Nav and hero (V2 `4911:347`, `4911:355`)

- The bar ends in [Sign in, tinted 73×38] [Start free, 110×38], gap 8 (red note "Sign in instead of Book a demo"). Sign in is an `LpFxLink` (`lp-btn--tinted lp-nav-signin`, `signin_nav`, never an acquisition id). Book a demo left the bar: it stays in the hero, the final CTA and the phone sheet. Phones keep logo + Start free + burger. This nav is site-wide.
- Every `.lp-btn--tinted` is `--lp-tinted-surface` `#f8e5d4` with a 500 label, site-wide (was `#f5e5d6` / 600).
- Homepage hero rules are scoped to `.lp-hero--home` (`/agents`' AgHero reuses the unscoped classes). The hero is 657 tall on windows ≥777; the art is clipped at the hero bottom (≥1025) so the page-coloured ring never covers the demo. H1 bottom 63 and right column bottom 71: V2's composition with the founder's 2026-09-01 36 px drop kept.
- The right column `.lp-hero-aside` is the audience toggle row, then `.lp-hero-swap`: one grid cell where the human column and the agent column overlay. The human column sizes the cell (`visibility: hidden` in the agents view), so the toggle sits on the same pixel in both views; the agent column must stay no taller. No JS measuring. ≤1024 the toggle row leads the stacked block, left-aligned.
- `.lp-hs-hero` marks the H1 and the aside for the demo's hero-scroll drift; both are transform-free (left offsets). Keep them free of their own `translate`, `opacity` and transitions at ≥1025. `<LpHeroAgentArt />` is the first child of `.lp-hero-art`.

### Demo window and hero scroll (V2 `4939:2645`; storyboard `4940:4919 → 4920 → 4981`)

- `LpDemo.tsx` (server) renders ONE app window right under the hero: the live app's home (bar, "Ready when you are", the request already typed, Get started, and the chip "Use Pancake with Claude or Codex", a real link to `/guides/claude`). Two pills, Pancake / Claude & Codex, autoplay between two views of the same request: Pancake replays production's Play moment; Claude & Codex is a Claude-desktop mock (**no final design yet**).
- Copy: `lp-demo-data.ts` (linted). The request, reply and Play card come from `lib/verticals/home-demo.ts` prompt 0 + `vx-copy.ts` (validated by the build). Cue tables: `lp-demo-timeline.ts` (pure). The one client island is `LpDemoPlayer.tsx`: a rAF clock that runs only while started, ≥35 % on screen, the tab visible, not paused and motion allowed; a keyboard-only Pause (WCAG 2.2.2); QA hook `window.__lpDemo` (non-production builds or `?lpqa`).
- Hero scroll (desktop ≥1025 × ≥640, motion allowed): `lp-demo-scroll.ts` (lazy, GSAP ScrollTrigger) maps "section top at 100vh − 299.42 → at 141" to one progress, written as `--lp-hs` on the section and `--lp-hs-hero` on the hero's two blocks; `demo.css` draws every pose (window scale .4956 → 1 and fade, head settling 28 px, pills fading in, hero copy drifting 25.5 px and fading). A CSS scroll-driven animation of the same variable draws the first paint where supported; `<noscript>` forces the assembled state. The window locks assembled (`data-hs-done`) and never disassembles on scroll-up. Phones, tablets and reduced motion get the assembled window and never fetch GSAP.
- The Claude serif is Literata, `lp-claude-font.ts` (next/font/google, one variable woff2, `preload: false`, homepage only), shared with the claude story; one palette `--lp-claude-*`.

### Customers band and steps (V2 `4911:371`, `4911:373`)

- `<LpMarquee labelled />` puts "Trusted by many" above the real logo strip, 130 px tall, right under the demo. `labelled` is opt-in: `/demo`, `/pricing` and `/for` keep the bare strip, pixel-identical. V2's grey tech-logo strip is the V1 placeholder and is never built.
- Step 01's graph names its five hubs (`S1_HUBS[].label` in `lp-step-data.ts`, `.lp-s1-hlabel`); the centre label stays "Studio Pelican".
- Copy and art of the three rows live in `lp-steps-content.ts`. Each row's `art` is a priority list of candidates (`anim` | `image` 464×426 | `empty`), each with a `status`; `LpSteps` shows the first one the gate allows. To preview new art without shipping it, add it first with `status: "placeholder"` and keep the final entry after it.

### Blue band and the deep-dive carousel (V2 `4911:534 → 4939:3388 → 4911:739`)

- The sky (`--lp-sky`) starts under a cream blob in the banner's gutters (`LpBanner`, `sky` default), carries "How Pancake finds customers" (`LpDive`) and ends on the CTA's cream hill (`<LpCta sky />`, homepage only: every other CTA surface is unchanged, r48 on cream). Sky rules: `sky.css`.
- Clouds (`.lp-sky-cloud`) drift on scroll at their own depth: `lp-sky-parallax.ts` via `LpSkyParallax`, one passive rAF listener gated by an IntersectionObserver, one variable per cloud, depths and bounds in `sky.css`. Reduced motion = the artboard pose. `.lp-dive` is `content-visibility: auto`, so the heading clouds' travel is clamped inside the section box.
- `LpDive` server-renders every tab, body and stage (each story's END picture). `lp-dive-carousel.ts` (via `LpDiveCarousel`) plays one turn per item on a master GSAP timeline: story cue → end, then a 2.0 s hold, the bar linear over both. First start follows `lp-play-once.ts`'s contract (prepared a viewport ahead, cued unseen, played at the 60 % focus line or after a 1 s dwell). It runs only while ≥50 % of the stage is on screen, never rewinds on screen, holds the advance under keyboard focus, has a keyboard Pause, and in reduced motion fetches nothing and swaps end pictures. No hover pause (founder precedent 2026-09-22 on the demo).
- Scene boxes: desktop 752×489, phone 400×520 at ≤599, scaled as pixels by `--lp-fit` (never `zoom`). Stories switch on the `lp-dive-scene` size container; builders read `data-lp-layout`.
- Registry: `lp-dive-stages.ts` (Stage + alt, imported by the server `LpDive`) and `lp-dive-loaders.ts` (the lazy loaders, **client only**). A story is `LpStory<Name>.tsx` (server-safe, one root `[data-lp-story]`, rest markup = end picture), `lp-story-<name>-timeline.ts` (`buildStory<Name>(root) → { tl, cleanup, cue }`), `lp-story-<name>-data.ts` (linted copy, `STORY_<NAME>_ALT`), optional `-art.ts`, `story-<name>.css`.
- Bundle rule: a timeline module carries **no `"use client"`** and imports no `"use client"` module other than `@/lib/gsap`, and the registry holds no loader. Next turns every `"use client"` module a server graph reaches, even through `import()`, into an eager entry of the page: GSAP and the builders shipped in the homepage's first bundle until the loaders moved out (2026-10-11).
- Builder rules (GSAP 3.15): sets and tweens only, no callbacks, no randomness; `tl.progress(1)` pixel-matches the server markup; `cue` is never an empty frame. `gsap.context().revert()` replays zero-duration tweens last, in an engine-dependent order (Firefox differs): use 1 ms tweens for instant changes, or restore the rest markup in `cleanup()`. Dispose order is `ctx.revert()` then `cleanup()`. Typing reveals the real text with a clip-path staircase, never per-character spans. The `txt` plugin is `lp-gsap-txt.ts`.
- QA: `window.__lpDive` (`timelines`, `select`, `pause`, `play`, `pose(i, p)`, `state()`), `window.__lpStory.<id>`, and `/lp-dev/stages` (dev and previews only, `notFound()` in production, noindex, not in the sitemap): every stage in both boxes with play / seek / end / rest controls; `?story=`, `&t=<s>|end`, `&layout=desktop|phone`, `&placeholders=0`, `&fit=`.

The four stories:

| Item | What plays | Notes |
|---|---|---|
| sources, "Sources you can trust" (`4964:1287…`) | Leads land, the pointer clicks Elena Marchetti, a dolly zoom into her row, her property card with green ticks, the tags, "Hiring" lights up. 5.15 s (5.82 s with the preview-only source circles) | The rows duplicate `home-demo.ts` prompt 2: keep in sync. Generic glyphs, no platform logos |
| message, "A personal message for every lead" (`4964:1469 / 1471 / 1729`) | The post, then Pancake's draft typed in its rainbow ring; then manual correction, Send, MESSAGE SENT, zoom-out. 9.25 s | Frames 1–3 are final. Frames 4–5 are an INTERIM, isolated in `lp-story-message-tail.ts`, the `SmTail*` components and the "INTERIM" halves of the data and CSS. The art module is generated (`artifacts/…/work/story-message/gen-art.mjs`): never hand-edit |
| learns, "Pancake learns from what wins" (`4964:2021…`) | Plays with their "Approved" share and the app's Strong / Weak thresholds, then "Brain learned" + "Brain updated". 7.75 s | No reply-rate figure. The end picture is not in Figma (frame 5 is empty). Mask ids `lpsl-*`: render the Stage once per page |
| claude, "Run it from Claude or Codex" (`4964:2575…`) | Claude's home, the prompt typed, the send with a ×1.35 dolly, the reply, "Connecting...", "11 leads found". 5.05 s | Codex + Claude marks, never Cursor (it can't connect yet). The prompt targets the US. The follow-up line is preview-only |

### Bento, "Take it from them" (V2 `4911:762`)

`LpBento.tsx` (server), between the CTA and pricing. Seven fixed slots in `lp-bento-data.ts` (videoLg, quoteA, kpiA, kpiB, kpiC, quoteB, videoSm); `resolveBento(SHOW_PLACEHOLDERS)`: a final card wins its slot, a placeholder fills it only in dev and on previews, one empty slot hides the whole section. **Production renders nothing until all seven are final**, so production still goes CTA → pricing.
- The V2 stand-ins (Klarna and Fleet marks, invented people and counts, licensed creator clips) are lint-compliant and must never ship. Their media never gets a pancake.ai URL: the marks are inline SVG (`lp-bento-marks.tsx`), the portraits sit outside `public/` (`bento-placeholder/`) and are inlined as data URIs by `lp-bento-placeholder.ts` (server-only).
- Layout: every card metric is `calc(N * var(--u))` (1 px at ≥1200, frame / 1136 at 1025–1199); tablets two columns; phones a swipe rail whose snap is armed on the first touch (`LpBentoRail`: WebKit lands a snap container first laid out mid page-scroll on a random card). Portraits are static.
- Video tiles (`LpBentoVideo`): poster at rest, the `<video>` created a viewport ahead, muted loop only while ≥60 % in view, a play / pause button; reduced motion shows the poster and fetches nothing until Play is pressed. They gate themselves (not freeze members).
- A real card: `status: "final"` + `source` (its provenance); logo `{ kind: "mask", src: "/logos/customers/<file>", … }`; photos and posters in `public/lp/bento/`.

### Agents view (V2 `4911:1461`)

`?audience=agents` turns the homepage into one blue page (`--lp-blue-40`, white ink, square corners, 1 px white outlines) set in Geist Mono. All of it is agents-scoped CSS (`audience-agents.css`, after `audience.css`; `agent-lab.css`); `LpNav` is unchanged.
- Nav: pixel logo (`public/lp/lp-nav-logo-pixel.svg`, kept in a 142×44 whole-pixel box because Chromium snaps mask rects), an outlined Sign in and a white Start free.
- Hero art: an ASCII rainbow drawn once on a canvas (`LpHeroAgentArt` + `lp-agents-ascii.ts`, grids generated by script: never hand-edit). The rings stay laid out and `visibility: hidden`, so their GL loop repaints the way back.
- Headline "> @agents," / "get gtm superpowers" (`LpAudienceHeadline`): production typing over two rows, not rendered in the humans view, capped so it never outgrows the human H1.
- Right column: install box (`LpAgentPrompt`, shared with the card), then "friends with" + five marks (`LpAgentStart`, `LpAgentMarks`).
- Code wall (`LpAgentLab`, still `section.lp-agent-lab#agent-playground`): production's pseudocode under a 690×562 outlined card whose body is a typed slot (`lp-agents-wall-data.ts`): production's puzzle (`LpAgentCaptcha`, final) or an install-session transcript draft (placeholder, off by default).
- Scroll assembly (`lp-agents-scroll.ts`, desktop with motion): the humans hero-scroll range, passive scroll + rAF writing `--lp-as*`; it locks assembled (`data-as-done`). The terminal stream is gone; `/agents` is a separate page, untouched.

### content-visibility, freeze, fit

- `content-visibility: auto` on `.lp-banner, .lp-dive, .lp-bento`. `contain-intrinsic-size` sizes the CONTENT box (padding adds on top); the estimates in `foundation.css` were re-measured 2026-10-11 and sit within 2.3 % of the rendered height at 17 widths. Re-run `artifacts/landing-v2-figma/pw/integrate-measure.mjs` whenever one of these sections changes height.
- Freeze (`LpAnimFreeze.tsx` + `anim.css`): stages `.lp-banner__card`, `.lp-marquee`, `.lp-demowin`; members the ring spins, bubbles, `.lp-marquee__seq`, `.lp-demowin__caret`. An infinite CSS loop joins both lists and both off-stage blocks, or gates itself: the demo's tool-row spinner turns only under `[data-run]`, the agents cursor has its own in-view gate, the bento videos and every GSAP timeline gate themselves.
- `LpFitVars` targets are unchanged: the dive stage and the step cards write their own `--lp-fit`.

### Decisions to confirm with the founder

1. Tinted pills are `#f8e5d4` / 500 everywhere (hero and CTA "Book a demo", `/for`, `/plays`, `/compare`, 404, `/agents`).
2. Hero: the 36 px drop is kept (H1 63 / aside 71) against V2's 99 / 107.
3. Nav: Sign in replaces Book a demo in the bar, so `call_nav` now fires from the phone sheet only. ≤1024 the toggle sits above the H1.
4. Demo: the Claude & Codex view has no final design (Literata, "Opus 5 · High"); the chip is the humans view's only link to `/guides/claude` and has no analytics id; the "Works in Claude and Codex. See how →" line under the demo is gone.
5. Steps: the graph says "Influencers" (V2 verbatim) while carousel item 1 says "experts"; the hub labels are about 8 px on phones.
6. Blue band: parallax depths (dive +0.12 / −0.06 / −0.10, CTA +0.10 / −0.08; phones half), no hover pause, CTA radius 24 on the homepage only, the "See example Plays" body link dropped (nav and footer link `/plays`).
7. Stories: only "Hiring" is highlighted and the card shows Elena's own signal (sources); the Send button and the manual correction are back, against the 2026-09-03 no-Send rule, and the sender names (Theo Marchand, Priya Venkat, Dario Pellegrin, Hana Morrow, Felix Okoro) still need the web check (message); "Approved" shares instead of V2's reply rates, and an end picture that is not in Figma (learns); "…in the US" instead of "…in Germany", and "Opus 5" will age (claude).
8. Bento: hidden in production until seven real cards exist.
9. Agents view: Cursor is still in "friends with" although it can't connect yet; the card body is the production puzzle; `@chenglou/pretext` has no importer left (removing it is a package change); the ⌘K note is not built; `/agents` could 301 to `/?audience=agents`.
10. The trial Aeonik faces have no `? ! ' " : ; & @ # % ( )`: those glyphs draw in the fallback face until the licensed files land.
11. No new analytics id anywhere (the demo chip and the bento carry none).

### Designer WIP and what the next pass builds (Figma state 2026-10-11)

Marked WIP by the designer, so today's build is an interim: the agents view, the "Pancake learns from what wins" and "Run it from Claude or Codex" storyboards, the message story's frames 4–5, the Claude & Codex demo view.

Delivered on 2026-10-11 and **not built yet** (`artifacts/landing-v2-figma/specs/updates/`, decisions §9): the demo section at 793 with storyboard frame 4; steps 02 and 03 ("How it works" storyboards); the new sources storyboard; the bento with the real Kinro and Praxis testimonials; the mobile artboard `5024:8631` (phone-shaped demo card, stacked deep dive, CTA r32, stacked bento).

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
  "Playback" below; plays once, holds the last frame = the brain / the Agents
  view / the filled week, reduced motion = that frame);
  `LpStepMocks.tsx` is the mocks' markup, `steps.css` (bottom) their geometry,
  `lp-step-timelines.ts` the three timelines ported tween for tween from the
  pancake-studio compositions (`shorts/brain-research-loop`,
  `pipeline-checklist-loop`, `meetings-calendar-loop` — the storyboards the
  mp4s were rendered from; the pipeline cut runs at 4/3 speed inside a paused
  master exactly like its wrapper), `lp-step-data.ts` their numbers. Unlike the
  deep-dive stories (rest = end picture), the rest markup IS the composition's
  frame 0 (the poster the
  video showed), so the server-rendered card is already the right still. The
  464×426 stage scales AS PIXELS with the card (`--lp-fit`, ResizeObserver +
  trig fallback) and the card keeps clipping at its radius, as it clipped the
  video. QA hook: `window.__lpStep[s1..s3]` = the timelines (seek + screenshot,
  compare with the composition renders; s2's time is the 11.2 s master's).
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
  from the AI-org pitch). The V2 bento (`LpBento`, 2026-10-09) now sits
  between the CTA and pricing, but production renders it only once all seven
  slots hold real, founder-approved content: until then production still goes
  CTA → pricing. Its V2 placeholders (Klarna, invented people and numbers)
  show in dev and on previews only, and must never ship.
- "How Pancake finds customers" was four stacked feature cards (f5 Plays, f1
  signals, f2 message, f4 brain: `LpFeatures`, `LpFeatAnim`, `LpFeatMocks`,
  `lp-feat-timelines.ts`, `lp-feat-art.ts`, `features.css`) until 2026-10-11.
  The V2 deep-dive carousel replaced them and the files are deleted (they are
  in git history, last on main at `45be32e`). What carries over: the mock UIs
  are in-page DOM + CSS + GSAP, never video; the rest markup is the designer's
  picture, so a card is never blank; typing reveals the real text with a
  clip-path staircase (a per-character span layer lost kerning in WebKit);
  people and companies are fictional and web-checked. The f2 card had NO Send
  button (founder 2026-09-03, "ressortir l'esprit que c'est autonome"): the
  message story brings Send back because the designer's V2 storyboard draws
  it (decision to confirm above). The f4 "+56%" chart is no longer on the
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
