# Color Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

---

## Semantic Tokens

### Background

| Token                       | CSS Variable                  | Light                | Dark                 | Usage                                                    |
| --------------------------- | ----------------------------- | -------------------- | -------------------- | -------------------------------------------------------- |
| `color.background.default`  | `--color-background-default`  | `#ffffff` (mist.0)   | `#090b0c` (mist.950) | Surface principale — page racine, body                   |
| `color.background.subtle`   | `--color-background-subtle`   | `#f1f3f3` (mist.100) | `#22292b` (mist.800) | Surfaces secondaires — cards, zones atténuées            |
| `color.background.elevated` | `--color-background-elevated` | `#ffffff` (mist.0)   | `#161b1d` (mist.900) | Surfaces flottantes — popovers, dropdowns, dialogs       |
| `color.background.inverse`  | `--color-background-inverse`  | `#090b0c` (mist.950) | `#ffffff` (mist.0)   | Surfaces inversées — tooltips sombres, badges contrastés |

**Do / Don't :**

- ✅ `background.default` — fond de `<html>` et des conteneurs racines.
- ❌ Ne pas utiliser `background.default` pour les cards — préférer `background.subtle`.
- ✅ `background.elevated` pour tout élément qui flotte au-dessus du contenu (menu, dialog).
- ❌ Ne pas utiliser `background.elevated` pour une card inline — ce n'est pas une surface flottante.

---

### Text

| Token                            | CSS Variable                       | Light      | Dark       | Usage                                                 |
| -------------------------------- | ---------------------------------- | ---------- | ---------- | ----------------------------------------------------- |
| `color.text.default`             | `--color-text-default`             | mist.950   | mist.50    | Corps de texte principal, headings                    |
| `color.text.subtle`              | `--color-text-subtle`              | mist.600   | mist.400   | Texte secondaire — captions, helper text, métadonnées |
| `color.text.bold`                | `--color-text-bold`                | mist.950   | mist.50    | Texte emphatique à fort contraste                     |
| `color.text.inverse`             | `--color-text-inverse`             | mist.0     | mist.950   | Texte sur surface inverse (fond sombre en light)      |
| `color.text.action.default`      | `--color-text-action-default`      | violet.600 | violet.400 | Liens, labels d'action primaire                       |
| `color.text.action.on`           | `--color-text-action-on`           | violet.50  | violet.50  | Texte posé sur un fond `action.background.default`    |
| `color.text.destructive.default` | `--color-text-destructive-default` | red.600    | red.500    | Messages d'erreur, actions destructives               |

**Do / Don't :**

- ✅ `text.subtle` pour les labels de champs, placeholders visibles, metadata.
- ❌ Ne pas utiliser `text.default` avec une opacité réduite pour simuler `text.subtle` — utiliser le token dédié.
- ✅ `text.action.on` uniquement sur fond `color.action.background.default`.
- ❌ Ne pas utiliser `text.destructive.default` pour des avertissements — c'est réservé aux erreurs.

---

### Border

| Token                  | CSS Variable             | Light    | Dark           | Usage                                         |
| ---------------------- | ------------------------ | -------- | -------------- | --------------------------------------------- |
| `color.border.default` | `--color-border-default` | mist.200 | white-alpha.10 | Séparateurs standards, contours de composants |
| `color.border.subtle`  | `--color-border-subtle`  | mist.200 | white-alpha.10 | Séparateurs discrets, poids visuel minimal    |
| `color.border.input`   | `--color-border-input`   | mist.200 | white-alpha.15 | Bordure spécifique aux champs de formulaire   |
| `color.border.focus`   | `--color-border-focus`   | mist.500 | mist.500       | Focus ring pour l'accessibilité clavier       |

**Do / Don't :**

- ✅ `border.input` pour toutes les bordures de `<input>`, `<select>`, `<textarea>`.
- ❌ Ne pas utiliser `border.focus` au repos ou au hover — uniquement pour l'état `:focus-visible`.
- ✅ `border.subtle` pour les dividers entre sections d'une page.
- ❌ Ne pas mélanger `border.default` et `border.subtle` dans le même composant.

---

### Icon

| Token                | CSS Variable           | Light     | Dark      | Usage                                            |
| -------------------- | ---------------------- | --------- | --------- | ------------------------------------------------ |
| `color.icon.default` | `--color-icon-default` | mist.950  | mist.50   | Icône principale en contexte neutre              |
| `color.icon.subtle`  | `--color-icon-subtle`  | mist.500  | mist.400  | Icône secondaire, désactivée ou décorative       |
| `color.icon.action`  | `--color-icon-action`  | violet.50 | violet.50 | Icône posée sur fond `action.background.default` |

**Do / Don't :**

- ✅ `icon.action` uniquement à l'intérieur d'un bouton primaire ou d'un badge d'action.
- ❌ Ne pas utiliser `icon.default` pour une icône à l'intérieur d'un bouton primaire — utiliser `icon.action`.

---

### Action

| Token                                | CSS Variable                           | Light      | Dark       | Usage                                 |
| ------------------------------------ | -------------------------------------- | ---------- | ---------- | ------------------------------------- |
| `color.action.background.default`    | `--color-action-background-default`    | violet.600 | violet.700 | Fond du bouton/composant CTA primaire |
| `color.action.background.foreground` | `--color-action-background-foreground` | violet.50  | violet.50  | Texte/icône sur fond action primaire  |

**Do / Don't :**

- ✅ Toujours associer `action.background.default` avec `action.background.foreground` pour le texte.
- ❌ Ne pas utiliser ces tokens pour les variantes `secondary`, `ghost` ou `outline`.

---

### Feedback

| Token                             | CSS Variable                        | Light   | Dark     | Usage                                                |
| --------------------------------- | ----------------------------------- | ------- | -------- | ---------------------------------------------------- |
| `color.feedback.error.default`    | `--color-feedback-error-default`    | red.600 | red.500  | Fond/icône/bordure d'état d'erreur                   |
| `color.feedback.error.foreground` | `--color-feedback-error-foreground` | mist.0  | mist.950 | Texte/icône posé **sur** une surface d'erreur pleine |

**Do / Don't :**

- ✅ Utiliser pour les messages de validation d'erreur et les bordures de champs invalides.
- ✅ Sur un fond d'erreur plein, toujours employer `color.feedback.error.foreground` (alias shadcn `--destructive-foreground`).
- ❌ Ne pas utiliser pour les avertissements (warning) ou les succès — des tokens dédiés seront ajoutés.
- ❌ Ne jamais poser de blanc en dur sur une surface d'erreur : en dark, blanc sur red.500 tombe à 2.89:1.

---

### Chart

Deux palettes, pour deux natures de données. Les confondre est l'erreur que
`npm run tokens:lint-chart` et ce tableau existent pour empêcher.

**Catégorielle** — catégories **sans ordre** (postes de dépenses, produits, canaux).
Les séries se distinguent par la **teinte**. Chaque série atteint 3:1 sur les fonds
`default`, `subtle` et `elevated` de son mode (WCAG 1.4.11), et toutes les paires
restent distinctes en vision normale, en protanopie et en deutéranopie (écart OKLab
≥ 0,15 ; la palette actuelle est à 0,19 au pire).

| Token           | CSS Variable      | Light                | Dark                 | Tailwind     |
| --------------- | ----------------- | -------------------- | -------------------- | ------------ |
| `color.chart.1` | `--color-chart-1` | violet.600 `#432dd7` | violet.400 `#6e6cff` | `bg-chart-1` |
| `color.chart.2` | `--color-chart-2` | blue.600 `#438fbd`   | blue.300 `#8fd6fa`   | `bg-chart-2` |
| `color.chart.3` | `--color-chart-3` | amber.600 `#af8526`  | yellow.200 `#e5e747` | `bg-chart-3` |
| `color.chart.4` | `--color-chart-4` | plum.800 `#4d2761`   | plum.500 `#9b5f7c`   | `bg-chart-4` |
| `color.chart.5` | `--color-chart-5` | amber.800 `#734e00`  | amber.500 `#c89005`  | `bg-chart-5` |

**Séquentielle** — données **ordonnées** (intensité, densité, heatmap). Les pas ne
diffèrent que par la clarté, du plus clair au plus foncé ; ils ne séparent pas des
catégories. Statut `reserved` : aucun composant ne l'emploie encore, pas de classe
Tailwind — la lire par `var(--color-chart-sequential-N)`.

| Token                      | CSS Variable                 | Valeur (les deux modes) |
| -------------------------- | ---------------------------- | ----------------------- |
| `color.chart.sequential.1` | `--color-chart-sequential-1` | green.200 `#bbf451`     |
| `color.chart.sequential.2` | `--color-chart-sequential-2` | green.300 `#7ccf00`     |
| `color.chart.sequential.3` | `--color-chart-sequential-3` | green.400 `#5ea500`     |
| `color.chart.sequential.4` | `--color-chart-sequential-4` | green.500 `#497d00`     |
| `color.chart.sequential.5` | `--color-chart-sequential-5` | green.600 `#3c6300`     |

**Do / Don't :**

- ✅ Catégories sans ordre : `chart-1` à `chart-5`, dans l'ordre, sans en sauter.
- ✅ Doubler la couleur d'un libellé ou d'une légende : la couleur seule ne porte jamais le sens.
- ✅ Données ordonnées : `color.chart.sequential.*`, du plus clair (valeur faible) au plus foncé.
- ❌ Ne jamais utiliser la palette séquentielle pour des catégories : ses pas se confondent.
- ❌ Ne pas employer une couleur de série pour du texte ou un état (positif, négatif) : ce ne sont pas des couleurs de feedback.

---

### Static

Couleurs qui **ignorent le mode** — les seules à le faire. La palette par défaut de
Tailwind est supprimée (`--color-*: initial` dans `app/globals.css`) : `bg-white` et
`bg-black` n'existent que parce que ces deux tokens les déclarent.

| Token                | CSS Variable           | Light / Dark     | Tailwind      | Usage                                       |
| -------------------- | ---------------------- | ---------------- | ------------- | ------------------------------------------- |
| `color.static.white` | `--color-static-white` | mist.0 `#ffffff` | `bg-white`    | Pastille de slider, texte sur une photo     |
| `color.static.black` | `--color-static-black` | black `#000000`  | `bg-black/10` | Voile derrière une modale, avec une opacité |

- ✅ `bg-black/10` pour le voile d'une modale : il assombrit pareil dans les deux modes.
- ❌ Ne pas employer `static.*` pour une surface ou un texte courant : le mode sombre ne s'appliquerait pas — utiliser `background.*` / `text.*`.

---

### Sidebar

| Token                             | CSS Variable                        | Light      | Dark           | Usage                                                 |
| --------------------------------- | ----------------------------------- | ---------- | -------------- | ----------------------------------------------------- |
| `color.sidebar.background`        | `--color-sidebar-background`        | mist.50    | mist.900       | Fond du panneau de navigation latérale                |
| `color.sidebar.foreground`        | `--color-sidebar-foreground`        | mist.950   | mist.50        | Texte/icône par défaut dans la sidebar                |
| `color.sidebar.primary.default`   | `--color-sidebar-primary-default`   | violet.550 | violet.500     | Fond de l'élément de navigation actif                 |
| `color.sidebar.primary.on`        | `--color-sidebar-primary-on`        | violet.50  | mist.0         | Texte sur l'élément actif de la sidebar               |
| `color.sidebar.accent.default`    | `--color-sidebar-accent-default`    | mist.100   | mist.800       | Fond hover/accent d'un élément sidebar                |
| `color.sidebar.accent.foreground` | `--color-sidebar-accent-foreground` | mist.900   | mist.50        | Texte sur fond accent sidebar                         |
| `color.sidebar.border`            | `--color-sidebar-border`            | mist.200   | white-alpha.10 | Séparateur interne de la sidebar                      |
| `color.sidebar.ring`              | `--color-sidebar-ring`              | mist.500   | mist.500       | Focus ring pour les éléments navigables de la sidebar |

---

## Modes

### Dark Mode

Activé via la classe `.dark` sur `<html>`. Toutes les surcharges sont définies dans `tokens.css` au sélecteur `.dark`. Les tokens de couleur basculent automatiquement — **ne jamais hardcoder** les valeurs primitives directement dans les composants.

```css
/* Automatique — ne rien faire d'autre */
<html class="dark">
```

---

## Tailwind Classes

Les tokens sont exposés via `@theme inline` dans `globals.css` et génèrent les classes utilitaires suivantes :

```html
<!-- Backgrounds -->
<div class="bg-background">
  <!-- color.background.default -->
  <div class="bg-card">
    <!-- color.background.subtle -->
    <div class="bg-popover">
      <!-- color.background.elevated -->

      <!-- Text -->
      <p class="text-foreground"><!-- color.text.default --></p>
      <p class="text-muted-foreground">
        <!-- color.text.subtle -->
        <a class="text-primary">
          <!-- color.text.action.default (via shadcn mapping) -->
          <p class="text-destructive">
            <!-- color.text.destructive.default -->

            <!-- Borders -->
          </p>

          <div class="border-border">
            <!-- color.border.default -->
            <input class="border-input" />
            <!-- color.border.input -->
            <div class="ring-ring"><!-- color.border.focus --></div>
          </div></a
        >
      </p>
    </div>
  </div>
</div>
```

---

## Usage Rules

1. **Toujours utiliser les tokens sémantiques** — jamais les valeurs primitives `mist.X` ou `violet.X` directement dans les composants. Les primitives sont privées (`--ds-prim-*`).
2. **Ne jamais simuler la subtilité par l'opacité** — utiliser `color.text.subtle` plutôt que `color.text.default` avec `opacity-50`.
3. **Respecter la hiérarchie des surfaces** : `default` → `subtle` → `elevated`. Une card est `subtle`, un popover est `elevated`.
4. **Toujours tester les deux modes** — chaque composant doit être validé en light ET dark avant livraison.
5. **Accessibilité avant tout** — le ratio de contraste minimum est 4.5:1 (WCAG AA) pour le texte de corps, 3:1 pour les grands textes et composants UI.
6. **Le contraste est vérifié mécaniquement** — `npm run tokens:lint-contrast` (inclus dans `npm run tokens-validate`) résout chaque paire fond/texte réellement livrée, dans les deux modes, et échoue sous le seuil. Les paires à surveiller sont déclarées dans `scripts/lint-contrast.ts` : **ajouter une paire dès qu'un nouveau couple fond/texte apparaît dans le DS**, sinon il n'est couvert par rien. Corriger le token, jamais le seuil.

## Contraste mesuré

Ratios WCAG 2.x des paires sous surveillance, à jour de la correction des 6 échecs du 2026-09-17.

| Paire                                                          | Light | Dark  | Seuil |
| -------------------------------------------------------------- | ----- | ----- | ----- |
| focus ring sur surface `default`                               | 4.61  | 4.28  | 3.0   |
| focus ring sur surface `subtle`                                | 4.14  | 3.21  | 3.0   |
| focus ring sidebar sur surface sidebar                         | 4.44  | 3.77  | 3.0   |
| `text.default` sur `background.default`                        | 19.72 | 18.99 | 4.5   |
| `text.subtle` sur `background.default`                         | 5.10  | 8.08  | 4.5   |
| `text.subtle` sur `background.subtle` (`muted-foreground`)     | 4.58  | 6.06  | 4.5   |
| `text.action.default` sur `background.default`                 | 8.09  | 4.93  | 4.5   |
| `action.background.foreground` sur `action.background.default` | 7.24  | 8.99  | 4.5   |
| `feedback.error.foreground` sur `feedback.error.default`       | 4.77  | 6.83  | 4.5   |
| `sidebar.primary.on` sur `sidebar.primary.default`             | 5.78  | 4.58  | 4.5   |

Paliers primitifs ajoutés pour y parvenir : **`mist.600`** (`#607175`), **`mist.700`** (`#424f52`, comble le saut 500 → 800 et préserve la monotonicité de l'échelle) et **`violet.400`** (`#6e6cff`).
