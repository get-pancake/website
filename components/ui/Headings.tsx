import * as React from "react";

// The kit stylesheet rides with the components that use it (2026-10-13): it left
// app/layout.tsx so routes without kit markup stop downloading its 98 KB.
import "@/app/_styles/components.css";

const heading = "heading";

export const H1 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(function H1(
  { className, ...rest },
  ref,
) {
  return <h1 ref={ref} className={[heading, className].filter(Boolean).join(" ")} {...rest} />;
});

export const H2 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(function H2(
  { className, ...rest },
  ref,
) {
  return <h2 ref={ref} className={[heading, className].filter(Boolean).join(" ")} {...rest} />;
});

export const H3 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(function H3(
  { className, ...rest },
  ref,
) {
  return <h3 ref={ref} className={[heading, className].filter(Boolean).join(" ")} {...rest} />;
});

export const H4 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(function H4(
  { className, ...rest },
  ref,
) {
  return <h4 ref={ref} className={[heading, className].filter(Boolean).join(" ")} {...rest} />;
});
