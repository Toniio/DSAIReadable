# Elevation Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

Les élévations traduisent la **hauteur relative** d'une surface dans la hiérarchie visuelle. Plus le niveau est élevé, plus l'ombre est prononcée. En mode dark, les opacités sont nettement plus fortes pour compenser la luminosité réduite du fond.

---

## Les 7 niveaux d'élévation

| Token             | CSS Variable        | Tailwind Class | Sémantique / Surface                                       |
| ----------------- | ------------------- | -------------- | ---------------------------------------------------------- |
| `elevation.xs`    | `--elevation-xs`    | `shadow-xs`    | Micro-lift — hover sur un élément interactif               |
| `elevation.sm`    | `--elevation-sm`    | `shadow-sm`    | Lift léger — card au repos, hover renforcé                 |
| `elevation.md`    | `--elevation-md`    | `shadow-md`    | Élévation standard — dropdowns, context menus              |
| `elevation.lg`    | `--elevation-lg`    | `shadow-lg`    | Élévation marquée — modals, side panels                    |
| `elevation.xl`    | `--elevation-xl`    | `shadow-xl`    | Forte élévation — panneau plein écran, drawer              |
| `elevation.2xl`   | `--elevation-2xl`   | `shadow-2xl`   | Élévation maximale — toasts, notifications hautes priorité |
| `elevation.inner` | `--elevation-inner` | `shadow-inner` | Ombre interne — inputs déprimés, état pressé               |

---

## Valeurs CSS

### Light Mode (opacités faibles, 4–12%)

| Token             | Valeur                                                             |
| ----------------- | ------------------------------------------------------------------ |
| `elevation.xs`    | `0 1px 2px rgba(0, 0, 0, 0.04)`                                    |
| `elevation.sm`    | `0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)`     |
| `elevation.md`    | `0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.04)`     |
| `elevation.lg`    | `0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)`   |
| `elevation.xl`    | `0 20px 25px rgba(0, 0, 0, 0.08), 0 10px 10px rgba(0, 0, 0, 0.03)` |
| `elevation.2xl`   | `0 25px 50px rgba(0, 0, 0, 0.12)`                                  |
| `elevation.inner` | `inset 0 2px 4px rgba(0, 0, 0, 0.05)`                              |

### Dark Mode (opacités fortes, 20–50%)

| Token             | Valeur                                                            |
| ----------------- | ----------------------------------------------------------------- |
| `elevation.xs`    | `0 1px 2px rgba(0, 0, 0, 0.2)`                                    |
| `elevation.sm`    | `0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)`      |
| `elevation.md`    | `0 4px 6px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.18)`    |
| `elevation.lg`    | `0 10px 15px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2)`    |
| `elevation.xl`    | `0 20px 25px rgba(0, 0, 0, 0.35), 0 10px 10px rgba(0, 0, 0, 0.2)` |
| `elevation.2xl`   | `0 25px 50px rgba(0, 0, 0, 0.5)`                                  |
| `elevation.inner` | `inset 0 2px 4px rgba(0, 0, 0, 0.3)`                              |

> **Pourquoi des opacités plus fortes en dark ?** Les fonds sombres absorbent les ombres légères. Une opacité de 0.08 en dark est presque invisible — il faut 0.25–0.50 pour obtenir le même rendu perceptuel qu'en light.

---

## Hiérarchie sémantique

```
Niveau       Surface type                      Z-index approximatif
─────────────────────────────────────────────────────────────────────
2xl   ████   Toasts, notifications urgentes     z-toast (1600)
xl    ███    Drawers, panneaux plein-écran       z-modal (1400)
lg    ███    Modals, dialogs                     z-modal (1400)
md    ██     Dropdowns, menus contextuels        z-dropdown (1000)
sm    █      Cards au repos, hover d'éléments    —
xs    ░      Micro-interactions, hover subtil    —
inner ▼      Inputs déprimés, état pressé        —
```

---

## Exemples d'utilisation

```tsx
// Card au repos
<div className="shadow-sm rounded-lg bg-card p-4">...</div>

// Card au hover — élévation augmentée
<div className="shadow-sm hover:shadow-md transition-shadow duration-normal rounded-lg bg-card p-4">
  ...
</div>

// Dropdown menu
<div className="shadow-md rounded-lg bg-popover p-2">
  <MenuItem />
</div>

// Dialog / Modal
<div className="shadow-lg rounded-xl bg-card p-6">
  <DialogContent />
</div>

// Toast
<div className="shadow-2xl rounded-lg bg-card p-4">
  <ToastContent />
</div>

// Input avec ombre interne (état focus ou inset)
<input className="shadow-inner border-input rounded-sm px-3 py-2" />
```

---

## Note sur `shadow-inner`

`shadow-inner` est une **ombre interne** (inset). Elle s'utilise pour :

- Indiquer un **état pressé** sur un bouton ou contrôle
- Donner une apparence **déprimée** à un champ de formulaire actif
- Simuler un **fond enfoncé** sur une zone sélectionnée

```tsx
// Bouton pressé
<button className="shadow-inner active:shadow-inner">Cliquer</button>

// Input déprimé (focus)
<input className="focus:shadow-inner focus:border-ring" />
```

> **Important :** Ne jamais combiner `shadow-inner` avec une ombre externe. Les deux entrent en conflit visuellement.

---

## Usage Rules

1. **Suivre la hiérarchie** — l'élévation doit refléter la position Z réelle de la surface. Un popover ne doit jamais avoir moins d'élévation qu'une card inline.
2. **Toujours tester en dark mode** — les ombres légères du light sont invisibles en dark sans ajustement. Les tokens s'en chargent automatiquement.
3. **Transitions d'élévation** — utiliser `transition-shadow` avec `duration-normal` (200ms) lors de changements d'état (hover, focus).
4. **`shadow-inner` est exclusif** — ne pas l'associer avec une ombre externe sur le même élément.
5. **Éviter les ombres décoratifs** — les élévations expriment une structure, pas un style. Ne pas ajouter `shadow-lg` sur une card simplement pour "faire joli".
