/**
 * Lints the documentation site with the config a consuming project runs:
 * `@dsaireadable/eslint-plugin`'s `recommended` (`designSystemLinter`,
 * evals/lib/static.ts), with inline `eslint-disable` comments ignored.
 *
 * The site is built with the design system the way a product is, and it is
 * the first screen a person or an agent reads to learn it: a native
 * `<button>`, an off-system class or an inline SVG in it would teach the
 * opposite of the rules. The repository's own ESLint config (npm run lint)
 * covers the site too; this adds the consumer rules it does not run, such as
 * `no-native-interactive-elements`, and covers the specs' examples copied
 * into site/generated/, which npm run lint leaves to this script. The .ts
 * modules (class constants, the playground's stories) are linted with the
 * same rules as the .tsx pages.
 *
 * It then checks the focus indicators the site composes itself (focus.md,
 * rule 6): see `focusWithoutSolidPart`.
 *
 *   npx tsx scripts/lint-site.ts
 */

import { readFileSync } from "node:fs"
import { dirname, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import tsParser from "@typescript-eslint/parser"
import { ESLint, type Linter } from "eslint"
import ts from "typescript"

import { designSystemLinter } from "../evals/lib/static"
import plugin from "../packages/eslint-plugin/src/index"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

/** What next writes into site/: its build, its types, the static export. */
const BUILD_OUTPUT = ["site/.next/**", "site/out/**", "**/*.d.ts"]

const problems: string[] = []

function report(file: string, line: number, column: number, message: string) {
  problems.push(`${relative(ROOT, file)}:${line}:${column}  ${message}`)
}

// designSystemLinter parses .tsx files only, what a screen is: the site's
// .ts modules get the same recommended config, with the TypeScript parser.
const pages = designSystemLinter(ROOT, { allowInlineConfig: false })
const modules = new ESLint({
  cwd: ROOT,
  allowInlineConfig: false,
  overrideConfigFile: true,
  overrideConfig: [
    { ignores: BUILD_OUTPUT },
    {
      files: ["**/*.ts"],
      languageOptions: { parser: tsParser as Linter.Parser },
    },
    ...(plugin.configs.recommended as unknown as Linter.Config[]),
  ],
})
const results = [
  ...(await pages.lintFiles(["site/**/*.tsx"])),
  ...(await modules.lintFiles(["site/**/*.ts"])),
]

for (const result of results)
  for (const message of result.messages)
    report(
      result.filePath,
      message.line,
      message.column,
      `${message.ruleId ?? "parse"}  ${message.message}`
    )

/**
 * A class that gives a focus indicator its solid part: a border width (the
 * ring colors the border), or a solid outline. Its variants are dropped:
 * `data-active:border-l` is a border.
 */
const SOLID_PART =
  /^(?:border(?:-[trblxyse])?(?:-\d+|-\(length:[^)]+\))?|outline-solid)$/

/** The site's own focus recipe for an element with no border (site/ui/link.ts). */
const BORDERLESS_RECIPE = "FOCUS_BORDERLESS"

/** The text of every string a node holds, the file's own constants resolved. */
function classText(node: ts.Node, constants: Map<string, ts.Node>): string {
  const seen = new Set<string>()
  const walk = (current: ts.Node): string => {
    if (ts.isStringLiteralLike(current)) return current.text
    if (ts.isIdentifier(current)) {
      if (current.text === BORDERLESS_RECIPE) return "outline-solid"
      const value = constants.get(current.text)
      if (!value || seen.has(current.text)) return ""
      seen.add(current.text)
      return walk(value)
    }
    if (ts.isTemplateExpression(current))
      return [
        current.head.text,
        ...current.templateSpans.flatMap((span) => [
          walk(span.expression),
          span.literal.text,
        ]),
      ].join(" ")
    const parts: string[] = []
    current.forEachChild((child) => {
      parts.push(walk(child))
    })
    return parts.join(" ")
  }
  return walk(node)
}

/**
 * The element a class list is written on: the tag of the JSX element whose
 * `className` holds it, or undefined when it is not one (a constant).
 */
function elementOf(node: ts.Node): string | undefined {
  for (let current = node.parent; current; current = current.parent) {
    if (ts.isJsxAttribute(current)) {
      if (current.name.getText() !== "className") return undefined
      const element = current.parent.parent
      return ts.isJsxOpeningElement(element) ||
        ts.isJsxSelfClosingElement(element)
        ? element.tagName.getText()
        : undefined
    }
    if (ts.isVariableDeclaration(current) || ts.isBlock(current))
      return undefined
  }
  return undefined
}

/**
 * focus.md, rule 6: a focus indicator has a solid part at 3:1. FOCUS_RING
 * colors the element's border and draws a halo at 50%, about 1.9:1: on an
 * element with no border, the halo is all there is. Every `cn(…)` that
 * composes FOCUS_RING for a native element, a next/link `Link` or a constant
 * must hold a border width or a solid outline (FOCUS_BORDERLESS). A design
 * system component brings its own border and is not checked here; its spec
 * example is (tests/focus.ts).
 */
function focusWithoutSolidPart(file: string) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf-8"),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  )
  const constants = new Map<string, ts.Node>()
  const calls: ts.CallExpression[] = []
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer
    )
      constants.set(node.name.text, node.initializer)
    if (
      ts.isCallExpression(node) &&
      node.expression.getText() === "cn" &&
      node.arguments.some(
        (argument) =>
          ts.isIdentifier(argument) && argument.text === "FOCUS_RING"
      )
    )
      calls.push(node)
    node.forEachChild(visit)
  }
  visit(source)

  for (const call of calls) {
    const tag = elementOf(call)
    // A component of the design system (`<TableRow>`) draws its own border.
    if (tag !== undefined && tag !== "Link" && /^[A-Z]/.test(tag)) continue
    const classes = classText(call, constants)
      .split(/\s+/)
      .map((name) => name.slice(name.lastIndexOf(":") + 1))
    if (classes.some((name) => SOLID_PART.test(name))) continue
    const { line, character } = source.getLineAndCharacterOfPosition(
      call.getStart()
    )
    report(
      file,
      line + 1,
      character + 1,
      `focus-solid-part  FOCUS_RING on ${tag ? `<${tag}>` : "a class constant"} with no border: its halo alone is under 3:1 (focus.md, rule 6). Compose FOCUS_BORDERLESS (site/ui/link.ts), or give it a border.`
    )
  }
}

for (const result of results)
  if (!result.filePath.includes("/site/generated/"))
    focusWithoutSolidPart(result.filePath)

for (const problem of problems) console.error(problem)

if (problems.length > 0) {
  console.error(`\n❌ lint-site: ${problems.length} problem(s) in site/.`)
  process.exit(1)
}
console.log(
  `✅ lint-site: ${results.length} files of site/ pass the consumer config and the focus check.`
)
