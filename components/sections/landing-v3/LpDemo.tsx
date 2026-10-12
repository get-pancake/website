// LpDemo — the homepage demo window (V2 Figma 4939:2645, window 4939:2736 / clean copy 4963:848,
// pills 4939:2784; the conversation as storyboard frame "4" 5024:8353 draws it).
// SERVER component. Owner: demo-scroll package. Specs: specs/demo-scroll.md,
// specs/updates/hero-scroll-4.md, specs/updates/mobile-402.md §5.3, _decisions.md §3 + §9 + §10.
//
// The window is assembled and opaque from the first frame (founder 2026-10-12, §10: the
// storyboard's scroll assembly 01 → 02 → 03 is gone). On desktop its top bar peeks at the bottom
// of the first screen (hero.css sizes the hero for it) and the card grows from .94 to 1 as the
// visitor scrolls to it (lp-demo-scroll.ts, demo.css "the one scroll effect").
//
// V2 red note: "keep plays, remove others / pancake view vs claude view of the same example".
// So ONE app window over two pills, Pancake / Claude & Codex, that autoplay between:
//   · the Pancake view — redrawn on 2026-10-12 (founder brief: suggested Plays instead of the
//     three actions, shorter and more relevant copy, one fluid take with no cut): the home
//     (title, empty chat bar, three suggested Plays, the "Use Pancake with Claude or Codex"
//     chip), the request typed and sent, the Play card building itself row by row, the click on
//     "Deploy Play", the card going Live and its first leads. ONE GSAP timeline
//     (lp-demo-pancake-timeline.ts, lazy) over markup that is the REST picture (the home);
//   · the Claude & Codex view — the production request in a Claude-desktop mock (no final
//     design: flagged), still on the class cues of lp-demo-timeline.ts ([data-cue] shows from
//     its time, [data-uncue] hides, [data-swap] flips, [data-press] scales, [data-cursor] is a
//     cursor target). To be redrawn next.
// It replaces LpDemoTour (the /for demo's four tabs). The /for pages keep VxDemo untouched.
//
// Layout (demo.css): everything in the Pancake view is placed against the window (--pk-*
// coordinates). A direct <section> child of main.lp: the agents view hides it with every human
// section (audience.css). Class block `lp-demowin` (`lp-demo` is /demo's <main>).
//
// Phones (≤767): the SAME markup is recomposed by demo.css as the mobile artboard's portrait
// card (5024:9506: no top chrome, centred wordmark, composer docked at the bottom), a fixed
// design box scaled as pixels; no pills and no Claude & Codex view there (decision §9 F1 / F2).
//
// Accessibility: the mock is one role="img" per view with a sentence label; the head is
// aria-hidden (the label covers it). The chip is a real link, so it sits outside the img. The
// stage is data-nosnippet (the mock's text is not quotable); the sr-only summary says what it shows.
// On phones (no pills) the player drops the stage's tabpanel role and hides the chip from
// assistive tech: the card is a picture there.

import { Fragment, type ReactNode } from "react";

import { VX_DEMO } from "@/components/sections/verticals/vx-copy";
import { buildDemoModel } from "@/lib/verticals/demo-model";
import { HOME_DEMO } from "@/lib/verticals/home-demo";
import { lpClaudeSerif } from "./lp-claude-font";
import { LP_DEMO } from "./lp-demo-data";
import { LpDemoPlayer } from "./LpDemoPlayer";

const P = LP_DEMO.pancake;
const C = LP_DEMO.claude;
const PLAY = VX_DEMO.app.chat.play;

/** Shared glyphs, defined once (each is drawn 2–3 times: greeting, corner marks, chip badges). */
function Symbols() {
  return (
    <svg className="lp-demowin__defs" aria-hidden="true" focusable="false" width="0" height="0">
      {/* Claude spark (Figma 4964:3909, assets/story-claude/claude-spark-greeting.svg) */}
      <symbol id="lp-demowin-spark" viewBox="0 0 33.9468 33.9468">
        <path d="M6.66064 22.5675L13.3368 18.8235L13.45 18.4982L13.3368 18.3171H13.0129L11.8955 18.2492L8.07933 18.146L4.77094 18.0088L1.56579 17.8362L0.758145 17.6651L0 16.6679L0.0777947 16.17L0.75673 15.7159L1.72704 15.8008L3.877 15.9465L7.09912 16.17L9.43579 16.3072L12.8998 16.6679H13.45L13.5278 16.4458L13.3383 16.3072L13.1926 16.17L9.85729 13.9125L6.24762 11.5249L4.35792 10.1501L3.33386 9.45559L2.819 8.80212L2.59551 7.37635L3.52339 6.35512L4.76952 6.43999L5.08777 6.52627L6.35088 7.49658L9.04964 9.58431L12.573 12.177L13.0893 12.607L13.2944 12.4613L13.3213 12.358L13.0893 11.9705L11.1727 8.51074L9.12744 4.98876L8.21653 3.52905L7.97608 2.65351C7.88446 2.31723 7.83504 1.97086 7.82897 1.62237L8.88698 0.189536L9.47115 0L10.8799 0.189536L11.474 0.704396L12.351 2.70443L13.7682 5.85723L15.9677 10.143L16.6127 11.4132L16.9564 12.59L17.0851 12.9507H17.3086V12.7442L17.4897 10.3311L17.8249 7.36786L18.1502 3.55592L18.2634 2.48094L18.7952 1.19379L19.8518 0.497886L20.6778 0.893932L21.3568 1.86283L21.262 2.49084L20.8575 5.10899L20.0668 9.21513L19.5519 11.962H19.8518L20.1955 11.6197L21.5887 9.77243L23.9254 6.853L24.958 5.69316L26.1602 4.41449L26.9339 3.80487H28.3951L29.47 5.40178L28.9891 7.05103L27.4842 8.95629L26.238 10.5716L24.4502 12.9762L23.3327 14.8998L23.436 15.0554L23.7019 15.0271L27.7416 14.1699L29.9241 13.7739L32.5281 13.3284L33.7063 13.8772L33.835 14.4359L33.3711 15.5773L30.586 16.2647L27.3201 16.9182L22.4558 18.0682L22.3964 18.1106L22.4657 18.1969L24.6567 18.4034L25.593 18.4543H27.8873L32.1589 18.7726L33.2763 19.5109L33.9468 20.4133L33.835 21.0993L32.1165 21.9763L29.7968 21.4261L24.3809 20.1389L22.5251 19.6736H22.2677V19.8292L23.8137 21.3398L26.651 23.8999L30.1999 27.1956L30.3795 28.0132L29.9241 28.6567L29.4432 28.5874L26.3243 26.2437L25.1206 25.1871L22.3964 22.8957H22.2153V23.1361L22.8433 24.0541L26.1602 29.0344L26.3328 30.562L26.0923 31.0613L25.2324 31.3626L24.2875 31.19L22.344 28.4672L20.3426 25.4021L18.7259 22.6538L18.5279 22.767L17.5745 33.0274L17.1276 33.5507L16.0964 33.9468L15.2379 33.2947L14.7824 32.2381L15.2379 30.1504L15.7881 27.429L16.2336 25.2649L16.6382 22.5774L16.8786 21.6835L16.8616 21.6241L16.6636 21.6496L14.6353 24.4318L11.5518 28.5973L9.11047 31.207L8.52488 31.439L7.51072 30.9156L7.60549 29.9792L8.17269 29.1461L11.5504 24.8519L13.5872 22.1899L14.9026 20.6538L14.8941 20.4303H14.8164L5.8445 26.2522L4.24618 26.4587L3.55734 25.8137L3.64362 24.7585L3.97036 24.4148L6.66913 22.559L6.66064 22.5675Z" />
      </symbol>
      {/* Codex = the OpenAI mark (react-icons SiOpenai path; never the Cursor cube, decision §6) */}
      <symbol id="lp-demowin-openai" viewBox="0 0 24 24">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
      </symbol>
    </svg>
  );
}

function Mark({ id, className }: { id: "spark" | "openai"; className: string }) {
  return (
    <svg className={className} aria-hidden="true" focusable="false">
      <use href={`#lp-demowin-${id}`} />
    </svg>
  );
}

/** The cursor (production's arrow), one per window: the window clips it, so it enters from the
 *  window's bottom edge. */
function Cursor() {
  return (
    <span className="lp-demowin__cursor" aria-hidden="true">
      <svg width="18" height="22" viewBox="0 0 18 22" focusable="false">
        <path d="M1.5 1.5v16.2l4.3-4.1 2.9 6.6 3-1.3-2.9-6.5h6z" />
      </svg>
    </span>
  );
}

/* ─── Pancake view ─────────────────────────────────────────────────────────── */

type Prompt = ReturnType<typeof buildDemoModel>["prompts"][number];

/** A state mark: a ring that turns while Pancake works, then a check. */
function Mark3() {
  return (
    <span className="lp-demowin__st">
      <i className="lp-demowin__st-spin" />
      <i className="lp-demowin__st-ok" data-ico="check" />
    </span>
  );
}

/** One row of the Play card: a check, its key, its value. */
function PlayRow({ k, children }: { k: string; children: ReactNode }) {
  return (
    <li>
      <span className="lp-demowin__st">
        <i className="lp-demowin__st-ok" data-ico="check" />
      </span>
      <span className="lp-demowin__k">{k}</span>
      <span className="lp-demowin__val">{children}</span>
    </li>
  );
}

/** The scene's markup is its REST picture (the home: title, empty chat bar, three suggested
 *  Plays, chip) plus every later element in its hidden state (demo.css); the timeline
 *  (lp-demo-pancake-timeline.ts, lazy) plays the one take over it. The thread is ONE column in
 *  flow (request, research, leads found, the Play, Pancake's last word): what comes next pushes
 *  nothing, and when the research folds away the rest moves up with it. */
function PancakeView() {
  const K = P.play;
  return (
    <div className="lp-demowin__win">
      <div className="lp-demowin__app" role="img" aria-label={P.aria}>
        <div className="lp-demowin__top">
          <span className="lp-demowin__side" data-ico="sidebar" />
          {/* eslint-disable-next-line @next/next/no-img-element -- the window's own 57×22 wordmark (Figma 4939:2763), decorative */}
          <img className="lp-demowin__logo" src="/lp/lp-demo-wordmark.svg" alt="" width={57.42} height={22.48} />
          <span className="lp-demowin__new" data-ico="new-chat">
            {P.newChat}
          </span>
        </div>

        {/* home */}
        <div className="lp-demowin__intro">
          <p className="lp-demowin__title">{P.title}</p>
        </div>
        <div className="lp-demowin__ideas">
          <p className="lp-demowin__label">{P.ideasLabel}</p>
          <ul className="lp-demowin__cards">
            {P.ideas.map((idea) => (
              <li key={idea.kind} className="lp-demowin__idea" data-kind={idea.kind}>
                <span className="lp-demowin__idea-tag">{idea.tag}</span>
                <span className="lp-demowin__idea-t">{idea.title}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* the thread */}
        <div className="lp-demowin__thread">
          <p className="lp-demowin__bubble">{P.request}</p>
          {/* the research: three tool calls, then what they found */}
          <ul className="lp-demowin__work">
            {P.work.map((w) => (
              <li key={w.label}>
                <Mark3 />
                <span className="lp-demowin__work-l">{w.label}</span>
                <span className="lp-demowin__work-r">
                  {"count" in w && <b>{w.count}</b>} {w.result}
                </span>
              </li>
            ))}
          </ul>
          <p className="lp-demowin__found">
            <span className="lp-demowin__avs">
              {P.leads.map((initials) => (
                <span key={initials} className="lp-demowin__av">
                  {initials}
                </span>
              ))}
            </span>
            <span className="lp-demowin__count">
              <b>{P.found}</b> {P.foundLabel}
            </span>
          </p>
          {/* the Play that keeps them coming, and its Live outline (drawn by the timeline) */}
          <div className="lp-demowin__playw">
            <div className="lp-demowin__playc">
              <div className="lp-demowin__play-in">
                <div className="lp-demowin__play-head">
                  <span className="lp-demowin__tile" data-ico="layers" />
                  <span className="lp-demowin__kicker">{K.kicker}</span>
                  <span className="lp-demowin__play-name">{K.name}</span>
                  <span className="lp-demowin__badge-st">
                    <span data-s="draft">{K.draft}</span>
                    <span data-s="live">{K.live}</span>
                  </span>
                </div>
                <ul className="lp-demowin__rows">
                  <PlayRow k={K.who.key}>{K.who.value}</PlayRow>
                  <PlayRow k={K.company.key}>{K.company.value}</PlayRow>
                  <PlayRow k={K.signal.key}>
                    {K.signal.value.map((w) => (
                      <span key={w} className="lp-demowin__kw">
                        {w}
                      </span>
                    ))}
                  </PlayRow>
                  <PlayRow k={K.pace.key}>{K.pace.value}</PlayRow>
                  <PlayRow k={K.then.key}>
                    {K.then.value.map((step, i) => (
                      <Fragment key={step}>
                        {i > 0 && <i className="lp-demowin__arrow" data-ico="right" />}
                        <span className="lp-demowin__step">{step}</span>
                      </Fragment>
                    ))}
                  </PlayRow>
                </ul>
                <div className="lp-demowin__foot">
                  <span className="lp-demowin__go" data-ico="play">
                    <i className="lp-demowin__go-fill" />
                    <span>{K.deploy}</span>
                  </span>
                </div>
              </div>
            </div>
            <svg className="lp-demowin__ring" aria-hidden="true" focusable="false" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lp-demowin-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="var(--lp-blue-30)" />
                  <stop offset="0.35" stopColor="var(--lp-purple-30)" />
                  <stop offset="0.7" stopColor="var(--lp-pink-30)" />
                  <stop offset="1" stopColor="var(--lp-yellow-30)" />
                </linearGradient>
              </defs>
              <rect pathLength={1} stroke="url(#lp-demowin-ring)" />
            </svg>
          </div>
          {/* Pancake's last word: what happens from here */}
          <p className="lp-demowin__after">{P.after}</p>
        </div>

        {/* the chat bar: ONE element, from the home to the dock */}
        <div className="lp-demowin__bar">
          <p className="lp-demowin__bar-ph">{P.placeholder}</p>
          <p className="lp-demowin__bar-text">{P.request}</p>
          <p className="lp-demowin__bar-ask">{VX_DEMO.app.chat.placeholder}</p>
          <span className="lp-demowin__caret" />
          {/* Figma 4939:2726: #30002c, not a token (2 levels off ink-100) */}
          <span className="lp-demowin__send" data-ico="send" />
        </div>
        <Cursor />
      </div>

      {/* the agent chip (Figma raster 4939:2774, rebuilt in DOM): a real link to the guide, so
          it sits outside the role="img" mock.
          TODO(analytics): no click id yet — a new CTA id needs the founder + a GTM trigger. */}
      <p className="lp-demowin__chip">
        <span className="lp-demowin__ask">{P.chipAsk}</span>
        <a className="lp-demowin__agent" href="/guides/claude">
          <span className="lp-demowin__badges" aria-hidden="true">
            <span className="lp-demowin__badge">
              <Mark id="spark" className="lp-demowin__badge-claude" />
            </span>
            <span className="lp-demowin__badge">
              <Mark id="openai" className="lp-demowin__badge-codex" />
            </span>
          </span>
          {P.chipCta}
        </a>
      </p>
    </div>
  );
}

/* ─── Claude & Codex view (FLAGGED: no final design) ───────────────────────── */

function ToolRow({ cue, done, label }: { cue: string; done: string; label: string }) {
  return (
    <p className="lp-demowin__tool" data-cue={cue}>
      <span className="lp-demowin__plug" data-ico="plug" />
      <span>{label}</span>
      <span className="lp-demowin__toolst lp-demowin__swap" data-swap={done}>
        <span className="lp-demowin__spin" data-s="before" />
        <span className="lp-demowin__tick" data-s="after" data-ico="check" />
      </span>
    </p>
  );
}

function ClaudeView({ prompt }: { prompt: Prompt }) {
  return (
    // lpClaudeSerif.variable defines --lp-font-claude-serif here (Literata, homepage-only module)
    <div className={`lp-demowin__cwin ${lpClaudeSerif.variable}`}>
      <div className="lp-demowin__capp" role="img" aria-label={C.aria}>
        {/* rest picture: the greeting, the composer with the same request, Project / Manual */}
        <div className="lp-demowin__home" data-uncue="c.send">
          <p className="lp-demowin__greet">
            <Mark id="spark" className="lp-demowin__greet-spark" />
            {C.greeting}
          </p>
          <div className="lp-demowin__ccomposer">
            <p className="lp-demowin__cprompt">
              {prompt.text}
              <span className="lp-demowin__caret" />
            </p>
            <p className="lp-demowin__ctrls">
              <span className="lp-demowin__plus" data-ico="plus" />
              <span className="lp-demowin__modes">
                <span>{C.modes[0]}</span>
                <span className="is-cur">{C.modes[1]}</span>
              </span>
              <span className="lp-demowin__model">
                {C.model} <span className="lp-demowin__effort">{C.effort}</span>
              </span>
              <span className="lp-demowin__csend" data-ico="arrow-up" data-press="c.send" />
            </p>
          </div>
          <p className="lp-demowin__below">
            <span>{C.below[0]}</span>
            <span>{C.below[1]}</span>
          </p>
        </div>

        {/* the run */}
        <div className="lp-demowin__clog">
          <p className="lp-demowin__cbubble" data-cue="c.send">
            {prompt.text}
          </p>
          <p className="lp-demowin__csay" data-cue="c.say">
            {C.say}
          </p>
          <ToolRow cue="c.t1" done="c.t1done" label={C.tools.plan} />
          <div className="lp-demowin__plan" data-cue="c.plan">
            <p className="lp-demowin__plan-name">{prompt.play.name}</p>
            <ul className="lp-demowin__plan-rows">
              <li>
                <span className="lp-demowin__plan-k">{PLAY.who}</span>
                <span>{prompt.play.who}</span>
              </li>
              <li>
                <span className="lp-demowin__plan-k">{PLAY.how}</span>
                <span className="lp-demowin__v">
                  <span className="lp-demowin__plan-chip">{prompt.play.how.label}</span>
                  <span>{prompt.play.how.text}</span>
                </span>
              </li>
            </ul>
            {/* the approval (the guide: "run it only after a clear yes"), then the two tool calls */}
            <div className="lp-demowin__plan-foot lp-demowin__swap" data-swap="c.allowed" data-cue="c.ask">
              <div className="lp-demowin__askrow" data-s="before">
                <p className="lp-demowin__askq">{C.ask}</p>
                <span className="lp-demowin__allow" data-press="c.allow" data-cursor="c.allow">
                  {C.allow}
                </span>
              </div>
              <div className="lp-demowin__calls" data-s="after">
                <ToolRow cue="c.t2" done="c.t2done" label={C.tools.create} />
                <ToolRow cue="c.t3" done="c.t3done" label={C.tools.run} />
              </div>
            </div>
          </div>
          <p className="lp-demowin__csay" data-cue="c.done">
            {C.done}
          </p>
        </div>
        <div className="lp-demowin__cdock" data-cue="c.send">
          <span className="lp-demowin__ph">{C.placeholder}</span>
          <span className="lp-demowin__csend lp-demowin__csend--off" data-ico="arrow-up" />
        </div>

        {/* Claude + Codex marks, bottom-right (the Figma frames draw Cursor's cube: replaced) */}
        <p className="lp-demowin__marks">
          <Mark id="openai" className="lp-demowin__mark-codex" />
          <Mark id="spark" className="lp-demowin__mark-claude" />
        </p>
        <Cursor />
      </div>
    </div>
  );
}

/* ─── section ──────────────────────────────────────────────────────────────── */

/** No JS: nothing will ever grow the card, so it is drawn at its full size (demo.css starts
 *  it at .94 on desktop and lp-demo-scroll.ts takes it to 1). */
const NOSCRIPT_CSS = "<style>.lp-demowin .lp-demowin__card{scale:none!important}</style>";

export function LpDemo() {
  const m = buildDemoModel(HOME_DEMO);
  // The homepage shows HOME_DEMO's first request only (the other two stay validated with the
  // 40 /for configs, lib/verticals/home-demo.ts).
  const prompt = m.prompts[0];
  return (
    <section className="lp-demowin" id="lp-demowin" aria-labelledby="lp-demowin-title">
      <h2 id="lp-demowin-title" className="lp-sr-only">
        {HOME_DEMO.demo.h2}
      </h2>
      <p className="lp-sr-only">{LP_DEMO.summary}</p>
      <Symbols />
      <LpDemoPlayer
        pills={[LP_DEMO.pills[0], LP_DEMO.pills[1]]}
        tablist={LP_DEMO.tablist}
        pause={VX_DEMO.controls.pause}
        pancake={<PancakeView />}
        claude={<ClaudeView prompt={prompt} />}
      />
      <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT_CSS }} />
    </section>
  );
}
