# Project structure — Design System

> Next.js 16 · React 19 · Tailwind CSS v4 · shadcn/ui (`radix-lyra` style) · TypeScript 5

This repository is a **code-first design system**: the React components, the tokens and the machine-readable documentation have a single source, in the code. Every visual value has a single source.

> The Figma integration layer has been removed. Reintegration spec: [`FIGMA_REINTEGRATION.md`](./FIGMA_REINTEGRATION.md).

---

## Overview

```
dsaireadable/
├── app/                        # Test pages (demo): home, sign-in (4 layouts), banking — not part of the design system
├── components/ui/              # The design system's 59 React components
├── styles/globals.css          # Tailwind entry point: the @theme bridge from the tokens to the classes
├── lib/                        # Shared modules: utils, focus, ui-strings, overlay, fonts
├── hooks/                      # Shared hooks (use-mobile)
├── tokens/                     # Source of truth for the tokens (DTCG JSON)
├── tokens.css                  # Generated CSS custom properties — do not edit
├── specs/                      # The design system's Markdown documentation (components, foundations, tokens)
├── scripts/                    # Tooling: token, spec, index and registry generation and linting
├── tests/                      # Component tests (Vitest, Testing Library, axe-core)
├── mcp-server/                 # MCP server that serves the design system to agents (its own rules: its AGENTS.md)
├── registry/                   # Sources of the registry items that are not components (conventions)
├── registry.json               # shadcn registry — generated
├── design-system.index.json    # Machine-readable inventory of the design system
├── design-system.schema.json   # JSON Schema that validates the index
├── shadcn-api.baseline.json    # The upstream shadcn/ui API the components are checked against — generated
├── llms.txt                    # Documentation map for agents (llms.txt format) — generated
└── .husky/                     # Git hooks: pre-commit, commit-msg, pre-push
```

---

## `styles/globals.css` and `lib/fonts.ts` — what every page loads

`styles/globals.css` imports Tailwind and `tokens.css`, removes Tailwind's default colors, radii and shadows, and its `@theme inline` bridge turns the tokens into Tailwind classes. `lib/fonts.ts` loads the typefaces with `next/font` (Geist, JetBrains Mono) under the `--font-*` variables the `typography.font-family.*` tokens describe. Neither lives in `app/`: the tooling reads them whether the demo pages exist or not.

## `app/` — Test pages

The demo pages. No business screens — they only exist to check that the components fit together, and are not part of the design system.

| File                              | Role                                                                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/layout.tsx`                  | Root layout: imports `styles/globals.css`, puts the `lib/fonts.ts` variables on `<html>`, wraps the app in `ThemeProvider` (dark mode) and `TooltipProvider` |
| `app/page.tsx`                    | Minimal demo page — renders a `<Button>` to check that the setup works                                                                                       |
| `app/banking/page.tsx`            | Banking demo screen: cards, tabs, a transactions table, budget bars (`Progress`)                                                                             |
| `app/login/page.tsx`              | Index of the 4 sign-in layouts (links to the sub-routes)                                                                                                     |
| `app/login/split-screen/page.tsx` | Split-screen sign-in: illustration on the left, form on the right                                                                                            |
| `app/login/centered/page.tsx`     | Centered sign-in: the form in a `<Card>` centered on the page                                                                                                |
| `app/login/fullscreen/page.tsx`   | Full-screen sign-in: the form fills the window's height                                                                                                      |
| `app/login/secure/page.tsx`       | Secure sign-in: dark background with a dot pattern, back link                                                                                                |

---

## `components/` — React components

### `components/theme-provider.tsx`

A `next-themes` wrapper that sets the `dark` class on `<html>` and lets the user switch between light and dark.

### `components/ui/` — Component library

59 customized shadcn/ui components. Each file exports one or more React components with:

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

A **three-tier** architecture (in the [W3C DTCG](https://design-tokens.github.io/community-group/format/) format):

```
tokens/
├── primitive.json    # Tier 1: raw values (private)
├── semantic.json     # Tier 2: semantic tokens (public)
└── component.json    # Tier 3: shadcn/ui aliases (public)
```

### `tokens/primitive.json` — Tier 1, Primitive

A palette of raw values: hex colors, rem spacing, radii, typography…  
Marked `"$private": true` — **never referenced directly in components**.  
Examples: `color.mist.100`, `space.4`, `radius.md`.

### `tokens/semantic.json` — Tier 2, Semantic

Tokens that carry meaning — they reference the primitives through `{color.mist.100}`.  
Holds the light / dark **modes** in `$extensions.modes`.  
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

| Script                      | npm command                         | Role                                                                                                                             |
| --------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `build-tokens.ts`           | `tokens:build` / `tokens:check`     | Generates `tokens.css` from the DTCG sources; `--check` fails on drift                                                           |
| `lint-token-naming.ts`      | `tokens:lint-naming`                | Key grammar (`foundation.property[.role][.emphasis][.state]`); tiers 2 and 3 hold only references                                |
| `lint-raw-values.ts`        | `tokens:lint-values`                | Detects raw values (hex, px, rem…) in components. Exception: `// allow-raw: <reason>`                                            |
| `lint-theme-bridge.ts`      | `tokens:lint-bridge`                | The `@theme` bridge in `styles/globals.css`: references resolve, no private tier, every name in a Tailwind namespace             |
| `lint-focus-ring.ts`        | `tokens:lint-focus`                 | A single focus ring (`lib/focus.ts`) for every focusable component                                                               |
| `lint-contrast.ts`          | `tokens:lint-contrast`              | WCAG contrast of the text / background pairs, in light and dark                                                                  |
| `lint-palette-monotonic.ts` | `tokens:lint-monotonic`             | In every palette, luminance strictly decreases as the step goes up                                                               |
| `lint-chart-palette.ts`     | `tokens:lint-chart`                 | Every `color.chart.*` series at 3:1 on its backgrounds; pairs distinct in OKLab under normal vision, protanopia and deuteranopia |
| `lint-font-tokens.ts`       | `tokens:lint-fonts`                 | Every `typography.font-family.*` token names the font `next/font` loads under its variable                                       |
| `lint-token-lifecycle.ts`   | `tokens:lint-lifecycle`             | Every semantic token declares `active`, `reserved` or `$deprecated`, and the status matches the code                             |
| `build-token-docs.ts`       | `docs:tokens` / `docs:tokens:check` | Generates `specs/tokens/token-reference.md` and `tokens.manifest.json`                                                           |

### Specs — `npm run specs:validate`

| Script                   | npm command      | Role                                                                                    |
| ------------------------ | ---------------- | --------------------------------------------------------------------------------------- |
| `build-spec-variants.ts` | `specs:variants` | The `Variants` section, from the code's `cva()` calls                                   |
| `build-spec-tokens.ts`   | `specs:tokens`   | The `Tokens` section, classes resolved by Tailwind down to the token                    |
| `build-spec-api.ts`      | `specs:api`      | The `Props / API` section, from the TypeScript exports (`scripts/lib/component-api.ts`) |
| `build-spec-choices.ts`  | `specs:choices`  | The index's choice rules, copied into the `Usage` of the specs they concern             |
| `lint-spec-sections.ts`  | —                | The 13 canonical sections, in order                                                     |
| `lint-spec-wording.ts`   | —                | No hedged wording; every Constraints line opens with a keyword                          |
| `build-llms-txt.ts`      | `docs:llms`      | `llms.txt`, from the entry points it lists and each spec's H1, Category and Role        |

### Index — `npm run index:validate`

| Script                | npm command                                                   | Role                                                                                            |
| --------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `validate-index.ts`   | `index:schema`                                                | `design-system.index.json` matches its JSON Schema                                              |
| `lint-sizes.ts`       | `index:sizes`                                                 | Inventory sizes = code sizes = spec sizes                                                       |
| `lint-data-slot.ts`   | `index:data-slot`                                             | Every component exposes a `data-slot`                                                           |
| `lint-ui-strings.ts`  | `index:strings`                                               | Default accessible names (aria-label, sr-only) come from `lib/ui-strings.ts`, never hard-coded  |
| `lint-props-types.ts` | `index:props`                                                 | Every exported component exports the type of its props                                          |
| `lint-shadcn-api.ts`  | `index:shadcn` (`shadcn:baseline` refetches the upstream API) | Every divergence from the shadcn/ui API is declared in the index, and every declaration is real |

### Registry

| Script                     | npm command                         | Role                                                                    |
| -------------------------- | ----------------------------------- | ----------------------------------------------------------------------- |
| `build-registry.ts`        | `registry:build` / `registry:check` | Generates `registry.json` from the inventory, the specs and the imports |
| `test-registry-install.ts` | `registry:test-install`             | Installs every item in a blank app and builds it                        |

Shared modules: `scripts/lib/` (component API, `next/font` fonts), `wcag.ts`, `color-vision.ts`.

---

## `specs/` — Design system documentation

Structured Markdown documentation, consumable by people **and LLMs** (through MCP).

### `specs/components/` — Component specs (59 files)

One spec per component, in 13 sections:
`Metadata` · `Role` · `Usage` · `Constraints` · `Dependencies` · `Anatomy` · `Tokens` · `Props / API` · `Variants` · `States` · `Accessibility` · `Code example` · `Cross-references`

`Variants` is generated from the code's `cva()` calls (`npm run specs:variants`);
`Tokens` is generated from the code's classes, resolved by Tailwind down to the semantic token (`npm run specs:tokens`);
rules are written **MUST** / **MUST NOT** or **SHOULD** … **unless** (**Note** for a fact, in Constraints); `lint-spec-wording` rejects "avoid", "prefer", "if needed"… and any Constraints line without a keyword;
the rules for choosing between sibling components (the index's `composition_rules`, `applies_to` field) are copied as the last bullet of their `Usage` (`npm run specs:choices`);
`Props / API` is generated from the TypeScript exports — one block per export, types and defaults taken from the code; only the descriptions are edited by hand (`npm run specs:api`);
`Accessibility` follows a fixed structure — Pattern, Role, Keyboard, Accessible name, Pitfalls.

### `specs/foundations/` — Foundation specs

| File              | Holds                                                                          |
| ----------------- | ------------------------------------------------------------------------------ |
| `border-width.md` | The two border widths and how they are wired into Tailwind                     |
| `breakpoints.md`  | The responsive prefixes as a contract; the values of the `breakpoint.*` tokens |
| `color.md`        | The full table of light / dark color tokens + Do / Don't                       |
| `content.md`      | Default strings (`UI_STRINGS`) and how to override them for another locale     |
| `elevation.md`    | Shadows and depth levels                                                       |
| `focus.md`        | The single focus ring and its presets (`lib/focus.ts`)                         |
| `motion.md`       | Animation durations and easings                                                |
| `opacity.md`      | The three semantic opacity levels                                              |
| `radius.md`       | Border-radius values                                                           |
| `spacing.md`      | Component spacing (4px → 32px) and layout spacing                              |
| `typography.md`   | Type scale, families, weights                                                  |

### `specs/tokens/token-reference.md` · `tokens.manifest.json` — generated

An exhaustive reference of the **301** tokens of the three tiers: CSS variable,
type, resolved light / dark values, Tailwind utility, Do / Don't. The Markdown is
meant for people, `tokens.manifest.json` for tooling.

Both are produced by `npm run docs:tokens` from `tokens/*.json` — the prose lives
in `$extensions.docs`. **Never edit them by hand**: `npm run tokens-validate`
fails on drift.

---

## `tests/` — Component tests

`npm run test:components` renders components in jsdom with Vitest and Testing
Library, and checks them against their spec's **Accessibility** section: roles,
accessible names, keyboard behavior, the classes of each variant, and zero axe-core
violations on the WCAG A and AA rules.

| File                          | Role                                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `tests/components/*.test.tsx` | One file per component: Button, Field, Progress, Combobox, Dialog, Tabs, Select                                   |
| `tests/axe.ts`                | Runs axe-core on the whole document (popups are portalled) and returns one line per violation                     |
| `tests/setup.ts`              | Unmounts after each test; stubs the layout APIs jsdom lacks (`ResizeObserver`, `scrollIntoView`, pointer capture) |

Color contrast is left to `npm run tokens:lint-contrast`: jsdom computes no colors.
The tests live outside `components/ui/` so that the linters and the registry,
which read that folder, only see distributed code.

---

## Distribution — shadcn registry

There is no npm package: the repository **is** the distribution channel. The
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

| File                        | Role                                                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `design-system.index.json`  | Machine-readable inventory: lists every component (`code_path`, status, divergences from shadcn/ui), the composition rules, the glossary. Read by the MCP scripts and by the registry generation. |
| `design-system.schema.json` | JSON Schema that validates the structure of `design-system.index.json`                                                                                                                            |
| `components.json`           | shadcn CLI config: `radix-lyra` style, `mist` base color, Phosphor icons, alias paths                                                                                                             |
| `tokens.css`                | The tokens' CSS variables (imported by `globals.css`)                                                                                                                                             |
| `next.config.mjs`           | Standard Next.js config                                                                                                                                                                           |
| `tsconfig.json`             | Strict TypeScript for the app; `scripts/` and `mcp-server/` have their own projects                                                                                                               |
| `eslint.config.mjs`         | ESLint: Next.js rules, and `better-tailwindcss`, which rejects classes outside the design system and `opacity-N` on a disabled state                                                              |
| `lint-staged.config.mjs`    | Pre-commit hook: Prettier and ESLint on the staged files, `typecheck:all`                                                                                                                         |
| `commitlint.config.mjs`     | Commit-msg hook: Conventional Commits                                                                                                                                                             |
| `tsconfig.scripts.json`     | The TypeScript project of `scripts/`                                                                                                                                                              |
| `registry.json`             | shadcn registry — generated by `npm run registry:build`                                                                                                                                           |
| `llms.txt`                  | Documentation map for agents in the [llms.txt](https://llmstxt.org/) format — generated by `npm run docs:llms`, checked by `specs:validate`                                                       |
| `CHANGELOG.md`              | Notable changes, in the Keep a Changelog format; a PR that changes behavior adds its line under **Unreleased**                                                                                    |
| `SECURITY.md`               | How to report a vulnerability privately, and what is in scope                                                                                                                                     |
| `vitest.config.ts`          | Vitest for the component tests: jsdom, the `@/` alias, `tests/setup.ts`                                                                                                                           |
| `postcss.config.mjs`        | PostCSS with `@tailwindcss/postcss`                                                                                                                                                               |

---

## Hidden files (dotfiles)

### Root

| File              | Role                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.prettierrc`     | Format: 2 spaces, double quotes, no semicolons, `trailingComma: es5`, the tailwindcss plugin to sort classes. A single configuration, `mcp-server/` included |
| `.prettierignore` | Keeps `dist/`, `node_modules/`, `.next/`, `*.tsbuildinfo`, `package-lock.json`, `next-env.d.ts` out of Prettier                                              |
| `.nvmrc`          | Node.js 24, the version CI runs                                                                                                                              |
| `.gitignore`      | Keeps `.next/`, `node_modules/`, `tsconfig.tsbuildinfo`… out of version control                                                                              |

### `.github/`

| File                               | Role                                                                                                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/copilot-instructions.md`  | Points to `AGENTS.md`, the single source of truth for agent rules                                                                                                            |
| `.github/pull_request_template.md` | PR template                                                                                                                                                                  |
| `.github/CODEOWNERS`               | Names the maintainer as reviewer of every path; the `main` ruleset does not require code-owner review                                                                        |
| `.github/workflows/ci.yml`         | GitHub Actions CI, 10 jobs: `tokens-validate`, `typecheck`, `lint`, `build`, `index-schema`, `spec-sections`, `context-freshness`, `mcp-test`, `component-tests`, `registry` |
| `.github/workflows/pr-lint.yml`    | Checks that the PR title follows Conventional Commits                                                                                                                        |

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
npm run dev               # Start Next.js (demo)
npm run tokens:lint-values  # Check that components hold no raw values
npm run tokens:lint-naming  # Check the tokens' DTCG grammar
npm run tokens:lint-bridge  # Check Tailwind's @theme bridge
npm run tokens-validate     # Every token check in sequence
npm run specs:validate      # Specs: sections, generated parts, wording
npm run typecheck:all       # TypeScript: app, scripts, mcp-server
npm run test:components     # Component tests (Vitest + axe-core)
npm run format              # Prettier on every .ts/.tsx/.md
```

---

## Key conventions

- **Never a raw value** in a component — everything goes through a Tailwind class mapped to a token, or a CSS token (`var(--…)`).
- **Exception**: `// allow-raw: <reason>` allows an unavoidable raw value on a case-by-case basis (for example CSS attribute selectors that target Recharts SVGs).
- **Naming grammar**: `foundation.property[.role][.emphasis][.state]`. Role and state are never merged into a single segment.
- **Tier 1 (primitive) is private** — components and the outside world never use it directly.
- **Everything in American English** — code, comments, docs, specs and demo copy.
