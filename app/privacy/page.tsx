import type { Metadata } from "next";

import { LandingFooter } from "@/components/sections/landing/LandingFooter";
import { LandingNav } from "@/components/sections/landing/LandingNav";
import { PRIVACY_EMAIL_URL, SUPPORT_EMAIL } from "@/lib/contact";
import { APP_ORIGIN, SITE_HOST, SITE_ORIGIN } from "@/lib/site-config.mjs";
import "@/app/_styles/landing-v2.css";

export const metadata: Metadata = {
  title: "Privacy Policy — Pancake",
  description:
    "How Pancake (Basalt AI Inc.) collects, uses, and protects personal data across our website, web app, and integrations.",
  alternates: { canonical: `${SITE_ORIGIN}/privacy` },
};

/* Content note: the "Google User Data" section is part of our Google OAuth
   verification — edit it only with that process in mind. */

export default function PrivacyPolicyPage() {
  return (
    <main id="main-content" className="lv2">
      <div className="lv2-viewport lv2-viewport--page">
        <LandingNav />
        <section className="lv2s" aria-labelledby="privacy-heading">
          <article className="lv2-legal">
            <p className="lv2-legal-updated">Last updated: September 18, 2026</p>
            <h1 id="privacy-heading">Privacy Policy</h1>

            <p>
              Pancake is operated by Basalt AI Inc., 535 Mission St, San Francisco, CA 94105,
              USA. As part of its activities, Pancake may process personal data. We attach the
              utmost importance to the security and confidentiality of user data, whether
              collected via our website (
              <a href={SITE_ORIGIN} target="_blank" rel="noopener noreferrer">
                {SITE_ORIGIN}
              </a>
              ), web application (
              <a href={APP_ORIGIN} target="_blank" rel="noopener noreferrer">
                {APP_ORIGIN}
              </a>
              ), or integrations such as Slack, ChatGPT, Codex, and Claude.
            </p>

            <h2>1. Data We Collect</h2>
            <p>We may collect and process the following categories of personal data:</p>
            <ul>
              <li>
                <strong>Account Information:</strong> name, email address, company name
              </li>
              <li>
                <strong>Usage Data:</strong> interactions with the platform, feature usage, logs
              </li>
              <li>
                <strong>Technical Data:</strong> IP address, browser type, device information
              </li>
              <li>
                <strong>Slack Data (if applicable):</strong>
                <ul>
                  <li>User IDs</li>
                  <li>Workspace IDs</li>
                  <li>Channel IDs</li>
                  <li>Messages or content explicitly sent to the Pancake app</li>
                  <li>Metadata associated with Slack interactions (timestamps, event types)</li>
                </ul>
              </li>
              <li>
                <strong>Agent Connector Data (if applicable):</strong> tool requests from the
                AI client you connect, the Pancake workspace records needed to answer them, and
                metadata about the connection. This may include your GTM Brain, business-contact
                lead records, signal settings, SEO plans, run history, and feedback.
              </li>
              <li>
                <strong>Demo Request Data (if applicable):</strong> your answers to our demo form,
                recordings and transcripts of calls with our AI voice agent, and the meeting you
                book. See section 10.
              </li>
            </ul>

            <h2>2. How We Use Data</h2>
            <p>We use collected data to:</p>
            <ul>
              <li>Provide and operate the Pancake service</li>
              <li>Authenticate users and manage accounts</li>
              <li>Improve product performance and features</li>
              <li>Ensure security and prevent abuse</li>
              <li>Respond to user requests and support inquiries</li>
            </ul>
            <p>
              <strong>Slack Data Usage:</strong>
            </p>
            <ul>
              <li>
                Slack data is only used to provide requested functionality within the Slack
                integration
              </li>
              <li>We do not use Slack data for advertising or unrelated purposes</li>
            </ul>

            <h2>3. Cookies &amp; Analytics</h2>
            <p>
              Our website uses cookies and similar technologies to understand how visitors use
              the site and to measure our marketing.
            </p>
            <ul>
              <li>
                <strong>Analytics:</strong> Google Analytics 4 (loaded through Google Tag
                Manager) and PostHog measure page views and product usage.
              </li>
              <li>
                <strong>Advertising measurement:</strong> tags from Meta, LinkedIn, and X
                measure the performance of our ad campaigns.
              </li>
              <li>
                <strong>Attribution:</strong> a first-party script records which page or
                campaign brought you to the site.
              </li>
            </ul>
            <p>
              You can remove or block cookies in your browser settings at any time. The website
              works without them.
            </p>

            <h2>4. Data We Do Not Use</h2>
            <p>
              In some cases, Pancake may receive data from Slack (such as event payloads or
              system logs) that is <strong>not actively used</strong>.
            </p>
            <ul>
              <li>
                This data is <strong>not processed beyond what is necessary for system operation</strong>
              </li>
              <li>
                It is <strong>not stored long-term</strong> and is automatically deleted
              </li>
            </ul>

            <h2>5. Data Retention</h2>
            <p>Personal data is retained only as long as necessary for the purposes described above:</p>
            <ul>
              <li>Account data: retained while the account is active</li>
              <li>
                Usage logs: retained for a limited period (e.g., up to 30 days) for security and
                debugging
              </li>
              <li>
                Slack data: retained only as needed to provide the service and may be deleted
                immediately after processing depending on the feature
              </li>
              <li>Demo requests and voice calls: as described in section 10</li>
            </ul>
            <p>We may retain certain data longer if required by law.</p>

            <h2>6. Your Rights</h2>
            <p>In accordance with GDPR and applicable laws, you have the right to:</p>
            <ul>
              <li>Access your data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Restrict or object to processing</li>
              <li>Request data portability</li>
            </ul>
            <p>
              To exercise your rights, contact us at:{" "}
              <a href={PRIVACY_EMAIL_URL}>
                <strong>{SUPPORT_EMAIL}</strong>
              </a>
            </p>

            <h2>7. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect personal
              data from unauthorized access, loss, or disclosure. All data is transmitted over
              TLS/SSL and encrypted at rest using AES-256 on disk.
            </p>
            <p>Data is hosted on GCP infrastructure located in the United States.</p>

            <h2>8. Google User Data</h2>
            <p>
              Pancake integrates with Google Workspace to act as a cofounder for our users. With
              your explicit consent, Pancake requests access to the following Google OAuth scopes:
            </p>
            <ul>
              <li>
                <code>https://www.googleapis.com/auth/userinfo.email</code> and{" "}
                <code>https://www.googleapis.com/auth/userinfo.profile</code> — to identify you
                and create your Pancake account.
              </li>
              <li>
                <code>https://mail.google.com/</code> — to read, compose, send, and manage Gmail
                messages on your behalf when you ask Pancake to triage your inbox or send email
                on your behalf.
              </li>
              <li>
                <code>https://www.googleapis.com/auth/drive</code> — to read, create, and modify
                files in your Google Drive that are relevant to tasks you delegate to Pancake.
              </li>
              <li>
                <code>https://www.googleapis.com/auth/documents</code> — to read and edit Google
                Docs you ask Pancake to work on.
              </li>
              <li>
                <code>https://www.googleapis.com/auth/spreadsheets</code> — to read and edit
                Google Sheets you ask Pancake to work on.
              </li>
              <li>
                <code>https://www.googleapis.com/auth/calendar</code> — to read your calendar,
                create events, and manage scheduling on your behalf.
              </li>
              <li>
                <code>https://www.googleapis.com/auth/contacts</code> — to look up and reference
                contacts when scheduling, sending email, or sharing files.
              </li>
            </ul>

            <h3>How we use Google user data</h3>
            <p>
              Google user data is used <strong>solely to provide and improve the user-facing
              features of Pancake</strong> — specifically, to let our AI cofounder read, draft,
              schedule, and edit on your behalf in response to your instructions. Google user
              data is not used for any other purpose.
            </p>

            <h3>How we share Google user data</h3>
            <p>
              Google user data is processed by a single sub-processor:{" "}
              <strong>Anthropic, PBC</strong>, the provider of the large language model that
              powers Pancake&apos;s reasoning. Anthropic processes the data only to generate
              responses for Pancake and, per its commercial terms, does not retain prompts or
              completions beyond what is necessary to provide the service and does not use them
              to train its models. We do not share Google user data with any other third party.
            </p>

            <h3>How we protect Google user data</h3>
            <p>
              Google user data is encrypted in transit using TLS/SSL and at rest using AES-256.
              Access is restricted to authorized personnel via SSO and is logged and audited.
              OAuth tokens are stored in an encrypted secrets store.
            </p>

            <h3>How we retain and delete Google user data</h3>
            <p>
              Google user data fetched to fulfill a user request is retained for{" "}
              <strong>up to 14 days</strong> and then automatically deleted. You can revoke
              Pancake&apos;s access at any time from your Google Account&apos;s{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
              >
                Third-party apps with account access
              </a>{" "}
              page, or by emailing{" "}
              <a href={PRIVACY_EMAIL_URL}>{SUPPORT_EMAIL}</a>. On revocation or
              account deletion, all stored Google user data is deleted within 14 days, except
              where retention is required by law.
            </p>

            <h3>What we do not do with Google user data</h3>
            <ul>
              <li>We do <strong>not</strong> sell Google user data.</li>
              <li>
                We do <strong>not</strong> use Google user data for advertising, including
                personalized, retargeted, or interest-based advertising.
              </li>
              <li>
                We do <strong>not</strong> transfer Google user data to data brokers, or for
                credit-worthiness or lending purposes.
              </li>
              <li>
                We do <strong>not</strong> use Google user data to develop, improve, or train
                generalized or non-personalized AI/ML models. Anthropic, our model provider,
                does not train its models on Pancake customer data.
              </li>
              <li>
                Humans do not read Google user data except (a) with your explicit permission,
                (b) for security purposes (e.g., investigating abuse), (c) to comply with
                applicable law, or (d) where the data has been aggregated and anonymized for
                internal operations.
              </li>
            </ul>

            <h3>Limited Use disclosure</h3>
            <p>
              Pancake&apos;s use and transfer to any other app of information received from
              Google APIs will adhere to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>

            <h2>9. AI Agent and Connector Integrations</h2>
            <p>
              You can connect a supported AI client, such as ChatGPT, Codex, or Claude, to one
              Pancake workspace. The client sends specific tool requests to Pancake after you
              sign in, choose the workspace, and approve access.
            </p>
            <h3>Data sent to your AI client</h3>
            <p>
              Pancake returns only the workspace data needed for the tool you or the client
              invokes. The client may use that data to answer your prompt. Data sent to the
              client is then processed under that provider&apos;s own terms and privacy policy.
              Pancake does not receive your full third-party chat transcript unless the client
              includes part of it in a tool request.
            </p>
            <h3>Connection security and control</h3>
            <p>
              Each connection uses OAuth and is limited to the workspace you approve. Access
              and refresh tokens are stored only as one-way hashes. You can revoke a connection
              in Pancake under Settings → MCP → Connected clients.
            </p>
            <h3>Retention</h3>
            <p>
              Pancake keeps non-secret connection metadata while the grant remains active. Any
              feedback or workspace change made through a connected client is retained like the
              same change made in the Pancake web app. Pancake does not create a separate copy of
              your third-party conversation solely because you use the connector.
            </p>

            <h2>10. Demo Requests and Voice Calls</h2>
            <p>
              On{" "}
              <a href={`${SITE_ORIGIN}/demo`} target="_blank" rel="noopener noreferrer">
                {`${SITE_HOST}/demo`}
              </a>{" "}
              you can book a demo by filling in a short form or by talking to Pancake, our AI
              voice agent.
            </p>
            <h3>What we collect</h3>
            <ul>
              <li>
                <strong>Form answers:</strong> first and last name, work email, company website,
                team size, whether you have a Pancake account, and your main goal.
              </li>
              <li>
                <strong>Voice calls:</strong> the audio of the call, its transcript, and the
                answers the agent collects. A call starts only after you click &quot;Talk to
                our AI&quot; and allow your microphone. The call screen tells you that you are
                talking to an AI agent and that the call is recorded.
              </li>
              <li>
                <strong>Booking details:</strong> the meeting time you choose and anything you
                add on the booking page.
              </li>
            </ul>
            <h3>How we use it</h3>
            <p>
              We use this data to route you to the right meeting, prepare for it, and keep a
              record of our conversations with your company. We do not sell it or use it for
              advertising.
            </p>
            <h3>Who processes it</h3>
            <ul>
              <li>
                <strong>ElevenLabs</strong> runs the voice agent. It receives the call audio, the
                transcript, and the form answers you already typed, except your email address.
                The agent&apos;s language model runs through ElevenLabs. The call software loads
                from the jsDelivr content delivery network when you start a call.
              </li>
              <li>
                <strong>Calendly</strong> schedules the meeting. The voice agent reads open times
                from Calendly and opens the time you pick with your name, email, and answers
                filled in. You confirm the booking yourself.
              </li>
              <li>
                <strong>Attio</strong>, our CRM, and <strong>Slack</strong> and{" "}
                <strong>Airtable</strong>, where our team is notified of new requests, receive
                your form answers. The voice agent also posts a short summary of each call to
                our Slack, with a link to the call in ElevenLabs.
              </li>
            </ul>
            <h3>Retention</h3>
            <ul>
              <li>Call recordings and transcripts in ElevenLabs: deleted after 90 days</li>
              <li>
                Form answers, CRM records, and call summaries in our Slack: kept while we are in
                contact with you or your company, and deleted on request
              </li>
              <li>Bookings: kept in Calendly and our calendars as long as needed for the meeting</li>
            </ul>
            <p>
              To access or delete this data, contact{" "}
              <a href={PRIVACY_EMAIL_URL}>{SUPPORT_EMAIL}</a>.
            </p>

            <h2>11. Contact</h2>
            <p>For any questions or requests regarding your data, you can contact us at:</p>
            <p>
              <a href={PRIVACY_EMAIL_URL}>
                <strong>{SUPPORT_EMAIL}</strong>
              </a>
            </p>

            <h2>12. Changes to This Policy</h2>
            <p>
              This policy may be updated at any time. We encourage you to review it regularly.
              Significant changes will be communicated where appropriate.
            </p>
          </article>
        </section>
      </div>
      <LandingFooter />
    </main>
  );
}
