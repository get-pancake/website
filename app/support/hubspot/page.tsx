import type { Metadata } from "next";
import { CrmSetupGuide } from "@/components/support/CrmSetupGuide";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";

const title = "Connect HubSpot to Pancake — Setup guide";
const description = "Connect HubSpot, choose contact and company fields, export selected Pancake leads and manage app access.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/support/hubspot` },
  ...social({ path: "/support/hubspot", title, description }),
};

export default function HubSpotSetupPage() {
  return <CrmSetupGuide provider="hubspot" />;
}
