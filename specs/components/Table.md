# Table

## Metadata

| Champ         | Valeur                  |
| ------------- | ----------------------- |
| Nom           | Table                   |
| Catégorie     | Data                    |
| Statut        | stable                  |
| figma_node_id |                         |
| code_path     | components/ui/table.tsx |

## Rôle

Ensemble de composants pour construire des tableaux de données sémantiques avec en-têtes, corps, pied de page et légende, supportant le défilement horizontal.

## Usage

- Afficher des données tabulaires structurées (ex. : liste d'utilisateurs, factures, résultats)
- Présenter des données comparatives avec colonnes triables
- Construire des tableaux de bord avec sélection de lignes (via checkbox)
- Afficher un récapitulatif avec pied de page (totaux, moyennes)
- Ajouter une légende descriptive via `TableCaption`

## Contraintes

- Ne pas utiliser pour la mise en page — les tableaux sont réservés aux données tabulaires uniquement
- Le conteneur gère le défilement horizontal (`overflow-x-auto`) ; ne pas ajouter de scroll parent redondant
- Limiter le nombre de colonnes visibles pour rester lisible sur mobile (préférer le scroll horizontal)
- Les cellules avec `role="checkbox"` reçoivent un padding réduit automatiquement (`pr-0`)
- Fournir un `TableCaption` ou un `aria-label` pour l'accessibilité quand le contexte du tableau n'est pas évident

## Dépendances

- `cn` (`@/lib/utils`) — utilitaire de fusion de classes
- Aucune dépendance externe (composants natifs HTML `table`, `thead`, `tbody`, etc.)

## Anatomie

| Slot                          | Rôle                                         |
| ----------------------------- | -------------------------------------------- |
| `data-slot="table-container"` | Conteneur wrapper avec défilement horizontal |
| `data-slot="table"`           | Élément `<table>` racine                     |
| `data-slot="table-header"`    | En-tête du tableau (`<thead>`)               |
| `data-slot="table-body"`      | Corps du tableau (`<tbody>`)                 |
| `data-slot="table-footer"`    | Pied de page du tableau (`<tfoot>`)          |
| `data-slot="table-row"`       | Ligne du tableau (`<tr>`)                    |
| `data-slot="table-head"`      | Cellule d'en-tête (`<th>`)                   |
| `data-slot="table-cell"`      | Cellule de données (`<td>`)                  |
| `data-slot="table-caption"`   | Légende du tableau (`<caption>`)             |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                           | Classes et variables       | Où                                         |
| ------------------------------- | -------------------------- | ------------------------------------------ |
| `border-width.default`          | `border-b` · `border-t`    | `TableFooter` · `TableHeader` · `TableRow` |
| `color.background.subtle`       | `bg-muted` · `bg-muted/50` | `TableFooter` · `TableRow`                 |
| `color.text.default`            | `text-foreground`          | `TableHead`                                |
| `color.text.subtle`             | `text-muted-foreground`    | `TableCaption`                             |
| `typography.font-weight.medium` | `font-medium`              | `TableFooter` · `TableHead`                |
| `typography.size.xs`            | `text-xs`                  | `TableCaption` · `Table`                   |

Relevé dans `components/ui/table.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

### Table

| Prop        | Type                            | Défaut | Description                              |
| ----------- | ------------------------------- | ------ | ---------------------------------------- |
| `className` | `string`                        | —      | Classes CSS additionnelles sur `<table>` |
| `...props`  | `React.ComponentProps<"table">` | —      | Toutes les props natives de `<table>`    |

### TableHeader

| Prop        | Type     | Défaut | Description                              |
| ----------- | -------- | ------ | ---------------------------------------- |
| `className` | `string` | —      | Classes CSS additionnelles sur `<thead>` |

### TableBody

| Prop        | Type     | Défaut | Description                              |
| ----------- | -------- | ------ | ---------------------------------------- |
| `className` | `string` | —      | Classes CSS additionnelles sur `<tbody>` |

### TableFooter

| Prop        | Type     | Défaut | Description                              |
| ----------- | -------- | ------ | ---------------------------------------- |
| `className` | `string` | —      | Classes CSS additionnelles sur `<tfoot>` |

### TableRow

| Prop        | Type     | Défaut | Description                           |
| ----------- | -------- | ------ | ------------------------------------- |
| `className` | `string` | —      | Classes CSS additionnelles sur `<tr>` |

### TableHead

| Prop        | Type     | Défaut | Description                           |
| ----------- | -------- | ------ | ------------------------------------- |
| `className` | `string` | —      | Classes CSS additionnelles sur `<th>` |

### TableCell

| Prop        | Type     | Défaut | Description                           |
| ----------- | -------- | ------ | ------------------------------------- |
| `className` | `string` | —      | Classes CSS additionnelles sur `<td>` |

### TableCaption

| Prop        | Type     | Défaut | Description                                |
| ----------- | -------- | ------ | ------------------------------------------ |
| `className` | `string` | —      | Classes CSS additionnelles sur `<caption>` |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------ |
| default  | Tableau affiché avec bordures inférieures sur chaque ligne                                             |
| hover    | Ligne survolée avec fond `bg-muted/50` pour le retour visuel                                           |
| focus    | Non géré au niveau du tableau — le focus est sur les éléments interactifs internes (checkbox, boutons) |
| active   | Ligne avec `aria-expanded` ouvre un fond `bg-muted/50` ; `data-[state=selected]` applique `bg-muted`   |
| disabled | Non applicable directement — gérer la désactivation au niveau des cellules interactives                |

## Accessibilité

**Pattern** : Tableau natif `table`

**Rôle** : Sémantique native : `table`, `thead`, `th`, `td` ; `TableCaption` rend `caption`.

**Clavier** :

Aucune interaction propre ; les lecteurs d'écran parcourent les cellules avec leurs raccourcis.

**Nom accessible** : `TableCaption` nomme le tableau ; à défaut, `aria-label` ou `aria-labelledby`.

**Vigilance** :

- Poser `scope="col"` / `scope="row"` sur les `TableHead` des tableaux à double entrée.
- Un en-tête triable doit exposer `aria-sort` et être un bouton : le composant ne le fait pas.
- Ne pas utiliser `Table` pour de la mise en page.

## Exemple de code

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table"

export default function Example() {
  return (
    <Table>
      <TableCaption>Liste des factures récentes</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Référence</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Montant</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>INV-001</TableCell>
          <TableCell>Payée</TableCell>
          <TableCell className="text-right">250,00 €</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>INV-002</TableCell>
          <TableCell>En attente</TableCell>
          <TableCell className="text-right">150,00 €</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
```

## Références croisées

- `Checkbox` — utilisé dans les cellules pour la sélection de lignes
- `Badge` — utilisé dans les cellules pour afficher des statuts
- `Pagination` — partenaire fréquent pour paginer les données du tableau
- `Chart` — alternative visuelle pour représenter les mêmes données sous forme graphique
