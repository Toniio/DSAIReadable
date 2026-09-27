# Chart

## Metadata

| Champ         | Valeur                  |
| ------------- | ----------------------- |
| Nom           | Chart                   |
| Catégorie     | Data                    |
| Statut        | stable                  |
| figma_node_id |                         |
| code_path     | components/ui/chart.tsx |

## Rôle

Conteneur et utilitaires de visualisation de données basés sur `recharts`, fournissant un système de thème, des tooltips et une légende configurables via un objet `ChartConfig`.

## Usage

- Afficher des graphiques en barres, lignes, aires ou camemberts avec des données structurées
- Fournir un tooltip contextuel au survol des points de données
- Afficher une légende descriptive des séries de données
- Appliquer automatiquement les couleurs du thème (light/dark) aux séries via `ChartConfig`
- Encapsuler un graphique `recharts` dans un conteneur responsive

## Contraintes

- **MUST NOT** — présenter des données brutes à lire valeur par valeur → utiliser `Table`
- Le `ChartContainer` doit toujours recevoir un `config` valide avec au moins une entrée
- Les couleurs définies via `theme` dans `ChartConfig` prennent priorité sur `color`
- Chaque clé de `config` devient une variable `--color-<clé>`, injectée par `ChartStyle` : la lire dans les séries (`fill="var(--color-revenue)"`). Ce n'est pas un token : sa valeur vient de `config`
- Ne pas imbriquer plusieurs `ChartContainer` — chaque graphique doit avoir son propre conteneur
- Prévoir un texte alternatif ou un tableau de données associé pour l'accessibilité (les graphiques SVG ne sont pas lus par les lecteurs d'écran)

## Dépendances

- `recharts` — bibliothèque de graphiques (`ResponsiveContainer`, `Tooltip`, `Legend`, etc.)
- `cn` (`@/lib/utils`) — utilitaire de fusion de classes

## Anatomie

| Slot                | Rôle                                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| `data-slot="chart"` | Racine du conteneur, porte `data-chart` pour le ciblage CSS des couleurs |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                           | Classes et variables                                      | Où                                                              |
| ------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| `border-width.chart-indicator`  | `border-chart-indicator`                                  | `ChartTooltipContent`                                           |
| `border-width.default`          | `border`                                                  | `ChartTooltipContent`                                           |
| `color.background.default`      | `bg-background`                                           | `ChartTooltipContent`                                           |
| `color.background.subtle`       | `fill-muted`                                              | `ChartContainer`                                                |
| `color.border.default`          | `border-border/50` · `stroke-border` · `stroke-border/50` | `ChartContainer` · `ChartTooltipContent`                        |
| `color.text.default`            | `text-foreground`                                         | `ChartTooltipContent`                                           |
| `color.text.subtle`             | `fill-muted-foreground` · `text-muted-foreground`         | `ChartContainer` · `ChartLegendContent` · `ChartTooltipContent` |
| `elevation.xl`                  | `shadow-xl`                                               | `ChartTooltipContent`                                           |
| `radius.xs`                     | `rounded-xs`                                              | `ChartLegendContent` · `ChartTooltipContent`                    |
| `typography.font-weight.medium` | `font-medium`                                             | `ChartTooltipContent`                                           |
| `typography.size.xs`            | `text-xs`                                                 | `ChartContainer` · `ChartTooltipContent`                        |

Relevé dans `components/ui/chart.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `ChartContainer`

Rend `<div>`.

| Prop               | Type                                                                               | Défaut              | Description                                                      |
| ------------------ | ---------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------- |
| `children`         | `React.ComponentProps< typeof RechartsPrimitive.ResponsiveContainer >["children"]` | —                   | Composant `recharts` à rendre (ex. : `BarChart`, `LineChart`)    |
| `config`           | `ChartConfig`                                                                      | —                   | Configuration des séries (labels, couleurs, icônes) — **requis** |
| `initialDimension` | `{ width: number height: number }`                                                 | `INITIAL_DIMENSION` | Dimensions initiales avant le calcul responsive                  |
| `id`               | `string`                                                                           | auto-généré         | Identifiant unique pour le ciblage CSS des couleurs              |
| `className`        | `string`                                                                           | —                   | Classes CSS additionnelles                                       |
| `...props`         | `React.ComponentProps<"div">`                                                      | —                   | Props natives de `<div>`                                         |

### `ChartTooltip`

Type : `(outsideProps: RechartsPrimitive.TooltipProps<RechartsPrimitive.TooltipValueType, NameType>) => React.JSX.Element \| null`.

### `ChartTooltipContent`

Rend `<div>`.

| Prop            | Type                                                                                                                                                                                                     | Défaut  | Description                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------ |
| `hideLabel`     | `boolean`                                                                                                                                                                                                | `false` | Masque le label du tooltip           |
| `hideIndicator` | `boolean`                                                                                                                                                                                                | `false` | Masque l'indicateur de couleur       |
| `indicator`     | `"line" \| "dot" \| "dashed"`                                                                                                                                                                            | `"dot"` | Style de l'indicateur de couleur     |
| `nameKey`       | `string`                                                                                                                                                                                                 | —       | Clé utilisée pour le nom de la série |
| `labelKey`      | `string`                                                                                                                                                                                                 | —       | Clé utilisée pour le label           |
| `...props`      | `React.ComponentProps<typeof RechartsPrimitive.Tooltip> & React.ComponentProps<"div"> & Omit< RechartsPrimitive.DefaultTooltipContentProps< TooltipValueType, TooltipNameType >, "accessibilityLayer" >` | —       | Props de `RechartsPrimitive.Tooltip` |

### `ChartLegend`

Type : `React.MemoExoticComponent<(outsideProps: RechartsPrimitive.LegendProps) => React.ReactPortal \| null>`.

### `ChartLegendContent`

Rend `<div>`.

| Prop            | Type                                                                        | Défaut     | Description                          |
| --------------- | --------------------------------------------------------------------------- | ---------- | ------------------------------------ |
| `hideIcon`      | `boolean`                                                                   | `false`    | Masque l'icône dans la légende       |
| `nameKey`       | `string`                                                                    | —          | Clé utilisée pour le nom de la série |
| `verticalAlign` | `VerticalAlignmentType`                                                     | `"bottom"` | Position verticale de la légende     |
| `...props`      | `React.ComponentProps<"div"> & RechartsPrimitive.DefaultLegendContentProps` | —          | Props de `React.Component`           |

### `ChartStyle`

Rend `<style>`.

| Prop     | Type          | Défaut | Description                                                                                                   |
| -------- | ------------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| `id`     | `string`      | —      | Identifiant du graphique : les variables sont posées sous `[data-chart=<id>]`                                 |
| `config` | `ChartConfig` | —      | Configuration des séries : chaque entrée à `color` ou `theme` devient une variable `--color-<clé>`, par thème |

<!-- Fin de la partie générée. -->

### ChartConfig (type)

| Propriété | Type                              | Description                                     |
| --------- | --------------------------------- | ----------------------------------------------- |
| `label`   | `ReactNode`                       | Label affiché dans le tooltip et la légende     |
| `icon`    | `React.ComponentType`             | Icône optionnelle dans le tooltip et la légende |
| `color`   | `string`                          | Couleur CSS de la série (mode simple)           |
| `theme`   | `{ light: string; dark: string }` | Couleurs par thème (prioritaire sur `color`)    |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                                                   |
| -------- | --------------------------------------------------------------------------------------------- |
| default  | Graphique rendu avec les données et les couleurs du thème courant                             |
| hover    | Tooltip affiché au survol des éléments de données (barres, points, secteurs)                  |
| focus    | Les éléments internes `recharts` n'exposent pas de focus natif ; géré par le conteneur parent |
| active   | Élément de données survolé mis en évidence via le curseur `recharts`                          |
| disabled | Non applicable — masquer le composant ou afficher un état vide si pas de données              |

## Accessibilité

**Pattern** : Graphique SVG (Recharts) — pas de pattern APG

**Rôle** : SVG rendu par Recharts ; l'infobulle apparaît au survol.

**Clavier** :

Aucune interaction clavier garantie par `ChartContainer` : l'information ne doit pas dépendre du survol.

**Nom accessible** : Donner au graphique un titre visible ou un `aria-label` qui dit ce qu'il montre, et un résumé textuel de la conclusion.

**Vigilance** :

- Fournir les données sous une autre forme (tableau, texte) : un lecteur d'écran ne lit pas les barres.
- Palette catégorielle : distincte sous daltonisme (`npm run tokens:lint-chart`), mais doubler la couleur d'une légende ou d'étiquettes (voir `specs/foundations/color.md`).

## Exemple de code

```tsx
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis } from "recharts"

const config: ChartConfig = {
  revenue: {
    label: "Revenus",
    color: "var(--chart-1)",
  },
}

const data = [
  { month: "Jan", revenue: 186 },
  { month: "Fév", revenue: 305 },
  { month: "Mar", revenue: 237 },
]

export default function Example() {
  return (
    <ChartContainer config={config} className="min-h-[200px] w-full">
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <Bar dataKey="revenue" fill="var(--color-revenue)" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  )
}
```

## Références croisées

- `Card` — conteneur fréquent pour encapsuler un graphique avec titre et description
- `Table` — alternative tabulaire pour présenter les mêmes données en format accessible
- `Skeleton` — état de chargement avant l'affichage du graphique
