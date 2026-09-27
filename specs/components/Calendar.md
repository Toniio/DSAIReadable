# Calendar

## Metadata

| Champ         | Valeur                     |
| ------------- | -------------------------- |
| Nom           | Calendar                   |
| Catégorie     | Data                       |
| Statut        | stable                     |
| figma_node_id |                            |
| code_path     | components/ui/calendar.tsx |

## Rôle

Sélecteur de date(s) interactif basé sur `react-day-picker`, supportant la sélection simple, multiple et par plage avec navigation mensuelle.

## Usage

- Sélectionner une date unique dans un formulaire (ex. : date de naissance, échéance)
- Sélectionner une plage de dates (ex. : période de facturation, congés)
- Afficher un calendrier dans un `Popover` pour les champs de type date-picker
- Permettre la navigation par mois/année via des dropdowns intégrés
- Afficher les numéros de semaine pour un contexte métier (option `showWeekNumber`)

## Contraintes

- **MUST NOT** — servir d'agenda ou de planning (vues jour, semaine) : le design system n'en fournit pas
- **MUST NOT** — afficher plus d'un `Calendar` par vue, **sauf** pour comparer deux plages de dates
- **MUST** — placer le `Calendar` dans un conteneur (`Popover`, `Card`…) : il ne se positionne pas seul
- **MUST** — garder visibles les jours désactivés (`opacity-disabled`, `aria-disabled`)
- **MUST NOT** — neutraliser la navigation clavier (flèches entre les jours, Tab vers les contrôles)

## Dépendances

- `react-day-picker` — moteur de calendrier et types (`DayPicker`, `DayButton`, `Locale`)
- `Button` (`@/components/ui/button`) — boutons de navigation et cellules de jour
- `buttonVariants` (`@/components/ui/button`) — classes CSS des boutons de navigation
- `CaretLeftIcon`, `CaretRightIcon`, `CaretDownIcon` (`@phosphor-icons/react`) — icônes de navigation
- `cn` (`@/lib/utils`) — utilitaire de fusion de classes

## Anatomie

| Slot                   | Rôle                                      |
| ---------------------- | ----------------------------------------- |
| `data-slot="calendar"` | Racine du composant (conteneur principal) |

## Tokens utilisés

<!-- Généré par scripts/build-spec-tokens.ts depuis le code du composant — ne pas éditer à la main. -->

| Token                                | Classes et variables                     | Où                                                                                                                |
| ------------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `color.action.background.default`    | `bg-primary`                             | `CalendarDayButton`                                                                                               |
| `color.action.background.foreground` | `text-primary-foreground`                | `CalendarDayButton`                                                                                               |
| `color.background.default`           | `bg-background`                          | `Calendar`                                                                                                        |
| `color.background.elevated`          | `bg-popover`                             | `Calendar.dropdown`                                                                                               |
| `color.background.subtle`            | `bg-muted`                               | `Calendar.range_end` · `Calendar.range_start` · `Calendar.today` · `CalendarDayButton`                            |
| `color.border.focus`                 | `border-ring` · `ring-ring/50`           | `CalendarDayButton`                                                                                               |
| `color.text.default`                 | `text-foreground`                        | `Calendar.today` · `CalendarDayButton`                                                                            |
| `color.text.subtle`                  | `text-muted-foreground`                  | `Calendar.caption_label` · `Calendar.disabled` · `Calendar.outside` · `Calendar.week_number` · `Calendar.weekday` |
| `opacity.disabled`                   | `opacity-disabled`                       | `Calendar.button_next` · `Calendar.button_previous` · `Calendar.disabled`                                         |
| `space.focus-ring-width`             | `ring-(length:--space-focus-ring-width)` | `CalendarDayButton`                                                                                               |
| `typography.font-weight.medium`      | `font-medium`                            | `Calendar.caption_label` · `Calendar.dropdowns`                                                                   |
| `typography.font-weight.normal`      | `font-normal`                            | `Calendar.weekday` · `CalendarDayButton`                                                                          |
| `typography.size.sm`                 | `text-sm`                                | `Calendar.caption_label` · `Calendar.dropdowns`                                                                   |
| `typography.size.xs`                 | `text-xs`                                | `Calendar.week_number` · `Calendar.weekday` · `CalendarDayButton`                                                 |
| `zindex.dropdown`                    | `z-dropdown`                             | `CalendarDayButton`                                                                                               |

Relevé dans `components/ui/calendar.tsx` et les constantes de `lib/` qu'il importe ; chaque classe est résolue par Tailwind jusqu'au token sémantique. **Où** : sous-composant, chemin de variante `cva` ou constante d'origine. Les classes qui ne lisent aucun token (espacement `p-2`, tailles, mise en page) n'y figurent pas.

Compose `Button` : les tokens de ce composant sont listés dans sa spec.

## Props / API

<!-- Généré par scripts/build-spec-api.ts depuis les exports TypeScript. Seules les descriptions s'éditent à la main : elles sont conservées. -->

### `Calendar`

Rend `DayPicker`.

| Prop              | Type                                                                          | Défaut    | Description                                              |
| ----------------- | ----------------------------------------------------------------------------- | --------- | -------------------------------------------------------- |
| `captionLayout`   | `"label" \| "dropdown" \| "dropdown-months" \| "dropdown-years"`              | `"label"` | Mode d'affichage du titre (label statique ou dropdown)   |
| `showOutsideDays` | `boolean`                                                                     | `true`    | Affiche les jours du mois précédent/suivant              |
| `buttonVariant`   | `"default" \| "outline" \| "secondary" \| "ghost" \| "destructive" \| "link"` | `"ghost"` | Variante visuelle des boutons de navigation              |
| `className`       | `string`                                                                      | —         | Classes CSS additionnelles sur le conteneur              |
| `classNames`      | `Partial<ClassNames> & Partial<DeprecatedUI<string>>`                         | —         | Surcharge des classes CSS internes de `react-day-picker` |
| `locale`          | `Partial<DayPickerLocale>`                                                    | —         | Locale pour le formatage des dates et mois               |
| `formatters`      | `Partial<Formatters>`                                                         | —         | Fonctions de formatage personnalisées                    |
| `components`      | `Partial<CustomComponents>`                                                   | —         | Surcharge des sous-composants internes                   |
| `...props`        | `React.ComponentProps<typeof DayPicker>`                                      | —         | Props de `DayPicker`                                     |

### `CalendarDayButton`

Rend `Button`.

| Prop       | Type                                     | Défaut | Description                                                             |
| ---------- | ---------------------------------------- | ------ | ----------------------------------------------------------------------- |
| `locale`   | `Partial<Locale>`                        | —      | Locale `date-fns` transmise par `Calendar` ; sert à formater `data-day` |
| `...props` | `React.ComponentProps<typeof DayButton>` | —      | Props de `DayButton`                                                    |

<!-- Fin de la partie générée. -->

## Variantes

<!-- Généré par scripts/build-spec-variants.ts depuis mcp-server/context/component-variants.json — ne pas éditer à la main. -->

| Composant  | Axe             | Valeurs                                                                | Défaut  |
| ---------- | --------------- | ---------------------------------------------------------------------- | ------- |
| `Calendar` | `buttonVariant` | `default` · `outline` · `secondary` · `ghost` · `destructive` · `link` | `ghost` |

Le sens de chaque axe (apparence, intention, taille…) est donné dans **Props / API**.

## États

| État     | Description                                                                              |
| -------- | ---------------------------------------------------------------------------------------- |
| default  | Grille de jours affichée, aucun jour sélectionné                                         |
| hover    | Jour survolé avec atténuation du fond (via variante `ghost` du `Button`)                 |
| focus    | Anneau de focus visible (`ring-ring/50`, `border-ring`) sur le jour ayant le focus       |
| active   | Jour sélectionné en `bg-primary` / `text-primary-foreground`                             |
| disabled | Jour non sélectionnable, `opacity-disabled` et `aria-disabled`, texte `muted-foreground` |

## Accessibilité

**Pattern** : [Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) de dates (react-day-picker)

**Rôle** : Grille de dates ; le jour sélectionné porte `aria-selected`, les jours indisponibles `aria-disabled`.

**Clavier** :

| Touche                            | Action                                     |
| --------------------------------- | ------------------------------------------ |
| `ArrowLeft` / `ArrowRight`        | Jour précédent / suivant                   |
| `ArrowUp` / `ArrowDown`           | Même jour la semaine précédente / suivante |
| `Home` / `End`                    | Début / fin de la semaine                  |
| `PageUp` / `PageDown`             | Mois précédent / suivant                   |
| `Shift+PageUp` / `Shift+PageDown` | Année précédente / suivante                |
| `Enter` / `Space`                 | Sélectionne le jour focalisé               |

**Nom accessible** : Les boutons de navigation entre mois sont nommés par react-day-picker, en anglais par défaut : fournir les libellés localisés via ses props `labels`.

**Vigilance** :

- Un calendrier seul ne suffit pas à saisir une date connue : proposer aussi un champ de saisie texte.
- Indiquer les jours indisponibles autrement que par la couleur.

## Exemple de code

```tsx
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"

export default function Example() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      showOutsideDays
    />
  )
}
```

## Références croisées

- `Popover` — conteneur fréquent pour afficher le calendrier en overlay
- `Button` — utilisé pour les cellules de jour et la navigation
- `Input` — partenaire dans les champs date-picker (déclenche le popover)
