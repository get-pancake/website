"use client";

import { LpAgentPrompt } from "./LpAgentPrompt";
import { ClaudeMark, CodexMark, CursorMark, HermesMark, OpenClawMark } from "./LpAgentMarks";

/**
 * The agents view's hero column (Figma V2 4939:3725 under the toggle): the install box
 * (4939:3751, LpAgentPrompt) then the "friends with" row UNDER it (4940:4756; production had it
 * above the black terminal). Production label "friends with" (founder #289; V2 draws "Friends
 * with") and production's five marks (V2 draws three marks twice). Owner: agents-view package;
 * styles in audience-agents.css. The column must stay no taller than the human column (lede +
 * buttons) it overlays in the hero's swap cell — 142 vs 144 at desktop — so the toggle never moves.
 */
export function LpAgentStart() {
  return <div className="lp-agent-start" role="group" aria-label="Set up Pancake">
    <LpAgentPrompt variant="hero" />
    <div className="lp-agent-friends">
      <span>friends with</span>
      <ul aria-label="Agent logos">
        <li title="Claude Code"><ClaudeMark /></li>
        <li title="Codex"><CodexMark /></li>
        <li title="Cursor" data-bare=""><CursorMark /></li>
        <li title="Hermes"><HermesMark /></li>
        <li title="OpenClaw"><OpenClawMark /></li>
      </ul>
    </div>
  </div>;
}
