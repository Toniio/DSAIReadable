# AGENTS.md — serveur MCP

Complète le [`AGENTS.md` racine](../AGENTS.md), qui reste la référence : ce
fichier n'ajoute que ce qui est propre à `mcp-server/` et ne le contredit
jamais. Une contradiction entre les deux est un bug à signaler.

Le serveur expose le design system aux agents : **16 tools** (`src/tools/`),
**3 resources** (`src/resources/index.ts`) et **5 prompts**
(`src/prompts/index.ts`). Il ne lit jamais les sources à la volée : il sert un
cache JSON pré-compilé, `context/*.json`.

---

## 1. Le cache de contexte est généré

```
specs/components/*.md  specs/foundations/*.md  tokens/*.json
design-system.index.json  components/ui/*.tsx  app/**/page.tsx
        ↓ npm run generate-context   (src/context/generate.ts)
mcp-server/context/*.json            16 fichiers — NE JAMAIS ÉDITER À LA MAIN
        ↓ loadContext()              (src/lib/context.ts)
tools et prompts
```

- Une réponse fausse d'un tool se corrige **à la source** (la spec, le token)
  ou **dans le générateur**, jamais dans le JSON.
- Après toute modification d'une source ci-dessus : `npm run generate-context`
  et commiter le résultat. Le job CI `context-freshness` échoue sur le moindre
  écart.
- `loadContext()` lève une erreur si un fichier manque ou est corrompu. Ne pas
  la remplacer par un repli silencieux (`{}`) : un cache vide ressemble à un
  design system vide, et l'agent répond faux avec assurance.

## 2. Commandes

Depuis la racine du dépôt :

```bash
npm run generate-context   # régénère context/*.json — zéro diff attendu si rien n'a changé
npm run mcp:test           # suite du serveur (src/test.ts)
npm run typecheck:mcp      # tsc sur mcp-server/ (inclus dans typecheck:all)
npm run mcp:start          # serveur stdio
npm run mcp:start:http     # serveur HTTP, 127.0.0.1:3100 par défaut
```

⚠️ `npm ci` à la racine **n'installe pas** `mcp-server/`. Après un clone ou une
copie du dépôt : `npm ci --prefix mcp-server`. Un `node_modules` recopié d'une
autre machine casse `generate-context` (binaire esbuild d'une autre plateforme) :
le supprimer et réinstaller.

## 3. Règles propres au serveur

| Règle                                                                                                                   | Pourquoi                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Tout correctif du générateur ou d'un tool ajoute un test à `src/test.ts`, et ce test doit échouer sans le correctif** | Les bugs du parseur (variantes cva, tableaux de specs) servaient des données fausses sans qu'aucun check ne rougisse |
| **Chaque règle de `validate_screen` a sa fixture négative** (`NEGATIVE_FIXTURES` dans `src/test.ts`)                    | Une règle jamais vue en échec peut ne rien détecter                                                                  |
| **Parser le Markdown par structure, pas par position** : tableaux par en-tête, `\|` échappés respectés                  | Les specs sont formatées par Prettier et contiennent plusieurs tableaux par section                                  |
| **Le champ `version` vient de `ds-metadata.json`**, lui-même issu de `mcp-server/package.json`                          | Une version codée en dur ment dès le premier bump                                                                    |
| **Chaque tool est déclaré avec `registerTool` et `annotations: READ_ONLY`** (`src/lib/annotations.ts`)                  | Sans annotation, la spec MCP présume un tool destructeur et ouvert : le client peut faire confirmer chaque appel     |
| **HTTP lié à `127.0.0.1` par défaut** ; `MCP_HOST` et `MCP_ALLOWED_ORIGINS` ne s'élargissent que délibérément           | Le serveur n'a pas d'authentification                                                                                |
| **Ne pas toucher `railway.json`** sans instruction                                                                      | Le maintien du déploiement HTTP distant reste à trancher par le propriétaire du dépôt                                |

## 4. Style

Même configuration Prettier que la racine (§ 7 du `AGENTS.md` racine) : pas de
`.prettierrc` local, n'en ajouter aucun.
