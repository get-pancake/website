import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build in Public · Pancake",
  description: "Live signup and ambassador metrics for Pancake.",
  // Empty shell (no content renders): keep it out of the index. No canonical
  // either — it used to inherit the homepage one from the root layout.
  robots: { index: false, follow: true },
};

export default function BuildInPublicPage() {
  return <main id="main-content" className="min-h-screen" />;
}
