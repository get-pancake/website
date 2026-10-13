# Pancake Landing — Agent Project Rules

This file is the cross-tool agent context for the Pancake landing rebuild. Read before every task.

## Mission

Two phases. Nothing else matters until they ship.

1. **Extract the Figma design system** — fonts, logos, colors, spacing, type scale, radii, shadows, components. PERFECTLY matching. Source: the design system page in the `Pancake-Design` Figma file.
2. **Recode the v3 landing pages** using only the extracted design system. Match Figma 1:1.

Refinements (copy, perf, polish) come later. Don't pre-optimize.

---

## Routes (paths stay the same)

- `/`
- `/pricing`
- `/build-in-public`
- `/signup` — visual refresh only, form/submit logic untouched

---

## Stack (confirmed in Phase 1 Stage A)

- **Next.js** `14.2.18` on Vercel (per `package.json`); **App Router** (`app/` present; no `pages/` router directory).
- **Tailwind CSS** `^3.4.15` with `tailwind.config.ts` and PostCSS (`postcss.config.mjs`); **not** v4 (no `@import "tailwindcss"` / `@theme` pipeline).
- **TypeScript** `^5.6.3` with `tsconfig.json` (`strict`, path alias `@/*` → repo root).
- **Package manager:** **npm** (`package-lock.json` at repo root; no `pnpm-lock.yaml` / `yarn.lock` / `bun.lockb`).
- **GSAP:** `gsap` + `@gsap/react` installed; import from `@/lib/gsap` only (see `lib/gsap.ts`).
- **Analytics:** production **Google Tag Manager** container `GTM-P3Z79WKD`; direct Meta bootstrap/PageView remains in `app/layout.tsx`, while GA4, LinkedIn, X, and future Reddit tags are GTM-owned. The v2 migration was explicitly authorized by Tristan in August 2026. Do not add direct LinkedIn/Reddit/X copies or publish a GTM draft automatically.

---

## Hard rules

### Confirmed product facts — the credit plan, October 13, 2026

Source: pancake-cmo PR #1220 (ADR 0078, `packages/backend/billing/src/domain/package-catalog.ts`). The numbers live in `lib/pricing.ts` and `lib/trial.ts`; never retype them in copy.

- **One plan, five levels of monthly credits**: 60,000 for $99, 120,000 for $189, 240,000 for $359, 480,000 for $679, 960,000 for $1,299, per workspace, billed monthly. Every level is the same product. Say "from $99 a month", never "flat", "no tiers" or "everything included".
- **Credits pay for two things**: the research a search does, and each work email found (50 credits). Building and testing Plays, messages, replies and teammates use no credits. Never write "as many leads as you want" or "unlimited leads": a search uses credits.
- **Never a dollar value for a credit.** Leads per credit is an ESTIMATE only: always "about", always the range built from `CREDITS_PER_LEAD` in `lib/pricing.ts` ("about 120 to 600 leads a month" on 60,000 credits), never a figure retyped by hand and never a promise. Those two numbers are planning figures from pancake-cmo ADR 0078, to be replaced by the measured range when engineering has it. Add that a narrow audience costs more and that the app shows the real estimate before a search runs.
- **A pricing page says what the buyer gets** (leads, messages, replies, customers' own results), then what a level gets them. It does not explain how credits work beyond one line (founder, 2026-10-13: "you're being soooo conceptual and answering things no one asks").
- Unused credits roll over, up to one month of credits. Out of credits, searches pause: no overage and no automatic top-up. Still no "spend cap" wording (founder, 2026-09-19).
- One sending account is in the plan; each extra one is $39 a month. Teammates are free and unlimited.
- The free trial lasts **7 days** and comes with **15,000 credits**, the same at every level.
- Visitors can **begin signup without a credit card**. A **credit card is required to start** the trial (confirmed September 18, 2026, unchanged).
- The homepage pricing card names the trial as "15,000 free credits, valid for 7 days" (`TRIAL_OFFER`), without a card caption. Explain the card requirement on Support and Pricing.
- Pricing bullets say what the buyer gets, not how the plan is built (founder, 2026-10-13).
- Multi-website limits and Gmail signup eligibility are not yet confirmed. Do not infer them from the paid plan.

### AI SEO retired — September 30, 2026

- **AI SEO is retired** (2026-09-30, pancake-cmo PR #1037): never present SEO articles, AI search visibility, Google/ChatGPT rankings or citations as something Pancake does.
- **Plays are the core product.** The site description lives once, in `lib/copy.ts` `SITE_DESCRIPTION` (hero lede + every meta/JSON-LD copy). Change it only with Tristan's sign-off.
- SEO as a topic (a blog post, SEO agencies as an industry, a competitor's SEO product) is fine.

### Project constraints

- **Match Figma exactly.** Spacing, type, color, radius — pixel-perfect. Use the design system page as source of truth, never invent values.
- **Never reference values, styles, or assets from the old design system.** If you find a trace of the old system in the codebase (old hex values, old Tailwind classes, old component files, old fonts, old logos), flag it — do not use it. Phase 1 strips them before any new design work begins. The only design source of truth from Phase 2 onward is the Figma v3 design system.
- **Analytics changes require explicit scope.** The authorized v2 contract uses one vendor-neutral `page_view` plus allowlisted waitlist/scheduler events; GTM maps them to GA4 and paid platforms. Keep vendor tags production-only, never put form values or arbitrary query strings in analytics, and never treat CTA/scheduler clicks as primary conversions.
- **Design tokens are sacred.** No hardcoded hex, px, or font weights in components. Always reference `tokens.css` / `@theme` block.
- **Copy comes from Figma verbatim.** Don't rewrite, don't improve, don't add.
- **One phase = one branch + one PR.** No compound changes.
- **No auto-deploy to prod.** Preview deploys only. Tristan promotes to prod manually.
- **Don't touch `/signup` form/submit logic.** Visual refresh only.
- **Don't install packages without flagging first.**
- **If Figma is ambiguous, ask Tristan. Don't guess.**

---

## Communication

Tristan is non-technical. Explain plainly. Lead with preview links over screenshots over prose. Don't dump stack traces — walk through fixes step by step.

---

## Files maintained

- `AGENTS.md` — this file
- `BUILD_SEQUENCE.md` — phase plan with paste-ready prompts
- `AUDIT.md` — output of Phase 1 Stage A (KEEP / DECOMMISSION / REPLACE inventory)
- `tokens.css` / `@theme` block — generated in Phase 2 from Figma
- `PROGRESS.md` — running checklist, created in Phase 1
