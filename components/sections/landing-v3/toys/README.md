# Toy pictures

The seven small pictures of the vision homepage, in the look of the kitchen (`LpKitchen`): soft 3D objects, the same palette, the same light, white badges of the page's own type.

- The 1-2-3 under "Unified context and data layer for the best revenue teams": `t1` (your sources plug into a machine, the tables come up), `t2` (a radar over one account, a line connects the dots), `t3` (the Brain, signals in, the next best Play out).
- "What your agent can do with Pancake": `t-engine` (Claude's window on a cable to an engine), `t-journey` (one buyer, stop after stop, each touch dated), `t-merge` (three sightings become one buyer), `t-ping` (a phone lights up by itself, your agent writes first).

## How a picture is made

A picture is not live 3D. Each object is drawn once, on a transparent ground, by the studio in this folder, and saved as a WebP layer. The page lays the layers out as plain images and moves them with GSAP. The camera has no perspective, so sliding an object in space is exactly sliding its drawing on the screen.

That choice keeps the cost of a picture at a few images (the seven weigh about 350 kB together, loaded lazily), it plays on phones, and it fits the page's own motion system: a stage whose markup is its END picture, one seek-safe timeline, played once.

- `toys/studio/scene-*.js`: the 3D sets, one a picture. Plain JavaScript on three.js, with the kitchen's shapes and finishes (`../kitchen/geo.js`, `mats.js`, `palette.js`).
- `scripts/toy-art.mjs`: draws every layer and writes two things together: the pictures (`public/lp/toys/<set>/`) and where each one goes on its stage (`lp-toy-art.ts`: layers, anchors, paths, in stage px).
- `LpToyKit.tsx`, `lp-toy-kit.ts`, `app/_styles/landing-v3/toys.css`: what the seven share (a layer, a badge, the motion verbs).
- `LpToySteps.tsx` and `lp-toy-step-timelines.ts`: the three pictures of the 1-2-3.
- `LpToyStories.tsx` and `lp-toy-story-timelines.ts`: the four pictures of the deep dive.
- `lp-toy-data.ts`: every word the pictures add. It is in `scripts/homepage-lint.mjs`.

## Change a picture

To move, resize or recolour an object, edit its `scene-*.js`, then run:

```bash
node scripts/toy-art.mjs
```

Add a name to redraw one set only, for example `node scripts/toy-art.mjs radar`. The script needs Playwright, which this repository does not depend on: `npm install --no-save playwright && npx playwright install chromium`.

Never edit `lp-toy-art.ts` by hand: the script writes it with the pictures, so the two always agree.

To change what a badge says, edit `lp-toy-data.ts`. To change the timing, edit the take in the timelines file: each one starts with its constants.

To see one picture of the deep dive alone, with a slider over its timeline, open `/lp-dev/stages?story=t-journey` on a local or preview build. The three steps register their timelines as `window.__lpStep.t1`, `t2` and `t3`.

## Go back to a flat picture

The pictures these replace are still in the code. To show one again, change one word in `lp-vision-data.ts`:

- a step: its `variant` in `VISION_STEPS` (`"v1"`, `"v2"`, `"v3"` are the flat pictures);
- a feature: its `story` in `VISION_FEATURES` (`"mcp"`, `"p-history"`, `"p-dedup"`, `"ping"`).

## The feel

A piece that pops lands a little past its size and settles, as things do in the kitchen. The page's older pictures never overshoot. To hold the toy pictures to that rule too, set `TOY_EASE.pop` to `"power3.out"` in `lp-toy-kit.ts`: nothing else changes.

Nothing loops: a picture plays once and rests on its END, as the rest of the page does.

## Copy that is new

The words the pictures add, to review as copy:

- `t1`: what each source sends ("Deal updated", "Attended your event", "New signup", "Pricing page viewed").
- `t3`: the hubs' names (ICP, Personas, Voice, Signals, Competitors, Objections), two ideas ("Reach back out to Ramp", "Work accounts hiring SDRs") and the Play ("Contact the 24 people who signed up after your event.").
- `t-engine`: a new job in Claude's window ("Who should I contact today?", "Query your tables", "Check market signals", "Start with Ramp.").
- `t-journey`: "Came to your event", "Asked about pricing", "Replied to you", and the count ("4 touches kept").
- `t-merge`: "Your event", "Your product", "Social profile", "Work email", "Personal email", "No email", "One buyer".
- `t-ping` adds no word: the conversation is the ping story's own.

## What was checked, and what was not

Checked on a production build, in headless Chromium: the copy lint, the types, ESLint, the build; the three steps play once and end on their picture; the carousel plays the four stories in order; phone width (390 px); reduced motion (each picture rests on its END); no error in the console, no picture that fails to load. The homepage's first load is 3 kB lighter than before (the steps' markup now reaches the browser as HTML only).

Not checked: Safari and Firefox, a real phone, how smooth the motion is on a real screen (the test machine draws in software).
