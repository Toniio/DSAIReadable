# AGENTS.md — MCP server

Complements the [root `AGENTS.md`](../AGENTS.md), which remains the reference:
this file only adds what is specific to `mcp-server/` and never contradicts it.
A contradiction between the two is a bug to report.

The server exposes the design system to agents: **16 tools** (`src/tools/`, each named `dsaireadable_*`),
**3 resources** (`src/resources/index.ts`) and **5 prompts**
(`src/prompts/index.ts`). It never reads the sources on the fly: it serves a
precompiled JSON cache, `context/*.json`.

---

## 1. The context cache is generated

```
specs/components/*.md  specs/foundations/*.md  specs/patterns/*.md
tokens/*.json  design-system.index.json  components/ui/*.tsx
package.json  mcp-server/package.json  registry.json
        ↓ npm run generate-context   (src/context/generate.ts)
mcp-server/context/*.json            16 files — NEVER EDIT BY HAND
        ↓ loadContext()              (src/lib/context.ts)
tools and prompts
```

- A wrong answer from a tool is fixed **at the source** (the spec, the token)
  or **in the generator**, never in the JSON.
- After any change to one of the sources above: run `npm run generate-context`
  and commit the result. The `context-freshness` CI job fails on the slightest
  drift.
- `loadContext()` throws when a file is missing or corrupt. Do not replace that
  with a silent fallback (`{}`): an empty cache looks like an empty design
  system, and the agent answers wrongly with confidence.

## 2. Commands

From the root of the repository:

```bash
npm run generate-context   # regenerates context/*.json — zero diff expected when nothing changed
npm run mcp:test           # the server's suite (src/test.ts)
UPDATE_SNAPSHOTS=1 npm run mcp:test  # accepts a change to the build_screen prompt (snapshot); review it in the diff
npm run typecheck:mcp      # tsc on mcp-server/ (part of typecheck:all)
npm run mcp:start          # stdio server
npm run mcp:start:http     # HTTP server, 127.0.0.1:3100 by default
```

⚠️ `npm ci` at the root **does not install** `mcp-server/`. After cloning or
copying the repository: `npm ci --prefix mcp-server`. A `node_modules` copied
from another machine breaks `generate-context` (an esbuild binary built for
another platform): delete it and reinstall.

## 3. Server-specific rules

| Rule                                                                                                                                                                                                                                                                                                                            | Why                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Every fix to the generator or to a tool adds a test to `src/test.ts`, and that test must fail without the fix**                                                                                                                                                                                                               | Parser bugs (cva variants, spec tables) served wrong data while no check turned red                                                                                                                 |
| **Every `dsaireadable_validate_screen` rule has its negative fixture** (`NEGATIVE_FIXTURES` in `src/test.ts`)                                                                                                                                                                                                                   | A rule never seen failing may detect nothing                                                                                                                                                        |
| **Parse Markdown by structure, not by position**: tables by header, escaped `\|` respected                                                                                                                                                                                                                                      | The specs are formatted by Prettier and hold several tables per section                                                                                                                             |
| **Versions and identity come from `ds-metadata.json`**, which names the source of each field (`sources`): `design_system_version` ← `design-system.index.json`, `mcp_server_version` ← `mcp-server/package.json`, `registry_source` ← `registry.json`, `stack` ← `package.json`; no literal version in the served code (tested) | A hard-coded version is wrong from the first bump                                                                                                                                                   |
| **Every tool is declared with `registerTool`, `annotations: READ_ONLY` and an `outputSchema`** (`src/lib/output-schemas.ts`, strict objects), **and answers with `result()`** (`structuredContent` plus the same JSON as text)                                                                                                  | Without annotations, the MCP spec assumes a destructive, open-world tool; the output schema is the contract the server validates each answer against, and test 13 calls every tool with every input |
| **A tool that finds nothing returns `notFound()`** (`isError: true` plus the accepted values); **every tool has its case in `TOOL_CASES`** (`src/test.ts`): one content assertion, one error case                                                                                                                               | An `{ error }` without `isError` reads as a successful answer; a tool added without a case is checked by nothing                                                                                    |
| **HTTP bound to `127.0.0.1` by default**; `MCP_HOST` and `MCP_ALLOWED_ORIGINS` are only widened deliberately                                                                                                                                                                                                                    | The server has no authentication                                                                                                                                                                    |

## 4. Style

The same Prettier configuration as the root (§ 7 of the root `AGENTS.md`): no
local `.prettierrc`; do not add one.
