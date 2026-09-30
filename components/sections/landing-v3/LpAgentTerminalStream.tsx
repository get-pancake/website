"use client";

import { useEffect, useRef } from "react";
import type { LayoutCursor, PreparedTextWithSegments } from "@chenglou/pretext";

type Pretext = typeof import("@chenglou/pretext");
type SourceCursor = { paragraph: number; cursor: LayoutCursor };
type Slot = { x: number; width: number };

// Illustrative pseudocode, deliberately not product API calls. The finite
// source is prepared once per font and recycled; the visible history never grows.
// 2026-09-30, AI SEO retired: the three search-intent / useful-answer lines
// became a Play's path (plan who, how, how many → create → run → why they
// fit → your approval). Same count and slots, so the ink cycle is unchanged.
const SOURCE = [
  '// pancake.simulation — illustrative pseudocode. no messages are sent.',
  'const human = { status: "building", focus: "the company" }; const agent = { focus: "bring customers", context: [offer, buyers, voice] };',
  'const offer = { product, problem, proof }; const audience = buyers.filter(matches_offer).sort(by_relevance);',
  'signals.filter(is_relevant).map(signal => ({ problem: signal.need, timing: signal.when, fit: match(offer, signal) }));',
  'for (const signal of buying_signals) { const reason = understand(signal); const next_move = prepare({ reason, offer, voice }); queue_for_review(next_move); }',
  'const first_message = draft({ context, reason: "a real need", tone: voice, length: "short" }); first_message.status = "awaiting review";',
  'const play = plays.plan({ who: "heads of sales at seed-stage SaaS", how: "hiring_for_role", how_many: 50 }); review(play);',
  'const brain = { offer: understand(product), buyers: recognize(audience), voice: learn(style), memory: [] };',
  '// relevance > volume. context > guesswork. useful > loud.',
  'const buying_signal = { problem: "growing team", constraint: "manual work", timing: "this quarter" }; const fit = compare(buying_signal, offer);',
  'outreach.preview = { who: audience.best_fit, why: fit.reason, message: first_message }; outreach.state = "draft";',
  'plays.create(play); const search = plays.run(play); search.steps = ["discover", "enrich", "qualify"]; log(search.research);',
  'while (human.is_building) { refresh(context); notice(signals); prepare(next_move); learn(feedback); }',
  'voice.rules = ["be concrete", "skip the jargon", "sound human"]; const message = rewrite(draft, voice);',
  'if (!useful(message) || !relevant(person, offer)) { return rethink(); } else { queue_for_review(message); }',
  'const context = { offer: product.what, buyers: product.who, proof: product.why, voice: human.style };',
  '// the human runs the company. the agent joins the dots.',
  'const next_customer = problem + timing + fit; const next_move = { context, direction: "help", human_in_the_loop: true };',
  'search.leads.forEach(lead => { lead.why_they_fit = explain(lead.signal, lead.role); queue_for_approval(lead); });',
  'memory.push({ resonated: feedback.yes, missed: feedback.no, changed: feedback.new }); context = refresh(memory);',
  'const tomorrow = { context: a_little_better, next_move: a_little_clearer }; continue_working(tomorrow);',
] as const;

const BEGINNING: SourceCursor = {
  paragraph: 0,
  cursor: { segmentIndex: 0, graphemeIndex: 0 },
};

/** A decorative terminal: one canvas, cached Pretext metrics, bounded history. */
export function LpAgentTerminalStream({ active, paused }: { active: boolean; paused: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ active, paused });
  const synchronizeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    stateRef.current = { active, paused };
    synchronizeRef.current?.();
  }, [active, paused]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const section = host?.closest<HTMLElement>(".lp-agent-lab");
    const context = canvas?.getContext("2d", { alpha: true });
    if (!host || !canvas || !section || !context) return;

    let disposed = false;
    let visible = false;
    let loading = false;
    let ready = false;
    let failed = false;
    let api: Pretext | null = null;
    let paragraphs: PreparedTextWithSegments[] = [];
    let width = 0;
    let height = 0;
    let ratio = 1;
    let fontSize = 0;
    let lineHeight = 0;
    let gutter = 0;
    let font = "";
    let colors: string[] = [];
    let front = BEGINNING;
    let scroll = 0;
    let frame = 0;
    let frameRequest = 0;
    let previousTime = 0;
    let previousPaint = 0;
    let splitRows = 0;
    let hostBounds = host.getBoundingClientRect();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { active: false, x: 0, y: 0, smoothX: 0, smoothY: 0, strength: 0 };

    const moving = () => stateRef.current.active && !stateRef.current.paused
      && visible && !document.hidden && !reduced.matches && ready && !failed;

    function measure() {
      const bounds = host!.getBoundingClientRect();
      hostBounds = bounds;
      if (bounds.width <= 0 || bounds.height <= 0) return;
      const style = getComputedStyle(host!);
      const nextFontSize = parseFloat(style.fontSize);
      const nextFont = `${style.fontWeight} ${nextFontSize}px ${style.fontFamily}`;
      width = bounds.width;
      height = bounds.height;
      // Keep the backing store bounded, including on large Retina displays.
      ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(6_000_000 / (width * height)));
      canvas!.width = Math.max(1, Math.round(width * ratio));
      canvas!.height = Math.max(1, Math.round(height * ratio));
      fontSize = nextFontSize;
      lineHeight = fontSize * 1.65;
      gutter = parseFloat(style.getPropertyValue("--lp-space-4")) * (width > 767 ? 2 : 1);
      colors = ["--lp-page-bg", "--lp-green-20", "--lp-purple-30", "--lp-ink-60"]
        .map(token => style.getPropertyValue(token).trim());
      if (nextFont !== font && api) {
        font = nextFont;
        try {
          paragraphs = SOURCE.map(text => api!.prepareWithSegments(text, font, { whiteSpace: "pre-wrap" }));
        } catch {
          failed = true;
          host!.dataset.engine = "fallback";
        }
      }
      font = nextFont;
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      context!.font = font;
      context!.textBaseline = "top";
      scroll = Math.min(scroll, lineHeight);
    }

    function slotsForRow(y: number): Slot[] {
      const right = width - gutter;
      if (pointer.strength < 0.005) return [{ x: gutter, width: right - gutter }];
      // Test the whole line band, not only its baseline, so tall glyphs cannot
      // cross the cursor. An immediate inner circle protects the real pointer;
      // its softly following outer circle gives the movement a little weight.
      let start = right;
      let end = gutter;
      const circles = [
        { x: pointer.smoothX, y: pointer.smoothY, radius: fontSize * 5.3 * pointer.strength },
        { x: pointer.x, y: pointer.y, radius: pointer.active ? fontSize * 4.5 : 0 },
      ];
      for (const circle of circles) {
        const distance = Math.max(y - circle.y, circle.y - (y + lineHeight), 0);
        if (distance >= circle.radius) continue;
        const half = Math.sqrt(circle.radius * circle.radius - distance * distance) + fontSize * .7;
        start = Math.min(start, circle.x - half);
        end = Math.max(end, circle.x + half);
      }
      if (start >= end || end <= gutter || start >= right) return [{ x: gutter, width: right - gutter }];
      const slots: Slot[] = [];
      if (start - gutter > fontSize * 3) slots.push({ x: gutter, width: start - gutter });
      if (right - end > fontSize * 3) slots.push({ x: end, width: right - end });
      return slots;
    }

    function row(source: SourceCursor, y: number, reveal: number, paint: boolean): SourceCursor {
      const prepared = paragraphs[source.paragraph % paragraphs.length];
      let cursor = source.cursor;
      const slots = slotsForRow(y);
      if (paint && slots.length === 2) splitRows++;
      for (const slot of slots) {
        const range = api!.layoutNextLineRange(prepared, cursor, slot.width - fontSize * .15);
        if (!range) break;
        if (paint) {
          const line = api!.materializeLineRange(prepared, range);
          const ink = source.paragraph % 6;
          context!.fillStyle = colors[ink === 0 ? 3 : ink === 1 || ink === 4 ? 1 : ink === 3 ? 2 : 0];
          context!.globalAlpha = .38 + Math.min(1, Math.max(0, y / height)) * .36;
          // Reveal text, not a rectangular canvas mask: layout still follows
          // the actual full source and its live exclusion widths.
          const text = reveal < 1 ? line.text.slice(0, Math.floor(line.text.length * reveal)) : line.text;
          context!.fillText(text, slot.x, y);
        }
        cursor = range.end;
        if (cursor.segmentIndex >= prepared.segments.length) break;
      }
      return cursor.segmentIndex >= prepared.segments.length
        ? { paragraph: (source.paragraph + 1) % paragraphs.length, cursor: { segmentIndex: 0, graphemeIndex: 0 } }
        : { paragraph: source.paragraph, cursor };
    }

    function paintFallback() {
      if (!width || !height || !fontSize) return;
      context!.clearRect(0, 0, width, height);
      context!.font = font;
      context!.fillStyle = colors[1];
      context!.globalAlpha = .42;
      let y = 0;
      let line = "";
      for (const word of SOURCE.join(" ").split(" ")) {
        const candidate = line ? `${line} ${word}` : word;
        if (context!.measureText(candidate).width > width - gutter * 2 && line) {
          context!.fillText(line, gutter, y);
          y += lineHeight;
          if (y > height) break;
          line = word;
        } else line = candidate;
      }
      context!.globalAlpha = 1;
    }

    function paint() {
      if (!width || !height || !fontSize) return;
      if (failed || !paragraphs.length) { paintFallback(); return; }
      context!.clearRect(0, 0, width, height);
      context!.font = font;
      context!.textBaseline = "top";
      splitRows = 0;
      let source = front;
      const rows = Math.ceil(height / lineHeight);
      for (let index = 0; index < rows; index++) {
        const y = index * lineHeight - scroll;
        const reveal = index === rows - 1 && !reduced.matches ? Math.min(1, scroll / lineHeight * 1.4) : 1;
        source = row(source, y, reveal, true);
      }
      context!.globalAlpha = 1;
      frame++;
      // Sampled diagnostics, not a DOM mutation for every animation frame.
      if (frame === 1 || frame % 12 === 0) {
        host!.dataset.frame = String(frame);
        host!.dataset.splitRows = String(splitRows);
      }
    }

    function tick(time: number) {
      frameRequest = 0;
      if (!moving()) return;
      const delta = previousTime ? Math.min(time - previousTime, 48) : 0;
      previousTime = time;
      const easing = 1 - Math.exp(-delta / 65);
      pointer.smoothX += (pointer.x - pointer.smoothX) * easing;
      pointer.smoothY += (pointer.y - pointer.smoothY) * easing;
      pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * easing;
      // A steady writing cadence; time is suspended rather than accumulated
      // whenever the user pauses, scrolls away, or switches browser tabs.
      try {
        scroll += delta * lineHeight / 920;
        while (scroll >= lineHeight) {
          front = row(front, -scroll, 1, false);
          scroll -= lineHeight;
        }
        if (time - previousPaint >= (pointer.active || pointer.strength > .005 ? 1000 / 60 : 1000 / 30)) {
          paint();
          previousPaint = time;
        }
      } catch {
        // A missing browser primitive or unexpected layout failure must leave
        // a legible static surface, never a broken animation loop.
        failed = true;
        host!.dataset.engine = "fallback";
        synchronize();
        return;
      }
      frameRequest = requestAnimationFrame(tick);
    }

    async function initialize() {
      if (loading || ready || disposed) return;
      loading = true;
      host!.dataset.engine = "loading";
      try {
        if (!("Segmenter" in Intl)) throw new Error("Text segmentation is unavailable");
        const loaded = await import("@chenglou/pretext");
        await document.fonts.ready;
        if (disposed) return;
        api = loaded;
        font = "";
      } catch {
        failed = true;
      }
      if (disposed) return;
      ready = true;
      measure();
      host!.dataset.engine = failed ? "fallback" : "pretext";
      paint();
      synchronize();
    }

    function synchronize() {
      if (disposed) return;
      if (!ready && stateRef.current.active && visible && !document.hidden) void initialize();
      if (moving()) {
        host!.dataset.running = "true";
        if (!frameRequest) {
          previousTime = 0;
          previousPaint = 0;
          frameRequest = requestAnimationFrame(tick);
        }
      } else {
        cancelAnimationFrame(frameRequest);
        frameRequest = 0;
        previousTime = 0;
        host!.dataset.running = "false";
        pointer.active = false;
        pointer.strength = 0;
        host!.dataset.pointerActive = "false";
        if (ready && visible && stateRef.current.active && !document.hidden) paint();
      }
    }

    function move(event: PointerEvent) {
      if (!moving() || event.pointerType === "touch") return;
      // The section, rather than a canvas overlay, owns pointer observation.
      // No pointer capture or default prevention: links and touch scroll work.
      const wasActive = pointer.active;
      pointer.active = true;
      pointer.x = event.clientX - hostBounds.left;
      pointer.y = event.clientY - hostBounds.top;
      if (!wasActive) {
        pointer.smoothX = pointer.x;
        pointer.smoothY = pointer.y;
        pointer.strength = .85;
        host!.dataset.pointerActive = "true";
      }
    }

    function leave() {
      pointer.active = false;
      host!.dataset.pointerActive = "false";
    }

    function refreshBounds() {
      hostBounds = host!.getBoundingClientRect();
      leave();
    }

    const observer = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false;
      synchronize();
    });
    observer.observe(host);
    const resizeObserver = new ResizeObserver(() => {
      measure();
      if (ready && visible) paint();
      synchronize();
    });
    resizeObserver.observe(host);
    section.addEventListener("pointermove", move, { passive: true });
    section.addEventListener("pointerleave", leave, { passive: true });
    window.addEventListener("scroll", refreshBounds, { passive: true });
    document.addEventListener("visibilitychange", synchronize);
    reduced.addEventListener("change", synchronize);
    synchronizeRef.current = synchronize;

    return () => {
      disposed = true;
      cancelAnimationFrame(frameRequest);
      observer.disconnect();
      resizeObserver.disconnect();
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", refreshBounds);
      document.removeEventListener("visibilitychange", synchronize);
      reduced.removeEventListener("change", synchronize);
      synchronizeRef.current = null;
      paragraphs = [];
    };
  }, []);

  return (
    <div ref={hostRef} className="lp-agent-stream" aria-hidden="true" data-engine="idle" data-running="false" data-pointer-active="false">
      <canvas ref={canvasRef} className="lp-agent-stream__canvas" />
    </div>
  );
}
