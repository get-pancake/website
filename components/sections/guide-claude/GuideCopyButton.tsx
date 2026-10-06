"use client";

import { useEffect, useRef, useState } from "react";

import { pushAcquisitionEvent } from "@/lib/analytics/data-layer";

/**
 * Copy-to-clipboard for /guides/claude. The text is always in the page (props), so the
 * clipboard write starts synchronously inside the click: the Instagram in-app browser,
 * where most visitors land, refuses writes that happen after an await on the network.
 * Fallback order: the async Clipboard API, then a hidden textarea + execCommand("copy")
 * (older WebViews without navigator.clipboard), then selecting `selectTarget` so the
 * reader can long-press it.
 */
export function GuideCopyButton({
  text,
  blockId,
  label,
  copiedLabel = "Copied",
  copiedMs = 1500,
  className,
  ariaLabel,
  selectTargetId,
}: {
  text: string;
  blockId: string;
  label: string;
  copiedLabel?: string;
  copiedMs?: number;
  className?: string;
  ariaLabel?: string;
  /** id of the element holding the visible text, selected when every copy path fails */
  selectTargetId?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const done = () => {
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), copiedMs);
    pushAcquisitionEvent("guide_claude_copy", { block_id: blockId });
  };

  const fallback = () => {
    if (legacyCopy(text)) {
      done();
      return;
    }
    const target = selectTargetId ? document.getElementById(selectTargetId) : null;
    if (target) {
      const range = document.createRange();
      range.selectNodeContents(target);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  const onClick = () => {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  };

  return (
    <button
      type="button"
      className={className ? `gd-copy ${className}` : "gd-copy"}
      onClick={onClick}
      aria-label={copied ? undefined : ariaLabel}
      data-copied={copied ? "true" : undefined}
    >
      <CopyGlyph done={copied} />
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}

function legacyCopy(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  // off-screen but selectable; 16px keeps iOS from zooming on focus
  area.style.cssText = "position:fixed;top:0;left:-9999px;font-size:16px;opacity:0";
  document.body.appendChild(area);
  area.select();
  area.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

/** Phosphor "Copy" / "Check" (regular), 256 viewBox — the app's icon set. */
function CopyGlyph({ done }: { done: boolean }) {
  return (
    <svg className="gd-copy__icon" viewBox="0 0 256 256" width="16" height="16" aria-hidden="true" focusable="false">
      {done ? (
        <path
          fill="currentColor"
          d="M229.66 77.66l-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z"
        />
      ) : (
        <path
          fill="currentColor"
          d="M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8Zm-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z"
        />
      )}
    </svg>
  );
}
