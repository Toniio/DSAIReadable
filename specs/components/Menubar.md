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

- **MUST NOT** — servir de navigation de site → utiliser `NavigationMenu`
- **MUST NOT** — imbriquer plus de 2 niveaux de sous-menus
- **Note** — un item `disabled` est atténué (`opacity-disabled`) et non interactif (`pointer-events-none`)
- **MUST** — réserver `variant="destructive"` de `MenubarItem` aux actions irréversibles
- **MUST** — brancher un handler réel pour chaque raccourci affiché par `MenubarShortcut`

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

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                           | Classes et variables                                                        | Où                                                                                                                                            |
| ------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `border-width.default`          | `border`                                                                    | `Menubar`                                                                                                                                     |
| `color.background.elevated`     | `bg-popover`                                                                | `MenubarContent` · `MenubarSubContent`                                                                                                        |
| `color.background.subtle`       | `bg-accent` · `bg-muted`                                                    | `MenubarCheckboxItem` · `MenubarItem` · `MenubarRadioItem` · `MenubarSubTrigger` · `MenubarTrigger`                                           |
| `color.border.default`          | `bg-border`                                                                 | `MenubarSeparator`                                                                                                                            |
| `color.border.focus`            | `border-ring` · `ring-ring/50`                                              | `MenubarTrigger` via `FOCUS_RING` (`lib/focus.ts`)                                                                                            |
| `color.feedback.error.default`  | `bg-destructive/10` · `bg-destructive/20` · `text-destructive`              | `MenubarItem`                                                                                                                                 |
| `color.text.default`            | `ring-foreground/10` · `text-accent-foreground` · `text-popover-foreground` | `MenubarCheckboxItem` · `MenubarContent` · `MenubarItem` · `MenubarRadioItem` · `MenubarShortcut` · `MenubarSubContent` · `MenubarSubTrigger` |
| `color.text.subtle`             | `text-muted-foreground`                                                     | `MenubarShortcut`                                                                                                                             |
| `elevation.lg`                  | `shadow-lg`                                                                 | `MenubarSubContent`                                                                                                                           |
| `elevation.md`                  | `shadow-md`                                                                 | `MenubarContent`                                                                                                                              |
| `motion.duration.fast`          | `duration-fast`                                                             | `MenubarContent` · `MenubarSubContent`                                                                                                        |
| `opacity.disabled`              | `opacity-disabled`                                                          | `MenubarItem` · `MenubarRadioItem`                                                                                                            |
| `space.focus-ring-width`        | `ring-(length:--space-focus-ring-width)`                                    | `MenubarTrigger` via `FOCUS_RING` (`lib/focus.ts`)                                                                                            |
| `typography.font-weight.medium` | `font-medium`                                                               | `MenubarTrigger`                                                                                                                              |
| `typography.size.xs`            | `text-xs`                                                                   | `MenubarCheckboxItem` · `MenubarItem` · `MenubarLabel` · `MenubarRadioItem` · `MenubarShortcut` · `MenubarSubTrigger` · `MenubarTrigger`      |
| `zindex.popover`                | `z-popover`                                                                 | `MenubarContent` · `MenubarSubContent`                                                                                                        |

Relevé dans `components/ui/menubar.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Menubar`

Rend `MenubarPrimitive.Root`.

| Prop        | Type                                                 | Défaut | Description                              |
| ----------- | ---------------------------------------------------- | ------ | ---------------------------------------- |
| `className` | `string`                                             | —      | Classes CSS additionnelles sur la racine |
| `...props`  | `React.ComponentProps<typeof MenubarPrimitive.Root>` | —      | Props de `MenubarPrimitive.Root`         |

### `MenubarPortal`

Rend `MenubarPrimitive.Portal`.

| Prop       | Type                                                   | Défaut | Description                        |
| ---------- | ------------------------------------------------------ | ------ | ---------------------------------- |
| `...props` | `React.ComponentProps<typeof MenubarPrimitive.Portal>` | —      | Props de `MenubarPrimitive.Portal` |

### `MenubarMenu`

Rend `MenubarPrimitive.Menu`.

| Prop       | Type                                                 | Défaut | Description                      |
| ---------- | ---------------------------------------------------- | ------ | -------------------------------- |
| `...props` | `React.ComponentProps<typeof MenubarPrimitive.Menu>` | —      | Props de `MenubarPrimitive.Menu` |

### `MenubarTrigger`

Rend `MenubarPrimitive.Trigger`.

| Prop       | Type                                                    | Défaut | Description                         |
| ---------- | ------------------------------------------------------- | ------ | ----------------------------------- |
| `...props` | `React.ComponentProps<typeof MenubarPrimitive.Trigger>` | —      | Props de `MenubarPrimitive.Trigger` |

### `MenubarContent`

Rend `MenubarPrimitive.Content`.

| Prop          | Type                                                    | Défaut    | Description                                  |
| ------------- | ------------------------------------------------------- | --------- | -------------------------------------------- |
| `align`       | `"center" \| "end" \| "start"`                          | `"start"` | Alignement du contenu par rapport au trigger |
| `sideOffset`  | `number`                                                | `8`       | Décalage latéral du contenu                  |
| `alignOffset` | `number`                                                | `-4`      | Décalage d'alignement du contenu             |
| `...props`    | `React.ComponentProps<typeof MenubarPrimitive.Content>` | —         | Props de `MenubarPrimitive.Content`          |

### `MenubarGroup`

Rend `MenubarPrimitive.Group`.

| Prop       | Type                                                  | Défaut | Description                       |
| ---------- | ----------------------------------------------------- | ------ | --------------------------------- |
| `...props` | `React.ComponentProps<typeof MenubarPrimitive.Group>` | —      | Props de `MenubarPrimitive.Group` |

### `MenubarSeparator`

Rend `MenubarPrimitive.Separator`.

| Prop       | Type                                                      | Défaut | Description                           |
| ---------- | --------------------------------------------------------- | ------ | ------------------------------------- |
| `...props` | `React.ComponentProps<typeof MenubarPrimitive.Separator>` | —      | Props de `MenubarPrimitive.Separator` |

### `MenubarLabel`

Rend `MenubarPrimitive.Label`.

| Prop       | Type                                                  | Défaut | Description                                                                                                              |
| ---------- | ----------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| `inset`    | `boolean`                                             | —      | Ajoute un padding gauche pour aligner avec les items à indicateur (sur Item, CheckboxItem, RadioItem, Label, SubTrigger) |
| `...props` | `React.ComponentProps<typeof MenubarPrimitive.Label>` | —      | Props de `MenubarPrimitive.Label`                                                                                        |

### `MenubarItem`

Rend `MenubarPrimitive.Item`.

| Prop       | Type                                                 | Défaut      | Description                                                                                |
| ---------- | ---------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `inset`    | `boolean`                                            | —           | Ajoute un retrait à gauche, pour aligner le texte sur celui des éléments qui ont une icône |
| `variant`  | `"default" \| "destructive"`                         | `"default"` | Variante visuelle de `MenubarItem`                                                         |
| `...props` | `React.ComponentProps<typeof MenubarPrimitive.Item>` | —           | Props de `MenubarPrimitive.Item`                                                           |

### `MenubarShortcut`

Rend `<span>`.

| Prop       | Type                           | Défaut | Description               |
| ---------- | ------------------------------ | ------ | ------------------------- |
| `...props` | `React.ComponentProps<"span">` | —      | Props natives de `<span>` |

### `MenubarCheckboxItem`

Rend `MenubarPrimitive.CheckboxItem`.

| Prop       | Type                                                         | Défaut | Description                                                                                |
| ---------- | ------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------ |
| `inset`    | `boolean`                                                    | —      | Ajoute un retrait à gauche, pour aligner le texte sur celui des éléments qui ont une icône |
| `checked`  | `CheckedState`                                               | —      | État coché de `MenubarCheckboxItem`                                                        |
| `...props` | `React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>` | —      | Props de `MenubarPrimitive.CheckboxItem`                                                   |

### `MenubarRadioGroup`

Rend `MenubarPrimitive.RadioGroup`.

| Prop       | Type                                                       | Défaut | Description                            |
| ---------- | ---------------------------------------------------------- | ------ | -------------------------------------- |
| `...props` | `React.ComponentProps<typeof MenubarPrimitive.RadioGroup>` | —      | Props de `MenubarPrimitive.RadioGroup` |

### `MenubarRadioItem`

Rend `MenubarPrimitive.RadioItem`.

| Prop       | Type                                                      | Défaut | Description                                                                                |
| ---------- | --------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| `inset`    | `boolean`                                                 | —      | Ajoute un retrait à gauche, pour aligner le texte sur celui des éléments qui ont une icône |
| `...props` | `React.ComponentProps<typeof MenubarPrimitive.RadioItem>` | —      | Props de `MenubarPrimitive.RadioItem`                                                      |

### `MenubarSub`

Rend `MenubarPrimitive.Sub`.

| Prop       | Type                                                | Défaut | Description                     |
| ---------- | --------------------------------------------------- | ------ | ------------------------------- |
| `...props` | `React.ComponentProps<typeof MenubarPrimitive.Sub>` | —      | Props de `MenubarPrimitive.Sub` |

### `MenubarSubTrigger`

Rend `MenubarPrimitive.SubTrigger`.

| Prop       | Type                                                       | Défaut | Description                                                                                |
| ---------- | ---------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| `inset`    | `boolean`                                                  | —      | Ajoute un retrait à gauche, pour aligner le texte sur celui des éléments qui ont une icône |
| `...props` | `React.ComponentProps<typeof MenubarPrimitive.SubTrigger>` | —      | Props de `MenubarPrimitive.SubTrigger`                                                     |

### `MenubarSubContent`

Rend `MenubarPrimitive.SubContent`.

| Prop       | Type                                                       | Défaut | Description                            |
| ---------- | ---------------------------------------------------------- | ------ | -------------------------------------- |
| `...props` | `React.ComponentProps<typeof MenubarPrimitive.SubContent>` | —      | Props de `MenubarPrimitive.SubContent` |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                        |
| -------- | ------------------------------------------------------------------ |
| default  | Barre avec bordure, triggers au repos                              |
| hover    | Fond `bg-muted` sur le trigger survolé                             |
| focus    | Fond `bg-accent`, texte `accent-foreground` sur l'item focalisé    |
| active   | Trigger expanded avec fond `bg-muted`, menu ouvert avec animation  |
| disabled | `pointer-events-none`, `opacity-disabled` sur les items désactivés |

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
