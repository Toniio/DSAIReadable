# Opacity Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

Le système d'opacité définit **trois tokens sémantiques** couvrant les cas d'usage principaux : désactivation, placeholder, et backdrop d'overlay. En dehors de ces trois cas, **l'opacité ne doit pas être utilisée** comme substitut aux tokens de couleur dédiés.

---

## Semantic Tokens

| Token                 | CSS Variable            | Valeur | Tailwind Class                                                   | Usage                                           |
| --------------------- | ----------------------- | ------ | ---------------------------------------------------------------- | ----------------------------------------------- |
| `opacity.disabled`    | `--opacity-disabled`    | `0.5`  | `disabled:opacity-disabled` (et toute variante d'état désactivé) | Éléments interactifs désactivés                 |
| `opacity.placeholder` | `--opacity-placeholder` | `0.5`  | `placeholder:opacity-50`                                         | Texte placeholder dans les champs de formulaire |
| `opacity.overlay`     | `--opacity-overlay`     | `0.8`  | `opacity-80`                                                     | Backdrop/backdrop de modals et dialogs          |

---

## `opacity.disabled` — Éléments désactivés

### Quand utiliser

Appliquer sur tout élément interactif en état `disabled` : boutons, inputs, selects, checkboxes, etc.

### La classe `opacity-disabled`

Le pont `@theme` de `app/globals.css` fait du token une classe Tailwind : `opacity-disabled` lit `--opacity-disabled`. Elle se place sous la variante de l'état désactivé, quelle que soit sa forme :

```tsx
// ✅ Le token, sous la variante de l'état
<button disabled className="disabled:opacity-disabled disabled:cursor-not-allowed">
  Bouton désactivé
</button>
// Même règle pour data-disabled:, aria-disabled:, has-disabled:, peer-disabled:,
// group-data-[disabled=true]/…:

// ❌ Même rendu, mais le token n'y est plus : ESLint refuse
<button disabled className="disabled:opacity-50">
  Bouton désactivé
</button>

// ❌ Valeur en dur
<button disabled style={{ opacity: 0.5 }}>
  Bouton désactivé
</button>
```

> **Garde-fou :** la règle `better-tailwindcss/no-restricted-classes` refuse `opacity-<n>` sous toute variante contenant `disabled`, et `eslint --fix` la remplace par `opacity-disabled`. Elle ne voit pas une classe nue dont l'état est porté ailleurs — la clé `disabled` des `classNames` de `Calendar`, par exemple : l'y écrire à la main.

---

## `opacity.placeholder` — Texte placeholder

Appliqué au pseudo-élément `::placeholder` des champs de formulaire :

```tsx
// ✅ Via Tailwind
<input
  className="placeholder:opacity-50 placeholder:text-foreground"
  placeholder="Saisir une valeur..."
/>

// ✅ Via CSS
input::placeholder {
  opacity: var(--opacity-placeholder);
}
```

---

## `opacity.overlay` — Backdrops de modals

Appliqué sur le fond semi-transparent (`backdrop`) derrière les modals, drawers et dialogs :

```tsx
// ✅ Backdrop de modal
<div
  className="fixed inset-0 bg-background-inverse opacity-80 z-overlay"
  aria-hidden="true"
/>

// Ou avec classe Tailwind directe
<div className="fixed inset-0 bg-black/80 z-overlay" aria-hidden="true" />
```

> La valeur `0.8` assure un assombrissement suffisant pour que le contenu du modal reste lisible, sans bloquer complètement le contexte visuel sous-jacent.

---

## ⚠️ Quand NE PAS utiliser l'opacité

L'opacité globale modifie **tout** le composant (texte, fond, bordure, icône). Elle est **non-sélective** et peut créer des effets indésirables.

### Cas à éviter — préférer les tokens de couleur

| ❌ Ne pas faire                                          | ✅ Faire à la place                                     |
| -------------------------------------------------------- | ------------------------------------------------------- |
| `<p class="opacity-50">Texte secondaire</p>`             | `<p class="text-muted-foreground">Texte secondaire</p>` |
| `<p class="text-foreground opacity-50">Caption</p>`      | `<p class="text-muted-foreground text-xs">Caption</p>`  |
| `<div class="bg-primary opacity-70">Zone atténuée</div>` | `<div class="bg-secondary">Zone atténuée</div>`         |
| `<Icon class="opacity-50" />`                            | `<Icon class="text-muted-foreground" />`                |

**Règle :** Si l'intention est de réduire la **prominente visuelle** d'un texte ou d'une icône, utiliser les tokens de couleur `subtle` / `muted-foreground`. L'opacité est réservée aux **états binaires** (disabled, overlay).

---

## Résumé de décision

```
Besoin                                    → Solution
──────────────────────────────────────────────────────────────────
Désactiver un bouton / input              → disabled:opacity-disabled
Placeholder d'un champ                   → placeholder:opacity-50
Backdrop d'une modal / dialog            → opacity-80 (bg-black/80)
Texte secondaire / atténué               → text-muted-foreground
Icône secondaire                         → text-muted-foreground
Fond atténué                             → bg-card / bg-secondary
Réduire la saturation d'une image        → CSS filter (hors tokens)
```

---

## Usage Rules

1. **Trois cas, trois tokens** — `disabled`, `placeholder`, `overlay` sont les seuls contextes légitimes pour l'opacité globale.
2. **Un état désactivé s'écrit `opacity-disabled`** sous sa variante (`disabled:opacity-disabled`) — jamais `opacity-50`, que ESLint refuse : la valeur est celle du token, pas celle de l'échelle de Tailwind.
3. **Ne jamais utiliser l'opacité pour simuler une couleur subtile** — toujours utiliser `color.text.subtle` / `text-muted-foreground`.
4. **L'opacité est non-sélective** — elle s'applique à tout le sous-arbre DOM. En cas de besoin partiel, utiliser des tokens de couleur ciblés.
5. **`opacity.overlay` à `0.8` est la valeur de référence** — ne pas diminuer cette valeur pour les modals standards, cela nuit à la lisibilité du contenu principal.
