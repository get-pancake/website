// No "use client" on purpose (2026-10-11, as lp-story-sources-timeline.ts): Next makes every
// "use client" module a server graph reaches, even through an import(), an EAGER client entry —
// this builder shipped inside app/page.js while the loaders sat in the server registry. They now
// live in the client-only lp-dive-loaders.ts; keep this a plain module, fetched only when the
// carousel approaches with motion allowed. Browser-only code runs inside buildStoryMessage()
// alone. Nothing is imported at runtime from the registry (types only): the typing helpers are
// copied below.
import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import { SM_POSE } from "./lp-story-message-data";
import { prepareSmTail, type SmCaret, type SmGlyph, type SmKit, type SmTyped } from "./lp-story-message-tail";

/**
 * Deep-dive story "A personal message for every lead" — its build-up as ONE paused, seek-safe
 * GSAP timeline on the stage root (Figma V2 storyboard, final since 2026-10-12: 4964:1469 /
 * 1471 / 1729, 5061:1002 / 1091 / 1209). Owner: story-message package. Contract:
 * lp-dive-stages.ts and code-map §6.2 — frame 0 via gsap.set (the caller's gsap.context reverts
 * it), sets and tweens only (no callbacks, no randomness), progress(1) = the server markup,
 * `cue` = the first composed scene (here frame 0). Reached only through DIVE_LOADERS.message
 * (lp-dive-loaders.ts, lazy).
 *
 * THIS FILE = frames 1–2:
 *   A · f1   the take OPENS on the post, composed: its card, its author, a caret where the text
 *            will come (frame 0 = the cue; the stage is never empty). She types it at a
 *            person's pace, the post gets its reactions, then a wire drops from it and her lead
 *            card rises under it: the post is the signal, she is the lead. f1 holds.
 *   B · f2   the post leaves, her card travels to the top, a wire grows from it and the message
 *            card rises: Pancake types her message (f2 = three glyphs into its last line), then
 *            "Drafting..." leaves and "Sent" comes. The sent message holds before the view moves.
 * lp-story-message-tail.ts = frames 3–6 (more conversations, the sending account, its leads,
 * more accounts): it appends its beats after ours. See that file for the hand-over contract.
 *
 * Pace (the founder's notes of 2026-10-13 on other animations of the page, applied here: an
 * opening "passe trop vite, on comprend pas le cheminement"; a prompt typed by a person "is
 * written much too fast"): the opening picture holds before a key is pressed; a person types
 * at 36 ms a key or slower; Pancake may draft fast (12 ms a glyph), but a finished message
 * stands still for about a second before anything moves; two labels that share a spot never
 * cross-fade (one leaves, then the other comes).
 *
 * Production f2's machinery (lp-feat-timelines.ts buildF2), copied: the typed runs are
 * revealed with a clip staircase over the real text + a caret riding the glyph edges (no
 * per-character spans: WebKit kerning), the counts tick on stacked digits. Glyphs are measured
 * at build (Range rects), so the stage must be laid out (never display:none; visibility:hidden
 * is fine — the talk rests hidden).
 */

/** Every beat of frames 1–2, in seconds (founder pace knob; the tail has its own). The typed
    runs take as long as their glyphs do, so each group counts from the moment before it. */
export const SM_T = {
  /** A — the take opens on the post without its text. The caret blinks once, then she types */
  blinkOff: 0.28,
  blinkOn: 0.5,
  bodyType: 0.7,
  /** after the post's last key: it is published (the rest of its text, its actions, its counts) */
  skel: 0.1,
  row: 0.15,
  likes: 0.25,
  likesFor: 0.4,
  others: 0.32,
  othersFor: 0.28,
  sheen: 0.35,
  bodyCaretOff: 0.4,
  /** … then Pancake picks it up: the wire drops from the post, her lead card rises under it */
  postWire: 0.65,
  lead: 0.72,
  f1: 1.15,
  /** B — after f1: its hold, then the post leaves, her card travels up, the message card comes */
  postOut: 0.4,
  leadUp: 0.5,
  leadUpDur: 0.55,
  msgWire: 0.95,
  msgCard: 1,
  msgType: 1.3,
  /** after a message's last glyph: the caret leaves, then "Drafting..." leaves (draftOut) and
      only then "Sent" comes (sentIn) — they share one spot */
  caretOff: 0.25,
  sentAfter: 0.4,
  draftOut: 0.13,
  sentIn: 0.17,
} as const;

const PANCAKE = { glyph: 0.012, sentence: 0.06, comma: 0.035 } as const; // per message glyph (lp-step-timelines S3_TYPE)
/** a person typing her post: never faster than 36 ms a key (lp-step-timelines S2_OPEN.key),
    each key a little later by a fixed pattern (no randomness: the timeline is seeked) */
const POST = { key: 0.036, late: [0.002, 0.008, 0, 0.012, 0.004, 0, 0.006, 0.002, 0.01, 0.004] } as const;

// copied from lp-feat-timelines.ts (query, HIDDEN_CLIP, clipTo)
function query(root: HTMLElement) {
  return {
    $: <T extends Element = HTMLElement>(sel: string): T => {
      const el = root.querySelector<T>(sel);
      if (!el) throw new Error(`lp-story-message: missing ${sel}`);
      return el;
    },
    $$: <T extends Element = HTMLElement>(sel: string): T[] => Array.from(root.querySelectorAll<T>(sel)),
  };
}
const HIDDEN_CLIP = "polygon(0 0, 0 0, 0 0, 0 0, 0 0, 0 0)";
const clipTo = (g: SmGlyph) =>
  `polygon(0 0, 100% 0, 100% ${g.top}px, ${g.right}px ${g.top}px, ${g.right}px ${g.bottom}px, 0 ${g.bottom}px)`;

/** how many screen px one of the element's own px covers (--lp-fit and every ancestor scale).
    The element's CSS width, not offsetWidth: that one is an integer, and a fractional run read
    as a whole number shifted every glyph edge (only for elements without padding or border). */
function scaleOf(el: HTMLElement, box: DOMRect): number {
  const w = parseFloat(getComputedStyle(el).width);
  if (w > 0) return box.width / w;
  return el.offsetWidth ? box.width / el.offsetWidth : 1;
}

/** Each VISIBLE character of a run — its right edge and line box, in the element's own
    unscaled px (Range rects). Copied from lp-feat-timelines.ts measureGlyphs, with the exact
    scale above. */
function measureRun(el: HTMLElement): SmGlyph[] {
  const box = el.getBoundingClientRect();
  const s = scaleOf(el, box);
  const glyphs: SmGlyph[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = (node as Text).data;
    let i = 0;
    for (const ch of text) {
      range.setStart(node, i);
      range.setEnd(node, i + ch.length);
      const r = range.getBoundingClientRect();
      i += ch.length;
      const prev = glyphs[glyphs.length - 1];
      if (r.width === 0 && prev) {
        glyphs.push({ ...prev, ch }); // a collapsed space: nothing new shows
        continue;
      }
      glyphs.push({ ch, right: (r.right - box.left) / s, top: (r.top - box.top) / s, bottom: (r.bottom - box.top) / s });
    }
  }
  return glyphs;
}

export function buildStoryMessage(root: HTMLElement): BuiltStory {
  const { $, $$ } = query(root);
  const created: Node[] = [];

  /* Dispose must give back the server markup in every engine. gsap.context().revert() sorts
     its tweens with `b.g - a.g || -Infinity` (gsap-core 3.15), a comparator that is
     inconsistent for ties, so SpiderMonkey reverts tied sets in another order than V8/JSC and
     leaves frame-0 inline styles behind (measured on this stage's first build). Snapshot every
     element's style attribute before the first set; cleanup — which runs after the revert —
     restores them verbatim, so a rebuild starts from the rest markup in every engine. The same
     for the two attributes GSAP writes on the post's SVG icon groups and its revert leaves
     (an identity `transform` and `data-svg-origin`). */
  const KEPT = ["style", "transform", "data-svg-origin"] as const;
  const snapshot = Array.from(root.querySelectorAll<Element>("*"), (el) => ({ el, was: KEPT.map((name) => el.getAttribute(name)) }));
  const cleanup = () => {
    created.forEach((n) => n.parentNode?.removeChild(n));
    created.length = 0;
    snapshot.forEach(({ el, was }) =>
      KEPT.forEach((name, i) => {
        // read before removing: WebKit serialises a script-touched inline style lazily, and a
        // removal that comes before the read leaves style="" behind (measured: 35 elements)
        const now = el.getAttribute(name);
        const then = was[i];
        if (then === null) {
          if (now !== null) el.removeAttribute(name);
        } else if (now !== then) el.setAttribute(name, then);
      }),
    );
  };

  try {
    return { ...assemble(), cleanup };
  } catch (err) {
    // a half-run build must not leave the carets or the digits behind: the shell only gets a
    // cleanup from a build that returned
    cleanup();
    throw err;
  }

  function assemble(): Omit<BuiltStory, "cleanup"> {
    const tl = gsap.timeline({ paused: true });
    const T = SM_T;

    const talk = $(".lp-sm-talk");
    const post = $(".lp-sm-post");
    const body = $(".lp-sm-body");
    const convo = $('.lp-sm-convo[data-convo="lead"]');
    const leadCard = $('.lp-sm-convo[data-convo="lead"] .lp-sm-lead');
    const postWire = $(".lp-sm-wire--post");
    const msgWire = $('.lp-sm-convo[data-convo="lead"] .lp-sm-wire--msg');
    const msgCard = $('.lp-sm-convo[data-convo="lead"] .lp-sm-msg');
    const msg = $('.lp-sm-convo[data-convo="lead"] .lp-sm-msg .lp-sm-text');

    /* carets: one per typed run, in the run's positioned PARENT (the run itself is clipped to
       the typed glyphs; a child caret would be clipped with it) — after buildF2, with the
       run's offset read from its rects (offsetLeft/Top are integers: up to half a px off) */
    const mkCaret = (run: HTMLElement, extraClass = ""): SmCaret => {
      const host = (run.offsetParent as HTMLElement | null) ?? run.parentElement!;
      const c = document.createElement("i");
      c.className = "lp-sm-caret" + extraClass;
      c.style.color = getComputedStyle(run).color;
      host.appendChild(c);
      created.push(c);
      const rb = run.getBoundingClientRect();
      const hb = host.getBoundingClientRect();
      const s = scaleOf(run, rb);
      return { el: c, ox: (rb.left - hb.left) / s, oy: (rb.top - hb.top) / s };
    };
    const caretAt = (c: SmCaret, x: number, g: SmGlyph, t: number, extra: gsap.TweenVars = {}) =>
      tl.set(c.el, { x: c.ox + x, y: c.oy + g.top, height: g.bottom - g.top, ...extra }, t);
    // types a run from t: the caret rides each glyph's right edge; `step` = the time one glyph
    // takes (glyph, the next one, its index). Returns each glyph's time and the moment after
    // the last glyph. The caret must already stand at the line start (caretAt).
    const typeIn = (
      t: number,
      el: HTMLElement,
      caret: SmCaret,
      glyphs: SmGlyph[],
      step: (c: string, n: string, i: number) => number,
    ): SmTyped => {
      const times: number[] = [];
      glyphs.forEach((g, i) => {
        times.push(t);
        tl.set(el, { clipPath: clipTo(g) }, t);
        caretAt(caret, g.right + 1, g, t);
        t += step(g.ch, glyphs[i + 1]?.ch ?? "", i);
      });
      return { times, end: t };
    };
    // Pancake: a breath after a sentence's end and after a comma
    const messageStep = (c: string, n: string) =>
      PANCAKE.glyph + ((c === "." || c === "?" || c === "!") && n === " " ? PANCAKE.sentence : c === "," ? PANCAKE.comma : 0);
    const eyebrows = (card: HTMLElement) => {
      const draft = card.querySelector<HTMLElement>(".lp-sm-eb-draft");
      const sent = card.querySelector<HTMLElement>(".lp-sm-eb-sent");
      if (!draft || !sent) throw new Error("lp-story-message: a typed message card needs both eyebrows");
      return { draft, sent };
    };

    /* what the two halves share (the tail types and measures exactly like this one) */
    const kit: SmKit = {
      $,
      $$,
      measure: measureRun,
      hiddenClip: HIDDEN_CLIP,
      messageCaret: (run) => {
        const c = mkCaret(run, " lp-sm-caret--msg");
        gsap.set(c.el, { opacity: 0 });
        return c;
      },
      typeMessage: (t, run, caret, glyphs) => {
        caretAt(caret, 0, glyphs[0], t - 0.25, { opacity: 1 }); // the caret first, at the line start
        return typeIn(t, run, caret, glyphs, messageStep);
      },
      typeDone: (run, caret, t) => {
        tl.set(caret.el, { opacity: 0 }, t);
        tl.set(run, { clipPath: "none" }, t); // the run paints like any paragraph again
      },
      eyebrows,
      // one label leaves, then the other comes: they share one spot, and a cross-fade drew the
      // two words on top of each other (the same fix as step 03, lp-step-timelines.ts)
      markSent: (card, t) => {
        const eb = eyebrows(card);
        tl.to(eb.draft, { opacity: 0, y: -4, duration: T.draftOut, ease: "power2.in" }, t);
        tl.fromTo(
          eb.sent,
          { opacity: 0, y: 4 },
          { opacity: 1, y: 0, duration: T.sentIn, ease: "power2.out", immediateRender: false },
          t + T.draftOut,
        );
        return t + T.draftOut + T.sentIn;
      },
      pace: { caretOff: T.caretOff, sentAfter: T.sentAfter },
      // a conversation's local origin is its lead card's FILL: Figma's box plus the 0.5 stroke
      at: (p, s) => ({ x: p.x + 0.5 * s, y: p.y + 0.5 * s }),
    };

    /* the second half first: it sets frame 0 of everything it owns (the other conversations,
       the accounts), which must be in place before anything here is measured */
    const tail = prepareSmTail(root, kit);

    const bodyCaret = mkCaret(body);
    const msgCaret = kit.messageCaret(msg);

    /* glyphs: the post body, and the message Pancake writes */
    const bodyGlyphs = measureRun(body);
    const typed = measureRun(msg);
    if (!bodyGlyphs.length || !typed.length) throw new Error("lp-story-message: nothing to type (is the stage laid out?)");

    /* counters: the final number is the in-flow text (server-rendered), the earlier states are
       stacked over it and it waits for its tick — copied from buildF2 */
    const mkCounter = (el: HTMLElement) => {
      const fin = el.querySelector<HTMLElement>(".lp-sm-n--final")!;
      const max = Number(fin.textContent) || 0;
      const ns: HTMLElement[] = [];
      gsap.set(fin, { opacity: 0 });
      for (let k = 0; k < max; k++) {
        const n = document.createElement("span");
        n.className = "lp-sm-n" + (k === 0 ? " lp-sm-n--zero" : "");
        n.textContent = String(k);
        el.appendChild(n);
        created.push(n);
        ns.push(n);
      }
      ns.push(fin);
      return { ns, max };
    };
    const counts = $$(".lp-sm-count");
    const counters = counts.map(mkCounter);
    // ticking counter: tick times on a quad-out curve (fast first, settling into the final number)
    const tick = ({ ns, max }: { ns: HTMLElement[]; max: number }, t0: number, dur: number) => {
      for (let k = 1; k <= max; k++) {
        const tk = t0 + dur * (1 - Math.sqrt(1 - k / max));
        tl.set(ns[k - 1], { opacity: 0 }, tk);
        tl.set(ns[k], { opacity: 1 }, tk);
      }
    };

    /* ── frame 0 = the cue: the post in place with its author, a caret where its text will
       come. Nothing is typed yet, nothing has reacted to it, no lead card under it ── */
    const bars = $$(".lp-sm-skelgrp i");
    // one sheen per bar: the bars' lefts inside the 345-wide skeleton row, the sheen 100 wide
    const sheens = $$(".lp-sm-skelgrp i b");
    const SKEL_LEFT = [0, 18, 97, 115, 175, 193];
    if (sheens.length !== SKEL_LEFT.length) throw new Error("lp-story-message: the post's skeleton is out of sync");
    const rowEls: Element[] = [];
    ["#lpsm-pi-like", "#lpsm-pi-comment", "#lpsm-pi-repost", "#lpsm-pi-send"].forEach((s, i) => rowEls.push($(s), counts[i]));
    const f1 = kit.at(SM_POSE.leadF1, 1);
    const f2 = kit.at(SM_POSE.leadF2, 1);
    gsap.set(talk, { autoAlpha: 1 });
    /* The post's own parts wait in their START pose, set here, and are played with plain `to`
       tweens, one per element. They were staggered fromTo's whose from-vars also carried the
       bars' transform-origin: after a jump back from the end into the bars' build-up, the bars
       scaled about another origin (measured: seek 0 → 11.5 → 2.2 against 0 → 2.2). A pose
       set at frame 0 is the same start whichever way the playhead comes. */
    gsap.set(bars, { scaleX: 0.6, autoAlpha: 0, transformOrigin: "0 50%" });
    gsap.set(sheens, { x: (i: number) => -100 - SKEL_LEFT[i] });
    gsap.set(rowEls, { y: 8, autoAlpha: 0 });
    gsap.set([body, msg], { clipPath: HIDDEN_CLIP });
    gsap.set(bodyCaret.el, { x: bodyCaret.ox, y: bodyCaret.oy + bodyGlyphs[0].top, height: bodyGlyphs[0].bottom - bodyGlyphs[0].top, opacity: 1 });
    // her conversation waits under the post: the card unseen, at full strength when it comes
    // (its rest opacity is frame 3's, dimmed), the message still a draft
    gsap.set(convo, { x: f1.x, y: f1.y });
    gsap.set([leadCard, msgCard], { autoAlpha: 0 });
    gsap.set(postWire, { opacity: 1, scaleY: 0 });
    gsap.set(msgWire, { scaleY: 0 });
    const eb = eyebrows(msgCard);
    gsap.set(eb.draft, { opacity: 1 });
    gsap.set(eb.sent, { opacity: 0 });

    const rise = { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", immediateRender: false };
    const grow = { scaleY: 1, duration: 0.22, ease: "power2.out", immediateRender: false };

    /* — A · the opening picture holds (the caret blinks once), then she types her post — */
    tl.set(bodyCaret.el, { opacity: 0 }, T.blinkOff);
    tl.set(bodyCaret.el, { opacity: 1 }, T.blinkOn);
    const bodyRun = typeIn(T.bodyType, body, bodyCaret, bodyGlyphs, (_c, _n, i) => POST.key + POST.late[i % POST.late.length]);
    const tPosted = bodyRun.end;
    tl.set(bodyCaret.el, { opacity: 0 }, tPosted + T.bodyCaretOff);
    tl.set(body, { clipPath: "none" }, tPosted + T.bodyCaretOff + 0.05); // the run paints exactly like the static site
    /* … it is published: the rest of its text, its action row, the counts ticking up … */
    bars.forEach((bar, i) =>
      tl.to(bar, { scaleX: 1, autoAlpha: 1, duration: 0.35, ease: "power3.out" }, tPosted + T.skel + i * 0.05),
    );
    // one sheen sweep across the six bars
    sheens.forEach((b, i) => tl.to(b, { x: 345 - SKEL_LEFT[i], duration: 0.6, ease: "power1.inOut" }, tPosted + T.sheen));
    rowEls.forEach((el, i) =>
      tl.to(el, { y: 0, autoAlpha: 1, duration: 0.35, ease: "power3.out" }, tPosted + T.row + i * 0.05),
    );
    tick(counters[0], tPosted + T.likes, T.likesFor);
    counters.slice(1).forEach((c, i) => tick(c, tPosted + T.others + i * 0.06, T.othersFor));
    /* … and Pancake picks it up: the wire drops from the post, her lead card rises under it */
    tl.fromTo(postWire, { scaleY: 0 }, grow, tPosted + T.postWire);
    tl.fromTo(leadCard, { autoAlpha: 0, y: 12 }, rise, tPosted + T.lead);
    const tF1 = tPosted + T.f1;
    tl.addLabel("f1", tF1);

    /* — B · f1 holds; the post leaves, her card travels to the top, the message card rises,
         Pancake types — */
    tl.to(post, { y: -24, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, tF1 + T.postOut);
    tl.to(postWire, { opacity: 0, duration: 0.2, ease: "power2.in" }, tF1 + T.postOut);
    tl.to(convo, { x: f2.x, y: f2.y, duration: T.leadUpDur, ease: "power3.inOut" }, tF1 + T.leadUp);
    tl.fromTo(msgWire, { scaleY: 0 }, grow, tF1 + T.msgWire);
    tl.fromTo(msgCard, { autoAlpha: 0, y: 12 }, rise, tF1 + T.msgCard);
    const msgRun = kit.typeMessage(tF1 + T.msgType, msg, msgCaret, typed);
    // f2: three glyphs into the last line (Figma: "…actually / ope|")
    const lastTop = typed[typed.length - 1].top;
    const lastLineStart = typed.findIndex((g) => Math.abs(g.top - lastTop) < 1);
    const f2Glyph = Math.min(typed.length - 1, lastLineStart + 2);
    tl.addLabel("f2", msgRun.times[f2Glyph] + 0.001);
    kit.typeDone(msg, msgCaret, msgRun.end + T.caretOff);
    const tSent = kit.markSent(msgCard, msgRun.end + T.sentAfter);

    /* — frames 3–6 · more conversations, the sending account, its leads, more accounts — */
    tail.add({ tl, tSent, lead: { convo, cards: [leadCard, msgCard] } });

    // the first scene is frame 0 itself: the post in place (author, avatar, time), its text
    // not typed yet
    return { tl, cue: 0 };
  }
}
