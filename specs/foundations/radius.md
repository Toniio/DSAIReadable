# Radius Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

Le système de rayon est basé sur une valeur **base** de `0.625rem` (10px). Toutes les autres valeurs sont des multiples calculés via `calc(var(--ds-prim-radius-base) * N)`.

---

## Base System

```
base = 0.625rem (10px)

xs   = base × 0.4  = 0.25rem   (4px)
sm   = base × 0.6  = 0.375rem  (6px)
md   = base × 0.8  = 0.5rem    (8px)
lg   = base × 1.0  = 0.625rem  (10px)  ← valeur de référence
xl   = base × 1.4  = 0.875rem  (14px)
2xl  = base × 1.8  = 1.125rem  (18px)
3xl  = base × 2.2  = 1.375rem  (22px)
4xl  = base × 2.6  = 1.625rem  (26px)
full = 9999px                  ← pilule complète
```

La valeur shadcn `--radius` est mappée sur `--radius-lg` (base).

---

## Token Reference

| Token         | CSS Variable    | Calcul       | Valeur          | Tailwind Class | Cas d'usage                                  |
| ------------- | --------------- | ------------ | --------------- | -------------- | -------------------------------------------- |
| `radius.none` | `--radius-none` | `0rem`       | 0 px            | `rounded-none` | Full-bleed, cellules de tableau, dividers    |
| `radius.xs`   | `--radius-xs`   | `base × 0.4` | 0.25rem / 4px   | `rounded-xs`   | Tags minimalistes, chips très serrés         |
| `radius.sm`   | `--radius-sm`   | `base × 0.6` | 0.375rem / 6px  | `rounded-sm`   | Inputs, petits boutons, selects              |
| `radius.md`   | `--radius-md`   | `base × 0.8` | 0.5rem / 8px    | `rounded-md`   | Boutons par défaut, form controls            |
| `radius.lg`   | `--radius-lg`   | `base × 1.0` | 0.625rem / 10px | `rounded-lg`   | **Cards, panels** — valeur par défaut shadcn |
| `radius.xl`   | `--radius-xl`   | `base × 1.4` | 0.875rem / 14px | `rounded-xl`   | Modals, drawers, conteneurs proéminents      |
| `radius.2xl`  | `--radius-2xl`  | `base × 1.8` | 1.125rem / 18px | `rounded-2xl`  | Panneaux flottants, bottom sheets            |
| `radius.3xl`  | `--radius-3xl`  | `base × 2.2` | 1.375rem / 22px | `rounded-3xl`  | Conteneurs décoratifs — usage ponctuel       |
| `radius.4xl`  | `--radius-4xl`  | `base × 2.6` | 1.625rem / 26px | `rounded-4xl`  | Hero cards, large chips — très rare          |
| `radius.full` | `--radius-full` | `9999px`     | Pill            | `rounded-full` | Avatars, toggles, badges pilule              |

---

## Cas d'usage par composant

| Composant                  | Token recommandé             | Justification                              |
| -------------------------- | ---------------------------- | ------------------------------------------ |
| `<Button>` default         | `radius.md`                  | Bouton standard, cohérent avec shadcn      |
| `<Button>` small           | `radius.sm`                  | Taille réduite, rayon proportionnel        |
| `<Input>` / `<Select>`     | `radius.sm`                  | Cohérence avec les contrôles de formulaire |
| `<Card>`                   | `radius.lg`                  | Surface secondaire standard                |
| `<Badge>`                  | `radius.xs` ou `radius.full` | Selon le style : carré ou pilule           |
| `<Avatar>`                 | `radius.full`                | Toujours circulaire                        |
| `<Dialog>` / `<Modal>`     | `radius.xl`                  | Surface flottante proéminente              |
| `<Popover>` / `<Dropdown>` | `radius.lg`                  | Cohérent avec l'élément card               |
| `<Tooltip>`                | `radius.sm`                  | Surface petite et discrète                 |
| `<Toast>`                  | `radius.lg`                  | Surface flottante notificative             |
| `<Toggle>` / `<Switch>`    | `radius.full`                | Forme pilule par convention                |
| `<Table>` cellule          | `radius.none`                | Pas d'arrondi dans les grilles de données  |

---

## ⚠️ Note shadcn / radix-lyra Style

Le style **radix-lyra** de shadcn utilise `rounded-none` sur **la majorité des composants** par défaut. La variable CSS `--radius` est définie à `var(--radius-lg)` mais n'est pas forcément appliquée partout.

**Règle de décision :**

```
Si le composant appartient à l'UI système (bouton, input, card)
  → Utiliser radius.md ou radius.lg selon la taille
Si le composant a un style "flat" explicite (tableau, barre de navigation pleine largeur)
  → Utiliser radius.none
Si le composant est décoratif ou expressif (hero, illustration card)
  → Utiliser radius.2xl à radius.4xl selon la taille
```

```tsx
// ✅ Card standard
<div className="rounded-lg bg-card p-4">...</div>

// ✅ Bouton default
<button className="rounded-md px-4 py-2">...</button>

// ✅ Badge pilule
<span className="rounded-full px-2 py-0.5 text-xs">Active</span>

// ✅ Table cell — pas de radius
<td className="rounded-none px-4 py-2">...</td>

// ✅ Modal
<div className="rounded-xl shadow-lg p-6">...</div>
```

---

## Usage Rules

1. **Toujours utiliser les tokens** — pas de valeurs arbitraires comme `rounded-[7px]`. Si aucun token ne convient, escalader vers l'équipe design.
2. **Cohérence dans un composant** — tous les coins d'un même composant utilisent le même token, sauf exception justifiée (ex: un élément qui s'accroche à un bord de l'écran).
3. **`radius.lg` est la valeur par défaut shadcn** — c'est le point de départ pour tout composant card-like.
4. **`radius.full` uniquement pour les formes pilule** — avatars, toggles, badges arrondis. Ne pas l'utiliser sur des boutons standards.
5. **`radius.none` est un choix délibéré** — l'utiliser uniquement pour les composants full-bleed ou les éléments de grille de données, pas par défaut.
