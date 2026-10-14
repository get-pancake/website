# UGC clips — drop-in contract for the "Founders on camera" wall

> About the files in `public/ugc/`. This note lived in that folder until 2026-10-13, where it
> was served on the site; it moved here so it stays in the repository only.

1. Drop vertical MP4s in `public/ugc/`: `public/ugc/<slug>.mp4` (H.264 + AAC).
2. Format: 9:16 portrait, 720x1280 recommended, 45-120s per clip.
3. Optional caption sidecar: `<slug>.json` — same basename, next to the mp4.
4. Sidecar shape: `{ "name": "Ada L.", "handle": "@ada", "quote": "Pancake runs my ops." }` (all fields optional).
5. Clips render alphabetically by filename — prefix `01-`, `02-`, ... to order them.
6. Keep files small (< ~15 MB): previews autoplay muted, so modest bitrate is fine.
7. Empty folder = the section shows designed placeholder cards instead (not broken).
8. Files are read at build time by `components/sections/home/HomeUGCWall.tsx` — redeploy after adding.
9. Clicking a card on the site unmutes + restarts it; reduced-motion visitors get a poster + play chip.
