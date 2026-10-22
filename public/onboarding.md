# Create your first Pancake Play in your AI app

Version 1.2.0 · `https://pancake.ai/onboarding.md`

Help a user continue their Pancake welcome after checkout: connect their AI app,
understand their business from Pancake, agree one useful first Play, create it
once, and show its actual progress. Offer a short tour afterward.

Use the user's language. Explain each next action simply. The user should not
need to learn tool names, install a skill, or move back and forth between this
guide and their chat. This is an existing paid workspace: do not restart company
research onboarding, create a workspace, or send them through checkout again.

The user reached this guide from one sentence on Pancake's welcome page.
Everything you need is in this guide and in Pancake's own tools: do not ask the
user for IDs, references, or other technical details.

## 1. Connect, or reuse the connection

If Pancake tools are already available, use an authenticated read to verify the
workspace. Otherwise read [install.md](https://pancake.ai/install.md) and follow
the path for the actual host: Claude Chat/Desktop/Cowork, ChatGPT, Codex, Claude
Code, or another compatible agent. Native connectors come before CLI setup.

If you cannot install a connection yourself, explain exactly where the user
should click and provide the server URL: `https://app.pancake.ai/api/mcp`. Pause for sign-in or
administrator action. If a new conversation is required, tell the user to start
one and paste the same sentence from Pancake's welcome page:
`Help me get started with Pancake by following https://pancake.ai/onboarding.md.` The new
conversation resumes from Pancake's saved state. Continue this onboarding after
connection; installation is only the first step.

If a documentation URL cannot be read, say so. Use the host's supported connector
flow and any Pancake tool guidance already available. If the required guidance
is still unavailable, ask the user to paste the page or open **Show connection
steps** on [their Pancake welcome page](https://app.pancake.ai/welcome).
Do not pretend to have read the page or invent its instructions.

## 2. Resume the correct welcome

Discover tools by their descriptions; the host may prefix their names. First
confirm the connection: it must be to `https://app.pancake.ai/api/mcp`, and a read-only workspace
call such as `workspace_get` must succeed through it. Tell the user which
workspace it reached and ask them to confirm it is the one their Pancake welcome
page names. That page also confirms the connection by itself once your
authenticated read reaches its workspace.

Then call `postboarding_get_context` with `includePlaybook: true`. The
authenticated connection resolves the user's own welcome: pass a `reference`
only when the user's message contains a `wel_…` reference from an older Pancake
prompt, and never invent one.

If the tool says no welcome is open for this connection, refuses a reference, or
the user says the workspace is wrong, stop before any write. Help them reconnect
Pancake and approve the workspace they are setting up; do not switch to another
workspace to get around it. When identity is unclear, ask rather than choosing
among similarly named workspaces.

Read `session`, `allowedActions`, `capabilities`, `brief`, `firstPlay`,
`uiFirstPlay`, `nextStep`, and the returned **versioned playbook**. Follow that
playbook's current tool contract and the live schemas. It is the canonical
workflow, including any newer version than an installed skill. This public page
provides the entry point and user experience; it does not replace server state.

If the postboarding tools are missing, refresh tool discovery once after
verification when the host supports it. If still absent, explain that this
connection does not expose the welcome workflow. Offer to resume at
[Pancake Welcome](https://app.pancake.ai/welcome), check the selected workspace,
or retry after refreshing the connection. Do not create a Play with generic
tools as a workaround for a missing or rejected active welcome.

Resume instead of restarting:

- If a first Play already completed this welcome, show that Play and offer the
  remaining tour. Do not create another one.
- If creation is in progress, recover it using the playbook's documented
  confirmation/retry operation and saved brief revision. Do not start a second
  operation or ask the same questions again.
- If a first Play already exists from the UI, follow the server's adoption path.
- If the user previously deferred, acknowledge that choice; do not start creating
  a Play without a new request. Follow the server's guidance for continuing later.
- Otherwise acknowledge the handoff through `postboarding_advance`, using the
  current revision, returned playbook version, and the supported client value.
  Use `claude_code` for Claude Code, `codex` for Codex, and `other` for Claude
  Chat, ChatGPT, and other hosts; do not invent enum values.

## Before the first Play: connect LinkedIn — highly recommended, optional

Offer this early, after confirming the workspace and acknowledging the handoff, before asking for the first Play's brief. Explain in the user's language: "I highly recommend connecting your LinkedIn account now, so it is ready when you want to contact the people your Play finds. You will sign in securely in your browser. We can also skip this and create your Play now." Connecting is optional: finding leads and creating a Play do not require it. Never promise it will improve lead search or send messages by itself.

1. Read `campaign_list_linkedin_accounts`. If the intended account is already `connected`, acknowledge it and continue without opening a new sign-in. If there are several accounts or the displayed account may belong to a colleague, ask which account the user means; never choose or reconnect someone else's account by assumption.
2. If they agree to connect, call `campaign_start_linkedin_connect` when available. For a first account, omit arguments. To resume a pending sign-in or reconnect a known account, use that account's `senderId`; use `newSender: true` only if they explicitly want an additional account. Do not ask the user to type an ID. This uses an available LinkedIn licence; if none is available, explain the returned limitation and offer to skip. Never buy a licence for them.
3. Give the returned `url` as a clickable **Connect LinkedIn** link. Tell them to open it in their own browser, sign in to the LinkedIn account they intend to use, and complete any verification LinkedIn requests there (for example a code, app approval or CAPTCHA). Never request or handle passwords, cookies or verification codes in chat. Treat this temporary link as private: do not put it in analytics, logs, the Brain or a shared document.
4. Ask them to return to this conversation when finished. Read `campaign_get_sender_status` with the returned `senderId`. Only a `connected` status confirms success; a generated link, an opened browser page, a redirect or the user's "done" alone does not. If it is still connecting, explain that confirmation is pending, wait briefly and check once more; then offer to continue with the Play and check later instead of blocking onboarding.
5. If the link expired, request another for the same `senderId`. If sign-in or verification fails, help them retry in the browser. If the tool is missing after refreshing discovery once, or reports an unavailable connection flow, point them to [Pancake Settings → LinkedIn accounts](https://app.pancake.ai/workspace/linkedin): select **Connect LinkedIn** (or reconnect the intended account), complete sign-in in the page that opens, then return here. The welcome may keep settings locked: in that case offer to skip and connect after entering the app. Do not bypass the welcome or switch workspaces.

A "skip", "later" or refusal immediately continues the first-Play setup. Do not repeatedly offer it in this conversation or use the welcome's `defer` move: that defers the Play, not LinkedIn. On a resumed welcome, keep the saved brief and first Play, check existing connection state, and respect any known skip; do not restart completed setup just to add this step. A connection does not authorize enrolling leads or editing sequences. Before reconnecting an account already used for outreach, explain that previously queued outreach may resume when it reconnects.

## 3. Make it personal with the context Pancake already has

Read the Brain with `brain_get` and existing Plays with `plays_list`. In two
sentences, explain what Pancake understands about the business and its buyers.
Invite corrections. If research is still running, identify what is missing and
continue with the information available; do not treat guesses as researched facts.

Ask only what is missing, one question at a time. Usually two to four questions
are enough, fewer when the Brain or user's request already answers them:

- What outcome matters first, and who should this Play find: people or companies?
- Which targeting criteria and exclusions matter for this first audience?
- How many new leads should each search keep?
- Should the first search run now, and should this be a one-off or repeat on a
  schedule they choose?

Do not ask for the company URL again when Pancake already knows it. Keep the
user's actual criteria, exclusions, quantities, and question/answer history.
An employee count is not a lead limit. Do not silently broaden targeting or
default to a recurring daily search. If offering a default lead count, identify
it as a proposal and include it in the confirmation.

Save each meaningful answer using the playbook's `save_brief` move and the latest
session revision, so another conversation can resume. Preserve the verbatim ask
and turns in their defined fields. If a criterion is unsupported, explain that
and agree a change with the user rather than dropping it.

## 4. Propose one Play, then get confirmation

Name one Play after the audience it will find and explain why it is useful for
this business. Follow the returned `capabilities.firstPlayLifecycle`:

- **coded:** Pancake prepares and checks the search from the saved brief. Do not
  invent a manual sample-approval step or promise instant results.
- **unknown or unavailable:** explain the returned limitation and use the
  documented next action. Keep the brief and wait or defer setup; never fall back
  to a legacy Play or guess which creation API to call.

Before creation or launch, show one concrete summary: audience, exclusions, new
leads per search, first search now or later, recurrence, and the credit estimate
or spending limit reported by the available tools. Use the live credit mode and
spend guidance; never equate a balance with a price or promise that a paid search
is free. If the necessary cost information is unavailable, resolve it before
launch rather than inventing an estimate.

Ask the user to confirm this proposal. A request to get onboarded does not by
itself approve an unspecified recurring search or credit spend. If the brief
changes after confirmation, save it and confirm the new revision. If they want
to do this later, use the documented `defer` move and give the app link.

## 5. Create or recover exactly one first Play

After confirmation, use `postboarding_confirm_first_play` with the confirmed
`briefRevision`. New Plays use the coded lifecycle and its ordinary credit
authorization. Historical confirmations retain their saved launch for replay.
Follow the returned playbook; do not substitute ordinary Play creation for this
welcome operation.

The server owns idempotency. Re-pasting the prompt, opening another chat, or
retrying must resume this same operation and Play. If a revision conflicts,
re-read the context and resolve the change; do not blindly resend stale values.
If a request times out, inspect the saved state before retrying. Use the documented
recovery path for a claimed operation; do not lose a previously confirmed plan.

Never bypass a refusal, rejected workspace, missing capability, or credit limit.
Explain the specific next action. A tool call attempted is not a Play created.

## 6. Show the first value and offer a short tour

Read the saved first Play through `postboarding_get_context` and `plays_get`.
Show its returned link and actual status: preparing, searching, results, no
results, or needs attention. While preparing, say what Pancake is doing; do not
invent leads or claim the first search has finished. For results, use available
lead reads to show why the leads match. For zero results, offer a targeting
revision with the user rather than widening it automatically.

Offer an optional, short tour using this same Play, one topic at a time:

| Topic | Make the value concrete |
| --- | --- |
| Brain | Show the ICP and how user corrections can improve future searches. |
| Plays | Explain this audience, its search cadence, and how to pause it. |
| Leads | Show actual matches and explain how the user can review them. |
| Research | Show available evidence for a lead; explain any paid lookup before doing it. |
| Sequences | Explain how reviewed leads can enter an outreach sequence. Do not enroll or send as a demonstration. |
| Integrations | Show which delivery/account connections this workspace actually supports and where the user connects them. |

Record shown/skipped topics and finish the walkthrough through the supported
welcome moves. Skip or stop when the user prefers. Brain edits, extra paid
lookups, schedule changes, and outreach require their own relevant user request
or confirmation. Connection and onboarding do not authorize those automatically.

End with the first Play's link, its current state, and one useful next action.
Success means the same personalized Play was actually saved, or the user
explicitly deferred. A copied prompt, OAuth consent, and a finished tour alone
do not establish that outcome.
