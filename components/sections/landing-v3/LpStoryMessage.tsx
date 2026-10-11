import type { CSSProperties } from "react";

import type { DiveStageProps } from "./lp-dive-stages";
import { SM_POST_ICONS } from "./lp-story-message-art";
import {
  SM_KIND_LABEL,
  SM_MAIN_PLACE,
  SM_SATELLITE_ORDER,
  SM_SATELLITES,
  SM_STORY,
  SM_TAIL,
  smInitials,
  type SmAccount,
  type SmBlockPlace,
  type SmLead,
} from "./lp-story-message-data";

/**
 * Deep-dive story "A personal message for every lead" — the stage markup (Figma V2 storyboard
 * 4964:1469 / 1471 / 1729 / 1821 / 1899). Owner: story-message package. Contract:
 * lp-dive-stages.ts (server-safe, one root with data-lp-story="message" + aria-hidden, rest
 * markup = the END picture, paints nothing behind the scene; geometry in
 * app/_styles/landing-v3/story-message.css, timeline in lp-story-message-timeline.ts).
 *
 * Two scenes in one box:
 * - the conversation (frames 1–3, FINAL): a neutral social post (production f2's, re-staged at
 *   Figma's two instance scales), then Pancake's draft in its rainbow ring. The ring's art is
 *   injected by the timeline (it only exists while the story plays), so the <svg> is empty here;
 * - the tail (frames 4–5, INTERIM — the designer marked them WIP on 2026-10-11): the draft
 *   corrected by hand and sent, then the accounts world, which is the rest picture. Everything
 *   the tail owns is in the SmTail* components below, so a new design swaps them (with
 *   lp-story-message-tail.ts, the SM_TAIL data and the INTERIM block of story-message.css)
 *   without touching the conversation.
 * At rest the conversation is hidden in its last state (sent) and the world shows.
 * No placeholder-only element: production and preview render the same picture.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* the post's skeleton bars (native px: a 16 square + a bar, three groups — Figma 4964:1557) */
const SKEL: readonly (readonly [number, number])[] = [
  [16, 71],
  [16, 52],
  [16, 152],
];
/* the action row's counts (like / comment / repost / send): native left px at pose A (Figma
   4964:1591…1609), and the shift at pose B (4964:1685…1703 — the row packs tighter at .62) */
const COUNT_LEFT = [36, 88.23, 132.78, 177.32] as const;
const COUNT_LEFT_B = [0, -0.14, -0.648, -1.146] as const;

/* ══ INTERIM — frames 4–5 (lp-story-message-tail.ts plays them) ══════════════════════════ */

/** the eyebrow's sent state: the in-flow text at rest ("DRAFTING" is stacked over it) */
function SmTailSentEyebrow() {
  return <span className="lp-sm-eb-sent">{SM_TAIL.sentEyebrow}</span>;
}

/** the message's last word in its two states: as Pancake writes it (hidden at rest), and as
    the member corrects it by hand (red, the rest state) */
function SmTailLastWord() {
  return (
    <>
      <span className="lp-sm-fix-old">{SM_STORY.draft.lastWord}</span>
      <span className="lp-sm-fix-new">{SM_TAIL.correctedWord}</span>
    </>
  );
}

function Lead({ lead, n }: { lead: SmLead; n: number }) {
  return (
    <div className="lp-sm-lead" style={{ "--n": n } as Vars}>
      <span className="lp-sm-av">{smInitials(lead.name)}</span>
      <span className="lp-sm-lname">{lead.name}</span>
      <span className="lp-sm-lrole">
        {lead.role} @ {lead.company}
      </span>
      <span className="lp-sm-chip" data-kind={lead.kind}>
        {SM_KIND_LABEL[lead.kind]}
      </span>
      <span className="lp-sm-ldetail">{lead.signal}</span>
    </div>
  );
}

/** one sending account: its sender name (header) over its lead rows, scaled by k from the
    header's top-left (Figma draws the satellites as the same block, scaled) */
function AccountBlock({ account, desktop, phone }: { account: SmAccount; desktop: SmBlockPlace; phone: SmBlockPlace }) {
  const style: Vars = {
    "--x": desktop.x,
    "--y": desktop.y,
    "--k": desktop.k,
    "--xp": phone.x,
    "--yp": phone.y,
    "--kp": phone.k,
  };
  return (
    <div className="lp-sm-acct" style={style}>
      {account.leads.map((lead, n) => (
        <Lead key={n} lead={lead} n={n} />
      ))}
      <p className="lp-sm-acct-h">{account.sender}</p>
    </div>
  );
}

/** the accounts world (frame 5) = the rest picture: the sending account's card with its leads,
    surrounded by five more accounts at smaller scales, bleeding past the stage edges */
function SmTailWorld() {
  const { accounts } = SM_TAIL;
  return (
    <div className="lp-sm-world">
      <div className="lp-sm-cam">
        {SM_SATELLITE_ORDER.map((i) => (
          <AccountBlock key={i} account={accounts.satellites[i]} {...SM_SATELLITES[i]} />
        ))}
        <div className="lp-sm-acctcard">
          <AccountBlock account={accounts.main} desktop={SM_MAIN_PLACE} phone={SM_MAIN_PLACE} />
        </div>
      </div>
    </div>
  );
}

/* ══ the stage ═══════════════════════════════════════════════════════════════════════════ */

export function LpStoryMessageStage({ placeholders }: DiveStageProps) {
  void placeholders; // nothing in this story is placeholder-only
  const { post, draft } = SM_STORY;
  return (
    <div data-lp-story="message" className="lp-sm" aria-hidden="true">
      {/* ── the conversation (frames 1–3) ── */}
      <div className="lp-sm-convo">
        {/* a generic social post (no platform chrome: no connection degree, no reaction
            bubbles, no brand blue), native 404×190; rest = pose B (frames 2–3) */}
        <div className="lp-sm-post">
          <svg
            className="lp-sm-posticons"
            viewBox="0 0 364 171"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            dangerouslySetInnerHTML={{ __html: SM_POST_ICONS }}
          />
          <img
            className="lp-sm-avatar"
            src="/lp/story-message/sarah.jpg"
            alt=""
            width={48}
            height={48}
            loading="lazy"
            decoding="async"
          />
          <div className="lp-sm-meta">
            <p className="lp-sm-name">{post.author}</p>
            <p className="lp-sm-headline">{post.headline}</p>
            <p className="lp-sm-time">{post.time}</p>
          </div>
          {/* typed by revealing this very run (clip staircase + caret) */}
          <p className="lp-sm-body">{post.body}</p>
          <div className="lp-sm-skel">
            {SKEL.map(([a, b], i) => (
              <span key={i} className="lp-sm-skelgrp">
                <i style={{ width: a }}>
                  <b />
                </i>
                <i style={{ width: b }}>
                  <b />
                </i>
              </span>
            ))}
          </div>
          {/* the final counts are the in-flow text; the timeline stacks the ticking digits over them */}
          {post.counts.map((c, i) => (
            <span key={i} className="lp-sm-count" style={{ "--l": COUNT_LEFT[i], "--lb": COUNT_LEFT_B[i] } as Vars}>
              <span className="lp-sm-n lp-sm-n--final">{c}</span>
            </span>
          ))}
        </div>

        {/* the draft card in its rainbow ring; rest = the 4-line card (frame 3's geometry) */}
        <div className="lp-sm-draftpos">
          <div className="lp-sm-draftgrp">
            {/* filled by the timeline (lp-story-message-art.ts smRingMarkup) while it plays */}
            <svg className="lp-sm-ring" viewBox="0 0 405 284" fill="none" xmlns="http://www.w3.org/2000/svg" />
            <div className="lp-sm-draft">
              <p className="lp-sm-eyebrow">
                <SmTailSentEyebrow />
                <span className="lp-sm-eb-draft">{draft.eyebrow}</span>
              </p>
              <p className="lp-sm-msg">
                {draft.text}
                <SmTailLastWord />
              </p>
              <span className="lp-sm-send">{draft.send}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── the tail's world (frame 5) = the rest picture ── */}
      <SmTailWorld />
    </div>
  );
}
