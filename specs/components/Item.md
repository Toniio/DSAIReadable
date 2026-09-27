# Item

## Metadata

| Champ         | Valeur                 |
| ------------- | ---------------------- |
| Nom           | Item                   |
| Catégorie     | Misc                   |
| Statut        | stable                 |
| figma_node_id |                        |
| code_path     | components/ui/item.tsx |

## Rôle

Composant de ligne composable représentant un élément dans une liste, avec support pour média, titre, description, actions et sections header/footer.

## Usage

- Afficher un élément dans une liste de résultats ou un feed
- Composer une ligne de tableau de bord avec icône, titre, description et actions
- Construire un menu ou une liste de navigation structurée
- Afficher un item dans un `DropdownMenu` via la variante `xs`
- Regrouper des items avec `ItemGroup` et les séparer avec `ItemSeparator`

## Contraintes

- Toujours placer un `ItemTitle` pour l'accessibilité et la sémantique
- Ne pas utiliser la variante `outline` et `muted` simultanément
- La taille `xs` est optimisée pour les menus contextuels — ne pas l'utiliser pour des listes principales
- Limiter le nombre d'actions dans `ItemActions` (2 à 3 maximum)
- L'`ItemGroup` applique `role="list"` ; les items ne portent pas automatiquement `role="listitem"`

## Dépendances

- `class-variance-authority` pour les variantes de `Item` et `ItemMedia`
- `Slot.Root` de `radix-ui` (utilisé par `Item` quand `asChild={true}`)
- `Separator` depuis `@/components/ui/separator`
- `cn` utilitaire depuis `@/lib/utils`

## Anatomie

| Slot                           | Rôle                                                  |
| ------------------------------ | ----------------------------------------------------- |
| `data-slot="item"`             | Racine de l'item, porte `data-variant` et `data-size` |
| `data-slot="item-media"`       | Média (icône, image), porte `data-variant`            |
| `data-slot="item-content"`     | Conteneur principal (titre + description)             |
| `data-slot="item-title"`       | Titre de l'item                                       |
| `data-slot="item-description"` | Description secondaire                                |
| `data-slot="item-actions"`     | Zone d'actions (boutons, badges)                      |
| `data-slot="item-header"`      | En-tête pleine largeur                                |
| `data-slot="item-footer"`      | Pied pleine largeur                                   |
| `data-slot="item-group"`       | Conteneur de liste d'items (`role="list"`)            |
| `data-slot="item-separator"`   | Séparateur horizontal entre items                     |

## Tokens utilisés

| Token                   | Usage                                          |
| ----------------------- | ---------------------------------------------- |
| `border-border`         | Bordure variante `outline`                     |
| `border-transparent`    | Bordure variantes `default` et `muted`         |
| `bg-muted/50`           | Fond variante `muted`                          |
| `bg-muted`              | Fond au hover des liens enfants                |
| `text-muted-foreground` | Texte de la description et hover des liens     |
| `text-primary`          | Couleur des liens au hover dans la description |
| `border-ring`           | Bordure au focus-visible                       |
| `ring-ring/50`          | Anneau de focus                                |

## Props / API

| Prop                | Type                                     | Défaut      | Description                                       |
| ------------------- | ---------------------------------------- | ----------- | ------------------------------------------------- |
| **Item**            |                                          |             |                                                   |
| `variant`           | `"default" \| "outline" \| "muted"`      | `"default"` | Apparence visuelle de l'item                      |
| `size`              | `"default" \| "sm" \| "xs"`              | `"default"` | Taille et espacement interne                      |
| `asChild`           | `boolean`                                | `false`     | Délègue le rendu au premier enfant via Radix Slot |
| `className`         | `string`                                 | —           | Classes CSS additionnelles                        |
| `...props`          | `React.ComponentProps<"div">`            | —           | Props natives du `<div>`                          |
| **ItemMedia**       |                                          |             |                                                   |
| `variant`           | `"default" \| "icon" \| "image"`         | `"default"` | Type de média affiché                             |
| `className`         | `string`                                 | —           | Classes CSS additionnelles                        |
| `...props`          | `React.ComponentProps<"div">`            | —           | Props natives du `<div>`                          |
| **ItemContent**     |                                          |             |                                                   |
| `className`         | `string`                                 | —           | Classes CSS additionnelles                        |
| `...props`          | `React.ComponentProps<"div">`            | —           | Props natives du `<div>`                          |
| **ItemTitle**       |                                          |             |                                                   |
| `className`         | `string`                                 | —           | Classes CSS additionnelles                        |
| `...props`          | `React.ComponentProps<"div">`            | —           | Props natives du `<div>`                          |
| **ItemDescription** |                                          |             |                                                   |
| `className`         | `string`                                 | —           | Classes CSS additionnelles                        |
| `...props`          | `React.ComponentProps<"p">`              | —           | Props natives du `<p>`                            |
| **ItemActions**     |                                          |             |                                                   |
| `className`         | `string`                                 | —           | Classes CSS additionnelles                        |
| `...props`          | `React.ComponentProps<"div">`            | —           | Props natives du `<div>`                          |
| **ItemHeader**      |                                          |             |                                                   |
| `className`         | `string`                                 | —           | Classes CSS additionnelles                        |
| `...props`          | `React.ComponentProps<"div">`            | —           | Props natives du `<div>`                          |
| **ItemFooter**      |                                          |             |                                                   |
| `className`         | `string`                                 | —           | Classes CSS additionnelles                        |
| `...props`          | `React.ComponentProps<"div">`            | —           | Props natives du `<div>`                          |
| **ItemGroup**       |                                          |             |                                                   |
| `className`         | `string`                                 | —           | Classes CSS additionnelles                        |
| `...props`          | `React.ComponentProps<"div">`            | —           | Props natives du `<div>`                          |
| **ItemSeparator**   |                                          |             |                                                   |
| `className`         | `string`                                 | —           | Classes CSS additionnelles                        |
| `...props`          | `React.ComponentProps<typeof Separator>` | —           | Props du composant `Separator`                    |

> **Axes de variantes** — `Item` et `ItemMedia` portent chacun un `variant`, sur deux axes différents. Sur `Item`, c'est l'**apparence** : `default`, `outline`, `muted`. Sur `ItemMedia`, c'est le **type de média** que le slot contient : `default` (texte ou badge), `icon`, `image` — il conditionne la taille et le rognage. `<Item variant="icon">` n'existe pas.

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

| Composant   | Axe       | Valeurs                         | Défaut    |
| ----------- | --------- | ------------------------------- | --------- |
| `Item`      | `variant` | `default` · `outline` · `muted` | `default` |
| `Item`      | `size`    | `default` · `sm` · `xs`         | `default` |
| `ItemMedia` | `variant` | `default` · `icon` · `image`    | `default` |

Le sens de chaque axe (apparence, intention, taille…) est donné dans **Props / API**.

## États

| État     | Description                                         |
| -------- | --------------------------------------------------- |
| default  | Bordure transparente, espacement standard           |
| outline  | Bordure `border-border` visible                     |
| muted    | Fond `bg-muted/50`, bordure transparente            |
| hover    | Fond `bg-muted` sur les liens enfants (`[a]:hover`) |
| focus    | Anneau `ring-ring/50` + bordure `border-ring`       |
| active   | Non applicable directement                          |
| disabled | Non applicable directement                          |

## Accessibilité

**Pattern** : Liste (`role="list"`) d'éléments

**Rôle** : `ItemGroup` porte `role="list"` ; `Item` est un `div` (ou l'élément fourni par `asChild`).

**Clavier** :

Aucune interaction propre ; un `Item` rendu en lien ou bouton suit le comportement natif.

**Nom accessible** : Le contenu de `ItemTitle` ; un `Item` cliquable doit être un lien ou un bouton nommé.

**Vigilance** :

- **Défaut connu** : `ItemGroup` déclare `role="list"` mais `Item` n'a pas `role="listitem"` — une liste ARIA sans éléments de liste, signalée par axe. Ajouter `role="listitem"` aux `Item` d'un `ItemGroup` en attendant la correction.
- Un `Item` entièrement cliquable ne doit pas contenir d'autre élément interactif.

## Exemple de code

```tsx
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemGroup,
} from "@/components/ui/item"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileIcon } from "@phosphor-icons/react"

export default function Example() {
  return (
    <ItemGroup>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <FileIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Rapport annuel 2024</ItemTitle>
          <ItemDescription>
            Dernière modification il y a 2 jours
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge variant="secondary">PDF</Badge>
          <Button variant="ghost" size="icon-sm">
            ⋯
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  )
}
```

## Références croisées

- `Avatar` — souvent utilisé comme `ItemMedia` dans les listes d'utilisateurs
- `Badge` — affiché dans `ItemActions` ou `ItemTitle` pour un statut
- `Separator` — utilisé en interne par `ItemSeparator`
- `Button` — actions dans `ItemActions`
- `DropdownMenu` — item en taille `xs` adapté au contexte menu
