# Toy pictures

The seven small pictures of the vision homepage, in the look of the kitchen (`LpKitchen`): soft 3D objects, the same palette, the same light, white badges of the page's own type.

- The 1-2-3 under "Unified context and data layer for the best revenue teams": `t1` (your sources plug into a machine, the tables come up), `t2` (a radar over one account, a line connects the dots), `t3` (your Brain, the fine flat graph the app draws: signals in, the next best Play out).
- "What your agent can do with Pancake": `t-engine` (Claude's window on a cable to an engine), `t-journey` (one buyer, stop after stop, each touch dated), `t-merge` (three sightings become one buyer), `t-ping` (a phone lights up by itself, your agent writes first).

## How a picture is made

A picture is not live 3D. Each object is drawn once, on a transparent ground, by the studio in this folder, and saved as a WebP layer. The page lays the layers out as plain images and moves them with GSAP. The camera has no perspective, so sliding an object in space is exactly sliding its drawing on the screen.

That choice keeps the cost of a picture at a few images (the six sets weigh about 390 kB together, loaded lazily), it plays on phones, and it fits the page's own motion system: a stage whose markup is its END picture, and one seek-safe timeline.

- `toys/studio/scene-*.js`: the 3D sets, one a picture. Plain JavaScript on three.js, with the kitchen's shapes and finishes (`../kitchen/geo.js`, `mats.js`, `palette.js`). The third step has no set: its Brain is drawn flat by the page (see "The Brain's look").
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

A piece that pops lands a little past its size and settles, as things do in the kitchen. The page's older pictures never overshoot. To hold the toy pictures to that rule too, set `TOY_EASE.pop` and `TOY_EASE.soft` to `"power3.out"` in `lp-toy-kit.ts`: nothing else changes.

## The Brain's look

The third step is the one picture that is not a 3D set. Its Brain is the graph the app draws and the designer drew on the page: a dark centre, six hubs of a colour each, their points on hairlines, flat, with no shadow. It is an SVG, placed and drawn by `LpToySteps.tsx` (`BRAIN_HUBS`: each hub, its points, and the side its tag hangs on). Three hubs carry a tag at a time.

Two 3D versions were tried on the preview and turned down (2026-11-12). The same graph as soft beads on rods read as an atom, under too many shadows ("ça fait trop atome et trop d'ombre, on comprend pas"). A brain as a toy, pink on a stand, was worse ("je trouve ça cringe de ouf"). The flat graph is also what a visitor then finds in the app.

The engine of `t-engine` keeps its own small Brain of beads (`toys/studio/scene-engine.js`): at that size it is one part of the machine, and it reads.

To add, move or remove a point, edit `BRAIN_HUBS`: a point is an angle and a distance from its hub. Keep the side of a hub's tag free of points, so that a tag never covers a branch.

## When a picture plays

The three steps are played by the page's driver (`lp-play-once.ts`). By its older rules a card that came on screen during a fast scroll, or in one step of the scroll (a trackpad flick, a page key), showed its END picture and never moved: on a laptop most visitors saw three still pictures. The steps ask the driver for one more rule (`playWhenStopped`): a card that got its picture without playing plays the first time the scroll comes to rest with half of it on screen. Several such cards start one after the other.

The carousel of the four features plays by itself. Its Pause button is a keyboard control only since 2026-11-12: a mouse or a finger no longer sees it (`dive.css` has how to bring it back). When the carousel comes on screen its first story plays from its start, also after a fast arrival (until 2026-11-12 it then showed its END picture and went on to the second story).

## The pictures go round

Since 2026-11-12 a picture does not stop on its END. It holds it for about two seconds, shows something else, and comes back, for as long as it is looked at. Out of sight it waits where it is.

- `t1`: four other sources take the docks (meetings, support, billing, calendar), then the first four are back. The piles never go back to empty: a row lands on top, the pile shows its last five, and the two counts go on from one round to the next.
- `t2`: the radar scans another account (Deel, an open deal). Four other signals land, as blocks, and the beam turns the other way.
- `t3`: the Brain changes (three points draw back into their hubs, six others grow out), three other hubs carry a tag, and it comes up with other ideas and another Play.
- `t-engine`: each time it plays again another question is asked (three in all, then the first again).
- `t-journey`, `t-merge`, `t-ping`: the same story each time.

How it is built. A step's take is one timeline in two parts: an opening that builds the picture, then the round. The round ends on the frame it started from, so it restarts without a jump (the builder returns that time as `loop`, and `LpVisionStepAnim` asks the driver for `loop`). What only the second half of a round shows is in the markup, hidden at rest. On phones the four features are a stack of cards: each plays again after a hold (`loop` in `lp-dive-carousel.ts`).

To make a step play once again, remove the `loop` line in `LpVisionStepAnim.tsx`: the take then stops at the end of its round. To stop it on its first picture, also end the timeline at `picture` in its builder.

The line of `t2` is drawn from dot to dot. If a line or a trail ever appears at once again: GSAP rounds a length in px to a whole number, so a dash offset tweened from 1 to 0 jumps at its middle. The tweens of a dash offset carry `autoRound: false`.

## Copy that is new

The words the pictures add, to review as copy:

- `t1`: what each source sends ("Deal updated", "Attended your event", "New signup", "Pricing page viewed"). On the next round: four more sources, each with the mark of a tool (Meetings with Zoom, Support with Zendesk, Billing with Stripe, Calendar with Google Calendar) and what it sends ("Meeting recorded", "Ticket opened", "Plan upgraded", "Demo booked"). The table counts grow at each round (they start from the hero's 4,812 and 12,960).
- `t2`, on the next round: the account "Deel", "open deal", and four signals ("headcount up", "switched CRM", "new reviews", "new CRO").
- `t3`: three tags on the Brain's hubs (ICP, Signals, Voice, and on the next round Competitors, Won deals, Personas), two ideas ("Reach back out to Ramp", "Work accounts hiring SDRs") and the Play ("Contact the 24 people who signed up after your event."). On the next round: "Book a demo with Linear", "Send Mercury a gift", and the Play "Reach back out to the 8 lost deals that just raised funding.".
- `t-engine`: a new job in Claude's window ("Who should I contact today?", "Query your tables", "Check market signals", "Start with Ramp."). The two other questions: "Who is ready for a demo?" ("Linear is ready.", Book a demo, Head of Growth at Linear, "New signup, asked pricing") and "Which lost deals can I reopen?" ("Supabase just raised.", Reach back out, VP Sales at Supabase, "Lost deal, new funding").
- `t-journey`: "Came to your event", "Asked about pricing", "Replied to you", and the count ("4 touches kept").
- `t-merge`: "Your event", "Your product", "Social profile" (with the mark of X), "Work email", "Personal email", "No email", "One buyer".
- `t-ping` adds no word: the conversation is the ping story's own (`lp-story-ping-data.ts`). Since 2026-11-12 the agent that writes is Grok Bot, and it offers a list instead of reaching out by itself: "24 people in your ICP signed up after yesterday's event.", "Want a list so you can contact them?", "Yes, send it", "Done. The list is in Pancake.".

The marks of the four new sources are the files of `public/integrations/`, unmodified. They say that Pancake can take these tools as sources: check that it is true before the page ships.

## What was checked, and what was not

Checked on a production build, in headless Chromium, at 1440 px and at 390 px (touch): the copy lint, the types, ESLint, the build. Each step plays its opening, holds, goes round and comes back to its picture with no jump, and its counts go on. A step out of sight waits, and carries on when it is back. A step left during its opening shows its picture, and plays a round when the visitor returns. The carousel's first story plays from its start after a jump to it, and asks the second question on its next turn. On phones each story of the stack plays again after its hold, and the first asks its three questions in turn. Reduced motion: each picture rests on its END and no take is fetched. No error in the console, no picture that fails to load. The homepage's first load is 154 kB, as before.

Not checked: Safari and Firefox, a real phone, how smooth the motion is on a real screen (the test machine draws in software).
