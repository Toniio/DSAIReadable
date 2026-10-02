# @dsaireadable/mcp-server

The [DSAIReadable](https://github.com/Toniio/DSAIReadable) design system as an
MCP server: components and their specs, tokens, page patterns, rules, UX
writing and a screen validator, for AI agents that write interfaces with it.

It runs on your machine over stdio. Nothing is hosted, and it needs Node.js 20
or later.

```bash
npx -y @dsaireadable/mcp-server
```

Claude Code:

```bash
claude mcp add dsaireadable -- npx -y @dsaireadable/mcp-server
```

Claude Desktop (`claude_desktop_config.json`) or VS Code (`.vscode/mcp.json`):

```json
{
  "mcpServers": {
    "dsaireadable": {
      "command": "npx",
      "args": ["-y", "@dsaireadable/mcp-server"]
    }
  }
}
```

Started inside a project, the server also serves that project's
`design/patterns/*.md` beside the design system's page patterns.

The tools, resources, prompts and the HTTP mode are documented in the
[repository README](https://github.com/Toniio/DSAIReadable/blob/v0.1.2/README.md#mcp-server).
