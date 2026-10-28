// No "use client": a plain module reached only through LpInfraAnim's loader (kept out of the
// initial bundle, as the step and story builders are).
import { gsap } from "@/lib/gsap";

/**
 * The infra section's timelines (LpInfraAnim.tsx): the build-up played once (below), the scroll
 * version (buildInfraScroll: the three bricks, their details, Pancake) and the leads queue
 * (buildInfraLoop).
 *
 * The infra-first page's diagram build-up. progress(1) = the server markup
 * (restIsEnd); `cue` 0 = the first composed scene, never empty. Frame 0 is set before the
 * timeline exists, every move is a tween or a set (no callbacks), so both seek either way, and
 * cleanup() restores the rest markup's inline styles.
 *
 * Diagram flow (≈2.5 s):
 *   0          cue: the agents, the wire and the fork undrawn, Pancake and its three layers
 *              dimmed, the providers' discs not yet in, the Play switched off
 *   0.25       the agents send (a nudge on each chip)
 *   0.45       the wire draws down into Pancake (no sign-in pill on it since 2026-10-27)
 *   0.85       Pancake lights
 *   1.05       its fork draws down to the three layers: the stem, then the arms out and down
 *   1.3        the brain, the data and the tools light up, in reading order: the brain's rows
 *              settle, the providers' discs pop in, the Play switches on and the lead comes up
 *              (no signal chips and no status line since 2026-10-26: "Trop de texte")
 */

type Built = { tl: gsap.core.Timeline; cleanup: () => void; cue: number };

/** the Play's switch, off and on (ink-50 → pink-30, foundation.css) */
const TOGGLE_OFF = "#ddcfcd";
const TOGGLE_ON = "#ff7aa0";

/** Pancake's fork drawn in three clips of its arms (a stem draws by scaleY): nothing, the bar out
    from the middle (the top band, its corners included), the whole, with the drops down.
    Polygons, not inset(): the browser shortens an inset() whose sides are equal ("inset(0% 50%
    40%)"), and GSAP, pairing the numbers in order, would then open one side at once */
const ARMS_NONE = "polygon(50% 0%, 50% 0%, 50% 60%, 50% 60%)";
const ARMS_BAR = "polygon(0% 0%, 100% 0%, 100% 60%, 0% 60%)";
const ARMS_ALL = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

function all<E extends Element = HTMLElement>(root: Element, sel: string) {
  return Array.from(root.querySelectorAll<E>(sel));
}

function one<E extends Element = HTMLElement>(root: Element, sel: string) {
  const el = root.querySelector<E>(sel);
  if (!el) throw new Error(`infra timeline: ${sel} is missing`);
  return el;
}

/** cleanup(): every element the builder styled gets its rest inline style back */
function restStyles(touched: Element[]) {
  const styles = touched.map((el) => el.getAttribute("style"));
  return () =>
    touched.forEach((el, i) => {
      const style = styles[i];
      if (style === null) el.removeAttribute("style");
      else el.setAttribute("style", style);
    });
}

export function buildInfraFlow(root: HTMLElement): Built {
  const chips = all(root, ".lp-infra__agent");
  const line = one(root, ".lp-infra__line");
  const brand = one(root, ".lp-infra__brand");
  const stem = one(root, ".lp-infra__fork-stem");
  const arms = one(root, ".lp-infra__fork-arms");
  const parts = all(root, ".lp-infra__part");
  const rows = all(root, ".lp-infra__mem-row");
  const discs = all(root, ".lp-infra__disc");
  const toggle = one(root, ".lp-infra__toggle");
  const knob = one(root, ".lp-infra__toggle-knob");
  const lead = one(root, ".lp-infra__lead");

  const cleanup = restStyles([...chips, line, brand, stem, arms, ...parts, ...rows, ...discs, toggle, knob, lead]);

  /* ── frame 0 = cue ── */
  gsap.set(line, { scaleY: 0, transformOrigin: "50% 0%" });
  gsap.set(brand, { autoAlpha: 0.35, scale: 0.94, transformOrigin: "50% 50%" });
  gsap.set(stem, { scaleY: 0, transformOrigin: "50% 0%" });
  gsap.set(arms, { clipPath: ARMS_NONE });
  gsap.set(parts, { autoAlpha: 0.4, y: 8 });
  gsap.set(rows, { autoAlpha: 0.3, x: -6 });
  gsap.set(discs, { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" });
  gsap.set(toggle, { backgroundColor: TOGGLE_OFF });
  gsap.set(knob, { x: 0 });
  gsap.set(lead, { autoAlpha: 0.3 });
  gsap.set(lead, { y: 4 });

  const tl = gsap.timeline({ paused: true });

  // the agents send
  tl.to(chips, { scale: 1.04, duration: 0.14, ease: "power2.out", stagger: 0.06, yoyo: true, repeat: 1 }, 0.25);

  // the wire draws down into Pancake (scaleY on a 1 px box)
  tl.to(line, { scaleY: 1, duration: 0.45, ease: "power2.inOut" }, 0.45);

  // Pancake lights
  tl.to(brand, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 0.85);

  // its fork draws down to the three layers: the stem, the arms out, then down
  tl.to(stem, { scaleY: 1, duration: 0.3, ease: "power2.inOut" }, 1.05);
  tl.to(arms, { clipPath: ARMS_BAR, duration: 0.22, ease: "power2.out" }, 1.18);
  tl.to(arms, { clipPath: ARMS_ALL, duration: 0.12, ease: "power1.out" }, 1.4);

  // the brain, the data and the tools
  tl.to(parts, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.18 }, 1.3);
  tl.to(rows, { autoAlpha: 1, x: 0, duration: 0.3, ease: "power2.out", stagger: 0.1 }, 1.4);
  tl.to(discs, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)", stagger: 0.06 }, 1.6);

  // the Play switches on, then the lead it found comes up for approval
  tl.to(knob, { x: 12, duration: 0.25, ease: "power2.inOut" }, 1.9);
  tl.to(toggle, { backgroundColor: TOGGLE_ON, duration: 0.25, ease: "power1.inOut" }, 1.9);
  tl.to(lead, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, 2.2);

  return { tl, cleanup, cue: 0 };
}

/* ── the scroll version: the three bricks, their pieces, Pancake ─────────────────────────────────
   Founder 2026-10-26: "Your agent needs 3 things to sell", "show that pancake brings all 3 of them
   when scrolling … some components that are spread in the hero and end up as components from an
   UI as the scroll goes", "The reproduction should be PERFECT, the flow supersmooth every
   movement well calibrated". 2026-10-27, on the next versions: "way more juicy and spread accross
   the page … the tools a bit everywhere that go in 3 bucjets and unified in pancake", "des
   tailles differentes", "pas oblige de spread que des logos partout", "Les petits ronds peuvent
   etre des ronds imparfaits un peu comme les pancake du design system", "pas assez progressif et
   un peu brutal", then "Comment BCP plus insister sur les 3 briques CONTEXT / DATA / TOOLS ? Je
   les trouve anecdotiques du coup a cause de tous les logos … quitte a les faire arriver en
   premier puis faire arriver les petits details que sont les logos icp etc" and "Remove the
   'Pancake brings all 3.'".

   So the scroll tells it in three moves, the bricks first:
   1. the three bricks come up one after another, large and a little apart, under the heading and
      your agent, each holding only its word, large: Context, Data, Tools (founder 2026-10-27:
      "Peut etre que CONTEXT DATA TOOLS doit prendre toute la place au debut dans les encadres
      puis ouvrir la fenetre ?"; set as the steps' big numerals and Mobbin's Tines values cards,
      after "Not beautiful, get inspired by top designs" on a scaled-up badge); then each window
      opens: the word shrinks into its badge, the title comes up and the white picture opens from
      its centre, empty;
   2. then the pieces of a company's go-to-market pop up all over the screen, in many sizes
      (LpInfra BITS: the brain's notes and sections, the providers' marks and "30+", the Play's
      signals, the Play, its switch, Tamsin and the CRMs; Mobbin: Front's and Tines' integration
      heroes, Antimetal's sizes for depth) and each flies along a curve, height first and then
      across, exactly onto its own place in its brick's picture (data-fill on both), growing or
      shrinking to that place's size, which then takes over: nothing lands "somewhere in the
      card" (founder 2026-10-27: "mieux flecher chacun de ces elements vers sa place finale dans
      la card la on n amene pas chaque objet dans sa position finale on triche un peu");
   3. Pancake comes up over the bricks, branches down to all three and the wire runs from it up to
      your agent. The bricks stay where they filled, a size up and spread over the page (founder
      2026-10-28, on the bricks closing up into a platform as a dotted canvas came in: "je prefere
      sans le resserrement … je ne veux pas du background point … je trouve ca bien que ca occupe
      plus d espace").

   One timeline of length 1, scrubbed by the smoothed scroll (LpInfraAnim), which starts it as
   the stage's top comes 45% down the window, before the pin, so something moves from the first
   notch on:
     0     – .18   the bricks come up, each word filling its brick (.1 each, .04 apart)
     .18   – .33   the windows open, left to right (.09 each, .03 apart)
     .28   – .66   the details pop up and fly in, brick by brick in reading order, overlapping
     .70   – .76   Pancake comes up
     .75   – .86   its fork draws down to the bricks: the stem, the arms out, then down
     .86   – .92   the wire, from Pancake up to the agent
     .92   – 1     hold
   progress(1) = the server markup, the details gone into their bricks. Built from the layout
   (where each piece is and where its brick's picture is): LpInfraAnim builds it again when the
   window changes. Only transforms, opacity and the fork's clip. */

const BUCKETS = ["context", "data", "tools"] as const;
type Bucket = (typeof BUCKETS)[number];
/** when each brick's details pop up: the first one, then one every `gap` */
const WAVE: Record<Bucket, { start: number; gap: number }> = {
  context: { start: 0.28, gap: 0.024 },
  data: { start: 0.32, gap: 0.02 },
  tools: { start: 0.36, gap: 0.028 },
};
/** a detail popping up, waiting, flying in */
const POP = 0.035;
const WAIT = 0.015;
const FLIGHT = 0.13;
/** the windows open from .18, one every .03 */
const OPEN = { at: 0.18, gap: 0.03, duration: 0.09 } as const;
/** the hand-over from a piece to its place */
const SWAP = 0.012;

export function buildInfraScroll(stage: HTMLElement): { tl: gsap.core.Timeline; cleanup: () => void } {
  const card = one(stage, ".lp-infra__card");
  const parts = all(card, ".lp-infra__part");
  if (parts.length !== BUCKETS.length) throw new Error("infra scroll: three bricks expected");
  const pics = parts.map((part) => one(part, ".lp-infra__pic"));
  const words = parts.map((part) => one(part, ".lp-infra__part-word"));
  const badges = parts.map((part) => one(part, ".lp-infra__part-name"));
  const titles = parts.map((part) => one(part, ".lp-infra__part-title"));
  const bits = all(card, ".lp-infra__bit");
  // every place in the bricks' pictures, each named after the piece that lands on it
  const slots = all(card, ".lp-infra__parts [data-fill]");
  const slotOf = new Map(slots.map((el) => [el.dataset.fill, el]));
  const brand = one(card, ".lp-infra__brand");
  const stem = one(card, ".lp-infra__fork-stem");
  const arms = one(card, ".lp-infra__fork-arms");
  const line = one(card, ".lp-infra__line");

  const cleanup = restStyles([...parts, ...pics, ...words, ...badges, ...titles, ...bits, ...slots, brand, stem, arms, line]);

  /* ── measured on the markup (screen px; the card may be scaled to fit the window, and the
     bricks' row is a size up in it, infra.css --lp-infra-zoom). The bricks never move once up:
     every place is where the markup has it ── */
  const fit = card.getBoundingClientRect().width / card.offsetWidth || 1;
  const zoom = parts[0].getBoundingClientRect().width / (parts[0].offsetWidth * fit) || 1;
  const centre = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  // where each piece lands and how big it is there: centred on its place, at its place's size.
  // The notes, the Play, Tamsin, the signals and the sections are built as their places (infra.css):
  // the first three are given their place's width (plus their own extra padding), and all of them
  // land at the bricks' size up. The marks, "30+" and the switch are scaled to their place's width.
  const padX = (el: Element) => {
    const cs = getComputedStyle(el);
    return parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
  };
  const landings = new Map(
    bits.map((bit) => {
      const slot = slotOf.get(bit.dataset.fill);
      if (!slot) throw new Error(`infra scroll: no place for ${bit.dataset.fill}`);
      // Tamsin lands on her row (the list's hairline comes with her)
      const place = slot.querySelector<HTMLElement>(".lp-infra__lead") ?? slot;
      if (bit.matches(".lp-infra__bit--row, .lp-infra__bit--play, .lp-infra__bit--lead")) {
        const borderBox = getComputedStyle(bit).boxSizing === "border-box";
        gsap.set(bit, { width: place.offsetWidth - padX(place) + (borderBox ? padX(bit) : 0) });
      }
      const built = bit.matches(".lp-infra__bit--row, .lp-infra__bit--play, .lp-infra__bit--lead, .lp-infra__bit--signal, .lp-infra__bit--badge");
      const k = built ? zoom : place.getBoundingClientRect().width / (bit.offsetWidth * fit);
      const c = centre(place);
      return [bit, { slot, k, x: c.x, y: c.y }];
    }),
  );
  // each big word goes into its badge: where the badge is from the word (in the brick's own px,
  // under the card's fit and the row's size up), and how much smaller
  const intos = parts.map((_, i) => {
    const wc = centre(words[i]);
    const bc = centre(badges[i]);
    return {
      x: (bc.x - wc.x) / (fit * zoom),
      y: (bc.y - wc.y) / (fit * zoom),
      scale: badges[i].offsetHeight / Math.max(1, words[i].offsetHeight),
    };
  });
  // the windows open from their centre, with the pictures' own corners
  const round = getComputedStyle(pics[0]).borderTopLeftRadius || "16px";
  const shut = `inset(50% 50% 50% 50% round ${round})`;
  const open = `inset(0% 0% 0% 0% round ${round})`;

  /* ── frame 0: the heading and your agent; no brick yet, no piece, no Pancake ── */
  parts.forEach((part, i) => {
    gsap.set(part, { autoAlpha: 0, y: 80, scale: 0.94, transformOrigin: "50% 50%" });
    gsap.set(words[i], { autoAlpha: 1, transformOrigin: "50% 50%" });
    gsap.set(badges[i], { autoAlpha: 0, scale: 0.92, transformOrigin: "0% 50%" });
    gsap.set(titles[i], { autoAlpha: 0, y: 8 });
    gsap.set(pics[i], { clipPath: shut });
  });
  for (const bit of bits) {
    const s = Number(bit.dataset.s) || 1;
    gsap.set(bit, {
      autoAlpha: 0,
      xPercent: -50,
      yPercent: -50,
      scale: s * 0.4,
      rotation: Number(bit.dataset.r) || 0,
      transformOrigin: "50% 50%",
    });
  }
  gsap.set(slots, { autoAlpha: 0 });
  gsap.set(brand, { autoAlpha: 0, y: 12, scale: 0.92, transformOrigin: "50% 50%" });
  gsap.set(stem, { scaleY: 0, transformOrigin: "50% 0%" });
  gsap.set(arms, { clipPath: ARMS_NONE });
  gsap.set(line, { scaleY: 0, transformOrigin: "50% 100%" });

  const tl = gsap.timeline({ paused: true });

  /* ── 1. the bricks come up, one after another, each on its word; then the windows open: the
     word goes into its badge, the title comes up, the picture opens ── */
  parts.forEach((part, i) => {
    tl.to(part, { autoAlpha: 1, duration: 0.06, ease: "power1.out" }, i * 0.04);
    tl.to(part, { y: 0, scale: 1, duration: 0.1, ease: "power3.out" }, i * 0.04);
    const t = OPEN.at + i * OPEN.gap;
    const into = intos[i];
    tl.to(words[i], { x: into.x, y: into.y, scale: into.scale, duration: OPEN.duration, ease: "power3.inOut" }, t);
    // the word is gone before the badge shows: never both at once
    tl.to(words[i], { autoAlpha: 0, duration: OPEN.duration * 0.35, ease: "power1.in" }, t + OPEN.duration * 0.4);
    tl.to(badges[i], { autoAlpha: 1, scale: 1, duration: OPEN.duration * 0.3, ease: "power2.out" }, t + OPEN.duration * 0.7);
    tl.to(pics[i], { clipPath: open, duration: OPEN.duration, ease: "power2.out" }, t + 0.015);
    tl.to(titles[i], { autoAlpha: 1, y: 0, duration: 0.05, ease: "power2.out" }, t + 0.05);
  });

  /* ── 2. the pieces pop up and fly each onto its place, growing or shrinking to its size; on
     arrival the place takes over (it looks the same). Per brick: the Play first (its switch lands
     in it), the nearest next, Tamsin last ── */
  BUCKETS.forEach((to) => {
    const flights = bits
      .filter((bit) => bit.dataset.to === to)
      .map((bit) => {
        const land = landings.get(bit)!;
        const c = centre(bit);
        return { bit, land, dx: (land.x - c.x) / fit, dy: (land.y - c.y) / fit, s: Number(bit.dataset.s) || 1 };
      })
      .sort((p, q) => {
        const rank = (b: HTMLElement) => (b.dataset.fill === "play" ? -1 : "last" in b.dataset ? 1 : 0);
        return rank(p.bit) - rank(q.bit) || Math.hypot(p.dx, p.dy) - Math.hypot(q.dx, q.dy);
      });
    flights.forEach(({ bit, land, dx, dy, s }, k) => {
      const t = WAVE[to].start + k * WAVE[to].gap;
      const go = t + POP + WAIT;
      const end = go + FLIGHT;
      const odd = k % 2 === 1;
      tl.to(bit, { autoAlpha: 1, scale: s, duration: POP, ease: "back.out(1.7)" }, t);
      // height first, then across, and slowing into the place: the curve, a landing, not a hit
      tl.to(bit, { y: dy, duration: FLIGHT, ease: odd ? "power2.out" : "power3.out" }, go);
      tl.to(bit, { x: dx, duration: FLIGHT, ease: odd ? "sine.inOut" : "power2.inOut" }, go);
      tl.to(bit, { scale: land.k, rotation: 0, duration: FLIGHT, ease: "power2.inOut" }, go);
      // the hand-over, once the piece sits on its place at its size: the place shows, the piece
      // goes (only its card's shadow differs)
      tl.to(land.slot, { autoAlpha: 1, duration: SWAP, ease: "none" }, end);
      tl.to(bit, { autoAlpha: 0, duration: SWAP, ease: "none" }, end + SWAP * 0.3);
    });
  });

  /* ── 3. Pancake comes up over the bricks, its fork draws down to all three (the stem, the arms
     out, then down), and the wire runs from it up to your agent ── */
  tl.to(brand, { autoAlpha: 1, y: 0, scale: 1, duration: 0.06, ease: "back.out(1.6)" }, 0.7);
  tl.to(stem, { scaleY: 1, duration: 0.06, ease: "power2.inOut" }, 0.75);
  tl.to(arms, { clipPath: ARMS_BAR, duration: 0.05, ease: "power2.out" }, 0.78);
  tl.to(arms, { clipPath: ARMS_ALL, duration: 0.03, ease: "power1.out" }, 0.83);
  tl.to(line, { scaleY: 1, duration: 0.06, ease: "power1.inOut" }, 0.86);
  tl.to({}, { duration: 0.08 }, 0.92);

  return { tl, cleanup };
}

/* ── after the build-up: the leads queue ─────────────────────────────────────────────────────────
   Founder 2026-10-26: "Un peu de dynamisme. Un peu de juice!!!", then on the first passes
   (ambient loops, floating notes, beams, rings): "Ton animation elle fait molle et tres vibe codee
   dude", "Peut etre qu il faut faire plus simple comme animation !" and "nothing should look vibe
   coded / everything should be inspired from our design system OR from a best in class component
   taken from mobbin". So the diagram rests on its end picture like every animated card of the
   page, and only the product keeps working where it would: the Play's leads come up for approval
   one after another (Mobbin: Antimetal's "Needs your decision" cards, Approve → done), 3 s each:
     0      the lead is up, "Approve" in pink
     1.2    the press, then a green "Approved"
     2.3    the lead slides out, the next one comes up with its pink button
   LpInfraAnim builds it once the build-up is done, plays it while the card is on screen and the
   tab visible, and never under reduced motion. cleanup() gives back the build-up's end picture. */

/** colours the queue tweens (foundation.css: pink-30, green-10) */
const PINK_30 = "#ff7aa0";
const GREEN_10 = "#ceead5";
/** one lead */
const BEAT = 3;

export function buildInfraLoop(root: HTMLElement): { tl: gsap.core.Timeline; cleanup: () => void } {
  const leads = all(root, ".lp-infra__lead");
  const buttons = leads.map((lead) => ({
    btn: one(lead, ".lp-infra__approve"),
    todo: one(lead, ".lp-infra__approve-do"),
    done: one(lead, ".lp-infra__approve-ok"),
  }));
  if (leads.length < 2) throw new Error("infra loop: the queue needs two leads");

  const cleanup = restStyles([...leads, ...buttons.flatMap((b) => [b.btn, b.todo, b.done])]);

  /* the starting picture = the build-up's end: the first lead up with its pink button */
  gsap.set(leads, { autoAlpha: 0, y: 0 });
  gsap.set(leads[0], { autoAlpha: 1 });
  for (const b of buttons) {
    gsap.set(b.btn, { backgroundColor: PINK_30, scale: 1 });
    gsap.set(b.todo, { opacity: 1 });
    gsap.set(b.done, { opacity: 0 });
  }

  const tl = gsap.timeline({ paused: true, repeat: -1 });
  leads.forEach((lead, k) => {
    const t = k * BEAT;
    const b = buttons[k];
    tl.to(
      b.btn,
      {
        keyframes: [
          { scale: 0.92, duration: 0.08, ease: "power2.out" },
          { scale: 1, duration: 0.3, ease: "back.out(2.4)" },
        ],
      },
      t + 1.2,
    );
    tl.to(b.btn, { backgroundColor: GREEN_10, duration: 0.15, ease: "power1.out" }, t + 1.25);
    tl.to(b.todo, { opacity: 0, duration: 0.1, ease: "none" }, t + 1.25);
    tl.to(b.done, { opacity: 1, duration: 0.12, ease: "none" }, t + 1.3);

    const n = (k + 1) % leads.length;
    tl.to(lead, { autoAlpha: 0, y: -8, duration: 0.22, ease: "power2.in" }, t + 2.3);
    tl.set(buttons[n].btn, { backgroundColor: PINK_30, scale: 1 }, t + 2.3);
    tl.set(buttons[n].todo, { opacity: 1 }, t + 2.3);
    tl.set(buttons[n].done, { opacity: 0 }, t + 2.3);
    tl.fromTo(leads[n], { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.32, ease: "power3.out", immediateRender: false }, t + 2.42);
  });
  // the last lead's full beat before the repeat
  tl.to({}, { duration: 0.01 }, leads.length * BEAT - 0.01);

  return { tl, cleanup };
}
