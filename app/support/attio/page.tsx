import type { Metadata } from "next";
import { CrmSetupGuide } from "@/components/support/CrmSetupGuide";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";

const title = "Connect Attio to Pancake — Setup guide";
const description = "Connect Attio, map your fields, export selected Pancake leads, resolve duplicates and safely disconnect.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/support/attio` },
  ...social({ path: "/support/attio", title, description }),
};

export default function AttioSetupPage() {
  return <CrmSetupGuide provider="attio" />;
}
