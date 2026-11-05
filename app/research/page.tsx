import type { Metadata } from "next";
import { MEMORY_PAPER } from "@/lib/research";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";

const description = "Open benchmarks and technical reports on company memory and evidence-backed GTM decisions. Read the methods, inspect the results and reproduce the work.";

export const metadata: Metadata = {
  title: "Pancake Research",
  description,
  alternates: { canonical: `${SITE_ORIGIN}/research` },
  ...social({ path: "/research", title: "Pancake Research", description }),
};

export default function ResearchIndex() {
  return (
    <>
      <header className="research-band research-hero">
        <div className="lp-content">
          <p className="research-eyebrow">Methods, evidence, open code</p>
          <h1 className="lp-title-section">Pancake Research</h1>
          <p className="research-lede">How can company knowledge help agents make better go-to-market decisions?</p>
          <p className="research-intro">We study that question through runnable prototypes and open benchmarks. Each report connects a specific claim to its methods, results and limitations.</p>
        </div>
      </header>

      <section className="research-band research-library" aria-labelledby="papers-heading">
        <div className="lp-content">
          <div className="research-section-heading">
            <h2 id="papers-heading" className="lp-display">Papers &amp; benchmarks</h2>
            <span className="research-meta">01 publication</span>
          </div>
          <article className="research-paper-card">
            <div className="research-paper-card__body">
              <p className="research-meta"><time dateTime={MEMORY_PAPER.date}>October 23, 2026</time><span>Technical report · v1.0.0</span></p>
              <h3 className="lp-display"><a href={MEMORY_PAPER.path}>{MEMORY_PAPER.title}</a></h3>
              <p className="research-summary">Task-aware evidence selection improves grounded recommendations under a context budget. A simple generic selector matches the specialized approach in this benchmark.</p>
              <p className="research-meta">120 fictional companies · 360 cases · 4,320 model responses</p>
              <div className="research-links">
                <a className="research-primary-link" href={MEMORY_PAPER.path}>Read the research <span aria-hidden="true">↗</span></a>
                <a href={MEMORY_PAPER.pdf}>Paper PDF</a>
                <a href={MEMORY_PAPER.repository}>Code &amp; benchmark</a>
              </div>
            </div>
            <div className="research-paper-card__question">
              <span className="research-eyebrow">The question</span>
              <p className="lp-display">Better memory,<br />or better selection?</p>
              <span className="research-meta">Company memory / Retrieval / Agent decisions</span>
            </div>
          </article>
        </div>
      </section>

      <section className="research-band research-principles" aria-labelledby="approach-heading">
        <div className="lp-content research-principles__grid">
          <h2 id="approach-heading" className="lp-display">Work you can inspect.</h2>
          <div><h3>Reproduce the results</h3><p>Open code, saved responses, frozen protocols and versioned artifacts accompany the paper.</p></div>
          <div><h3>Read the boundaries</h3><p>Synthetic benchmarks, measured findings and future hypotheses are identified explicitly. This technical report has not been peer reviewed.</p></div>
        </div>
      </section>
    </>
  );
}
