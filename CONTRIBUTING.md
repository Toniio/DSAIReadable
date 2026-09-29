# Contributing to DSAIReadable

The rules that apply to AI agents and humans alike are in
[`AGENTS.md`](./AGENTS.md). This document only covers the contribution process.

## Prerequisites

- Node.js 24 (`.nvmrc`); `engines` accepts 22.12 or later, the minimum the
  component tests need
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

| To change                                      | Edit                                                                             | Then run                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| A token value or decision                      | `tokens/*.json`                                                                  | `npm run tokens:build && npm run docs:tokens`                         |
| A component                                    | `components/ui/<component>.tsx`, after reading its spec                          | `npm run specs:variants && npm run specs:tokens && npm run specs:api` |
| A component's behavior, usage or accessibility | `specs/components/<Component>.md`, outside generated sections                    | `npm run docs:llms` when the Role changed                             |
| A choice between sibling components            | `composition_rules` in `design-system.index.json`                                | `npm run specs:choices`                                               |
| Anything the MCP server serves                 | its source above                                                                 | `npm run generate-context`                                            |
| A registry item                                | the component or `registry/`                                                     | `npm run registry:build`                                              |
| A component's API (a prop, an export, a value) | the component, then its `shadcn.divergences` entry in `design-system.index.json` | `npm run index:shadcn`                                                |

### The shadcn/ui API is the contract

Models already know the shadcn/ui API: it is the surface an agent gets right
without being told. Keep it:

- **Add, do not change.** A new optional prop, a new export or a new component
  is fine. Renaming or removing a prop, an export or a union value, changing a
  default or the element a component renders takes a reason.
- **Declare every divergence** in the component's `shadcn.divergences` entry of
  `design-system.index.json`: what differs (`export`, `prop`, `value`), how
  (`added`, `removed`, `renamed`, `changed`), what shadcn/ui has (`upstream`)
  and why (`note`). The MCP server serves it with the component's spec.
- `npm run index:shadcn` compares each component with `shadcn-api.baseline.json`,
  the upstream API extracted from the shadcn/ui registry, and prints the entry
  to add for an undeclared divergence. To follow a newer shadcn/ui, run
  `npm run shadcn:baseline` (network) and review the diff.

The files never to edit by hand are listed in [`AGENTS.md` § 8](./AGENTS.md#8-areas-not-to-touch-without-an-explicit-instruction).

## What CI checks

| Job                 | Command                                                                      |
| ------------------- | ---------------------------------------------------------------------------- |
| `tokens-validate`   | `npm run tokens-validate`                                                    |
| `typecheck`         | `npm run typecheck:all`                                                      |
| `lint`              | `npm run lint`, `lint:language`, `prettier --check`, `npm run knip`          |
| `build`             | `npm run build`                                                              |
| `index-schema`      | `npm run index:validate`                                                     |
| `spec-sections`     | `npm run specs:validate`                                                     |
| `context-freshness` | `npm run generate-context`, then fails if the tree is dirty                  |
| `mcp-test`          | `npm run mcp:test`                                                           |
| `component-tests`   | `npm run test:components`                                                    |
| `registry`          | `npm run registry:check`, shadcn validation, `npm run registry:test-install` |

## Dependabot pull requests

`registry.json` and `mcp-server/context/ds-metadata.json` copy dependency
versions, a Prettier update can reformat code, and a Tailwind update can change
the generated Tokens sections of the specs. Dependabot runs none of the
generators, so the `dependabot-regenerate` workflow does it on each Dependabot
PR: a read-only job runs `registry:build`, `generate-context`, `specs:tokens`
and `format`, and
a second job, which runs none of the PR's code, pushes the result as one
`chore(deps)` commit. CI then runs again on that commit.

The push uses a GitHub App token: a push made with `GITHUB_TOKEN` does not
trigger any workflow, so the required checks would never report on the new
commit. The App needs a single repository permission, **Contents: read and
write**, and is installed on this repository only. Its credentials are
**Dependabot** secrets (Settings → Secrets and variables → Dependabot), because a
Dependabot-triggered run cannot read Actions secrets:

| Secret                       | Value                          |
| ---------------------------- | ------------------------------ |
| `REGENERATE_APP_CLIENT_ID`   | the App's client ID            |
| `REGENERATE_APP_PRIVATE_KEY` | a private key generated for it |

Once someone else has pushed to its branch, Dependabot stops rebasing the PR on
its own; comment `@dependabot recreate` to start it again from `main`. A PR that
needs code changes (a major version with breaking changes) is still fixed by
hand.

`tailwindcss` and `@tailwindcss/*` form their own group and always move
together: `specs:tokens` calls a private API of `@tailwindcss/node`. Majors
that cannot be taken yet are ignored in `.github/dependabot.yml`, each with the
date and the reason — TypeScript 7 (no JavaScript compiler API) and
`@types/node` beyond the Node runtime.

## Code style

Enforced by `.prettierrc` and applied by the pre-commit hook: 2 spaces, double
quotes, no semicolons, `trailingComma: es5`. A single configuration for the whole
repository (`.ts`, `.tsx`, `.md`), `mcp-server/` included. Never reorder
Tailwind classes by hand — `prettier-plugin-tailwindcss` takes care of it.

Everything committed is written in American English, natively — code, comments,
docs, specs and demo copy: `color`, `behavior`, `labeled`, `-ize`.

## Reporting a vulnerability

Privately, never in a public issue — see [`SECURITY.md`](./SECURITY.md).

## Running the MCP server locally

Copy `.vscode/mcp.json.example` to `.vscode/mcp.json` (not committed).
