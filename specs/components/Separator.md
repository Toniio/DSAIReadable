# Separator

## Metadata

| Champ         | Valeur                      |
| ------------- | --------------------------- |
| Nom           | Separator                   |
| Catégorie     | Layout                      |
| Statut        | stable                      |
| figma_node_id |                             |
| code_path     | components/ui/separator.tsx |

## Rôle

Ligne de séparation visuelle horizontale ou verticale permettant de diviser des sections de contenu, basée sur Radix `Separator`.

## Usage

- Séparer visuellement deux sections dans une `Card` ou un formulaire
- Diviser des éléments de liste ou de navigation en groupes logiques
- Créer un séparateur "ou" entre deux options de connexion (ex. : "Ou continuer avec")
- Utiliser l'orientation `vertical` pour séparer des éléments en ligne (ex. : barre d'outils)

## Contraintes

- Utiliser `decorative={true}` (défaut) pour les séparateurs purement visuels — `aria-hidden="true"` est automatiquement appliqué
- Utiliser `decorative={false}` uniquement si la séparation a une signification sémantique (ex. : séparation entre deux sections distinctes d'un article)
- Ne pas multiplier les séparateurs dans une vue — utiliser l'espacement (`gap`) comme alternative quand possible
- La hauteur (`h-px`) et la largeur (`w-px`) sont fixes ; ne pas les surcharger pour maintenir la cohérence visuelle

## Dépendances

- `Separator` (primitive) de `radix-ui` — gère `aria-orientation` et `aria-hidden`

## Anatomie

| Slot                    | Rôle                                                            |
| ----------------------- | --------------------------------------------------------------- |
| `data-slot="separator"` | Élément racine Radix `Separator.Root`, porte `data-orientation` |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                  | Classes et variables | Où          |
| ---------------------- | -------------------- | ----------- |
| `color.border.default` | `bg-border`          | `Separator` |

Relevé dans `components/ui/separator.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Separator`

Rend `SeparatorPrimitive.Root`.

| Prop          | Type                                                   | Défaut         | Description                                                                                                      |
| ------------- | ------------------------------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| `orientation` | `"horizontal" \| "vertical"`                           | `"horizontal"` | Direction du séparateur : `h-px w-full` vs `w-px self-stretch`                                                   |
| `decorative`  | `boolean`                                              | `true`         | Si `true`, applique `aria-hidden="true"` (séparateur purement visuel) ; si `false`, le séparateur est sémantique |
| `className`   | `string`                                               | —              | Classes CSS additionnelles                                                                                       |
| `...props`    | `React.ComponentProps<typeof SeparatorPrimitive.Root>` | —              | Props de `SeparatorPrimitive.Root`                                                                               |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État       | Comportement visuel                                                             |
| ---------- | ------------------------------------------------------------------------------- |
| `default`  | Ligne `bg-border`, `h-px w-full` (horizontal) ou `w-px self-stretch` (vertical) |
| `hover`    | Non applicable                                                                  |
| `focus`    | Non applicable                                                                  |
| `active`   | Non applicable                                                                  |
| `disabled` | Non applicable                                                                  |
| `loading`  | Non applicable                                                                  |
| `error`    | Non applicable                                                                  |

## Accessibilité

**Pattern** : Séparateur (Radix Separator)

**Rôle** : Décoratif par défaut (`role="none"`) ; `decorative={false}` donne `role="separator"` et `aria-orientation`.

**Clavier** :

Aucune interaction clavier.

**Nom accessible** : Sans objet.

**Vigilance** :

- Garder le défaut décoratif sauf si le séparateur délimite réellement deux groupes de contenu.

## Exemple de code

```tsx
import { Separator } from "@/components/ui/separator"

export default function Example() {
  return (
    <div className="flex flex-col gap-4">
      <p>Connexion avec e-mail</p>
      <div className="flex items-center gap-2">
        <Separator />
        <span className="text-xs whitespace-nowrap text-muted-foreground">
          ou
        </span>
        <Separator />
      </div>
      <p>Connexion avec SSO</p>
    </div>
  )
}
```

## Références croisées

- `Card` — séparateur entre `CardContent` et `CardFooter`
- `Field` / `FieldSet` — séparation optionnelle entre groupes de champs
- `NavigationMenu` — séparation entre groupes de navigation
