import {
  S1_HUBS,
  S1_ROWS,
  S1_SKELETON_TOPS,
  S2_BAR,
  S2_CHAT,
  S2_DRAFT,
  S2_PLAYS,
  S2_QUESTION,
  S2_SPARK,
  S3_CHIPS,
  S3_DAYS,
  S3_RULE_TOPS,
  S3_THREAD,
  S3_TICK_TOPS,
  SX_CHECK_D,
  SX_LEADS,
  SX_LEADS_COPY,
  s1Graph,
} from "./lp-step-data";
import type { StepVariant } from "./lp-step-timelines";

/**
 * The three step mock UIs as DOM, with their geometry in steps.css. Step 01
 * and step 03's calendar are the pancake-studio compositions' markup
 * (shorts/brain-research-loop, meetings-calendar-loop); step 02 and step 03's
 * intro are the designer's "How it works" storyboards (Figma, 2026-10-11:
 * frames 5016:4214 → 5022:6230 and 5022:6116 → 5022:6080). Rest state = each
 * animation's FRAME 0 (the empty URL input, the chat request, the selected
 * leads): every animation-only layer is invisible at rest and driven by
 * lp-step-timelines.ts from there. Purely decorative — the host carries the
 * alt text (LpStepAnim.tsx). Every string comes from lp-step-data.ts (linted).
 */

/* ── step 01 · URL input → the knowledge graph → the market profile ── */

function S1Stage() {
  const { edges, dots } = s1Graph();
  return (
    <div className="lp-step-stage lp-step-stage--s1" aria-hidden="true">
      <div className="lp-s1-ui">
        <div className="lp-s1-input">
          <span className="lp-s1-ph">example.com</span>
          {/* revealed glyph by glyph with a clip inset (advance widths in lp-step-data.ts) */}
          <span className="lp-s1-typed">studio-pelican.com</span>
          <i className="lp-s1-caret" />
        </div>
        <div className="lp-s1-btn">
          <span className="lp-s1-btntxt">Start research</span>
        </div>
        <i className="lp-s1-ring" />
        <img className="lp-s1-cursor" src="/lp/lp-s1-cursor.svg" alt="" width={51} height={53} loading="lazy" decoding="async" />
      </div>

      <div className="lp-s1-graph">
        {/* edges draw in from the hub end: dash = the line's own length, fully offset at rest */}
        <svg className="lp-s1-edges" viewBox="0 0 464 426" xmlns="http://www.w3.org/2000/svg">
          {edges.map((e, i) => (
            <line
              key={i}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              data-len={e.len}
              style={{ strokeDasharray: e.len, strokeDashoffset: e.len }}
            />
          ))}
        </svg>
        <div className="lp-s1-nodes">
          {dots.map((d, i) => (
            <i
              key={i}
              className="lp-s1-dot"
              style={{ left: d.x - d.r, top: d.y - d.r, width: 2 * d.r, height: 2 * d.r, background: d.fill }}
            />
          ))}
        </div>
        <i className="lp-s1-bping" />
        <i className="lp-s1-center" />
        <p className="lp-s1-clabel">Studio Pelican</p>
        {/* the five hubs' names (Figma V2 4962:839–845, "Labels in 2nd level dots",
            2026-10-09): last in the graph, so they paint over its edges and dots as in
            Figma, and they ride its glide/scale transform; hidden at rest (frame 0) */}
        {S1_HUBS.map((h) => (
          <p key={h.label.text} className="lp-s1-hlabel" style={{ left: h.label.cx, top: h.label.top }}>
            {h.label.text}
          </p>
        ))}
      </div>

      <div className="lp-s1-panel">
        <p className="lp-s1-ptitle">Market profile</p>
        <p className="lp-s1-psub lp-s1-sub-a">Researching...</p>
        <p className="lp-s1-psub lp-s1-sub-b">5 insights</p>
        {S1_SKELETON_TOPS.map((top) => (
          <div key={top} className="lp-s1-srow" style={{ top }}>
            <i className="lp-s1-skel lp-s1-skel--sq" />
            <i className="lp-s1-skel lp-s1-skel--bar" />
          </div>
        ))}
        {S1_ROWS.map((r) => (
          <div key={r.name} className="lp-s1-row" style={{ top: r.top }}>
            <i className="lp-s1-rdot" />
            <p className="lp-s1-rname">{r.name}</p>
            <p className="lp-s1-rsub">{r.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── steps 02 + 03 · shared atoms (the leads table, its avatars and checkboxes, the hand) ── */

function SxAvatar({ initials }: { initials: string }) {
  return <span className="lp-sx-av">{initials}</span>;
}

/** 16×16 checkbox: the outlined box, and the ticked one stacked on it (scaled in by the
    timeline; shown at once inside a `selected` table) */
function SxCheckbox() {
  return (
    <span className="lp-sx-cb">
      <svg className="lp-sx-cb-off" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.3333" y="0.3333" width="15.3333" height="15.3333" rx="3.6667" />
      </svg>
      <span className="lp-sx-cb-on">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d={SX_CHECK_D} />
        </svg>
      </span>
    </span>
  );
}

/** The Leads view (Figma: step 02 frames 5–7, step 03 frame 1), laid at its frame-6 pose.
    The storyboard's platform icon after each name is deliberately not drawn. */
function SxLeads({ selected = false }: { selected?: boolean }) {
  return (
    <div className={"lp-sx-leads" + (selected ? " lp-sx-leads--selected" : "")}>
      <p className="lp-sx-leads-title">{SX_LEADS_COPY.title}</p>
      <div className="lp-sx-table">
        <div className="lp-sx-thead">
          <SxCheckbox />
          <span className="lp-sx-th lp-sx-th--lead">{SX_LEADS_COPY.lead}</span>
          <span className="lp-sx-th lp-sx-th--pos">{SX_LEADS_COPY.position}</span>
        </div>
        {SX_LEADS.map((l, i) => (
          <div key={l.name} className="lp-sx-row" style={{ top: 32 + 48 * i }}>
            <SxCheckbox />
            <SxAvatar initials={l.initials} />
            <span className="lp-sx-name">{l.name}</span>
            <span className="lp-sx-pos">{l.position}</span>
          </div>
        ))}
        {/* the rules are the table's own: the rows fade in over them (frame 5) */}
        {SX_LEADS.map((l, i) => (
          <i key={l.name} className="lp-sx-rule" style={{ top: 32 + 48 * i }} />
        ))}
      </div>
    </div>
  );
}

/** the pointing hand (Figma instance "State=Hand"); the timeline places it by its top-left */
function SxHand() {
  return (
    <img className="lp-sx-hand" src="/lp/lp-step-hand.svg" alt="" width={31} height={33} loading="lazy" decoding="async" />
  );
}

/* ── step 02 · the chat request → one question → a Play takes shape → the leads, all
   selected and added to the sequence → the Play card ── */

function S2Stage({ placeholders }: { placeholders: boolean }) {
  const q = S2_QUESTION;
  return (
    <div className="lp-step-stage lp-step-stage--s2" aria-hidden="true">
      <i className="lp-sx-bg" />

      {/* frames 1–3: the thread scrolls as one; the question card is its next item */}
      <div className="lp-s2-chat">
        <p className="lp-s2-bubble">{S2_CHAT.prompt}</p>
        <div className="lp-s2-worked">
          <span>{S2_CHAT.worked}</span>
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7L8 11L12 7" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="lp-s2-answer">{S2_CHAT.answer}</p>

        <div className="lp-s2-q">
          <div className="lp-s2-q-item lp-s2-q-head">
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7.9987 14.6668C11.6806 14.6668 14.6654 11.6821 14.6654 8.00016C14.6654 4.31826 11.6806 1.3335 7.9987 1.3335C4.3168 1.3335 1.33203 4.31826 1.33203 8.00016C1.33203 11.6821 4.3168 14.6668 7.9987 14.6668Z" />
                <path d="M6.05859 5.99989C6.21533 5.55434 6.5247 5.17863 6.9319 4.93931C7.3391 4.7 7.81786 4.61252 8.28338 4.69237C8.7489 4.77222 9.17114 5.01424 9.47531 5.37558C9.77949 5.73691 9.94596 6.19424 9.94526 6.66656C9.94526 7.99989 7.94526 8.66656 7.94526 8.66656" />
                <path d="M8 11.3335H8.00667" />
              </g>
            </svg>
            <span>{q.head}</span>
          </div>
          <p className="lp-s2-q-item lp-s2-q-text">{q.text}</p>
          {q.options.map((label, k) => (
            <div key={label} className="lp-s2-q-item lp-s2-opt" style={{ top: 88 + 44 * k }}>
              {/* the hover plate sits under the picked option's disc and label */}
              {k === q.picked && <i className="lp-s2-hover" />}
              <span className="lp-s2-opt-n">{k + 1}</span>
              <span className="lp-s2-opt-l">{label}</span>
            </div>
          ))}
          <div className="lp-s2-q-item lp-s2-opt lp-s2-opt--own" style={{ top: 88 + 44 * q.options.length }}>
            <span className="lp-s2-opt-n">
              <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.587 3.40619C10.8513 3.1419 10.9999 2.78342 10.9999 2.40962C11 2.03581 10.8515 1.6773 10.5872 1.41294C10.3229 1.14859 9.96445 1.00005 9.59064 1C9.21684 0.999953 8.85832 1.1484 8.59397 1.41269L1.92097 8.08719C1.80488 8.20294 1.71902 8.34546 1.67097 8.50219L1.01047 10.6782C0.997545 10.7214 0.996569 10.7674 1.00764 10.8111C1.01872 10.8549 1.04143 10.8948 1.07337 10.9267C1.1053 10.9586 1.14528 10.9812 1.18905 10.9922C1.23282 11.0032 1.27875 11.0022 1.32197 10.9892L3.49847 10.3292C3.65505 10.2816 3.79755 10.1962 3.91347 10.0807L10.587 3.40619Z" />
                  <path d="M7.5 2.5L9.5 4.5" />
                </g>
              </svg>
            </span>
            <span className="lp-s2-opt-l">{q.own}</span>
          </div>
        </div>
      </div>

      {/* frame 4: "Your Play takes shape here" — every slot starts undecided (its numbered
          disc + "Not decided yet"); the timeline decides the first three */}
      <div className="lp-s2-draft">
        <div className="lp-s2-draft-head">
          <i className="lp-s2-tile">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 5H3" />
                <path d="M10 12H3" />
                <path d="M10 19H3" />
                <path d="M15 12.003C14.9995 11.8256 15.0462 11.6511 15.1353 11.4977C15.2245 11.3442 15.3528 11.2173 15.5073 11.1298C15.6617 11.0424 15.8366 10.9976 16.0141 11.0001C16.1915 11.0026 16.3651 11.0523 16.517 11.144L21.514 14.141C21.6628 14.2297 21.786 14.3555 21.8715 14.506C21.9571 14.6566 22.002 14.8268 22.002 15C22.002 15.1732 21.9571 15.3434 21.8715 15.494C21.786 15.6446 21.6628 15.7704 21.514 15.859L16.517 18.856C16.365 18.9478 16.1913 18.9975 16.0138 18.9999C15.8363 19.0024 15.6613 18.9575 15.5068 18.87C15.3524 18.7824 15.224 18.6553 15.1349 18.5017C15.0459 18.3481 14.9993 18.1736 15 17.996V12.003Z" />
              </g>
            </svg>
          </i>
          <p className="lp-s2-eyebrow">{S2_DRAFT.eyebrow}</p>
          <p className="lp-s2-draft-title">{S2_DRAFT.title}</p>
        </div>
        <div className="lp-s2-draft-card">
          {S2_DRAFT.slots.map((slot, k) => (
            <div key={slot.label} className="lp-s2-slot" style={{ top: 16 + 56 * k }}>
              {k > 0 && <i className="lp-s2-slot-rule" />}
              <span className="lp-s2-slot-n">{k + 1}</span>
              {slot.value !== null && (
                <span className="lp-s2-slot-ok">
                  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3346 4L6.0013 11.3333L2.66797 8" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
              <span className="lp-s2-slot-l">{slot.label}</span>
              <span className="lp-s2-slot-u">{S2_DRAFT.undecided}</span>
              {slot.value !== null && <span className="lp-s2-slot-v">{slot.value}</span>}
            </div>
          ))}
        </div>
        <p className="lp-s2-thinking">{S2_DRAFT.thinking}</p>
      </div>

      {/* frames 5–7: the leads, then all selected, the bar and the hand */}
      <SxLeads />
      <div className="lp-s2-bar">
        <span className="lp-s2-bar-count">{S2_BAR.selected}</span>
        <div className="lp-s2-bar-add">
          <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.4591 3.59082L12.7218 18.1631C12.6115 18.5017 12.2976 18.7329 11.9415 18.7383C11.5854 18.7434 11.2649 18.5217 11.1446 18.1865L8.99814 12.1914C8.92052 11.9746 8.93608 11.7352 9.0411 11.5303L9.64267 10.3564L8.46981 10.959C8.26498 11.0639 8.02539 11.0795 7.80868 11.002L1.81356 8.85547C1.47838 8.73517 1.25664 8.41471 1.26181 8.05859C1.26706 7.70239 1.49833 7.38869 1.837 7.27832L16.4093 2.54004L17.9649 2.03418L17.4591 3.59082ZM4.67294 8.1084L8.02939 9.31055L11.1866 7.69141L12.3077 8.81348L10.6876 11.9697L11.8907 15.3271L15.3673 4.63184L4.67294 8.1084Z" />
          </svg>
          <span>{S2_BAR.add}</span>
        </div>
        <svg className="lp-s2-bar-x" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.0039 5.17188L11.1758 9.99902L16.0039 14.8271L15.4141 15.416L14.8252 16.0059L9.99805 11.1777L5.1709 16.0059L4.58203 15.416L3.99219 14.8271L8.81934 9.99902L3.99219 5.17188L5.16992 3.99414L9.99805 8.82129L14.8262 3.99414L16.0039 5.17188Z" />
        </svg>
      </div>

      {/* frame 8, the end picture: the product's Play card, twice (the second is cut by the card) */}
      <div className="lp-s2-plays">
        {S2_PLAYS.map((play) => (
          <div key={play.name} className="lp-s2-play">
            <div className="lp-s2-play-pill">
              <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z" />
              </svg>
              <span>{play.state}</span>
              <svg className="lp-s2-play-caret" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z" />
              </svg>
            </div>
            <p className="lp-s2-play-name">{play.name}</p>
            <p className="lp-s2-play-sum">{play.summary}</p>
            <div className="lp-s2-play-figs">
              {play.figures
                .filter((f) => f.status === "final" || placeholders)
                .map((f) => (
                  <div key={f.label} className="lp-s2-play-fig" data-placeholder={f.status === "placeholder" ? "" : undefined}>
                    <span className={"lp-s2-play-val" + (/\d/.test(f.value) ? "" : " lp-s2-play-val--none")}>{f.value}</span>
                    <span className="lp-s2-play-lbl">{f.label}</span>
                  </div>
                ))}
            </div>
            <svg className="lp-s2-play-spark" viewBox="0 0 88 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* drawn in by the timeline: dash = the line's own length, fully offset at rest */}
              <path d={S2_SPARK.d} style={{ strokeDasharray: S2_SPARK.len, strokeDashoffset: S2_SPARK.len }} />
            </svg>
            <i className="lp-s2-play-rule" />
            <div className="lp-s2-play-btn">
              <span>{play.review}</span>
              <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <SxHand />
    </div>
  );
}

/* ── step 03 · the selected leads → one lead, a message drafted and sent → her reply → the
   meeting → the October week fills up, day by day (today's calendar, unchanged) ── */

function S3Stage() {
  const t = S3_THREAD;
  return (
    <div className="lp-step-stage lp-step-stage--s3" aria-hidden="true">
      <i className="lp-sx-bg" />

      {/* frame 1 (rest): step 02's table, every checkbox on */}
      <SxLeads selected />

      {/* frames 2–5: the thread scrolls as one; each card and connector appears in turn */}
      <div className="lp-s3-thread">
        <div className="lp-s3-tcard lp-s3-lead">
          <SxAvatar initials={t.lead.initials} />
          <span className="lp-s3-lead-name">{t.lead.name}</span>
          <span className="lp-s3-lead-co">
            <b>{t.lead.company}</b>
            {t.lead.position}
          </span>
        </div>
        <i className="lp-s3-conn lp-s3-conn--1" />
        <div className="lp-s3-tcard lp-s3-msg">
          {/* the two eyebrows are stacked: "Drafting..." gives way to "Sent" */}
          <span className="lp-s3-eyebrow lp-s3-eb-draft">{t.drafting}</span>
          <span className="lp-s3-eyebrow lp-s3-eb-sent">{t.sent}</span>
          {/* typed by a clip staircase over the real text; the caret rides the glyph edges */}
          <p className="lp-s3-msg-text">{t.message}</p>
          <i className="lp-s3-caret" />
        </div>
        <i className="lp-s3-conn lp-s3-conn--2" />
        <div className="lp-s3-tcard lp-s3-reply">
          <SxAvatar initials={t.lead.initials} />
          <span className="lp-s3-eyebrow">{t.replyFrom}</span>
          <p className="lp-s3-reply-text">{t.reply}</p>
        </div>
        <i className="lp-s3-conn lp-s3-conn--3" />
        <div className="lp-s3-tcard lp-s3-meet">
          <span className="lp-s3-eyebrow lp-s3-eb-meet">{t.meet}</span>
          <p className="lp-s3-meet-title">{t.meetTitle}</p>
          <p className="lp-s3-meet-when">{t.meetWhen}</p>
          <p className="lp-s3-meet-who">{t.meetWho}</p>
        </div>
      </div>

      {/* the calendar week: the meetings-calendar-loop composition, markup unchanged; hidden
          until the intro has played (steps.css .lp-s3-card) */}
      <div className="lp-s3-card">
        <p className="lp-s3-title">October 2026</p>

        {S3_DAYS.map((d, i) => (
          <div key={d.name} className={"lp-s3-day" + (i === 0 ? " lp-s3-day--today" : "")} style={{ left: d.left }}>
            <span className="lp-s3-dname">{d.name}</span>
            {/* regular + semibold copies of the number: the day in the circle shows the semibold one */}
            <span className="lp-s3-num" style={{ left: d.numLeft }}>
              <span className="lp-s3-rg">{d.num}</span>
              <span className="lp-s3-sb">{d.num}</span>
            </span>
          </div>
        ))}
        <i className="lp-s3-circle" />

        <i className="lp-s3-rule-h" />
        {S3_RULE_TOPS.map((top) => (
          <i key={top} className="lp-s3-rule" style={{ top }} />
        ))}
        {S3_TICK_TOPS.map((top) => (
          <i key={top} className="lp-s3-tick" style={{ top }} />
        ))}

        <div className="lp-s3-chips">
          {S3_CHIPS.map((c) => (
            <div
              key={c.id}
              className={`lp-s3-chip lp-s3-chip--${c.color} lp-s3-chip--h${c.h}`}
              style={{ left: c.x, top: c.top }}
            >
              <i className="lp-s3-bar" />
              <div className="lp-s3-ctxt">
                {c.lines.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
              {/* outcome badge, stamped on the chip's top-right corner once the meeting is past */}
              <div className={"lp-s3-badge " + (c.outcome === "booked" ? "lp-s3-badge--booked" : "lp-s3-badge--follow")}>
                {c.outcome === "booked" ? (
                  <>
                    <svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M1.6 4.3 3.3 5.9 6.5 2.2"
                        stroke="#ffffff"
                        strokeWidth="1.4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Booked</span>
                  </>
                ) : (
                  <span>→ follow-up</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const STAGES: Record<StepVariant, (props: { placeholders: boolean }) => JSX.Element> = {
  s1: S1Stage,
  s2: S2Stage,
  s3: S3Stage,
};

/** `placeholders`: lib/placeholders SHOW_PLACEHOLDERS, decided by the server component
    (LpSteps) and handed down as a plain boolean, like the deep-dive stages */
export function LpStepStage({ variant, placeholders = false }: { variant: StepVariant; placeholders?: boolean }) {
  const Stage = STAGES[variant];
  return <Stage placeholders={placeholders} />;
}
