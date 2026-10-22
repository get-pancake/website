# Infra-first landing: copy brief

Last checked against the product code on 2026-10-21. This brief is the source for the homepage's infra section (`components/sections/landing-v3/LpInfra.tsx`) and for the next iterations of the infra-first landing.

Since 2026-10-21 the whole homepage tells the infra story, in plain words, in the order every infrastructure page uses (founder: "infra is not just a section but the whole lp", "infra does not mean complex", "simplify narrative, taking story from other competitors doing infra for gtm"; the outline he approved came from Cargo, Landbase, Crustdata, Explorium, Octave, Clay, Apollo and Stripe's pattern): the hero (its For agents view holds the one-line install, `LpAgentStart`); the demo and logos; the shift, "Your go-to-market waits for you. / On Pancake, it works on its own." (`LpWhy`); the model, "Your agent decides. / Pancake runs it." with the lede's three layers, the brain, the data and the tools (`LpInfra`); the steps, under his own heading; "Built for agents. / Anything the app does, your agent can do." (`LpForAgents`: sign-in with no API key, 95 actions, safe retries, the one-line setup, one real Claude example); "Your sentence becomes software." (`LpBuild`, agent-written programs shown as what Pancake does while the flag rolls out, by his choice); then the bottle banner ("we should keep this"), the deep dive repurposed for infra ("What your agent runs on": the data, the tools, the Brain and the agent, same clouds and stories) and the CTA (with the setup line to copy), proof and pricing. Motion (2026-10-21): the diagram flow and the agents exchange play once (`LpInfraAnim`, `lp-infra-timeline.ts`), and step 02 now starts in Claude with Pancake connected. The layers, Deploy / Host / Run and the figures below are not on the page: they stay here as the checked background. The full technical teardown behind it is internal and stays out of this public repository: ask Tristan for it.

## The thesis

- Claude and Codex are the best agent harnesses there are. Pancake builds on them instead of competing with them.
- An agent can plan a go-to-market but cannot run it alone: it has no data to find people, no accounts to reach them, no memory of the business, and nothing that keeps working after the conversation ends.
- Pancake is the infrastructure agents run a go-to-market on. Your agent decides. Pancake runs it.
- The vision line: "Every company will run its go-to-market through agents. Pancake is where they run it."

## The Vercel analogy

The same words `public/llms.txt` already publishes.

| Verb | On the page |
|---|---|
| Deploy | An idea leaves the conversation with your agent and becomes a Play on Pancake. |
| Host | The Play lives on Pancake, with its own targeting, leads, messages and history. |
| Run | Pancake runs it on the schedule you pick, finds new leads and contacts the ones you approve. |

## The stack (background, not on the page)

| Layer | Line | What it means |
|---|---|---|
| Agent access | One door for every agent | Claude, ChatGPT and Codex connect with a browser sign-in (OAuth), with no API keys. Every action is one versioned capability, the same one the app uses. |
| Runtime | Searches written as code | A sentence becomes a program. Pancake builds it, tests it on a sample, promotes it, and can roll it back. It runs in a sandbox that holds no keys. Live for admitted workspaces. |
| Durable execution | Runs that outlive the chat | A queue with leases, retries and checkpoints keeps every Play working on its schedule, through deploys and crashes. |
| Data plane | Every source behind one gateway | Each call to a data source is reserved, receipted and settled. A retry replays its receipt instead of paying twice. |
| Memory | The Brain | What you sell, who buys, your voice and your competitors, stored as typed, versioned memory. Every search and every message reads the approved version. |
| Channels | Your own accounts | Messages go out under the customer's name. Every add is safe to retry and waits 10 minutes so it can be undone, and a reply stops the sequence. Pancake never holds the customer's account credentials. |
| Metering | Usage at cost | Credits are held before any source is paid and settled once at the confirmed cost (1,000 credits per $1). When they run out, work pauses. There is no overage. |
| Audit | Every call on the record | Every agent call, run and change lands in an activity feed the agent can read back, and every lead carries the reason it fits. |

## The figures (background, not on the page)

Re-count them in the product code before changing any.

| Figure | Label | How it was counted |
|---|---|---|
| 95 | tools your agent can call | MCP tools served to a normal workspace on 2026-10-21. A workspace with CRM export gets 102; 111 are registered in total. |
| 150 | versioned capabilities behind them | The product's capability registry. One registry drives both the MCP server and the in-app agent. |
| 0 | API keys to paste | Agents connect with browser OAuth. No API keys exist for tenants. |
| 1 | receipt for every paid call | Every call that creates something or spends credits carries a request receipt, and a retry replays it. |

## Safe to claim now

1. Any MCP agent that supports browser OAuth plugs in with a sign-in and no API key.
2. 95 tools for your agent: the same actions the app uses, from one registry of 150 versioned capabilities.
3. Retries never pay twice: every call that creates or spends carries a request receipt.
4. Runs keep going when the laptop closes: a durable job engine with leases, retries and checkpointed steps.
5. Every scheduled run leaves one permanent record of what ran, or why it was skipped.
6. Searches compile into immutable, versioned programs that run in keyless sandboxes behind one metered gateway (live for admitted workspaces since 2026-10-12).
7. You pay what the research actually cost: credits held before work, settled once at the provider-confirmed cost.
8. One memory for every agent: the Brain is typed and versioned, and every search and message reads it fresh.
9. Every lead carries its evidence: where each field came from, the verdict, and the search that found it.
10. Outreach goes out from the customer's own accounts, and Pancake never holds their credentials.
11. Every agent action is logged, and the agent can follow the activity feed.
12. The agent can take over the schedule: in agent mode, Pancake's scheduler stands down.

## Do not claim yet

- Per-agent permissions, read-only agent access or per-agent budgets.
- Approval inside Pancake of what an agent spends or sends (the in-app agent asks; external agents act on the member's OAuth consent).
- An automatic reply with a calendar link (removed from the product on 2026-10-08).
- Lookalikes of the best customers.
- Two-way CRM sync (CRM export is built for five CRMs and not yet open).
- Email outreach.
- A shared data network across customers.
- Multi-region hosting or high availability.
- "Your agent deploys its own code": Pancake's own coding agent writes the programs from the agent's ask.
- Any fixed frequency ("every night", "nightly").
- Breadth such as "any data provider" or a provider count.
- Compliance certifications.

## Fixes the current site needs

Read from `public/llms.txt` on main, 2026-10-21.

| Current claim | What the product does | Fix |
|---|---|---|
| "When a prospect says yes, Pancake replies once with the customer's calendar link or app link" | The auto-reply was removed on 2026-10-08. A reply stops the sequence and is labeled positive, in your hands or not interested | "A reply stops the sequence and comes back to you, labeled." |
| "The free trial lasts 7 days and comes with 15,000 credits" | New trials get 30,000 credits since 2026-10-21 | Update to 30,000 when billing confirms |
| "It does not … look up phone numbers" | Find phone exists on a lead: 500 credits, charged only when a number is found | Decide with product, then drop the line or add the lookup |
| "Pancake suggests Brain changes they can accept or ignore" | The Brain updates itself from that reason by default, and every change is versioned and shown in Activity | "Pancake updates the Brain from that reason. Every change is versioned and shown in Activity." |
| "Daily, weekday, weekly or custom schedules" | Main supports all four; other Plays run daily or weekly | "Each Play runs on the schedule you pick" |
| "About 90 tools", "4 skills" | 95 tools served; 5 skills ship (the tool skill plus 4 playbooks) | "95 tools", "5 skills" |
| A Play can find "companies that look like your best customers" | Not live | Remove until it ships |
| A Play can find "everyone who reacted to one specific post" | Only Plays that run as code, for admitted workspaces | Keep only with that scope |
| A Play can find "people posting about topics" | It finds people engaging with topic posts, not the authors | "people engaging with posts about topics you choose" |

## Guardrails that still apply

- The network is never named. A Play has a sequence, never a "campaign".
- No fixed frequency. No promised results.
- The hero H1 stays "Agentic infrastructure to run your go-to-market". An H2 states value, never a negation.
- The tab title stays "Pancake".
- Run `npm run build` (its `prebuild` runs `homepage-lint`, `url-guard` and `blog-lint`) before pushing copy.
