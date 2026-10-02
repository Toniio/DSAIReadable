/**
 * The re-tokenization codemod: rewrites the classes of a shadcn/ui component
 * file into the design system's, by the mapping table of
 * `shadcn-upstream.json`. Read by `scripts/retokenize-codemod.ts`.
 *
 * It only touches class strings: the string arguments of `cn()` and `cva()`
 * and the `className` attributes and properties (plus the values of a `style`
 * attribute, by `values`). Each class is mapped in this order:
 *
 * 1. `files[item].classes`, then `classes`: the whole class, variants included
 *    (`focus-visible:ring-1`);
 * 2. `files[item].utilities`, then `utilities`: the utility once its variants
 *    are set aside, which the replacement keeps (`opacity-50` turns
 *    `disabled:opacity-50` into `disabled:opacity-disabled`);
 * 3. `patterns`: regular expressions applied in turn to the utility
 *    (`--spacing(7)` → `var(--space-scale-7)` inside an arbitrary value).
 *
 * An empty replacement removes the class. Then each shared class constant of
 * `constants` (`FOCUS_RING`, `OVERLAY_BASE`…) whose classes all sit in one
 * string replaces them, imported from its module; a one-class constant is
 * only read, when two files are compared.
 *
 * The codemod is a fixpoint: the design system's own files go through it
 * unchanged, and running it twice gives the result of running it once.
 */

import {
  Node,
  Project,
  ScriptKind,
  SyntaxKind,
  type CallExpression,
  type SourceFile,
} from "ts-morph"

/**
 * What a class becomes: the replacement alone when it spells the same value
 * another way, or with the `reason` it changes a value or a behavior
 * (scripts/lib/class-equivalence.ts proves which one it is).
 */
export type Replacement = string | { to: string; reason: string }

/** The replacement itself, with or without its reason. */
export const replacementOf = (replacement: Replacement) =>
  typeof replacement === "string" ? replacement : replacement.to

interface RetokenizeRules {
  classes?: Record<string, Replacement>
  utilities?: Record<string, Replacement>
}

export interface RetokenizeMap extends Required<RetokenizeRules> {
  patterns: [string, string][]
  values: Record<string, Replacement>
  files: Record<string, RetokenizeRules>
  constants: { name: string; module: string }[]
}

/** A class constant, resolved: its name, its module and its classes. */
export interface ClassConstant {
  name: string
  module: string
  value: string
}

const CLASS_CALLS = new Set(["cn", "cva"])
const CLASS_PROPERTIES = new Set(["className", "classNames"])

/** `group-hover:md:p-2` → ["group-hover:md:", "p-2"], brackets respected. */
function splitVariants(token: string): [string, string] {
  let depth = 0
  let last = -1
  for (let i = 0; i < token.length; i++) {
    const c = token[i]
    if (c === "[" || c === "(") depth++
    else if (c === "]" || c === ")") depth--
    else if (c === ":" && depth === 0) last = i
  }
  return last < 0
    ? ["", token]
    : [token.slice(0, last + 1), token.slice(last + 1)]
}

/** One class through the table: its replacement, `""` to remove it. */
export function mapClass(token: string, item: string, map: RetokenizeMap) {
  const local = map.files[item] ?? {}
  const exact = local.classes?.[token] ?? map.classes[token]
  if (exact !== undefined) return replacementOf(exact)
  const [variants, utility] = splitVariants(token)
  const utilityRule = local.utilities?.[utility] ?? map.utilities[utility]
  let mapped =
    utilityRule === undefined ? undefined : replacementOf(utilityRule)
  if (mapped === undefined) {
    let current = utility
    for (const [pattern, replacement] of map.patterns)
      current = current.replace(new RegExp(pattern, "g"), replacement)
    if (current !== utility) mapped = current
  }
  if (mapped === undefined) return token
  return mapped
    .split(/\s+/)
    .filter(Boolean)
    .map((u) => variants + u)
    .join(" ")
}

/** Splits the inside of a template literal into words; `${…}` stays whole. */
function words(text: string): string[] {
  const out: string[] = []
  let current = ""
  let depth = 0
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === "$" && text[i + 1] === "{") {
      depth++
      current += "${"
      i++
      continue
    }
    if (depth > 0) {
      if (c === "{") depth++
      if (c === "}") depth--
      current += c
      continue
    }
    if (/\s/.test(c)) {
      if (current) out.push(current)
      current = ""
    } else current += c
  }
  if (current) out.push(current)
  return out
}

const isExpression = (word: string) => word.includes("${")

/** The nodes whose strings are classes, each once, outermost first. */
function classRoots(sourceFile: SourceFile): Node[] {
  const roots: Node[] = []
  sourceFile.forEachDescendant((node) => {
    if (Node.isCallExpression(node)) {
      if (CLASS_CALLS.has(node.getExpression().getText()))
        roots.push(...(node as CallExpression).getArguments())
    } else if (Node.isJsxAttribute(node)) {
      if (CLASS_PROPERTIES.has(node.getNameNode().getText())) {
        const init = node.getInitializer()
        if (init) roots.push(init)
      }
    } else if (Node.isPropertyAssignment(node)) {
      if (CLASS_PROPERTIES.has(node.getName())) {
        const init = node.getInitializer()
        if (init) roots.push(init)
      }
    }
  })
  return roots
}

type ClassString =
  | import("ts-morph").StringLiteral
  | import("ts-morph").NoSubstitutionTemplateLiteral
  | import("ts-morph").TemplateExpression

const isClassString = (node: Node): node is ClassString =>
  Node.isStringLiteral(node) ||
  Node.isNoSubstitutionTemplateLiteral(node) ||
  Node.isTemplateExpression(node)

/** A string that is a property name (`"icon-xs": …`) holds no class. */
function isPropertyName(node: Node) {
  const parent = node.getParent()
  return (
    !!parent &&
    (Node.isPropertyAssignment(parent) || Node.isJsxAttribute(parent)) &&
    parent.getNameNode() === node
  )
}

/** The class strings of a file: outermost first, each once. */
function classStrings(sourceFile: SourceFile): ClassString[] {
  const seen = new Set<Node>()
  const out: ClassString[] = []
  for (const root of classRoots(sourceFile)) {
    const visit = (node: Node) => {
      if (seen.has(node)) return
      seen.add(node)
      if (isClassString(node) && !isPropertyName(node)) {
        out.push(node)
        // Strings inside `${…}` are visited as their own strings.
        if (Node.isTemplateExpression(node))
          for (const span of node.getTemplateSpans())
            span.getExpression().forEachDescendant(visit)
        return
      }
      node.forEachChild(visit)
    }
    visit(root)
  }
  return out
}

/** The literal text of a class string, `${…}` kept as written. */
function innerText(node: ClassString) {
  return Node.isStringLiteral(node)
    ? node.getLiteralValue()
    : node.getText().slice(1, -1)
}

/** The strings of the file's `style` attributes: CSS values, not classes. */
function styleValues(sourceFile: SourceFile) {
  return sourceFile
    .getDescendantsOfKind(SyntaxKind.JsxAttribute)
    .filter((a) => a.getNameNode().getText() === "style")
    .flatMap((a) => a.getDescendantsOfKind(SyntaxKind.StringLiteral))
    .filter((s) => !isPropertyName(s))
}

/**
 * Rewrites one component file. `item` is its registry name (`button`), which
 * selects the `files` rules; `constants` are the resolved class constants.
 */
export function retokenize(
  source: string,
  item: string,
  map: RetokenizeMap,
  constants: ClassConstant[]
): string {
  const project = new Project({ useInMemoryFileSystem: true })
  const sourceFile = project.createSourceFile("component.tsx", source, {
    scriptKind: ScriptKind.TSX,
  })
  const imports = new Map<string, Set<string>>()

  for (const node of styleValues(sourceFile)) {
    const value = map.values[node.getLiteralValue()]
    if (value !== undefined) node.setLiteralValue(replacementOf(value))
  }

  // Innermost first: replacing an outer string would forget the inner ones.
  for (const node of classStrings(sourceFile).reverse()) {
    if (node.wasForgotten()) continue
    const before = words(innerText(node))
    let after = before.flatMap((word) =>
      isExpression(word) ? [word] : mapClass(word, item, map).split(" ")
    )
    after = after.filter(Boolean)

    const grouped: string[] = []
    for (const constant of constants) {
      const needed = constant.value.split(/\s+/)
      // A one-class constant (`FOCUS_OUTLINE_RESET`) is read, not grouped:
      // the class alone says as much.
      if (needed.length < 2) continue
      const pool = [...after]
      const at: number[] = []
      for (const token of needed) {
        const i = pool.findIndex((w, j) => w === token && !at.includes(j))
        if (i < 0) break
        at.push(i)
      }
      if (at.length !== needed.length) continue
      const first = Math.min(...at)
      after = after.flatMap((w, i) =>
        i === first ? [`\${${constant.name}}`] : at.includes(i) ? [] : [w]
      )
      grouped.push(constant.name)
      const names = imports.get(constant.module) ?? new Set<string>()
      names.add(constant.name)
      imports.set(constant.module, names)
    }

    if (after.join(" ") === before.join(" ")) continue
    replaceClassString(node, after)
  }

  for (const [module, names] of imports) {
    const existing = sourceFile.getImportDeclaration(
      (d) => d.getModuleSpecifierValue() === module
    )
    const have = new Set(
      existing?.getNamedImports().map((n) => n.getName()) ?? []
    )
    const missing = [...names].filter((n) => !have.has(n)).sort()
    if (missing.length === 0) continue
    if (existing) existing.addNamedImports(missing)
    else {
      const last = sourceFile.getImportDeclarations().at(-1)
      sourceFile.insertImportDeclaration(last ? last.getChildIndex() + 1 : 0, {
        moduleSpecifier: module,
        namedImports: missing,
      })
    }
  }

  return sourceFile.getFullText()
}

/** Writes the words back: a string, a template, or `cn()` arguments. */
function replaceClassString(node: ClassString, after: string[]) {
  const hasExpression = after.some(isExpression)
  const parent = node.getParent()

  // A direct argument of `cn()`: the constants become arguments of their own,
  // `cn(OVERLAY_BASE, "isolate", className)`.
  if (
    parent &&
    Node.isCallExpression(parent) &&
    parent.getExpression().getText() === "cn" &&
    after.every((w) => !isExpression(w) || /^\$\{\w+\}$/.test(w))
  ) {
    const names = after.filter(isExpression).map((w) => w.slice(2, -1))
    const rest = after.filter((w) => !isExpression(w)).join(" ")
    const args = [...names, ...(rest ? [JSON.stringify(rest)] : [])]
    node.replaceWithText(args.join(", "))
    return
  }

  const text = after.join(" ")
  const literal = hasExpression ? `\`${text}\`` : JSON.stringify(text)
  if (parent && Node.isJsxAttribute(parent) && hasExpression)
    node.replaceWithText(`{${literal}}`)
  else node.replaceWithText(literal)
}

/**
 * The classes of a file as a sorted list, constants resolved: what two files
 * are compared by. An expression other than a constant counts as one word.
 */
export function classesOf(source: string, constants: ClassConstant[]) {
  const project = new Project({ useInMemoryFileSystem: true })
  const sourceFile = project.createSourceFile("component.tsx", source, {
    scriptKind: ScriptKind.TSX,
  })
  const byName = new Map(constants.map((c) => [c.name, c.value]))
  const out: string[] = []
  const expand = (word: string) => {
    const name = word.match(/^\$\{(\w+)\}$/)?.[1]
    const value = name ? byName.get(name) : undefined
    return value ? value.split(/\s+/) : [word]
  }
  for (const node of classStrings(sourceFile))
    for (const word of words(innerText(node)))
      // Strings inside `${…}` are listed on their own.
      if (!isExpression(word) || /^\$\{\w+\}$/.test(word))
        out.push(...expand(word))
  // A constant passed whole: `cn(OVERLAY_BASE, …)`, `className={FOCUS_RING}`.
  const ids = new Set<Node>()
  for (const root of classRoots(sourceFile))
    for (const id of [root, ...root.getDescendants()])
      if (
        Node.isIdentifier(id) &&
        byName.has(id.getText()) &&
        !id.getFirstAncestor((a) => Node.isTemplateExpression(a))
      )
        ids.add(id)
  for (const id of ids) out.push(...expand(`\${${id.getText()}}`))
  return out.sort()
}
