# Empty

## Metadata

| Champ         | Valeur                  |
| ------------- | ----------------------- |
| Nom           | Empty                   |
| Catégorie     | Feedback                |
| Statut        | stable                  |
| figma_node_id |                         |
| code_path     | components/ui/empty.tsx |

## Rôle

État vide composable affiché lorsqu'une vue, liste ou section ne contient aucune donnée.

## Usage

- Indiquer qu'une liste ou un tableau ne contient aucun résultat
- Proposer une action de création lorsqu'une collection est vide
- Afficher un message d'accueil sur un dashboard sans données
- Remplacer un contenu en attente de données initiales
- Communiquer un état « zéro résultat » après un filtrage

## Contraintes

- **MUST NOT** — signaler une erreur serveur → utiliser `Alert` en `variant="destructive"`
- **MUST NOT** — afficher plus d'un `Empty` par vue
- **MUST NOT** — placer dans `EmptyMedia` une information essentielle : le média est décoratif
- **MUST NOT** — dépasser deux phrases de description ; la formuler autour de l'action à mener
- **MUST** — `EmptyTitle` rend un `<h2>` : passer `as` (`"h3"`…) pour suivre la hiérarchie de la page — un niveau sous le titre de la section qui contient l'état vide. Ne pas styler via `as` : l'apparence est fixe

## Dépendances

- `class-variance-authority` pour les variantes de `EmptyMedia`
- `cn` utilitaire depuis `@/lib/utils`

## Anatomie

| Slot                            | Rôle                                                  |
| ------------------------------- | ----------------------------------------------------- |
| `data-slot="empty"`             | Conteneur racine, centrage et espacement              |
| `data-slot="empty-header"`      | Bloc d'en-tête regroupant média, titre et description |
| `data-slot="empty-icon"`        | Média / icône décorative (porte `data-variant`)       |
| `data-slot="empty-title"`       | Titre principal de l'état vide (`<h2>` par défaut)    |
| `data-slot="empty-description"` | Description complémentaire                            |
| `data-slot="empty-content"`     | Zone d'actions (boutons, liens)                       |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                             | Classes et variables          | Où                                  |
| --------------------------------- | ----------------------------- | ----------------------------------- |
| `color.action.background.default` | `text-primary`                | `EmptyDescription`                  |
| `color.background.subtle`         | `bg-muted`                    | `emptyMediaVariants.variant.icon`   |
| `color.text.default`              | `text-foreground`             | `emptyMediaVariants.variant.icon`   |
| `color.text.subtle`               | `text-muted-foreground`       | `EmptyDescription`                  |
| `typography.font-weight.medium`   | `font-medium`                 | `EmptyTitle`                        |
| `typography.line-height.relaxed`  | `text-xs/relaxed`             | `EmptyDescription`                  |
| `typography.size.sm`              | `text-sm`                     | `EmptyTitle`                        |
| `typography.size.xs`              | `text-xs` · `text-xs/relaxed` | `EmptyContent` · `EmptyDescription` |

Relevé dans `components/ui/empty.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Empty`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `EmptyHeader`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `EmptyTitle`

Rend `<h2>`, ou l'élément choisi par `as`.

| Prop        | Type                                           | Défaut | Description                                       |
| ----------- | ---------------------------------------------- | ------ | ------------------------------------------------- |
| `as`        | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | `"h2"` | Niveau de titre rendu ; ne change pas l'apparence |
| `className` | `string`                                       | —      | Classes CSS additionnelles                        |
| `...props`  | `React.ComponentProps<"h2">`                   | —      | Props natives de `<h2>`                           |

### `EmptyDescription`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `EmptyContent`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `EmptyMedia`

Rend `<div>`.

| Prop        | Type                          | Défaut      | Description                  |
| ----------- | ----------------------------- | ----------- | ---------------------------- |
| `variant`   | `"default" \| "icon"`         | `"default"` | Apparence du conteneur média |
| `className` | `string`                      | —           | Classes CSS additionnelles   |
| `...props`  | `React.ComponentProps<"div">` | —           | Props natives de `<div>`     |

<!-- Fin de la partie générée. -->

> **Axes de variantes** — `Empty` n'a pas de `variant`. Seul `EmptyMedia` en porte un, sur l'axe **type de média** : `default` pour une illustration libre, `icon` pour une icône Phosphor centrée dans un cercle.

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

| Composant    | Axe       | Valeurs            | Défaut    |
| ------------ | --------- | ------------------ | --------- |
| `EmptyMedia` | `variant` | `default` · `icon` | `default` |

Le sens de chaque axe (apparence, intention, taille…) est donné dans **Props / API**.

## États

| État     | Description                                                 |
| -------- | ----------------------------------------------------------- |
| default  | Conteneur centré avec bordure en pointillé, texte équilibré |
| hover    | Non applicable (composant passif)                           |
| focus    | Non applicable (composant passif)                           |
| active   | Non applicable (composant passif)                           |
| disabled | Non applicable (composant passif)                           |

## Accessibilité

**Pattern** : Aucun — état vide composé

**Rôle** : Des `div`, sauf `EmptyTitle` : un titre natif (`<h2>` par défaut, niveau réglable par `as`), listé par les lecteurs d'écran.

**Clavier** :

Aucune interaction propre ; les actions placées dans `EmptyContent` sont focalisables.

**Nom accessible** : Sans objet ; le texte d'`EmptyTitle` est le titre de l'état vide.

**Vigilance** :

- Régler `as` sur la hiérarchie réelle : le `<h2>` par défaut suppose que l'état vide occupe une vue titrée en `h1`. Dans une section en `h2`, passer `as="h3"`.
- Ne pas envelopper `EmptyTitle` dans un `Heading` : cela imbriquerait deux titres.
- Si l'état vide apparaît après une action (recherche sans résultat), l'annoncer par une région `aria-live`.
- L'illustration de `EmptyMedia` est décorative sauf si elle porte une information : `alt=""` par défaut.

## Exemple de code

```tsx
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { PlusIcon, FolderIcon } from "@phosphor-icons/react"

export default function Example() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderIcon />
        </EmptyMedia>
        <EmptyTitle>Aucun projet</EmptyTitle>
        <EmptyDescription>
          Vous n'avez pas encore créé de projet. Commencez dès maintenant.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">
          <PlusIcon /> Créer un projet
        </Button>
      </EmptyContent>
    </Empty>
  )
}
```

## Références croisées

- `Button` — action principale placée dans `EmptyContent`
- `Card` — peut encapsuler un `Empty` dans un conteneur visuel
