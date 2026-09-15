import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { LEADJOURNEY_TRACKING_SCRIPT_URL, LINKEDIN_INSIGHT_PARTNER_ID } from "@/lib/analytics/vendor-config";
import { AnalyticsEvents } from "@/components/analytics/AnalyticsEvents";
import { googleTagManagerBootstrap } from "../lib/google-tracking";
import "./styles.css";

const geist = localFont({
  src: "../../../app/fonts/geist/Geist-Variable-latin.woff2",
  weight: "100 900", variable: "--font-geist-sans", display: "swap",
});
const aeonik = localFont({
  src: [
    { path: "../../../app/fonts/aeonik/AeonikTRIAL-Regular.otf", weight: "400" },
    { path: "../../../app/fonts/aeonik/AeonikTRIAL-Medium.otf", weight: "500" },
    { path: "../../../app/fonts/aeonik/AeonikTRIAL-SemiBold.otf", weight: "600" },
  ],
  variable: "--font-aeonik", display: "swap", preload: false,
});
const fono = localFont({
  src: "../../../app/fonts/aeonik-fono/AeonikFonoTRIAL-Regular.otf",
  weight: "400", variable: "--font-aeonik-fono", display: "swap", preload: false,
});
const condensed = localFont({
  src: [
    { path: "../../../app/fonts/aeonik-condensed/AeonikCondensedProTRIAL-Regular.otf", weight: "400" },
    { path: "../../../app/fonts/aeonik-condensed/AeonikCondensedProTRIAL-Medium.otf", weight: "500" },
    { path: "../../../app/fonts/aeonik-condensed/AeonikCondensedProTRIAL-SemiBold.otf", weight: "600" },
    { path: "../../../app/fonts/aeonik-condensed/AeonikCondensedProTRIAL-Black.otf", weight: "900" },
  ],
  variable: "--font-aeonik-condensed", display: "swap",
});

// viewport-fit=cover makes the safe-area insets real (sticky bar, landscape
// notches); the page paints its own cream, so nothing shows under the bars.
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#fbf6f1", colorScheme: "light" };

export const metadata: Metadata = {
  metadataBase: new URL("https://brain.getpancake.ai"),
  title: "Get started — Put your GTM on autopilot with Claude & ChatGPT | Pancake",
  description: "Pancake lets your Claude or ChatGPT run your go-to-market: it finds the people ready to buy and runs your outreach. Start free.",
  alternates: { canonical: "https://brain.getpancake.ai/" },
  icons: { icon: "/icon.png" },
  openGraph: {
    title: "Put your GTM on autopilot with Claude & ChatGPT | Pancake",
    description: "Your Claude or ChatGPT finds the people ready to buy and runs your outreach. Start free in 5 minutes.",
    url: "https://brain.getpancake.ai/", type: "website", images: ["/og-image.png"],
  },
  twitter: { card: "summary_large_image" },
  robots: process.env.VERCEL_ENV === "production" ? undefined : { index: false, follow: false },
};

// Vendor tags agreed with OBVIOUS: LeadJourney (attribution) and the LinkedIn
// Insight Tag (retargeting audiences and conversions), the same ids as
// getpancake.ai. They load at runtime on the canonical hostname only, so
// previews and local runs never count as campaign traffic.
// NEXT_PUBLIC_BRAIN_VENDOR_TAGS=1 forces them on for a tag check on a preview.
const BRAIN_HOSTNAME = "brain.getpancake.ai";
const vendorTagsForced = process.env.NEXT_PUBLIC_BRAIN_VENDOR_TAGS === "1";
const vendorTagLoader = [
  "(function(){",
  `if(location.hostname!=='${BRAIN_HOSTNAME}'&&!${vendorTagsForced})return;`,
  `var l=document.createElement('script');l.src='${LEADJOURNEY_TRACKING_SCRIPT_URL}';l.async=true;document.head.appendChild(l);`,
  `window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push('${LINKEDIN_INSIGHT_PARTNER_ID}');`,
  "if(!window.lintrk){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}",
  "var i=document.createElement('script');i.async=true;i.src='https://snap.licdn.com/li.lms-analytics/insight.min.js';document.head.appendChild(i);",
  "})();",
].join("");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${condensed.variable} ${aeonik.variable} ${fono.variable}`}>
      <head>
        {/* Engineer-owned synchronous writer: capture click_id before auth or vendor scripts. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/pancake-attribution.min.js" />
        <script dangerouslySetInnerHTML={{ __html: googleTagManagerBootstrap(process.env.VERCEL_ENV) }} />
      </head>
      <body>
        {children}
        {/* The shared Google tag disables automatic views; this creates the initial GA4 session. */}
        <AnalyticsEvents />
        {/* LinkedIn asks for its tag right above the closing body tag. */}
        <script dangerouslySetInnerHTML={{ __html: vendorTagLoader }} />
      </body>
    </html>
  );
}
