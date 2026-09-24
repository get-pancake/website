/**
 * /get-started — standalone lead-magnet landing page.
 *
 * A faithful 1:1 reproduction of the approved Pancake "Get started" artifact
 * (https://claude.ai/public/artifacts/e2884f06-20f2-464d-84a5-789dcb53fec1).
 * Intentionally independent from the main site's design system — all styling
 * lives in ./get-started.css, scoped under #get-started-page so the artifact's
 * generic class names can't leak. The headline and trial disclosure reflect
 * the current founder-approved copy.
 *
 * Fonts: the artifact loads DM Sans + DM Mono from Google Fonts; here they are
 * self-hosted via next/font and exposed as --font-dm-sans / --font-dm-mono,
 * which ./get-started.css maps onto --font / --font-mono.
 */
import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { TRIAL_CARD_REQUIREMENT, TRIAL_NOTICE } from "@/lib/trial";

import "./get-started.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Get started: The AI coworker that does the work for you · Pancake",
  description:
    `Create your Pancake account. ${TRIAL_NOTICE} Stack autonomous agents across growth, engineering and ops so your company keeps running even while you sleep.`,
  alternates: { canonical: "https://getpancake.ai/get-started" },
  // Orphaned previous-positioning page (not linked from the site): kept
  // reachable for old links, out of the index so it can't compete with the
  // homepage for brand queries (2026-09-24 SEO pass).
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/get-started",
    title: "Get started with Pancake, the AI coworker that does the work for you",
    description:
      `Create your account. ${TRIAL_NOTICE} Stack autonomous agents across growth, engineering and ops.`,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Get started with Pancake" }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "Get started with Pancake, the AI coworker that does the work for you",
    description:
      `Create your account. ${TRIAL_NOTICE}`,
    images: ["/og-image.png"],
  },
};

export default function GetStartedPage() {
  return (
    <div id="get-started-page" className={`${dmSans.variable} ${dmMono.variable}`}>
      <div className="blob blob-purple" />
      <div className="blob blob-orange" />
      <div className="blob blob-pink" />

      <main id="main-content" className="page">
        {/* ── Real Pancake logo SVG ── */}
        <div className="topbar">
          <a href="https://getpancake.ai" className="logo-link" aria-label="Pancake">
            <svg width="422" height="166" viewBox="0 0 422 166" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M318.116 9.17733C322.015 3.82624 327.3 -0.212597 333.318 0.00867186C339.855 0.249222 344.109 5.2716 346.075 11.2001C348.052 17.1614 348.283 25.2018 346.541 34.8696C343.758 50.3187 335.749 70.9712 319.701 96.3398C320.064 98.657 320.466 101.023 320.906 103.439C323.782 97.805 327.283 93.7008 331.185 91.0009C339.115 85.514 348.228 86.3193 353.997 91.567C356.827 94.1415 358.729 97.7143 359.101 101.775C359.476 105.865 358.272 110.084 355.536 113.942C352.678 117.969 348.175 121.607 341.859 124.63C355.431 143.67 374.26 153.904 396.156 153.904V165.071C369.298 165.071 346.575 151.84 331.068 128.657C329.695 129.053 328.269 129.428 326.788 129.781C327.717 133.264 328.982 137.817 330.285 142.473C332.416 150.085 334.647 157.982 335.222 160.587L324.317 162.994C323.831 160.79 321.744 153.387 319.532 145.482C317.43 137.974 315.203 129.967 314.531 126.778C313.07 120.896 311.812 115.23 310.74 109.778C309.1 112.12 307.397 114.498 305.627 116.91L296.624 110.302C300.819 104.588 304.613 99.0974 308.038 93.8374C304.407 68.1372 305.246 47.9882 308.437 33.1118C310.658 22.7627 314.067 14.7339 318.116 9.17733ZM85.7208 82.9906C101.219 82.9906 110.174 90.4529 110.174 104.344V127.879C110.174 130.863 111.207 131.667 113.848 131.667H116.258V142.459H109.829C102.138 142.459 99.268 139.129 99.1531 133.504C95.2498 139.244 89.1651 143.147 79.9809 143.147C67.2379 143.147 58.3979 136.833 58.3978 125.927C58.3978 113.758 67.008 107.099 83.3099 107.099H97.8899V103.54C97.8899 96.9966 93.1831 92.9785 85.1469 92.9785C77.9144 92.9785 73.0926 96.4228 72.1742 101.589H59.8902C61.2678 90.2235 70.9113 82.9906 85.7208 82.9906ZM210.227 82.9906C225.266 82.9906 234.68 91.3715 236.976 104.689H224.003C222.396 97.8005 217.46 93.5525 209.997 93.5524C200.124 93.5524 193.58 101.703 193.58 113.184C193.58 124.664 200.124 132.586 209.997 132.586C217.345 132.586 222.396 128.223 223.888 121.449H236.976C234.795 134.766 224.807 143.147 209.883 143.147C192.203 143.147 180.952 131.552 180.952 113.184C180.952 95.045 192.547 82.9907 210.227 82.9906ZM267.979 82.9906C283.478 82.9906 292.432 90.4529 292.432 104.344V127.879C292.432 130.863 293.465 131.667 296.106 131.667H298.517V142.459H292.088C284.396 142.459 281.526 139.129 281.411 133.504C277.508 139.244 271.423 143.147 262.239 143.147C249.496 143.147 240.656 136.833 240.656 125.927C240.656 113.758 249.266 107.099 265.568 107.099H280.148V103.54C280.148 96.9966 275.441 92.9785 267.405 92.9785C260.173 92.9785 255.351 96.4228 254.432 101.589H242.148C243.526 90.2235 253.17 82.9906 267.979 82.9906ZM393.043 82.9906C410.034 82.9906 421.284 93.7821 421.629 111.002C421.629 112.265 421.514 114.217 421.285 115.939H377.43V116.513C377.775 126.501 383.974 133.044 393.617 133.045C400.964 133.045 406.59 129.256 408.197 122.713H420.596C418.53 134.308 408.771 143.147 394.306 143.147C375.938 143.147 364.457 131.208 364.457 113.184C364.458 95.0449 375.938 82.9906 393.043 82.9906ZM30.652 62.0968C47.2984 62.0968 58.3197 72.0844 58.3197 87.6976C58.3196 103.196 47.2984 113.298 30.652 113.298H13.202V142.459H0V62.0968H30.652ZM151.733 82.9906C164.246 82.9906 174.694 89.7641 174.694 108.936V142.459H162.18V110.084C162.18 99.637 157.703 93.8971 148.863 93.8971C139.564 93.8971 133.939 100.67 133.939 112.036V142.459H121.54V83.6794H132.332L133.709 91.3712C137.153 86.7792 142.664 82.9906 151.733 82.9906ZM82.736 116.283C75.1591 116.283 70.9115 119.154 70.9115 125.123C70.9117 130.06 75.0446 133.504 81.7031 133.504C91.8056 133.504 97.8899 127.419 97.8899 118.579V116.283H82.736ZM264.994 116.283C257.417 116.283 253.17 119.154 253.17 125.123C253.17 130.06 257.303 133.504 263.961 133.504C274.064 133.504 280.148 127.419 280.148 118.579V116.283H264.994ZM346.482 99.8277C344.864 98.3563 341.545 97.4116 337.539 100.184C334.149 102.529 330.057 107.801 327.246 118.134C338.482 115.011 344.066 110.809 346.428 107.48C347.813 105.528 348.084 103.921 347.981 102.796C347.875 101.642 347.345 100.613 346.482 99.8277ZM393.158 92.9785C385.466 92.9785 378.808 98.2594 377.889 106.64H408.771C407.738 97.9151 401.768 92.9786 393.158 92.9785ZM13.202 101.818H29.0447C38.6881 101.818 44.8873 96.3078 44.8874 87.6976C44.8874 78.9726 38.6882 73.5766 29.1596 73.5766H13.202V101.818ZM332.907 11.1678C332.368 11.1481 330.155 11.6174 327.142 15.7532C324.277 19.6844 321.357 26.1241 319.355 35.4541C317.06 46.1528 316.039 60.3509 317.516 78.2562C328.126 59.4285 333.509 44.2226 335.551 32.8898C337.108 24.2465 336.651 18.261 335.475 14.7148C334.292 11.1477 332.935 11.1683 332.907 11.1678Z" fill="#2C002A" />
            </svg>
          </a>
        </div>

        {/* ════════════════ MAIN SPLIT ════════════════ */}
        <div className="main">

          {/* LEFT */}
          <div className="left">

            <div className="eyebrow">
              <div className="eyebrow-dot" />
              Now in early access
            </div>

            <h1 className="headline">
              make your company <em>autonomous</em>
            </h1>

            <p className="subline">
              Pancake stacks autonomous agents across growth, engineering and ops, so your company keeps running even while you sleep.
            </p>

            <div className="features">
              <div className="feat">
                <div className="feat-check"><svg viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5 3.5 6.5 7.5 2.5" stroke="#ff7aa0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                <div className="feat-copy">
                  <strong>An entire org in one account</strong>
                  <span>Copywriter, DevOps, Customer Support, Ad Manager. Working in parallel, 24/7, no sick days.</span>
                </div>
              </div>
              <div className="feat">
                <div className="feat-check"><svg viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5 3.5 6.5 7.5 2.5" stroke="#ff7aa0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                <div className="feat-copy">
                  <strong>Lives where your team already is</strong>
                  <span>Morning briefings, autonomous actions, one-tap approvals. All in Slack, not another dashboard.</span>
                </div>
              </div>
              <div className="feat">
                <div className="feat-check"><svg viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5 3.5 6.5 7.5 2.5" stroke="#ff7aa0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                <div className="feat-copy">
                  <strong>Connects to your whole stack</strong>
                  <span>Notion, GitHub, Stripe, Gmail. Agents read, write and ship through your tools like a real employee.</span>
                </div>
              </div>
              <div className="feat">
                <div className="feat-check"><svg viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5 3.5 6.5 7.5 2.5" stroke="#ff7aa0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                <div className="feat-copy">
                  <strong>You always have the last word</strong>
                  <span>Set spend and scope thresholds. Anything above needs your sign-off before it ships.</span>
                </div>
              </div>
            </div>

            <div className="proof">
              <div className="avatars">
                <div className="av av1">JL</div>
                <div className="av av2">MK</div>
                <div className="av av3">SR</div>
                <div className="av av4">AN</div>
                <div className="av av5">+</div>
              </div>
              <div className="proof-text">
                <div><strong>500+ founders</strong> already onboarded their AI cofounder</div>
                <div className="proof-stars">★★★★★</div>
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="right">

            <div className="gs-card">
              <h2 className="card-title">Welcome to Pancake</h2>
              <p className="card-sub">Create your account. {TRIAL_NOTICE}</p>

              <a className="btn-google" href="https://app.getpancake.ai">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                </svg>
                Continue with Google
              </a>

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-label">OR</span>
                <div className="divider-line" />
              </div>

              <div className="field">
                <input type="email" placeholder="Enter your email address…" aria-label="Email address" />
              </div>
              <div className="hint">e.g. name@company.com</div>

              <a className="btn-cta" href="https://app.getpancake.ai">
                Continue
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M2.5 7.5h10M8.5 3.5l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              <p className="no-card">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <rect x="1" y="4.5" width="9" height="6" rx="1.2" stroke="#bba8ae" strokeWidth="1.1" />
                  <path d="M3.2 4.5V3A2.3 2.3 0 0 1 7.8 3v1.5" stroke="#bba8ae" strokeWidth="1.1" />
                </svg>
                {TRIAL_CARD_REQUIREMENT} &nbsp;·&nbsp; Cancel anytime
              </p>
            </div>

            <div className="reassurance">
              <div className="re-item">
                <div className="re-icon re-green">🛡️</div>
                <span><strong>SOC 2 compliant</strong>. Your data is encrypted at rest and in transit.</span>
              </div>
              <div className="re-item">
                <div className="re-icon re-purple">⚡</div>
                <span><strong>Up and running in 5 min</strong>. Connect Slack, plug in your stack, go.</span>
              </div>
              <div className="re-item">
                <div className="re-icon re-yellow">💸</div>
                <span><strong>$100 in free credits included</strong>. Explore the full product before committing.</span>
              </div>
            </div>

          </div>
        </div>

        {/* ════════════════ HOW IT WORKS ════════════════ */}
        <div className="how-section">
          <span className="section-eyebrow">How it works</span>
          <h2 className="section-title">From signup to autonomous<br />company in minutes.</h2>
          <p className="section-sub">No engineers needed. No complex setup. Connect, configure, and go.</p>

          <div className="steps">
            <div className="step">
              <div className="step-pill">STEP 01</div>
              <h4>Connect your stack</h4>
              <p>Link Slack, Notion, GitHub, Stripe in a few clicks. Your agents read your docs and know your business from day one.</p>
            </div>
            <div className="step">
              <div className="step-pill">STEP 02</div>
              <h4>Configure your agents</h4>
              <p>Define roles and workflows in plain Markdown. You control exactly what each agent can see and do. Nothing more, nothing less.</p>
            </div>
            <div className="step">
              <div className="step-pill">STEP 03</div>
              <h4>Let them run your company</h4>
              <p>Agents brief you every morning in Slack, execute autonomously, and surface anything that needs your approval before it ships.</p>
            </div>
          </div>

          <div className="trust">
            <div className="trust-item">🛡️ SOC 2 Type II</div>
            <div className="trust-item">🔐 End-to-end encrypted</div>
            <div className="trust-item">🏢 San Francisco, CA</div>
            <div className="trust-item">⭐ #1 on Product Hunt</div>
            <div className="trust-item">🔄 Cancel anytime</div>
          </div>
        </div>
      </main>
    </div>
  );
}
