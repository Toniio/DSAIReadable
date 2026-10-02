---
"dsaireadable": patch
---

skills: The `dsaireadable` Claude Code plugin installs its skills from the release tag (`ref: vX.Y.Z` of a `github` source in `.claude-plugin/marketplace.json`), the version of the MCP server it starts, instead of a snapshot of `main` frozen at install time; `npx skills add Toniio/DSAIReadable#vX.Y.Z` in the README pins the skills the same way. Until the tag is pushed after a release, installing the plugin fails.
