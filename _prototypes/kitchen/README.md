# Pancake Kitchen

Pancake Kitchen is an animated section for the landing page. It shows Pancake as a small kitchen that runs by itself. A switch shows the same kitchen without Pancake, and the title changes with it.

Look at it before you read more:

- The preview: https://claude.ai/artifact/97EJemRqx4rXaMThVFRUyh
- `demo.html`, in the zip: open it with a double-click. It needs no installation and no network.

This README is for the person who puts the section on the landing page.

## What the visitor sees

With Pancake, the title is "Anyone can cook." Badges pop over three tunnels: "New sign-up", "Just funded", "Pricing views up". Each badge drops into its tunnel and comes out as an ingredient. Three chefs mix, flip and plate. Each plate that leaves becomes a badge: "Lead to contact", "Next best Play", "Message drafted".

Without Pancake, the title is "Always overcooked." A belt breaks and spills. Every ingredient waits in one slow tank. Pancakes burn. The chefs stop cooking: one mends, one puts fires out, one runs. A burnt plate leaves from time to time, with the badge "2 weeks late".

On a computer, the picture is a live 3D scene. On a phone, it is a still picture, and the switch changes the picture.

## What is in this folder

The zip holds three things:

- `README.md` is this file.
- `demo.html` is the scene in one file.
- `landing/` holds the files for the website repository. Its folders have the same names as the folders of the repository.

These are the files inside `landing/`:

- `components/sections/landing-v3/LpKitchen.tsx` is the section.
- `components/sections/landing-v3/kitchen/` is the 3D scene. It holds every word of the section (`words.js`), a review page and its own README.
- `app/_styles/landing-v3/kitchen.css` holds the styles of the section.
- `public/lp/kitchen/` holds twelve still pictures.
- `scripts/kitchen-posters.mjs` draws the still pictures again.

The branch `claude/vibrant-cerf-sgajnd` of the website repository holds the same folder, as `_prototypes/kitchen`. It has no `demo.html`.

## Add it to the landing page

A coding agent can do the work in a few minutes:

1. Read "Decisions for you" below.
2. Put the folder `pancake-kitchen` at the root of the website repository.
3. Open your coding agent in the repository, and paste this prompt:

```text
Add the kitchen section to the landing page. Its files are ready in `pancake-kitchen/landing/`, and `pancake-kitchen/README.md` explains them. Work in one new branch and open one pull request. Change nothing else.

1. Copy the content of `pancake-kitchen/landing/` into the root of this repository: run `cp -R pancake-kitchen/landing/. .` The folders match the folders of the repository. Then delete the folder `pancake-kitchen`.
2. Run `npm install three@0.170.0 --save-exact`. It is the one new package, and I approve it.
3. In `app/_styles/landing-v3.css`, add the line `@import "./landing-v3/kitchen.css";` just before the import of `modal.css`.
4. In `scripts/homepage-lint.mjs`, add two paths to the `FILES` list: `components/sections/landing-v3/LpKitchen.tsx` and `components/sections/landing-v3/kitchen/words.js`.
5. In `app/page.tsx`, import `LpKitchen` from `@/components/sections/landing-v3/LpKitchen`. Render `<LpKitchen />` on the line after `<LpMarquee labelled />`. It must stay a direct child of `<LpAudience>`.
6. Run `node scripts/homepage-lint.mjs`, then `npx tsc --noEmit`, then `npm run build`. If one of them fails, stop and tell me which one and why. Do not change a file outside the kitchen to make it pass.
7. Start the site. In a window wider than 768 px, scroll to the section. Make sure that the picture moves, and that a click on "Without Pancake" changes the title to "Always overcooked." Then give me the preview link.
```

The prompt makes two choices for you. Step 2 says that you approve one new package. Step 5 puts the section under the band of customers. Change these lines if you decide differently.

A developer can do the same seven steps by hand. The steps change three files that exist (`landing-v3.css`, `homepage-lint.mjs`, `page.tsx`) by one or two lines each, and they add one package.

## Decisions for you

### Where the section goes

The prompt puts the section under the band of customers. That is where it was tested. Its title is an `h2` there, because the hero holds the `h1` of the page.

If the section replaces the hero, write `<LpKitchen as="h1" />`. A page has one `h1`, so use this only when the hero's own `h1` is gone.

The page has a view for AI agents. That view hides the section, as it hides every other section.

### Who cooks

Two casts exist. The pancake chefs are the Pancake mark in 3D. The little chefs are toy cooks who stand behind the counters. The preview has a switch to compare them.

`<LpKitchen />` shows the pancake chefs. `<LpKitchen cast="people" />` shows the little chefs. Nobody chose between them yet.

### The Snowflake and BigQuery logos

Without Pancake, the slow tank carries the Snowflake and BigQuery logos. The request asked for them. Two things speak against them. The copy of the vision page names no vendor for a comparison (its rule is in `lp-vision-data.ts`). The logos are also trademarks of their owners.

`<LpKitchen vendorLogos={false} />` removes both logos from the scene and from the still pictures. The tank still reads as a slow warehouse without them.

### The logos on the badges

Nine badges carry the logo of a tool. Five tools appear: PostHog, Google Analytics, HubSpot, Crunchbase and Luma. A badge shows its tool as a source of signals. The first three logos are files of `public/integrations`. The other two are new to the site.

These logos are trademarks too. Make sure that each brand allows this use. To drop one, open `kitchen/words.js` and replace its name with a plain glyph: `user`, `event`, `chart`, `up` or `jobs`. Then draw the still pictures again.

### The words

Every word is in `components/sections/landing-v3/kitchen/words.js`. The words follow the rules of the `landing-voice` skill, and they pass `scripts/homepage-lint.mjs`. Four of them need your eye:

- "Anyone can cook." is the motto of the film Ratatouille. Make sure that you want the reference.
- "Email opened" is a signal from the CRM of the visitor. Pancake does not send email, and the badge does not say that it does.
- "Pricing views up" and "Traffic spike" are counts from the analytics of the visitor. Pancake does not identify the visitors of a website, and the badges do not say that it does.
- "Sync failed" is about the pipeline a team builds for itself. It is not about the CRM export of Pancake.

### The phone

A phone never starts the 3D scene. It shows a still picture, and the switch changes the picture. Nobody measured the scene on a phone, and this page already had a memory problem on iPhone. A visitor who asked for less motion gets the still pictures too.

The live scene starts at a width of 768 px. To change this, edit `LIVE` at the top of `LpKitchen.tsx`. Test on a real phone before you lower it.

### The new package

The scene needs `three`, a 3D library. `AGENTS.md` says to flag a new package, so this is the flag. The scene was built and tested with version 0.170.0 only.

The library does not slow the first load. The page loads it when the section comes near the screen, and only on a screen wider than 768 px. The numbers are in the next section.

### The design

No Figma frame exists for this section. `AGENTS.md` names Figma as the source of every design. The section uses the tokens of the landing page and the measures of the steps section. If the designer draws a frame, change `kitchen.css` to match it.

The colors of the 3D scene are a copy of the tokens, in `kitchen/palette.js`. If a token changes, change the copy and draw the still pictures again.

## What was checked

The seven steps of the prompt were done on a copy of the branch `feat/revenue-data-warehouse`. These checks passed there:

- `node scripts/homepage-lint.mjs` reads the words of the section and reports 0 errors.
- `npx tsc --noEmit` reports no error.
- `npm run build` passes, with its lint and its URL guard.
- In the report of the build, the home page grows from 39.3 kB to 40.6 kB. Its first load grows from 152 kB to 154 kB.
- The scene loads later, as two files of 167 kB (`three`) and 34 kB (the scene), gzipped.
- A wide still picture is about 125 kB, and a phone one about 65 kB. The page loads one of them.

A headless Chromium opened the built site. These behaviors were seen there:

- On a desktop window, the scene starts over its still picture, and the switch changes the kitchen and the title.
- If the browser takes the graphics context back, the still picture returns.
- On a phone, and for a visitor who asked for less motion, the page loads no 3D code.
- The agents view hides the section.

The code of the section sends no analytics event.

## What was not checked

Four things remain. Do them on the preview before the section goes to production.

- The smoothness of the scene. The test browser draws without a graphics card, too slowly to judge it. Look at the scene on a real computer.
- A phone and a tablet. A tablet wider than 768 px gets the live scene.
- Safari and Firefox. Every test ran in Chromium.
- The preview deploy on Vercel.

## Change it later

To change a word, edit `kitchen/words.js`. To change who cooks, where the section opens or the logos, change the options of `<LpKitchen />`. After a change to the words or to the scene, run `node scripts/kitchen-posters.mjs` to draw the still pictures again.

`components/sections/landing-v3/kitchen/README.md` explains the scene itself: its files, its review page and the tool for the still pictures.
