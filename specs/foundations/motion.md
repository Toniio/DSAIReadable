# Motion Foundation

> Source: `tokens/semantic.json` · CSS variables: `tokens.css` Layer 2

The motion system defines consistent **durations** and **easing curves** for every transition and animation in the interface. A transition with no duration class runs at `motion.duration.fast` (100ms) on `motion.easing.default`: that is what the hover and focus states of the components do, and the overlays they draw enter and leave in 100ms too.

---

## Durations

| Token                        | CSS Variable                   | Value    | Tailwind Class        | Typical use                                                                                                                                                   |
| ---------------------------- | ------------------------------ | -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `motion.duration.instant`    | `--motion-duration-instant`    | `0ms`    | —                     | State changes with no transition (hiding an element)                                                                                                          |
| `motion.duration.fast`       | `--motion-duration-fast`       | `100ms`  | `duration-fast`       | **The default** of a transition with no duration class: hover and focus feedback. Also the entrance and exit of most overlays the components draw (see below) |
| `motion.duration.normal`     | `--motion-duration-normal`     | `200ms`  | `duration-normal`     | Fading or moving a surface a screen draws itself; the `Sheet` slide, the `Sidebar` collapse, the `MessageScrollerButton` entrance                             |
| `motion.duration.slow`       | `--motion-duration-slow`       | `300ms`  | `duration-slow`       | The `NavigationMenu` content without a viewport and its chevron, the `MessageScrollerButton` exit; no modal or drawer uses it                                 |
| `motion.duration.slower`     | `--motion-duration-slower`     | `500ms`  | `duration-slower`     | Complex animations — only for deliberate effects; no component uses it (the `Drawer` runs vaul's own 500ms)                                                   |
| `motion.duration.extra-slow` | `--motion-duration-extra-slow` | `1000ms` | `duration-extra-slow` | A one-second transition, `animate-in` or `animate-out`; no component uses it                                                                                  |

> **Tailwind:** the `duration-fast`, `duration-normal`, `duration-slow`, `duration-slower` and `duration-extra-slow` classes are generated through `@theme inline` (`--transition-duration-*`). Each one sets `transition-duration` and the `--tw-duration` that the `animate-in` and `animate-out` animations of tw-animate-css read. A keyframe animation that sets its own timing ignores them: `animate-caret-blink` blinks at its own 1.25s, whatever `duration-*` class sits beside it. `--default-transition-duration` and `--default-transition-timing-function` read `motion.duration.fast` and `motion.easing.default`, so `transition`, `transition-colors` and `transition-all` with no `duration-*` run at 100ms.

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

## What the components draw

Read in the browser, in the order a screen meets them. A keyword (`ease`, `ease-out`, `linear`) is the CSS keyword, not the `motion.easing.*` token of the same name: tw-animate-css reads `var(--tw-ease, ease)` and `var(--tw-duration, .15s)`, and a component sets `--tw-duration` through `duration-fast` and friends.

| What                                                                                                                                                                            | Duration                              | Easing                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `Dialog`, `AlertDialog`, `Popover`, `HoverCard`, `DropdownMenu`, `ContextMenu`, `Select` with `position="popper"`, `Combobox`, the `NavigationMenu` viewport: entrance and exit | `fast` (100ms)                        | `ease`                                                                                                |
| `Menubar`: its menus enter in 100ms, and leave at once, as shadcn/ui draws them; its submenus enter and leave in 100ms                                                          | `fast` (100ms)                        | `ease`                                                                                                |
| The backdrop of `Dialog`, `AlertDialog` and `Sheet`                                                                                                                             | `fast` (100ms)                        | `ease`                                                                                                |
| `Tooltip`: entrance and exit, by hover or by keyboard focus                                                                                                                     | 150ms, tw-animate-css's default       | `ease`                                                                                                |
| `Sheet` panel: slides in and out, both directions                                                                                                                               | `normal` (200ms)                      | `ease-in-out`: Tailwind's curve, the same as `ease-default`                                           |
| `Accordion` panel: opens and closes                                                                                                                                             | 200ms, tw-animate-css's default       | `ease-out`: the keyword, not `motion.easing.out`                                                      |
| `Drawer` panel and backdrop                                                                                                                                                     | 500ms, vaul's own                     | `cubic-bezier(0.32, 0.72, 0, 1)`, vaul's own                                                          |
| `NavigationMenu` content that slides between two triggers, with the viewport                                                                                                    | 150ms, tw-animate-css's default       | `ease-out` (`motion.easing.out`)                                                                      |
| `NavigationMenu` content without a viewport, and its chevron                                                                                                                    | `slow` (300ms)                        | `ease-out` (`motion.easing.out`); the chevron `ease-default`                                          |
| `MessageScrollerButton`: enters, then leaves                                                                                                                                    | `normal` (200ms), then `slow` (300ms) | `ease-out`, then `ease-in` (the tokens)                                                               |
| `Sidebar`, on the desktop: the panel and its gap collapse                                                                                                                       | `normal` (200ms)                      | `linear`                                                                                              |
| Hover and focus transitions: `Button`, `Input`, `Tabs`, `Switch`, `Checkbox`, `Badge`, the `Sidebar` buttons and rail…                                                          | `fast` (100ms)                        | `ease-default` (the curve of `--default-transition-timing-function`); `linear` for the `Sidebar` rail |
| `Skeleton` (`animate-pulse`), `Spinner` (`animate-spin`), the `InputOTP` caret (`animate-caret-blink`)                                                                          | 2s, 1s, 1.25s, set by the keyframes   | `cubic-bezier(0.4, 0, 0.6, 1)`, `linear`, `ease-out`                                                  |
| `Carousel` (Embla), `Sonner` toasts, the `Attachment` shimmer                                                                                                                   | Each library's or keyframe's own      | Its own                                                                                               |

The default `Select` list (`item-aligned`) has no animation, by design: see "Reduced motion" below.

**A modal is not slow.** `Dialog` and `AlertDialog` enter and leave in 100ms, the `Sheet` in 200ms and the `Drawer` in 500ms, none of them in `slow` (300ms): do not re-time them, and do not size a screen's own overlay by the 300ms of an older version of this page.

---

## Examples

### Standard hover (color / opacity)

`Button`, `Toggle` and the menu items already carry their hover transition: these classes go on a surface the screen draws itself, on the page background. A `Card` would not show the hover: `bg-card` and `bg-muted` read the same token, `color.background.subtle`.

```tsx
import { Heading } from "@/components/ui/heading"

export default function Example() {
  return (
    <div className="border bg-background p-4 transition-colors duration-fast ease-default hover:bg-muted">
      <Heading level={3} as="h2">
        Recent activity
      </Heading>
    </div>
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

A screen does not animate a modal surface itself: `Dialog`, `AlertDialog`, `Sheet` and `Drawer` enter and leave on their own, with the timing the table above gives. Their backdrop fades with `OVERLAY_BASE` (`lib/overlay.ts`), `Dialog` and `AlertDialog` zoom in with `MODAL_CONTENT_BASE`, `Sheet` slides in from its side, and `Drawer` moves with vaul. Use the component as it is, and do not re-time it.

### A dropdown leaving

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

## For a transition a screen draws itself

A screen composes the components and draws no overlay of its own. For a surface it does draw (a card that reacts to the pointer, a panel it shows or hides), these combinations follow the table above:

| Case                          | Duration         | Easing         |
| ----------------------------- | ---------------- | -------------- |
| Hover / focus (color, border) | `fast` (100ms)   | `ease-default` |
| Fading a surface in or out    | `normal` (200ms) | `ease-default` |
| A surface entering            | `normal` (200ms) | `ease-out`     |
| A surface leaving             | `normal` (200ms) | `ease-in`      |
| A playful micro-animation     | `normal` (200ms) | `ease-spring`  |
| A chart animation             | `slower` (500ms) | `ease-out`     |

---

## Reduced motion

When the user asks the system for less motion (`prefers-reduced-motion: reduce`), an entrance or an exit fades instead of moving: nothing zooms, slides, spins or blurs in or out. One block in the `@layer base` of `styles/globals.css` does it for every component. A component adds no `motion-reduce:` class, and that block is the only `!important` the design system writes.

| Source                                                                                                                                                                                               | Default motion                                                   | Under `reduce`                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tw-animate-css (`animate-in`, `animate-out`): Dialog, AlertDialog, Sheet, Popover, HoverCard, Tooltip, DropdownMenu, ContextMenu, Menubar, Select with `position="popper"`, Combobox, NavigationMenu | A fade with a zoom (`zoom-in-95`) or a slide (`slide-in-from-*`) | The fade alone: the translation, scale, rotation and blur variables (`--tw-enter-*`, `--tw-exit-*`) return to `initial`, their neutral value. NavigationMenu's viewport, which zooms without a fade, appears at once |
| Accordion (`animate-accordion-down`, `animate-accordion-up`)                                                                                                                                         | The panel's height grows or shrinks                              | The panel opens and closes at once                                                                                                                                                                                   |
| Skeleton (`animate-pulse`)                                                                                                                                                                           | A pulse                                                          | Static                                                                                                                                                                                                               |
| Attachment title (`shimmer`)                                                                                                                                                                         | A shimmer while the file uploads or is processed                 | Static, in the text color                                                                                                                                                                                            |
| InputOTP caret (`animate-caret-blink`)                                                                                                                                                               | A blink                                                          | Static, always shown                                                                                                                                                                                                 |
| Drawer (vaul)                                                                                                                                                                                        | The panel slides in from its edge                                | The panel fades, with vaul's own `fadeIn` and `fadeOut`. A drawer with `snapPoints` still moves to its snap points                                                                                                   |
| Carousel (Embla)                                                                                                                                                                                     | A scroll to the next slide                                       | A jump to it: Embla's `duration` is `0` under the query. A drag still follows the pointer                                                                                                                            |
| MessageScroller button                                                                                                                                                                               | Slides and scales in and out                                     | Fades. The scroll it starts stays smooth; pass `behavior="auto"` to make it instant                                                                                                                                  |
| Sidebar, on the desktop                                                                                                                                                                              | Slides and resizes as it collapses                               | Collapses and expands at once. Below `md` it is a Sheet: the fade alone                                                                                                                                              |
| Sonner                                                                                                                                                                                               | Toasts slide in and swipe out                                    | Sonner's own rule: no animation and no transition on the toast                                                                                                                                                       |
| Spinner (`animate-spin`), Sonner's loading icon                                                                                                                                                      | Spins                                                            | Kept: it is the only sign that work is in progress                                                                                                                                                                   |
| Button (`active:translate-y-px`), the Switch thumb, the Progress bar, a chevron that turns                                                                                                           | A shift of a pixel, or a movement inside the control             | Kept: the movement stays inside the control and shows its state                                                                                                                                                      |

**One exception: the default Select.** Its `item-aligned` list opens and closes with no animation, as shadcn/ui draws it on purpose: the list is placed so that the selected option sits on the trigger's value, and a zoom around the list's center would move the option off it while the animation runs. `position="popper"` animates like the other overlays, and under `reduce` it fades.

A new entrance or exit uses the tw-animate-css classes, which this block already reduces. Any other movement (a loop, or a transition of position or size) adds its `data-slot` to the block in the same change, with a test in `tests/reduced-motion/`.

---

## Usage Rules

1. **A transition with no duration class is already right** — it runs at `motion.duration.fast` (100ms) with `motion.easing.default`. Add a `duration-*` class only to a transition a screen draws itself that has to be slower: `motion.duration.normal` (200ms) with `motion.easing.default` for a fade.
2. **Always use the CSS tokens** — never hard-code a duration or an easing in the code.
3. **`ease-in` for exits, `ease-out` for entrances** — a universal UX convention that matches natural physical motion.
4. **`ease-spring` sparingly** — only for expressive, deliberate interactions (positive feedback, gamification). Never on basic state transitions.
5. **Never work around the tokens** — no hard-coded values and no `!important` on transition properties.
6. **Do not re-time a component** — its overlays and panels enter and leave on their own timing; a `duration-*` class on `DialogContent` or `SheetContent` does not make them slower, it makes this page's table wrong for that screen.
