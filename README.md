# DSAIReadable — Design System AI-Readable

> **React 19 · Next.js 16 · Tailwind CSS v4 · shadcn/ui (radix-lyra) · TypeScript 5**

Un design system construit pour être **lu et utilisé par les LLMs aussi bien que par les humains**. Chaque composant, chaque token, chaque règle de composition est documenté dans un format structuré et machine-readable, consommable par les agents MCP et tout générateur de code IA.

---

## Pourquoi ce projet existe

Les design systems traditionnels s'adressent aux humains : documentation dans un outil de maquettage, Storybook, Confluence. Dès qu'un LLM génère du code UI, il produit des valeurs brutes (`#432dd7`, `16px`), des icônes aléatoires (Lucide, Heroicons), et des composants HTML natifs (`<button>`, `<div>`) plutôt que les composants du DS.

L'objectif de **DSAIReadable** est de rendre le design system **première classe pour l'IA** :

- **Un MCP Server** expose l'intégralité du DS comme outils interrogeables par n'importe quel agent (Copilot, Cursor, Claude).
- **Un registre shadcn** distribue les composants, les tokens et les guidelines : le code source est copié dans le projet consommateur, pas installé comme dépendance opaque.
- **Des specs markdown à 13 sections** par composant, lisibles par les humains _et_ ingérables par les LLMs.
- **Un inventaire JSON (`design-system.index.json`)** — source de vérité machine-readable de l'état du DS.
- **Des linters de tokens** intégrés en CI pour garantir qu'aucune valeur brute ne s'infiltre dans le code généré.

---

## Comment c'est construit

Le projet est né d'un constat : pour qu'un LLM génère du code conforme à un DS, il faut lui donner le DS sous une forme qu'il peut _consommer_, pas seulement _lire_.

### Approche

1. **Tokens 3 tiers (DTCG W3C)** — Primitive → Semantic → Component. Chaque valeur visuelle a une source unique dans `tokens/*.json`, exportée en CSS custom properties.

2. **Specs composants structurées** — Chaque composant a une spec markdown en 13 sections standardisées (`specs/components/`). Ces specs sont à la fois lisibles en revue de design et ingérables par le MCP Server comme contexte.

3. **MCP Server maison** (`mcp-server/`) — Un serveur [Model Context Protocol](https://modelcontextprotocol.io/) développé avec le SDK officiel. Il expose le DS complet comme outils appelables par les agents IA : composants, tokens, variantes, règles de design, patterns de pages, UX writing, dataviz.

4. **Distribution par registre shadcn** — Le dépôt lui-même est le canal de distribution : la CLI shadcn copie le source des composants, les tokens CSS et les guidelines dans le projet consommateur. L'agent génère donc contre du code qu'il peut lire et modifier.

5. **CI de validation** — GitHub Actions valide la nomenclature DTCG des tokens et l'absence de valeurs brutes dans les composants à chaque push/PR.

> La couche d'intégration Figma (Code Connect, sync de variables, génération de composants) a été retirée du repo. Voir [`FIGMA_REINTEGRATION.md`](./FIGMA_REINTEGRATION.md) pour la spécification de ré-intégration.

---

## Structure du projet

```
dsaireadable/
├── app/                        # App Next.js (démo des composants)
├── components/ui/              # 59 composants React du DS (shadcn/ui customisés)
├── lib/                        # Modules partagés : utils, focus, ui-strings, overlay
├── tokens/                     # Source de vérité des tokens (DTCG JSON 3 tiers)
│   ├── primitive.json          # Tier 1 — valeurs brutes (privé)
│   ├── semantic.json           # Tier 2 — tokens sémantiques (public)
│   └── component.json          # Tier 3 — aliases shadcn/ui (public)
├── tokens.css                  # CSS custom properties générées — ne pas éditer
├── specs/                      # Documentation markdown du DS
│   ├── components/             # 59 specs composants (13 sections chacune)
│   ├── foundations/            # Specs couleur, typo, spacing, motion, radius…
│   └── tokens/token-reference.md  # Référence des 301 tokens (généré)
├── mcp-server/                 # MCP Server @dsaireadable/mcp-server
│   ├── src/
│   │   ├── tools/              # Outils MCP (ds-core, dataviz, ux-writing, admin)
│   │   ├── prompts/            # Prompts MCP
│   │   ├── lib/                # Chargement du cache, validate_screen, règles de composition
│   │   └── context/            # generate.ts : produit le cache
│   └── context/                # Fichiers JSON pré-compilés (cache du DS) — générés
├── scripts/                    # Outillage : génération et lint des tokens, specs, index, registre
├── registry/                   # Sources des items de registre hors composants
├── registry.json               # Registre shadcn — généré
├── design-system.index.json    # Inventaire machine-readable du DS
└── design-system.schema.json   # JSON Schema validant l'index
```

---

## MCP Server

Le MCP Server (`mcp-server/`) expose le design system comme outils interrogeables par les agents IA.

### Démarrage

```bash
cd mcp-server
npm run start          # mode stdio (Copilot CLI, Claude Desktop)
npm run start:http     # mode HTTP sur :3100 (VS Code)
npm run generate-context  # régénère les fichiers JSON du cache context/
```

`generate-context` sort en **code 1** si un générateur échoue ou si l'inventaire
(`design-system.index.json`) dérive des fichiers présents dans `components/ui/`.
Sa sortie est déterministe : deux exécutions consécutives ne produisent aucun diff.

### Configuration du mode HTTP

Le serveur n'écoute que sur la boucle locale et **valide l'en-tête `Origin`**
(exigence de la spec MCP, contre les attaques par DNS rebinding). Une requête
portant une origine non autorisée reçoit un `403`.

| Variable              | Défaut                                         | Rôle                                             |
| --------------------- | ---------------------------------------------- | ------------------------------------------------ |
| `MCP_HOST`            | `127.0.0.1`                                    | Interface d'écoute. Ne l'ouvrir que délibérément |
| `PORT` / `MCP_PORT`   | `3100`                                         | Port d'écoute                                    |
| `MCP_ALLOWED_ORIGINS` | `localhost` + `127.0.0.1` sur le port d'écoute | Liste d'origines séparées par des virgules       |
| `MCP_SESSION_TTL_MS`  | `1800000` (30 min)                             | Expiration des sessions inactives                |
| `MCP_MAX_SESSIONS`    | `100`                                          | Plafond de sessions simultanées                  |

### Outils disponibles

| Catégorie      | Outils                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DS Core**    | `get_design_system_overview`, `get_components`, `get_component_specs`, `get_component_variants`, `get_tokens`, `get_typography`, `get_icons`, `get_design_rules`, `get_page_patterns` |
| **Dataviz**    | Outils spécifiques aux graphiques (Recharts + tokens DS)                                                                                                                              |
| **UX Writing** | `get_ux_writing_rules` (chaînes par défaut, surcharge, langue), `get_glossary`, `get_content_library`                                                                                 |
| **Admin**      | Outils de gestion et d'inspection du DS                                                                                                                                               |

Tous les outils sont annotés en lecture seule (`readOnlyHint`, `openWorldHint: false`) : un client n'a pas
à faire confirmer leurs appels. `get_component_specs`, `get_design_rules` et `get_ux_writing_rules`
prennent `response_format` : `concise` par défaut (moins de 20 % du volume), `detailed` pour tout.
`get_components` et `get_tokens` paginent : `limit` (100 par défaut) et `cursor`, réponse
`{ total, items, next_cursor }`.

### Ressources

| URI                          | Contenu                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `ds://component/{name}/spec` | Spec complète d'un composant ; les 59 sont listées, `{name}` se complète           |
| `ds://token/{path}`          | Un token sémantique (`ds://token/color.background.default`) ; `{path}` se complète |
| `ds://guidelines`            | Règles critiques, règles des fondations, règles de composition                     |

### Connexion dans VS Code / Copilot

Ajout dans `.vscode/mcp.json` ou `~/.copilot/mcp-config.json` :

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

## Identité de publication

Un seul nom, décliné selon la contrainte de chaque canal. Toute publication future
s'y conforme — ne pas réintroduire de variante en majuscules.

| Canal               | Identifiant                  | Pourquoi cette forme                                                        |
| ------------------- | ---------------------------- | --------------------------------------------------------------------------- |
| Dépôt GitHub        | `Toniio/DSAIReadable`        | Nom historique du projet, seul endroit où la casse est libre                |
| Registre shadcn     | `dsaireadable`               | Le nom de registre n'admet qu'alphanumériques, tirets et underscores        |
| Item d'un composant | `Toniio/DSAIReadable/<item>` | Adresse GitHub complète : un nom nu désignerait le registre shadcn officiel |
| Scope npm           | `@dsaireadable`              | npm interdit les majuscules dans un scope                                   |
| Package npm publié  | `@dsaireadable/mcp-server`   | Seul package publié à ce jour                                               |

Le scope `@dsaireadable` n'est **pas réservé** sur npm : il ne le sera que si un second
package est réellement publié. L'ancien scope `@DSAIReadable` était impubliable — il ne
subsiste que dans les documents d'archive, signalé comme caduc.

---

## Consommer le design system

Le canal de distribution est le **registre shadcn** porté par ce dépôt public : il n'y a pas de package npm à installer. Le `registry.json` à la racine suffit — la CLI lit le dépôt directement, sans serveur ni JSON par composant à héberger.

Prérequis côté consommateur : un projet React + Tailwind CSS v4 avec un `components.json` (`npx shadcn@latest init`). Les alias du projet sont respectés : la CLI réécrit les imports `@/…` vers les siens.

### Installer

```bash
# Un composant — l'item de base (tokens, dark mode, cn(), focus, libellés, surfaces modales) suit automatiquement
npx shadcn@latest add Toniio/DSAIReadable/button

# Les règles du design system pour les agents du projet
npx shadcn@latest add Toniio/DSAIReadable/conventions
```

**Toujours l'adresse complète** `Toniio/DSAIReadable/<item>` : un nom nu (`npx shadcn add button`) désigne le registre shadcn officiel, et remplacerait le composant du design system par le sien.

Chaque dépendance npm arrive avec la plage de version contre laquelle le composant est écrit (`react-day-picker@^9.14.0`), jamais « la dernière ».

La CLI copie le source dans le projet, qui l'importe ensuite localement :

```tsx
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { cn } from "@/lib/utils"
```

Les tokens ne s'importent pas dans le TSX : l'item de base fusionne leurs variables CSS dans la feuille de style du projet, pont `@theme inline` compris. Les classes s'écrivent donc avec les noms sémantiques (`bg-primary`, `text-muted-foreground`, `rounded-lg`).

### Explorer

```bash
npx shadcn@latest search Toniio/DSAIReadable -q card   # chercher
npx shadcn@latest view Toniio/DSAIReadable/card        # voir un item et son source
npx shadcn@latest add Toniio/DSAIReadable/card --dry-run
```

Chaque composant a sa spec — props, variantes, états, accessibilité — dans [`specs/components/`](./specs/components/).

### Avec un agent

1. **Les règles** : l'item `conventions` dépose un même fichier là où chaque outil charge ses règles seul — `.cursor/rules/dsaireadable.mdc`, `.claude/rules/dsaireadable.md`, `.github/instructions/dsaireadable.instructions.md`. Il n'écrase aucun `AGENTS.md`. Un outil qui ne lit que `AGENTS.md` (Codex…) : y ajouter une ligne qui renvoie à `.claude/rules/dsaireadable.md`.
2. **Le catalogue** : `npx shadcn@latest mcp init --client claude` (ou `cursor`, `vscode`, `codex`, `opencode`) branche le serveur MCP de shadcn. Il accepte le registre `Toniio/DSAIReadable` pour chercher, consulter et obtenir la commande d'installation d'un item ; les règles ci-dessus donnent l'adresse à l'agent.
3. **Le détail du design system** (specs, tokens, validation d'écran) : le [serveur MCP du dépôt](#mcp-server), à lancer en local.

### Versions

Sans suffixe, un item s'installe depuis `main`. `#<tag|SHA complet>` épingle **l'item demandé seulement** : ses dépendances internes (`design-system`, un autre composant) restent résolues sur `main` — vérifié avec la CLI 4.21. Un épinglage complet attendra des versions publiées.

### Garanties

`registry.json` est **généré** — `npm run registry:build` le dérive de l'inventaire, des specs et des imports réels. La CI refuse un registre désynchronisé, une dépendance interne écrite en nom nu, et surtout un registre **inutilisable** : `npm run registry:test-install` installe les 61 items dans une app vierge aux alias non standard, puis la compile. Sur une PR, il teste le registre construit par la branche ; après chaque merge, les adresses publiées.

---

## Tokens

Architecture 3 tiers format [DTCG W3C](https://design-tokens.github.io/community-group/format/) :

```
tokens/primitive.json   → valeurs brutes (hex, rem, ms) — jamais référencé directement
tokens/semantic.json    → décisions de design avec modes light/dark
tokens/component.json   → aliases shadcn/ui (--background, --primary, --ring…)
```

Les tokens sont exportés en CSS custom properties dans `tokens.css`.

---

## Specs composants

Chaque composant dispose d'une spec dans `specs/components/<component>.md`, structurée en 13 sections :

> **Metadata** · **Rôle** · **Usage** · **Contraintes** · **Dépendances** · **Anatomie** · **Tokens utilisés** · **Props / API** · **Variantes** · **États** · **Accessibilité** · **Exemple de code** · **Références croisées**

**Variantes** est générée depuis les `cva()` du code (`npm run specs:variants`) **Tokens utilisés** depuis ses classes, résolues par Tailwind jusqu'au token sémantique (`npm run specs:tokens`), et **Props / API** depuis ses exports TypeScript, dont seules les descriptions s'éditent à la main (`npm run specs:api`) ; `specs:validate` vérifie les trois. Les règles de choix entre composants voisins (sélection, surfaces, collections) vivent une fois dans `composition_rules` et sont recopiées dans le **Usage** des specs concernées (`npm run specs:choices`). Les règles (**Contraintes**, **Accessibilité**…) s'écrivent **MUST** / **MUST NOT** avec un seuil ou un critère observable, ou **SHOULD** avec son exception (**sauf**) ; chaque ligne de **Contraintes** ouvre sur l'un de ces mots-clés, ou sur **Note** pour un fait qui n'impose rien ; `specs:validate` refuse les formulations qui laissent la décision au lecteur (« éviter », « préférer », « limiter »…). **Accessibilité** donne, dans une structure fixe, le pattern ARIA, le rôle, les touches, l'exigence de nom accessible et les points de vigilance — défauts connus compris.

Ces specs sont ingérées par le MCP Server via `get_component_specs` et constituent la source de vérité comportementale des composants.

---

## Scripts et outillage

### Validation des tokens

```bash
npm run tokens:lint-naming   # Valide les clés des 3 tiers contre la grammaire déclarative
npm run docs:tokens          # Régénère token-reference.md + tokens.manifest.json
npm run tokens:lint-values   # Détecte les valeurs brutes dans les composants
npm run tokens:lint-bridge   # Vérifie le bridge @theme de Tailwind
npm run tokens:lint-monotonic # Chaque palette s'assombrit strictement quand le numéro de palier monte
npm run tokens:lint-chart     # Séries de graphique : 3:1 sur les fonds, distinctes deux à deux, daltonisme compris
npm run tokens:lint-lifecycle # Statut active / reserved / deprecated de chaque token, conforme au code
npm run tokens-validate      # Toutes les validations en séquence (requis avant tout commit)
```

- **`lint-token-naming.ts`** — Valide les **3 tiers** contre une grammaire déclarative : chaque fondation déclare ses formes autorisées, et chaque segment variable est résolu contre une **enum fermée** (états : `hover|active|focus|disabled|selected`) ou un motif numérique explicite. Ajouter un rôle ou un état est donc une modification volontaire de la table de grammaire, en tête de `scripts/lint-token-naming.ts`.
- **`lint-raw-values.ts`** — Interdit tout hex, rgb, px, ms dans les composants. Exception : `// allow-raw: <raison>`.
- **`lint-theme-bridge.ts`** — Vérifie que le bridge `@theme` de `app/globals.css` reste aligné sur les tokens.

### Développement

```bash
npm run dev          # Next.js avec Turbopack
npm run build        # Build de production
npm run lint         # ESLint
npm run format       # Prettier (trie les classes Tailwind automatiquement)
npm run typecheck    # tsc --noEmit
```

---

## Conventions non-négociables

- **Jamais de valeur brute** dans un composant — tout passe par un token CSS (`var(--color-*)`) ou une classe Tailwind mappée sur un token.
- **Jamais de token Primitive directement** — seuls les tiers Semantic (`tokens/semantic.json`) et Component (`tokens/component.json`) sont publics.
- **`npm run tokens-validate` avant tout commit** — zéro erreur requis pour merger.
- **Icônes Phosphor uniquement** — `@phosphor-icons/react`. Pas de Lucide, pas de Heroicons.
- **Dark mode class-based** — classe `.dark` sur `<html>`. Pas de `prefers-color-scheme`.
- **Lire la spec** avant d'écrire ou modifier un composant (`specs/components/<component>.md`).

---

## Outil de design

La couche d'intégration avec un outil de maquettage (Code Connect, synchronisation de
variables, génération programmatique de composants) a été retirée du repo pour garder
le design system **code-first** et exclusivement pilotable par un agent IA.

La spécification complète de ré-intégration — mapping des node-ids, comportement des
scripts, dépendances et configuration — est conservée dans
[`FIGMA_REINTEGRATION.md`](./FIGMA_REINTEGRATION.md).
