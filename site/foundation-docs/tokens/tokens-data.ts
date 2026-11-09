import {
  primitiveName,
  reads,
  tokenClasses,
} from "@/site/foundation-docs/tokens/token-classes"
import {
  pageSurfaces,
  type BrandSurfaces,
} from "@/site/foundation-docs/tokens/color-data"
import { BRANDS, type Brand } from "@/site/lib/brand"
import {
  darkIn,
  differsInNova,
  lightIn,
  tokenByName,
  tokens,
  type Token,
} from "@/site/lib/tokens"

/** A token's value in light mode, and in dark mode when that changes it. */
interface ModeValues {
  light: string
  /** Absent when dark mode changes nothing. */
  dark?: string
}

/** One token of the "All tokens" table: only what the table shows. */
export interface TokenRow extends ModeValues {
  token: string
  tier: "primitive" | "semantic" | "component"
  cssVar: string
  type: string
  status: "active" | "reserved" | "deprecated"
  replacement?: string
  classes?: string[]
  /** Its values in nova, when nova changes them. */
  nova?: ModeValues
  /**
   * The tokens it reads, down to the primitive, in any theme: a search for
   * `mist.950` finds the semantic tokens and the aliases that resolve to it.
   */
  chain?: string[]
}

export interface TokensData {
  rows: TokenRow[]
  /** The two page surfaces of each brand, for the color swatches of each mode. */
  surfaces: BrandSurfaces
}

/** The table lists what components read first, the private tier last. */
const TIER_ORDER: TokenRow["tier"][] = ["semantic", "component", "primitive"]

/** The references a token follows to its value, in every theme, short names included. */
function chain(entry: Token): string[] {
  const found = new Set<string>()
  for (const brand of BRANDS) {
    for (const mode of ["light", "dark"] as const) {
      let current: Token | undefined = entry
      // A reference names a token of a lower tier: the walk ends at a literal.
      for (let depth = 0; current && depth < 3; depth++) {
        const next = reads(current, mode, brand)
        if (!next) break
        found.add(next)
        if (next.startsWith("primitive.")) found.add(primitiveName(next))
        current = tokenByName(next)
      }
    }
  }
  return [...found]
}

function modeValues(entry: Token, brand: Brand): ModeValues {
  const light = lightIn(entry.value, brand)
  const dark = darkIn(entry.value, brand)
  return dark === light ? { light } : { light, dark }
}

/** Every token of tokens.manifest.json, compacted for the client table. */
export function tokensData(): TokensData {
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
        ...modeValues(entry, "lyra"),
        ...(differsInNova(entry.value)
          ? { nova: modeValues(entry, "nova") }
          : {}),
        ...(reached.length ? { chain: reached } : {}),
      }
    }),
    surfaces: pageSurfaces(),
  }
}
