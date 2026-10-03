import {
  aliasClasses,
  colorClasses,
  primitiveName,
  reads,
} from "@/site/foundation-docs/a/token-classes"
import {
  darkValue,
  referencedBy,
  tailwindClasses,
  tokenByName,
  tokens,
  type Token,
} from "@/site/lib/tokens"

type Status = Token["status"]

/** The two page surfaces: a swatch sits on the background of its own mode. */
export interface Surfaces {
  light: string
  dark: string
}

export interface SemanticColor {
  token: string
  cssVar: string
  status: Status
  replacement?: string
  light: string
  dark: string
  /** The primitive each mode reads: `mist.0`. */
  lightRef?: string
  darkRef?: string
  classes: string[]
  description?: string
  /** Every name, class and value, lowercased, for the filter. */
  search: string
}

interface ColorGroup {
  id: string
  label: string
  colors: SemanticColor[]
}

export interface ColorAlias {
  cssVar: string
  /** The semantic token the alias reads. */
  reads: string
  classes: string[]
  light: string
  dark: string
  status: Status
  search: string
}

export interface PrimitiveStep {
  /** `mist.0` */
  name: string
  /** `0`, or the palette name for a palette of one. */
  step: string
  value: string
  status: Status
  /** Why a step no token reads is kept: a reserved step's reason. */
  description?: string
  /** The semantic tokens that read it, in either mode. */
  usedBy: string[]
  search: string
}

interface Palette {
  id: string
  label: string
  steps: PrimitiveStep[]
}

export interface ColorData {
  surfaces: Surfaces
  groups: ColorGroup[]
  aliases: ColorAlias[]
  palettes: Palette[]
}

/** The semantic color groups, in the order the spec lists them. */
const GROUPS: [string, string][] = [
  ["background", "Background"],
  ["text", "Text"],
  ["border", "Border"],
  ["icon", "Icon"],
  ["action", "Action"],
  ["feedback", "Feedback"],
  ["chart", "Chart"],
  ["sidebar", "Sidebar"],
  ["static", "Static"],
]

function label(id: string): string {
  const text = id.replace(/-/g, " ")
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function search(parts: (string | undefined)[]): string {
  return parts
    .filter((part): part is string => Boolean(part))
    .join(" ")
    .toLowerCase()
}

function semanticColor(entry: Token): SemanticColor {
  const lightRef = reads(entry, "light")
  const darkRef = reads(entry, "dark")
  const classes = colorClasses(entry)
  return {
    token: entry.token,
    cssVar: entry.cssVar,
    status: entry.status,
    replacement: entry.replacement,
    light: entry.value.light,
    dark: darkValue(entry),
    lightRef: lightRef ? primitiveName(lightRef) : undefined,
    darkRef: darkRef ? primitiveName(darkRef) : undefined,
    classes,
    description: entry.description,
    search: search([
      entry.token,
      entry.cssVar,
      ...classes,
      ...tailwindClasses(entry.cssVar),
      entry.value.light,
      entry.value.dark,
      lightRef,
      darkRef,
    ]),
  }
}

/** Everything the Color page shows, read from the token build. */
export function colorData(): ColorData {
  const all = tokens()
  const page = tokenByName("color.background.default")
  const semantic = all.filter(
    (entry) => entry.tier === "semantic" && entry.type === "color"
  )
  const known = new Set(GROUPS.map(([id]) => id))
  const extra = [
    ...new Set(semantic.map((entry) => entry.token.split(".")[1])),
  ].filter((id) => !known.has(id))

  const groups = [
    ...GROUPS,
    ...extra.map((id): [string, string] => [id, label(id)]),
  ]
    .map(([id, name]) => ({
      id,
      label: name,
      colors: semantic
        .filter((entry) => entry.token.split(".")[1] === id)
        .map(semanticColor),
    }))
    .filter((group) => group.colors.length > 0)

  const aliases = all
    .filter((entry) => entry.tier === "component" && entry.type === "color")
    .map((entry): ColorAlias => {
      const target = reads(entry, "light") ?? ""
      const classes = aliasClasses(entry)
      // The primitive steps the semantic token resolves to, so a search
      // for `mist.950` finds `--foreground` as it finds its semantic token.
      const semantic = tokenByName(target)
      const steps = semantic
        ? [reads(semantic, "light"), reads(semantic, "dark")]
        : []
      return {
        cssVar: entry.cssVar,
        reads: target,
        classes,
        light: entry.value.light,
        dark: darkValue(entry),
        status: entry.status,
        search: search([
          entry.token,
          entry.cssVar,
          target,
          ...steps,
          ...classes,
          entry.value.light,
          entry.value.dark,
        ]),
      }
    })

  const palettes: Palette[] = []
  for (const entry of all) {
    if (entry.tier !== "primitive" || entry.type !== "color") continue
    const name = primitiveName(entry.token)
    const [paletteId, ...rest] = name.split(".")
    let palette = palettes.find((item) => item.id === paletteId)
    if (!palette) {
      palette = { id: paletteId, label: label(paletteId), steps: [] }
      palettes.push(palette)
    }
    const usedBy = referencedBy(entry.token).map((user) => user.token)
    palette.steps.push({
      name,
      step: rest.join(".") || paletteId,
      value: entry.value.light,
      status: entry.status,
      // Only a step no token reads needs its reason on the page.
      description: usedBy.length ? undefined : entry.description,
      usedBy,
      search: search([name, entry.value.light, ...usedBy]),
    })
  }

  return {
    surfaces: {
      light: page?.value.light ?? "",
      dark: page ? darkValue(page) : "",
    },
    groups,
    aliases,
    palettes,
  }
}
