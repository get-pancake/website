# /agents landing — build spec

The second landing: a new message + positioning ("Give your AI agent GTM
superpowers") to test against the homepage. Source of truth for structure, copy
and motion = the approved draft mockup **https://pancake-landing-draft.vercel.app/**
(a static 1654px HTML page that zooms to fit). This page rebuilds it on the
landing-v3 design system: same tokens, fonts, nav, rainbow art, pills, CTA card,
footer and booking sheet as the homepage, recomposed per breakpoint (never zoomed).

Founder brief (2026-09-11): "réutiliser les composants et les polices natives de
la landing page réelle … les bonnes animations … reprendre tous les éléments de
copie et les structures … respecter tout notre design system … sur mobile il y a
d'énormes checks à faire".

## Reference material (session scratchpad)

`/private/tmp/claude-501/-Users-tricomte-Documents-cowork-projects-projects-getpancake-ai/93036001-37ae-4ed9-a0b7-befeae246793/scratchpad/`

- `draft-body-pretty.html` — the draft's markup, one tag per line (inline styles = its geometry)
- `draft-css.css` — the draft's stylesheet (keyframes, timings)
- `draft-scripts.js` — the draft's JS (chat play-on-view, carousel, plays org chart, brain force graph)
- `draft-shots/desktop-sec-NN.png` — 1:1 screenshots at 1654: 02 hero · 03 sidekick · 04 knowledge · 05 superpowers · 06 plays · 07 brain · 08 versus; `desktop-bottom.png` = CTA + works-with + footer; `desktop-1654-full.png` = whole page
- `draft-assets/` — every inline SVG/PNG extracted (`brain-static.svg`, `org-connector.svg`, `slide1-mini-brain.svg`, `icon-*.svg`)
- `qa/shot.cjs` — screenshot script (see QA below)

## Files

| Piece | Where |
|---|---|
| Route | `app/agents/page.tsx` (noindex, provisional URL) |
| Copy (verbatim, ALL strings) | `components/sections/agents/ag-copy.ts` — import, never re-type |
| Sections | `components/sections/agents/Ag*.tsx` — one per draft section |
| Shared | `AgTerminal.tsx` (install terminal + copy), `AgAgentMarks.tsx` (5 marks + `AgMarksRow`), `useInView.ts` (`useInView`, `useReducedMotion`) |
| Page end | `LpPricing` + `LpFooter` from landing-v3 (see Founder feedback, point 4) |
| CSS | `app/_styles/agents/<section>.css`, imported in order by `app/_styles/agents.css` (after `landing-v3.css`) |
| Shared CSS | `app/_styles/agents/foundation.css` — `.ag-sec`, `.ag-sec__inner`, `.ag-sec__head(--left)`, `.ag-kicker`, `.ag-lede`, `.ag-accent`, `.ag-title-step`, `.ag-title-sm`, `.ag-sep`, `.ag-card`, `.ag-tint--*`, `.ag-marks`, `.ag-term*`, phone type steps |
| Assets | `public/lp/agents/data/<slug>.png` (16 illustrations, 147×160), `public/lp/agents/grokbot.svg`, `public/pancake-monster.png` (mascot), `public/og-agents.png` |

Reused from landing-v3 (do not modify those files): `LpNav`, `LpFooter`, `LpModals`,
`LpFitVars`, `LpFxLink`/`LpFxPill` (pills), `LpPancakes` + `LpRainbowGL` +
`LpArcCanvas` (rainbow), `LpViewportVar`, `HermesMark`; tokens/recipes from
`app/_styles/landing-v3/foundation.css`, hero art geometry from `hero.css`, CTA card
from `cta.css`. Override under `.lp-agents` / `.ag-*` only.

## Non-negotiables

1. **Tokens only.** No hex, no rgba literals — `--lp-*` from landing-v3
   `foundation.css` (colors, `--lp-text-*` scale, `--lp-r-*` radii, `--lp-ink-tr-*`
   alphas, `color-mix()` for other alphas). Draft hex → token map:
   `#e33a6a` pink-40 · `#ff7aa0` pink-30 · `#ffbd7a` yellow-30 · `#f38f43` yellow-40 ·
   `#8d43fd` purple-40 · `#ba8bff` purple-30 · `#4660e7` blue-40 · `#6a8fff` blue-30 ·
   `#037d48` green-30 · `#68cea7` green-20 · `#d43900` orange-30 · `#e5002e` red-30 ·
   `#2c002a` ink-100 (`--lp-text`) · `#6c4b65` ink-90 · `#85687c` ink-80
   (`--lp-subtle-text`) · `#9a818f` ink-70 · `#ddcfcd` ink-50 · `#fff7ec` ink-20 ·
   `#fffbf6` / `#fffdf9` `--lp-card-cream` · `#fbf6f1` `--lp-page-bg` · `#f0e9e3` ink-40 ·
   `#000` `--lp-terminal-bg` · tints `#ffe9d1` yellow-10, `#ffd9da` pink-10,
   `#efddf1` purple-10, `#d9e9ff` blue-10, `#ceead5` green-10 ·
   `rgba(44,0,42,.1/.2)` `--lp-ink-tr-10/20` (other alphas: `color-mix(in srgb,
   var(--lp-ink-100) 14%, transparent)`).
2. **Fonts.** Headlines/kickers/card titles = Aeonik Condensed via `.lp-title-section`,
   `.lp-title-card`, `.ag-title-step`, `.ag-title-sm`, `.ag-kicker` (never set
   `font-family` by hand). Everything readable = Geist Sans, inherited from `.lp`
   (`--lp-font-sans`) — INCLUDING the chat mock, chips, plays, brain labels and the
   carousel mocks (founder 2026-09-09: mock stages read in Geist). The ONLY mono
   text is the install command inside `.ag-term` (already handled). The kit's
   `* { font-family }` rule beats inheritance: never rely on a container
   `font-family` for descendants.
3. **Copy verbatim** from `ag-copy.ts` (capital-P Pancake, the draft's casing and
   punctuation, the `·` separators, the `→` arrows). Nothing added, nothing
   "improved". Screen-reader text (aria-labels, alt) is the exception.
4. **Pills** = `LpFxLink` (links) / `LpFxPill` (in-page buttons) only, with the
   `.lp-btn` recipe (sizes via `size="sm"|"lg"`, secondary skin
   `className="lp-btn--tinted lp-btn--demo"`). `data-analytics-id` must be one of
   the allow-listed ids (`lib/analytics/data-layer.ts`) — this page uses `app_final`
   / `call_final` in the CTA; the nav carries its own. No new ids.
5. **Cards** (founder rules): cards in a row are pixel-equal in height (grid +
   `align-items: stretch`, never content-hugging), no hover dim/transparency on
   non-hovered siblings, no sticker shadows, no rotated frames, copy left-justified
   inside cards (section heads and the draft's centered labels stay centered).
   Radius `var(--ag-r-card)` (30 desktop / 24 phone). Nested frames parallel.
6. **Motion.** Port the draft's animations 1:1 (same keyframes, durations,
   easings, delays — `draft-css.css`) as CSS keyframes; JS only where the draft
   needs state (carousel, plays org chart, brain graph, chat play-on-view).
   Every ambient loop runs ONLY while its section intersects the viewport
   (`useInView` → `data-inview`, CSS `animation-play-state` or a class gate, JS
   loops start/stop on it) and never under `prefers-reduced-motion` (show the
   settled/final state instead). No `will-change` on big elements. Don't add
   packages; GSAP is available via `@/lib/gsap` if a timeline is simpler than
   keyframes.
7. **Components.** Server components by default; `"use client"` only for
   state/effects. Class prefix `ag-<section>__elem` / `ag-<section>--mod`; each
   section's root carries `ag-sec ag-<section>` (except hero/CTA which reuse
   `lp-hero` / `lp-cta`). One CSS file per section (already created, empty).
   Comment the WHY (founder rules, draft geometry) like the landing-v3 files do.
8. **Mobile = recompose, never crop or shrink-zoom.** Every section must be
   "nice and juicy" on phones: readable type (see phone steps in foundation.css),
   ≥44px tap targets, no dead hover-only features, ambient motion kept (or a
   cheaper equivalent), nothing accidentally cut, NO horizontal page overflow
   at 320–430px. Tablet 768–1024 gets a real intermediate layout.
9. **Never** run `next build`, `npm run dev`, `git stash`, or edit files outside
   your section (page.tsx, foundation.css, ag-copy.ts, other sections). If a
   shared file needs a change, say so in your report — don't make it.
10. **Accessibility.** Real `<button>`s with labels for controls; decorative
    SVG/img `aria-hidden` / `alt=""`; animated mocks get one `aria-label`
    describing what they show; rotating words expose the full sentence to
    screen readers once (e.g. `.lp-sr-only` copy + `aria-hidden` on the cycling
    spans).

## Founder feedback (2026-09-11, mid-build) — the draft is NOT ground truth where it is flawed

His words, on seeing the draft again: "Y a plein de trucs qui sont foireux, don't
take la landing page for granted telle qu'elle est — pourquoi works with traîne en
bas · mauvais footer · problèmes d'animations · il y a des dizaines de trucs à
check, sois super pixel perfect." He attached three crops of the draft: the hero's
"and watch it become a GTM super hero" + mascot floating in empty cream, the CTA
card's bottom corner where the rainbow sliver stops and cream shows under it, and
the "Works with" strip dangling on its own between the CTA and the footer.

Consequences (binding, they override any "match the draft" line above):

- The draft fixes the STRUCTURE, the COPY and the INTENT of each animation. Its
  execution flaws are bugs to fix, not features to replicate. Where the draft and
  the production homepage's quality bar disagree (rhythm, geometry, motion
  polish, radii, alignment), the homepage wins.
- Known draft flaws — fix them:
  1. **"Works with" strip** must not dangle between the CTA and the footer. It
     moves INSIDE the CTA card as a quiet last row under the pills: label + the
     five marks + the dashed "any MCP client" chip, 13.333 muted, gap 16, 40px
     under the pills. No standalone section (the integrator removes it from
     page.tsx; AgCta renders it).
  2. **CTA card**: the rainbow slivers are 432px tall while the card grows with
     the terminal, so cream shows under the rainbow at the bottom corners. The
     slivers must span the card's full height at every width (anchor/scale them
     to the card, or cap the card at the artboard's 432 by tightening the
     content — measure both, keep the artboard geometry, report the numbers).
  3. **Hero bottom**: "and watch it become a GTM super hero" and the mascot sit
     in a dead cream band under the terminal, and the mascot is a static PNG on
     a page where everything else moves. Tighten the stack (draft 40/36 →
     32/24), give the mascot the page's idle bob (3.2s, in-view gated, off under
     reduced motion), end the section a controlled 56px under the mascot on
     desktop, and on phones end the hero right after the mascot — never stretch
     the hero to the fold if that leaves more than ~80px of empty cream.
  4. **Footer** = `LpFooter` exactly as production (already the case). Never a
     re-implementation, never a variant. In production the black footer is
     always preceded by the pricing section's black band + rainbow wave — the
     draft slammed the footer under cream ("mauvais footer"). page.tsx now
     mounts the homepage's `LpPricing` (real component, real copy) between the
     CTA card and the footer so the ending is the homepage's ending; the
     works-with row lives inside the CTA card (point 1).
  5. **Animations** must be finished-quality: no jump on loop wrap, no layout
     shift while playing, no half-visible first frame, clean restart on
     re-entry, chat typing never desyncs from its line, the carousel never
     shows a blank slot or a dead autoplay, org rows never overlap while
     retiring, the brain graph never runs past the card, every loop stops
     off-screen.
- Reviewers: judge against the draft's intent AND the homepage's execution
  quality. Flag every place the page reads "vibe-coded": uneven gaps, orphan
  elements, misaligned baselines, mixed radii in one row, an un-gated loop, a
  control under 44px, a font that is not the page's, a color that is not a
  token. Pixel-perfect is the bar.

## Grid, rhythm, breakpoints

- Artboard 1654. Section column 1136 (`.ag-sec__inner`), side gutter
  `max(32px, 50% − 568px)`; the CTA card is 1296 (its own cta.css).
- Vertical rhythm: 128 desktop / 96 tablet / 64 phone (`.ag-sec`), hairline
  `hr.ag-sep` between sections (page.tsx places them).
- Head block: kicker → 8px → H2 → 8px → lede (`.ag-sec__head` + `.ag-lede`, lede
  max 720 centered). Left-aligned variant `.ag-sec__head--left` for the 5fr/7fr
  sections (sidekick, brain).
- Breakpoints: ≥1361 artboard geometry · ≤1360 gutters 32 · ≤1024 tablet
  recompose · ≤767 phone (section inset 16, text gutter 32 via `.ag-sec__head`
  padding, cards r24). Type steps at ≤767 are in foundation.css (H2 35.559/41,
  step 27.648, sm 23.04, kicker 19.2).
- Two-column sections (sidekick, brain): `grid-template-columns: minmax(0,5fr)
  minmax(0,7fr)`, gap 64/56, `align-items: center` ≥1025; stack ≤1024 (text
  first, gap 32).

## Section specs (desktop geometry from the draft; recompose per the rules above)

### Hero — `AgHero.tsx` / `hero.css` (+ `AgHeroMascot.tsx`)
Root keeps `lp-hero` so hero.css positions the art (the homepage's poses at
every breakpoint), lifted 28px on desktop (`top: -148px`; a 40-phase WebKit
sweep found the "G" under the green band for ~1s of each loop at −120).
`.ag-hero__inner`: centered flex column, `padding: 220px 32px 56px` at ≥1025
(no min-height — the founder's dead band under the mascot was the 860 floor),
`translateZ(0)` + `will-change: transform` like `.lp-hero-inner`. Stack: H1
69.014/−2.0704 on two lines (`.ag-hero__br`) → give row (19.2, gap 18, marks
28) mt 56 → terminal mt 28 (hugs its content) → after line mt 32 → mascot
112 mt 24, in `.ag-hero__bob` (the page's idle bob 3.2s, in-view gated,
off under reduced motion). The section ends 56px under the mascot (812 at
1654). Tablet ≤1024: padding-top 34vw, gutters 48, H1 clamp(40px, 6.4vw,
62px). Phone ≤767: padding `61.44vw 32px 64px`, H1 clamp(30px, 8.846vw,
35.559px), give row wraps (marks 24px), terminal full width (wraps once
before the URL; xsm under 360), mascot 88, `min-height: 0` (the hero ends
right after the mascot — never stretched to the fold). Landscape phones
(≤1024 and ≤500 tall) get a lower art + top padding so the H1 is on the
first screen. Short desktop windows ≤639 tall: padding-top 160 + art −208.
QA: rainbow renders (WebKit runs the GL path; headless Chromium shows the
static artboard), H1 glyphs clear of ink at every phase (qa/wk-sweep.cjs in
the 2026-09-11 scratchpad), terminal above the fold at 1440×800/900.

### Super sidekick — `AgSidekick.tsx` / `sidekick.css`
5fr/7fr grid, gap 64. Left: `.ag-sec__head--left` kicker "Super sidekick" (gap 16
in the draft), H2 "Find new customers. From " + rotating word (pink-40,
`inline-grid` stack, `.rw` keyframes 6s linear infinite: 0%→4% fade/rise in,
16.5%→19.5% out; delays 0/1.2/2.4/3.6/4.8s), lede.
Right: chat card — `.ag-card` variant with `border: 1px solid var(--lp-ink-tr-10)`,
radius 24, padding `20px 28px 28px`, gap 20. Header row 13.333px ink-90, gap 10:
the rotating mark (22px, same `.rw` timing, order Claude/Codex/OpenClaw/Hermes/
Grok Bot — use `AGENT_MARKS` reordered to `SIDEKICK.headerNames`), rotating name
(600, ink-100), "· new chat". Body 15px/24px, gap 18: user bubble right-aligned
(ink-40 bg, r18, `12px 16px`, max 80%); assistant lines that TYPE (nowrap,
`width: 0 → 100%` with `steps(n)`, n = chars, durations/delays from the script);
tool chips (`inline-flex`, 13.333/18, `5px 12px 5px 8px`, r999, white bg,
`1px solid color-mix(ink-100 14%)`, mascot 16px, "Used **Pancake** · brain.read"
+ green-30 check 12px) that `riseIn` .5s; last line ends with the "See the play"
link (purple-40, underline, href `#`).
The whole script PLAYS ONCE when the card is 30 % in view (draft: IO threshold
.3), holds its final state; reduced motion → final state immediately.
≤1024: stack (head, then card full width). ≤767: card padding `16px 16px 20px`,
r24, body 14px/22px; typed lines would wrap → replace the width-typing with the
`riseIn` reveal per line (same delays) so text can wrap; bubble max 90%.
Card height must not change while it plays (reserve the final layout — e.g.
lines are `visibility` / `clip` animated in place, not inserted).

### Super knowledge — `AgKnowledge.tsx` / `knowledge.css`
Centered head; grid `repeat(4, 1fr)` gap 16, mt 56. Card: tint (`.ag-tint--*`),
r24, padding `24px 24px 20px`, column, centered, gap 14: illustration 96px tall
(`<img>` from `/lp/agents/data/<slug>.png`, `height: 96; width: auto`, loading
lazy, `alt=""`) in a `.ag-knowledge__bob` wrapper (keyframes `bob` 3.2s
ease-in-out infinite: `translateY(0) rotate(-2deg)` → `translateY(-6px)
rotate(2deg)`, per-card `animation-delay` from `KNOWLEDGE.cards[i].delay`), label
`.ag-title-sm` at 23.04px centered. All 16 cards equal height (grid stretch).
Bob runs only while the section is in view. ≤1024: 3 columns. ≤767: 2 columns,
gap 12, illustration 72px, padding `16px 12px 14px`, label 19.2px (`--lp-text-lg`,
condensed) — labels must not wrap to 3 lines at 320px.

### Superpowers — `AgSuperpowers.tsx` / `superpowers.css` (client)
Centered head, H2 with pink "download". Carousel (draft geometry): slides
1120px, gap 24, track translated so the ACTIVE slide is centered
(`translateX(calc(50% − 560px − i×1144px))`, transition `.65s
cubic-bezier(.22,1,.36,1)`), inactive slides `opacity: .45; transform: scale(.96)`
(the draft's carousel focus — keep it); section overflow hidden, full-bleed
track (the section is `padding-left/right: 0` with the head padded).
Slide = `.ag-card` grid 5fr/7fr gap 40, padding `48px 56px`, min-height 440:
left = num (`.ag-kicker` in ink-80), `.ag-title-step` title, lede; right = mock
panel (page-bg, r24, padding 24, min-height 340) with the user bubble (plum
bg, ink-20 text, `18px 18px 4px 18px`, `10px 14px`, 13.333/20, max 88%,
right-aligned) then the mock:
- 01 mini brain: port `draft-assets/slide1-mini-brain.svg` (420×220, five hubs
  from `SUPERPOWERS.slides[0].brain` with token colors, center plum node
  `pulse` 2.4s, hubs `bdrift` 7s with the draft's delays; labels 12px Geist).
- 02 chips: `.chip-pop` keyframes (4.2s ease-in-out infinite: 0/100% hidden
  `scale(.85)`, 12–80% shown), delays 0.4s × i; chip 34px tall, r17, white,
  `1px solid color-mix(ink-100 12%)`, 13.333.
- 03 domains: three white rows (r12, `1px solid` 12% ink, `10px 14px`, 13.333,
  host 600 + meta muted) `animIn` .5s forwards at 0/.6/1.2s; 4px bar
  (`--lp-ink-tr-10` track) filled to `pct` with the token tone, `warm`
  keyframe 1.6s ease-out .4s backwards; note 13.333 muted below.
- 04 workflow: rows `wfPop` .5s `cubic-bezier(.2,.9,.2,1.2)` forwards at
  .2/.8/1.1/1.7/2/2.9s; 36px round icon (tint bg + tone icon: mail / linkedin /
  reply from `draft-assets/icon-*.svg` inlined), white row (r14, hairline,
  label 600 + muted detail, uppercase 11.108/600/.4px tag on the tint), italic
  11.5px ink-70 notes indented 50px, dashed vertical line (2px dashed 18% ink,
  left 17) with the purple dot `wfDrop` 3.2s sliding down; green reply row;
  note 12.5px muted, `margin-top: auto`.
Mock animations restart each time a slide becomes active (re-mount the mock or
toggle a class), and are paused when the section is off-screen.
Controls under the track, centered, gap 16: prev/next 44px round white buttons
with hairline (`1px solid color-mix(ink-100 16%)`), chevrons; dots 8px
(active ink-100, others 20% ink). Autoplay every 11s (draft) while in view and
not reduced-motion; clicking a neighbor slide, a dot or an arrow goes there and
restarts the timer; keyboard: arrows work when a control is focused; pointer
swipe ≥40px on the track.
≤1024: scroll-snap carousel instead of the transform track — slides
`calc(100% − 48px)` wide, `scroll-snap-align: center`, no dimming, no autoplay,
dots follow the scrolled slide (scroll listener / IO), prev/next scroll the
container; slide grid stacks (text, then mock), padding 32. ≤767: slide
`calc(100% − 32px)`, padding 24, mock panel padding 16, min-heights off; chips
wrap; the workflow's dashed line + dot keep working at the narrower width.

### Super plays — `AgPlays.tsx` / `plays.css` (client)
Centered head; below (mt 56): mascot column centered (mascot 104px in a `bob`
wrapper at 1.1s — the draft's `#org .bob`), plum label (r12, `8px 14px`, 13.333,
"**Pancake**" / "runs the squad" at .75 opacity); connector — port
`draft-assets/org-connector.svg` (1136×130: three dotted curves from the label
to each column with a 5px dot travelling along each via `animateMotion`
0.8/0.95/1.1s); then `repeat(3, 1fr)` gap 24, `align-items: stretch`: column
`.ag-tint--*` r30 padding `28px 24px`, gap 12, title `.ag-title-sm` centered
(mb 8), rows = card-cream r12 `12px 16px` 14/20 with a 9px status dot
(green-30 / yellow-40 / red-30) — status colors and pools from `PLAYS`.
Simulation (draft `draft-scripts.js` "plays org chart"): every 900ms while in
view, a burst of 2–3 rows (red ones favored 60 %): green→orange or orange→red
with a `hit` pulse (scale 1.045 for .38s + a 2px pink-40/25% ring), red→retires
(`out`: fade + translateX 24px, 220ms) and comes back as a FRESH pool name at a
random position in the column, green, with `animIn`. Model it as React state
(columns → rows {id, name, status}); randomness via `Math.random` in effects only
(never during render — hydration). Reduced motion: static initial state.
≤1024: connector hidden, columns stack full width (gap 16) under the mascot;
≤767: column padding `20px 16px`, title 23.04. Column heights equal at every
width (stretch); a retiring row must not change the column height (keep it in
flow while animating).

### Super smart — `AgBrain.tsx` / `brain.css` (client)
5fr/7fr grid gap 56, left head (kicker gap 16, H2, lede). Right: `.ag-card`
padding 16, overflow hidden, holding an SVG `viewBox 0 0 860 600` (100% wide,
auto height). SSR/no-JS/reduced-motion render = the draft's static drawing
(`draft-assets/brain-static.svg`: edges 13% ink, 8 hubs r13 with labels 15px,
leaves r6 at .7, root "Pancake" r16 plum bold, gentle `bdrift` 7s per hub group)
with fonts → Geist (`font-family` attr off; CSS `font-family: var(--lp-font-sans)`
on `text`) and colors → tokens via CSS classes / `fill="var(--lp-…)"`.
When JS runs and motion is allowed: the draft's force graph (port
`draft-scripts.js` "live GTM brain" faithfully: seeded RNG 11, hubs from `BRAIN.hubs`,
400 settle steps, edges 14% ink 1.1px, hub breathing, 5 blue-40 signal dots
travelling along edges, a new leaf spawned every 2.6s up to 90 nodes with a
ripple ring, rAF loop running only while in view). Labels sit `x + r + 8`.
≤1024: stack (head, then card). ≤767: rendered labels must stay ≥ 11px — switch
the phone to a taller viewBox (e.g. 600×640, hubs on a tighter ring, font 22 in
viewBox units) or scale the node sizes/font with a `compact` prop; nothing may be
clipped by the card.

### Super addictive — `AgVersus.tsx` / `versus.css`
Centered head (kicker + H2, no lede); grid `repeat(2, 1fr)` gap 16 mt 48,
stretch. Card A `.ag-card` padding 48, gap 16: kicker "Agent alone" pink-40, four
lines in `.ag-title-step` (one `<br>` per line — keep as a list `<ul>` for
semantics with the same look). Card B: `--lp-terminal-bg` ground, `--lp-page-bg`
text, r30, kicker purple-30. ≤1024: still two columns if ≥ 768 (padding 32),
≤767: stack, padding 24, gap 12, lines 27.648px.

### CTA — `AgCta.tsx` / `cta.css` (markup exists; CSS additions only)
Reuses the homepage CTA card verbatim (cta.css). Content order: title
(`.lp-title-card`), body, terminal (`.ag-cta__term` width 460 max 100%, the
foundation `.ag-term`), pills. Set `.ag-cta .lp-cta__content { gap: 32px }` and
`.ag-cta .lp-cta__text { gap: 16px }` (draft: gap 32 / body right under the title);
the works-with row closes the card (above). Phones: the card's block insets are
176px (the homepage's 224 left >80px of bare cream over the title once the
terminal row made the card taller).
Check the slivers still reach the card's full height at 1654 (the card is
taller than the homepage's 432 because of the terminal — cta.css positions the
slivers at `top: 0` with a 432px box; if the bottom of the card shows cream
under the rainbow at 1654, add `.ag-cta .lp-cta__card { min-height: 432px }` and
report the measured card height). Phones: cta.css already rotates the slivers
into top/bottom bands and stacks the pills; the terminal wraps once.

### Works with — inside the CTA card (`AgCta.tsx` / `cta.css`)
Retired as a section (founder 2026-09-11). The row is the CTA card's last
line: label 13.333/500 subtle text, the five marks (`.ag-marks`, 28px / 24px on
phones), the dashed "any MCP client" chip (`1px dashed var(--lp-ink-50)`, r9,
`6px 12px`); gap 16, 40px under the pills (content gap 32 + 8), wraps on phones.

## QA (every section, before reporting)

Dev server: **http://localhost:3002/agents** (already running in this
worktree, hot reload). Type-check: `npx tsc --noEmit` from the worktree root.

Screenshots (headless Chromium, several widths, prints horizontal overflow and
console errors):

```
node /private/tmp/claude-501/-Users-tricomte-Documents-cowork-projects-projects-getpancake-ai/93036001-37ae-4ed9-a0b7-befeae246793/scratchpad/qa/shot.cjs \
  http://localhost:3002/agents /private/tmp/claude-501/-Users-tricomte-Documents-cowork-projects-projects-getpancake-ai/93036001-37ae-4ed9-a0b7-befeae246793/scratchpad/qa/out/<section> ".ag-<section>" 1654,1280,1024,768,402,375
```

Then LOOK at the PNGs (Read tool) next to `draft-shots/desktop-sec-NN.png` and
fix until: geometry matches the draft at 1654; every width is composed (no
overlap, no cut text, no dead space); `hOverflow 0` everywhere; no console
errors; fonts are Condensed (headings) / Geist (text) / Fono (command only) —
verify with `getComputedStyle(el).fontFamily` through the script if unsure.
Headless Chromium shows the static rainbow artboard (no GPU) — that is expected.
