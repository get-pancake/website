import { F2_POST_ICONS, F2_RING, F2_RING_EXTRA, F3_COMPOSER_ICONS, F4_RING } from "./lp-feat-art";
import type { FeatVariant } from "./lp-feat-timelines";

/**
 * The four "How Pancake finds customers" mock UIs — the designer's pictures
 * as DOM (Figma-exact geometry in features.css), the same markup the
 * pancake-studio compositions animate (shorts/feat-*-anim). Rest state =
 * the artboard; every animation-only layer (typed runs, counters, stickers)
 * is invisible at rest and filled/driven by lp-feat-timelines.ts. Purely
 * decorative — the host carries the alt text (LpFeatAnim.tsx).
 */

/* ── f1 · Signals + Roles ── */

function SignalRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="lp-f1-row">
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
          <SignalRow label="Keyword mentions">
            <DocTile tone="pink" />
            <img className="lp-f1-avatar" src="/lp/lp-f1-avatar-purple.svg" alt="" width={38} height={38} loading="lazy" decoding="async" />
          </SignalRow>
          <SignalRow label="Competitor engagement">
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
          <SignalRow label="Companies hiring">
            <DocTile tone="blue" blue />
          </SignalRow>
          <SignalRow label="Your brand engagement">
            <DocTile tone="cream" />
          </SignalRow>
          <SignalRow label="Technologies used">
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

/* ── f2 · LinkedIn post + the draft in its rainbow ring ── */

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
        {/* LinkedIn-style x-post: icon layer = the site's baked SVG, inlined so the globe /
            action icons / reaction bubbles animate */}
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
              Sarah Velasquez<span className="lp-f2-degree">• 1st</span>
            </p>
            <p className="lp-f2-headline">Principal Design Engineer @ Shift | Ex-Apple Design</p>
            <p className="lp-f2-time">3h •</p>
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
          <span className="lp-f2-count" style={{ left: "32.4px" }} />
          <span className="lp-f2-count" style={{ left: "79.8px" }} />
          <span className="lp-f2-count" style={{ left: "119.2px" }} />
          <span className="lp-f2-count" style={{ left: "158.6px" }} />
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
            <p className="lp-f2-msg">
              Hey Sarah, saw you’re launching on Product Hunt in 21 days. We make SaaS launch videos people
              understand in seconds. Want an idea for yours?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── f3 · AI-answers collage ── */

function Spark({ left, top, size, fill }: { left: number; top: number; size: number; fill: string }) {
  return (
    <svg
      className="lp-f3-spk"
      viewBox="-1 -1 2 2"
      style={{ left: `${left}px`, top: `${top}px`, width: `${size}px`, height: `${size}px` }}
    >
      <path d="M0,-1 Q0,0 1,0 Q0,0 0,1 Q0,0 -1,0 Q0,0 0,-1 Z" fill={fill} />
    </svg>
  );
}

function F3Stage() {
  return (
    <div className="lp-feat-stage lp-feat-stage--f3" aria-hidden="true">
      <div className="lp-feat-f3">
        <img className="lp-f3-chatgpt" src="/lp/lp-f3-logo-chatgpt.svg" alt="" width={141} height={141} loading="lazy" decoding="async" />
        <div className="lp-f3-card">
          <div className="lp-f3-bubble">
            <p>best studio for a SaaS launch video in Stockholm</p>
          </div>
          <div className="lp-f3-resp">
            <p className="lp-f3-thought">
              Thought for 1s
              <span className="lp-f3-shim" aria-hidden="true">
                Thought for 1s
              </span>
            </p>
            <p className="lp-f3-answer lp-f3-answer--plain">
              For B2B SaaS launch videos in Stockholm, I’d recommend <b className="lp-f3-mark">Studio Pelican.</b>
              {"\n\n"}
              They turn complex products into clear stories, from strategy to final animation.
            </p>
            <p className="lp-f3-answer lp-f3-answer--anim" />
          </div>
          {/* the composer: the question is typed here (one span per character, built at
              mount) and sent up into the bubble; the icon row is inlined so the baked
              caret can hand over to the typing caret */}
          <div className="lp-f3-composer">
            <p className="lp-f3-ctyped" />
            <svg
              className="lp-f3-compicons"
              viewBox="154.4 467.7 251.2 38.4"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              dangerouslySetInnerHTML={{ __html: F3_COMPOSER_ICONS }}
            />
            <p className="lp-f3-ask">Ask Chat</p>
          </div>
        </div>
        <img className="lp-f3-gemini" src="/lp/lp-f3-logo-gemini.svg" alt="" width={241} height={241} loading="lazy" decoding="async" />
        <img className="lp-f3-claude" src="/lp/lp-f3-logo-claude.svg" alt="" width={109} height={109} loading="lazy" decoding="async" />
      </div>
      {/* Gemini sparkles: 4-point stars in the star's own colours (stage coordinates), gone by 8.5 s */}
      <Spark left={479} top={131} size={14} fill="#FABC12" />
      <Spark left={534} top={184} size={12} fill="#3186FF" />
      <Spark left={528} top={323} size={14} fill="#F94543" />
      <Spark left={446} top={350} size={11} fill="#08B962" />
    </div>
  );
}

/* ── f4 · reply-rate chart, What worked, Brain updated ── */

function F4Stage() {
  return (
    <div className="lp-feat-stage lp-feat-stage--f4" aria-hidden="true">
      <div className="lp-feat-f4">
        <div className="lp-f4-card lp-f4-hair lp-f4-graph">
          <div className="lp-f4-stat">
            <span className="lp-f4-pct">+56%</span>
            <img className="lp-f4-arrow" src="/lp/lp-f4-arrow.svg" alt="" width={17} height={17} loading="lazy" decoding="async" />
          </div>
          <p className="lp-f4-vs">reply rate vs last period</p>
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
          <p className="lp-f4-ctitle">What worked</p>
          <div className="lp-f4-chips">
            <span className="lp-f4-chip">Lead with launch timing</span>
            <span className="lp-f4-chip">Shorter intros</span>
            <span className="lp-f4-chip">Offer one idea</span>
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
            <p className="lp-f4-brainsub">Winning patterns saved for the next campaign.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const STAGES: Record<FeatVariant, () => JSX.Element> = {
  f1: F1Stage,
  f2: F2Stage,
  f3: F3Stage,
  f4: F4Stage,
};

export function LpFeatStage({ variant }: { variant: FeatVariant }) {
  const Stage = STAGES[variant];
  return <Stage />;
}
