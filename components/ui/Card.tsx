import * as React from "react";

// The kit stylesheet rides with the components that use it (2026-10-13): it left
// app/layout.tsx so routes without kit markup stop downloading its 98 KB.
import "@/app/_styles/components.css";

export type CardVariant = "outline" | "brand" | "brand-alt-1" | "brand-alt-2";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "outline", className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={["card", className].filter(Boolean).join(" ")}
      data-variant={variant === "outline" ? undefined : variant}
      {...rest}
    >
      {children}
    </div>
  );
});
