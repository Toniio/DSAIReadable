# Copilot instructions — DSAIReadable

> **Single source of truth: [`AGENTS.md`](../AGENTS.md) at the root of the repository.**
> Read it in full before any change. This file is only a short reminder; it does
> not exist to duplicate the rules — two copies drift apart.

## Blocking rules, in brief

- **Zero raw values** in a component: hex, `rgb()`, `oklch()`, `px`, `rem`, `ms`
  go through a token. The only exception is explicit: `// allow-raw: <reason>`.
- **Tier 1 is private**: never reference `tokens/primitive.json` outside `semantic.json`.
- **Phosphor icons only** (`@phosphor-icons/react`).
- **Class-based dark mode** (`.dark` on `<html>`), never `prefers-color-scheme`.
- **Read `specs/components/<Component>.md`** before writing or changing a component.
- **Never edit by hand** `tokens.css`, `mcp-server/context/*.json`,
  `design-system.index.json`, `specs/tokens/token-reference.md`, `tokens.manifest.json`,
  `registry.json`, `llms.txt` —
  these files are generated.
- **Write everything in English**, natively: code, comments, docs, specs.

## Before suggesting a commit

```bash
npm run tokens-validate && npm run typecheck:all && npm run lint
```

## Git workflow

Typed branch (`feat/` `fix/` `chore/` `docs/` `ci/` `refactor/` `test/`) →
Conventional Commits → PR (1 PR = 1 backlog item) → squash merge.
`main` is protected; no direct push. Never use `--no-verify`.
