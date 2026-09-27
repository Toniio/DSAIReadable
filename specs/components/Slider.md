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
- Toujours fournir un label accessible (via `aria-label` ou `<Label>`)
- En mode vertical (`orientation="vertical"`), une hauteur minimale (`min-h-40`) est requise
- Les valeurs `min` et `max` doivent être cohérentes avec le pas (`step`)
- Requiert un conteneur `"use client"` (composant client-side)

## Dépendances

- `radix-ui` — `Slider` primitive (Root, Track, Range, Thumb)

## Anatomie

| Slot                       | Rôle                                            |
| -------------------------- | ----------------------------------------------- |
| `data-slot="slider"`       | Racine du composant, conteneur flex             |
| `data-slot="slider-track"` | Piste de fond du slider                         |
| `data-slot="slider-range"` | Zone colorée représentant la plage sélectionnée |
| `data-slot="slider-thumb"` | Poignée(s) déplaçable(s) pour ajuster la valeur |

## Tokens utilisés

| Token             | Usage                                                               |
| ----------------- | ------------------------------------------------------------------- |
| `--color-muted`   | Fond de la piste (`bg-muted`)                                       |
| `--color-primary` | Fond de la plage sélectionnée (`bg-primary`)                        |
| `--color-ring`    | Bordure et anneau de focus du thumb (`border-ring`, `ring-ring/50`) |

## Props / API

| Prop            | Type                                                | Défaut         | Description                         |
| --------------- | --------------------------------------------------- | -------------- | ----------------------------------- |
| `value`         | `number[]`                                          | —              | Valeur(s) contrôlée(s) du slider    |
| `defaultValue`  | `number[]`                                          | —              | Valeur(s) par défaut (non contrôlé) |
| `min`           | `number`                                            | `0`            | Valeur minimale de la plage         |
| `max`           | `number`                                            | `100`          | Valeur maximale de la plage         |
| `step`          | `number`                                            | `1`            | Incrément entre les valeurs         |
| `orientation`   | `"horizontal" \| "vertical"`                        | `"horizontal"` | Orientation du slider               |
| `onValueChange` | `(value: number[]) => void`                         | —              | Callback de changement de valeur    |
| `disabled`      | `boolean`                                           | `false`        | Désactive le slider                 |
| `className`     | `string`                                            | —              | Classes CSS additionnelles          |
| `...props`      | `React.ComponentProps<typeof SliderPrimitive.Root>` | —              | Props Radix Slider.Root             |

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

**Nom accessible** : Chaque poignée devrait être nommée (« Prix minimum », « Prix maximum »).

**Vigilance** :

- **Défaut connu** : le composant rend ses poignées lui-même et ne leur transmet aucun `aria-label` ; avec une seule poignée, elle n'a pas de nom (Radix ne nomme que les poignées d'un intervalle, « Minimum » / « Maximum »).
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
    />
  )
}
```

## Références croisées

- `Input` — alternative pour la saisie précise de valeurs numériques
- `Field` — encapsule le slider avec label et messages d'erreur
