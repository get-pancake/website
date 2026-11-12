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

All the copy is in `words.js`: the two titles, the two options of the switch, each badge, and the description of the picture for a screen reader. `scripts/homepage-lint.mjs` reads this file, so a banned claim fails the build.

A badge is an `icon` and a `text` of three words at most. The `icon` is a logo of `logos.js` (`posthog`, `hubspot`, `luma`, `crunchbase`, `ga`) or a plain glyph of `overlay.js` (`user`, `event`, `chart`, `up`, `jobs`). To drop a logo, replace its name with a glyph.

After a change to the words, draw the still pictures again. The next section tells you how.

## Draw the still pictures again

The section shows a still picture before the scene starts. On a phone, it shows the still, then the phone loop (next section). `LpKitchen.tsx` starts the scene at the exact moment of the still (`POSTER_TIMES` in `kitchen.js`), so the scene takes over without a jump.

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

The command writes six files in `public/lp/kitchen`. It draws one still per mode and cast, and one more of the kitchen without Pancake with no vendor mark on the tank, at the wide size.

## Draw the phone loops again

Phones do not run the 3D scene. They play a loop of it: a 36 second video drawn frame by frame from the scene, with the camera fixed and no badges, zoomed on a picture as wide as the screen. The phone stills (`*-phone.webp`) are the first frames of these loops. After a change to the scene, draw them again too. Run this command from the root of the repository:

```bash
node scripts/kitchen-phone-loops.mjs
```

It needs Playwright, as above, and `ffmpeg` with H.264 (`libx264`). With `KITCHEN_GPU=1` it draws on the graphics card, in a minute or two instead of some twenty. It writes two loops (`with-pancakes-phone.mp4`, `without-pancakes-phone.mp4`, about 1.5 MB each) and six phone stills. The top of the script says how the loop closes on itself.

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

## What it costs

One frame is about 350 draw calls and 175,000 triangles, with one shadow map of 2048 px. The numbers are the same in each mode and with each cast. They come from a headless browser that draws in software. Nobody measured the scene on a real graphics card or on a phone.
