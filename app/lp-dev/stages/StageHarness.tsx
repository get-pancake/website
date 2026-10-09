"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { DIVE_STAGES, type DiveItemId } from "@/components/sections/landing-v3/lp-dive-stages";
import type { gsap } from "@/lib/gsap";

type Timeline = gsap.core.Timeline;
type Ctx = gsap.Context;

/** One frame's controller — the same build/dispose sequence as lp-play-once.ts (gsap.context on
    the stage root; revert, then the builder's cleanup). */
type Handle = {
  key: string;
  build: () => Promise<boolean>;
  play: (from?: number) => Promise<void>;
  pause: () => void;
  seek: (t: number) => Promise<void>;
  end: () => Promise<void>;
  rest: () => void;
  tl: Timeline | null;
  cue: number;
  /** the gsap.context the builder ran in (QA: ctx.add(() => …) to try a tween that rest() reverts) */
  ctx: Ctx | null;
};

type FrameRef = { key: string; id: DiveItemId; layout: string; el: HTMLElement; mount: HTMLElement };

type DevWindow = Window & {
  __lpStory?: Record<string, Timeline>;
  __lpDevStages?: Record<string, Handle>;
};

function makeHandle(frame: FrameRef, onChange: () => void): Handle {
  let ctx: Ctx | null = null;
  let cleanup: (() => void) | null = null;
  let building: Promise<boolean> | null = null;
  const setState = (s: string) => {
    frame.el.dataset.state = s;
    onChange();
  };
  const handle: Handle = {
    key: frame.key,
    tl: null,
    cue: 0,
    ctx: null,
    build() {
      if (handle.tl) return Promise.resolve(true);
      building ??= (async () => {
        const root = frame.el.querySelector<HTMLElement>("[data-lp-story]");
        if (!root) {
          setState("error");
          console.error(`lp-dev/stages: ${frame.key} renders no [data-lp-story] root`);
          return false;
        }
        try {
          const { gsap: g, build } = await DIVE_STAGES[frame.id].load();
          ctx = g.context(() => {
            const built = build(root);
            handle.tl = built.tl;
            handle.cue = Math.min(Math.max(built.cue ?? 0, 0), built.tl.duration());
            cleanup = built.cleanup;
            built.tl.eventCallback("onComplete", () => setState("built"));
          }, root);
          handle.ctx = ctx;
          const w = window as DevWindow;
          if (frame.layout === "desktop" && handle.tl) w.__lpStory = { ...w.__lpStory, [frame.id]: handle.tl };
          setState("built");
          return true;
        } catch (err) {
          setState("error");
          console.error(`lp-dev/stages: ${frame.key} build threw`, err);
          return false;
        } finally {
          building = null;
        }
      })();
      return building;
    },
    async play(from = 0) {
      if (!(await handle.build()) || !handle.tl) return;
      handle.tl.play(from);
      setState("playing");
    },
    pause() {
      handle.tl?.pause();
      if (handle.tl) setState("built");
    },
    async seek(t: number) {
      if (!(await handle.build()) || !handle.tl) return;
      handle.tl.pause();
      handle.tl.seek(Math.min(Math.max(t, 0), handle.tl.duration()), false);
      setState("built");
    },
    async end() {
      if (!(await handle.build()) || !handle.tl) return;
      handle.tl.pause();
      handle.tl.progress(1, false);
      setState("built");
    },
    /** back to the server markup (the rest picture): revert every set the builder made */
    rest() {
      ctx?.revert();
      cleanup?.();
      ctx = null;
      handle.ctx = null;
      cleanup = null;
      handle.tl = null;
      handle.cue = 0;
      const w = window as DevWindow;
      if (frame.layout === "desktop" && w.__lpStory) delete w.__lpStory[frame.id];
      setState("rest");
    },
  };
  return handle;
}

function Controls({ handle }: { handle: Handle }) {
  const [, force] = useState(0);
  const [time, setTime] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    const tick = () => {
      if (handle.tl) setTime(handle.tl.time());
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [handle]);
  const duration = handle.tl?.duration() ?? 0;
  const refresh = () => force((n) => n + 1);
  return (
    <div className="lp-devstages__bar">
      <button type="button" onClick={() => void handle.play(0).then(refresh)}>Play</button>
      <button type="button" onClick={() => void handle.play(handle.cue).then(refresh)}>Play from cue</button>
      <button type="button" onClick={() => { handle.pause(); refresh(); }}>Pause</button>
      <button type="button" onClick={() => void handle.end().then(refresh)}>End</button>
      <button type="button" onClick={() => { handle.rest(); refresh(); }}>Rest (server markup)</button>
      <input
        type="range"
        min={0}
        max={Math.max(duration, 0.001)}
        step={0.01}
        value={Math.min(time, duration)}
        aria-label={`Seek ${handle.key}`}
        onChange={(e) => void handle.seek(Number(e.target.value)).then(refresh)}
        onPointerDown={() => void handle.build().then(refresh)}
      />
      <output>
        {handle.tl ? `${time.toFixed(2)} / ${duration.toFixed(2)} s · cue ${handle.cue.toFixed(2)}` : "rest"}
      </output>
    </div>
  );
}

/**
 * The harness's one client island: finds the server-rendered frames below it, gives each a
 * control bar (portal into its [data-controls] slot) and the QA handles, then applies the
 * page's ?t / ?play once.
 */
export function StageHarness({
  children,
  seekTo,
  autoplay,
}: {
  children: ReactNode;
  seekTo: number | "end" | null;
  autoplay: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [frames, setFrames] = useState<{ frame: FrameRef; handle: Handle }[]>([]);
  const [, setVersion] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const bump = () => setVersion((v) => v + 1);
    const found = Array.from(el.querySelectorAll<HTMLElement>(".lp-devstages__frame")).flatMap((frameEl) => {
      const id = frameEl.dataset.story as DiveItemId;
      const layout = frameEl.dataset.layout ?? "desktop";
      const mount = frameEl.querySelector<HTMLElement>("[data-controls]");
      if (!mount || !(id in DIVE_STAGES)) return [];
      const frame: FrameRef = { key: `${id}:${layout}`, id, layout, el: frameEl, mount };
      return [{ frame, handle: makeHandle(frame, bump) }];
    });
    const w = window as DevWindow;
    w.__lpDevStages = Object.fromEntries(found.map(({ handle }) => [handle.key, handle]));
    setFrames(found);
    if (seekTo === "end") found.forEach(({ handle }) => void handle.end());
    else if (seekTo !== null) found.forEach(({ handle }) => void handle.seek(seekTo));
    if (autoplay) found.forEach(({ handle }) => void handle.play(seekTo !== null && seekTo !== "end" ? seekTo : 0));
    return () => {
      found.forEach(({ handle }) => handle.rest());
      delete w.__lpDevStages;
    };
  }, [seekTo, autoplay]);

  return (
    <div ref={root} className="lp-devstages__list">
      {children}
      {frames.map(({ frame, handle }) => createPortal(<Controls handle={handle} />, frame.mount, frame.key))}
    </div>
  );
}
