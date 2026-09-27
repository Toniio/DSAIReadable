# Carousel

## Metadata

| Champ         | Valeur                     |
| ------------- | -------------------------- |
| Nom           | Carousel                   |
| Catégorie     | Data                       |
| Statut        | stable                     |
| figma_node_id |                            |
| code_path     | components/ui/carousel.tsx |

## Rôle

Conteneur de défilement horizontal ou vertical permettant de naviguer entre des slides via des boutons ou le clavier, basé sur `embla-carousel`.

## Usage

- Présenter une galerie d'images ou de cartes avec défilement (ex. : produits, témoignages)
- Afficher un carrousel de contenus promotionnels ou informatifs
- Naviguer entre des étapes visuelles ou des aperçus de contenu
- Mettre en avant des éléments dans un espace contraint avec navigation précédent/suivant
- Proposer un défilement vertical pour des listes de contenu empilées

## Contraintes

- **MUST NOT** — porter un contenu critique, qui doit être visible sans interaction → une grille
- **MUST NOT** — afficher plus d'un `Carousel` par vue : leurs navigations clavier entrent en conflit
- Les boutons précédent/suivant doivent rester accessibles ; ne pas masquer les contrôles de navigation
- Fournir un `aria-label` descriptif sur le conteneur pour les lecteurs d'écran
- Le composant nécessite `CarouselContent` et au moins un `CarouselItem` comme enfants
- Chaînes par défaut en anglais issues de `UI_STRINGS.carousel` — surcharger via `srLabel` sur `CarouselPrevious` / `CarouselNext`

## Dépendances

- `embla-carousel-react` — moteur de carrousel et types (`UseEmblaCarouselType`)
- `Button` (`@/components/ui/button`) — boutons de navigation précédent/suivant
- `CaretLeftIcon`, `CaretRightIcon` (`@phosphor-icons/react`) — icônes de navigation
- `cn` (`@/lib/utils`) — utilitaire de fusion de classes

## Anatomie

| Slot                            | Rôle                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `data-slot="carousel"`          | Racine du composant, porte `role="region"` et `aria-roledescription="carousel"` |
| `data-slot="carousel-content"`  | Conteneur scrollable des slides (ref `embla`)                                   |
| `data-slot="carousel-item"`     | Slide individuel, porte `role="group"` et `aria-roledescription="slide"`        |
| `data-slot="carousel-previous"` | Bouton de navigation vers la slide précédente                                   |
| `data-slot="carousel-next"`     | Bouton de navigation vers la slide suivante                                     |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

Aucun token : `components/ui/carousel.tsx` n'emploie aucune classe ni variable qui mène à un token sémantique.

Compose `Button` : les tokens de ce composant sont listés dans sa spec.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Carousel`

Rend `<div>`.

| Prop          | Type                                           | Défaut         | Description                                                          |
| ------------- | ---------------------------------------------- | -------------- | -------------------------------------------------------------------- |
| `opts`        | `CarouselOptions`                              | —              | Options de configuration `embla-carousel` (boucle, alignement, etc.) |
| `plugins`     | `CarouselPlugin`                               | —              | Plugins `embla-carousel` (autoplay, etc.)                            |
| `orientation` | `"horizontal" \| "vertical"`                   | `"horizontal"` | Direction du défilement                                              |
| `setApi`      | `(api: CarouselApi) => void`                   | —              | Callback pour récupérer l'instance API du carrousel                  |
| `className`   | `string`                                       | —              | Classes CSS additionnelles sur le conteneur racine                   |
| `children`    | `React.ReactNode`                              | —              | Contenu du carrousel (`CarouselContent`, boutons, etc.)              |
| `...props`    | `React.ComponentProps<"div"> & CarouselConfig` | —              | Props de `React.Component`                                           |

### `CarouselContent`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `CarouselItem`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `CarouselPrevious`

Rend `Button`.

| Prop        | Type                                                                                 | Défaut                         | Description                                                            |
| ----------- | ------------------------------------------------------------------------------------ | ------------------------------ | ---------------------------------------------------------------------- |
| `variant`   | `"link" \| "default" \| "destructive" \| "outline" \| "secondary" \| "ghost"`        | `"outline"`                    | Variante visuelle du bouton                                            |
| `size`      | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"` | `"icon-sm"`                    | Taille du bouton                                                       |
| `srLabel`   | `string`                                                                             | `UI_STRINGS.carousel.previous` | Texte lu par les lecteurs d'écran ; remplace la valeur de `UI_STRINGS` |
| `className` | `string`                                                                             | —                              | Classes CSS additionnelles                                             |
| `...props`  | `React.ComponentProps<typeof Button>`                                                | —                              | Props de `Button`                                                      |

### `CarouselNext`

Rend `Button`.

| Prop       | Type                                                                                 | Défaut                     | Description                                                            |
| ---------- | ------------------------------------------------------------------------------------ | -------------------------- | ---------------------------------------------------------------------- |
| `variant`  | `"link" \| "default" \| "destructive" \| "outline" \| "secondary" \| "ghost"`        | `"outline"`                | Prop de `Button`, voir sa spec                                         |
| `size`     | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"` | `"icon-sm"`                | Prop de `Button`, voir sa spec                                         |
| `srLabel`  | `string`                                                                             | `UI_STRINGS.carousel.next` | Texte lu par les lecteurs d'écran ; remplace la valeur de `UI_STRINGS` |
| `...props` | `React.ComponentProps<typeof Button>`                                                | —                          | Props de `Button`                                                      |

### `useCarousel()`

Retourne `CarouselContextProps`.

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                                                     |
| -------- | ------------------------------------------------------------------------------- |
| default  | Première slide visible, boutons de navigation affichés selon la position        |
| hover    | Boutons de navigation réagissent au survol (via variante `outline` du `Button`) |
| focus    | Navigation clavier via `ArrowLeft` / `ArrowRight` pour changer de slide         |
| active   | Slide courante visible dans le viewport du carrousel                            |
| disabled | Bouton précédent/suivant désactivé quand la limite de défilement est atteinte   |

## Accessibilité

**Pattern** : [Carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) (Embla)

**Rôle** : `role="region"` avec `aria-roledescription="carousel"` ; chaque diapositive `role="group"` avec `aria-roledescription="slide"`.

**Clavier** :

| Touche                     | Action                                                                  |
| -------------------------- | ----------------------------------------------------------------------- |
| `ArrowLeft` / `ArrowRight` | Diapositive précédente / suivante, quand le focus est dans le carrousel |
| `Tab`                      | Atteint les boutons précédent / suivant et le contenu des diapositives  |

**Nom accessible** : Les boutons précédent / suivant sont nommés par `UI_STRINGS.carousel.previous` / `.next`. Donner un `aria-label` au carrousel lui-même (« Produits similaires »).

**Vigilance** :

- Pas de défilement automatique sans bouton pause : un contenu qui bouge seul plus de 5 s doit pouvoir être arrêté (WCAG 2.2.2).
- Le contenu des diapositives hors écran reste atteignable au clavier : vérifier que l'ordre de tabulation reste compréhensible.

## Exemple de code

```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"

export default function Example() {
  return (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
        <CarouselItem>Slide 3</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
```

## Références croisées

- `Card` — contenu fréquent à l'intérieur des slides
- `Button` — utilisé pour les contrôles de navigation
- `AspectRatio` — utile pour maintenir les proportions d'images dans les slides
