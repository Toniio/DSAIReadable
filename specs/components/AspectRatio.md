# AspectRatio

## Metadata

| Champ         | Valeur                         |
| ------------- | ------------------------------ |
| Nom           | AspectRatio                    |
| Catégorie     | Layout                         |
| Statut        | stable                         |
| figma_node_id |                                |
| code_path     | components/ui/aspect-ratio.tsx |

## Rôle

Conteneur qui impose un rapport largeur/hauteur fixe à son contenu (images, vidéos, cartes embed).

## Usage

- Afficher une image ou une vidéo dans un ratio constant (16/9, 4/3, 1/1, etc.)
- Garantir la cohérence visuelle d'une grille de vignettes
- Encadrer un contenu embed (iframe, carte) sans décalage de mise en page
- Réserver l'espace d'un média avant son chargement, pour qu'il ne décale pas la mise en page (_cumulative layout shift_)

## Contraintes

- **MUST NOT** — contenir du texte libre : il serait tronqué ou déborderait
- **MUST** — remplir le cadre avec un enfant en `absolute` (`size-full`) ou un média en `object-cover`
- **MUST** — passer un seul enfant direct ; envelopper plusieurs éléments dans un conteneur

## Dépendances

- `AspectRatio.Root` de `radix-ui`

## Anatomie

| Slot                       | Rôle                                                      |
| -------------------------- | --------------------------------------------------------- |
| `data-slot="aspect-ratio"` | Racine du composant, applique le ratio via padding-bottom |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

Aucun token : `components/ui/aspect-ratio.tsx` n'emploie aucune classe ni variable qui mène à un token sémantique.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `AspectRatio`

Rend `AspectRatioPrimitive.Root`.

| Prop        | Type                                                     | Défaut | Description                          |
| ----------- | -------------------------------------------------------- | ------ | ------------------------------------ |
| `ratio`     | `number`                                                 | `1`    | Rapport largeur/hauteur (ex. `16/9`) |
| `className` | `string`                                                 | —      | Classes CSS additionnelles           |
| `...props`  | `React.ComponentProps<typeof AspectRatioPrimitive.Root>` | —      | Props de `AspectRatioPrimitive.Root` |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État     | Description                              |
| -------- | ---------------------------------------- |
| default  | Le conteneur s'affiche au ratio spécifié |
| hover    | — (pas d'état hover propre)              |
| focus    | — (pas d'état focus propre)              |
| active   | — (pas d'état active propre)             |
| disabled | — (non applicable)                       |

## Accessibilité

**Pattern** : Aucun — conteneur de mise en page

**Rôle** : Aucun rôle : un `div` qui fixe le ratio de son enfant.

**Clavier** :

Aucune interaction clavier.

**Nom accessible** : Porté par le contenu : une image enfant a son `alt` (vide si décorative), une vidéo ses sous-titres.

**Vigilance** :

- Le recadrage ne doit pas masquer une information essentielle de l'image.

## Exemple de code

```tsx
import { AspectRatio } from "@/components/ui/aspect-ratio"

export default function Example() {
  return (
    <AspectRatio ratio={16 / 9}>
      <img
        src="/placeholder.jpg"
        alt="Paysage"
        className="size-full rounded-none object-cover"
      />
    </AspectRatio>
  )
}
```

## Références croisées

- `Card` — utilise souvent un `AspectRatio` pour l'image d'en-tête
- `Skeleton` — peut remplacer le contenu en attendant le chargement
