# Data provider marks (homepage infra section and dive stories)

> About the files in `public/lp/story-sources/`. This note lived in that folder until
> 2026-10-13, where it was served on the site; it moved here so it stays in the repository only.

The six files in `public/lp/story-sources/` are the trademarks of their vendors: Dealroom,
TheirStack, Coresignal, Wappalyzer, Firecrawl and Apify. Pancake shows them only to name where a
Play's leads come from; they are not Pancake artwork and do not imply an endorsement.

Five of them (the SVGs) are byte-for-byte copies of the files the product app shows to its
users, from the product repo's `apps/frontend/public/vendor-logos` (retrieved by the product team
on 2026-10-05; that folder's README records each vendor's own source file). Copied to the site
unchanged on 2026-10-13.

`firecrawl.png` is Firecrawl's flame mark as the launch film used it (180 px; the film's assets
do not record where the file was taken from). Firecrawl is one of the providers wired into the
product's job toolkit; the app has no chip for it yet. Replace it with Firecrawl's own SVG when
the product repo carries one.

Why these six: they are integrated in the product (its job toolkit lists Apify, Coresignal,
Crustdata, DataForSEO, Dealroom, Exa, Firecrawl, Linkup, Ocean.io, PredictLeads, TheirStack and
Wappalyzer) and the best known of that list. Never a provider the product does not use.

Rules: a mark is shown unmodified and in its own colours. Never recolour, redraw, crop or add
to one. To update a mark, take the vendor's own file through the product repo and replace the
file in that folder as it is.

Where they are drawn (2026-10-28; the "Sources you can trust" story that first drew all six was
removed that day, the folder keeps its name):

- The infra section's Data card (`components/sections/landing-v3/LpInfra.tsx`, `PROVIDERS` and
  the scroll pieces): Apify, TheirStack, Coresignal, Wappalyzer, Firecrawl.
- The dive's signals story, "Buying signals, enriched" (`LpStorySignals.tsx`,
  `lp-story-signals-data.ts`): all six, each on a white disc with its name on desktop, on the
  discs the "Sources you can trust" story gave them.
- The dive's lineage story, "Where every lead came from" (`LpStoryLineage.tsx`): TheirStack only,
  without its name.

| File | Vendor |
|---|---|
| `dealroom.svg` | Dealroom |
| `theirstack.svg` | TheirStack |
| `coresignal.svg` | Coresignal |
| `wappalyzer.svg` | Wappalyzer |
| `firecrawl.png` | Firecrawl |
| `apify.svg` | Apify |
