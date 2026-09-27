# Opacity Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

Le système d'opacité définit **trois tokens sémantiques** couvrant les cas d'usage principaux : désactivation, placeholder, et backdrop d'overlay. En dehors de ces trois cas, **l'opacité ne doit pas être utilisée** comme substitut aux tokens de couleur dédiés.

---

## Semantic Tokens

| Token                 | CSS Variable            | Valeur | Tailwind Class                       | Usage                                           |
| --------------------- | ----------------------- | ------ | ------------------------------------ | ----------------------------------------------- |
| `opacity.disabled`    | `--opacity-disabled`    | `0.5`  | `opacity-50` / `disabled:opacity-50` | Éléments interactifs désactivés                 |
| `opacity.placeholder` | `--opacity-placeholder` | `0.5`  | `placeholder:opacity-50`             | Texte placeholder dans les champs de formulaire |
| `opacity.overlay`     | `--opacity-overlay`     | `0.8`  | `opacity-80`                         | Backdrop/backdrop de modals et dialogs          |

---

## `opacity.disabled` — Éléments désactivés

### Quand utiliser

Appliquer sur tout élément interactif en état `disabled` : boutons, inputs, selects, checkboxes, etc.

### `opacity.disabled` vs `disabled:opacity-50`

Ces deux approches sont **équivalentes en valeur (0.5)**. Préférer la classe Tailwind utilitaire dans les composants :

```tsx
// ✅ Préféré — classe Tailwind (état disabled géré par Tailwind)
<button disabled className="disabled:opacity-50 disabled:cursor-not-allowed">
  Bouton désactivé
</button>

// ✅ Acceptable — via CSS variable (pour des cas CSS custom)
<button disabled style={{ opacity: "var(--opacity-disabled)" }}>
  Bouton désactivé
</button>

// ❌ Valeur hardcodée — à éviter
<button disabled style={{ opacity: 0.5 }}>
  Bouton désactivé
</button>
```

> **Note :** shadcn applique déjà `disabled:opacity-50` sur ses composants natifs (`Button`, `Input`, etc.). Ne pas redéfinir ce comportement.

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
Désactiver un bouton / input              → disabled:opacity-50
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
2. **Préférer `disabled:opacity-50` (classe Tailwind)** plutôt que la variable CSS dans les composants React — c'est plus lisible et aligné avec shadcn.
3. **Ne jamais utiliser l'opacité pour simuler une couleur subtile** — toujours utiliser `color.text.subtle` / `text-muted-foreground`.
4. **L'opacité est non-sélective** — elle s'applique à tout le sous-arbre DOM. En cas de besoin partiel, utiliser des tokens de couleur ciblés.
5. **`opacity.overlay` à `0.8` est la valeur de référence** — ne pas diminuer cette valeur pour les modals standards, cela nuit à la lisibilité du contenu principal.
