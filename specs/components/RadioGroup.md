# RadioGroup

## Metadata

| Champ         | Valeur                        |
| ------------- | ----------------------------- |
| Nom           | RadioGroup                    |
| Catégorie     | Forms                         |
| Statut        | stable                        |
| figma_node_id |                               |
| code_path     | components/ui/radio-group.tsx |

## Rôle

Groupe de boutons radio permettant la sélection exclusive d'une seule option parmi plusieurs choix.

## Usage

- Choix exclusif entre 2 à 6 options dans un formulaire
- Sélection de préférence (ex. : mode de livraison, fréquence)
- Choix binaire explicite nécessitant la visibilité de toutes les options (vs. Switch)
- Configuration de paramètres avec options mutuellement exclusives

## Contraintes

- Ne pas utiliser pour plus de 6 options — préférer `Select` ou `Combobox`
- Toujours associer chaque `RadioGroupItem` à un `<Label>` pour l'accessibilité
- Ne pas utiliser pour des choix multiples — préférer `Checkbox`
- La zone de clic étendue (`after:absolute after:-inset-x-3 after:-inset-y-2`) est déjà intégrée — ne pas ajouter de padding supplémentaire
- Requiert un conteneur `"use client"` (composant client-side)

## Dépendances

- `radix-ui` — `RadioGroup` primitive (Root, Item, Indicator)

## Anatomie

| Slot                                | Rôle                                              |
| ----------------------------------- | ------------------------------------------------- |
| `data-slot="radio-group"`           | Racine du groupe, grille avec gap entre les items |
| `data-slot="radio-group-item"`      | Bouton radio individuel (cercle avec indicateur)  |
| `data-slot="radio-group-indicator"` | Indicateur visuel de sélection (point central)    |

## Tokens utilisés

| Token                        | Usage                                                                  |
| ---------------------------- | ---------------------------------------------------------------------- |
| `--color-input`              | Bordure du radio non coché (`border-input`), fond dark (`bg-input/30`) |
| `--color-primary`            | Fond et bordure du radio coché (`bg-primary`, `border-primary`)        |
| `--color-primary-foreground` | Point indicateur de sélection (`bg-primary-foreground`)                |
| `--color-ring`               | Anneau de focus (`ring-ring/50`, `border-ring`)                        |
| `--color-destructive`        | Bordure et anneau erreur (`border-destructive`, `ring-destructive/20`) |

## Props / API

| Prop               | Type                                                    | Défaut  | Description                              |
| ------------------ | ------------------------------------------------------- | ------- | ---------------------------------------- |
| **RadioGroup**     |                                                         |         |                                          |
| `className`        | `string`                                                | —       | Classes CSS additionnelles               |
| `value`            | `string`                                                | —       | Valeur contrôlée du radio sélectionné    |
| `defaultValue`     | `string`                                                | —       | Valeur par défaut (non contrôlé)         |
| `onValueChange`    | `(value: string) => void`                               | —       | Callback de changement de valeur         |
| `disabled`         | `boolean`                                               | `false` | Désactive tous les radios du groupe      |
| `...props`         | `React.ComponentProps<typeof RadioGroupPrimitive.Root>` | —       | Props Radix RadioGroup.Root              |
| **RadioGroupItem** |                                                         |         |                                          |
| `value`            | `string`                                                | —       | Valeur associée à ce radio (obligatoire) |
| `className`        | `string`                                                | —       | Classes CSS additionnelles               |
| `...props`         | `React.ComponentProps<typeof RadioGroupPrimitive.Item>` | —       | Props Radix RadioGroup.Item              |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                                         |
| -------- | ----------------------------------------------------------------------------------- |
| default  | Cercle avec bordure `input`, fond transparent                                       |
| hover    | — (pas de style hover spécifique, zone de clic étendue)                             |
| focus    | Bordure `ring` + anneau `ring-ring/50` (3px) via `focus-visible`                    |
| active   | Sélectionné : fond `primary`, bordure `primary`, point central `primary-foreground` |
| disabled | `cursor-not-allowed`, opacité réduite (`opacity-50`)                                |
| error    | Bordure `destructive`, anneau `ring-destructive/20` (3px) via `aria-invalid`        |

## Accessibilité

**Pattern** : [Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) (Radix RadioGroup)

**Rôle** : `role="radiogroup"` ; chaque option `role="radio"` avec `aria-checked`.

**Clavier** :

| Touche                     | Action                                   |
| -------------------------- | ---------------------------------------- |
| `Tab`                      | Entre dans le groupe sur l'option cochée |
| `ArrowDown` / `ArrowRight` | Option suivante, cochée                  |
| `ArrowUp` / `ArrowLeft`    | Option précédente, cochée                |
| `Space`                    | Coche l'option focalisée                 |

**Nom accessible** : Chaque option a un `Label` associé ; le groupe se nomme par une légende (`FieldLegend`) ou `aria-label`.

**Vigilance** :

- Un seul arrêt de tabulation pour tout le groupe : ne pas s'étonner que `Tab` saute les autres options.

## Exemple de code

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function Example() {
  return (
    <RadioGroup defaultValue="standard">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="standard" id="standard" />
        <Label htmlFor="standard">Standard</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="express" id="express" />
        <Label htmlFor="express">Express</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="prioritaire" id="prioritaire" />
        <Label htmlFor="prioritaire">Prioritaire</Label>
      </div>
    </RadioGroup>
  )
}
```

## Références croisées

- `Label` — associé à chaque `RadioGroupItem` pour l'accessibilité
- `Field` — encapsule le groupe avec label global et messages d'erreur
- `Select` — alternative pour un grand nombre d'options
- `Switch` — alternative pour un choix binaire on/off
- `Checkbox` — alternative pour des choix multiples
