import type { CSSProperties, ReactNode } from "react";

import { TOY_ART } from "./lp-toy-art";

/**
 * The toy pictures' shared markup (the vision homepage's 1-2-3 and its four features, 2026-11-12).
 * A toy picture is a small set of soft 3D objects in the kitchen's look (LpKitchen), drawn once
 * as flat layers (scripts/toy-art.mjs, from toys/studio) and laid out here as plain images, with
 * the page's own type over them: a badge, a name, a count. Nothing is live 3D, so a picture costs
 * what a few images cost and it moves on a phone too.
 *
 * Server-safe (no hooks, no "use client"): the stages import it. Styles: toys.css. Motion:
 * lp-toy-kit.ts. No copy lives here (lp-toy-data.ts, in scripts/homepage-lint.mjs FILES).
 */

export type ToyArt = typeof TOY_ART;
export type ToySet = keyof ToyArt;
type Point = readonly [number, number];
type Box = { src: string; x: number; y: number; w: number; h: number };

/** stage px, two decimals */
export const toyPx = (n: number) => `${Math.round(n * 100) / 100}px`;

/** a layer's box on its stage */
function toyLayer<S extends ToySet>(set: S, name: keyof ToyArt[S]["layers"] & string): Box {
  return (TOY_ART[set].layers as Record<string, Box>)[name];
}
/**
 * One drawing of a set, where the studio drew it. `from` and `to` move it: the drawing was made
 * with its object on the point `from`, and it is laid with that object on the point `to`.
 */
export function ToyPic<S extends ToySet>({
  set,
  name,
  from,
  to,
  className,
  style,
  ...data
}: {
  set: S;
  name: keyof ToyArt[S]["layers"] & string;
  from?: Point;
  to?: Point;
  className?: string;
  style?: CSSProperties;
} & Record<`data-${string}`, string | number | undefined>) {
  const box = toyLayer(set, name);
  const dx = from && to ? to[0] - from[0] : 0;
  const dy = from && to ? to[1] - from[1] : 0;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a drawing of the set, at its own size
    <img
      className={className ? `lp-toy-pic ${className}` : "lp-toy-pic"}
      src={box.src}
      alt=""
      width={box.w}
      height={box.h}
      loading="lazy"
      decoding="async"
      draggable={false}
      style={{ left: toyPx(box.x + dx), top: toyPx(box.y + dy), ...style }}
      {...data}
    />
  );
}

/** A vendor's own mark, unmodified, on a white disc (the app's vendor chip). */
export function ToyMark({ src, at, size = 30, className, ...data }: { src: string; at: Point; size?: number; className?: string } & Record<`data-${string}`, string | number | undefined>) {
  return (
    <span
      className={className ? `lp-toy-mark ${className}` : "lp-toy-mark"}
      style={{ left: toyPx(at[0] - size / 2), top: toyPx(at[1] - size / 2), width: toyPx(size), height: toyPx(size) }}
      {...data}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a vendor's own file, unmodified */}
      <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" draggable={false} />
    </span>
  );
}

/**
 * A badge: a white pill of the page's own type, centred on a point of the set (`at` is the
 * middle of its bottom edge unless `anchor` says otherwise: "top" the middle of its top edge,
 * "top-start" its top left corner, "left" and "right" the middle of that side, "centre" its
 * middle). `logo`: a vendor's own file.
 */
export function ToyBadge({
  at,
  logo,
  icon,
  tone,
  kind,
  anchor = "bottom",
  className,
  children,
  ...data
}: {
  at: Point;
  logo?: string;
  icon?: ReactNode;
  tone?: string;
  kind?: string;
  anchor?: "bottom" | "top" | "top-start" | "left" | "right" | "centre";
  className?: string;
  children: ReactNode;
} & Record<`data-${string}`, string | number | undefined>) {
  return (
    <span
      className={className ? `lp-toy-badge ${className}` : "lp-toy-badge"}
      data-anchor={anchor}
      data-tone={tone}
      data-kind={kind}
      style={{ left: toyPx(at[0]), top: toyPx(at[1]) }}
      {...data}
    >
      <span className="lp-toy-badge__in">
        {logo ? (
          <i className="lp-toy-badge__ico">
            {/* eslint-disable-next-line @next/next/no-img-element -- a vendor's own file, unmodified */}
            <img src={logo} alt="" width={14} height={14} loading="lazy" decoding="async" draggable={false} />
          </i>
        ) : icon ? (
          <i className="lp-toy-badge__ico">{icon}</i>
        ) : null}
        <span>{children}</span>
      </span>
    </span>
  );
}
