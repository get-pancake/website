import type { Metadata } from "next";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://brain.getpancake.ai"),
  title: "Get started — Put your GTM on autopilot with Claude & ChatGPT | Pancake",
  description: "Pancake lets your Claude or ChatGPT run your go-to-market in full autopilot: warm leads, outreach, AI search visibility.",
  alternates: { canonical: "https://brain.getpancake.ai/" },
  icons: { icon: "/icon.png" },
  openGraph: {
    title: "Put your GTM on autopilot with Claude & ChatGPT | Pancake",
    description: "Your AI assistant monitors buying signals, finds warm leads and gets you found on Google and ChatGPT. Start free in 5 minutes.",
    url: "https://brain.getpancake.ai/", type: "website", images: ["/og-image.png"],
  },
  twitter: { card: "summary_large_image" },
  robots: process.env.VERCEL_ENV === "production" ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${condensed.variable} ${aeonik.variable} ${fono.variable}`}>
      <head>
        {/* Engineer-owned synchronous writer: capture click_id before auth or vendor scripts. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/pancake-attribution.min.js" />
        {process.env.VERCEL_ENV === "production" && <script dangerouslySetInnerHTML={{ __html:
          "if(location.hostname==='brain.getpancake.ai'){var s=document.createElement('script');s.src='https://package.leadjourney.io/package/latest/a27db1a6-9da6-4639-8bd2-a8e33014a16a/';s.async=true;document.head.appendChild(s)}"
        }} />}
      </head>
      <body>{children}</body>
    </html>
  );
}
