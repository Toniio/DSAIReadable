# Input

## Metadata

| Champ         | Valeur                  |
| ------------- | ----------------------- |
| Nom           | Input                   |
| Catégorie     | Forms                   |
| Statut        | stable                  |
| figma_node_id |                         |
| code_path     | components/ui/input.tsx |

## Rôle

Champ de saisie texte mono-ligne (ou fichier) servant de brique de base pour tous les formulaires.

## Usage

- Saisie de texte libre (email, mot de passe, recherche)
- Téléversement de fichier (`type="file"`)
- Toujours associé à un `<Label>` via `htmlFor` / `id` pour l'accessibilité
- Peut recevoir un état d'erreur via `aria-invalid="true"` couplé à un `<FieldError>`

## Contraintes

- **MUST NOT** — servir à une saisie sur plusieurs lignes → utiliser `Textarea`
- **MUST NOT** — servir à un choix parmi des valeurs fixes → utiliser `Select` ou `Checkbox`
- L'attribut `placeholder` ne remplace pas un `<Label>` visible
- Un seul `Input` doit être `autofocus` par vue pour ne pas perturber la navigation clavier
- En état `disabled`, le curseur passe en `not-allowed` ; la valeur n'est pas soumise avec le formulaire

## Dépendances

- `Label` — doit être associé via `htmlFor`/`id`
- `Field` — encapsule `Input` + `FieldLabel` + `FieldError` pour la gestion de l'état invalide
- `FieldError` — affiche le message d'erreur sous l'input ; `FieldDescription` affiche le texte d'aide

## Anatomie

| Slot                | Rôle                                         |
| ------------------- | -------------------------------------------- |
| `data-slot="input"` | Élément `<input>` natif, racine du composant |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                           | Classes et variables                                                                           | Où                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `border-width.default`          | `border`                                                                                       | `Input`                                             |
| `color.border.focus`            | `border-ring` · `ring-ring/50`                                                                 | `Input` via `FOCUS_RING` (`lib/focus.ts`)           |
| `color.border.input`            | `bg-input/30` · `bg-input/50` · `bg-input/80` · `border-input`                                 | `Input`                                             |
| `color.feedback.error.default`  | `border-destructive` · `border-destructive/50` · `ring-destructive/20` · `ring-destructive/40` | `Input`                                             |
| `color.text.default`            | `text-foreground`                                                                              | `Input`                                             |
| `color.text.subtle`             | `text-muted-foreground`                                                                        | `Input`                                             |
| `opacity.disabled`              | `opacity-disabled`                                                                             | `Input`                                             |
| `space.focus-ring-width`        | `ring-(length:--space-focus-ring-width)`                                                       | `Input` · `Input` via `FOCUS_RING` (`lib/focus.ts`) |
| `typography.font-weight.medium` | `font-medium`                                                                                  | `Input`                                             |
| `typography.size.xs`            | `text-xs`                                                                                      | `Input`                                             |

Relevé dans `components/ui/input.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Input`

Rend `<input>`.

| Prop        | Type                            | Défaut | Description                |
| ----------- | ------------------------------- | ------ | -------------------------- |
| `className` | `string`                        | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"input">` | —      | Props natives de `<input>` |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État       | Comportement visuel                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| `default`  | Fond transparent, bordure `border-input`, texte `foreground`                                                |
| `hover`    | Pas de changement visuel défini (géré par le focus)                                                         |
| `focus`    | `border-ring` + `ring-1 ring-ring/50`                                                                       |
| `active`   | Identique à `focus`                                                                                         |
| `disabled` | `pointer-events-none`, `cursor-not-allowed`, `bg-input/50`, `opacity-disabled` (dark: `bg-input/80`)        |
| `loading`  | Non défini nativement — gérer via un état parent                                                            |
| `error`    | `aria-invalid="true"` : `border-destructive` + `ring-1 ring-destructive/20` (dark: `border-destructive/50`) |

## Accessibilité

**Pattern** : Champ natif `input`

**Rôle** : `input` natif ; le type (`email`, `tel`…) détermine le clavier virtuel et la sémantique.

**Clavier** :

Comportement natif du champ.

**Nom accessible** : Obligatoire : `Label` associé (`htmlFor` / `id`) ou `aria-label`. Le `placeholder` n'est pas un nom.

**Vigilance** :

- Poser `autocomplete` pour les données personnelles (WCAG 1.3.5).
- `aria-invalid` stylise l'erreur ; relier le message par `aria-describedby`.

## Exemple de code

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Example() {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="email">Adresse e-mail</Label>
      <Input id="email" type="email" placeholder="vous@exemple.fr" />
    </div>
  )
}
```

## Références croisées

- `Label` — association obligatoire pour l'accessibilité
- `Field` — wrapper qui gère l'état invalide et le message d'erreur
- `FieldError` — message d'erreur affiché sous l'input
- `Button` — partenaire fréquent en fin de formulaire
