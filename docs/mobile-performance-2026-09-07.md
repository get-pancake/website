# Mobile performance — September 7, 2026

Scope: improve the existing homepage's mobile loading and responsiveness without changing its copy, layout, artwork, or analytics contract. Production promotion remains manual.

## Baseline

Google PageSpeed Insights, Lighthouse 13.4.1, September 7 at 16:35 PDT:

| Live homepage | Mobile | Desktop |
| --- | ---: | ---: |
| Performance score | 31 | 96 |
| First contentful paint | 3.4 s | 0.3 s |
| Largest contentful paint | 10.8 s | 0.6 s |
| Total blocking time | 31,360 ms | 160 ms |
| Layout shift | 0 | 0 |

[Saved PageSpeed report](https://pagespeed.web.dev/analysis/https-getpancake-ai/d7ps3cfsot?form_factor=mobile).

The real-visitor, rolling 28-day mobile data is different from this synthetic test: LCP 2.1 s, INP 393 ms, CLS 0. Desktop passes with LCP 0.9 s, INP 72 ms, CLS 0. The field data includes previous releases and cannot establish the impact of these changes immediately.

Local Lighthouse runs used a production Next build and fresh Chrome profiles. Mobile results varied substantially before changes (56 and 86); desktop scored 98. These local builds exclude production-only analytics and production network/server latency, so they must not be presented as a direct replacement for the live PageSpeed score.

## Findings and changes

- **Unbounded mobile canvas fallback.** WebGL already detects unsuitable rendering environments. On phones, rejecting WebGL starts a Canvas2D fallback that previously drew six transformed bitmaps every animation frame without a performance limit. A local run with graphics acceleration disabled reproduced the failure: score 44, projected TBT 166,680 ms. Performance traces attribute the repeated expensive calls to the fallback's frame function. The fallback now draws at up to approximately 30 fps using the same animation clock. Three consecutive draws over 50 ms, or sustained poor frame delivery, restore the existing static SVG and release bitmap buffers. The stopped state cannot be restarted by resize, visibility, or audience observers during the component's lifetime. The normal WebGL renderer is unchanged.
- **Font preloads.** Aeonik and Lato no longer preload all their cuts on every route. This removes ten eager preloads; every original font face and weight remains available. The homepage's Fono and Condensed preloads remain.
- **Walkthrough JavaScript.** The GSAP runtime and step/feature timeline builders load when their cards enter view. Their server-rendered artwork remains present. Delayed imports respect current visibility, reduced-motion preference, and component cleanup.
- **Offscreen images.** Walkthrough images, testimonial avatars, and the bottleneck poster use native lazy loading and asynchronous decoding. Their source files and geometry are unchanged.
- **Video migration confirmed.** The baseline homepage audit records zero media requests. Its seven former video walkthroughs use DOM/CSS/GSAP.

## Remaining opportunities

The root layout still includes legacy component CSS that most homepage elements do not use. Moving those imports to the routes that need them is a separate cleanup requiring visual checks on those routes. This change does not reuse the old design system or alter analytics loading.

## Reproduction

Build with `npm run build`, serve with `npm run start -- -p 3100`, then use Lighthouse 13.4.1:

```sh
lighthouse http://localhost:3100 --only-categories=performance --chrome-flags='--headless=new' --output=json --output=html --save-assets --output-path=mobile
lighthouse http://localhost:3100 --only-categories=performance --preset=desktop --chrome-flags='--headless=new' --output=json --output=html --save-assets --output-path=desktop
lighthouse http://localhost:3100 --only-categories=performance --chrome-flags='--headless=new --disable-gpu' --output=json --output=html --save-assets --output-path=mobile-software
```

Run audits sequentially without a build running concurrently. The last command is a deliberate fallback stress test, not representative of every phone. Lighthouse was installed in a separate temporary npm cache; the application dependencies and lockfile were not changed.
