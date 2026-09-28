# Structure du projet — Design System

> Next.js 16 · React 19 · Tailwind CSS v4 · shadcn/ui (style `radix-lyra`) · TypeScript 5

Ce repo est un **design system code-first** : les composants React, les tokens et la documentation machine-readable ont une source unique dans le code. Chaque valeur visuelle a une source unique.

> La couche d'intégration Figma a été retirée. Spécification de ré-intégration : [`FIGMA_REINTEGRATION.md`](./FIGMA_REINTEGRATION.md).

---

## Vue d'ensemble

```
dsaireadable/
├── app/                        # App Next.js (démo) : accueil, login (3 déclinaisons), banking
├── components/ui/              # 59 composants React du DS
├── lib/                        # Modules partagés : utils, focus, ui-strings, overlay
├── hooks/                      # Hooks partagés (use-mobile)
├── tokens/                     # Source de vérité des tokens (DTCG JSON)
├── tokens.css                  # CSS custom properties générées — ne pas éditer
├── specs/                      # Documentation markdown du DS (composants, fondations, tokens)
├── scripts/                    # Outillage : génération et lint des tokens, specs, index, registre
├── mcp-server/                 # Serveur MCP qui sert le DS aux agents (règles propres : son AGENTS.md)
├── registry/                   # Sources des items de registre hors composants (conventions)
├── registry.json               # Registre shadcn — généré
├── design-system.index.json    # Inventaire machine-readable du DS
├── design-system.schema.json   # JSON Schema validant l'index
└── .husky/                     # Hooks git : pre-commit, commit-msg, pre-push
```

---

## `app/` — Application Next.js

Point d'entrée de la démo. Pas d'écrans métier — sert uniquement à valider que les composants s'assemblent correctement.

| Fichier                           | Rôle                                                                                                                 |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `app/layout.tsx`                  | Layout racine : charge les fonts (Geist, JetBrains Mono), wrap avec `ThemeProvider` (dark mode) et `TooltipProvider` |
| `app/page.tsx`                    | Page de démo minimale — affiche un `<Button>` pour vérifier que le setup fonctionne                                  |
| `app/globals.css`                 | CSS global : import de Tailwind et de `tokens.css`, pont `@theme inline` qui fait des tokens des classes Tailwind    |
| `app/banking/page.tsx`            | Écran de démo bancaire : cartes, onglets, tableau de transactions, barres de budget (`Progress`)                     |
| `app/login/page.tsx`              | Index des 3 déclinaisons de login (liens vers les sous-routes)                                                       |
| `app/login/split-screen/page.tsx` | Login split-screen : illustration à gauche, formulaire à droite                                                      |
| `app/login/centered/page.tsx`     | Login centré : formulaire dans une `<Card>` centrée sur la page                                                      |
| `app/login/fullscreen/page.tsx`   | Login plein écran : formulaire occupe toute la hauteur de la fenêtre                                                 |

---

## `components/` — Composants React

### `components/theme-provider.tsx`

Wrapper `next-themes` qui injecte la classe `dark` sur `<html>` et permet le toggle light/dark.

### `components/ui/` — Bibliothèque de composants

59 composants shadcn/ui customisés. Chaque fichier exporte un ou plusieurs composants React avec :

- variantes gérées par `class-variance-authority` (cva)
- tokens de design via les classes Tailwind que le pont `@theme` rattache aux tokens (`bg-primary`, `text-muted-foreground`…) — la liste exacte par composant est dans la section « Tokens utilisés » de sa spec
- accessibilité Radix UI / Base UI sous-jacente

**Composants notables :**

| Fichier              | Ce qu'il apporte                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `button.tsx`         | Variantes default, outline, secondary, ghost, destructive, link + tailles xs/sm/default/lg et icon-xs/icon-sm/icon/icon-lg |
| `field.tsx`          | Composition Label + Input + message d'erreur/helper — bloc formulaire complet                                              |
| `input-group.tsx`    | Input avec addons gauche/droite (icônes, préfixes texte)                                                                   |
| `password-input.tsx` | Input mot de passe avec toggle visibilité                                                                                  |
| `combobox.tsx`       | Sélecteur avec recherche, simple ou multiple (Base UI `Combobox`)                                                          |
| `empty.tsx`          | État vide standardisé avec illustration + message                                                                          |
| `item.tsx`           | Ligne générique réutilisable (liste, menu, option)                                                                         |
| `native-select.tsx`  | `<select>` natif stylisé — fallback accessible au `<Select>` Radix                                                         |
| `spinner.tsx`        | Indicateur de chargement accessible                                                                                        |
| `sidebar.tsx`        | Sidebar responsive complète avec collapse, navigation, raccourcis clavier                                                  |
| `chart.tsx`          | Wrapper Recharts avec tokens DS + config légende/tooltip                                                                   |
| `heading.tsx`        | Titre typographique (h1–h4) : `level` fixe niveau et taille, `as` découple le niveau sémantique                            |
| `logo.tsx`           | Logo SVG composant                                                                                                         |
| `illustration.tsx`   | Illustrations SVG du DS                                                                                                    |

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

C'est la couche que lisent les composants : le pont `@theme` de `app/globals.css` rattache chaque classe Tailwind (`bg-background`) à un token sémantique (`--color-background-default`).

### `tokens/component.json` — Tier 3 Composant

**Aliases de compatibilité shadcn/ui** : mappe les tokens sémantiques vers les noms attendus par shadcn (`--background`, `--primary`, `--ring`, etc.).  
Ils servent le code shadcn externe qu'un consommateur ajouterait ; les composants du DS n'en lisent aucun.

---

## `tokens.css` — CSS Custom Properties

Fichier **généré exclusivement par `npm run tokens:build` — ne jamais l'éditer** (`tokens:check` détecte toute dérive). Il expose tous les tokens comme variables CSS :

```css
:root {
  --color-background-default: #ffffff;
}
.dark {
  --color-background-default: #090b0c;
}
```

Importé dans `app/globals.css`, dont le bloc `@theme inline` fait le pont entre ces variables et les classes Tailwind.

---

## `scripts/` — Outillage

Chaque script documente en tête de fichier ce qu'il vérifie et pourquoi. Tous tournent en CI.

### Tokens — `npm run tokens-validate`

| Script                      | Commande npm                        | Rôle                                                                                                                         |
| --------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `build-tokens.ts`           | `tokens:build` / `tokens:check`     | Génère `tokens.css` depuis les sources DTCG ; `--check` échoue en cas de dérive                                              |
| `lint-token-naming.ts`      | `tokens:lint-naming`                | Grammaire des clés (`foundation.property[.role][.emphasis][.state]`) ; les tiers 2 et 3 ne contiennent que des références    |
| `lint-raw-values.ts`        | `tokens:lint-values`                | Détecte les valeurs brutes (hex, px, rem…) dans les composants. Exception : `// allow-raw: <raison>`                         |
| `lint-theme-bridge.ts`      | `tokens:lint-bridge`                | Le pont `@theme` de `app/globals.css` : références résolues, aucun tier privé, chaque nom dans un espace de noms Tailwind    |
| `lint-focus-ring.ts`        | `tokens:lint-focus`                 | Un seul anneau de focus (`lib/focus.ts`) pour tous les composants focusables                                                 |
| `lint-contrast.ts`          | `tokens:lint-contrast`              | Contrastes WCAG des paires texte / fond, en clair et en sombre                                                               |
| `lint-palette-monotonic.ts` | `tokens:lint-monotonic`             | Dans chaque palette, la luminance décroît strictement quand le palier monte                                                  |
| `lint-chart-palette.ts`     | `tokens:lint-chart`                 | Chaque série `color.chart.*` à 3:1 sur ses fonds ; paires distinctes en OKLab, en vision normale, protanopie et deutéranopie |
| `lint-font-tokens.ts`       | `tokens:lint-fonts`                 | Chaque token `typography.font-family.*` nomme la police que `next/font` charge sous sa variable                              |
| `lint-token-lifecycle.ts`   | `tokens:lint-lifecycle`             | Chaque token sémantique déclare `active`, `reserved` ou `$deprecated`, et le statut correspond au code                       |
| `build-token-docs.ts`       | `docs:tokens` / `docs:tokens:check` | Génère `specs/tokens/token-reference.md` et `tokens.manifest.json`                                                           |

### Specs — `npm run specs:validate`

| Script                   | Commande npm     | Rôle                                                                                  |
| ------------------------ | ---------------- | ------------------------------------------------------------------------------------- |
| `build-spec-variants.ts` | `specs:variants` | Section `Variants`, depuis les `cva()` du code                                        |
| `build-spec-tokens.ts`   | `specs:tokens`   | Section `Tokens`, classes résolues par Tailwind jusqu'au token                        |
| `build-spec-api.ts`      | `specs:api`      | Section `Props / API`, depuis les exports TypeScript (`scripts/lib/component-api.ts`) |
| `build-spec-choices.ts`  | `specs:choices`  | Règles de choix de l'index recopiées dans l'`Usage` des specs concernées              |
| `lint-spec-sections.ts`  | —                | Les 13 sections canoniques, dans l'ordre                                              |
| `lint-spec-wording.ts`   | —                | Aucune formulation floue ; chaque ligne de Constraints ouvre sur un mot-clé           |

### Index — `npm run index:validate`

| Script                | Commande npm      | Rôle                                                                                                        |
| --------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------- |
| `validate-index.ts`   | `index:schema`    | `design-system.index.json` conforme à son JSON Schema                                                       |
| `lint-sizes.ts`       | `index:sizes`     | Tailles de l'inventaire = tailles du code = tailles des specs                                               |
| `lint-data-slot.ts`   | `index:data-slot` | Chaque composant expose un `data-slot`                                                                      |
| `lint-ui-strings.ts`  | `index:strings`   | Les noms accessibles par défaut (aria-label, sr-only) viennent de `lib/ui-strings.ts`, jamais écrits en dur |
| `lint-props-types.ts` | `index:props`     | Chaque composant exporté exporte le type de ses props                                                       |

### Registre

| Script                     | Commande npm                        | Rôle                                                                 |
| -------------------------- | ----------------------------------- | -------------------------------------------------------------------- |
| `build-registry.ts`        | `registry:build` / `registry:check` | Génère `registry.json` depuis l'inventaire, les specs et les imports |
| `test-registry-install.ts` | `registry:test-install`             | Installe tous les items dans une app vierge et la compile            |

Modules partagés : `scripts/lib/` (API des composants, polices `next/font`), `wcag.ts`, `color-vision.ts`.

---

## `specs/` — Documentation du design system

Documentation markdown structurée, consommable par les humains **et les LLMs** (via MCP).

### `specs/components/` — Specs composants (59 fichiers)

Une spec par composant. Structure en 13 sections :
`Metadata` · `Role` · `Usage` · `Constraints` · `Dependencies` · `Anatomy` · `Tokens` · `Props / API` · `Variants` · `States` · `Accessibility` · `Code example` · `Cross-references`

`Variants` est générée depuis les `cva()` du code (`npm run specs:variants`) ;
`Tokens` est générée depuis les classes du code, résolues par Tailwind jusqu'au token sémantique (`npm run specs:tokens`) ;
Les règles s'écrivent **MUST** / **MUST NOT** ou **SHOULD** … **unless** (**Note** pour un fait, en Constraints) ; `lint-spec-wording` refuse “avoid”, “prefer”, “if needed”… et toute ligne de Constraints sans mot-clé ;
Les règles de choix entre composants voisins (`composition_rules` de l'index, champ `applies_to`) sont recopiées en dernière puce de leur `Usage` (`npm run specs:choices`) ;
`Props / API` est générée depuis les exports TypeScript — un bloc par export, types et défauts tirés du code ; seules les descriptions s'éditent à la main (`npm run specs:api`) ;
`Accessibility` suit une structure fixe — Pattern, Role, Keyboard, Accessible name, Pitfalls.

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

Référence exhaustive des **301** tokens des trois tiers : variable CSS, type, valeurs
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
| `eslint.config.mjs`         | ESLint : règles Next.js, et `better-tailwindcss` qui refuse les classes hors design system et `opacity-N` sur un état désactivé                                                         |
| `lint-staged.config.mjs`    | Hook pre-commit : Prettier et ESLint sur les fichiers indexés, `typecheck:all`                                                                                                          |
| `commitlint.config.mjs`     | Hook commit-msg : Conventional Commits                                                                                                                                                  |
| `tsconfig.scripts.json`     | Projet TypeScript de `scripts/`                                                                                                                                                         |
| `registry.json`             | Registre shadcn — généré par `npm run registry:build`                                                                                                                                   |
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

| Fichier                            | Rôle                                                                                                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/copilot-instructions.md`  | Pointeur vers `AGENTS.md`, source de vérité unique des règles agent                                                                                       |
| `.github/pull_request_template.md` | Gabarit de PR                                                                                                                                             |
| `.github/workflows/ci.yml`         | CI GitHub Actions, 9 jobs : `tokens-validate`, `typecheck`, `lint`, `build`, `index-schema`, `spec-sections`, `context-freshness`, `mcp-test`, `registry` |
| `.github/workflows/pr-lint.yml`    | Vérifie que le titre de PR respecte Conventional Commits                                                                                                  |

### `.vscode/`

| Fichier                    | Rôle                                                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `.vscode/mcp.json.example` | Gabarit versionné de configuration des serveurs MCP VS Code ; `.vscode/mcp.json` reste local et ignoré par git |

### Fichiers `.gitkeep`

Présents dans `components/`, `hooks/`, `lib/`, `public/` — vestiges de l'initialisation, quand ces dossiers étaient vides ; `public/` l'est encore.

---

## Flux de données

```
tokens/*.json
    ├──▶ tokens.css ──▶ app/globals.css (@theme inline) ──▶ classes Tailwind ──▶ components/ui/
    └──▶ token-reference.md · tokens.manifest.json          (docs:tokens)

components/ui/*.tsx ──▶ specs/components/*.md               (Variants, Tokens, Props / API)
design-system.index.json ──▶ specs/components/*.md          (règles de choix, Usage)

specs/ · tokens/ · index · components/ ──▶ mcp-server/context/*.json   (generate-context) ──▶ agents MCP
index · specs · components/ ──▶ registry.json               (registry:build) ──▶ consommateurs shadcn
```

---

## Commandes clés

```bash
npm run dev               # Démarrer Next.js (démo)
npm run tokens:lint-values  # Vérifier l'absence de valeurs brutes dans les composants
npm run tokens:lint-naming  # Vérifier la grammaire DTCG des tokens
npm run tokens:lint-bridge  # Vérifier le bridge @theme de Tailwind
npm run tokens-validate     # Toutes les validations de tokens en séquence
npm run specs:validate      # Specs : sections, parties générées, formulation
npm run typecheck:all       # TypeScript : app, scripts, mcp-server
npm run format              # Prettier sur tous les .ts/.tsx/.md
```

---

## Conventions importantes

- **Jamais de valeur brute** dans un composant — tout passe par une classe Tailwind mappée sur un token, ou un token CSS (`var(--…)`).
- **Exception** : `// allow-raw: <raison>` autorise ponctuellement une valeur brute inévitable (ex. sélecteurs d'attributs CSS ciblant des SVGs Recharts).
- **Grammaire de naming** : `foundation.property[.role][.emphasis][.state]`. Rôle et état ne se fusionnent jamais en un seul segment.
- **Tier 1 (primitive) est privé** — les composants et l'extérieur ne l'utilisent jamais directement.
