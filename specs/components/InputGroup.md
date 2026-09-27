# InputGroup

## Metadata

| Champ         | Valeur                        |
| ------------- | ----------------------------- |
| Nom           | InputGroup                    |
| Catégorie     | Forms                         |
| Statut        | stable                        |
| figma_node_id |                               |
| code_path     | components/ui/input-group.tsx |

## Rôle

Conteneur structurant un champ de saisie avec des addons (icônes, boutons, texte, labels) positionnés autour de l'input.

## Usage

- Ajouter une icône ou un label à gauche/droite d'un champ de saisie
- Intégrer un bouton d'action dans un champ (ex. : afficher/masquer mot de passe, recherche)
- Composer un champ avec un label flottant au-dessus ou un complément en dessous
- Grouper un `Input` ou `Textarea` avec des éléments visuels additionnels
- Base de composition pour `Combobox` et `Command`

## Contraintes

- **MUST NOT** — servir sans `InputGroupInput` ou `InputGroupTextarea` en enfant direct
- **MUST NOT** — mêler des addons `block-*` et `inline-*` dans un même groupe : les `block-*` passent la mise en page en colonne
- **MUST** — poser `disabled` sur le champ enfant : le groupe n'en reflète que l'apparence (`has-disabled`)
- **MUST** — utiliser `InputGroupButton` pour un bouton dans un addon
- **MUST NOT** — lui passer une fonction (callback, gestionnaire d'événement) depuis un composant serveur : c'est un composant client (`"use client"`), seules des props sérialisables lui parviennent d'un composant serveur

## Dépendances

- `class-variance-authority` — gestion des variantes d'alignement des addons et tailles des boutons
- `Button` de `@/components/ui/button` — utilisé par `InputGroupButton`
- `Input` de `@/components/ui/input` — utilisé par `InputGroupInput`
- `Textarea` de `@/components/ui/textarea` — utilisé par `InputGroupTextarea`

## Anatomie

| Slot                              | Rôle                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| `data-slot="input-group"`         | Racine du groupe, conteneur flex avec bordure                                              |
| `data-slot="input-group-addon"`   | Zone d'addon (icône, texte, bouton) positionnée via `data-align`                           |
| `data-slot="input-group-control"` | Input ou textarea enfant (focus/validation propagée au groupe)                             |
| `data-slot="input-group-button"`  | Bouton inline héritant de la prop `data-size` — non déclaré dans le slot mais via `Button` |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                           | Classes et variables                                                 | Où                                                                        |
| ------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `border-width.default`          | `border`                                                             | `InputGroup`                                                              |
| `color.border.focus`            | `border-ring` · `ring-ring/50`                                       | `InputGroup`                                                              |
| `color.border.input`            | `bg-input/30` · `bg-input/50` · `bg-input/80` · `border-input`       | `InputGroup`                                                              |
| `color.feedback.error.default`  | `border-destructive` · `ring-destructive/20` · `ring-destructive/40` | `InputGroup`                                                              |
| `color.text.subtle`             | `text-muted-foreground`                                              | `InputGroupText` · `inputGroupAddonVariants`                              |
| `opacity.disabled`              | `opacity-disabled`                                                   | `InputGroup` · `inputGroupAddonVariants`                                  |
| `space.focus-ring-width`        | `ring-(length:--space-focus-ring-width)`                             | `InputGroup`                                                              |
| `typography.font-weight.medium` | `font-medium`                                                        | `inputGroupAddonVariants`                                                 |
| `typography.size.xs`            | `text-xs`                                                            | `InputGroupText` · `inputGroupAddonVariants` · `inputGroupButtonVariants` |

Relevé dans `components/ui/input-group.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

Compose `Button`, `Input`, `Textarea` : les tokens de ces composants sont listés dans leurs specs.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `InputGroup`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `InputGroupAddon`

Rend `<div>`.

| Prop        | Type                                                             | Défaut           | Description                               |
| ----------- | ---------------------------------------------------------------- | ---------------- | ----------------------------------------- |
| `align`     | `"inline-start" \| "inline-end" \| "block-start" \| "block-end"` | `"inline-start"` | Position de l'addon par rapport à l'input |
| `className` | `string`                                                         | —                | Classes CSS additionnelles                |
| `...props`  | `React.ComponentProps<"div">`                                    | —                | Props natives de `<div>`                  |

### `InputGroupButton`

Rend `Button`.

| Prop       | Type                                                                          | Défaut     | Description                                       |
| ---------- | ----------------------------------------------------------------------------- | ---------- | ------------------------------------------------- |
| `type`     | `"button" \| "submit" \| "reset"`                                             | `"button"` | Type HTML du bouton                               |
| `variant`  | `"link" \| "default" \| "destructive" \| "outline" \| "secondary" \| "ghost"` | `"ghost"`  | Variante visuelle du bouton (héritée de `Button`) |
| `size`     | `"xs" \| "sm" \| "icon-xs" \| "icon-sm"`                                      | `"xs"`     | Taille du bouton dans le groupe                   |
| `...props` | `Omit<React.ComponentProps<typeof Button>, "size">`                           | —          | Props transmises à l'élément rendu                |

### `InputGroupText`

Rend `<span>`.

| Prop       | Type                           | Défaut | Description               |
| ---------- | ------------------------------ | ------ | ------------------------- |
| `...props` | `React.ComponentProps<"span">` | —      | Props natives de `<span>` |

### `InputGroupInput`

Rend `Input`.

| Prop        | Type                            | Défaut | Description                |
| ----------- | ------------------------------- | ------ | -------------------------- |
| `className` | `string`                        | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"input">` | —      | Props natives de `<input>` |

### `InputGroupTextarea`

Rend `Textarea`.

| Prop        | Type                               | Défaut | Description                   |
| ----------- | ---------------------------------- | ------ | ----------------------------- |
| `className` | `string`                           | —      | Classes CSS additionnelles    |
| `...props`  | `React.ComponentProps<"textarea">` | —      | Props natives de `<textarea>` |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

| Composant          | Axe     | Valeurs                                                     | Défaut         |
| ------------------ | ------- | ----------------------------------------------------------- | -------------- |
| `InputGroupAddon`  | `align` | `inline-start` · `inline-end` · `block-start` · `block-end` | `inline-start` |
| `InputGroupButton` | `size`  | `xs` · `sm` · `icon-xs` · `icon-sm`                         | `xs`           |

Le sens de chaque axe (apparence, intention, taille…) est donné dans **Props / API**.

## États

| État     | Description                                                                        |
| -------- | ---------------------------------------------------------------------------------- |
| default  | Bordure `input`, fond transparent, hauteur `h-8`                                   |
| hover    | — (pas de style hover spécifique sur le groupe)                                    |
| focus    | Bordure `ring` + anneau `ring-ring/50` via `focus-visible` sur l'input enfant      |
| active   | —                                                                                  |
| disabled | Fond `bg-input/50`, opacité réduite (`opacity-disabled`) via `has-disabled`        |
| error    | Bordure `destructive`, anneau `ring-destructive/20` via `aria-invalid` sur l'input |

## Accessibilité

**Pattern** : Groupe (`role="group"`) autour d'un champ

**Rôle** : `role="group"` ; le champ garde sa sémantique ; un clic sur un addon donne le focus au champ.

**Clavier** :

Aucune interaction propre ; le champ et les `InputGroupButton` sont focalisables normalement.

**Nom accessible** : Le champ doit être étiqueté comme un `Input`. Un `InputGroupButton` icône seule exige un `aria-label` (« Effacer la recherche »).

**Vigilance** :

- **MUST** — quand le texte d'un addon (« https:// », « € ») porte du sens, le reprendre dans le label ou la description : il n'est pas lu comme partie du label.
- L'erreur est stylisée sur le groupe via `aria-invalid` du champ ; le message reste à relier.

## Exemple de code

```tsx
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"

export default function Example() {
  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <InputGroupText>
          <MagnifyingGlassIcon />
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="Rechercher…" />
    </InputGroup>
  )
}
```

## Références croisées

- `Input` — utilisé en interne par `InputGroupInput`
- `Textarea` — utilisé en interne par `InputGroupTextarea`
- `Button` — utilisé en interne par `InputGroupButton`
- `Combobox` — utilise `InputGroup` pour structurer son champ de saisie
- `Command` — utilise `InputGroup` pour structurer le champ de recherche
