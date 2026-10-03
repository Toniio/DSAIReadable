import {
  primitiveName,
  reads,
  tokenClasses,
} from "@/site/foundation-docs/a/token-classes"
import { tokenByName, tokens, type Token } from "@/site/lib/tokens"

/** One token of the "All tokens" table: only what the table shows. */
export interface TokenRow {
  token: string
  tier: "primitive" | "semantic" | "component"
  cssVar: string
  type: string
  status: "active" | "reserved" | "deprecated"
  replacement?: string
  classes?: string[]
  light: string
  /** Absent when dark mode changes nothing. */
  dark?: string
  /**
   * The tokens it reads, down to the primitive, in either mode: a search for
   * `mist.950` finds the semantic tokens and the aliases that resolve to it.
   */
  chain?: string[]
}

export interface TokensData {
  rows: TokenRow[]
  /** The two page surfaces, for the color swatches of each mode. */
  surfaces: { light: string; dark: string }
}

/** The table lists what components read first, the private tier last. */
const TIER_ORDER: TokenRow["tier"][] = ["semantic", "component", "primitive"]

/** The references a token follows to its value, in both modes, short names included. */
function chain(entry: Token): string[] {
  const found = new Set<string>()
  for (const mode of ["light", "dark"] as const) {
    let current: Token | undefined = entry
    // A reference names a token of a lower tier: the walk ends at a literal.
    for (let depth = 0; current && depth < 3; depth++) {
      const next = reads(current, mode)
      if (!next) break
      found.add(next)
      if (next.startsWith("primitive.")) found.add(primitiveName(next))
      current = tokenByName(next)
    }
  }
  return [...found]
}

/** Every token of tokens.manifest.json, compacted for the client table. */
export function tokensData(): TokensData {
  const page = tokenByName("color.background.default")
  const ordered = TIER_ORDER.flatMap((tier) =>
    tokens().filter((entry) => entry.tier === tier)
  )
  return {
    rows: ordered.map((entry) => {
      const classes = tokenClasses(entry)
      const reached = chain(entry)
      return {
        token: entry.token,
        tier: entry.tier,
        cssVar: entry.cssVar,
        type: entry.type,
        status: entry.status,
        ...(entry.replacement ? { replacement: entry.replacement } : {}),
        ...(classes.length ? { classes } : {}),
        light: entry.value.light,
        ...(entry.value.dark !== undefined &&
        entry.value.dark !== entry.value.light
          ? { dark: entry.value.dark }
          : {}),
        ...(reached.length ? { chain: reached } : {}),
      }
    }),
    surfaces: {
      light: page?.value.light ?? "",
      dark: page?.value.dark ?? page?.value.light ?? "",
    },
  }
}
