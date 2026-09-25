import type { Metadata } from "next";
import Link from "next/link";

import { LandingFooter } from "@/components/sections/landing/LandingFooter";
import { LandingNav } from "@/components/sections/landing/LandingNav";
import { SUPPORT_EMAIL, SUPPORT_EMAIL_URL } from "@/lib/contact";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import "@/app/_styles/landing-v2.css";

export const metadata: Metadata = {
  title: "Terms of Service — Pancake",
  description:
    "The terms governing your access to and use of Pancake — including the website, web app, and Slack integration.",
  alternates: { canonical: `${SITE_ORIGIN}/terms` },
};

export default function TermsOfServicePage() {
  return (
    <main id="main-content" className="lv2">
      <div className="lv2-viewport lv2-viewport--page">
        <LandingNav />
        <section className="lv2s" aria-labelledby="terms-heading">
          <article className="lv2-legal">
            <p className="lv2-legal-updated">Last updated: September 18, 2026</p>
            <h1 id="terms-heading">Terms of Service</h1>

            <p>
              Welcome to Pancake. These Terms of Service (“Terms”) govern your access to and use
              of Pancake’s services, including our website, web application, and integrations
              (including Slack).
            </p>
            <p>By accessing or using Pancake, you agree to these Terms.</p>

            <h2>1. About Pancake</h2>
            <p>
              Pancake is a software service operated by Basalt AI Inc., a company incorporated in
              the State of Delaware, United States, with its principal place of business in San
              Francisco.
            </p>

            <h2>2. Eligibility</h2>
            <p>
              You must be at least 18 years old and have the legal capacity to enter into these
              Terms.
            </p>
            <p>
              If you are using Pancake on behalf of a company, you agree to these Terms on behalf
              of that organization.
            </p>

            <h2>3. Use of the Service</h2>
            <p>You agree to use Pancake only for lawful purposes and in accordance with these Terms.</p>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service for illegal, harmful, or abusive activities</li>
              <li>Interfere with or disrupt the service</li>
              <li>Attempt to gain unauthorized access to systems or data</li>
              <li>Use the service to send spam or unsolicited communications</li>
              <li>Reverse engineer or attempt to extract source code (except where permitted by law)</li>
            </ul>

            <h2 id="fees-billing">4. Fees &amp; Billing</h2>
            <p>
              Some features of Pancake require a paid subscription. Current pricing is listed on
              our{" "}
              <Link href="/pricing" prefetch={false}>
                pricing page
              </Link>
              .
            </p>
            <ul>
              <li>Subscriptions are billed in advance and renew automatically until cancelled</li>
              <li>
                You can cancel at any time; access continues until the end of the current billing
                period
              </li>
              <li>
                We may change prices with reasonable advance notice; changes apply from your next
                billing cycle
              </li>
              <li>Except where required by law, payments are non-refundable</li>
            </ul>

            <h2>5. Slack Integration</h2>
            <p>If you use Pancake with Slack:</p>
            <ul>
              <li>
                You authorize Pancake to access and process data from your Slack workspace as
                required to provide the service
              </li>
              <li>
                You are responsible for ensuring you have the right to install and use the app in
                your workspace
              </li>
              <li>
                Your use of Slack is also governed by Slack Technologies’s terms and policies
              </li>
            </ul>

            <h2>6. User Content</h2>
            <p>You retain ownership of any content you submit to Pancake (“User Content”).</p>
            <p>
              By using the service, you grant Pancake a limited, non-exclusive license to use,
              process, and store your content solely to provide and improve the service.
            </p>
            <p>
              You are responsible for ensuring your content does not violate any laws or
              third-party rights.
            </p>

            <h2>7. AI-Generated Content</h2>
            <p>Pancake may generate responses or outputs using artificial intelligence.</p>
            <ul>
              <li>AI outputs may be inaccurate or incomplete</li>
              <li>You are responsible for reviewing and validating outputs before relying on them</li>
              <li>Pancake is not responsible for decisions made based on AI-generated content</li>
            </ul>

            <h2>8. Data &amp; Privacy</h2>
            <p>
              Your use of the service is also governed by our{" "}
              <Link href="/privacy" prefetch={false}>
                Privacy Policy
              </Link>
              .
            </p>
            <p>We encourage you to review it to understand how we collect and process data.</p>

            <h2>9. Infrastructure &amp; Data Hosting</h2>
            <p>
              Pancake is hosted on infrastructure provided by Google Cloud Platform located in the
              United States.
            </p>
            <p>
              By using the service, you acknowledge that your data may be processed and stored in
              the United States and other jurisdictions where our service providers operate.
            </p>

            <h2>10. Service Availability</h2>
            <p>
              We aim to provide a reliable service but do not guarantee that Pancake will be
              uninterrupted or error-free.
            </p>
            <p>We may modify, suspend, or discontinue parts of the service at any time.</p>

            <h2>11. Termination</h2>
            <p>We may suspend or terminate your access to Pancake if you violate these Terms.</p>
            <p>You may stop using the service at any time.</p>

            <h2>12. Disclaimer of Warranties</h2>
            <p>Pancake is provided “as is” and “as available.”</p>
            <p>To the maximum extent permitted by law, we disclaim all warranties, express or implied, including:</p>
            <ul>
              <li>Merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
            </ul>

            <h2>13. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Pancake shall not be liable for:</p>
            <ul>
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of data, profits, or business opportunities</li>
            </ul>
            <p>
              Our total liability shall not exceed the amount you paid (if any) to use the service.
            </p>

            <h2>14. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of California, United States,
              without regard to conflict of law principles.
            </p>

            <h2>15. Contact</h2>
            <p>If you have any questions about these Terms, you can contact us at:</p>
            <p>
              <a href={SUPPORT_EMAIL_URL}>
                <strong>{SUPPORT_EMAIL}</strong>
              </a>
            </p>
          </article>
        </section>
      </div>
      <LandingFooter />
    </main>
  );
}
