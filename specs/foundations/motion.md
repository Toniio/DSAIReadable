# Motion Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

The motion system defines consistent **durations** and **easing curves** for every transition and animation in the interface. The default combination is `motion.duration.normal` (200ms) with `motion.easing.default` (ease-in-out).

---

## Durations

| Token                        | CSS Variable                   | Value    | Tailwind Class        | Typical use                                                                                     |
| ---------------------------- | ------------------------------ | -------- | --------------------- | ----------------------------------------------------------------------------------------------- |
| `motion.duration.instant`    | `--motion-duration-instant`    | `0ms`    | —                     | State changes with no transition (hiding an element)                                            |
| `motion.duration.fast`       | `--motion-duration-fast`       | `100ms`  | `duration-fast`       | Hover and focus — immediate feedback on interactive elements                                    |
| `motion.duration.normal`     | `--motion-duration-normal`     | `200ms`  | `duration-normal`     | **The default** — color, border and opacity transitions                                         |
| `motion.duration.slow`       | `--motion-duration-slow`       | `300ms`  | `duration-slow`       | Modals, drawers, accordions — large elements entering or leaving                                |
| `motion.duration.slower`     | `--motion-duration-slower`     | `500ms`  | `duration-slower`     | Complex animations — only for deliberate effects                                                |
| `motion.duration.extra-slow` | `--motion-duration-extra-slow` | `1000ms` | `duration-extra-slow` | A one-second transition, `animate-in` or `animate-out` — the `InputOTP` caret carries the class |

> **Tailwind:** the `duration-fast`, `duration-normal`, `duration-slow`, `duration-slower` and `duration-extra-slow` classes are generated through `@theme inline` (`--transition-duration-*`). Each one sets `transition-duration` and the `--tw-duration` that the `animate-in` and `animate-out` animations of tw-animate-css read. A keyframe animation that sets its own timing ignores them: `animate-caret-blink` blinks at its own pace, whatever `duration-*` class sits beside it.

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

`Button`, `Toggle` and the menu items already carry their hover transition: these classes go on a surface the screen draws itself.

```tsx
import { Card, CardContent } from "@/components/ui/card"

export default function Example() {
  return (
    <Card className="transition-colors duration-fast ease-default hover:bg-muted">
      <CardContent>Recent activity</CardContent>
    </Card>
  )
}
```

### Fading an element

```tsx
<div className="opacity-0 transition-opacity duration-normal ease-default data-[visible=true]:opacity-100">
  Conditional content
</div>
```

### A modal entering

A screen does not animate a modal surface itself: `Dialog`, `AlertDialog`, `Sheet` and `Drawer` enter and leave on their own. Their backdrop fades with `OVERLAY_BASE` (`lib/overlay.ts`), `Dialog` and `AlertDialog` zoom in with `MODAL_CONTENT_BASE`, `Sheet` slides in from its side, and `Drawer` moves with vaul. Use the component as it is, and do not re-time it.

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

## Reduced motion

When the user asks the system for less motion (`prefers-reduced-motion: reduce`), an entrance or an exit fades instead of moving: nothing zooms, slides, spins or blurs in or out. One block in the `@layer base` of `styles/globals.css` does it for every component. A component adds no `motion-reduce:` class, and that block is the only `!important` the design system writes.

| Source                                                                                                                                                                      | Default motion                                                   | Under `reduce`                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tw-animate-css (`animate-in`, `animate-out`): Dialog, AlertDialog, Sheet, Popover, HoverCard, Tooltip, DropdownMenu, ContextMenu, Menubar, Select, Combobox, NavigationMenu | A fade with a zoom (`zoom-in-95`) or a slide (`slide-in-from-*`) | The fade alone: the translation, scale, rotation and blur variables (`--tw-enter-*`, `--tw-exit-*`) return to `initial`, their neutral value. NavigationMenu's viewport, which zooms without a fade, appears at once |
| Accordion (`animate-accordion-down`, `animate-accordion-up`)                                                                                                                | The panel's height grows or shrinks                              | The panel opens and closes at once                                                                                                                                                                                   |
| Skeleton (`animate-pulse`)                                                                                                                                                  | A pulse                                                          | Static                                                                                                                                                                                                               |
| Attachment title (`shimmer`)                                                                                                                                                | A shimmer while the file uploads or is processed                 | Static, in the text color                                                                                                                                                                                            |
| InputOTP caret (`animate-caret-blink`)                                                                                                                                      | A blink                                                          | Static, always shown                                                                                                                                                                                                 |
| Drawer (vaul)                                                                                                                                                               | The panel slides in from its edge                                | The panel fades, with vaul's own `fadeIn` and `fadeOut`. A drawer with `snapPoints` still moves to its snap points                                                                                                   |
| Carousel (Embla)                                                                                                                                                            | A scroll to the next slide                                       | A jump to it: Embla's `duration` is `0` under the query. A drag still follows the pointer                                                                                                                            |
| MessageScroller button                                                                                                                                                      | Slides and scales in and out                                     | Fades. The scroll it starts stays smooth; pass `behavior="auto"` to make it instant                                                                                                                                  |
| Sidebar, on the desktop                                                                                                                                                     | Slides and resizes as it collapses                               | Collapses and expands at once. Below `md` it is a Sheet: the fade alone                                                                                                                                              |
| Sonner                                                                                                                                                                      | Toasts slide in and swipe out                                    | Sonner's own rule: no animation and no transition on the toast                                                                                                                                                       |
| Spinner (`animate-spin`), Sonner's loading icon                                                                                                                             | Spins                                                            | Kept: it is the only sign that work is in progress                                                                                                                                                                   |
| Button (`active:translate-y-px`), the Switch thumb, the Progress bar, a chevron that turns                                                                                  | A shift of a pixel, or a movement inside the control             | Kept: the movement stays inside the control and shows its state                                                                                                                                                      |

A new entrance or exit uses the tw-animate-css classes, which this block already reduces. Any other movement (a loop, or a transition of position or size) adds its `data-slot` to the block in the same change, with a test in `tests/reduced-motion/`.

---

## Usage Rules

1. **A universal starting point** — `motion.duration.normal` (200ms) with `motion.easing.default` is the default combination for any new transition.
2. **Always use the CSS tokens** — never hard-code a duration or an easing in the code.
3. **`ease-in` for exits, `ease-out` for entrances** — a universal UX convention that matches natural physical motion.
4. **`ease-spring` sparingly** — only for expressive, deliberate interactions (positive feedback, gamification). Never on basic state transitions.
5. **Never work around the tokens** — no hard-coded values and no `!important` on transition properties.
