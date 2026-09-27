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

- Ne pas utiliser pour des tableaux de données brutes — préférer `Table` pour les données tabulaires
- Le `ChartContainer` doit toujours recevoir un `config` valide avec au moins une entrée
- Les couleurs définies via `theme` dans `ChartConfig` prennent priorité sur `color`
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

| Token                      | Usage                                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| `--color-muted-foreground` | Texte des axes et des labels dans le tooltip (`fill-muted-foreground`, `text-muted-foreground`) |
| `--color-border`           | Lignes de grille, curseur et lignes de référence (`stroke-border`, `stroke-border/50`)          |
| `--color-muted`            | Fond du secteur d'arrière-plan des barres radiales et curseur rectangle (`fill-muted`)          |
| `--color-background`       | Fond du tooltip (`bg-background`)                                                               |
| `--color-foreground`       | Texte des valeurs dans le tooltip (`text-foreground`)                                           |
| `--color-{key}`            | Couleurs dynamiques par série, générées via `ChartStyle` à partir de `ChartConfig`              |

## Props / API

### ChartContainer

| Prop               | Type                                | Défaut                        | Description                                                      |
| ------------------ | ----------------------------------- | ----------------------------- | ---------------------------------------------------------------- |
| `config`           | `ChartConfig`                       | —                             | Configuration des séries (labels, couleurs, icônes) — **requis** |
| `children`         | `ReactElement`                      | —                             | Composant `recharts` à rendre (ex. : `BarChart`, `LineChart`)    |
| `initialDimension` | `{ width: number; height: number }` | `{ width: 320, height: 200 }` | Dimensions initiales avant le calcul responsive                  |
| `id`               | `string`                            | auto-généré                   | Identifiant unique pour le ciblage CSS des couleurs              |
| `className`        | `string`                            | —                             | Classes CSS additionnelles                                       |

### ChartConfig (type)

| Propriété | Type                              | Description                                     |
| --------- | --------------------------------- | ----------------------------------------------- |
| `label`   | `ReactNode`                       | Label affiché dans le tooltip et la légende     |
| `icon`    | `React.ComponentType`             | Icône optionnelle dans le tooltip et la légende |
| `color`   | `string`                          | Couleur CSS de la série (mode simple)           |
| `theme`   | `{ light: string; dark: string }` | Couleurs par thème (prioritaire sur `color`)    |

### ChartTooltipContent

| Prop            | Type                          | Défaut  | Description                          |
| --------------- | ----------------------------- | ------- | ------------------------------------ |
| `indicator`     | `"dot" \| "line" \| "dashed"` | `"dot"` | Style de l'indicateur de couleur     |
| `hideLabel`     | `boolean`                     | `false` | Masque le label du tooltip           |
| `hideIndicator` | `boolean`                     | `false` | Masque l'indicateur de couleur       |
| `nameKey`       | `string`                      | —       | Clé utilisée pour le nom de la série |
| `labelKey`      | `string`                      | —       | Clé utilisée pour le label           |

### ChartLegendContent

| Prop            | Type                | Défaut     | Description                          |
| --------------- | ------------------- | ---------- | ------------------------------------ |
| `hideIcon`      | `boolean`           | `false`    | Masque l'icône dans la légende       |
| `nameKey`       | `string`            | —          | Clé utilisée pour le nom de la série |
| `verticalAlign` | `"top" \| "bottom"` | `"bottom"` | Position verticale de la légende     |

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
