# Customer wordmarks

Added September 15, 2026 for the founder-requested carousel below the homepage hero.

The visual reference is [brain.getpancake.ai](https://brain.getpancake.ai/): solid plum (`--lp-ink-100`), alpha masks, 14px optical letter bodies, 48px gaps, 0.85 mobile scale, continuous linear leftward movement, and 10% edge fades. The ten-logo sequence is approximately 1705.3px on desktop and 1521.5px on mobile. Its 49.7s / 36.5s durations preserve the reference's approximately 34.3 / 41.7px per second. Reduced motion displays all ten marks in a static wrapping row.

## Sources

| File | Official source / acquisition | Artwork box |
| --- | --- | --- |
| hyperspell.svg | [Hyperspell](https://hyperspell.com), copied from the current brain landing | 577 × 91 |
| agentmail.svg | Current [brain landing](https://brain.getpancake.ai/logos/agentmail.svg) | 1986 × 363 |
| fleet.png | [Fleet](https://fleet.co/en), [official CDN asset](https://res.cloudinary.com/fleet-co/image/upload/c_scale,w_240/fleet_newLogo_wdsjyf?_a=ATRSRkS0), exported with Codex Browser | 240 × 91 |
| requesty.avif | [Requesty](https://www.requesty.ai/), header logo_requesty_dark.png served as AVIF through its Next image endpoint, exported with Codex Browser | 1515 × 463 |
| alpic.svg | [Alpic](https://alpic.ai/), official footer SVG background; vector path retained, transparent bounding path omitted | 266.246 × 52.146 |
| praxis.png | [Praxis](https://runpraxis.ai), alpha asset copied from the current brain landing | 1392 × 370 |
| kinro.svg | [Kinro brand logos](https://kinro.com/brand/logos), current jaguar and caps mark copied from the brain landing | 1308 × 356 |
| covera.png | Covera's YC profile alpha asset, copied from the current brain landing | 188 × 40 |
| spacefill.svg | [Spacefill](https://spacefill.com/fr/a-propos/), official footer SVG with unchanged paths, exported with Codex Browser | 192 × 33 |
| kardinal.svg | [Kardinal official SVG](https://kardinal.ai/wp-content/uploads/2019/09/Logo-White.svg), exported with Codex Browser | 152 × 24 |

Existing brain assets came from `pancake-brain-vercel/apps/brain/public/logos`, with optical body bounds from `BrainTrustBand.tsx`. New wordmarks use their actual artwork ratios and letter-body bounds; all paint with the same CSS color, regardless of the asset's original color. Raster assets retain their transparency. No runtime requests to the companies' sites are needed.

## YC badges

Small orange YC marks sit as 12px superscripts just above the top-right of the YC company logos, separated by a 4px gap. They share an optical alignment based on the wordmarks' letter bodies and sit inside the existing inter-logo spacing, preserving carousel width and speed. The original 48 × 48 SVG in `yc.svg` was read from Y Combinator's own site header through Codex Browser; its official orange and vector paths are unchanged.

Affiliations verified September 15, 2026 against official profiles:

- [Hyperspell — Fall 2025](https://www.ycombinator.com/companies/hyperspell), matching hyperspell.com.
- [AgentMail — Summer 2025](https://www.ycombinator.com/companies/agentmail), matching agentmail.to.
- [Kinro — Spring 2026](https://www.ycombinator.com/companies/kinro), matching kinro.com.
- [Covera — Fall 2026](https://www.ycombinator.com/companies/covera), matching covera-agents.com.

Praxis (runpraxis.ai) is also badged: Tristan explicitly confirmed its YC affiliation on September 15, 2026. Its affiliation is founder-confirmed; no batch is asserted. The remaining companies are unbadged.
