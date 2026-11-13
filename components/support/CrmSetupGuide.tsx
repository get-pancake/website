import Link from "next/link";
import Image from "next/image";

import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { SUPPORT_EMAIL, SUPPORT_EMAIL_URL } from "@/lib/contact";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/landing-v3/legal.css";
import "@/app/_styles/landing-v3/crm-guide.css";

export function CrmSetupGuide({ provider }: { provider: "attio" | "hubspot" }) {
  const isAttio = provider === "attio";
  const name = isAttio ? "Attio" : "HubSpot";
  const contact = isAttio ? "people" : "contacts";

  return (
    <main className="lp">
      <LpNav />
      <section id="main-content" tabIndex={-1} className="lp-legal" aria-labelledby="crm-guide-heading">
        <article className="lp-legal__body">
          <p><Link href="/support">Support</Link> / CRM connections</p>
          <h1 id="crm-guide-heading">Connect {name} to Pancake</h1>
          <p>
            Send leads you select from a Pancake Play to {name} {contact}, with their
            companies when enabled. Choose the fields to send and follow each lead’s result.
            Pancake checks for existing records before creating new ones and keeps existing
            records unchanged.
          </p>

          <h2>Before you start</h2>
          <ul>
            <li>A Pancake workspace with the {name} integration enabled. CRM connections are currently in a limited pilot. If you cannot see {name} in Integrations, contact <a href={SUPPORT_EMAIL_URL}>{SUPPORT_EMAIL}</a>.</li>
            <li>{isAttio ? "An Attio workspace administrator who can approve the connection." : "A HubSpot account and a user allowed to install apps and access contacts. Ask a HubSpot Super Admin if you need help with permissions."}</li>
            <li>A lead in a Pancake Play, with an email or a LinkedIn profile mapped to a suitable {name} field.</li>
          </ul>
          <p>
            Pancake’s subscription and trial are described on the <Link href="/pricing">pricing page</Link>.
            You also need your own {name} account; its plan and permissions determine which fields and objects are available.
          </p>

          <h2>Watch the walkthrough</h2>
          <p>This captioned screen recording uses fictional leads in a test workspace and a real {name} sandbox. It covers authorization, mapping, export, duplicate detection and disconnection.</p>
          <video className="lp-crm-guide__media" controls preload="none" width={1280} height={800} poster={`/integrations/${provider}/results.png`} aria-label={`Pancake and ${name} integration walkthrough, with written captions`}>
            <source src={`/integrations/${provider}/walkthrough.mp4`} type="video/mp4" />
            <a href={`/integrations/${provider}/walkthrough.mp4`}>Download the captioned {name} walkthrough</a>
          </video>
          <p>The steps below provide the text equivalent of the walkthrough.</p>

          <h2>1. Connect your account</h2>
          <ol>
            <li>Sign in to <a href={`https://app.pancake.ai/workspace/integrations/${provider}`}>Pancake</a> and choose the workspace you want to connect.</li>
            <li>Open Settings → Integrations → {name}, then select Connect.</li>
            <li>{isAttio ? "Choose the correct Attio workspace on the authorization screen." : "Choose the correct HubSpot account, then select Choose Account."}</li>
            <li>{isAttio ? "Review record read/write and object configuration read access, then select Confirm." : "Review contact read/write access. Company read/write access is optional and is needed to send companies. Select Connect app."}</li>
            <li>When you return to Pancake, check the connected account name. Use Check connection to verify access.</li>
          </ol>
          <p>
            You authorize Pancake on {name}’s own sign-in page. Do not paste your {name} password or API key into Pancake.
            If you cancel, return to Integrations and start the connection again.
          </p>
          <Image className="lp-crm-guide__media" src={`/integrations/${provider}/connected.png`} width={5120} height={2880} sizes="(max-width: 767px) 100vw, 736px" alt={`Pancake shows a connected ${name} sandbox, with Check connection, Reconnect and Disconnect actions.`} />

          <h2>2. Choose what Pancake sends</h2>
          <p>
            In What Pancake sends, each row shows a Pancake field and its destination in {name}.
            Review the suggested name, job title and LinkedIn fields. Choose Not sent for a field you do not want to export.
            Email is used to match contacts. A suitable LinkedIn field is needed to send a lead without an email.
          </p>
          <p>
            Enable Send the lead’s company too to find a company by domain, create it when needed,
            and associate a newly created contact. Review the company name mapping, then select Save fields
            if you changed the suggestions. Use Read fields again after changing fields in {name}.
          </p>
          {isAttio ? (
            <p>Attio can also create or associate a company automatically from a person’s email domain, even when Pancake’s company option is off. This is Attio’s own behavior.</p>
          ) : (
            <p>If company access was not granted, contacts can still be exported without companies. Reconnect and grant the optional company permissions if you want to include them.</p>
          )}
          <Image className="lp-crm-guide__media" src={`/integrations/${provider}/mapping.png`} width={5120} height={2880} sizes="(max-width: 767px) 100vw, 736px" alt={`Pancake contact and company fields mapped to ${name}, including the option to send companies.`} />

          <h2>3. Export selected leads</h2>
          <ol>
            <li>Open a Play’s Leads page and select the leads to send.</li>
            <li>Use Send to… in the selected-leads toolbar, choose {name}, and review the number of leads in the preview before confirming.</li>
            <li>Follow the export results. You can leave the page while Pancake processes the export.</li>
            <li>Open a successful result’s record link to see the person or contact in {name}.</li>
          </ol>
          <p>
            The page’s Export menu can send the leads on the current tab. To send only a selection, use the selected-leads toolbar instead.
            Exports are started by you; connecting a CRM does not automatically export all your leads.
            Re-exporting a lead that Pancake can identify in {name} links the existing record instead of creating another.
            Pancake does not overwrite an existing record or import {name} records into Plays.
          </p>
          <Image className="lp-crm-guide__media" src={`/integrations/${provider}/results.png`} width={5120} height={2880} sizes="(max-width: 767px) 100vw, 736px" alt={`Two fictional demo leads were added to ${name}; each result has a link to the contact and company.`} />

          <h2>Data and permissions</h2>
          <ul>
            <li><strong>{isAttio ? "People" : "Contacts"}:</strong> Pancake reads records to match identities and writes new records with the fields you mapped.</li>
            <li><strong>Companies:</strong> when enabled and permitted, Pancake reads records to match domains and creates companies when needed.</li>
            <li><strong>Field definitions:</strong> Pancake reads the available fields so you can choose valid destinations. {isAttio ? "Object configuration access is read-only." : "The integration does not request permission to create or change your property definitions."}</li>
          </ul>
          <p>
            Reading and writing CRM records supports the export and duplicate checks. It is not a continuous two-way sync.
            OAuth credentials are stored encrypted. Export history is kept in Pancake for 90 days.
            See the <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms of Service</Link>.
          </p>

          <h2>When a lead needs attention</h2>
          <ul>
            <li><strong>Missing identity:</strong> provide an email or map an available LinkedIn profile. Exporting does not automatically buy email enrichment.</li>
            <li><strong>Several matches:</strong> resolve the duplicate identities in {name} before trying again. Pancake does not choose an arbitrary record.</li>
            <li><strong>Connection expired or access removed:</strong> use Reconnect in Integrations, with an authorized {name} account.</li>
            <li><strong>Field unavailable:</strong> use Read fields again, correct the mapping and save it.</li>
            <li><strong>Result not confirmed:</strong> check {name} before sending again, because the record may already have been created.</li>
          </ul>

          <h2>Disconnect and remove access</h2>
          <p>
            In Pancake, open Settings → Integrations → {name} → Disconnect and confirm.
            This removes the stored connection for this Pancake workspace and stops new exports through it.
            Records already created in {name} remain there; a request already in progress may still complete.
          </p>
          <p>
            {isAttio
              ? "To remove the app’s authorization in Attio, an administrator can uninstall Pancake from the workspace’s connected apps. This can affect other Pancake workspaces using that authorization."
              : "Disconnecting in Pancake does not uninstall the app from the whole HubSpot account. To revoke it account-wide, a HubSpot administrator can open Settings → Integrations → Connected Apps, choose Pancake and uninstall it. This affects every Pancake workspace connected through that installation. Existing HubSpot records remain."}
          </p>
          <p>Reconnect from Integrations when you want to resume exporting. Review the account and mapping before the next export.</p>

          <h2>Get help</h2>
          <p>
            Email <a href={SUPPORT_EMAIL_URL}>{SUPPORT_EMAIL}</a> with the provider name, approximate time and visible result.
            Never send passwords, OAuth codes, tokens, magic links or API keys. Avoid including customer lead data.
          </p>
        </article>
      </section>
      <LpFooter />
    </main>
  );
}
