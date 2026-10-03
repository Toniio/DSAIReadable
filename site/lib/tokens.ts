import { readJson, readText } from "@/site/lib/repo"

/** One token of `tokens.manifest.json` (scripts/build-token-docs.ts). */
export interface Token {
  /** `color.background.default`, `primitive.color.mist.0`, `shadcn.primary`. */
  token: string
  tier: "primitive" | "semantic" | "component"
  cssVar: string
  type: string
  status: "active" | "reserved" | "deprecated"
  replacement?: string
  source: string
  /** The value as written: a `{reference}` or, for a primitive, a literal. */
  reference: { light: string; dark?: string }
  /** The resolved literal; `dark` only where the dark mode changes it. */
  value: { light: string; dark?: string }
  description?: string
  docs?: { description?: string; do?: string; dont?: string; tailwind?: string }
  private?: true
}

/** Every token of the three tiers, as the build resolves them. */
export function tokens(): Token[] {
  return readJson<{ tokens: Token[] }>("tokens.manifest.json").tokens
}

export function tokenByName(name: string): Token | undefined {
  return tokens().find((entry) => entry.token === name)
}

/** The tokens whose name starts with a group: `color.background`. */
export function tokenGroup(
  prefix: string,
  tier: Token["tier"] = "semantic"
): Token[] {
  return tokens().filter(
    (entry) =>
      entry.tier === tier &&
      (entry.token === prefix || entry.token.startsWith(`${prefix}.`))
  )
}

/** The value in dark mode: the light one when dark changes nothing. */
export function darkValue(entry: Token): string {
  return entry.value.dark ?? entry.value.light
}

/** The token a `{reference}` names, without its braces. */
export function referenced(reference: string): string | undefined {
  return /^\{(.+)\}$/.exec(reference)?.[1]
}

/**
 * The tokens that reference a token directly, in either mode: the semantic
 * tokens a primitive feeds, the aliases a semantic token feeds.
 */
export function referencedBy(name: string): Token[] {
  return tokens().filter(
    (entry) =>
      referenced(entry.reference.light) === name ||
      (entry.reference.dark !== undefined &&
        referenced(entry.reference.dark) === name)
  )
}

/** Utility prefixes a bridged theme variable turns into, by namespace. */
const NAMESPACES: [RegExp, (name: string) => string[]][] = [
  [/^--text-color-(.+)$/, (name) => [`text-${name}`]],
  [
    /^--color-(.+)$/,
    (name) => [`bg-${name}`, `text-${name}`, `border-${name}`],
  ],
  [/^--text-([a-z0-9]+)$/, (name) => [`text-${name}`]],
  [/^--radius-(.+)$/, (name) => [`rounded-${name}`]],
  [/^--shadow-(.+)$/, (name) => [`shadow-${name}`]],
  [/^--font-weight-(.+)$/, (name) => [`font-${name}`]],
  [/^--font-(.+)$/, (name) => [`font-${name}`]],
  [/^--leading-(.+)$/, (name) => [`leading-${name}`]],
  [/^--tracking-(.+)$/, (name) => [`tracking-${name}`]],
  [/^--transition-duration-(.+)$/, (name) => [`duration-${name}`]],
  [/^--ease-(.+)$/, (name) => [`ease-${name}`]],
  [/^--opacity-(.+)$/, (name) => [`opacity-${name}`]],
  [/^--spacing-(.+)$/, (name) => [`p-${name}`, `gap-${name}`, `size-${name}`]],
  [/^--border-width-(.+)$/, (name) => [`border-${name}`]],
  [/^--default-border-width$/, () => ["border"]],
]

let bridge: Map<string, string[]> | undefined

/**
 * The Tailwind classes that read a token, from the `@theme inline` bridge of
 * styles/globals.css: `--color-background-default` → `bg-background`…
 */
export function tailwindClasses(cssVar: string): string[] {
  if (!bridge) {
    bridge = new Map()
    const css = readText("styles/globals.css")
    const textColors = new Set(
      [...css.matchAll(/^\s*--text-color-([\w-]+):/gm)].map((match) => match[1])
    )
    for (const [, key, target] of css.matchAll(
      /^\s*(--[\w\\.-]+):\s*var\((--[\w-]+)\);/gm
    )) {
      for (const [pattern, toClasses] of NAMESPACES) {
        const match = pattern.exec(key)
        if (!match) continue
        const name = (match[1] ?? "").replace(/\\\./g, ".")
        const classes = toClasses(name).filter(
          // text-X reads --text-color-X when one exists, not --color-X.
          (value) =>
            !(
              key.startsWith("--color-") &&
              value === `text-${name}` &&
              textColors.has(name)
            )
        )
        bridge.set(target, [...(bridge.get(target) ?? []), ...classes])
        break
      }
    }
    for (const [, utility, target] of css.matchAll(
      /@utility\s+([\w-]+)\s*\{\s*[\w-]+:\s*var\((--[\w-]+)\)/g
    )) {
      bridge.set(target, [...(bridge.get(target) ?? []), utility])
    }
  }
  return bridge.get(cssVar) ?? []
}
