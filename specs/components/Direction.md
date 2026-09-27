# Direction

## Metadata

| Champ         | Valeur                      |
| ------------- | --------------------------- |
| Nom           | Direction                   |
| Catégorie     | Layout                      |
| Statut        | stable                      |
| figma_node_id |                             |
| code_path     | components/ui/direction.tsx |

## Rôle

Fournisseur de contexte qui propage la direction de lecture (LTR/RTL) à l'ensemble des composants enfants.

## Usage

- Encapsuler l'application ou une section pour supporter les langues RTL (arabe, hébreu, etc.)
- Fournir la direction de lecture aux composants Radix qui en dépendent (Sidebar, Tooltip, Popover…)
- Permettre un changement dynamique de direction sans recharger la page
- Tester l'affichage RTL en développement

## Contraintes

- Ne pas utiliser plusieurs `DirectionProvider` imbriqués avec des directions contradictoires
- Doit être placé au-dessus de tous les composants Radix qui nécessitent la direction
- Ne remplace pas l'attribut HTML `dir` sur `<html>` — les deux doivent être cohérents
- Composant utilitaire uniquement : ne génère aucun rendu visuel propre
- **Seul composant du système sans `data-slot`** : il ne rend aucun nœud DOM propre, donc aucun élément ne peut porter l'attribut. L'exception est déclarée dans le code par `// no-data-slot:` et vérifiée par `npm run index:data-slot`. Cibler la direction via l'attribut `dir` que Radix pose sur les composants consommateurs

## Dépendances

- `Direction.DirectionProvider` et `Direction.useDirection` de `radix-ui`

## Anatomie

| Slot | Rôle                                                                           |
| ---- | ------------------------------------------------------------------------------ |
| —    | Aucun slot ; le composant est un fournisseur de contexte sans rendu DOM propre |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

Aucun token : `components/ui/direction.tsx` n'emploie aucune classe ni variable qui mène à un token sémantique.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `DirectionProvider`

Rend `Direction.DirectionProvider`.

| Prop        | Type                                                              | Défaut | Description                                                                       |
| ----------- | ----------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------- |
| `direction` | `React.ComponentProps<typeof Direction.DirectionProvider>["dir"]` | —      | Alias de `dir` pour une API plus explicite ; prioritaire si les deux sont fournis |
| `dir`       | `Direction`                                                       | —      | Direction de lecture (prop native Radix)                                          |
| `children`  | `React.ReactNode`                                                 | —      | Arbre de composants enfants                                                       |
| `...props`  | `React.ComponentProps<typeof Direction.DirectionProvider>`        | —      | Props de `Direction.DirectionProvider`                                            |

### `useDirection`

Type : `(localDir?: Direction) => Direction`.

<!-- Fin de la partie générée. -->

### Hook exporté

| Hook           | Retour           | Description                                                      |
| -------------- | ---------------- | ---------------------------------------------------------------- |
| `useDirection` | `"ltr" \| "rtl"` | Retourne la direction courante depuis le contexte le plus proche |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                                     |
| -------- | ----------------------------------------------- |
| default  | Propage la direction définie à tous les enfants |
| hover    | — (non applicable)                              |
| focus    | — (non applicable)                              |
| active   | — (non applicable)                              |
| disabled | — (non applicable)                              |

## Accessibilité

**Pattern** : Aucun — fournisseur de contexte

**Rôle** : Aucun rendu : transmet `dir` (`ltr` / `rtl`) aux primitives Radix.

**Clavier** :

Aucune interaction ; en `rtl`, les primitives inversent le sens des flèches horizontales.

**Nom accessible** : Sans objet.

**Vigilance** :

- Poser aussi l'attribut `dir` (et `lang`) sur le document : le fournisseur n'informe que les composants Radix, pas les lecteurs d'écran.

## Exemple de code

```tsx
import { DirectionProvider } from "@/components/ui/direction"

export default function App({ children }: { children: React.ReactNode }) {
  return <DirectionProvider direction="ltr">{children}</DirectionProvider>
}
```

## Références croisées

- `Sidebar` — consomme la direction pour le positionnement left/right
- `Tooltip`, `Popover`, `DropdownMenu` — utilisent la direction pour le placement
