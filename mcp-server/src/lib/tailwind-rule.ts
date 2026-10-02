/**
 * The critical styling rule dsaireadable_get_design_rules serves with every answer.
 *
 * Written once by hand, it had drifted: it named theme.css as the bridge (it
 * is styles/globals.css), said the bridge read the shadcn aliases (`--primary`:
 * it reads the semantic tokens), and quoted hex values from before the
 * contrast fixes (`text-muted-foreground` as #67787c). The chain now stops at
 * the semantic token, whose values dsaireadable_get_tokens serves from the tokens
 * themselves, and a test holds each link to styles/globals.css.
 */
export const TAILWIND_RULE = {
  id: "tailwind-tokens",
  severity: "critical",
  title: "Always use standard Tailwind CSS classes mapped to DS tokens",
  description: [
    "ALWAYS use the Tailwind utility classes the design system maps to its tokens.",
    "styles/globals.css imports tokens.css and bridges each token into Tailwind with an @theme inline block: bg-primary reads --color-action-background-default, a semantic token.",
    "Tailwind's default colors, radii, shadows, spacing and type scale are removed: bg-red-500, p-13 or text-7xl generate no CSS, and ESLint refuses them.",
    "Use classes like: bg-background, text-foreground, text-primary, bg-muted, border-border, text-muted-foreground, bg-destructive, etc.",
    "For spacing and sizes, use Tailwind v3's spacing scale, each step read from a space.scale.* token: p-4, gap-1.5, m-2, h-9, w-72. Off-scale steps (p-13, gap-17) do not exist.",
    "For text, use text-xs … text-4xl, font-sans / font-mono / font-heading, font-normal … font-bold, leading-tight … leading-loose, tracking-tight … tracking-widest. Label, FieldLabel and Heading draw their own text style (12px regular, and the size of their level): give them no text-*, font-*, tracking-* or leading-* class.",
    "For state colors on text, use text-success and text-warning, text-destructive for errors.",
    "Every component is square and draws its own corners: add no rounded-* class to one, and keep a surface you draw yourself square too. rounded-full is for a round shape; rounded-xs … rounded-4xl (mapped to --radius-*) are for content, such as an image or a hero.",
    "For shadows, use: shadow-xs … shadow-2xl (mapped to --elevation-*).",
    "For a disabled state, use opacity-disabled under its variant: disabled:opacity-disabled.",
    "A class comes first. For a token or a runtime variable that has no class, use Tailwind's shorthand utility-(--variable): w-(--radix-popover-trigger-width), bg-(--color-chart-sequential-3); never a bracket, w-[var(--…)]. An inline style may read a token too, style={{ width: 'var(--sidebar-width)' }}, but never a raw value.",
  ],
  token_chain_explanation: {
    description:
      "A class resolves, through the @theme bridge, to a semantic token that references a primitive. Values in light and dark: dsaireadable_get_tokens.",
    example:
      "bg-primary → --color-primary (@theme) → --color-action-background-default (semantic) → {primitive.color.violet.600} (primitive, private)",
    mapping: {
      "bg-background": "--color-background → --color-background-default",
      "bg-primary": "--color-primary → --color-action-background-default",
      "text-foreground": "--color-foreground → --color-text-default",
      "text-primary-foreground":
        "--color-primary-foreground → --color-action-background-foreground",
      "text-muted-foreground": "--color-muted-foreground → --color-text-subtle",
      "bg-card": "--color-card → --color-background-subtle",
      "border-border": "--color-border → --color-border-default",
      "bg-destructive": "--color-destructive → --color-feedback-error-default",
    } as Record<string, string>,
  },
  do: [
    "bg-background text-foreground",
    "bg-primary text-primary-foreground",
    "bg-muted text-muted-foreground",
    "border-border",
    "bg-card text-card-foreground",
    "bg-destructive",
    "p-4 gap-1.5 m-2 space-y-4 h-9 max-w-sm (the locked spacing and container scales)",
    "text-success text-warning",
    "rounded-none rounded-full (a round shape): the components are square",
    "shadow-sm shadow-md",
    "text-xs text-sm text-base font-normal font-medium (FieldLabel, Button and Heading need none)",
    "disabled:opacity-disabled",
    "w-(--radix-popover-trigger-width) bg-(--color-chart-sequential-3) (a variable with no class: the shorthand)",
    "style={{ width: 'var(--sidebar-width)' }} (a token read in an inline style)",
  ],
  dont: [
    "bg-[#432dd7] — NEVER use arbitrary hex colors",
    "text-[var(--ds-prim-color-violet-600)] — NEVER reference primitive tokens directly",
    "w-[var(--sidebar-width)] — NEVER bracket a variable: write w-(--sidebar-width)",
    "style={{ padding: '12px' }} — NEVER use a raw value in an inline style",
    "bg-violet-600 — NEVER use Tailwind's default palette: it is removed, use DS semantic classes",
    "p-[1.5rem] — NEVER use arbitrary spacing values, use the spacing scale",
    "p-13 text-7xl font-serif — NEVER: off-scale classes generate no CSS",
    "rounded-[0.625rem] — NEVER use arbitrary radius values",
    "disabled:opacity-50 — NEVER: a disabled state uses opacity-disabled",
    "rounded (without a size) — NEVER: it generates no CSS. A component draws its own corners; use rounded-full for a round shape",
    "rounded-md on a Button, rounded-lg on a Card or rounded-xl on a Dialog — NEVER: the components are square, and a rounded surface among them is the mixed look the system does not have",
  ],
}
