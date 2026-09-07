import type { Metadata } from "next";
import localFont from "next/font/local";
import { Lato } from "next/font/google";
import "./globals.css";
import "./_styles/components.css";
import "./_styles/home-ugc.css";
import { AnalyticsEvents } from "@/components/analytics/AnalyticsEvents";
import { MetaPixelEvents } from "@/components/analytics/MetaPixelEvents";
import { PostHogAttribution } from "@/components/analytics/PostHogAttribution";
import {
  META_BROWSER_PIXEL_ID,
  PANCAKE_ANALYTICS_INGEST_ORIGIN,
} from "@/lib/analytics/vendor-config";

/**
 * Lato — Slack's UI typeface (SIL Open Font License, served via next/font/google).
 * Exposed as `--font-lato` and used inline by `<SlackUI />` to keep the fake
 * Slack panel visually faithful without leaking Lato into the rest of the page.
 */
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
  // The legacy Slack panels request these faces only when they render.
  preload: false,
});

/* Font diet (iPhone OOM round 2, 2026-09-01): only the cuts CSS actually
   references ship — a weight census across app/_styles found 400/500/600/
   700/900 uprights plus italic at body weights (get-started's <em>, four
   components.css rules). The dropped Air/Thin/Light cuts and display-weight
   italics were 15 preloaded OTFs decoding on every phone visit for zero
   rendered glyphs. Files stay in app/fonts/ — re-declare here if a new
   design needs one. */
const aeonik = localFont({
  src: [
    { path: "./fonts/aeonik/AeonikTRIAL-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/aeonik/AeonikTRIAL-RegularItalic.otf", weight: "400", style: "italic" },
    { path: "./fonts/aeonik/AeonikTRIAL-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/aeonik/AeonikTRIAL-MediumItalic.otf", weight: "500", style: "italic" },
    { path: "./fonts/aeonik/AeonikTRIAL-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/aeonik/AeonikTRIAL-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/aeonik/AeonikTRIAL-Black.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-aeonik",
  display: "swap",
  // Landing v3's first screen uses Fono + Condensed. Keep every Aeonik
  // weight available for other routes without competing with those faces.
  preload: false,
});

const aeonikFono = localFont({
  src: [
    { path: "./fonts/aeonik-fono/AeonikFonoTRIAL-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/aeonik-fono/AeonikFonoTRIAL-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/aeonik-fono/AeonikFonoTRIAL-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/aeonik-fono/AeonikFonoTRIAL-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/aeonik-fono/AeonikFonoTRIAL-Black.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-aeonik-fono",
  display: "swap",
});

// Display face of the landing-v3 Figma design (CoType trial, downloaded
// 2026-08-28 at Tristan's direction). Upright cuts only — the artboard never
// italicizes the condensed face. Consumed via --lp-font-cond in
// app/_styles/landing-v3/foundation.css.
const aeonikCondensed = localFont({
  src: [
    { path: "./fonts/aeonik-condensed/AeonikCondensedProTRIAL-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/aeonik-condensed/AeonikCondensedProTRIAL-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/aeonik-condensed/AeonikCondensedProTRIAL-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/aeonik-condensed/AeonikCondensedProTRIAL-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/aeonik-condensed/AeonikCondensedProTRIAL-Black.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-aeonik-condensed",
  display: "swap",
});

// Canonical host is the apex domain: https://getpancake.ai serves 200 directly,
// and the www host 308-redirects to it (verified via curl -sI).
// Every absolute URL below (canonical, og:url, JSON-LD) uses the apex host.
export const metadata: Metadata = {
  metadataBase: new URL("https://getpancake.ai"),
  title: "Pancake: The AI employee that does the work for you",
  description:
    "Pancake’s AI agents monitor buying signals, find warm leads, grow your AI search visibility, and learn from every interaction.",
  alternates: {
    canonical: "https://getpancake.ai",
  },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai",
    title: "Pancake: The AI employee that does the work for you",
    description:
      "Pancake’s AI agents monitor buying signals, find warm leads, grow your AI search visibility, and learn from every interaction.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "You run your company. We bring you customers." }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pancake: The AI employee that does the work for you",
    description:
      "Pancake’s AI agents monitor buying signals, find warm leads, grow your AI search visibility, and learn from every interaction.",
    images: ["/og-image.png"],
  },
};

// Organization JSON-LD — injected on every page via root layout.
// Helps search engines and AI crawlers understand what Pancake is.
// This is the SINGLE Organization schema for the site (a second, conflicting
// copy used to live in <body> — merged here so crawlers see one story).
// sameAs = union of the two former lists, minus the stale trypancake.ai
// domain; LinkedIn slug matches what the Footer actually links to (get-pancake).
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Pancake",
  alternateName: "Pancake AI",
  url: "https://getpancake.ai",
  logo: "https://getpancake.ai/pancake-mark.png",
  description:
    "Pancake’s AI agents monitor buying signals, find warm leads, grow your AI search visibility, and learn from every interaction.",
  foundingDate: "2024",
  address: {
    "@type": "PostalAddress",
    streetAddress: "535 Mission St",
    addressLocality: "San Francisco",
    addressRegion: "CA",
    postalCode: "94105",
    addressCountry: "US",
  },
  sameAs: [
    "https://x.com/getpancake_ai",
    "https://www.youtube.com/@trypancake",
    "https://www.linkedin.com/company/get-pancake",
    "https://www.tiktok.com/@getpancake",
    "https://www.instagram.com/get.pancake/",
  ],
};

// WebSite JSON-LD — no SearchAction: the site has no /search route, and a
// SearchAction pointing at a 404 hurts more than it helps.
const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Pancake",
  url: "https://getpancake.ai",
};

const googleTagManagerId = "GTM-P3Z79WKD";
const metaPixelId = META_BROWSER_PIXEL_ID;
// Vercel exposes VERCEL_ENV at build and runtime. Advertising and product
// analytics run only in production. GTM alone can be explicitly enabled on a
// preview for Tag Assistant; paid tags must still carry their production-host
// conditions inside the container.
const productionVendorTrackingEnabled =
  process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production";
const tagManagerDebugEnabled =
  !productionVendorTrackingEnabled && process.env.PANCAKE_ANALYTICS_DEBUG === "1";
const tagManagerEnabled = productionVendorTrackingEnabled || tagManagerDebugEnabled;
const productionHostnameGuard =
  "var h=window.location.hostname.toLowerCase();if(h!=='getpancake.ai'&&h!=='www.getpancake.ai'){return;}";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${aeonik.variable} ${aeonikFono.variable} ${aeonikCondensed.variable} ${lato.variable}`}
    >
      <head>
        <meta
          name="facebook-domain-verification"
          content="va3luu0l4mgbrin7rt11dvnra2stty"
        />
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- Attribution must run before a bounce. */}
        <script src="/pancake-attribution.min.js"></script>
        {productionVendorTrackingEnabled ? (
          <script
            dangerouslySetInnerHTML={{
              // This deliberately runs immediately after the synchronous cookie writer, before
              // React hydration or vendor SDKs. The API independently decodes the same cookie and
              // accepts only its newest UUID, so the body cannot fabricate an event or payload.
              __html: `(function(){${productionHostnameGuard}try{var n='pancake_attribution=',p=document.cookie.split(';'),r=null;for(var x=0;x<p.length;x++){var q=p[x].trim();if(q.indexOf(n)===0){r=q.slice(n.length);break;}}if(!r){return;}var s=JSON.parse(decodeURIComponent(r)),t=Array.isArray(s.t)&&s.t.length?s.t[s.t.length-1]:null,i=t&&t.i;if(typeof i!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(i)){return;}fetch('${PANCAKE_ANALYTICS_INGEST_ORIGIN}/analytics/acquisition-touch',{method:'POST',mode:'cors',credentials:'include',referrerPolicy:'origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({touchId:i}),keepalive:true}).catch(function(){});}catch(_){}})();`,
            }}
          />
        ) : null}
        {tagManagerEnabled ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){${tagManagerDebugEnabled ? "" : productionHostnameGuard}(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${googleTagManagerId}');})();`,
            }}
          />
        ) : null}
        {productionVendorTrackingEnabled ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){${productionHostnameGuard}!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');})();`,
            }}
          />
        ) : null}
        {/* Organization + WebSite JSON-LD — present on every page */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
      </head>
      {/* Body styles (margin: 0; background-color: var(--surface); color:
          var(--text)) live in app/_styles/reset.css to avoid a React 18
          hydration mismatch caused by SSR vs client-side serialization
          of inline JSX `style` props. */}
      <body>
        {/* This React funnel cannot be used without JavaScript. Omitting the
            GTM/Meta noscript fallbacks avoids unguarded requests from a
            production deployment's generated Vercel hostname. */}
        {productionVendorTrackingEnabled ? <PostHogAttribution /> : null}
        {productionVendorTrackingEnabled ? <MetaPixelEvents /> : null}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        {children}
        <AnalyticsEvents />
      </body>
    </html>
  );
}
