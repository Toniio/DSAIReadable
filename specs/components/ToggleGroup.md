# ToggleGroup

## Metadata

| Champ         | Valeur                         |
| ------------- | ------------------------------ |
| Nom           | ToggleGroup                    |
| Catégorie     | Misc                           |
| Statut        | stable                         |
| figma_node_id |                                |
| code_path     | components/ui/toggle-group.tsx |

## Rôle

Groupe de boutons à bascule mutuellement exclusifs ou multi-sélection, basé sur Radix ToggleGroup, partageant variante et taille via contexte.

## Usage

- Basculer entre des vues (liste, grille, tableau)
- Sélectionner un filtre parmi plusieurs options exclusives
- Alterner un mode d'affichage (clair/sombre, compact/étendu)
- Permettre la multi-sélection de tags ou catégories (`type="multiple"`)
- Créer une barre d'outils de formatage (gras, italique, souligné)

## Contraintes

- Utiliser `type="single"` pour une sélection exclusive et `type="multiple"` pour la multi-sélection
- Fournir un `aria-label` sur le `ToggleGroup` pour décrire le groupe aux lecteurs d'écran
- Ne pas utiliser pour la navigation — préférer `Tabs` ou `NavigationMenu`
- Le `spacing={0}` (par défaut) fusionne les bordures ; avec `spacing > 0` les items sont espacés
- Les variantes et tailles sont propagées via contexte ; ne les surcharger sur `ToggleGroupItem` qu'en cas de besoin spécifique

## Dépendances

- `radix-ui` — `ToggleGroup` primitive (Root, Item)
- `class-variance-authority` — types `VariantProps`
- `toggleVariants` depuis `@/components/ui/toggle` — styles partagés avec le composant `Toggle`
- `cn` utilitaire depuis `@/lib/utils`

## Anatomie

| Slot                            | Rôle                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| `data-slot="toggle-group"`      | Racine du groupe, porte `data-variant`, `data-size`, `data-spacing`, `data-orientation` |
| `data-slot="toggle-group-item"` | Item individuel, porte `data-variant`, `data-size`, `data-spacing`                      |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                  | Classes et variables    | Où                |
| ---------------------- | ----------------------- | ----------------- |
| `border-width.default` | `border-l` · `border-t` | `ToggleGroupItem` |
| `zindex.dropdown`      | `z-dropdown`            | `ToggleGroupItem` |

Relevé dans `components/ui/toggle-group.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

Compose `Toggle` : les tokens de ce composant sont listés dans sa spec.

## Props / API

| Prop                | Type                                              | Défaut         | Description                                           |
| ------------------- | ------------------------------------------------- | -------------- | ----------------------------------------------------- |
| **ToggleGroup**     |                                                   |                |                                                       |
| `type`              | `"single" \| "multiple"`                          | —              | Mode de sélection (requis par Radix)                  |
| `variant`           | `"default" \| "outline"`                          | `"default"`    | Variante visuelle propagée aux items                  |
| `size`              | `"default" \| "sm" \| "lg"`                       | `"default"`    | Taille propagée aux items                             |
| `spacing`           | `number`                                          | `0`            | Espacement entre les items (en unités de `--spacing`) |
| `orientation`       | `"horizontal" \| "vertical"`                      | `"horizontal"` | Direction du groupe                                   |
| `value`             | `string \| string[]`                              | —              | Valeur(s) sélectionnée(s) (contrôlé)                  |
| `defaultValue`      | `string \| string[]`                              | —              | Valeur(s) initiale(s) (non contrôlé)                  |
| `onValueChange`     | `(value: string \| string[]) => void`             | —              | Callback de changement de sélection                   |
| `className`         | `string`                                          | —              | Classes CSS additionnelles                            |
| `...props`          | `React.ComponentProps<ToggleGroupPrimitive.Root>` | —              | Props Radix Root                                      |
| **ToggleGroupItem** |                                                   |                |                                                       |
| `value`             | `string`                                          | —              | Valeur unique de l'item (requis)                      |
| `variant`           | `"default" \| "outline"`                          | `"default"`    | Surcharge locale de la variante                       |
| `size`              | `"default" \| "sm" \| "lg"`                       | `"default"`    | Surcharge locale de la taille                         |
| `className`         | `string`                                          | —              | Classes CSS additionnelles                            |
| `...props`          | `React.ComponentProps<ToggleGroupPrimitive.Item>` | —              | Props Radix Item                                      |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

| Composant     | Axe       | Valeurs                 | Défaut    |
| ------------- | --------- | ----------------------- | --------- |
| `ToggleGroup` | `variant` | `default` · `outline`   | `default` |
| `ToggleGroup` | `size`    | `default` · `sm` · `lg` | `default` |

Le sens de chaque axe (apparence, intention, taille…) est donné dans **Props / API**.

## États

| État      | Description                                                    |
| --------- | -------------------------------------------------------------- |
| default   | Item non sélectionné, style hérité de `toggleVariants`         |
| hover     | Fond atténué selon la variante (hérité de `toggleVariants`)    |
| focus     | Z-index `z-dropdown`, anneau de focus visible                  |
| pressed   | Item sélectionné (`data-state="on"`), fond et texte actifs     |
| disabled  | Opacité réduite, interaction impossible (`data-disabled`)      |
| spacing-0 | Bordures fusionnées, arrondis supprimés sur les bords internes |
| vertical  | Empilement vertical des items                                  |

## Accessibilité

**Pattern** : [Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) (`type="single"`) ou groupe de bascules (`type="multiple"`) — Radix ToggleGroup

**Rôle** : `role="group"` ; en `single`, chaque élément porte `role="radio"` et `aria-checked` ; en `multiple`, `aria-pressed`.

**Clavier** :

| Touche                                                  | Action                               |
| ------------------------------------------------------- | ------------------------------------ |
| `Tab`                                                   | Entre dans le groupe (un seul arrêt) |
| `ArrowRight` / `ArrowLeft` (ou `ArrowDown` / `ArrowUp`) | Élément suivant / précédent          |
| `Home` / `End`                                          | Premier / dernier élément            |
| `Enter` / `Space`                                       | Active ou désactive l'élément        |

**Nom accessible** : Nommer le groupe (`aria-label` : « Alignement du texte ») ; chaque élément icône seule exige un `aria-label`.

**Vigilance** :

- Pour un choix exclusif présenté comme des boutons, `type="single"` donne la sémantique radio attendue.

## Exemple de code

```tsx
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ListIcon, GridIcon, TableIcon } from "@phosphor-icons/react"

export default function Example() {
  return (
    <ToggleGroup
      type="single"
      defaultValue="list"
      variant="outline"
      size="default"
    >
      <ToggleGroupItem value="list" aria-label="Vue liste">
        <ListIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" aria-label="Vue grille">
        <GridIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Vue tableau">
        <TableIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
```

## Références croisées

- `Toggle` — composant individuel dont `ToggleGroup` réutilise les `toggleVariants`
- `ButtonGroup` — alternative pour des actions non mutuellement exclusives
- `Tabs` — alternative pour la navigation entre vues avec contenu associé
