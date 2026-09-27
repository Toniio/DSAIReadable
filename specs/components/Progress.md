# Progress

## Metadata

| Champ         | Valeur                     |
| ------------- | -------------------------- |
| Nom           | Progress                   |
| Catégorie     | Data                       |
| Statut        | stable                     |
| figma_node_id |                            |
| code_path     | components/ui/progress.tsx |

## Rôle

Barre de progression linéaire indiquant visuellement l'avancement d'une opération ou d'un processus, basée sur le primitive `Radix UI Progress`.

## Usage

- Indiquer la progression d'un téléchargement ou d'un upload de fichier
- Afficher l'avancement d'un processus multi-étapes (ex. : formulaire, onboarding)
- Visualiser un taux de complétion (ex. : profil rempli à 75 %)
- Montrer la progression d'une opération en arrière-plan (chargement de données)
- Afficher un ratio ou un pourcentage sous forme visuelle (ex. : quota consommé)

## Contraintes

- Ne pas utiliser pour des valeurs indéterminées sans le communiquer — ajouter `aria-valuetext` ou un label explicite
- **MUST NOT** — afficher plus d'une barre `Progress` par section
- Toujours fournir un label associé (via `aria-label` ou un élément `<label>`) pour les lecteurs d'écran
- La valeur `value` doit être comprise entre 0 et `max` (100 par défaut) — les valeurs hors limites ne sont pas gérées
- **MUST NOT** — servir de jauge de données (température, stock…) : `Progress` exprime l'avancement d'une tâche

## Dépendances

- `radix-ui` (`Progress`) — primitives `Progress.Root` et `Progress.Indicator`
- `cn` (`@/lib/utils`) — utilitaire de fusion de classes

## Anatomie

| Slot                             | Rôle                                                                   |
| -------------------------------- | ---------------------------------------------------------------------- |
| `data-slot="progress"`           | Racine du composant, barre de fond (`Progress.Root`)                   |
| `data-slot="progress-indicator"` | Indicateur de progression, barre de remplissage (`Progress.Indicator`) |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                             | Classes et variables | Où         |
| --------------------------------- | -------------------- | ---------- |
| `color.action.background.default` | `bg-primary`         | `Progress` |
| `color.background.subtle`         | `bg-muted`           | `Progress` |

Relevé dans `components/ui/progress.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Progress`

Rend `ProgressPrimitive.Root`.

| Prop        | Type                                                  | Défaut | Description                                   |
| ----------- | ----------------------------------------------------- | ------ | --------------------------------------------- |
| `value`     | `number`                                              | —      | Valeur courante de la progression (0 à `max`) |
| `max`       | `number`                                              | `100`  | Valeur maximale de la progression             |
| `className` | `string`                                              | —      | Classes CSS additionnelles sur la racine      |
| `...props`  | `React.ComponentProps<typeof ProgressPrimitive.Root>` | —      | Props de `ProgressPrimitive.Root`             |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                                                           |
| -------- | ----------------------------------------------------------------------------------------------------- |
| default  | Barre affichée avec l'indicateur positionné selon `value`                                             |
| hover    | Non applicable — la barre n'est pas interactive                                                       |
| focus    | Non applicable — la barre n'est pas focusable                                                         |
| active   | L'indicateur se déplace avec une transition fluide (`transition-all`) lors des changements de `value` |
| disabled | Non applicable directement — masquer ou griser le composant via le parent si nécessaire               |

## Accessibilité

**Pattern** : Barre de progression (`role="progressbar"`, Radix Progress)

**Rôle** : `role="progressbar"` avec `aria-valuenow`, `aria-valuemin`, `aria-valuemax` ; sans `value`, la barre est indéterminée.

**Clavier** :

Aucune interaction clavier.

**Nom accessible** : Obligatoire : `aria-label` ou `aria-labelledby` (« Téléversement du fichier »). Sans nom, un lecteur d'écran annonce une barre anonyme.

**Vigilance** :

- Les changements de valeur ne sont pas annoncés en continu : annoncer les étapes clés (terminé, erreur) par un message `aria-live`.
- Afficher aussi la valeur en texte quand elle compte (« 45 % »).

## Exemple de code

```tsx
import { Progress } from "@/components/ui/progress"

export default function Example() {
  return <Progress value={66} aria-label="Progression du chargement" />
}
```

## Références croisées

- `Skeleton` — alternative pour indiquer un chargement sans valeur précise
- `Badge` — peut accompagner la barre pour afficher le pourcentage en texte
- `Card` — conteneur fréquent pour encapsuler une barre de progression avec son label
