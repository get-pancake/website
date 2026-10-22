"use client";

import { useEffect, useRef } from "react";

import { ClaudeMark } from "./LpAgentMarks";
import { SL_AVATAR } from "./lp-story-learns-art";
import { mountPlayOnce, type PlayOnceRuntime } from "./lp-play-once";

/**
 * The "Find any buyer you can describe." card (LpBuild): three panes, one story, left to right —
 * the ask in Claude, the program Pancake writes for it, the Play running live. The markup is the
 * END picture (restIsEnd): no JS, reduced motion and a fly-by all show the finished card. The
 * build-up is one GSAP timeline (lp-build-timeline.ts), played once by lp-play-once.ts at the
 * focus line like the step cards: the code types itself, the status goes Writing → Testing →
 * Tested, the run goes live, 13 leads count up, and Claude reports back.
 *
 * The program is shown, not explained: nine short lines that read like the sentence (no
 * "export": the homepage lint reads every string here). The Play, the 13 leads and Tamsin
 * Okafor of Quillfern are the same story the steps and the Built-like-infrastructure cards tell.
 */

type Tok = readonly ["" | "k" | "f" | "s" | "p", string];

const CODE: readonly (readonly Tok[])[] = [
  [["k", "const"], ["", " startups = "], ["f", "find.companies"], ["p", "({"]],
  [["", "  raised: "], ["s", "\"seed round\""], ["p", ","]],
  [["", "  hiring: "], ["s", "\"marketing lead\""], ["p", ","]],
  [["p", "});"]],
  [["k", "const"], ["", " founders = "], ["f", "find.people"], ["p", "({"]],
  [["", "  at: startups,"]],
  [["", "  role: "], ["s", "\"founder\""], ["p", ","]],
  [["p", "});"]],
  [["k", "return"], ["", " "], ["f", "keepWhoFits"], ["p", "(founders);"]],
];

const LEADS = [
  { initials: "TO", name: "Tamsin Okafor", org: "Founder, Quillfern", tone: "purple" },
  { initials: "JA", name: "Julien Aubert", org: "Founder, Brightloop", tone: "yellow" },
  { initials: "SM", name: "Samantha Mills", org: "Founder, Northvale", tone: "blue" },
] as const;

const ASK = "Find founders of startups that just raised a seed round and are hiring a marketing lead.";

const ALT =
  "Animation: in Claude, the request “" +
  ASK +
  "” is sent to Pancake. Pancake writes the search as a short program, tests it on 25 companies and puts it live. The Play runs and finds 13 leads, among them Tamsin Okafor, founder of Quillfern, and Claude reports that the Play is live.";

const loadAnimation = (): Promise<PlayOnceRuntime> =>
  Promise.all([import("@/lib/gsap"), import("./lp-build-timeline")]).then(([{ gsap }, { buildBuildTimeline }]) => ({
    gsap,
    build: buildBuildTimeline,
  }));

export function LpBuildAnim() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const stage = host?.querySelector<HTMLElement>(".lp-build__stage");
    if (!host || !stage) return;
    return mountPlayOnce({
      host,
      stage,
      designWidth: 1040,
      load: loadAnimation,
      restIsEnd: true,
      qa: { registry: "__lpBuild", key: "build" },
    });
  }, []);

  return (
    <div ref={hostRef} className="lp-build__card" role="img" aria-label={ALT}>
      <div className="lp-build__stage" aria-hidden="true">
        <div className="lp-build__pane" data-pane="ask">
          <p className="lp-build__label">You ask</p>
          <div className="lp-build__box lp-build__chat">
            <p className="lp-build__bubble">{ASK}</p>
            {/* Claude's call to Pancake, as Claude shows a connector's tool call */}
            <div className="lp-build__tool">
              <PancakeMark />
              <span className="lp-build__tool-name">
                Pancake<span className="lp-build__tool-sep">·</span>Create a Play
              </span>
              <span className="lp-build__tool-st">
                <span className="lp-build__spin" />
                <Check />
              </span>
            </div>
            <div className="lp-build__says">
              <p className="lp-build__say" data-say="working">
                <span className="lp-build__spark">
                  <ClaudeMark />
                </span>
                Using Pancake…
              </p>
              <p className="lp-build__say" data-say="reply">
                <span className="lp-build__spark">
                  <ClaudeMark />
                </span>
                Your Play is live. 13 leads so far.
              </p>
            </div>
          </div>
        </div>

        <Arrow />

        <div className="lp-build__pane" data-pane="code">
          <p className="lp-build__label">Pancake writes it</p>
          <div className="lp-build__box lp-build__editor">
            <div className="lp-build__file">
              <span>funded-startups</span>
              <span className="lp-build__ver">v3</span>
            </div>
            <pre className="lp-build__code">
              <code>
                {CODE.map((line, i) => (
                  <span key={i} className="lp-build__ln">
                    {line.map(([kind, text], j) => (
                      <span key={j} data-tok={kind || undefined}>
                        {text}
                      </span>
                    ))}
                  </span>
                ))}
              </code>
            </pre>
            <div className="lp-build__status">
              <span className="lp-build__st" data-st="writing">
                <span className="lp-build__dot" data-tone="purple" />
                Writing
              </span>
              <span className="lp-build__st" data-st="testing">
                <span className="lp-build__dot" data-tone="yellow" />
                Testing on 25 companies
              </span>
              <span className="lp-build__st" data-st="done">
                <Check />
                Tested on 25 companies
              </span>
            </div>
          </div>
        </div>

        <Arrow />

        <div className="lp-build__pane" data-pane="run">
          <p className="lp-build__label">Pancake runs it</p>
          <div className="lp-build__box lp-build__live">
            <div className="lp-build__live-head">
              <span className="lp-build__pulse" />
              Live
              <span className="lp-build__sched">On your schedule</span>
            </div>
            <p className="lp-build__count">
              <span className="lp-build__n">13</span>
              <span className="lp-build__count-l">leads found</span>
            </p>
            <ul className="lp-build__leads">
              {LEADS.map((lead) => (
                <li key={lead.name} className="lp-build__lead">
                  <span className="lp-build__avatar" data-tone={lead.tone}>
                    {lead.initials}
                  </span>
                  <span className="lp-build__who">
                    {lead.name}
                    <span className="lp-build__co">{lead.org}</span>
                  </span>
                  <Check />
                </li>
              ))}
            </ul>
            <p className="lp-build__wait">Waiting for the first run</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The Pancake mark, full colour (as LpClaudeScene's: the deep dive's avatar art) */
function PancakeMark() {
  return (
    <svg className="lp-build__pk" viewBox={`0 0 ${SL_AVATAR.size} ${SL_AVATAR.size}`} focusable="false">
      {SL_AVATAR.shapes.map((shape, i) => (
        <path key={i} d={shape.d} fill={shape.fill} opacity={"opacity" in shape ? shape.opacity : undefined} />
      ))}
    </svg>
  );
}

function Arrow() {
  return (
    <span className="lp-build__arrow" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="24" height="24" focusable="false">
        <path d="M4 12h15M13 6l6 6-6 6" />
      </svg>
    </span>
  );
}

function Check() {
  return (
    <svg className="lp-build__check" viewBox="0 0 16 16" width="16" height="16" focusable="false">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}
