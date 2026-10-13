"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CreateIdeaModal } from "@/components/sections/roadmap/CreateIdeaModal";
import { IdeaDetailModal } from "@/components/sections/roadmap/IdeaDetailModal";
import {
  ROADMAP_POSTING_OPEN,
  ROADMAP_TABS,
  STATUS_META,
  TAG_LABELS,
  type RoadmapIdea,
  type RoadmapTab,
  type RoadmapTag,
} from "@/components/sections/roadmap/roadmap-data";

const VOTES_STORAGE_KEY = "pancake-roadmap-votes";
const VOTER_TOKEN_KEY = "pancake-roadmap-voter";
/** Ideas shown per page; "Show more" reveals another batch. */
const PAGE_SIZE = 15;

type Props = {
  initialIdeas: RoadmapIdea[];
  /** True when Supabase is live (enables posting + persisted votes). */
  backendEnabled: boolean;
  /** Server-resolved: does the current request carry a valid admin cookie? */
  isAdmin: boolean;
  /** True when the server fetch hit its row cap (more ideas exist than loaded). */
  truncated?: boolean;
};

function CaretUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 4L13 11H3L8 4Z" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 12L15.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Stable per-browser id used to dedup anonymous votes. */
function getVoterToken(): string {
  try {
    let token = window.localStorage.getItem(VOTER_TOKEN_KEY);
    if (!token) {
      token =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `v_${Math.random().toString(36).slice(2)}${Date.now()}`;
      window.localStorage.setItem(VOTER_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return "anon-no-storage";
  }
}

export function RoadmapBoard({
  initialIdeas,
  backendEnabled,
  isAdmin,
  truncated = false,
}: Props) {
  const router = useRouter();
  const [ideas, setIdeas] = useState<RoadmapIdea[]>(initialIdeas);
  const [activeTab, setActiveTab] = useState<RoadmapTab>("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  // Visitors can post and comment only while ROADMAP_POSTING_OPEN; admins always can.
  const canPost = ROADMAP_POSTING_OPEN || isAdmin;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [notice, setNotice] = useState<string | null>(null);

  // Restore prior votes (button state) from localStorage.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(VOTES_STORAGE_KEY);
      if (raw) setVotedIds(JSON.parse(raw) as string[]);
    } catch {
      /* private mode — votes just won't persist */
    }
  }, []);

  // Debounce search (PRD: instant, debounced 300ms).
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 300);
    return () => window.clearTimeout(t);
  }, [query]);

  // Reset pagination whenever the filtered set changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab, debouncedQuery]);

  // Functional updater so concurrent in-flight votes (and their reverts on
  // failure) compose instead of clobbering each other via a stale closure.
  const persistVoted = useCallback((update: (prev: string[]) => string[]) => {
    setVotedIds((prev) => {
      const next = update(prev);
      try {
        window.localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const setIdeaVotes = useCallback((id: string, voteCount: number) => {
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, voteCount } : i)));
  }, []);

  const adjustCommentCount = useCallback((id: string, delta: number) => {
    setIdeas((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, commentCount: Math.max(0, i.commentCount + delta) } : i,
      ),
    );
  }, []);

  async function toggleVote(idea: RoadmapIdea) {
    const hasVoted = votedIds.includes(idea.id);
    const delta = hasVoted ? -1 : 1;

    // Optimistic UI.
    persistVoted((prev) =>
      hasVoted
        ? prev.filter((x) => x !== idea.id)
        : prev.includes(idea.id)
          ? prev
          : [...prev, idea.id],
    );
    setIdeaVotes(idea.id, Math.max(0, idea.voteCount + delta));

    if (!backendEnabled) return; // preview mode: local-only

    try {
      const res = await fetch(`/api/roadmap/ideas/${idea.id}/vote`, {
        method: hasVoted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterToken: getVoterToken() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "vote failed");
      if (typeof data.voteCount === "number") setIdeaVotes(idea.id, data.voteCount);
    } catch {
      // Revert only this idea's vote — leave other in-flight votes intact.
      persistVoted((prev) =>
        hasVoted
          ? prev.includes(idea.id)
            ? prev
            : [...prev, idea.id]
          : prev.filter((x) => x !== idea.id),
      );
      setIdeaVotes(idea.id, idea.voteCount);
      setNotice("Couldn't save your vote. Try again.");
    }
  }

  async function deleteIdea(idea: RoadmapIdea) {
    if (!window.confirm(`Delete “${idea.title}”? This can't be undone.`)) return;
    const prev = ideas;
    setIdeas((list) => list.filter((i) => i.id !== idea.id)); // optimistic (also closes detail modal)
    try {
      const res = await fetch(`/api/roadmap/ideas/${idea.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      setNotice("Idea deleted."); // announce via the live region (modal already closed)
    } catch {
      setIdeas(prev); // revert (would re-open the detail modal) …
      setSelectedId(null); // … so close it, otherwise it covers the notice
      setNotice("Couldn't delete that idea. Your admin session may have expired.");
    }
  }

  async function handleLogout() {
    await fetch("/api/roadmap/logout", { method: "POST" }).catch(() => {});
    router.refresh();
  }

  function onCreated(idea: RoadmapIdea) {
    setIdeas((prev) => [idea, ...prev]);
    setNotice(null);
    // Make the new idea reachable on the board after the modal closes: a 0-vote
    // idea sorts to the bottom and could be hidden by the active tab/search or
    // pagination. Switch to its tag, clear search, reset to page 1.
    setActiveTab(idea.tag);
    setQuery("");
    setDebouncedQuery("");
    setVisibleCount(PAGE_SIZE);
    // Open it directly as confirmation that it posted.
    setSelectedId(idea.id);
  }

  const defaultTag: RoadmapTag = activeTab === "all" ? "squads" : activeTab;

  const filteredIdeas = useMemo(() => {
    return ideas
      .filter((idea) => activeTab === "all" || idea.tag === activeTab)
      .filter((idea) => {
        if (!debouncedQuery) return true;
        return (
          idea.title.toLowerCase().includes(debouncedQuery) ||
          idea.description.toLowerCase().includes(debouncedQuery)
        );
      })
      .slice()
      .sort((a, b) => b.voteCount - a.voteCount);
  }, [ideas, activeTab, debouncedQuery]);

  const visibleIdeas = filteredIdeas.slice(0, visibleCount);
  const remaining = filteredIdeas.length - visibleIdeas.length;

  const selectedIdea = selectedId ? ideas.find((i) => i.id === selectedId) ?? null : null;

  return (
    <div className="roadmap-board">
      {/* Tabs = tags */}
      <div className="roadmap-tabs" role="tablist" aria-label="Filter ideas by category">
        {ROADMAP_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className="roadmap-tab"
              data-active={isActive ? "" : undefined}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Toolbar: search + share */}
      <div className="roadmap-toolbar">
        <div className="roadmap-search">
          <span className="roadmap-search__icon" aria-hidden>
            <SearchIcon />
          </span>
          <input
            type="search"
            className="input roadmap-search__input"
            placeholder="Search ideas…"
            aria-label="Search ideas"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {canPost ? (
          <Button type="button" className="roadmap-share" onClick={() => setCreateOpen(true)}>
            + Share an idea
          </Button>
        ) : null}
      </div>

      {notice ? (
        <p className="roadmap-notice" role="status">
          {notice}
        </p>
      ) : null}

      {/* Idea list */}
      {visibleIdeas.length === 0 ? (
        <p className="roadmap-empty">
          {query.trim()
            ? `No ideas match “${query.trim()}”.`
            : "No ideas yet. Be the first to share one."}
        </p>
      ) : (
        <>
          <ul className="roadmap-list">
            {visibleIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                voted={votedIds.includes(idea.id)}
                canDelete={isAdmin}
                onVote={() => toggleVote(idea)}
                onDelete={() => deleteIdea(idea)}
                onOpen={() => setSelectedId(idea.id)}
              />
            ))}
          </ul>

          {remaining > 0 ? (
            <div className="roadmap-showmore">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                Show {Math.min(PAGE_SIZE, remaining)} more
              </Button>
              <span className="roadmap-showmore__count">
                Showing {visibleIdeas.length} of {filteredIdeas.length}
              </span>
            </div>
          ) : truncated ? (
            <p className="roadmap-showmore__count">
              Showing the top {filteredIdeas.length}. Search to find more.
            </p>
          ) : filteredIdeas.length > PAGE_SIZE ? (
            <p className="roadmap-showmore__count">Showing all {filteredIdeas.length}</p>
          ) : null}
        </>
      )}

      {/* Admin / auth bar — at the bottom, intentionally understated. Sign-in
          lives on the hidden /open-roadmap/admin page (Google), not here. */}
      {!backendEnabled || isAdmin ? (
        <div className="roadmap-authbar">
          {!backendEnabled ? (
            <span className="roadmap-authbar__note">
              Preview mode: connect Supabase to enable posting and saved votes.
            </span>
          ) : (
            <span className="roadmap-authbar__note">
              Admin mode ·{" "}
              <button type="button" className="roadmap-authbar__link" onClick={handleLogout}>
                Sign out
              </button>
            </span>
          )}
        </div>
      ) : null}

      <CreateIdeaModal
        open={createOpen}
        defaultTag={defaultTag}
        onClose={() => setCreateOpen(false)}
        onCreated={onCreated}
      />

      <IdeaDetailModal
        idea={selectedIdea}
        voted={selectedIdea ? votedIds.includes(selectedIdea.id) : false}
        canDelete={isAdmin}
        canComment={canPost}
        onVote={() => selectedIdea && toggleVote(selectedIdea)}
        onDelete={() => selectedIdea && deleteIdea(selectedIdea)}
        onClose={() => setSelectedId(null)}
        onCommentChange={(delta) => selectedIdea && adjustCommentCount(selectedIdea.id, delta)}
      />
    </div>
  );
}

function IdeaCard({
  idea,
  voted,
  canDelete,
  onVote,
  onDelete,
  onOpen,
}: {
  idea: RoadmapIdea;
  voted: boolean;
  canDelete: boolean;
  onVote: () => void;
  onDelete: () => void;
  onOpen: () => void;
}) {
  const status = STATUS_META[idea.status];
  return (
    <li className="roadmap-card">
      <button
        type="button"
        className="roadmap-vote"
        data-voted={voted ? "" : undefined}
        aria-pressed={voted}
        aria-label={`Upvote “${idea.title}”, ${idea.voteCount} votes`}
        onClick={onVote}
      >
        <CaretUpIcon />
        <span className="roadmap-vote__count">{idea.voteCount}</span>
      </button>

      <div className="roadmap-card__body">
        {/* Clickable region → detail modal. Excludes the vote + delete buttons. */}
        <div
          className="roadmap-card__main"
          role="button"
          tabIndex={0}
          aria-label={`Open details for “${idea.title}”`}
          onClick={onOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpen();
            }
          }}
        >
          <div className="roadmap-card__head">
            <h3 className="heading roadmap-card__title">{idea.title}</h3>
            <Badge variant={status.variant} className="roadmap-card__status">
              {status.label}
            </Badge>
          </div>
          {idea.description ? <p className="roadmap-card__desc">{idea.description}</p> : null}
        </div>

        <div className="roadmap-card__meta">
          <span className="roadmap-card__tag">{TAG_LABELS[idea.tag]}</span>
          <span aria-hidden className="roadmap-card__dot">·</span>
          <span>{idea.authorName ?? "Anonymous"}</span>
          <span aria-hidden className="roadmap-card__dot">·</span>
          <span>
            {idea.commentCount} {idea.commentCount === 1 ? "comment" : "comments"}
          </span>
          {canDelete ? (
            <>
              <span aria-hidden className="roadmap-card__dot">·</span>
              <button type="button" className="roadmap-card__delete" onClick={onDelete}>
                Delete
              </button>
            </>
          ) : null}
        </div>
      </div>
    </li>
  );
}
