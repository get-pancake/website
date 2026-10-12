import type { CSSProperties } from "react";

import type { DiveStageProps } from "./lp-dive-stages";
import { SM_POST_ICONS } from "./lp-story-message-art";
import { SM_STORY, type SmAccount, type SmConvo, type SmLead } from "./lp-story-message-data";

/**
 * Deep-dive story "A personal message for every lead" — the stage markup (Figma V2 storyboard
 * 4964:1469 / 1471 / 1729, 5061:1002 / 1091 / 1209, final since 2026-10-12). Owner:
 * story-message package. Contract: lp-dive-stages.ts (server-safe, one root with
 * data-lp-story="message" + aria-hidden, rest markup = the END picture, paints nothing behind
 * the scene; geometry in app/_styles/landing-v3/story-message.css, timeline in
 * lp-story-message-timeline.ts + lp-story-message-tail.ts).
 *
 * Two scenes in one box:
 * - the talk (frames 1–4): a lead's post (production f2's neutral post, at Figma's instance
 *   scale), her lead card, the message Pancake drafts for her, then three more conversations
 *   at other depths. Hidden at rest, in its last state (both typed messages sent);
 * - the accounts (frames 4–6): the sending account's name over three of its leads, then six
 *   more accounts out of focus around it. This is the rest picture (frame 6).
 * No placeholder-only element: production and preview render the same picture.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* the post's skeleton bars (native px: a 16 square + a bar, three groups — Figma 5061:833) */
const SKEL: readonly (readonly [number, number])[] = [
  [16, 71],
  [16, 52],
  [16, 152],
];
/* the action row's counts (like / comment / repost / send): native left px (Figma 5061:848…866) */
const COUNT_LEFT = [36, 88.23, 132.78, 177.32] as const;

function Avatar({ lead }: { lead: SmLead }) {
  return <span className="lp-sm-av">{lead.initials}</span>;
}

/** company over role, right-aligned (Figma: one text box, two weights) */
function Company({ lead }: { lead: SmLead }) {
  return (
    <span className="lp-sm-co">
      <b>{lead.company}</b>
      {lead.role}
    </span>
  );
}

/** One conversation, top to bottom: the lead's card, a dashed wire, the message card, and when
    she answered a plain wire and her reply. Placed and scaled from its lead card's top-left. */
function Convo({ convo }: { convo: SmConvo }) {
  const { labels } = SM_STORY;
  const { lead, place } = convo;
  const style: Vars = { "--x": place.x, "--y": place.y, "--s": place.s, "--dim": convo.dim, "--wire": convo.wire };
  return (
    <div className="lp-sm-convo" data-convo={convo.id} style={style}>
      {/* frame 1 only: the wire from the post down to her card (the story's lead) */}
      {convo.id === "lead" && <i className="lp-sm-wire lp-sm-wire--dash lp-sm-wire--post" />}
      <div className="lp-sm-card lp-sm-lead">
        <Avatar lead={lead} />
        <span className="lp-sm-name">{lead.name}</span>
        <Company lead={lead} />
      </div>
      <i className="lp-sm-wire lp-sm-wire--dash lp-sm-wire--msg" />
      <div className="lp-sm-card lp-sm-msg" data-state={convo.state}>
        {/* the two eyebrows are stacked: "Drafting..." gives way to "Sent" */}
        {convo.state === "typed" && <span className="lp-sm-eb lp-sm-eb-draft">{labels.drafting}</span>}
        <span className="lp-sm-eb lp-sm-eb-sent">{labels.sent}</span>
        {/* typed by revealing this very run (clip staircase + caret) */}
        <p className="lp-sm-text">{convo.message}</p>
      </div>
      {convo.reply && (
        <>
          <i className="lp-sm-wire lp-sm-wire--reply" />
          <div className="lp-sm-card lp-sm-reply">
            <Avatar lead={lead} />
            <span className="lp-sm-eb">{lead.name}</span>
            <p className="lp-sm-text">{convo.reply}</p>
          </div>
        </>
      )}
    </div>
  );
}

/** One sending account: its sender's name, centred over three of its leads, each with where it
    stands. Placed and scaled from its rows' left edge and its name's top. */
function Account({ account }: { account: SmAccount }) {
  const { status } = SM_STORY.labels;
  const { place } = account;
  const style: Vars = { "--x": place.x, "--y": place.y, "--k": place.k, "--dim": account.dim, "--blur": account.blur };
  return (
    <div className="lp-sm-acct" data-acct={account.id} style={style}>
      <p className="lp-sm-sender">
        <span>{account.sender}</span>
      </p>
      {account.rows.map(({ lead, status: s }, n) => (
        <div key={n} className="lp-sm-card lp-sm-row" style={{ "--n": n } as Vars}>
          <Avatar lead={lead} />
          <span className="lp-sm-name">{lead.name}</span>
          <span className="lp-sm-status" data-status={s}>
            {status[s]}
          </span>
          <Company lead={lead} />
        </div>
      ))}
    </div>
  );
}

export function LpStoryMessageStage({ placeholders }: DiveStageProps) {
  void placeholders; // nothing in this story is placeholder-only
  const { post, convos, accounts } = SM_STORY;
  return (
    <div data-lp-story="message" className="lp-sm" aria-hidden="true">
      {/* ── the talk (frames 1–4): hidden at rest ── */}
      <div className="lp-sm-talk">
        {/* a generic social post (no platform chrome: no connection degree, no reaction
            bubbles, no brand blue), native 404×190 at Figma's instance scale; frame 1 only */}
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
            <p className="lp-sm-author">{post.author}</p>
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
            <span key={i} className="lp-sm-count" style={{ "--l": COUNT_LEFT[i] } as Vars}>
              <span className="lp-sm-n lp-sm-n--final">{c}</span>
            </span>
          ))}
        </div>

        {/* the conversations, on the camera that pulls back from frame 3 to frame 4 */}
        <div className="lp-sm-world">
          {convos.map((c) => (
            <Convo key={c.id} convo={c} />
          ))}
        </div>
      </div>

      {/* ── the accounts (frames 4–6): the rest picture is frame 6 ── */}
      <div className="lp-sm-accts">
        <div className="lp-sm-cam">
          {accounts.map((a) => (
            <Account key={a.id} account={a} />
          ))}
        </div>
      </div>
    </div>
  );
}
