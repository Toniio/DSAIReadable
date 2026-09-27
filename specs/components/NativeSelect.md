# NativeSelect

## Metadata

| Champ         | Valeur                          |
| ------------- | ------------------------------- |
| Nom           | NativeSelect                    |
| Catégorie     | Forms                           |
| Statut        | stable                          |
| figma_node_id |                                 |
| code_path     | components/ui/native-select.tsx |

## Rôle

Menu déroulant natif du navigateur, léger et accessible, pour la sélection d'une option parmi une liste.

## Usage

- Sélection simple dans un formulaire avec peu d'options (< 10)
- Formulaires mobiles où le sélecteur natif offre une meilleure UX
- Remplacement léger d'un `Select` Radix quand la personnalisation n'est pas nécessaire
- Formulaires à fort volume où la performance est prioritaire

## Contraintes

- Ne pas utiliser si une recherche/filtrage est nécessaire — préférer `Combobox`
- Le style du menu déroulant ouvert dépend du navigateur et n'est pas personnalisable
- Les options utilisent les couleurs système (`Canvas`, `CanvasText`) pour garantir la lisibilité native
- La prop `size` est custom (pas celle native de `<select>`) — `"sm"` et `"default"` uniquement
- Ne pas oublier un `<option value="">` vide pour le placeholder

## Dépendances

- `@phosphor-icons/react` — `CaretDownIcon` (icône de flèche)
- Aucune dépendance de composant externe (composant autonome)

## Anatomie

| Slot                                 | Rôle                                               |
| ------------------------------------ | -------------------------------------------------- |
| `data-slot="native-select-wrapper"`  | Wrapper positionné relativement, porte `data-size` |
| `data-slot="native-select"`          | Élément `<select>` natif avec styles personnalisés |
| `data-slot="native-select-icon"`     | Icône chevron positionnée en absolu à droite       |
| `data-slot="native-select-option"`   | Option individuelle avec couleurs système          |
| `data-slot="native-select-optgroup"` | Groupe d'options avec couleurs système             |

## Tokens utilisés

| Token                        | Usage                                                                  |
| ---------------------------- | ---------------------------------------------------------------------- |
| `--color-input`              | Bordure du select (`border-input`), fond dark (`bg-input/30`)          |
| `--color-ring`               | Anneau de focus (`ring-ring/50`, `border-ring`)                        |
| `--color-destructive`        | Bordure et anneau erreur (`border-destructive`, `ring-destructive/20`) |
| `--color-muted-foreground`   | Texte placeholder et icône chevron (`text-muted-foreground`)           |
| `--color-primary`            | Fond de la sélection de texte (`bg-primary`)                           |
| `--color-primary-foreground` | Texte de la sélection (`text-primary-foreground`)                      |

## Props / API

| Prop                     | Type                                           | Défaut      | Description                                     |
| ------------------------ | ---------------------------------------------- | ----------- | ----------------------------------------------- |
| **NativeSelect**         |                                                |             |                                                 |
| `size`                   | `"sm" \| "default"`                            | `"default"` | Taille du select (`h-8` default, `h-7` sm)      |
| `className`              | `string`                                       | —           | Classes CSS additionnelles sur le wrapper       |
| `...props`               | `Omit<React.ComponentProps<"select">, "size">` | —           | Props natives du `<select>` (sauf `size` natif) |
| **NativeSelectOption**   |                                                |             |                                                 |
| `className`              | `string`                                       | —           | Classes CSS additionnelles                      |
| `...props`               | `React.ComponentProps<"option">`               | —           | Props natives de `<option>`                     |
| **NativeSelectOptGroup** |                                                |             |                                                 |
| `className`              | `string`                                       | —           | Classes CSS additionnelles                      |
| `...props`               | `React.ComponentProps<"optgroup">`             | —           | Props natives de `<optgroup>`                   |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                                 |
| -------- | --------------------------------------------------------------------------- |
| default  | Bordure `input`, fond transparent, hauteur `h-8` (ou `h-7` en `sm`)         |
| hover    | Fond dark passe à `bg-input/50`                                             |
| focus    | Bordure `ring` + anneau `ring-ring/50` via `focus-visible`                  |
| active   | Menu déroulant natif du navigateur ouvert                                   |
| disabled | `pointer-events-none`, `cursor-not-allowed`, opacité réduite (`opacity-50`) |
| error    | Bordure `destructive`, anneau `ring-destructive/20` via `aria-invalid`      |

## Accessibilité

**Pattern** : Élément natif `select`

**Rôle** : `select` natif ; l'icône chevron est masquée (`aria-hidden`).

**Clavier** :

Comportement natif du `select` (flèches, saisie, `Space` / `Enter` selon la plateforme).

**Nom accessible** : Obligatoire : `Label` associé ou `aria-label`.

**Vigilance** :

- Préférer `NativeSelect` à `Select` quand la liste est longue ou sur mobile : le sélecteur du système est le plus accessible.

## Exemple de code

```tsx
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

export default function Example() {
  return (
    <NativeSelect size="default">
      <NativeSelectOption value="">Choisir une option…</NativeSelectOption>
      <NativeSelectOption value="paris">Paris</NativeSelectOption>
      <NativeSelectOption value="lyon">Lyon</NativeSelectOption>
      <NativeSelectOption value="marseille">Marseille</NativeSelectOption>
    </NativeSelect>
  )
}
```

## Références croisées

- `Select` — alternative Radix entièrement stylisable
- `Combobox` — alternative avec recherche/filtrage intégré
- `Field` — encapsule le select avec label et messages d'erreur
