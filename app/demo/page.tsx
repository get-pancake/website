import type { Metadata } from "next";
import DemoRequestFlow from "@/components/sections/demo/DemoRequestFlow";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/demo.css";
import "@/app/_styles/ai-sales-call.css";
import "@/app/_styles/demo-request.css";
export const metadata: Metadata = {
  title: "Request a demo · Pancake",
  description:
    "Tell us about your team and GTM goals. We review your request before inviting you to a demo.",
  alternates: { canonical: "https://pancake.ai/demo" },
};
export default function DemoPage() {
  return <DemoRequestFlow />;
}
