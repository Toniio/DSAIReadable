# DropdownMenu

## Metadata

| Champ         | Valeur                          |
| ------------- | ------------------------------- |
| Nom           | DropdownMenu                    |
| Catégorie     | Overlay                         |
| Statut        | stable                          |
| figma_node_id |                                 |
| code_path     | components/ui/dropdown-menu.tsx |

## Rôle

Menu déroulant déclenché par un clic sur un bouton, affichant une liste d'actions ou d'options de sélection.

## Usage

- Proposer des actions supplémentaires via un bouton « Plus » ou un bouton icône
- Offrir une liste de choix (navigation, tri, paramètres)
- Permettre des sélections multiples via checkbox items
- Permettre un choix exclusif via radio items
- Organiser des actions complexes avec sous-menus et groupes

## Contraintes

- Ne pas utiliser pour les menus contextuels au clic droit — préférer `ContextMenu`
- Ne pas utiliser pour la navigation principale — préférer une barre de navigation dédiée
- Un seul DropdownMenu ouvert à la fois
- Les items `disabled` restent visibles mais non interactifs (`opacity-50`, `pointer-events-none`)
- La largeur du contenu s'adapte à celle du trigger par défaut (`w-(--radix-dropdown-menu-trigger-width)`)

## Dépendances

- `DropdownMenu` de `radix-ui` (primitives Root, Trigger, Portal, Content, Item, CheckboxItem, RadioItem, RadioGroup, Label, Separator, Sub, SubTrigger, SubContent, Group)
- `@phosphor-icons/react` — icônes `CheckIcon` (indicateur de sélection) et `CaretRightIcon` (sous-menu)

## Anatomie

| Slot                                                | Rôle                                         |
| --------------------------------------------------- | -------------------------------------------- |
| `data-slot="dropdown-menu"`                         | Racine du composant                          |
| `data-slot="dropdown-menu-trigger"`                 | Bouton déclencheur                           |
| `data-slot="dropdown-menu-portal"`                  | Portail de rendu                             |
| `data-slot="dropdown-menu-content"`                 | Conteneur du menu flottant                   |
| `data-slot="dropdown-menu-item"`                    | Élément d'action simple                      |
| `data-slot="dropdown-menu-checkbox-item"`           | Élément avec case à cocher                   |
| `data-slot="dropdown-menu-checkbox-item-indicator"` | Indicateur visuel de la case cochée          |
| `data-slot="dropdown-menu-radio-item"`              | Élément avec bouton radio                    |
| `data-slot="dropdown-menu-radio-item-indicator"`    | Indicateur visuel du radio sélectionné       |
| `data-slot="dropdown-menu-radio-group"`             | Groupe de radio items                        |
| `data-slot="dropdown-menu-group"`                   | Groupe logique d'items                       |
| `data-slot="dropdown-menu-label"`                   | Libellé de section                           |
| `data-slot="dropdown-menu-separator"`               | Séparateur visuel entre groupes              |
| `data-slot="dropdown-menu-shortcut"`                | Raccourci clavier affiché à droite           |
| `data-slot="dropdown-menu-sub"`                     | Conteneur de sous-menu                       |
| `data-slot="dropdown-menu-sub-trigger"`             | Déclencheur de sous-menu (avec icône flèche) |
| `data-slot="dropdown-menu-sub-content"`             | Contenu du sous-menu                         |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                          | Classes et variables                                                        | Où                                                                                                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color.background.elevated`    | `bg-popover`                                                                | `DropdownMenuContent` · `DropdownMenuSubContent`                                                                                                                                 |
| `color.background.subtle`      | `bg-accent`                                                                 | `DropdownMenuCheckboxItem` · `DropdownMenuItem` · `DropdownMenuRadioItem` · `DropdownMenuSubTrigger`                                                                             |
| `color.border.default`         | `bg-border`                                                                 | `DropdownMenuSeparator`                                                                                                                                                          |
| `color.feedback.error.default` | `bg-destructive/10` · `bg-destructive/20` · `text-destructive`              | `DropdownMenuItem`                                                                                                                                                               |
| `color.text.default`           | `ring-foreground/10` · `text-accent-foreground` · `text-popover-foreground` | `DropdownMenuCheckboxItem` · `DropdownMenuContent` · `DropdownMenuItem` · `DropdownMenuRadioItem` · `DropdownMenuShortcut` · `DropdownMenuSubContent` · `DropdownMenuSubTrigger` |
| `color.text.subtle`            | `text-muted-foreground`                                                     | `DropdownMenuLabel` · `DropdownMenuShortcut`                                                                                                                                     |
| `elevation.lg`                 | `shadow-lg`                                                                 | `DropdownMenuSubContent`                                                                                                                                                         |
| `elevation.md`                 | `shadow-md`                                                                 | `DropdownMenuContent`                                                                                                                                                            |
| `motion.duration.fast`         | `duration-fast`                                                             | `DropdownMenuContent` · `DropdownMenuSubContent`                                                                                                                                 |
| `typography.size.xs`           | `text-xs`                                                                   | `DropdownMenuCheckboxItem` · `DropdownMenuItem` · `DropdownMenuLabel` · `DropdownMenuRadioItem` · `DropdownMenuShortcut` · `DropdownMenuSubTrigger`                              |
| `zindex.popover`               | `z-popover`                                                                 | `DropdownMenuContent` · `DropdownMenuSubContent`                                                                                                                                 |

Relevé dans `components/ui/dropdown-menu.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

| Prop         | Type                           | Défaut      | Description                                                                          |
| ------------ | ------------------------------ | ----------- | ------------------------------------------------------------------------------------ |
| `align`      | `"start" \| "center" \| "end"` | `"start"`   | Alignement du menu par rapport au trigger (sur `DropdownMenuContent`)                |
| `sideOffset` | `number`                       | `4`         | Espacement en px entre le trigger et le menu (sur `DropdownMenuContent`)             |
| `inset`      | `boolean`                      | `undefined` | Padding gauche supplémentaire (sur Item, CheckboxItem, RadioItem, Label, SubTrigger) |
| `variant`    | `"default" \| "destructive"`   | `"default"` | Variante visuelle de l'item (sur `DropdownMenuItem`)                                 |
| `checked`    | `boolean`                      | `undefined` | État coché d'un CheckboxItem                                                         |
| `className`  | `string`                       | —           | Classes CSS additionnelles (sur chaque sous-composant)                               |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                               |
| -------- | ------------------------------------------------------------------------- |
| default  | Menu fermé, trigger en attente de clic                                    |
| open     | Menu affiché avec animation `fade-in` + `zoom-in-95` + slide directionnel |
| focus    | Item surligné avec `bg-accent` et `text-accent-foreground`                |
| active   | Item en cours de sélection                                                |
| disabled | Item grisé (`opacity-50`, `pointer-events-none`)                          |

## Accessibilité

**Pattern** : [Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) (Radix DropdownMenu)

**Rôle** : Déclencheur avec `aria-haspopup="menu"` et `aria-expanded` ; `role="menu"` et `menuitem` / `menuitemcheckbox` / `menuitemradio`.

**Clavier** :

| Touche                          | Action                                          |
| ------------------------------- | ----------------------------------------------- |
| `Enter` / `Space` / `ArrowDown` | Ouvre le menu (focus sur le premier élément)    |
| `ArrowDown` / `ArrowUp`         | Élément suivant / précédent                     |
| `Home` / `End`                  | Premier / dernier élément                       |
| `ArrowRight` / `ArrowLeft`      | Ouvre / ferme un sous-menu                      |
| `Enter` / `Space`               | Active l'élément                                |
| `Escape`                        | Ferme le menu et rend le focus au déclencheur   |
| Saisie                          | Va à l'élément qui commence par la lettre tapée |

**Nom accessible** : Le déclencheur doit être nommé ; un déclencheur icône seule (« … ») exige un `aria-label` (« Actions de la ligne »).

**Vigilance** :

- Un menu contient des actions, pas de la navigation de site : pour des liens de navigation, utiliser `NavigationMenu`.
- Les raccourcis affichés (`DropdownMenuShortcut`) doivent réellement fonctionner.

## Exemple de code

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default function Example() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profil</DropdownMenuItem>
        <DropdownMenuItem>Paramètres</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Déconnexion</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Références croisées

- `ContextMenu` — menu déclenché par un clic droit au lieu d'un clic gauche
- `Popover` — contenu flottant plus riche qu'un simple menu d'actions
- `Button` — souvent utilisé comme trigger du menu
