# Button

## Metadata

| Champ         | Valeur                   |
| ------------- | ------------------------ |
| Nom           | Button                   |
| Catégorie     | Forms                    |
| Statut        | stable                   |
| figma_node_id |                          |
| code_path     | components/ui/button.tsx |

## Rôle

Déclencheur d'action primaire ou secondaire, disponible en plusieurs variantes visuelles et tailles.

## Usage

- Soumettre un formulaire (type `submit`)
- Déclencher une action critique (ex. : "Se connecter", "Confirmer")
- Navigation interne via `asChild` + `<Link>`
- Actions icône seule (variantes `icon-*`)
- Bouton destructeur pour les actions irréversibles (variante `destructive`)

## Contraintes

- **MUST NOT** — rendre un `<button>` pour naviguer vers un site externe → un `<a href>`, via `asChild` pour garder l'apparence
- **MUST NOT** — placer plus de 2 boutons `variant="default"` (primaires) dans une même vue
- **MUST NOT** — signaler un état par la couleur seule : ajouter un texte ou un tooltip
- **MUST** — donner un `aria-label` à un bouton de taille `icon-*`
- **MUST NOT** — imbriquer un `<button>` dans un autre, y compris via `asChild`

## Dépendances

- `Slot.Root` de `radix-ui` (utilisé quand `asChild={true}`)
- `class-variance-authority` pour la gestion des variantes
- Icônes : `@phosphor-icons/react` uniquement (**MUST**, règle du dépôt)

## Anatomie

| Slot                 | Rôle                                                     |
| -------------------- | -------------------------------------------------------- |
| `data-slot="button"` | Racine du composant, porte `data-variant` et `data-size` |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                                | Classes et variables                                                                                                                                                                                            | Où                                                                                                                                           |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `border-width.default`               | `border`                                                                                                                                                                                                        | `buttonVariants`                                                                                                                             |
| `color.action.background.default`    | `bg-primary` · `bg-primary/80` · `text-primary`                                                                                                                                                                 | `buttonVariants.variant.default` · `buttonVariants.variant.link`                                                                             |
| `color.action.background.foreground` | `text-primary-foreground`                                                                                                                                                                                       | `buttonVariants.variant.default`                                                                                                             |
| `color.background.default`           | `bg-background`                                                                                                                                                                                                 | `buttonVariants.variant.outline`                                                                                                             |
| `color.background.subtle`            | `bg-muted` · `bg-muted/50` · `bg-secondary` · `bg-secondary/80`                                                                                                                                                 | `buttonVariants.variant.ghost` · `buttonVariants.variant.outline` · `buttonVariants.variant.secondary`                                       |
| `color.border.default`               | `border-border`                                                                                                                                                                                                 | `buttonVariants.variant.outline`                                                                                                             |
| `color.border.focus`                 | `border-ring` · `ring-ring/50`                                                                                                                                                                                  | `buttonVariants` via `FOCUS_RING` (`lib/focus.ts`)                                                                                           |
| `color.border.input`                 | `bg-input/30` · `bg-input/50` · `border-input`                                                                                                                                                                  | `buttonVariants.variant.outline`                                                                                                             |
| `color.feedback.error.default`       | `bg-destructive/10` · `bg-destructive/20` · `bg-destructive/30` · `border-destructive` · `border-destructive/40` · `border-destructive/50` · `ring-destructive/20` · `ring-destructive/40` · `text-destructive` | `buttonVariants.variant.destructive` · `buttonVariants.variant.destructive` via `FOCUS_RING_DESTRUCTIVE` (`lib/focus.ts`) · `buttonVariants` |
| `color.text.default`                 | `text-foreground` · `text-secondary-foreground`                                                                                                                                                                 | `buttonVariants.variant.ghost` · `buttonVariants.variant.outline` · `buttonVariants.variant.secondary`                                       |
| `opacity.disabled`                   | `opacity-disabled`                                                                                                                                                                                              | `buttonVariants`                                                                                                                             |
| `space.focus-ring-width`             | `ring-(length:--space-focus-ring-width)`                                                                                                                                                                        | `buttonVariants` · `buttonVariants` via `FOCUS_RING` (`lib/focus.ts`)                                                                        |
| `typography.font-weight.medium`      | `font-medium`                                                                                                                                                                                                   | `buttonVariants`                                                                                                                             |
| `typography.size.xs`                 | `text-xs`                                                                                                                                                                                                       | `buttonVariants.size.xs` · `buttonVariants`                                                                                                  |

Relevé dans `components/ui/button.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Button`

Rend `<button>`, ou son enfant avec `asChild`.

| Prop        | Type                                                                                 | Défaut      | Description                                       |
| ----------- | ------------------------------------------------------------------------------------ | ----------- | ------------------------------------------------- |
| `variant`   | `"default" \| "outline" \| "secondary" \| "ghost" \| "destructive" \| "link"`        | `"default"` | Apparence visuelle du bouton                      |
| `size`      | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"` | `"default"` | Taille du bouton (`h-8` par défaut)               |
| `asChild`   | `boolean`                                                                            | `false`     | Délègue le rendu au premier enfant via Radix Slot |
| `className` | `string`                                                                             | —           | Classes CSS additionnelles                        |
| `...props`  | `React.ComponentProps<"button">`                                                     | —           | Props natives de `<button>`                       |

### `buttonVariants`

Fonction `cva` : renvoie les classes d'une combinaison de ses axes (voir **Variantes**), pour donner ce style à un autre élément.

<!-- Fin de la partie générée. -->

> **Axes de variantes** — `variant` décrit l'**apparence** : `default`, `secondary`, `outline`, `ghost`, `link` classent le bouton par prominence décroissante, de l'action principale au lien textuel. Seul `destructive` relève de l'**intention** : il déclare une action irréversible, et le rouge en découle. Un bouton qui n'est pas destructeur ne doit pas l'utiliser, même si le rouge convient à la maquette.

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

| Composant | Axe       | Valeurs                                                                     | Défaut    |
| --------- | --------- | --------------------------------------------------------------------------- | --------- |
| `Button`  | `variant` | `default` · `outline` · `secondary` · `ghost` · `destructive` · `link`      | `default` |
| `Button`  | `size`    | `default` · `xs` · `sm` · `lg` · `icon` · `icon-xs` · `icon-sm` · `icon-lg` | `default` |

Le sens de chaque axe (apparence, intention, taille…) est donné dans **Props / API**.

## États

| État       | Comportement visuel                                                                  |
| ---------- | ------------------------------------------------------------------------------------ |
| `default`  | Fond `action-background-default`, texte `action-background-foreground`               |
| `hover`    | Légère atténuation du fond (opacité 90 %) selon la variante                          |
| `focus`    | Anneau `ring-1 ring-ring/50` + bordure `border-ring`                                 |
| `active`   | Translation verticale `translate-y-px` pour un retour tactile (hors `aria-haspopup`) |
| `disabled` | `pointer-events-none`, `opacity-disabled` — interaction impossible                   |
| `loading`  | Afficher un `<Spinner>` comme enfant ; gérer `aria-busy="true"` côté consommateur    |
| `error`    | `aria-invalid="true"` : bordure et anneau `destructive`                              |

## Accessibilité

**Pattern** : [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) — élément natif `button`

**Rôle** : `button` natif (ou l'élément fourni par `asChild`, par exemple un lien).

**Clavier** :

| Touche            | Action           |
| ----------------- | ---------------- |
| `Enter` / `Space` | Active le bouton |
| `Tab`             | Focus suivant    |

**Nom accessible** : Le texte du bouton. Les tailles `icon`, `icon-xs`, `icon-sm`, `icon-lg` n'ont pas de texte visible : `aria-label` obligatoire.

**Vigilance** :

- **MUST** — quand l'utilisateur doit comprendre pourquoi l'action est indisponible, utiliser `aria-disabled` et une explication : `disabled` retire le bouton de l'ordre de tabulation.
- Un bouton qui navigue doit être un lien (`asChild` + `a`), pas un `onClick` qui change de page.
- `variant="destructive"` doit être doublé d'un libellé explicite.

## Exemple de code

```tsx
import { Button } from "@/components/ui/button"

export default function Example() {
  return (
    <Button variant="default" size="default" type="submit">
      Se connecter
    </Button>
  )
}
```

## Références croisées

- `Field` — encapsule souvent un `Button` de soumission
- `Spinner` — utilisé dans le bouton en état loading
- `Input` — partenaire fréquent dans les formulaires
