// No "use client" on purpose — see lp-story-message-timeline.ts (a "use client" module the
// server registry can reach becomes an eager client entry of the homepage).
import { gsap } from "@/lib/gsap";

import { SM_POSE, SM_STORY, type SmConvo } from "./lp-story-message-data";

/**
 * Deep-dive story "A personal message for every lead" — the second half of its timeline:
 * storyboard frames 3 to 6 (Figma 4964:1729, 5061:1002, 5061:1091, 5061:1209), the designer's
 * ending since 2026-10-12. It replaces the interim tail (a hand correction, Send, "Message
 * sent", a zoom-out onto account cards) that stood in while those frames were marked WIP.
 * Owner: story-message package.
 *
 *   C · f3   the view trucks right: the story's conversation slides aside and dims, the next
 *            one arrives in front (1.5×) and Pancake starts typing it, two answered ones show
 *            further away. Every conversation moves by the same truck, times its depth.
 *   D · f4   the view pulls back (Figma: ×0.5721 about one point); the sending account's name
 *            lands over the conversations. The next message is still being typed.
 *   E · f5   that message is sent; the conversations leave, the name centres, and the
 *            account's three leads rise under it, each with where it stands.
 *   F · f6   the view pulls back again (×0.624): six more accounts, out of focus, around it.
 *            The end = the server markup (the rest picture).
 *
 * No prototype or motion data exists in the file (the storyboard is six stills): the moves are
 * derived from the frames, in the vocabulary of the first half and of lp-step-timelines.ts
 * (rise 0.4 power3.out, wire 0.22 power2.out, camera moves power3.inOut, Pancake's 12 ms a
 * glyph). Every beat is a named constant in SM_TAIL_T.
 *
 * The contract with the core timeline (lp-story-message-timeline.ts), which owns frames 1–2:
 * 1. `prepareSmTail(root, kit)` runs BEFORE the core builds anything. It puts what this half
 *    owns in its frame-0 state (the other conversations away and hidden, the accounts hidden,
 *    the camera at frame 5's scale) and measures what it will type.
 * 2. The core builds frames 1–2 up to "Sent", then calls `tail.add({ tl, tSent, lead })` once:
 *    this half appends its beats (labels f3 … f6) after `tSent`.
 * Same rules as the core: gsap.set for frame 0 (the caller's gsap.context reverts it), sets and
 * tweens only, no callbacks, no randomness, no DOM left behind.
 */

/** one visible character of a typed run: its right edge and line box, in the run's own px */
export type SmGlyph = { ch: string; right: number; top: number; bottom: number };
/** a typing caret: its element and the run's offset inside the caret's positioned parent */
export type SmCaret = { el: HTMLElement; ox: number; oy: number };
/** a typed run's schedule: each glyph's moment, and the moment after the last one */
export type SmTyped = { times: number[]; end: number };

/** the core's helpers, handed over so this half types and measures exactly like it */
export type SmKit = {
  $: <T extends Element = HTMLElement>(sel: string) => T;
  $$: <T extends Element = HTMLElement>(sel: string) => T[];
  measure: (el: HTMLElement) => SmGlyph[];
  hiddenClip: string;
  /** a caret for a message run (created in the run's card; the core's cleanup removes it) */
  messageCaret: (run: HTMLElement) => SmCaret;
  /** types a message from `t` at Pancake's pace (on the core's timeline) */
  typeMessage: (t: number, run: HTMLElement, caret: SmCaret, glyphs: SmGlyph[]) => SmTyped;
  /** at `t` the caret leaves and the run paints like any paragraph again */
  typeDone: (run: HTMLElement, caret: SmCaret, t: number) => void;
  /** after a message's last glyph: when its caret leaves, when it reads "Sent" (the core's SM_T) */
  pace: { caretOff: number; sentAfter: number };
  /** a message card's two stacked eyebrows */
  eyebrows: (card: HTMLElement) => { draft: HTMLElement; sent: HTMLElement };
  /** at `t` "Drafting..." gives way to "Sent" */
  markSent: (card: HTMLElement, t: number) => void;
  /** a conversation's place as GSAP's x / y (its Figma box + the half pixel of its fill) */
  at: (p: { x: number; y: number }, s: number) => { x: number; y: number };
};
export type SmTailHandoff = {
  tl: gsap.core.Timeline;
  /** the moment the story's message reads "Sent" */
  tSent: number;
  /** the story's conversation and its cards */
  lead: { convo: HTMLElement; cards: HTMLElement[] };
};

/** every beat of this half, in seconds (founder pace knob) */
export const SM_TAIL_T = {
  /** C — after the story's message reads "Sent" */
  truckAfter: 0.3,
  truck: 0.8,
  /** the others fade in over the first part of the truck */
  othersIn: 0.5,
  /** Pancake starts the next message this long into the truck */
  nextType: 0.55,
  f3After: 0.05,
  /** D — the hold on frame 3, then the pull-back */
  pullAfter: 0.3,
  pull: 1,
  /** the account's name lands this long into the pull-back */
  head: 0.5,
  headIn: 0.4,
  f4After: 0.05,
  /** E — the next message reads "Sent" no sooner than this after frame 4 … */
  nextSentAfter: 0.15,
  /** … and the conversations leave this long after it does */
  listAfter: 0.55,
  talkOut: 0.3,
  headMove: 0.6,
  rows: 0.2,
  rowStagger: 0.08,
  rowIn: 0.4,
  f5After: 0.05,
  /** F — the hold on frame 5, then the pull-back onto more accounts */
  zoomAfter: 0.5,
  zoom: 1.2,
  /** the accounts around it start fading in this long into the zoom, and land WITH it: their
      layers and the camera's are then given back in one repaint, once nothing moves */
  othersAfter: 0.25,
  /** stage px each of them settles by while it fades in */
  othersDrift: 6,
} as const;

export function prepareSmTail(root: HTMLElement, kit: SmKit) {
  const { $, $$ } = kit;
  const T = SM_TAIL_T;
  const talk = $(".lp-sm-talk");
  const world = $(".lp-sm-world");
  const cam = $(".lp-sm-cam");
  const main = $('.lp-sm-acct[data-acct="main"]');
  const sender = $('.lp-sm-acct[data-acct="main"] .lp-sm-sender');
  const senderName = $('.lp-sm-acct[data-acct="main"] .lp-sm-sender span');
  const rows = $$('.lp-sm-acct[data-acct="main"] .lp-sm-row');
  const others = SM_STORY.accounts
    .filter((a) => a.id !== "main")
    .map((a) => ({ el: $(`.lp-sm-acct[data-acct="${a.id}"]`), dim: a.dim, y: a.place.y + 0.5 * a.place.k }));

  const convoOf = (id: SmConvo["id"]) => {
    const data = SM_STORY.convos.find((c) => c.id === id);
    if (!data) throw new Error(`lp-story-message tail: no conversation "${id}"`);
    return { data, el: $(`.lp-sm-convo[data-convo="${id}"]`) };
  };
  const leadData = convoOf("lead").data;
  const next = convoOf("next");
  const around = [next, convoOf("answered"), convoOf("far")];
  /* the truck of frames 2 → 3, per unit of depth: what the story's conversation moves by */
  const truck = { x: SM_POSE.leadF2.x - leadData.place.x, y: SM_POSE.leadF2.y - leadData.place.y };
  const away = (c: (typeof around)[number]) => {
    const p = kit.at(c.data.place, c.data.place.s);
    return { x: p.x + truck.x * c.data.place.s, y: p.y + truck.y * c.data.place.s };
  };

  /* ── frame 0 of what this half owns ── */
  gsap.set(world, { scale: 1, transformOrigin: SM_POSE.pullBack.origin });
  around.forEach((c) => gsap.set(c.el, { ...away(c), autoAlpha: 0 }));
  const nextCard = next.el.querySelector<HTMLElement>(".lp-sm-msg");
  const nextRun = next.el.querySelector<HTMLElement>(".lp-sm-msg .lp-sm-text");
  if (!nextCard || !nextRun) throw new Error("lp-story-message tail: the next conversation has no message");
  // it is a draft until Pancake has typed it
  const nextEb = kit.eyebrows(nextCard);
  gsap.set(nextEb.draft, { opacity: 1 });
  gsap.set(nextEb.sent, { opacity: 0 });
  const nextCaret = kit.messageCaret(nextRun);
  const nextGlyphs = kit.measure(nextRun);
  if (!nextGlyphs.length) throw new Error("lp-story-message tail: nothing to type (is the stage laid out?)");
  gsap.set(nextRun, { clipPath: kit.hiddenClip });

  // the accounts: the camera at frame 5 (the story's block at its own size), everything unseen
  gsap.set(cam, { scale: SM_POSE.camF5 });
  gsap.set(main, { "--z": 0 });
  gsap.set(rows, { autoAlpha: 0 });
  others.forEach((o) => gsap.set(o.el, { autoAlpha: 0 }));
  /* the account's name in frame 4: left-aligned on the conversations, higher than in frame 5.
     Its frame-5 place is the CSS (centred over the rows); the offset to frame 4's left edge
     depends on the name's width, so it is read from the laid-out text. Stage px per screen px
     = the root's own scale (--lp-fit and the phone box's). */
  const rootBox = root.getBoundingClientRect();
  const unit = root.offsetWidth ? rootBox.width / root.offsetWidth : 1;
  const nameLeft = (senderName.getBoundingClientRect().left - rootBox.left) / unit;
  const headF4 = { x: SM_POSE.headF4.left - nameLeft, y: SM_POSE.headF4.dy };
  gsap.set(sender, { ...headF4, opacity: 0 });

  return {
    add({ tl, tSent, lead }: SmTailHandoff) {
      /* — C · frame 3: the truck. One move for every conversation, times its depth — */
      const tTruck = tSent + T.truckAfter;
      const move = { duration: T.truck, ease: "power3.inOut" };
      tl.to(lead.convo, { ...kit.at(leadData.place, leadData.place.s), ...move }, tTruck);
      tl.to(lead.cards, { opacity: leadData.dim, ...move }, tTruck);
      around.forEach((c) => {
        tl.to(c.el, { ...kit.at(c.data.place, c.data.place.s), ...move }, tTruck);
        tl.to(c.el, { autoAlpha: 1, duration: T.othersIn, ease: "power1.out" }, tTruck);
      });
      const typed = kit.typeMessage(tTruck + T.nextType, nextRun, nextCaret, nextGlyphs);
      const tF3 = tTruck + T.truck + T.f3After;
      tl.addLabel("f3", tF3);

      /* — D · frame 4: the pull-back, and the sending account's name — */
      const tPull = tF3 + T.pullAfter;
      tl.to(world, { scale: SM_POSE.pullBack.scale, duration: T.pull, ease: "power3.inOut" }, tPull);
      tl.fromTo(
        sender,
        { opacity: 0, y: headF4.y + 8 },
        { opacity: 1, y: headF4.y, duration: T.headIn, ease: "power3.out", immediateRender: false },
        tPull + T.head,
      );
      const tF4 = tPull + T.pull + T.f4After;
      tl.addLabel("f4", tF4);

      /* — E · frame 5: the next message is sent (never before frame 4's picture, which shows it
           as a draft), the conversations leave, the account's leads rise under its name — */
      const tNextSent = Math.max(typed.end + kit.pace.sentAfter, tF4 + T.nextSentAfter);
      kit.typeDone(nextRun, nextCaret, tNextSent - (kit.pace.sentAfter - kit.pace.caretOff));
      kit.markSent(nextCard, tNextSent);
      const tList = tNextSent + T.listAfter;
      tl.to(talk, { autoAlpha: 0, duration: T.talkOut, ease: "power2.in" }, tList);
      tl.to(sender, { x: 0, y: 0, duration: T.headMove, ease: "power3.inOut" }, tList);
      tl.fromTo(
        rows,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: T.rowIn, ease: "power3.out", stagger: T.rowStagger, immediateRender: false },
        tList + T.rows,
      );
      const tRowsIn = tList + T.rows + T.rowStagger * Math.max(0, rows.length - 1) + T.rowIn;
      const tF5 = Math.max(tRowsIn, tList + T.headMove) + T.f5After;
      tl.addLabel("f5", tF5);

      /* — F · frame 6: the view pulls back onto more accounts = the end (the server markup) — */
      const tZoom = tF5 + T.zoomAfter;
      const zoom = { duration: T.zoom, ease: "power3.inOut" };
      tl.to(cam, { scale: 1, ...zoom }, tZoom);
      tl.to(main, { "--z": 1, ...zoom }, tZoom);
      /* the accounts around it fade in as they come into view. Each also settles by a few px:
         a transform tween puts the block on its own layer while it fades (GSAP's 3D during a
         tween), so its blur is the compositor's. Without it every step of the fade repainted
         six blurred blocks into the camera's layer: 180–270 ms frames in WebKit, measured. */
      others.forEach((o) =>
        tl.fromTo(
          o.el,
          { autoAlpha: 0, y: o.y + T.othersDrift },
          { autoAlpha: o.dim, y: o.y, duration: T.zoom - T.othersAfter, ease: "power1.out", immediateRender: false },
          tZoom + T.othersAfter,
        ),
      );
      tl.addLabel("f6", tZoom + T.zoom);
      tl.to({}, { duration: 0.001 }, tZoom + T.zoom);
    },
  };
}
