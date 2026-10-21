/**
 * Section — "The stack under your agent" (2026-10-21, the infra-first landing).
 *
 * The thesis: Claude and Codex are the best agent harnesses there are, and Pancake will not
 * out-build them. Pancake is the infrastructure they run a go-to-market on. Every layer and
 * every figure below maps to the product code (pancake-cmo @ e78c042e, main on 2026-10-21);
 * the evidence, the status of each layer and what not to claim yet are in
 * docs/infra/pancake-infra-teardown-2026-10-21.md. Change a figure only with that doc.
 */

type Layer = { name: string; line: string; body: string };

const LAYERS: readonly Layer[] = [
  {
    name: "Agent access",
    line: "One door for every agent",
    body: "Claude, ChatGPT and Codex sign in with OAuth, no API keys. Every action is one versioned capability, the same for your agent and the app.",
  },
  {
    name: "Runtime",
    line: "Searches written as code",
    body: "A sentence becomes a program. Pancake builds it, tests it on a sample, promotes it and can roll it back. It runs in a sandbox that holds no keys.",
  },
  {
    name: "Durable execution",
    line: "Runs that outlive the chat",
    body: "A queue with leases, retries and checkpoints keeps every Play working on its schedule, through deploys and crashes, laptop closed.",
  },
  {
    name: "Data plane",
    line: "Every source behind one gateway",
    body: "Each call to a data source is reserved, receipted and settled. A retry replays its receipt instead of paying twice.",
  },
  {
    name: "Memory",
    line: "The Brain",
    body: "What you sell, who buys, your voice and your competitors, as typed and versioned memory. Every search and every message reads the approved version.",
  },
  {
    name: "Channels",
    line: "Your own accounts",
    body: "Messages go out under your name. Every add is safe to retry, waits 10 minutes so you can undo it, and a reply stops the sequence.",
  },
  {
    name: "Metering",
    line: "Usage at cost",
    body: "Credits are held before any source is paid and settled at the confirmed cost. When they run out, work pauses. There is no overage.",
  },
  {
    name: "Audit",
    line: "Every call on the record",
    body: "Each agent call, run and change lands in an activity feed your agent can read back, with the reason behind every lead.",
  },
];

type Stat = { value: string; label: string };

const STATS: readonly Stat[] = [
  { value: "95", label: "tools your agent can call" },
  { value: "150", label: "versioned capabilities behind them" },
  { value: "0", label: "API keys to paste" },
  { value: "1", label: "receipt for every paid call" },
];

export function LpInfra() {
  return (
    <section id="infra" className="lp-infra" aria-labelledby="lp-infra-title">
      <div className="lp-infra__card">
        <div className="lp-infra__head">
          <p className="lp-infra__eyebrow">The stack under your agent</p>
          <h2 id="lp-infra-title" className="lp-title-section lp-infra__title">
            Your agent is the brain. Pancake is the infrastructure it runs your go-to-market on.
          </h2>
          <p className="lp-infra__lede">
            Claude and Codex are the best agents ever built, and we build on them. Pancake gives them
            what a chat cannot hold: data to find people, accounts to reach them, a memory of your
            business, and a runtime that keeps working after the conversation ends.
          </p>
        </div>
        <ol className="lp-infra__stack">
          {LAYERS.map((layer, index) => (
            <li key={layer.name} className="lp-infra__layer">
              <span className="lp-infra__num">{String(index + 1).padStart(2, "0")}</span>
              <span className="lp-infra__name">{layer.name}</span>
              <span className="lp-infra__line">{layer.line}</span>
              <span className="lp-infra__body">{layer.body}</span>
            </li>
          ))}
        </ol>
        <dl className="lp-infra__stats">
          {STATS.map((stat) => (
            <div key={stat.label} className="lp-infra__stat">
              <dt className="lp-infra__value">{stat.value}</dt>
              <dd className="lp-infra__label">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
