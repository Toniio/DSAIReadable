# Badge

## Metadata

| Champ         | Valeur                  |
| ------------- | ----------------------- |
| Nom           | Badge                   |
| Catégorie     | Misc                    |
| Statut        | stable                  |
| figma_node_id |                         |
| code_path     | components/ui/badge.tsx |

## Rôle

Étiquette compacte utilisée pour catégoriser, marquer un statut ou mettre en avant une métadonnée sur un élément.

## Usage

- Indiquer un statut (actif, en attente, erreur) à côté d'un titre
- Catégoriser un élément dans une liste ou un tableau
- Afficher un compteur de notifications
- Marquer une nouveauté ou une fonctionnalité expérimentale
- Envelopper un lien avec `asChild` pour un badge cliquable

## Contraintes

- Ne pas utiliser comme bouton d'action — préférer `Button` avec `size="xs"`
- Le texte doit rester très court (un à trois mots maximum)
- La variante `destructive` est réservée aux statuts d'erreur ou d'alerte critique
- Ne pas imbriquer de composants interactifs complexes à l'intérieur du badge
- Les variantes `ghost` et `link` n'ont pas de fond ; vérifier la lisibilité sur tous les arrière-plans

## Dépendances

- `class-variance-authority` pour la gestion des variantes
- `Slot.Root` de `radix-ui` (utilisé quand `asChild={true}`)
- `cn` utilitaire depuis `@/lib/utils`

## Anatomie

| Slot                | Rôle                                      |
| ------------------- | ----------------------------------------- |
| `data-slot="badge"` | Racine du composant, porte `data-variant` |

## Tokens utilisés

| Token                       | Usage                                |
| --------------------------- | ------------------------------------ |
| `bg-primary`                | Fond variante `default`              |
| `text-primary-foreground`   | Texte variante `default`             |
| `bg-secondary`              | Fond variante `secondary`            |
| `text-secondary-foreground` | Texte variante `secondary`           |
| `bg-destructive/10`         | Fond variante `destructive` (clair)  |
| `bg-destructive/20`         | Fond variante `destructive` (sombre) |
| `text-destructive`          | Texte variante `destructive`         |
| `border-border`             | Bordure variante `outline`           |
| `text-foreground`           | Texte variante `outline`             |
| `bg-muted`                  | Fond variante `ghost` au hover       |
| `text-muted-foreground`     | Texte variante `ghost` au hover      |
| `text-primary`              | Texte variante `link`                |
| `ring-ring/50`              | Anneau de focus                      |
| `border-ring`               | Bordure au focus                     |
| `border-destructive`        | Bordure état `aria-invalid`          |
| `ring-destructive/20`       | Anneau état `aria-invalid`           |

## Props / API

| Prop        | Type                                                                          | Défaut      | Description                                       |
| ----------- | ----------------------------------------------------------------------------- | ----------- | ------------------------------------------------- |
| `variant`   | `"default" \| "secondary" \| "destructive" \| "outline" \| "ghost" \| "link"` | `"default"` | Apparence visuelle du badge                       |
| `asChild`   | `boolean`                                                                     | `false`     | Délègue le rendu au premier enfant via Radix Slot |
| `className` | `string`                                                                      | —           | Classes CSS additionnelles                        |
| `...props`  | `React.ComponentProps<"span">`                                                | —           | Props natives du `<span>`                         |

> **Axes de variantes** — `variant` décrit l'**apparence** : `default`, `secondary`, `outline`, `ghost`, `link` ne changent que la prominence visuelle. Seul `destructive` relève de l'**intention** : il annonce un état d'erreur ou une donnée dangereuse. Ne jamais l'employer pour obtenir du rouge — un badge simplement coloré passe par `outline` et un token de couleur.

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

| Composant | Axe       | Valeurs                                                                | Défaut    |
| --------- | --------- | ---------------------------------------------------------------------- | --------- |
| `Badge`   | `variant` | `default` · `secondary` · `destructive` · `outline` · `ghost` · `link` | `default` |

Le sens de chaque axe (apparence, intention, taille…) est donné dans **Props / API**.

## États

| État     | Description                                                    |
| -------- | -------------------------------------------------------------- |
| default  | Fond `primary`, texte `primary-foreground`, hauteur `h-5`      |
| hover    | Variation d'opacité du fond selon la variante (liens et ghost) |
| focus    | Anneau `ring-ring/50` + bordure `border-ring`                  |
| active   | Non applicable                                                 |
| disabled | Non applicable nativement                                      |
| error    | `aria-invalid="true"` : bordure et anneau `destructive`        |

## Accessibilité

**Pattern** : Texte statique (`span`) ; lien si rendu avec `asChild`

**Rôle** : Aucun rôle propre ; hérite de l'élément fourni par `asChild` (par exemple `a`).

**Clavier** :

Aucune interaction clavier propre ; un badge rendu en lien suit le comportement natif (`Enter`).

**Nom accessible** : Le texte du badge. Un badge qui ne contient qu'une icône doit avoir un texte `sr-only`.

**Vigilance** :

- La couleur ne porte jamais seule le sens (`destructive` = « Erreur » écrit, pas seulement rouge).
- Un compteur (« 3 ») doit être rattaché à ce qu'il compte, par exemple dans le nom du bouton voisin.

## Exemple de code

```tsx
import { Badge } from "@/components/ui/badge"

export default function Example() {
  return (
    <div className="flex gap-2">
      <Badge variant="default">Actif</Badge>
      <Badge variant="secondary">En attente</Badge>
      <Badge variant="destructive">Erreur</Badge>
      <Badge variant="outline">v2.1.0</Badge>
    </div>
  )
}
```

## Références croisées

- `Button` — alternative pour les actions interactives
- `Item` — badge souvent affiché dans un `ItemTitle` ou `ItemActions`
- `Table` — badge de statut dans les cellules de tableau
