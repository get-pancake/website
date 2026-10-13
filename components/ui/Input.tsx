import * as React from "react";

// The kit stylesheet rides with the components that use it (2026-10-13): it left
// app/layout.tsx so routes without kit markup stop downloading its 98 KB.
import "@/app/_styles/components.css";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  size?: InputSize;
  error?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = "md", error = false, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={["input", className].filter(Boolean).join(" ")}
      data-size={size === "md" ? undefined : size}
      data-err={error ? "" : undefined}
      {...rest}
    />
  );
});
