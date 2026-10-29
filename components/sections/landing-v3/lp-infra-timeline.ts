// No "use client": a plain module reached only through LpInfraAnim's loader (kept out of the
// initial bundle, as the step and story builders are).
import { gsap } from "@/lib/gsap";

/**
 * The infra section's timelines (LpInfraAnim.tsx): the build-up played once (below), the scroll
 * version (buildInfraScroll: the three bricks, their contents, Pancake) and the leads queue
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
 *   0.45       Pancake lights
 *   0.85       every cable at once (2026-10-28): the wire down from the agents into Pancake (no
 *              sign-in pill on it since 2026-10-27) and its fork down to the three layers, the
 *              stem, then the arms out and down
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
  return () => {
    // GSAP keeps each element's transform in a cache of its own, which the style attribute does
    // not reset: clear it first, or the next build's tweens start from this timeline's values (a
    // rebuild after a resize left the bricks' words at their badge size, the windows shut;
    // founder 2026-10-28: "on a reduit la taille de context / data / tool ou quoi")
    gsap.set(touched, { clearProps: "all" });
    touched.forEach((el, i) => {
      const style = styles[i];
      if (style === null) el.removeAttribute("style");
      else el.setAttribute("style", style);
    });
  };
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

  // Pancake lights
  tl.to(brand, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 0.45);

  // every cable at once (founder 2026-10-28: "Je dessinerai aussi les cables en meme temps"): the
  // wire from your agent into Pancake (scaleY on a 1 px box) and its fork down to the three
  // layers, the stem, the arms out, then down
  tl.to(line, { scaleY: 1, duration: 0.4, ease: "power2.inOut" }, 0.85);
  tl.to(stem, { scaleY: 1, duration: 0.3, ease: "power2.inOut" }, 0.85);
  tl.to(arms, { clipPath: ARMS_BAR, duration: 0.22, ease: "power2.out" }, 0.98);
  tl.to(arms, { clipPath: ARMS_ALL, duration: 0.12, ease: "power1.out" }, 1.2);

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
   2. then each brick's contents appear in place, top to bottom, once its window is open, and
      the Play switches on (founder 2026-10-28, on the pieces that flew in from all over the page:
      "je ferais pas arriver tout de tous les cotes mais je ferai apparaitre tout a l interieur de
      maniere simple et best practice comme le font les hottest companies");
   3. Pancake comes up over the bricks, and every cable draws at once: the fork down to the three
      bricks and the wire up to your agent (founder, the same day: "Je dessinerai aussi les cables
      en meme temps car pas de raison de faire la partie du haut apres la partie du bas"). The
      bricks stay where they filled, a size up and spread over the page (founder 2026-10-28, on
      the bricks closing up into a platform as a dotted canvas came in: "je prefere sans le
      resserrement … je ne veux pas du background point … je trouve ca bien que ca occupe plus d
      espace").

   One timeline of length 1, scrubbed by the smoothed scroll (LpInfraAnim), which starts it as
   the stage's top comes 45% down the window, before the pin, so something moves from the first
   notch on:
     0     – .18   the bricks come up, each word filling its brick (.1 each, .04 apart)
     .18   – .33   the windows open, left to right (.09 each, .03 apart)
     .28   – .55   each brick's contents come up in place, top to bottom, brick by brick
     .56   – .60   the Play switches on
     .64   – .70   Pancake comes up
     .70   – .82   every cable at once: the stem and the wire up together, then the arms out
                   and down
     .82   – 1     hold
   progress(1) = the server markup. Built from the layout (where each word's badge is):
   LpInfraAnim builds it again when the window changes. Only transforms, opacity, the fork's clip
   and the switch's colour. */

const BUCKETS = ["context", "data", "tools"] as const;
/** the windows open from .18, one every .03 */
const OPEN = { at: 0.18, gap: 0.03, duration: 0.09 } as const;
/** each brick's contents: the first at `start`, one more every `gap`, each `duration` long */
const FILL = { start: 0.28, brick: 0.06, gap: 0.02, duration: 0.07 } as const;
/** the Play's switch turns on once the Tools brick is full */
const SWITCH = { at: 0.56, duration: 0.04 } as const;
/** Pancake, then every cable at once */
const BRAND = 0.64;
const CABLES = 0.7;

export function buildInfraScroll(stage: HTMLElement): { tl: gsap.core.Timeline; cleanup: () => void } {
  const card = one(stage, ".lp-infra__card");
  const parts = all(card, ".lp-infra__part");
  if (parts.length !== BUCKETS.length) throw new Error("infra scroll: three bricks expected");
  const pics = parts.map((part) => one(part, ".lp-infra__pic"));
  const words = parts.map((part) => one(part, ".lp-infra__part-word"));
  const badges = parts.map((part) => one(part, ".lp-infra__part-name"));
  const titles = parts.map((part) => one(part, ".lp-infra__part-title"));
  // what each brick's picture holds, top to bottom (the switch comes with its Play)
  const fills = all(card, ".lp-infra__parts [data-fill]").filter((el) => !el.matches(".lp-infra__toggle"));
  const toggle = one(card, ".lp-infra__toggle");
  const knob = one(card, ".lp-infra__toggle-knob");
  const brand = one(card, ".lp-infra__brand");
  const stem = one(card, ".lp-infra__fork-stem");
  const arms = one(card, ".lp-infra__fork-arms");
  const line = one(card, ".lp-infra__line");

  const cleanup = restStyles([...parts, ...pics, ...words, ...badges, ...titles, ...fills, toggle, knob, brand, stem, arms, line]);

  /* ── measured on the markup (screen px; the card may be scaled to fit the window, and the
     bricks' row is a size up in it, infra.css --lp-infra-zoom). The bricks never move once up:
     every place is where the markup has it ── */
  const fit = card.getBoundingClientRect().width / card.offsetWidth || 1;
  const zoom = parts[0].getBoundingClientRect().width / (parts[0].offsetWidth * fit) || 1;
  const centre = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
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

  /* ── frame 0: the heading and your agent; no brick yet, nothing in them, no Pancake ── */
  parts.forEach((part, i) => {
    gsap.set(part, { autoAlpha: 0, y: 80, scale: 0.94, transformOrigin: "50% 50%" });
    gsap.set(words[i], { autoAlpha: 1, transformOrigin: "50% 50%" });
    gsap.set(badges[i], { autoAlpha: 0, scale: 0.92, transformOrigin: "0% 50%" });
    gsap.set(titles[i], { autoAlpha: 0, y: 8 });
    gsap.set(pics[i], { clipPath: shut });
  });
  gsap.set(fills, { autoAlpha: 0, y: 10 });
  gsap.set(toggle, { backgroundColor: TOGGLE_OFF });
  gsap.set(knob, { x: 0 });
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

  /* ── 2. each brick's contents come up in place, top to bottom, once its window is open; then
     the Play switches on ── */
  parts.forEach((part, i) => {
    fills
      .filter((el) => part.contains(el))
      .forEach((el, k) => {
        const t = FILL.start + i * FILL.brick + k * FILL.gap;
        tl.to(el, { autoAlpha: 1, y: 0, duration: FILL.duration, ease: "power3.out" }, t);
      });
  });
  tl.to(knob, { x: 12, duration: SWITCH.duration, ease: "power2.inOut" }, SWITCH.at);
  tl.to(toggle, { backgroundColor: TOGGLE_ON, duration: SWITCH.duration, ease: "power1.inOut" }, SWITCH.at);

  /* ── 3. Pancake comes up over the bricks, then every cable draws at once: the stem down and the
     wire up together, the arms out to the side bricks and down ── */
  tl.to(brand, { autoAlpha: 1, y: 0, scale: 1, duration: 0.06, ease: "back.out(1.6)" }, BRAND);
  tl.to(stem, { scaleY: 1, duration: 0.06, ease: "power2.inOut" }, CABLES);
  tl.to(line, { scaleY: 1, duration: 0.06, ease: "power2.inOut" }, CABLES);
  tl.to(arms, { clipPath: ARMS_BAR, duration: 0.05, ease: "power2.out" }, CABLES + 0.02);
  tl.to(arms, { clipPath: ARMS_ALL, duration: 0.04, ease: "power1.out" }, CABLES + 0.07);
  tl.to({}, { duration: 0.18 }, 0.82);

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
