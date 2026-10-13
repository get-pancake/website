"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useModalA11y } from "@/components/sections/roadmap/useModalA11y";
import {
  STATUS_META,
  TAG_LABELS,
  type RoadmapComment,
  type RoadmapIdea,
} from "@/components/sections/roadmap/roadmap-data";

type Props = {
  /** The idea to show, or null to close. Read live so votes/deletes reflect. */
  idea: RoadmapIdea | null;
  voted: boolean;
  canDelete: boolean;
  /** False while visitor posting is paused (ROADMAP_POSTING_OPEN): the list shows, the form doesn't. */
  canComment: boolean;
  onVote: () => void;
  onDelete: () => void;
  onClose: () => void;
  /** Keep the card's comment count in sync (+1 on post, -1 on delete). */
  onCommentChange?: (delta: number) => void;
};

const BODY_MAX = 2000;

function UpCaret() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 4L13 11H3L8 4Z" fill="currentColor" />
    </svg>
  );
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.floor((Date.now() - then) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** Full-detail view of an idea: full description, vote/delete, and comments. */
export function IdeaDetailModal({
  idea,
  voted,
  canDelete,
  canComment,
  onVote,
  onDelete,
  onClose,
  onCommentChange,
}: Props) {
  const panelRef = useModalA11y(Boolean(idea), onClose);

  const [comments, setComments] = useState<RoadmapComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ideaId = idea?.id ?? null;

  // Load comments whenever the open idea changes.
  useEffect(() => {
    if (!ideaId) {
      setComments([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setBody("");
    setAuthorName("");
    fetch(`/api/roadmap/ideas/${ideaId}/comments`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setComments((d.comments as RoadmapComment[]) ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load comments.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ideaId]);

  if (!idea) return null;
  const status = STATUS_META[idea.status];

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (posting || !idea) return;
    const text = body.trim();
    if (!text) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/roadmap/ideas/${idea.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, authorName: authorName.trim(), website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn't post your comment.");
        return;
      }
      if (data.comment) {
        setComments((prev) => [...prev, data.comment as RoadmapComment]);
        onCommentChange?.(1);
      }
      setBody("");
      setAuthorName("");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPosting(false);
    }
  }

  async function removeComment(c: RoadmapComment) {
    if (!window.confirm("Delete this comment?")) return;
    const prev = comments;
    setComments((list) => list.filter((x) => x.id !== c.id)); // optimistic
    onCommentChange?.(-1);
    try {
      const res = await fetch(`/api/roadmap/comments/${c.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
    } catch {
      setComments(prev); // revert
      onCommentChange?.(1);
      setError("Couldn't delete that comment.");
    }
  }

  return (
    <div
      className="roadmap-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="roadmap-detail-title"
      aria-describedby="roadmap-detail-desc"
    >
      <div className="roadmap-modal__backdrop" aria-hidden onClick={onClose} />
      <div className="roadmap-modal__panel" ref={panelRef} tabIndex={-1}>
        <div className="roadmap-modal__head">
          <h2 id="roadmap-detail-title" className="heading roadmap-modal__title">
            {idea.title}
          </h2>
          <button type="button" className="roadmap-modal__close" aria-label="Close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="roadmap-detail__meta">
          <Badge variant={status.variant}>{status.label}</Badge>
          <span className="roadmap-card__tag">{TAG_LABELS[idea.tag]}</span>
          <span aria-hidden className="roadmap-card__dot">·</span>
          <span>{idea.authorName ?? "Anonymous"}</span>
        </div>

        <p id="roadmap-detail-desc" className="roadmap-detail__desc">
          {idea.description ? idea.description : "No description provided."}
        </p>

        <div className="roadmap-detail__actions">
          <Button type="button" variant={voted ? "subtle" : "brand"} onClick={onVote} aria-pressed={voted}>
            <span className="roadmap-detail__voteinner">
              <UpCaret />
              {voted ? "Upvoted" : "Upvote"} · {idea.voteCount}
            </span>
          </Button>
          {canDelete ? (
            <Button type="button" variant="negative" onClick={onDelete}>
              Delete
            </Button>
          ) : null}
        </div>

        {/* Comments */}
        <section className="roadmap-comments" aria-label="Comments">
          <h3 className="heading roadmap-comments__title">
            {idea.commentCount > 0 ? `Comments (${idea.commentCount})` : "Comments"}
          </h3>

          {loading ? (
            <p className="roadmap-comments__empty">Loading…</p>
          ) : comments.length === 0 ? (
            <p className="roadmap-comments__empty">{canComment ? "No comments yet. Start the discussion." : "No comments yet."}</p>
          ) : (
            <ul className="roadmap-comments__list">
              {comments.map((c) => (
                <li key={c.id} className="roadmap-comment">
                  <div className="roadmap-comment__head">
                    <span className="roadmap-comment__author">{c.authorName ?? "Anonymous"}</span>
                    <span aria-hidden className="roadmap-card__dot">·</span>
                    <span className="roadmap-comment__when">{timeAgo(c.createdAt)}</span>
                    {canDelete ? (
                      <button
                        type="button"
                        className="roadmap-comment__delete"
                        aria-label="Delete comment"
                        onClick={() => removeComment(c)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                  <p className="roadmap-comment__body">{c.body}</p>
                </li>
              ))}
            </ul>
          )}

          {canComment ? (
          <form className="roadmap-comment-form" onSubmit={submitComment}>
            <textarea
              className="textarea roadmap-comment-form__body"
              placeholder="Add a comment…"
              aria-label="Add a comment"
              rows={3}
              maxLength={BODY_MAX}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <div className="roadmap-comment-form__row">
              <input
                className="input roadmap-comment-form__name"
                type="text"
                placeholder="Your name (optional)"
                aria-label="Your name"
                maxLength={80}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
              <Button type="submit" disabled={posting || body.trim().length === 0}>
                {posting ? "Posting…" : "Comment"}
              </Button>
            </div>
            {/* Honeypot */}
            <div className="roadmap-honeypot" aria-hidden>
              <label>
                Website
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </label>
            </div>
            {error ? (
              <p className="roadmap-form__error" role="alert">
                {error}
              </p>
            ) : null}
          </form>
          ) : null}
        </section>
      </div>
    </div>
  );
}
