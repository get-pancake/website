"use client";

import { useEffect, useRef } from "react";

import { useAudience } from "./LpAudience";
import { LpAgentPrompt } from "./LpAgentPrompt";
import { ClaudeMark, CodexMark, HermesMark, OpenClawMark } from "./LpAgentMarks";

/** The font the agents view is set in (Geist Mono, audience-agents.css @font-face) is fetched on
 *  first use — humans never download it. Asking for it by the element's own computed family
 *  works whatever the token resolves to. */
const loadAgentFont = (el: Element) =>
  document.fonts.load(`400 16px ${getComputedStyle(el).fontFamily}`);

/**
 * The agents view, all of it (founder 2026-11-01: "Keep the toggle. The blue view shows only the
 * one-line install, large, with its copy button and the agents' marks. No code wall, no tile
 * game."): a short heading, the install box (LpAgentPrompt) and the "friends with" row of marks
 * under it. Production label "friends with" (founder #289) and production's marks, minus Cursor
 * since 2026-10-13 (launch audit): the guide, install.md and llms.txt all say "Cursor can't
 * connect yet", so its mark does not sit under "friends with" until it can.
 *
 * It fills the hero's top, where the humans view has its rainbow (2026-11-01, second pass: the
 * block first hung under the toggle and left the top half of the screen empty). In the DOM it
 * follows the toggle (LpHero), so the tab order is switch, then copy. It never moves the toggle:
 * the hidden human copy keeps sizing the hero, and this block takes no room of its own
 * (audience-agents.css: on desktop it stands on the toggle's row, the marks beside the toggle;
 * on tall phones it stacks above the toggle; on tablets and shorter phones the heading goes above
 * the toggle and the box and marks under it). Not rendered in the humans view (display: none).
 * Owner: agents-view package; styles in audience-agents.css.
 *
 * The heading keeps the agents view's terminal prompt ("> ", read as decoration only). It is the
 * page's heading in this view, where the human H1 is aria-hidden; a span-like paragraph, not a
 * second <h1>, so crawlers keep one H1.
 */
export function LpAgentStart() {
  const { audience } = useAudience();
  const agents = audience === "agents";
  const heading = useRef<HTMLParagraphElement>(null);

  // Warm-up (humans view): hovering, focusing or touching the toggle starts the 31 kB font fetch,
  // so it is usually there before the switch's 180 ms fade ends.
  useEffect(() => {
    const el = heading.current;
    const selector = el?.closest(".lp-hero")?.querySelector(".lp-audience-selector");
    if (!el || !selector) return;
    const warm = () => {
      void loadAgentFont(el).catch(() => {});
      for (const type of ["pointerenter", "focusin", "touchstart"]) selector.removeEventListener(type, warm);
    };
    for (const type of ["pointerenter", "focusin", "touchstart"]) selector.addEventListener(type, warm, { passive: true });
    return () => {
      for (const type of ["pointerenter", "focusin", "touchstart"]) selector.removeEventListener(type, warm);
    };
  }, []);

  // Two groups, so tablets and short phones can set the heading above the toggle and the box and
  // marks under it (audience-agents.css); elsewhere they stack above the toggle.
  return <div className="lp-agent-start" role="group" aria-label="Set up Pancake">
    <div className="lp-agent-start__head">
      <p
        ref={heading}
        className="lp-agent-start__heading"
        role={agents ? "heading" : undefined}
        aria-level={agents ? 1 : undefined}
      >
        <span aria-hidden="true">{"> "}</span>
        Paste this <br />into your agent
      </p>
    </div>
    <div className="lp-agent-start__body">
      <LpAgentPrompt />
      <div className="lp-agent-friends">
        <span>friends with</span>
        <ul aria-label="Agent logos">
          <li title="Claude Code"><ClaudeMark /></li>
          <li title="Codex"><CodexMark /></li>
          <li title="Hermes"><HermesMark /></li>
          <li title="OpenClaw"><OpenClawMark /></li>
        </ul>
      </div>
    </div>
  </div>;
}
