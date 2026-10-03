import {
  foundationExampleCode,
  foundationExampleKeys,
} from "@/site/lib/foundation-examples"
import { plain, section, tables } from "@/site/lib/markdown"
import { readJson, readText } from "@/site/lib/repo"
import { tokenByName, tokens } from "@/site/lib/tokens"

const SPEC = "specs/foundations/typography.md"

/** The spec section that writes the canonical text styles. */
export const COMBINATIONS = "Type Scale — suggested combinations"

interface StyleRow {
  token: string
  css_variable: string
  tailwind_class: string
  usage: string
}

interface TextStyles {
  font_families: (StyleRow & { family: string })[]
  type_scale: (StyleRow & { rem: string; px: string })[]
  line_heights: (StyleRow & { value: string })[]
  font_weights: (StyleRow & { value: string })[]
  letter_spacings: (StyleRow & { value: string })[]
  usage_rules: string[]
}

/** One row of a type table: a token, its class, its value, what it is for. */
export interface TypeRow {
  /** The last segment of the token: `xs`, `semibold`. */
  name: string
  token: string
  cssVar: string
  className: string
  value: string
  /** The px of a size. */
  detail?: string
  /** The font stack of a family, as the token resolves it. */
  stack?: string
  /** The line height a size sets with it. */
  lineHeight?: string
  usage: string
}

export interface HeadingRow {
  level: 1 | 2 | 3 | 4
  tag: string
  use: string
}

/**
 * A canonical text style of the spec: a size, a line height, a weight and a
 * spacing applied together, as `### Body — body text` and its facts write it.
 */
export interface TextStyle {
  /** `Body`, `Field label`. */
  name: string
  /** What it is for, after the dash: `body text`, `` `FieldLabel` draws it ``. */
  use: string
  /** The classes of the spec's sample, when a screen writes them itself. */
  classes?: string
  /** The component that draws it, when one does: a screen writes no class. */
  component?: string
  size?: string
  lineHeight?: string
  weight?: string
  tracking?: string
  family?: string
}

export interface TypeData {
  styles: TextStyle[]
  families: TypeRow[]
  scale: TypeRow[]
  weights: TypeRow[]
  leading: TypeRow[]
  tracking: TypeRow[]
  headings: HeadingRow[]
  /** How many semantic typography tokens there are. */
  tokenCount: number
}

function last(token: string): string {
  return token.split(".").at(-1) ?? token
}

function row(entry: StyleRow, value: string): TypeRow {
  return {
    name: last(entry.token),
    token: entry.token,
    cssVar: entry.css_variable,
    className: entry.tailwind_class,
    value,
    usage: entry.usage,
  }
}

/** A ratio as the spec writes it: `1.33334` → `1.33`. */
function ratio(value: string | undefined): string | undefined {
  if (value === undefined) return undefined
  const number = Number(value)
  return Number.isFinite(number)
    ? String(Math.round(number * 100) / 100)
    : value
}

/** The Headings table of the spec: each level, its tag and its use. */
function headingRows(): HeadingRow[] {
  const combinations = section(
    readText(SPEC),
    "Type Scale — suggested combinations"
  )
  const table = tables(combinations).find((candidate) =>
    candidate.header.some((cell) => plain(cell) === "level")
  )
  if (!table) return []
  const levelAt = table.header.findIndex((cell) => plain(cell) === "level")
  const tagAt = table.header.findIndex((cell) => plain(cell) === "Tag")
  const useAt = table.header.findIndex((cell) => plain(cell) === "Use")
  return table.rows
    .map((cells) => ({
      level: Number(plain(cells[levelAt] ?? "")) as HeadingRow["level"],
      tag: plain(cells[tagAt] ?? ""),
      use: plain(cells[useAt] ?? ""),
    }))
    .filter((heading) => [1, 2, 3, 4].includes(heading.level))
}

/**
 * The `key: value` facts of a style, read from the backticked spans of the
 * line that starts with `` `size: ``: `size: base (16px)`, `weight: medium (500)`.
 */
function facts(line: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [, key, value] of line.matchAll(/`(\w+): ([^`]+)`/g))
    out[key] = value.trim()
  return out
}

/**
 * The canonical text styles of the spec's combinations section: each `### `
 * entry with a facts line. The headings, a table of their own, are listed in
 * the Headings section.
 */
function textStyles(): TextStyle[] {
  const body = section(readText(SPEC), COMBINATIONS)
  return body
    .split(/^(?=### )/m)
    .filter((part) => part.startsWith("### "))
    .flatMap((part): TextStyle[] => {
      const [heading = "", ...lines] = part.split("\n")
      const [name = "", use = ""] = heading.slice(4).split(" — ")
      const factLine = lines.find((line) => line.startsWith("`size: "))
      if (!factLine) return []
      const fact = facts(factLine)
      // A sample that is a whole module renders a component: the classes are
      // the component's, not the screen's.
      const sample = /```tsx\n([\s\S]*?)\n```/.exec(part)?.[1] ?? ""
      const classes = /^import /m.test(sample)
        ? undefined
        : /className="([^"]+)"/.exec(sample)?.[1]
      const component = /^`(\w+)` draws/.exec(use)?.[1]
      return [
        {
          name: plain(name),
          use: use.trim(),
          ...(classes ? { classes } : {}),
          ...(component ? { component } : {}),
          size: fact.size,
          lineHeight: fact.lineHeight,
          weight: fact.weight,
          tracking: fact.tracking,
          family: fact.family,
        },
      ]
    })
}

/** Everything the Typography page lists, from text-styles.json and the token build. */
export function typeData(): TypeData {
  const styles = readJson<TextStyles>("mcp-server/context/text-styles.json")
  return {
    styles: textStyles(),
    families: styles.font_families.map((entry) => ({
      ...row(entry, entry.family),
      stack: tokenByName(entry.token)?.value.light,
    })),
    scale: styles.type_scale.map((entry) => ({
      ...row(entry, entry.rem),
      detail: entry.px,
      lineHeight: ratio(
        tokenByName(`typography.size-line-height.${last(entry.token)}`)?.value
          .light
      ),
    })),
    weights: styles.font_weights.map((entry) => row(entry, entry.value)),
    leading: styles.line_heights.map((entry) => row(entry, entry.value)),
    tracking: styles.letter_spacings.map((entry) => row(entry, entry.value)),
    headings: headingRows(),
    tokenCount: tokens().filter(
      (entry) =>
        entry.tier === "semantic" && entry.token.startsWith("typography.")
    ).length,
  }
}

export interface FoundationExample {
  /** The loader key of site/generated/examples: `typography-1`. */
  key: string
  /** The `### ` heading the example sits under in the spec. */
  title: string
  code: string
}

/**
 * The live examples of a foundation spec, in the order
 * scripts/build-site-examples.ts numbers them: the keys and the code are the
 * generator's own output, and the title is the `### ` heading the code sits
 * under in the spec.
 */
export function foundationExamples(name: string): FoundationExample[] {
  const spec = readText(`specs/foundations/${name}.md`).replace(/\r\n/g, "\n")
  const rank = (key: string) => Number(key.slice(name.length + 1))
  return foundationExampleKeys()
    .filter((key) => key.startsWith(`${name}-`) && rank(key) > 0)
    .sort((a, b) => rank(a) - rank(b))
    .map((key) => {
      const code = foundationExampleCode(key).trim()
      const at = spec.indexOf(code)
      const before = at < 0 ? "" : spec.slice(0, at)
      const heading = [...before.matchAll(/^### (.+)$/gm)].at(-1)?.[1] ?? ""
      return { key, title: plain(heading), code }
    })
}
