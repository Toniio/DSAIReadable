# Typography Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

> ⚠️ **Note critique :** Ce projet utilise **JetBrains Mono** (`typography.font-family.mono`) comme police **par défaut** sur `<html>` via `@apply font-mono`. Geist Sans est disponible mais secondaire.

---

## Font Families

| Token                         | CSS Variable                    | Famille        | Tailwind Class | Usage                                                             |
| ----------------------------- | ------------------------------- | -------------- | -------------- | ----------------------------------------------------------------- |
| `typography.font-family.mono` | `--typography-font-family-mono` | JetBrains Mono | `font-mono`    | **Police par défaut** de l'application — tout le texte UI         |
| `typography.font-family.sans` | `--typography-font-family-sans` | Geist Sans     | `font-sans`    | Usage optionnel pour le contenu éditorial ou les textes long-form |

```css
/* Appliqué dans globals.css — @layer base */
html {
  @apply font-mono;
}
```

> **Do :** Utiliser `font-mono` partout sauf décision explicite contraire.  
> **Don't :** Ne pas surcharger `font-sans` sur les composants UI standard — cela crée une incohérence visuelle.

---

## Type Scale (Sizes)

| Token                  | CSS Variable             | Valeur rem | Valeur px | Tailwind Class | Usage                                           |
| ---------------------- | ------------------------ | ---------- | --------- | -------------- | ----------------------------------------------- |
| `typography.size.xs`   | `--typography-size-xs`   | `0.75rem`  | 12 px     | `text-xs`      | Labels, badges, légendes de graphiques          |
| `typography.size.sm`   | `--typography-size-sm`   | `0.875rem` | 14 px     | `text-sm`      | Texte secondaire, labels de champs, helper text |
| `typography.size.base` | `--typography-size-base` | `1rem`     | 16 px     | `text-base`    | Corps de texte principal                        |
| `typography.size.lg`   | `--typography-size-lg`   | `1.125rem` | 18 px     | `text-lg`      | Corps de texte mis en avant, intro              |
| `typography.size.xl`   | `--typography-size-xl`   | `1.25rem`  | 20 px     | `text-xl`      | Titres de sections (h3, h4)                     |
| `typography.size.2xl`  | `--typography-size-2xl`  | `1.5rem`   | 24 px     | `text-2xl`     | Titres de page (h2)                             |
| `typography.size.3xl`  | `--typography-size-3xl`  | `1.875rem` | 30 px     | `text-3xl`     | Titres héros (h1)                               |
| `typography.size.4xl`  | `--typography-size-4xl`  | `2.25rem`  | 36 px     | `text-4xl`     | Titres display — usage rare                     |

---

## Line Heights

| Token                            | CSS Variable                       | Valeur  | Tailwind Class    | Usage                                   |
| -------------------------------- | ---------------------------------- | ------- | ----------------- | --------------------------------------- |
| `typography.line-height.tight`   | `--typography-line-height-tight`   | `1.25`  | `leading-tight`   | Headings — textes courts sur 1-2 lignes |
| `typography.line-height.snug`    | `--typography-line-height-snug`    | `1.375` | `leading-snug`    | Sous-titres, labels multilignes         |
| `typography.line-height.normal`  | `--typography-line-height-normal`  | `1.5`   | `leading-normal`  | Corps de texte par défaut               |
| `typography.line-height.relaxed` | `--typography-line-height-relaxed` | `1.625` | `leading-relaxed` | Texte long-form, articles               |
| `typography.line-height.loose`   | `--typography-line-height-loose`   | `2`     | `leading-loose`   | Texte très aéré — usage très rare       |

---

## Letter Spacings

| Token                              | CSS Variable                         | Valeur     | Tailwind Class    | Usage                                             |
| ---------------------------------- | ------------------------------------ | ---------- | ----------------- | ------------------------------------------------- |
| `typography.letter-spacing.tight`  | `--typography-letter-spacing-tight`  | `-0.025em` | `tracking-tight`  | Grands headings (3xl, 4xl) — resserre les lettres |
| `typography.letter-spacing.normal` | `--typography-letter-spacing-normal` | `0em`      | `tracking-normal` | Texte courant — valeur par défaut                 |
| `typography.letter-spacing.wide`   | `--typography-letter-spacing-wide`   | `0.025em`  | `tracking-wide`   | Labels UI petits (xs, sm)                         |
| `typography.letter-spacing.wider`  | `--typography-letter-spacing-wider`  | `0.05em`   | `tracking-wider`  | Texte en capitales, overlines                     |

---

## Font Weights

| Token                             | CSS Variable                        | Valeur | Tailwind Class  | Usage                                      |
| --------------------------------- | ----------------------------------- | ------ | --------------- | ------------------------------------------ |
| `typography.font-weight.normal`   | `--typography-font-weight-normal`   | `400`  | `font-normal`   | Corps de texte standard                    |
| `typography.font-weight.medium`   | `--typography-font-weight-medium`   | `500`  | `font-medium`   | Labels UI, boutons, éléments de navigation |
| `typography.font-weight.semibold` | `--typography-font-weight-semibold` | `600`  | `font-semibold` | Sous-titres, emphasis dans l'UI            |
| `typography.font-weight.bold`     | `--typography-font-weight-bold`     | `700`  | `font-bold`     | Titres principaux, forte emphase           |

---

## Type Scale — Combinaisons recommandées

Ces combinaisons définissent les styles typographiques canoniques du design system.

### Body — Corps de texte

```tsx
<p className="text-base leading-normal font-normal text-foreground">
  Texte principal de l'application.
</p>
```

`size: base (16px)` · `lineHeight: normal (1.5)` · `weight: normal (400)`

### Body Small — Texte secondaire

```tsx
<p className="text-sm leading-normal font-normal text-muted-foreground">
  Texte d'aide ou métadonnée.
</p>
```

`size: sm (14px)` · `lineHeight: normal (1.5)` · `weight: normal (400)`

### Label — Label de champ ou bouton

```tsx
<label className="text-sm leading-snug font-medium tracking-wide text-foreground">
  Nom du champ
</label>
```

`size: sm (14px)` · `lineHeight: snug (1.375)` · `weight: medium (500)` · `tracking: wide`

### Heading 1 — Titre de page

```tsx
<h1 className="text-3xl leading-tight font-bold tracking-tight text-foreground">
  Titre principal
</h1>
```

`size: 3xl (30px)` · `lineHeight: tight (1.25)` · `weight: bold (700)` · `tracking: tight`

### Heading 2 — Titre de section

```tsx
<h2 className="text-2xl leading-tight font-semibold text-foreground">
  Titre de section
</h2>
```

`size: 2xl (24px)` · `lineHeight: tight (1.25)` · `weight: semibold (600)`

### Heading 3 — Sous-section

```tsx
<h3 className="text-xl leading-snug font-semibold text-foreground">
  Sous-section
</h3>
```

`size: xl (20px)` · `lineHeight: snug (1.375)` · `weight: semibold (600)`

### Caption — Légende, annotation

```tsx
<span className="text-xs leading-normal font-normal tracking-wide text-muted-foreground">
  Légende ou note de bas de page
</span>
```

`size: xs (12px)` · `lineHeight: normal (1.5)` · `weight: normal (400)` · `tracking: wide`

### Code — Blocs et inline code

```tsx
<code className="font-mono text-sm leading-relaxed text-foreground">
  const x = 42;
</code>
```

`size: sm (14px)` · `lineHeight: relaxed (1.625)` · `family: mono` · `weight: normal (400)`

> Note : Le projet utilise déjà `font-mono` sur `<html>`, donc les blocs de code ne nécessitent pas de classe supplémentaire de famille.

### Display — Grand titre héros

```tsx
<h1 className="text-4xl leading-tight font-bold tracking-tight text-foreground">
  Display Heading
</h1>
```

`size: 4xl (36px)` · `lineHeight: tight (1.25)` · `weight: bold (700)` · `tracking: tight`

---

## Usage Rules

1. **JetBrains Mono est la police par défaut** — ne jamais surcharger `font-family` sur les composants UI standard sans validation design.
2. **Toujours coupler `size` et `lineHeight`** — un heading sans `leading-tight` paraît trop aéré ; du corps sans `leading-normal` est illisible.
3. **`tracking-tight` uniquement à partir de `text-3xl`** — sur du texte petit, l'espacement négatif nuit à la lisibilité.
4. **`tracking-wider` réservé au tout-capitales** — ne jamais l'utiliser sur du texte minuscule normal.
5. **Hiérarchie de poids stricte** — `normal` → corps, `medium` → labels/nav, `semibold` → sous-titres, `bold` → titres principaux. Ne pas sauter de niveaux.
