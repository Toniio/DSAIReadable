import { tokenClasses } from "@/site/foundation-docs/a/token-classes"
import { tokenByName, tokens } from "@/site/lib/tokens"

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
}

export interface TokensData {
  rows: TokenRow[]
  /** The two page surfaces, for the color swatches of each mode. */
  surfaces: { light: string; dark: string }
}

/** The table lists what components read first, the private tier last. */
const TIER_ORDER: TokenRow["tier"][] = ["semantic", "component", "primitive"]

/** Every token of tokens.manifest.json, compacted for the client table. */
export function tokensData(): TokensData {
  const page = tokenByName("color.background.default")
  const ordered = TIER_ORDER.flatMap((tier) =>
    tokens().filter((entry) => entry.tier === tier)
  )
  return {
    rows: ordered.map((entry) => {
      const classes = tokenClasses(entry)
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
      }
    }),
    surfaces: {
      light: page?.value.light ?? "",
      dark: page?.value.dark ?? page?.value.light ?? "",
    },
  }
}
