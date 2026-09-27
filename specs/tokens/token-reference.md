<!-- GENERATED — DO NOT EDIT.
     Produced by scripts/build-token-docs.ts from tokens/*.json.
     Run `npm run docs:tokens` after any token change; `npm run docs:tokens:check` guards it in CI.
     Edit the JSON (including $extensions.docs) instead of this file. -->

# Token Reference

> 301 tokens · source `tokens/primitive.json` · `tokens/semantic.json` · `tokens/component.json`
> Machine-readable counterpart: `tokens.manifest.json`

Les tokens publics sont les tiers Semantic et Component. Le tier Primitive est privé :
il est listé en fin de document uniquement pour tracer l'origine des valeurs.

Colonne **Statut** : `active` — consommé par un composant, le pont `@theme` ou un autre token ;
`reserved` — décision valide que rien ne consomme encore, utilisable si son rôle correspond
exactement au besoin ; `deprecated` — ne plus utiliser. `npm run tokens:lint-lifecycle` garantit
que le statut dit ce que fait le code.

---

## Color

| Token                                | Variable CSS                           | Type  | Statut   | Light     | Dark                        | Tailwind               |
| ------------------------------------ | -------------------------------------- | ----- | -------- | --------- | --------------------------- | ---------------------- |
| `color.background.default`           | `--color-background-default`           | color | active   | `#ffffff` | `#090b0c`                   | —                      |
| `color.background.subtle`            | `--color-background-subtle`            | color | active   | `#f1f3f3` | `#22292b`                   | —                      |
| `color.background.elevated`          | `--color-background-elevated`          | color | active   | `#ffffff` | `#161b1d`                   | —                      |
| `color.background.inverse`           | `--color-background-inverse`           | color | reserved | `#090b0c` | `#ffffff`                   | —                      |
| `color.text.default`                 | `--color-text-default`                 | color | active   | `#090b0c` | `#f9fbfb`                   | —                      |
| `color.text.subtle`                  | `--color-text-subtle`                  | color | active   | `#607175` | `#9ca8ab`                   | —                      |
| `color.text.bold`                    | `--color-text-bold`                    | color | reserved | `#090b0c` | `#f9fbfb`                   | —                      |
| `color.text.inverse`                 | `--color-text-inverse`                 | color | reserved | `#ffffff` | `#090b0c`                   | —                      |
| `color.text.action.default`          | `--color-text-action-default`          | color | reserved | `#432dd7` | `#6e6cff`                   | —                      |
| `color.text.action.on`               | `--color-text-action-on`               | color | reserved | `#eef2ff` | `#eef2ff`                   | —                      |
| `color.text.destructive.default`     | `--color-text-destructive-default`     | color | reserved | `#e7000b` | `#ff6467`                   | —                      |
| `color.border.default`               | `--color-border-default`               | color | active   | `#e3e7e8` | `rgba(255, 255, 255, 0.1)`  | —                      |
| `color.border.subtle`                | `--color-border-subtle`                | color | reserved | `#e3e7e8` | `rgba(255, 255, 255, 0.1)`  | —                      |
| `color.border.input`                 | `--color-border-input`                 | color | active   | `#e3e7e8` | `rgba(255, 255, 255, 0.15)` | —                      |
| `color.border.focus`                 | `--color-border-focus`                 | color | active   | `#67787c` | `#67787c`                   | —                      |
| `color.icon.default`                 | `--color-icon-default`                 | color | reserved | `#090b0c` | `#f9fbfb`                   | —                      |
| `color.icon.subtle`                  | `--color-icon-subtle`                  | color | reserved | `#67787c` | `#9ca8ab`                   | —                      |
| `color.icon.action`                  | `--color-icon-action`                  | color | reserved | `#eef2ff` | `#eef2ff`                   | —                      |
| `color.action.background.default`    | `--color-action-background-default`    | color | active   | `#432dd7` | `#372aac`                   | —                      |
| `color.action.background.foreground` | `--color-action-background-foreground` | color | active   | `#eef2ff` | `#eef2ff`                   | —                      |
| `color.feedback.error.default`       | `--color-feedback-error-default`       | color | active   | `#e7000b` | `#ff6467`                   | —                      |
| `color.feedback.error.foreground`    | `--color-feedback-error-foreground`    | color | active   | `#ffffff` | `#090b0c`                   | —                      |
| `color.chart.1`                      | `--color-chart-1`                      | color | active   | `#432dd7` | `#6e6cff`                   | —                      |
| `color.chart.2`                      | `--color-chart-2`                      | color | active   | `#438fbd` | `#8fd6fa`                   | —                      |
| `color.chart.3`                      | `--color-chart-3`                      | color | active   | `#af8526` | `#e5e747`                   | —                      |
| `color.chart.4`                      | `--color-chart-4`                      | color | active   | `#4d2761` | `#9b5f7c`                   | —                      |
| `color.chart.5`                      | `--color-chart-5`                      | color | active   | `#734e00` | `#c89005`                   | —                      |
| `color.chart.sequential.1`           | `--color-chart-sequential-1`           | color | reserved | `#bbf451` | —                           | —                      |
| `color.chart.sequential.2`           | `--color-chart-sequential-2`           | color | reserved | `#7ccf00` | —                           | —                      |
| `color.chart.sequential.3`           | `--color-chart-sequential-3`           | color | reserved | `#5ea500` | —                           | —                      |
| `color.chart.sequential.4`           | `--color-chart-sequential-4`           | color | reserved | `#497d00` | —                           | —                      |
| `color.chart.sequential.5`           | `--color-chart-sequential-5`           | color | reserved | `#3c6300` | —                           | —                      |
| `color.sidebar.background`           | `--color-sidebar-background`           | color | active   | `#f9fbfb` | `#161b1d`                   | `mist.900`             |
| `color.sidebar.foreground`           | `--color-sidebar-foreground`           | color | active   | `#090b0c` | `#f9fbfb`                   | `mist.50`              |
| `color.sidebar.border`               | `--color-sidebar-border`               | color | active   | `#e3e7e8` | `rgba(255, 255, 255, 0.1)`  | `white-alpha.10`       |
| `color.sidebar.ring`                 | `--color-sidebar-ring`                 | color | active   | `#67787c` | `#67787c`                   | `mist.500`             |
| `color.sidebar.primary.default`      | `--color-sidebar-primary-default`      | color | active   | `#4f39f6` | `#615fff`                   | `violet.500`           |
| `color.sidebar.primary.on`           | `--color-sidebar-primary-on`           | color | active   | `#eef2ff` | `#ffffff`                   | `mist.0`               |
| `color.sidebar.accent.default`       | `--color-sidebar-accent-default`       | color | active   | `#f1f3f3` | `#22292b`                   | `mist.800`             |
| `color.sidebar.accent.foreground`    | `--color-sidebar-accent-foreground`    | color | active   | `#161b1d` | `#f9fbfb`                   | `mist.50`              |
| `color.static.white`                 | `--color-static-white`                 | color | active   | `#ffffff` | `#ffffff`                   | `bg-white, text-white` |
| `color.static.black`                 | `--color-static-black`                 | color | active   | `#000000` | `#000000`                   | `bg-black/10`          |

**Règles d'usage**

| Portée                               | ✅ Do                                                                                            | ❌ Don't                                                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `color.background.default`           | Utiliser comme fond de la page racine et des containers principaux (`<body>`, `<main>`).         | Ne pas utiliser pour les cards, popovers ou surfaces élevées — préférer `color.background.subtle` ou `color.background.elevated`. |
| `color.background.subtle`            | Utiliser pour les cards, zones muted, sidebars secondaires, panneaux internes.                   | Ne pas utiliser pour le fond principal de la page.                                                                                |
| `color.background.elevated`          | Utiliser pour popovers, dropdowns, dialogs, tooltips à fond clair.                               | Ne pas utiliser pour les cards inline — elles ne sont pas "élevées" au sens Z.                                                    |
| `color.background.inverse`           | Utiliser pour les tooltips sombres, les badges inversés, les bandeaux d'alerte.                  | Ne pas utiliser comme fond de page général — réservé aux surfaces ponctuelles inversées.                                          |
| `color.text.default`                 | Utiliser pour tout texte de contenu principal, titres, labels importants.                        | Ne pas réduire l'opacité pour simuler un texte secondaire — utiliser `color.text.subtle`.                                         |
| `color.text.subtle`                  | Utiliser pour les labels de champs, les descriptions de formulaire, les timestamps.              | Ne pas utiliser pour le contenu de corps principal — le contraste est insuffisant pour la lecture longue.                         |
| `color.text.bold`                    | Utiliser pour les emphases dans des zones où le contexte visuel est complexe.                    | Ne pas utiliser comme substitut à `text.default` pour le corps standard.                                                          |
| `color.text.inverse`                 | Utiliser uniquement posé sur `color.background.inverse`.                                         | Ne pas utiliser sur surfaces standard — le contraste sera insuffisant.                                                            |
| `color.text.action.default`          | Utiliser pour les liens textuels et les labels exprimant une action cliquable.                   | Ne pas utiliser pour le texte de corps générique — réservé aux éléments actionnables.                                             |
| `color.text.action.on`               | Utiliser pour le label d'un bouton primaire.                                                     | Ne pas utiliser sur surfaces neutres — contraste insuffisant sur fond clair.                                                      |
| `color.text.destructive.default`     | Utiliser pour les messages de validation d'erreur, les confirmations de suppression.             | Ne pas utiliser pour les avertissements (warning) ou les informations — réservé aux erreurs critiques.                            |
| `color.border.default`               | Utiliser pour les dividers entre sections, les contours de cards.                                | Ne pas utiliser pour les champs de formulaire — préférer `color.border.input`.                                                    |
| `color.border.subtle`                | Utiliser pour les séparateurs internes de listes, les divisions légères.                         | Ne pas utiliser sur des composants interactifs nécessitant une bordure visible.                                                   |
| `color.border.input`                 | Utiliser pour toutes les bordures de `<input>`, `<select>`, `<textarea>`, `<checkbox>`.          | Ne pas utiliser pour les séparateurs décoratifs — réservé aux contrôles de formulaire.                                            |
| `color.border.focus`                 | Utiliser uniquement pour l'état `:focus-visible` des éléments interactifs.                       | Ne jamais supprimer le focus ring — c'est une exigence d'accessibilité WCAG 2.4.7.                                                |
| `color.icon.default`                 | Utiliser pour les icônes de navigation, d'action standard, de contenu.                           | Ne pas utiliser pour les icônes dans des boutons primaires — utiliser `color.icon.action`.                                        |
| `color.icon.subtle`                  | Utiliser pour les icônes d'état, les indicateurs de chargement, les icônes de métadonnées.       | Ne pas utiliser pour les icônes d'action principale.                                                                              |
| `color.icon.action`                  | Utiliser pour les icônes à l'intérieur de boutons primaires ou de badges d'action.               | Ne pas utiliser sur fond neutre ou clair.                                                                                         |
| `color.action.background.default`    | Utiliser pour le fond des boutons primaires et des éléments CTA.                                 | Ne pas utiliser pour les variantes secondary, ghost ou outline — ces variantes n'ont pas de fond coloré.                          |
| `color.action.background.foreground` | Toujours associer avec `color.action.background.default` pour le texte d'un bouton primaire.     | Ne pas utiliser sur fond neutre ou clair.                                                                                         |
| `color.feedback.error.default`       | Utiliser pour les messages de validation, les bordures de champs invalides, les icônes d'erreur. | Ne pas utiliser pour les avertissements ou les états de succès.                                                                   |
| `color.feedback.error.foreground`    | Utiliser dès qu'un fond `bg-destructive` plein porte du texte ou une icône.                      | Ne jamais poser `color.text.default` ni `text-white` sur une surface d'erreur — en dark, blanc sur red.500 tombe à 2.89:1.        |
| `color.chart.*`                      | Utiliser dans l'ordre (1 → 5) pour les séries de graphiques.                                     | Ne pas réutiliser ces tokens pour des couleurs UI générales — réservé à la visualisation de données.                              |
| `color.sidebar.*`                    | Utiliser exclusivement dans les composants de navigation latérale.                               | Ne pas réutiliser ces tokens dans le contenu principal — ils sont contextuels à la sidebar.                                       |

---

## Space

| Token                          | Variable CSS                     | Type      | Statut   | Valeur    | Tailwind |
| ------------------------------ | -------------------------------- | --------- | -------- | --------- | -------- |
| `space.component.xs`           | `--space-component-xs`           | dimension | reserved | `0.25rem` | —        |
| `space.component.sm`           | `--space-component-sm`           | dimension | reserved | `0.5rem`  | —        |
| `space.component.md`           | `--space-component-md`           | dimension | reserved | `1rem`    | —        |
| `space.component.lg`           | `--space-component-lg`           | dimension | active   | `1.5rem`  | —        |
| `space.component.xl`           | `--space-component-xl`           | dimension | reserved | `2rem`    | —        |
| `space.focus-ring-width`       | `--space-focus-ring-width`       | dimension | active   | `2px`     | —        |
| `space.layout.page-padding`    | `--space-layout-page-padding`    | dimension | active   | `1.5rem`  | —        |
| `space.layout.section-gap`     | `--space-layout-section-gap`     | dimension | active   | `4rem`    | —        |
| `space.layout.content-sm`      | `--space-layout-content-sm`      | dimension | reserved | `42rem`   | —        |
| `space.layout.content-default` | `--space-layout-content-default` | dimension | reserved | `64rem`   | —        |
| `space.layout.content-lg`      | `--space-layout-content-lg`      | dimension | reserved | `80rem`   | —        |
| `space.layout.sidebar`         | `--space-layout-sidebar`         | dimension | active   | `16rem`   | —        |
| `space.layout.sidebar-mobile`  | `--space-layout-sidebar-mobile`  | dimension | active   | `18rem`   | —        |
| `space.layout.sidebar-icon`    | `--space-layout-sidebar-icon`    | dimension | active   | `3rem`    | —        |

**Règles d'usage**

| Portée                         | ✅ Do                                                                        | ❌ Don't                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `space.component.xs`           | Gap entre icône et label dans un bouton compact, padding interne d'un badge. | Ne pas utiliser pour des espacements de layout.                                      |
| `space.component.sm`           | Padding d'un bouton compact, gap d'une liste serrée.                         | Ne pas utiliser pour espacer des sections de page.                                   |
| `space.component.md`           | Padding standard d'une card, gap entre boutons d'un groupe.                  | Ne pas utiliser pour le gap entre sections de page.                                  |
| `space.component.lg`           | Padding interne d'un dialog, gap entre champs de formulaire.                 | Ne pas confondre avec `space.layout.page-padding` (même valeur, contexte différent). |
| `space.component.xl`           | Padding d'une section de card large, espacement entre groupes de formulaire. | Ne pas utiliser pour les espacements entre éléments inline proches.                  |
| `space.layout.page-padding`    | Padding horizontal du conteneur de page racine.                              | Ne pas appliquer sur des composants internes.                                        |
| `space.layout.section-gap`     | Espace vertical entre sections majeures d'une page.                          | Ne pas utiliser entre composants d'une même section.                                 |
| `space.layout.content-sm`      | `max-w-[var(--space-layout-content-sm)]` pour les pages editoriales.         | Ne pas utiliser comme valeur de padding.                                             |
| `space.layout.content-default` | Conteneur de contenu principal de la majorité des pages.                     | Ne pas dépasser pour les layouts de contenu standard.                                |
| `space.layout.content-lg`      | Dashboards, tableaux de données, layouts avec plusieurs colonnes.            | Ne pas utiliser pour les pages de contenu éditorial.                                 |

---

## Typography

| Token                              | Variable CSS                         | Type        | Statut   | Valeur                      | Tailwind          |
| ---------------------------------- | ------------------------------------ | ----------- | -------- | --------------------------- | ----------------- |
| `typography.size.xs`               | `--typography-size-xs`               | dimension   | active   | `0.75rem`                   | `text-xs`         |
| `typography.size.sm`               | `--typography-size-sm`               | dimension   | active   | `0.875rem`                  | `text-sm`         |
| `typography.size.base`             | `--typography-size-base`             | dimension   | active   | `1rem`                      | `text-base`       |
| `typography.size.lg`               | `--typography-size-lg`               | dimension   | active   | `1.125rem`                  | `text-lg`         |
| `typography.size.xl`               | `--typography-size-xl`               | dimension   | active   | `1.25rem`                   | `text-xl`         |
| `typography.size.2xl`              | `--typography-size-2xl`              | dimension   | active   | `1.5rem`                    | `text-2xl`        |
| `typography.size.3xl`              | `--typography-size-3xl`              | dimension   | active   | `1.875rem`                  | `text-3xl`        |
| `typography.size.4xl`              | `--typography-size-4xl`              | dimension   | active   | `2.25rem`                   | `text-4xl`        |
| `typography.line-height.tight`     | `--typography-line-height-tight`     | number      | active   | `1.25`                      | `leading-tight`   |
| `typography.line-height.snug`      | `--typography-line-height-snug`      | number      | active   | `1.375`                     | `leading-snug`    |
| `typography.line-height.normal`    | `--typography-line-height-normal`    | number      | active   | `1.5`                       | `leading-normal`  |
| `typography.line-height.relaxed`   | `--typography-line-height-relaxed`   | number      | active   | `1.625`                     | `leading-relaxed` |
| `typography.line-height.loose`     | `--typography-line-height-loose`     | number      | active   | `2`                         | `leading-loose`   |
| `typography.letter-spacing.tight`  | `--typography-letter-spacing-tight`  | dimension   | active   | `-0.025em`                  | `tracking-tight`  |
| `typography.letter-spacing.normal` | `--typography-letter-spacing-normal` | dimension   | active   | `0em`                       | `tracking-normal` |
| `typography.letter-spacing.wide`   | `--typography-letter-spacing-wide`   | dimension   | active   | `0.025em`                   | `tracking-wide`   |
| `typography.letter-spacing.wider`  | `--typography-letter-spacing-wider`  | dimension   | active   | `0.05em`                    | `tracking-wider`  |
| `typography.font-weight.normal`    | `--typography-font-weight-normal`    | font-weight | active   | `400`                       | `font-normal`     |
| `typography.font-weight.medium`    | `--typography-font-weight-medium`    | font-weight | active   | `500`                       | `font-medium`     |
| `typography.font-weight.semibold`  | `--typography-font-weight-semibold`  | font-weight | active   | `600`                       | `font-semibold`   |
| `typography.font-weight.bold`      | `--typography-font-weight-bold`      | font-weight | active   | `700`                       | `font-bold`       |
| `typography.font-family.sans`      | `--typography-font-family-sans`      | font-family | reserved | `Geist, sans-serif`         | —                 |
| `typography.font-family.mono`      | `--typography-font-family-mono`      | font-family | reserved | `JetBrains Mono, monospace` | —                 |

**Règles d'usage**

| Portée                        | ✅ Do                                        | ❌ Don't                                                                            |
| ----------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------- |
| `typography.font-family.sans` | Usage optionnel pour le contenu éditorial.   | Ne pas utiliser comme police principale — le projet utilise `font-mono` par défaut. |
| `typography.font-family.mono` | Police par défaut de tous les composants UI. | Ne pas surcharger sans décision de l'équipe design.                                 |

---

## Radius

| Token         | Variable CSS    | Type      | Statut   | Valeur     | Tailwind       |
| ------------- | --------------- | --------- | -------- | ---------- | -------------- |
| `radius.none` | `--radius-none` | dimension | reserved | `0rem`     | `rounded-none` |
| `radius.xs`   | `--radius-xs`   | dimension | active   | `0.25rem`  | `rounded-xs`   |
| `radius.sm`   | `--radius-sm`   | dimension | active   | `0.375rem` | `rounded-sm`   |
| `radius.md`   | `--radius-md`   | dimension | active   | `0.5rem`   | `rounded-md`   |
| `radius.lg`   | `--radius-lg`   | dimension | active   | `0.625rem` | `rounded-lg`   |
| `radius.xl`   | `--radius-xl`   | dimension | active   | `0.875rem` | `rounded-xl`   |
| `radius.2xl`  | `--radius-2xl`  | dimension | active   | `1.125rem` | `rounded-2xl`  |
| `radius.3xl`  | `--radius-3xl`  | dimension | active   | `1.375rem` | `rounded-3xl`  |
| `radius.4xl`  | `--radius-4xl`  | dimension | active   | `1.625rem` | `rounded-4xl`  |
| `radius.full` | `--radius-full` | dimension | reserved | `9999px`   | `rounded-full` |

**Règles d'usage**

| Portée     | ✅ Do                                                                                                       | ❌ Don't                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `radius.*` | `radius.lg` pour les cards; `radius.md` pour les boutons; `radius.full` pour les avatars et badges pilules. | Pas de valeurs arbitraires — toujours un token du système. |

---

## Elevation

| Token             | Variable CSS        | Type   | Statut | Light                                                              | Dark                                                              | Tailwind       |
| ----------------- | ------------------- | ------ | ------ | ------------------------------------------------------------------ | ----------------------------------------------------------------- | -------------- |
| `elevation.xs`    | `--elevation-xs`    | shadow | active | `0 1px 2px rgba(0, 0, 0, 0.04)`                                    | `0 1px 2px rgba(0, 0, 0, 0.2)`                                    | `shadow-xs`    |
| `elevation.sm`    | `--elevation-sm`    | shadow | active | `0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)`     | `0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)`      | `shadow-sm`    |
| `elevation.md`    | `--elevation-md`    | shadow | active | `0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.04)`     | `0 4px 6px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.18)`    | `shadow-md`    |
| `elevation.lg`    | `--elevation-lg`    | shadow | active | `0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)`   | `0 10px 15px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2)`    | `shadow-lg`    |
| `elevation.xl`    | `--elevation-xl`    | shadow | active | `0 20px 25px rgba(0, 0, 0, 0.08), 0 10px 10px rgba(0, 0, 0, 0.03)` | `0 20px 25px rgba(0, 0, 0, 0.35), 0 10px 10px rgba(0, 0, 0, 0.2)` | `shadow-xl`    |
| `elevation.2xl`   | `--elevation-2xl`   | shadow | active | `0 25px 50px rgba(0, 0, 0, 0.12)`                                  | `0 25px 50px rgba(0, 0, 0, 0.5)`                                  | `shadow-2xl`   |
| `elevation.inner` | `--elevation-inner` | shadow | active | `inset 0 2px 4px rgba(0, 0, 0, 0.05)`                              | `inset 0 2px 4px rgba(0, 0, 0, 0.3)`                              | `shadow-inner` |

**Règles d'usage**

| Portée        | ✅ Do                                                                                    | ❌ Don't                                                                   |
| ------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `elevation.*` | `shadow-sm` pour les cards, `shadow-md` pour les dropdowns, `shadow-lg` pour les modals. | Ne pas utiliser `shadow-inner` avec une ombre externe sur le même élément. |

---

## Motion

| Token                        | Variable CSS                   | Type        | Statut   | Valeur                                    | Tailwind          |
| ---------------------------- | ------------------------------ | ----------- | -------- | ----------------------------------------- | ----------------- |
| `motion.duration.instant`    | `--motion-duration-instant`    | duration    | reserved | `0ms`                                     | —                 |
| `motion.duration.fast`       | `--motion-duration-fast`       | duration    | active   | `100ms`                                   | `duration-fast`   |
| `motion.duration.normal`     | `--motion-duration-normal`     | duration    | active   | `200ms`                                   | `duration-normal` |
| `motion.duration.slow`       | `--motion-duration-slow`       | duration    | active   | `300ms`                                   | `duration-slow`   |
| `motion.duration.slower`     | `--motion-duration-slower`     | duration    | active   | `500ms`                                   | `duration-slower` |
| `motion.duration.extra-slow` | `--motion-duration-extra-slow` | duration    | active   | `1000ms`                                  | —                 |
| `motion.easing.default`      | `--motion-easing-default`      | cubicBezier | active   | `cubic-bezier(0.4, 0, 0.2, 1)`            | `ease-default`    |
| `motion.easing.in`           | `--motion-easing-in`           | cubicBezier | active   | `cubic-bezier(0.4, 0, 1, 1)`              | `ease-in`         |
| `motion.easing.out`          | `--motion-easing-out`          | cubicBezier | active   | `cubic-bezier(0, 0, 0.2, 1)`              | `ease-out`        |
| `motion.easing.spring`       | `--motion-easing-spring`       | cubicBezier | active   | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | `ease-spring`     |

**Règles d'usage**

| Portée     | ✅ Do                                                               | ❌ Don't                                                                    |
| ---------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `motion.*` | `duration-normal` + `ease-default` comme point de départ universel. | Jamais de durées ou d'easings hardcodés — toujours utiliser les tokens CSS. |

---

## Opacity

| Token                 | Variable CSS            | Type   | Statut   | Valeur | Tailwind |
| --------------------- | ----------------------- | ------ | -------- | ------ | -------- |
| `opacity.disabled`    | `--opacity-disabled`    | number | reserved | `0.50` | —        |
| `opacity.placeholder` | `--opacity-placeholder` | number | reserved | `0.50` | —        |
| `opacity.overlay`     | `--opacity-overlay`     | number | reserved | `0.80` | —        |

**Règles d'usage**

| Portée                | ✅ Do                                                                                     | ❌ Don't                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `opacity.disabled`    | Utiliser `disabled:opacity-50` (classe Tailwind) sur les éléments interactifs désactivés. | Ne pas utiliser pour du texte secondaire — utiliser `color.text.subtle`. |
| `opacity.placeholder` | Appliquer sur `::placeholder` des champs de formulaire.                                   | Ne pas confondre avec `opacity.disabled` — usages distincts.             |
| `opacity.overlay`     | Utiliser pour les backdrops de modals et dialogs.                                         | Ne pas réduire en dessous de `0.7` — le contraste devient insuffisant.   |

---

## Z-Index

| Token             | Variable CSS        | Type   | Statut | Valeur | Tailwind     |
| ----------------- | ------------------- | ------ | ------ | ------ | ------------ |
| `zindex.dropdown` | `--zindex-dropdown` | number | active | `1000` | `z-dropdown` |
| `zindex.sticky`   | `--zindex-sticky`   | number | active | `1100` | `z-sticky`   |
| `zindex.fixed`    | `--zindex-fixed`    | number | active | `1200` | `z-fixed`    |
| `zindex.overlay`  | `--zindex-overlay`  | number | active | `1300` | `z-overlay`  |
| `zindex.modal`    | `--zindex-modal`    | number | active | `1400` | `z-modal`    |
| `zindex.popover`  | `--zindex-popover`  | number | active | `1500` | `z-popover`  |
| `zindex.toast`    | `--zindex-toast`    | number | active | `1600` | `z-toast`    |
| `zindex.tooltip`  | `--zindex-tooltip`  | number | active | `1700` | `z-tooltip`  |

**Règles d'usage**

| Portée     | ✅ Do                                                                           | ❌ Don't                                                                             |
| ---------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `zindex.*` | Toujours utiliser les tokens z-index — jamais de valeurs numériques hardcodées. | Ne pas créer de nouveaux niveaux z-index en dehors de cette échelle sans validation. |

---

## breakpoint

| Token            | Variable CSS       | Type      | Statut   | Valeur  | Tailwind |
| ---------------- | ------------------ | --------- | -------- | ------- | -------- |
| `breakpoint.sm`  | `--breakpoint-sm`  | dimension | active   | `40rem` | `sm:`    |
| `breakpoint.md`  | `--breakpoint-md`  | dimension | active   | `48rem` | `md:`    |
| `breakpoint.lg`  | `--breakpoint-lg`  | dimension | active   | `64rem` | `lg:`    |
| `breakpoint.xl`  | `--breakpoint-xl`  | dimension | reserved | `80rem` | `xl:`    |
| `breakpoint.2xl` | `--breakpoint-2xl` | dimension | reserved | `96rem` | `2xl:`   |

---

## border-width

| Token                          | Variable CSS                     | Type      | Statut | Valeur  | Tailwind                 |
| ------------------------------ | -------------------------------- | --------- | ------ | ------- | ------------------------ |
| `border-width.default`         | `--border-width-default`         | dimension | active | `1px`   | `border`                 |
| `border-width.chart-indicator` | `--border-width-chart-indicator` | dimension | active | `1.5px` | `border-chart-indicator` |

---

## Aliases shadcn

| Token                               | Variable CSS                   | Type      | Statut | Light      | Dark                        | Tailwind |
| ----------------------------------- | ------------------------------ | --------- | ------ | ---------- | --------------------------- | -------- |
| `shadcn.background`                 | `--background`                 | color     | active | `#ffffff`  | `#090b0c`                   | —        |
| `shadcn.foreground`                 | `--foreground`                 | color     | active | `#090b0c`  | `#f9fbfb`                   | —        |
| `shadcn.card`                       | `--card`                       | color     | active | `#f1f3f3`  | `#22292b`                   | —        |
| `shadcn.card-foreground`            | `--card-foreground`            | color     | active | `#090b0c`  | `#f9fbfb`                   | —        |
| `shadcn.popover`                    | `--popover`                    | color     | active | `#ffffff`  | `#161b1d`                   | —        |
| `shadcn.popover-foreground`         | `--popover-foreground`         | color     | active | `#090b0c`  | `#f9fbfb`                   | —        |
| `shadcn.primary`                    | `--primary`                    | color     | active | `#432dd7`  | `#372aac`                   | —        |
| `shadcn.primary-foreground`         | `--primary-foreground`         | color     | active | `#eef2ff`  | `#eef2ff`                   | —        |
| `shadcn.secondary`                  | `--secondary`                  | color     | active | `#f1f3f3`  | `#22292b`                   | —        |
| `shadcn.secondary-foreground`       | `--secondary-foreground`       | color     | active | `#090b0c`  | `#f9fbfb`                   | —        |
| `shadcn.muted`                      | `--muted`                      | color     | active | `#f1f3f3`  | `#22292b`                   | —        |
| `shadcn.muted-foreground`           | `--muted-foreground`           | color     | active | `#607175`  | `#9ca8ab`                   | —        |
| `shadcn.accent`                     | `--accent`                     | color     | active | `#f1f3f3`  | `#22292b`                   | —        |
| `shadcn.accent-foreground`          | `--accent-foreground`          | color     | active | `#090b0c`  | `#f9fbfb`                   | —        |
| `shadcn.destructive`                | `--destructive`                | color     | active | `#e7000b`  | `#ff6467`                   | —        |
| `shadcn.destructive-foreground`     | `--destructive-foreground`     | color     | active | `#ffffff`  | `#090b0c`                   | —        |
| `shadcn.border`                     | `--border`                     | color     | active | `#e3e7e8`  | `rgba(255, 255, 255, 0.1)`  | —        |
| `shadcn.input`                      | `--input`                      | color     | active | `#e3e7e8`  | `rgba(255, 255, 255, 0.15)` | —        |
| `shadcn.ring`                       | `--ring`                       | color     | active | `#67787c`  | `#67787c`                   | —        |
| `shadcn.radius`                     | `--radius`                     | dimension | active | `0.625rem` | —                           | —        |
| `shadcn.chart-1`                    | `--chart-1`                    | color     | active | `#432dd7`  | `#6e6cff`                   | —        |
| `shadcn.chart-2`                    | `--chart-2`                    | color     | active | `#438fbd`  | `#8fd6fa`                   | —        |
| `shadcn.chart-3`                    | `--chart-3`                    | color     | active | `#af8526`  | `#e5e747`                   | —        |
| `shadcn.chart-4`                    | `--chart-4`                    | color     | active | `#4d2761`  | `#9b5f7c`                   | —        |
| `shadcn.chart-5`                    | `--chart-5`                    | color     | active | `#734e00`  | `#c89005`                   | —        |
| `shadcn.sidebar`                    | `--sidebar`                    | color     | active | `#f9fbfb`  | `#161b1d`                   | —        |
| `shadcn.sidebar-foreground`         | `--sidebar-foreground`         | color     | active | `#090b0c`  | `#f9fbfb`                   | —        |
| `shadcn.sidebar-primary`            | `--sidebar-primary`            | color     | active | `#4f39f6`  | `#615fff`                   | —        |
| `shadcn.sidebar-primary-foreground` | `--sidebar-primary-foreground` | color     | active | `#eef2ff`  | `#ffffff`                   | —        |
| `shadcn.sidebar-accent`             | `--sidebar-accent`             | color     | active | `#f1f3f3`  | `#22292b`                   | —        |
| `shadcn.sidebar-accent-foreground`  | `--sidebar-accent-foreground`  | color     | active | `#161b1d`  | `#f9fbfb`                   | —        |
| `shadcn.sidebar-border`             | `--sidebar-border`             | color     | active | `#e3e7e8`  | `rgba(255, 255, 255, 0.1)`  | —        |
| `shadcn.sidebar-ring`               | `--sidebar-ring`               | color     | active | `#67787c`  | `#67787c`                   | —        |

---

## Primitives — privé, ne pas utiliser

Ces variables sont le tier 1. Les référencer depuis un composant, une spec ou
`globals.css` contourne les décisions du design system et casse le mode dark :
`npm run tokens-validate` échoue si l'une d'elles apparaît hors de `tokens.css`.

| Token                              | Variable CSS                                 | Type        | Statut   | Valeur                                                             | Tailwind |
| ---------------------------------- | -------------------------------------------- | ----------- | -------- | ------------------------------------------------------------------ | -------- |
| `color.mist.0`                     | `--ds-prim-color-mist-0`                     | color       | active   | `#ffffff`                                                          | —        |
| `color.mist.50`                    | `--ds-prim-color-mist-50`                    | color       | active   | `#f9fbfb`                                                          | —        |
| `color.mist.100`                   | `--ds-prim-color-mist-100`                   | color       | active   | `#f1f3f3`                                                          | —        |
| `color.mist.200`                   | `--ds-prim-color-mist-200`                   | color       | active   | `#e3e7e8`                                                          | —        |
| `color.mist.400`                   | `--ds-prim-color-mist-400`                   | color       | active   | `#9ca8ab`                                                          | —        |
| `color.mist.500`                   | `--ds-prim-color-mist-500`                   | color       | active   | `#67787c`                                                          | —        |
| `color.mist.600`                   | `--ds-prim-color-mist-600`                   | color       | active   | `#607175`                                                          | —        |
| `color.mist.700`                   | `--ds-prim-color-mist-700`                   | color       | reserved | `#424f52`                                                          | —        |
| `color.mist.800`                   | `--ds-prim-color-mist-800`                   | color       | active   | `#22292b`                                                          | —        |
| `color.mist.900`                   | `--ds-prim-color-mist-900`                   | color       | active   | `#161b1d`                                                          | —        |
| `color.mist.950`                   | `--ds-prim-color-mist-950`                   | color       | active   | `#090b0c`                                                          | —        |
| `color.violet.50`                  | `--ds-prim-color-violet-50`                  | color       | active   | `#eef2ff`                                                          | —        |
| `color.violet.400`                 | `--ds-prim-color-violet-400`                 | color       | active   | `#6e6cff`                                                          | —        |
| `color.violet.500`                 | `--ds-prim-color-violet-500`                 | color       | active   | `#615fff`                                                          | —        |
| `color.violet.550`                 | `--ds-prim-color-violet-550`                 | color       | active   | `#4f39f6`                                                          | —        |
| `color.violet.600`                 | `--ds-prim-color-violet-600`                 | color       | active   | `#432dd7`                                                          | —        |
| `color.violet.700`                 | `--ds-prim-color-violet-700`                 | color       | active   | `#372aac`                                                          | —        |
| `color.red.500`                    | `--ds-prim-color-red-500`                    | color       | active   | `#ff6467`                                                          | —        |
| `color.red.600`                    | `--ds-prim-color-red-600`                    | color       | active   | `#e7000b`                                                          | —        |
| `color.green.200`                  | `--ds-prim-color-green-200`                  | color       | active   | `#bbf451`                                                          | —        |
| `color.green.300`                  | `--ds-prim-color-green-300`                  | color       | active   | `#7ccf00`                                                          | —        |
| `color.green.400`                  | `--ds-prim-color-green-400`                  | color       | active   | `#5ea500`                                                          | —        |
| `color.green.500`                  | `--ds-prim-color-green-500`                  | color       | active   | `#497d00`                                                          | —        |
| `color.green.600`                  | `--ds-prim-color-green-600`                  | color       | active   | `#3c6300`                                                          | —        |
| `color.blue.300`                   | `--ds-prim-color-blue-300`                   | color       | active   | `#8fd6fa`                                                          | —        |
| `color.blue.600`                   | `--ds-prim-color-blue-600`                   | color       | active   | `#438fbd`                                                          | —        |
| `color.yellow.200`                 | `--ds-prim-color-yellow-200`                 | color       | active   | `#e5e747`                                                          | —        |
| `color.amber.500`                  | `--ds-prim-color-amber-500`                  | color       | active   | `#c89005`                                                          | —        |
| `color.amber.600`                  | `--ds-prim-color-amber-600`                  | color       | active   | `#af8526`                                                          | —        |
| `color.amber.800`                  | `--ds-prim-color-amber-800`                  | color       | active   | `#734e00`                                                          | —        |
| `color.plum.500`                   | `--ds-prim-color-plum-500`                   | color       | active   | `#9b5f7c`                                                          | —        |
| `color.plum.800`                   | `--ds-prim-color-plum-800`                   | color       | active   | `#4d2761`                                                          | —        |
| `color.black`                      | `--ds-prim-color-black`                      | color       | active   | `#000000`                                                          | —        |
| `color.white-alpha.10`             | `--ds-prim-color-white-alpha-10`             | color       | active   | `rgba(255, 255, 255, 0.1)`                                         | —        |
| `color.white-alpha.15`             | `--ds-prim-color-white-alpha-15`             | color       | active   | `rgba(255, 255, 255, 0.15)`                                        | —        |
| `space.1`                          | `--ds-prim-space-1`                          | dimension   | active   | `0.25rem`                                                          | —        |
| `space.2`                          | `--ds-prim-space-2`                          | dimension   | active   | `0.5rem`                                                           | —        |
| `space.3`                          | `--ds-prim-space-3`                          | dimension   | reserved | `0.75rem`                                                          | —        |
| `space.4`                          | `--ds-prim-space-4`                          | dimension   | active   | `1rem`                                                             | —        |
| `space.5`                          | `--ds-prim-space-5`                          | dimension   | reserved | `1.25rem`                                                          | —        |
| `space.6`                          | `--ds-prim-space-6`                          | dimension   | active   | `1.5rem`                                                           | —        |
| `space.8`                          | `--ds-prim-space-8`                          | dimension   | active   | `2rem`                                                             | —        |
| `space.10`                         | `--ds-prim-space-10`                         | dimension   | reserved | `2.5rem`                                                           | —        |
| `space.12`                         | `--ds-prim-space-12`                         | dimension   | active   | `3rem`                                                             | —        |
| `space.16`                         | `--ds-prim-space-16`                         | dimension   | reserved | `4rem`                                                             | —        |
| `space.24`                         | `--ds-prim-space-24`                         | dimension   | reserved | `6rem`                                                             | —        |
| `space.32`                         | `--ds-prim-space-32`                         | dimension   | reserved | `8rem`                                                             | —        |
| `space.0-5`                        | `--ds-prim-space-0-5`                        | dimension   | reserved | `0.125rem`                                                         | —        |
| `space.page`                       | `--ds-prim-space-page`                       | dimension   | active   | `1.5rem`                                                           | —        |
| `space.section`                    | `--ds-prim-space-section`                    | dimension   | active   | `4rem`                                                             | —        |
| `space.content-sm`                 | `--ds-prim-space-content-sm`                 | dimension   | active   | `42rem`                                                            | —        |
| `space.content`                    | `--ds-prim-space-content`                    | dimension   | active   | `64rem`                                                            | —        |
| `space.content-lg`                 | `--ds-prim-space-content-lg`                 | dimension   | active   | `80rem`                                                            | —        |
| `space.sidebar`                    | `--ds-prim-space-sidebar`                    | dimension   | active   | `16rem`                                                            | —        |
| `space.sidebar-mobile`             | `--ds-prim-space-sidebar-mobile`             | dimension   | active   | `18rem`                                                            | —        |
| `space.focus-ring-width`           | `--ds-prim-space-focus-ring-width`           | dimension   | active   | `2px`                                                              | —        |
| `radius.none`                      | `--ds-prim-radius-none`                      | dimension   | active   | `0rem`                                                             | —        |
| `radius.base`                      | `--ds-prim-radius-base`                      | dimension   | reserved | `0.625rem`                                                         | —        |
| `radius.xs`                        | `--ds-prim-radius-xs`                        | dimension   | active   | `0.25rem`                                                          | —        |
| `radius.sm`                        | `--ds-prim-radius-sm`                        | dimension   | active   | `0.375rem`                                                         | —        |
| `radius.md`                        | `--ds-prim-radius-md`                        | dimension   | active   | `0.5rem`                                                           | —        |
| `radius.lg`                        | `--ds-prim-radius-lg`                        | dimension   | active   | `0.625rem`                                                         | —        |
| `radius.xl`                        | `--ds-prim-radius-xl`                        | dimension   | active   | `0.875rem`                                                         | —        |
| `radius.2xl`                       | `--ds-prim-radius-2xl`                       | dimension   | active   | `1.125rem`                                                         | —        |
| `radius.3xl`                       | `--ds-prim-radius-3xl`                       | dimension   | active   | `1.375rem`                                                         | —        |
| `radius.4xl`                       | `--ds-prim-radius-4xl`                       | dimension   | active   | `1.625rem`                                                         | —        |
| `radius.full`                      | `--ds-prim-radius-full`                      | dimension   | active   | `9999px`                                                           | —        |
| `typography.size.xs`               | `--ds-prim-typography-size-xs`               | dimension   | active   | `0.75rem`                                                          | —        |
| `typography.size.sm`               | `--ds-prim-typography-size-sm`               | dimension   | active   | `0.875rem`                                                         | —        |
| `typography.size.base`             | `--ds-prim-typography-size-base`             | dimension   | active   | `1rem`                                                             | —        |
| `typography.size.lg`               | `--ds-prim-typography-size-lg`               | dimension   | active   | `1.125rem`                                                         | —        |
| `typography.size.xl`               | `--ds-prim-typography-size-xl`               | dimension   | active   | `1.25rem`                                                          | —        |
| `typography.size.2xl`              | `--ds-prim-typography-size-2xl`              | dimension   | active   | `1.5rem`                                                           | —        |
| `typography.size.3xl`              | `--ds-prim-typography-size-3xl`              | dimension   | active   | `1.875rem`                                                         | —        |
| `typography.size.4xl`              | `--ds-prim-typography-size-4xl`              | dimension   | active   | `2.25rem`                                                          | —        |
| `typography.line-height.tight`     | `--ds-prim-typography-line-height-tight`     | number      | active   | `1.25`                                                             | —        |
| `typography.line-height.snug`      | `--ds-prim-typography-line-height-snug`      | number      | active   | `1.375`                                                            | —        |
| `typography.line-height.normal`    | `--ds-prim-typography-line-height-normal`    | number      | active   | `1.5`                                                              | —        |
| `typography.line-height.relaxed`   | `--ds-prim-typography-line-height-relaxed`   | number      | active   | `1.625`                                                            | —        |
| `typography.line-height.loose`     | `--ds-prim-typography-line-height-loose`     | number      | active   | `2`                                                                | —        |
| `typography.letter-spacing.tight`  | `--ds-prim-typography-letter-spacing-tight`  | dimension   | active   | `-0.025em`                                                         | —        |
| `typography.letter-spacing.normal` | `--ds-prim-typography-letter-spacing-normal` | dimension   | active   | `0em`                                                              | —        |
| `typography.letter-spacing.wide`   | `--ds-prim-typography-letter-spacing-wide`   | dimension   | active   | `0.025em`                                                          | —        |
| `typography.letter-spacing.wider`  | `--ds-prim-typography-letter-spacing-wider`  | dimension   | active   | `0.05em`                                                           | —        |
| `typography.font-weight.normal`    | `--ds-prim-typography-font-weight-normal`    | font-weight | active   | `400`                                                              | —        |
| `typography.font-weight.medium`    | `--ds-prim-typography-font-weight-medium`    | font-weight | active   | `500`                                                              | —        |
| `typography.font-weight.semibold`  | `--ds-prim-typography-font-weight-semibold`  | font-weight | active   | `600`                                                              | —        |
| `typography.font-weight.bold`      | `--ds-prim-typography-font-weight-bold`      | font-weight | active   | `700`                                                              | —        |
| `typography.font-family.sans`      | `--ds-prim-typography-font-family-sans`      | font-family | active   | `Geist, sans-serif`                                                | —        |
| `typography.font-family.mono`      | `--ds-prim-typography-font-family-mono`      | font-family | active   | `JetBrains Mono, monospace`                                        | —        |
| `elevation.light.xs`               | `--ds-prim-elevation-light-xs`               | shadow      | active   | `0 1px 2px rgba(0, 0, 0, 0.04)`                                    | —        |
| `elevation.light.sm`               | `--ds-prim-elevation-light-sm`               | shadow      | active   | `0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)`     | —        |
| `elevation.light.md`               | `--ds-prim-elevation-light-md`               | shadow      | active   | `0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.04)`     | —        |
| `elevation.light.lg`               | `--ds-prim-elevation-light-lg`               | shadow      | active   | `0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)`   | —        |
| `elevation.light.xl`               | `--ds-prim-elevation-light-xl`               | shadow      | active   | `0 20px 25px rgba(0, 0, 0, 0.08), 0 10px 10px rgba(0, 0, 0, 0.03)` | —        |
| `elevation.light.2xl`              | `--ds-prim-elevation-light-2xl`              | shadow      | active   | `0 25px 50px rgba(0, 0, 0, 0.12)`                                  | —        |
| `elevation.light.inner`            | `--ds-prim-elevation-light-inner`            | shadow      | active   | `inset 0 2px 4px rgba(0, 0, 0, 0.05)`                              | —        |
| `elevation.dark.xs`                | `--ds-prim-elevation-dark-xs`                | shadow      | active   | `0 1px 2px rgba(0, 0, 0, 0.2)`                                     | —        |
| `elevation.dark.sm`                | `--ds-prim-elevation-dark-sm`                | shadow      | active   | `0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)`       | —        |
| `elevation.dark.md`                | `--ds-prim-elevation-dark-md`                | shadow      | active   | `0 4px 6px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.18)`     | —        |
| `elevation.dark.lg`                | `--ds-prim-elevation-dark-lg`                | shadow      | active   | `0 10px 15px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2)`     | —        |
| `elevation.dark.xl`                | `--ds-prim-elevation-dark-xl`                | shadow      | active   | `0 20px 25px rgba(0, 0, 0, 0.35), 0 10px 10px rgba(0, 0, 0, 0.2)`  | —        |
| `elevation.dark.2xl`               | `--ds-prim-elevation-dark-2xl`               | shadow      | active   | `0 25px 50px rgba(0, 0, 0, 0.5)`                                   | —        |
| `elevation.dark.inner`             | `--ds-prim-elevation-dark-inner`             | shadow      | active   | `inset 0 2px 4px rgba(0, 0, 0, 0.3)`                               | —        |
| `motion.duration.instant`          | `--ds-prim-motion-duration-instant`          | duration    | active   | `0ms`                                                              | —        |
| `motion.duration.fast`             | `--ds-prim-motion-duration-fast`             | duration    | active   | `100ms`                                                            | —        |
| `motion.duration.normal`           | `--ds-prim-motion-duration-normal`           | duration    | active   | `200ms`                                                            | —        |
| `motion.duration.slow`             | `--ds-prim-motion-duration-slow`             | duration    | active   | `300ms`                                                            | —        |
| `motion.duration.slower`           | `--ds-prim-motion-duration-slower`           | duration    | active   | `500ms`                                                            | —        |
| `motion.duration.extra-slow`       | `--ds-prim-motion-duration-extra-slow`       | duration    | active   | `1000ms`                                                           | —        |
| `motion.easing.default`            | `--ds-prim-motion-easing-default`            | cubicBezier | active   | `cubic-bezier(0.4, 0, 0.2, 1)`                                     | —        |
| `motion.easing.in`                 | `--ds-prim-motion-easing-in`                 | cubicBezier | active   | `cubic-bezier(0.4, 0, 1, 1)`                                       | —        |
| `motion.easing.out`                | `--ds-prim-motion-easing-out`                | cubicBezier | active   | `cubic-bezier(0, 0, 0.2, 1)`                                       | —        |
| `motion.easing.spring`             | `--ds-prim-motion-easing-spring`             | cubicBezier | active   | `cubic-bezier(0.175, 0.885, 0.32, 1.275)`                          | —        |
| `opacity.0-03`                     | `--ds-prim-opacity-0-03`                     | number      | reserved | `0.03`                                                             | —        |
| `opacity.0-04`                     | `--ds-prim-opacity-0-04`                     | number      | reserved | `0.04`                                                             | —        |
| `opacity.0-05`                     | `--ds-prim-opacity-0-05`                     | number      | reserved | `0.05`                                                             | —        |
| `opacity.0-07`                     | `--ds-prim-opacity-0-07`                     | number      | reserved | `0.07`                                                             | —        |
| `opacity.0-08`                     | `--ds-prim-opacity-0-08`                     | number      | reserved | `0.08`                                                             | —        |
| `opacity.0-10`                     | `--ds-prim-opacity-0-10`                     | number      | reserved | `0.10`                                                             | —        |
| `opacity.0-12`                     | `--ds-prim-opacity-0-12`                     | number      | reserved | `0.12`                                                             | —        |
| `opacity.0-15`                     | `--ds-prim-opacity-0-15`                     | number      | reserved | `0.15`                                                             | —        |
| `opacity.0-18`                     | `--ds-prim-opacity-0-18`                     | number      | reserved | `0.18`                                                             | —        |
| `opacity.0-20`                     | `--ds-prim-opacity-0-20`                     | number      | reserved | `0.20`                                                             | —        |
| `opacity.0-25`                     | `--ds-prim-opacity-0-25`                     | number      | reserved | `0.25`                                                             | —        |
| `opacity.0-30`                     | `--ds-prim-opacity-0-30`                     | number      | reserved | `0.30`                                                             | —        |
| `opacity.0-35`                     | `--ds-prim-opacity-0-35`                     | number      | reserved | `0.35`                                                             | —        |
| `opacity.0-50`                     | `--ds-prim-opacity-0-50`                     | number      | active   | `0.50`                                                             | —        |
| `opacity.0-80`                     | `--ds-prim-opacity-0-80`                     | number      | active   | `0.80`                                                             | —        |
| `zindex.dropdown`                  | `--ds-prim-zindex-dropdown`                  | number      | active   | `1000`                                                             | —        |
| `zindex.sticky`                    | `--ds-prim-zindex-sticky`                    | number      | active   | `1100`                                                             | —        |
| `zindex.fixed`                     | `--ds-prim-zindex-fixed`                     | number      | active   | `1200`                                                             | —        |
| `zindex.overlay`                   | `--ds-prim-zindex-overlay`                   | number      | active   | `1300`                                                             | —        |
| `zindex.modal`                     | `--ds-prim-zindex-modal`                     | number      | active   | `1400`                                                             | —        |
| `zindex.popover`                   | `--ds-prim-zindex-popover`                   | number      | active   | `1500`                                                             | —        |
| `zindex.toast`                     | `--ds-prim-zindex-toast`                     | number      | active   | `1600`                                                             | —        |
| `zindex.tooltip`                   | `--ds-prim-zindex-tooltip`                   | number      | active   | `1700`                                                             | —        |
| `breakpoint.sm`                    | `--ds-prim-breakpoint-sm`                    | dimension   | active   | `40rem`                                                            | —        |
| `breakpoint.md`                    | `--ds-prim-breakpoint-md`                    | dimension   | active   | `48rem`                                                            | —        |
| `breakpoint.lg`                    | `--ds-prim-breakpoint-lg`                    | dimension   | active   | `64rem`                                                            | —        |
| `breakpoint.xl`                    | `--ds-prim-breakpoint-xl`                    | dimension   | active   | `80rem`                                                            | —        |
| `breakpoint.2xl`                   | `--ds-prim-breakpoint-2xl`                   | dimension   | active   | `96rem`                                                            | —        |
| `border-width.1`                   | `--ds-prim-border-width-1`                   | dimension   | active   | `1px`                                                              | —        |
| `border-width.1-5`                 | `--ds-prim-border-width-1-5`                 | dimension   | active   | `1.5px`                                                            | —        |
