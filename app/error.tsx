"use client";

import { useEffect } from "react";

/**
 * Keep this file dependency-light (inline styles only) so the error chunk always
 * loads in dev — Tailwind/custom classes here can contribute to
 * “missing required error components, refreshing…”.
 *
 * 2026-10-07: fixed copy instead of the raw error.message (it printed
 * internals to visitors), and a full reload rather than reset(): the usual
 * cause is a tab still running a previous deploy whose chunks are gone, which
 * only fresh HTML fixes. The error itself goes to the console only.
 */
export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "50vh",
        maxWidth: "32rem",
        margin: "0 auto",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "2rem 1rem",
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#0a0a0a" }}>Something broke on our side.</h1>
      <p style={{ fontSize: "0.875rem", color: "#404040" }}>Reload the page.</p>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            border: "3px solid #0a0a0a",
            background: "#FF8FA3",
            padding: "0.75rem 1.5rem",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          Reload
        </button>
        <a href="/" style={{ color: "#0a0a0a", fontSize: "0.875rem", fontWeight: 600, textDecoration: "underline" }}>
          Back to Pancake
        </a>
      </div>
    </div>
  );
}
