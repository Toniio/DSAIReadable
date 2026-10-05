# Contributing to DSAIReadable

The rules that apply to AI agents and humans alike are in
[`AGENTS.md`](./AGENTS.md). This document only covers the contribution process.

## Prerequisites

- Node.js 24 (`.nvmrc`); `engines` accepts 22.12 or later, the minimum the
  component tests need
- `npm ci` at the root: it installs the workspaces too (`mcp-server/`, `packages/eslint-plugin/`)
- `npx playwright install chromium` once: the component tests run in headless Chromium

The git hooks are installed automatically by the `prepare` script (husky).
If `.husky/_` is missing, run `npm install`.

## Workflow

One contribution = **one backlog item**.

```bash
git switch -c fix/p0-03-destructive-foreground
# … changes …
npm run check   # every CI check that needs no network or API key, prints only failures
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
  [Versioning and releases](#versioning-and-releases) says: a changeset.

## Where a change goes

Most of what an agent reads is generated: change the source, run its command,
and commit both. CI fails on a generated file that is out of step with its
source.

| To change                                                               | Edit                                                                                                                              | Then run                                                                                                                              |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| A token value or decision                                               | `tokens/*.json`                                                                                                                   | `npm run tokens:build && npm run docs:tokens`                                                                                         |
| A component                                                             | `components/ui/<component>.tsx`, after reading its spec                                                                           | `npm run specs:variants && npm run specs:tokens && npm run specs:api && npm run specs:states`                                         |
| A state a component never enters through another component's `cva` call | a "Not entered through" line in its spec's States section, its reason read from the dependency's source (Calendar's is the model) | `npm run specs:states && npm run specs:tokens`                                                                                        |
| A component's behavior, usage or accessibility                          | `specs/components/<Component>.md`, outside generated sections                                                                     | `npm run docs:llms` when the Role changed                                                                                             |
| A foundation's guidance or example                                      | `specs/foundations/<name>.md`                                                                                                     | `npm run specs:validate`: its tsx and ts blocks pass the ESLint plugin                                                                |
| A choice between sibling components                                     | `composition_rules` in `design-system.index.json`                                                                                 | `npm run specs:choices`                                                                                                               |
| Anything the MCP server serves                                          | its source above                                                                                                                  | `npm run generate-context`                                                                                                            |
| A registry item                                                         | the component or `registry/`                                                                                                      | `npm run registry:build`                                                                                                              |
| A component's API (a prop, an export, a value)                          | the component, then its `shadcn.divergences` entry in `design-system.index.json`                                                  | `npm run index:shadcn`                                                                                                                |
| A check of the UI guard skill                                           | the spec, pattern or foundation it cites, then the line of `skills/dsaireadable-ui-guard/` that points at it                      | `npm run skills:validate`                                                                                                             |
| A code example of a spec, a pattern or a foundation                     | the spec                                                                                                                          | `npm run site:examples`: the documentation site renders the copy it writes in `site/generated/`                                       |
| The prose of an MCP & Skills page                                       | `docs/mcp-and-skills/<page>.md`; a `<!-- site: <block> -->` comment places a block the page computes                              | `npm run docs:llms` when a page or a `## ` heading is added or renamed                                                                |
| A page of the documentation site                                        | `site/` (never `site/generated/`)                                                                                                 | `npm run site:dev`, then `npm run site:check`; `npm run site:build && npm run site:test` before a PR that changes what a visitor sees |

**A new or changed component arrives with its test.** `tests/examples.test.tsx`
renders every spec's `## Code example`, and every foundation example written as
a complete module (imports and a default export), in headless Chromium, light and dark:
zero axe violation (contrast and target size included) and a visible focus
indicator on every tab stop. An example that fails is fixed in the spec, which
is what agents copy. Each row of a spec's Accessibility › Keyboard table has its
test in `tests/components/<file>.test.tsx`, titled with the row's keys
(`it("Home / End: …")`), next to a `role: …` and an `accessible name: …` test;
`npm run test:lint-coverage` fails on a key without its test.

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

### Re-anchoring on shadcn/ui

The components are shadcn/ui's, with the design system's classes. The
difference is mechanical, so it is written once, as a table, and not in 65
hand-made forks. `shadcn-upstream.json` holds:

- `upstream`: the shadcn/ui tag the components are anchored to, its base
  (`radix`) and its style (`lyra`, the `radix-lyra` of `components.json`);
- `map`: the re-tokenization table, the single source of truth for "a shadcn/ui
  class → the design system's" (an entry is spelled out below). `classes` maps a whole class, variants
  included (`aria-invalid:ring-1` → nothing: the invalid ring shows on focus
  only); `utilities` maps a utility and keeps its variants (`opacity-50` →
  `opacity-disabled`, so `disabled:opacity-50` → `disabled:opacity-disabled`);
  `patterns` rewrites inside arbitrary values (`--spacing(7)` →
  `var(--space-scale-7)`); `files` holds the rules of one component (`z-50` →
  `z-popover` in a popover, `z-modal` in a dialog); `constants` groups classes
  into the shared constants of `lib/` (`FOCUS_RING`, `OVERLAY_BASE`…); `values`
  maps the CSS values of a `style` attribute;
- `components`: each of the 65, `reanchored` (its classes are its upstream's
  run through the table, plus the `added` classes it declares, with the
  `reason`) or `outside` (no shadcn/ui item: Heading, Illustration, Logo,
  PasswordInput). A `fork`, which drops upstream classes, declares them in
  `removed`; none is needed today.

An entry of `map` is either `"upstream": "replacement"`, when the replacement
draws the same CSS (`min-w-[96px]` → `min-w-24`, `opacity-50` →
`opacity-disabled`), or `"upstream": { "to": "replacement", "reason": "…" }`,
when it changes a value or a behavior (`w-[100px]` → `w-24` is 96px; a class
dropped). The reason says what changes, with the values, and why. `npm run
shadcn:retokenize` draws both sides: Tailwind compiles each class against
`styles/globals.css`, the custom properties are read from `tokens.css`, `rem` is
brought to `px` and `calc()` is evaluated. A bare entry that draws something
else fails the check; a reason on an entry that draws the same is harmless. The
check also proves, on arbitrary values, that it still tells the two apart.
`patterns` rewrite inside arbitrary values and are not drawn.

A class of upstream that is dead (it draws nothing, or never matches),
unreachable or wrong is corrected the same way: in `map`, in
`map.files.<component>` when it is one component's, with its `reason`. The
component stays re-anchored (the sidebar and the combobox of #82 are
precedents). `fork` is for a design choice that drops upstream classes on
purpose, not for a correction.

`npm run shadcn:retokenize` (in `npm run check`) proves the table is a
fixpoint: the components go through the codemod unchanged, so a raw class the
table maps cannot come back. `npm run shadcn:drift` (network, CI) rebuilds the
upstream components as `shadcn add` writes them (the base sources and the style
sheet of the anchored tag, read from the shadcn/ui repository, then the
installed shadcn CLI and every transform it runs), applies the codemod, writes
the result to `.shadcn-vanilla/<tag>/` and compares each component, class by
class: a difference that is neither mapped nor declared fails, with the classes
to adopt, map or declare.

When you change a component's classes, keep it re-anchored: take the upstream
class (in `.shadcn-vanilla/`), map a difference in `map` with its reason when
it changes a value, or declare an addition with its reason.

To follow a newer shadcn/ui:

1. Update the `shadcn` devDependency, then run
   `npx tsx scripts/retokenize-codemod.ts --update shadcn@<version>`: it
   rebuilds both tags, re-tokenizes them, and three-way merges the upstream
   change of each component into `components/ui` (`git merge-file`), leaving
   conflict markers where a line changed on both sides.
2. Resolve the conflicts, set `upstream.ref` to the new tag, then run
   `npm run shadcn:drift`: a new raw class upstream is mapped in `map`, or
   adopted.
3. Run `npm run shadcn:baseline` for the API, `npm run check`, and add a
   `visual` changeset that says what moved.

The files never to edit by hand are listed in [`AGENTS.md` § 8](./AGENTS.md#8-areas-not-to-touch-without-an-explicit-instruction).

### Deprecating a token or a component export

An agent has four ways to learn that something is deprecated, and one edit
feeds all of them:

- **A token**: set `$deprecated` on it in `tokens/semantic.json` (a message that
  says why and what to use instead) and name the token that takes its place in
  `$extensions["design.dsaireadable"].replacement`. The token docs, the manifest
  and `dsaireadable_get_tokens` carry it; `npm run tokens:lint-lifecycle` checks
  the replacement exists, is not deprecated itself, and that nothing still
  consumes the deprecated token.
- **A component export**: put `@deprecated Use {@link Replacement} instead, …`
  in the JSDoc of the function, component or type in `components/ui/*.tsx`. It
  ships with the source the registry distributes. A tag without a message fails
  `npm run generate-context`.
- **Lint and MCP**: `npm run generate-context` turns both into
  `dsaireadable_get_deprecations` and into the plugin's lists
  (`no-deprecated-token`, `no-deprecated-imports`), so a project's lint flags the
  old name. Commit the regenerated files.

Deprecating a name that still works is not breaking; removing it later is the
breaking bump. Announce both under
**Deprecated** and **Removed** in the changelog, which `dsaireadable_get_changelog`
serves. Once a version that contains a removal is published,
`npm deprecate` the published versions that still have it.

## Versioning and releases

One version names the whole design system: the tokens, the components, the
registry, the inventory the MCP server serves and the MCP server itself. It is
the `version` of the root `package.json`, which
[Changesets](https://github.com/changesets/changesets) bumps. `npm run versions:sync`
copies it to `design-system.index.json`, `mcp-server/package.json`,
`packages/eslint-plugin/package.json` (and the server's pin of the plugin),
`.claude-plugin/marketplace.json` (and the plugin's pin of the server) and the
lockfile, and `npm run versions:check` fails CI when one of them differs. The
release tag is `vX.Y.Z`.

### What a change bumps

The public surface is the tokens, the components' API, the registry items, the
MCP server's tools, the agent skills and the rules of the ESLint plugin that
consumers run in their CI. Every changeset starts its summary with the category
that says what changed, and the bump follows from it:

| Category         | The change                                                                                              | Bump                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `token-breaking` | A token renamed, removed or repurposed                                                                  | major                                                                     |
| `component-api`  | A prop, export, variant, component, registry item or new token added, or one of them renamed or removed | minor; major if it breaks                                                 |
| `mcp`            | A tool, a schema or the content the MCP server serves: added, renamed or removed, or corrected          | minor; major if it breaks; patch for a correction                         |
| `skills`         | A skill of `skills/`, one of its rules, or the Claude Code plugin that ships them: the same             | minor; major if it breaks; patch for a correction                         |
| `lint`           | A rule or config of `@dsaireadable/eslint-plugin`                                                       | patch; minor if it reports more; major if it adds errors to `recommended` |
| `visual`         | Appearance, or a behavior fixed with no change of API: a value, a spacing, a radius, a state            | patch                                                                     |
| `docs`           | Specs and guidance, no code                                                                             | patch                                                                     |

- **Breaking is major.** Renaming or removing a token, a prop, an export, a
  union value, a registry item or an MCP tool is always the breaking bump, and
  for a component it is also a declared divergence from shadcn/ui.
- **A correction is a patch under `mcp` and `skills`.** A served rule that named
  a class which generates nothing, a skill sentence that was wrong, the ref a
  plugin installs from: put right, with no tool, schema, skill or rule added,
  renamed or removed. What an agent has to learn again is a minor.
- **`lint` follows ESLint's own policy.** A message, an autofix, a docs link or
  a fix that reports fewer errors is a patch. A fix that reports more errors
  may break a consumer's lint build: minor. A rule or an option added to
  `recommended` that adds errors is a major, which the 0.x versions write as
  minor.
- **Visual is patch, and says so in full.** An agent cannot see a visual change,
  so the changeset states what moves and from what to what (`Card radius: md to
lg`), not "polish". A fix of behavior with no change of API (a state that did
  not work, a ring that was drawn twice) is `visual` too, as ScrollArea and Tabs
  (0.1.0) and reduced motion (0.1.1) were.
- **A dead class is not a change of the public surface.** Removing one that
  generates no CSS or never matches is `docs` when a spec changes (its States
  table lists it), and needs no changeset when none does.
- **While the version is 0.x**, `minor` is the breaking bump and also carries
  additions, and `patch` carries the rest (SemVer § 4). A `major` changeset
  releases 1.0.0: write one only to declare the design system stable.
- **No changeset** for a change nothing outside the repository can observe: CI,
  the repository's internal lint, tests, a refactor, an internal script.

`npm run changesets:lint` checks the category and the bump of each pending
changeset. It cannot tell an addition from a breaking change under
`component-api`, `mcp`, `skills` or `lint`, nor a correction from an addition
under `mcp` and `skills`: the reviewer does.

### Declaring a change

Run `npx changeset`, or write the file in `.changeset/` by hand:

```md
---
"dsaireadable": minor
---

component-api: Add the `xs` size to Button.
```

Commit it with the pull request.

### Releasing

Every release comes from the changesets:

1. A release pull request runs `npm run release:version`: it consumes the
   changesets, writes the CHANGELOG entry, bumps the version, copies it
   everywhere and regenerates `llms.txt`, whose links then name the new tag,
   and the MCP context. "Everywhere" includes what names the tag: the install
   line and the spec link of the `conventions` item, the link in the server's
   README, the `npx skills add` of the root README and the `ref` of the Claude
   Code plugin. The ESLint plugin's docs links read its own `package.json`.
   `npm run versions:check` also fails on a link to `main` in anything a
   package or a registry item distributes.
2. After the merge, tag the merge commit and push the tag:
   `git tag -a vX.Y.Z -m vX.Y.Z <merge commit>`, then
   `git push origin vX.Y.Z`. Not `npx changeset tag`: in this workspace it
   tags each package (`dsaireadable@X.Y.Z`, `@dsaireadable/mcp-server@X.Y.Z`,
   `@dsaireadable/eslint-plugin@X.Y.Z`), never `vX.Y.Z`, the tag a pinned
   install names (`Toniio/DSAIReadable/button#vX.Y.Z`). Push it right after
   the merge: until the tag exists, every link of `llms.txt`, of the
   `conventions` item, of the READMEs and of the ESLint plugin's rule docs
   returns a 404, and installing the Claude Code plugin or running
   `npx skills add Toniio/DSAIReadable#vX.Y.Z` fails. Pushing the tag also
   starts the `Site` workflow, which deploys the documentation site at that
   version ([The documentation site](#the-documentation-site)).
3. A maintainer publishes the two packages, the ESLint plugin first since the
   server pins it: `npm publish --access public --dry-run`, then without
   `--dry-run`, in `packages/eslint-plugin/`, then in `mcp-server/`. A published
   version cannot be replaced: a mistake is fixed by the next version. An agent
   never publishes.

`0.1.0` went through the same steps, and also carries the changes written by
hand before the changesets existed: they sit under its `Added`, `Changed`,
`Fixed`, `Removed` and `Security` headings.

`npm run release:test` runs that pipeline on a copy of the files, with a test
changeset, and checks the version, the CHANGELOG entry and the `llms.txt` links
it produces.

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

| Job                 | Command                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tokens-validate`   | `npm run tokens-validate`                                                                                                                                                                                                                                                                                                                                                                                                      |
| `typecheck`         | `npm run typecheck:all`                                                                                                                                                                                                                                                                                                                                                                                                        |
| `lint`              | `npm run lint`, `lint:language`, `prettier --check`, `knip`, `release:check`                                                                                                                                                                                                                                                                                                                                                   |
| `index-schema`      | `npm run index:validate`, `shadcn:retokenize`                                                                                                                                                                                                                                                                                                                                                                                  |
| `spec-sections`     | `npm run specs:validate`, `skills:validate`, `agentskills validate` (`skills-ref` 0.1.1)                                                                                                                                                                                                                                                                                                                                       |
| `context-freshness` | `npm run generate-context`, then fails if the tree is dirty                                                                                                                                                                                                                                                                                                                                                                    |
| `mcp-test`          | `npm run plugin:test`, `mcp:test`, `mcp:test-package`                                                                                                                                                                                                                                                                                                                                                                          |
| `component-tests`   | `npm run test:lint-coverage`, `test:components` (Chromium, cached), `evals:test`, and the keyboard stress run on a Dependabot PR that bumps a primitive                                                                                                                                                                                                                                                                        |
| `registry`          | `registry:check`, shadcn validation, `registry:test-install`, `shadcn:drift`, `release:test`                                                                                                                                                                                                                                                                                                                                   |
| `site-test`         | Three shards on three runners, each: `npm run site:build` (every page prerenders), then its third of `site:test` (`--shard=<i>/3`: the build served under GitHub Pages' base path and loaded in Chromium: axe, page errors, focus; Chromium cached); the first shard also runs `site:check` (the examples copied from the specs are fresh, the consumer lint passes on `site/`, every focus ring it composes has a solid part) |
| `site`              | Fails unless every shard of `site-test` passed: one check for the documentation site                                                                                                                                                                                                                                                                                                                                           |

The `Evals` workflow runs apart, only when started by hand (each run costs API credits), never on a pull request: the conformance harness with a Claude agent, with and without the MCP server, its reports uploaded as an artifact ([`evals/README.md`](./evals/README.md)).

## The documentation site

`site/` is published at `https://toniio.github.io/DSAIReadable/` by the `Site`
workflow (`.github/workflows/site-pages.yml`), apart from `ci.yml`: deploying
needs `pages: write` and `id-token: write`, which the workflow that runs on every
pull request never receives. It runs when a release tag `vX.Y.Z` is pushed, and
by hand (`gh workflow run site-pages.yml`, on the ref to deploy). The site prints the
version of `mcp-server/context/ds-metadata.json` and links its sources at
`blob/v<version>`, so a deployment at the tag describes exactly the published
version, and `main` never shows unreleased work under the last version's number.
The workflow fails on a tag that is not the version of `package.json`, and on a
clone with no tags: the Changes page reads each release's date from its tag.

`npm run site:test` checks what the deployment serves. After a `site:build` made
with the same `SITE_BASE_PATH` (CI sets `/DSAIReadable`), it serves `site/out`
like GitHub Pages does and loads, in headless Chromium and in both themes, every
page, the story and example previews of every component and the previews of every
pattern and foundation. A load fails on an axe violation (WCAG 2.2 A and AA), a
page or console error, a response of 400 and above, or a tab stop that is hidden
or has no focus indicator with a part at 3:1 (the measure is
`tests/focus-measure.ts`, the one the component tests use; each distinct element
is measured once). Responses of 404 that a spec's example causes by pointing at
a file or a page of the project that uses it (Avatar's pictures, sign-in's
links) are listed in `KNOWN_404` of `scripts/test-site.ts`, and the focus gaps it
found in the components themselves in `KNOWN_FOCUS_GAPS`, each with its reason.
`--only=<substring>` restricts the routes, for a quick look. `--shard=<i>/<n>`
loads only the i-th of n shards, as the three `site-test` jobs of CI do: a
route's light and dark loads stay in one shard, the routes are dealt by cost (a
component's preview is 4 loads, any other route 2), and the shards' loads add
up to the whole run's.

Two settings are not in the repository, and a maintainer sets them once:

- Settings → Pages → Source: **GitHub Actions**.
- Settings → Environments → `github-pages` → Deployment branches and tags: allow
  `main` and the tag pattern `v*.*.*`. A deployment from a ref the environment
  does not allow is refused.

`site/` was merged after `v0.1.2`, so the first deployment is a manual run from
`main`; every later release deploys by itself.

## Dependabot pull requests

`registry.json` and `mcp-server/context/ds-metadata.json` copy dependency
versions, a Prettier update can reformat code, and a Tailwind update can change
the generated Tokens and States sections of the specs. Dependabot runs none of the
generators, so the `dependabot-regenerate` workflow does it on each Dependabot
PR: a read-only job runs `registry:build`, `generate-context`, `specs:tokens`,
`specs:states` and `format`, and
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

When a Dependabot PR moves `radix-ui`, a `@radix-ui/*` package, `@base-ui/react` or
`input-otp` in `package-lock.json` (compared with the PR's base, nested copies
included), `component-tests` also repeats each test of `combobox`, `input-otp` and
`radio-group` 50 times, about 40 s more. Their keyboard tests wait for timers the
primitives own (Base UI unmounts a popup one frame after Escape, input-otp re-reads
the selection up to 50 ms after a value change, Radix moves the focus in a
timeout), and a single run rarely catches a race a bump introduces. The command is
the one CI runs; run it by hand after bumping one of them yourself:

```bash
npx vitest run --project components --repeats 49 tests/components/combobox.test.tsx tests/components/input-otp.test.tsx tests/components/radio-group.test.tsx
```

A failure there is a test that asserts a state the primitive now reaches later:
make it wait for the observable end state, as #90 did, and never loosen the
assertion. The `input-otp` test waits 50 ms, the last delay of input-otp 1.5.0's
`syncTimeouts`: recheck that number when the package changes.

`tailwindcss` and `@tailwindcss/*` form their own group and always move
together: `specs:tokens` and `specs:states` call a private API of `@tailwindcss/node`. Majors
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

Copy `.vscode/mcp.json.example` to `.vscode/mcp.json` (not committed). It starts
the published package with `npx`; to run your own changes, point it at the
sources with `"args": ["tsx", "./mcp-server/src/index.ts"]`.

To try the package a consumer would get, `npm pack`, run in `mcp-server/`, builds
and packs it, and `npm run mcp:test-package` runs that tarball, with the ESLint
plugin's, through `npx` from an empty folder. Publishing `@dsaireadable/eslint-plugin`, then
`@dsaireadable/mcp-server` (`npm publish` from `packages/eslint-plugin/`, then
`mcp-server/`, after the release tag) is a maintainer's step, never an agent's.
