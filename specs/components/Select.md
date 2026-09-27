# Select

## Metadata

| Champ         | Valeur                   |
| ------------- | ------------------------ |
| Nom           | Select                   |
| Catégorie     | Forms                    |
| Statut        | stable                   |
| figma_node_id |                          |
| code_path     | components/ui/select.tsx |

## Rôle

Menu déroulant stylisé basé sur Radix pour la sélection d'une option parmi une liste, avec support du positionnement automatique et des groupes.

## Usage

- Sélection d'une valeur dans un formulaire (ex. : catégorie, rôle, statut)
- Liste déroulante avec groupes d'options et séparateurs
- Alternative stylisée au `<select>` natif avec contrôle total du rendu
- Sélection nécessitant des icônes ou du contenu riche dans les options

## Contraintes

- Ne pas utiliser si une recherche/filtrage est nécessaire — préférer `Combobox`
- Pour les formulaires mobiles avec de nombreuses options, `NativeSelect` offre une meilleure UX native
- Le contenu est rendu dans un `Portal` — attention au contexte de z-index
- Chaque `SelectItem` doit avoir une `value` unique
- Requiert un conteneur `"use client"` (composant client-side)

## Dépendances

- `radix-ui` — `Select` primitive (Root, Group, Value, Trigger, Content, Portal, Viewport, Label, Item, ItemText, ItemIndicator, Separator, ScrollUpButton, ScrollDownButton, Icon)
- `@phosphor-icons/react` — `CaretDownIcon`, `CheckIcon`, `CaretUpIcon`

## Anatomie

| Slot                                    | Rôle                                                   |
| --------------------------------------- | ------------------------------------------------------ |
| `data-slot="select"`                    | Racine du composant Select (état ouvert/fermé, valeur) |
| `data-slot="select-trigger"`            | Bouton déclencheur affichant la valeur sélectionnée    |
| `data-slot="select-value"`              | Texte de la valeur sélectionnée dans le trigger        |
| `data-slot="select-content"`            | Conteneur popup des options (portail)                  |
| `data-slot="select-group"`              | Groupe logique d'options                               |
| `data-slot="select-label"`              | Label d'un groupe d'options                            |
| `data-slot="select-item"`               | Option individuelle avec indicateur de sélection       |
| `data-slot="select-separator"`          | Séparateur visuel entre groupes                        |
| `data-slot="select-scroll-up-button"`   | Bouton de défilement vers le haut                      |
| `data-slot="select-scroll-down-button"` | Bouton de défilement vers le bas                       |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                          | Classes et variables                                                                           | Où                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `border-width.default`         | `border`                                                                                       | `SelectTrigger`                                                     |
| `color.background.elevated`    | `bg-popover`                                                                                   | `SelectContent` · `SelectScrollDownButton` · `SelectScrollUpButton` |
| `color.background.subtle`      | `bg-accent`                                                                                    | `SelectItem`                                                        |
| `color.border.default`         | `bg-border`                                                                                    | `SelectSeparator`                                                   |
| `color.border.focus`           | `border-ring` · `ring-ring/50`                                                                 | `SelectTrigger` via `FOCUS_RING` (`lib/focus.ts`)                   |
| `color.border.input`           | `bg-input/30` · `bg-input/50` · `border-input`                                                 | `SelectTrigger`                                                     |
| `color.feedback.error.default` | `border-destructive` · `border-destructive/50` · `ring-destructive/20` · `ring-destructive/40` | `SelectTrigger`                                                     |
| `color.text.default`           | `ring-foreground/10` · `text-accent-foreground` · `text-popover-foreground`                    | `SelectContent` · `SelectItem`                                      |
| `color.text.subtle`            | `text-muted-foreground`                                                                        | `SelectLabel` · `SelectTrigger`                                     |
| `elevation.md`                 | `shadow-md`                                                                                    | `SelectContent`                                                     |
| `motion.duration.fast`         | `duration-fast`                                                                                | `SelectContent`                                                     |
| `space.focus-ring-width`       | `ring-(length:--space-focus-ring-width)`                                                       | `SelectTrigger` · `SelectTrigger` via `FOCUS_RING` (`lib/focus.ts`) |
| `typography.size.xs`           | `text-xs`                                                                                      | `SelectItem` · `SelectLabel` · `SelectTrigger`                      |
| `zindex.dropdown`              | `z-dropdown`                                                                                   | `SelectScrollDownButton` · `SelectScrollUpButton`                   |
| `zindex.popover`               | `z-popover`                                                                                    | `SelectContent`                                                     |

Relevé dans `components/ui/select.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Select`

Rend `SelectPrimitive.Root`.

| Prop       | Type                                                | Défaut | Description                     |
| ---------- | --------------------------------------------------- | ------ | ------------------------------- |
| `...props` | `React.ComponentProps<typeof SelectPrimitive.Root>` | —      | Props de `SelectPrimitive.Root` |

### `SelectContent`

Rend `SelectPrimitive.Content`.

| Prop        | Type                                                   | Défaut           | Description                        |
| ----------- | ------------------------------------------------------ | ---------------- | ---------------------------------- |
| `position`  | `"item-aligned" \| "popper"`                           | `"item-aligned"` | Mode de positionnement du popup    |
| `align`     | `"center" \| "end" \| "start"`                         | `"center"`       | Alignement du contenu              |
| `className` | `string`                                               | —                | Classes CSS additionnelles         |
| `...props`  | `React.ComponentProps<typeof SelectPrimitive.Content>` | —                | Props de `SelectPrimitive.Content` |

### `SelectGroup`

Rend `SelectPrimitive.Group`.

| Prop       | Type                                                 | Défaut | Description                      |
| ---------- | ---------------------------------------------------- | ------ | -------------------------------- |
| `...props` | `React.ComponentProps<typeof SelectPrimitive.Group>` | —      | Props de `SelectPrimitive.Group` |

### `SelectItem`

Rend `SelectPrimitive.Item`.

| Prop        | Type                                                | Défaut | Description                      |
| ----------- | --------------------------------------------------- | ------ | -------------------------------- |
| `value`     | `string`                                            | —      | Valeur de l'option (obligatoire) |
| `className` | `string`                                            | —      | Classes CSS additionnelles       |
| `children`  | `React.ReactNode`                                   | —      | Contenu affiché de l'option      |
| `...props`  | `React.ComponentProps<typeof SelectPrimitive.Item>` | —      | Props de `SelectPrimitive.Item`  |

### `SelectLabel`

Rend `SelectPrimitive.Label`.

| Prop       | Type                                                 | Défaut | Description                      |
| ---------- | ---------------------------------------------------- | ------ | -------------------------------- |
| `...props` | `React.ComponentProps<typeof SelectPrimitive.Label>` | —      | Props de `SelectPrimitive.Label` |

### `SelectScrollDownButton`

Rend `SelectPrimitive.ScrollDownButton`.

| Prop       | Type                                                            | Défaut | Description                                 |
| ---------- | --------------------------------------------------------------- | ------ | ------------------------------------------- |
| `...props` | `React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>` | —      | Props de `SelectPrimitive.ScrollDownButton` |

### `SelectScrollUpButton`

Rend `SelectPrimitive.ScrollUpButton`.

| Prop       | Type                                                          | Défaut | Description                               |
| ---------- | ------------------------------------------------------------- | ------ | ----------------------------------------- |
| `...props` | `React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>` | —      | Props de `SelectPrimitive.ScrollUpButton` |

### `SelectSeparator`

Rend `SelectPrimitive.Separator`.

| Prop       | Type                                                     | Défaut | Description                          |
| ---------- | -------------------------------------------------------- | ------ | ------------------------------------ |
| `...props` | `React.ComponentProps<typeof SelectPrimitive.Separator>` | —      | Props de `SelectPrimitive.Separator` |

### `SelectTrigger`

Rend `SelectPrimitive.Trigger`.

| Prop        | Type                                                   | Défaut      | Description                                      |
| ----------- | ------------------------------------------------------ | ----------- | ------------------------------------------------ |
| `size`      | `"sm" \| "default"`                                    | `"default"` | Taille du trigger (`h-8` default, `h-7` sm)      |
| `className` | `string`                                               | —           | Classes CSS additionnelles                       |
| `children`  | `React.ReactNode`                                      | —           | Contenu du trigger (typiquement `<SelectValue>`) |
| `...props`  | `React.ComponentProps<typeof SelectPrimitive.Trigger>` | —           | Props de `SelectPrimitive.Trigger`               |

### `SelectValue`

Rend `SelectPrimitive.Value`.

| Prop       | Type                                                 | Défaut | Description                      |
| ---------- | ---------------------------------------------------- | ------ | -------------------------------- |
| `...props` | `React.ComponentProps<typeof SelectPrimitive.Value>` | —      | Props de `SelectPrimitive.Value` |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                                       |
| -------- | --------------------------------------------------------------------------------- |
| default  | Trigger avec bordure `input`, fond transparent, texte de la valeur ou placeholder |
| hover    | Fond dark du trigger passe à `bg-input/50`                                        |
| focus    | Bordure `ring` + anneau `ring-ring/50` via `focus-visible` sur le trigger         |
| active   | Popup ouvert avec animation `fade-in` + `zoom-in-95`, item focus en `accent`      |
| disabled | `cursor-not-allowed`, opacité réduite (`opacity-50`) sur le trigger ou l'item     |
| error    | Bordure `destructive`, anneau `ring-destructive/20` via `aria-invalid`            |

## Accessibilité

**Pattern** : [Select-Only Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) (Radix Select)

**Rôle** : Déclencheur `role="combobox"` avec `aria-expanded` ; liste `listbox` d'`option`.

**Clavier** :

| Touche                                      | Action                                         |
| ------------------------------------------- | ---------------------------------------------- |
| `Enter` / `Space` / `ArrowDown` / `ArrowUp` | Ouvre la liste                                 |
| `ArrowDown` / `ArrowUp`                     | Option suivante / précédente                   |
| `Home` / `End`                              | Première / dernière option                     |
| `Enter` / `Space`                           | Sélectionne l'option                           |
| `Escape`                                    | Ferme sans changer                             |
| Saisie                                      | Va à l'option qui commence par la lettre tapée |

**Nom accessible** : Obligatoire : `Label` associé au déclencheur ou `aria-label`.

**Vigilance** :

- Pour une longue liste ou sur mobile, `NativeSelect` est plus accessible.
- La valeur affichée (`SelectValue`) doit rester lisible quand aucune option n'est choisie (placeholder).

## Exemple de code

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select"

export default function Example() {
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Choisir un fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="pomme">Pomme</SelectItem>
          <SelectItem value="banane">Banane</SelectItem>
          <SelectItem value="cerise">Cerise</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
```

## Références croisées

- `NativeSelect` — alternative native plus légère pour les cas simples
- `Combobox` — alternative avec recherche/filtrage intégré
- `Field` — encapsule le select avec label et messages d'erreur
- `RadioGroup` — alternative pour un petit nombre d'options visibles simultanément
