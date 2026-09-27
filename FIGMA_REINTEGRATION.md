# Ré-intégration de la couche Figma

> **Statut** : couche Figma retirée du repo le **2026-09-17**.
> Ce document est la spécification complète permettant de la reconstruire.
> Objectif du retrait : obtenir un design system source-of-truth **code-first**,
> consommable par un agent IA de design sans dépendance à un outil externe.

---

## 0. Archive de sauvegarde

Le repo **n'est pas versionné en git**. Une archive de tous les fichiers supprimés
ou modifiés a été créée avant l'opération :

```
~/.copilot/session-state/73c95c37-f3bc-49dc-b749-63a3e92eb8fa/files/figma-archive/figma-removed-2026-09-17.tar.gz
```

Elle contient l'état d'origine de :
`components/ui/*.figma.tsx`, `scripts/figma/`, `scripts/figma-push-variables.py`,
`scripts/tokens-diff.ts`, `figma.config.json`, `tsconfig.figma.json`,
`types/figma-code-connect.d.ts`, `design-system.index.json`, `design-system.schema.json`,
`mcp-server/src/**`, `README.md`, `PROJECT_STRUCTURE.md`, `specs/`.

> ⚠️ L'archive contient aussi `packages/make-kit/**`. Ce package a depuis été **supprimé du dépôt** :
> la distribution passe par le registre shadcn. Ne pas le restaurer — voir la section caduque en fin de §7.

**Avant toute ré-intégration, extraire cette archive dans un dossier temporaire pour
récupérer les mappings de props Code Connect** (non reproduits intégralement ci-dessous).

---

## 1. Ce qui existait — vue d'ensemble

La couche Figma couvrait **cinq responsabilités distinctes**. Elles sont indépendantes :
on peut en ré-intégrer une sans les autres.

| #   | Brique                                                           | Direction    | Fichiers                                                                               |
| --- | ---------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------- |
| 1   | **Code Connect** — mapping composant React ↔ composant Figma     | code → Figma | `components/ui/*.figma.tsx` (54), `figma.config.json`, `types/figma-code-connect.d.ts` |
| 2   | **Push de tokens** — tokens DTCG → Figma Variables               | code → Figma | `scripts/figma-push-variables.py`                                                      |
| 3   | **Diff de tokens** — détection de drift code ↔ Figma             | Figma → code | `scripts/tokens-diff.ts`                                                               |
| 4   | **Création de composants Figma** via Plugin API                  | code → Figma | `scripts/figma/*.ts` + `*.cjs` (17)                                                    |
| 5   | **Métadonnées d'inventaire** — `figma_node_id`, `figma_file_key` | descriptif   | `design-system.index.json`, `specs/components/*.md`, MCP context                       |

### Coordonnées du fichier Figma source

Les valeurs réelles ne sont pas publiées : le fichier et son registre appartiennent à un espace
Figma privé. Les relever dans Figma (menu _Share → Copy link_ pour la clé ; réglages de
l'organisation pour le registre) et ne jamais les commiter.

| Clé                | Valeur                                                         |
| ------------------ | -------------------------------------------------------------- |
| `figma_file_key`   | `<FIGMA_FILE_KEY>`                                             |
| `figma_site`       | `https://www.figma.com/design/<FIGMA_FILE_KEY>/DSAIReadable`   |
| `last_publish`     | `2025-07-08T12:00:00Z`                                         |
| Registry npm privé | `https://registry.figma.com/npm/<FIGMA_REGISTRY_ID>/registry/` |

### Variables d'environnement requises

| Variable          | Utilisée par                                | Scopes / rôle                                                                            |
| ----------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `FIGMA_FILE_KEY`  | `tokens-diff.ts`, `figma-push-variables.py` | clé du fichier                                                                           |
| `FIGMA_TOKEN`     | idem                                        | PAT avec `file_content:read`, `library_content:read`, `file_variables:write`             |
| `FIGMA_NPM_TOKEN` | `.npmrc`                                    | ~~auth registry `registry.figma.com`~~ — **caduc** : plus aucun package npm n'est publié |

---

## 2. Mapping `figma_node_id` — à restaurer tel quel

Table de référence complète au moment du retrait. Les lignes `figma_node_id` des specs
ont été **conservées mais vidées** : il suffit de les repeupler avec ces valeurs.

| Composant      | figma_node_id | code_path                         | Avait un Code Connect |
| -------------- | ------------- | --------------------------------- | --------------------- |
| Accordion      | 176:2492      | components/ui/accordion.tsx       | oui                   |
| Alert          | 176:2331      | components/ui/alert.tsx           | oui                   |
| AlertDialog    | 176:2678      | components/ui/alert-dialog.tsx    | oui                   |
| AspectRatio    | —             | components/ui/aspect-ratio.tsx    | —                     |
| Avatar         | 176:2401      | components/ui/avatar.tsx          | oui                   |
| Badge          | 176:2394      | components/ui/badge.tsx           | oui                   |
| Breadcrumb     | 176:2474      | components/ui/breadcrumb.tsx      | oui                   |
| Button         | 176:2322      | components/ui/button.tsx          | oui                   |
| ButtonGroup    | 176:2593      | components/ui/button-group.tsx    | oui                   |
| Calendar       | 176:2812      | components/ui/calendar.tsx        | oui                   |
| Card           | 176:2356      | components/ui/card.tsx            | oui                   |
| Carousel       | 176:2773      | components/ui/carousel.tsx        | oui                   |
| Chart          | 176:2957      | components/ui/chart.tsx           | oui                   |
| Checkbox       | 176:2273      | components/ui/checkbox.tsx        | oui                   |
| Collapsible    | 176:2662      | components/ui/collapsible.tsx     | oui                   |
| Combobox       | 176:2763      | components/ui/combobox.tsx        | oui                   |
| Command        | 176:2719      | components/ui/command.tsx         | oui                   |
| ContextMenu    | 176:2702      | components/ui/context-menu.tsx    | oui                   |
| Dialog         | 176:2510      | components/ui/dialog.tsx          | oui                   |
| Direction      | —             | components/ui/direction.tsx       | —                     |
| Drawer         | 176:2701      | components/ui/drawer.tsx          | oui                   |
| DropdownMenu   | 176:2533      | components/ui/dropdown-menu.tsx   | oui                   |
| Empty          | 176:2571      | components/ui/empty.tsx           | oui                   |
| Field          | 176:2381      | components/ui/field.tsx           | oui                   |
| Heading        | 176:2549      | components/ui/heading.tsx         | oui                   |
| HoverCard      | 176:2689      | components/ui/hover-card.tsx      | oui                   |
| Illustration   | —             | components/ui/illustration.tsx    | —                     |
| Input          | 176:2262      | components/ui/input.tsx           | oui                   |
| InputGroup     | 176:2618      | components/ui/input-group.tsx     | oui                   |
| InputOtp       | 176:2619      | components/ui/input-otp.tsx       | oui                   |
| Item           | 176:2811      | components/ui/item.tsx            | oui                   |
| Kbd            | 176:2554      | components/ui/kbd.tsx             | oui                   |
| Label          | 176:2244      | components/ui/label.tsx           | oui                   |
| Logo           | —             | components/ui/logo.tsx            | —                     |
| Menubar        | 176:2712      | components/ui/menubar.tsx         | oui                   |
| NativeSelect   | 176:2634      | components/ui/native-select.tsx   | oui                   |
| NavigationMenu | 176:2738      | components/ui/navigation-menu.tsx | oui                   |
| Pagination     | 176:2493      | components/ui/pagination.tsx      | oui                   |
| PasswordInput  | —             | components/ui/password-input.tsx  | —                     |
| Popover        | 176:2687      | components/ui/popover.tsx         | oui                   |
| Progress       | 176:2507      | components/ui/progress.tsx        | oui                   |
| RadioGroup     | 176:2430      | components/ui/radio-group.tsx     | oui                   |
| Resizable      | 176:2677      | components/ui/resizable.tsx       | oui                   |
| ScrollArea     | 176:2772      | components/ui/scroll-area.tsx     | oui                   |
| Select         | 176:2456      | components/ui/select.tsx          | oui                   |
| Separator      | 176:2250      | components/ui/separator.tsx       | oui                   |
| Sheet          | 176:2532      | components/ui/sheet.tsx           | oui                   |
| Sidebar        | 176:2935      | components/ui/sidebar.tsx         | oui                   |
| Skeleton       | 176:2553      | components/ui/skeleton.tsx        | oui                   |
| Slider         | 176:2440      | components/ui/slider.tsx          | oui                   |
| Sonner         | 176:2956      | components/ui/sonner.tsx          | oui                   |
| Spinner        | 176:2251      | components/ui/spinner.tsx         | oui                   |
| Switch         | 176:2410      | components/ui/switch.tsx          | oui                   |
| Table          | 176:2570      | components/ui/table.tsx           | oui                   |
| Tabs           | 176:2473      | components/ui/tabs.tsx            | oui                   |
| Textarea       | 176:2439      | components/ui/textarea.tsx        | oui                   |
| Toggle         | 176:2423      | components/ui/toggle.tsx          | oui                   |
| ToggleGroup    | 176:2651      | components/ui/toggle-group.tsx    | oui                   |
| Tooltip        | 176:2520      | components/ui/tooltip.tsx         | oui                   |

> Tous les node-ids appartiennent à la page `176:*` du fichier source. `AspectRatio`,
> `Direction`, `Illustration`, `Logo` et `PasswordInput` n'avaient **jamais** d'équivalent Figma.

---

## 3. Brique 1 — Figma Code Connect

### Dépendances npm retirées

```jsonc
// package.json → devDependencies
"@figma/code-connect": "^1.4.4",
"@figma/plugin-typings": "^1.138.0"
```

### `figma.config.json` (à recréer à la racine)

```json
{
  "codeConnect": {
    "parser": "react",
    "include": ["components/ui/**/*.tsx"],
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### `types/figma-code-connect.d.ts` (à recréer)

Augmentation de type nécessaire car la clé `instructions` — utilisée pour donner du
contexte d'usage aux LLMs via Dev Mode — n'est pas déclarée par le package upstream.

```ts
import "@figma/code-connect"

declare module "@figma/code-connect/dist/connect/api" {
  interface FigmaConnectMeta<
    PropsT = {},
    ResolvedPropsT = {},
    ExampleFnReturnT = unknown,
    ExtraExampleT = never,
  > {
    instructions?: string
  }
}
```

### `tsconfig.json` — mapping de chemin à réajouter

```jsonc
"paths": {
  "@figma/code-connect/dist/connect/api": [
    "./node_modules/@figma/code-connect/dist/connect/api"
  ]
}
```

### `eslint.config.mjs` — override à réajouter

```js
{
  // Declaration merging with @figma/code-connect requires type parameters
  // that are strictly identical to upstream, default values included.
  // Replacing `{}` with `object` breaks the merge, so the rule cannot apply.
  files: ["types/figma-code-connect.d.ts"],
  rules: { "@typescript-eslint/no-empty-object-type": "off" },
}
```

### Anatomie d'un fichier `.figma.tsx` (référence : `button.figma.tsx`)

```tsx
import figma from "@figma/code-connect"
import { Button } from "@/components/ui/button"

figma.connect(
  Button,
  "https://www.figma.com/design/<FILE_KEY>?node-id=176:2322",
  {
    links: [
      {
        name: "Source",
        url: "https://github.com/Toniio/DSAIReadable/blob/main/components/ui/button.tsx",
      },
    ],
    props: {
      variant: figma.enum("Variant", {
        Default: "default",
        Outline: "outline",
        Secondary: "secondary",
        Ghost: "ghost",
        Destructive: "destructive",
        Link: "link",
      }),
      size: figma.enum("Size", {
        Default: "default",
        Sm: "sm",
        Lg: "lg",
        Icon: "icon",
      }),
      label: figma.string("label"),
    },
    example: ({ variant, size, label }) => (
      <Button variant={variant} size={size}>
        {label}
      </Button>
    ),
    instructions: `
    Button is the primary action trigger. Use variant="default" for primary actions,
    "outline" for secondary actions, "destructive" for irreversible actions, and "ghost"
    or "link" for low-emphasis navigation. Always provide an aria-label for icon-only sizes.
  `,
  }
)
```

**Règles invariantes observées dans les 54 fichiers :**

- un `figma.connect()` par composant racine ; les sous-composants (ex. `CardHeader`)
  font l'objet d'appels `figma.connect()` séparés dans le même fichier ;
- `figma.enum()` mappe une propriété de variante Figma (clé = label Figma, **capitalisé**)
  vers la valeur de prop React (**kebab/lowercase**) ;
- `figma.string()` / `figma.boolean()` / `figma.children()` pour le contenu ;
- `links[]` pointe systématiquement vers le fichier source sur GitHub ;
- `instructions` est un texte en anglais décrivant _quand_ utiliser le composant —
  cette information est **déjà présente en français** dans `specs/components/<Nom>.md`
  (sections `## Rôle`, `## Usage`, `## Contraintes`) et peut en être régénérée.

> **Les mappings d'enums exacts ne sont pas reproduits ici** (54 fichiers).
> Les récupérer depuis l'archive §0, ou les régénérer depuis les blocs `cva` des composants.

### Scripts npm à restaurer

```jsonc
"typecheck:figma": "tsc --noEmit -p tsconfig.figma.json",
"typecheck:all": "npm run typecheck && npm run typecheck:scripts && npm run typecheck:figma && npm run typecheck:mcp"
```

Publication : `npx figma connect publish`.

---

## 4. Brique 2 — Push des tokens vers Figma Variables

Fichier : `scripts/figma-push-variables.py` (~19 Ko, Python 3, stdlib uniquement).

### Comportement

1. lit `tokens/primitive.json`, `tokens/semantic.json`, `tokens/component.json` (format DTCG) ;
2. crée / met à jour **3 collections** Figma Variables :
   - `Primitive` — collection **masquée** de la publication (`hiddenFromPublishing: true`),
   - `Semantic` — **2 modes** : `light` + `dark`,
   - `Component` — mode unique ;
3. convertit `oklch(...)` → sRGB `{r,g,b,a}` (l'API Figma n'accepte pas oklch) ;
4. `POST https://api.figma.com/v1/files/{FIGMA_FILE_KEY}/variables` avec
   header `X-Figma-Token: $FIGMA_TOKEN` ;
5. traduit la notation pointée locale (`color.background.default`) en notation
   slash Figma (`color/background/default`).

### Scripts npm à restaurer

```jsonc
"figma:push": "python3 scripts/figma-push-variables.py",
"figma:push:dry": "python3 scripts/figma-push-variables.py --dry-run"
```

---

## 5. Brique 3 — Diff de tokens code ↔ Figma

Fichier : `scripts/tokens-diff.ts` (~14 Ko, tsx). **Était câblé dans `tokens-validate`
et donc dans la CI.**

### Comportement

- `GET https://api.figma.com/v1/files/{FIGMA_FILE_KEY}/variables/local` ;
- si `FIGMA_FILE_KEY` ou `FIGMA_TOKEN` absents → **exit 0 avec warning** (non bloquant en local) ;
- compare trois ensembles et sort en erreur sur `valueMismatch` :
  - `onlyInLocal` (avertissement), `onlyInFigma` (avertissement), `valueMismatch` (**exit 1**).

### Règles de normalisation à reproduire impérativement

| Cas               | Règle                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| Séparateur de nom | Figma `/` ↔ code `.`                                                                                          |
| Couleurs          | Figma renvoie `{r,g,b,a}` floats → convertir en `#hex`, comparaison insensible à la casse                     |
| Alias de variable | `{type: "VARIABLE_ALIAS"}` → **ignorer** (référence vers une autre variable)                                  |
| Nombres           | tolérance absolue de **0.02** (précision flottante Figma)                                                     |
| `letter-spacing`  | Figma ne sait pas représenter les `em` → stocke `0` ; tolérance de **1** sur ces clés                         |
| Ombres / effets   | **exclues** de la comparaison (Figma les stocke en objets d'effet, pas en chaînes CSS)                        |
| Mots composés     | Figma n'utilise pas de tiret → table `FIGMA_NAME_NORMALIZATION`                                               |
| Renommages        | table bidirectionnelle `CODE_TO_FIGMA_ALIASES` / `FIGMA_TO_CODE_ALIASES`, le temps que Figma rattrape le code |

### Scripts npm à restaurer

```jsonc
"tokens:diff": "tsx scripts/tokens-diff.ts",
"tokens-validate": "npm run tokens:check && npm run tokens:lint-naming && npm run tokens:lint-values && npm run tokens:lint-bridge && npm run tokens:diff"
```

---

## 6. Brique 4 — Création programmatique des composants Figma

Dossier : `scripts/figma/` (17 fichiers). Pilotait la **Figma Plugin API** depuis VS Code
via le serveur MCP `figma-console-mcp`.

| Fichier                                           | Rôle                                                                                                 |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `_helpers.ts`                                     | primitives partagées : création de frames, application de variables, auto-layout                     |
| `01-label.ts` → `10-finalize.ts`                  | un composant par script, **dans l'ordre de dépendance** (Label avant Field, Input avant Field, etc.) |
| `run-all.ts`                                      | orchestrateur séquentiel                                                                             |
| `all-components.js` (177 Ko)                      | dump généré de l'intégralité des composants                                                          |
| `get-node-ids.js`                                 | extraction des node-ids après création → alimente `design-system.index.json`                         |
| `mcp-client.cjs`, `run-query.cjs`, `sync-all.cjs` | client MCP bas niveau + synchronisation                                                              |

### `tsconfig.figma.json` (à recréer)

Projet TS séparé : le sandbox du Plugin Figma n'a **pas** les types Node.js,
d'où `types: ["@figma/plugin-typings"]` et `lib: ["ES2020"]` isolés.

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "types": ["@figma/plugin-typings"],
    "lib": ["ES2020"]
  },
  "include": ["scripts/figma/**/*.ts"],
  "exclude": []
}
```

Le `tsconfig.json` racine doit alors **exclure** `scripts/figma/**`.

### Configuration MCP (`.vscode/mcp.json`, absent du repo actuel)

Serveur `figma-console-mcp` à réenregistrer. Règle d'or historique :
**ne jamais modifier le kit Figma source à la main** — tout passe par ces scripts.

---

## 7. Brique 5 — Métadonnées d'inventaire

### `design-system.index.json`

```jsonc
{
  "library": {
    "figma_file_key": "<FIGMA_FILE_KEY>",
    "figma_site": "https://www.figma.com/design/<FIGMA_FILE_KEY>/DSAIReadable",
    "last_publish": "2025-07-08T12:00:00Z",
  },
  "inventory": [
    {
      "name": "Button",
      "figma_node_id": "176:2322",
      "code_path": "components/ui/button.tsx",
      "status": "stable",
    },
  ],
  "glossary": {
    "figma_node_id": "The Figma node identifier for a component instance. Used by Code Connect to map Figma instances to code. Null until Figma components are published in the library.",
  },
}
```

### `design-system.schema.json`

- `library.required` : réajouter `"figma_file_key"` ;
- `library.properties` : `figma_file_key`, `figma_site` ;
- `inventory.items.required` : réajouter `"figma_node_id"` ;
- `inventory.items.properties.figma_node_id` : `{ "type": ["string","null"] }`.

### `specs/components/*.md` — **conservé, vidé**

La ligne `| figma_node_id | |` est **toujours présente dans les 59 specs**, avec une
valeur vide. C'est le point d'ancrage voulu : repeupler depuis la table §2.
`mcp-server/src/context/generate.ts` lit ce champ via `get("figma_node_id") || null`.

Deux sections ont par ailleurs été renommées et une supprimée :

| Fichier                             | Avant                       | Après          |
| ----------------------------------- | --------------------------- | -------------- |
| `specs/components/Heading.md`       | `## Variantes Figma`        | `## Variantes` |
| `specs/components/PasswordInput.md` | `## Variantes Figma`        | `## Variantes` |
| `specs/components/Illustration.md`  | `## Notes Figma` (2 lignes) | supprimée      |

### `mcp-server/src/context/generate.ts`

À restaurer :

- type `inventory[].figma_node_id: string | null` ;
- `components.json` : champs `figma_node_id` et
  `has_code_connect: existsSync(code_path.replace(/\.tsx$/, ".figma.tsx"))` ;
- filtre du scan `components/ui/` : `!f.endsWith(".figma.tsx")` ;
- `component-specs.json` : `figma_node_id: get("figma_node_id") || null` ;
- `ds-metadata.json` : bloc `figma: { file_key, site, last_publish }`.

### `mcp-server/src/tools/ds-core.ts` et `admin.ts`

À restaurer : `figma_coverage` et `code_connect_coverage` dans les stats,
et le bloc `figma: { file_key, site }` dans `ds_overview`.

### `mcp-server/src/index.ts`

```ts
const DEFAULT_ALLOWED_ORIGINS = [
  "https://www.figma.com", // requis pour Figma Make en mode HTTP
  "https://figma.com",
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
]
```

Et la description du serveur se terminait par `… tokens, Figma-synced`.

### ~~`packages/make-kit`~~ — section caduque

Le package `make-kit` a été **supprimé du dépôt** (décision du 2026-09-17) : il était le véhicule
de consommation pour Figma Make, et son scope npm `@DSAIReadable` — majuscules interdites par npm —
n'était de toute façon pas publiable. Le canal de distribution unique est désormais le
**registre shadcn** porté par ce dépôt.

Rien n'est à restaurer ici. Pour mémoire, les éléments Figma qu'il portait étaient :
`publishConfig.registry` vers `registry.figma.com`, une section `## Figma library` dans son
README, un en-tête `> Figma library: …` dans `guidelines.md`, une copie de
`design-system.index.json` et un `.npmrc` redirigeant le scope vers le registre Figma.

---

## 8. Procédure de ré-intégration recommandée

Les briques sont indépendantes ; les faire dans cet ordre minimise le risque.

1. **Métadonnées d'abord** (brique 5) — repeupler `figma_node_id` dans les specs depuis §2,
   puis `design-system.index.json` + `design-system.schema.json`, puis restaurer les
   champs dans `generate.ts` / `ds-core.ts` / `admin.ts`.
   → `npm run generate-context && npm run typecheck:mcp`
2. **Tokens montants** (brique 2) — `figma-push-variables.py` : c'est la source de vérité
   qui part du code, donc sans risque pour le DS.
   → `npm run figma:push:dry`
3. **Tokens descendants** (brique 3) — `tokens-diff.ts`, puis le rebrancher dans
   `tokens-validate` **seulement une fois qu'il passe au vert**, sinon la CI casse.
4. **Code Connect** (brique 1) — réinstaller `@figma/code-connect`, recréer
   `figma.config.json` + `types/figma-code-connect.d.ts` + overrides tsconfig/eslint,
   puis restaurer les `.figma.tsx` depuis l'archive §0.
   → `npm run typecheck:figma && npx figma connect publish`
5. **Génération de composants Figma** (brique 4) — la plus lourde, à ne refaire que si
   le kit Figma doit être régénéré depuis zéro.

### Checklist de vérification

```bash
npm run typecheck:all
npm run tokens-validate
npm run generate-context
npm run test
```

---

## 9. Point de vigilance pour l'objectif « DS piloté par un agent IA »

La couche Figma portait deux choses de nature différente :

- **de la plomberie de synchronisation** (briques 1-4) — inutile à un agent IA qui
  génère du code, puisqu'il lit directement les specs et les tokens ;
- **de la sémantique de design** (le champ `instructions` des Code Connect,
  les tables `## Variantes Figma`) — **précieuse** pour un agent.

Cette sémantique n'a pas été perdue : elle est redondante avec
`specs/components/*.md` (`## Rôle`, `## Usage`, `## Contraintes`, `## Props / API`)
et avec `mcp-server/context/component-specs.json`. **Si la brique 1 est ré-intégrée,
générer les `instructions` depuis les specs plutôt que de les maintenir en double.**
