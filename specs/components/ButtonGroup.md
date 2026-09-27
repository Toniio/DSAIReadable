# ButtonGroup

## Metadata

| Champ         | Valeur                         |
| ------------- | ------------------------------ |
| Nom           | ButtonGroup                    |
| Catégorie     | Misc                           |
| Statut        | stable                         |
| figma_node_id |                                |
| code_path     | components/ui/button-group.tsx |

## Rôle

Conteneur regroupant visuellement plusieurs boutons, inputs ou selects adjacents en fusionnant leurs bordures et arrondis.

## Usage

- Regrouper des actions liées (ex. : « Précédent / Suivant »)
- Combiner un champ de saisie et un bouton d'action (ex. : recherche avec bouton « Go »)
- Assembler un select et un bouton dans une barre d'outils compacte
- Disposer des boutons en colonne avec l'orientation `vertical`
- Séparer visuellement des sous-groupes avec `ButtonGroupSeparator`

## Contraintes

- **MUST NOT** — grouper des actions sans lien logique → les espacer simplement (`flex gap-*`)
- **MUST NOT** — grouper plus de 5 boutons
- **MUST** — réserver `orientation="vertical"` aux barres d'outils latérales
- **MUST** — n'y placer que des enfants dont les bordures peuvent fusionner : les arrondis intermédiaires sont supprimés
- **Note** — un groupe imbriqué (`has-[>[data-slot=button-group]]`) reçoit un `gap-2` automatique

## Dépendances

- `class-variance-authority` pour les variantes d'orientation
- `Slot.Root` de `radix-ui` (utilisé par `ButtonGroupText` quand `asChild={true}`)
- `Separator` depuis `@/components/ui/separator`
- `cn` utilitaire depuis `@/lib/utils`

## Anatomie

| Slot                                 | Rôle                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| `data-slot="button-group"`           | Racine du groupe, porte `data-orientation` et `role="group"` |
| `data-slot="button-group-separator"` | Séparateur visuel entre les éléments du groupe               |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                           | Classes et variables | Où                     |
| ------------------------------- | -------------------- | ---------------------- |
| `border-width.default`          | `border`             | `ButtonGroupText`      |
| `color.background.subtle`       | `bg-muted`           | `ButtonGroupText`      |
| `color.border.input`            | `bg-input`           | `ButtonGroupSeparator` |
| `typography.font-weight.medium` | `font-medium`        | `ButtonGroupText`      |
| `typography.size.xs`            | `text-xs`            | `ButtonGroupText`      |
| `zindex.dropdown`               | `z-dropdown`         | `buttonGroupVariants`  |

Relevé dans `components/ui/button-group.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

Compose `Separator` : les tokens de ce composant sont listés dans sa spec.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `ButtonGroup`

Rend `<div>`.

| Prop          | Type                          | Défaut         | Description                           |
| ------------- | ----------------------------- | -------------- | ------------------------------------- |
| `orientation` | `"horizontal" \| "vertical"`  | `"horizontal"` | Direction de l'empilement des enfants |
| `className`   | `string`                      | —              | Classes CSS additionnelles            |
| `...props`    | `React.ComponentProps<"div">` | —              | Props natives de `<div>`              |

### `ButtonGroupSeparator`

Rend `Separator`.

| Prop          | Type                                     | Défaut       | Description                |
| ------------- | ---------------------------------------- | ------------ | -------------------------- |
| `orientation` | `"horizontal" \| "vertical"`             | `"vertical"` | Direction du séparateur    |
| `className`   | `string`                                 | —            | Classes CSS additionnelles |
| `...props`    | `React.ComponentProps<typeof Separator>` | —            | Props de `Separator`       |

### `ButtonGroupText`

Rend `<div>`, ou son enfant avec `asChild`.

| Prop        | Type                          | Défaut  | Description                                       |
| ----------- | ----------------------------- | ------- | ------------------------------------------------- |
| `asChild`   | `boolean`                     | `false` | Délègue le rendu au premier enfant via Radix Slot |
| `className` | `string`                      | —       | Classes CSS additionnelles                        |
| `...props`  | `React.ComponentProps<"div">` | —       | Props natives de `<div>`                          |

### `buttonGroupVariants`

Fonction `cva` : renvoie les classes d'une combinaison de ses axes (voir **Variantes**), pour donner ce style à un autre élément.

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

| Composant     | Axe           | Valeurs                   | Défaut       |
| ------------- | ------------- | ------------------------- | ------------ |
| `ButtonGroup` | `orientation` | `horizontal` · `vertical` | `horizontal` |

Le sens de chaque axe (apparence, intention, taille…) est donné dans **Props / API**.

## États

| État         | Description                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------- |
| default      | Groupe horizontal, bordures fusionnées, arrondis aux extrémités                                 |
| vertical     | Empilement vertical, fusion des bordures haut/bas                                               |
| focus-within | L'enfant en focus passe en `z-dropdown` pour afficher son anneau de focus au-dessus des voisins |
| hover        | Délégué aux composants enfants (Button, Select, etc.)                                           |
| disabled     | Délégué aux composants enfants                                                                  |

## Accessibilité

**Pattern** : Groupe (`role="group"`)

**Rôle** : `role="group"` sur la racine ; chaque bouton garde sa sémantique.

**Clavier** :

| Touche              | Action                                                      |
| ------------------- | ----------------------------------------------------------- |
| `Tab` / `Shift+Tab` | Passe d'un bouton à l'autre (pas de navigation aux flèches) |

**Nom accessible** : Donner un `aria-label` au groupe quand sa fonction n'est pas évidente (« Mise en forme du texte »).

**Vigilance** :

- Pour un choix exclusif entre options, utiliser `ToggleGroup`, qui porte l'état sélectionné ; `ButtonGroup` ne fait que regrouper visuellement.

## Exemple de code

```tsx
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"

export default function Example() {
  return (
    <ButtonGroup orientation="horizontal">
      <Button variant="outline">Précédent</Button>
      <ButtonGroupSeparator />
      <Button variant="outline">Suivant</Button>
    </ButtonGroup>
  )
}
```

## Références croisées

- `Button` — enfant principal du groupe
- `Separator` — utilisé en interne par `ButtonGroupSeparator`
- `Select` — peut être combiné avec des boutons dans le groupe
- `Input` — champ de saisie intégrable dans le groupe (flex-1)
- `ToggleGroup` — alternative pour des choix mutuellement exclusifs
