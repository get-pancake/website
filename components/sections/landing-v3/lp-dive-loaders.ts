import type { DiveItemId } from "./lp-dive-stages";
import type { PlayOnceRuntime } from "./lp-play-once";

/**
 * The deep-dive stories' lazy loaders: GSAP + one builder per story, each its own chunk.
 *
 * CLIENT ONLY — import this from the carousel driver (lp-dive-carousel.ts) and the dev harness
 * (app/lp-dev/stages/StageHarness.tsx), NEVER from a server component or from lp-dive-stages.ts.
 * Next's flight-client-entry plugin walks the server graph through `import()` too: when these
 * closures sat in the registry (which the server LpDive imports), `lib/gsap.ts` and every
 * "use client" timeline became EAGER client entries of app/page and shipped in the homepage's
 * first bundle (seen in the dev page chunk's entry list, 2026-10-09) — the opposite of PR #283's
 * lazy split. Kept here, they are fetched only when the carousel approaches with motion allowed;
 * reduced motion never fetches them.
 *
 * Module and export names are the fixed ones of lp-dive-stages.ts's contract:
 * `lp-story-<name>-timeline.ts` exports `buildStory<Name>(root): BuiltStory`, and since
 * 2026-10-13 `buildStory<Name>Steps(root)`, the same builder as a generator that yields between
 * slices (lp-play-once's `steps`: the drivers spread a build over idle slots).
 */
export type DiveStageLoader = () => Promise<PlayOnceRuntime>;

export const DIVE_LOADERS: Record<DiveItemId, DiveStageLoader> = {
  sources: () =>
    Promise.all([import("@/lib/gsap"), import("./lp-story-sources-timeline")]).then(
      ([{ gsap }, { buildStorySources, buildStorySourcesSteps }]) => ({
        gsap,
        build: buildStorySources,
        steps: buildStorySourcesSteps,
      }),
    ),
  message: () =>
    Promise.all([import("@/lib/gsap"), import("./lp-story-message-timeline")]).then(
      ([{ gsap }, { buildStoryMessage, buildStoryMessageSteps }]) => ({
        gsap,
        build: buildStoryMessage,
        steps: buildStoryMessageSteps,
      }),
    ),
  learns: () =>
    Promise.all([import("@/lib/gsap"), import("./lp-story-learns-timeline")]).then(
      ([{ gsap }, { buildStoryLearns, buildStoryLearnsSteps }]) => ({
        gsap,
        build: buildStoryLearns,
        steps: buildStoryLearnsSteps,
      }),
    ),
  claude: () =>
    Promise.all([import("@/lib/gsap"), import("./lp-story-claude-timeline")]).then(
      ([{ gsap }, { buildStoryClaude, buildStoryClaudeSteps }]) => ({
        gsap,
        build: buildStoryClaude,
        steps: buildStoryClaudeSteps,
      }),
    ),
};
