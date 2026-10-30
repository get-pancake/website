import type { ComponentType } from "react";

import type { gsap } from "@/lib/gsap";

import { LpStoryContextStage } from "./LpStoryContext";
import { LpStoryLineageStage } from "./LpStoryLineage";
import { LpStoryMcpStage } from "./LpStoryMcp";
import { LpStorySignalsStage } from "./LpStorySignals";
import { STORY_CONTEXT_ALT } from "./lp-story-context-data";
import { STORY_LINEAGE_ALT } from "./lp-story-lineage-data";
import { STORY_MCP_ALT } from "./lp-story-mcp-data";
import { STORY_SIGNALS_ALT } from "./lp-story-signals-data";

/**
 * Deep-dive stage registry — the four carousel items' scenes (V2 Figma 4939:3388, decision
 * 2026-10-09; the four stories since 2026-10-28, founder: "Pour les 4 blocs je ferai donc 1/ Next
 * best action + Unified GTM context 2/ Buying signal + enrichment 3/ Lead lineage 4/ mcp first",
 * drawn in the one picture he loves, the old sources story's end hub, with no UI: the shared kit
 * is LpStoryKit.tsx, lp-story-kit.ts and story-kit.css). Integrator-owned: no package edits this
 * file. The shell (blue-band: LpDive, its carousel island and driver) reads it; each story package
 * fills its own modules, under the names imported here and in lp-dive-loaders.ts:
 *
 *   LpStory<Name>.tsx              export LpStory<Name>Stage(props: DiveStageProps)
 *   lp-story-<name>-timeline.ts    export buildStory<Name>(root: HTMLElement): BuiltStory
 *   lp-story-<name>-data.ts        export STORY_<NAME>_ALT: string (+ the story's own copy)
 *   (optional lp-story-<name>-art.ts, app/_styles/landing-v3/story-<name>.css,
 *    assets under public/lp/story-<name>/)
 *
 * STAGE (server-safe: no hooks, no "use client", no lib/placeholders import — the shell passes
 * `placeholders`): renders ONE root element carrying `data-lp-story="<id>"` and
 * `aria-hidden="true"` (the shell's host carries role="img" + aria-label = the ALT), styled
 * `position: absolute; inset: 0` by the story's CSS. Its markup is the story's REST picture =
 * the END picture of the timeline (restIsEnd), so the server HTML is never a blank card.
 * The story paints nothing behind its scene: the shell paints --lp-dive-stage-bg.
 *
 * SCENE BOX (shell-owned, the stage's parent): the design box at design size, scaled as pixels
 * (`transform: scale(var(--lp-fit))`, origin 0 0; never zoom). Desktop/tablet 752×489, phones
 * 400×520 (decision 2026-10-09). It is a size container named `lp-dive-scene`
 * (`container: lp-dive-scene / size`) and carries `data-lp-layout="desktop" | "phone"`. A hook
 * no current story uses (none of the four of 2026-10-28 has a 400×520 phone composition; the
 * phone stack shows the 752×489 box scaled), kept for a future phone composition: its CSS would
 * switch with `@container lp-dive-scene (max-width: 599px) { … }` (SSR-safe, and the dev harness
 * can show both boxes side by side), its builder would read the scene box's `data-lp-layout`.
 *
 * BUILDER (code-map §6.2, lp-play-once's PlayOnceRuntime.build): `buildStory<Name>(root)`
 * receives the Stage's root element, sets frame 0 with gsap.set inside the caller's
 * gsap.context, and returns `{ tl, cleanup, cue }`: `tl` paused and seek-safe (sets and tweens
 * only, no callbacks, no randomness), `tl.progress(1)` pixel-matches the server markup, `cue` =
 * the time of the first composed scene (never an empty frame). Timeline modules carry NO
 * "use client" and import no "use client" module other than `@/lib/gsap`; they are reached only
 * through the client loaders in lp-dive-loaders.ts (lazy chunks, kept out of the first bundle
 * like PR #283). This registry holds NO loader on purpose (phase N, 2026-10-11): it is imported
 * by the server LpDive, and Next turns every "use client" module the server graph reaches, even
 * through `import()`, into an eager client entry of the page. Shared helpers: the story kit
 * (lp-story-kit.ts, plain module) and `registerTxtPlugin` in lp-gsap-txt.ts; anything else is
 * COPIED with a "copied from" note.
 *
 * QA: the shell registers each built timeline as `window.__lpStory.<id>` (lp-play-once
 * registry "__lpStory", owned by blue-band); the dev harness (/lp-dev/stages) does the same.
 */

export type DiveItemId = "context" | "signals" | "lineage" | "mcp";

/** carousel order (the founder's four blocks, 2026-10-28) */
export const DIVE_ORDER: readonly DiveItemId[] = ["context", "signals", "lineage", "mcp"];

/** The scene design boxes, in px (the stage scales them as pixels with --lp-fit). */
export const DIVE_STAGE_BOX = {
  desktop: { width: 752, height: 489 },
  phone: { width: 400, height: 520 },
} as const;
export type DiveStageLayout = keyof typeof DIVE_STAGE_BOX;

/** Props every Stage receives from its server parent. */
export type DiveStageProps = {
  /** SHOW_PLACEHOLDERS, decided by the server parent (lib/placeholders.ts): placeholder-only
      elements render only when true, marked data-placeholder */
  placeholders: boolean;
};

/** What a story builder returns (lp-play-once Built, with a required cue). */
export type BuiltStory = { tl: gsap.core.Timeline; cleanup: () => void; cue: number };

export type DiveStageEntry = {
  id: DiveItemId;
  /** server-renderable rest (= end) picture */
  Stage: ComponentType<DiveStageProps>;
  /** what the animation shows: the host's aria-label (the story's data module) */
  alt: string;
};

export const DIVE_STAGES: Record<DiveItemId, DiveStageEntry> = {
  context: {
    id: "context",
    Stage: LpStoryContextStage,
    alt: STORY_CONTEXT_ALT,
  },
  signals: {
    id: "signals",
    Stage: LpStorySignalsStage,
    alt: STORY_SIGNALS_ALT,
  },
  lineage: {
    id: "lineage",
    Stage: LpStoryLineageStage,
    alt: STORY_LINEAGE_ALT,
  },
  mcp: {
    id: "mcp",
    Stage: LpStoryMcpStage,
    alt: STORY_MCP_ALT,
  },
};
