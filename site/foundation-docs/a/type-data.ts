import { plain, section, tables } from "@/site/lib/markdown"
import { readJson, readText } from "@/site/lib/repo"
import { tokenByName, tokens } from "@/site/lib/tokens"

const SPEC = "specs/foundations/typography.md"

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

export interface TypeData {
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

/** Everything the Typography page lists, from text-styles.json and the token build. */
export function typeData(): TypeData {
  const styles = readJson<TextStyles>("mcp-server/context/text-styles.json")
  return {
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
 * The complete modules of a foundation spec — a tsx block that imports what
 * it renders and exports it by default — keyed by their rank in the file,
 * as scripts/build-site-examples.ts numbers them.
 */
export function foundationExamples(name: string): FoundationExample[] {
  const lines = readText(`specs/foundations/${name}.md`)
    .replace(/\r\n/g, "\n")
    .split("\n")
  const out: FoundationExample[] = []
  let title = ""
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("### ")) title = plain(lines[i].slice(4))
    if (lines[i] !== "```tsx" && lines[i] !== "```ts") continue
    const end = lines.indexOf("```", i + 1)
    if (end < 0) break
    const code = lines.slice(i + 1, end).join("\n")
    if (/^import /m.test(code) && /^export default /m.test(code))
      out.push({ key: `${name}-${out.length + 1}`, title, code })
    i = end
  }
  return out
}
