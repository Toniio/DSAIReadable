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

- Ne pas utiliser pour la navigation externe — préférer un `<a>` sémantique
- Limiter à 2 boutons primaires par vue pour éviter la surcharge cognitive
- L'état `disabled` supprime les événements pointer ; ne pas transmettre d'info uniquement via la couleur (ajouter un texte ou tooltip)
- Les variantes `icon-*` requièrent un `aria-label` explicite
- Ne pas imbriquer un `<button>` dans un autre `<button>` même via `asChild`

## Dépendances

- `Slot.Root` de `radix-ui` (utilisé quand `asChild={true}`)
- `class-variance-authority` pour la gestion des variantes
- Icônes SVG compatibles (Phosphor Icons recommandé)

## Anatomie

| Slot                 | Rôle                                                     |
| -------------------- | -------------------------------------------------------- |
| `data-slot="button"` | Racine du composant, porte `data-variant` et `data-size` |

## Tokens utilisés

| Token                                  | Usage                                       |
| -------------------------------------- | ------------------------------------------- |
| `--color-action-background-default`    | Fond variante `default`                     |
| `--color-action-background-foreground` | Texte/icône sur fond action                 |
| `--color-background-default`           | Fond variante `outline` et `ghost` au hover |
| `--color-background-subtle`            | Fond variante `secondary`                   |
| `--color-border-default`               | Bordure variante `outline`                  |
| `--color-border-focus`                 | Anneau de focus `focus-visible`             |
| `--color-feedback-error-default`       | Bordure et anneau état `aria-invalid`       |
| `--color-text-default`                 | Texte variante `ghost`, `link`, `secondary` |
| `--opacity-disabled`                   | Opacité état `disabled` (50 %)              |
| `--motion-duration-normal`             | Durée des transitions                       |
| `--motion-easing-default`              | Courbe des transitions                      |

## Props / API

| Prop        | Type                                                                                 | Défaut      | Description                                       |
| ----------- | ------------------------------------------------------------------------------------ | ----------- | ------------------------------------------------- |
| `variant`   | `"default" \| "outline" \| "secondary" \| "ghost" \| "destructive" \| "link"`        | `"default"` | Apparence visuelle du bouton                      |
| `size`      | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"` | `"default"` | Taille du bouton (`h-8` par défaut)               |
| `asChild`   | `boolean`                                                                            | `false`     | Délègue le rendu au premier enfant via Radix Slot |
| `className` | `string`                                                                             | —           | Classes CSS additionnelles                        |
| `...props`  | `React.ComponentProps<"button">`                                                     | —           | Toutes les props natives du `<button>`            |

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
| `disabled` | `pointer-events-none`, `opacity-50` — interaction impossible                         |
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

- Désactiver avec `disabled` retire le bouton de l'ordre de tabulation : si l'utilisateur doit comprendre pourquoi, préférer `aria-disabled` et une explication.
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
