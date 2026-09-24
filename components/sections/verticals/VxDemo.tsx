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
// Outbound · AI SEO · Brain tablist with the pink-pale indicator, the floating rail with
// the blue-pale active item, the Signals page cards, the docked Ask Pancake panel (user
// bubble, tool row, answer card, pale-pink proposal card), the header-less leads table,
// the lead sheet, the campaign journey and the Slack "New lead from Pancake" post.
// Mock controls are spans inside role="img" windows — never focusable.
//
// Cue / swap / mark ids are the timeline's (lib/verticals/demo-timeline.ts):
//   data-cue  → revealed in place at its time      (.is-on)
//   data-uncue → shown until that cue id is reached (.is-off; armed only)
//   data-swap → children [data-s=before|after]     (.is-sw)
//   data-mark → a state class, e.g. the picked row (.is-mk)
//   data-cursor → a cursor target (.is-press while clicked)

import { Fragment, type ReactNode } from "react";
import { buildDemoModel, type DemoModel, type DemoPromptView, type DemoSigView } from "@/lib/verticals/demo-model";
import type { DemoSource, SignalKind } from "@/lib/verticals/types";
import { VxDemoPlayer } from "./VxDemoPlayer";
import { SIGNAL_GROUPS, VX_DEMO } from "./vx-copy";

const A = VX_DEMO.app;

// DOM budget (spec §4.3: demo ≤ 650 elements): every icon and checkbox is a pseudo-element
// (data-ico → a CSS mask in demo.css), lead rows are one flat grid, and anything identical
// across the three prompts is rendered once, outside the variants.
//
// No platform names or logos anywhere in the mock (founder 2026-09-23, validate.ts PLATFORM):
// the app's platform glyph after each lead name is gone, and the sheet's platform row reads
// "Profile · View ↗".

const SIG_ICON: Record<SignalKind, string> = {
  keyword: "hash",
  competitor: "target",
  influencer: "megaphone",
  own_brand: "building",
  hiring: "briefcase",
  stack: "stack",
};

function Chip({ kind, children }: { kind: SignalKind; children: string }) {
  return (
    <span className="vx-chip" data-kind={kind}>
      {children}
    </span>
  );
}

/* ─── app chrome (shared by Brief, Leads and Outreach) ─────────────────────── */

function AppBar() {
  return (
    <div className="vx-app__bar">
      {/* eslint-disable-next-line @next/next/no-img-element -- the site's own wordmark, tiny, decorative */}
      <img className="vx-app__logo" src="/lp/lp-nav-logo.svg" alt="" width={45} height={22} />
      <span className="vx-app__center">
        <span className="vx-app__home" data-ico="house" />
        <span className="vx-app__nav">
          {A.nav.map((l, i) => (
            <span key={l} className={i === 0 ? "is-cur" : undefined}>
              {l}
            </span>
          ))}
        </span>
      </span>
      <span className="vx-app__cta">
        <span className="vx-app__mark" data-ico="claude" />
        <span className="vx-app__mark" data-ico="codex" />
        {A.cta}
      </span>
    </div>
  );
}

function Rail({ m }: { m: DemoModel }) {
  return (
    <div className="vx-rail">
      <span className="vx-rail__ws" data-initial={m.workspace.initial}>
        <span>{m.workspace.name}</span>
      </span>
      <span className="vx-rail__item" data-ico="grid">
        {A.rail[0]}
      </span>
      <span className="vx-rail__item" data-ico="users" data-item="1">
        {A.rail[1]}
      </span>
      <span className="vx-rail__item" data-ico="send" data-item="2">
        {A.rail[2]}
      </span>
      <span className="vx-rail__item vx-rail__foot" data-ico="pulse" data-item="0">
        {A.railFoot}
      </span>
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

/* ─── 01 Brief: Signals page + docked Ask Pancake panel ─────────────────────── */

function Chips({ s, className, ...rest }: { s: DemoSigView; className?: string; "data-s"?: string }) {
  // chip 1, then chip 2 + "+N more" as one unbreakable group: when the group wraps to
  // the second row it takes the full width, so "+N more" can never be pushed out of view
  const [c1, c2] = s.chips;
  return (
    <span className={`vx-sig__chips${className ? ` ${className}` : ""}`} {...rest}>
      {c1 && <span className="vx-achip">{c1}</span>}
      {(c2 || s.more > 0) && (
        <span className="vx-sig__tail">
          {c2 && <span className="vx-achip">{c2}</span>}
          {s.more > 0 && <span className="vx-amore">{A.signals.more(s.more)}</span>}
        </span>
      )}
    </span>
  );
}

function SigBody({ s, p }: { s: DemoSigView; p?: string }) {
  if (s.state === "grown") {
    // Own brand stays on; the approval appends the proposed profiles as "+N more"
    return (
      <span className="vx-sig__v" data-p={p}>
        <span className="vx-sig__corner">
          <span className="vx-switch" />
        </span>
        <span className="vx-sig__body vx-swapc" data-swap={`b.sig${s.order}`}>
          <Chips s={s} data-s="before" />
          <Chips s={{ ...s, more: s.more + s.grow }} data-s="after" />
        </span>
      </span>
    );
  }
  if (s.state === "proposed") {
    const id = `b.sig${s.order}`;
    return (
      <span className="vx-sig__v" data-p={p}>
        <span className="vx-sig__corner vx-swapc" data-swap={id}>
          <span className="vx-setup" data-s="before">
            {A.signals.setUp}
          </span>
          <span className="vx-switch" data-s="after" />
        </span>
        <span className="vx-sig__body vx-swapc" data-swap={id}>
          <span className="vx-sig__empty" data-s="before">
            {s.empty}
          </span>
          <Chips s={s} data-s="after" />
        </span>
      </span>
    );
  }
  return (
    <span className="vx-sig__v" data-p={p}>
      <span className="vx-sig__corner">
        {s.state === "on" ? <span className="vx-switch" /> : <span className="vx-setup">{A.signals.setUp}</span>}
      </span>
      <span className="vx-sig__body">
        {s.state === "on" ? <Chips s={s} /> : <span className="vx-sig__empty">{s.empty}</span>}
      </span>
    </span>
  );
}

/** Identical static views (on / empty, same chips) share one element; a proposed view is always its own. */
const sigKey = (s: DemoSigView, i: number) =>
  s.state === "proposed" || s.state === "grown" ? `p${i}` : `${s.state}|${s.chips.join("|")}|${s.more}|${s.empty}`;

function SigCard({ kind, prompts }: { kind: SignalKind; prompts: DemoPromptView[] }) {
  const views = prompts.map((p) => p.sigs[kind]);
  // DOM budget: group the three prompt views by content; a group's data-p lists every prompt
  // it covers ("12" = prompts 1 and 2), and demo.css hides a variant whose data-p lacks the
  // current prompt. One group for all three = no variant wrapper at all.
  const groups: { s: DemoSigView; p: string }[] = [];
  views.forEach((s, i) => {
    const hit = groups.find((g) => sigKey(g.s, -1) === sigKey(s, i));
    if (hit) hit.p += String(i);
    else groups.push({ s, p: String(i) });
  });
  return (
    <div className="vx-sig" data-kind={kind}>
      <span className="vx-sig__top">
        <span className="vx-sig__tile" data-ico={SIG_ICON[kind]} />
        {views[0].label}
      </span>
      {groups.length === 1 ? (
        <SigBody s={views[0]} />
      ) : (
        <span className="vx-var">
          {groups.map((g) => (
            <SigBody key={g.p} s={g.s} p={g.p} />
          ))}
        </span>
      )}
    </div>
  );
}

function BriefPane({ m }: { m: DemoModel }) {
  return (
    <div className="vx-pane vx-brief" data-pane="0">
      <div className="vx-page vx-sigpage">
        <PageHead title={A.signals.title} sub={A.signals.sub} />
        {SIGNAL_GROUPS.map((g) => (
          <Fragment key={g.label}>
            <p className="vx-sigpage__group">{g.label}</p>
            <div className="vx-sigs">
              {g.kinds.map((k) => (
                <SigCard key={k} kind={k} prompts={m.prompts} />
              ))}
            </div>
          </Fragment>
        ))}
      </div>

      <div className="vx-chat">
        <p className="vx-chat__head" data-ico="sparkle">
          {A.chat.head}
          <span className="vx-chat__new" data-ico="plus">
            {A.chat.newChat}
          </span>
        </p>
        <div className="vx-chat__log vx-var">
          {/* the empty conversation's starter chips, until the prompt is sent (armed only) */}
          <p className="vx-starters" data-uncue="b.bubble">
            {A.chat.starters.map((q) => (
              <span key={q}>{q}</span>
            ))}
          </p>
          {m.prompts.map((p, i) => (
            <div key={i} className="vx-thread" data-p={i}>
              <p className="vx-bubble" data-cue="b.bubble">
                {p.text}
              </p>
              <p className="vx-tool" data-cue="b.tool" data-ico="gear">
                {A.chat.tool}
                <span className="vx-tool__st">{A.chat.toolDone}</span>
              </p>
              <p className="vx-answer" data-cue="b.reply">
                {p.reply}
              </p>
              <div className="vx-prop" data-cue="b.prop">
                <p className="vx-prop__label vx-swapc" data-swap="b.approved">
                  <span data-s="before">{A.chat.proposed}</span>
                  <span data-s="after">{A.chat.approved}</span>
                </p>
                <p className="vx-prop__title">{A.chat.proposalTitle}</p>
                <ul className="vx-prop__rows">
                  {p.proposal.map((r, j) => (
                    // the kind chip is li::before (data-kind tints it, data-label is its text)
                    <li key={r.kind} data-cue={`b.row${j}`} data-kind={r.kind} data-label={r.label}>
                      {r.text}
                    </li>
                  ))}
                </ul>
                <p className="vx-prop__foot vx-swapc" data-swap="b.approved" data-cue="b.foot">
                  <span className="vx-btn" data-s="before" data-ico="check" data-cursor="b.approve">
                    {A.chat.approve}
                  </span>
                  <span className="vx-prop__saved" data-s="after" data-ico="check-circle">
                    {A.chat.saved}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="vx-composer">
          <span className="vx-composer__field">
            <span className="vx-composer__in">
              <span className="vx-composer__line">
                <span className="vx-typed" />
              </span>
            </span>
            {/* the placeholder is a pseudo-element: the long line, or the short one under 300px */}
            <span className="vx-ph" data-long={A.chat.placeholder} data-short={A.chat.placeholderShort} />
          </span>
          <span className="vx-send" data-ico="arrow-up" />
        </div>
      </div>
    </div>
  );
}

/* ─── 02 Leads: header-less table + lead sheet ─────────────────────────────── */

function LeadsPane({ m }: { m: DemoModel }) {
  return (
    <div className="vx-pane vx-leads" data-pane="1">
      <div className="vx-page">
        <PageHead title={A.leads.title} sub={A.leads.sub} />
        <p className="vx-count" data-cue="l.rows">
          {A.leads.count(5)}
        </p>
        <div className="vx-table vx-var" data-cue="l.rows">
          {m.prompts.map((p, i) => (
            <div key={i} className="vx-rowset" data-p={i}>
              {p.leads.map((l, r) => (
                // one flat grid per row: ::before = checkbox, ::after = the stage pill
                <div
                  key={l.name}
                  className="vx-row"
                  data-cue={`l.row${r}`}
                  data-mark={r === 0 ? "l.sel" : undefined}
                  data-stage={A.drawer.stage}
                >
                  <span className="vx-av">{l.initials}</span>
                  <span className="vx-row__name" data-cursor={r === 0 ? "l.pick" : undefined}>
                    {l.name}
                  </span>
                  <span className="vx-row__role">
                    {l.role} @ {l.company}
                  </span>
                  <Chip kind={l.kind}>{l.kindLabel}</Chip>
                  <span className="vx-row__detail">{l.signal}</span>
                  {r === 0 ? (
                    <span className="vx-row__act vx-swapc" data-swap="l.added">
                      <span className="vx-pair" data-s="before">
                        <span className="vx-btn" data-ico="check">
                          {A.leads.approve}
                        </span>
                        <span className="vx-xbtn" data-ico="x" />
                      </span>
                      <span className="vx-btn vx-btn--ink" data-s="after" data-ico="plus">
                        {A.leads.add}
                      </span>
                    </span>
                  ) : (
                    <span className="vx-row__act vx-btn vx-btn--x" data-ico="check">
                      {A.leads.approve}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="vx-bad" data-cue="l.bad" data-ico="caret">
          {A.leads.bad}
        </p>
      </div>

      <div className="vx-drawer" data-cue="l.drawer">
        {/* DOM budget: head + chips, the signal box and the timeline vary per prompt; the
            property grid is shared, with only its two per-lead values in variants (all rows are
            one line, so the stacked cells keep today's heights). Every stacked slot reserves its
            tallest variant, so the sheet never changes height between prompts. */}
        <div className="vx-var">
          {m.prompts.map((p, i) => {
            const l = p.leads[0];
            return (
              <div key={i} className="vx-drawer__v" data-p={i}>
                <div className="vx-drawer__head">
                  <span className="vx-av vx-av--lg">{l.initials}</span>
                  <span className="vx-drawer__name">{l.name}</span>
                  <span className="vx-drawer__role">
                    {l.role} @ {l.company}
                  </span>
                </div>
                <p className="vx-drawer__chips" data-cue="l.d1" data-stage={A.drawer.stage}>
                  <Chip kind={l.kind}>{l.kindLabel}</Chip>
                  <span className="vx-conf">{A.drawer.confidence(p.featured.confidence)}</span>
                </p>
              </div>
            );
          })}
        </div>
        <div className="vx-props" data-cue="l.d2">
          <span data-ico="building">{A.drawer.props.company}</span>
          <span data-ico="medal">{A.drawer.props.seniority}</span>
          <div className="vx-var">
            {m.prompts.map((p, i) => (
              <b key={i} data-p={i}>
                {p.leads[0].company}
              </b>
            ))}
          </div>
          <div className="vx-var">
            {m.prompts.map((p, i) => (
              <b key={i} data-p={i}>
                {p.featured.seniority}
              </b>
            ))}
          </div>
          <span data-ico="globe">{A.drawer.props.country}</span>
          <span data-ico="user">{A.drawer.props.profile}</span>
          <b>{A.drawer.country}</b>
          <b className="vx-link">{A.drawer.profileLink}</b>
        </div>
        {/* SIGNAL: the chip + the qualification reason, as the app's box */}
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
        {/* TIMELINE (leads/lead-timeline.tsx): "Qualified as a lead" + reason, then the sighting
            that surfaced the lead, or the cold-lead note for hiring / stack leads */}
        <div className="vx-var vx-tlv">
          {m.prompts.map((p, i) => {
            const t = p.timeline;
            const sg = t.sighting;
            return (
              <div key={i} className="vx-tl" data-p={i} data-cue="l.d4" data-label={A.drawer.timeline}>
                <p className="vx-tl__e" data-ico="target">
                  <b>{A.drawer.qualified}</b>
                  <span className="vx-tl__why">{p.featured.why}</span>
                </p>
                {sg && (
                  <p className="vx-tl__e" data-ico={sg.kind === "comment" ? "chat" : "heart"}>
                    <b>{sg.kind === "comment" ? A.drawer.commented : A.drawer.reacted}</b>
                    <span>
                      {sg.source}
                      {sg.kind === "reaction" ? ` · ${A.drawer.like}` : ""} · <i>{A.drawer.viewPost}</i>
                    </span>
                  </p>
                )}
                {t.cold && <p className="vx-tl__note">{t.cold}</p>}
              </div>
            );
          })}
        </div>
        {/* the action bar is its own swap cell: Ask AI (left) stays, Approve ✕ → Add to campaign */}
        <div className="vx-drawer__foot" data-cue="l.foot" data-swap="l.added">
          <span className="vx-btn vx-btn--ai" data-ico="sparkle">
            {A.drawer.askAi}
          </span>
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

/* ─── 03 Outreach: the lead's campaign journey ─────────────────────────────── */

const STEP_ICON = ["eye", "thumbs", "user-plus", "chat", "chat", "chat"];
const STEP_TONE: SignalKind[] = ["keyword", "competitor", "own_brand", "influencer", "influencer", "influencer"];

function OutreachPane({ m }: { m: DemoModel }) {
  const C = A.campaign;
  return (
    <div className="vx-pane vx-camp" data-pane="2">
      <div className="vx-page">
        <PageHead title={C.title} sub={C.sub} extra={<span className="vx-stagepill">{C.status}</span>} />
        {/* the card arrives with its head (the lead + the "Invited" status chip): o.head */}
        <div className="vx-journey" data-cue="o.head">
          <div className="vx-journey__head">
            <span className="vx-var vx-journey__lead">
              {m.prompts.map((p, i) => {
                const l = p.leads[0];
                return (
                  <span key={i} className="vx-journey__who" data-p={i} data-step={C.journey}>
                    <span className="vx-av">{l.initials}</span>
                    <b>{l.name}</b>
                  </span>
                );
              })}
            </span>
            {/* campaign-lead-view.ts: the invite step is current → "Invited", blue */}
            <Chip kind="keyword">{C.leadStatus}</Chip>
          </div>
          <div className="vx-journey__grid">
            <ol className="vx-steps">
              {/* phones fold the three message steps into step 4's row: data-fold is its label there */}
              {C.steps.map((s, k) => (
                <li
                  key={k}
                  className="vx-step"
                  data-cue={`o.s${k}`}
                  data-state={s.state.toLowerCase()}
                  data-fold={k === 3 ? C.fold : undefined}
                >
                  <span className="vx-step__tile" data-kind={STEP_TONE[k]} data-ico={STEP_ICON[k]} />
                  <span className="vx-step__name">{s.label}</span>
                  <span className="vx-step__st">{s.state}</span>
                  {s.sub && <span className="vx-step__sub">{s.sub}</span>}
                </li>
              ))}
            </ol>
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

function SlackWindow({ m }: { m: DemoModel }) {
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
            {/* lazy: the Slack pane is the demo's last step — without it React hoists a
                <link rel="preload"> for the mascot into <head>, ahead of the page's own art */}
            {/* eslint-disable-next-line @next/next/no-img-element -- 6 KB mascot, the Slack app avatar */}
            <img className="vx-smsg__av" src="/pancake-mark.png" alt="" width={32} height={32} loading="lazy" decoding="async" />
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
 */
export function VxDemo({ v, headless = false }: { v: DemoSource; headless?: boolean }) {
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
        app={
          <>
            <AppBar />
            <div className="vx-app__body">
              <Rail m={m} />
              <div className="vx-app__stack">
                <BriefPane m={m} />
                <LeadsPane m={m} />
                <OutreachPane m={m} />
              </div>
            </div>
          </>
        }
        slack={<SlackWindow m={m} />}
      />
    </section>
  );
}
