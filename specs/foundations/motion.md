# Motion Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

Le système de motion définit des **durées** et des **courbes d'accélération** (easings) cohérentes pour toutes les transitions et animations de l'interface. La combinaison par défaut est `motion.duration.normal` (200ms) + `motion.easing.default` (ease-in-out).

---

## Durées

| Token                     | CSS Variable                | Valeur  | Tailwind Class    | Cas d'usage typique                                             |
| ------------------------- | --------------------------- | ------- | ----------------- | --------------------------------------------------------------- |
| `motion.duration.instant` | `--motion-duration-instant` | `0ms`   | —                 | Changements d'état sans transition (ex: masquer un élément)     |
| `motion.duration.fast`    | `--motion-duration-fast`    | `100ms` | `duration-fast`   | Hover/focus — feedback immédiat sur des éléments interactifs    |
| `motion.duration.normal`  | `--motion-duration-normal`  | `200ms` | `duration-normal` | **Valeur par défaut** — transitions de couleur, border, opacity |
| `motion.duration.slow`    | `--motion-duration-slow`    | `300ms` | `duration-slow`   | Modals, drawers, accordéons — entrée/sortie d'éléments larges   |
| `motion.duration.slower`  | `--motion-duration-slower`  | `500ms` | `duration-slower` | Animations complexes — uniquement pour effets très délibérés    |

> **Tailwind :** Les classes `duration-fast`, `duration-normal`, `duration-slow`, `duration-slower` sont générées via `@theme inline` (`--transition-duration-*`).

---

## Easings

| Token                   | CSS Variable              | Valeur CSS                                | Tailwind Class | Ressenti visuel                                     |
| ----------------------- | ------------------------- | ----------------------------------------- | -------------- | --------------------------------------------------- |
| `motion.easing.default` | `--motion-easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)`            | `ease-default` | Naturel — accélère puis décélère, fluidité générale |
| `motion.easing.in`      | `--motion-easing-in`      | `cubic-bezier(0.4, 0, 1, 1)`              | `ease-in`      | Accélère vers la fin — pour les sorties d'écran     |
| `motion.easing.out`     | `--motion-easing-out`     | `cubic-bezier(0, 0, 0.2, 1)`              | `ease-out`     | Décélère en fin — pour les entrées à l'écran        |
| `motion.easing.spring`  | `--motion-easing-spring`  | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | `ease-spring`  | Ressort avec dépassement — interactions ludiques    |

> **Tailwind :** Les classes `ease-default`, `ease-in`, `ease-out`, `ease-spring` sont générées via `@theme inline` (`--ease-*`). Elles ont longtemps été déclarées sous `--transition-timing-function-*`, qui n'est pas un namespace Tailwind v4 : aucune des quatre classes n'existait réellement.

### Quand utiliser quel easing ?

```
Élément entrant à l'écran    → ease-out  (décélère à l'arrivée, semble naturel)
Élément quittant l'écran     → ease-in   (accélère vers la sortie)
Transition d'état neutre     → ease-default (hover, color, opacity)
Interaction playful/feedback → ease-spring  (bouton "pop", badge d'ajout)
```

---

---

## Exemples d'utilisation

### Hover standard (couleur/opacité)

```tsx
<button className="transition-colors duration-fast ease-default hover:bg-accent">
  Bouton
</button>
```

### Fade d'un élément

```tsx
<div className="opacity-0 transition-opacity duration-normal ease-default data-[visible=true]:opacity-100">
  Contenu conditionnel
</div>
```

### Entrée d'un modal

```tsx
<dialog className="transition-all duration-slow ease-out">
  Contenu du dialog
</dialog>
```

### Sortie d'un dropdown

```tsx
<div className="transition-all duration-normal ease-in data-[state=closed]:scale-95 data-[state=closed]:opacity-0">
  Menu
</div>
```

### Animation spring sur un badge

```tsx
<span className="transition-transform duration-normal ease-spring hover:scale-110">
  🎉 New
</span>
```

---

## Combinaisons recommandées

| Cas                              | Durée            | Easing         |
| -------------------------------- | ---------------- | -------------- |
| Hover / focus (couleur, bordure) | `fast` (100ms)   | `ease-default` |
| Fade in/out d'un élément         | `normal` (200ms) | `ease-default` |
| Entrée d'un overlay/modal        | `slow` (300ms)   | `ease-out`     |
| Sortie d'un overlay/modal        | `normal` (200ms) | `ease-in`      |
| Expansion d'accordéon            | `slow` (300ms)   | `ease-out`     |
| Micro-animation ludique          | `normal` (200ms) | `ease-spring`  |
| Animation de graphique           | `slower` (500ms) | `ease-out`     |

---

## Usage Rules

1. **Point de départ universel** — `motion.duration.normal` (200ms) + `motion.easing.default` est la combinaison par défaut pour toute nouvelle transition.
2. **Toujours utiliser les tokens CSS** — jamais de valeurs de durée ou d'easing hardcodées dans le code.
3. **`ease-in` pour les sorties, `ease-out` pour les entrées** — c'est une convention UX universelle qui correspond au comportement physique naturel.
4. **`ease-spring` avec parcimonie** — uniquement pour des interactions expressives et délibérées (feedback positif, gamification). Jamais sur les transitions d'état basiques.
5. **Ne jamais contourner les tokens** — pas de valeurs hardcodées ni de `!important` sur les propriétés de transition.
