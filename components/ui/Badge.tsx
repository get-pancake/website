import * as React from "react";

// The kit stylesheet rides with the components that use it (2026-10-13): it left
// app/layout.tsx so routes without kit markup stop downloading its 98 KB.
import "@/app/_styles/components.css";

export type BadgeVariant =
  | "neutral"
  | "inverted"
  | "brand"
  | "brand-alt-1"
  | "brand-alt-2"
  | "success"
  | "warning"
  | "negative";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = "neutral", className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={["badge", className].filter(Boolean).join(" ")}
      data-variant={variant === "neutral" ? undefined : variant}
      {...rest}
    >
      {children}
    </span>
  );
});
