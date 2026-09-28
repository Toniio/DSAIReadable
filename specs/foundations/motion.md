# Motion Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

The motion system defines consistent **durations** and **easing curves** for every transition and animation in the interface. The default combination is `motion.duration.normal` (200ms) with `motion.easing.default` (ease-in-out).

---

## Durations

| Token                     | CSS Variable                | Value   | Tailwind Class    | Typical use                                                      |
| ------------------------- | --------------------------- | ------- | ----------------- | ---------------------------------------------------------------- |
| `motion.duration.instant` | `--motion-duration-instant` | `0ms`   | —                 | State changes with no transition (hiding an element)             |
| `motion.duration.fast`    | `--motion-duration-fast`    | `100ms` | `duration-fast`   | Hover and focus — immediate feedback on interactive elements     |
| `motion.duration.normal`  | `--motion-duration-normal`  | `200ms` | `duration-normal` | **The default** — color, border and opacity transitions          |
| `motion.duration.slow`    | `--motion-duration-slow`    | `300ms` | `duration-slow`   | Modals, drawers, accordions — large elements entering or leaving |
| `motion.duration.slower`  | `--motion-duration-slower`  | `500ms` | `duration-slower` | Complex animations — only for deliberate effects                 |

> **Tailwind:** the `duration-fast`, `duration-normal`, `duration-slow` and `duration-slower` classes are generated through `@theme inline` (`--transition-duration-*`).

---

## Easings

| Token                   | CSS Variable              | CSS value                                 | Tailwind Class | How it feels                                         |
| ----------------------- | ------------------------- | ----------------------------------------- | -------------- | ---------------------------------------------------- |
| `motion.easing.default` | `--motion-easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)`            | `ease-default` | Natural — speeds up, then slows down; smooth overall |
| `motion.easing.in`      | `--motion-easing-in`      | `cubic-bezier(0.4, 0, 1, 1)`              | `ease-in`      | Speeds up toward the end — for leaving the screen    |
| `motion.easing.out`     | `--motion-easing-out`     | `cubic-bezier(0, 0, 0.2, 1)`              | `ease-out`     | Slows down at the end — for entering the screen      |
| `motion.easing.spring`  | `--motion-easing-spring`  | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | `ease-spring`  | Springy, with overshoot — for playful interactions   |

> **Tailwind:** the `ease-default`, `ease-in`, `ease-out` and `ease-spring` classes are generated through `@theme inline` (`--ease-*`). For a long time they were declared under `--transition-timing-function-*`, which is not a Tailwind v4 namespace: none of the four classes actually existed.

### Which easing when?

```
Element entering the screen   → ease-out      (slows down on arrival, feels natural)
Element leaving the screen    → ease-in       (speeds up on the way out)
Neutral state change          → ease-default  (hover, color, opacity)
Playful interaction/feedback  → ease-spring   (a button "pop", an added badge)
```

---

## Examples

### Standard hover (color / opacity)

```tsx
<button className="transition-colors duration-fast ease-default hover:bg-accent">
  Button
</button>
```

### Fading an element

```tsx
<div className="opacity-0 transition-opacity duration-normal ease-default data-[visible=true]:opacity-100">
  Conditional content
</div>
```

### A modal entering

```tsx
<dialog className="transition-all duration-slow ease-out">
  Dialog content
</dialog>
```

### A drop-down leaving

```tsx
<div className="transition-all duration-normal ease-in data-[state=closed]:scale-95 data-[state=closed]:opacity-0">
  Menu
</div>
```

### A spring animation on a badge

```tsx
<span className="transition-transform duration-normal ease-spring hover:scale-110">
  🎉 New
</span>
```

---

## Suggested combinations

| Case                          | Duration         | Easing         |
| ----------------------------- | ---------------- | -------------- |
| Hover / focus (color, border) | `fast` (100ms)   | `ease-default` |
| Fading an element in or out   | `normal` (200ms) | `ease-default` |
| An overlay or modal entering  | `slow` (300ms)   | `ease-out`     |
| An overlay or modal leaving   | `normal` (200ms) | `ease-in`      |
| An accordion expanding        | `slow` (300ms)   | `ease-out`     |
| A playful micro-animation     | `normal` (200ms) | `ease-spring`  |
| A chart animation             | `slower` (500ms) | `ease-out`     |

---

## Usage Rules

1. **A universal starting point** — `motion.duration.normal` (200ms) with `motion.easing.default` is the default combination for any new transition.
2. **Always use the CSS tokens** — never hard-code a duration or an easing in the code.
3. **`ease-in` for exits, `ease-out` for entrances** — a universal UX convention that matches natural physical motion.
4. **`ease-spring` sparingly** — only for expressive, deliberate interactions (positive feedback, gamification). Never on basic state transitions.
5. **Never work around the tokens** — no hard-coded values and no `!important` on transition properties.
