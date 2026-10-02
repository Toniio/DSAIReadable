# Project structure — Design System

> Next.js 16 · React 19 · Tailwind CSS v4 · shadcn/ui (`radix-lyra` style) · TypeScript 5

This repository is a **code-first design system**: the React components, the tokens and the machine-readable documentation have a single source, in the code. Every visual value has a single source.

> The Figma integration layer has been removed. Reintegration spec: [`FIGMA_REINTEGRATION.md`](./FIGMA_REINTEGRATION.md).

---

## Overview

```
dsaireadable/
├── components/ui/              # The design system's 65 React components
├── styles/globals.css          # Tailwind entry point: the @theme bridge from the tokens to the classes
├── lib/                        # Shared modules: utils, focus, ui-strings, overlay, surface, fonts
├── hooks/                      # Shared hooks (use-mobile)
├── tokens/                     # Source of truth for the tokens (DTCG JSON)
├── tokens.css                  # Generated CSS custom properties — do not edit
├── tokens.manifest.json        # Generated machine-readable list of the tokens — do not edit
├── specs/                      # The design system's Markdown documentation (components, foundations, patterns, tokens)
├── scripts/                    # Tooling: token, spec, index and registry generation and linting
├── tests/                      # Component tests (Vitest, Testing Library, axe-core)
├── mcp-server/                 # MCP server that serves the design system to agents (its own rules: its AGENTS.md)
├── packages/eslint-plugin/     # ESLint plugin @dsaireadable/eslint-plugin: the design system's rules for a project's own lint
├── skills/                     # Agent skills: dsaireadable-build and dsaireadable-ui-guard
├── .claude-plugin/             # Claude Code plugin marketplace: the skills and the MCP server in one install
├── .changeset/                 # Pending changesets: the semver intent of each change
├── .github/                    # CI workflows, PR template, CODEOWNERS, Dependabot
├── .vscode/                    # MCP server configuration template for VS Code
├── registry/                   # Sources of the registry items that are not components (conventions)
├── registry.json               # shadcn registry — generated
├── design-system.index.json    # Machine-readable inventory of the design system
├── design-system.schema.json   # JSON Schema that validates the index
├── shadcn-api.baseline.json    # The upstream shadcn/ui API the components are checked against — generated
├── shadcn-upstream.json        # Re-anchoring on shadcn/ui: the anchored tag, the re-tokenization table, the 65 components classified
├── evals/                      # The conformance harness: reference tasks, scoring, the history of the scores (evals/README.md)
├── llms.txt                    # Documentation map for agents (llms.txt format) — generated
└── .husky/                     # Git hooks: pre-commit, commit-msg, pre-push
```

---

## `styles/globals.css` and `lib/fonts.ts` — what every page loads

`styles/globals.css` imports Tailwind and `tokens.css`, removes Tailwind's default colors, radii and shadows, and its `@theme inline` bridge turns the tokens into Tailwind classes. `lib/fonts.ts` loads the typefaces with `next/font` (Geist, JetBrains Mono) under the `--font-*` variables the `typography.font-family.*` tokens describe.

---

## `components/` — React components

### `components/ui/` — Component library

65 customized shadcn/ui components. Each file exports one or more React components with:

- variants handled by `class-variance-authority` (cva)
- design tokens through the Tailwind classes the `@theme` bridge ties to tokens (`bg-primary`, `text-muted-foreground`…) — the exact list per component is in the "Tokens" section of its spec
- the accessibility of the underlying Radix UI / Base UI primitives

**Notable components:**

| File                 | What it brings                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `button.tsx`         | default, outline, secondary, ghost, destructive and link variants + xs/sm/default/lg and icon-xs/icon-sm/icon/icon-lg sizes |
| `field.tsx`          | Label + input + error/help message composition — a complete form block                                                      |
| `input-group.tsx`    | An input with left / right add-ons (icons, text prefixes)                                                                   |
| `password-input.tsx` | A password input with a visibility toggle                                                                                   |
| `combobox.tsx`       | A searchable picker, single or multiple (Base UI `Combobox`)                                                                |
| `empty.tsx`          | A standard empty state with an illustration and a message                                                                   |
| `item.tsx`           | A generic reusable row (list, menu, option)                                                                                 |
| `native-select.tsx`  | A styled native `<select>` — the accessible fallback to the Radix `<Select>`                                                |
| `spinner.tsx`        | An accessible loading indicator                                                                                             |
| `sidebar.tsx`        | A complete responsive sidebar with collapse, navigation and keyboard shortcuts                                              |
| `chart.tsx`          | A Recharts wrapper with design system tokens and legend / tooltip configuration                                             |
| `heading.tsx`        | A typographic heading (h1–h4): `level` sets the level and the size, `as` decouples the semantic level                       |
| `logo.tsx`           | The logo, as an SVG component                                                                                               |
| `illustration.tsx`   | The design system's SVG illustrations                                                                                       |

---

## `tokens/` — Source of truth for the design tokens

A **three-tier** architecture (in the [W3C DTCG](https://www.designtokens.org/TR/2025.10/format/) format), assembled by a [DTCG resolver](https://www.designtokens.org/TR/2025.10/resolver/):

```
tokens/
├── tokens.resolver.json  # The three tiers in order, then the light / dark modifier
├── primitive.json        # Tier 1: raw values (private)
├── semantic.json         # Tier 2: semantic tokens (public), light values
├── semantic.dark.json    # Tier 2: the dark context — the semantic tokens dark changes
└── component.json        # Tier 3: shadcn/ui aliases (public)
```

### `tokens/primitive.json` — Tier 1, Primitive

A palette of raw values: colors, rem spacing, radii, typography…, in the DTCG 2025.10 object forms (`{ "colorSpace": "srgb", "components": […] }`, `{ "value": 1, "unit": "rem" }`).  
Nested under a single `primitive` group — **never referenced directly in components**.  
Examples: `primitive.color.mist.100`, `primitive.space.4`, `primitive.radius.md`.

### `tokens/semantic.json` — Tier 2, Semantic

Tokens that carry meaning — they reference the primitives by full path, `{primitive.color.mist.100}`.  
Its values are the light mode, the resolver's default. The dark **mode** is `tokens/semantic.dark.json`, the `dark` context of the `color-scheme` modifier: each override names a semantic token and gives its `$type` and dark `$value`.  
Examples: `color.background.default`, `color.text.subtle`, `space.component.md`.

This is the layer the components read: the `@theme` bridge in `styles/globals.css` ties each Tailwind class (`bg-background`) to a semantic token (`--color-background-default`).

### `tokens/component.json` — Tier 3, Component

**shadcn/ui compatibility aliases**: they map the semantic tokens to the names shadcn expects (`--background`, `--primary`, `--ring`…).  
They serve external shadcn code a consumer might add; the design system's own components read none of them.

---

## `tokens.css` — CSS custom properties

A file **generated only by `npm run tokens:build` — never edit it** (`tokens:check` catches any drift). It exposes every token as a CSS variable:

```css
:root {
  --color-background-default: #ffffff;
}
.dark {
  --color-background-default: #090b0c;
}
```

Imported into `styles/globals.css`, whose `@theme inline` block bridges these variables to the Tailwind classes.

---

## `scripts/` — Tooling

Each script explains at the top of the file what it checks and why. They all run in CI.

### Tokens — `npm run tokens-validate`

| Script                      | npm command                         | Role                                                                                                                                                                                            |
| --------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build-tokens.ts`           | `tokens:build` / `tokens:check`     | Generates `tokens.css` from the DTCG sources; `--check` fails on drift                                                                                                                          |
| `lint-dtcg.ts`              | `tokens:lint-dtcg`                  | DTCG 2025.10 conformance of every resolver permutation (Terrazzo, `terrazzo.config.ts`): value forms, units, sRGB colors, descriptions, kebab-case names                                        |
| `lint-token-naming.ts`      | `tokens:lint-naming`                | Key grammar (`foundation.property[.role][.emphasis][.state]`); tiers 2 and 3 and the dark overrides hold only references; DTCG 2025.10 `$type`s and `$`-properties only; no `$extensions.modes` |
| `lint-raw-values.ts`        | `tokens:lint-values`                | Detects raw values (hex, px, rem…) in components. Exception: `// allow-raw: <reason>`                                                                                                           |
| `lint-theme-bridge.ts`      | `tokens:lint-bridge`                | The `@theme` bridge in `styles/globals.css`: references resolve, no private tier, every name in a Tailwind namespace                                                                            |
| `lint-focus-ring.ts`        | `tokens:lint-focus`                 | A single focus ring (`lib/focus.ts`) for every focusable component                                                                                                                              |
| `lint-contrast.ts`          | `tokens:lint-contrast`              | WCAG contrast of the text / background pairs, in light and dark                                                                                                                                 |
| `lint-palette-monotonic.ts` | `tokens:lint-monotonic`             | In every palette, luminance strictly decreases as the step goes up                                                                                                                              |
| `lint-chart-palette.ts`     | `tokens:lint-chart`                 | Every `color.chart.*` series at 3:1 on its backgrounds; pairs distinct in OKLab under normal vision, protanopia and deuteranopia                                                                |
| `lint-font-tokens.ts`       | `tokens:lint-fonts`                 | Every `typography.font-family.*` token names the font `next/font` loads under its variable                                                                                                      |
| `lint-token-lifecycle.ts`   | `tokens:lint-lifecycle`             | Every semantic token declares `active`, `reserved` or `$deprecated`, and the status matches the code                                                                                            |
| `build-token-docs.ts`       | `docs:tokens` / `docs:tokens:check` | Generates `specs/tokens/token-reference.md` and `tokens.manifest.json`                                                                                                                          |

### Specs — `npm run specs:validate`

| Script                        | npm command      | Role                                                                                                                                                                         |
| ----------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build-spec-variants.ts`      | `specs:variants` | The `Variants` section, from the code's `cva()` calls                                                                                                                        |
| `build-spec-tokens.ts`        | `specs:tokens`   | The `Tokens` section, classes resolved by Tailwind down to the token                                                                                                         |
| `build-spec-api.ts`           | `specs:api`      | The `Props / API` section, from the TypeScript exports (`scripts/lib/component-api.ts`)                                                                                      |
| `build-spec-choices.ts`       | `specs:choices`  | The index's choice rules, copied into the `Usage` of the specs they concern                                                                                                  |
| `lint-spec-sections.ts`       | —                | The 13 canonical sections of a component spec, the 9 of a page pattern, in order                                                                                             |
| `lint-spec-wording.ts`        | —                | No hedged wording; every Constraints line (Usage and Spacing in a pattern) opens with a keyword                                                                              |
| `lint-foundation-examples.ts` | —                | Every tsx and ts block of `specs/foundations/` passes the ESLint plugin's `recommended` config; a `// ❌` counter-example may break a class rule, never use a native element |
| `build-llms-txt.ts`           | `docs:llms`      | `llms.txt`, from the entry points it lists and each spec's H1, Category and Role                                                                                             |

### Index — `npm run index:validate`

| Script                  | npm command                                                   | Role                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `validate-index.ts`     | `index:schema`                                                | `design-system.index.json` matches its JSON Schema                                                                                                                                                                                                                                                     |
| `lint-sizes.ts`         | `index:sizes`                                                 | Inventory sizes = code sizes = spec sizes                                                                                                                                                                                                                                                              |
| `lint-data-slot.ts`     | `index:data-slot`                                             | Every component exposes a `data-slot`                                                                                                                                                                                                                                                                  |
| `lint-ui-strings.ts`    | `index:strings`                                               | Default accessible names (aria-label, sr-only) come from `lib/ui-strings.ts`, never hard-coded                                                                                                                                                                                                         |
| `lint-props-types.ts`   | `index:props`                                                 | Every exported component exports the type of its props                                                                                                                                                                                                                                                 |
| `lint-shadcn-api.ts`    | `index:shadcn` (`shadcn:baseline` refetches the upstream API) | Every divergence from the shadcn/ui API is declared in the index, and every declaration is real; every upstream `registry:ui` item is shipped or excluded (`shadcn.excluded`)                                                                                                                          |
| `retokenize-codemod.ts` | `shadcn:retokenize` (`shadcn:drift`, network)                 | The re-tokenization codemod of `shadcn-upstream.json` (`scripts/lib/retokenize.ts`) leaves the components unchanged; with `--drift`, each re-anchored component has the classes of its retokenized upstream, up to the ones it declares; `--update <tag>` merges a newer shadcn/ui into the components |

### Registry

| Script                     | npm command                         | Role                                                                    |
| -------------------------- | ----------------------------------- | ----------------------------------------------------------------------- |
| `build-registry.ts`        | `registry:build` / `registry:check` | Generates `registry.json` from the inventory, the specs and the imports |
| `test-registry-install.ts` | `registry:test-install`             | Installs every item in a blank app and builds it                        |

### Versioning and release

| Script                   | npm command                        | Role                                                                                    |
| ------------------------ | ---------------------------------- | --------------------------------------------------------------------------------------- |
| `sync-versions.ts`       | `versions:sync` / `versions:check` | The root `package.json` version copied to the index, the MCP server and both lockfiles  |
| `lint-changesets.ts`     | `changesets:lint`                  | Each pending `.changeset/*.md` has a known category and the bump that category takes    |
| `test-release.ts`        | `release:test`                     | A changeset becomes a version and a CHANGELOG entry, on a copy of the files             |
| `test-pinned-install.ts` | `release:test`                     | What the shadcn CLI pins when an item is installed at a tag, against a local git remote |

`release:check` runs the first two; `release:version` is what a release pull request runs
([`CONTRIBUTING.md`](./CONTRIBUTING.md#versioning-and-releases)).

Shared modules: `scripts/lib/` (component API, `next/font` fonts, the re-tokenization codemod), `wcag.ts`, `color-vision.ts`.

---

## `specs/` — Design system documentation

Structured Markdown documentation, consumable by people **and LLMs** (through MCP).

### `specs/components/` — Component specs (65 files)

One spec per component, in 13 sections:
`Metadata` · `Role` · `Usage` · `Constraints` · `Dependencies` · `Anatomy` · `Tokens` · `Props / API` · `Variants` · `States` · `Accessibility` · `Code example` · `Cross-references`

`Variants` is generated from the code's `cva()` calls (`npm run specs:variants`);
`Tokens` is generated from the code's classes, resolved by Tailwind down to the semantic token (`npm run specs:tokens`);
rules are written **MUST** / **MUST NOT** or **SHOULD** … **unless** (**Note** for a fact, in Constraints); `lint-spec-wording` rejects "avoid", "prefer", "if needed"… and any Constraints line without a keyword;
the rules for choosing between sibling components (the index's `composition_rules`, `applies_to` field) are copied as the last bullet of their `Usage` (`npm run specs:choices`);
`Props / API` is generated from the TypeScript exports — one block per export, types and defaults taken from the code; only the descriptions are edited by hand (`npm run specs:api`);
`Accessibility` follows a fixed structure — Pattern, Role, Keyboard, Accessible name, Pitfalls — and targets WCAG 2.2 AA.

### `specs/foundations/` — Foundation specs

| File                | Holds                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `border-width.md`   | The two border widths and how they are wired into Tailwind                                       |
| `breakpoints.md`    | The responsive prefixes as a contract; the values of the `breakpoint.*` tokens                   |
| `color.md`          | The full table of light / dark color tokens + Do / Don't, the WCAG 2 / APCA contrast levels      |
| `content.md`        | Default strings (`UI_STRINGS`) and how to override them for another locale                       |
| `elevation.md`      | Shadows and depth levels                                                                         |
| `focus.md`          | The single focus ring and its presets (`lib/focus.ts`)                                           |
| `motion.md`         | Animation durations and easings                                                                  |
| `opacity.md`        | The three semantic opacity levels                                                                |
| `radius.md`         | Border-radius values                                                                             |
| `size.md`           | The 24px minimum target size (WCAG 2.2 SC 2.5.8) and the audit of every control                  |
| `spacing.md`        | The spacing scale (`space.scale.*`), container widths and layout spacing                         |
| `typography.md`     | Type scale, families, weights                                                                    |
| `voice-and-tone.md` | The voice, the tone by situation, grammar and mechanics, the word list — checked on `UI_STRINGS` |

### `specs/patterns/` — Page patterns (12 files)

Written by hand, on Primer's model: the tasks a screen carries out (`create`,
`edit`, `delete`, `filter`, `search`, `sign-in`, `settings`), then the UI
patterns they share (`empty-state`, `form`, `loading`, `navigation`, `saving`).
One file per pattern, in 9 sections:
`Metadata` · `Role` · `Usage` · `Structure` · `Components` · `Spacing` · `Content` · `Code example` · `Cross-references`

Usage and Spacing bullets open with a keyword, as a component's Constraints do;
every component of the Components table must be an export a component spec
documents (`generate-context` fails otherwise); every code example passes
`dsaireadable_validate_screen` with no issue (`mcp:test`). The MCP server serves them through
`dsaireadable_list_patterns` and `dsaireadable_get_pattern`.

### `specs/tokens/token-reference.md` · `tokens.manifest.json` — generated

An exhaustive reference of the **426** tokens of the three tiers: CSS variable,
type, resolved light / dark values, Tailwind utility, Do / Don't. The Markdown is
meant for people, `tokens.manifest.json` for tooling.

Both are produced by `npm run docs:tokens` from `tokens/*.json` — the prose lives
in `$extensions.docs`. **Never edit them by hand**: `npm run tokens-validate`
fails on drift.

---

## `tests/` — Component tests

`npm run test:components` renders components in headless Chromium (Vitest
browser mode, Playwright) with the design system's stylesheet, and checks them
against their spec: every spec's `## Code example`, and every complete module
(imports and a default export) among the foundations' examples, rendered as written, with
zero axe-core violation on the WCAG 2.2 A and AA rules in the light and the dark
theme (contrast and target size included) and a focus indicator on every tab
stop; then, per component, the **Accessibility** section replayed: role,
accessible name and each key of the Keyboard table. `npm run test:lint-coverage`
fails when a component has no renderable example or a documented key has no test.

| File                          | Role                                                                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/examples.test.tsx`     | The 65 spec examples and the complete modules of the foundations: axe light and dark, a focus indicator on every tab stop (real Playwright `Tab` presses)              |
| `tests/components/*.test.tsx` | One file per component with keys in its spec (`it("<keys>: …")`, `role: …`, `accessible name: …`), and `conversation.test.tsx`                                         |
| `tests/spec-examples.ts`      | Vite plugin: serves each spec's code example, and each complete module of the foundations, as a module (`virtual:spec-examples`), so the tests render what agents copy |
| `tests/axe.ts`                | Runs axe-core on the whole document (popups are portalled), light then dark, and returns one line per violation                                                        |
| `tests/focus.ts`              | Reads the rings painted before and after a focus move: the indicator may sit on the control, its wrapping group or the part standing for it                            |
| `tests/setup.ts`              | Loads `styles/globals.css` and `tests/no-motion.css` (no animation, so axe reads final colors); unmounts and resets the theme after each test                          |

The tests live outside `components/ui/` so that the linters and the registry,
which read that folder, only see distributed code.

---

## Distribution — shadcn registry

There is no npm package for the components: the repository **is** their distribution
channel (the MCP server and the ESLint plugin are on npm, as `@dsaireadable/mcp-server`
and `@dsaireadable/eslint-plugin`). The
`registry.json` at the root is enough — no server, no per-item JSON to host.
Full consumer guide: [README → _Consuming the design system_](./README.md#consuming-the-design-system).

| Item                                | Content                                                                                                                                                                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Toniio/DSAIReadable/design-system` | Base item: the stylesheet (tokens, `@theme inline` bridge, lockdown, `z-*` utilities, base layer), `lib/utils`, `lib/focus`, `lib/ui-strings`, `lib/overlay`, `lib/surface` — follows every component |
| `Toniio/DSAIReadable/font-<family>` | One `registry:font` item per font `lib/fonts.ts` loads (`font-jetbrains-mono`, `font-geist`) — follows the base item                                                                                  |
| `Toniio/DSAIReadable/<component>`   | One item per component in `components/ui/`                                                                                                                                                            |
| `Toniio/DSAIReadable/conventions`   | `registry/conventions/dsaireadable.md`, dropped as Cursor, Claude Code and Copilot rules                                                                                                              |

`registry.json` is **generated** by `npm run registry:build` from
`design-system.index.json`, the specs and the components' actual imports — do
not edit it by hand. Each npm dependency carries its version range there, taken
from `package.json`.

> An internal dependency is written as a full address, `Toniio/DSAIReadable/<item>`.
> A bare name such as `button` points to the official shadcn registry, not this
> repository: `registry:check` rejects it, because `shadcn registry validate`
> does not see it.

`npm run registry:test-install` installs every item in a blank app with
non-standard aliases and builds it: it is the only check that proves the
registry is **consumable**, not just consistent.

---

## Root configuration files

| File                        | Role                                                                                                                                                                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `design-system.index.json`  | Machine-readable inventory: lists every component (`code_path`, status, divergences from shadcn/ui), the shadcn/ui components left out (`shadcn.excluded`), the composition rules, the glossary. Read by the MCP scripts and by the registry generation. |
| `design-system.schema.json` | JSON Schema that validates the structure of `design-system.index.json`                                                                                                                                                                                   |
| `components.json`           | shadcn CLI config: `radix-lyra` style, `mist` base color, Phosphor icons, alias paths                                                                                                                                                                    |
| `tokens.css`                | The tokens' CSS variables (imported by `globals.css`)                                                                                                                                                                                                    |
| `tsconfig.json`             | Strict TypeScript for the app; `scripts/`, `packages/eslint-plugin/` and `mcp-server/` have their own projects                                                                                                                                           |
| `eslint.config.mjs`         | ESLint: Next.js rules, and `better-tailwindcss`, which rejects classes outside the design system and `opacity-N` on a disabled state                                                                                                                     |
| `lint-staged.config.mjs`    | Pre-commit hook: Prettier and ESLint on the staged files, `typecheck:all`                                                                                                                                                                                |
| `commitlint.config.mjs`     | Commit-msg hook: Conventional Commits                                                                                                                                                                                                                    |
| `tsconfig.scripts.json`     | The TypeScript project of `scripts/`                                                                                                                                                                                                                     |
| `registry.json`             | shadcn registry — generated by `npm run registry:build`                                                                                                                                                                                                  |
| `llms.txt`                  | Documentation map for agents in the [llms.txt](https://llmstxt.org/) format — generated by `npm run docs:llms`, checked by `specs:validate`                                                                                                              |
| `CHANGELOG.md`              | Notable changes; the version sections are written by `changeset version` from the pending `.changeset/*.md`, never by hand                                                                                                                               |
| `SECURITY.md`               | How to report a vulnerability privately, and what is in scope                                                                                                                                                                                            |
| `vitest.config.ts`          | Vitest for the component tests: browser mode in headless Chromium (Playwright), Tailwind and the spec examples plugin, the `@/` alias, `tests/setup.ts`                                                                                                  |

---

## Hidden files (dotfiles)

### Root

| File              | Role                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.prettierrc`     | Format: 2 spaces, double quotes, no semicolons, `trailingComma: es5`, the tailwindcss plugin to sort classes. A single configuration, `mcp-server/` included |
| `.prettierignore` | Keeps `dist/`, `node_modules/`, `*.tsbuildinfo`, `package-lock.json` out of Prettier                                                                         |
| `.nvmrc`          | Node.js 24, the version CI runs                                                                                                                              |
| `.gitignore`      | Keeps `.next/`, `node_modules/`, `tsconfig.tsbuildinfo`… out of version control                                                                              |

### `.github/`

| File                                          | Role                                                                                                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.github/copilot-instructions.md`             | Points to `AGENTS.md`, the single source of truth for agent rules                                                                                                  |
| `.github/pull_request_template.md`            | PR template                                                                                                                                                        |
| `.github/CODEOWNERS`                          | Names the maintainer as reviewer of every path; the `main` ruleset does not require code-owner review                                                              |
| `.github/workflows/ci.yml`                    | GitHub Actions CI, 9 jobs: `tokens-validate`, `typecheck`, `lint`, `index-schema`, `spec-sections`, `context-freshness`, `mcp-test`, `component-tests`, `registry` |
| `.github/workflows/evals.yml`                 | The conformance harness with a Claude agent, started by hand only (each run costs API credits)                                                                     |
| `.github/workflows/dependabot-regenerate.yml` | Regenerates the generated files on a Dependabot PR and pushes the result                                                                                           |
| `.github/dependabot.yml`                      | Weekly grouped dependency updates                                                                                                                                  |
| `.github/workflows/pr-lint.yml`               | Checks that the PR title follows Conventional Commits                                                                                                              |

### `.vscode/`

| File                       | Role                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `.vscode/mcp.json.example` | Committed template of the VS Code MCP server configuration; `.vscode/mcp.json` stays local and ignored by git |

### `.gitkeep` files

Present in `components/`, `hooks/`, `lib/`, `public/` — leftovers from the initial setup, when these folders were empty; `public/` still is.

---

## Data flow

```
tokens/*.json
    ├──▶ tokens.css ──▶ styles/globals.css (@theme inline) ──▶ Tailwind classes ──▶ components/ui/
    └──▶ token-reference.md · tokens.manifest.json          (docs:tokens)

components/ui/*.tsx ──▶ specs/components/*.md               (Variants, Tokens, Props / API)
design-system.index.json ──▶ specs/components/*.md          (choice rules, Usage)
specs/ ──▶ llms.txt                                         (docs:llms)

specs/ · tokens/ · index · components/ ──▶ mcp-server/context/*.json   (generate-context) ──▶ MCP agents
index · specs · components/ ──▶ registry.json               (registry:build) ──▶ shadcn consumers
```

---

## Key commands

```bash
npm run check               # Every CI check that needs no network or API key, in one call; prints only failures
npm run tokens:lint-values  # Check that components hold no raw values
npm run tokens:lint-naming  # Check the tokens' DTCG grammar
npm run tokens:lint-bridge  # Check Tailwind's @theme bridge
npm run tokens-validate     # Every token check in sequence
npm run specs:validate      # Specs: sections, generated parts, wording
npm run typecheck:all       # TypeScript: components, tests and evals, scripts, eslint-plugin, mcp-server
npm run mcp:test-package    # Pack the MCP server and run the tarball through npx from an empty folder
npm run test:lint-coverage  # Every component rendered from its spec, every documented key tested
npm run test:components     # Component tests in headless Chromium (Vitest + axe-core)
npm run skills:validate     # The agent skills: format, and every rule cites a source that exists
npm run evals:test          # The conformance harness scores its gold examples and fixtures, with no model
npm run format              # Prettier on every .ts/.tsx/.md
```

---

## Key conventions

- **Never a raw value** in a component — everything goes through a Tailwind class mapped to a token, or a CSS token (`var(--…)`).
- **Exception**: `// allow-raw: <reason>` allows an unavoidable raw value on a case-by-case basis (for example CSS attribute selectors that target Recharts SVGs).
- **Naming grammar**: `foundation.property[.role][.emphasis][.state]`. Role and state are never merged into a single segment.
- **Tier 1 (primitive) is private** — components and the outside world never use it directly.
- **Everything in American English** — code, comments, docs, specs and UI copy.
