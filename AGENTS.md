# AGENTS.md — DSAIReadable repository rules

Every agent session reads this file automatically. It overrides any memory,
habit or generic convention. When it contradicts another document in the
repository, **this file wins** — and the contradiction must be reported.

This repository is a design system built to be consumed by LLMs. Each rule
below exists because breaking it produces non-conforming generated code.

---

## 1. Non-negotiable conventions

| Rule                                                                                                        | Why                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Never a raw value** (hex, `rgb()`, `oklch()`, `px`, `rem`, `ms`) in a component                           | Everything goes through a `var(--color-*)` CSS token or a Tailwind class mapped to a token. The only exception is explicit: `// allow-raw: <reason>`                                                                                                                    |
| **Never reference a Primitive token directly**                                                              | `tokens/primitive.json` is Tier 1, private. Only Semantic (`tokens/semantic.json`) and Component (`tokens/component.json`) are public                                                                                                                                   |
| **Phosphor icons only** — `@phosphor-icons/react`                                                           | No Lucide, no Heroicons, no inline SVG                                                                                                                                                                                                                                  |
| **Only the design system's Tailwind classes exist**                                                         | `app/globals.css` removes the default colors, radii and shadows (`--color-*: initial`…): `bg-red-500` generates no CSS, and `better-tailwindcss/no-unknown-classes` rejects it at lint time. Fixed white and black: `bg-white`, `bg-black/10` (`color.static.*` tokens) |
| **Class-based dark mode** — the `.dark` class on `<html>`                                                   | No `prefers-color-scheme`                                                                                                                                                                                                                                               |
| **Read `specs/components/<Component>.md` before writing or changing a component**                           | The spec is the behavioral source of truth, in 13 sections                                                                                                                                                                                                              |
| **`npm run tokens-validate` before every commit**                                                           | Zero errors required                                                                                                                                                                                                                                                    |
| **Everything committed is written in English** — code, comments, docs, specs, token descriptions, demo copy | The repository is public and read by people and agents who may not speak any other language. Write natively, do not translate                                                                                                                                           |

## 2. Token architecture

Three tiers in the [W3C DTCG](https://design-tokens.github.io/community-group/format/)
format, in this strict order of reference:

```
tokens/primitive.json   Tier 1 — raw values                PRIVATE, never referenced outside Tier 2
tokens/semantic.json    Tier 2 — decisions, light/dark modes
tokens/component.json   Tier 3 — shadcn/ui aliases (--background, --primary, --ring…)
        ↓ npm run tokens:build
tokens.css              generated CSS custom properties — NEVER EDIT BY HAND
        ↓ @theme bridge
app/globals.css
```

A Tier 2 or 3 token holds **only** `{…}` references, never a literal value.
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
npm run tokens-validate   # DTCG naming + raw values + @theme bridge + focus + contrast + palette monotonicity + chart palette + fonts + lifecycle + freshness
npm run typecheck:all     # app + scripts + mcp-server
npm run lint              # ESLint
npm run index:validate    # 5 checks: JSON Schema, sizes, data-slot, UI strings, Props types
npm run specs:validate    # the 59 specs against the 13 canonical sections + Variants, Tokens, Props / API and choice rules up to date + no hedged wording + llms.txt up to date
npm run docs:tokens       # regenerates token-reference.md + tokens.manifest.json
npm run registry:check    # registry.json freshness + internal dependencies
npm run registry:test-install  # installs the 61 items in a blank app and builds it
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
