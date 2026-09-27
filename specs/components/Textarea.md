# Textarea

## Metadata

| Champ         | Valeur                     |
| ------------- | -------------------------- |
| Nom           | Textarea                   |
| Catégorie     | Forms                      |
| Statut        | stable                     |
| figma_node_id |                            |
| code_path     | components/ui/textarea.tsx |

## Rôle

Champ de saisie multi-lignes avec dimensionnement automatique (`field-sizing-content`) pour la saisie de texte libre.

## Usage

- Saisie de texte long (commentaires, descriptions, messages)
- Champs de formulaire nécessitant plusieurs lignes
- Zones de notes ou de remarques libres
- Utilisation dans un `InputGroup` via `InputGroupTextarea`

## Contraintes

- Ne pas utiliser pour des saisies courtes (une ligne) — préférer `Input`
- Le `field-sizing-content` fait grandir automatiquement le champ ; si une hauteur fixe est souhaitée, surcharger via `className`
- La hauteur minimale est de `min-h-16` (4rem)
- Le mode dark applique un fond `bg-input/30` — ne pas redéfinir le fond sans tenir compte du thème
- Pas de dépendance client (`"use client"`) — composant serveur compatible

## Dépendances

- Aucune dépendance externe (composant autonome, HTML natif)

## Anatomie

| Slot                   | Rôle                                                 |
| ---------------------- | ---------------------------------------------------- |
| `data-slot="textarea"` | Élément `<textarea>` natif avec styles personnalisés |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                          | Classes et variables                                                                           | Où                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `border-width.default`         | `border`                                                                                       | `Textarea`                                                |
| `color.border.focus`           | `border-ring` · `ring-ring/50`                                                                 | `Textarea` via `FOCUS_RING` (`lib/focus.ts`)              |
| `color.border.input`           | `bg-input/30` · `bg-input/50` · `bg-input/80` · `border-input`                                 | `Textarea`                                                |
| `color.feedback.error.default` | `border-destructive` · `border-destructive/50` · `ring-destructive/20` · `ring-destructive/40` | `Textarea`                                                |
| `color.text.subtle`            | `text-muted-foreground`                                                                        | `Textarea`                                                |
| `space.focus-ring-width`       | `ring-(length:--space-focus-ring-width)`                                                       | `Textarea` · `Textarea` via `FOCUS_RING` (`lib/focus.ts`) |
| `typography.size.xs`           | `text-xs`                                                                                      | `Textarea`                                                |

Relevé dans `components/ui/textarea.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

| Prop          | Type                               | Défaut  | Description                                                  |
| ------------- | ---------------------------------- | ------- | ------------------------------------------------------------ |
| `className`   | `string`                           | —       | Classes CSS additionnelles                                   |
| `placeholder` | `string`                           | —       | Texte indicatif avant la saisie                              |
| `disabled`    | `boolean`                          | `false` | Désactive le champ                                           |
| `rows`        | `number`                           | —       | Nombre de lignes visibles (surcharge `field-sizing-content`) |
| `...props`    | `React.ComponentProps<"textarea">` | —       | Toutes les props natives du `<textarea>`                     |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                              |
| -------- | ------------------------------------------------------------------------ |
| default  | Bordure `input`, fond transparent, texte `text-xs`, hauteur auto         |
| hover    | — (pas de style hover spécifique)                                        |
| focus    | Bordure `ring` + anneau `ring-ring/50` via `focus-visible`               |
| active   | —                                                                        |
| disabled | `cursor-not-allowed`, fond `bg-input/50`, opacité réduite (`opacity-50`) |
| error    | Bordure `destructive`, anneau `ring-destructive/20` via `aria-invalid`   |

## Accessibilité

**Pattern** : Champ natif `textarea`

**Rôle** : `textarea` natif.

**Clavier** :

Comportement natif ; `Tab` sort du champ (il n'insère pas de tabulation).

**Nom accessible** : Obligatoire : `Label` associé ou `aria-label`.

**Vigilance** :

- Annoncer une limite de caractères avant d'être atteinte, par un compteur relié en `aria-describedby`.

## Exemple de code

```tsx
import { Textarea } from "@/components/ui/textarea"

export default function Example() {
  return (
    <Textarea
      placeholder="Entrez votre commentaire…"
      aria-label="Commentaire"
    />
  )
}
```

## Références croisées

- `Input` — alternative pour les saisies sur une seule ligne
- `InputGroup` — peut encapsuler un `Textarea` via `InputGroupTextarea`
- `Field` — encapsule le textarea avec label et messages d'erreur
