// Types of kitchen.js, the entry of the kitchen scene. The scene itself is plain JavaScript on
// three.js: TypeScript reads this file in its place.

export type KitchenMode = "with" | "without";
export type KitchenCast = "pancakes" | "people";

/** a badge of words.js: a logo of logos.js (or a glyph of overlay.js) and three words at most */
export interface KitchenBadge {
  readonly icon: string;
  readonly text: string;
}

export interface KitchenOptions {
  /** "with" Pancake (the default) or "without" */
  mode?: KitchenMode;
  /** who cooks: "pancakes" (the default) or "people" */
  cast?: KitchenCast;
  /** show the badges (true) */
  badges?: boolean;
  /** without Pancake: show the Snowflake and BigQuery marks on the slow tank (true) */
  vendorLogos?: boolean;
  /** start playing at once (true); with prefers-reduced-motion it draws one still and waits */
  autoplay?: boolean;
  /** play the opening, the kitchen popping out of the floor (true) */
  intro?: boolean;
  /** the pointer tilts the view, the chefs watch it, a click on a chef makes it jump (true) */
  interactive?: boolean;
  /** where in the loop to start, in seconds (0) */
  time?: number;
  /** the camera, in degrees (14 and 43) */
  azimuth?: number;
  elevation?: number;
  /** above 1 for a close-up, with `target` (1) */
  zoom?: number;
  /** what a close-up looks at, [x, y, z] in the units of layout.js */
  target?: [number, number, number];
  /** the margin around the kitchen (1.04) */
  pad?: number;
  /** the window the picture shows, margins included, in place of the kitchen's outline and `pad`:
   *  [left, right, bottom, top] in the camera's units, from the resting angle (PHONE_VIEW) */
  view?: readonly [number, number, number, number];
  shadows?: "vsm" | "pcf" | "none";
  /** the most device pixels per CSS pixel it draws (2) */
  maxPixelRatio?: number;
  /** called once, from the loop, when it cannot keep up (under 12 frames a second for two
   *  windows of 2 s in a row): show a still picture and `dispose()` the scene. Not judged
   *  without it. */
  onSlow?: () => void;
}

export interface PancakeKitchen {
  readonly canvas: HTMLCanvasElement;
  /** where the loop is, in seconds */
  readonly time: number;
  readonly playing: boolean;
  readonly mode: KitchenMode;
  readonly cast: KitchenCast;
  start(): void;
  stop(): void;
  /** jump to a moment of the loop and draw it */
  seek(time: number): void;
  setSpeed(speed: number): void;
  /** play the opening again */
  replay(): void;
  /** `instant` skips the change-over; it is the default when the scene is paused */
  setMode(mode: KitchenMode, instant?: boolean): void;
  setCast(cast: KitchenCast, instant?: boolean): void;
  /** while paused: move the time on by `dt` seconds and draw */
  step(dt: number): void;
  draw(): void;
  /** draw calls and triangles of the last frame */
  stats(): { calls: number; triangles: number };
  /** stop, free the GPU memory and remove the canvas and the badges */
  dispose(): void;
}

/**
 * Fills `container` with the kitchen. The container sets the size, and gets
 * `position: relative` if it has none. Throws where WebGL is not available.
 */
export function createPancakeKitchen(container: HTMLElement, options?: KitchenOptions): PancakeKitchen;

/**
 * The same kitchen, set up a part at a time with a frame of the page between two parts, its
 * shaders compiled in the background: the page's own animations keep running while it boots.
 * Resolves once its first frame is drawn. If `signal` aborts first, the set-up stops, frees what
 * it made, and the promise rejects. Rejects too where WebGL is not available.
 */
export function bootPancakeKitchen(
  container: HTMLElement,
  options?: KitchenOptions,
  signal?: AbortSignal,
): Promise<PancakeKitchen>;

/** the moment each still picture is drawn at; start the live scene there to take over without a jump */
export const POSTER_TIMES: Readonly<Record<KitchenMode, number>>;

/** what a phone shows: the whole kitchen, as wide as the page's text (layout.js) */
export const PHONE_VIEW: readonly [number, number, number, number];

export const PAGE_COLOR: string;
