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
//   · the Claude & Codex view — redrawn on 2026-10-13: the same request and the same logic in
//     Claude's own interface, as the launch film drew it (the Pancake connector chip in the
//     composer, one card per tool call under the Pancake mark, the Play, Claude's permission
//     prompt, Live). Its own GSAP timeline (lp-demo-claude-timeline.ts, lazy).
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

import { GUIDE_PATH } from "@/components/sections/guide-claude/guide-copy";
import { VX_DEMO } from "@/components/sections/verticals/vx-copy";
import { HOME_DEMO } from "@/lib/verticals/home-demo";
import { ClaudeMark, Cursor, LpClaudeScene, type ClaudeScript } from "./LpClaudeScene";
import { LP_DEMO } from "./lp-demo-data";
import { LpDemoPlayer } from "./LpDemoPlayer";

const P = LP_DEMO.pancake;
const C = LP_DEMO.claude;

/* ─── Pancake view ─────────────────────────────────────────────────────────── */

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
        <a className="lp-demowin__agent" href={GUIDE_PATH}>
          <span className="lp-demowin__badges" aria-hidden="true">
            <span className="lp-demowin__badge">
              <ClaudeMark id="spark" className="lp-demowin__badge-claude" />
            </span>
            <span className="lp-demowin__badge">
              <ClaudeMark id="openai" className="lp-demowin__badge-codex" />
            </span>
          </span>
          {P.chipCta}
        </a>
      </p>
    </div>
  );
}

/* ─── Claude & Codex view ──────────────────────────────────────────────────── */

/** The demo's Claude script: the same request and the same logic as the Pancake view (research,
 *  leads, the Play, deploy), in Claude's interface (LpClaudeScene). */
const CLAUDE_SCRIPT: ClaudeScript = {
  request: P.request,
  say: C.say,
  tools: C.tools,
  found: C.found,
  card: {
    kicker: P.play.kicker,
    title: P.play.name,
    before: P.play.draft,
    after: P.play.live,
    rows: [P.play.who, P.play.signal, P.play.pace],
  },
  ask: C.ask,
  action: C.deploy,
  done: C.done,
};

/* ─── section ──────────────────────────────────────────────────────────────── */

/** No JS: nothing will ever grow the card, so it is drawn at its full size (demo.css starts
 *  it at .94 on desktop and lp-demo-scroll.ts takes it to 1). */
const NOSCRIPT_CSS = "<style>.lp-demowin .lp-demowin__card{scale:none!important}</style>";

export function LpDemo() {
  return (
    <section className="lp-demowin" id="lp-demowin" aria-labelledby="lp-demowin-title">
      <h2 id="lp-demowin-title" className="lp-sr-only">
        {HOME_DEMO.demo.h2}
      </h2>
      <p className="lp-sr-only">{LP_DEMO.summary}</p>
      <LpDemoPlayer
        pills={[LP_DEMO.pills[0], LP_DEMO.pills[1]]}
        tablist={LP_DEMO.tablist}
        pause={VX_DEMO.controls.pause}
        pancake={<PancakeView />}
        claude={<LpClaudeScene script={CLAUDE_SCRIPT} chrome={C} label={C.aria} />}
      />
      <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT_CSS }} />
    </section>
  );
}
