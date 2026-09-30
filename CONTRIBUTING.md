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
- A change to the public surface is declared as
  [Versioning and releases](#versioning-and-releases) says: a line under
  **Unreleased** in [`CHANGELOG.md`](./CHANGELOG.md) until the first release, a
  changeset after it.

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

## Versioning and releases

One version names the whole design system: the tokens, the components, the
registry, the inventory the MCP server serves and the MCP server itself. It is
the `version` of the root `package.json`, which
[Changesets](https://github.com/changesets/changesets) bumps. `npm run versions:sync`
copies it to `design-system.index.json`, `mcp-server/package.json` and both
lockfiles, and `npm run versions:check` fails CI when one of them differs. The
release tag is `vX.Y.Z`.

### What a change bumps

The public surface is the tokens, the components' API, the registry items and
the MCP server's tools. Every changeset starts its summary with the category
that says what changed, and the bump follows from it:

| Category         | The change                                                                                              | Bump                      |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ------------------------- |
| `token-breaking` | A token renamed, removed or repurposed                                                                  | major                     |
| `component-api`  | A prop, export, variant, component, registry item or new token added, or one of them renamed or removed | minor; major if it breaks |
| `mcp`            | A tool, a schema or the content the MCP server serves: added, renamed or removed                        | minor; major if it breaks |
| `visual`         | Appearance only: a value, a spacing, a radius                                                           | patch                     |
| `docs`           | Specs and guidance, no code                                                                             | patch                     |

- **Breaking is major.** Renaming or removing a token, a prop, an export, a
  union value, a registry item or an MCP tool is always the breaking bump, and
  for a component it is also a declared divergence from shadcn/ui.
- **Visual is patch, and says so in full.** An agent cannot see a visual change,
  so the changeset states what moves and from what to what (`Card radius: md to
lg`), not "polish".
- **While the version is 0.x**, `minor` is the breaking bump and also carries
  additions, and `patch` carries the rest (SemVer § 4). A `major` changeset
  releases 1.0.0: write one only to declare the design system stable.
- **No changeset** for a change nothing outside the repository can observe: CI,
  lint, tests, a refactor, an internal script.

`npm run changesets:lint` checks the category and the bump of each pending
changeset. It cannot tell an addition from a breaking change under
`component-api` or `mcp`: the reviewer does.

### Declaring a change

Run `npx changeset`, or write the file in `.changeset/` by hand:

```md
---
"dsaireadable": minor
---

component-api: Add the `xs` size to Button.
```

Commit it with the pull request. Until the first release there is no changeset:
the line goes under **Unreleased** in `CHANGELOG.md`, as it always has.

### Releasing

The first release, `0.1.0`, is cut by hand, because its content is already
written under **Unreleased**: rename that heading to `0.1.0`, delete the
paragraph under the `# Changelog` title (Changesets writes each new entry right
under the title, so prose there would end up below the newest release), set the
version in `package.json`, run `npm run versions:sync && npm run generate-context`,
open the pull request and tag it as in step 2 below. Every release after it
comes from the changesets:

1. A release pull request runs `npm run release:version`: it consumes the
   changesets, writes the CHANGELOG entry, bumps the version, copies it
   everywhere and regenerates the MCP context.
2. After the merge, `npx changeset tag` creates `vX.Y.Z` on the merge commit;
   push it with `git push origin vX.Y.Z`.

`npm run release:test` runs that pipeline on a copy of the files, with a test
changeset, and checks the version and the CHANGELOG entry it produces.

### A pinned install pins one item

`npx shadcn@latest add Toniio/DSAIReadable/button#v0.1.0` reads the item at the
tag. The registry items it depends on (`Toniio/DSAIReadable/design-system`) are
read from the default branch: the shadcn CLI does not hand the ref down to
them, and pinning them on the same command line does not change that. Putting
the tag in each item's `registryDependencies` would not fix it, because an
install from `main` would then read a base that is one release behind. To
reproduce a release exactly, commit what the CLI wrote (it copies the source
into the project) and read the next update with `--diff`. `npm run release:test`
states the limit and fails the day the CLI stops having it, so this paragraph
and the README's are removed together.

## What CI checks

| Job                 | Command                                                                      |
| ------------------- | ---------------------------------------------------------------------------- |
| `tokens-validate`   | `npm run tokens-validate`                                                    |
| `typecheck`         | `npm run typecheck:all`                                                      |
| `lint`              | `npm run lint`, `lint:language`, `prettier --check`, `knip`, `release:check` |
| `index-schema`      | `npm run index:validate`                                                     |
| `spec-sections`     | `npm run specs:validate`                                                     |
| `context-freshness` | `npm run generate-context`, then fails if the tree is dirty                  |
| `mcp-test`          | `npm run mcp:test`                                                           |
| `component-tests`   | `npm run test:components`                                                    |
| `registry`          | `registry:check`, shadcn validation, `registry:test-install`, `release:test` |

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
docs, specs and UI copy: `color`, `behavior`, `labeled`, `-ize`.

## Reporting a vulnerability

Privately, never in a public issue — see [`SECURITY.md`](./SECURITY.md).

## Running the MCP server locally

Copy `.vscode/mcp.json.example` to `.vscode/mcp.json` (not committed).
