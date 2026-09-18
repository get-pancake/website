import type { Metadata } from "next";
import Link from "next/link";

import { LandingFooter } from "@/components/sections/landing/LandingFooter";
import { LandingNav } from "@/components/sections/landing/LandingNav";
import {
  SECURITY_EMAIL_URL,
  SUPPORT_EMAIL,
  SUPPORT_EMAIL_URL,
  SUPPORT_GMAIL_URL,
} from "@/lib/contact";
import "@/app/_styles/landing-v2.css";

export const metadata: Metadata = {
  title: "Support — Pancake",
  description: "Contact Pancake for product, account, billing, privacy, and connection support.",
  alternates: { canonical: "https://getpancake.ai/support" },
};

export default function SupportPage() {
  return (
    <main id="main-content" className="lv2">
      <div className="lv2-viewport lv2-viewport--page">
        <LandingNav />
        <section className="lv2s" aria-labelledby="support-heading">
          <article className="lv2-legal">
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
                In Pancake, open Settings → MCP → Connected clients to confirm or revoke the
                connection.
              </li>
              <li>Retry a read-only request, such as reading the GTM Brain.</li>
            </ol>
            <p>
              Never email an access token, authorization code, magic link, password, or other
              credential.
            </p>

            <h2>Privacy and security</h2>
            <p>
              Read the <Link href="/privacy">Privacy Policy</Link> for data handling and
              retention. Report a suspected security issue to{" "}
              <a href={SECURITY_EMAIL_URL}>{SUPPORT_EMAIL}</a> with
              the subject “Security report.” Do not include customer data or credentials.
            </p>
          </article>
        </section>
      </div>
      <LandingFooter />
    </main>
  );
}
