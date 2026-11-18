/**
 * Home — “You're always in control” section (Figma `428:15125`).
 *
 * Three 368×402 cards, each anchored to the design tokens / palette:
 *  - **Approve before it ships** — list of three approval rows, every row a
 *    "Slack-style" pill with role label, action title, optional amount, and
 *    a pink-fill check button + outlined cancel button.
 *  - **Audit every action** — terminal-style activity log on the dark
 *    inverted surface, JetBrains Mono, alternating role colours.
 *  - **Limit the scope** — graphic-led card with three overlapping
 *    pancake-style ellipses (Figma exports) and three "tool icon" SVGs
 *    sitting inside, evoking sandboxed tool/data access.
 *
 * All asset paths point at `public/control/` (SVGs exported via Figma MCP).
 */

import Image from "next/image";

const FEATURE_LIST_TIMEOUT_LABEL = "Approve before it ships";
const FEATURE_AUDIT_LABEL = "Audit every action";
const FEATURE_SCOPE_LABEL = "Limit the scope";

type ApprovalRow = {
  id: string;
  /** Pulled from Figma: pink / purple / orange status dot. */
  dotSrc: string;
  role: string;
  action: string;
  amount?: string;
};

const APPROVAL_ROWS: ApprovalRow[] = [
  { id: "row-1", dotSrc: "/control/dot-1.svg", role: "Ad Manager",         action: "Send invoice",       amount: "$4,820" },
  { id: "row-2", dotSrc: "/control/dot-2.svg", role: "Full stack Engineer", action: "Push to production" },
  { id: "row-3", dotSrc: "/control/dot-3.svg", role: "Ad Manager",         action: "Send invoice",       amount: "$4,820" },
];

type LogLine = {
  time: string;
  role: string;
  text: string;
};

const AUDIT_LOG: LogLine[] = [
  { time: "04:12:08", role: "growth/copy",     text: "drafted post → x.com/pancakegtm" },
  { time: "04:12:14", role: "eng/full-stack",  text: "opened PR #1284" },
  { time: "04:12:31", role: "ops/invoice",     text: "queued for approval" },
  { time: "04:12:45", role: "ops/support",     text: "resolved ticket-9117" },
  { time: "04:12:51", role: "ops/invoice",     text: "queued for approval" },
];

/**
 * Inline check icon — a single white tick sitting in the pink approve
 * button. Re-drawn from the Figma `Vector 59` path so we don't depend on
 * the 7-day MCP export URL.
 */
function CheckIcon() {
  return (
    <svg viewBox="0 0 14 11" className="home-landing-control-card__btn-icon" aria-hidden>
      <path
        d="M1 5.5 L5.2 9.5 L13 1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Inline X icon — paired with the cream cancel button. */
function CloseIcon() {
  return (
    <svg viewBox="0 0 12 12" className="home-landing-control-card__btn-icon" aria-hidden>
      <path
        d="M1.5 1.5 L10.5 10.5 M10.5 1.5 L1.5 10.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ApprovalCard() {
  return (
    <article className="home-landing-control-card" data-card="approve">
      <header className="home-landing-control-card__header">
        <h3 className="home-landing-control-card__title">{FEATURE_LIST_TIMEOUT_LABEL}</h3>
        <p className="home-landing-control-card__body">
          Set spend, scope, and trust thresholds. Anything above gets a one-tap human approval — on
          your phone, in Slack, or right here.
        </p>
      </header>
      <ul className="home-landing-control-approve-list">
        {APPROVAL_ROWS.map((row) => (
          <li key={row.id} className="home-landing-control-approve-row">
            <div className="home-landing-control-approve-row__main">
              <p className="home-landing-control-approve-row__role">
                <Image src={row.dotSrc} alt="" width={7} height={7} aria-hidden unoptimized />
                <span>{row.role}</span>
              </p>
              <p className="home-landing-control-approve-row__action">{row.action}</p>
            </div>
            {row.amount ? (
              <span className="home-landing-control-approve-row__amount">{row.amount}</span>
            ) : null}
            <div className="home-landing-control-approve-row__buttons">
              <button
                type="button"
                aria-label={`Approve ${row.action}`}
                className="home-landing-control-card__btn home-landing-control-card__btn--approve"
              >
                <CheckIcon />
              </button>
              <button
                type="button"
                aria-label={`Reject ${row.action}`}
                className="home-landing-control-card__btn home-landing-control-card__btn--reject"
              >
                <CloseIcon />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

function AuditCard() {
  return (
    <article className="home-landing-control-card" data-card="audit">
      <header className="home-landing-control-card__header">
        <h3 className="home-landing-control-card__title">{FEATURE_AUDIT_LABEL}</h3>
        <p className="home-landing-control-card__body">
          Every tool call, message, and decision — written to an immutable log. Replay, diff, and
          roll back any agent&rsquo;s work.
        </p>
      </header>
      <pre className="home-landing-control-audit-log" aria-hidden>
        {AUDIT_LOG.map((line) => (
          <span key={`${line.time}-${line.role}`} className="home-landing-control-audit-log__line">
            <span className="home-landing-control-audit-log__time">{line.time}</span>{" "}
            <span className="home-landing-control-audit-log__role">{line.role}</span>{" "}
            <span className="home-landing-control-audit-log__text">{line.text}</span>
            {"\n"}
          </span>
        ))}
      </pre>
    </article>
  );
}

/**
 * Sandbox graphic — three Figma ellipse exports staggered/overlapping with
 * three small tool icons inside, conveying the sandboxed-access idea.
 * Coordinates and rotations are ported verbatim from the Figma frame so
 * the composition matches the comp 1:1 inside the 304-wide card content.
 */
function ScopeCard() {
  return (
    <article className="home-landing-control-card" data-card="scope">
      <header className="home-landing-control-card__header">
        <h3 className="home-landing-control-card__title">{FEATURE_SCOPE_LABEL}</h3>
        <p className="home-landing-control-card__body">
          Each agent gets its own sandbox. Control which tools they can access, and what data they
          can see.
        </p>
      </header>
      <div className="home-landing-control-scope" aria-hidden>
        <div className="home-landing-control-scope__ellipse home-landing-control-scope__ellipse--center">
          <Image src="/control/sandbox-e1.svg" alt="" fill unoptimized />
        </div>
        <div className="home-landing-control-scope__ellipse home-landing-control-scope__ellipse--right">
          <Image src="/control/sandbox-e2.svg" alt="" fill unoptimized />
        </div>
        <div className="home-landing-control-scope__ellipse home-landing-control-scope__ellipse--left">
          <Image src="/control/sandbox-e3.svg" alt="" fill unoptimized />
        </div>
        <div className="home-landing-control-scope__icon home-landing-control-scope__icon--a">
          <Image src="/control/sandbox-icon-1.svg" alt="" fill unoptimized />
        </div>
        <div className="home-landing-control-scope__icon home-landing-control-scope__icon--b">
          <Image src="/control/sandbox-icon-2.svg" alt="" fill unoptimized />
        </div>
        <div className="home-landing-control-scope__icon home-landing-control-scope__icon--c">
          <Image src="/control/sandbox-icon-3.svg" alt="" fill unoptimized />
        </div>
      </div>
    </article>
  );
}

export function HomeLandingControl() {
  return (
    <div className="home-landing-control" data-node-id="428:15129">
      <ApprovalCard />
      <AuditCard />
      <ScopeCard />
    </div>
  );
}
