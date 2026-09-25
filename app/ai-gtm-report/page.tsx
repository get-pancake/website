import type { Metadata } from "next";

import { ReportExperience } from "@/components/sections/report/ReportExperience";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

import "./report.css";

export const metadata: Metadata = {
  title: "Free AI GTM report — your buyers ask AI first | Pancake",
  description:
    "Pancake's GTM agents read your company the way ChatGPT and Google do: your buyers' questions, the searches that matter, and what they'd fix first. Free, one minute.",
  alternates: { canonical: `${SITE_ORIGIN}/ai-gtm-report` },
  openGraph: {
    type: "website",
    url: `${SITE_ORIGIN}/ai-gtm-report`,
    title: "Your buyers ask AI first. Do you come up?",
    description:
      "A one-minute scan: ChatGPT visibility on your buyers' questions, Google money searches, and what to fix first.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pancake — free AI GTM report" }],
    siteName: "Pancake",
  },
};

export default function ReportPage() {
  return <ReportExperience />;
}
