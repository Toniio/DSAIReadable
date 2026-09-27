# Resizable

## Metadata

| Champ         | Valeur                      |
| ------------- | --------------------------- |
| Nom           | Resizable                   |
| Catégorie     | Layout                      |
| Statut        | stable                      |
| figma_node_id |                             |
| code_path     | components/ui/resizable.tsx |

## Rôle

Système de panneaux redimensionnables permettant de diviser une zone en sections ajustables par l'utilisateur via des poignées de séparation.

## Usage

- Créer un layout multi-panneaux redimensionnable (éditeur de code, explorateur de fichiers)
- Diviser un écran en colonnes ou lignes ajustables
- Permettre à l'utilisateur de personnaliser la répartition de l'espace
- Implémenter des interfaces de type IDE avec des panneaux latéraux redimensionnables
- Combiner des panneaux horizontaux et verticaux imbriqués

## Contraintes

- Ne pas utiliser pour des mises en page simples à largeur fixe — préférer un grid CSS
- Les panneaux doivent avoir des tailles minimales pour éviter le contenu écrasé
- Le `ResizableHandle` doit être clavier-accessible (focus + flèches)
- Limiter la profondeur d'imbrication des groupes pour éviter les conflits de redimensionnement
- Orientation `vertical` et `horizontal` ne doivent pas être mélangées au même niveau

## Dépendances

- `react-resizable-panels` (`Group`, `Panel`, `Separator`)
- `cn` de `@/lib/utils`

## Anatomie

| Slot                                | Rôle                                                       |
| ----------------------------------- | ---------------------------------------------------------- |
| `data-slot="resizable-panel-group"` | Conteneur principal, gère l'orientation et la distribution |
| `data-slot="resizable-panel"`       | Panneau individuel redimensionnable                        |
| `data-slot="resizable-handle"`      | Poignée de séparation entre deux panneaux                  |

## Tokens utilisés

| Token                    | Usage                                                       |
| ------------------------ | ----------------------------------------------------------- |
| `bg-border`              | Fond de la poignée de séparation et de l'indicateur visuel  |
| `ring-ring`              | Anneau de focus sur la poignée (`focus-visible`)            |
| `ring-offset-background` | Décalage de l'anneau de focus                               |
| `z-dropdown`             | Z-index de l'indicateur visuel de la poignée (`withHandle`) |

## Props / API

### ResizablePanelGroup

| Prop          | Type                            | Défaut         | Description                                         |
| ------------- | ------------------------------- | -------------- | --------------------------------------------------- |
| `orientation` | `"horizontal" \| "vertical"`    | `"horizontal"` | Orientation du groupe de panneaux                   |
| `className`   | `string`                        | —              | Classes CSS additionnelles                          |
| `...props`    | `ResizablePrimitive.GroupProps` | —              | Toutes les props du groupe `react-resizable-panels` |

### ResizablePanel

| Prop          | Type                            | Défaut | Description                    |
| ------------- | ------------------------------- | ------ | ------------------------------ |
| `defaultSize` | `number`                        | —      | Taille initiale en pourcentage |
| `minSize`     | `number`                        | —      | Taille minimale en pourcentage |
| `maxSize`     | `number`                        | —      | Taille maximale en pourcentage |
| `...props`    | `ResizablePrimitive.PanelProps` | —      | Toutes les props du panneau    |

### ResizableHandle

| Prop         | Type                                | Défaut  | Description                                         |
| ------------ | ----------------------------------- | ------- | --------------------------------------------------- |
| `withHandle` | `boolean`                           | `false` | Affiche un indicateur visuel de poignée (barre 6×1) |
| `className`  | `string`                            | —       | Classes CSS additionnelles                          |
| `...props`   | `ResizablePrimitive.SeparatorProps` | —       | Toutes les props du séparateur                      |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                           |
| -------- | --------------------------------------------------------------------- |
| default  | Panneaux affichés à leur taille par défaut, poignée visible           |
| hover    | Zone de la poignée élargie visuellement (zone de clic `after` de 4px) |
| focus    | Anneau `ring-1 ring-ring` sur la poignée via `focus-visible`          |
| active   | Redimensionnement en cours — curseur de resize actif                  |
| disabled | — (non géré nativement ; désactiver via props du groupe)              |

## Accessibilité

**Pattern** : [Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) (react-resizable-panels)

**Rôle** : Chaque poignée porte `role="separator"`, focalisable, avec sa valeur courante.

**Clavier** :

| Touche                                                  | Action                                |
| ------------------------------------------------------- | ------------------------------------- |
| `ArrowLeft` / `ArrowRight` (ou `ArrowUp` / `ArrowDown`) | Redimensionne selon l'orientation     |
| `Home` / `End`                                          | Taille minimale / maximale du panneau |

**Nom accessible** : Donner un `aria-label` aux poignées quand plusieurs coexistent (« Largeur de la barre latérale »).

**Vigilance** :

- Le redimensionnement n'est pas indispensable pour lire le contenu : chaque panneau doit rester utilisable à sa taille par défaut.

## Exemple de code

```tsx
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function Example() {
  return (
    <ResizablePanelGroup orientation="horizontal" className="min-h-[200px]">
      <ResizablePanel defaultSize={50} minSize={20}>
        <div className="p-4">Panneau gauche</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={20}>
        <div className="p-4">Panneau droit</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
```

## Références croisées

- `Sidebar` — alternative pour un panneau latéral collapsible avec navigation
- `Separator` — séparateur visuel statique (non interactif)
- `ScrollArea` — souvent utilisé à l'intérieur d'un `ResizablePanel` pour le défilement
