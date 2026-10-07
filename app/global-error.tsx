"use client";

import { useEffect } from "react";

/**
 * Root-level error UI (replaces root layout when the error bubbles here).
 * Keeps dependencies minimal so this chunk always loads.
 *
 * 2026-10-07: fixed copy instead of the raw error.message, a full reload
 * (a stale tab's missing chunks need fresh HTML) and a way home; the error
 * itself goes to the console only.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fafafa", color: "#0a0a0a" }}>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            maxWidth: "28rem",
            margin: "0 auto",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem 1rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Something broke on our side.</h1>
          <p style={{ fontSize: "0.875rem", color: "#404040" }}>Reload the page.</p>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                border: "2px solid #0a0a0a",
                background: "#FF8FA3",
                padding: "0.5rem 1rem",
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
      </body>
    </html>
  );
}
