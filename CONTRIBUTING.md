# Contributing to DSAIReadable

The rules that apply to AI agents and humans alike are in
[`AGENTS.md`](./AGENTS.md). This document only covers the contribution process.

## Prerequisites

- Node.js 24
- `npm ci` at the root **and** `npm ci --prefix mcp-server`

The git hooks are installed automatically by the `prepare` script (husky).
If `.husky/_` is missing, run `npm install`.

## Workflow

One contribution = **one backlog item**.

```bash
git switch -c fix/p0-03-destructive-foreground
# … changes …
npm run check   # every CI check except build and registry:test-install, prints only failures
git commit -m "fix(tokens): add destructive-foreground token"
git push -u origin fix/p0-03-destructive-foreground
gh pr create
```

### Branch names

| Prefix      | Use                                 |
| ----------- | ----------------------------------- |
| `feat/`     | a new capability                    |
| `fix/`      | a bug fix                           |
| `chore/`    | maintenance, dependencies           |
| `docs/`     | documentation, specs                |
| `ci/`       | CI, hooks, build tooling            |
| `refactor/` | a rework with no change in behavior |
| `test/`     | tests                               |

### Commit messages

[Conventional Commits](https://www.conventionalcommits.org/) format:
`type(scope): subject in the imperative, no leading capital, no trailing period`.

Allowed types: `feat` `fix` `chore` `docs` `ci` `refactor` `test` `style`
`perf` `build` `revert`. The header is limited to 100 characters.

The `commit-msg` hook rejects any non-conforming message. **Never bypass it
with `--no-verify`.**

### Pull requests

- The **PR title** becomes the commit message on `main` (squash merge): it must
  follow Conventional Commits. The `pr-lint` workflow checks it.
- Fill in the template: backlog item, acceptance criteria, output of the
  validation command.
- **Green CI required.** `main` is protected; no direct push is possible.
- Squash merge, then delete the branch.
- A change in behavior adds its line under **Unreleased** in
  [`CHANGELOG.md`](./CHANGELOG.md).

## Where a change goes

Most of what an agent reads is generated: change the source, run its command,
and commit both. CI fails on a generated file that is out of step with its
source.

| To change                                      | Edit                                                          | Then run                                                              |
| ---------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------- |
| A token value or decision                      | `tokens/*.json`                                               | `npm run tokens:build && npm run docs:tokens`                         |
| A component                                    | `components/ui/<component>.tsx`, after reading its spec       | `npm run specs:variants && npm run specs:tokens && npm run specs:api` |
| A component's behavior, usage or accessibility | `specs/components/<Component>.md`, outside generated sections | `npm run docs:llms` when the Role changed                             |
| A choice between sibling components            | `composition_rules` in `design-system.index.json`             | `npm run specs:choices`                                               |
| Anything the MCP server serves                 | its source above                                              | `npm run generate-context`                                            |
| A registry item                                | the component or `registry/`                                  | `npm run registry:build`                                              |

The files never to edit by hand are listed in [`AGENTS.md` § 8](./AGENTS.md#8-areas-not-to-touch-without-an-explicit-instruction).

## What CI checks

| Job                 | Command                                                                      |
| ------------------- | ---------------------------------------------------------------------------- |
| `tokens-validate`   | `npm run tokens-validate`                                                    |
| `typecheck`         | `npm run typecheck:all`                                                      |
| `lint`              | `npm run lint` + `prettier --check`                                          |
| `build`             | `npm run build`                                                              |
| `index-schema`      | `npm run index:validate`                                                     |
| `spec-sections`     | `npm run specs:validate`                                                     |
| `context-freshness` | `npm run generate-context`, then fails if the tree is dirty                  |
| `mcp-test`          | `npm run mcp:test`                                                           |
| `registry`          | `npm run registry:check`, shadcn validation, `npm run registry:test-install` |

## Code style

Enforced by `.prettierrc` and applied by the pre-commit hook: 2 spaces, double
quotes, no semicolons, `trailingComma: es5`. A single configuration for the whole
repository (`.ts`, `.tsx`, `.md`), `mcp-server/` included. Never reorder
Tailwind classes by hand — `prettier-plugin-tailwindcss` takes care of it.

Everything committed is written in English, natively — code, comments, docs,
specs and demo copy.

## Reporting a vulnerability

Privately, never in a public issue — see [`SECURITY.md`](./SECURITY.md).

## Running the MCP server locally

Copy `.vscode/mcp.json.example` to `.vscode/mcp.json` (not committed).
