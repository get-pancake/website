"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AGENT_MARKS } from "./AgAgentMarks";
import { SIDEKICK } from "./ag-copy";
import { useInView } from "./useInView";

/**
 * /agents — "Super sidekick": the rotating-word headline (Claude. / Codex. /
 * OpenClaw. / Hermes. / Grok Bot.) next to a chat mock that plays ONCE when the
 * card is 30 % in view (the draft's IntersectionObserver threshold) and then
 * holds its final state. Layout, keyframes and timings in agents/sidekick.css.
 *
 * Motion contract:
 * - Rotating words (title, header mark, header name) share one 6s `ag-rw`
 *   loop, armed only while the SECTION intersects (`data-inview` from
 *   useInView) — off-screen and under reduced motion the first word shows.
 * - The chat has four states on `data-play`: "ssr" (no JS yet → the final
 *   transcript, so a no-JS render is never an empty card), "armed" (hydrated,
 *   waiting: lines hidden IN PLACE — clip-path / opacity — so the card is
 *   already its final height), "play" (the script runs with the draft's
 *   delays/durations, `forwards`), "done" (the script has ended: the
 *   animations are dropped and the plain styles show the transcript — a
 *   `forwards` fill alone is not exact: 8.6s + 1.12s lands at progress
 *   0.9999999999999992, so steps(63) held the last line one step short and
 *   the tail of "See the play" stayed clipped). It never goes back.
 * - Late hydration (slow phone, the visitor already scrolled here): if the
 *   card is ≥30 % in view when the effects land, "ssr" goes straight to
 *   "done" — arming would blank a transcript the visitor is reading and
 *   retype it (founder: no half-visible first frame, clean start).
 * - "See the play" targets the Super plays section (#ag-plays) and leaves
 *   the tab order while its line is still clipped (armed / play).
 * - Per-line timings ride on custom properties (--ag-at / --ag-dur / --ag-n)
 *   so the phone stylesheet can swap the width-typing for a per-line fade
 *   (wrapping text can't type) while keeping the same delays.
 */

type Phase = "ssr" | "armed" | "play" | "done";

/** custom properties on an inline style (React's CSSProperties has no index signature) */
const vars = (o: Record<string, string>) => o as CSSProperties;

/** seconds from play start to the end of the last animation (fades are .5s) */
const SCRIPT_END = Math.max(...SIDEKICK.script.map((s) => s.at + ("dur" in s ? s.dur : 0.5)));

/** the header mark stack follows SIDEKICK.headerNames, not AGENT_MARKS' order */
const HEADER_MARKS = SIDEKICK.headerNames.map(
  (name) => AGENT_MARKS.find((m) => m.name === name) ?? AGENT_MARKS[0]!,
);

/** The draft's H2 is `white-space: pre-line` with a newline after the first
    sentence: "Find new customers." always ends a line and "From <word>" starts
    the next (desktop-sec-03.png). Split here so the copy stays one string. */
const TITLE_BREAK = SIDEKICK.titleBefore.indexOf(". ") + 1;
const TITLE_LINE_1 = SIDEKICK.titleBefore.slice(0, TITLE_BREAK); // "Find new customers."
const TITLE_LINE_2 = SIDEKICK.titleBefore.slice(TITLE_BREAK + 1); // "From "

/** "Find new customers. From Claude, Codex, OpenClaw, Hermes or Grok Bot." —
    the full sentence, read once by screen readers (the cycling spans are hidden) */
const SR_TITLE = `${SIDEKICK.titleBefore}${SIDEKICK.headerNames.slice(0, -1).join(", ")} or ${
  SIDEKICK.headerNames[SIDEKICK.headerNames.length - 1]
}.`;

const CHECK = (
  <svg className="ag-sidekick__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 8.5l3 3 7-7" />
  </svg>
);

export function AgSidekick() {
  const [sectionRef] = useInView<HTMLElement>();
  const [cardRef, cardInView] = useInView<HTMLElement>({ threshold: 0.3 });
  const [phase, setPhase] = useState<Phase>("ssr");

  // hydrated → hide the lines in place and wait for the card (never before:
  // the SSR markup must match the first client render) — unless the card is
  // already ≥30 % on stage (the IO threshold): then keep the SSR transcript
  // as the settled state instead of hiding it and replaying (see above)
  useEffect(() => {
    const r = cardRef.current?.getBoundingClientRect();
    const visible = r ? Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0) : 0;
    const onStage = !!r && r.height > 0 && visible / r.height >= 0.3;
    setPhase((p) => (p === "ssr" ? (onStage ? "done" : "armed") : p));
  }, [cardRef]);
  // 30 % of the card in view → play, once
  useEffect(() => {
    if (cardInView) setPhase((p) => (p === "done" ? p : "play"));
  }, [cardInView]);
  // script over → settle on the plain styles (see the header comment)
  useEffect(() => {
    if (phase !== "play") return;
    const t = setTimeout(() => setPhase("done"), (SCRIPT_END + 0.3) * 1000);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <section ref={sectionRef} className="ag-sec ag-sidekick" aria-labelledby="ag-sidekick-title">
      <div className="ag-sec__inner ag-sidekick__grid">
        <div className="ag-sec__head ag-sec__head--left ag-sidekick__head">
          <p className="ag-kicker">{SIDEKICK.kicker}</p>
          <h2 id="ag-sidekick-title" className="lp-title-section ag-sidekick__title">
            <span className="lp-sr-only">{SR_TITLE}</span>
            <span aria-hidden="true">
              {TITLE_LINE_1}
              <br />
              {TITLE_LINE_2}
              <span className="ag-sidekick__stack ag-accent">
                {SIDEKICK.words.map((word, i) => (
                  <span key={word} className="ag-sidekick__rw" style={vars({ "--ag-at": `${i * 1.2}s` })}>
                    {word}
                  </span>
                ))}
              </span>
            </span>
          </h2>
          <p className="ag-lede">{SIDEKICK.lede}</p>
        </div>

        <figure
          ref={cardRef}
          className="ag-card ag-sidekick__card"
          data-play={phase}
          aria-label="Example chat: your agent sets up a daily hiring-intent play with Pancake"
        >
          {/* chat chrome: the agent mark + name cycle with the headline */}
          <div className="ag-sidekick__hdr" aria-hidden="true">
            <span className="ag-sidekick__hdr-mark">
              {HEADER_MARKS.map(({ name, Mark }, i) => (
                <span key={name} className="ag-sidekick__rw" style={vars({ "--ag-at": `${i * 1.2}s` })}>
                  <Mark />
                </span>
              ))}
            </span>
            <span className="ag-sidekick__hdr-name">
              <span className="ag-sidekick__stack">
                {SIDEKICK.headerNames.map((name, i) => (
                  <span key={name} className="ag-sidekick__rw" style={vars({ "--ag-at": `${i * 1.2}s` })}>
                    {name}
                  </span>
                ))}
              </span>
            </span>
            <span className="ag-sidekick__hdr-new">{SIDEKICK.newChat}</span>
          </div>

          <div className="ag-sidekick__chat">
            {SIDEKICK.script.map((item, i) => {
              if (item.kind === "user") {
                return (
                  <div key={i} className="ag-sidekick__user ag-sidekick__fade" style={vars({ "--ag-at": `${item.at}s` })}>
                    <p className="ag-sidekick__bubble">{item.text}</p>
                  </div>
                );
              }
              if (item.kind === "tool") {
                return (
                  <div key={i} className="ag-sidekick__toolrow ag-sidekick__fade" style={vars({ "--ag-at": `${item.at}s` })}>
                    <span className="ag-sidekick__chip">
                      <img src="/pancake-monster.png" alt="" width={16} height={17} />
                      <span>
                        {SIDEKICK.toolPrefix}
                        <b>{SIDEKICK.toolBrand}</b>
                        {" · "}
                        {item.text}
                      </span>
                      {CHECK}
                    </span>
                  </div>
                );
              }
              // typed line: steps = characters (the draft's 16ms/char pace)
              const chars = item.text.length + ("link" in item ? item.link.length : 0);
              // the line is clipped until it has typed: no focus stop on an
              // invisible link (its ring would be clipped with the text)
              const hidden = phase === "armed" || phase === "play";
              return (
                <p
                  key={i}
                  className="ag-sidekick__type"
                  style={vars({ "--ag-at": `${item.at}s`, "--ag-dur": `${item.dur}s`, "--ag-n": String(chars) })}
                >
                  {item.text}
                  {"link" in item ? (
                    <a className="ag-sidekick__link" href="#ag-plays" tabIndex={hidden ? -1 : undefined}>
                      {item.link}
                    </a>
                  ) : null}
                </p>
              );
            })}
          </div>
        </figure>
      </div>
    </section>
  );
}
