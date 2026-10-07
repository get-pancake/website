import type { Metadata, Viewport } from "next";
import Link from "next/link";

import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import {
  SECURITY_EMAIL_URL,
  SUPPORT_EMAIL,
  SUPPORT_EMAIL_URL,
  SUPPORT_GMAIL_URL,
} from "@/lib/contact";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";
import { TRIAL_DAYS } from "@/lib/trial";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/landing-v3/legal.css";

/* 2026-10-07: the sitewide chrome (LpNav + LpFooter inside main.lp) instead
   of the lv2 nav and footer; the body keeps its prose layout (legal.css). */

/* Status-bar zone matches the lp cream (Dynamic Island fix, 2026-08-31) */
export const viewport: Viewport = { themeColor: "#fbf6f1" };

const TITLE = "Support — Pancake";
const DESCRIPTION =
  "Contact Pancake for product, account, billing, privacy, and connection support.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_ORIGIN}/support` },
  // Its own share card (2026-10-07, audit 8.2): it shared as the homepage,
  // with the homepage title and no og:url.
  ...social({ path: "/support", title: TITLE, description: DESCRIPTION }),
};

export default function SupportPage() {
  return (
    <main id="main-content" className="lp">
      <LpNav />
      <section className="lp-legal" aria-labelledby="support-heading">
        <article className="lp-legal__body">
          <h1 id="support-heading">Support</h1>
          <p>
            Email <a href={SUPPORT_EMAIL_URL}>{SUPPORT_EMAIL}</a> for product,
            installation, connection, privacy, or billing help. Include the client you use,
            the approximate time of the problem, and the visible error message.
          </p>
          <p>
            If the email link does not open your mail app, copy the address above into your
            email service or{" "}
            <a href={SUPPORT_GMAIL_URL} target="_blank" rel="noopener noreferrer">
              open Gmail
            </a>
            . You do not need a Pancake account to contact us.
          </p>

          <h2>Free trial</h2>
          <p>
            You can begin signup without a credit card. Pancake offers a {TRIAL_DAYS}-day
            free trial, and a credit card is required to start the trial.
          </p>

          <h2>Billing, cancellations, and refunds</h2>
          <p>
            You can cancel at any time; access continues until the end of the current billing
            period. Except where required by law, payments are non-refundable. Read the{" "}
            <Link href="/terms#fees-billing">Fees &amp; Billing terms</Link> for details, or
            email us with a billing question.
          </p>

          <h2>ChatGPT, Codex, and Claude</h2>
          <ol>
            <li>Confirm the Pancake app opens normally.</li>
            <li>Reconnect Pancake from your AI client.</li>
            <li>Complete the browser sign-in and choose one workspace.</li>
            <li>
              In Pancake, open Settings → Claude / Codex to confirm or remove the connection.
            </li>
            <li>Retry a read-only request, such as reading the GTM Brain.</li>
          </ol>
          <p>
            Never email an access token, authorization code, magic link, password, or other
            credential.
          </p>

          <h2 id="security">Privacy and security</h2>
          <p>
            Read the <Link href="/privacy">Privacy Policy</Link> for data handling and
            retention. Report a suspected security issue to{" "}
            <a href={SECURITY_EMAIL_URL}>{SUPPORT_EMAIL}</a> with
            the subject “Security report.” Do not include customer data or credentials.
          </p>
        </article>
      </section>
      <LpFooter />
    </main>
  );
}
