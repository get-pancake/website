/** Public paper v1.0.0, verified against benchmark commit af28e5d on 2026-11-05. */
export const MEMORY_PAPER = {
  title: "Domain-Specialized Company Memory for Grounded Marketing Recommendations",
  author: "Guillaume Marquis",
  date: "2026-10-23",
  path: "/research/marketing-memory",
  pdf: "/research/marketing-memory/report.pdf",
  citation: "/research/marketing-memory/citation.bib",
  repository: "https://github.com/get-pancake/marketing-memory-benchmark",
  release: "https://github.com/get-pancake/marketing-memory-benchmark/releases/tag/v1.0.0",
  source: "https://github.com/get-pancake/marketing-memory-benchmark/blob/af28e5d56ff81bed87e8262ea4824d07d2f74798",
  description:
    "A reproducible study of how company context changes grounded marketing recommendations: 120 fictional companies, 360 cases and two fixed readers.",
  abstract:
    "Can a marketing-specialized company memory improve next-action recommendations, or is strong generic context sufficient? We separate the policy value recoverable from retrieved evidence from the grounded feasible value actually returned by a fixed reader. A frozen benchmark contains 120 fictional company worlds, 360 multi-account cases, three compound stress levels, six executed context treatments and 4,320 actual GPT-6.1 Sol/Claude Opus 5.5 responses. On positive cases, general company context yields 47.9% of the full-information optimum for both readers; GTM context yields 88.4% for GPT and 88.2% for Opus. Paired gains are 40.6 percentage points (95% company-bootstrap interval 36.7–44.4) and 40.3 points (36.3–44.3). No company evidence yields zero grounded positive value, as expected under the evidence-required contract. The advantage is principally information selection: a generic query-word selector produces exactly the same GTM packets, and wider generic contexts close the retrieval gap. Full current context performs better, at greater API cost. On a separate one-company raw-document/wiki development set, the general wiki answers 22/22 questions correctly versus 21/22 for the marketing wiki. The results support task-aware evidence selection under a budget, not universal vertical-memory superiority, a proprietary architecture requirement or measured revenue improvement. Data, code, raw attempts, uncertainty analysis and publication figures are packaged for reproduction.",
} as const;

/** Percent of each positive case's full-information optimum; company-weighted. */
export const MEMORY_RESULTS = [
  { context: "No company evidence", gpt: "0.00%", opus: "0.00%" },
  { context: "General company context", gpt: "47.86%", opus: "47.86%" },
  { context: "Marketing-specialized context", gpt: "88.43%", opus: "88.19%" },
  { context: "Generic query-word selector*", gpt: "88.43%*", opus: "88.19%*" },
  { context: "Full current context (larger allowance)", gpt: "99.96%", opus: "98.06%" },
] as const;
