"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DemoAnswers } from "@/lib/demo-qualification";
type Row = {
  id: string;
  created_at: string;
  answers: DemoAnswers;
  status: string;
  research_state: string;
  research: {
    summary?: string;
    sources?: Array<{ url: string; title: string }>;
  } | null;
  notes: string;
  email_state: string;
  crm_state: string;
};
export default function ReviewQueue({
  rows,
  reviewer,
}: {
  rows: Row[];
  reviewer: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(rows[0]?.id);
  const [notes, setNotes] = useState(rows[0]?.notes || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const row = rows.find((r) => r.id === selected);
  const a = row?.answers;
  async function act(action: string) {
    if (!row || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/demo-review/${row.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok)
        throw Error(result.error || "Action failed. Refresh and try again.");
      setMessage(
        action === "approve"
          ? "Invitation accepted by the mail provider."
          : action === "research"
            ? "Research updated."
            : "Marked for self-serve. No invitation sent.",
      );
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="lp lp-demo request-preview">
      <header className="request-nav">
        <a href="/demo">Pancake · Demo requests</a>
        <span>{reviewer}</span>
      </header>
      <section className="request-review">
        <h1 className="lp-display">Review before inviting.</h1>
        <p>
          Research is evidence to check. Only your approval sends a calendar
          invitation.
        </p>
        <button className="preview-link" onClick={() => router.refresh()}>
          Refresh queue
        </button>
        <p role="status">{message}</p>
        <div className="review-grid">
          <aside className="review-list">
            {rows.length === 0 && <p>No demo requests yet.</p>}
            {rows.map((r) => (
              <button
                key={r.id}
                aria-pressed={r.id === selected}
                onClick={() => {
                  setSelected(r.id);
                  setNotes(r.notes);
                  setMessage("");
                }}
              >
                <strong>{r.answers.name}</strong>
                <span>{r.answers.website}</span>
                <small>
                  {r.status} · {r.research_state}
                </small>
              </button>
            ))}
          </aside>
          {row && a && (
            <article className="request-card review-detail">
              <span className="request-badge">{row.status}</span>
              <h2 className="lp-display">{a.name}</h2>
              <p>
                {a.email} · {a.role}
              </p>
              <dl>
                {Object.entries(a)
                  .filter(([k]) => !["name", "email", "role"].includes(k))
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt>
                        {{
                          website: "Company website",
                          size: "Company size",
                          goal: "Goal",
                          service: "Service",
                          budget: "Budget",
                          salesTeam: "Outbound team",
                          sequencer: "Current outbound tool",
                          volume: "Monthly prospect volume",
                        }[k] || k}
                      </dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
              </dl>
              <section className="request-offer research-preview">
                <h3 className="lp-display">Company & person research</h3>
                <p>Status: {row.research_state}</p>
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {row.research?.summary ||
                    "Queued for automatic research. The report will include sources and identity uncertainty."}
                </p>
                {row.research?.sources?.map((s, i) => (
                  <p key={i}>
                    <a href={s.url} target="_blank" rel="noreferrer">
                      {s.title}
                    </a>
                  </p>
                ))}
                {row.status === "pending" &&
                  ["failed", "queued"].includes(row.research_state) && (
                    <button disabled={busy} onClick={() => act("research")}>
                      Run research now
                    </button>
                  )}
              </section>
              <label htmlFor="review-notes">Your research and notes</label>
              <textarea
                id="review-notes"
                rows={4}
                className="demo-form__input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p>
                CRM: {row.crm_state} · Invitation: {row.email_state}
              </p>
              {row.status === "pending" && (
                <div className="request-actions">
                  <button
                    disabled={busy}
                    className="lp-btn lp-btn--primary"
                    onClick={() => act("approve")}
                  >
                    {busy ? "Working…" : "Approve & send invitation →"}
                  </button>
                  <button
                    disabled={busy}
                    className="preview-link"
                    onClick={() => act("self_serve")}
                  >
                    Recommend self-serve
                  </button>
                </div>
              )}
              {["unknown", "sending"].includes(row.email_state) && (
                <p role="alert">
                  Delivery needs checking in the mail provider. Do not send a
                  duplicate invitation.
                </p>
              )}
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
