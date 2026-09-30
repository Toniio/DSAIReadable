/**
 * GENERATED — DO NOT EDIT. Written by scripts/build-plugin-deprecations.ts
 * from the tokens' `$deprecated` and the components' JSDoc `@deprecated`;
 * `npm run generate-context` regenerates it.
 *
 * What the design system has deprecated, and why. `no-deprecated-imports`
 * reads the first list: an import source (`@/components/ui/foo`) or one of its
 * named exports (`@/components/ui/foo#Bar`). `no-deprecated-token` reads the
 * second: a CSS variable (`--opacity-placeholder`) or a Tailwind class.
 */
export const DEPRECATED_IMPORTS: Record<string, string> = {}

export const DEPRECATED_TOKENS: Record<string, string> = {
  "--opacity-placeholder":
    "Form fields color their placeholder instead of fading it: use `placeholder:text-muted-foreground` (color.text.subtle). Faded default text drops to 3.70:1 on white.",
  "--opacity-overlay":
    "Modal backdrops use shadcn/ui v4's scrim, `bg-black/10` with `backdrop-blur-xs` (OVERLAY_BASE in lib/overlay.ts); no opacity token drives it. At 0.8 the backdrop hid the page.",
}
