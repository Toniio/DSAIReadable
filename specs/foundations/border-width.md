# Border Width Foundation

> Source: `tokens/semantic.json` (`border-width.*`) · CSS variables: `tokens.css` Layer 2

Deux largeurs de bordure, et pas davantage : une bordure du design system est un
filet d'un pixel, sauf un cas nommé. Le pont `@theme` de `app/globals.css` branche
les tokens sur Tailwind — un `border` nu lit `--border-width-default`.

---

## Token Reference

| Token                          | Variable CSS                     | Valeur | Classe Tailwind                               | Cas d'usage                                        |
| ------------------------------ | -------------------------------- | ------ | --------------------------------------------- | -------------------------------------------------- |
| `border-width.default`         | `--border-width-default`         | 1px    | `border`, `border-t`, `border-x`, `divide-y`… | Toute bordure : champs, cards, séparateurs, tables |
| `border-width.chart-indicator` | `--border-width-chart-indicator` | 1.5px  | `border-chart-indicator`                      | Trait pointillé de l'indicateur de série (Chart)   |

L'anneau de focus n'est pas une bordure : sa largeur est `space.focus-ring-width`,
appliquée par les presets de `lib/focus` (voir [focus.md](./focus.md)).

---

## Usage Rules

- ✅ Écrire `border` (ou `border-t`, `border-b`…) : la largeur vient du token `border-width.default`
- ✅ Retirer une bordure avec `border-0` / `border-t-0` — une remise à zéro n'est pas une valeur
- ✅ Ajouter un token `border-width.*` nommé par son rôle quand un composant a réellement besoin d'une autre largeur
- ❌ Ne jamais écrire de largeur en dur : `border-2`, `border-[1.5px]`, `border-(length:3px)` — `npm run tokens:lint-values` les refuse
- ❌ Ne pas utiliser `border-none` pour retirer une bordure : c'est le **style** de bordure, pas sa largeur
