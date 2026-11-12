# The kitchen scene

This folder is the 3D scene of the kitchen section. `LpKitchen.tsx`, one folder up, puts it on the page. The scene is plain JavaScript on three.js, with no build step of its own, so it also runs in the review page of this folder.

## How it works

Every position in the picture is a function of the time. Nothing is simulated or added up from frame to frame. For this reason, the scene can draw any moment of its loop, and a still picture is always a true frame of it.

Only two things keep a state. They are the two switches: with or without Pancake (`setMode`), and who cooks (`setCast`). Each one stores how far its change-over is.

The scene pauses when it is off screen or in a hidden tab. If the visitor asked for less motion, it draws one still frame and waits for `start()`.

## The files

- `kitchen.js`: the entry. `createPancakeKitchen(element, options)` makes the renderer, the light, the camera and the clock. `kitchen.d.ts` lists its options and its methods.
- `words.js`: every word the section shows. Change copy here and nowhere else.
- `show.js`: the animation with Pancake, and the two switches.
- `mess.js`: the animation without Pancake, and the slow tank.
- `world.js`: the set that does not move (slab, belts, bowl, griddle, pass, rail).
- `props.js`, `chef.js`, `people.js`: what moves (ingredients, pancakes, plates, tickets, flames), a pancake chef, a little chef.
- `overlay.js`: the badges. They are text of the page laid over the canvas, so they stay sharp and take the font of the page.
- `logos.js`: the third-party marks, as SVG paths. Read the note at its top.
- `layout.js`: where everything stands, and where each cast works.
- `palette.js`: the colors. They are a copy of the tokens of `app/_styles/landing-v3/foundation.css`, because WebGL cannot read a CSS variable.
- `geo.js`, `mats.js`, `textures.js`, `fx.js`, `util.js`: shapes, finishes, the few textures drawn on a canvas, effect pools, easings.
- `preview/`: the review page.

No image, model or font file is loaded. Every shape is built in code.

## Change the words

All the copy is in `words.js`: the title, the two options of the switch, each badge, and the description of the picture for a screen reader. `scripts/homepage-lint.mjs` reads this file, so a banned claim fails the build.

A badge is an `icon` and a `text` of three words at most. The `icon` is a logo of `logos.js` (`posthog`, `hubspot`, `luma`, `crunchbase`, `ga`) or a plain glyph of `overlay.js` (`user`, `event`, `chart`, `up`, `jobs`). To drop a logo, replace its name with a glyph.

After a change to the words, draw the still pictures again. The next section tells you how.

## Draw the still pictures again

The section shows a still picture before the scene starts. `LpKitchen.tsx` starts the scene at the exact moment of the still (`POSTER_TIMES` in `kitchen.js`), so the scene takes over without a jump. Since 2026-11-12 a phone starts the scene too (until then the still was all it showed). A phone's still has no badge, as the scene at that width, and both use the small shadow map (see "What it costs"). A phone also shows its own window on the kitchen, from a still angle (see "What a phone shows"), and its still is drawn the same way.

If you change the scene, its words or its logos, the stills are out of date. Run this command from the root of the repository:

```bash
node scripts/kitchen-posters.mjs
```

The command needs Playwright, which the repository does not depend on. Install it for this one use:

```bash
npm install --no-save playwright
```

```bash
npx playwright install chromium
```

The command sets the badges in the reading font of the landing page, from `app/fonts/geist`. If that font changes, change its path in `preview/index.html` and in the command.

The command writes twelve files in `public/lp/kitchen`. It draws one still per mode and cast, and one more of the kitchen without Pancake with no vendor mark on the tank. Each still has a wide size and a phone size.

## What a phone shows

On a phone (under 768 px) the whole kitchen is as wide as the page's text, and neither side is cut. The founder asked for it on 2026-11-12. `LpKitchen.tsx` gives the scene two more options there:

- `view: PHONE_VIEW`: the window the picture shows, in place of the outline of `FRAME`. It is the kitchen's outline as it is drawn, with its shadow, plus 16/358 of its width on each side. On phones `kitchen.css` makes the stage 16/358 wider than the text on each side, with the window's shape (390 x 182). So the outline lands on the page's 16 px margins at any width.
- `interactive: false`: a touch does not turn the view. The phone has no tilt, no drift and no jump of a tapped chef, so the outline stays on the margins.

`PHONE_VIEW` is in `layout.js`. It is measured on the drawn picture, in both modes and with both casts. If you change what the kitchen spans (the slab, its shadow, a station), measure it again, copy the numbers it prints into `layout.js` and `kitchen.css`, then draw the stills again:

```bash
node scripts/kitchen-phone-view.mjs
```

## Look at the scene alone

`preview/index.html` shows the scene with controls to pause it, slow it down and swap who cooks. The page loads three.js from a CDN, so it needs a network connection. Run this command from the root of the repository:

```bash
npx serve .
```

The command prints an address. Open that address in a browser, followed by `/components/sections/landing-v3/kitchen/preview/`.

The page reads these parameters from its address:

- `?t=31.5` draws that moment of the loop and stays paused.
- `?mode=without` shows the kitchen without Pancake, and `?cast=people` the little chefs.
- `?logos=0` removes the vendor marks from the tank.
- `?zoom=2&target=0.3,1,-0.4` makes a close-up, here of the griddle.
- `?speed=0.5` plays at half speed.
- `?bare=1` shows the stage alone, and `?poster=1` the exact frame of a still.
- `?phone=1` shows what a phone shows: its own window, with no tilt.

## What it costs

One frame is about 350 draw calls and 175,000 triangles, with one shadow map of 2048 px (1024 px where the picture is under 600 px wide on the page: a phone). The numbers are the same in each mode and with each cast. They come from a headless browser that draws in software. Nobody measured the scene on a real graphics card or on a phone.

Because nobody did, the page protects itself (`LpKitchen.tsx`):

- A device that cannot hold the loop gets the still back for the rest of the visit: under 12 frames a second for two windows of 2 s in a row (`onSlow` in `kitchen.js`).
- A phone gives the scene's memory back once the section is two screens away. The still is the picture again, and the scene starts again when the visitor comes back.
- A phone draws the picture at up to 3 device pixels per CSS pixel, as its still. The picture is small there: 1170 x 546 px on a 390 px phone, a sixth of what a laptop draws.
- `?lp-nogl` keeps the still, and `?lp-gl=force` skips the test of the loop (a headless browser draws about 4 frames a second and would fail it).
