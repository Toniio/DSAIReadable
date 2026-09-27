# Pagination

## Metadata

| Champ         | Valeur                       |
| ------------- | ---------------------------- |
| Nom           | Pagination                   |
| Catégorie     | Navigation                   |
| Statut        | stable                       |
| figma_node_id |                              |
| code_path     | components/ui/pagination.tsx |

## Rôle

Composant de navigation séquentielle permettant de parcourir des ensembles de résultats paginés via des liens numérotés, précédent/suivant et ellipsis.

## Usage

- Naviguer entre les pages d'une liste de résultats (tableaux, grilles)
- Afficher la page courante parmi un ensemble de pages numérotées
- Proposer des raccourcis « Précédent » et « Suivant » pour la navigation séquentielle
- Tronquer les numéros de page intermédiaires via l'ellipsis pour les grands ensembles

## Contraintes

- Ne pas utiliser pour une navigation hiérarchique — préférer `Breadcrumb`
- Le composant n'inclut pas de logique de pagination — le consommateur doit gérer l'état et les URLs
- La page active porte `aria-current="page"` ; ne pas dupliquer cet attribut
- Les liens `PaginationPrevious` et `PaginationNext` nécessitent un `href` valide ou un handler
- L'ellipsis est masqué des lecteurs d'écran (`aria-hidden`)
- Chaînes par défaut en anglais issues de `UI_STRINGS.pagination` — surcharger via `text`, `label` et `srLabel`

## Dépendances

- `Button` de `@/components/ui/button` (utilisé comme wrapper des liens de pagination)
- `CaretLeftIcon`, `CaretRightIcon`, `DotsThreeIcon` de `@phosphor-icons/react`

## Anatomie

| Slot                              | Rôle                                                                 |
| --------------------------------- | -------------------------------------------------------------------- |
| `data-slot="pagination"`          | Racine `<nav>` avec `role="navigation"` et `aria-label="pagination"` |
| `data-slot="pagination-content"`  | Liste `<ul>` contenant les items de pagination                       |
| `data-slot="pagination-item"`     | Élément `<li>` individuel                                            |
| `data-slot="pagination-link"`     | Lien `<a>` vers une page, porte `data-active`                        |
| `data-slot="pagination-ellipsis"` | Indicateur de troncature entre les numéros de page                   |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

Aucun token : `components/ui/pagination.tsx` n'emploie aucune classe ni variable qui mène à un token sémantique.

Compose `Button` : les tokens de ce composant sont listés dans sa spec.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Pagination`

Rend `<nav>`.

| Prop        | Type                          | Défaut | Description                                      |
| ----------- | ----------------------------- | ------ | ------------------------------------------------ |
| `className` | `string`                      | —      | Classes CSS additionnelles sur le `<nav>` racine |
| `...props`  | `React.ComponentProps<"nav">` | —      | Props natives de `<nav>`                         |

### `PaginationContent`

Rend `<ul>`.

| Prop       | Type                         | Défaut | Description             |
| ---------- | ---------------------------- | ------ | ----------------------- |
| `...props` | `React.ComponentProps<"ul">` | —      | Props natives de `<ul>` |

### `PaginationEllipsis`

Rend `<span>`.

| Prop       | Type                           | Défaut                           | Description                                                            |
| ---------- | ------------------------------ | -------------------------------- | ---------------------------------------------------------------------- |
| `srLabel`  | `string`                       | `UI_STRINGS.pagination.ellipsis` | Texte lu par les lecteurs d'écran ; remplace la valeur de `UI_STRINGS` |
| `...props` | `React.ComponentProps<"span">` | —                                | Props natives de `<span>`                                              |

### `PaginationItem`

Rend `<li>`.

| Prop       | Type                         | Défaut | Description             |
| ---------- | ---------------------------- | ------ | ----------------------- |
| `...props` | `React.ComponentProps<"li">` | —      | Props natives de `<li>` |

### `PaginationLink`

Rend `<a>`.

| Prop       | Type                                                                                 | Défaut   | Description                                           |
| ---------- | ------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------- |
| `isActive` | `boolean`                                                                            | —        | Marque le lien comme page courante (`PaginationLink`) |
| `size`     | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"` | `"icon"` | Taille du bouton wrapper (`PaginationLink`)           |
| `...props` | `PaginationLinkProps`                                                                | —        | Props de `PaginationLink`                             |

### `PaginationNext`

Rend `PaginationLink`.

| Prop       | Type                                          | Défaut                            | Description                                                                |
| ---------- | --------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------- |
| `isActive` | `boolean`                                     | —                                 | Marque l'élément courant (page ou entrée active)                           |
| `text`     | `string`                                      | `UI_STRINGS.pagination.nextText`  | Texte des boutons précédent/suivant                                        |
| `label`    | `string`                                      | `UI_STRINGS.pagination.nextLabel` | Nom accessible du lien (`aria-label`) ; remplace la valeur de `UI_STRINGS` |
| `...props` | `React.ComponentProps<typeof PaginationLink>` | —                                 | Props de `PaginationLink`                                                  |

### `PaginationPrevious`

Rend `PaginationLink`.

| Prop       | Type                                          | Défaut                                | Description                                                                |
| ---------- | --------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| `isActive` | `boolean`                                     | —                                     | Marque l'élément courant (page ou entrée active)                           |
| `text`     | `string`                                      | `UI_STRINGS.pagination.previousText`  | Texte visible du lien ; remplace la valeur de `UI_STRINGS`                 |
| `label`    | `string`                                      | `UI_STRINGS.pagination.previousLabel` | Nom accessible du lien (`aria-label`) ; remplace la valeur de `UI_STRINGS` |
| `...props` | `React.ComponentProps<typeof PaginationLink>` | —                                     | Props de `PaginationLink`                                                  |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                     |
| -------- | --------------------------------------------------------------- |
| default  | Liens en variante `ghost`, page active en variante `outline`    |
| hover    | Fond selon la variante Button (`ghost` ou `outline`)            |
| focus    | Style de focus hérité du composant `Button`                     |
| active   | `data-active={true}`, `aria-current="page"`, variante `outline` |
| disabled | Géré via le composant `Button` sous-jacent                      |

## Accessibilité

**Pattern** : Navigation (`nav`) + liste de liens

**Rôle** : `nav` étiquetée `UI_STRINGS.pagination.landmark` ; `ul` de liens ; la page courante porte `aria-current="page"`.

**Clavier** :

Aucune interaction propre : liens natifs (`Tab`, `Enter`).

**Nom accessible** : Précédent / suivant sont nommés par `UI_STRINGS.pagination.previousLabel` / `nextLabel` ; l'ellipse par `UI_STRINGS.pagination.ellipsis`.

**Vigilance** :

- Chaque lien de page doit être explicite pour un lecteur d'écran (« Page 3 »), pas seulement « 3 », si le contexte ne suffit pas.
- Après un changement de page, déplacer le focus vers le début des résultats.

## Exemple de code

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"

export default function Example() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="/page/1" text="Précédent" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/page/1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/page/2" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/page/3">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="/page/3" text="Suivant" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
```

## Références croisées

- `Button` — composant de base utilisé pour le rendu des liens de pagination
- `Breadcrumb` — navigation hiérarchique (complémentaire à la pagination)
- `Tabs` — alternative pour du contenu mutuellement exclusif sans notion de séquence
