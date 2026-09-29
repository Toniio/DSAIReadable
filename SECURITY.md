# Security policy

## Reporting a vulnerability

Report it privately through GitHub: the repository's **Security** tab, then
**Report a vulnerability**
([direct link](https://github.com/Toniio/DSAIReadable/security/advisories/new)).
Do not open a public issue or pull request for it.

Describe what an attacker can do, the affected file or registry item, and the
steps to reproduce. The follow-up happens in the draft advisory the report
opens; the advisory is published once the fix is merged.

## Supported versions

Only `main` is supported. There are no released versions yet: registry items
install from `main`, and a fix lands there.

## Scope

| In scope                                                                                                                                                          | Out of scope                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| The MCP server (`mcp-server/`), in stdio mode and in HTTP mode with its defaults (loopback interface, `Origin` check, session expiry and limit)                   | The MCP server in HTTP mode exposed beyond the loopback interface through `MCP_HOST`        |
| The code the shadcn registry installs: the components, `lib/`, the tokens and the `conventions` rules — for example, a rule that steers an agent into unsafe code | Vulnerabilities in a dependency with no path through this code: report them to that project |
| The repository's scripts, hooks and CI workflows                                                                                                                  |                                                                                             |
