# @dsaireadable/eslint-plugin

ESLint rules that keep a project's code on the
[DSAIReadable](https://github.com/Toniio/DSAIReadable) design system: the design
system's components instead of native elements, its icons, its tokens, and
Tailwind classes that exist. Flat config, ESLint 9 or 10.

```js
// eslint.config.mjs
import dsaireadable from "@dsaireadable/eslint-plugin"

export default [...dsaireadable.configs.recommended]
```

## Configs

- `configs.core` — the seven rules below. They read the code alone: no stylesheet,
  no Tailwind. The `dsaireadable_validate_code` tool of the MCP server runs
  exactly this.
- `configs.tailwind` — `eslint-plugin-better-tailwindcss` set up for the design
  system: a class its stylesheet does not generate (`bg-red-500`, `p-13`) is an
  error, a disabled state reads `opacity-disabled`, a state drawn with an
  opacity (`hover:bg-primary/80`, `data-open:bg-muted/50`) is an error that
  names the state token to use, and `--fix` writes a CSS
  variable in Tailwind's shorthand (`w-[var(--x)]` becomes `w-(--x)`). The
  stylesheet is
  `styles/globals.css`; point `settings["better-tailwindcss"].entryPoint` at
  yours if it is elsewhere.
- `configs.recommended` — both.

None of them lints `components/ui/`: what the registry installs there is the
design system's own code, which renders native elements and wraps the
primitives on purpose. If your own components live in that folder, narrow the
exclusion with `createConfig`:

```js
export default [
  ...dsaireadable.createConfig({
    // Only what the registry installed; src/components/ui/mine/ is linted.
    ignores: ["src/components/ui/button.tsx", "src/components/ui/card.tsx"],
  }),
]
```

`createConfig({ ignores, tailwind })` builds the same configs: `ignores` lists the
globs left alone (`[]` lints everything), `tailwind: false` leaves out the
Tailwind half.

## Rules

### `no-native-interactive-elements`

Flags `<button>`, `<input>`, `<select>`, `<textarea>`, `<label>`, `<table>`,
`<dialog>` and `<a>`, and names the component to use. An `<a>` inside an element
with `asChild` is how a `Button` renders a link, and is allowed.

### `no-external-ui-imports`

Flags another icon kit (Lucide, Heroicons, React Icons…), a UI library or
primitive imported directly (Radix, Base UI, Headless UI, MUI…), and a UI
component imported from anywhere but `@/components/ui/`. Option
`allowedOrigins` (default `["@/components/ui/"]`) sets the accepted origins.

### `no-inline-svg`

Flags an inline `<svg>`: icons come from `@phosphor-icons/react`.

### `no-class-interpolation`

Flags a Tailwind class built by interpolation (`` `text-${tone}` ``) in a
`className` attribute or a `cn()`, `cva()`, `clsx()`, `twMerge()` or `tv()` call.
Tailwind reads the source as text and never generates it. Interpolating a whole
class (`` `px-2 ${FOCUS_RING}` ``) is fine.

### `no-raw-values`

In class strings: raw hex and color functions, arbitrary values (`p-[13px]`),
the default palette (`bg-violet-600`). In `style` props: raw colors and `px`,
`rem` and `ms` values. Anywhere: primitive tokens (`--ds-prim-*`) and
`prefers-color-scheme`.

To read a token or a runtime variable that has no class (`--radix-popover-trigger-width`,
`--color-chart-sequential-3`), write Tailwind's shorthand, `w-(--radix-popover-trigger-width)`
or `bg-(--color-chart-sequential-3)`, never `w-[var(--…)]`: the rule names the
shorthand, with the variants kept (`hover:w-[var(--x)]` → `hover:w-(--x)`). A
class of the design system comes first (`p-4`, `w-sidebar`). A `style` prop may
also read a token: `style={{ width: "var(--sidebar-width)" }}`.

### `no-deprecated-imports`

Flags a component export the design system has deprecated with a JSDoc
`@deprecated` tag. Option `modules` maps an import source
(`@/components/ui/foo`), or one of its named exports
(`@/components/ui/foo#Bar`), to what to use instead. `configs.core` passes the
design system's own list, generated from those tags (empty until the first
deprecation), so it is always the one the release was cut with.

### `no-deprecated-token`

Flags a design token the design system has deprecated (`$deprecated` in
`tokens/semantic.json`). Option `tokens` maps a CSS variable
(`--opacity-placeholder`, found in `var(--opacity-placeholder)` or Tailwind's
`bg-(--opacity-placeholder)`) or a Tailwind class (found through its variants,
`!` and opacity modifier) to why and what replaces it. `configs.core` passes the
design system's own list.

## License

MIT
