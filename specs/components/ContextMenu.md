# ContextMenu

## Metadata

| Champ         | Valeur                         |
| ------------- | ------------------------------ |
| Nom           | ContextMenu                    |
| Catégorie     | Overlay                        |
| Statut        | stable                         |
| figma_node_id |                                |
| code_path     | components/ui/context-menu.tsx |

## Rôle

Menu contextuel déclenché par un clic droit, affichant une liste d'actions pertinentes pour l'élément ciblé.

## Usage

- Proposer des actions contextuelles sur un élément (copier, coller, supprimer)
- Offrir des raccourcis d'actions dans une zone de travail (canvas, tableau, liste)
- Permettre des sélections via checkbox ou radio dans un menu contextuel
- Organiser des actions en groupes avec séparateurs et sous-menus

## Contraintes

- Ne pas utiliser comme menu principal de navigation — préférer `DropdownMenu`
- Le menu contextuel remplace le menu natif du navigateur : s'assurer que les actions proposées sont pertinentes
- Un seul menu contextuel visible à la fois (géré par Radix)
- Prévoir un fallback clavier (touche `Shift+F10` ou touche contextuelle)
- Les items `disabled` doivent rester visibles mais non interactifs (`opacity-50`, `pointer-events-none`)

## Dépendances

- `ContextMenu` de `radix-ui` (primitives Root, Trigger, Portal, Content, Item, CheckboxItem, RadioItem, RadioGroup, Label, Separator, Sub, SubTrigger, SubContent, Group)
- `@phosphor-icons/react` — icônes `CaretRightIcon` (sous-menu) et `CheckIcon` (indicateur de sélection)

## Anatomie

| Slot                                     | Rôle                                         |
| ---------------------------------------- | -------------------------------------------- |
| `data-slot="context-menu"`               | Racine du composant                          |
| `data-slot="context-menu-trigger"`       | Zone réactive au clic droit                  |
| `data-slot="context-menu-portal"`        | Portail de rendu                             |
| `data-slot="context-menu-content"`       | Conteneur du menu flottant                   |
| `data-slot="context-menu-item"`          | Élément d'action simple                      |
| `data-slot="context-menu-checkbox-item"` | Élément avec case à cocher                   |
| `data-slot="context-menu-radio-item"`    | Élément avec bouton radio                    |
| `data-slot="context-menu-radio-group"`   | Groupe de radio items                        |
| `data-slot="context-menu-group"`         | Groupe logique d'items                       |
| `data-slot="context-menu-label"`         | Libellé de section                           |
| `data-slot="context-menu-separator"`     | Séparateur visuel entre groupes              |
| `data-slot="context-menu-shortcut"`      | Raccourci clavier affiché à droite           |
| `data-slot="context-menu-sub"`           | Conteneur de sous-menu                       |
| `data-slot="context-menu-sub-trigger"`   | Déclencheur de sous-menu (avec icône flèche) |
| `data-slot="context-menu-sub-content"`   | Contenu du sous-menu                         |

## Tokens utilisés

| Token                     | Usage                                |
| ------------------------- | ------------------------------------ |
| `bg-popover`              | Fond du menu et sous-menu            |
| `text-popover-foreground` | Couleur du texte des items           |
| `bg-accent`               | Fond de l'item au focus              |
| `text-accent-foreground`  | Texte de l'item au focus             |
| `text-destructive`        | Texte d'un item destructeur          |
| `bg-destructive/10`       | Fond d'un item destructeur au focus  |
| `text-muted-foreground`   | Couleur des labels et raccourcis     |
| `bg-border`               | Couleur du séparateur                |
| `ring-foreground/10`      | Bordure subtile du contenu           |
| `duration-fast`           | Durée des animations d'entrée/sortie |

## Props / API

| Prop        | Type                                     | Défaut      | Description                                                                                    |
| ----------- | ---------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `inset`     | `boolean`                                | `undefined` | Ajoute un padding gauche supplémentaire (sur Item, CheckboxItem, RadioItem, Label, SubTrigger) |
| `variant`   | `"default" \| "destructive"`             | `"default"` | Variante visuelle de l'item (sur ContextMenuItem)                                              |
| `checked`   | `boolean`                                | `undefined` | État coché d'un CheckboxItem                                                                   |
| `className` | `string`                                 | —           | Classes CSS additionnelles (sur chaque sous-composant)                                         |
| `side`      | `"top" \| "right" \| "bottom" \| "left"` | —           | Côté d'apparition du contenu                                                                   |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                |
| -------- | ---------------------------------------------------------- |
| default  | Menu fermé, trigger en attente de clic droit               |
| open     | Menu affiché avec animation `fade-in` + `zoom-in-95`       |
| focus    | Item surligné avec `bg-accent` et `text-accent-foreground` |
| active   | Item en cours de sélection                                 |
| disabled | Item grisé (`opacity-50`, `pointer-events-none`)           |

## Accessibilité

**Pattern** : [Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) contextuel (Radix ContextMenu)

**Rôle** : `role="menu"` et `menuitem` / `menuitemcheckbox` / `menuitemradio`.

**Clavier** :

| Touche                               | Action                                          |
| ------------------------------------ | ----------------------------------------------- |
| Clic droit, `Shift+F10`, touche Menu | Ouvre le menu sur la zone                       |
| `ArrowDown` / `ArrowUp`              | Élément suivant / précédent                     |
| `ArrowRight` / `ArrowLeft`           | Ouvre / ferme un sous-menu                      |
| `Enter` / `Space`                    | Active l'élément                                |
| `Escape`                             | Ferme le menu                                   |
| Saisie                               | Va à l'élément qui commence par la lettre tapée |

**Nom accessible** : Le texte de chaque élément ; un élément icône seule doit avoir un `aria-label`.

**Vigilance** :

- Un menu contextuel est invisible tant qu'on ne le cherche pas : chaque action qu'il propose doit exister ailleurs (bouton, menu visible).
- La zone déclencheuse doit être focalisable pour que `Shift+F10` l'atteigne.

## Exemple de code

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export default function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-36 w-64 items-center justify-center rounded-xs border border-dashed">
        Clic droit ici
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          Copier <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Coller <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Supprimer</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
```

## Références croisées

- `DropdownMenu` — menu déclenché par un clic gauche sur un bouton
- `Popover` — contenu flottant plus riche qu'un simple menu
- `Sheet` — panneau latéral pour des listes d'actions étendues
