# /for/&lt;vertical&gt; — build rules

One static page per market at `/for/<slug>` (40 pages) plus the `/for` hub
("Industries"), built on the landing-v3 design system: same nav, pills,
marquee, CTA card, pricing and footer as the homepage — but a functional,
Origami-style hero (no homepage rainbow) with the product demo glued under it
(founder 2026-09-22). Each page is one
`VerticalConfig` (`lib/verticals/data/<slug>.ts`); everything that is the same
on every page lives in `vx-copy.ts`. Full spec: the session's
`design/DESIGN-SPEC.md` (§1 system, §2 sections, §3 hub, §4 demo, §5 schema,
§6 fixed copy, §7 validation, §8 SEO).

## Founder decisions (2026-09-22, they override the spec)

| Decision | Where |
|---|---|
| Descriptive `<title>` on /for pages (`meta.seoTitle`); the homepage, /agents and /demo keep exactly "Pancake" | `VX_TITLE_MODE = "descriptive"` (vx-copy.ts) |
| All 40 pages indexed and in the sitemap (`status: "approved"`); the draft/noindex machinery stays, unused | configs, `app/sitemap.ts`, `lib/verticals` `isApproved` |
| "Do like Origami": the `/for` hub + an **Industries** entry in the global nav (dropdown, categories as columns, "All industries"), links in the server HTML; "Industries" in the phone menu sheet | `app/for/page.tsx`, `LpNav.tsx`, `LpNavMenu.tsx`, `landing-v3/nav.css` |
| Solar = commercial & industrial solar installers (`/for/solar-companies`) | its config |
| "Not sure we should re-do the full landing each time, which is more inspirational than functional — check Origami!" → functional hero (breadcrumb, H1 = "Pancake for {plural}" badge + `hero.title`, lede, CTA pair, example-prompt rows that drive the demo), no homepage art; the demo right under it with a horizontal tab bar and the full-width app window | `VxHero`, `VxDemo`, `VxDemoPlayer`, `hero.css`, `demo.css` |

Still open (spec defaults hold, flagged to the founder): one AI SEO line in
the pricing checklist (`VX_AI_SEO_MENTION`), the truthful checklist on /for
pages only (`VX_PRICING_MODE`), Fono eyebrows (`--vx-eyebrow-font`).

## Files

| Piece | Where |
|---|---|
| Route | `app/for/[vertical]/page.tsx` — `generateStaticParams` from the registry, `dynamicParams = false` (unknown slug → 404), `generateMetadata` (title, description = lede, canonical apex URL, robots by status, og/twitter "Pancake for {plural}") |
| Hub | `app/for/page.tsx` + `VxHubGrid.tsx` |
| Registry | `lib/verticals/index.ts` (lookups, `relatedFor`, `faqItems`, `hubGroups`, `navGroups`, validation at module load) reading `lib/verticals/data/index.ts` (**generated**) |
| Schema / rules | `lib/verticals/types.ts`, `lib/verticals/validate.ts` |
| Page | `VxPage.tsx`: LpFitVars (CTA + pricing arts) → LpAnimFreeze (marquee) → LpNav → VxHero → VxDemo → LpMarquee → VxSignals → VxControl → VxFaq → VxRelated → LpCta → LpPricing → LpFooter |
| Sections | `VxHero` (breadcrumb, H1, lede, CTA pair, example-prompt rows), `VxHead` (the one section head), `VxSignals`, `VxControl`, `VxFaq`, `VxRelated`, `VxHubGrid` — server components, zero JS |
| Demo | `VxDemo.tsx` (section `#vx-demo`, visually hidden H2 = `demo.h2`) + `VxDemoPlayer.tsx` (the page's only client island: tab bar, stage, then the foot — caption, Pause / Replay, note; it also drives the hero's prompt rows), `lib/verticals/demo-model.ts`, `demo-timeline.ts`, `app/_styles/verticals/demo.css` |
| Structured data | `vx-jsonld.ts` — WebPage + BreadcrumbList (= the hero breadcrumb) + FAQPage (hub: + ItemList) |
| CSS | `app/_styles/verticals.css` (manifest, imported AFTER `landing-v3.css`) → `verticals/{foundation,hero,demo,signals,control,faq,related,hub}.css`, all under `.lp-vx` |
| Scripts | `scripts/verticals-registry.mjs`, `scripts/verticals-budget.mjs`, `scripts/verticals-audit.mjs` |

Shared-file edits are optional props whose defaults keep the homepage
byte-identical: `LpCta` (`title?`, `body?`), `LpPricing` (`checklist?`). The
nav's Industries entry is the one founder-approved change to every page.
Never edit `LpMarquee.tsx`.

## Adding or changing a vertical

1. Copy `lib/verticals/data/recruiting-agencies.ts` (the reference config) to
   `lib/verticals/data/<slug>.ts`; export `const <camelSlug>: VerticalConfig`.
2. `node scripts/verticals-registry.mjs` — regenerates the import list
   (`--check` fails when it is stale). Files that don't parse are skipped with
   a warning, so a half-written config never takes the other pages down in dev.
3. `node scripts/verticals-budget.mjs <slug>` — pixel budgets with the real
   fonts (hero title ≤2 lines at 880 / ≤3 at 672 and 326, H1 label badge on
   one line at 390 and 375, lede ≤2 lines at 640 / ≤5 at 326, prompt rows one
   line on desktop / 2 lines on phones — clamped, so a longer prompt is
   reported as "clamped" and fails beyond 3 lines —, signals H2, card titles/bodies, CTA title
   ≤464px, lead columns, why, bubble, proposal rows, message, hubLine,
   Watching chips).
4. `npx tsc --noEmit`, then load `/for/<slug>`. `validateVerticals()` logs in
   dev and **throws in production builds** (`next build` fails).
5. Bump `updated` (ISO date) whenever copy changes — it is the sitemap lastmod.

## Non-negotiables

1. **Truth.** LinkedIn-only outreach; six signals only (Keyword, Competitor,
   Influencer, Own brand, Hiring, Stack = tools named in job posts); no email,
   phones, maps, funding, job changes, website visitors; no draft mode or
   per-message approval; leads arrive each morning; $99/month flat; 3-day
   trial with a card (`lib/trial.ts`). `BANNED` in validate.ts is the gate;
   FAQ answers may negate ("No. …").
2. **Tokens only** in `app/_styles/verticals/` — lp tokens + `color-mix()`.
   The only literals allowed are custom properties in `demo.css` (the app's
   own palette, scoped to the demo). The audit greps for `#hex`/`rgb(`/`hsl(`.
3. **One text edge.** The hero column, the demo's tab bar and foot (caption / note),
   and every eyebrow, H2 and lede start at `--vx-edge` (152 at 1440 · 48
   ≤1200 · 32 ≤767). Cards and the app window break out to `--vx-card-m`
   (the 1296 grid; 16px ≤1200); card text lands back on the edge.
4. **Equal heights from first paint, no JS.** Signal cards share rows through
   a CSS subgrid (badge · title · body · Watching panel line up across the
   row); Control's two cards stretch; hub cards stretch per row.
5. **Labels.** Page labels are the kit badge (`.vx-badge[data-tone]`: flat
   tint, same-colour border, caps 600, squircle, no shadow, never rotated).
   Labels inside product mocks are app chips. Never mix on one surface.
6. **Type.** Headlines Aeonik Condensed 600 (`.lp-display` / explicit
   `font-family`), everything else Geist; Fono for eyebrows only. The kit's
   universal `* { font-family }` beats inheritance: set the font on the
   element (the hero H1 spans use `font: inherit`).
7. **Specificity.** Write `.lp-vx .x` (0,2,0) — the kit's `.lp p`/`.lp img`/
   `.lp button` resets are 0,1,1.
8. **Copy.** Capital-P Pancake; CTA pair "Start free" (`app_*`) then "Book a
   demo" (`/demo`, `call_*`); no new analytics ids; left-justified copy; no
   `<br>` in headings (the H1 is the label badge + an sr-only ": " + the
   title, so its text reads "Pancake for {plural}: {hero.title}");
   `vx-copy.ts` never names a vertical (validator lint); never echo Origami's
   "…, not a stale database." lede tagline or a variant ("not a bought list",
   "not a bar directory": `ORIGAMI_TAGLINE` in validate.ts, an error).
9. **Phones recompose, never zoom.** ≥44px taps (breadcrumb links padded,
   FAQ summaries 56–64px, related rows 72px, hub cards ≥96px), no horizontal
   overflow 320–1654.

## Deviations from the spec (and why)

| Spec | Built | Why |
|---|---|---|
| Signal cards: fixed 2-line title slot + 2-row chip area | CSS subgrid rows | Two recruiting panels need 3 chip rows at 200px; subgrid lines every part up for any content |
| Signals 4 columns ≥1025 | 4 columns ≥1201, 2 × 2 at 768–1200 | At 1025–1200 four cards run 172–216px wide (3-line titles, 6-line bodies) |
| Control text card: facts pinned to the bottom (LpSteps spacer) | three equal bands with hairlines, content centred in each | The H2 moved to the section head, so nothing sat above the spacer: a ~150px empty band at 1440 |
| Control dialog values on 1 line, ellipsis on "Messages" | values wrap (`text-wrap: pretty`) | At the 400px stage "First action", "Objective" and "Messages" need 2 lines; truncating hid "in your Brain voice" |
| DOM ≤1,400 in `<main>` | nav Industries panel counted apart | the founder's site-wide nav addition grows with the registry (~160 elements at 40 pages) |
| Budget: Watching chips ≤2 rows | warn at 3, fail at 4 | see subgrid above |
| Demo ≤650 elements in `.vx-demo__card` | same budget, three savings (integration pass, 40 configs: 606–645) | the finished configs put 30 of 40 pages at 651–675. (1) Signal-card views that are identical across prompts share one element: `data-p` lists every prompt a variant covers (`"12"`), and demo.css hides a variant whose list lacks the current prompt. (2) The proposal row's kind chip is `li::before` (`data-kind` + `data-label`). (3) The lead sheet's property grid is shared; only company and seniority sit in variants. Pixel-identical before/after at 1440 and 390, all 12 frames, 3 pages |

## Hero + demo (2026-09-22 redesign)

- **Hero** (`VxHero`, `hero.css`): breadcrumb `Home › Industries › {name.title}`
  (Geist 14, 44px tap boxes, the current page ellipsed on narrow phones);
  `<h1>` = kit badge `VX_HERO.label` ("Pancake for {plural}", = og:title; the
  kit size, neutral `brand` tone — pink read as the Competitor badge; tracking
  0.1px ≤389 so the longest plural stays one line at 375) +
  `hero.title` (Condensed 600, 57.336 / 47.784 ≤1024 / 30–35.559 phones,
  max 880, balanced); lede (Geist 19.2/28.8, subtle, max 640; = meta
  description); the CTA pair (`app_hero`, `call_hero`); "Example prompts" +
  the three `demo.prompts` as rows. Rows are one grid on a subgrid (badge
  column = the widest badge, equal badge widths, texts and arrows aligned;
  the arrow points DOWN — the row plays the demo below, it never leaves the
  page); phones set the badge inline before the prompt in a 2-line clamp box
  (`.vx-hp__body`, `display: contents` on desktop) — the full prompt stays in
  the HTML and is typed in full in the demo. Rhythm at 1440×900: the tab bar
  768–825, the app window from 841 (~60px of it above the fold). Short
  windows — measured as real browser windows (a 1440×900 MacBook's Chrome
  window is ~790 tall) — tighten every gap in one tier (≥1000 wide: 760–859
  tall; 768–999: 780–879, +16px hero padding under 780) so the fold never
  cuts through the tab bar: 1440×790 → bar ends 733, 1024×768 → 713; under
  the tier the regular layout puts the whole bar below the fold. Swept over
  all 40 pages × window heights 600–1100.
- **Prompt rows** are server-rendered `<a href="#vx-demo" data-vx-prompt="i">`
  (crawlable, no-JS = a jump to the demo). The island listens on `document`:
  a plain click selects the prompt, scrolls `#vx-demo` in — centred in the
  viewport under the sticky phone nav (64), so on a 900-tall desktop the band
  lands ~110 down; a band taller than the viewport starts under the nav
  (no-JS jump: `scroll-margin-top` 64 on phones, 104 under `scripting: none`
  where the nav never compacts, and the nav gets a ground) —, unpauses, and plays the Brief
  tab from t = 0 even under the pointer (`oneShot`), then autoplay carries on
  with its usual holds; keyboard activation moves focus to the stage. The row
  the demo shows carries `data-active` + `aria-current="true"` (server HTML:
  prompt 0) — an ink 1.5px ring, the others untouched. Reduced motion: the
  Brief tab's final frame. QA hook: `__vx.pick(i)`.
- **Demo** (`VxDemo`, `VxDemoPlayer`, `demo.css`): no visible section head; a
  full-bleed card-cream band between two hairlines; four equal tabs on the
  text column — only the active tab draws an underline (no track under the
  others) and a pink step number: a full ink bar, or once the clock has run
  on that view the dwell's progress over a faint full-width track (paused
  progress stays); the app window 16px under the bar on the 1296 grid; the
  foot under the window: the active step's one-line caption (four stacked
  cells, fixed height) and the note stacked left, Pause / Replay right
  (phones: caption full width, note + buttons under it). Stage container
  queries: ≥940 the lead sheet sits beside the table (940–1099 drops the
  rail to make room), ≥1100 the chat column is 340; <940 the sheet floats
  over the table and the columns it would cut step out, and Slack shows a
  third post (the channel is taller than two there); 560–939 the journey
  stacks and folds the three message steps into one row (as phones do). The
  campaign card fills the window; on phones the chat thread sits on the
  composer and the Slack posts drop their "Open in Pancake" line.
- **Autoplay holds** (`VxDemoPlayer`): the demo never parks on an empty frame.
  It arms (Brief from t = 0) unless more than 160px of the window shows when
  it approaches; the FIRST start also waits for the Brief composer to be on
  screen (any click opens that gate); ≥35% of the card visible to run. Hover =
  a real mouse MOVE over the window (not the tab bar or the foot, not a pointer
  the page scrolled under); a prompt row, Replay or Play clears it; a tab that
  ends under a hover / keyboard hold keeps its final frame and moves on when
  the hold ends.
- The composer's long line slides with a transform (no layout shift while
  typing). The Related section's eyebrow is "Industries" (the breadcrumb
  left it). `name.badge` is no longer rendered (kept in the schema).

## QA

- `npx tsc --noEmit` (never `npm run build`/`dev` in the shared worktree).
- `node scripts/verticals-budget.mjs` — 0 failures before a PR.
- `node scripts/verticals-audit.mjs` after `next build` (or `--base
  http://localhost:3007`): shingles ≤50% between every pair, JSON-LD parity,
  banned lints on the rendered text, DOM budgets, CSS literals, routes/404/
  sitemap, no config data in client chunks.
- Screens at 1440 and 390, overflow = 0 at 320/375/768/1024/1180/1280/1654;
  homepage HTML diff = nav only.
- Demo: `__vx.final(prompt, tab)` over the 12 frames — `.vx-demo__card`
  height constant at every width; `__vx.pick(i)` = a hero row without the
  scroll; `__vx.state()` also reports `gate`, `ran`, `hover`. Fold: the tab
  bar never cut by the fold at real window heights (1440×790, 1280×800,
  1024×768 visible; 1280×710, 1024×700 entirely below).
