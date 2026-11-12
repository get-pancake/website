// Types of words.js, every word the kitchen section shows.

import type { KitchenBadge } from "./kitchen";

interface KitchenSide {
  /** its option on the switch */
  readonly option: string;
  /** the section's title while this kitchen shows */
  readonly title: string;
  /** what the picture shows, for someone who cannot see it */
  readonly alt: string;
}

export interface KitchenWords {
  readonly switchLabel: string;
  readonly with: KitchenSide;
  readonly without: KitchenSide;
  /** the badges that pop over each tunnel: one list per belt (left, corner, back) */
  readonly signals: readonly (readonly KitchenBadge[])[];
  /** with Pancake: what a plate that leaves becomes, in turn */
  readonly results: readonly KitchenBadge[];
  readonly beltDown: string;
  readonly pipeLeak: string;
  /** a percentage follows */
  readonly tankLoading: string;
  readonly tankRebuilding: string;
  /** without Pancake: what the one plate that leaves becomes, in turn */
  readonly late: readonly KitchenBadge[];
}

export const WORDS: KitchenWords;
