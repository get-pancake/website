# Pancake Kitchen (prototype)

A small 3D kitchen that runs by itself, made for the landing page. Ingredients ride in on three belts, three pancake chefs mix, flip and plate, the order tickets are ticked off one by one, and stacks of pancakes leave on the last belt.

This is a first pass. Nothing in `app/` or `components/` imports it, and it adds no dependency to `package.json`.

## Run it

Serve this folder with any static server, then open `index.html`:

```bash
npx serve _prototypes/kitchen
```

three.js (0.170.0) loads from a CDN through the import map in `index.html`, so the page needs a network connection.

## How to read the scene

- **Three belts, on the left**: your sources. Ingredients come in all day and fall into one bowl.
- **Tickets on the rail**: your Plays. A ticket is printed, waits its turn, fills as its order cooks, and is stamped when the plate leaves.
- **Three chefs**: Pancake at work. They are the Pancake mark in 3D (three pancakes, two plum eyes), with a toque and gloves. One mixes, one flips, one plates.
- **Plates on the way out**: leads, served. The counter adds one for each plate that leaves.
- A ticket, the ring around its three pancakes and its topping share one tone (yellow, purple or pink, the three tones of the landing page), so an order can be followed from the rail to the plate.

## Files

- `index.html`: the preview page (the scene, play and speed controls, the reading key).
- `poster.webp`: one still frame with a transparent background, shown until the scene starts, and where WebGL is missing.
- `src/kitchen.js`: `createPancakeKitchen(element, options)`. The renderer, the light, the camera, the clock.
- `src/show.js`: the animation. Every position is a pure function of the time, so the loop can be drawn at any moment.
- `src/world.js`: the set that does not move (slab, belts, bowl, griddle, pass, rail).
- `src/props.js`, `src/chef.js`: the things that move (ingredients, pancakes, plates, tickets, chefs).
- `src/layout.js`: where everything stands. `src/palette.js`: the brand colors, copied from `app/_styles/landing-v3/foundation.css`.
- `src/geo.js`, `src/mats.js`, `src/textures.js`, `src/util.js`: shapes, finishes, the few canvas textures, easings.
- `src/preview.js`: the logic of the preview page only.

No image, model or font file is loaded: every shape is built in code and every texture is drawn on a canvas.

## Use it

```js
import { createPancakeKitchen } from "./src/kitchen.js";

const kitchen = createPancakeKitchen(document.getElementById("kitchen"));
kitchen.stop();
kitchen.start();
kitchen.setSpeed(0.5);
kitchen.seek(31.5); // draw the loop at 31.5 s
kitchen.replay(); // play the opening again
kitchen.dispose();
```

The element sets the size: the canvas fills it, and the camera frames the whole kitchen at any aspect ratio (it was composed for 16:9).

Options: `autoplay` (true), `interactive` (true: the pointer tilts the view, the chefs watch it, a click on a chef makes it jump), `azimuth` (14), `elevation` (43), `zoom` (1), `target` (`[x, y, z]`, for a close-up), `shadows` (`"vsm"`, `"pcf"` or `"none"`), `maxPixelRatio` (2), `time` (0).

What it already does by itself:

- It pauses when it is off screen or in a hidden tab.
- With `prefers-reduced-motion`, it draws one still frame and waits for `start()`.
- Its canvas is transparent, so it sits on any background of the page.

The preview page reads a few URL parameters, useful for screenshots: `?t=31.5` (draw that moment and stay paused), `?speed=0.5`, `?az=14&el=43&zoom=2&target=0.3,1,-0.4`, `?bare=1` (the stage alone).

## To put it on the landing page

- Add `three` to `package.json`. It is about 170 kB gzipped, so load it only for this section: a client component that imports `kitchen.js` dynamically when the section comes near the screen. The kitchen's own code is about 20 kB gzipped.
- Show `poster.webp` first, and keep it where the scene cannot start.
- Call `dispose()` when the component unmounts.
- On a phone the whole kitchen is small. Either zoom on the griddle (`zoom` and `target`), or show the poster.
- Port the files to TypeScript at that point. They are plain ES modules with no build step so the prototype stays easy to change.

## Cost

About 330 draw calls and 170,000 triangles per frame, with one 2048 px shadow map. Measured in a headless browser, not on a phone: test it on a mid-range phone before it ships.
