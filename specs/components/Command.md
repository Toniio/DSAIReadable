# Command

## Metadata

| Champ         | Valeur                    |
| ------------- | ------------------------- |
| Nom           | Command                   |
| Catégorie     | Forms                     |
| Statut        | stable                    |
| figma_node_id |                           |
| code_path     | components/ui/command.tsx |

## Rôle

Palette de commandes avec recherche intégrée, permettant de filtrer et sélectionner rapidement une action ou un élément parmi une liste structurée.

## Usage

- Palette de commandes globale accessible via raccourci clavier (⌘K / Ctrl+K)
- Recherche rapide dans une liste d'actions, pages ou éléments
- Menu de sélection avec filtrage en temps réel
- Navigation clavier entre groupes d'options
- Affichage dans un dialog modal via `CommandDialog`

## Contraintes

- Ne pas utiliser pour un simple champ de recherche — préférer un `Input` avec filtrage
- Le composant `CommandEmpty` doit toujours être présent pour le cas « aucun résultat »
- Les raccourcis (`CommandShortcut`) sont informatifs uniquement ; le binding clavier doit être géré séparément
- Requiert un conteneur `"use client"` (composant client-side)
- En mode dialog, les props `title` et `description` sont rendues en `sr-only` pour l'accessibilité

## Dépendances

- `cmdk` — bibliothèque Command primitive
- `Dialog`, `DialogContent`, `DialogDescription`, `DialogHeader`, `DialogTitle` de `@/components/ui/dialog`
- `InputGroup`, `InputGroupAddon` de `@/components/ui/input-group`
- `@phosphor-icons/react` — `MagnifyingGlassIcon`, `CheckIcon`

## Anatomie

| Slot                                | Rôle                                             |
| ----------------------------------- | ------------------------------------------------ |
| `data-slot="command"`               | Racine du composant command                      |
| `data-slot="command-input-wrapper"` | Wrapper du champ de recherche avec bordure basse |
| `data-slot="command-input"`         | Champ de saisie de recherche                     |
| `data-slot="command-list"`          | Liste scrollable des résultats                   |
| `data-slot="command-empty"`         | Message affiché quand aucun résultat             |
| `data-slot="command-group"`         | Groupe logique de commandes                      |
| `data-slot="command-item"`          | Élément de commande individuel                   |
| `data-slot="command-shortcut"`      | Raccourci clavier affiché à droite de l'item     |
| `data-slot="command-separator"`     | Séparateur visuel entre groupes                  |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                       | Classes et variables                          | Où                                                                                   |
| --------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------ |
| `border-width.default`      | `border-b`                                    | `CommandInput`                                                                       |
| `color.background.elevated` | `bg-popover`                                  | `Command`                                                                            |
| `color.background.subtle`   | `bg-muted`                                    | `CommandItem`                                                                        |
| `color.border.default`      | `bg-border`                                   | `CommandSeparator`                                                                   |
| `color.border.input`        | `bg-input/30` · `border-input/30`             | `CommandInput`                                                                       |
| `color.text.default`        | `text-foreground` · `text-popover-foreground` | `CommandGroup` · `CommandItem` · `CommandShortcut` · `Command`                       |
| `color.text.subtle`         | `text-muted-foreground`                       | `CommandGroup` · `CommandShortcut`                                                   |
| `typography.size.xs`        | `text-xs`                                     | `CommandEmpty` · `CommandGroup` · `CommandInput` · `CommandItem` · `CommandShortcut` |

Relevé dans `components/ui/command.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

Compose `Dialog`, `InputGroup` : les tokens de ces composants sont listés dans leurs specs.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Command`

Rend `CommandPrimitive`.

| Prop        | Type                                            | Défaut | Description                              |
| ----------- | ----------------------------------------------- | ------ | ---------------------------------------- |
| `className` | `string`                                        | —      | Classes CSS additionnelles sur la racine |
| `...props`  | `React.ComponentProps<typeof CommandPrimitive>` | —      | Props de `CommandPrimitive`              |

### `CommandDialog`

Rend `Dialog`.

| Prop              | Type                                  | Défaut                             | Description                                |
| ----------------- | ------------------------------------- | ---------------------------------- | ------------------------------------------ |
| `title`           | `string`                              | `"Command Palette"`                | Titre accessible du dialog (sr-only)       |
| `description`     | `string`                              | `"Search for a command to run..."` | Description accessible du dialog (sr-only) |
| `className`       | `string`                              | —                                  | Classes CSS additionnelles sur le contenu  |
| `showCloseButton` | `boolean`                             | `false`                            | Affiche le bouton de fermeture du dialog   |
| `...props`        | `React.ComponentProps<typeof Dialog>` | —                                  | Props de `Dialog`                          |

### `CommandInput`

Rend `CommandPrimitive.Input`, dans un `<div>`.

| Prop        | Type                                                  | Défaut | Description                       |
| ----------- | ----------------------------------------------------- | ------ | --------------------------------- |
| `className` | `string`                                              | —      | Classes CSS additionnelles        |
| `...props`  | `React.ComponentProps<typeof CommandPrimitive.Input>` | —      | Props de `CommandPrimitive.Input` |

### `CommandList`

Rend `CommandPrimitive.List`.

| Prop       | Type                                                 | Défaut | Description                      |
| ---------- | ---------------------------------------------------- | ------ | -------------------------------- |
| `...props` | `React.ComponentProps<typeof CommandPrimitive.List>` | —      | Props de `CommandPrimitive.List` |

### `CommandEmpty`

Rend `CommandPrimitive.Empty`.

| Prop       | Type                                                  | Défaut | Description                       |
| ---------- | ----------------------------------------------------- | ------ | --------------------------------- |
| `...props` | `React.ComponentProps<typeof CommandPrimitive.Empty>` | —      | Props de `CommandPrimitive.Empty` |

### `CommandGroup`

Rend `CommandPrimitive.Group`.

| Prop       | Type                                                  | Défaut | Description                       |
| ---------- | ----------------------------------------------------- | ------ | --------------------------------- |
| `...props` | `React.ComponentProps<typeof CommandPrimitive.Group>` | —      | Props de `CommandPrimitive.Group` |

### `CommandItem`

Rend `CommandPrimitive.Item`.

| Prop       | Type                                                 | Défaut | Description                      |
| ---------- | ---------------------------------------------------- | ------ | -------------------------------- |
| `...props` | `React.ComponentProps<typeof CommandPrimitive.Item>` | —      | Props de `CommandPrimitive.Item` |

### `CommandShortcut`

Rend `<span>`.

| Prop       | Type                           | Défaut | Description               |
| ---------- | ------------------------------ | ------ | ------------------------- |
| `...props` | `React.ComponentProps<"span">` | —      | Props natives de `<span>` |

### `CommandSeparator`

Rend `CommandPrimitive.Separator`.

| Prop       | Type                                                      | Défaut | Description                           |
| ---------- | --------------------------------------------------------- | ------ | ------------------------------------- |
| `...props` | `React.ComponentProps<typeof CommandPrimitive.Separator>` | —      | Props de `CommandPrimitive.Separator` |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                                 |
| -------- | --------------------------------------------------------------------------- |
| default  | Fond `popover`, texte `popover-foreground`, liste scrollable                |
| hover    | — (navigation clavier privilégiée)                                          |
| focus    | Champ de recherche actif, items navigables au clavier                       |
| active   | Item sélectionné avec fond `muted` et texte `foreground`                    |
| disabled | Item grisé (`opacity-50`, `pointer-events-none`) via `data-[disabled=true]` |

## Accessibilité

**Pattern** : [Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) + listbox (cmdk)

**Rôle** : `CommandInput` porte `role="combobox"` ; `CommandList` est une `listbox` d'options (`role="option"`, `aria-selected`).

**Clavier** :

| Touche                  | Action                       |
| ----------------------- | ---------------------------- |
| `ArrowDown` / `ArrowUp` | Option suivante / précédente |
| `Home` / `End`          | Première / dernière option   |
| `Enter`                 | Exécute l'option active      |
| Saisie                  | Filtre                       |

**Nom accessible** : Donner un `placeholder` et un `aria-label` explicites au champ ; `CommandDialog` porte un titre (masqué visuellement) qui nomme le dialogue.

**Vigilance** :

- `CommandEmpty` doit rester textuel : c'est ce qu'entend l'utilisateur quand rien ne correspond.
- Dans `CommandDialog`, `Escape` ferme le dialogue et rend le focus au déclencheur.

## Exemple de code

```tsx
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command"

export default function Example() {
  return (
    <Command>
      <CommandInput placeholder="Rechercher une commande…" />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem>
            Nouveau fichier
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem>
            Rechercher
            <CommandShortcut>⌘F</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem>Accueil</CommandItem>
          <CommandItem>Paramètres</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
```

## Références croisées

- `Dialog` — utilisé en interne par `CommandDialog` pour l'affichage modal
- `InputGroup` — utilisé en interne pour structurer le champ de recherche
- `Combobox` — alternative pour la sélection avec auto-complétion dans un formulaire
- `Select` — alternative pour une sélection simple sans recherche
