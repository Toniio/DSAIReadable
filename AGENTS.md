# AGENTS.md — DSAIReadable repository rules

Every agent session reads this file automatically. It overrides any memory,
habit or generic convention. When it contradicts another document in the
repository, **this file wins** — and the contradiction must be reported.

This repository is a design system built to be consumed by LLMs. Each rule
below exists because breaking it produces non-conforming generated code.

---

## 1. Non-negotiable conventions

| Rule                                                                                                                                                                                   | Why                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Never a raw value** (hex, `rgb()`, `oklch()`, `px`, `rem`, `ms`) in a component                                                                                                      | Everything goes through a `var(--color-*)` CSS token or a Tailwind class mapped to a token. The only exception is explicit: `// allow-raw: <reason>`                                                                                                                                                                                                |
| **Never reference a Primitive token directly**                                                                                                                                         | `tokens/primitive.json` is Tier 1, private. Only Semantic (`tokens/semantic.json`) and Component (`tokens/component.json`) are public                                                                                                                                                                                                               |
| **Phosphor icons only** — `@phosphor-icons/react`                                                                                                                                      | No Lucide, no Heroicons, no inline SVG                                                                                                                                                                                                                                                                                                              |
| **Only the design system's Tailwind classes exist**                                                                                                                                    | `styles/globals.css` removes Tailwind's default colors, radii, shadows, spacing and type scale (`--color-*: initial`, `--spacing: initial`…): `bg-red-500`, `p-13` or `text-7xl` generate no CSS, and `better-tailwindcss/no-unknown-classes` rejects them at lint time. Fixed white and black: `bg-white`, `bg-black/10` (`color.static.*` tokens) |
| **Class-based dark mode** — the `.dark` class on `<html>`                                                                                                                              | No `prefers-color-scheme`                                                                                                                                                                                                                                                                                                                           |
| **Read `specs/components/<Component>.md` before writing or changing a component**                                                                                                      | The spec is the behavioral source of truth, in 13 sections                                                                                                                                                                                                                                                                                          |
| **The shadcn/ui API is the contract** — a divergence is additive (a new optional prop, a new component); renaming or removing a prop, export or value takes a reason and a declaration | Models write the shadcn/ui API from their training data. An undeclared divergence is code that does not compile, or that behaves differently. Every divergence is declared in `design-system.index.json` (`shadcn.divergences`, with the reason), which the MCP server serves with each spec                                                        |
| **`npm run tokens-validate` before every commit**                                                                                                                                      | Zero errors required                                                                                                                                                                                                                                                                                                                                |
| **Everything committed is written in American English** — code, comments, docs, specs, token descriptions, demo copy                                                                   | The repository is public and read by people and agents who may not speak any other language. Write natively, do not translate; one spelling per word (`color`, `behavior`, `labeled`, `-ize`), so a search finds every occurrence                                                                                                                   |

## 2. Token architecture

Three tiers in the [W3C DTCG](https://www.designtokens.org/TR/2025.10/format/)
format — Format Module 2025.10 and Resolver Module 2025.10, checked by Terrazzo
(`npm run tokens:lint-dtcg`, `terrazzo.config.ts`) — in this strict order of reference:

```
tokens/tokens.resolver.json  the three sets below, in this order, then the color-scheme modifier
tokens/primitive.json        Tier 1 — raw values                PRIVATE, never referenced outside Tier 2
tokens/semantic.json         Tier 2 — decisions, light values
tokens/semantic.dark.json    Tier 2 — the dark context: the semantic tokens dark changes
tokens/component.json        Tier 3 — shadcn/ui aliases (--background, --primary, --ring…)
        ↓ npm run tokens:build
tokens.css              generated CSS custom properties — NEVER EDIT BY HAND
        ↓ @theme bridge
styles/globals.css
```

A Tier 2 or 3 token holds **only** `{…}` references, never a literal value.
The three files form one DTCG document: the primitives sit under the
`primitive` group, so a semantic token names one in full,
`{primitive.radius.md}`. Values take the 2025.10 object forms
(`{ "colorSpace": "srgb", "components": […] }`, `{ "value": 1, "unit": "rem" }`),
and `mcp-server/src/lib/dtcg.ts` prints them as CSS. One declared divergence:
letter spacing stays in `em`, which the Format Module does not list.

Modes follow the Resolver Module: the `color-scheme` modifier of
`tokens/tokens.resolver.json` defaults to `light` (the values of
`semantic.json`), and its `dark` context is `semantic.dark.json`. An override
there redefines an existing semantic token with its `$type` and a `{…}`
reference, nothing else; its description, status and docs stay in
`semantic.json`. An override exists only if it changes the value: one that
repeats the light value is an error, and `color.static.*` never has one.
`loadTokens` in `mcp-server/src/lib/dtcg.ts` is the only reader of the
resolver: a script that needs a value in a mode asks it.
`$extensions.modes` is rejected by `tokens:lint-naming`.
`tokens.css` is generated: any direct edit is overwritten by the next build and
caught by `npm run tokens:check`.

Every semantic token declares its lifecycle, checked by
`npm run tokens:lint-lifecycle`: `$extensions.status` is `active` (consumed; a
font family is consumed by `next/font`, which loads it — `tokens:lint-fonts`
checks that the token names the right one) or `reserved` (a valid decision
nothing consumes yet, with its intent in its `$description`), or the token
carries `$deprecated` (do not use it any more). A new token declares its status;
a `reserved` token that starts being consumed becomes `active`. A primitive that
no token references any more is deleted, unless it is declared `reserved` with
the reason why.

## 3. Validation commands

```bash
npm run tokens-validate   # DTCG 2025.10 conformance + naming + raw values + @theme bridge + focus + contrast + palette monotonicity + chart palette + fonts + lifecycle + freshness
npm run typecheck:all     # app + scripts + mcp-server
npm run lint              # ESLint, zero warnings
npm run lint:language     # American English only: French words, diacritics and British spellings
npm run knip              # zero-base: no unused file, export or dependency (knip.jsonc says why each entry point stays)
npm run index:validate    # 6 checks: JSON Schema, sizes, data-slot, UI strings, Props types, shadcn/ui API
npm run shadcn:baseline   # refetches the shadcn/ui API into shadcn-api.baseline.json (network)
npm run specs:validate    # the 59 specs against the 13 canonical sections + Variants, Tokens, Props / API and choice rules up to date + no hedged wording + llms.txt up to date
npm run docs:tokens       # regenerates token-reference.md + tokens.manifest.json
npm run registry:check    # registry.json freshness + internal dependencies
npm run registry:test-install  # installs the 63 items in a blank app, builds it and its CSS
npm run generate-context  # regenerates the MCP cache — must produce zero diff
npm run mcp:test          # the MCP server's test suite
npm run test:components   # component tests: roles, names, keyboard, variants, axe-core
npm run build             # Next.js production build
```

After any token or TypeScript change:
`npm run tokens-validate && npm run typecheck:all`.

Before a commit, `npm run check` runs every CI check above in one call except
`build`, `registry:test-install` and the networked `shadcn registry validate`,
and prints only what failed. Prefer it to running the checks one by one: each
separate run is one more agent turn and more output in the context.

## 4. Git workflow — mandatory

Lightweight trunk-based development with PRs. `main` is protected: **no direct
push**, not even for the repository owner.

1. **One branch per backlog item**, prefixed with its type:
   `feat/` `fix/` `chore/` `docs/` `ci/` `refactor/` `test/`
   Example: `fix/p0-03-destructive-foreground`
2. **Commits follow [Conventional Commits](https://www.conventionalcommits.org/)**.
   Example: `fix(tokens): add destructive-foreground token`
   The `commit-msg` hook rejects any non-conforming message.
3. **1 PR = 1 backlog item**, **squash merge**, branch deleted after the merge.
   The PR title becomes the commit message: it must conform too.
4. **Green CI required** before merging.

Never bypass a hook with `--no-verify`. A hook that blocks points at a real
problem: fix it, do not disable it.

## 5. Guards in place

| Guard                                         | What it blocks                                                                                                                                            |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.husky/pre-commit` → lint-staged             | Prettier + ESLint on the touched files, `typecheck:all` on everything                                                                                     |
| `.husky/commit-msg` → commitlint              | A non-conforming commit message                                                                                                                           |
| `.husky/pre-push`                             | A direct push to `main`                                                                                                                                   |
| `.github/workflows/ci.yml`                    | 10 jobs: `tokens-validate`, `typecheck`, `lint`, `build`, `index-schema`, `spec-sections`, `context-freshness`, `mcp-test`, `component-tests`, `registry` |
| `.github/workflows/pr-lint.yml`               | A non-conforming PR title                                                                                                                                 |
| `.github/workflows/dependabot-regenerate.yml` | A Dependabot PR left red by stale generated files: it reruns `registry:build`, `generate-context` and Prettier, then pushes the result                    |

Each § 1 rule, and the check that enforces it:

| § 1 rule                                 | Enforced by                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Never a raw value                        | `tokens:lint-values` — hex, `rgb()`, `oklch()`, `px`, `rem`, `ms`, arbitrary Tailwind values (`duration-[…]`, `ease-[…]`, `p-[…]`…), pixel ring and outline widths (`ring-1`, bare `ring`, `outline-1`, bare `outline`, `outline-offset-2`, never exemptable), each `allow-raw` checked against `tokens/allow-raw.registry.json`; `tokens:lint-focus` for focus-ring widths |
| Never reference a Primitive token        | `tokens:lint-values` (`--ds-prim-*` in `app/`, `components/`, `lib/`, `hooks/`, no `allow-raw` opt-out), `tokens:lint-bridge` (the `@theme` bridge), `tokens:build` (Tier 3 may reference Tier 2 only)                                                                                                                                                                      |
| Phosphor icons only                      | ESLint `no-restricted-imports` (other icon kits) and `no-restricted-syntax` (inline `<svg>`; `logo.tsx` and `illustration.tsx` declared as artwork in `eslint.config.mjs`)                                                                                                                                                                                                  |
| Only the design system's classes         | ESLint `better-tailwindcss/no-unknown-classes`, and `no-restricted-classes` for opacity outside binary states                                                                                                                                                                                                                                                               |
| Class-based dark mode                    | `tokens:lint-values` (`prefers-color-scheme`, no `allow-raw` opt-out)                                                                                                                                                                                                                                                                                                       |
| Read the spec first                      | Not checkable; `specs:validate` keeps each spec in step with its code (Variants, Tokens, Props / API) and `index:schema` keeps its Metadata in step with the index, so what the spec says is true                                                                                                                                                                           |
| The shadcn/ui API is the contract        | `index:shadcn` — each component's exports, rendered element, props, union values and defaults against `shadcn-api.baseline.json` (the upstream API, extracted from the registry of the `components.json` style): every difference is declared in `shadcn.divergences`, and every declaration matches a difference                                                           |
| `tokens-validate` before every commit    | The required `tokens-validate` CI job, and `npm run check`                                                                                                                                                                                                                                                                                                                  |
| Everything committed in American English | `lint:language`, in `npm run check` and the CI `lint` job                                                                                                                                                                                                                                                                                                                   |

## 6. Publishing identity

One name per channel, documented in a single table:
[README → _Publishing identity_](./README.md#publishing-identity).
In short: repository `Toniio/DSAIReadable`, shadcn registry `dsaireadable`, npm
scope `@dsaireadable`, internal dependency `Toniio/DSAIReadable/<item>`.
**Never any capitals** outside the GitHub repository name.

## 7. Code style

Defined by `.prettierrc` and applied automatically: **2 spaces, double quotes,
no semicolons, `trailingComma: es5`**. A single configuration covers the whole
repository — `.ts`, `.tsx` and `.md`, `mcp-server/` included — and CI checks it.
Generated Markdown (`token-reference.md`) is emitted already formatted by its
generator. Tailwind classes are sorted by `prettier-plugin-tailwindcss` — never
reorder them by hand.

## 8. Areas not to touch without an explicit instruction

- `tokens.css` — generated by `npm run tokens:build`
- `mcp-server/context/*.json` — generated by `npm run generate-context`
- `design-system.index.json` — the inventory, regenerated by the tooling
- `registry.json` — the shadcn registry, generated by `npm run registry:build`
- `shadcn-api.baseline.json` — the upstream shadcn/ui API, generated by `npm run shadcn:baseline`
- `specs/tokens/token-reference.md` and `tokens.manifest.json` — generated by `npm run docs:tokens`
  (edit the editorial prose in the `$extensions.docs` of `tokens/*.json`)
- `llms.txt` — generated by `npm run docs:llms` from the specs (edit a spec's Role, or the entry
  points listed in `scripts/build-llms-txt.ts`)
- The audit and backlog files at the root: kept out of the repository (`.gitignore`)

## 9. When in doubt

When a task instruction contradicts this file, **stop and report it** instead of
deciding alone. A rule broken here spreads to all the code that downstream
agents generate.

## 10. Agent instruction files

| File                                | Role                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| `AGENTS.md`                         | This file: rules for the whole repository, the single reference               |
| `mcp-server/AGENTS.md`              | Rules specific to the MCP server; complements this file, never contradicts it |
| `CLAUDE.md`, `mcp-server/CLAUDE.md` | Symlinks to the `AGENTS.md` of the same folder, for Claude Code — do not edit |
| `.github/copilot-instructions.md`   | A short reminder for Copilot, pointing here                                   |

A rule is written **once**, in the `AGENTS.md` closest to the code it governs.
Never list a `CLAUDE.md` in a shadcn registry item: symlinks are not
distributed.
