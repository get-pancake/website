# Pancake Brain landing

This independently deployed Next.js app reuses the current website's v3 fonts,
styles, rainbow artwork, buttons, and step components. Its canonical address is
`https://brain.getpancake.ai/`. The main website's routes and deployment remain
separate.

## Local development and validation

From the repository root, install the existing root dependencies with `npm ci`.
Then run these commands from `apps/brain`:

```sh
npm run dev
npm run typecheck
npm test
npm run build
```

The local page runs on port 3017. Tests use Node's native TypeScript support;
use Node 24 for the same runtime as local validation. The build copies the
versioned artwork from `public/lp`, the share image, and the favicon into this
app's ignored public output. Fonts are imported directly from `app/fonts` at
the repository root. No asset download is needed.

## Vercel project settings

Current project: **pancake-brain** in the **getpancake** team,
`prj_e9TBwJXKfPU2FFqn7nSuaTmBw1MR`.
Reviewed preview: https://pancake-brain-p5prpgg5z-getpancake.vercel.app/.
The ready build uses a direct upload of committed source, with explicit target
`staging`. Git source retrieval failed for the new project, so no automatic Git
deployment connection was enabled. Avoid relying on an omitted target for a
new project's first deployment: Vercel classified that attempted build as
Production; it failed before building or routing any traffic.

Create a **separate** Vercel project using this repository. Set its **Root
Directory** to `apps/brain` and enable **Include source files outside of the
Root Directory in the Build Step**. Use Node 24. `vercel.json` supplies the
Next.js framework, build command, output directory, and install command.

The install command deliberately runs `npm ci --prefix ../..`: shared source
files at the repository root must resolve React and GSAP from the root
`node_modules`. Installing only inside `apps/brain` is insufficient. The root
lockfile is authoritative for this deployment; update the app dependency list
alongside any future root dependency change that affects shared components.

Keep the new project's Git deployments on the feature branch as previews while
review is underway. Do not assign `brain.getpancake.ai`, alter the existing
website's project settings, or move production traffic as part of preview
creation.

## Authentication and attribution

Auth requests go directly to `https://app.getpancake.ai` with credentials. Email
uses the existing captcha and magic-link endpoints. Google uses the existing
nonce and Google ID token endpoints. There is no proxy or alternate backend.

By default, signup works only when both conditions hold:

- The deployment was built with Vercel's `production` environment.
- The browser origin is exactly `https://brain.getpancake.ai`.

Local and preview pages show a signup preview with requests disabled.
`NEXT_PUBLIC_BRAIN_AUTH_ALLOWED_ORIGINS` can allow specific comma-separated
origins for a controlled test. The backend CORS list, Google OAuth authorized
origins, and reCAPTCHA domain configuration must independently permit each
origin. This variable does not override those services. The default public
Google client ID can be overridden with `NEXT_PUBLIC_BRAIN_GOOGLE_CLIENT_ID`.
Do not manually override `NEXT_PUBLIC_BRAIN_DEPLOYMENT_ENV`; the Next.js
configuration derives it from Vercel.

The synchronous attribution artifact captures inbound UTMs and `click_id`
before signup. On the canonical hostname it writes the shared
`.getpancake.ai` cookie; previews on `vercel.app` cannot reproduce that
parent-domain handoff. Successful mock tests prove the request and cookie
contracts, not real account creation or delivery of affiliate conversions.
The backend owns conversion delivery. See
[the pinned artifact and integration notes](docs/attribution-source.md).

LeadJourney loads only on a Production build at the exact canonical Brain
hostname. No main-site GTM or other vendor tags are introduced here.

## Manual production cutover

Production promotion and DNS changes remain Tristan's manual step after review.

1. Record the approved preview URL and commit, and verify desktop/mobile layout,
   form error states, artwork, links, and the attribution contract tests.
2. Prepare a **new build of that revision in Vercel's Production environment**.
   Promoting a Preview-built artifact alone is insufficient: auth, vendor
   loading, and indexing gates are compiled at build time and would retain
   their Preview settings.
3. Coordinate the Brain DNS change with the infrastructure owner. The existing
   provider-owned record is maintained in `brain-lovable.tf`; update that
   Terraform configuration as part of the cutover so a future apply cannot
   restore the old target. Preserve the current target for rollback. This
   repository does not change that file or its managed DNS.
4. Associate `brain.getpancake.ai` with the new project and apply only the DNS
   value supplied by Vercel for this project. Verify certificate readiness and
   the canonical hostname before treating the migration as complete.
5. On the canonical Production build, perform an authorized signup check for
   email and Google, verify the shared attribution cookie reaches the app, and
   confirm expected backend conversion routing with the engineer. Keep the
   existing provider deployment available until these checks pass.

If cutover fails, restore the recorded DNS target and matching Terraform state.
No automatic production deployment or DNS mutation is included in this app.
