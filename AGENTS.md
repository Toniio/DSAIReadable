# AGENTS.md — règles du dépôt DSAIReadable

Ce fichier est lu automatiquement à chaque session d'agent. Il fait autorité sur
toute mémoire, habitude ou convention générique. En cas de contradiction avec un
autre document du dépôt, **c'est ce fichier qui gagne** — et la contradiction doit
être signalée.

Ce dépôt est un design system conçu pour être consommé par des LLMs. Chaque règle
ci-dessous existe parce que sa violation produit du code généré non conforme.

---

## 1. Conventions non négociables

| Règle                                                                                     | Pourquoi                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Jamais de valeur brute** (hex, `rgb()`, `oklch()`, `px`, `rem`, `ms`) dans un composant | Tout passe par un token CSS `var(--color-*)` ou une classe Tailwind mappée sur un token. Exception explicite uniquement : `// allow-raw: <raison>`                                                                                                                       |
| **Jamais de token Primitive référencé directement**                                       | `tokens/primitive.json` est le Tier 1, privé. Seuls Semantic (`tokens/semantic.json`) et Component (`tokens/component.json`) sont publics                                                                                                                                |
| **Icônes Phosphor uniquement** — `@phosphor-icons/react`                                  | Pas de Lucide, pas de Heroicons, pas de SVG inline                                                                                                                                                                                                                       |
| **Seules les classes Tailwind du design system existent**                                 | `app/globals.css` supprime les couleurs, rayons et ombres par défaut (`--color-*: initial`…) : `bg-red-500` ne génère aucun CSS, et `better-tailwindcss/no-unknown-classes` le refuse au lint. Blanc et noir fixes : `bg-white`, `bg-black/10` (tokens `color.static.*`) |
| **Dark mode class-based** — classe `.dark` sur `<html>`                                   | Pas de `prefers-color-scheme`                                                                                                                                                                                                                                            |
| **Lire `specs/components/<Composant>.md` avant d'écrire ou modifier un composant**        | La spec est la source de vérité comportementale, en 13 sections                                                                                                                                                                                                          |
| **`npm run tokens-validate` avant tout commit**                                           | Zéro erreur requis                                                                                                                                                                                                                                                       |

## 2. Architecture des tokens

Trois tiers au format [DTCG W3C](https://design-tokens.github.io/community-group/format/),
dans cet ordre de référence strict :

```
tokens/primitive.json   Tier 1 — valeurs brutes            PRIVÉ, jamais référencé hors Tier 2
tokens/semantic.json    Tier 2 — décisions, modes light/dark
tokens/component.json   Tier 3 — aliases shadcn/ui (--background, --primary, --ring…)
        ↓ npm run tokens:build
tokens.css              CSS custom properties générées — NE JAMAIS ÉDITER À LA MAIN
        ↓ bridge @theme
app/globals.css
```

Un Tier 2 ou 3 ne contient **que** des références `{…}`, jamais une valeur littérale.
`tokens.css` est généré : toute modification directe sera écrasée au prochain build
et détectée par `npm run tokens:check`.

Chaque token sémantique déclare son cycle de vie, vérifié par
`npm run tokens:lint-lifecycle` : `$extensions.status` vaut `active` (consommé) ou
`reserved` (décision valide que rien ne consomme encore, intention dans son
`$description`), ou le token porte `$deprecated` (ne plus l'utiliser). Un token
ajouté déclare son statut ; un `reserved` qu'on se met à consommer passe `active`.
Une primitive que plus aucun token ne référence se supprime, sauf à la déclarer
`reserved` en disant pourquoi.

## 3. Commandes de validation

```bash
npm run tokens-validate   # naming DTCG + valeurs brutes + bridge @theme + focus + contrastes + monotonie des palettes + palette de graphiques + cycle de vie + fraîcheur
npm run typecheck:all     # app + scripts + mcp-server
npm run lint              # ESLint
npm run index:validate    # 5 checks : JSON Schema, tailles, data-slot, chaînes UI, types Props
npm run specs:validate    # les 59 specs contre les 13 sections canoniques + Variantes à jour
npm run docs:tokens       # régénère token-reference.md + tokens.manifest.json
npm run registry:check    # fraîcheur de registry.json + dépendances internes
npm run registry:test-install  # installe les 61 items dans une app vierge et la compile
npm run generate-context  # régénère le cache MCP — doit produire zéro diff
npm run mcp:test          # 62 tests du serveur MCP
npm run build             # build de production Next.js
```

Après toute modification de tokens ou de TypeScript :
`npm run tokens-validate && npm run typecheck:all`.

## 4. Workflow git — obligatoire

Trunk-based léger avec PR. `main` est protégée : **aucun push direct**, y compris
pour le propriétaire du dépôt.

1. **Une branche par item de backlog**, préfixée par son type :
   `feat/` `fix/` `chore/` `docs/` `ci/` `refactor/` `test/`
   Exemple : `fix/p0-03-destructive-foreground`
2. **Commits au format [Conventional Commits](https://www.conventionalcommits.org/)**.
   Exemple : `fix(tokens): add destructive-foreground token`
   Le hook `commit-msg` rejette tout message non conforme.
3. **1 PR = 1 item de backlog**, **squash merge**, branche supprimée après merge.
   Le titre de la PR devient le message de commit : il doit lui aussi être conforme.
4. **CI verte obligatoire** avant merge.

Ne jamais contourner un hook avec `--no-verify`. Un hook qui bloque signale un
problème réel : le corriger, pas le désactiver.

## 5. Garde-fous en place

| Garde-fou                         | Ce qu'il bloque                                                                                                                        |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `.husky/pre-commit` → lint-staged | Prettier + ESLint sur les fichiers touchés, `typecheck:all` sur tout                                                                   |
| `.husky/commit-msg` → commitlint  | Message de commit non conforme                                                                                                         |
| `.husky/pre-push`                 | Push direct sur `main`                                                                                                                 |
| `.github/workflows/ci.yml`        | 9 jobs : `tokens-validate`, `typecheck`, `lint`, `build`, `index-schema`, `spec-sections`, `context-freshness`, `mcp-test`, `registry` |
| `.github/workflows/pr-lint.yml`   | Titre de PR non conforme                                                                                                               |

## 6. Identité de publication

Un seul nom par canal, documenté dans une table unique :
[README → _Identité de publication_](./README.md#identité-de-publication).
En résumé : dépôt `Toniio/DSAIReadable`, registre shadcn `dsaireadable`, scope npm
`@dsaireadable`, dépendance interne `Toniio/DSAIReadable/<item>`. **Jamais de
majuscules** hors du nom de dépôt GitHub.

## 7. Style de code

Défini par `.prettierrc`, appliqué automatiquement : **2 espaces, guillemets
doubles, pas de point-virgule, `trailingComma: es5`**. Une configuration unique
couvre tout le dépôt — `.ts`, `.tsx` et `.md`, `mcp-server/` compris — et la CI
la vérifie. Les Markdown générés (`token-reference.md`) sont émis au format par
leur générateur. Les classes Tailwind sont triées par
`prettier-plugin-tailwindcss` — ne jamais les réordonner à la main.

## 8. Périmètres à ne pas toucher sans instruction explicite

- `tokens.css` — généré par `npm run tokens:build`
- `mcp-server/context/*.json` — généré par `npm run generate-context`
- `design-system.index.json` — inventaire, régénéré par l'outillage
- `registry.json` — registre shadcn, généré par `npm run registry:build`
- `specs/tokens/token-reference.md` et `tokens.manifest.json` — générés par `npm run docs:tokens`
  (la prose éditoriale se modifie dans `$extensions.docs` des `tokens/*.json`)
- Les fichiers d'audit et de backlog à la racine : hors dépôt (`.gitignore`)

## 9. En cas de doute

Si une instruction de tâche contredit ce fichier, **s'arrêter et le signaler**
plutôt que de trancher seul. Une règle violée ici se propage à tout le code
généré par les agents en aval.

## 10. Fichiers d'instructions agents

| Fichier                             | Rôle                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `AGENTS.md`                         | Ce fichier : règles de tout le dépôt, référence unique                         |
| `mcp-server/AGENTS.md`              | Règles propres au serveur MCP ; complète celui-ci, ne le contredit jamais      |
| `CLAUDE.md`, `mcp-server/CLAUDE.md` | Symlinks vers le `AGENTS.md` du même dossier, pour Claude Code — ne pas éditer |
| `.github/copilot-instructions.md`   | Rappel court pour Copilot, qui renvoie ici                                     |

Une règle s'écrit **une seule fois**, dans le `AGENTS.md` le plus proche du code
qu'elle gouverne. Ne jamais lister un `CLAUDE.md` dans un item du registre shadcn :
les symlinks ne sont pas distribués.
