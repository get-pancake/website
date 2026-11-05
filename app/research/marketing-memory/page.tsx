import type { Metadata } from "next";
import { serializeJsonLd } from "@/lib/json-ld";
import { MEMORY_PAPER as paper, MEMORY_RESULTS } from "@/lib/research";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";

export const metadata: Metadata = {
  title: paper.title,
  description: paper.description,
  authors: [{ name: paper.author }],
  alternates: { canonical: `${SITE_ORIGIN}${paper.path}` },
  ...social({ path: paper.path, title: paper.title, description: paper.description, article: { publishedTime: paper.date, authors: [paper.author] } }),
  other: {
    citation_title: paper.title,
    citation_author: paper.author,
    citation_author_institution: "Pancake",
    citation_publication_date: "2026/10/23",
    citation_technical_report_institution: "Pancake",
    citation_pdf_url: `${SITE_ORIGIN}${paper.pdf}`,
    citation_language: "en",
  },
};

const citation = `@techreport{marquis2026specializedmemory,
  author = {Marquis, Guillaume},
  title = {${paper.title}},
  year = {2026},
  institution = {Pancake},
  note = {AI-assisted industrial technical report},
  url = {${paper.repository}}
}`;

export default function MarketingMemoryPaper() {
  const article = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "@id": `${SITE_ORIGIN}${paper.path}#article`,
    headline: paper.title,
    name: paper.title,
    author: { "@type": "Person", name: paper.author, affiliation: { "@id": `${SITE_ORIGIN}/#organization` } },
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    datePublished: paper.date,
    inLanguage: "en",
    url: `${SITE_ORIGIN}${paper.path}`,
    abstract: paper.abstract,
    description: paper.description,
    genre: "Technical report",
    version: "1.0.0",
    license: "https://creativecommons.org/licenses/by/4.0/",
    encoding: { "@type": "MediaObject", encodingFormat: "application/pdf", contentUrl: `${SITE_ORIGIN}${paper.pdf}` },
    isBasedOn: paper.release,
  };

  return (
    <article className="research-band research-article">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(article) }} />
      <div className="lp-content">
        <header className="research-article-header">
          <a className="research-back" href="/research">← Pancake Research</a>
          <p className="research-eyebrow">Technical report · Company memory</p>
          <h1 className="lp-title-section">{paper.title}</h1>
          <p className="research-meta"><span>{paper.author} · Pancake</span><time dateTime={paper.date}>October 23, 2026</time><span>v1.0.0 · 13 pages</span></p>
          <div className="research-links">
            <a className="research-primary-link" href={paper.pdf}>Read the paper <span aria-hidden="true">↗</span></a>
            <a href={paper.repository}>Code &amp; benchmark</a>
            <a href={`${paper.source}/release/REPRODUCING.md`}>Reproduce</a>
            <a href="#cite">Cite</a>
          </div>
        </header>

        <div className="research-article-grid">
          <div className="research-prose">
            <section aria-labelledby="abstract-heading">
              <h2 id="abstract-heading" className="lp-display">Abstract</h2>
              <p>{paper.abstract}</p>
            </section>

            <section aria-labelledby="finding-heading">
              <h2 id="finding-heading" className="lp-display">What the comparison shows</h2>
              <p>With the same reader, marketing-specialized context recovers more grounded decision value than the general company-context baseline. The paired gain is +40.6 percentage points for GPT-6.1 Sol (95% interval: 36.7–44.4) and +40.3 for Claude Opus 5.5 (36.3–44.3).</p>
              <div className="research-table-wrap" role="region" aria-label="Context comparison" tabIndex={0}>
                <table className="research-table">
                  <caption>Grounded feasible policy-priority value on positive cases</caption>
                  <thead><tr><th scope="col">Context</th><th scope="col">GPT-6.1 Sol</th><th scope="col">Claude Opus 5.5</th></tr></thead>
                  <tbody>{MEMORY_RESULTS.map((row) => <tr key={row.context}><th scope="row">{row.context}</th><td>{row.gpt}</td><td>{row.opus}</td></tr>)}</tbody>
                </table>
              </div>
              <p className="research-note">Percentage of each positive case’s full-information optimum, averaged equally by company. These are synthetic decision scores. The table shows selected comparisons; the paper reports all six executed treatments.</p>
              <aside className="research-callout" aria-label="Generic selector control">
                <h3>The generic control matches the specialized selector.</h3>
                <p>*The generic query-word selector produces exactly the same 360 evidence packets. Its displayed scores reuse the same responses: they are not a separate model run or additional independent observations. Full current context performs better, with a larger allowance and higher API cost.</p>
              </aside>
              <figure className="research-figure">
                {/* Published vector figure, copied without modification from the release. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/research/marketing-memory/controls.svg" alt="Comparison of the general, specialized, query-word and full-context controls across both readers. The query-word control matches specialized context; full current context scores higher." width={1041} height={570} loading="lazy" />
                <figcaption>Control analysis from the paper. <a href={`${paper.source}/paper/challenge-results.tex`}>Methods and interpretation</a>.</figcaption>
              </figure>
            </section>

            <section aria-labelledby="scope-heading">
              <h2 id="scope-heading" className="lp-display">What was measured</h2>
              <p>The benchmark asks a fixed reader to select up to three marketing actions across several accounts under a shared resource limit. Recommendations must cite current evidence, satisfy prerequisites and follow the approved policy. Retrieval quality is scored separately from the decisions the reader returns.</p>
              <ul>
                <li>120 fictional companies and 360 multi-account cases: 288 positive and 72 negative cases.</li>
                <li>Six executed context treatments and 4,320 actual reader responses across two models.</li>
                <li>Three compound stress levels, with 4/6/8 accounts and 16/12/8 KiB evidence allowances.</li>
                <li>Paired comparisons and company-clustered bootstrap uncertainty. All treatments abstain on all 72 negative cases.</li>
              </ul>
              <p><a href={`${paper.source}/data/challenge/DATA_CARD.md`}>Dataset card</a> · <a href={`${paper.source}/analysis/challenge/main-v1/summary.json`}>Machine-readable results</a></p>
            </section>

            <section aria-labelledby="limits-heading">
              <h2 id="limits-heading" className="lp-display">Where the evidence stops</h2>
              <p>This is an AI-assisted industrial technical report using synthetic, schema-controlled histories. It has not been peer reviewed. It does not measure campaign outcomes, acquisition costs, revenue, human preference or the performance of a deployed Pancake recommender.</p>
              <p>On a separate, one-company raw-document/wiki development set, the general wiki answers 22/22 questions correctly and the marketing wiki answers 21/22. That small development set is not an independent multi-company validation.</p>
              <p>The supported conclusion is task-aware evidence selection under a budget. A proprietary architecture or universal advantage for vertical memory is not established.</p>
            </section>

            <section aria-labelledby="reproduce-heading">
              <h2 id="reproduce-heading" className="lp-display">Inspect and reproduce</h2>
              <p>The public repository contains the generator, frozen inputs, saved requests and responses, scoring code, uncertainty analysis, figures and LaTeX sources. Historical studies and failed attempts remain separate from the current experiment.</p>
              <p>Saved-output reproduction makes no provider requests. It verifies the artifact manifest, rebuilds contexts, rescores responses and regenerates the report. Fresh model experiments require separate API access and incur costs; follow the release instructions for the appropriate path.</p>
              <div className="research-links">
                <a className="research-primary-link" href={`${paper.source}/release/REPRODUCING.md`}>Reproduction guide <span aria-hidden="true">↗</span></a>
                <a href={paper.release}>Version 1.0.0 release</a>
              </div>
            </section>

            <section id="cite" aria-labelledby="cite-heading">
              <h2 id="cite-heading" className="lp-display">Cite this work</h2>
              <pre className="research-citation"><code>{citation}</code></pre>
              <p><a href={paper.citation} download>Download BibTeX</a> · <a href={`${paper.source}/CITATION.cff`}>CITATION.cff</a></p>
              <p className="research-note">Original code: MIT. Specified original data, outputs and documentation: CC BY 4.0. Third-party material retains its upstream license; see the repository’s <a href={`${paper.source}/release/THIRD_PARTY.md`}>attribution notes</a>.</p>
            </section>
          </div>

          <aside className="research-sidebar" aria-label="Study at a glance">
            <p className="research-eyebrow">Study at a glance</p>
            <dl><div><dt>Companies</dt><dd>120 <span>fictional</span></dd></div><div><dt>Cases</dt><dd>360</dd></div><div><dt>Model responses</dt><dd>4,320</dd></div><div><dt>Status</dt><dd className="research-sidebar__status">Technical report<br /><span>Not peer reviewed</span></dd></div></dl>
            <a href={paper.pdf}>Download the PDF ↗</a>
            <a href={paper.repository}>Explore the evidence ↗</a>
          </aside>
        </div>
      </div>
    </article>
  );
}
