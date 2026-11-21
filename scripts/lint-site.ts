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
 * rule 6), see `focusWithoutSolidPart`, and the boxes it draws itself, which
 * name a radius role to follow the brand (radius.md, rule 2), see
 * `boxWithoutRadius`.
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

/** A site file, parsed as TSX or TS by its extension. */
function parse(file: string): ts.SourceFile {
  return ts.createSourceFile(
    file,
    readFileSync(file, "utf-8"),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  )
}

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
  const source = parse(file)
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

/**
 * A class with its variants dropped, `md:hover:bg-muted` → `bg-muted`. A
 * colon inside brackets or parentheses belongs to the value:
 * `border-(length:--border-width-md)`.
 */
function utility(name: string): string {
  let depth = 0
  let start = 0
  for (let index = 0; index < name.length; index++) {
    const char = name[index]
    if (char === "[" || char === "(") depth++
    else if (char === "]" || char === ")") depth--
    else if (char === ":" && depth === 0) start = index + 1
  }
  return name.slice(start)
}

/** The border on its four sides, at the default width or a token's. */
const FULL_BORDER = /^border(?:-\(length:[^)]+\)|-[1-9]\d*)?$/

/** A border color: not a width, a side, a style, nor a table's border. */
const BORDER_COLOR =
  /^border-(?!(?:[trblxyse]|\d+|solid|dashed|dotted|double|hidden|none|collapse|separate|spacing)(?:-|$)|\()/

/**
 * A fill that draws a surface: the surfaces and the filled roles of the
 * design system. Not `bg-border`, the lines of a gap-px grid, nor the chart
 * colors, the marks of data, nor the static white and black.
 */
const SURFACE_FILL =
  /^bg-(?:background|card|popover|muted|accent|secondary|primary|destructive|info|success|warning|input-fill|overlay-(?:hover|selected)|sidebar(?:-accent|-primary)?)(?:-(?:hover|selected|tint-hover))?(?:\/\d+)?$/

/** Padding on one side or more, `p-0` aside. */
const PADDING = /^p[xytrblse]?-(?!0$)/

/**
 * A radius that answers the brand: a role, in any of its directional forms, or
 * `rounded-none` and `rounded-full`, the same in every brand. A step of the
 * scale (`rounded-md`) is for content and stays fixed in nova: on a box it
 * does not pass (radius.md, rules 2 and 5).
 */
const RADIUS =
  /^rounded(?:-(?:[trblse]|tl|tr|br|bl|ss|se|es|ee))?-(?:surface|control|item|inset|mark|pill|none|full)$/

/** The rows and cells of a native table: each meets its neighbors, a seam. */
const TABLE_PARTS = new Set(["thead", "tbody", "tfoot", "tr", "th", "td"])

/** A string constant that reads as a class list: no capital, no code. */
const CLASS_LIST = /^[^A-Z{};,"'`]*$/

/**
 * A text with the inside of its brackets and parentheses removed: an arbitrary
 * variant or value (`[&_svg:not([class*='size-'])]`) may hold a quote or a
 * capital that a class list otherwise never does.
 */
function withoutArbitrary(text: string): string {
  let depth = 0
  let kept = ""
  for (const char of text) {
    if (char === "[" || char === "(") depth++
    else if (char === "]" || char === ")") depth = Math.max(0, depth - 1)
    else if (depth === 0) kept += char
  }
  return kept
}

/** An expression without what only types it: `as const`, `satisfies`, parentheses. */
function unwrap(node: ts.Expression): ts.Expression {
  let current = node
  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current)
  )
    current = current.expression
  return current
}

/**
 * Whether a constant holds a class list: a `cn(…)` call, or a string with no
 * capital and no code. An exported one is checked where it is declared.
 */
function isClassList(
  initializer: ts.Expression,
  constants: Map<string, ts.Node>
): boolean {
  const value = unwrap(initializer)
  if (ts.isCallExpression(value)) return value.expression.getText() === "cn"
  return (
    (ts.isStringLiteralLike(value) || ts.isTemplateExpression(value)) &&
    CLASS_LIST.test(withoutArbitrary(classText(value, constants)))
  )
}

/**
 * What a class list draws and does not round: "a border", "a fill with
 * padding", or undefined when it draws no box or writes a radius.
 */
function boxDrawn(text: string): string | undefined {
  const names = text.split(/\s+/).filter(Boolean)
  const classes = names.map(utility)
  if (classes.some((name) => RADIUS.test(name))) return undefined
  // A border whose only color is transparent draws no edge. A color under a
  // focus variant does not count: FOCUS_RING colors the border on focus, the
  // focus indicator focusWithoutSolidPart checks.
  const colors = names
    .filter((name) => !name.slice(0, -utility(name).length).includes("focus"))
    .map(utility)
    .filter((name) => BORDER_COLOR.test(name))
  if (
    classes.some((name) => FULL_BORDER.test(name)) &&
    !(
      colors.length > 0 && colors.every((name) => name === "border-transparent")
    )
  )
    return "a border"
  if (
    classes.some((name) => SURFACE_FILL.test(name)) &&
    classes.some((name) => PADDING.test(name))
  )
    return "a fill with padding"
  return undefined
}

/** The classes of a JSX element's `className`, as classText reads them. */
function classesOf(
  element: ts.JsxOpeningLikeElement,
  constants: Map<string, ts.Node>
): string[] {
  const attribute = element.attributes.properties.find(
    (property) =>
      ts.isJsxAttribute(property) && property.name.getText() === "className"
  )
  return attribute && ts.isJsxAttribute(attribute) && attribute.initializer
    ? classText(attribute.initializer, constants).split(/\s+/).map(utility)
    : []
}

/** The name of a component a function declares: capitalized, as JSX wants. */
function componentOf(node: ts.Node): string | undefined {
  const name = ts.isFunctionDeclaration(node)
    ? node.name?.text
    : (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) &&
        ts.isVariableDeclaration(node.parent) &&
        ts.isIdentifier(node.parent.name)
      ? node.parent.name.text
      : undefined
  return name !== undefined && /^[A-Z]/.test(name) ? name : undefined
}

/**
 * Whether an element is a part of a frame: the element it sits in, past a
 * list's `.map`, writes `overflow-hidden` and a radius and no padding. At the
 * root of a component the file declares, it is a part when every place the
 * file renders that component is in a frame.
 */
function inFrame(
  element: ts.JsxOpeningLikeElement,
  constants: Map<string, ts.Node>,
  uses: Map<string, ts.JsxOpeningLikeElement[]>,
  path = new Set<string>()
): boolean {
  const start = ts.isJsxOpeningElement(element) ? element.parent : element
  for (let current = start.parent; current; current = current.parent) {
    if (ts.isJsxElement(current)) {
      const classes = classesOf(current.openingElement, constants)
      return (
        classes.includes("overflow-hidden") &&
        classes.some((name) => RADIUS.test(name)) &&
        !classes.some((name) => PADDING.test(name))
      )
    }
    const component = componentOf(current)
    if (component === undefined) continue
    const rendered = uses.get(component) ?? []
    return (
      !path.has(component) &&
      rendered.length > 0 &&
      rendered.every((use) =>
        inFrame(use, constants, uses, new Set(path).add(component))
      )
    )
  }
  return false
}

/**
 * radius.md, decision rule and rule 2: a box the site draws itself, next to
 * components, names a radius role, so that it follows the brand with them:
 * square in lyra, rounded in nova. A class list draws a box when it writes
 * the bare `border`, unless its only border color is `border-transparent`
 * (`border-0` and a side such as `border-b` draw none), or a surface fill
 * (`bg-background`, `bg-muted`, `bg-card`, `bg-popover`, `bg-accent`…) with
 * padding. A radius role passes, and so do `rounded-none`, which declares a
 * seam on purpose, and `rounded-full`, a round shape. A step of the scale
 * (`rounded-md`) does not: it stays fixed in nova.
 *
 * Checked: the `className` of a native element, a next/link `Link` or a
 * component of the site (declared in the file or imported from site/), and
 * each exported class constant (a `cn(…)`, or a string with no capital) where
 * it is declared, since its uses are in other files. A component of the
 * design system draws its own corners (rule 3) and a package's (an icon)
 * draws no box: neither is checked.
 *
 * Not a box of its own, by rule:
 *   - a part of a frame (`inFrame`): the frame rounds the outer corners, and
 *     the part's own edges meet its siblings. The cells of a gap-px grid and a
 *     full-bleed band in a panel;
 *   - a row or a cell of a native table (`tr`, `td`, `th`…), which meets its
 *     neighbors;
 *   - an element whose `style` sets its radius: a specimen of the scale, an
 *     outline that takes the corners of the part it marks.
 *
 * It reads what classText resolves: literal strings and the file's own
 * constants, every branch of a condition at once (`active && "bg-muted"`
 * counts), variants dropped (`hover:bg-muted` fills the box on hover). It
 * cannot see a class list built at run time or passed through a prop (a
 * `className` is checked where it is written, not on the element of another
 * file it lands on), a constant imported from another file, a fill with no
 * padding (a swatch, a mark of a chart), nor the frame around a component
 * another file renders: a cell drawn that way writes `rounded-none`
 * (site/audit-docs/stat-card.tsx).
 */
function boxWithoutRadius(file: string) {
  const source = parse(file)
  const constants = new Map<string, ts.Node>()
  const exported = new Map<string, ts.VariableDeclaration>()
  const imports = new Map<string, string>()
  const uses = new Map<string, ts.JsxOpeningLikeElement[]>()
  const classNames: ts.JsxAttribute[] = []
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer
    ) {
      constants.set(node.name.text, node.initializer)
      if (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export)
        exported.set(node.name.text, node)
    }
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const clause = node.importClause
      const bindings = clause?.namedBindings
      for (const name of [
        clause?.name,
        ...(bindings && ts.isNamedImports(bindings)
          ? bindings.elements.map((element) => element.name)
          : []),
      ])
        if (name) imports.set(name.text, node.moduleSpecifier.text)
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText()
      uses.set(tag, [...(uses.get(tag) ?? []), node])
    }
    if (
      ts.isJsxAttribute(node) &&
      node.name.getText() === "className" &&
      node.initializer
    )
      classNames.push(node)
    node.forEachChild(visit)
  }
  visit(source)

  const at = (node: ts.Node) => {
    const { line, character } = source.getLineAndCharacterOfPosition(
      node.getStart()
    )
    return [line + 1, character + 1] as const
  }
  const advice =
    "it stays square in nova next to rounded components (radius.md, rule 2). Name the role of what it sits beside (rounded-surface for a panel, rounded-inset for a code chip), or rounded-none for a seam."

  for (const attribute of classNames) {
    const element = attribute.parent.parent
    const tag = element.tagName.getText()
    const from = imports.get(tag.split(".")[0])
    if (
      /^[A-Z]/.test(tag) &&
      from !== undefined &&
      from !== "next/link" &&
      !from.startsWith("@/site/") &&
      !from.startsWith(".")
    )
      continue
    if (TABLE_PARTS.has(tag)) continue
    // An exported class list is checked where it is declared; any other
    // exported constant is checked here, where it is used.
    const value = attribute.initializer
    const declared =
      value &&
      ts.isJsxExpression(value) &&
      value.expression &&
      ts.isIdentifier(value.expression)
        ? exported.get(value.expression.text)?.initializer
        : undefined
    if (declared && isClassList(declared, constants)) continue
    const drawn = value && boxDrawn(classText(value, constants))
    if (!drawn) continue
    const style = element.attributes.properties.find(
      (property) =>
        ts.isJsxAttribute(property) && property.name.getText() === "style"
    )
    if (style && /\bborder\w*Radius\b/.test(style.getText())) continue
    if (inFrame(element, constants, uses)) continue
    report(
      file,
      ...at(attribute),
      `radius-role  <${tag}> draws a box (${drawn}) with no radius role: ${advice}`
    )
  }

  for (const [name, declaration] of exported) {
    const value = declaration.initializer
    if (!value || !isClassList(value, constants)) continue
    const drawn = boxDrawn(classText(unwrap(value), constants))
    if (!drawn) continue
    report(
      file,
      ...at(declaration),
      `radius-role  the class constant ${name} draws a box (${drawn}) with no radius role: ${advice}`
    )
  }
}

for (const result of results)
  if (!result.filePath.includes("/site/generated/")) {
    focusWithoutSolidPart(result.filePath)
    boxWithoutRadius(result.filePath)
  }

for (const problem of problems) console.error(problem)

if (problems.length > 0) {
  console.error(`\n❌ lint-site: ${problems.length} problem(s) in site/.`)
  process.exit(1)
}
console.log(
  `✅ lint-site: ${results.length} files of site/ pass the consumer config, the focus check and the radius check.`
)
