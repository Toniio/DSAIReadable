# Instructions Copilot — DSAIReadable

> **Source de vérité unique : [`AGENTS.md`](../AGENTS.md) à la racine du dépôt.**
> Lis-le intégralement avant toute modification. Ce fichier n'en est qu'un rappel
> court ; il n'existe pas pour dupliquer les règles — deux copies divergent.

## Rappel des règles bloquantes

- **Zéro valeur brute** dans un composant : hex, `rgb()`, `oklch()`, `px`, `rem`, `ms`
  passent par un token. Exception explicite uniquement : `// allow-raw: <raison>`.
- **Tier 1 privé** : ne jamais référencer `tokens/primitive.json` hors de `semantic.json`.
- **Icônes Phosphor uniquement** (`@phosphor-icons/react`).
- **Dark mode class-based** (`.dark` sur `<html>`), jamais `prefers-color-scheme`.
- **Lire `specs/components/<Composant>.md`** avant d'écrire ou modifier un composant.
- **Ne jamais éditer à la main** `tokens.css`, `mcp-server/context/*.json`,
  `design-system.index.json`, `specs/tokens/token-reference.md`, `tokens.manifest.json` —
  ces fichiers sont générés.

## Avant de proposer un commit

```bash
npm run tokens-validate && npm run typecheck:all && npm run lint
```

## Workflow git

Branche typée (`feat/` `fix/` `chore/` `docs/` `ci/` `refactor/` `test/`) →
commits Conventional Commits → PR (1 PR = 1 item de backlog) → squash merge.
`main` est protégée, aucun push direct. Ne jamais utiliser `--no-verify`.
