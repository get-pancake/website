import * as React from "react";

// The kit stylesheet rides with the components that use it (2026-10-13): it left
// app/layout.tsx so routes without kit markup stop downloading its 98 KB.
import "@/app/_styles/components.css";

export type TextareaSize = "sm" | "md" | "lg";

export type TextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> & {
  size?: TextareaSize;
  error?: boolean;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { size = "md", error = false, className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={["textarea", className].filter(Boolean).join(" ")}
      data-size={size === "md" ? undefined : size}
      data-err={error ? "" : undefined}
      {...rest}
    />
  );
});
