// No "use client" on purpose (as lp-demo-pancake-timeline.ts): reached only through
// LpDemoPlayer's import(), so it stays a lazy chunk with GSAP. Browser-only code runs inside the
// builder alone.
import { gsap } from "@/lib/gsap";

import { clipTo, HIDDEN_CLIP, measureGlyphs, STEP, type BuiltDemo } from "./lp-demo-pancake-timeline";
import { registerTxtPlugin } from "./lp-gsap-txt";

/**
 * The demo window's Claude & Codex view as ONE paused, seek-safe GSAP timeline (founder
 * 2026-10-13: "passe au motion sur claude en utilisant les UIs claude… petit connecteur, qq tool
 * calls, plays… on reste simple mais on donne le waouh"). Same contract as the Pancake view's
 * (frame 0 = the markup = Claude's home; no callbacks; the player seeks it), same story, told in
 * Claude's interface:
 *   0      home: the greeting, the composer with its Pancake connector chip
 *   0.40   the same request types in (30 ms a glyph: it was read once already), then holds
 *   SEND   it lifts into the thread; the greeting leaves; the SAME composer glides down and
 *          becomes the dock
 *   SAY    Claude answers, a word at a time; then one card per tool call, one at a time
 *          ("Reading…" → "Done", "Searching…" → what came back, its number ticking up)
 *   PLAY   the calls fold away; Claude says what it found and the Play is drawn, in Claude's own
 *          interface (a result card, three rows: no Pancake card here)
 *   ASK    Claude's permission prompt; the cursor glides to "Allow once" and presses it
 *   LIVE   the prompt folds into the call it allowed ("Deploying…" → "Live"), the Play's status
 *          goes from Draft to Live, Claude confirms
 * About 10 s. Easing and rules as the Pancake view's.
 */

/** typing: first glyph, then one every 30 ms, and a held beat before send */
const T0 = 0.4;
const DT = 0.03;
const TYPED_HOLD = 0.4;
/** Claude's answer: one word every 45 ms */
const WORD = 0.045;
/** one tool call: how long it "works", and the beat to the next one */
const WORK = 0.5;
const WORK_BEAT = 0.58;
/** where the cursor comes from, as a share of the window (just under its bottom edge) */
const CURSOR_FROM = { x: 0.72, y: 1.04 } as const;

export function buildDemoClaude(view: HTMLElement): BuiltDemo {
  const $ = <T extends Element = HTMLElement>(sel: string): T => {
    const el = view.querySelector<T>(sel);
    if (!el) throw new Error(`demo-claude: ${sel} missing`);
    return el;
  };
  const $$ = <T extends Element = HTMLElement>(sel: string) => Array.from(view.querySelectorAll<T>(sel));

  const app = $(".lp-demowin__capp");
  const greet = $(".lp-demowin__greet");
  const bar = $(".lp-demowin__cbar");
  const barPh = $(".lp-demowin__cbar-ph");
  const barText = $(".lp-demowin__cbar-text");
  const barAsk = $(".lp-demowin__cbar-ask");
  const caret = $(".lp-demowin__cbar .lp-demowin__caret");
  const send = $(".lp-demowin__csend");
  const bubble = $(".lp-demowin__cbubble");
  const says = [1, 2, 3].map((n) => {
    const p = $(`.lp-demowin__csay[data-line="${n}"]`);
    return { p, words: Array.from(p.querySelectorAll<HTMLElement>(".lp-demowin__w")) };
  });
  const toolsBox = $(".lp-demowin__ctools:not(.lp-demowin__ctools--deploy)");
  const deployBox = $(".lp-demowin__ctools--deploy");
  const card3 = (li: HTMLElement) => {
    const num = li.querySelector<HTMLElement>(".lp-demowin__ctool-done b");
    return {
      li,
      doing: li.querySelector<HTMLElement>(".lp-demowin__ctool-doing")!,
      done: li.querySelector<HTMLElement>(".lp-demowin__ctool-done")!,
      num,
      to: num ? Number(num.textContent) || 0 : 0,
    };
  };
  const calls = Array.from(toolsBox.querySelectorAll<HTMLElement>(".lp-demowin__ctool")).map(card3);
  const deploy = card3(deployBox.querySelector<HTMLElement>(".lp-demowin__ctool")!);
  const wrap = $(".lp-demowin__cplay");
  const head = $(".lp-demowin__cplay-h");
  const badgeDraft = $('.lp-demowin__cplay-st > [data-s="draft"]');
  const badgeLive = $('.lp-demowin__cplay-st > [data-s="live"]');
  const rows = $$(".lp-demowin__cplay-rows li");
  const perm = $(".lp-demowin__perm");
  const allow = $(".lp-demowin__perm-btn--go");
  const cursor = view.querySelector<HTMLElement>(".lp-demowin__cursor");
  const cursorArrow = cursor?.querySelector<SVGElement>("svg") ?? null;

  /* ── geometry, on the rest layout ── */
  const cs = getComputedStyle(view);
  const px = (prop: string, fallback: number) => {
    const v = parseFloat(cs.getPropertyValue(prop));
    return Number.isFinite(v) ? v : fallback;
  };
  const barTop = px("--ck-bar-top", bar.offsetTop);
  const barH = px("--ck-bar-h", bar.offsetHeight);
  const dockTop = px("--ck-dock-top", barTop);
  const dockH = px("--ck-dock-h", 58);

  const appBox = app.getBoundingClientRect();
  const scale = app.offsetWidth ? appBox.width / app.offsetWidth : 1;
  const at = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: (r.left - appBox.left) / scale, y: (r.top - appBox.top) / scale, w: r.width / scale, h: r.height / scale };
  };
  const mt = (el: Element) => parseFloat(getComputedStyle(el).marginTop) || 0;

  const glyphs = measureGlyphs(barText);
  const typedAt = at(barText);
  const bubbleAt = at(bubble);
  const fromX = typedAt.x - bubbleAt.x;
  const fromY = typedAt.y - bubbleAt.y;

  // the three calls fold away when the Play comes; the prompt folds when it is answered and
  // the call it allowed takes its place
  const toolsH = toolsBox.offsetHeight;
  const toolsGap = mt(toolsBox);
  const permH = perm.offsetHeight;
  const permGap = mt(perm);
  const deployH = deployBox.offsetHeight;
  const deployGap = mt(deployBox);

  // the cursor's target: "Allow once", where it sits once the calls have folded away and
  // before the deploy call exists (it is laid out collapsed until then)
  const allowAt = at(allow);
  const tx = allowAt.x + allowAt.w * 0.6;
  const ty = allowAt.y + allowAt.h * 0.6 - (toolsH + toolsGap);
  const ex = app.offsetWidth * CURSOR_FROM.x;
  const ey = app.offsetHeight * CURSOR_FROM.y;

  registerTxtPlugin();

  const tl = gsap.timeline({ paused: true });
  const step = (targets: gsap.TweenTarget, vars: gsap.TweenVars, t: number) =>
    tl.to(targets, { ...vars, duration: STEP, ease: "none" }, t);
  const tick = (el: Element, to: number, t: number, every = 0.05) => {
    for (let i = 1; i <= 6; i++) step(el, { txt: String(Math.round((to * i) / 6)) }, t + (i - 1) * every);
  };
  /** an answer streams in: its paragraph shows, then one word after the other */
  const stream = (say: (typeof says)[number], t: number) => {
    step(say.p, { autoAlpha: 1 }, t);
    say.words.forEach((w, k) => tl.to(w, { opacity: 1, duration: 0.16, ease: "power1.out" }, t + k * WORD));
    return t + Math.max(say.words.length - 1, 0) * WORD + 0.16;
  };

  /* ── frame 0 = Claude's home (= the markup) ── */
  gsap.set(greet, { autoAlpha: 1, y: 0 });
  gsap.set(bar, { top: barTop, height: barH });
  gsap.set(barPh, { autoAlpha: 1 });
  gsap.set(barText, { clipPath: HIDDEN_CLIP });
  gsap.set(barAsk, { autoAlpha: 0 });
  gsap.set(caret, { x: 0, y: 0, opacity: 1 });
  gsap.set(send, { opacity: 0.45, scale: 1 });
  gsap.set(bubble, { autoAlpha: 0, x: fromX, y: fromY });
  for (const say of says) {
    gsap.set(say.p, { autoAlpha: 0 });
    gsap.set(say.words, { opacity: 0 });
  }
  gsap.set(toolsBox, { autoAlpha: 1, height: toolsH, marginTop: toolsGap });
  for (const c of [...calls, deploy]) {
    gsap.set(c.li, { autoAlpha: 0, y: 6 });
    gsap.set(c.doing, { autoAlpha: 1 });
    gsap.set(c.done, { autoAlpha: 0 });
    if (c.num) gsap.set(c.num, { txt: "0" });
  }
  gsap.set(wrap, { autoAlpha: 0, y: 16 });
  gsap.set(head, { autoAlpha: 0, y: 4 });
  gsap.set(badgeDraft, { autoAlpha: 1 });
  gsap.set(badgeLive, { autoAlpha: 0, scale: 0.9 });
  gsap.set(rows, { autoAlpha: 0, y: 5 });
  gsap.set(perm, { autoAlpha: 0, y: 10, height: permH, marginTop: permGap });
  gsap.set(allow, { scale: 1 });
  // the deploy call takes no room until the prompt is answered
  gsap.set(deployBox, { autoAlpha: 1, height: 0, marginTop: 0 });
  if (cursor) gsap.set(cursor, { x: ex, y: ey, opacity: 0 });
  if (cursorArrow) gsap.set(cursorArrow, { scale: 1, transformOrigin: "2px 2px" });

  /* ── 1 · the request types into the composer ── */
  step(barPh, { autoAlpha: 0 }, T0 - STEP);
  tl.to(send, { opacity: 1, duration: 0.2, ease: "power2.out" }, T0);
  glyphs.forEach((g, i) => {
    const t = T0 + i * DT;
    step(barText, { clipPath: clipTo(g) }, t);
    step(caret, { x: g.right + 1, y: g.top }, t);
  });
  const TYPED = T0 + Math.max(glyphs.length - 1, 0) * DT;
  step(barText, { clipPath: "none" }, TYPED + 0.08);

  /* ── 2 · press, SEND: the request lifts into the thread, the composer becomes the dock ── */
  const PRESS = TYPED + TYPED_HOLD;
  tl.to(
    send,
    {
      keyframes: [
        { scale: 0.86, duration: 0.08, ease: "power2.out" },
        { scale: 1, duration: 0.3, ease: "back.out(2)" },
      ],
    },
    PRESS,
  );
  const SEND = PRESS + 0.1;
  step(caret, { opacity: 0 }, SEND);
  step(barText, { clipPath: HIDDEN_CLIP }, SEND);
  tl.to(send, { opacity: 0.45, duration: 0.2, ease: "power1.out" }, SEND);
  tl.to(bubble, { autoAlpha: 1, duration: 0.14, ease: "power1.out" }, SEND);
  tl.to(bubble, { x: 0, y: 0, duration: 0.6, ease: "power3.out" }, SEND);
  tl.to(greet, { autoAlpha: 0, y: -10, duration: 0.2, ease: "power2.in" }, SEND);
  tl.to(bar, { top: dockTop, height: dockH, duration: 0.62, ease: "power3.inOut" }, SEND + 0.04);
  tl.to(barAsk, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, SEND + 0.5);

  /* ── 3 · Claude answers, then one card per tool call ── */
  const SAY = SEND + 0.6;
  const said = stream(says[0], SAY);
  const TOOLS = said + 0.2;
  let worked = TOOLS;
  calls.forEach((c, k) => {
    const start = TOOLS + k * WORK_BEAT;
    const done = start + WORK;
    tl.to(c.li, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power3.out" }, start);
    tl.to(c.doing, { autoAlpha: 0, duration: 0.1, ease: "power1.in" }, done);
    tl.to(c.done, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, done + 0.06);
    if (c.num) tick(c.num, c.to, done + 0.06);
    worked = done + 0.31;
  });

  /* ── 4 · the calls fold away; what Claude found, and the Play ── */
  const PLAY = worked + 0.45;
  tl.to(toolsBox, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, PLAY);
  tl.to(toolsBox, { height: 0, marginTop: 0, duration: 0.5, ease: "power3.inOut" }, PLAY + 0.05);
  const found = stream(says[1], PLAY + 0.25);
  tl.to(wrap, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, found - 0.1);
  tl.to(wrap, { y: 0, duration: 0.6, ease: "power3.out" }, found - 0.1);
  tl.to(head, { autoAlpha: 1, y: 0, duration: 0.32, ease: "power3.out" }, found + 0.05);
  let drawn = found + 0.25;
  rows.forEach((r, k) => {
    const t = found + 0.25 + k * 0.13;
    tl.to(r, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out" }, t);
    drawn = t + 0.3;
  });

  /* ── 5 · Claude asks before it changes anything; the cursor allows it ── */
  const ASK = drawn + 0.2;
  tl.to(perm, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, ASK);
  tl.to(perm, { y: 0, duration: 0.45, ease: "back.out(1.4)" }, ASK);
  const CUR = ASK + 0.4;
  const CLICK = CUR + 0.68;
  if (cursor) {
    tl.to(cursor, { opacity: 1, duration: 0.15, ease: "power1.out" }, CUR);
    tl.to(cursor, { x: tx, y: ty, duration: 0.6, ease: "power2.inOut" }, CUR);
  }
  if (cursorArrow) {
    tl.to(
      cursorArrow,
      {
        keyframes: [
          { scale: 0.86, duration: 0.08, ease: "power2.out" },
          { scale: 1, duration: 0.2, ease: "power2.out" },
        ],
      },
      CLICK,
    );
  }
  tl.to(
    allow,
    {
      keyframes: [
        { scale: 0.95, duration: 0.08, ease: "power2.out" },
        { scale: 1, duration: 0.3, ease: "back.out(1.6)" },
      ],
    },
    CLICK,
  );

  /* ── 6 · allowed: the prompt folds into the call, the Play goes Live, Claude confirms ── */
  const ALLOWED = CLICK + 0.22;
  if (cursor) tl.to(cursor, { opacity: 0, duration: 0.2, ease: "power1.in" }, ALLOWED + 0.1);
  tl.to(perm, { autoAlpha: 0, duration: 0.18, ease: "power2.in" }, ALLOWED);
  tl.to(perm, { height: 0, marginTop: 0, duration: 0.42, ease: "power3.inOut" }, ALLOWED + 0.05);
  tl.to(deployBox, { height: deployH, marginTop: deployGap, duration: 0.42, ease: "power3.inOut" }, ALLOWED + 0.05);
  tl.to(deploy.li, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power3.out" }, ALLOWED + 0.2);
  const LIVE = ALLOWED + 0.2 + 0.6;
  tl.to(deploy.doing, { autoAlpha: 0, duration: 0.1, ease: "power1.in" }, LIVE);
  tl.to(deploy.done, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, LIVE + 0.06);
  if (deploy.num) tick(deploy.num, deploy.to, LIVE + 0.06);
  tl.to(badgeDraft, { autoAlpha: 0, duration: 0.12, ease: "power1.in" }, LIVE);
  tl.to(badgeLive, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, LIVE + 0.05);
  const END = stream(says[2], LIVE + 0.45);
  // a still beat, so the timeline's end is the finished picture
  tl.to({}, { duration: 0.2 }, Math.max(END, LIVE + 0.9) + 0.1);

  const touched: Element[] = [
    greet, bar, barPh, barText, barAsk, caret, send, bubble, toolsBox, deployBox, wrap, head, badgeDraft,
    badgeLive, perm, allow, ...rows,
    ...says.flatMap((say) => [say.p, ...say.words]),
    ...[...calls, deploy].flatMap((c) => [c.li, c.doing, c.done, ...(c.num ? [c.num] : [])]),
    ...(cursor ? [cursor] : []),
    ...(cursorArrow ? [cursorArrow] : []),
  ];
  return {
    tl,
    cleanup: () => {
      for (const el of touched) if (el.getAttribute("style") === "") el.removeAttribute("style");
    },
  };
}
