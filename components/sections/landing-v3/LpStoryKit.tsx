import type { CSSProperties, ReactNode } from "react";

/**
 * The deep-dive stories' shared markup (2026-10-28): the white disc that carries a mark, and the
 * name written by it. Server-safe (no hooks, no "use client"): the four Stage components import
 * it. Styles: app/_styles/landing-v3/story-kit.css; motion: lp-story-kit.ts. No copy lives here:
 * names and words come from each story's data module (scripts/homepage-lint.mjs FILES).
 */

/** stage px are written with three decimals at most */
export const skF3 = (n: number) => Number(n.toFixed(3));

type SkDiscProps = {
  /** top-left and diameter, stage px */
  x: number;
  y: number;
  size: number;
  /** the vendor's own file (drawn at half the disc, never recoloured), or `children` */
  logo?: string;
  children?: ReactNode;
  className?: string;
  /** ties the disc to its wire and its name (data-node) */
  node?: string;
};

export function SkDisc({ x, y, size, logo, children, className, node }: SkDiscProps) {
  return (
    <span
      className={className ? `lp-sk-disc ${className}` : "lp-sk-disc"}
      data-node={node}
      style={{ left: `${skF3(x)}px`, top: `${skF3(y)}px`, width: `${skF3(size)}px`, height: `${skF3(size)}px` }}
    >
      {children ??
        (logo && (
          // the vendor's own file, unmodified (docs/public-assets/lp/story-sources/README.md).
          // Decorative: the scene is aria-hidden, the ALT names the providers
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" width="64" height="64" loading="lazy" decoding="async" draggable={false} />
        ))}
    </span>
  );
}

/** A disc's name, centred under it (above it with `above`). Hidden on phones (story-kit.css). */
export function SkName({
  x,
  y,
  size,
  above,
  node,
  children,
}: {
  x: number;
  y: number;
  size: number;
  above?: boolean;
  node?: string;
  children: ReactNode;
}) {
  const place = { "--nx": skF3(x + size / 2), "--nt": skF3(y), "--nb": skF3(y + size) } as CSSProperties;
  return (
    <span className="lp-sk-name" data-node={node} data-above={above ? "" : undefined} style={place}>
      {children}
    </span>
  );
}
