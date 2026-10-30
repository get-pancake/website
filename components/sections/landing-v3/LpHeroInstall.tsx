"use client";

import { useEffect, useId, useRef, useState } from "react";

import { GuideCopyButton } from "@/components/sections/guide-claude/GuideCopyButton";

import { ClaudeMark, CodexMark } from "./LpAgentMarks";
import { SETUP_LINE } from "./LpSetupLine";

/**
 * The hero's install row (founder 2026-10-30, sending a screen recording of an infrastructure
 * homepage whose hero has "or install directly with" and its agents' marks under the buttons:
 * "On peut tenter un truc comme ca dans le h1 ???"). Under Start free / Talk to sales: "or
 * install in" and the Claude and Codex marks. Pointing at it (or pressing it) lays a card over
 * the buttons: "Paste in Claude Code or Codex", the copy button the final CTA's setup pill uses
 * (its own Copied state), and the line itself, the guide's install.md line (SETUP_LINE), so the
 * visitor sees what they paste. The For agents view keeps the designer's install box
 * (LpAgentStart); this is the shortcut in the human view.
 *
 * From 1280 wide only (setup.css): the row takes the slot under the buttons that Product Hunt's
 * badge leaves for the nav there, out of flow, so the first screen's measured layout does not
 * move; under 1280 the badge keeps that slot.
 *
 * A disclosure: the card opens on hover (CSS), and on a press of the row (data-open, for touch
 * and keyboard), and closes on Escape (focus back on the row), on a press outside or when focus
 * leaves it. Closed, the card is visibility: hidden, so its copy button is out of the tab order.
 * The copy pushes no analytics event (track={false}), as the CTA's pill.
 */
export function LpHeroInstall() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const cardId = useId();

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className="lp-hero-install"
      data-open={open ? "" : undefined}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="lp-hero-install__row"
        aria-expanded={open}
        aria-controls={cardId}
        aria-label="Install Pancake in Claude Code or Codex"
        onClick={() => setOpen((o) => !o)}
      >
        <span>or install in</span>
        <span className="lp-hero-install__marks" aria-hidden="true">
          <span className="lp-hero-install__mark lp-hero-install__mark--claude">
            <ClaudeMark />
          </span>
          <span className="lp-hero-install__mark">
            <CodexMark />
          </span>
        </span>
      </button>
      <div id={cardId} className="lp-hero-install__card" role="group" aria-label="Install Pancake in Claude Code or Codex">
        <div className="lp-hero-install__head">
          <p className="lp-hero-install__title">Paste in Claude Code or Codex</p>
          <GuideCopyButton
            text={SETUP_LINE}
            blockId="home-hero-install"
            label="Copy"
            ariaLabel="Copy the one-line setup for Claude Code or Codex"
            track={false}
          />
        </div>
        <p className="lp-hero-install__line">{SETUP_LINE}</p>
      </div>
    </div>
  );
}
