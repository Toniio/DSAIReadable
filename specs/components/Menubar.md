# Menubar

## Metadata

| Champ         | Valeur                    |
| ------------- | ------------------------- |
| Nom           | Menubar                   |
| Catégorie     | Navigation                |
| Statut        | stable                    |
| figma_node_id |                           |
| code_path     | components/ui/menubar.tsx |

## Rôle

Barre de menus horizontale offrant un système de menus déroulants avec support des sous-menus, items à cocher, groupes radio et raccourcis clavier.

## Usage

- Barre de menus d'application de type desktop (Fichier, Édition, Affichage…)
- Regrouper des actions et options dans des menus déroulants thématiques
- Proposer des options à cocher ou des sélections exclusives (radio) dans un menu
- Afficher les raccourcis clavier associés aux actions
- Organiser des actions complexes avec des sous-menus imbriqués

## Contraintes

- Ne pas utiliser pour une navigation de site classique — préférer `NavigationMenu`
- Limiter la profondeur des sous-menus à 2 niveaux pour la lisibilité
- Les items `disabled` sont visuellement atténués et non interactifs (`pointer-events-none`)
- La variante `destructive` sur `MenubarItem` doit être réservée aux actions irréversibles
- Les raccourcis affichés via `MenubarShortcut` doivent correspondre à des handlers réels

## Dépendances

- `Menubar` (Root, Menu, Group, Portal, RadioGroup, Trigger, Content, Item, CheckboxItem, RadioItem, ItemIndicator, Label, Separator, Sub, SubTrigger, SubContent) de `radix-ui`
- `CheckIcon`, `CaretRightIcon` de `@phosphor-icons/react`

## Anatomie

| Slot                                | Rôle                                                   |
| ----------------------------------- | ------------------------------------------------------ |
| `data-slot="menubar"`               | Racine de la barre de menus, conteneur flex horizontal |
| `data-slot="menubar-menu"`          | Conteneur d'un menu individuel                         |
| `data-slot="menubar-trigger"`       | Bouton déclencheur d'ouverture d'un menu               |
| `data-slot="menubar-portal"`        | Portail de rendu hors du DOM parent                    |
| `data-slot="menubar-content"`       | Contenu du menu déroulant                              |
| `data-slot="menubar-group"`         | Groupe logique d'items                                 |
| `data-slot="menubar-item"`          | Item d'action dans le menu                             |
| `data-slot="menubar-checkbox-item"` | Item à cocher avec indicateur visuel                   |
| `data-slot="menubar-radio-group"`   | Groupe de sélection exclusive                          |
| `data-slot="menubar-radio-item"`    | Item radio avec indicateur visuel                      |
| `data-slot="menubar-label"`         | Label non interactif pour un groupe                    |
| `data-slot="menubar-separator"`     | Séparateur horizontal entre les groupes                |
| `data-slot="menubar-shortcut"`      | Texte du raccourci clavier associé                     |
| `data-slot="menubar-sub"`           | Conteneur de sous-menu                                 |
| `data-slot="menubar-sub-trigger"`   | Déclencheur de sous-menu avec chevron droit            |
| `data-slot="menubar-sub-content"`   | Contenu du sous-menu                                   |

## Tokens utilisés

| Token                             | Usage                                                                  |
| --------------------------------- | ---------------------------------------------------------------------- |
| `--color-background-muted`        | Fond du trigger au hover/expanded et fond du sub-trigger au focus/open |
| `--color-background-popover`      | Fond du contenu de menu et sous-menu                                   |
| `--color-text-popover-foreground` | Texte du contenu de menu                                               |
| `--color-background-accent`       | Fond de l'item au focus                                                |
| `--color-text-accent-foreground`  | Texte de l'item au focus                                               |
| `--color-text-destructive`        | Texte de l'item en variante `destructive`                              |
| `--color-background-destructive`  | Fond atténué de l'item destructive au focus (10 %/20 %)                |
| `--color-text-muted-foreground`   | Texte du raccourci clavier et des labels                               |
| `--color-border-default`          | Bordure de la barre de menus et séparateurs                            |
| `--color-border-foreground`       | Anneau subtil autour du contenu (`ring-foreground/10`)                 |
| `--opacity-disabled`              | Opacité des items désactivés (50 %)                                    |
| `--duration-fast`                 | Durée des animations d'entrée/sortie du contenu                        |

## Props / API

| Prop          | Type                                       | Défaut      | Description                                                                                                              |
| ------------- | ------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `className`   | `string`                                   | —           | Classes CSS additionnelles sur la racine                                                                                 |
| `inset`       | `boolean`                                  | —           | Ajoute un padding gauche pour aligner avec les items à indicateur (sur Item, CheckboxItem, RadioItem, Label, SubTrigger) |
| `variant`     | `"default" \| "destructive"`               | `"default"` | Variante visuelle de `MenubarItem`                                                                                       |
| `checked`     | `boolean`                                  | —           | État coché de `MenubarCheckboxItem`                                                                                      |
| `align`       | `string`                                   | `"start"`   | Alignement du contenu par rapport au trigger                                                                             |
| `alignOffset` | `number`                                   | `-4`        | Décalage d'alignement du contenu                                                                                         |
| `sideOffset`  | `number`                                   | `8`         | Décalage latéral du contenu                                                                                              |
| `...props`    | `React.ComponentProps<MenubarPrimitive.*>` | —           | Props natives Radix Menubar                                                                                              |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                       |
| -------- | ----------------------------------------------------------------- |
| default  | Barre avec bordure, triggers au repos                             |
| hover    | Fond `bg-muted` sur le trigger survolé                            |
| focus    | Fond `bg-accent`, texte `accent-foreground` sur l'item focalisé   |
| active   | Trigger expanded avec fond `bg-muted`, menu ouvert avec animation |
| disabled | `pointer-events-none`, `opacity-50` sur les items désactivés      |

## Accessibilité

**Pattern** : [Menubar](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) (Radix Menubar)

**Rôle** : `role="menubar"` ; chaque menu est un `menu` avec ses `menuitem`.

**Clavier** :

| Touche                          | Action                                          |
| ------------------------------- | ----------------------------------------------- |
| `ArrowRight` / `ArrowLeft`      | Menu suivant / précédent de la barre            |
| `Enter` / `Space` / `ArrowDown` | Ouvre le menu focalisé                          |
| `ArrowDown` / `ArrowUp`         | Élément suivant / précédent dans un menu ouvert |
| `Escape`                        | Ferme le menu                                   |
| Saisie                          | Va à l'élément qui commence par la lettre tapée |

**Nom accessible** : Le texte de chaque menu et élément.

**Vigilance** :

- Une barre de menus d'application n'est pas une navigation de site : pour des liens, utiliser `NavigationMenu`.
- Un seul arrêt de tabulation pour toute la barre : les flèches font le reste.

## Exemple de code

```tsx
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
} from "@/components/ui/menubar"

export default function Example() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Fichier</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Nouveau <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Ouvrir <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem variant="destructive">Supprimer</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
```

## Références croisées

- `NavigationMenu` — alternative pour la navigation de site (liens, pas d'actions)
- `DropdownMenu` — menu contextuel attaché à un bouton unique
- `ContextMenu` — menu déclenché par clic droit
