# Connect Pancake in your AI app

Version 2.1.0 · `https://pancake.ai/install.md`

Help the user connect Pancake in the app they are using. A chat app, a desktop
app, and a command-line coding agent can require different setup steps. Read this
document as guidance, not as a shell script. Follow only the relevant path.

The goal of this page is a working connection. If the user also requested their
first Play, return to [Pancake onboarding](https://pancake.ai/onboarding.md) after
verification. Installing a connector alone does not create a Play or install a skill.

## Start here

1. Discover any Pancake tools already available in this conversation, including
   tools supplied by an installed connector or plugin. If present, go directly
   to **Verify the connection**. Do not add a duplicate connection. Reuse only a
   connection to the server this guide names.
2. Identify the host application from reliable session information. “Claude” is
   not enough to distinguish Claude Chat from Claude Code. A terminal inside a
   chat sandbox does not mean that changing its files configures the user's app.
   If the host is unclear, ask one question: “Which app are you using?”
3. Prefer the host's existing Pancake connector/plugin or its native remote MCP
   connection settings. If a connection action is available to you and permitted,
   use it; let the user complete sign-in and consent. Do not assume a marketplace
   listing exists or that a model can modify its own host's settings.
4. If you cannot configure the host yourself, give the matching steps below,
   the server URL, and one clear next action. Pause for that action. Distinguish
   two permission failures: if only your sandbox/file access is restricted, the
   user may configure their own host manually; if a managed organization policy
   prohibits this connector, explain that an administrator must allow it. Do not
   propose another settings screen, CLI, or app as a way around that policy.

Use the user's language. Show the relevant path only, not this whole guide.

## Connection details

| Setting | Value |
| --- | --- |
| Name | Pancake (`pancake` in CLI examples) |
| Remote MCP server | `https://app.pancake.ai/api/mcp` |
| Transport | Streamable HTTP |
| Authentication | Browser OAuth with PKCE; scope `mcp` |
| Workspace | Selected by the user on Pancake's browser consent page |

Use the exact server URL, including `/api/mcp`. The workspace is not a URL
parameter. Pancake does not require the user to obtain an API key, supply an OAuth
client secret, paste a token into chat, or copy browser cookies. The host manages
credentials. Do not replace OAuth with a static Authorization header.

## Claude Chat, Claude Desktop, and Cowork

Use Claude's **remote connector** flow. Do not run `claude mcp add` or edit
`claude_desktop_config.json` to configure a Claude Chat connection.

1. Open [Customize → Connectors](https://claude.ai/customize/connectors).
   Connect an existing Pancake connector if one is listed. Otherwise choose
   **+ Add → Add custom connector**.
2. Enter **Pancake** and `https://app.pancake.ai/api/mcp`, then **Continue**.
3. Keep **Sign in now** and **Use Claude's published identity** when shown, then
   finish adding the connector. Pancake uses OAuth; leave static headers empty.
4. Complete Pancake sign-in, select the intended workspace, and approve access.
5. Enable Pancake for the conversation under **+ → Connectors**. If it does not
   appear in the current conversation, start a new chat and paste the user's
   original request again (see below). Then verify with a real Pancake read.

If adding a connector is unavailable, explain the specific limit shown. A Team
or Enterprise member may need their owner or authorized administrator to add it
first in **Organization settings → Connectors**. The member then connects it
with their own Pancake account. Do not tell them to weaken policy or buy an
upgrade without establishing that their account requires it.

[Official Claude connector instructions](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)

## ChatGPT

Use ChatGPT's **plugin / custom MCP server** flow. Do not run Codex commands in
a ChatGPT execution sandbox: they do not configure ChatGPT's connectors.

1. Open [ChatGPT Plugins](https://chatgpt.com/plugins). Reuse an existing Pancake
   plugin if available; otherwise choose **+ / Add → Add custom MCP server**.
2. Name it **Pancake** and enter `https://app.pancake.ai/api/mcp` as the public
   MCP endpoint. Select **OAuth** and keep the detected defaults.
3. Review the connection notice and choose **Create as a plugin**. Install it,
   complete Pancake sign-in, select the intended workspace, and approve access.
4. Start a new chat, type **@**, and select Pancake. Paste the user's original
   request again (see below) and verify with a real Pancake read.

If the option is absent or blocked, use the web app and check the account's
custom-plugin policy. Explain when an administrator must enable or install it.
Do not invent a missing button, promise access on every plan, or repeatedly send
the user through the same unavailable flow. UI labels can vary; use the host's
current help if these labels differ.

[Official ChatGPT connection instructions](https://developers.openai.com/plugins/deploy/connect-chatgpt)

## Codex: app, IDE extension, or CLI

Reuse an existing native connector or MCP entry first. In an app or IDE, prefer
its MCP/connector settings when available. In the Codex IDE extension, the
documented path is **gear menu → MCP servers → Add server**, with **Streamable
HTTP**, the URL above, and **Authenticate** when offered; if it asks for an
OAuth client ID or resource, use the values in the command below. Restart the
extension if requested.

Pancake does not support Dynamic Client Registration, so a URL alone fails with
"Dynamic client registration not supported". Codex needs Pancake's public client
ID and the resource too. For a local Codex installation, if you have permission
to configure it, inspect `codex mcp --help` and `codex mcp list` first. If no
entry for this URL exists:

```sh
codex mcp add pancake \
  --url https://app.pancake.ai/api/mcp \
  --oauth-client-id https://app.pancake.ai/.well-known/mcp-clients/pancake-cli.json \
  --oauth-resource https://app.pancake.ai/api/mcp
```

`codex mcp add` starts the browser sign-in itself. Afterwards, run
`codex mcp list`. If the **Auth** column for `pancake` reads `OAuth`,
sign-in is complete: do not run it again. Only if it reads `Not logged in`
(for example, the user closed the sign-in), run:

```sh
codex mcp login pancake
```

Running `codex mcp add` again under an existing name replaces that entry. Never
do it for a working entry. If an existing `pancake` entry for this same
URL fails with "Dynamic client registration not supported", it was added with
the URL only: run the full command above under the same name to give it the two
OAuth values, then check `codex mcp list` again.

The **Auth** column shows registration and sign-in, not tool access.
Preserve other entries and the user's configuration scope. If `pancake` already
names another server, use an unused name consistently. If the CLI is absent,
only your execution sandbox lacks file permissions, or the command would affect
a remote runner rather than the user's host, guide them through the connection
settings of their own installation. Do not transfer the IDE's exact menu labels
to the desktop app without checking its current UI/help. If a managed policy
blocks adding Pancake, the next step is administrator approval; do not suggest
retrying the same prohibited setup through the UI. Do not install Codex just to
configure a different app.

[Official Codex MCP instructions](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)

## Claude Code

Reuse any existing Pancake connection, including a connector inherited from
Claude or a plugin. For local CLI setup, inspect `claude mcp --help`. If no
equivalent connection exists and configuration is permitted:

```sh
claude mcp add --transport http --scope user pancake https://app.pancake.ai/api/mcp
```

This makes the entry available across the user's projects. Respect an explicitly
chosen different scope; never replace an entire existing configuration file.
Ask the user to open **`/mcp` inside Claude Code**, select Pancake, and authenticate.
`/mcp` is an interactive client command, not a shell command. Inspect registration
with `claude mcp get pancake`, then verify tool access.

If setup is blocked, show these steps for the user to perform in their own
Claude Code session. Do not redirect them to Claude Chat unless they choose to
switch apps.

[Official Claude Code MCP instructions](https://code.claude.com/docs/en/mcp)

## Other agents: general case

For OpenCode, Pi, VS Code, GitHub Copilot CLI, Factory Droid, goose, or another
agent, use its native **Add MCP server / connector** flow when available. Choose
remote Streamable HTTP, the server URL above, and browser OAuth. Inspect the
installed version's help or official documentation before writing configuration.
Do not copy another client's configuration shape or assume that “supports MCP”
means it supports this authentication flow.

Pancake currently supports OAuth Client ID Metadata Documents (CIMD), rather
than Dynamic Client Registration (DCR). A client that only supports DCR cannot
complete this setup. If a local client requires an explicit public OAuth client
ID and its documented callback is compatible, Pancake provides:

```text
https://app.pancake.ai/.well-known/mcp-clients/pancake-cli.json
```

This is public client metadata, not a secret. Read its current allowed callback
URIs and check the client's callback behavior before using it. It is not a
general registration for arbitrary hosted callbacks. A browser-hosted agent
needs its own compatible client identity; do not give it the CLI identity as a
workaround.

Some clients, including Pi, need an MCP extension. Establish the installed
extension's transport and OAuth capabilities first. Do not install arbitrary
bridges or extensions to get past a compatibility failure. Cursor is not a
documented compatible option for Pancake at present. Do not promise support
without verifying the actual version and completing OAuth and a tool read.

If the client cannot connect, name the missing capability and offer a supported
client or [Pancake in the browser](https://app.pancake.ai/welcome). Let the user
choose. Do not claim compatibility from a saved configuration alone.

## Verify the connection

1. Let the user finish browser sign-in and consent themselves. If the client
   provides an authorization link but cannot open it, show that link. Do not
   claim that a browser opened unless the client reports it.
2. Discover Pancake's tools in **this conversation**. Refresh/reload connections
   if supported; otherwise explain that a new conversation or restart is needed.
3. Call an available **read-only workspace tool**, such as `workspace_get`.
   Show the returned workspace name and ask the user to confirm it is the
   workspace they mean (for Pancake onboarding, the one their welcome page names).
   When identity is unclear, ask rather than choosing among similarly named
   workspaces. Onboarding then checks its own welcome before any write.
4. If the workspace is wrong, stop workspace actions and guide the user to switch
   or reconnect to the intended one. If a read fails, explain the actual error.
   Do not write data, create a Play, start a search, or send a message to test setup.
5. Say **connected and verified** only after that authenticated read succeeds.
   Distinguish “connection added,” “sign-in pending,” and “tools not available in
   this conversation” when verification has not happened.

If the client needs a new conversation to expose the tools, ask the user to start
one and paste their original request again. For Pancake onboarding, that is the
sentence from their welcome page:

> Help me get started with Pancake by following https://pancake.ai/onboarding.md.

Do not add credentials, Brain contents, or invented references to it. The new
conversation must read Pancake's saved state; a pasted request is not proof of
completed setup.

If the request was installation only, finish after verification. If it was
onboarding, continue with [onboarding.md](https://pancake.ai/onboarding.md).
Manual connection management is also available in
[Pancake → Connect your AI](https://app.pancake.ai/workspace/mcp).
