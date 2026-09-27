# Structure du projet — Design System

> Next.js 16 · React 19 · Tailwind CSS v4 · shadcn/ui (style `radix-lyra`) · TypeScript 5

Ce repo est un **design system code-first** : les composants React, les tokens et la documentation machine-readable ont une source unique dans le code. Chaque valeur visuelle a une source unique.

> La couche d'intégration Figma a été retirée. Spécification de ré-intégration : [`FIGMA_REINTEGRATION.md`](./FIGMA_REINTEGRATION.md).

---

## Vue d'ensemble

```
dsaireadable/
├── app/                        # App Next.js (démo)
│   └── login/                  # Pages de démo login (3 déclinaisons)
├── components/ui/              # Composants React du DS
├── tokens/                     # Source de vérité des tokens (DTCG JSON)
├── tokens.css                  # CSS custom properties générées
├── specs/                      # Documentation markdown du DS
├── scripts/                    # Outillage : build et lint des tokens
├── registry/                   # Sources des items de registre hors composants (conventions)
├── design-system.index.json    # Inventaire machine-readable du DS
└── design-system.schema.json   # JSON Schema validant l'index
```

---

## `app/` — Application Next.js

Point d'entrée de la démo. Pas d'écrans métier — sert uniquement à valider que les composants s'assemblent correctement.

| Fichier                           | Rôle                                                                                                                 |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `app/layout.tsx`                  | Layout racine : charge les fonts (Geist, JetBrains Mono), wrap avec `ThemeProvider` (dark mode) et `TooltipProvider` |
| `app/page.tsx`                    | Page de démo minimale — affiche un `<Button>` pour vérifier que le setup fonctionne                                  |
| `app/globals.css`                 | CSS global : import Tailwind, reset, variables font                                                                  |
| `app/login/page.tsx`              | Index des 3 déclinaisons de login (liens vers les sous-routes)                                                       |
| `app/login/split-screen/page.tsx` | Login split-screen : illustration à gauche, formulaire à droite                                                      |
| `app/login/centered/page.tsx`     | Login centré : formulaire dans une `<Card>` centrée sur la page                                                      |
| `app/login/fullscreen/page.tsx`   | Login plein écran : formulaire occupe toute la hauteur de la fenêtre                                                 |

---

## `components/` — Composants React

### `components/theme-provider.tsx`

Wrapper `next-themes` qui injecte la classe `dark` sur `<html>` et permet le toggle light/dark.

### `components/ui/` — Bibliothèque de composants

60 composants shadcn/ui customisés. Chaque fichier exporte un ou plusieurs composants React avec :

- variantes gérées par `class-variance-authority` (cva)
- tokens de design via CSS custom properties (`var(--color-*)`, `var(--space-*)`, etc.)
- accessibilité Radix UI / Base UI sous-jacente

**Composants notables :**

| Fichier              | Ce qu'il apporte                                                                  |
| -------------------- | --------------------------------------------------------------------------------- |
| `button.tsx`         | Variantes primary, secondary, outline, ghost, destructive + tailles sm/md/lg/icon |
| `field.tsx`          | Composition Label + Input + message d'erreur/helper — bloc formulaire complet     |
| `input-group.tsx`    | Input avec addons gauche/droite (icônes, préfixes texte)                          |
| `password-input.tsx` | Input mot de passe avec toggle visibilité                                         |
| `combobox.tsx`       | Sélecteur avec recherche (Command + Popover)                                      |
| `empty.tsx`          | État vide standardisé avec illustration + message                                 |
| `item.tsx`           | Ligne générique réutilisable (liste, menu, option)                                |
| `native-select.tsx`  | `<select>` natif stylisé — fallback accessible au `<Select>` Radix                |
| `spinner.tsx`        | Indicateur de chargement accessible                                               |
| `sidebar.tsx`        | Sidebar responsive complète avec collapse, navigation, raccourcis clavier         |
| `chart.tsx`          | Wrapper Recharts avec tokens DS + config légende/tooltip                          |
| `heading.tsx`        | Composant titre typographique (h1–h6) avec variantes de style                     |
| `logo.tsx`           | Logo SVG composant                                                                |
| `illustration.tsx`   | Illustrations SVG du DS                                                           |

---

## `tokens/` — Source de vérité des design tokens

Architecture **3 tiers** (format [DTCG W3C](https://design-tokens.github.io/community-group/format/)) :

```
tokens/
├── primitive.json    # Tier 1 : valeurs brutes (privé)
├── semantic.json     # Tier 2 : tokens sémantiques (public)
└── component.json    # Tier 3 : aliases shadcn/ui (public)
```

### `tokens/primitive.json` — Tier 1 Primitif

Palette de valeurs brutes : couleurs hex, espacements rem, rayons, typographie, etc.  
Marqués `"$private": true` — **jamais référencés directement dans les composants**.  
Exemples : `color.mist.100`, `space.4`, `radius.md`.

### `tokens/semantic.json` — Tier 2 Sémantique

Tokens avec sens métier — référencent les primitives via `{color.mist.100}`.  
Contient les **modes** light/dark dans `$extensions.modes`.  
Exemples : `color.background.default`, `color.text.subtle`, `space.component.md`.

C'est la couche que les composants React et les développeurs utilisent directement via CSS (`var(--color-background-default)`).

### `tokens/component.json` — Tier 3 Composant

**Aliases de compatibilité shadcn/ui** : mappe les tokens sémantiques vers les noms attendus par shadcn (`--background`, `--primary`, `--ring`, etc.).  
Permet d'utiliser les composants shadcn sans modifier leur code source.

---

## `tokens.css` — CSS Custom Properties

Fichier généré (ou maintenu manuellement) qui expose tous les tokens sémantiques et composants comme variables CSS :

```css
:root {
  --color-background-default: #ffffff;
}
.dark {
  --color-background-default: #090b0c;
}
```

Importé dans `app/globals.css`. C'est ce fichier qui fait le pont entre les tokens JSON et Tailwind/CSS.

---

## `scripts/` — Outillage

### Scripts de validation des tokens

| Script                      | Commande npm                    | Rôle                                                                                                                                                     |
| --------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lint-raw-values.ts`        | `tokens:lint-values`            | Détecte les valeurs brutes (hex, px, rem…) dans les composants. Toute valeur doit passer par un token. Exception : `// allow-raw: <raison>`              |
| `lint-token-naming.ts`      | `tokens:lint-naming`            | Valide que toutes les clés de `semantic.json` et `component.json` respectent la grammaire DTCG (`foundation.property[.role][.emphasis][.state]`)         |
| `lint-theme-bridge.ts`      | `tokens:lint-bridge`            | Vérifie que le bridge `@theme` de `app/globals.css` reste aligné sur les tokens                                                                          |
| `lint-token-lifecycle.ts`   | `tokens:lint-lifecycle`         | Chaque token sémantique déclare `active`, `reserved` ou `$deprecated`, et le statut correspond au code ; aucune primitive non référencée sans `reserved` |
| `lint-palette-monotonic.ts` | `tokens:lint-monotonic`         | Dans chaque palette de couleurs, la luminance décroît strictement quand le numéro de palier monte                                                        |
| `lint-chart-palette.ts`     | `tokens:lint-chart`             | Chaque série `color.chart.*` à 3:1 sur les fonds de son mode ; toutes les paires distinctes en OKLab, en vision normale, protanopie et deutéranopie      |
| `build-tokens.ts`           | `tokens:build` / `tokens:check` | Génère `tokens.css` depuis les sources DTCG ; `--check` échoue en cas de dérive                                                                          |

Lancer toutes les validations en séquence : `npm run tokens-validate`

---

## `specs/` — Documentation du design system

Documentation markdown structurée, consommable par les humains **et les LLMs** (via MCP).

### `specs/components/` — Specs composants (59 fichiers)

Une spec par composant. Structure en 13 sections :
`Metadata` · `Rôle` · `Usage` · `Contraintes` · `Dépendances` · `Anatomie` · `Tokens utilisés` · `Props / API` · `Variantes` · `États` · `Accessibilité` · `Exemple de code` · `Références croisées`

`Variantes` est générée depuis les `cva()` du code (`npm run specs:variants`) ;
`Tokens utilisés` est générée depuis les classes du code, résolues par Tailwind jusqu'au token sémantique (`npm run specs:tokens`) ;
`Accessibilité` suit une structure fixe — Pattern, Rôle, Clavier, Nom accessible, Vigilance.

### `specs/foundations/` — Specs des fondations

| Fichier           | Contient                                                                 |
| ----------------- | ------------------------------------------------------------------------ |
| `border-width.md` | Les deux largeurs de bordure et leur branchement Tailwind                |
| `breakpoints.md`  | Les préfixes responsive comme contrat, valeurs des tokens `breakpoint.*` |
| `color.md`        | Tableau complet tokens couleur light/dark + Do/Don't                     |
| `elevation.md`    | Shadows et niveaux de profondeur                                         |
| `motion.md`       | Durées et easings d'animation                                            |
| `opacity.md`      | Niveaux d'opacité standardisés                                           |
| `radius.md`       | Valeurs de border-radius                                                 |
| `spacing.md`      | Grille d'espacement (space.1 = 4px → space.32 = 128px)                   |
| `typography.md`   | Échelle typographique, familles, poids                                   |

### `specs/tokens/token-reference.md` · `tokens.manifest.json` — générés

Référence exhaustive des **276** tokens des trois tiers : variable CSS, type, valeurs
light/dark résolues, utilitaire Tailwind, Do/Don't. Le markdown est destiné aux
humains, `tokens.manifest.json` à l'outillage.

Les deux sont produits par `npm run docs:tokens` depuis `tokens/*.json` — la prose
vit dans `$extensions.docs`. **Ne jamais les éditer à la main** : `npm run tokens-validate`
échoue en cas de dérive.

---

## Distribution — registre shadcn

Il n'existe pas de package npm : le dépôt **est** le canal de distribution. Le
`registry.json` à la racine suffit — pas de serveur, pas de JSON par item à héberger.
Mode d'emploi consommateur complet : [README → _Consommer le design system_](./README.md#consommer-le-design-system).

| Item                                | Contenu                                                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `Toniio/DSAIReadable/design-system` | Item de base : variables CSS des tokens, `lib/utils`, `lib/focus`, `lib/ui-strings`, `lib/overlay` — suit chaque composant |
| `Toniio/DSAIReadable/<composant>`   | Un item par composant de `components/ui/`                                                                                  |
| `Toniio/DSAIReadable/conventions`   | `registry/conventions/dsaireadable.md`, déposé en règles Cursor, Claude Code et Copilot                                    |

`registry.json` est **généré** par `npm run registry:build` depuis
`design-system.index.json`, les specs et les imports réels des composants —
ne pas l'éditer à la main. Chaque dépendance npm y porte sa plage de version,
prise dans `package.json`.

> Une dépendance interne s'écrit en adresse complète `Toniio/DSAIReadable/<item>`.
> Un nom nu comme `button` désigne le registre shadcn officiel, pas ce dépôt :
> `registry:check` le refuse, car `shadcn registry validate` ne le voit pas.

`npm run registry:test-install` installe tous les items dans une app vierge aux
alias non standard et la compile : c'est le seul check qui prouve que le registre
est **consommable**, pas seulement cohérent.

---

## Fichiers de configuration racine

| Fichier                     | Rôle                                                                                                                                                                                    |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `design-system.index.json`  | Inventaire machine-readable : liste tous les composants (`code_path`, statut), les règles de composition, le glossaire. Référencé par les scripts MCP et par la génération du registre. |
| `design-system.schema.json` | JSON Schema qui valide la structure de `design-system.index.json`                                                                                                                       |
| `components.json`           | Config shadcn CLI : style `radix-lyra`, couleur de base `mist`, icônes Phosphor, chemins d'alias                                                                                        |
| `tokens.css`                | Variables CSS des tokens (importé par `globals.css`)                                                                                                                                    |
| `next.config.mjs`           | Config Next.js standard                                                                                                                                                                 |
| `tsconfig.json`             | TypeScript strict pour l'app ; `scripts/` et `mcp-server/` ont leurs propres projets                                                                                                    |
| `eslint.config.mjs`         | ESLint avec règles Next.js                                                                                                                                                              |
| `postcss.config.mjs`        | PostCSS avec `@tailwindcss/postcss`                                                                                                                                                     |

---

## Fichiers cachés (dotfiles)

### Racine

| Fichier           | Rôle                                                                                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.prettierrc`     | Format : 2 espaces, guillemets doubles, pas de point-virgule, `trailingComma: es5`, plugin tailwindcss pour trier les classes. Configuration unique, `mcp-server/` compris |
| `.prettierignore` | Exclut `dist/`, `node_modules/`, `.next/`, `*.tsbuildinfo`, `package-lock.json`, `next-env.d.ts` du formatage Prettier                                                     |
| `.gitignore`      | Exclut `.next/`, `node_modules/`, `tsconfig.tsbuildinfo`, etc. du versioning                                                                                               |

### `.github/`

| Fichier                            | Rôle                                                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `.github/copilot-instructions.md`  | Pointeur vers `AGENTS.md`, source de vérité unique des règles agent                                                          |
| `.github/pull_request_template.md` | Gabarit de PR                                                                                                                |
| `.github/workflows/ci.yml`         | CI GitHub Actions, 7 jobs : `tokens-validate`, `typecheck`, `lint`, `build`, `index-schema`, `context-freshness`, `mcp-test` |
| `.github/workflows/pr-lint.yml`    | Vérifie que le titre de PR respecte Conventional Commits                                                                     |

### `.vscode/`

| Fichier                    | Rôle                                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `.vscode/mcp.json.example` | Gabarit versionné de configuration des serveurs MCP VS Code ; `.vscode/mcp.json` reste local et ignoré par git |

### Fichiers `.gitkeep`

Présents dans `components/`, `hooks/`, `lib/`, `public/` — maintiennent ces dossiers vides dans Git avant que du contenu soit ajouté.

---

## Flux de données

```
tokens/*.json
    │
    ├──▶ tokens.css                    (CSS custom properties, dark mode)
    │        └──▶ components/ui/       (var(--color-*) dans les classes Tailwind)
    │
    └──▶ scripts/tokens-validate       (lint naming + lint raw values + lint bridge)
```

---

## Commandes clés

```bash
npm run dev               # Démarrer Next.js (démo)
npm run tokens:lint-values  # Vérifier l'absence de valeurs brutes dans les composants
npm run tokens:lint-naming  # Vérifier la grammaire DTCG des tokens
npm run tokens:lint-bridge  # Vérifier le bridge @theme de Tailwind
npm run tokens-validate     # Toutes les validations en séquence
npm run typecheck           # Vérification TypeScript sans build
npm run format              # Prettier sur tous les .ts/.tsx/.md
```

---

## Conventions importantes

- **Jamais de valeur brute** dans un composant — tout passe par un token CSS (`var(--color-*)`, `var(--space-*)`) ou une classe Tailwind mappée sur un token.
- **Exception** : `// allow-raw: <raison>` autorise ponctuellement une valeur brute inévitable (ex. sélecteurs d'attributs CSS ciblant des SVGs Recharts).
- **Grammaire de naming** : `foundation.property[.role][.emphasis][.state]`. Rôle et état ne se fusionnent jamais en un seul segment.
- **Tier 1 (primitive) est privé** — les composants et l'extérieur ne l'utilisent jamais directement.
