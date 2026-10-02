---
"dsaireadable": patch
---

docs: The `conventions` registry item installs and links at the release tag, not at `main`: its install line reads `npx shadcn add Toniio/DSAIReadable/<item>#vX.Y.Z` and its spec link `blob/vX.Y.Z/specs/components/<Component>.md`, so an agent reads the specs of the release these rules were written for (a pinned install still reads the items it depends on from the default branch). The link of the MCP server's README to the repository README names the tag too, and `versions:sync` writes all of them. `versions:check` now fails on a link to `main` in anything a package or a registry item distributes.
