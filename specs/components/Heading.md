# Heading

## Metadata

| Champ         | Valeur                    |
| ------------- | ------------------------- |
| Nom           | Heading                   |
| Catégorie     | Typography                |
| Statut        | stable                    |
| figma_node_id |                           |
| code_path     | components/ui/heading.tsx |

## Rôle

Titre sémantique (h1–h4) avec quatre tailles visuelles et la police heading.

## Usage

- Titre de page ("Se connecter", "Tableau de bord")
- Titre de section dans une Card ou un Panel
- Sous-titres dans les formulaires multi-étapes

## Contraintes

- **MUST NOT** — sauter un niveau de titre (un `h3` sous un `h1`)
- **MUST NOT** — placer plus d'un `h1` par page
- **MUST** — n'utiliser `as` que si le niveau sémantique diffère du niveau visuel
- **MUST NOT** — styler un titre à la main : passer par `level`

## Dépendances

- `class-variance-authority` pour la gestion des variantes de `level`
- `cn` (`@/lib/utils`) pour la fusion des classes

## Anatomie

| Slot                  | Rôle                                             |
| --------------------- | ------------------------------------------------ |
| `data-slot="heading"` | Élément heading natif (h1–h4), unique nœud rendu |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                             | Classes et variables | Où                        |
| --------------------------------- | -------------------- | ------------------------- |
| `typography.font-weight.semibold` | `font-semibold`      | `headingVariants`         |
| `typography.letter-spacing.tight` | `tracking-tight`     | `headingVariants`         |
| `typography.size.2xl`             | `text-2xl`           | `headingVariants.level.1` |
| `typography.size.base`            | `text-base`          | `headingVariants.level.4` |
| `typography.size.lg`              | `text-lg`            | `headingVariants.level.3` |
| `typography.size.xl`              | `text-xl`            | `headingVariants.level.2` |

Relevé dans `components/ui/heading.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Heading`

Rend `<h{level}>`, ou l'élément choisi par `as`.

| Prop        | Type                         | Défaut              | Description                                                    |
| ----------- | ---------------------------- | ------------------- | -------------------------------------------------------------- |
| `level`     | `1 \| 2 \| 3 \| 4`           | `1`                 | Niveau hiérarchique et taille visuelle                         |
| `as`        | `` `h${HeadingLevel}` ``     | auto (= `h{level}`) | Override du tag HTML si le niveau sémantique diffère du visuel |
| `className` | `string`                     | —                   | Classes CSS additionnelles                                     |
| `...props`  | `React.ComponentProps<"h1">` | —                   | Props natives de `<h1>`                                        |

### `headingVariants`

Fonction `cva` : renvoie les classes d'une combinaison de ses axes (voir **Variantes**), pour donner ce style à un autre élément.

<!-- Fin de la partie générée. -->

Correspondance `level` → taille. La graisse est `font-semibold` et la
gouttière `tracking-tight` à tous les niveaux, aucun niveau ne les redéfinit.

| Level | Classe      | Tag par défaut |
| ----- | ----------- | -------------- |
| 1     | `text-2xl`  | `h1`           |
| 2     | `text-xl`   | `h2`           |
| 3     | `text-lg`   | `h3`           |
| 4     | `text-base` | `h4`           |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

| Composant | Axe     | Valeurs               | Défaut |
| --------- | ------- | --------------------- | ------ |
| `Heading` | `level` | `1` · `2` · `3` · `4` | `1`    |

Le sens de chaque axe (apparence, intention, taille…) est donné dans **Props / API**.

## États

| État       | Comportement visuel                                                      |
| ---------- | ------------------------------------------------------------------------ |
| `default`  | Texte `font-heading font-semibold tracking-tight` à la taille du `level` |
| `hover`    | Non applicable                                                           |
| `focus`    | Non applicable — élément non focusable                                   |
| `active`   | Non applicable                                                           |
| `disabled` | Non applicable                                                           |
| `loading`  | Non applicable                                                           |
| `error`    | Non applicable                                                           |

## Accessibilité

**Pattern** : Titre natif `h1`–`h4`

**Rôle** : Rend `h{level}` ; `as` permet un niveau sémantique différent du niveau visuel.

**Clavier** :

Aucune interaction clavier ; les lecteurs d'écran naviguent de titre en titre.

**Nom accessible** : Le texte du titre.

**Vigilance** :

- Un seul `h1` par page, et pas de saut de niveau (`h2` → `h4`).
- Choisir `level` pour la hiérarchie et utiliser `as` quand le style et la structure divergent — pas l'inverse.

## Exemple de code

```tsx
import { Heading } from "@/components/ui/heading"

export default function Example() {
  return (
    <>
      <Heading level={1}>Tableau de bord</Heading>
      <Heading level={3} as="h2">
        Activité récente
      </Heading>
    </>
  )
}
```

## Références croisées

- `Card` — `CardHeader` accueille fréquemment un `Heading`
- `Logo` — partage la famille `--font-heading`
- `Separator` — sépare souvent deux sections introduites par un `Heading`
