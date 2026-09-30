# DSAIReadable — an AI-readable design system

> **React 19 · Next.js 16 · Tailwind CSS v4 · shadcn/ui (radix-lyra) · TypeScript 5**

A design system built to be **read and used by LLMs as well as by people**. Every component, every token and every composition rule is documented in a structured, machine-readable format that MCP agents and any AI code generator can consume.

---

## Why this project exists

Traditional design systems are written for people: documentation in a design tool, Storybook, Confluence. As soon as an LLM generates UI code, it produces raw values (`#432dd7`, `16px`), random icons (Lucide, Heroicons) and native HTML elements (`<button>`, `<div>`) instead of the design system's components.

**DSAIReadable** aims to make the design system **a first-class citizen for AI**:

- **An MCP server** exposes the whole design system as tools any agent can query (Copilot, Cursor, Claude).
- **A shadcn registry** distributes the components, the tokens and the guidelines: the source code is copied into the consuming project, not installed as an opaque dependency.
- **13-section Markdown specs** for every component, readable by people _and_ ingestible by LLMs.
- **A JSON inventory (`design-system.index.json`)** — the machine-readable source of truth for the state of the design system.
- **Token linters** wired into CI, so no raw value slips into generated code.

---

## How it is built

The project started from one observation: for an LLM to generate code that conforms to a design system, it has to receive the design system in a form it can _consume_, not just _read_.

### Approach

1. **Three-tier tokens (W3C DTCG)** — Primitive → Semantic → Component. Every visual value has a single source in `tokens/*.json`, exported as CSS custom properties.

2. **Structured component specs** — every component has a Markdown spec in 13 standard sections (`specs/components/`). The specs are readable in a design review and ingestible by the MCP server as context.

3. **An in-house MCP server** (`mcp-server/`) — a [Model Context Protocol](https://modelcontextprotocol.io/) server built with the official SDK. It exposes the full design system as tools AI agents can call: components, tokens, variants, design rules, page patterns, UX writing, data visualization.

4. **Distribution through a shadcn registry** — the repository itself is the distribution channel: the shadcn CLI copies the components' source, the CSS tokens and the guidelines into the consuming project. The agent therefore generates against code it can read and change.

5. **Validation CI** — GitHub Actions checks the DTCG naming of the tokens and the absence of raw values in components on every push and PR.

> The Figma integration layer (Code Connect, variable sync, component generation) has been removed from the repository. See [`FIGMA_REINTEGRATION.md`](./FIGMA_REINTEGRATION.md) for the reintegration spec.

---

## Project structure

```
dsaireadable/
├── components/ui/              # The design system's 65 React components (customized shadcn/ui)
├── lib/                        # Shared modules: utils, focus, ui-strings, overlay
├── tokens/                     # Source of truth for the tokens (three-tier DTCG JSON)
│   ├── tokens.resolver.json    # DTCG resolver: the three tiers, then light / dark
│   ├── primitive.json          # Tier 1 — raw values (private)
│   ├── semantic.json           # Tier 2 — semantic tokens (public), light values
│   ├── semantic.dark.json      # Tier 2 — dark overrides
│   └── component.json          # Tier 3 — shadcn/ui aliases (public)
├── tokens.css                  # Generated CSS custom properties — do not edit
├── specs/                      # The design system's Markdown documentation
│   ├── components/             # 65 component specs (13 sections each)
│   ├── foundations/            # Color, typography, spacing, motion, radius… specs
│   └── tokens/token-reference.md  # Reference of the 301 tokens (generated)
├── mcp-server/                 # MCP server @dsaireadable/mcp-server
│   ├── src/
│   │   ├── tools/              # MCP tools (ds-core, dataviz, ux-writing, admin)
│   │   ├── prompts/            # MCP prompts
│   │   ├── lib/                # Cache loading, dsaireadable_validate_screen and _validate_code, composition rules
│   │   └── context/            # generate.ts: builds the cache
│   └── context/                # Precompiled JSON files (the design system cache) — generated
├── packages/eslint-plugin/     # ESLint plugin @dsaireadable/eslint-plugin: the design system's rules for a project's own lint
├── scripts/                    # Tooling: token, spec, index and registry generation and linting
├── registry/                   # Sources of the registry items that are not components
├── registry.json               # shadcn registry — generated
├── design-system.index.json    # Machine-readable inventory of the design system
├── design-system.schema.json   # JSON Schema that validates the index
├── shadcn-api.baseline.json    # The upstream shadcn/ui API the components are checked against — generated
└── llms.txt                    # Documentation map for agents (llms.txt format) — generated
```

---

## MCP server

The MCP server (`mcp-server/`) exposes the design system as tools AI agents can query.

### Getting started

The server runs on your machine, over stdio: nothing is hosted. Once
`@dsaireadable/mcp-server` is published, a client starts it with `npx`, with no
clone:

```bash
npx -y @dsaireadable/mcp-server
```

It needs Node.js 20 or later. Claude Code:

```bash
claude mcp add dsaireadable -- npx -y @dsaireadable/mcp-server
```

Claude Desktop, in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dsaireadable": {
      "command": "npx",
      "args": ["-y", "@dsaireadable/mcp-server"]
    }
  }
}
```

The package is **not published yet** (see [Publishing identity](#publishing-identity)):
until then, run the server from a clone.

```bash
cd mcp-server
npm run start          # stdio mode (Copilot CLI, Claude Desktop)
npm run start:http     # HTTP mode on :3100 (VS Code)
npm run generate-context  # regenerates the JSON files of the context/ cache
```

`generate-context` exits with **code 1** when a generator fails or when the
inventory (`design-system.index.json`) drifts from the files in `components/ui/`.
Its output is deterministic: two runs in a row produce no diff.

### HTTP mode configuration

The server only listens on the loopback interface and **validates the `Origin`
header** (a requirement of the MCP spec, against DNS rebinding attacks). A
request with an origin that is not allowed receives a `403`.

The server speaks MCP protocol revision **2026-07-28** and still serves
2025-era clients, over stdio and HTTP alike. HTTP mode is **stateless**: each
request is served on its own, no `Mcp-Session-Id` is issued, and `GET` or
`DELETE` on `/mcp` receives a `405`.

| Variable              | Default                                         | Role                                            |
| --------------------- | ----------------------------------------------- | ----------------------------------------------- |
| `MCP_HOST`            | `127.0.0.1`                                     | Listening interface. Only widen it deliberately |
| `PORT` / `MCP_PORT`   | `3100`                                          | Listening port                                  |
| `MCP_ALLOWED_ORIGINS` | `localhost` + `127.0.0.1` on the listening port | Comma-separated list of origins                 |

### Available tools

| Category       | Tools                                                                                                                                                                                                                                                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DS Core**    | `dsaireadable_get_design_system_overview`, `dsaireadable_get_components` (with the sizes each accepts), `dsaireadable_get_component_specs` (concise, or `detailed`: the full spec with its cva variants, sizes and composition rules), `dsaireadable_get_tokens`, `dsaireadable_get_typography`, `dsaireadable_get_icons`, `dsaireadable_get_design_rules` |
| **Patterns**   | `dsaireadable_list_patterns` (the page patterns, by task and by UI concern), `dsaireadable_get_pattern` (one pattern: usage, structure, components, spacing, content, code example)                                                                                                                                                                        |
| **Dataviz**    | `dsaireadable_get_dataviz_recommendation` (chart types for an objective), `dsaireadable_get_dataviz_specs` (a chart type's tokens, anatomy and library)                                                                                                                                                                                                    |
| **UX Writing** | `dsaireadable_get_ux_writing_rules` (voice and tone, default strings, overriding, language), `dsaireadable_get_glossary`, `dsaireadable_get_content_library`                                                                                                                                                                                               |
| **Admin**      | `dsaireadable_get_stats` (component, token and spec counts), `dsaireadable_validate_screen` (checks generated code against the design system's rules, as text), `dsaireadable_validate_code` (lints and type-checks TSX with the ESLint plugin's rules)                                                                                                    |

Every tool is annotated as read-only (`readOnlyHint`, `openWorldHint: false`): a client does not need
to confirm its calls. Every tool declares an `outputSchema` and answers with `structuredContent` that
conforms to it, plus the same JSON as text. An argument outside a tool's input schema is a tool
execution error that names it. Lists and resources carry a one-hour, `public` cache hint (`ttlMs`,
`cacheScope`) for 2026-07-28 clients. Every tool name starts with `dsaireadable_`, so it stays distinct among the tools of other servers.
`dsaireadable_get_component_specs`, `dsaireadable_get_design_rules` and `dsaireadable_get_pattern` take
`response_format`: `concise` by default (under 20 % of the volume), `detailed` for everything.
`dsaireadable_get_components` and `dsaireadable_get_tokens` paginate: `limit` (100 by default) and `cursor`, with a
`{ total, items, next_cursor }` response.

### Resources

| URI                          | Content                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `ds://component/{name}/spec` | A component's full spec; all 65 are listed, and `{name}` autocompletes           |
| `ds://token/{path}`          | A semantic token (`ds://token/color.background.default`); `{path}` autocompletes |
| `ds://guidelines`            | Critical rules, foundation rules, composition rules                              |

### Your project's own patterns

Run inside a project that uses the design system, the server also reads
`design/patterns/*.md` from its working directory (or from the folder named by
`DSAIREADABLE_PROJECT_DIR`). A file there has the same nine sections as a file
of `specs/patterns/`, and `dsaireadable_list_patterns` and
`dsaireadable_get_pattern` serve it beside the design system's, with its own
`source`. When both define the same name, the project's wins. A file that does
not parse is an error that names it, not a pattern silently left out.

### Connecting from VS Code / Copilot

Add to `.vscode/mcp.json` or `~/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "dsaireadable": {
      "command": "npx",
      "args": ["-y", "@dsaireadable/mcp-server"]
    }
  }
}
```

From a clone, `"args": ["tsx", "./mcp-server/src/index.ts"]` runs the sources.

---

## ESLint plugin

`@dsaireadable/eslint-plugin` (`packages/eslint-plugin/`) gives a project's own lint
the design system's rules, so an agent, or a person, sees a violation where it
writes the code instead of in review. It is **not published yet**
(see [Publishing identity](#publishing-identity)); the MCP server's
`dsaireadable_validate_code` tool runs the same rules.

```js
// eslint.config.mjs
import dsaireadable from "@dsaireadable/eslint-plugin"

export default [...dsaireadable.configs.recommended]
```

| Rule                                          | Flags                                                                                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `dsaireadable/no-native-interactive-elements` | `<button>`, `<input>`, `<select>`, `<textarea>`, `<label>`, `<table>`, `<dialog>` and `<a>` (outside a `Button` with `asChild`)            |
| `dsaireadable/no-external-ui-imports`         | Other icon kits, UI libraries and primitives imported directly (Radix, Base UI, MUI…), a component imported from outside `@/components/ui` |
| `dsaireadable/no-inline-svg`                  | An inline `<svg>`: icons come from `@phosphor-icons/react`                                                                                 |
| `dsaireadable/no-class-interpolation`         | A Tailwind class built by interpolation (`` `text-${tone}` ``): Tailwind never generates it                                                |
| `dsaireadable/no-raw-values`                  | Raw hex and color functions, arbitrary Tailwind values, the default palette, primitive tokens, `prefers-color-scheme`                      |
| `dsaireadable/no-deprecated-imports`          | What the design system has deprecated (the list is an option; empty until the first deprecation)                                           |

`configs.core` holds those six rules and reads the code alone. `configs.recommended`
adds the Tailwind half of the lockdown through `eslint-plugin-better-tailwindcss`: a class the real
stylesheet does not generate (`bg-red-500`, `p-13`) is an error, and a disabled state must read
`opacity-disabled`. Point `settings["better-tailwindcss"].entryPoint` at your stylesheet if it is not
`styles/globals.css`. Neither config lints `components/ui/`: what the registry installs there is the
design system's own code. If your own components live there, `dsaireadable.createConfig({ ignores })`
narrows the exclusion to the files the registry installed.

---

## Publishing identity

One name, adapted to the constraint of each channel. Any future publication
follows it — do not reintroduce a capitalized variant.

| Channel                | Identifier                    | Why this form                                                                    |
| ---------------------- | ----------------------------- | -------------------------------------------------------------------------------- |
| GitHub repository      | `Toniio/DSAIReadable`         | The project's original name; the only place where casing is free                 |
| shadcn registry        | `dsaireadable`                | A registry name only allows alphanumerics, hyphens and underscores               |
| A component's item     | `Toniio/DSAIReadable/<item>`  | The full GitHub address: a bare name would point to the official shadcn registry |
| npm scope              | `@dsaireadable`               | npm forbids capitals in a scope                                                  |
| MCP server npm package | `@dsaireadable/mcp-server`    | Not published yet: for now the server runs from a clone of this repository       |
| ESLint plugin package  | `@dsaireadable/eslint-plugin` | Not published yet: the server depends on it, and both are published together     |
| Release tag            | `vX.Y.Z`                      | One version for the tokens, components, registry, MCP server and ESLint plugin   |

A release tag pins the item you name, not what it depends on:
`npx shadcn add Toniio/DSAIReadable/button#v0.1.0` reads `button` at the tag, but
the shared base item it depends on is read from the default branch, and pinning
that one too does not change it. That is how the shadcn CLI resolves an item's
dependencies, and `npm run release:test` checks it. To reproduce a release exactly,
commit what the CLI copied into your project
([CONTRIBUTING → Versioning and releases](./CONTRIBUTING.md#versioning-and-releases)).

The `@dsaireadable` scope is **not reserved** on npm: it will only be once its first
package is published. The former `@DSAIReadable` scope could not be
published — it only survives in archived documents, flagged as obsolete.

---

## Consuming the design system

The distribution channel is the **shadcn registry** carried by this public repository: there is no npm package to install. The `registry.json` at the root is enough — the CLI reads the repository directly, with no server and no per-component JSON to host.

What the consumer needs: a React + Tailwind CSS v4 project with a `components.json` (`npx shadcn@latest init`). The project's aliases are respected: the CLI rewrites the `@/…` imports to its own.

### Install

```bash
# A component — the base item (tokens, lockdown, dark mode, fonts, cn(), focus, labels, modal surfaces) comes along automatically
npx shadcn@latest add Toniio/DSAIReadable/button

# The design system's rules for the project's agents
npx shadcn@latest add Toniio/DSAIReadable/conventions
```

**Always the full address** `Toniio/DSAIReadable/<item>`: a bare name (`npx shadcn add button`) points to the official shadcn registry, and would replace the design system's component with its own.

Every npm dependency comes with the version range the component is written against (`react-day-picker@^9.14.0`), never "latest".

The CLI copies the source into the project, which then imports it locally:

```tsx
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { cn } from "@/lib/utils"
```

Tokens are not imported into TSX: the base item merges their CSS variables into the project's stylesheet, `@theme inline` bridge included. Classes are therefore written with the semantic names (`bg-primary`, `text-muted-foreground`, `rounded-lg`).

### After install

The base item changes more than the project's components folder:

- **The stylesheet** (`tailwind.css` in `components.json`) receives the tokens (`:root`, `.dark`), the `@theme inline` bridge, `tw-animate-css` and `shadcn/tailwind.css` (animations, `data-open:` and the other state variants), the `z-modal`… utilities and a `@layer base` that sets `<html>` in `font-mono`.
- **The lockdown**: every Tailwind default color, radius, shadow, spacing step and type style the design system does not redefine is reset to `initial`. `bg-red-500`, `shadow-2xs`, `p-13` or `text-7xl` then generate no CSS, in the consumer's project as in this repository. The spacing scale is Tailwind v3's (`p-2`, `gap-1.5`, `h-9`).
- **The fonts**: JetBrains Mono (`font-mono`, the whole interface) and Geist (`font-sans`, `Kbd` keys) come as `registry:font` items. In a Next.js app, the CLI adds their `next/font/google` loaders to the root layout; elsewhere (Vite…), it installs `@fontsource-variable/jetbrains-mono` and `@fontsource-variable/geist` and imports them.
- **Dark mode is the `.dark` class on `<html>`** — never `prefers-color-scheme`. The `dark:` variant is declared; toggling the class is the application's job. With `next-themes`: `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>`.

### Explore

```bash
npx shadcn@latest search Toniio/DSAIReadable -q card   # search
npx shadcn@latest view Toniio/DSAIReadable/card        # view an item and its source
npx shadcn@latest add Toniio/DSAIReadable/card --dry-run
```

Every component has its spec — props, variants, states, accessibility — in [`specs/components/`](./specs/components/). [`llms.txt`](./llms.txt) lists every spec with its role, the entry points and the machine-readable sources, in the [llms.txt](https://llmstxt.org/) format.

### With an agent

1. **The rules**: the `conventions` item drops the same file wherever each tool loads its rules on its own — `.cursor/rules/dsaireadable.mdc`, `.claude/rules/dsaireadable.md`, `.github/instructions/dsaireadable.instructions.md`. It overwrites no `AGENTS.md`. For a tool that only reads `AGENTS.md` (Codex…): add a line there that points to `.claude/rules/dsaireadable.md`.
2. **The catalog**: `npx shadcn@latest mcp init --client claude` (or `cursor`, `vscode`, `codex`, `opencode`) wires up shadcn's MCP server. It accepts the `Toniio/DSAIReadable` registry to search, browse and get the install command of an item; the rules above give the agent the address.
3. **The design system in detail** (specs, tokens, screen validation): the [repository's MCP server](#mcp-server), run locally.

### Versions

With no suffix, an item installs from `main`. `#<tag|full SHA>` pins **the requested item only**: its internal dependencies (`design-system`, another component) are still resolved on `main` — checked with CLI 4.21. Full pinning will wait for published versions.

### Guarantees

`registry.json` is **generated** — `npm run registry:build` derives it from the inventory, the specs and the actual imports. CI rejects a registry that is out of sync, an internal dependency written as a bare name and, above all, an **unusable** registry: `npm run registry:test-install` installs the 69 items in a blank app with non-standard aliases, type-checks it, then builds its stylesheet and checks what Tailwind emits: the lockdown holds, both fonts resolve to a declared `@font-face`, `dark:`, `sm:`, `data-open:` and `z-modal` compile. On a PR, it tests the registry built by the branch; after each merge, the published addresses.

---

## Tokens

Three-tier architecture in the [W3C DTCG](https://www.designtokens.org/TR/2025.10/format/) format (Format and Resolver Modules 2025.10, checked by Terrazzo):

```
tokens/tokens.resolver.json → the three tiers, then the color-scheme modifier (light by default, dark)
tokens/primitive.json       → raw values (hex, rem, ms) — never referenced directly
tokens/semantic.json        → design decisions, light values
tokens/semantic.dark.json   → the dark values of the semantic tokens that change
tokens/component.json       → shadcn/ui aliases (--background, --primary, --ring…)
```

The tokens are exported as CSS custom properties in `tokens.css`.

---

## Component specs

Every component has a spec in `specs/components/<component>.md`, in 13 sections:

> **Metadata** · **Role** · **Usage** · **Constraints** · **Dependencies** · **Anatomy** · **Tokens** · **Props / API** · **Variants** · **States** · **Accessibility** · **Code example** · **Cross-references**

**Variants** is generated from the code's `cva()` calls (`npm run specs:variants`), **Tokens** from its classes, resolved by Tailwind down to the semantic token (`npm run specs:tokens`), and **Props / API** from its TypeScript exports, where only the descriptions are edited by hand (`npm run specs:api`); `specs:validate` checks all three. The rules for choosing between sibling components (selection, surfaces, collections) live once in `composition_rules` and are copied into the **Usage** of the specs they concern (`npm run specs:choices`). Rules (**Constraints**, **Accessibility**…) are written **MUST** / **MUST NOT** with a threshold or an observable criterion, or **SHOULD** with its exception (**unless**); every **Constraints** line opens with one of these keywords, or with **Note** for a fact that imposes nothing; `specs:validate` rejects wording that leaves the decision to the reader ("avoid", "prefer", "if needed"…). **Accessibility** gives, in a fixed structure, the ARIA pattern, the role, the keys, the accessible-name requirement and the pitfalls — known defects included — against the WCAG 2.2 AA target.

The MCP server ingests these specs through `dsaireadable_get_component_specs`; they are the components' behavioral source of truth.

---

## Scripts and tooling

### Token validation

```bash
npm run tokens:lint-naming   # Checks the keys of the 3 tiers against the declarative grammar
npm run docs:tokens          # Regenerates token-reference.md + tokens.manifest.json
npm run tokens:lint-values   # Detects raw values in components
npm run tokens:lint-bridge   # Checks Tailwind's @theme bridge
npm run tokens:lint-monotonic # Every palette gets strictly darker as its step number goes up
npm run tokens:lint-chart     # Chart series: 3:1 on the backgrounds, pairwise distinct, color blindness included
npm run tokens:lint-lifecycle # Each token's active / reserved / deprecated status matches the code
npm run tokens-validate      # Every check in sequence (required before any commit)
```

- **`lint-token-naming.ts`** — checks the **3 tiers** against a declarative grammar: each foundation declares its allowed shapes, and each variable segment is resolved against a **closed enum** (states: `hover|active|focus|disabled|selected`) or an explicit numeric pattern. Adding a role or a state is therefore a deliberate change to the grammar table at the top of `scripts/lint-token-naming.ts`.
- **`lint-raw-values.ts`** — forbids any hex, rgb, px or ms in components. Exception: `// allow-raw: <reason>`.
- **`lint-theme-bridge.ts`** — checks that the `@theme` bridge in `styles/globals.css` stays aligned with the tokens.

### Development

```bash
npm run lint         # ESLint
npm run format       # Prettier (sorts Tailwind classes automatically)
npm run typecheck    # tsc --noEmit
```

---

## Non-negotiable conventions

- **Never a raw value** in a component — everything goes through a CSS token (`var(--color-*)`) or a Tailwind class mapped to a token.
- **Never a Primitive token directly** — only the Semantic (`tokens/semantic.json`) and Component (`tokens/component.json`) tiers are public.
- **`npm run tokens-validate` before every commit** — zero errors required to merge.
- **Phosphor icons only** — `@phosphor-icons/react`. No Lucide, no Heroicons.
- **Class-based dark mode** — the `.dark` class on `<html>`. No `prefers-color-scheme`.
- **WCAG 2.2 AA** — contrast (checked in both modes), 24px minimum pointer targets (`size.target.min`), visible focus. APCA is reported as an advisory level only.
- **Read the spec** before writing or changing a component (`specs/components/<component>.md`).
- **Everything in American English** — code, comments, docs, specs and UI copy.

---

## Design tool

The integration layer with a design tool (Code Connect, variable sync,
programmatic component generation) has been removed from the repository to keep
the design system **code-first** and driven by AI agents only.

The full reintegration spec — node-id mapping, script behavior, dependencies and
configuration — is kept in [`FIGMA_REINTEGRATION.md`](./FIGMA_REINTEGRATION.md).

---

## License

[MIT](./LICENSE). The components are derived from shadcn/ui, also MIT: see [`NOTICE.md`](./NOTICE.md).
