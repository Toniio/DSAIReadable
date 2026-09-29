/**
 * The critical styling rule get_design_rules serves with every answer.
 *
 * Written once by hand, it had drifted: it named theme.css as the bridge (it
 * is styles/globals.css), said the bridge read the shadcn aliases (`--primary`:
 * it reads the semantic tokens), and quoted hex values from before the
 * contrast fixes (`text-muted-foreground` as #67787c). The chain now stops at
 * the semantic token, whose values get_tokens serves from the tokens
 * themselves, and a test holds each link to styles/globals.css.
 */
export const TAILWIND_RULE = {
  id: "tailwind-tokens",
  severity: "critical",
  title: "Always use standard Tailwind CSS classes mapped to DS tokens",
  description: [
    "ALWAYS use the Tailwind utility classes the design system maps to its tokens.",
    "styles/globals.css imports tokens.css and bridges each token into Tailwind with an @theme inline block: bg-primary reads --color-action-background-default, a semantic token.",
    "Tailwind's default colours, radii and shadows are removed: bg-red-500 generates no CSS, and ESLint refuses it.",
    "Use classes like: bg-background, text-foreground, text-primary, bg-muted, border-border, text-muted-foreground, bg-destructive, etc.",
    "For spacing, use standard Tailwind spacing: p-4, gap-6, m-2, space-y-4, etc.",
    "For radius, use: rounded-xs … rounded-4xl (mapped to --radius-*).",
    "For shadows, use: shadow-xs … shadow-2xl (mapped to --elevation-*).",
    "For a disabled state, use opacity-disabled under its variant: disabled:opacity-disabled.",
  ],
  token_chain_explanation: {
    description:
      "A class resolves, through the @theme bridge, to a semantic token that references a primitive. Values in light and dark: get_tokens.",
    example:
      "bg-primary → --color-primary (@theme) → --color-action-background-default (semantic) → {color.violet.600} (primitive, private)",
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
    "p-4 gap-6 m-2 space-y-4 (standard Tailwind spacing)",
    "rounded-lg rounded-md (ALWAYS specify a size)",
    "shadow-sm shadow-md",
    "text-sm text-base text-lg font-medium font-semibold",
    "disabled:opacity-disabled",
  ],
  dont: [
    "bg-[#432dd7] — NEVER use arbitrary hex colors",
    "text-[var(--ds-prim-color-violet-600)] — NEVER reference primitive tokens directly",
    "style={{ color: 'var(--color-text-default)' }} — NEVER use inline styles with CSS variables",
    "bg-violet-600 — NEVER use Tailwind's default palette: it is removed, use DS semantic classes",
    "p-[1.5rem] — NEVER use arbitrary spacing values, use standard Tailwind scale",
    "rounded-[0.625rem] — NEVER use arbitrary radius values",
    "disabled:opacity-50 — NEVER: a disabled state uses opacity-disabled",
    "rounded (without size) — ALWAYS specify size: rounded-md, rounded-lg, etc.",
  ],
}
