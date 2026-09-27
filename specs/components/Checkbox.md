# Checkbox

## Metadata

| Champ         | Valeur                     |
| ------------- | -------------------------- |
| Nom           | Checkbox                   |
| Catégorie     | Forms                      |
| Statut        | stable                     |
| figma_node_id |                            |
| code_path     | components/ui/checkbox.tsx |

## Rôle

Case à cocher binaire (ou indéterminée) permettant la sélection d'une option dans un formulaire, basée sur Radix `Checkbox.Root`.

## Usage

- Accepter des conditions d'utilisation ou de confidentialité
- Activer/désactiver une préférence (ex. : "Se souvenir de moi")
- Sélectionner plusieurs éléments dans une liste
- Utiliser l'état `indeterminate` pour représenter une sélection partielle d'un groupe

## Contraintes

- Toujours associer à un `<Label>` via `id` / `htmlFor` ou en l'encapsulant dans `<Field>`
- Ne pas utiliser pour des choix mutuellement exclusifs — préférer `<RadioGroup>`
- La zone de clic étendue (`after: absolute -inset-x-3 -inset-y-2`) ne doit pas chevaucher d'autres contrôles interactifs adjacents
- En état `disabled`, la valeur n'est pas soumise par le formulaire natif
- Ne pas transmettre l'état uniquement par la couleur (ajouter une icône ou un texte)

## Dépendances

- `Checkbox.Root` et `Checkbox.Indicator` de `radix-ui`
- `CheckIcon` de `lucide-react` (taille `size-3.5`)
- `Label` — obligatoire pour l'accessibilité
- `Field` — recommandé pour la propagation de l'état invalide

## Anatomie

| Slot                             | Rôle                                                   |
| -------------------------------- | ------------------------------------------------------ |
| `data-slot="checkbox"`           | `<button>` Radix Checkbox.Root, carré 16 × 16 px       |
| `data-slot="checkbox-indicator"` | Radix Checkbox.Indicator contenant l'icône `CheckIcon` |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                                | Classes et variables                                                                           | Où                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `border-width.default`               | `border`                                                                                       | `Checkbox`                                                |
| `color.action.background.default`    | `bg-primary` · `border-primary`                                                                | `Checkbox`                                                |
| `color.action.background.foreground` | `text-primary-foreground`                                                                      | `Checkbox`                                                |
| `color.border.focus`                 | `border-ring` · `ring-ring/50`                                                                 | `Checkbox` via `FOCUS_RING` (`lib/focus.ts`)              |
| `color.border.input`                 | `bg-input/30` · `border-input`                                                                 | `Checkbox`                                                |
| `color.feedback.error.default`       | `border-destructive` · `border-destructive/50` · `ring-destructive/20` · `ring-destructive/40` | `Checkbox`                                                |
| `space.focus-ring-width`             | `ring-(length:--space-focus-ring-width)`                                                       | `Checkbox` · `Checkbox` via `FOCUS_RING` (`lib/focus.ts`) |

Relevé dans `components/ui/checkbox.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Checkbox`

Rend `CheckboxPrimitive.Root`.

| Prop              | Type                                                  | Défaut  | Description                                   |
| ----------------- | ----------------------------------------------------- | ------- | --------------------------------------------- |
| `checked`         | `CheckboxPrimitive.CheckedState`                      | —       | État contrôlé de la case                      |
| `defaultChecked`  | `CheckboxPrimitive.CheckedState`                      | —       | État initial non contrôlé                     |
| `onCheckedChange` | `(checked: CheckboxPrimitive.CheckedState) => void`   | —       | Callback de changement d'état                 |
| `disabled`        | `boolean`                                             | `false` | Désactive la case                             |
| `required`        | `boolean`                                             | `false` | Rend la case obligatoire dans le formulaire   |
| `name`            | `string`                                              | —       | Nom du champ pour la soumission de formulaire |
| `value`           | `string \| number \| readonly string[]`               | `"on"`  | Valeur soumise quand la case est cochée       |
| `className`       | `string`                                              | —       | Classes CSS additionnelles                    |
| `...props`        | `React.ComponentProps<typeof CheckboxPrimitive.Root>` | —       | Props de `CheckboxPrimitive.Root`             |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État                  | Comportement visuel                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------- |
| `default` (unchecked) | Fond transparent, bordure `border-input`                                                  |
| `hover`               | Pas de style dédié (géré par le focus natif)                                              |
| `focus`               | `border-ring` + `ring-1 ring-ring/50`                                                     |
| `active`              | Pas de style dédié                                                                        |
| `disabled`            | `cursor-not-allowed opacity-50`, `pointer-events-none`                                    |
| `checked`             | `border-primary bg-primary text-primary-foreground`, icône `CheckIcon` visible            |
| `indeterminate`       | Radix gère `data-state="indeterminate"` — prévoir une icône `MinusIcon` côté consommateur |
| `error`               | `aria-invalid="true"` : `border-destructive ring-destructive/20`                          |

## Accessibilité

**Pattern** : [Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) (Radix Checkbox)

**Rôle** : `role="checkbox"` sur un `button`, `aria-checked` : `true`, `false` ou `mixed` (indéterminé).

**Clavier** :

| Touche  | Action          |
| ------- | --------------- |
| `Space` | Coche / décoche |
| `Tab`   | Focus suivant   |

**Nom accessible** : Obligatoire : un `Label` associé par `htmlFor` / `id`, ou `aria-label`. Cliquer le label coche la case.

**Vigilance** :

- `Enter` ne coche pas la case (comportement natif) : ne pas l'ajouter.
- `aria-invalid` stylise l'erreur ; le message doit être relié par `aria-describedby`.

## Exemple de code

```tsx
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function Example() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="remember" name="remember" />
      <Label htmlFor="remember">Se souvenir de moi</Label>
    </div>
  )
}
```

## Références croisées

- `Label` — association obligatoire
- `Field` — propagation de l'état invalide
- `FieldError` — message d'erreur associé
- `RadioGroup` — alternative pour les choix mutuellement exclusifs
