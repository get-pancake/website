"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { gsap } from "@/lib/gsap";
import { AGENT_MARKS } from "./AgAgentMarks";
import { SIDEKICK } from "./ag-copy";
import { useInView } from "./useInView";

const loadGsap = () => import("@/lib/gsap");

/**
 * /agents — "Super simple": the rotating-word headline (Claude. / Codex. /
 * OpenClaw. / Hermes. / Grok Bot.) next to a chat mock that plays as a
 * continuous demo while the card is on stage (founder 2026-09-11 on the
 * preview: "Let's animate this chat very dynamically" — the play-once
 * transcript sat still). Layout + rest states in agents/sidekick.css; the
 * choreography is ONE GSAP timeline built here (buildLoop), the homepage's
 * LpFeatAnim doctrine: DOM + CSS + a seek-safe timeline, view-gated.
 *
 * Motion contract:
 * - Rotating words (title, header mark, header name) share one 6s `ag-rw`
 *   CSS loop, armed only while the SECTION intersects (`data-inview` from
 *   useInView) — off-screen and under reduced motion the first word shows.
 * - The chat cycle (repeat: -1): user bubble pops → for each assistant line
 *   a typing pill (three dots, one wave) holds the line's slot for 600ms,
 *   then the line types glyph by glyph (clip-path staircase on the real text
 *   run, a caret riding the last glyph — measured with Range rects, so no
 *   half glyph ever shows) → a tool chip rises with the check HIDDEN and the
 *   mascot pulsing once (the tool is working) → 600ms later the check pops
 *   (the tool returned) → … → "See the play" fades in and draws its
 *   underline → the finished transcript holds 3.5s → the transcript fades
 *   out (240ms) → replay from the empty state. ≈ 10.9s of play, ≈ 14.8s a
 *   cycle. Every timing derives from PACE / the constants below, walking
 *   SIDEKICK.script in order (the draft's per-line pace, compressed 20 %).
 * - The card's height never changes: every row is in flow from the first
 *   paint and hidden IN PLACE (opacity / clip-path); the pill and the caret
 *   are absolutely positioned inside the line they belong to.
 * - `data-play` on the card: "ssr" (no JS yet — the final transcript, so a
 *   no-JS render is never an empty card; also the client's first render, so
 *   hydration matches), "loop" (the timeline owns the rows; the CSS hides
 *   every row until GSAP's from-states take over — same values), "still"
 *   (prefers-reduced-motion: the final transcript, no loop; a mid-visit
 *   flip is honored both ways). The attribute is stamped imperatively, in
 *   the same task as the timeline build, so no intermediate frame paints.
 * - Late hydration / the visitor already at the card: the SSR transcript is
 *   never blanked and retyped (founder: no half-visible first frame). The
 *   timeline is built and seeked to the HOLD, so what is on screen stays,
 *   holds its 3.5s, fades and the loop begins cleanly.
 * - Playback: play while ≥30 % of the card is on stage (the draft's IO
 *   threshold), PAUSE (never reset) below that, resume on return; paused as
 *   well while "See the play" has keyboard focus (a focused link must not
 *   fade away). GSAP's ticker stops in hidden tabs, so the loop pauses there
 *   for free.
 * - Phones (≤767, the CSS breakpoint): lines wrap, and a wrapping run can't
 *   type — each line fades/rises in place over its typing slot instead, no
 *   caret; the rest of the choreography is identical. Rebuilt on the
 *   breakpoint change and once the fonts finish loading (glyph metrics).
 * - Accessibility: the full transcript stays in the DOM and readable at all
 *   times (opacity / clip-path, never display/visibility); the pill and
 *   the caret are aria-hidden; nothing is aria-live — the loop never
 *   announces. "See the play" (→ #ag-plays) carries tabindex -1 while it is
 *   visually hidden and becomes focusable once revealed (tracked from the
 *   timeline's onUpdate, so seeks and wraps stay exact).
 * - QA hook: window.__agSidekick = { tl, marks } — seek the loop to any
 *   moment and screenshot (like __lpFeat on the homepage).
 */

/* ── choreography constants (seconds) ── */
const PACE = 0.013; // per glyph — the draft's ≈16.3ms/char, compressed 20 %
const BUBBLE_AT = 0.3; // beat of empty chat before the user speaks
const BUBBLE_DUR = 0.32;
const DOTS_IN = 0.12; // the pill's own entrance
const DOTS_DUR = 0.6; // the pill holds the line's slot this long
const DOTS_AFTER: Record<"user" | "tool" | "type", number> = { user: 0.18, tool: 0.1, type: 0.3 };
const CARET_BLINK = 0.12; // after the last glyph: off / on / off
const CHIP_AFTER = 0.14; // the chip rises this long after its line
const CHIP_DUR = 0.26;
const PULSE_DUR = 0.6; // mascot 1 → 1.12 → 1, once, while the tool works
const CHECK_AFTER = 0.6; // the tool returns
const CHECK_DUR = 0.28;
const LINK_AFTER = 0.2;
const LINK_FADE = 0.2;
const LINK_DRAW = 0.32;
const HOLD = 3.5;
const FADE_OUT = 0.24;
const PHONE_RISE = 0.32; // the wrapped-line reveal (≤767)

type Marks = { link: number; hold: number; fade: number; end: number };
type Loop = { tl: gsap.core.Timeline; marks: Marks; cleanup: () => void };
type Runtime = Awaited<ReturnType<typeof loadGsap>>;

/** custom properties on an inline style (React's CSSProperties has no index signature) */
const vars = (o: Record<string, string>) => o as CSSProperties;

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

/** Glyph right edges of a single-fragment inline run, in px from the run's
    left edge: rights[0] = 0 (nothing typed), rights[n] = the whole run. Range
    rects on the real text node (the f2 recipe): no per-character span layer,
    so the run never reshapes at the handover and every step lands on a glyph
    boundary. A collapsed (zero-width) space repeats the previous edge. */
function glyphRights(run: HTMLElement): number[] {
  const left = run.getBoundingClientRect().left;
  const rights = [0];
  const walker = document.createTreeWalker(run, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = (node as Text).data;
    let i = 0;
    for (const ch of text) {
      const range = document.createRange();
      range.setStart(node, i);
      range.setEnd(node, i + ch.length);
      const r = range.getBoundingClientRect();
      i += ch.length;
      rights.push(r.width === 0 ? rights[rights.length - 1]! : r.right - left);
    }
  }
  return rights;
}

/** One cycle of the chat as a paused, infinitely repeating timeline on the
    card's rows (in SIDEKICK.script order). Seek- and wrap-safe: from/to
    tweens and sets on the elements only, no callbacks — a rewind (a seek, or
    the repeat wrap) restores every pre-set value by itself. */
function buildLoop(g: Runtime["gsap"], card: HTMLElement, phone: boolean): Loop {
  const chat = card.querySelector<HTMLElement>(".ag-sidekick__chat");
  if (!chat) throw new Error("ag-sidekick: missing .ag-sidekick__chat");
  const rows = Array.from(chat.children) as HTMLElement[];
  let link: HTMLElement | undefined;
  const marks: Marks = { link: 0, hold: 0, fade: 0, end: 0 };
  let tl!: gsap.core.Timeline;

  const ctx = g.context(() => {
    tl = g.timeline({ paused: true, repeat: -1 });
    let t = 0;
    let prev: "user" | "tool" | "type" = "user";

    SIDEKICK.script.forEach((item, i) => {
      const row = rows[i];
      if (!row) throw new Error(`ag-sidekick: missing row ${i}`);

      if (item.kind === "user") {
        // the bubble pops from its send corner: 0→1, 10px→0, .96→1 in 320ms
        const bubble = row.querySelector<HTMLElement>(".ag-sidekick__bubble")!;
        t += BUBBLE_AT;
        tl.fromTo(row, { opacity: 0 }, { opacity: 1, duration: BUBBLE_DUR, ease: "power2.out" }, t);
        tl.fromTo(
          bubble,
          { y: 10, scale: 0.96, transformOrigin: "100% 100%" },
          { y: 0, scale: 1, duration: BUBBLE_DUR, ease: "back.out(1.2)" },
          t,
        );
        t += BUBBLE_DUR;
      } else if (item.kind === "tool") {
        // the chip rises with its check hidden; the mascot pulses once while
        // the tool works; 600ms later the check pops — the tool returned
        const mascot = row.querySelector<HTMLElement>("img")!;
        const check = row.querySelector<HTMLElement>(".ag-sidekick__check")!;
        t += CHIP_AFTER;
        tl.fromTo(row, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: CHIP_DUR, ease: "power2.out" }, t);
        tl.to(mascot, { scale: 1.12, duration: PULSE_DUR / 2, yoyo: true, repeat: 1, ease: "sine.inOut" }, t);
        t += CHECK_AFTER;
        tl.fromTo(
          check,
          { scale: 0, opacity: 0, transformOrigin: "50% 50%" },
          { scale: 1, opacity: 1, duration: CHECK_DUR, ease: "back.out(2.2)" },
          t,
        );
      } else {
        const run = row.querySelector<HTMLElement>(".ag-sidekick__typed")!;
        const caret = row.querySelector<HTMLElement>(".ag-sidekick__caret")!;
        const pill = row.querySelector<HTMLElement>(".ag-sidekick__dots")!;
        const dots = Array.from(pill.children) as HTMLElement[];

        // typing pill: in, one wave (rise / fall, staggered), out — gone the
        // moment the line starts, so pill and glyphs never overlap
        t += DOTS_AFTER[prev];
        const tDots = t;
        tl.fromTo(
          pill,
          { opacity: 0, scale: 0.9, transformOrigin: "0% 50%" },
          { opacity: 1, scale: 1, duration: DOTS_IN, ease: "power2.out" },
          tDots,
        );
        dots.forEach((dot, j) => {
          tl.fromTo(
            dot,
            { y: 0, opacity: 0.45 },
            { y: -3, opacity: 1, duration: 0.16, yoyo: true, repeat: 1, ease: "sine.inOut" },
            tDots + 0.06 + j * 0.11,
          );
        });
        tl.to(pill, { opacity: 0, duration: 0.1 }, tDots + DOTS_DUR - 0.1);

        const tLine = tDots + DOTS_DUR;
        const n = Array.from(item.text).length;
        const dur = n * PACE;
        if (phone) {
          // a wrapping run can't type: fade + a 4px rise, caret off
          tl.fromTo(run, { opacity: 0 }, { opacity: 1, duration: PHONE_RISE, ease: "power2.out" }, tLine);
          tl.fromTo(row, { y: 4 }, { y: 0, duration: PHONE_RISE, ease: "power2.out" }, tLine);
        } else {
          // glyph staircase on the real run + the caret on the last glyph:
          // one set per glyph, on the elements themselves — never a proxy
          // with an onUpdate: GSAP renders the repeat wrap with events
          // suppressed, so callback-driven state survived into the next
          // cycle (the runs came back fully typed). Sets rewind on their own.
          const rights = glyphRights(run);
          const width = rights[n] ?? run.getBoundingClientRect().width;
          const x0 = run.getBoundingClientRect().left - row.getBoundingClientRect().left;
          tl.set(caret, { left: Math.round(x0), opacity: 1 }, tLine);
          for (let k = 1; k <= n; k++) {
            const tk = tLine + (dur * k) / n;
            const edge = rights[k] ?? width;
            // the last step drops the clip: the run paints exactly like the static site
            tl.set(run, { clipPath: k === n ? "none" : `inset(0 ${(width - edge).toFixed(2)}px 0 0)` }, tk);
            tl.set(caret, { left: Math.round(x0 + edge) }, tk);
          }
          // solid while the glyphs land (an editor caret resets its blink on
          // every keystroke), one blink once the line is done, then gone
          tl.set(caret, { opacity: 0 }, tLine + dur + CARET_BLINK);
          tl.set(caret, { opacity: 1 }, tLine + dur + CARET_BLINK * 2);
          tl.set(caret, { opacity: 0 }, tLine + dur + CARET_BLINK * 3);
        }
        t = tLine + dur;

        if ("link" in item) {
          link = row.querySelector<HTMLElement>(".ag-sidekick__link")!;
          marks.link = t + LINK_AFTER;
          tl.fromTo(link, { opacity: 0 }, { opacity: 1, duration: LINK_FADE, ease: "power1.out" }, marks.link);
          tl.fromTo(link, { "--ag-ul": "0%" }, { "--ag-ul": "100%", duration: LINK_DRAW, ease: "power2.inOut" }, marks.link);
          t = marks.link + LINK_DRAW;
        }
      }
      prev = item.kind;
    });

    // finished transcript: hold, then the whole chat fades and the cycle wraps
    marks.hold = t;
    marks.fade = t + HOLD;
    marks.end = marks.fade + FADE_OUT;
    tl.to(chat, { opacity: 0, duration: FADE_OUT, ease: "power1.in" }, marks.fade);

    // "See the play" joins the tab order only while it can be seen
    if (link) {
      const a = link;
      let focusable: boolean | undefined;
      const track = () => {
        const time = tl.time();
        const visible = time >= marks.link + LINK_FADE / 2 && time < marks.fade + FADE_OUT / 2;
        if (visible === focusable) return;
        focusable = visible;
        if (visible) a.removeAttribute("tabindex");
        else a.tabIndex = -1;
      };
      tl.eventCallback("onUpdate", track);
      track();
    }
  }, card);

  return {
    tl,
    marks,
    cleanup: () => {
      ctx.revert(); // every inline style GSAP touched goes back to the stylesheet's
      link?.removeAttribute("tabindex");
    },
  };
}

export function AgSidekick() {
  const [sectionRef] = useInView<HTMLElement>();
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const link = card.querySelector<HTMLElement>(".ag-sidekick__link");
    const motionMq = matchMedia("(prefers-reduced-motion: reduce)");
    const phoneMq = matchMedia("(max-width: 767px)");
    const w = window as unknown as { __agSidekick?: { tl: gsap.core.Timeline; marks: Marks } };

    let disposed = false;
    let runtime: Runtime | undefined;
    let fontsReady = false;
    let observed = false; // the play observer has reported once (touching is known)
    let touching = false;
    let inView = false;
    let focused = false;
    let loop: Loop | undefined;

    const still = () => {
      card.dataset.play = "still";
      card.dataset.anim = "still";
      link?.removeAttribute("tabindex");
    };
    const teardown = () => {
      if (!loop) return;
      loop.cleanup();
      loop = undefined;
      delete w.__agSidekick;
    };
    const sync = () => {
      if (!loop) return;
      if (inView && !focused) {
        loop.tl.play();
        card.dataset.anim = "playing";
      } else {
        loop.tl.pause();
        card.dataset.anim = "paused";
      }
    };
    // (re)build the cycle; `at` = the playhead to restore (a rebuild keeps
    // its place), otherwise the hold if the card is on stage (the visible
    // SSR transcript stays put) or the empty state.
    const build = (at?: number) => {
      if (!runtime || disposed) return;
      teardown();
      try {
        loop = buildLoop(runtime.gsap, card, phoneMq.matches);
      } catch (err) {
        // never a blank card: the plain transcript shows as a still
        still();
        if (process.env.NODE_ENV !== "production") console.error(err);
        return;
      }
      card.dataset.play = "loop";
      loop.tl.seek(at ?? (touching ? loop.marks.hold : 0), false);
      w.__agSidekick = { tl: loop.tl, marks: loop.marks };
      sync();
    };
    // build once everything it needs is there: GSAP, the fonts (glyph
    // metrics), the first intersection report (on stage or not)
    const arm = () => {
      if (loop || disposed || motionMq.matches) return;
      if (!runtime || !fontsReady || !observed) return;
      build();
    };
    const rebuild = () => {
      if (loop) build(loop.tl.time());
    };

    const onMotion = () => {
      if (motionMq.matches) {
        teardown();
        still();
      } else {
        arm();
      }
    };
    // fonts.ready once, then every later `loadingdone`: glyph metrics may
    // have changed under a built loop — rebuild it in place
    const onFonts = () => {
      fontsReady = true;
      if (loop) rebuild();
      else arm();
    };

    // play gate: ≥30 % on stage plays, below pauses (never resets)
    const playIo = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        if (!e) return;
        observed = true;
        touching = e.isIntersecting;
        inView = touching && e.intersectionRatio >= 0.3 - 1e-3;
        arm();
        sync();
      },
      { threshold: [0, 0.3] },
    );
    // the animation code is fetched when the card comes within a viewport
    // height of the stage — before the visitor can see an empty chat
    const loadIo = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        loadIo.disconnect();
        void loadGsap()
          .then((loaded) => {
            if (disposed) return;
            runtime = loaded;
            arm();
          })
          .catch((err) => {
            if (disposed) return;
            still();
            if (process.env.NODE_ENV !== "production") console.error(err);
          });
      },
      { rootMargin: "100% 0px" },
    );

    const onFocusIn = () => {
      focused = true;
      sync();
    };
    const onFocusOut = (e: FocusEvent) => {
      if (e.relatedTarget instanceof Node && card.contains(e.relatedTarget)) return;
      focused = false;
      sync();
    };

    if (motionMq.matches) still();
    playIo.observe(card);
    loadIo.observe(card);
    motionMq.addEventListener("change", onMotion);
    phoneMq.addEventListener("change", rebuild);
    card.addEventListener("focusin", onFocusIn);
    card.addEventListener("focusout", onFocusOut);
    const fonts = document.fonts;
    void fonts.ready.then(() => {
      if (!disposed) onFonts();
    });
    fonts.addEventListener("loadingdone", onFonts);

    return () => {
      disposed = true;
      playIo.disconnect();
      loadIo.disconnect();
      motionMq.removeEventListener("change", onMotion);
      phoneMq.removeEventListener("change", rebuild);
      card.removeEventListener("focusin", onFocusIn);
      card.removeEventListener("focusout", onFocusOut);
      fonts.removeEventListener("loadingdone", onFonts);
      teardown();
      card.dataset.play = "ssr";
      delete card.dataset.anim;
    };
  }, []);

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
          data-play="ssr"
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

          {/* the transcript: one row per script item, in order — buildLoop
              walks these children with SIDEKICK.script */}
          <div className="ag-sidekick__chat">
            {SIDEKICK.script.map((item, i) => {
              if (item.kind === "user") {
                return (
                  <div key={i} className="ag-sidekick__user">
                    <p className="ag-sidekick__bubble">{item.text}</p>
                  </div>
                );
              }
              if (item.kind === "tool") {
                return (
                  <div key={i} className="ag-sidekick__toolrow">
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
              // assistant line: the typed run, the link (last line), then the
              // two absolutely positioned helpers — the typing pill that holds
              // the slot before the line and the caret that rides its glyphs
              return (
                <p key={i} className="ag-sidekick__type">
                  <span className="ag-sidekick__typed">{item.text}</span>
                  {"link" in item ? (
                    <a className="ag-sidekick__link" href="#ag-plays">
                      {item.link}
                    </a>
                  ) : null}
                  <span className="ag-sidekick__dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="ag-sidekick__caret" aria-hidden="true" />
                </p>
              );
            })}
          </div>
        </figure>
      </div>
    </section>
  );
}
