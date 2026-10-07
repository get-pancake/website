// VxDemo — the product visual of a /for page (spec §4). SERVER component.
//
// Glued under the hero (founder 2026-09-22, Origami-style): no visible section head — a
// full-bleed hairline, the horizontal tab bar and the full-width app window. The prompts are
// the hero's "Example prompts" rows (VxPromptRows in VxHero); the island listens to them.
// The homepage renders it too (LpDemoTour, `headless`, fed by lib/verticals/home-demo.ts).
//
// Renders every product surface for all three example prompts
// (stacked in one grid cell per slot, so heights are fixed from first paint with no JS
// measuring), then hands the surfaces to the client island as children. Only this
// vertical's PlayerModel crosses the client boundary.
//
// Fidelity: every surface copies the live app (appref APP-UI-REFERENCE, 2026-09-22):
// Brain · Leads · Plays tablist (three of the v2 sidebar's destinations, since 2026-09-30; Plays
// current, VX_DEMO.app.navCur) with the pink-pale indicator, the floating rail with
// the blue-pale active item, the Plays page, the docked Ask Pancake panel (user bubble, tool
// row, answer card, the pale-pink Play card), the header-less leads table, the lead sheet,
// the sequence journey and the Slack "New lead from Pancake" post.
// Mock controls are spans inside role="img" windows — never focusable.
//
// Cue / swap / mark ids are the timeline's (lib/verticals/demo-timeline.ts):
//   data-cue  → revealed in place at its time      (.is-on)
//   data-uncue → shown until that cue id is reached (.is-off; armed only)
//   data-swap → children [data-s=before|after]     (.is-sw)
//   data-mark → a state class, e.g. the picked row (.is-mk)
//   data-cursor → a cursor target (.is-press while clicked)

import type { ReactNode } from "react";
import { buildDemoModel, type DemoModel, type DemoPromptView } from "@/lib/verticals/demo-model";
import type { DemoSource, SignalKind } from "@/lib/verticals/types";
import { VxDemoPlayer } from "./VxDemoPlayer";
import { VX_DEMO } from "./vx-copy";

const A = VX_DEMO.app;

// DOM budget (spec §4.3: demo ≤ 650 elements): every icon and checkbox is a pseudo-element
// (data-ico → a CSS mask in demo.css), lead rows are one flat grid, and anything identical
// across the three prompts is rendered once, outside the variants.
//
// No platform names or logos anywhere in the mock (founder 2026-09-23, validate.ts PLATFORM):
// the app's platform glyph after each lead name is gone.

function Chip({ kind, children }: { kind: SignalKind; children: string }) {
  return (
    <span className="vx-chip" data-kind={kind}>
      {children}
    </span>
  );
}

/* ─── app chrome (shared by Play, Leads and Sequence) ──────────────────────── */
// 2026-10-07 (founder: "on comprend pas le produit… trop de boutons, trop de texte"): the window
// keeps the logo only. The app's nav, its "Use in Claude / Codex" button and the Play's rail are
// gone: each tab shows one moment of the product, nothing around it.

function AppBar() {
  return (
    <div className="vx-app__bar">
      {/* eslint-disable-next-line @next/next/no-img-element -- the site's own wordmark, tiny, decorative */}
      <img className="vx-app__logo" src="/lp/lp-nav-logo.svg" alt="" width={45} height={22} />
    </div>
  );
}

function PageHead({ title, sub, extra }: { title: string; sub: string; extra?: ReactNode }) {
  return (
    <>
      <p className="vx-page__title">
        {title}
        {extra}
      </p>
      <p className="vx-page__sub">{sub}</p>
    </>
  );
}

/* ─── 01 Play: one centered conversation ───────────────────────────────────── */
// 2026-10-07: the request becomes the app's Play card (plays/play-draft-panel.tsx: "New play",
// Draft → Created, Who · How we find them, one "Create play and run search" button).

/** The Play card's rows (play-draft.ts SLOT_LABEL): a check, the slot, its value. Who and How
 *  only: "How many" was one row too many for a first look (founder 2026-10-07). */
function PlayRows({ p }: { p: DemoPromptView }) {
  const P = A.chat.play;
  return (
    <ul className="vx-play__rows">
      <li data-cue="b.row0" data-ico="check">
        <span className="vx-play__k">{P.who}</span>
        <span className="vx-play__v">{p.play.who}</span>
      </li>
      <li data-cue="b.row1" data-ico="check">
        <span className="vx-play__k">{P.how}</span>
        <span className="vx-play__v">
          <Chip kind={p.play.how.kind}>{p.play.how.label}</Chip>
          <span>{p.play.how.text}</span>
        </span>
      </li>
    </ul>
  );
}

/** The chat input. The player types the prompt into the pane's FIRST `.vx-typed` and gates the
 *  first start on the pane's FIRST `.vx-composer`: the centered one, so render it first. */
function Composer({ typing = false, cue }: { typing?: boolean; cue?: string }) {
  return (
    <div className={typing ? "vx-composer vx-composer--hero" : "vx-composer"} data-cue={cue}>
      <span className="vx-composer__field">
        {typing && (
          <span className="vx-composer__in">
            <span className="vx-composer__line">
              <span className="vx-typed" />
            </span>
          </span>
        )}
        {/* the placeholder is a pseudo-element: the long line, or the short one under 300px */}
        <span className="vx-ph" data-long={A.chat.placeholder} data-short={A.chat.placeholderShort} />
      </span>
      <span className="vx-send" data-ico="arrow-up" />
    </div>
  );
}

function BriefPane({ m }: { m: DemoModel }) {
  const P = A.chat.play;
  return (
    <div className="vx-pane vx-brief" data-pane="0">
      <div className="vx-chat">
        {/* 2026-10-07 (founder: "writing the play super fast on the very right side of the panel
            is super strange, I want to see it in the very centre"): one centered conversation.
            Before the request is sent, the app's empty state with the input in the middle of the
            window, where the request is typed; it fades out when the request is sent. */}
        <div className="vx-hero" data-uncue="b.bubble">
          <span className="vx-hero__tile" data-ico="stack" />
          <p className="vx-hero__title">{A.plays.readyTitle}</p>
          <p className="vx-hero__body">{A.plays.readyBody}</p>
          <Composer typing />
        </div>
        <div className="vx-chat__log vx-var">
          {m.prompts.map((p, i) => (
            <div key={i} className="vx-thread" data-p={i}>
              <p className="vx-bubble" data-cue="b.bubble">
                {p.text}
              </p>
              <p className="vx-answer" data-cue="b.reply">
                {p.reply}
              </p>
              <div className="vx-prop vx-play" data-cue="b.prop">
                <p className="vx-play__top">
                  <span className="vx-play__kicker">{P.kicker}</span>
                  <span className="vx-play__pill vx-swapc" data-swap="b.approved">
                    <span data-s="before">{P.draft}</span>
                    <span data-s="after">{P.created}</span>
                  </span>
                </p>
                <p className="vx-play__name">{p.play.name}</p>
                <PlayRows p={p} />
                <p className="vx-prop__foot vx-swapc" data-swap="b.approved" data-cue="b.foot">
                  <span className="vx-btn vx-btn--ink vx-play__go" data-s="before" data-ico="search" data-cursor="b.approve">
                    {P.create}
                  </span>
                  <span className="vx-prop__saved" data-s="after" data-ico="check-circle">
                    {P.ready}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* once the request is sent, the input docks under the conversation */}
        <Composer cue="b.bubble" />
      </div>
    </div>
  );
}

/* ─── 02 Leads: three leads with their reason + the first lead's sheet ──────── */
// 2026-10-07 (founder: too many buttons, too much text): three rows that each say why the lead
// fits, no checkboxes, no count, no per-row buttons; the sheet keeps the lead, why they fit,
// and the one action (Approve, then Start contacting).

const LEAD_ROWS = 3;

function LeadsPane({ m }: { m: DemoModel }) {
  return (
    <div className="vx-pane vx-leads" data-pane="1">
      <div className="vx-page">
        <PageHead title={A.leads.title} sub={A.leads.sub} />
        <div className="vx-table vx-var" data-cue="l.rows">
          {m.prompts.map((p, i) => (
            <div key={i} className="vx-rowset" data-p={i}>
              {p.leads.slice(0, LEAD_ROWS).map((l, r) => (
                <div key={l.name} className="vx-row" data-cue={`l.row${r}`} data-mark={r === 0 ? "l.sel" : undefined}>
                  <span className="vx-av">{l.initials}</span>
                  <span className="vx-row__name" data-cursor={r === 0 ? "l.pick" : undefined}>
                    {l.name}
                  </span>
                  <span className="vx-row__role">
                    {l.role} @ {l.company}
                  </span>
                  <Chip kind={l.kind}>{l.kindLabel}</Chip>
                  <span className="vx-row__detail">{l.signal}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="vx-drawer" data-cue="l.drawer">
        <div className="vx-var">
          {m.prompts.map((p, i) => {
            const l = p.leads[0];
            return (
              <div key={i} className="vx-drawer__head" data-p={i}>
                <span className="vx-av vx-av--lg">{l.initials}</span>
                <span className="vx-drawer__name">{l.name}</span>
                <span className="vx-drawer__role">
                  {l.role} @ {l.company}
                </span>
              </div>
            );
          })}
        </div>
        {/* why this lead fits: the chip + the qualification reason, as the app's box */}
        <div className="vx-var">
          {m.prompts.map((p, i) => {
            const l = p.leads[0];
            return (
              <div key={i} className="vx-sigbox" data-p={i} data-cue="l.d3" data-label={A.drawer.signal}>
                <Chip kind={l.kind}>{l.kindLabel}</Chip>
                <p className="vx-sigbox__why">{p.featured.why}</p>
              </div>
            );
          })}
        </div>
        {/* the one action: Approve ✕, then Start contacting */}
        <div className="vx-drawer__foot" data-cue="l.foot" data-swap="l.added">
          <span className="vx-pair" data-s="before">
            <span className="vx-btn" data-ico="check" data-cursor="l.approve">
              {A.leads.approve}
            </span>
            <span className="vx-xbtn" data-ico="x" />
          </span>
          <span className="vx-btn vx-btn--ink" data-s="after" data-ico="plus">
            {A.leads.add}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── 03 Sequence: the first message, written for the lead ─────────────────── */
// 2026-10-07 (founder: too much text): the six-step journey list and the status chip are gone;
// the card is the lead and the message Pancake writes for them, then the drafted note.

function OutreachPane({ m }: { m: DemoModel }) {
  const C = A.campaign;
  return (
    <div className="vx-pane vx-camp" data-pane="2">
      <div className="vx-page">
        <PageHead title={C.title} sub={C.sub} extra={<span className="vx-stagepill">{C.status}</span>} />
        <div className="vx-journey" data-cue="o.head">
          <div className="vx-journey__head">
            <span className="vx-var vx-journey__lead">
              {m.prompts.map((p, i) => {
                const l = p.leads[0];
                return (
                  <span key={i} className="vx-journey__who" data-p={i} data-step={`${l.role} @ ${l.company}`}>
                    <span className="vx-av">{l.initials}</span>
                    <b>{l.name}</b>
                  </span>
                );
              })}
            </span>
          </div>
          <div className="vx-journey__grid">
            <div className="vx-next" data-cue="o.next">
              <p className="vx-next__label">{C.upNext}</p>
              <div className="vx-var">
                {m.prompts.map((p, i) => (
                  <p key={i} className="vx-msg" data-p={i}>
                    <span className="vx-msg__ghost">{p.message}</span>
                    <span className="vx-msg__live" aria-hidden="true" />
                  </p>
                ))}
              </div>
              <div className="vx-next__end">
                <p className="vx-next__draft vx-swapc" data-swap="o.drafted">
                  <span className="vx-next__writing" data-s="before">
                    {C.writing}
                  </span>
                  <span data-s="after">{C.draft}</span>
                </p>
                <div className="vx-var">
                  {footGroups(m.prompts).map((g) => (
                    <p key={g.p} className="vx-next__foot" data-p={g.p} data-cue="o.foot" data-ico="sparkle">
                      {g.text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The footnote per prompt, identical ones sharing one element (data-p lists the prompts). */
function footGroups(prompts: DemoPromptView[]): { p: string; text: string }[] {
  const out: { p: string; text: string }[] = [];
  prompts.forEach((pr, i) => {
    const hit = out.find((g) => g.text === pr.written);
    if (hit) hit.p += String(i);
    else out.push({ p: String(i), text: pr.written });
  });
  return out;
}

/* ─── 04 Slack: the channel post ───────────────────────────────────────────── */

/** One "New lead from Pancake" post: the card chrome and buttons are shared, only the lead's
 *  line varies per prompt (DOM budget); the stacked variants reserve the tallest line.
 *  The third post (lead 2) shows only in a narrow window (stage ≤939, demo.css): there the
 *  channel is taller than two posts, and two left an empty band under the channel bar. */
function SlackLead({ m, i }: { m: DemoModel; i: 0 | 1 | 2 }) {
  const S = A.slack;
  const approve = i === 0;
  return (
    <div className={i === 2 ? "vx-smsg--cont vx-smsg--extra" : "vx-smsg--cont"} data-cue={`s.lead${i}`} data-intro={S.leadIntro}>
      <div className="vx-scard" data-open={S.open}>
        <div className="vx-var">
          {m.prompts.map((p, k) => {
            const l = p.leads[i];
            return (
              <p key={k} data-p={k}>
                <b>{l.name}</b> — {l.role}, {l.company}
                <span className="vx-scard__sig">{l.slackKind}</span>
              </p>
            );
          })}
        </div>
        {approve ? (
          <p className="vx-scard__btns vx-swapc" data-swap="s.approved">
            <span className="vx-spair" data-s="before">
              <span className="vx-sbtn" data-ico="sg-ok" data-cursor="s.approve">
                {S.approve}
              </span>
              <span className="vx-sbtn" data-ico="sg-no">
                {S.reject}
              </span>
            </span>
            <span className="vx-scard__done" data-s="after" data-ico="sg-ok">
              {S.approved}
            </span>
          </p>
        ) : (
          <p className="vx-scard__btns vx-spair">
            <span className="vx-sbtn" data-ico="sg-ok">
              {S.approve}
            </span>
            <span className="vx-sbtn" data-ico="sg-no">
              {S.reject}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

function SlackWindow({ m, lazyAvatar }: { m: DemoModel; lazyAvatar: boolean }) {
  const S = A.slack;
  return (
    <>
      <div className="vx-slack__side">
        <p className="vx-slack__ws">{m.workspace.name}</p>
        <p className="vx-slack__grp">{S.channels}</p>
        {S.channelList.map((c) => (
          <span key={c} className={c === S.channel ? "vx-slack__ch is-cur" : "vx-slack__ch"}>
            # {c}
          </span>
        ))}
      </div>
      <div className="vx-slack__main">
        <p className="vx-slack__bar"># {S.channel}</p>
        <div className="vx-slack__feed">
          <div className="vx-smsg" data-cue="s.intro">
            {/* lazy on the homepage only (`headless`): there the demo sits far below the fold, and an
                eager img makes React hoist a <link rel="preload"> for the mascot into <head>, a
                change outside the demo section. The /for pages keep their markup (eager). */}
            {/* eslint-disable-next-line @next/next/no-img-element -- 6 KB mascot, the Slack app avatar */}
            <img
              className="vx-smsg__av"
              src="/pancake-mark.png"
              alt=""
              width={32}
              height={32}
              loading={lazyAvatar ? "lazy" : undefined}
              decoding={lazyAvatar ? "async" : undefined}
            />
            <p className="vx-smsg__meta">
              <b>{S.bot}</b>
              <span className="vx-apptag">{S.app}</span>
              <span className="vx-smsg__time">{S.time}</span>
            </p>
            <p className="vx-smsg__text">{S.intro}</p>
          </div>
          <SlackLead m={m} i={0} />
          <SlackLead m={m} i={1} />
          <SlackLead m={m} i={2} />
        </div>
        <p className="vx-slack__composer">{S.composer}</p>
      </div>
    </>
  );
}

/* ─── section ──────────────────────────────────────────────────────────────── */

/**
 * `headless`: the demo sits inside a section that already has its visible head (the homepage's
 * LpDemoTour: eyebrow, H2 = demo.h2, lede, prompt rows) — no hidden H2, no own accessible name
 * (the band is a plain part of that section, not a second landmark with the same title).
 * `gate`: what the first autoplay start waits for (VxDemoPlayer). "composer" (the /for pages:
 * the demo sits right under the hero) or "window" (the homepage: ≥768 it starts once 35% of the
 * app window shows, since its section head keeps the composer below most laptop folds).
 */
export function VxDemo({
  v,
  headless = false,
  gate = "composer",
}: {
  v: DemoSource;
  headless?: boolean;
  gate?: "composer" | "window";
}) {
  const m = buildDemoModel(v);
  return (
    // id="vx-demo": the prompt rows link here (scroll-margin-top clears the sticky phone nav)
    <section className="vx-demo" id="vx-demo" aria-labelledby={headless ? undefined : "vx-demo-title"}>
      {/* the section's name for the outline and screen readers; the tab bar is the visible head */}
      {headless ? null : (
        <h2 id="vx-demo-title" className="vx-sr">
          {v.demo.h2}
        </h2>
      )}
      <VxDemoPlayer
        model={m.player}
        gate={gate}
        app={
          <>
            <AppBar />
            <div className="vx-app__body">
              <div className="vx-app__stack">
                <BriefPane m={m} />
                <LeadsPane m={m} />
                <OutreachPane m={m} />
              </div>
            </div>
          </>
        }
        slack={<SlackWindow m={m} lazyAvatar={headless} />}
      />
    </section>
  );
}
