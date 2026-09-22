# /for/&lt;vertical&gt; — build rules

One static page per market at `/for/<slug>` (40 pages) plus the `/for` hub
("Industries"), built on the landing-v3 design system: same nav, rainbow hero,
pills, marquee, CTA card, pricing and footer as the homepage. Each page is one
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
| Page | `VxPage.tsx`: LpFitVars → LpAnimFreeze → LpNav → VxHero → VxDemo → LpMarquee → VxSignals → VxControl → VxFaq → VxRelated → LpCta → LpPricing → LpFooter |
| Sections | `VxHero`, `VxHead` (the one section head), `VxSignals`, `VxControl`, `VxFaq`, `VxRelated`, `VxHubGrid` — server components, zero JS |
| Demo | `VxDemo.tsx` + `VxDemoPlayer.tsx` (the page's only client island), `lib/verticals/demo-model.ts`, `demo-timeline.ts`, `app/_styles/verticals/demo.css` |
| Structured data | `vx-jsonld.ts` — WebPage + BreadcrumbList + FAQPage (hub: + ItemList) |
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
   fonts (H1 lines ≤643px, badge ≤288px, lede ≤3 lines at 368, prompts,
   H2s, card titles/bodies, CTA title ≤464px, lead columns, why, bubble,
   proposal rows, message, hubLine, Watching chips).
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
3. **One text edge.** Every eyebrow, H2 and lede starts at `--vx-edge` = the
   hero H1's left edge (152 at 1440 · 48 ≤1200 · 32 ≤767). Cards may break out
   to `--vx-card-m` (16px) on phones; card text lands back on 32.
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
   `<br>` in headings (the H1 is two spans + a space, so its text reads
   "{line1} {line2}"); `vx-copy.ts` never names a vertical (validator lint).
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

## QA

- `npx tsc --noEmit` (never `npm run build`/`dev` in the shared worktree).
- `node scripts/verticals-budget.mjs` — 0 failures before a PR.
- `node scripts/verticals-audit.mjs` after `next build` (or `--base
  http://localhost:3007`): shingles ≤50% between every pair, JSON-LD parity,
  banned lints on the rendered text, DOM budgets, CSS literals, routes/404/
  sitemap, no config data in client chunks.
- Screens at 1440 and 390, overflow = 0 at 320/375/768/1024/1180/1280/1654;
  homepage HTML diff = nav only.
