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
  return (
    <div ref={ref} className="lp-infra__card">
      {children}
    </div>
  );
}
