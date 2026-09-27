# Illustration

## Metadata

| Champ         | Valeur                         |
| ------------- | ------------------------------ |
| Nom           | Illustration                   |
| Catégorie     | Media                          |
| Statut        | stable                         |
| figma_node_id |                                |
| code_path     | components/ui/illustration.tsx |

## Rôle

Placeholder pour illustrations et images décoratives. Utilisé dans les layouts split-screen, les pages d'erreur, les empty states et l'onboarding.

## Usage

- Panneau illustration d'une page de login split-screen
- Page vide (empty state)
- Onboarding / walkthrough
- Pages d'erreur (404, 500)

## Contraintes

- Toujours fournir un `alt` descriptif — il alimente `role="img"` + `aria-label`
- Ce composant est un placeholder : remplacer par de vraies illustrations en production
- Ne pas utiliser pour des images de contenu — préférer `<img>` ou `next/image`
- Le conteneur n'impose aucune dimension : les fixer via `className` côté appelant
- Texte alternatif par défaut en anglais issu de `UI_STRINGS.illustration` — surcharger via `alt`

## Dépendances

- `cn` (`@/lib/utils`) pour la fusion des classes
- Aucune dépendance externe — le SVG placeholder est interne au composant

## Anatomie

| Slot                       | Rôle                                                       |
| -------------------------- | ---------------------------------------------------------- |
| `data-slot="illustration"` | Conteneur `role="img"`, fond `bg-muted`, centrage flex     |
| SVG placeholder            | Cadre pointillé + pictogramme, `aria-hidden`, `opacity-20` |

## Tokens utilisés

| Token                | Usage                                                           |
| -------------------- | --------------------------------------------------------------- |
| `--muted`            | Fond du conteneur (`bg-muted`)                                  |
| `--muted-foreground` | Couleur du tracé SVG (`text-muted-foreground` + `currentColor`) |

## Props / API

| Prop        | Type                          | Défaut           | Description                                       |
| ----------- | ----------------------------- | ---------------- | ------------------------------------------------- |
| `alt`       | `string`                      | `"Illustration"` | Description accessible, exposée via `aria-label`  |
| `className` | `string`                      | —                | Classes CSS additionnelles (dimensions, couleurs) |
| `...props`  | `React.ComponentProps<"div">` | —                | Props natives du `<div>`                          |

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

Aucun axe de variante : le composant n'appelle pas `cva()`. Son apparence se règle par ses props et, en dernier recours, par `className` avec des classes de tokens.

## États

| État       | Comportement visuel                                    |
| ---------- | ------------------------------------------------------ |
| `default`  | Fond `bg-muted`, SVG placeholder centré à `opacity-20` |
| `hover`    | Non applicable                                         |
| `focus`    | Non applicable — élément non focusable                 |
| `active`   | Non applicable                                         |
| `disabled` | Non applicable                                         |
| `loading`  | Non applicable                                         |
| `error`    | Non applicable                                         |

## Accessibilité

**Pattern** : Image (`role="img"`)

**Rôle** : `role="img"` avec `aria-label` = `alt` ; `alt=""` rend l'illustration décorative (`aria-hidden`).

**Clavier** :

Aucune interaction clavier.

**Nom accessible** : `alt` décrit ce que l'illustration apporte. Le défaut (`UI_STRINGS.illustration.alt`, « Illustration ») n'apporte rien : le remplacer, ou passer `alt=""`.

**Vigilance** :

- La plupart des illustrations d'accompagnement sont décoratives : `alt=""`.

## Exemple de code

```tsx
import { Illustration } from "@/components/ui/illustration"

export default function Example() {
  return (
    <Illustration
      alt="Deux personnes collaborent autour d'un tableau"
      className="h-full w-full rounded-lg"
    />
  )
}
```

## Références croisées

- `Empty` — utilise une `Illustration` comme média d'état vide
- `Card` — cadre fréquent d'une illustration de contenu
- `Skeleton` — placeholder de chargement, à ne pas confondre avec ce placeholder de maquette
