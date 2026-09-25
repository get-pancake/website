# Connect your agent to Pancake

These are instructions for the coding agent reading this file. Configure Pancake
in the client running this session, then help the user sign in. This is Markdown,
not a shell script: read it and execute only the setup steps for that client.

## Connection details

- Server name: `pancake`
- MCP URL: `https://app.pancake.ai/api/mcp`
- Transport: Streamable HTTP
- Authentication: browser-based OAuth with PKCE; scope `mcp`
- Workspace: the user selects it during browser consent, not in the server URL.

Pancake does not issue a workspace API key for this setup. Do not ask the user to
paste a token, copy browser cookies, or add a static Authorization header. Let the
client manage OAuth credentials and refresh them.

## Before configuring

1. Identify the current client and inspect its existing MCP configuration. Use its
   installed CLI help or official documentation to check version-specific syntax.
2. Reuse an existing connection to this URL, including one supplied by a Pancake
   plugin. Do not register a duplicate. If `pancake` names a different server,
   choose an unused name and use it consistently below.
3. Preserve other servers, settings, and credentials. Merge only the new entry;
   never replace an entire configuration file. Respect the user's chosen scope
   and the client's configuration permissions.

## Codex

If no existing connection was found, run:

```sh
codex mcp add pancake --url https://app.pancake.ai/api/mcp
```

Then, if authentication is still needed:

```sh
codex mcp login pancake
```

Use `codex mcp list` to inspect registration. A registered server is not yet proof
that this session can use its tools; complete the verification below.

Reference: [Codex MCP documentation](https://developers.openai.com/codex/mcp).

## Claude Code

If no existing connection was found, run:

```sh
claude mcp add --transport http --scope user pancake https://app.pancake.ai/api/mcp
```

This uses the user's configuration across projects. If the user requested project
scope, use `--scope project` instead and preserve the existing `.mcp.json`.

Ask the user to open `/mcp` in Claude Code, select Pancake, and authenticate.
`/mcp` is an interactive client command, not a shell command. Use
`claude mcp get pancake` to inspect registration.

Reference: [Claude Code MCP documentation](https://code.claude.com/docs/en/mcp).

## OpenCode, Pi, and other clients

Do not assume every client can connect from the URL alone. It must support remote
Streamable HTTP and compatible browser OAuth, directly or through an extension.

Pancake supports OAuth Client ID Metadata Documents (CIMD), not Dynamic Client
Registration (DCR). For a local CLI that needs an explicit public OAuth client ID
or client metadata URL, use:

```text
https://app.pancake.ai/.well-known/mcp-clients/pancake-cli.json
```

This URL is public metadata, not a secret. It allows loopback callbacks with paths
`/callback`, `/oauth/callback`, or `/oauth2callback` and a variable port. It is not
a registration for arbitrary hosted callbacks. Check the client's callback and
OAuth support before configuring it; do not invent a client secret.

- **OpenCode:** inspect the installed version's configuration format. Configure a
  remote server with the MCP URL and, when required, the public metadata URL as
  `oauth.clientId`. Keep OAuth enabled and request scope `mcp`. Start browser
  authentication with `opencode mcp auth pancake`. Versions that rely on DCR alone
  cannot complete Pancake's flow. See the
  [OpenCode MCP documentation](https://opencode.ai/docs/mcp-servers/).
- **Pi:** MCP is extension-provided. Inspect the installed MCP extension first;
  its configuration keys and authentication commands vary. It needs Streamable
  HTTP, PKCE, and CIMD or an explicit client ID with a compatible callback. If no
  compatible extension is installed, explain the requirement and follow the
  user's package-install permissions before adding one. See
  [Pi's extension model](https://pi.dev/).

These are compatibility requirements, not a claim that every client version or
extension has been tested. If the installed client cannot meet them, explain the
specific limitation and offer Codex or Claude Code as the documented alternatives.

## Sign in and verify

1. Let the user complete browser sign-in, choose their workspace, and approve
   access. If the client cannot open a browser, show its authorization link and
   follow its documented callback flow. Do not approve consent on the user's behalf.
2. Reload the client's MCP connections if supported. If tools are only loaded at
   startup, tell the user to restart the client and resume verification.
3. Use the client's MCP tool discovery to list Pancake's available tools. If a
   suitable read-only workspace or profile tool is available, call it to confirm
   access. Do not send messages, start campaigns, or change workspace data to test.
4. Report what was configured, whether sign-in completed, and whether tools are
   available in this session. If a step is still pending, give the exact next
   action instead of claiming setup is complete.

The MCP connection exposes Pancake tools. It does not itself install a workflow
skill or plugin. Existing Pancake plugins can remain the source of that guidance.

For manual setup or connection management, open
[Pancake's MCP settings](https://app.pancake.ai/workspace/mcp).
