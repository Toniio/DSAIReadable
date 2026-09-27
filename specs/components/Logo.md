# Logo

## Metadata

| Champ         | Valeur                 |
| ------------- | ---------------------- |
| Nom           | Logo                   |
| Catégorie     | Brand                  |
| Statut        | stable                 |
| figma_node_id |                        |
| code_path     | components/ui/logo.tsx |

## Rôle

Marque visuelle de l'application. Le composant rend le pictogramme seul ; il est un placeholder à remplacer par les vrais assets brand une fois fournis.

## Usage

- En-tête de page de login
- Navigation principale (sidebar, topbar)
- Pied de page

## Contraintes

- Toujours utiliser le composant `Logo` plutôt que d'insérer un SVG à la main
- Ne pas déformer les proportions — passer par la prop `size`
- Le composant n'affiche pas de logotype textuel : les enfants passés en props ne sont pas rendus. Pour accoler un nom de marque, le placer à côté du `Logo`
- Le composant est un placeholder — remplacer par les vrais assets brand une fois disponibles

## Dépendances

- `cn` (`@/lib/utils`) pour la fusion des classes
- Aucune dépendance externe — le pictogramme est un SVG interne

## Anatomie

| Slot               | Rôle                                                      |
| ------------------ | --------------------------------------------------------- |
| `data-slot="logo"` | Conteneur `inline-flex`, porte `data-size`                |
| icon (div)         | Carré `bg-primary` centrant le pictogramme, `aria-hidden` |
| svg                | Pictogramme éclair, `currentColor`                        |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                                | Classes et variables      | Où     |
| ------------------------------------ | ------------------------- | ------ |
| `color.action.background.default`    | `bg-primary`              | `Logo` |
| `color.action.background.foreground` | `text-primary-foreground` | `Logo` |
| `typography.font-weight.bold`        | `font-bold`               | `Logo` |
| `typography.letter-spacing.tight`    | `tracking-tight`          | `Logo` |
| `typography.size.2xl`                | `text-2xl`                | `Logo` |
| `typography.size.base`               | `text-base`               | `Logo` |
| `typography.size.xl`                 | `text-xl`                 | `Logo` |

Relevé dans `components/ui/logo.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

## Props / API

| Prop        | Type                          | Défaut      | Description                                     |
| ----------- | ----------------------------- | ----------- | ----------------------------------------------- |
| `size`      | `"sm" \| "default" \| "lg"`   | `"default"` | Taille du pictogramme, propagée via `data-size` |
| `className` | `string`                      | —           | Classes CSS additionnelles                      |
| `...props`  | `React.ComponentProps<"div">` | —           | Props natives du `<div>`, hors `children`       |

| `size`    | Carré     | Pictogramme |
| --------- | --------- | ----------- |
| `sm`      | `size-7`  | `size-4`    |
| `default` | `size-9`  | `size-5`    |
| `lg`      | `size-11` | `size-6`    |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État       | Comportement visuel                                          |
| ---------- | ------------------------------------------------------------ |
| `default`  | Pictogramme `bg-primary` à la taille demandée, `select-none` |
| `hover`    | Non applicable                                               |
| `focus`    | Non applicable — élément non focusable                       |
| `active`   | Non applicable                                               |
| `disabled` | Non applicable                                               |
| `loading`  | Non applicable                                               |
| `error`    | Non applicable                                               |

## Accessibilité

**Pattern** : Image décorative

**Rôle** : Le pictogramme SVG porte `aria-hidden="true"`.

**Clavier** :

Aucune interaction propre.

**Nom accessible** : Aucun : le logo est décoratif. Le nom de la marque doit venir d'un texte voisin, ou du `aria-label` du lien qui l'enveloppe (« Accueil — BankApp »).

**Vigilance** :

- Un logo seul dans un lien sans nom produit un lien vide : toujours nommer le lien.

## Exemple de code

```tsx
import { Logo } from "@/components/ui/logo"

export default function Example({ brandName }: { brandName: string }) {
  return (
    <header className="flex items-center gap-3">
      <Logo size="lg" />
      <span className="font-heading text-xl font-bold">{brandName}</span>
    </header>
  )
}
```

## Références croisées

- `Heading` — partage la famille `--font-heading`
- `Sidebar` — accueille le `Logo` dans son en-tête
- `Illustration` — autre placeholder brand à remplacer en production
