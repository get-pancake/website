# Landing draft — "Give your AI agent GTM superpowers"

Agent-first landing page draft (audience: people who already run Claude Code, Codex,
OpenClaw, Hermes or Grok Bot and want their agent to do GTM). It is a standalone
static page built on the live site's landing-v3 design system, not a Next.js route.

- Public draft: https://pancake-landing-draft.vercel.app (Vercel project `pancake-landing-draft`, team `getpancake`)
- Design canvas (artboards, editable): https://claude.ai/code/artifact/e62e6351-8c70-446a-8105-d743dcae5f3f

## Layout

- `build/build-v3.mjs` — generates the artboards (`Main.dc.html`, `MainMobile.dc.html`,
  `FullPage.dc.html`) for the design canvas. All markup, copy and CSS live here.
  Fonts are read from `app/fonts/` in this repo and inlined; SVG logos from `public/lp/`.
- `build/build-site.py` — turns `FullPage.dc.html` into `site/index.html`: page shell,
  meta/OG tags, external WOFF2 fonts, avatar files, and all runtime JS (canvas rainbow,
  chat playback, carousel, org chart, brain graph). It also checks tag nesting.
- `build/avatars/` — Pancake monster costumes (from the marketplace repo), used as
  data-type illustrations. `build/agents.html` — the five agent marks. `build/rings.json`
  — the six rainbow ring paths (from LpPancakes.tsx). `build/canvas.json` — artboard layout.
- `build/artboards-legacy/` — earlier explorations kept on page 2 of the canvas (static).
- `site/` — the deployable static site (committed as built).

## Build

```bash
node landing-draft/build/build-v3.mjs && python3 landing-draft/build/build-site.py
```

## Deploy

```bash
cd landing-draft/site && npx vercel link --project pancake-landing-draft --scope getpancake --yes && npx vercel deploy --prod --yes --scope getpancake
```

The Slack/X preview image is `site/og-v2.png` (1200×630). Rename it when you change it,
Slack caches by URL.

## Reseeding the design canvas

Run `/design` in Claude Code (Claude Design canvas skill) and seed with the three
generated artboards plus `artboards-legacy/*`, `canvas.json` and `pancake-monster.png`,
then publish to the artifact URL above.

## Notes

- Copy and messaging findings from the 2026-09-11 critique are deliberately untouched
  (separate workstream): hero definition line, connection mechanics (MCP/OAuth), proof,
  provider names, demo data, repeated claims, headline claims, section order, install.md
  agent coverage.
- `<meta name="robots" content="noindex">` stays until this replaces the homepage.
- Fonts are the TRIAL Aeonik files, same as the live site; resolve the license before launch.
- The page is 128 KB of HTML + 55 KB of WOFF2 + 16 avatar PNGs; fonts and avatars are
  cached for a year (see `site/vercel.json`).
