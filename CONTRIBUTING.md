# Contribuer à DSAIReadable

Les règles applicables aux agents IA comme aux humains sont dans
[`AGENTS.md`](./AGENTS.md). Ce document ne couvre que le processus de contribution.

## Prérequis

- Node.js 24
- `npm ci` à la racine **et** `npm ci --prefix mcp-server`

Les hooks git sont installés automatiquement par le script `prepare` (husky).
Si `.husky/_` est absent, lancer `npm install`.

## Cycle de travail

Une contribution = **un item du backlog**.

```bash
git switch -c fix/p0-03-destructive-foreground
# … modifications …
npm run tokens-validate && npm run typecheck:all && npm run lint
git commit -m "fix(tokens): add destructive-foreground token"
git push -u origin fix/p0-03-destructive-foreground
gh pr create
```

### Nommage des branches

| Préfixe     | Usage                                   |
| ----------- | --------------------------------------- |
| `feat/`     | nouvelle capacité                       |
| `fix/`      | correction de bug                       |
| `chore/`    | maintenance, dépendances                |
| `docs/`     | documentation, specs                    |
| `ci/`       | CI, hooks, outillage de build           |
| `refactor/` | refonte sans changement de comportement |
| `test/`     | tests                                   |

### Messages de commit

Format [Conventional Commits](https://www.conventionalcommits.org/) :
`type(scope): sujet à l'impératif, sans majuscule initiale, sans point final`.

Types autorisés : `feat` `fix` `chore` `docs` `ci` `refactor` `test` `style`
`perf` `build` `revert`. En-tête limité à 100 caractères.

Le hook `commit-msg` rejette tout message non conforme. **Ne jamais contourner
avec `--no-verify`.**

### Pull requests

- Le **titre de la PR** devient le message de commit sur `main` (squash merge) :
  il doit être au format Conventional Commits. Le workflow `pr-lint` le vérifie.
- Remplir le gabarit : item du backlog, critères d'acceptation, sortie de la
  commande de validation.
- **CI verte obligatoire.** `main` est protégée, aucun push direct n'est possible.
- Squash merge, puis suppression de la branche.
- Un tag de version est posé à la fin de chaque lot de priorité du backlog.

## Ce que la CI vérifie

| Job                 | Commande                                                                     |
| ------------------- | ---------------------------------------------------------------------------- |
| `tokens-validate`   | `npm run tokens-validate`                                                    |
| `typecheck`         | `npm run typecheck:all`                                                      |
| `lint`              | `npm run lint` + `prettier --check`                                          |
| `build`             | `npm run build`                                                              |
| `index-schema`      | `npm run index:validate`                                                     |
| `spec-sections`     | `npm run specs:validate`                                                     |
| `context-freshness` | `npm run generate-context` puis échec si l'arbre est sale                    |
| `mcp-test`          | `npm run mcp:test`                                                           |
| `registry`          | `npm run registry:check`, validation shadcn, `npm run registry:test-install` |

## Style de code

Imposé par `.prettierrc` et appliqué par le hook pre-commit : 2 espaces,
guillemets doubles, pas de point-virgule, `trailingComma: es5`. Une configuration
unique pour tout le dépôt (`.ts`, `.tsx`, `.md`), `mcp-server/` compris. Ne jamais réordonner les classes
Tailwind à la main — `prettier-plugin-tailwindcss` s'en charge.

## Serveur MCP en local

Copier `.vscode/mcp.json.example` vers `.vscode/mcp.json` (non versionné).
