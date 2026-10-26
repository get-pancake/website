"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { mountPlayOnce, type PlayOnceRuntime } from "./lp-play-once";

/**
 * The infra-first page's diagram build-up (2026-10-21, founder: "start the motion rebuilds:
 * the diagram flow first"), played once by
 * lp-play-once.ts like the step cards: prepared ahead, cued below the fold, played at the focus
 * line, the picture on a fly-by. The markup (server-rendered children) is the END picture
 * (restIsEnd): no JS, reduced motion and a fly-by show it finished. Timelines in
 * lp-infra-timeline.ts, fetched with GSAP only when a card is prepared. Every move is opacity or
 * a transform: nothing changes size on screen while it plays.
 *
 *   LpInfraFlow — the diagram card (LpInfra): the agents send, the wire draws down through the
 *                 sign-in, Pancake lights, the brain, the data and the tools light up in turn
 *                 and the Play switches on.
 */

const loadFlow = (): Promise<PlayOnceRuntime> =>
  Promise.all([import("@/lib/gsap"), import("./lp-infra-timeline")]).then(([{ gsap }, { buildInfraFlow }]) => ({
    gsap,
    build: buildInfraFlow,
  }));

function usePlayOnce<E extends HTMLElement>(load: () => Promise<PlayOnceRuntime>, key: string, designWidth: number) {
  const ref = useRef<E>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    return mountPlayOnce({
      host,
      stage: host,
      designWidth,
      load,
      restIsEnd: true,
      qa: { registry: "__lpInfra", key },
    });
  }, [load, key, designWidth]);
  return ref;
}

export function LpInfraFlow({ children }: { children: ReactNode }) {
  const ref = usePlayOnce<HTMLDivElement>(loadFlow, "diagram", 1040);
  // After the build-up only the leads queue moves (buildInfraLoop: a lead comes up, is approved,
  // the next one comes up; founder 2026-10-26, "nothing should look vibe coded"): built once the
  // play-once driver marks the card done, played while it is on screen and the tab visible, never
  // under reduced motion, and dropped (its end picture given back) if the build-up plays again.
  useEffect(() => {
    const card = ref.current;
    if (!card || typeof IntersectionObserver === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let loop: { tl: { play: () => unknown; pause: () => unknown; kill: () => unknown }; cleanup: () => void } | null = null;
    let loading = false;
    let disposed = false;
    let onScreen = false;
    const drop = () => {
      if (!loop) return;
      loop.tl.kill();
      loop.cleanup();
      loop = null;
    };
    const sync = () => {
      if (disposed) return;
      if (card.dataset.lpAnim !== "done" || reduce.matches) {
        drop();
        return;
      }
      if (!loop) {
        if (loading) return;
        loading = true;
        import("./lp-infra-timeline")
          .then(({ buildInfraLoop }) => {
            loading = false;
            if (disposed || card.dataset.lpAnim !== "done" || reduce.matches || loop) return;
            loop = buildInfraLoop(card);
            sync();
          })
          .catch(() => {
            loading = false;
          });
        return;
      }
      if (onScreen && !document.hidden) loop.tl.play();
      else loop.tl.pause();
    };
    const watch = new MutationObserver(sync);
    watch.observe(card, { attributes: true, attributeFilter: ["data-lp-anim"] });
    const seen = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        sync();
      },
      { threshold: 0.2 },
    );
    seen.observe(card);
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    sync();
    return () => {
      disposed = true;
      watch.disconnect();
      seen.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
      drop();
    };
  }, [ref]);
  return (
    <div ref={ref} className="lp-infra__card">
      {children}
    </div>
  );
}
