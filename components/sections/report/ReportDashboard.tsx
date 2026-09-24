"use client";

import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

import { FxButton } from "./FxButton";
import { BoltIcon, MarkIcon } from "./MarkIcon";
import { formatMembers } from "./ScanTheater";
import type { ReportState, ScoreBreakdown } from "./useReport";

/**
 * Owner.com-style locked report: warm score rail on the left, the real report
 * cards behind a blur veil, one centered unlock modal. Email lifts the veil in
 * place — everything teased is real data from this scan.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Grade bands shown under the dial so the number reads at a glance. The
 *  worst band is negative red — pink stays reserved for the brand. */
const GRADES = [
  { label: "Invisible", from: 0, to: 39, color: "var(--negative-stroke)" },
  { label: "In the game", from: 40, to: 69, color: "var(--palette-yellow-30)" },
  { label: "Winning", from: 70, to: 100, color: "var(--palette-green-20)" },
];

function bandFor(score: number) {
  return GRADES.find((g) => score <= g.to) ?? GRADES[GRADES.length - 1]!;
}

/* ── Score rail ── */

function Dial({ score, color }: { score: number; color: string }) {
  const R = 56;
  const C = 2 * Math.PI * R;
  return (
    <div className="rpt-dial">
      <svg viewBox="0 0 140 140" width="140" height="140" aria-hidden>
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--palette-chrome-30)" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - score / 100)}
          transform="rotate(-90 70 70)"
          className="rpt-dial-arc"
        />
      </svg>
      <div className="rpt-dial-num">
        {score}
        <span>of 100</span>
      </div>
    </div>
  );
}

/** One neutral fill for all metric bars — band colors keep a single meaning. */
const SUBS: { key: keyof ScoreBreakdown; label: string }[] = [
  { key: "ai", label: "AI visibility" },
  { key: "google", label: "Google reach" },
  { key: "readiness", label: "Machine readability" },
];

function ScoreRail({ state }: { state: ReportState }) {
  const score = state.score ?? 0;
  const band = bandFor(score);
  return (
    <aside className="rpt-score-rail">
      <p className="rpt-rail-eyebrow">AI GTM score</p>
      <Dial score={score} color={band.color} />
      <p className="rpt-rail-grade">{band.label}</p>
      <ul className="rpt-grade-scale">
        {GRADES.map((g) => (
          <li key={g.label} data-active={g === band}>
            <i style={{ background: g.color }} aria-hidden />
            {g.label}
            <span>
              {g.from}–{g.to}
            </span>
          </li>
        ))}
      </ul>
      {state.breakdown && (
        <ul className="rpt-subscores">
          {SUBS.map((sub) => {
            const s = state.breakdown![sub.key];
            return (
              <li key={sub.key}>
                <span className="rpt-subscore-label">{sub.label}</span>
                <span className="rpt-subscore-val">
                  {s.score} of {s.max}
                </span>
                <span className="rpt-subscore-bar" aria-hidden>
                  <span style={{ width: `${(s.score / s.max) * 100}%` }} />
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {state.potentialScore !== null && (
        <p className="rpt-rail-potential">
          Estimated after fixes: <strong>{state.potentialScore}/100</strong>
        </p>
      )}
    </aside>
  );
}

/* ── Main column cards ── */

function problemsFrom(state: ReportState): string[] {
  const problems: string[] = [];
  for (const check of state.checks) {
    if (!check.pass) problems.push(check.detail);
  }
  const uncited = state.prompts.filter((p) => p.status === "done" && p.cited === false).length;
  if (uncited > 0) {
    problems.push(`ChatGPT skips you in ${uncited} of ${state.prompts.length} buyer questions.`);
  }
  const notRanking = (state.google?.rows ?? []).filter((r) => r.position === null).length;
  if (notRanking > 0) {
    problems.push(`${notRanking} money searches where you don't rank at all.`);
  }
  return problems;
}

function competitorsFrom(state: ReportState): { host: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of state.prompts) {
    for (const d of p.citedDomains ?? []) {
      counts.set(d, (counts.get(d) ?? 0) + 1);
    }
  }
  return Array.from(counts, ([host, count]) => ({ host, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function ProblemsCard({ state }: { state: ReportState }) {
  const problems = problemsFrom(state);
  if (!problems.length) return null;
  return (
    <div className="rpt-dcard">
      <header>
        <h3>
          {problems.length} problem{problems.length > 1 ? "s" : ""} keeping you out of AI answers

        </h3>
        <Badge variant="warning">{problems.length}</Badge>
      </header>
      <ul className="rpt-problems">
        {problems.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

function CompetitorsCard({ state }: { state: ReportState }) {
  const competitors = competitorsFrom(state);
  if (!competitors.length) return null;
  return (
    <div className="rpt-dcard">
      <header>
        <h3>Who ChatGPT recommends instead</h3>
      </header>
      <ol className="rpt-competitors">
        {competitors.map((c, i) => (
          <li key={c.host}>
            <span className="rpt-comp-rank">{i + 1}</span>
            <strong>{c.host}</strong>
            <span className="rpt-comp-count">
              Cited in {c.count} answer{c.count > 1 ? "s" : ""}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function QuestionsCard({ state }: { state: ReportState }) {
  if (!state.prompts.length) return null;
  const cited = state.prompts.filter((p) => p.cited).length;
  return (
    <div className="rpt-dcard">
      <header>
        <h3>Your buyers{"’"} questions on ChatGPT</h3>
        <Badge variant={cited >= state.prompts.length / 2 ? "success" : "warning"}>
          {cited}/{state.prompts.length}
        </Badge>
      </header>
      {state.brain && (
        <p className="rpt-dcard-note">
          <span>Your ICP, as we read it:</span> {state.brain.icp}
        </p>
      )}
      <ul className="rpt-qtable">
        {state.prompts.map((p, i) => (
          <li key={i} data-cited={p.cited}>
            <span className="rpt-qmark" aria-hidden>
              {p.cited !== undefined && <MarkIcon ok={p.cited} size={9} />}
            </span>
            <div>
              <p>{p.prompt}</p>
              {state.unlocked && p.detail && (
                <span className="rpt-qdetail">
                  {p.detail}
                  {p.estimated ? " (estimated)" : ""}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SearchesCard({ state }: { state: ReportState }) {
  const google = state.google;
  if (!google) return null;
  return (
    <div className="rpt-dcard">
      <header>
        <h3>Google money searches</h3>
        <Badge variant="brand-alt-2">{google.toWin} to win</Badge>
      </header>
      {google.commentary && <p className="rpt-dcard-note">{google.commentary}</p>}
      <ul className="rpt-qtable rpt-stable">
        {google.rows.map((row) => (
          <li key={row.term}>
            <span className="rpt-spos" data-far={row.position === null || row.position > 10}>
              {row.position ? `#${row.position}` : "—"}
            </span>
            <div>
              <p>{row.term}</p>
              <span className="rpt-qdetail">{row.detail}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SignalsCard({ state }: { state: ReportState }) {
  const signals = state.signals?.signals ?? [];
  if (!signals.length) return null;
  return (
    <div className="rpt-dcard">
      <header>
        <h3>Buying signals your agents would watch</h3>
        <Badge variant="brand-alt-1">{signals.length}</Badge>
      </header>
      <p className="rpt-dcard-note">
        Not a lead list — public events that mean a buyer is in market this week.
      </p>
      <ul className="rpt-signals">
        {signals.map((s, i) => (
          <li key={s.signal}>
            <span className="rpt-signal-bolt" aria-hidden>
              <BoltIcon size={11} />
            </span>
            <div>
              <strong>{s.signal}</strong>
              {(state.unlocked || i === 0) && (
                <p>
                  {s.why} <span className="rpt-signal-where">Watch: {s.where}</span>
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CommunitiesCard({ state }: { state: ReportState }) {
  const communities = state.signals?.communities ?? [];
  if (!communities.length) return null;
  return (
    <div className="rpt-dcard">
      <header>
        <h3>Where your buyers already ask</h3>
      </header>
      <p className="rpt-dcard-note">
        AI answers quote these threads — showing up here is AI visibility too.
      </p>
      <ul className="rpt-communities">
        {communities.map((c) => {
          const isSub = /^r\/[A-Za-z0-9_]{2,30}$/.test(c.name.trim());
          return (
            <li key={c.name}>
              {isSub ? (
                <a
                  className="rpt-comm-link"
                  href={`https://www.reddit.com/${c.name.trim()}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {c.name}
                </a>
              ) : (
                <strong>{c.name}</strong>
              )}
              {c.members && (
                <span className="rpt-comm-members">
                  {c.membersEstimated ? "~" : ""}
                  {formatMembers(c.members)} members
                </span>
              )}
              {state.unlocked && <p>{c.why}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function OpportunitiesCard({ state }: { state: ReportState }) {
  const opps = state.opportunities;
  if (!opps) return null;
  return (
    <div className="rpt-dcard">
      <header>
        <h3>What the agents would do first</h3>
        <Badge variant="brand-alt-1">+{opps.count}</Badge>
      </header>
      <ul className="rpt-opps">
        {opps.items.map((item, i) => (
          <li key={item.title}>
            <div className="rpt-opp-row">
              <strong>{item.title}</strong>
            </div>
            {(state.unlocked || i === 0) && <p>{item.detail}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PancakeCard() {
  return (
    <div className="rpt-dcard rpt-dcard-cta">
      <header>
        <h3>Pancake fixes this for you</h3>
      </header>
      <p>
        The same agents that ran this scan can run the fixes — llms.txt first, then the
        content behind every search you{"’"}re missing.
      </p>
      <FxButton size="lg" onClick={() => window.open("https://app.getpancake.ai", "_blank")}>
        Put the agents to work
      </FxButton>
    </div>
  );
}

/* ── Unlock modal ── */

function UnlockModal({
  state,
  onUnlock,
}: {
  state: ReportState;
  onUnlock: (email: string) => Promise<{ ok: boolean; message?: string }>;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);

  const competitors = competitorsFrom(state).slice(0, 2);
  const subtitle = competitors.length
    ? `See why ${competitors.map((c) => c.host).join(" and ")} get recommended instead of you.`
    : "Every answer, every search, every fix — free.";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setError("");
    const result = await onUnlock(email);
    setBusy(false);
    if (!result.ok) setError(result.message ?? "That didn't save. Try again.");
  };

  return (
    <div className="rpt-modal-wrap" role="dialog" aria-modal="true" aria-labelledby="rpt-unlock-title">
      <div className="rpt-modal">
        <span className="rpt-modal-lock" aria-hidden>
          <svg viewBox="0 0 16 16" width="15" height="15">
            <rect x="2.5" y="7" width="11" height="7.5" rx="2" fill="currentColor" />
            <path
              d="M5 7V5.2a3 3 0 0 1 6 0V7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <h2 id="rpt-unlock-title">Your full report is ready.</h2>
        <p>{subtitle}</p>
        <form onSubmit={submit}>
          <Input
            ref={inputRef}
            type="email"
            size="lg"
            placeholder="you@company.com"
            value={email}
            error={!!error}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Your work email"
          />
          <FxButton type="submit" size="lg" disabled={busy}>
            {busy ? "Unlocking…" : "Unlock my report"}
          </FxButton>
        </form>
        {error && <p className="rpt-modal-error">{error}</p>}
        <p className="rpt-modal-foot">Free. No spam, one report.</p>
      </div>
    </div>
  );
}

export function ReportDashboard({
  state,
  onUnlock,
}: {
  state: ReportState;
  onUnlock: (email: string) => Promise<{ ok: boolean; message?: string }>;
}) {
  return (
    <section className="rpt-dash" data-locked={!state.unlocked}>
      <ScoreRail state={state} />
      <div className="rpt-dash-main">
        <div className="rpt-veil">
          <ProblemsCard state={state} />
          <CompetitorsCard state={state} />
          <QuestionsCard state={state} />
          <SearchesCard state={state} />
          <SignalsCard state={state} />
          <CommunitiesCard state={state} />
          <OpportunitiesCard state={state} />
          {state.unlocked && <PancakeCard />}
        </div>
      </div>
      {!state.unlocked && <UnlockModal state={state} onUnlock={onUnlock} />}
    </section>
  );
}
