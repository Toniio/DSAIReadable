# Skeleton

## Metadata

| Champ         | Valeur                     |
| ------------- | -------------------------- |
| Nom           | Skeleton                   |
| Catégorie     | Layout                     |
| Statut        | stable                     |
| figma_node_id |                            |
| code_path     | components/ui/skeleton.tsx |

## Rôle

Placeholder animé de chargement qui représente la forme du contenu à venir, réduisant la perception de latence.

## Usage

- Afficher un squelette pendant le chargement de données asynchrones
- Remplacer temporairement du texte, des images ou des cartes en attendant le rendu final
- Construire des squelettes de page complets en combinant plusieurs `Skeleton`
- Utiliser dans les listes (ex. `SidebarMenuSkeleton`) pour prévisualiser la structure
- Améliorer le ressenti utilisateur en évitant les écrans blancs ou spinners

## Contraintes

- Ne pas utiliser comme état permanent — le squelette doit être remplacé par le contenu réel
- Préférer des dimensions proches du contenu final pour éviter un décalage de layout (CLS)
- Ne pas animer les squelettes si l'utilisateur a activé `prefers-reduced-motion`
- Limiter le nombre de squelettes visibles simultanément pour ne pas surcharger visuellement

## Dépendances

- `cn` de `@/lib/utils`

## Anatomie

| Slot                   | Rôle                                        |
| ---------------------- | ------------------------------------------- |
| `data-slot="skeleton"` | Élément `<div>` avec animation de pulsation |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                     | Classes et variables | Où         |
| ------------------------- | -------------------- | ---------- |
| `color.background.subtle` | `bg-muted`           | `Skeleton` |

Relevé dans `components/ui/skeleton.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

| Prop        | Type                          | Défaut | Description                                                  |
| ----------- | ----------------------------- | ------ | ------------------------------------------------------------ |
| `className` | `string`                      | —      | Classes CSS additionnelles (dimensions, border-radius, etc.) |
| `...props`  | `React.ComponentProps<"div">` | —      | Toutes les props natives du `<div>`                          |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                               |
| -------- | ----------------------------------------- |
| default  | Animation `pulse` active, fond `bg-muted` |
| hover    | — (pas d'interaction utilisateur)         |
| focus    | — (non focusable)                         |
| active   | — (non applicable)                        |
| disabled | — (non applicable)                        |

## Accessibilité

**Pattern** : Aucun — espace réservé visuel

**Rôle** : Un `div` sans rôle.

**Clavier** :

Aucune interaction.

**Nom accessible** : Sans objet.

**Vigilance** :

- Annoncer le chargement ailleurs : `aria-busy="true"` sur le conteneur, ou un `Spinner` (qui porte `role="status"`).
- Les squelettes n'ont pas de sens pour un lecteur d'écran : masquer leur conteneur (`aria-hidden`) s'ils sont nombreux.

## Exemple de code

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function Example() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  )
}
```

## Références croisées

- `SidebarMenuSkeleton` — utilise `Skeleton` en interne pour les éléments de menu
- `Card` — souvent accompagné de squelettes pour le chargement
- `AspectRatio` — peut contenir un `Skeleton` en attendant l'image
- `Avatar` — le fallback peut être un `Skeleton` circulaire
