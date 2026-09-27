# Content — chaînes par défaut et localisation

## Principe

Un composant ne décide pas des mots qu'il affiche. Les seules chaînes qu'il
produit sans qu'on le lui demande sont les **noms accessibles** de contrôles
sans libellé visible — la croix de fermeture d'un `Dialog`, les flèches d'un
`Carousel`, la bascule d'un `PasswordInput` — plus le nom des deux points de
repère (`Breadcrumb`, `Pagination`).

Toutes vivent dans `lib/ui-strings.ts`, dans un objet gelé `UI_STRINGS`.

```ts
import { UI_STRINGS } from "@/lib/ui-strings"

UI_STRINGS.dialog.close // "Close"
UI_STRINGS.pagination.nextLabel // "Go to next page"
```

## Langue

**Les défauts sont en anglais.** Ce n'est pas une préférence éditoriale : c'est
la langue dans laquelle les composants sont distribués, de la même façon que
leurs noms de props. Toute autre locale est fournie par l'appelant.

## Surcharger

Chaque chaîne est atteignable par une prop, jamais par un fork du composant.

| Composant                               | Prop                    | Défaut                             |
| --------------------------------------- | ----------------------- | ---------------------------------- |
| `BreadcrumbEllipsis`                    | `srLabel`               | `More`                             |
| `CarouselPrevious` / `CarouselNext`     | `srLabel`               | `Previous slide` / `Next slide`    |
| `DialogContent` / `DialogFooter`        | `closeLabel`            | `Close`                            |
| `SheetContent`                          | `closeLabel`            | `Close`                            |
| `Illustration`                          | `alt`                   | `Illustration`                     |
| `PaginationPrevious` / `PaginationNext` | `text`, `label`         | `Previous` / `Go to previous page` |
| `PaginationEllipsis`                    | `srLabel`               | `More pages`                       |
| `Spinner`                               | `aria-label`            | `Loading`                          |
| `PasswordInput`, `SidebarTrigger`       | — (lisent `UI_STRINGS`) |                                    |

Pour traduire l'ensemble d'une application, passer les props depuis une couche
i18n de l'application. `UI_STRINGS` ne lit aucune locale et n'est pas réactif :
c'est un défaut, pas un système de traduction.

## Usage Rules

- ✅ Lire toute chaîne par défaut depuis `UI_STRINGS`, jamais en littéral dans le JSX
- ✅ Exposer une prop de surcharge pour chaque chaîne qu'un composant rend
- ✅ Écrire les défauts en anglais ; fournir les autres locales par props
- ❌ Ne jamais coder en dur un `aria-label`, un `title` ou un texte `sr-only` dans un composant
- ❌ Ne jamais mélanger deux langues dans les défauts — `npm run index:strings` échoue sur tout littéral

## Garde-fou

`scripts/lint-ui-strings.ts` (`npm run index:strings`) échoue sur tout
`aria-label`, `title`, `alt` ou texte `sr-only` écrit en littéral dans
`components/ui/`. Les valeurs qui relèvent de la grammaire ARIA
(`aria-label="true"`, `aria-live="polite"`…) ne sont pas du texte et ne sont pas
signalées.
