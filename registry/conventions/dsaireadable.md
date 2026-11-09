---
description: DSAIReadable design system rules — apply them to any UI that uses its components
alwaysApply: true
applyTo: "**"
---

# DSAIReadable design system

This project uses the components of the `Toniio/DSAIReadable` shadcn registry.
These rules apply to any interface written with them.

## Components

- **Install** a component with its full address and the release of this file:
  `npx shadcn add Toniio/DSAIReadable/<item>#v0.4.0`. A bare name (`npx shadcn add button`)
  installs shadcn/ui's component, not the design system's, and overwrites it.
  The release is the one these rules and the spec links below were written
  for: move all three to the same tag when you update.
- **Find** a component with the shadcn MCP server, registry
  `Toniio/DSAIReadable`, or with `npx shadcn search Toniio/DSAIReadable -q <word>`.
- **Read the spec before using it**:
  `https://github.com/Toniio/DSAIReadable/blob/v0.4.0/specs/components/<Component>.md`
  (props, variants, states, accessibility). Invent no prop: what is not in the
  spec does not exist.
- **Do not edit** the installed files to change how they look: go through their
  props (`variant`, `size`) and, as a last resort, through `className` with
  token classes. An update (`npx shadcn add … --overwrite`) overwrites local
  changes.

## Tokens

- **No raw values** in UI code: no hex, `rgb()`, `oklch()`, `px`, `rem`, `ms`,
  and no Tailwind arbitrary values (`p-[13px]`, `bg-[#fff]`).
- **No Tailwind palette colors** (`bg-red-500`, `text-slate-600`): only the
  design system's semantic colors — `background`, `foreground`, `card`,
  `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive` and their
  `-foreground`, `border`, `input`, `ring`, `chart-1` to `chart-5`, `sidebar-*`.
- **Radii**: next to components, the role of what the element sits beside:
  `rounded-surface`, `rounded-control`, `rounded-item`, `rounded-inset`,
  `rounded-mark`, `rounded-pill`, so that it matches them in either brand.
  `rounded-sm` to `rounded-4xl` for content (an image, a hero), `rounded-full`
  for a round shape, `rounded-none` for an edge that meets another element.
- **Text sizes**: next to components, the role of what the text sits beside:
  `text-ui`, `text-description`, `text-title`. `text-xs` to `text-4xl` are fixed
  sizes, for text that must not follow the brand, such as the hero or display
  text a screen draws. A heading is a `Heading`, with its `level`, and no
  `text-*` class.
- **`cn`**: components import `cn` from `@/lib/cn`. A screen that puts a text
  role in a `cn` call imports `cn` from `@/lib/cn` too: the stock `cn` of
  `@/lib/utils` drops the role class.
- **Typefaces**: text inherits the interface's; `font-mono` is for code only.
- **Shadows, durations**: `shadow-xs` to `shadow-2xl`, `duration-fast` /
  `normal` / `slow`, `ease-default`.
- **Never a `--ds-prim-*` variable**: these are the system's raw values, and
  private. They change without notice.

## Icons, theme, accessibility

- **Icons: `@phosphor-icons/react` only.** No Lucide, no Heroicons, no inline
  SVG.
- **Dark mode: the `.dark` class on `<html>`.** Do not use
  `prefers-color-scheme`.
- **Brand: lyra by default, nova with the `nova` class on `<html>`**, next to
  `dark` (the `theme-nova` item). Write no class for a single brand.
- **A button with no visible text gets an `aria-label`.**
- **Never remove the focus ring** (`outline-none` alone, `focus:ring-0`): every
  component draws the same one, from `lib/focus`.
- **The default labels** (close button, carousel arrows…) are in English, in
  `lib/ui-strings`. Translate them through the prop each component provides,
  not by editing the component.
