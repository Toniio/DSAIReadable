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

- **MUST NOT** — servir à une mise en page à largeurs fixes → une grille CSS (`grid`)
- **MUST** — donner un `minSize` à chaque `ResizablePanel`, pour que son contenu ne soit jamais écrasé
- **MUST NOT** — retirer au `ResizableHandle` son focus ou sa commande aux flèches
- **MUST NOT** — imbriquer plus de 2 niveaux de `ResizablePanelGroup`
- **MUST NOT** — mêler les orientations `vertical` et `horizontal` au même niveau

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

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                      | Classes et variables                     | Où                                                  |
| -------------------------- | ---------------------------------------- | --------------------------------------------------- |
| `color.background.default` | `ring-offset-background`                 | `ResizableHandle`                                   |
| `color.border.default`     | `bg-border`                              | `ResizableHandle`                                   |
| `color.border.focus`       | `border-ring` · `ring-ring/50`           | `ResizableHandle` via `FOCUS_RING` (`lib/focus.ts`) |
| `space.focus-ring-width`   | `ring-(length:--space-focus-ring-width)` | `ResizableHandle` via `FOCUS_RING` (`lib/focus.ts`) |
| `zindex.dropdown`          | `z-dropdown`                             | `ResizableHandle`                                   |

Relevé dans `components/ui/resizable.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `ResizableHandle`

Rend `ResizablePrimitive.Separator`.

| Prop         | Type                                | Défaut  | Description                                         |
| ------------ | ----------------------------------- | ------- | --------------------------------------------------- |
| `withHandle` | `boolean`                           | `false` | Affiche un indicateur visuel de poignée (barre 6×1) |
| `className`  | `string`                            | —       | Classes CSS additionnelles                          |
| `...props`   | `ResizablePrimitive.SeparatorProps` | —       | Props de `ResizablePrimitive.Separator`             |

### `ResizablePanel`

Rend `ResizablePrimitive.Panel`.

| Prop          | Type                            | Défaut | Description                         |
| ------------- | ------------------------------- | ------ | ----------------------------------- |
| `defaultSize` | `string \| number`              | —      | Taille initiale en pourcentage      |
| `minSize`     | `string \| number`              | —      | Taille minimale en pourcentage      |
| `maxSize`     | `string \| number`              | —      | Taille maximale en pourcentage      |
| `...props`    | `ResizablePrimitive.PanelProps` | —      | Props de `ResizablePrimitive.Panel` |

### `ResizablePanelGroup`

Rend `ResizablePrimitive.Group`.

| Prop          | Type                            | Défaut         | Description                         |
| ------------- | ------------------------------- | -------------- | ----------------------------------- |
| `orientation` | `"horizontal" \| "vertical"`    | `"horizontal"` | Orientation du groupe de panneaux   |
| `className`   | `string`                        | —              | Classes CSS additionnelles          |
| `...props`    | `ResizablePrimitive.GroupProps` | —              | Props de `ResizablePrimitive.Group` |

<!-- Fin de la partie générée. -->

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
