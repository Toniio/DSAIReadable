# Slider

## Metadata

| Champ         | Valeur                   |
| ------------- | ------------------------ |
| Nom           | Slider                   |
| Catégorie     | Forms                    |
| Statut        | stable                   |
| figma_node_id |                          |
| code_path     | components/ui/slider.tsx |

## Rôle

Curseur de sélection d'une valeur numérique (ou d'un intervalle) au sein d'une plage définie, en mode horizontal ou vertical.

## Usage

- Réglage d'une valeur numérique dans un intervalle (ex. : volume, luminosité)
- Sélection d'un intervalle min/max (range slider avec 2 thumbs)
- Filtrage par plage de prix, dates, distances
- Formulaires de paramétrage avec retour visuel immédiat

## Contraintes

- Ne pas utiliser pour des valeurs précises — préférer un `Input` de type `number`
- Toujours nommer le Slider : `aria-label`, ou `aria-labelledby` pointant vers l'`id` d'un `<Label>` (`htmlFor` ne nomme pas une poignée, qui n'est pas un champ de formulaire). Avec plusieurs poignées, nommer aussi chacune via `thumbLabels` (« Prix minimum », « Prix maximum »)
- En mode vertical (`orientation="vertical"`), une hauteur minimale (`min-h-40`) est requise
- Les valeurs `min` et `max` doivent être cohérentes avec le pas (`step`)
- Requiert un conteneur `"use client"` (composant client-side)

## Dépendances

- `radix-ui` — `Slider` primitive (Root, Track, Range, Thumb)

## Anatomie

| Slot                       | Rôle                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `data-slot="slider"`       | Racine du composant, conteneur flex ; `role="group"` avec plusieurs poignées               |
| `data-slot="slider-track"` | Piste de fond du slider                                                                    |
| `data-slot="slider-range"` | Zone colorée représentant la plage sélectionnée                                            |
| `data-slot="slider-thumb"` | Poignée(s) déplaçable(s) pour ajuster la valeur ; `role="slider"`, porte le nom accessible |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                             | Classes et variables                     | Où                                                          |
| --------------------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| `border-width.default`            | `border`                                 | `Slider`                                                    |
| `color.action.background.default` | `bg-primary`                             | `Slider`                                                    |
| `color.background.subtle`         | `bg-muted`                               | `Slider`                                                    |
| `color.border.focus`              | `border-ring` · `ring-ring/50`           | `Slider`                                                    |
| `color.static.white`              | `bg-white`                               | `Slider`                                                    |
| `space.focus-ring-width`          | `ring-(length:--space-focus-ring-width)` | `Slider` · `Slider` via `FOCUS_RING_WIDTH` (`lib/focus.ts`) |

Relevé dans `components/ui/slider.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

| Prop              | Type                                                | Défaut         | Description                                                              |
| ----------------- | --------------------------------------------------- | -------------- | ------------------------------------------------------------------------ |
| `value`           | `number[]`                                          | —              | Valeur(s) contrôlée(s) du slider                                         |
| `defaultValue`    | `number[]`                                          | —              | Valeur(s) par défaut (non contrôlé)                                      |
| `min`             | `number`                                            | `0`            | Valeur minimale de la plage                                              |
| `max`             | `number`                                            | `100`          | Valeur maximale de la plage                                              |
| `step`            | `number`                                            | `1`            | Incrément entre les valeurs                                              |
| `orientation`     | `"horizontal" \| "vertical"`                        | `"horizontal"` | Orientation du slider                                                    |
| `onValueChange`   | `(value: number[]) => void`                         | —              | Callback de changement de valeur                                         |
| `disabled`        | `boolean`                                           | `false`        | Désactive le slider                                                      |
| `aria-label`      | `string`                                            | —              | Nom de la poignée unique, ou du groupe de poignées                       |
| `aria-labelledby` | `string`                                            | —              | Idem, par référence à l'`id` d'un libellé visible                        |
| `thumbLabels`     | `string[]`                                          | —              | Nom de chaque poignée, dans l'ordre des valeurs ; prime sur `aria-label` |
| `className`       | `string`                                            | —              | Classes CSS additionnelles                                               |
| `...props`        | `React.ComponentProps<typeof SliderPrimitive.Root>` | —              | Props Radix Slider.Root                                                  |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                     |
| -------- | --------------------------------------------------------------- |
| default  | Piste `muted`, plage `primary`, thumb blanc avec bordure `ring` |
| hover    | Anneau `ring-ring/50` (1px) sur le thumb                        |
| focus    | Anneau `ring-ring/50` (1px) + outline masqué sur le thumb       |
| active   | Anneau `ring-ring/50` (1px) sur le thumb pendant le drag        |
| disabled | `pointer-events-none`, opacité réduite (`opacity-50`)           |

## Accessibilité

**Pattern** : [Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) (Radix Slider)

**Rôle** : Chaque poignée porte `role="slider"` avec `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.

**Clavier** :

| Touche                    | Action                            |
| ------------------------- | --------------------------------- |
| `ArrowRight` / `ArrowUp`  | Augmente d'un pas                 |
| `ArrowLeft` / `ArrowDown` | Diminue d'un pas                  |
| `PageUp` / `PageDown`     | Augmente / diminue d'un grand pas |
| `Home` / `End`            | Valeur minimale / maximale        |

**Nom accessible** : Porté par les poignées, seuls éléments focusables. Une poignée : le `aria-label` ou `aria-labelledby` du `Slider` lui est transmis. Plusieurs poignées : ce nom va au groupe (`role="group"` sur la racine), et chaque poignée prend son entrée de `thumbLabels`, à défaut le nom générique de Radix, en anglais (« Minimum » / « Maximum » ; « Value 1 of 3 »… au-delà de deux).

**Vigilance** :

- Un `Slider` à une poignée sans `aria-label`, `aria-labelledby` ni `thumbLabels` n'a pas de nom (violation axe `aria-input-field-name`).
- Avec plusieurs poignées, fournir `thumbLabels` : les noms par défaut de Radix ne disent pas ce que la poignée règle et ne sont pas traduits.
- Afficher la valeur en texte : la position seule ne la communique pas.

## Exemple de code

```tsx
import { Slider } from "@/components/ui/slider"

export default function Example() {
  return (
    <Slider
      defaultValue={[25, 75]}
      min={0}
      max={100}
      step={1}
      aria-label="Plage de prix"
      thumbLabels={["Prix minimum", "Prix maximum"]}
    />
  )
}
```

## Références croisées

- `Input` — alternative pour la saisie précise de valeurs numériques
- `Field` — encapsule le slider avec label et messages d'erreur
