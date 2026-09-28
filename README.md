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
├── app/                        # Next.js app (component demos)
├── components/ui/              # The design system's 59 React components (customized shadcn/ui)
├── lib/                        # Shared modules: utils, focus, ui-strings, overlay
├── tokens/                     # Source of truth for the tokens (three-tier DTCG JSON)
│   ├── primitive.json          # Tier 1 — raw values (private)
│   ├── semantic.json           # Tier 2 — semantic tokens (public)
│   └── component.json          # Tier 3 — shadcn/ui aliases (public)
├── tokens.css                  # Generated CSS custom properties — do not edit
├── specs/                      # The design system's Markdown documentation
│   ├── components/             # 59 component specs (13 sections each)
│   ├── foundations/            # Color, typography, spacing, motion, radius… specs
│   └── tokens/token-reference.md  # Reference of the 301 tokens (generated)
├── mcp-server/                 # MCP server @dsaireadable/mcp-server
│   ├── src/
│   │   ├── tools/              # MCP tools (ds-core, dataviz, ux-writing, admin)
│   │   ├── prompts/            # MCP prompts
│   │   ├── lib/                # Cache loading, validate_screen, composition rules
│   │   └── context/            # generate.ts: builds the cache
│   └── context/                # Precompiled JSON files (the design system cache) — generated
├── scripts/                    # Tooling: token, spec, index and registry generation and linting
├── registry/                   # Sources of the registry items that are not components
├── registry.json               # shadcn registry — generated
├── design-system.index.json    # Machine-readable inventory of the design system
└── design-system.schema.json   # JSON Schema that validates the index
```

---

## MCP server

The MCP server (`mcp-server/`) exposes the design system as tools AI agents can query.

### Getting started

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

| Variable              | Default                                         | Role                                                                    |
| --------------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| `MCP_HOST`            | `127.0.0.1`                                     | Listening interface. Only widen it deliberately                         |
| `PORT` / `MCP_PORT`   | `3100`                                          | Listening port                                                          |
| `MCP_ALLOWED_ORIGINS` | `localhost` + `127.0.0.1` on the listening port | Comma-separated list of origins                                         |
| `MCP_SESSION_TTL_MS`  | `1800000` (30 min)                              | Expiry of idle sessions; an expired or unknown session receives a `404` |
| `MCP_MAX_SESSIONS`    | `100`                                           | Maximum number of concurrent sessions                                   |

### Available tools

| Category       | Tools                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DS Core**    | `get_design_system_overview`, `get_components`, `get_component_specs`, `get_component_variants`, `get_tokens`, `get_typography`, `get_icons`, `get_design_rules`, `get_page_patterns` |
| **Dataviz**    | Chart-specific tools (Recharts + design system tokens)                                                                                                                                |
| **UX Writing** | `get_ux_writing_rules` (default strings, overriding, language), `get_glossary`, `get_content_library`                                                                                 |
| **Admin**      | Tools to manage and inspect the design system                                                                                                                                         |

Every tool is annotated as read-only (`readOnlyHint`, `openWorldHint: false`): a client does not need
to confirm its calls. `get_component_specs`, `get_design_rules` and `get_ux_writing_rules` take
`response_format`: `concise` by default (under 20 % of the volume), `detailed` for everything.
`get_components` and `get_tokens` paginate: `limit` (100 by default) and `cursor`, with a
`{ total, items, next_cursor }` response.

### Resources

| URI                          | Content                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `ds://component/{name}/spec` | A component's full spec; all 59 are listed, and `{name}` autocompletes           |
| `ds://token/{path}`          | A semantic token (`ds://token/color.background.default`); `{path}` autocompletes |
| `ds://guidelines`            | Critical rules, foundation rules, composition rules                              |

### Connecting from VS Code / Copilot

Add to `.vscode/mcp.json` or `~/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "dsaireadable": {
      "command": "npx",
      "args": ["tsx", "./mcp-server/src/index.ts"]
    }
  }
}
```

---

## Publishing identity

One name, adapted to the constraint of each channel. Any future publication
follows it — do not reintroduce a capitalized variant.

| Channel               | Identifier                   | Why this form                                                                    |
| --------------------- | ---------------------------- | -------------------------------------------------------------------------------- |
| GitHub repository     | `Toniio/DSAIReadable`        | The project's original name; the only place where casing is free                 |
| shadcn registry       | `dsaireadable`               | A registry name only allows alphanumerics, hyphens and underscores               |
| A component's item    | `Toniio/DSAIReadable/<item>` | The full GitHub address: a bare name would point to the official shadcn registry |
| npm scope             | `@dsaireadable`              | npm forbids capitals in a scope                                                  |
| Published npm package | `@dsaireadable/mcp-server`   | The only package published so far                                                |

The `@dsaireadable` scope is **not reserved** on npm: it will only be once a second
package is actually published. The former `@DSAIReadable` scope could not be
published — it only survives in archived documents, flagged as obsolete.

---

## Consuming the design system

The distribution channel is the **shadcn registry** carried by this public repository: there is no npm package to install. The `registry.json` at the root is enough — the CLI reads the repository directly, with no server and no per-component JSON to host.

What the consumer needs: a React + Tailwind CSS v4 project with a `components.json` (`npx shadcn@latest init`). The project's aliases are respected: the CLI rewrites the `@/…` imports to its own.

### Install

```bash
# A component — the base item (tokens, dark mode, cn(), focus, labels, modal surfaces) comes along automatically
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

### Explore

```bash
npx shadcn@latest search Toniio/DSAIReadable -q card   # search
npx shadcn@latest view Toniio/DSAIReadable/card        # view an item and its source
npx shadcn@latest add Toniio/DSAIReadable/card --dry-run
```

Every component has its spec — props, variants, states, accessibility — in [`specs/components/`](./specs/components/).

### With an agent

1. **The rules**: the `conventions` item drops the same file wherever each tool loads its rules on its own — `.cursor/rules/dsaireadable.mdc`, `.claude/rules/dsaireadable.md`, `.github/instructions/dsaireadable.instructions.md`. It overwrites no `AGENTS.md`. For a tool that only reads `AGENTS.md` (Codex…): add a line there that points to `.claude/rules/dsaireadable.md`.
2. **The catalog**: `npx shadcn@latest mcp init --client claude` (or `cursor`, `vscode`, `codex`, `opencode`) wires up shadcn's MCP server. It accepts the `Toniio/DSAIReadable` registry to search, browse and get the install command of an item; the rules above give the agent the address.
3. **The design system in detail** (specs, tokens, screen validation): the [repository's MCP server](#mcp-server), run locally.

### Versions

With no suffix, an item installs from `main`. `#<tag|full SHA>` pins **the requested item only**: its internal dependencies (`design-system`, another component) are still resolved on `main` — checked with CLI 4.21. Full pinning will wait for published versions.

### Guarantees

`registry.json` is **generated** — `npm run registry:build` derives it from the inventory, the specs and the actual imports. CI rejects a registry that is out of sync, an internal dependency written as a bare name and, above all, an **unusable** registry: `npm run registry:test-install` installs the 61 items in a blank app with non-standard aliases, then builds it. On a PR, it tests the registry built by the branch; after each merge, the published addresses.

---

## Tokens

Three-tier architecture in the [W3C DTCG](https://design-tokens.github.io/community-group/format/) format:

```
tokens/primitive.json   → raw values (hex, rem, ms) — never referenced directly
tokens/semantic.json    → design decisions, with light/dark modes
tokens/component.json   → shadcn/ui aliases (--background, --primary, --ring…)
```

The tokens are exported as CSS custom properties in `tokens.css`.

---

## Component specs

Every component has a spec in `specs/components/<component>.md`, in 13 sections:

> **Metadata** · **Role** · **Usage** · **Constraints** · **Dependencies** · **Anatomy** · **Tokens** · **Props / API** · **Variants** · **States** · **Accessibility** · **Code example** · **Cross-references**

**Variants** is generated from the code's `cva()` calls (`npm run specs:variants`), **Tokens** from its classes, resolved by Tailwind down to the semantic token (`npm run specs:tokens`), and **Props / API** from its TypeScript exports, where only the descriptions are edited by hand (`npm run specs:api`); `specs:validate` checks all three. The rules for choosing between sibling components (selection, surfaces, collections) live once in `composition_rules` and are copied into the **Usage** of the specs they concern (`npm run specs:choices`). Rules (**Constraints**, **Accessibility**…) are written **MUST** / **MUST NOT** with a threshold or an observable criterion, or **SHOULD** with its exception (**unless**); every **Constraints** line opens with one of these keywords, or with **Note** for a fact that imposes nothing; `specs:validate` rejects wording that leaves the decision to the reader ("avoid", "prefer", "if needed"…). **Accessibility** gives, in a fixed structure, the ARIA pattern, the role, the keys, the accessible-name requirement and the pitfalls — known defects included.

The MCP server ingests these specs through `get_component_specs`; they are the components' behavioral source of truth.

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
- **`lint-theme-bridge.ts`** — checks that the `@theme` bridge in `app/globals.css` stays aligned with the tokens.

### Development

```bash
npm run dev          # Next.js with Turbopack
npm run build        # Production build
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
- **Read the spec** before writing or changing a component (`specs/components/<component>.md`).
- **Everything in English** — code, comments, docs, specs and demo copy.

---

## Design tool

The integration layer with a design tool (Code Connect, variable sync,
programmatic component generation) has been removed from the repository to keep
the design system **code-first** and driven by AI agents only.

The full reintegration spec — node-id mapping, script behavior, dependencies and
configuration — is kept in [`FIGMA_REINTEGRATION.md`](./FIGMA_REINTEGRATION.md).
