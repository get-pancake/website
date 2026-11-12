// No "use client" on purpose (lp-dive-stages.ts has why): a plain module, reached only through
// the lazy loader in lp-dive-loaders.ts.
import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import { registerTxtPlugin } from "./lp-gsap-txt";
import { ART_ENGINE, ART_JOURNEY, ART_MERGE } from "./lp-toy-art";
import { toyCanvas } from "./lp-toy-canvas";
import { TOY_EASE, TOY_STEP, toyDecode, toyGone, toyHidePop, toyHideRise, toyPop, toyQuery, toyRise } from "./lp-toy-kit";

/**
 * The takes of the four toy pictures of "What your agent can do with Pancake" (LpToyStories.tsx,
 * 2026-11-12), each ONE paused, seek-safe GSAP timeline on its stage root. Contract:
 * lp-dive-stages.ts (frame 0 via gsap.set, which the caller's gsap.context reverts; sets and
 * tweens only; progress(1) = the server markup; `cue` = the first composed scene). One builder
 * for the four: it reads which from its root (data-lp-story), as the problems' builder does.
 *
 *   t-engine    the ask types in Claude's composer and is sent; a point of light runs the cable
 *               to the engine, whose parts come on one after the other as Claude logs each
 *               step; the answer runs back up the cable, and Claude says it, with the Play
 *   t-journey   the buyer comes in along the track and goes from stop to stop. Each stop it
 *               lands on takes its tone, its date comes up, and a dot goes down to the record
 *               of what was kept, whose count goes up
 *   t-merge     three pale pawns leave three sources, each drawing its way in its tone; they
 *               stand side by side on the stand, step into one another, and are one buyer
 *   t-ping      the phone lights up by itself and hums; your agent types, and its message
 *               comes out of the phone; a second one; you answer; it is done
 *
 * No take loops by itself: the carousel plays a story at each of its turns, and the phone stack
 * plays it again after a hold (lp-play-once `loop`). A story may change between two plays: its
 * `next` (the engine asks another question). The feel is lp-toy-kit.ts's (TOY_EASE). A builder
 * may yield after any block (lp-play-once's `steps`): what it measures it measures before its
 * first write.
 */

type Timeline = gsap.core.Timeline;
type Point = readonly [number, number];
type Steps = Generator<void, BuiltStory, void>;

const num = (el: HTMLElement, key: string) => Number(el.dataset[key]);

/** where an element's centre is on its stage, in stage px (the stage may be scaled) */
function measurer(root: HTMLElement) {
  const box = root.getBoundingClientRect();
  const scale = root.offsetWidth ? box.width / root.offsetWidth : 1;
  return (el: Element): Point => {
    const r = el.getBoundingClientRect();
    return [(r.left + r.width / 2 - box.left) / scale, (r.top + r.height / 2 - box.top) / scale];
  };
}

/** the time, from 0 to 1, at which a piece that eases in and out has covered the share `u` of
    its way (the inverse of power1.inOut) */
const easedAt = (u: number) => (u < 0.5 ? Math.sqrt(u / 2) : 1 - Math.sqrt((1 - u) / 2));

/**
 * A piece goes along a line of the set in one low hop: slow off, slow on, `height` px up at the
 * middle. `points` are the line (stage px); the piece is laid on `home` in the markup.
 */
function hopAlong(tl: Timeline, el: Element, points: readonly Point[], home: Point, at: number, duration: number, height: number): void {
  const n = points.length - 1;
  for (let i = 1; i <= n; i++) {
    const u = i / n;
    const from = at + duration * easedAt((i - 1) / n);
    const to = at + duration * easedAt(u);
    tl.to(el, { x: points[i][0] - home[0], y: points[i][1] - home[1] - height * 4 * u * (1 - u), duration: to - from, ease: "none", force3D: false }, from);
  }
}

/* ── "Remember every touch with every buyer" ── */

function* journey(root: HTMLElement): Steps {
  const q = toyQuery(root, "journey");
  const art = ART_JOURNEY;
  const pawn = q.one(".lp-tj-pawn");
  const ons = q.all(".lp-tj-on");
  const rings = q.all(".lp-tj-ring");
  const touches = q.all(".lp-tj-touch");
  const dots = q.all(".lp-tj-dot");
  const slots = q.all(".lp-tj-slot");
  const kept = q.one(".lp-tj-kept");
  const count = q.one(".lp-tj-kept__n");
  const counts = (count.dataset.counts ?? "").split("|");
  const stops = ons.length;
  if (!stops || [rings, touches, dots, slots, counts].some((list) => list.length !== stops)) throw new Error("lp-toy journey: a ring, a date, a dot and a count for each stop");
  registerTxtPlugin();
  toyDecode(root);
  const paths = art.paths as unknown as Record<string, readonly Point[]>;
  const anchors = art.anchors as unknown as Record<string, Point>;
  const home = anchors[`stop${stops - 1}`];
  // where each dot lands in the record (the record's own layout decides)
  const centre = measurer(root);
  const lands = slots.map((slot) => centre(slot));
  yield;

  // frame 0: the track and its four stops, nobody on it yet, nothing kept
  const set = gsap.set;
  const start = paths.leg0[0];
  set(pawn, { x: start[0] - home[0], y: start[1] - home[1] });
  toyHidePop(ons, 0.6);
  set(rings, { autoAlpha: 0, scale: 0.4 });
  toyHideRise(touches, 8);
  set(dots, { autoAlpha: 0, scale: 0.4 });
  set(slots, { "--toy-fill": 0 });
  toyHideRise(kept, 10);
  set(count, { txt: counts[0] });
  yield;

  const tl = gsap.timeline({ paused: true });
  /** the buyer takes this long from one stop to the next, and stays this long on each */
  const LEG = 0.72;
  const STAY = 0.62;
  let t = 0.3;
  for (let k = 0; k < stops; k++) {
    hopAlong(tl, pawn, paths[`leg${k}`], home, t, LEG, 16);
    const at = t + LEG;
    // it lands: it gives a little, the stop takes its tone, a ring opens round it
    tl.fromTo(
      pawn,
      { scaleY: 0.88, scaleX: 1.07 },
      { scaleY: 1, scaleX: 1, duration: 0.34, ease: TOY_EASE.pop, transformOrigin: "45% 86%", force3D: false, immediateRender: false },
      at,
    );
    toyPop(tl, ons[k], at - 0.04, 0.36);
    tl.to(rings[k], { autoAlpha: 0.9, duration: 0.08, ease: "none" }, at);
    tl.to(rings[k], { scale: 1.75, duration: 0.7, ease: "power2.out", force3D: false }, at);
    tl.to(rings[k], { autoAlpha: 0, duration: 0.45, ease: "power1.in" }, at + 0.25);
    // its date comes up
    toyRise(tl, touches[k], at + 0.08);
    // and it is kept: a dot goes from the stop down to the record, whose count goes up
    if (k === 0) toyRise(tl, kept, at + 0.1);
    const stop = anchors[`stop${k}`];
    const leaves = at + 0.2;
    const FLY = 0.5;
    tl.to(dots[k], { autoAlpha: 1, scale: 1, duration: 0.14, ease: "power1.out", force3D: false }, leaves);
    tl.to(dots[k], { x: lands[k][0] - stop[0], duration: FLY, ease: "power1.inOut", force3D: false }, leaves + 0.08);
    tl.to(dots[k], { y: lands[k][1] - stop[1], duration: FLY, ease: "power2.in", force3D: false }, leaves + 0.08);
    const filed = leaves + 0.08 + FLY;
    toyGone(tl, dots[k], filed);
    tl.to(slots[k], { "--toy-fill": 1, duration: TOY_STEP, ease: "none" }, filed);
    tl.fromTo(slots[k], { scale: 1.5 }, { scale: 1, duration: 0.3, ease: "power2.out", force3D: false, immediateRender: false }, filed);
    if (k > 0) tl.to(count, { txt: counts[k], duration: TOY_STEP, ease: "none" }, filed);
    t = at + STAY;
  }
  // (the take ends a beat after the last touch is kept)
  tl.to(root, { duration: TOY_STEP }, t + 0.45);
  yield;
  return { tl, cleanup: () => {}, cue: 0 };
}

/* ── "See one buyer behind three emails" ── */

function* merge(root: HTMLElement): Steps {
  const q = toyQuery(root, "merge");
  const art = ART_MERGE;
  const ghosts = q.all(".lp-tm-ghost");
  const trails = q.all<SVGPathElement>(".lp-tm-trails path");
  const flash = q.one(".lp-tm-flash");
  const buyer = q.one(".lp-tm-buyer");
  const one = q.one(".lp-tm-one");
  if (ghosts.length < 2 || trails.length !== ghosts.length) throw new Error("lp-toy merge: a pawn and its way for each sighting");
  toyDecode(root);
  const paths = art.paths as unknown as Record<string, readonly Point[]>;
  const stand = (art.anchors as unknown as Record<string, Point>).stand;
  yield;

  // frame 0: three pawns on three sources, nobody on the stand
  const set = gsap.set;
  set(ghosts, { autoAlpha: 1 });
  set(trails, { strokeDashoffset: 1, autoRound: false });
  set(flash, { autoAlpha: 0, scale: 0.3 });
  toyHidePop(buyer, 0.5);
  toyHideRise(one, 10);
  yield;

  const tl = gsap.timeline({ paused: true });
  /** each pawn takes this long to the stand; they leave a beat apart, the far one first */
  const LEAVE = 0.45;
  const APART = 0.12;
  const RUN = 1.35;
  let arrived = 0;
  ghosts.forEach((ghost, k) => {
    const line = paths[`lane${num(ghost, "k")}`];
    const t = LEAVE + k * APART;
    hopAlong(tl, ghost, line, line[0], t, RUN, 0);
    // (its way is drawn behind it as it goes, in its source's tone)
    // (autoRound off: GSAP rounds a length in px, and an offset from 1 to 0 would jump at its middle)
    tl.to(trails[k], { strokeDashoffset: 0, duration: RUN, ease: "power1.inOut", autoRound: false }, t);
    arrived = t + RUN;
  });
  // they stand side by side for a beat: the same person, three times
  const meet = arrived + 0.28;
  ghosts.forEach((ghost) => {
    const line = paths[`lane${num(ghost, "k")}`];
    const last = line[line.length - 1];
    const home = line[0];
    // then they step into one another, on the middle of the stand
    tl.to(ghost, { x: stand[0] - home[0] + (last[0] - stand[0]) * 0.12, y: last[1] - home[1] + (stand[1] - last[1]) * 0.9, duration: 0.26, ease: "power2.in", force3D: false }, meet);
    tl.to(ghost, { autoAlpha: 0, scale: 0.86, duration: 0.14, ease: "power1.in", force3D: false }, meet + 0.2);
  });
  const isOne = meet + 0.26;
  tl.to(flash, { autoAlpha: 0.95, duration: 0.06, ease: "none" }, isOne - 0.04);
  tl.to(flash, { scale: 1.5, duration: 0.7, ease: "power2.out", force3D: false }, isOne - 0.04);
  tl.to(flash, { autoAlpha: 0, duration: 0.5, ease: "power1.in" }, isOne + 0.18);
  toyPop(tl, buyer, isOne, 0.5);
  toyRise(tl, one, isOne + 0.3);
  tl.to(root, { duration: TOY_STEP }, isOne + 1.25);
  yield;
  return { tl, cleanup: () => {}, cue: 0 };
}

/* ── "Bring you the next deal before you ask" ── */

function* ping(root: HTMLElement): Steps {
  const q = toyQuery(root, "ping");
  const phone = q.one(".lp-tp-phone");
  const lit = q.one(".lp-tp-lit");
  const hums = q.all(".lp-tp-hum");
  const rows = q.all(".lp-tp-row").map((row) => ({
    mine: row.dataset.from === "me",
    bubble: q.one(".lp-tp-bubble", row),
    typing: row.querySelector<HTMLElement>(".lp-tp-typing"),
    dots: Array.from(row.querySelectorAll<HTMLElement>(".lp-tp-typing i")),
    delivered: row.querySelector<HTMLElement>(".lp-tp-delivered"),
  }));
  if (!rows.length || hums.length < 2) throw new Error("lp-toy ping: the messages, and the phone's two rings");
  toyDecode(root);
  // a message comes out of the phone: from the card on its glass to its own place
  const centre = measurer(root);
  const card: Point = [num(phone, "x"), num(phone, "y")];
  const places = rows.map((row) => centre(row.bubble));
  yield;

  // frame 0: the phone asleep, nobody has written
  const set = gsap.set;
  set(lit, { autoAlpha: 0 });
  set(hums, { autoAlpha: 0, scale: 0.7 });
  rows.forEach((row, k) => {
    if (row.mine) set(row.bubble, { autoAlpha: 0, y: 16 });
    else set(row.bubble, { autoAlpha: 0, x: card[0] - places[k][0], y: card[1] - places[k][1], scale: 0.2 });
    if (row.typing) set(row.typing, { autoAlpha: 0 });
    if (row.delivered) set(row.delivered, { autoAlpha: 0 });
  });
  yield;

  const tl = gsap.timeline({ paused: true });
  /** the phone hums: it shakes by `by` degrees and a ring opens round it on the table */
  const hum = (at: number, by: number, ring: HTMLElement) => {
    tl.to(
      phone,
      {
        keyframes: [
          { rotation: -by, duration: 0.07, ease: "power1.out" },
          { rotation: by * 0.8, duration: 0.11, ease: "power1.inOut" },
          { rotation: -by * 0.45, duration: 0.11, ease: "power1.inOut" },
          { rotation: 0, duration: 0.16, ease: "power1.out" },
        ],
        force3D: false,
      },
      at,
    );
    tl.fromTo(ring, { autoAlpha: 0.9, scale: 0.7 }, { scale: 1.3, duration: 0.75, ease: "power2.out", force3D: false, immediateRender: false }, at);
    tl.to(ring, { autoAlpha: 0, duration: 0.5, ease: "power1.in" }, at + 0.25);
  };
  /** the dots show this long before the message takes their place; a message that has come is
      read before anything else moves */
  const TYPING = 0.7;
  const READ = 1.0;
  // it lights up by itself
  const WAKE = 0.4;
  tl.to(lit, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, WAKE);
  hum(WAKE, 2.6, hums[0]);
  let t = WAKE + 0.3;
  let first = true;
  for (const row of rows) {
    if (row.mine) {
      // you answer: your message comes up, then it is delivered
      t += 0.3;
      tl.to(row.bubble, { autoAlpha: 1, duration: 0.16, ease: "power1.out" }, t);
      tl.to(row.bubble, { y: 0, duration: 0.34, ease: TOY_EASE.pop, force3D: false }, t);
      if (row.delivered) tl.to(row.delivered, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, t + 0.45);
      t += READ;
      continue;
    }
    // your agent is typing (each dot lights once, in turn), then its message comes out of the phone
    if (row.typing) {
      tl.to(row.typing, { autoAlpha: 1, duration: 0.15, ease: "power1.out" }, t);
      row.dots.forEach((dot, k) => tl.to(dot, { keyframes: [{ opacity: 1, duration: 0.18, ease: "none" }, { opacity: 0.35, duration: 0.18, ease: "none" }] }, t + 0.1 + k * 0.14));
      tl.to(row.typing, { autoAlpha: 0, duration: TOY_STEP, ease: "none" }, t + TYPING);
    }
    const comes = t + TYPING;
    if (!first) hum(comes - 0.08, 1.5, hums[1]);
    tl.to(row.bubble, { autoAlpha: 1, duration: 0.12, ease: "none" }, comes);
    tl.to(row.bubble, { x: 0, y: 0, duration: 0.42, ease: "power2.out", force3D: false }, comes);
    tl.to(row.bubble, { scale: 1, duration: 0.46, ease: TOY_EASE.soft, force3D: false }, comes);
    first = false;
    t = comes + READ;
  }
  tl.to(root, { duration: TOY_STEP }, t);
  yield;
  return { tl, cleanup: () => {}, cue: 0 };
}

/* ── "Run your revenue engine from Claude" ── */

function* engine(root: HTMLElement): Steps {
  const q = toyQuery(root, "engine");
  const art = ART_ENGINE;
  const greet = q.one(".lp-te-greet");
  const placeholder = q.one(".lp-te-ph");
  const reply = q.one(".lp-te-reply");
  const send = q.one(".lp-te-send");
  const bar = q.one(".lp-te-bar");
  const ask = q.one(".lp-te-ask");
  // every round's ask (typed in the composer, then in its bubble), answer and Play: one of each
  // shows (the root's data-round, toys.css); they all take the same tweens
  const typed = q.all(".lp-te-typed");
  const askTexts = q.all(".lp-te-ask span");
  const steps = q.all(".lp-te-step").map((li) => ({ li, done: q.one("em", li), part: li.dataset.part ?? "" }));
  const says = q.all(".lp-te-say");
  const plays = q.all(".lp-te-play");
  const pulse = q.one(".lp-te-pulse");
  const beam = q.one(".lp-te-beam");
  const partOf = (id: string) => q.one(`.lp-te-part[data-part="${id}"]`);
  const glowOf = (id: string) => q.one(`.lp-te-glow[data-part="${id}"]`);
  const parts = steps.map((step) => ({ img: partOf(step.part), glow: glowOf(step.part) }));
  const rounds = typed.length;
  if (!steps.length || !rounds || [askTexts, says, plays].some((list) => list.length !== rounds)) throw new Error("lp-toy engine: the steps, and an ask, an answer and a Play for each round");
  toyDecode(root);
  // phones: the window docks no composer, the ask types in its bubble (the mcp story's own rule)
  const inBar = getComputedStyle(bar).display !== "none";
  const lettersOf = (el: HTMLElement) => Math.max((el.textContent ?? "").length, 1);
  /** the longest ask: the others are sent when it would be */
  const letters = Math.max(...typed.map(lettersOf));
  const line = (art.paths as unknown as Record<string, readonly Point[]>).cable;
  yield;

  // frame 0: Claude's window at rest, the engine quiet
  const set = gsap.set;
  const HIDDEN = "inset(0% 100% 0% 0%)";
  const SHOWN = "inset(0% 0% 0% 0%)";
  set(greet, { autoAlpha: 1 });
  if (inBar) {
    set(placeholder, { autoAlpha: 1 });
    set(typed, { autoAlpha: 1, clipPath: HIDDEN });
    set(reply, { autoAlpha: 0 });
    toyHideRise(ask, 8);
  } else {
    set(askTexts, { clipPath: HIDDEN });
  }
  set(send, { opacity: 0.45 });
  toyHideRise([...steps.map((step) => step.li), ...says], 6);
  toyHideRise(plays, 10);
  steps.forEach((step) => set(step.done, { autoAlpha: 0 }));
  parts.forEach((part) => set(part.glow, { opacity: 0, scale: 0.6 }));
  set(pulse, { autoAlpha: 0 });
  set(beam, { autoAlpha: 0, rotation: -90 });
  yield;

  const tl = gsap.timeline({ paused: true });
  /** the ask types a letter every 30 ms, then it is sent */
  const TYPE = 0.35;
  const typedAt = TYPE + letters * 0.03;
  const SEND = typedAt + 0.3;
  for (const writes of inBar ? typed : askTexts) {
    const n = lettersOf(writes);
    tl.to(writes, { clipPath: SHOWN, duration: n * 0.03, ease: `steps(${n})` }, TYPE);
  }
  tl.to(greet, { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, inBar ? SEND : TYPE - 0.2);
  if (inBar) {
    tl.to(placeholder, { autoAlpha: 0, duration: TOY_STEP, ease: "none" }, TYPE - TOY_STEP);
    tl.to(send, { opacity: 1, duration: 0.2, ease: "power1.out" }, TYPE);
    tl.to(typed, { autoAlpha: 0, duration: 0.12, ease: "power1.in" }, SEND);
    tl.to(send, { opacity: 0.45, duration: 0.2, ease: "power1.out" }, SEND);
    tl.to(reply, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, SEND + 0.1);
    toyRise(tl, ask, SEND + 0.02);
  }
  /** a point of light runs the cable, one way or the other */
  const run = (at: number, back: boolean) => {
    const way = back ? [...line].reverse() : line;
    const RUN = 0.5;
    tl.set(pulse, { x: way[0][0] - line[0][0], y: way[0][1] - line[0][1] }, at);
    tl.to(pulse, { autoAlpha: 1, duration: 0.08, ease: "none" }, at);
    hopAlong(tl, pulse, way, line[0], at, RUN, 0);
    tl.to(pulse, { autoAlpha: 0, duration: 0.08, ease: "none" }, at + RUN - 0.06);
    return at + RUN;
  };
  // the ask goes down the cable to the engine
  const reaches = run(SEND + 0.08, false);

  // Claude runs its steps: each one logs in the window as its part of the engine comes on
  const EVERY = 0.62;
  steps.forEach((step, k) => {
    const at = reaches + 0.05 + k * EVERY;
    toyRise(tl, step.li, at, 0.3);
    tl.to(step.done, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, at + 0.4);
    const part = parts[k];
    tl.to(part.glow, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out", force3D: false }, at);
    tl.to(part.img, { keyframes: [{ y: -8, duration: 0.16, ease: "power2.out" }, { y: 0, duration: 0.34, ease: TOY_EASE.pop }], force3D: false }, at);
    if (step.part === "radar") {
      tl.to(beam, { autoAlpha: 1, duration: 0.1, ease: "none" }, at + 0.1);
      tl.to(beam, { rotation: 270, duration: 0.7, ease: "power1.inOut", force3D: false }, at + 0.1);
      tl.to(beam, { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, at + 0.65);
    }
    // (once its step is done a part stays on, lower)
    tl.to(part.glow, { opacity: 0.6, duration: 0.4, ease: "power1.inOut" }, at + 0.55);
  });

  // the answer comes back up the cable, and Claude says it
  const back = run(reaches + 0.05 + steps.length * EVERY + 0.05, true);
  toyRise(tl, says, back + 0.05, 0.35);
  toyRise(tl, plays, back + 0.22, 0.42);
  tl.to(root, { duration: TOY_STEP }, back + 1.1);
  yield;
  return {
    tl,
    cue: 0,
    // the next time it plays, the next question is asked (then the first again)
    next() {
      root.dataset.round = String(((Number(root.dataset.round) || 0) + 1) % rounds);
    },
    cleanup() {
      root.dataset.round = "0";
    },
  };
}

const TAKES: Record<string, (root: HTMLElement) => Steps> = {
  "t-engine": engine,
  "t-journey": journey,
  "t-merge": merge,
  "t-ping": ping,
};

/** The same builder in slices (lp-play-once's `steps`). */
export function* buildToyStorySteps(root: HTMLElement): Steps {
  const take = TAKES[root.dataset.lpStory ?? ""];
  if (!take) throw new Error(`lp-toy: no take for the story "${root.dataset.lpStory}"`);
  // the picture's drawings go on a canvas (lp-toy-canvas.ts): read at rest, before the take writes
  const canvas = toyCanvas(root);
  try {
    const steps = take(root);
    for (;;) {
      const step = steps.next();
      if (step.done) {
        const built = step.value;
        canvas.follow(built.tl);
        return {
          ...built,
          cleanup() {
            canvas.dispose();
            built.cleanup();
          },
        };
      }
      yield;
    }
  } catch (err) {
    canvas.dispose();
    throw err;
  }
}

export function buildToyStory(root: HTMLElement): BuiltStory {
  const steps = buildToyStorySteps(root);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}
