# Breadcrumb

## Metadata

| Champ         | Valeur                       |
| ------------- | ---------------------------- |
| Nom           | Breadcrumb                   |
| Catégorie     | Navigation                   |
| Statut        | stable                       |
| figma_node_id |                              |
| code_path     | components/ui/breadcrumb.tsx |

## Rôle

Composant de navigation secondaire affichant le chemin hiérarchique de la page courante pour permettre à l'utilisateur de remonter dans l'arborescence.

## Usage

- Afficher le fil d'Ariane sur les pages avec une profondeur de navigation ≥ 2
- Permettre la remontée rapide vers les pages parentes
- Indiquer visuellement la position de l'utilisateur dans la hiérarchie du site
- Tronquer les chemins longs via l'ellipsis pour les arborescences profondes

## Contraintes

- Ne pas utiliser comme navigation principale — c'est un repère contextuel
- Un seul breadcrumb par page, placé en haut du contenu principal
- Le dernier élément (`BreadcrumbPage`) ne doit pas être un lien cliquable
- Les séparateurs et l'ellipsis sont masqués des lecteurs d'écran (`aria-hidden`)
- Le composant racine porte `aria-label="breadcrumb"` — ne pas le surcharger sans raison
- Chaînes par défaut en anglais issues de `UI_STRINGS.breadcrumb` — surcharger `BreadcrumbEllipsis` via `srLabel`

## Dépendances

- `Slot.Root` de `radix-ui` (utilisé quand `asChild={true}` sur `BreadcrumbLink`)
- `CaretRightIcon`, `DotsThreeIcon` de `@phosphor-icons/react`

## Anatomie

| Slot                               | Rôle                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| `data-slot="breadcrumb"`           | Racine `<nav>` avec `aria-label="breadcrumb"`                |
| `data-slot="breadcrumb-list"`      | Liste ordonnée `<ol>` contenant les items                    |
| `data-slot="breadcrumb-item"`      | Élément `<li>` individuel du fil d'Ariane                    |
| `data-slot="breadcrumb-link"`      | Lien cliquable vers une page parente                         |
| `data-slot="breadcrumb-page"`      | Page courante non cliquable (`aria-current="page"`)          |
| `data-slot="breadcrumb-separator"` | Séparateur visuel entre les items (chevron droit par défaut) |
| `data-slot="breadcrumb-ellipsis"`  | Indicateur de troncature pour les chemins longs              |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                           | Classes et variables    | Où                                  |
| ------------------------------- | ----------------------- | ----------------------------------- |
| `color.text.default`            | `text-foreground`       | `BreadcrumbLink` · `BreadcrumbPage` |
| `color.text.subtle`             | `text-muted-foreground` | `BreadcrumbList`                    |
| `typography.font-weight.normal` | `font-normal`           | `BreadcrumbPage`                    |
| `typography.size.xs`            | `text-xs`               | `BreadcrumbList`                    |

Relevé dans `components/ui/breadcrumb.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Breadcrumb`

Rend `<nav>`.

| Prop        | Type                          | Défaut | Description                                            |
| ----------- | ----------------------------- | ------ | ------------------------------------------------------ |
| `className` | `string`                      | —      | Classes CSS additionnelles sur le `<nav>` racine       |
| `children`  | `React.ReactNode`             | —      | Contenu du séparateur (remplace le chevron par défaut) |
| `...props`  | `React.ComponentProps<"nav">` | —      | Props natives de `<nav>`                               |

### `BreadcrumbList`

Rend `<ol>`.

| Prop       | Type                         | Défaut | Description             |
| ---------- | ---------------------------- | ------ | ----------------------- |
| `...props` | `React.ComponentProps<"ol">` | —      | Props natives de `<ol>` |

### `BreadcrumbItem`

Rend `<li>`.

| Prop       | Type                         | Défaut | Description             |
| ---------- | ---------------------------- | ------ | ----------------------- |
| `...props` | `React.ComponentProps<"li">` | —      | Props natives de `<li>` |

### `BreadcrumbLink`

Rend `<a>`, ou son enfant avec `asChild`.

| Prop       | Type                        | Défaut  | Description                                                              |
| ---------- | --------------------------- | ------- | ------------------------------------------------------------------------ |
| `asChild`  | `boolean`                   | `false` | Sur `BreadcrumbLink` : délègue le rendu au premier enfant via Radix Slot |
| `...props` | `React.ComponentProps<"a">` | —       | Props natives de `<a>`                                                   |

### `BreadcrumbPage`

Rend `<span>`.

| Prop       | Type                           | Défaut | Description               |
| ---------- | ------------------------------ | ------ | ------------------------- |
| `...props` | `React.ComponentProps<"span">` | —      | Props natives de `<span>` |

### `BreadcrumbSeparator`

Rend `<li>`.

| Prop       | Type                         | Défaut | Description             |
| ---------- | ---------------------------- | ------ | ----------------------- |
| `...props` | `React.ComponentProps<"li">` | —      | Props natives de `<li>` |

### `BreadcrumbEllipsis`

Rend `<span>`.

| Prop       | Type                           | Défaut                           | Description                                                            |
| ---------- | ------------------------------ | -------------------------------- | ---------------------------------------------------------------------- |
| `srLabel`  | `string`                       | `UI_STRINGS.breadcrumb.ellipsis` | Texte lu par les lecteurs d'écran ; remplace la valeur de `UI_STRINGS` |
| `...props` | `React.ComponentProps<"span">` | —                                | Props natives de `<span>`                                              |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                          |
| -------- | -------------------------------------------------------------------- |
| default  | Liens en `text-muted-foreground`, page courante en `text-foreground` |
| hover    | Transition de couleur vers `text-foreground` sur les liens           |
| focus    | Style natif du navigateur sur les liens (pas de ring custom)         |
| active   | Non applicable — les liens redirigent vers la page cible             |
| disabled | `BreadcrumbPage` porte `aria-disabled="true"` et n'est pas cliquable |

## Accessibilité

**Pattern** : [Breadcrumb](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)

**Rôle** : `nav` étiquetée `UI_STRINGS.breadcrumb.landmark` contenant une `ol` ; `BreadcrumbPage` porte `aria-current="page"`.

**Clavier** :

Aucune interaction propre : les liens suivent le comportement natif (`Tab`, `Enter`).

**Nom accessible** : Le repère `nav` est nommé par défaut (« breadcrumb ») ; le traduire via la prop prévue. L'ellipse annonce `UI_STRINGS.breadcrumb.ellipsis`.

**Vigilance** :

- Les séparateurs sont masqués (`role="presentation"`, `aria-hidden`) : ne pas y mettre de texte porteur de sens.
- La page courante n'est pas un lien : ne pas la rendre cliquable.

## Exemple de code

```tsx
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

export default function Example() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/produits">Produits</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Détail produit</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

## Références croisées

- `NavigationMenu` — navigation principale structurée
- `Pagination` — navigation séquentielle entre pages de résultats
- `Button` — peut servir de lien via `asChild` + `<Link>` dans le breadcrumb
