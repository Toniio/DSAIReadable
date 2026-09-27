# ScrollArea

## Metadata

| Champ         | Valeur                        |
| ------------- | ----------------------------- |
| Nom           | ScrollArea                    |
| Catégorie     | Layout                        |
| Statut        | stable                        |
| figma_node_id |                               |
| code_path     | components/ui/scroll-area.tsx |

## Rôle

Zone de défilement personnalisée avec des barres de défilement stylisées, remplaçant les scrollbars natives du navigateur.

## Usage

- Conteneur de listes longues avec défilement vertical (menus, listes de fichiers)
- Zone de défilement horizontal pour des carrousels ou tableaux larges
- Intérieur d'un panneau latéral, d'un dropdown ou d'un dialogue au contenu variable
- Offrir une expérience de défilement cohérente entre navigateurs et OS
- Combinaison avec `ResizablePanel` pour du contenu défilant dans un panneau redimensionnable

## Contraintes

- Ne pas utiliser pour le défilement principal de la page — laisser le `<body>` gérer le scroll natif
- Le conteneur parent doit avoir une hauteur définie (fixe ou flex) pour que le défilement fonctionne
- Éviter d'imbriquer plusieurs `ScrollArea` — cela crée une expérience confuse
- Le contenu focusable à l'intérieur doit rester accessible au clavier

## Dépendances

- `ScrollArea.Root`, `ScrollArea.Viewport`, `ScrollArea.ScrollAreaScrollbar`, `ScrollArea.ScrollAreaThumb`, `ScrollArea.Corner` de `radix-ui`
- `cn` de `@/lib/utils`

## Anatomie

| Slot                                | Rôle                                                         |
| ----------------------------------- | ------------------------------------------------------------ |
| `data-slot="scroll-area"`           | Racine du composant, conteneur `relative`                    |
| `data-slot="scroll-area-viewport"`  | Zone de viewport scrollable contenant les enfants            |
| `data-slot="scroll-area-scrollbar"` | Barre de défilement personnalisée (verticale ou horizontale) |
| `data-slot="scroll-area-thumb"`     | Poignée de la barre de défilement                            |

## Tokens utilisés

| Token          | Usage                                                  |
| -------------- | ------------------------------------------------------ |
| `bg-border`    | Fond de la poignée de défilement (`scroll-area-thumb`) |
| `ring-ring/50` | Anneau de focus sur le viewport (`focus-visible`)      |
| `ring-focus`   | Style de focus du viewport                             |

## Props / API

### ScrollArea

| Prop        | Type                                                    | Défaut | Description                              |
| ----------- | ------------------------------------------------------- | ------ | ---------------------------------------- |
| `className` | `string`                                                | —      | Classes CSS additionnelles sur la racine |
| `children`  | `React.ReactNode`                                       | —      | Contenu scrollable                       |
| `...props`  | `React.ComponentProps<typeof ScrollAreaPrimitive.Root>` | —      | Toutes les props du primitif Radix       |

### ScrollBar

| Prop          | Type                                                                   | Défaut       | Description                            |
| ------------- | ---------------------------------------------------------------------- | ------------ | -------------------------------------- |
| `orientation` | `"vertical" \| "horizontal"`                                           | `"vertical"` | Direction de la barre de défilement    |
| `className`   | `string`                                                               | —            | Classes CSS additionnelles             |
| `...props`    | `React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>` | —            | Toutes les props de la scrollbar Radix |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                   |
| -------- | ------------------------------------------------------------- |
| default  | Barre de défilement masquée, apparaît au survol ou au scroll  |
| hover    | Barre de défilement visible avec transition de couleur        |
| focus    | Anneau de focus sur le viewport lors de la navigation clavier |
| active   | Poignée en cours de glissement                                |
| disabled | — (non applicable directement)                                |

## Accessibilité

**Pattern** : Zone défilante (Radix ScrollArea)

**Rôle** : Un `viewport` à défilement natif ; les barres personnalisées sont décoratives.

**Clavier** :

Défilement natif à la molette, au toucher, et au clavier quand un élément focalisable est à l'intérieur.

**Nom accessible** : Si la zone ne contient rien de focalisable, lui donner `tabIndex={0}`, `role="region"` et un `aria-label`.

**Vigilance** :

- Une zone défilante sans élément focalisable n'est pas atteignable au clavier (WCAG 2.1.1) — voir ci-dessus.
- Ne pas imbriquer de zones défilantes dans le même axe.

## Exemple de code

```tsx
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export default function Example() {
  return (
    <ScrollArea className="h-72 w-48 rounded-none border">
      <div className="p-4">
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i} className="text-sm">
            Élément {i + 1}
          </p>
        ))}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  )
}
```

## Références croisées

- `ResizablePanel` — combine souvent un `ScrollArea` pour le contenu défilant
- `Sidebar` — utilise un pattern de défilement similaire pour le contenu
- `DropdownMenu`, `Select` — utilisent un défilement interne pour les longues listes
