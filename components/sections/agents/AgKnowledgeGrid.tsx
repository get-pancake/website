"use client";

import type { ReactNode } from "react";

import { useInView } from "./useInView";

/**
 * /agents — the Super knowledge grid's viewport gate. The only client piece
 * of the section: useInView stamps `data-inview` on the <ul> and
 * knowledge.css runs the sixteen bob loops only while it intersects (never
 * under reduced motion). The cards themselves are static copy rendered by
 * the server component (AgKnowledge) and passed in as children, so none of
 * that markup ships as client code (README rule 7, review #29).
 */
export function AgKnowledgeGrid({ children }: { children: ReactNode }) {
  const [gridRef] = useInView<HTMLUListElement>();
  return (
    <ul ref={gridRef} className="ag-knowledge__grid">
      {children}
    </ul>
  );
}
