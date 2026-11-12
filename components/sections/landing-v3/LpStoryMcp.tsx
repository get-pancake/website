import { ClaudeMark } from "./LpAgentMarks";
import type { DiveStageProps } from "./lp-dive-stages";
import { skF3 } from "./LpStoryKit";
import { lpClaudeSerif } from "./lp-claude-font";
import { PANCAKE_AVATAR } from "./lp-pancake-avatar-art";
import { SMCP_ICONS, type StoryMcpIconId } from "./lp-story-mcp-art";
import { STORY_MCP } from "./lp-story-mcp-data";

/**
 * SINCE 2026-11-11 THE WINDOW IS CLAUDE'S (lp-story-mcp-data.ts has why): Claude's spark and name
 * top left, its serif (lp-claude-font.ts, the variable on the root) for the home line and the
 * answer, its composer. The layers and the contract below are unchanged; read "Codex" as "the
 * agent's window".
 *
 * Deep-dive story 4, "Codex at work" (the item "Built for Claude and Codex"; 2026-11-01, founder:
 * "Maybe we could just do a screenshot of codex doing stuff like in the h1") — the stage markup.
 * Owner: story-mcp package. Contract: lp-dive-stages.ts (server-safe: no hooks, no "use client",
 * no lib/placeholders import; one root with data-lp-story="mcp" + aria-hidden, the shell's host
 * carries the ALT; the markup IS the END picture; it paints nothing behind its window). Copy:
 * lp-story-mcp-data.ts; icons: lp-story-mcp-art.ts; styles: story-mcp.css; motion:
 * lp-story-mcp-timeline.ts.
 *
 * Codex's window at the end of one job, in the homepage demo's own look: the markup of
 * LpClaudeScene.tsx (the demo's Claude & Codex view), COPIED and cut to this picture, never
 * imported. That scene's markup rests on the app's empty home and its styles live under the demo
 * window's `.lp-demowin` scope; a story's markup rests on its END. So the pieces are the demo's
 * (the title and mark, the user's bubble, the tool calls as Codex's log lines under the Pancake
 * mark, the answer line, the Play's result card, the composer with its connector chip), placed
 * in the dive's 752×489 box (story-mcp.css copies demo.css's rules for them).
 *
 * Layers, back to front:
 *   .lp-smcp-win          the window (712×449, 20 px inside the box): white, the demo window's
 *                         shadow
 *     .lp-smcp-title      Codex's mark and name, top left
 *     .lp-smcp-greet      Codex's home line, centred: frame 0 only, hidden at rest
 *     .lp-smcp-thread     the job, one column: the ask's bubble, Pancake's three steps (each a
 *                         log line: the Pancake mark, the step, what it is doing then "Done"),
 *                         Codex's answer line and the Play's card (its name, two rows). Each
 *                         piece carries .lp-sk-rise: the timeline raises it into place
 *     .lp-smcp-bar        the composer, docked at the bottom: the plus, what is typed in it (the
 *                         placeholder before the ask, the ask while it types, then the follow-up
 *                         placeholder, which rests), the Pancake connector, the mic, the send.
 *                         Phones leave it out, and the answer line (story-mcp.css): the ask types
 *                         in its bubble's words there (.lp-smcp-bubble-t)
 *
 * Every element is in the markup: the timeline hides what comes later (frame 0) and never adds
 * one; the home line, the first placeholder, the typed ask, the caret and the steps' running
 * words rest hidden, so the END never shows them. Nothing here is focusable, and nothing carries
 * its own accessible name: the root is aria-hidden and the ALT says what the window shows.
 */

/** The Pancake mark, full colour (LpClaudeScene.tsx PancakeMark, copied): the connector chip's,
    each step's and the Play card's */
function PancakeMark({ className }: { className: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${PANCAKE_AVATAR.size} ${PANCAKE_AVATAR.size}`}>
      {PANCAKE_AVATAR.shapes.map((shape, i) => (
        <path key={i} d={shape.d} fill={shape.fill} opacity={"opacity" in shape ? shape.opacity : undefined} />
      ))}
    </svg>
  );
}

/** One of the demo's icons (lp-story-mcp-art.ts), a stroke in currentColor */
function McpIcon({ id, className }: { id: StoryMcpIconId; className: string }) {
  const icon = SMCP_ICONS[id];
  return (
    <svg
      className={className}
      viewBox={icon.viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={icon.stroke}
      strokeLinecap="round"
      strokeLinejoin={icon.join}
    >
      {icon.circle && <circle cx={icon.circle.cx} cy={icon.circle.cy} r={icon.circle.r} />}
      {icon.rect && (
        <rect x={icon.rect.x} y={icon.rect.y} width={icon.rect.width} height={icon.rect.height} rx={icon.rect.rx} />
      )}
      <path d={icon.d} />
    </svg>
  );
}

export function LpStoryMcpStage(_props: DiveStageProps) {
  const s = STORY_MCP;
  const win = {
    left: `${skF3(s.window.x)}px`,
    top: `${skF3(s.window.y)}px`,
    width: `${skF3(s.window.w)}px`,
    height: `${skF3(s.window.h)}px`,
  };

  return (
    <div className={`lp-sk lp-smcp ${lpClaudeSerif.variable}`} data-lp-story="mcp" aria-hidden="true">
      <div className="lp-sk-scene">
        <div className="lp-smcp-win" style={win}>
          <p className="lp-smcp-title">
            <span className="lp-smcp-title-mark">
              <ClaudeMark />
            </span>
            {s.title}
          </p>
          <p className="lp-smcp-greet">{s.greeting}</p>

          {/* the job: the ask, Pancake's steps, the answer and the Play */}
          <div className="lp-smcp-thread">
            <p className="lp-smcp-bubble lp-sk-rise">
              <span className="lp-smcp-bubble-t">{s.ask.text}</span>
            </p>
            <ul className="lp-smcp-steps">
              {s.steps.map((step, k) => (
                <li key={step.text} className="lp-smcp-step lp-sk-rise" data-order={k}>
                  <PancakeMark className="lp-smcp-mark" />
                  <span className="lp-smcp-step-t">{step.text}</span>
                  <span className="lp-smcp-step-r">
                    <span className="lp-smcp-doing">{step.doing}</span>
                    <span className="lp-smcp-done">{step.done}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="lp-smcp-say lp-sk-rise">{s.result.text}</p>
            <div className="lp-smcp-play lp-sk-rise">
              <p className="lp-smcp-play-h">
                <PancakeMark className="lp-smcp-mark" />
                <span className="lp-smcp-play-k">{s.play.kicker}</span>
                <span className="lp-smcp-play-n">{s.play.name}</span>
              </p>
              <ul className="lp-smcp-play-rows">
                {s.play.rows.map((row) => (
                  <li key={row.name} className="lp-smcp-play-row">
                    <span className="lp-smcp-play-key">{row.name}</span>
                    <span className="lp-smcp-play-v">
                      {typeof row.value === "string"
                        ? row.value
                        : row.value.map((word) => (
                            <span key={word} className="lp-smcp-chip">
                              {word}
                            </span>
                          ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* the composer, docked: what is typed in it, then the connector and the controls */}
          <div className="lp-smcp-bar">
            <McpIcon id="plus" className="lp-smcp-plus" />
            <span className="lp-smcp-field">
              <span className="lp-smcp-ph">{s.placeholder}</span>
              <span className="lp-smcp-typed">{s.ask.text}</span>
              <span className="lp-smcp-reply">{s.reply}</span>
              <span className="lp-smcp-caret" />
            </span>
            <span className="lp-smcp-conn">
              <PancakeMark className="lp-smcp-conn-mark" />
              {s.connector}
              <i />
            </span>
            <McpIcon id="mic" className="lp-smcp-mic" />
            <span className="lp-smcp-send">
              <McpIcon id="up" className="lp-smcp-send-arrow" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
