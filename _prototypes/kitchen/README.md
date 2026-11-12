# Pancake Kitchen (prototype)

A small 3D kitchen that runs by itself, made for the landing page. Signals from your tools ride in as ingredients on three belts, three chefs mix, flip and plate, the order tickets are ticked off one by one, and stacks of pancakes leave on the last belt as new leads.

Two switches change it while it runs: with or without Pancake, and who cooks.

This is a second pass. Nothing in `app/` or `components/` imports it, and it adds no dependency to `package.json`.

## Run it

Serve this folder with any static server, then open `index.html`:

```bash
npx serve _prototypes/kitchen
```

three.js (0.170.0) loads from a CDN through the import map in `index.html`, so the page needs a network connection.

## How to read the scene

With Pancake:

- **Badges over the tunnels**: the signals that come in. Each one names a tool and what happened ("New sign-up", "Series B raised", "Pricing page visit"), drops into its tunnel, and comes out as an ingredient.
- **Three belts, on the left**: your sources. The ingredients fall into one bowl.
- **Tickets on the rail**: your Plays. A ticket is printed, waits its turn, fills as its order cooks, and is stamped when the plate leaves.
- **Three chefs**: Pancake at work. One mixes, one flips, one plates.
- **Plates on the way out**: leads, served. The counter adds one for each plate, and a badge says what the plate became ("New lead to contact", "Next best Play", "Message drafted").
- A ticket, the ring around its three pancakes, its topping and its badge share one tone (yellow, purple or pink, the three tones of the landing page), so an order can be followed from the rail to the way out.

Without Pancake, the same kitchen goes to pieces:

- One belt has been down for days, another gives way every few seconds, and what they carried ends up on the floor.
- The bowl is replaced by one big slow tank that carries the Snowflake and BigQuery marks. Its bar crawls, then starts again from nothing ("Rebuilding the tables…"). The pipe out of it leaks.
- Batter comes out a drop at a time. One pancake forms, nobody flips it, it burns and catches fire.
- The chefs stop cooking: one mends, one puts fires out, one runs.
- Every ticket on the rail is late, the printer keeps printing and the new ones fall on the floor.
- One burnt plate leaves every twelve seconds. The badge on the way out says "Lead arrives 2 weeks late" or "Signals: 2 weeks old".

The two casts:

- **Pancake chefs**: the Pancake mark in 3D (three pancakes, two plum eyes), with a toque and gloves. They carry their face on top, so they stand in front of the counters.
- **Little chefs**: toy figures in the same finish, with an apron in one of the three tones. They carry their face in front, so they stand behind the counters and face us.

## Files

- `index.html`: the preview page (the scene, the two switches, play and speed controls, the reading key).
- `poster.webp`: one still frame with a transparent background, shown until the scene starts, and where WebGL is missing.
- `src/kitchen.js`: `createPancakeKitchen(element, options)`. The renderer, the light, the camera, the clock.
- `src/show.js`: the animation with Pancake. Every position is a pure function of the time, so the loop can be drawn at any moment. Only the two switches hold state (how far each change-over has gone).
- `src/mess.js`: the animation without Pancake, and the tank.
- `src/world.js`: the set that does not move (slab, belts, bowl, griddle, pass, rail).
- `src/props.js`: ingredients, pancakes, plates, tickets, flames. `src/chef.js`: a pancake chef. `src/people.js`: a little chef.
- `src/overlay.js`: the badges. They are text of the page laid over the canvas, so they stay sharp and take the page's font.
- `src/logos.js`: the third-party marks, as SVG paths.
- `src/layout.js`: where everything stands, where each cast works, and the words of the badges. `src/palette.js`: the brand colors, copied from `app/_styles/landing-v3/foundation.css`.
- `src/geo.js`, `src/mats.js`, `src/textures.js`, `src/fx.js`, `src/util.js`: shapes, finishes, the few canvas textures, effect pools, easings.
- `src/preview.js`: the logic of the preview page only.

No image, model or font file is loaded: every shape is built in code and every texture is drawn on a canvas.

## The logos

`src/logos.js` holds seven marks: PostHog, Google Analytics, HubSpot, Crunchbase and Luma on the badges, Snowflake and Google BigQuery on the tank. PostHog, Google Analytics and HubSpot are the files of `public/integrations`. Crunchbase, Snowflake and Google BigQuery come from Simple Icons (CC0). Luma is the mark on luma.com.

Two things to settle before this ships:

- They are trademarks of their owners. Check each brand's guidelines.
- The tank shows two vendors as the slow way. The vision page's own rule is that no vendor is named for comparison (`lp-vision-data.ts` on `feat/revenue-data-warehouse`). To follow it, remove the two `logoPlate` calls in `src/mess.js`: the tank reads as a warehouse without them.

## Use it

```js
import { createPancakeKitchen } from "./src/kitchen.js";

const kitchen = createPancakeKitchen(document.getElementById("kitchen"));
kitchen.setMode("without"); // the kitchen without Pancake; "with" to come back
kitchen.setCast("people"); // little chefs; "pancakes" to come back
kitchen.stop();
kitchen.start();
kitchen.setSpeed(0.5);
kitchen.seek(31.5); // draw the loop at 31.5 s
kitchen.replay(); // play the opening again
kitchen.dispose();
```

The element sets the size: the canvas fills it, and the camera frames the whole kitchen at any aspect ratio (it was composed for 16:9). The element gets `position: relative` if it has none, for the badges.

Options: `mode` (`"with"`), `cast` (`"pancakes"`), `badges` (true), `autoplay` (true), `interactive` (true: the pointer tilts the view, the chefs watch it, a click on a chef makes it jump), `azimuth` (14), `elevation` (43), `zoom` (1), `target` (`[x, y, z]`, for a close-up), `shadows` (`"vsm"`, `"pcf"` or `"none"`), `maxPixelRatio` (2), `time` (0).

What it already does by itself:

- It pauses when it is off screen or in a hidden tab.
- With `prefers-reduced-motion`, it draws one still frame and waits for `start()`.
- Its canvas is transparent, so it sits on any background of the page.
- The badges hide when the scene is narrower than 460 px, where they could not be read.
- The canvas's description for screen readers follows the mode.

The preview page reads a few URL parameters, useful for screenshots: `?t=31.5` (draw that moment and stay paused), `?mode=without`, `?cast=people`, `?speed=0.5`, `?az=14&el=43&zoom=2&target=0.3,1,-0.4`, `?bare=1` (the stage alone).

## To put it on the landing page

- Add `three` to `package.json`. It is about 170 kB gzipped, so load it only for this section: a client component that imports `kitchen.js` dynamically when the section comes near the screen. The kitchen's own code is about 37 kB gzipped.
- Show `poster.webp` first, and keep it where the scene cannot start.
- Call `dispose()` when the component unmounts.
- On a phone the whole kitchen is small and the badges are hidden. Either zoom on the griddle (`zoom` and `target`), or show the poster.
- The words of the badges are in `src/layout.js` (`signals`, `RESULTS`) and `src/mess.js` (`badges`). Run them through the landing's copy rules before they ship.
- Port the files to TypeScript at that point. They are plain ES modules with no build step so the prototype stays easy to change.

## Cost

About 350 draw calls and 175,000 triangles per frame in each mode and with each cast, with one 2048 px shadow map. Measured in a headless browser, not on a phone: test it on a mid-range phone before it ships.
