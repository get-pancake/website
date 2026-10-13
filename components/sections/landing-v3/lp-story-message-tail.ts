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
 *            one slides in from the right, in front (1.5×), and Pancake types it as it settles
 *            (f3 = three glyphs into its last line, as the storyboard draws it); two answered
 *            ones show further away. Then "Sent", and it holds.
 *   D · f4   the view pulls back (Figma: ×0.5721 about one point); the sending account's title
 *            lands over the conversations: they are all sent from one account.
 *   E · f5   the conversations become that account's list, in ONE move: each of the three
 *            lead cards travels to its row (a row IS a lead card, wider) while the messages
 *            fade under them and the title centres; each row then gets where it stands.
 *   F · f6   f5 holds (three statuses to read), then the view pulls back again (×0.624): six
 *            more accounts, out of focus, around it. The end = the server markup (the rest
 *            picture).
 *
 * No prototype or motion data exists in the file (the storyboard is six stills): the moves are
 * derived from the frames, in the vocabulary of the first half and of lp-step-timelines.ts
 * (rise 0.4 power3.out, wire 0.22 power2.out, camera moves power3.inOut, Pancake's 12 ms a
 * glyph). Every beat is a named constant in SM_TAIL_T.
 *
 * What the audit pass of 2026-10-13 changed here. The founder's brief: "motions should stick to
 * our narrative and be crystal clear", and, from his notes on other animations the same day, a
 * hard cut between two scenes becomes one continuous move where it can. The choices are this
 * package's:
 * - the next conversation no longer FADES IN over the story's (two cards dissolving through
 *   each other, "Drafting..." printed over her message): it waits off the stage's right edge
 *   and slides in, opaque, on the same truck;
 * - Pancake types it once its card is nearly in place, not while the view moves, and it reads
 *   "Sent" and holds BEFORE the pull-back (the storyboard's frame 4 still shows a draft: it is
 *   frame 3 scaled; every finished message stands still before the view moves);
 * - frame 4 → 5 was a cross-dissolve of two unrelated layers (rows rising through ghosts of the
 *   conversations). The rows now come FROM the conversations: at the swap each row stands
 *   exactly on its lead card (same place, size and opacity), then travels to its slot;
 * - frame 5 holds a second, so the three statuses can be read before the view leaves.
 *
 * The contract with the core timeline (lp-story-message-timeline.ts), which owns frames 1–2:
 * 1. `prepareSmTail(root, kit)` runs BEFORE the core builds anything. It puts what this half
 *    owns in its frame-0 state (the other conversations away and hidden, the accounts hidden,
 *    the camera at frame 5's scale) and measures what it will type and where the rows stand.
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
  /** types a message from `t` at Pancake's pace (on the core's timeline); its caret shows a
      quarter of a second before, at the line start */
  typeMessage: (t: number, run: HTMLElement, caret: SmCaret, glyphs: SmGlyph[]) => SmTyped;
  /** at `t` the caret leaves and the run paints like any paragraph again */
  typeDone: (run: HTMLElement, caret: SmCaret, t: number) => void;
  /** after a message's last glyph: when its caret leaves, when it reads "Sent" (the core's SM_T) */
  pace: { caretOff: number; sentAfter: number };
  /** a message card's two stacked eyebrows */
  eyebrows: (card: HTMLElement) => { draft: HTMLElement; sent: HTMLElement };
  /** at `t` "Drafting..." leaves, then "Sent" comes; returns the moment it has landed */
  markSent: (card: HTMLElement, t: number) => number;
  /** a conversation's place as GSAP's x / y (its Figma box + the half pixel of its fill) */
  at: (p: { x: number; y: number }, s: number) => { x: number; y: number };
};
export type SmTailHandoff = {
  tl: gsap.core.Timeline;
  /** the moment the story's message reads "Sent" (the label has landed) */
  tSent: number;
  /** the story's conversation and its cards */
  lead: { convo: HTMLElement; cards: HTMLElement[] };
};

/** every beat of this half, in seconds (founder pace knob) */
export const SM_TAIL_T = {
  /** C — the story's message reads "Sent" and holds this long (it has then stood still for a
      second since its last glyph), then the truck */
  truckAfter: 0.3,
  truck: 0.75,
  /** the two answered ones fade in over the first part of the truck */
  othersIn: 0.5,
  /** Pancake starts the next message as its card settles: this long into the truck */
  nextType: 0.55,
  /** D — the next message reads "Sent" and holds this long (0.9 s since its last glyph; it
      stays readable through the pull-back), then the pull-back */
  pullAfter: 0.2,
  pull: 0.85,
  /** the account's title lands this long into the pull-back */
  head: 0.42,
  headIn: 0.4,
  f4After: 0.05,
  /** E — the hold on frame 4 (the title is read), then the conversations line up as its leads */
  listAfter: 0.5,
  /** what the lead cards leave behind (wires, messages, replies, the far conversation) */
  talkOut: 0.25,
  /** each lead card's travel to its row */
  line: 0.65,
  headMove: 0.55,
  /** the statuses come in as the rows land: this long into the line-up, then one by one */
  status: 0.5,
  statusStagger: 0.08,
  statusIn: 0.28,
  f5After: 0.05,
  /** F — the hold on frame 5 (three statuses to read), then the pull-back onto more accounts */
  zoomAfter: 1,
  zoom: 1,
  /** the accounts around it start fading in this long into the zoom, and land WITH it: their
      layers and the camera's are then given back in one repaint, once nothing moves */
  othersAfter: 0.25,
  /** stage px each of them settles by while it fades in */
  othersDrift: 6,
} as const;

/** What a depth draws a pixel off the row's own drawing (story-message.css, "per-depth
    corrections"): the lead card's height, and where its avatar, name and company sit. The row
    carries each difference as a custom property (its CSS subtracts them), so it stands on the
    card exactly, and loses them on its way to its slot. Not transforms: an engine snaps a
    text's baseline from its `top`, so a name moved by a transform lands up to a pixel off the
    same name placed by `top` (WebKit, measured at the swap). [property, selector, CSS value] */
const ROW_FIT = [
  ["--trim", null, "height"],
  ["--av-up", ".lp-sm-av", "top"],
  ["--name-up", ".lp-sm-name", "top"],
  ["--co-up", ".lp-sm-co", "top"],
  ["--co-tight", ".lp-sm-co", "lineHeight"],
] as const;

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
  const answered = [convoOf("answered"), convoOf("far")];
  /* the truck of frames 2 → 3, per unit of depth: what the story's conversation moves by */
  const truck = { x: SM_POSE.leadF2.x - leadData.place.x, y: SM_POSE.leadF2.y - leadData.place.y };
  const away = (c: (typeof answered)[number]) => {
    const p = kit.at(c.data.place, c.data.place.s);
    return { x: p.x + truck.x * c.data.place.s, y: p.y + truck.y * c.data.place.s };
  };

  /* ── frame 0 of what this half owns ── */
  const pull = SM_POSE.pullBack;
  gsap.set(world, { scale: 1, transformOrigin: `${pull.about.x}px ${pull.about.y}px` });
  // the two answered ones: where the truck will take them from, unseen (they fade in, far away)
  answered.forEach((c) => gsap.set(c.el, { ...away(c), autoAlpha: 0 }));
  // the next one is in FRONT of the story's: it waits off the stage's right edge and slides in
  // whole (fading it in drew its cards through hers)
  gsap.set(next.el, { x: SM_POSE.offRight, y: away(next).y, autoAlpha: 0 });
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
  gsap.set(rows, { autoAlpha: 0, transformOrigin: "0 0" });
  others.forEach((o) => gsap.set(o.el, { autoAlpha: 0 }));
  /* Stage px per screen px = the root's own scale (--lp-fit and the phone box's). */
  const rootBox = root.getBoundingClientRect();
  const unit = root.offsetWidth ? rootBox.width / root.offsetWidth : 1;
  /* the account's title in frame 4: left-aligned on the conversations, higher than in frame 5.
     Its frame-5 place is the CSS (centred over the rows); the offset to frame 4's left edge
     depends on the title's width, so it is read from the laid-out text. */
  const nameLeft = (senderName.getBoundingClientRect().left - rootBox.left) / unit;
  const headF4 = { x: SM_POSE.headF4.left - nameLeft, y: SM_POSE.headF4.dy };
  gsap.set(sender, { ...headF4, opacity: 0 });

  /* The story's rows come from three of the conversations: a row is its lead's card, wider.
     For each row: the lead card it takes over from, and the pose (in the row's own px, about
     its top-left corner) that puts it exactly on that card as frame 4 shows it — the card's
     place and size there are frame 3's through the pull-back; the row's own are read from the
     layout, which stands in frame 5 now (the camera was just set). */
  const story = SM_STORY.accounts.find((a) => a.id === "main");
  if (!story || story.rows.length !== rows.length) throw new Error("lp-story-message tail: the story's rows are out of sync");
  const lined = story.rows.map(({ lead }, n) => {
    const row = rows[n];
    const data = SM_STORY.convos.find((c) => c.lead === lead);
    const card = data && root.querySelector<HTMLElement>(`.lp-sm-convo[data-convo="${data.id}"] .lp-sm-lead`);
    const status = row.querySelector<HTMLElement>(".lp-sm-status");
    if (!data || !card || !status) throw new Error(`lp-story-message tail: row ${n} has no conversation to come from`);
    const p = kit.at(data.place, data.place.s);
    const at = { x: pull.about.x + pull.scale * (p.x - pull.about.x), y: pull.about.y + pull.scale * (p.y - pull.about.y) };
    const box = row.getBoundingClientRect();
    const width = parseFloat(getComputedStyle(row).width);
    const perPx = box.width / unit / width; // stage px per row px in frame 5 (1, by Figma's numbers)
    // the row's drawing minus the card's, property by property (ROW_FIT); read before any is set
    const fit: Record<string, number> = {};
    const settled: Record<string, number> = {};
    ROW_FIT.forEach(([name, sel, prop]) => {
      const mine = sel ? row.querySelector<HTMLElement>(sel) : row;
      const hers = sel ? card.querySelector<HTMLElement>(sel) : card;
      if (!mine || !hers) throw new Error(`lp-story-message tail: row ${n} and its card do not share ${sel}`);
      fit[name] = parseFloat(getComputedStyle(mine)[prop]) - parseFloat(getComputedStyle(hers)[prop]);
      settled[name] = 0;
    });
    gsap.set(row, { zIndex: SM_STORY.convos.indexOf(data) + 1 }); // the conversations' paint order
    gsap.set(status, { opacity: 0, y: 4 }); // its start pose: it is played with a plain `to`
    return {
      row,
      card,
      status,
      settled,
      width,
      from: {
        ...fit,
        x: (at.x - (box.left - rootBox.left) / unit) / perPx,
        y: (at.y - (box.top - rootBox.top) / unit) / perPx,
        scale: (pull.scale * data.place.s) / perPx,
        width: parseFloat(getComputedStyle(card).width),
        autoAlpha: data.dim,
      },
    };
  });

  return {
    add({ tl, tSent, lead }: SmTailHandoff) {
      /* — C · frame 3: the truck. One move for every conversation, times its depth; the one in
           front comes from off the stage — */
      const tTruck = tSent + T.truckAfter;
      const move = { duration: T.truck, ease: "power3.inOut" };
      tl.to(lead.convo, { ...kit.at(leadData.place, leadData.place.s), ...move }, tTruck);
      tl.to(lead.cards, { opacity: leadData.dim, ...move }, tTruck);
      answered.forEach((c) => {
        tl.to(c.el, { ...kit.at(c.data.place, c.data.place.s), ...move }, tTruck);
        tl.to(c.el, { autoAlpha: 1, duration: T.othersIn, ease: "power1.out" }, tTruck);
      });
      tl.set(next.el, { autoAlpha: 1 }, tTruck);
      tl.to(next.el, { ...kit.at(next.data.place, next.data.place.s), ...move }, tTruck);
      const typed = kit.typeMessage(tTruck + T.nextType, nextRun, nextCaret, nextGlyphs);
      // f3: three glyphs into the last line, the storyboard's own moment (as f2)
      const lastTop = nextGlyphs[nextGlyphs.length - 1].top;
      const lastLine = nextGlyphs.findIndex((g) => Math.abs(g.top - lastTop) < 1);
      const tF3 = Math.max(typed.times[Math.min(nextGlyphs.length - 1, lastLine + 2)] + 0.001, tTruck + T.truck);
      tl.addLabel("f3", tF3);
      kit.typeDone(nextRun, nextCaret, typed.end + kit.pace.caretOff);
      const tNextSent = kit.markSent(nextCard, typed.end + kit.pace.sentAfter);

      /* — D · frame 4: the pull-back, and the sending account's title — */
      const tPull = tNextSent + T.pullAfter;
      tl.to(world, { scale: pull.scale, duration: T.pull, ease: "power3.inOut" }, tPull);
      tl.fromTo(
        sender,
        { opacity: 0, y: headF4.y + 8 },
        { opacity: 1, y: headF4.y, duration: T.headIn, ease: "power3.out", immediateRender: false },
        tPull + T.head,
      );
      const tF4 = tPull + T.pull + T.f4After;
      tl.addLabel("f4", tF4);

      /* — E · frame 5: the conversations line up as the account's leads. At tList each row
           takes over from its lead card, on it to the pixel; what the cards leave behind fades
           while the rows travel to their slots and widen, and the title centres over them — */
      const tList = tF4 + T.listAfter;
      const line = { duration: T.line, ease: "power3.inOut", immediateRender: false };
      tl.set(
        lined.map((l) => l.card),
        { autoAlpha: 0 },
        tList,
      );
      lined.forEach((l) =>
        tl.fromTo(l.row, l.from, { ...l.settled, x: 0, y: 0, scale: 1, width: l.width, autoAlpha: 1, ...line }, tList),
      );
      tl.to(talk, { autoAlpha: 0, duration: T.talkOut, ease: "power2.in" }, tList);
      tl.to(sender, { x: 0, y: 0, duration: T.headMove, ease: "power3.inOut" }, tList);
      lined.forEach((l, n) =>
        tl.to(l.status, { opacity: 1, y: 0, duration: T.statusIn, ease: "power2.out" }, tList + T.status + n * T.statusStagger),
      );
      const tStatusIn = tList + T.status + T.statusStagger * Math.max(0, lined.length - 1) + T.statusIn;
      const tF5 = Math.max(tStatusIn, tList + T.line, tList + T.headMove) + T.f5After;
      tl.addLabel("f5", tF5);

      /* — F · frame 6: f5 holds, then the view pulls back onto more accounts = the end (the
           server markup) — */
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
