# Toggle

## Metadata

| Champ         | Valeur                   |
| ------------- | ------------------------ |
| Nom           | Toggle                   |
| Catégorie     | Forms                    |
| Statut        | stable                   |
| figma_node_id |                          |
| code_path     | components/ui/toggle.tsx |

## Rôle

Bouton à bascule binaire (pressé/non pressé) disponible en plusieurs variantes et tailles, exportant ses variantes pour réutilisation (ex. : `ToggleGroup`).

## Usage

- Activer/désactiver une option visuelle (ex. : gras, italique, alignement)
- Bouton de filtre on/off dans une barre d'outils
- Contrôle d'état binaire avec retour visuel immédiat
- Composition dans un `ToggleGroup` pour des choix mutuellement exclusifs ou multiples

## Contraintes

- **MUST NOT** — déclencher une action non réversible → utiliser `Button`
- **MUST NOT** — remplacer un `Switch` dans un formulaire de réglages
- **MUST NOT** — combiner la variante `outline` avec une bordure parente
- **MUST NOT** — lui passer une fonction (callback, gestionnaire d'événement) depuis un composant serveur : c'est un composant client (`"use client"`), seules des props sérialisables lui parviennent d'un composant serveur
- **MUST** — donner un `aria-label` à un `Toggle` réduit à son icône

## Dépendances

- `radix-ui` — `Toggle` primitive (Root)
- `class-variance-authority` — gestion des variantes (`toggleVariants`)

## Anatomie

| Slot                 | Rôle                    |
| -------------------- | ----------------------- |
| `data-slot="toggle"` | Racine du bouton toggle |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                           | Classes et variables                                                 | Où                                                  |
| ------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| `border-width.default`          | `border`                                                             | `toggleVariants.variant.outline`                    |
| `color.background.subtle`       | `bg-muted`                                                           | `toggleVariants.variant.outline` · `toggleVariants` |
| `color.border.focus`            | `border-ring` · `ring-ring/50`                                       | `toggleVariants` via `FOCUS_RING` (`lib/focus.ts`)  |
| `color.border.input`            | `border-input`                                                       | `toggleVariants.variant.outline`                    |
| `color.feedback.error.default`  | `border-destructive` · `ring-destructive/20` · `ring-destructive/40` | `toggleVariants`                                    |
| `color.text.default`            | `text-foreground`                                                    | `toggleVariants`                                    |
| `opacity.disabled`              | `opacity-disabled`                                                   | `toggleVariants`                                    |
| `space.focus-ring-width`        | `ring-(length:--space-focus-ring-width)`                             | `toggleVariants` via `FOCUS_RING` (`lib/focus.ts`)  |
| `typography.font-weight.medium` | `font-medium`                                                        | `toggleVariants`                                    |
| `typography.size.xs`            | `text-xs`                                                            | `toggleVariants`                                    |

Relevé dans `components/ui/toggle.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Toggle`

Rend `TogglePrimitive.Root`.

| Prop              | Type                                                | Défaut      | Description                                          |
| ----------------- | --------------------------------------------------- | ----------- | ---------------------------------------------------- |
| `variant`         | `"default" \| "outline"`                            | `"default"` | Apparence visuelle du toggle                         |
| `size`            | `"default" \| "sm" \| "lg"`                         | `"default"` | Taille du toggle (`h-8` default, `h-7` sm, `h-9` lg) |
| `pressed`         | `boolean`                                           | —           | État contrôlé pressé/non pressé                      |
| `defaultPressed`  | `boolean`                                           | —           | État par défaut (non contrôlé)                       |
| `onPressedChange` | `(pressed: boolean) => void`                        | —           | Callback de changement d'état                        |
| `disabled`        | `boolean`                                           | `false`     | Désactive le toggle                                  |
| `className`       | `string`                                            | —           | Classes CSS additionnelles                           |
| `...props`        | `React.ComponentProps<typeof TogglePrimitive.Root>` | —           | Props de `TogglePrimitive.Root`                      |

### `toggleVariants`

Fonction `cva` : renvoie les classes d'une combinaison de ses axes (voir **Variantes**), pour donner ce style à un autre élément.

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

| Composant | Axe       | Valeurs                 | Défaut    |
| --------- | --------- | ----------------------- | --------- |
| `Toggle`  | `variant` | `default` · `outline`   | `default` |
| `Toggle`  | `size`    | `default` · `sm` · `lg` | `default` |

Le sens de chaque axe (apparence, intention, taille…) est donné dans **Props / API**.

## États

| État             | Description                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| default          | Fond transparent, texte hérité                                         |
| hover            | Fond `muted`, texte `foreground`                                       |
| focus            | Bordure `ring` + anneau `ring-ring/50` via `focus-visible`             |
| active (pressed) | Fond `muted` via `aria-pressed` / `data-[state=on]`                    |
| disabled         | `pointer-events-none`, opacité réduite (`opacity-disabled`)            |
| error            | Bordure `destructive`, anneau `ring-destructive/20` via `aria-invalid` |

## Accessibilité

**Pattern** : [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) bascule

**Rôle** : `button` avec `aria-pressed`.

**Clavier** :

| Touche            | Action         |
| ----------------- | -------------- |
| `Enter` / `Space` | Bascule l'état |

**Nom accessible** : Le texte du bouton ; une bascule icône seule exige un `aria-label` qui nomme l'action (« Gras »), pas l'état.

**Vigilance** :

- Le libellé ne doit pas changer avec l'état : c'est `aria-pressed` qui porte l'état.

## Exemple de code

```tsx
import { Toggle } from "@/components/ui/toggle"
import { TextBolderIcon } from "@phosphor-icons/react"

export default function Example() {
  return (
    <Toggle variant="outline" size="default" aria-label="Gras">
      <TextBolderIcon data-icon="inline-start" />
      Gras
    </Toggle>
  )
}
```

## Références croisées

- `ToggleGroup` — utilise `toggleVariants` pour les groupes de toggles
- `Button` — alternative pour les actions non réversibles
- `Switch` — alternative pour les paramètres on/off dans un formulaire
