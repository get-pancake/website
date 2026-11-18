# Research publication

`/research` is the publication index; `/research/marketing-memory` is the stable abstract page for the first technical report. Both are static, server-rendered pages using the landing-v3 design system. The navigation, footer and sitemap link the index.

## Source and update contract

- Public source: https://github.com/get-pancake/marketing-memory-benchmark
- Release: v1.0.0. Source commit: `af28e5d56ff81bed87e8262ea4824d07d2f74798`.
- The PDF, control figure and BibTeX entry in `public/research/marketing-memory/` are copied from that release without changing the paper.
- PDF SHA-256: `9a7f37a31a58b358384ec62fb6a1fb043d229408068c7d517f93f124f6eb5e84`.
- `lib/research.ts` holds the exact title, author, publication date, abstract, artifact links and selected numeric comparisons. The abstract corresponds to `paper/challenge-abstract.tex` with TeX escapes converted for HTML.

Keep the generic query-word control adjacent to the principal result: it produces identical packets and reuses the specialized outputs, so it is not an independent experiment. Full context uses a larger allowance. These are synthetic policy-priority scores, not commercial outcomes. The technical report is not peer reviewed.

The abstract page includes Highwire `citation_*` metadata, an absolute same-origin PDF link, a canonical URL and `ScholarlyArticle` JSON-LD. These support discovery; they do not establish that Google Scholar has indexed the paper. The publication date remains the paper's 2026-10-23 date, while the sitemap records the website page's own modification date.

Do not invent an arXiv identifier or DOI. Add verified publication identifiers when available, keeping the original artifact provenance and version history. A future replacement PDF should use a versioned asset URL rather than silently replacing the archived report.

## Validation for the initial page

- `npm run build`: existing content/URL guards, compilation, lint and TypeScript checks pass.
- Local HTTP checks: both pages, PDF, SVG, BibTeX, sitemap and robots respond successfully; citation fields and the PDF checksum match the source.
- Visual review: desktop index and abstract page; the published PDF's title and author are preserved.

The website work does not rerun or independently validate the research experiments. Full reproduction instructions remain in the linked benchmark release.
