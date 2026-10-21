import type { ReactNode } from "react";

import { ClaudeMark } from "@/components/sections/landing-v3/LpAgentMarks";

/**
 * Section — "Powerful underneath. Simple on top." (the infra-first landing, 2026-10-21).
 *
 * What makes Pancake infrastructure, said as six things anyone can read (founder, same day:
 * "infra does not mean complex - we should make infra simple"), each with a small picture of
 * the app. Every card traces to the codebase teardown (outputs/pancake-infra-teardown-2026-10-21
 * .md, pancake-cmo e78c042e):
 *   - Your agent can do it all: 95 MCP tools served to a workspace, the app's own actions (§3.1).
 *   - Proof on every lead: the verdict and the source of each field (§3.5).
 *   - Never pays twice: request receipts — a request that arrives twice runs once (§3.1).
 *   - Nothing gets dropped: leases and a reaper — a run whose server stops is claimed by
 *     another (§3.2).
 *   - Your agent sees everything: the activity feed agents read with activity_since (§3.10).
 *   - Your data stays yours: one sealed workspace per customer, nothing shared across (§3.5,
 *     §3.9).
 * The pictures tell the page's one story: the Play "Funded startups" finds 13 leads, and Tamsin
 * Okafor of Quillfern replies.
 */

type Card = { id: string; title: string; body: string; art: ReactNode };

const CARDS: readonly Card[] = [
  {
    id: "agent",
    title: "Your agent can do it all",
    body: "95 actions, from building Plays to writing messages, work from Claude or Codex.",
    art: (
      <div className="lp-plat__list">
        <p className="lp-plat__head">
          <span className="lp-plat__spark">
            <ClaudeMark />
          </span>
          Claude used Pancake
        </p>
        <Row icon="check" k="Built the Play “Funded startups”" />
        <Row icon="check" k="Found 13 leads" />
        <Row icon="check" k="Drafted 13 messages" />
      </div>
    ),
  },
  {
    id: "proof",
    title: "Proof on every lead",
    body: "Each lead shows why it fits and where every detail came from.",
    art: (
      <div className="lp-plat__list">
        <p className="lp-plat__who">
          <span className="lp-plat__avatar">TO</span>
          <span className="lp-plat__name">
            Tamsin Okafor
            <span className="lp-plat__role">Founder, Quillfern</span>
          </span>
        </p>
        <Row icon="check" k="Founder, 12 people" v="Coresignal" src />
        <Row icon="check" k="Hiring a marketing lead" v="TheirStack" src />
      </div>
    ),
  },
  {
    id: "twice",
    title: "Never pays twice",
    body: "Send the same request twice and pay once.",
    art: (
      <div className="lp-plat__list">
        <Row icon="dot" k="Search: Funded startups" v="1,240 credits" />
        <Row icon="retry" k="Same request, sent again" v="0 credits" />
        <span className="lp-plat__tag">
          <Glyph kind="check" />
          Answered from the first run
        </span>
      </div>
    ),
  },
  {
    id: "dropped",
    title: "Nothing gets dropped",
    body: "If a server stops in the middle of a search, another one picks it up.",
    art: (
      <div className="lp-plat__list">
        <Row icon="dot" k="Funded startups: searching" v="09:00" />
        <Row icon="stop" k="Server 1 stopped" v="09:02" muted />
        <Row icon="retry" k="Server 2 picked it up" v="09:03" />
        <Row icon="check" k="13 leads found" v="09:07" />
      </div>
    ),
  },
  {
    id: "feed",
    title: "Your agent sees everything",
    body: "Every search, message and reply lands in one feed your agent can read.",
    art: (
      <div className="lp-plat__list">
        <Row time="09:07" k="Search ran: 13 new leads" />
        <Row time="09:12" k="13 messages sent" />
        <Row time="10:41" k="Tamsin replied" tag="Interested" />
      </div>
    ),
  },
  {
    id: "private",
    title: "Your data stays yours",
    body: "Each workspace is sealed off. Nothing you find or write is shared with other customers.",
    art: (
      <div className="lp-plat__list">
        <p className="lp-plat__head">
          <Glyph kind="lock" />
          Acme workspace
        </p>
        <Row k="Brain" v="Only your team" />
        <Row k="Leads" v="Only your team" />
        <Row k="Messages" v="Only your team" />
      </div>
    ),
  },
];

export function LpPlatform() {
  return (
    <section id="platform" className="lp-plat" aria-labelledby="lp-plat-title">
      <div className="lp-plat__org">
        <h2 id="lp-plat-title" className="lp-plat__title lp-title-section">
          Powerful underneath. Simple on top.
        </h2>
        <ul className="lp-plat__grid">
          {CARDS.map((card) => (
            <li key={card.id} className="lp-plat__card" data-card={card.id}>
              {/* a picture of the app: the title and body carry the meaning */}
              <div className="lp-plat__art" aria-hidden="true">
                {card.art}
              </div>
              <h3 className="lp-plat__card-title lp-display">{card.title}</h3>
              <p className="lp-plat__card-body">{card.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Row({
  icon,
  time,
  k,
  v,
  src = false,
  muted = false,
  tag,
}: {
  icon?: "check" | "retry" | "stop" | "dot";
  time?: string;
  k: string;
  v?: string;
  /** v is a data source: drawn as a chip */
  src?: boolean;
  muted?: boolean;
  tag?: string;
}) {
  return (
    <p className="lp-plat__row" data-muted={muted ? "" : undefined}>
      {icon === "dot" ? <span className="lp-plat__dot" /> : icon ? <Glyph kind={icon} /> : null}
      {time ? <span className="lp-plat__time">{time}</span> : null}
      <span className="lp-plat__k">{k}</span>
      {v ? <span className={src ? "lp-plat__src" : "lp-plat__v"}>{v}</span> : null}
      {tag ? <span className="lp-plat__tag">{tag}</span> : null}
    </p>
  );
}

/** Phosphor-weight glyphs on a 16 box, 1.5 stroke */
function Glyph({ kind }: { kind: "check" | "retry" | "stop" | "lock" }) {
  return (
    <svg className="lp-plat__glyph" data-kind={kind} viewBox="0 0 16 16" width="16" height="16" focusable="false">
      {kind === "check" && <path d="M3.5 8.5l3 3 6-7" />}
      {kind === "retry" && (
        <>
          <path d="M12.5 5.5A5 5 0 1 0 13 9" />
          <path d="M13 2.5v3h-3" />
        </>
      )}
      {kind === "stop" && <path d="M5 5l6 6M11 5l-6 6" />}
      {kind === "lock" && (
        <>
          <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
          <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7" />
        </>
      )}
    </svg>
  );
}
