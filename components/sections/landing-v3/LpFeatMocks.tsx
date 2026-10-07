import { Fragment } from "react";

import { F2_POST_ICONS, F2_RING, F2_RING_EXTRA, F4_RING } from "./lp-feat-art";
import type { FeatVariant } from "./lp-feat-timelines";

/**
 * The four "How Pancake finds customers" mock UIs — the designer's pictures
 * as DOM (Figma-exact geometry in features.css), the same markup the
 * pancake-studio compositions animate (shorts/feat-*-anim). f5, the Plays
 * card (2026-09-30), has no studio source: it is the app's Play UI at 0.9
 * scale, built here. Rest state = the END picture of every card (since
 * 2026-09-30: toggles on, checks landed, the post and the sent draft in place),
 * so the server render is never blank; every animation-only layer (typing
 * carets, earlier counter digits, the composer, DRAFT READY) is invisible at
 * rest, and each builder in lp-feat-timelines.ts sets its first frame. Purely
 * decorative — the host carries the alt text (LpFeatAnim.tsx).
 */

/* ── f1 · Signals + Roles ── */

function SignalRow({
  label,
  on,
  highlight,
  children,
}: {
  label: string;
  /** switched on in the picture (the timeline flips it) */
  on?: boolean;
  /** the row Figma keeps highlighted */
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`lp-f1-row${on ? " lp-f1-row--on" : ""}${highlight ? " lp-f1-row--hl" : ""}`}>
      {children}
      <p className="lp-f1-label">{label}</p>
      <span className="lp-f1-toggle">
        <i className="lp-f1-knob" />
      </span>
      <img className="lp-f1-chev" src="/lp/lp-f1-chevron.svg" alt="" width={13} height={13} loading="lazy" decoding="async" />
    </div>
  );
}

function DocTile({ tone, blue }: { tone: "pink" | "blue" | "cream"; blue?: boolean }) {
  return (
    <span className={`lp-f1-tile lp-f1-tile--${tone}`}>
      <img
        className="lp-f1-docicon"
        src={blue ? "/lp/lp-f1-icon-doc-lines-blue.svg" : "/lp/lp-f1-icon-doc-lines.svg"}
        alt=""
        width={19}
        height={19}
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}

function RoleRow({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="lp-f1-role">
      {checked ? (
        /* the empty outline under the check reads "unchecked" until its check lands */
        <span className="lp-f1-checkwrap">
          <span className="lp-f1-checkbox-off" />
          <img className="lp-f1-checkimg" src="/lp/lp-f1-checkbox.svg" alt="" width={19} height={19} loading="lazy" decoding="async" />
        </span>
      ) : (
        <span className="lp-f1-checkbox-off" />
      )}
      <p className="lp-f1-label">{label}</p>
    </div>
  );
}

function F1Stage() {
  return (
    <div className="lp-feat-stage lp-feat-stage--f1" aria-hidden="true">
      <div className="lp-feat-f1">
        <div className="lp-f1-mockcard lp-f1-signals">
          <div className="lp-f1-sighead">
            <p className="lp-f1-sigtitle">Signals</p>
            {/* counting header: the in-flow digit is the artboard's ("4 active"); the
                other digits are animation-only layers stacked on the same glyph box */}
            <p className="lp-f1-sigcount lp-f1-cnt">
              <span className="lp-f1-cnt-cur">4</span> active<span className="lp-f1-cnt-alt">0</span>
              <span className="lp-f1-cnt-alt">1</span>
              <span className="lp-f1-cnt-alt">2</span>
              <span className="lp-f1-cnt-alt">3</span>
            </p>
          </div>
          <SignalRow label="Keyword mentions" on>
            <DocTile tone="pink" />
            <img className="lp-f1-avatar" src="/lp/lp-f1-avatar-purple.svg" alt="" width={38} height={38} loading="lazy" decoding="async" />
          </SignalRow>
          <SignalRow label="Competitor engagement" on>
            <span className="lp-f1-tile lp-f1-tile--amber">
              <span className="lp-f1-chart">
                <i className="lp-f1-bar1" />
                <i className="lp-f1-bar2" />
                <i className="lp-f1-bar3" />
                <b className="lp-f1-d1">1</b>
                <b className="lp-f1-d2">2</b>
                <b className="lp-f1-d3">3</b>
              </span>
            </span>
          </SignalRow>
          <SignalRow label="Industry expert engagement">
            <img className="lp-f1-icon32" src="/lp/lp-f1-avatar-green.svg" alt="" width={32} height={32} loading="lazy" decoding="async" />
          </SignalRow>
          <SignalRow label="Companies hiring" on highlight>
            <DocTile tone="blue" blue />
          </SignalRow>
          <SignalRow label="Your brand engagement">
            <DocTile tone="cream" />
          </SignalRow>
          <SignalRow label="Technologies used" on>
            <DocTile tone="pink" />
          </SignalRow>
        </div>

        <div className="lp-f1-mockcard lp-f1-roles">
          <div className="lp-f1-roleshead">
            <p className="lp-f1-rolestitle">Roles</p>
            <p className="lp-f1-sigcount lp-f1-rolecount lp-f1-cnt">
              <span className="lp-f1-cnt-cur">3</span> selected<span className="lp-f1-cnt-alt">0</span>
              <span className="lp-f1-cnt-alt">1</span>
              <span className="lp-f1-cnt-alt">2</span>
            </p>
          </div>
          <RoleRow label="Sales" checked />
          <RoleRow label="Marketing" checked />
          <RoleRow label="Customer success" checked />
          <RoleRow label="Operations" checked={false} />
        </div>

        {/* Figma's annotation (asset 75.63×42.85 at left −48, rotated −13.36°: its painted
            box begins 52px left of the instance) — lands after the selections complete */}
        <div className="lp-f1-sticker">
          <img className="lp-f1-sticker-bg" src="/lp/lp-f1-annotation.svg" alt="" width={76} height={43} loading="lazy" decoding="async" />
          <p className="lp-f1-sticker-text">clay alternatives</p>
        </div>
      </div>
    </div>
  );
}

/* ── f2 · a prospect's post + the draft in its rainbow ring ── */

function Skel({ w }: { w: string }) {
  return (
    <i style={{ width: w }}>
      <b />
    </i>
  );
}

function F2Stage() {
  return (
    <div className="lp-feat-stage lp-feat-stage--f2" aria-hidden="true">
      <div className="lp-feat-f2">
        {/* a generic social post (no platform chrome since 2026-09-29: no connection degree,
            no reaction bubbles, no brand blue; since 2026-10-07 no globe and no repost / send
            icons either, features.css hides them, so the action row is a like and a comment
            with their counts): icon layer = the site's baked SVG, inlined so the action icons
            animate */}
        <div className="lp-f2-post">
          <svg
            className="lp-f2-posticons"
            viewBox="0 0 364 171"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            dangerouslySetInnerHTML={{ __html: F2_POST_ICONS }}
          />
          <img className="lp-f2-avatar" src="/lp/lp-f2-avatar-sarah.jpg" alt="" width={43} height={43} loading="lazy" decoding="async" />
          <div className="lp-f2-meta">
            <p className="lp-f2-name">
              Sarah Velasquez
            </p>
            {/* 2026-10-07: a plain role (was "Principal Design Engineer @ Shift | Ex-Apple
                Design", a real brand in an invented profile, in the platform's headline format) */}
            <p className="lp-f2-headline">Design lead at Shift</p>
            {/* the "•" led to the globe, hidden since 2026-10-07 */}
            <p className="lp-f2-time">3h</p>
          </div>
          {/* typed by revealing this very run (clip staircase + caret, lp-feat-timelines.ts) */}
          <p className="lp-f2-body">We’re launching on Product Hunt in 21 days 🚀</p>
          <div className="lp-f2-skel">
            <span className="lp-f2-skelgrp">
              <Skel w="14.4px" />
              <Skel w="63.9px" />
            </span>
            <span className="lp-f2-skelgrp">
              <Skel w="14.4px" />
              <Skel w="46.8px" />
            </span>
            <span className="lp-f2-skelgrp">
              <Skel w="14.4px" />
              <Skel w="136.8px" />
            </span>
          </div>
          {/* the final counts are the in-flow text; the timeline stacks the ticking digits over them.
              Like and comment only: the repost and send counts left with their icons (2026-10-07) */}
          <span className="lp-f2-count" style={{ left: "32.4px" }}><span className="lp-f2-n lp-f2-n--final">33</span></span>
          <span className="lp-f2-count" style={{ left: "79.8px" }}><span className="lp-f2-n lp-f2-n--final">5</span></span>
        </div>

        {/* the draft card in its rainbow ring (see lp-feat-art.ts for the ring's construction) */}
        <div className="lp-f2-draftgrp">
          <svg
            className="lp-f2-ring"
            viewBox={`0 0 405 ${284 + F2_RING_EXTRA}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            dangerouslySetInnerHTML={{ __html: F2_RING }}
          />
          {/* no Send button (founder 2026-09-03): the card is the message and its status —
              DRAFT READY (yellow) lands once the draft is written, then flips to MESSAGE
              SENT (green), the picture that holds. The in-flow eyebrow text is the sent
              state; DRAFT READY is the animation-only layer stacked on it. */}
          <div className="lp-f2-draft">
            <p className="lp-f2-eyebrow">
              <span className="lp-f2-eyebrow-sent">Message sent</span>
              <span className="lp-f2-eyebrow-draft">Draft ready</span>
            </p>
            {/* 2026-10-07: the message asks about her launch instead of pitching (was "We make SaaS
                launch videos people understand in seconds. Want an idea for yours?"), matching the
                card's copy. Shorter, so it may wrap to four of the card's five lines. */}
            <p className="lp-f2-msg">
              Hey Sarah, saw you’re launching on Product Hunt in 21 days. How will you show it on launch
              day, a video or screenshots?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── f5 · Plays: the request, the Play it becomes, the leads it brings (2026-09-30,
   replaces the AI-answers collage) ── */

// Pancake's sparkle: a 4-point star (-1..1 box, filled with currentColor)
const F5_SPARK = "M0,-1 Q0,0 1,0 Q0,0 0,1 Q0,0 -1,0 Q0,0 0,-1 Z";
// hand-drawn line icons on a 16 grid (stroke = currentColor 1.3, round joins)
const F5_ICON = {
  layers: "M8 2 14 5.2 8 8.4 2 5.2Z M2 8 8 11.2 14 8 M2 10.8 8 14 14 10.8",
  search: "M11.2 7A4.2 4.2 0 1 1 2.8 7A4.2 4.2 0 1 1 11.2 7Z M10.2 10.2 13.2 13.2",
  send: "M13.5 2.5 6.8 9.2 M13.5 2.5 9.3 13.5 6.8 9.2 2.5 6.7Z",
  funnel: "M2.5 3h11l-4.2 5v4.5l-2.6 1.2V8Z",
} as const;

function Sparkle({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="-1 -1 2 2">
      <path d={F5_SPARK} fill="currentColor" />
    </svg>
  );
}

function LineIcon({ name, className }: { name: keyof typeof F5_ICON; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={F5_ICON[name]} />
    </svg>
  );
}

function Tick({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none">
      <path d="M2.6 6.3 5 8.6 9.4 3.7" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const F5_PLAN = [
  { label: "Who", value: "Early-stage SaaS founders (US)" },
  { label: "How we find them", value: "Engaging with launch posts" },
  { label: "How many", value: "25 leads per search" },
];
// each step's own icon shows while it runs and hands over to the green tick when it
// completes (so Qualify's own icon is the funnel, not a tick)
const F5_STEPS = [
  { label: "Discover", icon: "search" },
  { label: "Enrich", icon: "sparkle" },
  { label: "Qualify", icon: "funnel" },
] as const;
// fictional people and companies (web-checked 2026-09-30: no live SaaS brand by these names).
// "Why they fit" follows the app's format (pancake-cmo lead-why.ts): the search that surfaced
// them ("Commented on" / "Reacted to" a post), a middle dot, the ICP requirement they meet
const F5_LEADS = [
  { ini: "NP", name: "Nora Pellington", role: "Founder, Ledgerlark", why: "Commented on a launch post · Seed-stage SaaS" },
  { ini: "DA", name: "Devin Arkwell", role: "CEO, Tidewren", why: "Reacted to a launch-day post · Series A SaaS CEO" },
  { ini: "AS", name: "Ama Sorensby", role: "Co-founder, Kitefold", why: "Reacted to a launch-video post · Pre-launch SaaS" },
];

function F5Stage() {
  return (
    <div className="lp-feat-stage lp-feat-stage--f5" aria-hidden="true">
      <div className="lp-feat-f5">
        {/* the request: typed in the Agent's composer (animation-only layer, one span per
            character built by the timeline), then sent up as the plum bubble (rest) */}
        <div className="lp-f5-composer">
          <Sparkle className="lp-f5-spark" />
          <p className="lp-f5-ph">Ask Pancake anything…</p>
          <p className="lp-f5-ctyped" />
          <span className="lp-f5-send">
            <LineIcon name="send" />
          </span>
        </div>
        <p className="lp-f5-bubble">Find US SaaS founders with a launch coming up.</p>

        {/* the Play Pancake plans: the in-flow text is the picture that holds; the waits,
            step numbers, Draft and the Create button are animation-only layers */}
        <div className="lp-f5-card lp-f5-play">
          <div className="lp-f5-head">
            <span className="lp-f5-tile">
              <LineIcon name="layers" />
            </span>
            <div>
              <p className="lp-f5-eyebrow">New Play</p>
              <p className="lp-f5-title">Founders about to launch</p>
            </div>
            <div className="lp-f5-status">
              <span className="lp-f5-badge lp-f5-badge--active">
                <i />
                Active
              </span>
              <span className="lp-f5-badge lp-f5-badge--draft">Draft</span>
            </div>
          </div>
          <div className="lp-f5-rows">
            {F5_PLAN.map((r, i) => (
              <div className="lp-f5-row" key={r.label}>
                <span className="lp-f5-circ">
                  <i className="lp-f5-num">{i + 1}</i>
                  <Tick className="lp-f5-tick" />
                </span>
                <p className="lp-f5-lab">{r.label}</p>
                <p className="lp-f5-val">
                  <span className="lp-f5-val-final">{r.value}</span>
                  <span className="lp-f5-val-wait">
                    Not decided yet<span className="lp-f5-shim">Not decided yet</span>
                  </span>
                </p>
              </div>
            ))}
          </div>
          <div className="lp-f5-foot">
            <div className="lp-f5-steps">
              {F5_STEPS.map((s, i) => (
                <Fragment key={s.label}>
                  {i > 0 && <i className="lp-f5-link" />}
                  <span className="lp-f5-chip">
                    <span className="lp-f5-cico">
                      {s.icon === "sparkle" ? (
                        <Sparkle className="lp-f5-cstep lp-f5-cstep--spark" />
                      ) : (
                        <LineIcon name={s.icon} className="lp-f5-cstep" />
                      )}
                      <Tick className="lp-f5-cdone" />
                    </span>
                    {s.label}
                  </span>
                </Fragment>
              ))}
            </div>
            <span className="lp-f5-create">
              <LineIcon name="search" />
              Create and run search
            </span>
          </div>
        </div>

        {/* the leads the Play brings back, each with why they fit */}
        <div className="lp-f5-card lp-f5-leads">
          <p className="lp-f5-lhead">
            <span className="lp-f5-lcount">25</span> new leads
          </p>
          <div className="lp-f5-list">
            {F5_LEADS.map((l, i) => (
              <div className="lp-f5-lead" key={l.name}>
                <span className={`lp-f5-av lp-f5-av--${i + 1}`}>{l.ini}</span>
                <p className="lp-f5-who">
                  <span className="lp-f5-name">{l.name}</span>
                  <span className="lp-f5-role">{l.role}</span>
                </p>
                <p className="lp-f5-why">
                  <Sparkle className="lp-f5-wspark" />
                  {l.why}
                </p>
                <span className="lp-f5-badge lp-f5-badge--new">New</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── f4 · a Play's replies, Brain learned, Brain updated ──
   2026-10-07: the card sells what the app does. No "+56% reply rate vs last
   period" (an invented lift) and no green arrow: the chart is one Play's
   replies, week by week, the per-Play stat the app shows. "What worked"
   (opening, length, ask: the app learns no message patterns) became "Brain
   learned" with ICP lessons from lead reviews, and the brain card points to
   the next search. */

function F4Stage() {
  return (
    <div className="lp-feat-stage lp-feat-stage--f4" aria-hidden="true">
      <div className="lp-feat-f4">
        <div className="lp-f4-card lp-f4-hair lp-f4-graph">
          <div className="lp-f4-stat">
            <span className="lp-f4-pct">12</span>
          </div>
          <p className="lp-f4-vs">Replies · Founders about to launch</p>
          <div className="lp-f4-bars">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="lp-f4-bar" />
            ))}
          </div>
          <div className="lp-f4-weeks">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </div>

        <div className="lp-f4-card lp-f4-hair lp-f4-worked">
          <p className="lp-f4-ctitle">Brain learned</p>
          <div className="lp-f4-chips">
            <span className="lp-f4-chip">Founders, not marketers</span>
            <span className="lp-f4-chip">Seed to Series A</span>
            <span className="lp-f4-chip">US only</span>
          </div>
        </div>

        <div className="lp-f4-brain">
          <svg
            className="lp-f4-ring"
            viewBox="0 0 475 105"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            dangerouslySetInnerHTML={{ __html: F4_RING }}
          />
          <div className="lp-f4-card lp-f4-braincard">
            <p className="lp-f4-ctitle">Brain updated</p>
            <p className="lp-f4-brainsub">Your next search starts from it.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const STAGES: Record<FeatVariant, () => JSX.Element> = {
  f1: F1Stage,
  f2: F2Stage,
  f4: F4Stage,
  f5: F5Stage,
};

export function LpFeatStage({ variant }: { variant: FeatVariant }) {
  const Stage = STAGES[variant];
  return <Stage />;
}
