import type { ReactNode } from "react";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import "@/app/_styles/landing-v3.css";
import "./research.css";

export default function ResearchLayout({ children }: { children: ReactNode }) {
  return (
    <main className="lp lp-research">
      <LpNav />
      <div id="main-content" tabIndex={-1}>{children}</div>
      <LpFooter />
    </main>
  );
}
