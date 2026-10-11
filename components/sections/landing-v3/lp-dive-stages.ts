import type { ComponentType } from "react";

import type { gsap } from "@/lib/gsap";

import { LpStoryClaudeStage } from "./LpStoryClaude";
import { LpStoryLearnsStage } from "./LpStoryLearns";
import { LpStoryMessageStage } from "./LpStoryMessage";
import { LpStorySourcesStage } from "./LpStorySources";
import { STORY_CLAUDE_ALT } from "./lp-story-claude-data";
import { STORY_LEARNS_ALT } from "./lp-story-learns-data";
import { STORY_MESSAGE_ALT } from "./lp-story-message-data";
import { STORY_SOURCES_ALT } from "./lp-story-sources-data";

/**
 * Deep-dive stage registry — the four carousel items' scenes (V2 Figma 4939:3388, decision
 * 2026-10-09). Integrator-owned: no package edits this file. The shell (blue-band: LpDive,
 * its carousel island and driver) reads it; each story package fills its own modules, under the
 * names imported here and in lp-dive-loaders.ts:
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
 * (`container: lp-dive-scene / size`) and carries `data-lp-layout="desktop" | "phone"`:
 * story CSS switches to the phone composition with
 * `@container lp-dive-scene (max-width: 599px) { … }` (SSR-safe, and the dev harness can show
 * both boxes side by side); builders read `diveStageLayout(root)`.
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
 * through `import()`, into an eager client entry of the page. Shared helper: `registerTxtPlugin`
 * in lp-gsap-txt.ts; anything else is COPIED with a "copied from" note.
 *
 * QA: the shell registers each built timeline as `window.__lpStory.<id>` (lp-play-once
 * registry "__lpStory", owned by blue-band); the dev harness (/lp-dev/stages) does the same.
 */

export type DiveItemId = "sources" | "message" | "learns" | "claude";

/** carousel order (V2 4939:3388) */
export const DIVE_ORDER: readonly DiveItemId[] = ["sources", "message", "learns", "claude"];

/** The scene design boxes, in px (the stage scales them as pixels with --lp-fit). */
export const DIVE_STAGE_BOX = {
  desktop: { width: 752, height: 489 },
  phone: { width: 400, height: 520 },
} as const;
export type DiveStageLayout = keyof typeof DIVE_STAGE_BOX;

/** Which composition a stage root sits in (its scene box's design width; transforms ignored). */
export function diveStageLayout(root: HTMLElement): DiveStageLayout {
  const scene = root.closest<HTMLElement>("[data-lp-layout]");
  const declared = scene?.dataset.lpLayout;
  if (declared === "phone" || declared === "desktop") return declared;
  return (scene ?? root).offsetWidth < 600 ? "phone" : "desktop";
}

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
  sources: {
    id: "sources",
    Stage: LpStorySourcesStage,
    alt: STORY_SOURCES_ALT,
  },
  message: {
    id: "message",
    Stage: LpStoryMessageStage,
    alt: STORY_MESSAGE_ALT,
  },
  learns: {
    id: "learns",
    Stage: LpStoryLearnsStage,
    alt: STORY_LEARNS_ALT,
  },
  claude: {
    id: "claude",
    Stage: LpStoryClaudeStage,
    alt: STORY_CLAUDE_ALT,
  },
};
