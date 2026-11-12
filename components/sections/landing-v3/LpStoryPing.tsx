import { Fragment } from "react";

import { OpenClawMark } from "./LpAgentMarks";
import type { DiveStageProps } from "./lp-dive-stages";
import { STORY_PING } from "./lp-story-ping-data";

/**
 * Deep-dive story "ping": your agent texts you first (lp-story-ping-data.ts has the founder's
 * words). A phone's Messages conversation as Apple draws it (its header with the contact's
 * picture and name, grey bubbles for what comes in, blue for what you send, "Delivered" under
 * it, the three dots while the other side types, the field under the thread; Mobbin, for an
 * assistant as a contact in a messaging app: Snapchat's My AI, TikTok's Tako), on the dive's
 * 752 × 489 box. The dive's "no UI" rule is lifted here on the founder's word, as it was for the
 * Codex window (LpStoryMcp).
 * Contract (lp-dive-stages.ts): one root with data-lp-story, aria-hidden; the markup is the END
 * picture (the whole conversation); what only shows on the way (the typing dots) rests hidden.
 * Styles: story-ping.css. Motion: lp-story-ping-timeline.ts.
 */
export function LpStoryPingStage(_props: DiveStageProps) {
  const s = STORY_PING;
  return (
    <div className="lp-sk lp-sping" data-lp-story="ping" aria-hidden="true">
      <div className="lp-sk-scene">
        <div className="lp-sping-phone">
          <div className="lp-sping-head">
            <svg className="lp-sping-back" viewBox="0 0 12 20" focusable="false">
              <path d="M10 2 2 10l8 8" />
            </svg>
            <span className="lp-sping-avatar">
              <OpenClawMark />
            </span>
            <p className="lp-sping-name">
              {s.contact}
              <svg viewBox="0 0 6 10" focusable="false">
                <path d="m1 1 4 4-4 4" />
              </svg>
            </p>
          </div>
          <div className="lp-sping-thread">
            <p className="lp-sping-time">{s.time}</p>
            {s.messages.map((message, i) => (
              <Fragment key={i}>
                <div className="lp-sping-row" data-from={message.from}>
                  {/* the other side is typing: on the message's own spot until it comes */}
                  {message.from === "them" ? (
                    <span className="lp-sping-typing">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : null}
                  <p className="lp-sping-bubble lp-sk-rise">{message.text}</p>
                </div>
                {message.from === "me" ? <p className="lp-sping-delivered">{s.delivered}</p> : null}
              </Fragment>
            ))}
          </div>
          <div className="lp-sping-bar">
            <span className="lp-sping-plus">
              <svg viewBox="0 0 14 14" focusable="false">
                <path d="M7 1.5v11M1.5 7h11" />
              </svg>
            </span>
            <span className="lp-sping-field">{s.field}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
