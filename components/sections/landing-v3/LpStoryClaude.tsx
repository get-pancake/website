import { Fragment } from "react";
import { SiOpenai } from "react-icons/si";

import { lpClaudeSerif } from "./lp-claude-font";
import type { DiveStageProps } from "./lp-dive-stages";
import { SC_PLUG, SC_PLUS, SC_SEND_ARROW, SC_SPARK } from "./lp-story-claude-art";
import { STORY_CLAUDE } from "./lp-story-claude-data";

/**
 * Deep-dive story "Run it from Claude or Codex" — the stage markup (Figma 4964:2575 / 3930 / 3981).
 * Owner: story-claude package. Contract: lp-dive-stages.ts (server-safe, one root with
 * data-lp-story="claude" + aria-hidden, rest markup = the END picture, paints nothing behind
 * the scene; geometry in app/_styles/landing-v3/story-claude.css).
 *
 * A Claude chat in two scenes inside one camera (.lp-sc-cam):
 * - HOME (frame 01): the spark greeting and the composer with the prompt typed, Chat/Cowork,
 *   "Opus 5 High", the send button, Project/Manual. Hidden at rest (visibility, so it stays laid
 *   out: the builder measures the prompt's glyphs).
 * - CHAT (frames 02-03): the user bubble (desktop: cropped by the stage at "…B2B Sa", the
 *   camera zoom the designer drew), Claude's reply, the connector row ("Connecting...", hidden at
 *   rest), "11 leads found" and, in dev/preview only, the follow-up line (founder Q3).
 * The two corner marks (Codex + Claude) sit outside the camera. Streamed lines are split in word
 * spans here (font-independent reveal: the serif may still be loading when the builder runs).
 */

const SERIF = lpClaudeSerif.variable;

/** a line streamed word by word: one span per word, real spaces between (no per-char layer) */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          {i > 0 ? " " : null}
          <span className="lp-sc-w">{word}</span>
        </Fragment>
      ))}
    </>
  );
}

export function LpStoryClaudeStage({ placeholders }: DiveStageProps) {
  const c = STORY_CLAUDE;
  const followUpFinal = c.followUp.status === "final";
  const showFollowUp = followUpFinal || placeholders;
  return (
    <div data-lp-story="claude" className={SERIF ? `lp-sc ${SERIF}` : "lp-sc"} aria-hidden="true">
      <div className="lp-sc-cam">
        <div className="lp-sc-home">
          <div className="lp-sc-hello">
            <svg className="lp-sc-spark" viewBox={SC_SPARK.viewBox} fill="none" focusable="false">
              <path d={SC_SPARK.d} fill="currentColor" />
            </svg>
            <p className="lp-sc-greet">{c.greeting}</p>
          </div>
          <div className="lp-sc-composer">
            <p className="lp-sc-prompt">{c.prompt}</p>
            <div className="lp-sc-ctrl">
              <svg className="lp-sc-plus" viewBox={SC_PLUS.viewBox} fill="none" focusable="false">
                <path d={SC_PLUS.d} stroke="currentColor" strokeWidth={SC_PLUS.strokeWidth} strokeLinecap="round" />
              </svg>
              <span className="lp-sc-mode">
                <span className="lp-sc-mode-off">{c.modeOff}</span>
                <span className="lp-sc-mode-on">
                  <span>{c.modeOn}</span>
                </span>
              </span>
              <span className="lp-sc-model">{c.model}</span>
              <span className="lp-sc-effort">{c.effort}</span>
              <span className="lp-sc-send">
                <svg viewBox={SC_SEND_ARROW.viewBox} fill="none" focusable="false">
                  <path
                    d={SC_SEND_ARROW.d}
                    stroke="#fff"
                    strokeWidth={SC_SEND_ARROW.strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="bevel"
                  />
                </svg>
              </span>
            </div>
          </div>
          <div className="lp-sc-below">
            {c.below.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
        <div className="lp-sc-chat">
          <p className="lp-sc-bubble">
            <span>{c.prompt}</span>
          </p>
          <p className="lp-sc-reply">
            <Words text={c.reply} />
          </p>
          <div className="lp-sc-status">
            <svg className="lp-sc-plug" viewBox={SC_PLUG.viewBox} fill="none" focusable="false">
              <path
                d={SC_PLUG.d}
                stroke="currentColor"
                strokeWidth={SC_PLUG.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="lp-sc-conn">{c.status}</span>
          </div>
          <p className="lp-sc-result">{c.result}</p>
          {showFollowUp ? (
            <p className="lp-sc-more" data-placeholder={followUpFinal ? undefined : ""}>
              <Words text={c.followUp.text} />
            </p>
          ) : null}
        </div>
      </div>
      <div className="lp-sc-marks">
        <SiOpenai className="lp-sc-codex" focusable="false" />
        <svg className="lp-sc-claude" viewBox={SC_SPARK.viewBox} fill="none" focusable="false">
          <path d={SC_SPARK.d} fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
