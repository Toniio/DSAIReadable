# Card

## Metadata

| Champ         | Valeur                 |
| ------------- | ---------------------- |
| Nom           | Card                   |
| Catégorie     | Layout                 |
| Statut        | stable                 |
| figma_node_id |                        |
| code_path     | components/ui/card.tsx |

## Rôle

Conteneur surfacé regroupant un titre, une description, du contenu et un pied de page dans une structure cohérente.

## Usage

- Encapsuler le formulaire de connexion dans une surface délimitée
- Présenter une entité (profil, paramètre, notification) avec ses actions associées
- Regrouper visuellement des informations hétérogènes sur un tableau de bord
- Utiliser `data-size="sm"` pour les cartes compactes dans des listes denses

## Contraintes

- **MUST NOT** — imbriquer des `Card` sur plus d'un niveau : marquer la hiérarchie par un fond différent
- **MUST NOT** — placer un contenu long dans `CardAction`, positionné en haut à droite de l'en-tête
- **MUST NOT** — placer plus de 2 actions dans `CardFooter`
- **MUST NOT** — poser `onClick` sur une `Card` : l'envelopper dans un `<a>` ou un `<button>` si elle est cliquable

## Dépendances

- Aucune dépendance de composant interne obligatoire
- `Button` — action typique dans `CardFooter` ou `CardAction`
- `Separator` — peut être utilisé à l'intérieur de `CardContent`

## Anatomie

| Slot                           | Rôle                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| `data-slot="card"`             | `<div>` racine, porte `data-size`                            |
| `data-slot="card-header"`      | En-tête en grille, accueille titre, description et action    |
| `data-slot="card-title"`       | Titre principal de la carte                                  |
| `data-slot="card-description"` | Description ou sous-titre en couleur subtile                 |
| `data-slot="card-action"`      | Zone d'action positionnée en haut à droite du header         |
| `data-slot="card-content"`     | Corps principal de la carte                                  |
| `data-slot="card-footer"`      | Pied de carte avec bordure supérieure, alignement horizontal |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                            | Classes et variables                          | Où                         |
| -------------------------------- | --------------------------------------------- | -------------------------- |
| `border-width.default`           | `border-t`                                    | `CardFooter`               |
| `color.background.subtle`        | `bg-card`                                     | `Card`                     |
| `color.text.default`             | `ring-foreground/10` · `text-card-foreground` | `Card`                     |
| `color.text.subtle`              | `text-muted-foreground`                       | `CardDescription`          |
| `typography.font-weight.medium`  | `font-medium`                                 | `CardTitle`                |
| `typography.line-height.relaxed` | `text-xs/relaxed`                             | `CardDescription` · `Card` |
| `typography.size.sm`             | `text-sm`                                     | `CardTitle`                |
| `typography.size.xs`             | `text-xs/relaxed`                             | `CardDescription` · `Card` |

Relevé dans `components/ui/card.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Card`

Rend `<div>`.

| Prop        | Type                          | Défaut      | Description                                                                            |
| ----------- | ----------------------------- | ----------- | -------------------------------------------------------------------------------------- |
| `size`      | `"default" \| "sm"`           | `"default"` | Taille de la carte : `gap-4 py-4` vs `gap-2 py-3`. Rendue en `data-size` sur la racine |
| `className` | `string`                      | —           | Classes CSS additionnelles                                                             |
| `...props`  | `React.ComponentProps<"div">` | —           | Props natives de `<div>`                                                               |

### `CardHeader`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `CardFooter`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `CardTitle`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `CardAction`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `CardDescription`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

### `CardContent`

Rend `<div>`.

| Prop        | Type                          | Défaut | Description                |
| ----------- | ----------------------------- | ------ | -------------------------- |
| `className` | `string`                      | —      | Classes CSS additionnelles |
| `...props`  | `React.ComponentProps<"div">` | —      | Props natives de `<div>`   |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État       | Comportement visuel                                                               |
| ---------- | --------------------------------------------------------------------------------- |
| `default`  | Fond `bg-card`, anneau `ring-1 ring-foreground/10`, coins carrés (`rounded-none`) |
| `hover`    | Pas de style dédié (Card n'est pas interactif par défaut)                         |
| `focus`    | Non applicable                                                                    |
| `active`   | Non applicable                                                                    |
| `disabled` | Non applicable                                                                    |
| `loading`  | Gérer via un skeleton dans `CardContent`                                          |
| `error`    | Non applicable — utiliser `Alert` dans `CardContent`                              |

## Accessibilité

**Pattern** : Aucun — conteneur de mise en page

**Rôle** : Aucun rôle : des `div`. `CardTitle` n'est pas un élément de titre.

**Clavier** :

Aucune interaction clavier propre.

**Nom accessible** : Sans objet. Si la carte est une section de page, envelopper son titre dans un titre de niveau adapté (`Heading`).

**Vigilance** :

- Une carte entièrement cliquable doit contenir un vrai lien (dont la zone peut être étendue), pas un `onClick` sur le conteneur.
- `CardTitle` étant un `div`, il n'apparaît pas dans la liste des titres d'un lecteur d'écran.

## Exemple de code

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Se connecter</CardTitle>
        <CardDescription>
          Entrez vos identifiants pour continuer.
        </CardDescription>
      </CardHeader>
      <CardContent>{/* formulaire */}</CardContent>
      <CardFooter>
        <Button type="submit">Connexion</Button>
      </CardFooter>
    </Card>
  )
}
```

## Références croisées

- `Button` — action principale dans `CardFooter` ou `CardAction`
- `Alert` — à placer dans `CardContent` pour les messages d'état
- `Separator` — séparation visuelle optionnelle dans `CardContent`
- `Field` / `Input` — contenu de formulaire typique dans `CardContent`
