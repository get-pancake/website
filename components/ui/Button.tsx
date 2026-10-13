import * as React from "react";

// The kit stylesheet rides with the components that use it (2026-10-13): it left
// app/layout.tsx so routes without kit markup stop downloading its 98 KB.
import "@/app/_styles/components.css";

export type ButtonVariant = "brand" | "subtle" | "alternative" | "outline" | "negative" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Square control with centered icon; pair with an accessible name (`aria-label` or visually hidden text). */
  iconOnly?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "brand", size = "md", iconOnly = false, className, type = "button", children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={["button", className].filter(Boolean).join(" ")}
      data-variant={variant === "brand" ? undefined : variant}
      data-size={size === "md" ? undefined : size}
      data-icon-only={iconOnly ? "" : undefined}
      {...rest}
    >
      {children}
    </button>
  );
});
