# Vendor logos

> About the files in `public/lp/vendor-logos/`. This note lived in that folder from 2026-10-27,
> where the site serves every file; it moved here on 2026-10-28, before it reached production, so
> it stays in the repository only.

The vendors' own marks, copied unchanged on 2026-10-27 from the product's vetted set
(get-pancake/pancake-cmo, `apps/frontend/public/vendor-logos/`, whose README records each source
and brand rule). The homepage's infra section shows them on white discs, as the product does, to
name where leads come from and the CRMs a workspace connects. They are the vendors' trademarks,
not Pancake artwork, and imply no endorsement. Never redraw or recolour one.

- `ocean-io.svg`: Ocean.io's SVG favicon, https://cdn.ocean.io/assets/images/favicon/favicon.svg.
- `linkup.svg`: Linkup's logo mark from its site header (https://www.linkup.so/), a clip path that
  covered the whole view box removed.
- `hubspot.svg`: the HubSpot logo in the header of https://www.hubspot.com/, cropped to the
  sprocket (its one path, fill `#ff4800`).
- `attio.svg`: `svg/attio-logomark-dark.svg` from the logo pack linked on https://attio.com/brand.
- `close.svg`: `close-logo-2024/mark.svg` from the logo pack linked on https://www.close.com/brand.
- `pipedrive.svg`: Pipedrive's app icon (the white "p" on its green square), a 128 × 128 PNG
  wrapped unchanged in an SVG `<image>` (Pipedrive offers its marks as PNG and ICO only).

The data providers on the page (Dealroom, Apify, TheirStack, Coresignal, Wappalyzer, Firecrawl)
live in `public/lp/story-sources/`; the infra section and the deep dive's signals and lineage
stories draw those. The marks in `public/lp/vendor-logos/` are drawn by the infra section
(HubSpot, Attio and Pipedrive) and by the deep dive's context and lineage stories (HubSpot, as the
CRM); Close, Ocean.io and Linkup are on disk, unused.
