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

- Ne pas utiliser pour des actions non réversibles — préférer `Button`
- Ne pas utiliser comme remplacement d'un `Switch` dans un formulaire de paramètres
- La variante `outline` ajoute une bordure ; ne pas la combiner avec une bordure parente
- Requiert un conteneur `"use client"` (composant client-side)
- Fournir un `aria-label` lorsque le contenu est uniquement une icône

## Dépendances

- `radix-ui` — `Toggle` primitive (Root)
- `class-variance-authority` — gestion des variantes (`toggleVariants`)

## Anatomie

| Slot                 | Rôle                    |
| -------------------- | ----------------------- |
| `data-slot="toggle"` | Racine du bouton toggle |

## Tokens utilisés

| Token                 | Usage                                                                  |
| --------------------- | ---------------------------------------------------------------------- |
| `--color-muted`       | Fond au hover et état pressé (`bg-muted`)                              |
| `--color-foreground`  | Texte au hover et état pressé (`text-foreground`)                      |
| `--color-input`       | Bordure variante `outline` (`border-input`)                            |
| `--color-ring`        | Anneau de focus (`ring-ring/50`, `border-ring`)                        |
| `--color-destructive` | Bordure et anneau erreur (`border-destructive`, `ring-destructive/20`) |

## Props / API

| Prop              | Type                                                | Défaut      | Description                                          |
| ----------------- | --------------------------------------------------- | ----------- | ---------------------------------------------------- |
| `variant`         | `"default" \| "outline"`                            | `"default"` | Apparence visuelle du toggle                         |
| `size`            | `"default" \| "sm" \| "lg"`                         | `"default"` | Taille du toggle (`h-8` default, `h-7` sm, `h-9` lg) |
| `pressed`         | `boolean`                                           | —           | État contrôlé pressé/non pressé                      |
| `defaultPressed`  | `boolean`                                           | —           | État par défaut (non contrôlé)                       |
| `onPressedChange` | `(pressed: boolean) => void`                        | —           | Callback de changement d'état                        |
| `disabled`        | `boolean`                                           | `false`     | Désactive le toggle                                  |
| `className`       | `string`                                            | —           | Classes CSS additionnelles                           |
| `...props`        | `React.ComponentProps<typeof TogglePrimitive.Root>` | —           | Props Radix Toggle.Root                              |

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
| disabled         | `pointer-events-none`, opacité réduite (`opacity-50`)                  |
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
