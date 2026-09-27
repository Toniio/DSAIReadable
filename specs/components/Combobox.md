# Combobox

## Metadata

| Champ         | Valeur                     |
| ------------- | -------------------------- |
| Nom           | Combobox                   |
| Catégorie     | Forms                      |
| Statut        | stable                     |
| figma_node_id |                            |
| code_path     | components/ui/combobox.tsx |

## Rôle

Champ de saisie avec auto-complétion et sélection parmi une liste d'options filtrable, supportant la sélection simple et multiple (chips).

## Usage

- Sélectionner une valeur parmi une longue liste (ex. : pays, villes)
- Recherche et filtrage en temps réel dans un jeu de données
- Sélection multiple avec affichage sous forme de chips
- Remplacement d'un `<select>` natif lorsqu'une recherche est nécessaire
- Formulaires nécessitant une saisie assistée (auto-complétion)

## Contraintes

- Ne pas utiliser pour des listes courtes (< 5 options) — préférer `Select` ou `NativeSelect`
- L'option vide (`ComboboxEmpty`) doit toujours être fournie pour le cas « aucun résultat »
- En mode multi-sélection, fournir un `anchor` pour le positionnement du popup par rapport aux chips
- Les éléments `ComboboxItem` doivent avoir une valeur unique pour le bon fonctionnement de l'indicateur de sélection
- Requiert un conteneur `"use client"` (composant client-side)
- Les trois boutons icon-only (trigger, clear, remove de chip) ont un nom accessible par défaut en anglais ; le traduire via `triggerLabel`, `clearLabel` et `removeLabel` plutôt que de le laisser vide

## Dépendances

- `@base-ui/react` — `Combobox` primitive (Root, Value, Trigger, Clear, Input, Popup, Positioner, Portal, List, Item, ItemIndicator, Group, GroupLabel, Collection, Empty, Separator, Chips, Chip, ChipRemove)
- `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupInput` de `@/components/ui/input-group`
- `Button` de `@/components/ui/button`
- `@phosphor-icons/react` — `CaretDownIcon`, `XIcon`, `CheckIcon`

## Anatomie

| Slot                               | Rôle                                       |
| ---------------------------------- | ------------------------------------------ |
| `data-slot="combobox-value"`       | Affiche la valeur sélectionnée             |
| `data-slot="combobox-trigger"`     | Bouton déclencheur d'ouverture du popup    |
| `data-slot="combobox-clear"`       | Bouton de réinitialisation de la sélection |
| `data-slot="combobox-content"`     | Conteneur popup des options                |
| `data-slot="combobox-list"`        | Liste scrollable des options               |
| `data-slot="combobox-item"`        | Option individuelle                        |
| `data-slot="combobox-group"`       | Groupe logique d'options                   |
| `data-slot="combobox-label"`       | Label d'un groupe d'options                |
| `data-slot="combobox-collection"`  | Collection de données                      |
| `data-slot="combobox-empty"`       | Message affiché quand aucun résultat       |
| `data-slot="combobox-separator"`   | Séparateur visuel entre groupes            |
| `data-slot="combobox-chips"`       | Conteneur des chips (multi-sélection)      |
| `data-slot="combobox-chip"`        | Chip individuelle (valeur sélectionnée)    |
| `data-slot="combobox-chip-remove"` | Bouton de suppression d'une chip           |
| `data-slot="combobox-chip-input"`  | Champ de saisie intégré aux chips          |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                           | Classes et variables                                                                            | Où                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `border-width.default`          | `border`                                                                                        | `ComboboxChips`                                                                       |
| `color.background.elevated`     | `bg-popover`                                                                                    | `ComboboxContent`                                                                     |
| `color.background.subtle`       | `bg-accent` · `bg-muted`                                                                        | `ComboboxChip` · `ComboboxItem`                                                       |
| `color.border.default`          | `bg-border`                                                                                     | `ComboboxSeparator`                                                                   |
| `color.border.focus`            | `border-ring` · `ring-ring/50`                                                                  | `ComboboxChips` via `FOCUS_RING_WITHIN` (`lib/focus.ts`)                              |
| `color.border.input`            | `bg-input/30` · `border-input` · `border-input/30`                                              | `ComboboxChips` · `ComboboxContent`                                                   |
| `color.feedback.error.default`  | `border-destructive` · `border-destructive/50` · `ring-destructive/20` · `ring-destructive/40`  | `ComboboxChips`                                                                       |
| `color.text.default`            | `ring-foreground/10` · `text-accent-foreground` · `text-foreground` · `text-popover-foreground` | `ComboboxChip` · `ComboboxContent` · `ComboboxItem`                                   |
| `color.text.subtle`             | `text-muted-foreground`                                                                         | `ComboboxEmpty` · `ComboboxLabel` · `ComboboxTrigger`                                 |
| `elevation.md`                  | `shadow-md`                                                                                     | `ComboboxContent`                                                                     |
| `motion.duration.fast`          | `duration-fast`                                                                                 | `ComboboxContent`                                                                     |
| `space.focus-ring-width`        | `ring-(length:--space-focus-ring-width)`                                                        | `ComboboxChips` · `ComboboxChips` via `FOCUS_RING_WITHIN` (`lib/focus.ts`)            |
| `typography.font-weight.medium` | `font-medium`                                                                                   | `ComboboxChip`                                                                        |
| `typography.size.xs`            | `text-xs`                                                                                       | `ComboboxChip` · `ComboboxChips` · `ComboboxEmpty` · `ComboboxItem` · `ComboboxLabel` |
| `zindex.popover`                | `z-popover`                                                                                     | `ComboboxContent`                                                                     |

Relevé dans `components/ui/combobox.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

Compose `Button`, `InputGroup` : les tokens de ces composants sont listés dans leurs specs.

## Props / API

| Prop                | Type                                     | Défaut              | Description                                                                |
| ------------------- | ---------------------------------------- | ------------------- | -------------------------------------------------------------------------- |
| `Combobox`          | `ComboboxPrimitive.Root.Props`           | —                   | Racine du composant, gère l'état ouvert/fermé et la valeur                 |
| **ComboboxInput**   |                                          |                     |                                                                            |
| `showTrigger`       | `boolean`                                | `true`              | Affiche le bouton chevron pour ouvrir le popup                             |
| `showClear`         | `boolean`                                | `false`             | Affiche le bouton de réinitialisation                                      |
| `triggerLabel`      | `string`                                 | `"Open list"`       | Nom accessible du bouton chevron, transmis à `ComboboxTrigger`             |
| `clearLabel`        | `string`                                 | `"Clear selection"` | Nom accessible du bouton de réinitialisation, transmis à `ComboboxClear`   |
| `disabled`          | `boolean`                                | `false`             | Désactive le champ de saisie                                               |
| `className`         | `string`                                 | —                   | Classes CSS additionnelles                                                 |
| **ComboboxContent** |                                          |                     |                                                                            |
| `side`              | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"`          | Côté d'affichage du popup                                                  |
| `sideOffset`        | `number`                                 | `6`                 | Décalage par rapport au trigger                                            |
| `align`             | `"start" \| "center" \| "end"`           | `"start"`           | Alignement du popup                                                        |
| `alignOffset`       | `number`                                 | `0`                 | Décalage d'alignement                                                      |
| `anchor`            | `HTMLElement \| null`                    | —                   | Élément d'ancrage (pour mode chips)                                        |
| **ComboboxTrigger** |                                          |                     |                                                                            |
| `triggerLabel`      | `string`                                 | `"Open list"`       | `aria-label` appliqué uniquement quand le trigger n'a pas d'enfant visible |
| **ComboboxClear**   |                                          |                     |                                                                            |
| `clearLabel`        | `string`                                 | `"Clear selection"` | `aria-label` du bouton de réinitialisation                                 |
| **ComboboxChip**    |                                          |                     |                                                                            |
| `showRemove`        | `boolean`                                | `true`              | Affiche le bouton de suppression de la chip                                |
| `removeLabel`       | `string`                                 | `"Remove"`          | `aria-label` du bouton de suppression de la chip                           |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                                 |
| -------- | --------------------------------------------------------------------------- |
| default  | Champ de saisie avec bordure `input`, fond transparent                      |
| hover    | Fond de l'option candidate passe en `accent`                                |
| focus    | Anneau `ring-ring/50` et bordure `border-ring` sur le conteneur chips/input |
| active   | Popup ouvert avec animation `fade-in` + `zoom-in-95`                        |
| disabled | Opacité réduite (`opacity-50`), `pointer-events-none`                       |
| error    | Bordure `destructive`, anneau `ring-destructive/20` via `aria-invalid`      |

## Accessibilité

**Pattern** : [Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) avec liste (Base UI)

**Rôle** : Champ `role="combobox"` relié à une `listbox` ; `aria-expanded` sur le champ, `aria-selected` sur l'option active.

**Clavier** :

| Touche                  | Action                                       |
| ----------------------- | -------------------------------------------- |
| `ArrowDown` / `ArrowUp` | Ouvre la liste, option suivante / précédente |
| `Enter`                 | Sélectionne l'option active                  |
| `Escape`                | Ferme la liste                               |
| Saisie                  | Filtre les options                           |

**Nom accessible** : Un `Label` associé au champ est obligatoire. Les boutons icône (effacer, retirer un élément) sont nommés par `clearLabel` / `removeLabel` (défauts dans `UI_STRINGS`).

**Vigilance** :

- Le nombre de résultats n'est pas annoncé automatiquement : ajouter un message `aria-live` si la liste filtrée change fortement.

## Exemple de code

```tsx
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"

const fruits = [
  { value: "pomme", label: "Pomme" },
  { value: "banane", label: "Banane" },
  { value: "cerise", label: "Cerise" },
]

export default function Example() {
  return (
    <Combobox>
      <ComboboxInput placeholder="Rechercher un fruit…" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>Aucun résultat</ComboboxEmpty>
          {fruits.map((fruit) => (
            <ComboboxItem key={fruit.value} value={fruit.value}>
              {fruit.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
```

## Références croisées

- `InputGroup` — utilisé en interne pour structurer le champ de saisie
- `Button` — utilisé pour le bouton de suppression des chips
- `Select` — alternative sans recherche pour les listes courtes
- `Command` — alternative pour les palettes de commandes
